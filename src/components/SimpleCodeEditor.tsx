import React from "react";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another

import "./SimpleCodeEditor.css";

const Editor2: React.FC = () => {
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

    return (
        <Editor
            value={code}
            onValueChange={(code) => setCode(code)}
            highlight={(code) => highlight(code, languages.js, "js")}
            padding={5}
            className="Editor"
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
            }}
        />
    );
};

export default Editor2;
