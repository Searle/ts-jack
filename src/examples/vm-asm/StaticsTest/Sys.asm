( Sys.init )
@ 6
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 8
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP

D=M
D=D-1
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
@ Class1.set
0;JMP
( Sys.Return.0 )
@SP
AM=M-1
D=M
@ 5
M=D
@ 23
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 15
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP

D=M
D=D-1
D=D-1
@R13
M=D
@ Sys.Return.1
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
@ Class2.set
0;JMP
( Sys.Return.1 )
@SP
AM=M-1
D=M
@ 5
M=D
@SP

D=M
@R13
M=D
@ Sys.Return.2
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
@ Class1.get
0;JMP
( Sys.Return.2 )
@SP

D=M
@R13
M=D
@ Sys.Return.3
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
@ Class2.get
0;JMP
( Sys.Return.3 )
(Sys.WHILE)
@ Sys.WHILE
0;JMP