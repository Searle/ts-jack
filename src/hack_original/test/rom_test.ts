import ROM from "../rom";
import Default from "../utility/defaults";

export default class ROM_test {
    public test(verbose: boolean): void {
        console.log("***** ROM TEST START ******");

        const rom = new ROM();

        const programElement = document.getElementById(
            "program"
        ) as HTMLInputElement;
        if (!programElement) {
            console.log('No "program" element found in the DOM.');
            return;
        }

        const programString = programElement.value;
        const program = Default.stringProgramToBin(programString);
        rom.flash(program);

        const nTests = program.length;

        if (nTests === 0) {
            console.log("No ROM was present. Write ROM in the box.");
            console.log("***** ROM TEST ABORTED *****");
            return;
        }

        if (verbose) console.log("*** Functionality Test Start ***");

        let failed = 0;

        for (let i = 0; i < nTests; i++) {
            let outString =
                "ROM Test " + (i + 1).toString().padStart(2, "0") + ": ";

            const currentTestResults = rom.out(i);

            if (currentTestResults === program[i]) {
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
            const start = performance.now();
            rom.out(a);
            const end = performance.now();
            timeElapsed += end - start;
        }

        const msPerOperation = timeElapsed / repeat;

        console.log(
            "The ROM performance is " + msPerOperation + "ms/operation."
        );
        if (verbose) console.log("*** Speed Test End ***");

        console.log("***** ROM TEST END ******");
    }
}
