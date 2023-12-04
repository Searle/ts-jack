// Derived from https://github.com/diversen/hack-assembler-js/blob/master/index.js
// MIT © Dennis Iversen

const systemSymbolTable: Record<string, number> = {
    R0: 0,
    R1: 1,
    R2: 2,
    R3: 3,
    R4: 4,
    R5: 5,
    R6: 6,
    R7: 7,
    R8: 8,
    R9: 9,
    R10: 10,
    R11: 11,
    R12: 12,
    R13: 13,
    R14: 14,
    R15: 15,
    SCREEN: 16384,
    KBD: 24576,
    SP: 0,
    LCL: 1,
    ARG: 2,
    THIS: 3,
    THAT: 4,
};

const dest: Record<string, string> = {
    "0": "000",
    M: "001",
    D: "010",
    MD: "011",
    A: "100",
    AM: "101",
    AD: "110",
    AMD: "111",
};

const jump: Record<string, string> = {
    "0": "000",
    JGT: "001",
    JEQ: "010",
    JGE: "011",
    JLT: "100",
    JNE: "101",
    JLE: "110",
    JMP: "111",
};

const comp: Record<string, string> = {
    "0": "0101010",
    "1": "0111111",
    "-1": "0111010",
    D: "0001100",
    A: "0110000",
    "!D": "0001101",
    "!A": "0110001",
    "-D": "0001111",
    "-A": "0110011",
    "D+1": "0011111",
    "A+1": "0110111",
    "D-1": "0001110",
    "A-1": "0110010",
    "D+A": "0000010",
    "D-A": "0010011",
    "A-D": "0000111",
    "D&A": "0000000",
    "D|A": "0010101",
    M: "1110000",
    "!M": "1110001",
    "-M": "1110011",
    "M+1": "1110111",
    "M-1": "1110010",
    "D+M": "1000010",
    "D-M": "1010011",
    "M-D": "1000111",
    "D&M": "1000000",
    "D|M": "1010101",
};

// Parse C opcode
// ixxaccccccdddjjj
const parseOpcodeC = function (line: string) {
    const parts: Record<string, string> = {};
    let c, d, j: string;

    // Assignment
    const ary1 = line.split("=");
    if (ary1.length > 1) {
        d = dest[ary1[0]];
        c = comp[ary1[1]];
        j = "000";
    } else {
        const ary2 = line.split(";");
        if (ary2.length > 1) {
            c = comp[ary2[0]];
            d = "000"; //dest[ary[0]]
            j = jump[ary2[1]];
        }
    }

    if (c === undefined || d === undefined || j === undefined) {
        throw `asmc: Syntax error: ${line}`;
    }

    return `111${c}${d}${j}`;
};

const getBinVal = (i: number) => i.toString(2).padStart(16, "0");

export const compile = function (str: string) {
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
    const symbolTable: Record<string, number> = {};
    for (const line of lines) {
        const match = line.match(/^@(\D\S*)$/);
        if (match) {
            const label = match[1];
            if (!(label in systemSymbolTable) && !(label in symbolTable)) {
                symbolTable[label] = currentM++;
            }
        }
    }

    const instructions: string[] = [];
    for (const line of lines) {
        if (line.startsWith("@")) {
            const label = line.substring(1);
            if (label in symbolTable) {
                instructions.push(getBinVal(symbolTable[label]));
            } else if (label in systemSymbolTable) {
                instructions.push(getBinVal(systemSymbolTable[label]));
            } else {
                instructions.push(getBinVal(parseInt(label)));
            }
        } else {
            instructions.push(parseOpcodeC(line));
        }
    }

    return instructions.join("\n");
};
