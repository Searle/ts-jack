import { CompileResult, SrcMap } from "./common";

const regExpCache: Map<string, RegExp> = new Map();

const cachedRegExp = (pattern: string) => {
    let regExp = regExpCache.get(pattern);
    if (regExp === undefined) {
        regExp = new RegExp(pattern);
        regExpCache.set(pattern, regExp);
    }
    return regExp;
};

class ParseError extends Error {
    public p: number;

    constructor(p: number, message: string) {
        super(message);
        this.p = p;
        this.name = "ParseError";
    }
}

type Bite = Readonly<{
    id: number;
    value: string;
    start: number;
    end: number;
}>;

const emptyBite: Bite = {
    id: -1,
    value: "",
    start: -1,
    end: -1,
};

const MakeSrcEater = (jackSrc: string) => {
    let pos = 0;
    let nextBiteId = 0;

    const error = (message: string): never => {
        throw new ParseError(
            pos,
            message + "\nAt: [" + jackSrc.substring(pos, pos + 50) + "...]"
        );
    };

    const _eat = (pattern: string) => {
        const regExp = cachedRegExp("^(" + pattern + ")");
        const match = jackSrc.substring(pos).match(regExp);
        if (match) {
            pos += match[1].length;
            return match[1];
        }
        return undefined;
    };

    const skipWs = () => {
        _eat("[ \\n\\r\\t]+");
    };

    const skipComment = () => {
        while (pos < jackSrc.length) {
            skipWs();
            if (_eat("//")) {
                while (pos < jackSrc.length) {
                    if (_eat("\n")) break;
                    ++pos;
                }
                continue;
            }
            if (_eat("/\\*")) {
                while (pos < jackSrc.length) {
                    if (_eat("\\*/")) break;
                    ++pos;
                }
                continue;
            }
            break;
        }
    };

    const eat: (pattern: string) => Bite = (pattern) => {
        skipComment();
        const start = pos;
        const value = _eat(pattern);
        if (value === undefined) {
            error(`${pattern} expected`);
            return emptyBite;
        }
        // console.log("EAT", value);
        return {
            id: nextBiteId++,
            value,
            start,
            end: pos,
        };
    };

    type EatOneFunc<T> = () => T;

    const eatOne = <T extends CodeSnippetGen | void>(
        fns: Array<EatOneFunc<T>>
    ): T | never => {
        let err: ParseError | undefined = undefined;
        let maxBiteId = nextBiteId;
        const oldPos = pos;
        const oldNextBiteId = nextBiteId;
        for (const fn of fns) {
            try {
                pos = oldPos;
                nextBiteId = oldNextBiteId;
                return fn();
            } catch (e) {
                if (e instanceof ParseError) {
                    if (err === undefined) {
                        err = e;
                    }
                    if (nextBiteId > maxBiteId) {
                        err = e;
                        maxBiteId = nextBiteId;
                    }
                    nextBiteId = oldNextBiteId;
                } else {
                    throw e;
                }
            }
        }
        nextBiteId = maxBiteId;
        if (err) throw err;
        error("eatOne");
        throw "dummy"; // make typing happy
    };

    const loop = <T extends CodeSnippetGen | void>(
        fn: () => T | T[]
    ): Array<T | T[]> => {
        let i = 1000;
        const all: Array<T | T[]> = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (--i < 0) {
                error("internal loop watchdog");
            }
            const oldPos = pos;
            const oldEats = nextBiteId;
            try {
                const one = fn();
                all.push(one);
            } catch (e) {
                if (e instanceof ParseError && nextBiteId === oldEats) {
                    pos = oldPos;
                    break;
                }
                throw e;
            }
        }
        return all;
    };

    const checkEof = () => {
        const oldPos = pos;
        const excessive = eat(".*");
        if (excessive.value) {
            pos = oldPos;
            error("Excessive bytes");
        }
    };

    const getLineSrc = () => {
        skipComment();
        return jackSrc.substring(pos).replace(/\n.*/s, "");
    };

    return {
        eat,
        eatOne,
        loop,
        checkEof,
        getLineSrc,
    };
};

type SrcEater = ReturnType<typeof MakeSrcEater>;

type Op = "+" | "-" | "*" | "/" | "&" | "|" | "<" | ">" | "=";

const opToCode: Record<Op, string> = {
    "+": "add",
    "-": "sub",
    "*": "call Math.multiply 2",
    "/": "call Math.divide 2",
    "&": "and",
    "|": "or",
    "<": "lt",
    ">": "gt",
    "=": "eq",
} as const;

type Var = {
    type: string;
    identifier: string;
};

type CompiledLine = {
    bite: Bite;
    code: string;
};

type BiteRefs = Array<{
    bite1: Bite;
    bite2: Bite;
}>;

const MakeCodeGen = (
    collectLine: (compiledLine: CompiledLine) => void,
    compareVmSrc?: string
) => {
    let className: string;

    const fields: Var[] = [];
    const statics: Var[] = [];

    let isStaticFunc = false;
    let funcArgs: Var[] = [];
    let locals: Var[] = [];

    const biteRefs: BiteRefs = [];

    const getClassName = () => className;

    const addFieldOrStatic = (
        fieldOrStatic: string,
        type: string,
        identifier: string
    ) => {
        (fieldOrStatic === "field" ? fields : statics).push({
            type,
            identifier,
        });
    };

    let lineNo = 0;
    const vmSrcLines = compareVmSrc?.split(/\r?\n/);
    let diffCount = 10;

    const genCode = (bite: Bite, code: string) => {
        if (vmSrcLines === undefined || code.startsWith("//")) {
            collectLine({ bite, code });
            return;
        }
        let prefix = "   ";
        if (code !== vmSrcLines[lineNo]) {
            prefix = "## ";
            if (--diffCount === 0) {
                throw "Too many diffs";
            }
        }
        collectLine({
            bite,
            code:
                prefix +
                ("[" + code + "]").padEnd(30) +
                "[" +
                vmSrcLines[lineNo++] +
                "]",
        });
    };

    const setClassName = (className_: string) => {
        className = className_;
    };

    const setFuncValues = (
        funcType: string,
        funcArgs_: Var[],
        locals_: Var[]
    ) => {
        funcArgs = funcArgs_;
        locals = locals_;
        isStaticFunc = funcType === "function";
    };

    type FindVar = {
        var1: Var | undefined;
        code: string;
    };

    const findVar = (identifier: string): FindVar | undefined => {
        const findIdentifier = (v: Var) => v.identifier === identifier;

        const localI = locals.findIndex(findIdentifier);
        if (localI >= 0)
            return { var1: locals[localI], code: `local ${localI}` };

        const funcArgI = funcArgs.findIndex(findIdentifier);
        if (funcArgI >= 0)
            return { var1: funcArgs[funcArgI], code: `argument ${funcArgI}` };

        if (!isStaticFunc) {
            const fieldI = fields.findIndex(findIdentifier);
            if (fieldI >= 0)
                return { var1: fields[fieldI], code: `this ${fieldI}` };
        }

        const staticI = statics.findIndex(findIdentifier);
        if (staticI >= 0)
            return { var1: statics[staticI], code: `static ${staticI}` };

        // FIXME: only constructor?
        if (identifier === "this") {
            return { var1: undefined, code: "pointer 0" };
        }

        return undefined;
    };

    const findVarCode = (identifier: string) => {
        const var1 = findVar(identifier);
        if (var1 === undefined) {
            console.log("# fields", JSON.stringify(fields));
            console.log("# statics", JSON.stringify(statics));
            console.log("# funcArgs", JSON.stringify(funcArgs));
            console.log("# locals", JSON.stringify(locals));

            throw `Variable "${identifier}" not found`;
        }
        return var1.code;
    };

    const getFields = () => fields;

    const addBiteRef = (bite1: Bite, bite2: Bite | undefined) => {
        if (bite2 !== undefined) {
            biteRefs.push({ bite1, bite2 });
        }
    };

    const getBiteRefs = () => biteRefs;

    return {
        genCode,
        getClassName,
        addFieldOrStatic,
        setClassName,
        setFuncValues,
        findVar,
        findVarCode,
        getFields,
        addBiteRef,
        getBiteRefs,
    };
};

type CodeGen = ReturnType<typeof MakeCodeGen>;

const identifierPattern =
    "(?!false\\b|true\\b|null\\b|this\\b)[a-zA-Z_][a-zA-Z0-9_]*";

type CodeSnippetGen = () => void;

const MakeParser = (srcEater: SrcEater, cg: CodeGen) => {
    const { eat, eatOne, loop, checkEof } = srcEater;
    const { genCode, addBiteRef, findVarCode, getClassName, findVar } = cg;

    const eatIdentifier = () => eat(identifierPattern);

    const eatVarName = (): CodeSnippetGen =>
        eatOne([
            () => {
                const identifier = eatIdentifier();
                const openBracket = eat("\\[");
                const genIndexSnippet = eatExpression();
                const closeBracket = eat("\\]");

                return () => {
                    genIndexSnippet();
                    genCode(
                        identifier,
                        `push ${findVarCode(identifier.value)}`
                    );
                    genCode(identifier, `add`);
                    genCode(identifier, `pop pointer 1`);
                    genCode(identifier, `push that 0`);
                    addBiteRef(identifier, openBracket);
                    addBiteRef(identifier, closeBracket);
                };
            },
            () => {
                const identifier = eatIdentifier();
                return () => {
                    genCode(
                        identifier,
                        `push ${findVarCode(identifier.value)}`
                    );
                };
            },
        ]);

    const eatSubroutineCall = (): CodeSnippetGen => {
        let className: Bite | undefined = undefined;
        let dot: Bite | undefined = undefined;
        let identifier: Bite;
        eatOne([
            () => {
                className = eatIdentifier();
                dot = eat("\\.");
                identifier = eatIdentifier();
            },
            () => {
                className = undefined;
                dot = undefined;
                identifier = eatIdentifier();
            },
        ]);
        const openBracket = eat("\\(");
        let closeBracket: Bite;
        const genArgSnippets: CodeSnippetGen[] = [];
        eatOne([
            () => {
                closeBracket = eat("\\)");
            },
            () => {
                genArgSnippets.push(eatExpression());
                loop(() => {
                    eat(",");
                    genArgSnippets.push(eatExpression());
                });
                closeBracket = eat("\\)");
            },
        ]);

        return () => {
            let argsCount = genArgSnippets.length;
            let callClassName: string;

            addBiteRef(identifier, openBracket);
            addBiteRef(identifier, dot);
            addBiteRef(identifier, closeBracket);
            if (className === undefined) {
                callClassName = getClassName();
                genCode(identifier, "push pointer 0");
                ++argsCount;
            } else {
                callClassName = className.value;
                const var1 = findVar(className.value);
                if (var1 !== undefined) {
                    const varType = var1.var1?.type;
                    if (varType === undefined) {
                        throw "genSubroutineCall: call with this not impl";
                    }
                    callClassName = varType;
                    genCode(className, `push ${var1.code}`);
                    ++argsCount;
                } else {
                    addBiteRef(identifier, className);
                }
            }
            for (const genArgSnippet of genArgSnippets) {
                genArgSnippet();
            }
            genCode(
                identifier,
                `call ${callClassName}.${identifier.value} ${argsCount}`
            );
        };
    };

    const eatIntegerConstant = (): CodeSnippetGen => {
        const value = eat("[12]?\\d{1,4}|3[01]\\d{3}|32[0-7]\\d{2}");
        return () => {
            genCode(value, `push constant ${value.value}`);
        };
    };

    const eatKeywordConstant = (): CodeSnippetGen => {
        const keyword = eat("(?:false|true|null|this)\\b");

        return () => {
            if (keyword.value === "this") {
                genCode(keyword, `push ${findVarCode(keyword.value)}`);
                return;
            }
            genCode(keyword, "push constant 0");
            if (keyword.value === "true") {
                genCode(keyword, "not");
            }
        };
    };

    const eatStringConstant = (): CodeSnippetGen => {
        const openQuote = eat('\\"');
        const str = eat('[^\\"\\n]+');
        const closeQuote = eat('\\"');

        return () => {
            addBiteRef(str, openQuote);
            addBiteRef(str, closeQuote);
            genCode(str, `// "${str.value}"`);
            genCode(str, `push constant ${str.value.length}`);
            genCode(str, "call String.new 1");
            for (const ch of str.value) {
                genCode(str, `push constant ${ch.charCodeAt(0)}`);
                genCode(str, "call String.appendChar 2");
            }
            return;
        };
    };

    const eatUnaryOp = (): CodeSnippetGen => {
        const op = eat("[-~]");
        const term = eatTermValue();

        return () => {
            term();
            genCode(op, op.value === "-" ? "neg" : "not");
        };
    };

    const eatExpressionInBrackets = (): CodeSnippetGen => {
        // Can't addCodeRef without ref
        eat("\\(");
        const genExprSnippet = eatExpression();
        eat("\\)");

        return () => {
            genExprSnippet();
        };
    };

    const eatTermValue = () =>
        eatOne([
            eatIntegerConstant,
            eatSubroutineCall,
            eatVarName,
            eatKeywordConstant,
            eatStringConstant,
            eatUnaryOp,
            eatExpressionInBrackets,
        ]);

    const eatOp = () => eat("[-+*/&|<>=]");

    const eatExpression = (): CodeSnippetGen => {
        const opTerms: Array<{
            op: Bite | undefined;
            genTermSnippet: CodeSnippetGen;
        }> = [
            {
                op: undefined,
                genTermSnippet: eatTermValue(),
            },
        ];

        loop(() => {
            opTerms.push({
                op: eatOp(),
                genTermSnippet: eatTermValue(),
            });
        });

        return () => {
            for (const { op, genTermSnippet } of opTerms.values()) {
                genTermSnippet();
                if (op !== undefined) genCode(op, opToCode[op.value as Op]);
            }
        };
    };

    let ifLabelNo = 0;
    let whileLabelNo = 0;
    let returnFound = false;

    const eatBlock = (): CodeSnippetGen => {
        const fns = loop(() => {
            const lineSrc = srcEater.getLineSrc();
            return [
                () => {
                    genCode(emptyBite, "// " + lineSrc);
                },
                eatOne([
                    () => {
                        eat("let");

                        let varName: Bite = emptyBite;
                        let openBracket: Bite | undefined;
                        let genIndexSnippet: CodeSnippetGen | undefined;
                        let closeBracket: Bite | undefined;

                        eatOne([
                            () => {
                                varName = eatIdentifier();
                                openBracket = eat("\\[");
                                genIndexSnippet = eatExpression();
                                closeBracket = eat("\\]");
                            },
                            () => {
                                varName = eatIdentifier();
                                openBracket = undefined;
                                genIndexSnippet = undefined;
                                closeBracket = undefined;
                            },
                        ]);

                        eat("=");
                        const genExprSnippet = eatExpression();
                        eat(";");

                        return () => {
                            addBiteRef(varName, openBracket);
                            addBiteRef(varName, closeBracket);
                            if (genIndexSnippet !== undefined) {
                                genIndexSnippet();
                                genCode(
                                    varName,
                                    `push ${findVarCode(varName.value)}`
                                );
                                genCode(varName, "add");
                                genExprSnippet();
                                genCode(varName, "pop temp 0");
                                genCode(varName, "pop pointer 1");
                                genCode(varName, "push temp 0");
                                genCode(varName, "pop that 0");
                            } else {
                                genExprSnippet();
                                genCode(
                                    varName,
                                    `pop ${findVarCode(varName.value)}`
                                );
                            }
                        };
                    },
                    () => {
                        const ifs: Bite[] = [];
                        const if1 = eat("if");
                        ifs.push(eat("\\("));
                        const genExprSnippet = eatExpression();
                        ifs.push(eat("\\)"));
                        ifs.push(eat("\\{"));
                        const genIfBlockSnippet = eatBlock();
                        let genElseBlockSnippet: CodeSnippetGen | undefined;
                        let else1: Bite | undefined;
                        let if2: Bite | undefined;
                        const elses: Bite[] = [];
                        eatOne([
                            () => {
                                if2 = eat("\\}");
                                else1 = eat("else");
                                elses.push(eat("\\{"));
                                genElseBlockSnippet = eatBlock();
                                elses.push(eat("\\}"));
                            },
                            () => {
                                if2 = eat("\\}");
                                else1 = undefined;
                                genElseBlockSnippet = undefined;
                            },
                        ]);

                        return () => {
                            addBiteRef(if1, if2);
                            ifs.forEach((ref) => addBiteRef(if1, ref));
                            const labelNo = ifLabelNo++;
                            genExprSnippet();
                            genCode(if1, `if-goto IF_TRUE${labelNo}`);
                            genCode(if1, `goto IF_FALSE${labelNo}`);
                            genCode(if1, `label IF_TRUE${labelNo}`);
                            genIfBlockSnippet();
                            if (genElseBlockSnippet) {
                                elses.forEach((ref) => addBiteRef(else1!, ref));
                                genCode(if1, "// } if ");
                                genCode(else1!, `goto IF_END${labelNo}`);
                                genCode(else1!, `label IF_FALSE${labelNo}`);
                                genElseBlockSnippet();
                                genCode(else1!, "// } else ");
                                genCode(else1!, `label IF_END${labelNo}`);
                            } else {
                                genCode(if1, "// } if");
                                genCode(if1, `label IF_FALSE${labelNo}`);
                            }
                        };
                    },
                    () => {
                        const whiles: Bite[] = [];
                        const while1 = eat("while");
                        whiles.push(eat("\\("));
                        const genExprSnippet = eatExpression();
                        whiles.push(eat("\\)"));
                        whiles.push(eat("\\{"));
                        const genBlockSnippet = eatBlock();
                        whiles.push(eat("\\}"));

                        return () => {
                            const labelNo = whileLabelNo++;
                            whiles.forEach((ref) => addBiteRef(while1, ref));
                            genCode(while1, `label WHILE_EXP${labelNo}`);
                            genExprSnippet();
                            genCode(while1, "not");
                            genCode(while1, `if-goto WHILE_END${labelNo}`);
                            genBlockSnippet();
                            genCode(while1, "// } while");
                            genCode(while1, `goto WHILE_EXP${labelNo}`);
                            genCode(while1, `label WHILE_END${labelNo}`);
                        };
                    },
                    () => {
                        const do1 = eat("do");
                        const genSubroutineCallSnippet = eatSubroutineCall();
                        eat(";");

                        return () => {
                            genSubroutineCallSnippet();
                            genCode(do1, "pop temp 0");
                        };
                    },
                    () => {
                        const return1 = eat("return");
                        let genExprSnippet: CodeSnippetGen | undefined;
                        eatOne([
                            () => {
                                genExprSnippet = eatExpression();
                                eat(";");
                            },
                            () => {
                                genExprSnippet = undefined;
                                eat(";");
                            },
                        ]);

                        return () => {
                            returnFound = true;
                            if (genExprSnippet) {
                                genExprSnippet();
                            } else {
                                genCode(return1, "push constant 0");
                            }
                            genCode(return1, "return");
                        };
                    },
                ]),
            ];
        });
        return () => {
            fns.forEach((fns1) =>
                Array.isArray(fns1) ? fns1.forEach((fn) => fn()) : fns1()
            );
        };
    };

    const eatType = () => eat("int|char|boolean|" + identifierPattern);

    type VarDecl = {
        type: Bite;
        identifier: Bite;
    };

    const eatVarDecl = (): VarDecl => ({
        type: eatType(),
        identifier: eatIdentifier(),
    });

    const parseClass = () => {
        const { setClassName, addFieldOrStatic, setFuncValues, getFields } = cg;

        eat("class");
        setClassName(eatIdentifier().value);
        eat("\\{");
        loop(() => {
            const fieldOrStatic = eat("field|static");
            const type = eatType();
            addFieldOrStatic(
                fieldOrStatic.value,
                type.value,
                eatIdentifier().value
            );
            loop(() => {
                eat(",");
                addFieldOrStatic(
                    fieldOrStatic.value,
                    type.value,
                    eatIdentifier().value
                );
            });
            eat(";");
        });
        loop(() => {
            const funcType = eat("constructor|method|function");
            // We ignore the return type
            eatIdentifier();
            const funcName = eatIdentifier();
            eat("\\(");

            const funcArgs: VarDecl[] = [];
            if (funcType.value === "method") {
                funcArgs.push({
                    type: emptyBite,
                    identifier: emptyBite,
                });
            }
            eatOne([
                () => {
                    eat("\\)");
                },
                () => {
                    funcArgs.push(eatVarDecl());
                    loop(() => {
                        eat(",");
                        funcArgs.push(eatVarDecl());
                    });
                    eat("\\)");
                },
            ]);
            eat("\\{");

            const locals: VarDecl[] = [];
            loop(() => {
                eat("var");
                locals.push(eatVarDecl());
                loop(() => {
                    eat(",");
                    locals.push({
                        type: locals[0].type,
                        identifier: eatIdentifier(),
                    });
                });
                eat(";");
            });

            const varDeclToVar = (var1: VarDecl): Var => ({
                type: var1.type.value,
                identifier: var1.identifier.value,
            });

            setFuncValues(
                funcType.value,
                funcArgs.map(varDeclToVar),
                locals.map(varDeclToVar)
            );
            genCode(
                funcType,
                `function ${getClassName()}.${funcName.value} ${locals.length}`
            );
            addBiteRef(funcType, funcName);

            if (funcType.value === "method") {
                genCode(funcType, "push argument 0");
                genCode(funcType, "pop pointer 0");
            }

            if (funcType.value === "constructor") {
                genCode(funcType, `push constant ${getFields().length}`);
                genCode(funcType, "call Memory.alloc 1");
                genCode(funcType, "pop pointer 0");
            }

            ifLabelNo = 0;
            whileLabelNo = 0;
            returnFound = false;
            eatBlock()();

            if (!returnFound) {
                genCode(funcType, "push constant 0");
                genCode(funcType, "return");
            }

            eat("\\}");
            genCode(funcType, "// } func");
        });
        eat("\\}");

        checkEof();
    };

    return {
        parseClass,
    };
};

export const compile = (srcStr: string): CompileResult => {
    const src = MakeSrcEater(srcStr);
    let code = "";

    const srcMap: SrcMap = [];

    const codeGen = MakeCodeGen((codeLine) => {
        srcMap.push({
            src: codeLine.bite.id >= 0 ? [codeLine.bite] : [],
            tgt: {
                start: code.length,
                end: code.length + codeLine.code.length + 1,
            },
        });
        code += codeLine.code + "\n";
    });
    const parser = MakeParser(src, codeGen);

    try {
        parser.parseClass();
    } catch (e) {
        code += String(e) + "\n";
    }

    const biteRefs = codeGen.getBiteRefs();
    srcMap.forEach(({ src }) => {
        biteRefs.forEach(({ bite1, bite2 }) => {
            if (bite1 === src[0]) src.push(bite2);
        });
    });

    return { code, srcMap };
};
