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
@ 4
M=D
@ 0
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 0
D=A
@ 4
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
@ 1
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 1
D=A
@ 4
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
@ 2
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
(FibonacciSeries.MAIN_LOOP_START)
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
@ FibonacciSeries.COMPUTE_ELEMENT
D;JNE
@ FibonacciSeries.END_PROGRAM
0;JMP
(FibonacciSeries.COMPUTE_ELEMENT)
@ 0
D=A
@ 4
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
@ 4
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
@ 2
D=A
@ 4
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
@ 4
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
M=D+M
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
@ FibonacciSeries.MAIN_LOOP_START
0;JMP
(FibonacciSeries.END_PROGRAM)