import React from "react";
import "./Ide.css";
// import Editor from "./SimpleCodeEditor";
import Editor, { CursorPos } from "./MonacoEditor";
import {
    CompileResult,
    compile,
    emptyCompileResult,
} from "./../compilers/jackc2";

/*
import {
    CompileResult as CompileResult1,
    compile as compile1,
} from "./../compilers/jackc";
import { useSyncedScroll } from "./useSyncedScroll";
*/

const initialCode = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Average/Main.jack

// (Same as projects/09/Average/Main.jack)

// Inputs some numbers and computes their average
class Main {
    function void main() {
        var Array a; 
        var int length;
        var int i, sum;

        let length = Keyboard.readInt("H"); // ow many numbers? ");
        let a = Array.new(length); // constructs the array
        
        let i = 0;
        while (i < length) {
            let a[i] = Keyboard.readInt("E"); // nter a number: ");
            let sum = sum + a[i];
            let i = i + 1;
        }
        
        do Output.printString("T"); // he average is ");
        do Output.printInt(sum / length);
        return;
    }
}
`;

const Ide: React.FC = () => {
    /*
    const [compileResult1, setCompileResult1] = React.useState<CompileResult1>(
        () => ({ code: "", srcMap: [] })
    );
    const compileResultRef1 = React.useRef<CompileResult1>();

    React.useEffect(() => {
        compileResultRef1.current = compileResult1;
    }, [compileResult1]);
    */

    const [compileResult, setCompileResult] = React.useState<CompileResult>(
        () => emptyCompileResult
    );
    const compileResultRef = React.useRef<CompileResult>();

    React.useEffect(() => {
        compileResultRef.current = compileResult;
    }, [compileResult]);

    /*
    const [cursorPos, setCursorPos] = React.useState<CursorPos>(() => ({
        lineNumber: 0,
        column: 0,
        textPos: 0,
    }));
    */

    const [outputDecorate, setOutputDecorate] = React.useState<{
        start: number;
        end: number;
    }>(() => ({ start: 0, end: 0 }));

    // const { setEditor1Ref, setEditor2Ref } = useSyncedScroll();

    const onChange = (newCode: string) => {
        // setCompileResult1(compile1(newCode));
        setCompileResult(compile(newCode));
    };

    const onCursorPositionChange = (newCursorPos: CursorPos) => {
        // setCursorPos(newCursorPos);
        const compileResult = compileResultRef.current;
        if (compileResult) {
            let tgt: { start: number; end: number } | undefined;
            for (const res of compileResult.srcMap) {
                if (
                    newCursorPos.textPos >= res.src.start &&
                    newCursorPos.textPos < res.src.end
                ) {
                    if (tgt === undefined) {
                        tgt = res.tgt;
                        continue;
                    }
                    if (res.tgt.start < tgt.start) {
                        tgt.start = res.tgt.start;
                    }
                    if (res.tgt.end > tgt.end) {
                        tgt.end = res.tgt.end;
                    }
                }
            }
            if (tgt) setOutputDecorate(tgt);
        }
    };

    return (
        <div className="container">
            <header className="header">JACK to VM compiler</header>
            <div className="content">
                <div className="editor">
                    <Editor
                        onValueChange={onChange}
                        initialValue={initialCode}
                        onCursorPositionChange={onCursorPositionChange}
                    />
                </div>
                <div className="output">
                    <Editor
                        readOnly
                        value={compileResult.code}
                        decorate={outputDecorate}
                        // onEditorMount={setEditor1Ref}
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
