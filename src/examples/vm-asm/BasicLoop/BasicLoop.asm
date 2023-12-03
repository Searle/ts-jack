@ 0
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 0
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
(BasicLoop.LOOP_START)
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
@SP
AM=M-1
D=M
@SP
AM=M-1
M=D+M
@SP
M=M+1
@ 0
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
@ 1
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
M=D-M
M=-M
@SP
M=M+1
@ 0
D=A
@ 2
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
@ BasicLoop.LOOP_START
D;JNE
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