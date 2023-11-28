import React from "react";
import "./Ide.css";
// import Editor from "./SimpleCodeEditor";
import Editor from "./MonacoEditor";
import { compile } from "./../compilers/jackc";

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
                    <Editor onChange={onChange} />
                </div>
                <div className="output">
                    <pre>
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
            <footer className="footer">Footer</footer>
        </div>
    );
};

export default MyComponent;
