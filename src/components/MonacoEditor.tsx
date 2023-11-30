import React from "react";

import MonacoEditor, { OnMount, Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

export type MonacoEditorInstance = editor.IStandaloneCodeEditor;

// import { defineJackLanguage } from "./jackLanguageDef"; // Adjust the path as necessary
import "./MonacoEditor.css";

export type CursorPos = {
    lineNumber: number;
    column: number;
    textPos: number;
};

interface EditorProps {
    onValueChange?: (code: string) => void;
    onCursorPositionChange?: (pos: CursorPos) => void;
    onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void;
    readOnly?: boolean;
    initialValue?: string;
    value?: string;
    decorate?: { start: number; end: number };
}

const Editor: React.FC<EditorProps> = ({
    onValueChange,
    onCursorPositionChange,
    onEditorMount: onEditorMount_,
    readOnly,
    initialValue,
    value,
    decorate,
}) => {
    const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = React.useRef<Monaco | null>(null);
    const decorationsRef =
        React.useRef<editor.IEditorDecorationsCollection | null>(null);

    const [editValue] = React.useState(initialValue);

    React.useEffect(() => {
        if (decorate === undefined || decorate.start < 0 || decorate.end < 0) {
            return;
        }

        const decorations = decorationsRef.current;
        if (!decorations) return;

        const monaco = monacoRef.current;
        if (!monaco) return;

        const editor = editorRef.current;
        if (!editor) return;

        const model = editor.getModel();
        if (!model) return;

        const pos1 = model.getPositionAt(decorate.start);
        const pos2 = model.getPositionAt(decorate.end);

        // Define a decoration
        const decoration: editor.IModelDeltaDecoration = {
            range: new monaco.Range(
                pos1.lineNumber,
                pos1.column,
                pos2.lineNumber,
                pos2.column
            ),
            options: {
                className: "myCustomDecoration",
            },
        };

        decorations.set([decoration]);
        editor.revealRange(decoration.range);
    }, [decorate]);

    const onCursorPositionChange_ = (
        event: editor.ICursorPositionChangedEvent
    ) => {
        if (!onCursorPositionChange) return;

        const editor = editorRef.current;
        if (!editor) return;

        const model = editor.getModel();
        if (!model) return;

        const position = event.position;
        console.log("EVT", event.position, model.getOffsetAt(position));
        onCursorPositionChange({
            ...position,
            textPos: model.getOffsetAt(position) ?? -1,
        });
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
