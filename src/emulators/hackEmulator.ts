// Derived from https://github.com/diversen/hack-emulator-js/blob/master/index.js
// MIT © Dennis Iversen

/**
 * As the hack computer is quite small
 * Everything is placed in this file
 * CPU, RAM, ROM, Screen, Keyboard
 */

export function makeHackEmulator(canvas: HTMLCanvasElement) {
    const ROM = new Array(32767 + 1); // 0x0000 to 0x8000
    const RAM = new Array(24576 + 1).fill(0); // 0x0000 to 0x6000

    const KBD = 24576; // Keyboard position in 0x6000
    let PC = 0;
    let DRegister = 0;
    let ARegister = 0;
    let ALUOut = 0;

    const debug = false;
    const screen = true;

    const comp: Record<string, () => number> = {
        // '0101010': '0',
        "0101010": () => 0,
        // '0111111': '1',
        "0111111": () => 1,
        // '0111010': '-1',
        "0111010": () => -1,
        // '0001100': 'D',
        "0001100": () => DRegister,
        // '0110000': 'A',
        "0110000": () => ARegister,
        // '0001101': '!D',
        "0001101": () => ~DRegister,
        // '0110001': '!A',
        "0110001": () => ~ARegister,
        // '0001111': '-D',
        "0001111": () => -DRegister,
        // '0110011': '-A',
        "0110011": () => -ARegister,
        // '0011111': 'D+1',
        "0011111": () => DRegister + 1,
        // '0110111': 'A+1',
        "0110111": () => ARegister + 1,
        // '0001110': 'D-1',
        "0001110": () => DRegister - 1,
        // '0110010': 'A-1',
        "0110010": () => ARegister - 1,
        // '0000010': 'D+A',
        "0000010": () => DRegister + ARegister,
        // '0010011': 'D-A',
        "0010011": () => DRegister - ARegister,
        // '0000111': 'A-D',
        "0000111": () => ARegister - DRegister,
        // '0000000': 'D&A',
        "0000000": () => DRegister & ARegister,
        // '0010101': 'D|A',
        "0010101": () => DRegister | ARegister,
        // '1110000': 'M',
        "1110000": () => RAM[ARegister],
        // '1110001': '!M',
        "1110001": () => ~RAM[ARegister],
        // '1110011': '-M',
        "1110011": () => -RAM[ARegister],
        // '1110111': 'M+1',
        "1110111": () => RAM[ARegister] + 1,
        // '1110010': 'M-1',
        "1110010": () => RAM[ARegister] - 1,
        // '1000010': 'D+M',
        "1000010": () => DRegister + RAM[ARegister],
        // '1010011': 'D-M',
        "1010011": () => DRegister - RAM[ARegister],
        // '1000111': 'M-D',
        "1000111": () => RAM[ARegister] - DRegister,
        // '1000000': 'D&M',
        "1000000": () => DRegister & RAM[ARegister],
        // '1010101': 'D|M'
        "1010101": () => DRegister | RAM[ARegister],
    };

    // Destination
    const dest: Record<string, (value: number) => void> = {
        // '000': '0',
        "000": (val) => {
            // Do nothing
        },
        // '001': 'M',
        "001": (val) => {
            setRAM(val);
        },
        // '010': 'D',
        "010": (val) => {
            DRegister = val;
        },
        // '011': 'MD',
        "011": (val) => {
            DRegister = val;
            setRAM(val);
        },
        // '100': 'A',
        "100": (val) => {
            ARegister = val;
        },
        // '101': 'AM',
        "101": (val) => {
            setRAM(val);
            ARegister = val;
        },
        // '110': 'AD',
        "110": (val) => {
            DRegister = val;
            ARegister = val;
        },
        // '111': 'AMD'
        "111": (val) => {
            DRegister = val;
            setRAM(val);
            ARegister = val;
        },
    };

    const jump: Record<string, (value: number) => boolean> = {
        // '000': '0',
        "000": () => false,
        // '001': 'JGT',
        "001": (val) => val > 0,
        // '010': 'JEQ',
        "010": (val) => val === 0,
        // '011': 'JGE',
        "011": (val) => val >= 0,
        // '100': 'JLT',
        "100": (val) => val < 0,
        // '101': 'JNE',
        "101": (val) => val !== 0,
        // '110': 'JLE',
        "110": (val) => val <= 0,
        // '111': 'JMP'
        "111": () => true,
    };

    // Screen
    const SIZE_BITS = 512 * 256;
    const SCREEN_RAM = 16384;

    const canvasCtx = canvas.getContext("2d", { alpha: false });
    if (canvasCtx === null) {
        throw "Hack: Can't get canvas context";
    }

    const canvasData = canvasCtx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const getBinVal = (i: number) => i.toString(2).padStart(32, "0");

    // Used for the screen
    // Screen operates bit patterns
    // 1 is on 0 is off
    // TODO: Ohne number -> string -> number
    function dec2bin(dec: number) {
        return getBinVal(dec >>> 0).substring(16, 32);
    }

    // Get X and Y position of the word on the image
    // According to the position in RAM
    // RAM[16384 + r*32 + c%16]
    const getImageRowColumn = function () {
        const bitNo = (ARegister - SCREEN_RAM) * 16;
        return { x: bitNo & 511, y: bitNo >> 9 };
    };

    // Draw pixel on canvas
    const drawPixel = function (
        x: number,
        y: number,
        r: number,
        g: number,
        b: number,
        a: number
    ) {
        const index = (x + y * canvas.width) * 4;

        canvasData.data[index + 0] = r;
        canvasData.data[index + 1] = g;
        canvasData.data[index + 2] = b;
        canvasData.data[index + 3] = a;
    };

    const updateImageData = function (val: number) {
        // get bin val
        const { x, y } = getImageRowColumn();

        const binVal = dec2bin(val);
        const binAry = binVal.split("");

        binAry.forEach((elem, i) => {
            if (elem == "1") {
                drawPixel(x + 16 - i, y, 0, 0, 0, 255);
            } else {
                drawPixel(x + 16 - i, y, 255, 255, 255, 255);
            }
        });
    };

    const updateCanvas = function () {
        canvasCtx.putImageData(canvasData, 0, 0);
    };

    // Set screen RAM for fast access
    // As screen is updated often
    const setRAM = function (val: number) {
        RAM[ARegister] = val;
        if (ARegister >= SCREEN_RAM && ARegister < KBD) {
            if (screen) {
                updateImageData(val);
            }
        }
    };

    // Instruction: ixxaccccccdddjjj
    // Get opcode
    // 0 = C instruction
    // 1 = A instruction
    const getOpcode = function (ins: string) {
        return ins.substring(0, 1);
    };

    const getComp = function (ins: string) {
        return ins.substring(3, 10);
    };

    const getDest = function (ins: string) {
        return ins.substring(10, 13);
    };

    const getJump = function (ins: string) {
        return ins.substring(13, 16);
    };

    const debugCycle = function (ins: string) {
        if (!debug) {
            return;
        }
        const opcode = getOpcode(ins);
        console.log("Opcode ", opcode);
        if (opcode == "0") {
            console.log("At ", parseInt(ins, 2));
            console.log("At (value) ", RAM[parseInt(ins, 2)]);
        }

        console.log("Ins ", ins);
        console.log("PC ", PC);
        console.log("After Parse");

        console.log("ALUOut", ALUOut);
        console.log("AReg ", ARegister);
        console.log("DReg ", DRegister);

        console.log(RAM.slice(0, 16));
        console.log("---");
    };

    let cyclesDone = 0;

    const cycle = function () {
        // Expose? const currentPC = PC;

        if (ROM[PC] === undefined) {
            return;
        }

        const ins = ROM[PC];

        const opcode = getOpcode(ins);
        if (opcode == "1") {
            cycleC(ins);
        } else {
            cycleA(ins);
        }

        cyclesDone++;
        if (cyclesDone % 100000 == 0) {
            if (debug) {
                console.log("Cycles done:", cyclesDone);
            }
        }
    };

    const cycleC = function (ins: string) {
        const comp1 = getComp(ins);
        const dest1 = getDest(ins);
        const jump1 = getJump(ins);
        let jumped = false;

        ALUOut = comp[comp1]();

        if (dest1 != "000") {
            dest[dest1](ALUOut);
        }

        if (jump1 != "000") {
            if (jump[jump1](ALUOut)) {
                PC = ARegister;
                jumped = true;
            }
        }

        if (!jumped) {
            PC++;
        }

        debugCycle(ins);
    };

    const cycleA = function (ins: string) {
        ARegister = parseInt(ins, 2);
        PC++;
        debugCycle(ins);
    };

    const loadROM = function (bin: string) {
        // const ass = new assembler(str);
        // const bin = ass.getAssembledCode();

        const program = bin.split("\n");
        for (let i = 0; i < program.length; i++) {
            ROM[i] = program[i];
        }
    };

    return { RAM, cyclesDone, updateCanvas, cycle, loadROM };
}

export type HackEmulator = ReturnType<typeof makeHackEmulator>;
