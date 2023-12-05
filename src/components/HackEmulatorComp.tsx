import React, { useState, useEffect, useCallback } from "react";
import { useHackEmulator } from "../emulators/useHackEmulator";
import { compile, compileToBin } from "../compilers/asmc2";
import pongAsm from "./pong.asm";

export const HackEmulatorComp: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const [, setIsCanvasReady] = useState(false);

    useEffect(() => {
        if (canvasRef.current) setIsCanvasReady(true);
    }, []);

    const { setDelay, setRunning, setCode, emuReady } = useHackEmulator(
        canvasRef.current
    );

    /*
    useEffect(() => {
        if (canvasRef.current) {
          func(canvasRef.current);
        }
      }, []); // Empty dependency array to run only once after component mounts
    */

    useEffect(() => {
        if (emuReady) {
            console.log("HU");
            const code = compile(`// Adds 1 + ... + 100
@i
M=1 // i=1
@sum
M=0 // sum=0
(LOOP)
@i
D=M // D=i
@100
D=D-A // D=i-100
@END
D;JGT // if (i-100)>0 goto END
@i
D=M // D=i
@sum
M=D+M // sum=sum+i
@i
M=M+1 // i=i+1
@LOOP
0;JMP // goto LOOP
(END)
@END
0;JMP // infinite loop`);
            const code1 = compileToBin(pongAsm);
            setCode(code1);
            setRunning(true);
        }
    }, [emuReady]);

    // const [running, setRunning]= useState(false);
    const [program, setProgram] = useState("");

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={512}
                height={256}
                style={{ border: "1px solid" }}
            ></canvas>
        </div>
    );
};
