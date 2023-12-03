import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import compile from "./vmc.ts";
import { displayDiffSideBySide } from "./diffUtils.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readFile = (filePath: string) => fs.readFileSync(filePath, "utf-8");

const runTest = (path: string, className = path) => {
    const asmFilePath = `${__dirname}/../examples/vm-asm/${path}/${className}.asm`;
    const vmFilePath = `${__dirname}/../examples/vm-asm/${path}/${className}.vm`;

    const asmCode = readFile(asmFilePath);
    const vmCode = readFile(vmFilePath);

    const compiled = compile(className, vmCode);

    // eslint-disable-next-line no-constant-condition
    if (false) {
        console.log(
            compiled
                .split(/\r?\n/)
                .map((line, index) => String(index).padStart(4) + " " + line)
                .join("\n")
        );
    }

    // const asmCode1 = "a \nb \nc \nd \ne \ne1 \ne2 \ne3 \nf \ng ";
    // const compiled1 = "a \nb1 \nb2 \nc \nd \ne // test\nf \ng ";

    displayDiffSideBySide(asmCode, compiled, 6, 2);
};

describe("simple test", () => {
    it("should pass", () => {
        runTest("BasicTest"); // ok
        // runTest("BasicLoop"); // ok
        // runTest("PointerTest"); // ok
        // runTest("SimpleAdd"); // ok
        // runTest("StackTest"); // ok
        // runTest("SimpleFunction"); // ok
        // runTest("StaticTest"); // ok

        // runTest("NestedCall", "Sys"); // ok

        // runTest("FibonacciElement", "Main"); // ok
        // runTest("FibonacciSeries"); // ok
        // runTest("StaticsTest", "Sys"); // ok

        expect(1 + 1).toBe(2);
    });
});
