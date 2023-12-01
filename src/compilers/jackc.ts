// Deprecated, use jackc2.ts

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

const MakeSrcEater = (jackSrc: string) => {
    let pos = 0;
    let eats = 0;
    let eatStart = 0;
    let eatSetStart = false;

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

    const eat: (pattern: string) => string = (pattern) => {
        if (eatSetStart === true) {
            eatSetStart = false;
            eatStart = pos;
        }
        skipComment();
        const value = _eat(pattern);
        if (value === undefined) {
            error(`${pattern} expected`);
            return "";
        }
        // console.log("EAT", value);
        ++eats;
        return value;
    };

    type OnFail = () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type FunctionTuple = Array<(setOnFail?: (onFail_: OnFail) => void) => any>;

    const eatOne = <T extends FunctionTuple>(
        fns: [...T]
    ): ReturnType<T[number]> | never => {
        let err: ParseError | undefined = undefined;
        let maxEats = eats;
        const oldPos = pos;
        const oldEats = eats;
        let onFail: OnFail | undefined = undefined;
        const setOnFail = (onFail_: OnFail) => {
            onFail = onFail_;
        };
        for (const fn of fns) {
            try {
                pos = oldPos;
                eats = oldEats;
                onFail = undefined;
                return fn(setOnFail);
            } catch (e) {
                if (e instanceof ParseError) {
                    if (onFail) {
                        // @ts-expect-error Typescript thinks "onFail" is "never" ???
                        onFail();
                    }
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

    const loop: (fn: () => void) => unknown | void = (fn) => {
        let i = 100;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (--i < 0) {
                error("internal loop watchdog");
            }
            const oldPos = pos;
            const oldEats = eats;
            try {
                fn();
            } catch (e) {
                if (e instanceof ParseError && eats === oldEats) {
                    pos = oldPos;
                    break;
                }
                throw e;
            }
        }
    };

    const checkEof = () => {
        const oldPos = pos;
        const excessive = eat(".*");
        if (excessive) {
            pos = oldPos;
            error("Excessive bytes");
        }
    };

    const getLineSrc = () => {
        skipComment();
        return jackSrc.substring(pos).replace(/\n.*/s, "");
    };

    const getLastEatPos = () => {
        const start = eatStart;
        eatSetStart = true;
        return { start, end: pos };
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

type IntegerConstant = {
    $type: "IntegerConstant";
    value: string;
};

type VarName = {
    $type: "VarName";
    identifier: string;
    index: Expression | undefined;
};

type SubroutineCall = {
    $type: "SubroutineCall";
    className: string | undefined;
    identifier: string;
    args: Expression[];
};

type StringConstant = {
    $type: "StringConstant";
    value: string;
};

type KeywordConstant = {
    $type: "KeywordConstant";
    keyword: string;
};

type Term =
    | Expression
    | IntegerConstant
    | VarName
    | SubroutineCall
    | StringConstant
    | KeywordConstant
    | UnaryOp;

type OpTerm = {
    $type: "OpTerm";
    op: Op;
    term: Term;
};

type UnaryOp = {
    $type: "UnaryOp";
    op: "-" | "~";
    term: Term;
};

type Expression = {
    $type: "Expression";
    opTerms: OpTerm[];
};

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

    const genSubroutineCall = (term: SubroutineCall) => {
        let argsCount = term.args.length;
        let callClassName = term.className;

        if (callClassName === undefined) {
            callClassName = className;
            genCode("push pointer 0");
            ++argsCount;
        } else {
            const var1 = findVar(callClassName);
            if (var1 !== undefined) {
                callClassName = var1.var1?.type;
                if (callClassName === undefined) {
                    throw "genSubroutineCall: call with this not impl";
                }
                genCode(`push ${var1.code}`);
                ++argsCount;
            }
        }
        for (const arg of term.args) {
            genExpr(arg);
        }
        genCode(`call ${callClassName}.${term.identifier} ${argsCount}`);
    };

    const genExpr = (expr: Expression) => {
        const genTerm = (term: OpTerm["term"]) => {
            if (term.$type === "Expression") {
                gen(term);
                return;
            }
            if (term.$type === "IntegerConstant") {
                genCode(`push constant ${term.value}`);
                return;
            }
            if (term.$type === "VarName") {
                if (term.index !== undefined) {
                    genExpr(term.index);
                    genCode(`push ${findVarCode(term.identifier)}`);
                    genCode(`add`);
                    genCode(`pop pointer 1`);
                    genCode(`push that 0`);
                } else {
                    genCode(`push ${findVarCode(term.identifier)}`);
                }
                return;
            }
            if (term.$type === "SubroutineCall") {
                genSubroutineCall(term);
                return;
            }
            if (term.$type === "StringConstant") {
                genCode(`// "${term.value}"`);
                genCode(`push constant ${term.value.length}`);
                genCode("call String.new 1");
                for (const ch of term.value) {
                    genCode(`push constant ${ch.charCodeAt(0)}`);
                    genCode(`call String.appendChar 2`);
                }
                return;
            }
            if (term.$type === "KeywordConstant") {
                genCode("push constant 0");
                if (term.keyword === "true") {
                    genCode("not");
                }
                return;
            }
            if (term.$type === "UnaryOp") {
                genTerm(term.term);
                genCode(term.op === "-" ? "neg" : "not");
                return;
            }
            throw `genExpr ${JSON.stringify(term)} not impl`;
        };

        const gen = (expr: Expression) => {
            for (const [i, opTerm] of expr.opTerms.entries()) {
                genTerm(opTerm.term);
                if (i != 0) genCode(opToCode[opTerm.op]);
            }
        };

        gen(expr);
    };

    const getFields = () => fields;

    return {
        genCode,
        getClassName,
        nextLabelNo,
        addFieldOrStatic,
        genClass,
        genFuncLike,
        findVar: findVarCode,
        genSubroutineCall,
        genExpr,
        getFields,
    };
};

type CodeGen = ReturnType<typeof MakeCodeGen>;

const identifierPattern =
    "(?!false\\b|true\\b|null\\b|this\\b)[a-zA-Z_][a-zA-Z0-9_]*";

const MakeParser = (srcEater: SrcEater, cg: CodeGen) => {
    const { eat, eatOne, loop, checkEof } = srcEater;

    const eatIdentifier = () => eat(identifierPattern);

    const eatType = () => eat("int|char|boolean|" + identifierPattern);

    const eatVarDecl = (): Var => ({
        type: eatType(),
        identifier: eatIdentifier(),
    });

    const eatVarName = (): VarName => {
        let identifier: string = "";
        let index: Expression | undefined = undefined;
        eatOne([
            () => {
                identifier = eatIdentifier();
                eat("\\[");
                index = eatExpression();
                eat("\\]");
            },
            () => {
                identifier = eatIdentifier();
            },
        ]);
        return {
            $type: "VarName",
            identifier,
            index,
        };
    };

    const eatSubroutineCall = (): SubroutineCall => {
        let className: string | undefined = undefined;
        let identifier: string = "";
        eatOne([
            () => {
                className = eatIdentifier();
                eat("\\.");
                identifier = eatIdentifier();
            },
            () => {
                className = undefined;
                identifier = eatIdentifier();
            },
        ]);
        eat("\\(");
        const args: Expression[] = [];
        eatOne([
            () => {
                eat("\\)");
            },
            () => {
                args.push(eatExpression());
                loop(() => {
                    eat(",");
                    const arg = eatExpression();
                    args.push(arg);
                });
                eat("\\)");
            },
        ]);

        return {
            $type: "SubroutineCall",
            className,
            identifier,
            args,
        };
    };

    const eatTermValue = () =>
        eatOne([
            (): IntegerConstant => ({
                $type: "IntegerConstant",
                value: eat("[12]?\\d{1,4}|3[01]\\d{3}|32[0-7]\\d{2}"),
            }),
            eatSubroutineCall,
            eatVarName,
            (): KeywordConstant | VarName => {
                const keyword = eat("(?:false|true|null|this)\\b");
                if (keyword === "this") {
                    return {
                        $type: "VarName",
                        identifier: keyword,
                        index: undefined,
                    };
                }
                return {
                    $type: "KeywordConstant",
                    keyword,
                };
            },
            (): StringConstant => {
                eat('\\"');
                const value = eat('[^\\"\\n]+');
                eat('\\"');
                return {
                    $type: "StringConstant",
                    value,
                };
            },
            (): UnaryOp => ({
                $type: "UnaryOp",
                op: eat("[-~]") as "-" | "~",
                term: eatTermValue(),
            }),
            (): Expression => {
                eat("\\(");
                const expr = eatExpression();
                eat("\\)");
                return expr;
            },
        ]);

    const eatOp = (): Op => eat("[-+*/&|<>=]") as Op;

    const eatExpression = (): Expression => {
        const opTerms: OpTerm[] = [
            {
                $type: "OpTerm",
                op: "+",
                term: eatTermValue(),
            },
        ];

        loop(() => {
            const op = eatOp();
            const value = eatTermValue();
            opTerms.push({ $type: "OpTerm", op, term: value });
        });

        return {
            $type: "Expression",
            opTerms,
        };
    };

    let ifLabelNo = 0;
    let whileLabelNo = 0;

    const parseBlock = () => {
        let returnFound = false;
        loop(() => {
            cg.genCode("// " + srcEater.getLineSrc());
            eatOne([
                () => {
                    eat("let");
                    const varName = eatVarName();
                    eat("=");
                    const expr = eatExpression();
                    eat(";");

                    if (varName.index !== undefined) {
                        cg.genExpr(varName.index);
                        cg.genCode(`push ${cg.findVar(varName.identifier)}`);
                        cg.genCode("add");
                        cg.genExpr(expr);
                        cg.genCode("pop temp 0");
                        cg.genCode("pop pointer 1");
                        cg.genCode("push temp 0");
                        cg.genCode("pop that 0");
                    } else {
                        cg.genExpr(expr);
                        cg.genCode(`pop ${cg.findVar(varName.identifier)}`);
                    }
                },
                (setOnFail) => {
                    eat("if");
                    const labelNo = ifLabelNo++;
                    setOnFail?.(() => {
                        --ifLabelNo;
                    });
                    eat("\\(");
                    const expr = eatExpression();
                    eat("\\)");
                    cg.genExpr(expr);
                    cg.genCode(`if-goto IF_TRUE${labelNo}`);
                    cg.genCode(`goto IF_FALSE${labelNo}`);
                    cg.genCode(`label IF_TRUE${labelNo}`);
                    eat("\\{");
                    parseBlock();
                    eatOne([
                        () => {
                            eat("\\}");
                            eat("else");
                            eat("\\{");
                            cg.genCode(`goto IF_END${labelNo}`);
                            cg.genCode(`label IF_FALSE${labelNo}`);
                            parseBlock();
                            eat("\\}");
                            cg.genCode(`label IF_END${labelNo}`);
                        },
                        () => {
                            eat("\\}");
                            cg.genCode(`label IF_FALSE${labelNo}`);
                        },
                    ]);
                },
                (setOnFail) => {
                    eat("while");
                    const labelNo = whileLabelNo++;
                    setOnFail?.(() => {
                        --whileLabelNo;
                    });
                    cg.genCode(`label WHILE_EXP${labelNo}`);
                    eat("\\(");
                    cg.genExpr(eatExpression());
                    cg.genCode("not");
                    eat("\\)");
                    eat("\\{");
                    cg.genCode(`if-goto WHILE_END${labelNo}`);
                    parseBlock();
                    eat("\\}");
                    cg.genCode(`goto WHILE_EXP${labelNo}`);
                    cg.genCode(`label WHILE_END${labelNo}`);
                },
                () => {
                    eat("do");
                    cg.genSubroutineCall(eatSubroutineCall());
                    eat(";");
                    cg.genCode("pop temp 0");
                },
                () => {
                    returnFound = true;
                    eat("return");
                    const expr = eatOne([
                        () => {
                            const expr = eatExpression();
                            eat(";");
                            return expr;
                        },
                        () => {
                            eat(";");
                            return undefined;
                        },
                    ]);
                    if (expr === undefined) {
                        cg.genCode("push constant 0");
                    } else {
                        cg.genExpr(expr);
                    }
                    cg.genCode("return");
                },
            ]);
        });
        return { returnFound };
    };

    const parseClass = () => {
        eat("class");
        cg.genClass(eatIdentifier());
        eat("\\{");
        loop(() => {
            const fieldOrStatic = eat("field|static");
            const type = eatType();
            cg.addFieldOrStatic(fieldOrStatic, type, eatIdentifier());
            loop(() => {
                eat(",");
                cg.addFieldOrStatic(fieldOrStatic, type, eatIdentifier());
            });
            eat(";");
        });
        loop(() => {
            const funcType = eat("constructor|method|function");
            // We ignore the return type
            eatIdentifier();
            const funcName = eatIdentifier();
            eat("\\(");

            const funcArgs: Var[] = [];
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

            const locals: Var[] = [];
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
            const { returnFound } = parseBlock();

            if (!returnFound) {
                cg.genCode("push constant 0");
                cg.genCode("return");
            }

            eat("\\}");
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
