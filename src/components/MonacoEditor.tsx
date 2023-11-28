import React from "react";

import MonacoEditor, { MonacoEditorProps } from "react-monaco-editor";

// import { defineJackLanguage } from "./jackLanguageDef"; // Adjust the path as necessary
import "./MonacoEditor.css";

/*
(window as any)["MonacoEnvironment"] = {
    getWorker(moduleId, label) {
        switch (label) {
            // Handle other cases
            // case 'yaml':
            //   return new YamlWorker()
            // http://localhost:5173/node_modules/monaco-editor/esm/vs/language/json/monaco.contribution.js
            default:
                throw new Error(`Unknown label ${label}`);
        }
    },
};
*/

/*
window.MonacoEnvironment = {
    getWorker: (workerId, label) => {
      if (label === 'json') {
        return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker?worker', import.meta.url));
      }
      return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker?worker', import.meta.url));
    }
  };
*/
interface EditorProps {
    onChange: (code: string) => void;
}

const Editor: React.FC<EditorProps> = ({ onChange }) => {
    const [code, setCode] = React.useState(
        `// This file is part of www.nand2tetris.org
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
`
    );

    React.useEffect(() => {
        // defineJackLanguage();
        onChange(code);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const editorOptions: MonacoEditorProps["options"] = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: "line",
        automaticLayout: true,
        // other options
    };

    const onChange_ = (newValue: string, e: any) => {
        onChange(newValue);
        // Handle the change
    };

    return (
        <MonacoEditor
            width="100%"
            height="100%"
            language="javascript"
            theme="vs-light"
            value={code}
            options={editorOptions}
            onChange={onChange_}
        />
    );
};

export default Editor;
