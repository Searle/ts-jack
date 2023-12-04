// Derived from https://github.com/diversen/hack-emulator-js/blob/master/index.js
// MIT © Dennis Iversen

/**
 * As the hack computer is quite small
 * Everything is placed in this file
 * CPU, RAM, ROM, Screen, Keyboard
 */

export function makeHackEmulator(canvas: HTMLCanvasElement) {
    const ROM: number[] = new Array(32767 + 1); // 0x0000 to 0x8000
    const RAM: number[] = new Array(24576 + 1).fill(0); // 0x0000 to 0x6000

    const KBD = 24576; // Keyboard position in 0x6000
    let PC = 0;
    let DRegister = 0;
    let ARegister = 0;
    let ALUOut = 0;

    const debug = false;
    const screen = true;

    const compRaw: Record<string, () => number> = {
        "0101010": () => 0,
        "0111111": () => 1,
        "0111010": () => -1,
        "0001100": () => DRegister,
        "0110000": () => ARegister,
        "0001101": () => ~DRegister,
        "0110001": () => ~ARegister,
        "0001111": () => -DRegister,
        "0110011": () => -ARegister,
        "0011111": () => DRegister + 1,
        "0110111": () => ARegister + 1,
        "0001110": () => DRegister - 1,
        "0110010": () => ARegister - 1,
        "0000010": () => DRegister + ARegister,
        "0010011": () => DRegister - ARegister,
        "0000111": () => ARegister - DRegister,
        "0000000": () => DRegister & ARegister,
        "0010101": () => DRegister | ARegister,
        "1110000": () => RAM[ARegister],
        "1110001": () => ~RAM[ARegister],
        "1110011": () => -RAM[ARegister],
        "1110111": () => RAM[ARegister] + 1,
        "1110010": () => RAM[ARegister] - 1,
        "1000010": () => DRegister + RAM[ARegister],
        "1010011": () => DRegister - RAM[ARegister],
        "1000111": () => RAM[ARegister] - DRegister,
        "1000000": () => DRegister & RAM[ARegister],
        "1010101": () => DRegister | RAM[ARegister],
    };

    const comp = new Array(128);
    for (const [key, value] of Object.entries(compRaw)) {
        comp[parseInt(key, 2)] = value;
    }

    // Destination
    const dest: Array<(value: number) => void> = [
        (val) => {
            // Do nothing
        },
        (val) => {
            setRAM(val);
        },
        (val) => {
            DRegister = val;
        },
        (val) => {
            DRegister = val;
            setRAM(val);
        },
        (val) => {
            ARegister = val;
        },
        (val) => {
            setRAM(val);
            ARegister = val;
        },
        (val) => {
            DRegister = val;
            ARegister = val;
        },
        (val) => {
            DRegister = val;
            setRAM(val);
            ARegister = val;
        },
    ];

    const jump: Array<(value: number) => boolean> = [
        () => false,
        (val) => val > 0,
        (val) => val === 0,
        (val) => val >= 0,
        (val) => val < 0,
        (val) => val !== 0,
        (val) => val <= 0,
        () => true,
    ];

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
    // i: 0 = A instruction, 1 = C instruction
    const getOpcode = (ins: number) => ins & 0b1_00_0_000000_000_000;
    const getComp = (ins: number) => (ins & 0b0_00_1_111111_000_000) >> 6;
    const getDest = (ins: number) => (ins & 0b0_00_0_000000_111_000) >> 3;
    const getJump = (ins: number) => ins & 0b0_00_0_000000_000_111;

    const debugCycle = function (ins: number) {
        if (!debug) {
            return;
        }
        const opcode = getOpcode(ins);
        console.log("Opcode ", opcode);
        if (opcode === 0) {
            console.log("At ", ins);
            console.log("At (value) ", RAM[ins]);
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
        if (opcode) {
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

    const cycleC = function (ins: number) {
        const comp1 = getComp(ins);
        const dest1 = getDest(ins);
        const jump1 = getJump(ins);
        let jumped = false;

        ALUOut = comp[comp1]();

        if (dest1 !== 0) {
            dest[dest1](ALUOut);
        }

        if (jump1 !== 0) {
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

    const cycleA = function (ins: number) {
        ARegister = ins;
        PC++;
        debugCycle(ins);
    };

    const loadROM = function (program: number[]) {
        for (let i = 0; i < program.length; i++) {
            ROM[i] = program[i];
        }
    };

    return { RAM, cyclesDone, updateCanvas, cycle, loadROM };
}

export type HackEmulator = ReturnType<typeof makeHackEmulator>;
