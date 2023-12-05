import React from "react";

import classes from "./SimpleRunner.module.pcss";
import { HackEmulator, makeHackEmulator } from "../emulators/hackEmulator";
import { compileToBin } from "../compilers/asmc2";
import { useHackEmulator } from "../emulators/useHackEmulator";

interface SimpleRunnerProps {
    asmCode: string;
}

const SimpleRunner: React.FC<SimpleRunnerProps> = ({ asmCode }) => {
    const [emu, setEmu] = React.useState<HackEmulator | null>(null);

    const onTerminalWrite = React.useCallback((word: number) => {
        console.log("Terminal Write:", word);
        // TODO
    }, []);

    const { setCode, setRunning } = useHackEmulator(undefined, onTerminalWrite);

    const onRunClick = () => {
        // TODO
        setCode(compileToBin(asmCode));
        setRunning(true);
        // TODO: make stoppable
    };

    return (
        <div className={classes.SimpleRunner}>
            <button onClick={onRunClick}>Run !</button>
            <div className={classes.output}>Output</div>
        </div>
    );
};

export default SimpleRunner;
