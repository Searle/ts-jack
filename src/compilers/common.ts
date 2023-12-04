export type SrcMap = Array<{
    src: Array<{ id: number; start: number; end: number }>;
    tgt: { start: number; end: number };
}>;

export type CompileResult = Readonly<{
    code: string;
    srcMap: SrcMap;
}>;

export const emptyCompileResult: CompileResult = {
    code: "",
    srcMap: [],
};
