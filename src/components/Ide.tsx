import React from "react";
import Editor from "./MonacoEditor";
import { compile as compileJackToVm } from "./../compilers/jackc2";
import { compile as compileVmToAsm } from "../compilers/vmc";
import useDecors from "./useDecors";

import classes from "./Ide.module.pcss";
import SimpleRunner from "./SimpleRunner";
import { os } from "../emulators/OS";
import { HackEmulatorComp } from "./HackEmulatorComp";

const clsx = (...classNames: string[]) => classNames.join(" ");

const initialJackCode = `class Main {
    function void main(int length) {
        var int screen;
        let screen = 16384;
        let screen[1000]= 0;
        while (1) {}
    }
}
`;

const initialVmCode = `
sys-init
call Main.main 0
(__END__)
goto __END__
`;

const input: string = "jack";

const Ide: React.FC = () => {
    const {
        targetCode: vmCode,
        setTargetCode: setVmCode,
        srcDecors: jackDecors,
        outputDecors: vmDecors,
        onSrcSelectionChange: onJackSelectionChange,
        onOutputSelectionChange: onVmSelectionChange,
    } = useDecors();

    const { targetCode: asmCode, setTargetCode: setAsmCode } = useDecors();

    const onJackChange = (jackCode: string) => {
        const initJackXX = `\n\nclass Sys {
            function void init() {
                do Main.main();
            }
        }\n`;
        const jackInit = ""; // os();
        const vmCode = compileJackToVm(jackCode + jackInit);
        setVmCode(vmCode);
        const vmInit =
            "sys-init\ncall Main.main 0\nlabel __EOF__\ngoto __EOF__\n";
        const asmCode = compileVmToAsm("Test", vmInit + vmCode.code);
        setAsmCode(asmCode);
    };

    const onVmChange = (newCode: string) => {
        if (input == "vm") {
            // TODO vm-init
            const asmCode = compileVmToAsm("Test", newCode);
            setAsmCode(asmCode);
        }
    };

    return (
        <div className={classes.Ide}>
            <header className={classes.header}>JACK to VM compiler</header>
            <div className={classes.content}>
                {input == "jack" && (
                    <div className={clsx(classes.column, classes.jackCode)}>
                        <Editor
                            onValueChange={onJackChange}
                            initialValue={
                                input == "jack" ? initialJackCode : undefined
                            }
                            decors={jackDecors}
                            onSelectionChange={onJackSelectionChange}
                        />
                    </div>
                )}
                <div className={clsx(classes.column, classes.vmCode)}>
                    <Editor
                        onValueChange={onVmChange}
                        initialValue={
                            input === "vm" ? initialVmCode : undefined
                        }
                        readOnly={input !== "vm"}
                        value={vmCode.code}
                        decors={vmDecors}
                        // onEditorMount={setEditor1Ref}
                        onSelectionChange={onVmSelectionChange}
                    />
                </div>
                <div className={clsx(classes.column, classes.asmCode)}>
                    <HackEmulatorComp asmCode={asmCode.code} />
                    {/*<SimpleRunner asmCode={asmCode.code} />*/}
                    <Editor
                        readOnly
                        value={asmCode.code}
                        // onEditorMount={setEditor2Ref}
                    />
                </div>
            </div>
            <footer className={classes.footer}>Footer</footer>
        </div>
    );
};

export default Ide;
