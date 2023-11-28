import { languages } from "monaco-editor";

export const defineJackLanguage = () => {
    languages.register({ id: "jack" });

    languages.setLanguageConfiguration("jack", {
        comments: {
            lineComment: "//",
            blockComment: ["/*", "*/"],
        },
        brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
        ],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"', notIn: ["string", "comment"] },
            { open: "/*", close: "*/", notIn: ["string"] },
        ],
    });

    languages.setMonarchTokensProvider("jack", {
        tokenizer: {
            root: [
                // Comments
                [/\/\/.*$/, "comment"],
                [/\/\*/, { token: "comment.quote", next: "@comment" }],

                // Keywords
                [
                    /\b(class|constructor|function|method|field|static|var|int|char|boolean|void|true|false|null|this|let|do|if|else|while|return)\b/,
                    "keyword",
                ],

                // Identifiers
                [/[a-zA-Z][a-zA-Z0-9_]*/, "identifier"],

                // Whitespace
                { include: "@whitespace" },

                // Delimiters and operators
                [/[{}()\[\]]/, "@brackets"],
                [/[=><!~&|+\-\*\/]+/, "operator"],

                /*                
                [/@symbols/, "delimiter"],
*/
                // Numbers
                [/\d+/, "number"],

                // Strings
                [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
                [
                    /"/,
                    {
                        token: "string.quote",
                        bracket: "@open",
                        next: "@string",
                    },
                ],
            ],

            comment: [
                [/[^\/*]+/, "comment"],
                [/\/\*/, "comment", "@push"], // nested comment
                ["\\*/", "comment", "@pop"],
                [/[\/*]/, "comment"],
            ],

            string: [
                [/[^\\"]+/, "string"],
                //                [/@escapes/, "string.escape"],
                [/\\./, "string.escape.invalid"],
                [
                    /"/,
                    { token: "string.quote", bracket: "@close", next: "@pop" },
                ],
            ],

            whitespace: [
                [/[ \t\r\n]+/, "white"],
                [/\/\*/, "comment", "@comment"],
                [/\/\/.*$/, "comment"],
            ],
        },
    });
};
