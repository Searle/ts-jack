// Derived from https://github.com/diversen/hack-assembler-js/blob/master/index.js
// MIT © Dennis Iversen

class AsmcError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AsmcError";
    }
}

// prettier-ignore
const systemSymbolTable: Record<string, number> = {
    "R0":     0,
    "R1":     1,
    "R2":     2,
    "R3":     3,
    "R4":     4,
    "R5":     5,
    "R6":     6,
    "R7":     7,
    "R8":     8,
    "R9":     9,
    "R10":    10,
    "R11":    11,
    "R12":    12,
    "R13":    13,
    "R14":    14,
    "R15":    15,
    "SCREEN": 16384,
    "KBD":    24576,
    "SP":     0,
    "LCL":    1,
    "ARG":    2,
    "THIS":   3,
    "THAT":   4,
};

// prettier-ignore
const dest: Record<string, number> = {
    "0":   0b000_000,
    "M":   0b001_000,
    "D":   0b010_000,
    "MD":  0b011_000,
    "A":   0b100_000,
    "AM":  0b101_000,
    "AD":  0b110_000,
    "AMD": 0b111_000,
};

// prettier-ignore
const jump: Record<string, number> = {
    "0":   0b000,
    "JGT": 0b001,
    "JEQ": 0b010,
    "JGE": 0b011,
    "JLT": 0b100,
    "JNE": 0b101,
    "JLE": 0b110,
    "JMP": 0b111,
};

// prettier-ignore
const comp: Record<string, number> = {
    "0":   0b0101010_000000,
    "1":   0b0111111_000000,
    "-1":  0b0111010_000000,
    "D":   0b0001100_000000,
    "A":   0b0110000_000000,
    "!D":  0b0001101_000000,
    "!A":  0b0110001_000000,
    "-D":  0b0001111_000000,
    "-A":  0b0110011_000000,
    "D+1": 0b0011111_000000,
    "A+1": 0b0110111_000000,
    "D-1": 0b0001110_000000,
    "A-1": 0b0110010_000000,
    "D+A": 0b0000010_000000,
    "D-A": 0b0010011_000000,
    "A-D": 0b0000111_000000,
    "D&A": 0b0000000_000000,
    "D|A": 0b0010101_000000,
    "M":   0b1110000_000000,
    "!M":  0b1110001_000000,
    "-M":  0b1110011_000000,
    "M+1": 0b1110111_000000,
    "M-1": 0b1110010_000000,
    "D+M": 0b1000010_000000,
    "D-M": 0b1010011_000000,
    "M-D": 0b1000111_000000,
    "D&M": 0b1000000_000000,
    "D|M": 0b1010101_000000,
};

// Parse C opcode
// ixxaccccccdddjjj
const parseOpcodeC = function (line: string): number {
    let c: number | undefined;
    let d: number | undefined;
    let j: number | undefined;

    // Assignment
    const ary1 = line.split("=");
    if (ary1.length > 1) {
        c = comp[ary1[1]];
        d = dest[ary1[0]];
        j = 0;
    } else {
        const ary2 = line.split(";");
        if (ary2.length > 1) {
            c = comp[ary2[0]];
            d = 0;
            j = jump[ary2[1]];
        }
    }

    if (c === undefined || d === undefined || j === undefined) {
        throw `asmc: Syntax error: ${line}`;
    }

    return 0b1110000000000000 | c | d | j;
};

export const compileToBin = function (str: string): number[] {
    // Split code array
    let lines = str
        .replace(/\s*\/\/.*?$/gm, "")
        .replace(/[ \t]+/g, "")
        .split(/\r?\n/)
        .filter((line) => line !== "");

    // Extract all '(label)'
    const labels: Record<string, number> = {};
    let linesRemoved = 0;
    for (const [index, line] of lines.entries()) {
        const matches = line.match(/^\((.*)\)$/);
        if (matches) {
            labels["@" + matches[1]] = index - linesRemoved++;
            lines[index] = "";
        }
    }
    lines = lines.filter((line) => line !== "");

    // Substitute labels with line number
    for (const [index, line] of lines.entries()) {
        if (line in labels) {
            lines[index] = "@" + labels[line];
        }
    }

    // Memory start after last register
    let currentM = 16;
    const missingSymbols: Record<string, number> = {};
    const symbolTable: Record<string, number> = {};
    for (const [index, line] of lines.entries()) {
        const match = line.match(/^@(\D\S*)$/);
        if (match) {
            const label = match[1];
            if (/[.][^\d]/.test(label)) {
                missingSymbols[label] = index;
            }
            if (!(label in systemSymbolTable) && !(label in symbolTable)) {
                symbolTable[label] = currentM++;
            }
        }
    }

    const instructions: number[] = [];
    for (const line of lines) {
        if (line.startsWith("@")) {
            const label = line.substring(1);
            if (label in symbolTable) {
                instructions.push(symbolTable[label]);
                // delete symbolTable[label];
                continue;
            }
            if (label in systemSymbolTable) {
                instructions.push(systemSymbolTable[label]);
                continue;
            }
            instructions.push(parseInt(label));
            continue;
        }
        instructions.push(parseOpcodeC(line));
    }

    if (Object.keys(missingSymbols).length) {
        throw new AsmcError(
            "Missing symbols:\n" +
                Object.entries(missingSymbols)
                    .map(([key, value]) => `${key} (line ${value})`)
                    .join("\n")
        );
    }

    console.log(
        str.substring(0, 100),
        lines
            .slice(0, 100)
            .map((v, i) => `${i} ${v}`)
            .join("\n")
    );

    return instructions;
};

export const compile = (input: string): string =>
    compileToBin(input)
        .map((n) => n.toString(2).padStart(16, "0"))
        .join("\n");
