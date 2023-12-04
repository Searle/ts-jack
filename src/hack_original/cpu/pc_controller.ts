export default class PC_controller {
    // Encapsulates the logic to calculate whether to send the jump signal to PC.
    // Parameters opcode, zr, ng, j1, j2, j3 are all numbers (likely representing binary values).
    // The function returns a number.
    out(
        opcode: number,
        zr: boolean,
        ng: boolean,
        j1: boolean,
        j2: boolean,
        j3: boolean
    ): boolean {
        const jmp = j1 && j2 && j3;
        const jg = j3 && !zr && !ng;
        const jl = j1 && !zr && ng;
        const jeq = j2 && zr && !ng;
        const j = jmp || jg || jl || jeq;

        return opcode ? j : false;
    }
}
