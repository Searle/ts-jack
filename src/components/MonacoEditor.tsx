import React from "react";

import MonacoEditor, { OnMount, Monaco } from "@monaco-editor/react";
import type { editor, Range } from "monaco-editor";

export type MonacoEditorInstance = editor.IStandaloneCodeEditor;

// import { defineJackLanguage } from "./jackLanguageDef"; // Adjust the path as necessary
import "./MonacoEditor.css";

export type CursorPos = {
    lineNumber: number;
    column: number;
    textPos: number;
};

export type Selection = {
    start: CursorPos;
    end: CursorPos;
};

export type Decors = Array<{
    start: number;
    end: number;
}>;

interface EditorProps {
    onValueChange?: (code: string) => void;
    onSelectionChange?: (pos: Selection) => void;
    onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void;
    readOnly?: boolean;
    initialValue?: string;
    value?: string;
    decors?: Decors;
}

const Editor: React.FC<EditorProps> = ({
    onValueChange,
    onSelectionChange,
    onEditorMount: onEditorMount_,
    readOnly,
    initialValue,
    value,
    decors,
}) => {
    const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = React.useRef<Monaco | null>(null);
    const decorationsRef =
        React.useRef<editor.IEditorDecorationsCollection | null>(null);

    const [editValue] = React.useState(initialValue);

    React.useEffect(() => {
        const decorations = decorationsRef.current;
        if (!decorations) return;

        if (decors === undefined || decors.length === 0) {
            decorations.set([]);
            return;
        }

        const monaco = monacoRef.current;
        if (!monaco) return;

        const editor = editorRef.current;
        if (!editor) return;

        const model = editor.getModel();
        if (!model) return;

        const ds: editor.IModelDeltaDecoration[] = [];

        for (const decor of decors) {
            const pos1 = model.getPositionAt(decor.start);
            const pos2 = model.getPositionAt(decor.end);
            ds.push({
                range: new monaco.Range(
                    pos1.lineNumber,
                    pos1.column,
                    pos2.lineNumber,
                    pos2.column
                ),
                options: {
                    className: "decoration",
                },
            });
        }
        decorations.set(ds);
        editor.revealRange(ds[0].range);
    }, [decors]);

    const onCursorPositionChange_ = (
        event: editor.ICursorPositionChangedEvent
    ) => {
        if (!onSelectionChange) return;

        const editor = editorRef.current;
        if (!editor) return;

        const model = editor.getModel();
        if (!model) return;

        const selection = editor.getSelection();
        if (selection) {
            onSelectionChange({
                start: {
                    column: selection.startColumn,
                    lineNumber: selection.startLineNumber,
                    textPos: model.getOffsetAt({
                        column: selection.startColumn,
                        lineNumber: selection.startLineNumber,
                    }),
                },
                end: {
                    column: selection.endColumn,
                    lineNumber: selection.endLineNumber,
                    textPos: model.getOffsetAt({
                        column: selection.endColumn,
                        lineNumber: selection.endLineNumber,
                    }),
                },
            });
        }
    };

    const initDecoration = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const monaco = monacoRef.current;
        if (!monaco) return;

        // Create a decorations collection
        decorationsRef.current = editor.createDecorationsCollection();
    };

    const onEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        onEditorMount_?.(editor);
        monacoRef.current = monaco;
        editor.onDidChangeCursorPosition(onCursorPositionChange_);
        initDecoration();
    };

    React.useEffect(() => {
        // defineJackLanguage();
        onValueChange?.(editValue ?? "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = (newValue: string | undefined /* , e: any */) => {
        if (newValue !== undefined) {
            onValueChange?.(newValue ?? "");
        }
    };

    return (
        <MonacoEditor
            width="100%"
            height="100%"
            language="java"
            theme="vs-light"
            options={{
                readOnly,
            }}
            value={readOnly ? value : editValue}
            onChange={onChange}
            onMount={onEditorMount}
        />
    );
};

export default Editor;
