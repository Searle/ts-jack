import React from "react";
import Editor from "./MonacoEditor";
import { compile as compileJackToVm } from "./../compilers/jackc2";
import { compile as compileVmToAsm } from "../compilers/vmc";
import useDecors from "./useDecors";

import classes from "./Ide.module.pcss";
import SimpleRunner from "./SimpleRunner";
import { os } from "../emulators/OS";
import { HackEmulatorComp } from "./HackEmulatorComp";

const initialSrc = `class Main {
    function void nothing() {
        // empty
    }

    function void main(int length) {
        do Screen.clearScreen();
        do Output.print("HALLO WELT");
/*
        var Array a; 
        var int dummy;
        var int i, sum1, sum2;

        let a = Array.new(length);
        let i = 0;
        let sum1 = 0;
        let sum2 = 0;
        while (i < length) {
            if (i & 1 = 0) {
                let sum1 = sum1 + a[i];
            }
            else {
                let sum2 = sum2 + a[i];
            }
        }
        return sum1 - sum2;
*/
    }
}
`;

const Ide: React.FC = () => {
    const {
        targetCode: vmCode,
        setTargetCode: setVmCode,
        srcDecors,
        outputDecors,
        onSrcSelectionChange,
        onOutputSelectionChange,
    } = useDecors();

    const { targetCode: asmCode, setTargetCode: setAsmCode } = useDecors();

    const onChange = (newCode: string) => {
        const initJackXX = `\n\nclass Sys {
            function void init() {
                do Main.main();
            }
        }\n`;
        const initJack = os();
        const vmCode = compileJackToVm(newCode + initJack);
        setVmCode(vmCode);
        const initCode =
            "sys-init\ncall Sys.init 0\nlabel __EOF__\ngoto __EOF__\n";
        const asmCode = compileVmToAsm("Test", initCode + vmCode.code);
        setAsmCode(asmCode);
    };

    return (
        <div className={classes.Ide}>
            <header className={classes.header}>JACK to VM compiler</header>
            <div className={classes.content}>
                <div className={classes.jack}>
                    <Editor
                        onValueChange={onChange}
                        initialValue={initialSrc}
                        decors={srcDecors}
                        onSelectionChange={onSrcSelectionChange}
                    />
                </div>
                <div className={classes.output}>
                    <Editor
                        readOnly
                        value={vmCode.code}
                        decors={outputDecors}
                        // onEditorMount={setEditor1Ref}
                        onSelectionChange={onOutputSelectionChange}
                    />
                </div>
                <div className={classes.output2}>
                    <HackEmulatorComp asmCode={asmCode.code} />
                    <SimpleRunner asmCode={asmCode.code} />
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
