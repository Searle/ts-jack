export default class Instruction {
    private instruction: number;
    public isA: number;
    public isC: number;
    public error: string | undefined;
    public address: number;
    public comp: number;
    public dest: number;
    public jump: number;
    public opcode: number;
    public a: boolean;
    public c1: boolean;
    public c2: boolean;
    public c3: boolean;
    public c4: boolean;
    public c5: boolean;
    public c6: boolean;
    public d1: boolean;
    public d2: boolean;
    public d3: boolean;
    public j1: boolean;
    public j2: boolean;
    public j3: boolean;

    constructor(instruction: number) {
        this.instruction = instruction;
        this.isA = this.is_a() ? 1 : 0;
        this.isC = this.is_c() ? 1 : 0;
        if (!this.isA && !this.isC) this.error = "error";

        this.address = this.a_address();
        this.comp = this.c_comp();
        this.dest = this.c_dest();
        this.jump = this.c_jump();

        this.opcode = this.inst_opcode() ? 1 : 0;
        this.a = this.c_a();
        this.c1 = this.c_c1();
        this.c2 = this.c_c2();
        this.c3 = this.c_c3();
        this.c4 = this.c_c4();
        this.c5 = this.c_c5();
        this.c6 = this.c_c6();
        this.d1 = this.c_d1();
        this.d2 = this.c_d2();
        this.d3 = this.c_d3();
        this.j1 = this.c_j1();
        this.j2 = this.c_j2();
        this.j3 = this.c_j3();
    }

    private is_a(): boolean {
        return this.instruction < 0b1000000000000000;
    }

    private is_c(): boolean {
        return this.instruction >= 0b1110000000000000;
    }

    private a_address(): number {
        if (this.is_a()) return this.instruction;
        else return -1;
    }

    private c_comp(): number {
        const mask = 0b1111111 << 6;
        return (this.instruction & mask) >> 6;
    }

    private c_dest(): number {
        const mask = 0b111 << 3;
        return (this.instruction & mask) >> 3;
    }

    private c_jump(): number {
        const mask = 0b111;
        return this.instruction & mask;
    }

    private inst_opcode(): boolean {
        return this.instruction >= 0b1000000000000000;
    }

    private c_a(): boolean {
        return this.read_bit(6, this.c_comp());
    }

    private c_c1(): boolean {
        return this.read_bit(5, this.c_comp());
    }

    private c_c2(): boolean {
        return this.read_bit(4, this.c_comp());
    }

    private c_c3(): boolean {
        return this.read_bit(3, this.c_comp());
    }

    private c_c4(): boolean {
        return this.read_bit(2, this.c_comp());
    }

    private c_c5(): boolean {
        return this.read_bit(1, this.c_comp());
    }

    private c_c6(): boolean {
        return this.read_bit(0, this.c_comp());
    }

    private c_d1(): boolean {
        return this.read_bit(2, this.c_dest());
    }

    private c_d2(): boolean {
        return this.read_bit(1, this.c_dest());
    }

    private c_d3(): boolean {
        return this.read_bit(0, this.c_dest());
    }

    private c_j1(): boolean {
        return this.read_bit(2, this.c_jump());
    }

    private c_j2(): boolean {
        return this.read_bit(1, this.c_jump());
    }

    private c_j3(): boolean {
        return this.read_bit(0, this.c_jump());
    }

    public all(): (number | boolean)[] {
        return [
            this.j3,
            this.j2,
            this.j1,
            this.d3,
            this.d2,
            this.d1,
            this.c6,
            this.c5,
            this.c4,
            this.c3,
            this.c2,
            this.c1,
            this.a,
            this.isC,
            this.isA,
            this.opcode,
            this.jump,
            this.dest,
            this.comp,
            this.address,
        ];
    }

    private read_bit(index: number, source: number): boolean {
        const mask = 0b1 << index;
        return (source & mask) !== 0;
    }
}
