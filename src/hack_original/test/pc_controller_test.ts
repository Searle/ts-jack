import PC_controller from "../cpu/pc_controller";

export default class PC_controller_test {
    private pcc: PC_controller; // Assuming PC_controller is another class defined elsewhere

    constructor() {
        this.pcc = new PC_controller();
    }

    public test(verbose: boolean): void {
        console.log("***** PC CONTROLLER TEST START ******");

        const opcode = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ];
        const zr = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ].map((value) => value !== 0);
        const ng = [
            0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
            1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
        ].map((value) => value !== 0);
        const j1 = [
            0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
            1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1,
            1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1,
        ].map((value) => value !== 0);
        const j2 = [
            0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
            1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0,
            1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1,
        ].map((value) => value !== 0);
        const j3 = [
            0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
            1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
            0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
        ].map((value) => value !== 0);
        const out = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1,
            1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1,
        ].map((value) => value !== 0);

        const nTests = out.length;

        if (verbose) console.log("*** Functionality Test Start ***");

        let failed = 0;

        for (let i = 0; i < nTests; i++) {
            let outString =
                "PC Controller Test " +
                (i + 1).toString().padStart(2, "0") +
                ": ";

            const currentTestResults = this.pcc.out(
                opcode[i],
                zr[i],
                ng[i],
                j1[i],
                j2[i],
                j3[i]
            );

            if (currentTestResults === out[i]) {
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
            const e = Math.floor(Math.random() * nTests);
            const f = Math.floor(Math.random() * nTests);
            const start = performance.now();
            this.pcc.out(opcode[a], zr[b], ng[c], j1[d], j2[e], j3[f]);
            const end = performance.now();
            timeElapsed += end - start;
        }

        const msPerOperation = timeElapsed / repeat;

        console.log(
            "The PC Controller performance is " +
                msPerOperation +
                "ms/operation."
        );
        if (verbose) console.log("*** Speed Test End ***");

        console.log("***** PC CONTROLLER TEST END ******");
    }
}
