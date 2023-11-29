import React from "react";
import "./Ide.css";
// import Editor from "./SimpleCodeEditor";
import Editor from "./MonacoEditor";
import { compile } from "./../compilers/jackc";

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

const MyComponent: React.FC = () => {
    const [code, setCode] = React.useState("");

    const onChange = (code_: string) => {
        setCode(compile(code_));
    };

    return (
        <div className="container">
            <header className="header">JACK to VM compiler</header>
            <div className="content">
                <div className="editor">
                    <Editor onChange={onChange} initialValue={initialCode} />
                </div>
                <div className="output">
                    <Editor readOnly value={code} />
                </div>
            </div>
            <footer className="footer">Footer</footer>
        </div>
    );
};

export default MyComponent;
