import Instruction from "../utility/instruction";
import ALU from "./alu";
import PC from "./pc";
import PC_controller from "./pc_controller";

type CPU_State = {
    outM: number;
    writeM: boolean;
    addressM: number;
    pc: number;
    registerD: number;
};

export default class CPU {
    private alu: ALU; // Assuming ALU is another class defined elsewhere
    private PC: PC; // Assuming PC is another class defined elsewhere
    private PCc: PC_controller; // Assuming PC_controller is another class defined elsewhere

    private registerD: number;
    public registerA: number;

    public outM: number;
    public writeM: boolean;
    public addressM: number;
    public pc: number;

    private inA: number;
    private loadA: boolean;
    private loadD: boolean;
    private x: number;
    private y: number;
    private outAlu: number;
    private zr: boolean;
    private ng: boolean;
    private jump: number;

    constructor() {
        this.alu = new ALU();
        this.PC = new PC();
        this.PCc = new PC_controller();

        this.registerD = 0;
        this.registerA = 0;

        this.outM = 0;
        this.writeM = false;
        this.addressM = 0;
        this.pc = 0;

        this.inA = 0;
        this.loadA = false;
        this.loadD = false;
        this.x = 0;
        this.y = 0;
        this.outAlu = 0;
        this.zr = false;
        this.ng = false;
        this.jump = 0;
    }

    public wipe(): void {
        this.constructor();
    }

    public out(
        inM: number,
        instruction: number,
        reset: boolean,
        debug?: boolean
    ): [oldState: CPU_State, newState: CPU_State] {
        const oldState: CPU_State = {
            outM: this.outM,
            writeM: this.writeM,
            addressM: this.addressM,
            pc: this.pc,
            registerD: this.registerD,
        };

        const inst = new Instruction(instruction);
        const dummy = 0;

        this.addressM = this.registerA;

        this.x = this.registerD;
        this.y = inst.a ? inM : this.addressM;

        const onlyC = inst.a ? inst.comp - (1 << 6) : inst.comp;
        const outALU = this.alu.out(this.x, this.y, onlyC);
        this.outAlu = outALU[0];
        this.zr = outALU[1];
        this.ng = outALU[2];
        this.outM = inst.d3 ? this.outAlu : 0;

        this.writeM = inst.opcode ? inst.d3 : false;

        const load = this.PCc.out(
            inst.opcode,
            this.zr,
            this.ng,
            inst.j1,
            inst.j2,
            inst.j3
        );
        const outPC = this.PC.out(this.addressM, reset, load, !load);
        this.pc = outPC[1];

        this.inA = inst.opcode ? this.outAlu : instruction;
        this.loadA = inst.d1 || !inst.opcode;
        this.registerA = this.loadA ? this.inA : this.registerA;

        this.x = this.registerD;
        this.loadD = inst.opcode ? inst.d2 : false;
        this.registerD = this.loadD ? this.outAlu : this.registerD;

        const newState: CPU_State = {
            outM: this.outM,
            writeM: this.writeM,
            addressM: this.addressM,
            pc: this.pc,
            registerD: this.registerD,
        };

        if (debug) {
            console.log("---------CPU-IN----------");
            console.log("x = " + this.x.toString(2));
            console.log("y = " + this.y.toString(2));
            console.log("comp = " + onlyC.toString(2));
            console.log("---------CPU-OUT----------");
            console.log("out = " + this.outAlu.toString(2));
            console.log("zr = " + this.zr.toString());
            console.log("ng = " + this.ng.toString());
            console.log("---------CPU-END----------");
        }

        return [oldState, newState];
    }
}
