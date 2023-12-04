import React from "react";
import Editor from "./MonacoEditor";
import { compile as compileAsmToHack } from "../compilers/asmc";
import useDecors from "./useDecors";

import "./Ide.css";

const initialSrc = `// This is a comment

@0
D=M
@1
D=D-M
@10
D;JGT
@1
D=M
@12
0;JMP
@0
D=M
@2
M=D
@14
0;JMP
`;

const Ide2: React.FC = () => {
    const {
        targetCode: vmCode,
        setTargetCode: setVmCode,
        srcDecors,
        outputDecors,
        onSrcSelectionChange,
        onOutputSelectionChange,
    } = useDecors();

    const onChange = (newCode: string) => {
        const vmCode = compileAsmToHack(newCode);
        setVmCode(vmCode);
    };

    return (
        <div className="container">
            <header className="header">ASM to HACK compiler</header>
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

export default Ide2;
