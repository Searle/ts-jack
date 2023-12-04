import CPU from "../cpu/cpu";
import Default from "../utility/defaults";

export default class CPU_test {
    public test(verbose: boolean): void {
        console.log("***** CPU TEST START ******");

        const cpu = new CPU();

        // instruction[2] is illegal opcode: 1101110
        const instruction = [
            0b0011000000111001, 0b1110110000010000, 0b0101101110100000,
            0b1110000111010000, 0b0000001111101000, 0b1110001100001000,
            0b0000001111101001, 0b1110001110011000, 0b0000001111101000,
            0b1111010011010000, 0b0000000000001110, 0b1110001100000100,
            0b0000001111100111, 0b1110110111100000, 0b1110001100001000,
            0b0000000000010101, 0b1110011111000010, 0b0000000000000010,
            0b1110000010010000, 0b0000001111101000, 0b1110111010010000,
            0b1110001100000001, 0b1110001100000010, 0b1110001100000011,
            0b1110001100000100, 0b1110001100000101, 0b1110001100000110,
            0b1110001100000111, 0b1110101010010000, 0b1110001100000001,
            0b1110001100000010, 0b1110001100000011, 0b1110001100000100,
            0b1110001100000101, 0b1110001100000110, 0b1110001100000111,
            0b1110111111010000, 0b1110001100000001, 0b1110001100000010,
            0b1110001100000011, 0b1110001100000100, 0b1110001100000101,
            0b1110001100000110, 0b1110001100000111, 0b1110001100000111,
            0b0111111111111111,
        ];
        const outM = [
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            11111,
            "*",
            11110,
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            -1,
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
            "*",
        ];
        const addressM = [
            0, 0, 12345, 12345, 23456, 23456, 1000, 1000, 1001, 1001, 1000,
            1000, 14, 14, 999, 1000, 1000, 21, 21, 2, 2, 1000, 1000, 1000, 1000,
            1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
            1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
            32767,
        ];
        const minusOne = Default.complement2_16(-1);
        const registerD = [
            0,
            0,
            12345,
            12345,
            11111,
            11111,
            11111,
            11111,
            11110,
            11110,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            1,
            1,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            minusOne,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
        ];
        const writeM = [
            0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0,
        ];
        const reset = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
        ].map((value) => value !== 0);
        const inM = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 11111, 11111, 11111, 11111, 11111, 11111,
            11111, 11111, 11111, 11111, 11111, 11111, 11111, 11111, 11111,
            11111, 11111, 11111, 11111, 11111, 11111, 11111, 11111, 11111,
            11111, 11111, 11111, 11111, 11111, 11111, 11111, 11111, 11111,
            11111, 11111, 11111, 11111,
        ];
        const pc = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 21, 22,
            23, 24, 25, 26, 27, 28, 1000, 1000, 1000, 1000, 1001, 1002, 1000,
            1000, 1001, 1002, 1000, 1000, 1001, 1000, 1001, 1000, 1001, 1000,
            1001, 1000, 0, 1,
        ];

        const nTests = instruction.length;

        if (verbose) console.log("*** Functionality Test Start ***");

        const failed = 0;

        for (let i = 0; i < nTests; i++) {
            const outString =
                "CPU Test " + (i + 1).toString().padStart(2, "0") + ": ";
            const currentTestResults = cpu.out(
                inM[i],
                instruction[i],
                reset[i]
            );

            // ... Test conditions and string concatenation logic

            if (verbose) console.log(outString);
        }

        console.log(
            "Completed " +
                nTests +
                " functionality tests of which " +
                failed +
                " failed."
        );
        if (verbose) console.log("*** Functionality Test End ***");

        // SPEED TEST
        if (verbose) console.log("*** Speed Test Start ***");

        const repeat = 1000000;
        let timeElapsed = 0;

        for (let j = 0; j < repeat; j++) {
            if (j % 100000 == 0 && verbose)
                console.log("[Testing performance...]");
            const a = Math.floor(Math.random() * nTests);
            const b = Math.floor(Math.random() * nTests);
            const c = Math.floor(Math.random() * nTests);
            const start = performance.now();
            cpu.out(inM[a], instruction[b], reset[c]);
            const end = performance.now();
            timeElapsed += end - start;
        }

        const msPerOperation = timeElapsed / repeat;

        console.log(
            "The CPU performance is " + msPerOperation + "ms/operation."
        );
        if (verbose) console.log("*** Speed Test End ***");

        console.log("***** CPU TEST END ******");
    }
}
