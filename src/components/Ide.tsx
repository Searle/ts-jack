import React from "react";
import "./Ide.css";
import Editor, { CursorPos, Decors } from "./MonacoEditor";
import {
    CompileResult,
    compile,
    emptyCompileResult,
} from "./../compilers/jackc2";

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
    const [compileResult, setCompileResult] = React.useState<CompileResult>(
        () => emptyCompileResult
    );
    const compileResultRef = React.useRef<CompileResult>();

    React.useEffect(() => {
        compileResultRef.current = compileResult;
    }, [compileResult]);

    const [srcDecors, setSrcDecors] = React.useState<Decors>([]);
    const [outputDecors, setOutputDecors] = React.useState<Decors>([]);

    // const { setEditor1Ref, setEditor2Ref } = useSyncedScroll();

    const onChange = (newCode: string) => {
        // setCompileResult1(compile1(newCode));
        setCompileResult(compile(newCode));
    };

    const makeDecors = (compileResult: CompileResult, srcPos: number) => {
        const nextSrcDecors: Decors = [];
        const nextOutputDecors: Decors = [];
        for (const res of compileResult.srcMap) {
            if (
                res.src.some(
                    (bite) => srcPos >= bite.start && srcPos < bite.end
                )
            ) {
                res.src.forEach((bite) => nextSrcDecors.push(bite));
                nextOutputDecors.push(res.tgt);
            }
        }
        setSrcDecors(nextSrcDecors);
        setOutputDecors(nextOutputDecors);
    };

    const onSrcCursorPositionChange = (newCursorPos: CursorPos) => {
        const compileResult = compileResultRef.current;
        if (compileResult) {
            makeDecors(compileResult, newCursorPos.textPos);
        }
    };

    const onOutputCursorPositionChange = (newCursorPos: CursorPos) => {
        const compileResult = compileResultRef.current;
        if (compileResult) {
            for (const res of compileResult.srcMap) {
                if (
                    newCursorPos.textPos >= res.tgt.start &&
                    newCursorPos.textPos < res.tgt.end
                ) {
                    makeDecors(compileResult, res.src[0].start);
                    break;
                }
            }
        }
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
                        onCursorPositionChange={onSrcCursorPositionChange}
                    />
                </div>
                <div className="output">
                    <Editor
                        readOnly
                        value={compileResult.code}
                        decors={outputDecors}
                        // onEditorMount={setEditor1Ref}
                        onCursorPositionChange={onOutputCursorPositionChange}
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
