import { CompileResult } from "./common.ts";
import snippetsStr from "./vmc-snippets.ts";

const snippets: Record<string, string> = {};

const setupSnippets = () => {
    const list = snippetsStr.split(/\{([-a-z]+)\}/);
    for (let i = 1; i < list.length; i += 2) {
        snippets[list[i]] = list[i + 1]
            .replace(/\s*(?:\/\/.*)?$/gm, "")
            .replace(/^\s+/gm, "")
            .trim();
    }
};

setupSnippets();

class VmcError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "VmcError";
    }
}

const indirectSegments: Record<string, number> = {
    local: 1,
    argument: 2,
    this: 3,
    that: 4,
} as const;

const directSegments: Record<string, number> = {
    static: 16,
    temp: 5,
    pointer: 3,
} as const;

export const compile = (baseName: string, input: string): CompileResult => {
    let code = "";
    const srcMap: CompileResult["srcMap"] = [];

    type SrcMapSrc = CompileResult["srcMap"][number]["src"][number];

    const genCode = (srcMapSrc: SrcMapSrc, asmLine: string) => {
        srcMap.push({
            src: [srcMapSrc],
            tgt: { start: code.length, end: asmLine.length },
        });
        code += asmLine + "\n";
    };

    let returnAddress = -1;

    // Hard-coded for now
    const stackStart = "256";

    const labels: Record<string, number> = {};
    let labelNo = 0;

    const processSnippet = (
        srcMapSrc: SrcMapSrc,
        snippet: string,
        subst: Record<string, string | ((asmLine: string) => void)> = {},
        comments: Record<string, string> = {}
    ) => {
        const snippetLines = snippets[snippet].split(/\n/);

        snippetLines.forEach((asmLine, index) => {
            // const al1 = asmLine;
            const lineComments: string[] = [];
            if (index === 0 && "title" in comments) {
                lineComments.push(comments["title"]);
            }
            for (const [name, newName] of Object.entries(subst)) {
                let found = false;
                asmLine = asmLine.replace(`%_${name}`, () => {
                    if (typeof newName === "string") {
                        found = true;
                        return newName;
                    }
                    newName(asmLine);
                    return "";
                });
                if (found && name in comments) {
                    lineComments.push(comments[name]);
                }
                continue;
            }
            if (asmLine === "") return;

            asmLine = asmLine.replace(/%_([a-zA-Z_0-9]+)/g, (_, label) => {
                if (!(label in labels)) {
                    labels[label] = labelNo++;
                }
                lineComments.push(label);
                return "localLoop" + labels[label];
            });

            if (lineComments.length) {
                asmLine = `${asmLine} // ${lineComments.join("; ")}`;
            }

            if (asmLine.includes("%")) {
                throw `Unresolved %: ${snippet}/${asmLine}`;
            }

            // genCode(asmLine + " // **" + al1);
            genCode(srcMapSrc, asmLine);
        });
    };

    const processLine = (start: number, id: number, vmLine: string) => {
        const srcMapSrc: SrcMapSrc = {
            id,
            start,
            end: vmLine.trimEnd().length,
        };

        genCode(srcMapSrc, "// " + vmLine.trim());

        const vmLineWithoutComment = vmLine.replace(/\s*\/\/.*$/, "");
        const rawTokens = vmLineWithoutComment.split(/(\s+)/);
        const tokens = rawTokens.filter((_, index) => !(index & 1));

        const command: string = tokens[0];
        if (command === "") return;

        let tokenIndex = 0;
        const nextToken = (): string => {
            const token = tokens[++tokenIndex];
            if (token === undefined) {
                // TODO error
                throw "token expected";
            }
            return token;
        };

        if (command === "sys-init") {
            return processSnippet(srcMapSrc, command, {
                stack_address: stackStart,
            });
        }

        if (
            command === "label" ||
            command === "goto" ||
            command === "if-goto"
        ) {
            return processSnippet(srcMapSrc, command, {
                label: `${baseName}_${nextToken()}`,
            });
        }

        if (command === "call") {
            const fName = nextToken();
            const nArgs = nextToken();
            const nArgsI = parseInt(nArgs);
            ++returnAddress;
            return processSnippet(srcMapSrc, "call", {
                set_arg: () => {
                    genCode(srcMapSrc, "@SP");
                    genCode(srcMapSrc, "D=M");
                    for (let i = 0; i < nArgsI; ++i) {
                        genCode(srcMapSrc, "D=D-1");
                    }
                    genCode(srcMapSrc, "@R13");
                    genCode(srcMapSrc, "M=D");
                },
                return_address: baseName + "_Return_" + returnAddress,
                function_name: fName,
            });
        }

        if (command === "function") {
            const fName = nextToken();
            const nLocals = nextToken();
            const nLocalsI = parseInt(nLocals);
            return processSnippet(srcMapSrc, "function", {
                local_vars: () => {
                    for (let i = 0; i < nLocalsI; i++) {
                        processSnippet(
                            srcMapSrc,
                            "init-local-vars",
                            {},
                            { title: ` (var #${i})` }
                        );
                    }
                },
                function_name: fName,
            });
        }

        if (command === "push" || command === "pop") {
            const segment = nextToken();
            const index = nextToken();
            if (command == "push" && segment === "constant") {
                return processSnippet(srcMapSrc, "push-constant", {
                    literal: index,
                });
            }
            if (segment in directSegments) {
                const address =
                    segment === "static"
                        ? `${baseName}_${index}`
                        : (
                              directSegments[segment] + parseInt(index)
                          ).toString();
                return processSnippet(
                    srcMapSrc,
                    `${command}-direct`,
                    {
                        source_address: address,
                        dest_address: address,
                    },
                    {
                        source_address: `${segment} segment`,
                        dest_address: `${segment} segment`,
                    }
                );
            }
            if (segment in indirectSegments) {
                return processSnippet(
                    srcMapSrc,
                    `${command}-indirect`,
                    {
                        base_pointer: indirectSegments[segment].toString(),
                        offset: index,
                    },
                    { base_pointer: `${segment} segment`, offset: "offset" }
                );
            }
            // TODO
            console.log("PUSH/POP", command, segment, index);
            throw new VmcError("Internal error: " + command + " ??" + vmLine);
        }

        if (command in snippets) {
            return processSnippet(srcMapSrc, command);
        }

        throw new VmcError("Unknown command: " + vmLine);
    };

    const process = () => {
        let start = 0;
        for (const [lineIndex, line] of input.split(/\n/).entries()) {
            processLine(lineIndex, start, line);
            start += line.length + 1;
        }
    };

    process();

    return { code, srcMap };
};
