import React from "react";
import Editor from "./MonacoEditor";
import { compile as compileJackToVm } from "./../compilers/jackc2";
import useDecors from "./useDecors";

import "./Ide.css";

const initialSrc = `// This is a comment

class Main {
    function void nothing() {
        // empty
    }

    function void main(int length) {
        var Array a; 
        var int dummy;
        var int i, sum1, sum2;

        do Output.clear();
        let dummy = Output.print("Test");

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

    const onChange = (newCode: string) => {
        const vmCode = compileJackToVm(newCode);
        setVmCode(vmCode);
    };

    return (
        <div className="container">
            <header className="header">JACK to VM compiler</header>
            <div className="content">
                <div className="src">
                    <Editor
                        onValueChange={onChange}
                        initialValue={initialSrc}
                        decors={srcDecors}
                        onSelectionChange={onSrcSelectionChange}
                    />
                </div>
                <div className="output">
                    <Editor
                        readOnly
                        value={vmCode.code}
                        decors={outputDecors}
                        // onEditorMount={setEditor1Ref}
                        onSelectionChange={onOutputSelectionChange}
                    />
                </div>
                {/*
                <div className="output">
                    <Editor
                        readOnly
                        value={compileResult1.code}
                        onEditorMount={setEditor2Ref}
                    />
                </div>
                */}
            </div>
            <footer className="footer">Footer</footer>
        </div>
    );
};

export default Ide;
