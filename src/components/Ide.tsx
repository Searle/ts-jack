import React from "react";
import "./Ide.css";
import Editor, { CursorPos, Decors, Selection } from "./MonacoEditor";
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

    const makeDecors = (
        compileResult: CompileResult,
        startPos: number,
        endPos: number
    ) => {
        const nextSrcDecors: Decors = [];
        const nextOutputDecors: Decors = [];
        for (const res of compileResult.srcMap) {
            if (
                res.src.some(
                    (bite) => endPos >= bite.start && startPos < bite.end
                )
            ) {
                res.src.forEach((bite) => nextSrcDecors.push(bite));
                nextOutputDecors.push(res.tgt);
            }
        }
        setSrcDecors(nextSrcDecors);
        setOutputDecors(nextOutputDecors);
    };

    const onSrcSelectionChange = (sel: Selection) => {
        const compileResult = compileResultRef.current;
        if (compileResult) {
            makeDecors(compileResult, sel.start.textPos, sel.end.textPos);
        }
    };

    const onOutputSelectionChange = (sel: Selection) => {
        const compileResult = compileResultRef.current;
        if (compileResult) {
            let startPos = -1;
            let endPos = -1;
            for (const res of compileResult.srcMap) {
                if (
                    sel.start.textPos <= res.tgt.start &&
                    sel.end.textPos >= res.tgt.end &&
                    res.src.length > 0
                ) {
                    if (startPos < 0) {
                        startPos = res.src[0].start;
                        endPos = res.src[0].end;
                        continue;
                    }
                    if (startPos > res.src[0].start) {
                        startPos = res.src[0].start;
                    }
                    if (endPos < res.src[0].end) {
                        endPos = res.src[0].end;
                    }
                }
            }
            if (startPos >= 0) {
                makeDecors(compileResult, startPos, endPos);
                return;
            }
            setSrcDecors([]);
            setOutputDecors([]);
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
                        onSelectionChange={onSrcSelectionChange}
                    />
                </div>
                <div className="output">
                    <Editor
                        readOnly
                        value={compileResult.code}
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
