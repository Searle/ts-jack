// Derived from https://github.com/diversen/hack-emulator-js/blob/master/index.js
// MIT © Dennis Iversen

/**
 * As the hack computer is quite small
 * Everything is placed in this file
 * CPU, RAM, ROM, Screen, Keyboard
 */

interface MakeHackEmulatorProps {
    canvas?: HTMLCanvasElement;
    onTerminalWrite?: (word: number) => void;
}

export function makeHackEmulator({
    canvas,
    onTerminalWrite,
}: MakeHackEmulatorProps) {
    const ROM: number[] = new Array(32768).fill(0); // 0x0000 to 0x8000
    const RAM: number[] = new Array(24578).fill(0); // 0x0000 to 0x6000

    // const KEYBOARD = 24576;
    const TERMINAL_WRITE = 24577; // Extension for writing a Char to the Terminal

    let PC = 0;
    let DRegister = 0;
    let ARegister = 0;
    let ALUOut = 0;

    const debug = false;
    const screen = true;

    // prettier-ignore
    const compRaw: Record<string, [name: string, run: () => number]> = {
        "0101010": ["0",   () => 0],
        "0111111": ["1",   () => 1],
        "0111010": ["-1",  () => -1],
        "0001100": ["D",   () => DRegister],
        "0110000": ["A",   () => ARegister],
        "0001101": ["!D",  () => ~DRegister],
        "0110001": ["!A",  () => ~ARegister],
        "0001111": ["-D",  () => -DRegister],
        "0110011": ["-A",  () => -ARegister],
        "0011111": ["D+1", () => DRegister + 1],
        "0110111": ["A+1", () => ARegister + 1],
        "0001110": ["D-1", () => DRegister - 1],
        "0110010": ["A-1", () => ARegister - 1],
        "0000010": ["D+A", () => DRegister + ARegister],
        "0010011": ["D-A", () => DRegister - ARegister],
        "0000111": ["A-D", () => ARegister - DRegister],
        "0000000": ["D&A", () => DRegister & ARegister],
        "0010101": ["D|A", () => DRegister | ARegister],
        "1110000": ["M",   () => RAM[ARegister]],
        "1110001": ["!M",  () => ~RAM[ARegister]],
        "1110011": ["-M",  () => -RAM[ARegister]],
        "1110111": ["M+1", () => RAM[ARegister] + 1],
        "1110010": ["M-1", () => RAM[ARegister] - 1],
        "1000010": ["D+M", () => DRegister + RAM[ARegister]],
        "1010011": ["D-M", () => DRegister - RAM[ARegister]],
        "1000111": ["A-D", () => RAM[ARegister] - DRegister],
        "1000000": ["D&M", () => DRegister & RAM[ARegister]],
        "1010101": ["D|M", () => DRegister | RAM[ARegister]],
    };

    const comp: Array<() => number> = new Array(128);
    const compNames: string[] = new Array(128);
    for (const [key, value] of Object.entries(compRaw)) {
        compNames[parseInt(key, 2)] = value[0];
        comp[parseInt(key, 2)] = value[1];
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

    const destNames = ["", "M=", "D=", "MD=", "A=", "AM=", "AD=", "AMD="];

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

    const jumpNames = [
        "",
        ";JGT",
        ";JEQ",
        ";JGE",
        ";JLT",
        ";JNE",
        ";JLE",
        ";JMP",
    ];

    // Instruction: ixxaccccccdddjjj
    // i: 0 = A instruction, 1 = C instruction
    const getOpcode = (ins: number) => ins & 0b1_00_0_000000_000_000;
    const getComp = (ins: number) => (ins & 0b0_00_1_111111_000_000) >> 6;
    const getDest = (ins: number) => (ins & 0b0_00_0_000000_111_000) >> 3;
    const getJump = (ins: number) => ins & 0b0_00_0_000000_000_111;

    const decode = (ins: number) => {
        if (getOpcode(ins)) {
            return (
                destNames[getDest(ins)] +
                (compNames[getComp(ins)] ?? "???") +
                jumpNames[getJump(ins)]
            );
        }
        return "@ " + ins;
    };

    // Screen
    const SIZE_BITS = 512 * 256;
    const SCREEN_RAM = 16384;
    const SCREEN_RAM_END = SCREEN_RAM + SIZE_BITS / 16;

    const setupCanvas = () => {
        const reset = () => {
            ROM.fill(0);
            RAM.fill(0);
            PC = 0;
            DRegister = 0;
            ARegister = 0;
            ALUOut = 0;
        };

        if (!canvas) {
            console.log("makeHackEmulator: no canvas");

            return {
                reset,
                clearCanvas: () => {},
                updateCanvas: () => {},
                updateImageData: () => {},
            };
        }

        const canvasCtx = canvas.getContext("2d", { alpha: false });
        if (canvasCtx === null) {
            throw "makeHackEmulator: Can't get canvas context";
        }

        const clearCanvas = () => {
            canvasCtx.fillStyle = "white";
            canvasCtx.clearRect(0, 0, 512, 256);
            canvasCtx.fillRect(0, 0, 512, 256);
            canvasCtx.fillStyle = "black";
        };

        clearCanvas();

        const canvasData = canvasCtx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const drawPixel = function (x: number, y: number, rgb: number) {
            const index = (x + y * canvas.width) * 4;

            canvasData.data[index + 0] = rgb;
            canvasData.data[index + 1] = rgb;
            canvasData.data[index + 2] = rgb;
        };

        const updateImageData = function (val: number) {
            const bitNo = (ARegister - SCREEN_RAM) * 16;
            const x = bitNo & 511;
            const y = bitNo >> 9;

            let b = 1;
            for (let i = 0; i < 16; ++i) {
                if (val & b) {
                    drawPixel(x + i, y, 0);
                } else {
                    drawPixel(x + i, y, 255);
                }
                b += b;
            }
        };

        const updateCanvas = function () {
            canvasCtx.putImageData(canvasData, 0, 0);
        };

        return {
            reset: () => {
                reset();
                clearCanvas();
            },
            clearCanvas,
            updateImageData,
            updateCanvas,
        };
    };

    const { reset, clearCanvas, updateImageData, updateCanvas } = setupCanvas();

    // Set screen RAM for fast access
    // As screen is updated often
    const setRAM = function (val: number) {
        RAM[ARegister] = val;
        if (canvas && ARegister >= SCREEN_RAM && ARegister < SCREEN_RAM_END) {
            if (screen) {
                updateImageData(val);
            }
        }
        if (onTerminalWrite && ARegister == TERMINAL_WRITE) {
            onTerminalWrite(RAM[TERMINAL_WRITE]);
        }
    };

    const debugCycle = function (ins: number) {
        const isA = getOpcode(ins) === 0;
        console.table([
            {
                "": decode(ins),
                "@": isA ? ins : "-",
                "M@": isA ? RAM[ins] : "-",
                PC: PC,
                ALUOut: ALUOut,
                A: ARegister,
                D: DRegister,
            },
        ]);
        console.log("RAM:", RAM.slice(0, 16));
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

        if (!(comp1 in comp)) {
            if (false) {
                console.warn(
                    "hackEmulator: illegal opcode at ",
                    PC,
                    ":",
                    comp1.toString(2)
                );
            }
        } else {
            ALUOut = comp[comp1]();
        }

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

        if (debug) {
            debugCycle(ins);
        }
    };

    const cycleA = function (ins: number) {
        ARegister = ins;
        PC++;
        if (debug) {
            debugCycle(ins);
        }
    };

    const loadROM = function (program: number[]) {
        for (let i = 0; i < program.length; i++) {
            ROM[i] = program[i];
        }
    };

    return {
        RAM,
        cyclesDone,
        updateCanvas,
        cycle,
        loadROM,
        reset,
        clearCanvas,
    };
}

export type HackEmulator = ReturnType<typeof makeHackEmulator>;
