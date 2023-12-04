import Instruction from "../utility/instruction";

export default class Instruction_test {
    constructor() {}

    public test(verbose: boolean): void {
        console.log("***** INSTRUCTIONS TEST START ******");

        // FUNCTIONALITY TEST
        const instruction = [
            0b0000000000000000, 0b0000000000000001, 0b0000000000000110,
            0b0111111111111111, 0b1111000000000000, 0b1111010010000000,
            0b1110101101001001, 0b1110111111010010, 0b1110000000011011,
            0b1111001000100100, 0b1110111010101101, 0b1110100101110110,
            0b1110000111111111, 0b1111010111100101, 0b1110001001100011,
            0b1111111111111111, 0b1010101000100111, 0b1101010001011001,
            0b1001001010111111,
        ];
        const isA = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const isC = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0];
        const opcode = [
            0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ];
        const address = [
            0, 1, 6, 32767, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1,
        ];
        const comp = [
            0b0000000, 0b0000000, 0b0000000, 0b1111111, 0b1000000, 0b1010010,
            0b0101101, 0b0111111, 0b0000000, 0b1001000, 0b0111010, 0b0100101,
            0b0000111, 0b1010111, 0b0001001, 0b1111111, 0b0101000, 0b1010001,
            0b1001010,
        ];
        const a = [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1];
        const c1 = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0];
        const c2 = [0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
        const c3 = [0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1];
        const c4 = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0];
        const c5 = [0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1];
        const c6 = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0];
        const dest = [
            0b000, 0b000, 0b000, 0b111, 0b000, 0b000, 0b001, 0b010, 0b011,
            0b100, 0b101, 0b110, 0b111, 0b100, 0b100, 0b111, 0b100, 0b011,
            0b111,
        ];
        const d1 = [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1];
        const d2 = [0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1];
        const d3 = [0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1];
        const jump = [
            0b000, 0b001, 0b110, 0b111, 0b000, 0b000, 0b001, 0b010, 0b011,
            0b100, 0b101, 0b110, 0b111, 0b101, 0b011, 0b111, 0b111, 0b001,
            0b111,
        ];
        const j1 = [0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1];
        const j2 = [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1];
        const j3 = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1];

        const nTests = instruction.length;

        if (verbose) console.log("*** Functionality Test Start ***");

        let failed = 0;

        for (let i = 0; i < nTests; i++) {
            let outString =
                "Instructions Test " +
                (i + 1).toString().padStart(2, "0") +
                ": ";
            const inst = new Instruction(instruction[i]);
            const currentTestResults = inst.all();

            if (i > 15) {
                inst.error == "error"
                    ? (outString += "Passed")
                    : (outString += "Failed");
            } else {
                if (
                    currentTestResults[0] == j3[i] &&
                    currentTestResults[1] == j2[i] &&
                    currentTestResults[2] == j1[i] &&
                    currentTestResults[3] == d3[i] &&
                    currentTestResults[4] == d2[i] &&
                    currentTestResults[5] == d1[i] &&
                    currentTestResults[6] == c6[i] &&
                    currentTestResults[7] == c5[i] &&
                    currentTestResults[8] == c4[i] &&
                    currentTestResults[9] == c3[i] &&
                    currentTestResults[10] == c2[i] &&
                    currentTestResults[11] == c1[i] &&
                    currentTestResults[12] == a[i] &&
                    currentTestResults[13] == isC[i] &&
                    currentTestResults[14] == isA[i] &&
                    currentTestResults[15] == opcode[i] &&
                    currentTestResults[16] == jump[i] &&
                    currentTestResults[17] == dest[i] &&
                    currentTestResults[18] == comp[i] &&
                    currentTestResults[19] == address[i]
                ) {
                    outString += "Passed";
                } else {
                    outString += "Failed";
                    failed++;
                }
            }

            // To test only one output
            // if (i>15) {
            //
            //   currentTestResults[0] == j3[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[1] == j2[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[2] == j1[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[3] == d3[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[4] == d2[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[5] == d1[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[6] == c6[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[7] == c5[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[8] == c4[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[9] == c3[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[10] == c2[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[11] == c1[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[12] == a[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[13] == isC[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[14] == isA[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[15] == opcode[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[16] == jump[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[17] == dest[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[18] == comp[i] ? console.log('ok') : console.log('fail')
            //   currentTestResults[19] == address[i] ? console.log('ok') : console.log('fail')
            //
            //   console.log('instruction=' + instruction[i].toString(2).padStart(16, '0'))
            //   console.log('j3     : obtained ' + currentTestResults[0] +' <=> '+ j3[i] + ' expected')
            //   console.log('j2     : obtained ' + currentTestResults[1] +' <=> '+ j2[i] + ' expected')
            //   console.log('j1     : obtained ' + currentTestResults[2] +' <=> '+ j1[i] + ' expected')
            //   console.log('d3     : obtained ' + currentTestResults[3] +' <=> '+ d3[i] + ' expected')
            //   console.log('d2     : obtained ' + currentTestResults[4] +' <=> '+ d2[i] + ' expected')
            //   console.log('d1     : obtained ' + currentTestResults[5] +' <=> '+ d1[i] + ' expected')
            //   console.log('c6     : obtained ' + currentTestResults[6] +' <=> '+ c6[i] + ' expected')
            //   console.log('c5     : obtained ' + currentTestResults[7] +' <=> '+ c5[i] + ' expected')
            //   console.log('c4     : obtained ' + currentTestResults[8] +' <=> '+ c4[i] + ' expected')
            //   console.log('c3     : obtained ' + currentTestResults[9] +' <=> '+ c3[i] + ' expected')
            //   console.log('c2     : obtained ' + currentTestResults[10] +' <=> '+ c2[i] + ' expected')
            //   console.log('c1     : obtained ' + currentTestResults[11] +' <=> '+ c1[i] + ' expected')
            //   console.log('a      : obtained ' + currentTestResults[12] +' <=> '+ a[i] + ' expected')
            //   console.log('isC    : obtained ' + currentTestResults[13] +' <=> '+ isC[i] + ' expected')
            //   console.log('isA    : obtained ' + currentTestResults[14] +' <=> '+ isA[i] + ' expected')
            //   console.log('opcode : obtained ' + currentTestResults[15] +' <=> '+ opcode[i] + ' expected')
            //   console.log('jump   : obtained ' + currentTestResults[16] +' <=> '+ jump[i] + ' expected')
            //   console.log('dest   : obtained ' + currentTestResults[17] +' <=> '+ dest[i] + ' expected')
            //   console.log('comp   : obtained ' + currentTestResults[18] +' <=> '+ comp[i] + ' expected')
            //   console.log('address: obtained ' + currentTestResults[19] +' <=> '+ address[i] + ' expected')
            // }

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
            const start = performance.now();
            const inst = new Instruction(instruction[a]);
            inst.all();
            const end = performance.now();
            timeElapsed += end - start;
        }

        const msPerOperation = timeElapsed / repeat;

        console.log(
            "The Instructions performance is " +
                msPerOperation +
                "ms/operation."
        );
        if (verbose) console.log("*** Speed Test End ***");

        console.log("***** INSTRUCTIONS TEST END ******");
    }
}
