import React, { useState, useEffect } from "react";
import { useHackEmulator } from "../emulators/useHackEmulator";
import { compileToBin } from "../compilers/asmc2";

import pongAsm from "./pong.asm";

interface HackEmulatorCompProps {
    asmCode: string;
}

export const HackEmulatorComp: React.FC<HackEmulatorCompProps> = ({
    asmCode,
}) => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const [, setIsCanvasReady] = useState(false);

    useEffect(() => {
        if (canvasRef.current) setIsCanvasReady(true);
    }, []);

    const { setDelay, setRunning, setCode, emuReady, running, reset } =
        useHackEmulator(canvasRef.current);

    /*
    useEffect(() => {
        if (canvasRef.current) {
          func(canvasRef.current);
        }
      }, []); // Empty dependency array to run only once after component mounts

    useEffect(() => {
        if (emuReady) {
            const { setCode, setRunning } = useHackEmulator({
                canvas: canvasRef.current,
            });
        }
    }, [emuReady]);
*/

    const onStartClick = () => {
        reset();
        setCode(compileToBin(asmCode));
        setRunning(true);
    };

    const onStopClick = () => {
        setRunning(false);
    };

    return (
        <div style={{ margin: "0 10px" }}>
            <div style={{ margin: "5px 0" }}>
                <button disabled={running} onClick={onStartClick}>
                    Start
                </button>
                &nbsp;
                <button disabled={!running} onClick={onStopClick}>
                    Stop
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={512}
                height={256}
                style={{
                    margin: "5px 0",
                    width: "calc(100% - 2px)",
                    border: "1px solid",
                }}
            ></canvas>
        </div>
    );
};
