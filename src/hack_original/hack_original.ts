import CPU from "./cpu/cpu";
import Memory from "./memory";
import ROM from "./rom";

export default class HACK_original {
    public rom: ROM;
    public cpu: CPU;
    public ram: Memory;

    private inM: number;
    private instruction: number;
    public reset: boolean;

    private outM: number;
    private writeM: boolean;
    private addressM: number;
    private pc: number;

    constructor() {
        this.rom = new ROM();
        this.cpu = new CPU();
        this.ram = new Memory();

        this.inM = 0;
        this.instruction = 0;
        this.reset = false;

        this.outM = 0;
        this.writeM = false;
        this.addressM = 0;
        this.pc = 0;
    }

    load(program: number[]): void {
        this.rom.flash(program);
    }

    initializeRam(ram: number[]): void {
        this.ram.load(ram);
    }

    cycle(): void {
        this.addressM = this.cpu.registerA;
        this.inM = this.ram.out(0, false, this.addressM);

        const cpuOut = this.cpu.out(this.inM, this.instruction, this.reset);
        if (this.reset) this.reset = false;
        this.outM = cpuOut[1].outM;
        this.writeM = cpuOut[1].writeM;
        this.addressM = cpuOut[1].addressM;
        this.pc = cpuOut[1].pc;

        this.inM = this.ram.out(this.outM, this.writeM, this.addressM);
        this.instruction = this.rom.out(this.pc);
        //console.log(this.instruction);
    }
}
