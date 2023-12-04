import Default from "./utility/defaults";

export default class Memory {
    private memory: number[];

    constructor() {
        this.memory = this.createMemory();
    }

    private createMemory(): number[] {
        const memory: number[] = [];

        // Create RAM
        for (let i = 0; i < Default.RAM_length; i++) {
            memory.push(0b0000000000000000);
        }

        // Create Screen Memory Map
        for (let i = 0; i < Default.SCREEN_length; i++) {
            memory.push(0b0000000000000000);
        }

        // Create KBD registry
        memory.push(0b0000000000000000);

        return memory;
    }

    public out(inn: number, load: boolean, address: number): number {
        if (address > 0b110000000000000) return 0;

        const out = this.memory[address];

        if (load) this.memory[address] = inn;

        return out;
    }

    public wipe(): void {
        this.memory = this.createMemory();
    }

    public writeWord(word: number, value: number): void {
        this.memory[word] = value;
    }

    public load(initialRam: number[]): void {
        for (let i = 0; i < initialRam.length; i++) {
            this.memory[i] = initialRam[i];
        }
    }

    public readKBD(): number {
        return this.memory[Default.KBD_address];
    }

    public writeKBD(scancode: number): void {
        this.memory[Default.KBD_address] = scancode;
    }

    public readPixel(x: number, y: number): number {
        if (x > 511 || y > 255) return 0;

        const word =
            Default.SCREEN_address + Math.floor((y * Default.width + x) / 16);
        const offset = x % 16;

        const mask = 0b1 << offset;

        return (this.memory[word] & mask) >> offset;
    }
}
