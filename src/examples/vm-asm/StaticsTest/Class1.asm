( Class1.set )
@ 0
D=A
@ 2
D=D+M
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@ Class1.0
M=D
@ 1
D=A
@ 2
D=D+M
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@ Class1.1
M=D
@ 0
D=A
@SP
A=M
M=D
@SP
M=M+1
@2
D=M
@R14
M=D
@SP
AM=M-1
D=M
@R13
M=D
@1
D=M-1
@SP
M=D
A=M
D=M
@4
M=D
@SP
M=M-1
A=M
D=M
@3
M=D
@SP
M=M-1
A=M
D=M
@2
M=D
@SP
M=M-1
A=M
D=M
@1
M=D
@SP
M=M-1
A=M
D=M
@R15
M=D
@R13
D=M
@R14
A=M
M=D
@R14
D=M+1
@SP
M=D
@R15
A=M
0;JMP
( Class1.get )
@ Class1.0
D=M
@SP
A=M
M=D
@SP
M=M+1
@ Class1.1
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@SP
AM=M-1
M=D-M
M=-M
@SP
M=M+1
@2
D=M
@R14
M=D
@SP
AM=M-1
D=M
@R13
M=D
@1
D=M-1
@SP
M=D
A=M
D=M
@4
M=D
@SP
M=M-1
A=M
D=M
@3
M=D
@SP
M=M-1
A=M
D=M
@2
M=D
@SP
M=M-1
A=M
D=M
@1
M=D
@SP
M=M-1
A=M
D=M
@R15
M=D
@R13
D=M
@R14
A=M
M=D
@R14
D=M+1
@SP
M=D
@R15
A=M
0;JMP