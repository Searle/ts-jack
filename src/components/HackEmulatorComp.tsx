import React, { useState, useEffect } from "react";
import { useHackEmulator } from "../emulators/useHackEmulator";
import { compileToBin } from "../compilers/asmc2";

// import pongAsm from "./pong.asm";

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

    const { setDelay, setRunning, setCode, emuReady } = useHackEmulator(
        canvasRef.current
    );

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
        setCode(compileToBin(asmCode));
        setRunning(true);
    };

    const onStopClick = () => {
        setRunning(false);
    };

    return (
        <div>
            <button onClick={onStartClick}>Start</button>
            <button onClick={onStopClick}>Stop</button>
            <canvas
                ref={canvasRef}
                width={512}
                height={256}
                style={{ border: "1px solid" }}
            ></canvas>
        </div>
    );
};
