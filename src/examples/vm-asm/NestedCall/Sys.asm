( Sys.init )
@ 4000
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@ 3
M=D
@ 5000
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@ 4
M=D
@SP

D=M
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
@ Sys.main
0;JMP
( Sys.Return.0 )
@SP
AM=M-1
D=M
@ 6
M=D
(Sys.LOOP)
@ Sys.LOOP
0;JMP
( Sys.main )
@SP
A=M
M=0
@SP
M=M+1
@SP
A=M
M=0
@SP
M=M+1
@SP
A=M
M=0
@SP
M=M+1
@SP
A=M
M=0
@SP
M=M+1
@SP
A=M
M=0
@SP
M=M+1
@ 4001
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@ 3
M=D
@ 5001
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@ 4
M=D
@ 200
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 1
D=A
@ 1
D=D+M
@SP
A=M
M=D
@SP
AM=M-1
D=M
@SP
A=M+1
A=M
M=D
@ 40
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 2
D=A
@ 1
D=D+M
@SP
A=M
M=D
@SP
AM=M-1
D=M
@SP
A=M+1
A=M
M=D
@ 6
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 3
D=A
@ 1
D=D+M
@SP
A=M
M=D
@SP
AM=M-1
D=M
@SP
A=M+1
A=M
M=D
@ 123
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
@ Sys.add12
0;JMP
( Sys.Return.1 )
@SP
AM=M-1
D=M
@ 5
M=D
@ 0
D=A
@ 1
D=D+M
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1
@ 1
D=A
@ 1
D=D+M
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1
@ 2
D=A
@ 1
D=D+M
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1
@ 3
D=A
@ 1
D=D+M
A=D
D=M
@SP
A=M
M=D
@SP
M=M+1
@ 4
D=A
@ 1
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
@SP
AM=M-1
M=D+M
@SP
M=M+1
@SP
AM=M-1
D=M
@SP
AM=M-1
M=D+M
@SP
M=M+1
@SP
AM=M-1
D=M
@SP
AM=M-1
M=D+M
@SP
M=M+1
@SP
AM=M-1
D=M
@SP
AM=M-1
M=D+M
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
( Sys.add12 )
@ 4002
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@ 3
M=D
@ 5002
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@ 4
M=D
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
@ 12
D=A
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
M=D+M
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