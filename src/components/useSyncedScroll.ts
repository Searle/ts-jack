import { useEffect, useCallback, useState } from "react";
import type { editor } from "monaco-editor";

type UseSyncedScrollHook = () => {
    setEditor1Ref: (
        editorInstance: editor.IStandaloneCodeEditor | null
    ) => void;
    setEditor2Ref: (
        editorInstance: editor.IStandaloneCodeEditor | null
    ) => void;
};

export const useSyncedScroll: UseSyncedScrollHook = () => {
    const [editor1, setEditor1] = useState<editor.IStandaloneCodeEditor | null>(
        null
    );
    const [editor2, setEditor2] = useState<editor.IStandaloneCodeEditor | null>(
        null
    );

    const setEditor1Ref = useCallback(
        (editorInstance: editor.IStandaloneCodeEditor | null) => {
            setEditor1(editorInstance);
        },
        []
    );

    const setEditor2Ref = useCallback(
        (editorInstance: editor.IStandaloneCodeEditor | null) => {
            setEditor2(editorInstance);
        },
        []
    );

    useEffect(() => {
        if (!editor1 || !editor2) {
            return;
        }

        let isProgrammaticScroll = false;

        const syncScroll = (
            sourceEditor: editor.IStandaloneCodeEditor,
            targetEditor: editor.IStandaloneCodeEditor
        ) => {
            if (isProgrammaticScroll) return;

            isProgrammaticScroll = true;

            targetEditor.setScrollTop(sourceEditor.getScrollTop());
            targetEditor.setScrollLeft(sourceEditor.getScrollLeft());

            setTimeout(() => {
                isProgrammaticScroll = false;
            }, 1);
        };

        const editor1ScrollListener = editor1.onDidScrollChange(() => {
            syncScroll(editor1, editor2);
        });

        const editor2ScrollListener = editor2.onDidScrollChange(() => {
            syncScroll(editor2, editor1);
        });

        return () => {
            editor1ScrollListener.dispose();
            editor2ScrollListener.dispose();
        };
    }, [editor1, editor2]); // Dependency on editor instances

    return { setEditor1Ref, setEditor2Ref };
};
