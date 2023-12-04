import PC from "../cpu/pc";
import Default from "../utility/defaults";

export default class PC_test {
    public test(verbose: boolean): void {
        console.log("***** PC TEST START ******");

        const negVal = Default.complement2_16(-32123);

        // FUNCTIONALITY TEST
        const pc = new PC();
        const inn = [
            0b0000000000000000,
            0b0000000000000000,
            negVal,
            negVal,
            negVal,
            negVal,
            0b0011000000111001,
            0b0011000000111001,
            0b0011000000111001,
            0b0011000000111001,
            0b0011000000111001,
            0b0011000000111001,
            0b0000000000000000,
            0b0000000000000000,
            0b0101011011001110,
        ];
        const out = [
            0b0000000000000000,
            0b0000000000000000,
            0b0000000000000001,
            0b0000000000000010,
            negVal,
            negVal + 1,
            negVal + 2,
            0b0011000000111001,
            0b0000000000000000,
            0b0011000000111001,
            0b0000000000000000,
            0b0000000000000001,
            0b0000000000000000,
            0b0000000000000000,
            0b0000000000000001,
            0b0000000000000000,
        ];
        const reset = [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1].map(
            (value) => value !== 0
        );
        const load = [0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0].map(
            (value) => value !== 0
        );
        const inc = [0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0].map(
            (value) => value !== 0
        );
        const nTests = inn.length;

        if (verbose) console.log("*** Functionality Test Start ***");

        let failed = 0;

        for (let i = 0; i < nTests; i++) {
            let outString =
                "PC Test " + (i + 1).toString().padStart(2, "0") + ": ";

            const currentTestResults = pc.out(
                inn[i],
                reset[i],
                load[i],
                inc[i]
            );

            if (
                currentTestResults[0] === out[i] &&
                currentTestResults[1] === out[i + 1]
            ) {
                outString += "Passed";
            } else {
                outString += "Failed";
                failed++;
            }

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
            if (j % 100000 === 0 && verbose)
                console.log("[Testing performance...]");
            const a = Math.floor(Math.random() * nTests);
            const b = Math.floor(Math.random() * nTests);
            const c = Math.floor(Math.random() * nTests);
            const d = Math.floor(Math.random() * nTests);
            const start = performance.now();
            pc.out(inn[a], reset[b], load[c], inc[d]);
            const end = performance.now();
            timeElapsed += end - start;
        }

        const msPerOperation = timeElapsed / repeat;

        console.log(
            "The PC performance is " + msPerOperation + "ms/operation."
        );
        if (verbose) console.log("*** Speed Test End ***");

        console.log("***** PC TEST END ******");
    }
}
