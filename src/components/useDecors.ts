import React from "react";
import type { Decors, Selection } from "./MonacoEditor";
import { CompileResult, emptyCompileResult } from "../compilers/common";

const useDecors = () => {
    const [targetCode, setTargetCode] = React.useState<CompileResult>(
        () => emptyCompileResult
    );
    const targetCodeRef = React.useRef<CompileResult>();

    React.useEffect(() => {
        targetCodeRef.current = targetCode;
    }, [targetCode]);

    const [srcDecors, setSrcDecors] = React.useState<Decors>([]);
    const [outputDecors, setOutputDecors] = React.useState<Decors>([]);

    const makeDecors = (
        compileResult: CompileResult,
        startPos: number,
        endPos: number
    ) => {
        const colors: Record<number, number> = {};
        let colorNo = 0;
        const nextSrcDecors: Decors = [];
        const nextOutputDecors: Decors = [];
        for (const res of compileResult.srcMap) {
            if (
                res.src.some(
                    (bite) => endPos >= bite.start && startPos < bite.end
                )
            ) {
                let color = colors[res.src[0].id];
                if (color === undefined) {
                    color = colors[res.src[0].id] = colorNo++;
                }
                res.src.forEach((bite) => {
                    nextSrcDecors.push({ ...bite, color });
                });
                nextOutputDecors.push({ ...res.tgt, color });
            }
        }
        setSrcDecors(nextSrcDecors);
        setOutputDecors(nextOutputDecors);
    };

    const onSrcSelectionChange = (sel: Selection) => {
        const compileResult = targetCodeRef.current;
        if (compileResult) {
            makeDecors(compileResult, sel.start.textPos, sel.end.textPos);
        }
    };

    const onOutputSelectionChange = (sel: Selection) => {
        const compileResult = targetCodeRef.current;
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

    return {
        targetCode,
        setTargetCode,
        srcDecors,
        outputDecors,
        onSrcSelectionChange,
        onOutputSelectionChange,
    };
};

export default useDecors;
