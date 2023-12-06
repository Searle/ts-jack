// Derived from https://github.com/diversen/hack-emulator-js/blob/master/test.js
// MIT © Dennis Iversen

import React from "react";
import { makeHackEmulator, HackEmulator } from "./hackEmulator";

// Hack special key codes to ascii
const keys: Record<number, number> = {
    13: 128,
    8: 129,
    37: 130,
    38: 131,
    39: 132,
    40: 133,
    36: 134,
    35: 135,
    33: 136,
    24: 137,
    45: 138,
    46: 139,
    27: 140,
    112: 141,
    113: 142,
    114: 143,
    115: 144,
    116: 145,
    117: 146,
    118: 147,
    119: 148,
    120: 149,
    121: 150,
    122: 151,
    123: 152,
};

export const useHackEmulator = (
    canvas?: HTMLCanvasElement | null,
    onTerminalWrite?: (word: number) => void
) => {
    const [emu, setEmu] = React.useState<HackEmulator | null>(null);

    const [delay, setDelay] = React.useState(2);
    const [running, setRunning] = React.useState(false);

    React.useEffect(() => {
        console.log("HU", canvas, onTerminalWrite);
        if (canvas !== null)
            setEmu(makeHackEmulator({ canvas, onTerminalWrite }));
    }, [canvas, onTerminalWrite]);

    const cyclesPerTick = 10000;

    console.log("RUNNING", running);

    React.useEffect(() => {
        console.log("USEEFFECT");
        if (!running || !emu) return;

        const intervalId = window.setInterval(() => {
            for (let i = 0; i < cyclesPerTick; i++) {
                emu.cycle();

                if (emu.cyclesDone % 100000 == 0) {
                    // TODO callback hack.cyclesDone;
                }
            }
        }, delay);

        const animate = () => {
            emu.updateCanvas();
            animationFrameId = requestAnimationFrame(animate);
        };

        let animationFrameId = requestAnimationFrame(animate);

        const onKeyDown = (e: KeyboardEvent) => {
            let keyCode = e.keyCode;
            if (keyCode in keys) {
                keyCode = keys[keyCode];
            }
            // TODO: Konstante
            emu.RAM[24576] = keyCode;
        };

        const onKeyUp = () => {
            // TODO: Konstante
            emu.RAM[24576] = 0;
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            console.log("TEAR DOWN");
            clearInterval(intervalId);
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("keydown", onKeyDown, true);
            window.removeEventListener("keyup", onKeyUp, true);
        };
    }, [emu, running, delay]);

    const setCode = (hackCode: number[]) => {
        if (!emu) {
            throw "setCode: emu not ready";
        }
        emu.loadROM(hackCode);
    };

    return {
        setDelay,
        setRunning,
        setCode,
        emuReady: emu !== null,
    };
};
