import fs from "fs";
import { compile } from "./asmc2";

const code = fs.readFileSync("src/examples/asm-hack/pong/Pong.asm", "utf8");
fs.writeFileSync("./pong.asmc2.hack", compile(code));
