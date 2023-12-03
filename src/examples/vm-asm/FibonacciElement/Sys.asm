( Sys.init )
@ 4
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP

D=M
D=D-1
@R13
M=D
@ Sys.Return.0
D=A
@SP
A=M
M=D
@SP
M=M+1
@1
D=M
@SP
A=M
M=D
@SP
M=M+1
@2
D=M
@SP
A=M
M=D
@SP
M=M+1
@3
D=M
@SP
A=M
M=D
@SP
M=M+1
@4
D=M
@SP
A=M
M=D
@SP
M=M+1
@R13
D=M
@2
M=D
@SP
D=M
@1
M=D
@ Main.fibonacci
0;JMP
( Sys.Return.0 )
(Sys.WHILE)
@ Sys.WHILE
0;JMP