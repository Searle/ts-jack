import React from "react";

import MonacoEditor, { OnMount, Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

// import { defineJackLanguage } from "./jackLanguageDef"; // Adjust the path as necessary
import "./MonacoEditor.css";

interface EditorProps {
    onChange?: (code: string) => void;
    readOnly?: boolean;
    initialValue?: string;
    value?: string;
}

const Editor: React.FC<EditorProps> = ({
    onChange,
    readOnly,
    initialValue,
    value,
}) => {
    const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = React.useRef<Monaco | null>(null);
    const decorationsRef =
        React.useRef<editor.IEditorDecorationsCollection | null>(null);

    const [editValue] = React.useState(initialValue);

    const onCursorPositionChange = (
        event: editor.ICursorPositionChangedEvent
    ) => {
        const editor = editorRef.current;
        if (!editor) return;

        const position = event.position;
        const { lineNumber, column } = position;
        const textUntilPosition = editor.getModel()?.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: column,
        });

        const charPosition = textUntilPosition ? textUntilPosition.length : 0;
        console.log("Character Position: ", position, charPosition);
    };

    const decorate = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const monaco = monacoRef.current;
        if (!monaco) return;

        // Create a decorations collection
        decorationsRef.current = editor.createDecorationsCollection();

        // Define a decoration
        const decoration: editor.IModelDeltaDecoration = {
            range: new monaco.Range(1, 1, 1, 10),
            options: {
                className: "myCustomDecoration",
            },
        };

        // Add the decoration to the collection
        decorationsRef.current.set([decoration]);
    };

    const onEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        editor.onDidChangeCursorPosition(
            (event: editor.ICursorPositionChangedEvent) =>
                onCursorPositionChange(event)
        );
        decorate();
    };

    React.useEffect(() => {
        // defineJackLanguage();
        onChange?.(editValue ?? "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onValueChange = (newValue: string | undefined /* , e: any */) => {
        if (newValue !== undefined) {
            onChange?.(newValue ?? "");
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
            onChange={onValueChange}
            onMount={onEditorMount}
        />
    );
};

export default Editor;
