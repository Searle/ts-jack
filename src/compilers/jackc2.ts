// import jackSrc from "./examples/example_fox";
// import jackSrc from "./examples/Fox/Main.jack";
// import vmSrc from "./examples/Fox/Main.vm";

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

type Bite = {
    id: number;
    value: string;
    start: number;
    end: number;
};

const emptyBite: Bite = {
    id: -1,
    value: "",
    start: -1,
    end: -1,
};

const MakeSrcEater = (jackSrc: string) => {
    let pos = 0;
    let eats = 0;
    let eatStart = 0;

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
        if (eatStart === 0) {
            eatStart = pos;
        }
        const start = pos;
        const value = _eat(pattern);
        if (value === undefined) {
            error(`${pattern} expected`);
            return emptyBite;
        }
        // console.log("EAT", value);
        return {
            id: eats++,
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
        let maxEats = eats;
        const oldPos = pos;
        const oldEats = eats;
        for (const fn of fns) {
            try {
                pos = oldPos;
                eats = oldEats;
                return fn();
            } catch (e) {
                if (e instanceof ParseError) {
                    if (err === undefined) {
                        err = e;
                    }
                    if (eats > maxEats) {
                        err = e;
                        maxEats = eats;
                    }
                } else {
                    throw e;
                }
            }
        }
        eats = maxEats;
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
            const oldEats = eats;
            try {
                const one = fn();
                all.push(one);
            } catch (e) {
                if (e instanceof ParseError && eats === oldEats) {
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

    const getLastEatPos = () => {
        return { start: eatStart, end: pos };
    };

    return {
        eat,
        eatOne,
        loop,
        checkEof,
        getLineSrc,
        getLastEatPos,
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
    code: string;
};

const MakeCodeGen = (
    collectLine: (compiledLine: CompiledLine) => void,
    compareVmSrc?: string
) => {
    let className: string;
    let labelNo = 0;

    let isStaticFunc = false;

    const fields: Var[] = [];
    const statics: Var[] = [];
    let funcArgs: Var[] = [];
    let locals: Var[] = [];

    const getClassName = () => className;

    const nextLabelNo = () => labelNo++;

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

    const genCode = (code: string) => {
        if (vmSrcLines === undefined || code.startsWith("//")) {
            collectLine({ code });
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
            code:
                prefix +
                ("[" + code + "]").padEnd(30) +
                "[" +
                vmSrcLines[lineNo++] +
                "]",
        });
    };

    const genCodeXX = (bite: Bite, code: string) => {
        // TODO: bite
        genCode(code);
    };

    const genClass = (className_: string) => {
        className = className_;
    };

    const genFuncLike = (
        funcType: string,
        funcName: string,
        funcArgs_: Var[],
        locals_: Var[]
    ) => {
        funcArgs = funcArgs_;
        locals = locals_;
        isStaticFunc = funcType === "function";
        genCode(`function ${className}.${funcName} ${locals.length}`);
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

    const addCodeRef = (b1: Bite, b2: Bite) => {
        // TODO
    };

    return {
        genCode,
        genCodeXX,
        getClassName,
        nextLabelNo,
        addFieldOrStatic,
        genClass,
        genFuncLike,
        findVar,
        findVarCode,
        getFields,
        addCodeRef,
    };
};

type CodeGen = ReturnType<typeof MakeCodeGen>;

const identifierPattern =
    "(?!false\\b|true\\b|null\\b|this\\b)[a-zA-Z_][a-zA-Z0-9_]*";

type CodeSnippetGen = () => void;

const MakeParser = (srcEater: SrcEater, cg: CodeGen) => {
    const { eat, eatOne, loop, checkEof } = srcEater;

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
                    cg.genCodeXX(
                        identifier,
                        `push ${cg.findVarCode(identifier.value)}`
                    );
                    cg.genCodeXX(identifier, `add`);
                    cg.genCodeXX(identifier, `pop pointer 1`);
                    cg.genCodeXX(identifier, `push that 0`);
                    cg.addCodeRef(identifier, openBracket);
                    cg.addCodeRef(identifier, closeBracket);
                };
            },
            () => {
                const identifier = eatIdentifier();
                return () => {
                    cg.genCodeXX(
                        identifier,
                        `push ${cg.findVarCode(identifier.value)}`
                    );
                };
            },
        ]);

    const eatSubroutineCall = (): CodeSnippetGen => {
        let className: Bite | undefined = undefined;
        // TODO DOT
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

            cg.addCodeRef(identifier, openBracket);
            cg.addCodeRef(identifier, closeBracket);
            if (className === undefined) {
                callClassName = cg.getClassName();
                cg.genCodeXX(identifier, "push pointer 0");
                ++argsCount;
            } else {
                callClassName = className.value;
                const var1 = cg.findVar(className.value);
                if (var1 !== undefined) {
                    const varType = var1.var1?.type;
                    if (varType === undefined) {
                        throw "genSubroutineCall: call with this not impl";
                    }
                    callClassName = varType;
                    cg.genCodeXX(className, `push ${var1.code}`);
                    ++argsCount;
                }
            }
            for (const genArgSnippet of genArgSnippets) {
                genArgSnippet();
            }
            cg.genCode(
                `call ${callClassName}.${identifier.value} ${argsCount}`
            );
        };
    };

    const eatIntegerConstant = (): CodeSnippetGen => {
        const value = eat("[12]?\\d{1,4}|3[01]\\d{3}|32[0-7]\\d{2}");
        return () => {
            cg.genCode(`push constant ${value.value}`);
        };
    };

    const eatKeywordConstant = (): CodeSnippetGen => {
        const keyword = eat("(?:false|true|null|this)\\b");

        return () => {
            if (keyword.value === "this") {
                cg.genCodeXX(keyword, `push ${cg.findVarCode(keyword.value)}`);
                return;
            }
            cg.genCodeXX(keyword, "push constant 0");
            if (keyword.value === "true") {
                cg.genCodeXX(keyword, "not");
            }
        };
    };

    const eatStringConstant = (): CodeSnippetGen => {
        const openQuot = eat('\\"');
        const str = eat('[^\\"\\n]+');
        const closeQuot = eat('\\"');

        return () => {
            cg.genCode(`// "${str.value}"`);
            cg.genCode(`push constant ${str.value.length}`);
            cg.genCode("call String.new 1");
            for (const ch of str.value) {
                cg.genCode(`push constant ${ch.charCodeAt(0)}`);
                cg.genCode(`call String.appendChar 2`);
            }
            return;
        };
    };

    const eatUnaryOp = (): CodeSnippetGen => {
        const op = eat("[-~]");
        const term = eatTermValue();

        return () => {
            term();
            cg.genCode(op.value === "-" ? "neg" : "not");
        };
    };

    const eatExpressionInBrackets = (): CodeSnippetGen => {
        // TODO brackets
        const openBracket = eat("\\(");
        const genExprSnippet = eatExpression();
        const closeBracket = eat("\\)");

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
                if (op !== undefined)
                    cg.genCodeXX(op, opToCode[op.value as Op]);
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
                    cg.genCode("// " + lineSrc);
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
                            if (genIndexSnippet !== undefined) {
                                genIndexSnippet();
                                cg.genCode(
                                    `push ${cg.findVarCode(varName.value)}`
                                );
                                cg.genCode("add");
                                genExprSnippet();
                                cg.genCode("pop temp 0");
                                cg.genCode("pop pointer 1");
                                cg.genCode("push temp 0");
                                cg.genCode("pop that 0");
                            } else {
                                genExprSnippet();
                                cg.genCode(
                                    `pop ${cg.findVarCode(varName.value)}`
                                );
                            }
                        };
                    },
                    () => {
                        eat("if");
                        eat("\\(");
                        const genExprSnippet = eatExpression();
                        eat("\\)");
                        eat("\\{");
                        const genIfBlockSnippet = eatBlock();
                        let genElseBlockSnippet: CodeSnippetGen | undefined;
                        eatOne([
                            () => {
                                eat("\\}");
                                eat("else");
                                eat("\\{");
                                genElseBlockSnippet = eatBlock();
                                eat("\\}");
                            },
                            () => {
                                eat("\\}");
                                genElseBlockSnippet = undefined;
                            },
                        ]);

                        return () => {
                            const labelNo = ifLabelNo++;
                            genExprSnippet();
                            cg.genCode(`if-goto IF_TRUE${labelNo}`);
                            cg.genCode(`goto IF_FALSE${labelNo}`);
                            cg.genCode(`label IF_TRUE${labelNo}`);
                            genIfBlockSnippet();
                            if (genElseBlockSnippet) {
                                cg.genCode("// } if ");
                                cg.genCode(`goto IF_END${labelNo}`);
                                cg.genCode(`label IF_FALSE${labelNo}`);
                                genElseBlockSnippet();
                                cg.genCode("// } else ");
                                cg.genCode(`label IF_END${labelNo}`);
                            } else {
                                cg.genCode("// } if");
                                cg.genCode(`label IF_FALSE${labelNo}`);
                            }
                        };
                    },
                    () => {
                        eat("while");
                        eat("\\(");
                        const genExprSnippet = eatExpression();
                        eat("\\)");
                        eat("\\{");
                        const genBlockSnippet = eatBlock();
                        eat("\\}");

                        return () => {
                            const labelNo = whileLabelNo++;
                            cg.genCode(`label WHILE_EXP${labelNo}`);
                            genExprSnippet();
                            cg.genCode("not");
                            cg.genCode(`if-goto WHILE_END${labelNo}`);
                            genBlockSnippet();
                            cg.genCode("// } while");
                            cg.genCode(`goto WHILE_EXP${labelNo}`);
                            cg.genCode(`label WHILE_END${labelNo}`);
                        };
                    },
                    () => {
                        eat("do");
                        const genSubroutineCallSnippet = eatSubroutineCall();
                        eat(";");

                        return () => {
                            genSubroutineCallSnippet();
                            cg.genCode("pop temp 0");
                        };
                    },
                    () => {
                        returnFound = true;
                        eat("return");
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
                            if (genExprSnippet) {
                                genExprSnippet();
                            } else {
                                cg.genCode("push constant 0");
                            }
                            cg.genCode("return");
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

    // TODO Bite
    type VarDecl = {
        type: string;
        identifier: string;
    };

    const eatVarDecl = (): VarDecl => ({
        type: eatType().value,
        identifier: eatIdentifier().value,
    });

    const parseClass = () => {
        eat("class");
        // TODO Bite
        cg.genClass(eatIdentifier().value);
        eat("\\{");
        loop(() => {
            const fieldOrStatic = eat("field|static");
            const type = eatType();
            cg.addFieldOrStatic(
                fieldOrStatic.value,
                type.value,
                eatIdentifier().value
            );
            loop(() => {
                eat(",");
                cg.addFieldOrStatic(
                    fieldOrStatic.value,
                    type.value,
                    eatIdentifier().value
                );
            });
            eat(";");
        });
        loop(() => {
            const funcType = eat("constructor|method|function").value;
            // We ignore the return type
            eatIdentifier();
            const funcName = eatIdentifier().value;
            eat("\\(");

            const funcArgs: VarDecl[] = [];
            if (funcType === "method") {
                funcArgs.push({
                    type: "<this>",
                    identifier: "<this>",
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
                        identifier: eatIdentifier().value,
                    });
                });
                eat(";");
            });

            cg.genFuncLike(funcType, funcName, funcArgs, locals);

            if (funcType === "method") {
                cg.genCode("push argument 0");
                cg.genCode("pop pointer 0");
            }

            if (funcType === "constructor") {
                cg.genCode(`push constant ${cg.getFields().length}`);
                cg.genCode("call Memory.alloc 1");
                cg.genCode("pop pointer 0");
            }

            ifLabelNo = 0;
            whileLabelNo = 0;
            ifLabelNo = 0;
            whileLabelNo = 0;
            returnFound = false;
            eatBlock()();

            if (!returnFound) {
                cg.genCode("push constant 0");
                cg.genCode("return");
            }

            eat("\\}");
            cg.genCode("// } func");
        });
        eat("\\}");

        checkEof();
    };

    return {
        parseClass,
    };
};

export type SrcMap = Array<{
    src: { start: number; end: number };
    tgt: { start: number; end: number };
}>;

export type CompileResult = {
    code: string;
    srcMap: SrcMap;
};

const compile = (srcStr: string): CompileResult => {
    const src = MakeSrcEater(srcStr);
    let code = "";
    const srcMap: SrcMap = [];
    const codeGen = MakeCodeGen((codeLine) => {
        srcMap.push({
            src: src.getLastEatPos(),
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

    return { code, srcMap };
};

export { compile };
