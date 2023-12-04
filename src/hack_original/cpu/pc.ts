export default class PC {
    // The pc property is a number.
    private pc: number;

    constructor() {
        this.pc = 0;
    }

    // The types for the parameters inn, reset, load, and inc are specified as numbers.
    // The function returns an array of numbers.
    out(inn: number, reset: boolean, load: boolean, inc: boolean): number[] {
        const oldOut = this.pc;

        if (reset) {
            this.pc = 0;
            // console.log('[PC] Reset');
        } else if (load) {
            this.pc = inn;
            // console.log('[PC] Load');
        } else if (inc) {
            this.pc++;
            // console.log('[PC] Increment');
        }

        const newOut = this.pc;

        return [oldOut, newOut];
    }
}
