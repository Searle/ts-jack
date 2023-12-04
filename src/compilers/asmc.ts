import { CompileResult } from "./common";

export const compile = (input: string): CompileResult => {
    let result = "";

    const lines = input.split(/\r\n/);

    for (const line in lines) {
        console.log(line);
        result += "??? " + line + "\n";
    }

    return {
        code: result,
        srcMap: [], // TODO
    };
};
