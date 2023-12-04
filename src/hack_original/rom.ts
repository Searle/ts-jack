import Default from "./utility/defaults";

export default class ROM {
    private rom: number[];

    constructor() {
        this.rom = this.createRom();
    }

    private createRom(): number[] {
        const rom: number[] = [];

        for (let i = 0; i < Default.ROM_length; i++) {
            rom.push(0b0000000000000000);
        }

        return rom;
    }

    public out(address: number): number {
        if (address > 0b1000000000000000) return 0;

        return this.rom[address];
    }

    public flash(romData: number[]): void {
        for (let i = 0; i < romData.length; i++) {
            this.rom[i] = romData[i];
        }
    }

    public wipe(): void {
        this.rom = this.createRom();
    }

    /*
    public readWord(word: number): number {
        return this.rom[word];
    }

    public printWord(word: number): void {
        console.log(this.readWord(word).toString(2).padStart(16, "0"));
    }
    */
}
