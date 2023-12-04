import Default from "../utility/defaults";

export default class ALU {
    // TypeScript allows specifying the types of parameters and the return type of the function.
    // In this case, x and y are numbers, comp is a number (which seems to represent a binary value), and debug is a boolean.
    // The function returns an array of numbers.
    out(
        x: number,
        y: number,
        comp: number,
        debug?: boolean
    ): [out: number, zr: boolean, ng: boolean] {
        let out = 0;
        let zr = false;
        let ng = false;

        // The switch statement remains the same, handling the various cases for the ALU functions.
        switch (comp) {
            case 0b101010:
                break;
            case 0b111111:
                out = 1;
                break;
            case 0b111010:
                out = -1;
                break;
            case 0b001100:
                out = x;
                break;
            case 0b110000:
                out = y;
                break;
            case 0b001101:
                out = 0b1111111111111111 - x;
                break;
            case 0b110001:
                out = 0b1111111111111111 - y;
                break;
            case 0b001111:
                out = -x;
                break;
            case 0b110011:
                out = -y;
                break;
            case 0b011111:
                out = x + 1;
                break;
            case 0b110111:
                out = y + 1;
                break;
            case 0b001110:
                out = x - 1;
                break;
            case 0b110010:
                out = y - 1;
                break;
            case 0b000010:
                out = x + y;
                break;
            case 0b010011:
                out = x - y;
                break;
            case 0b000111:
                out = y - x;
                break;
            case 0b000000:
                out = x & y;
                break;
            case 0b010101:
                out = x | y;
                break;
            default:
                console.log("ALU illegal comp", comp.toString(2));
        }

        // Assuming the 'Default' class and its method 'complement2_16' are defined elsewhere in your TypeScript code.
        // You would also need to ensure these are properly typed in TypeScript.
        if (out < 0) out = Default.complement2_16(out);
        out = out & 0b1111111111111111;
        if (out === 0) zr = true;
        if (out > 0b1000000000000000) ng = true;

        if (debug) {
            console.log("---------ALU-IN----------");
            console.log("x = " + x.toString(2));
            console.log("y = " + y.toString(2));
            console.log("comp = " + comp.toString(2));
            console.log("---------ALU-OUT----------");
            console.log("out = " + out.toString(2));
            console.log("zr = " + zr.toString());
            console.log("ng = " + ng.toString());
            console.log("---------ALU-END----------");
        }

        return [out, zr, ng];
    }
}

// Note: The Default class and the complement2_16 method must be defined elsewhere in your TypeScript code.
