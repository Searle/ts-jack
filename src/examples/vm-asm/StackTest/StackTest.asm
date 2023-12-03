@ 17
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 17
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
D=D-M
@ localLoop0
D;JEQ
D=-1
( localLoop0 )
D=!D
@SP
A=M
M=D
@SP
M=M+1
@ 17
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 16
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
D=D-M
@ localLoop1
D;JEQ
D=-1
( localLoop1 )
D=!D
@SP
A=M
M=D
@SP
M=M+1
@ 16
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 17
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
D=D-M
@ localLoop2
D;JEQ
D=-1
( localLoop2 )
D=!D
@SP
A=M
M=D
@SP
M=M+1
@ 892
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 891
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
D=D-M
@ localLoop3
D;JGT
D=0
@ localLoop4
0;JMP
( localLoop3 )
D=-1
( localLoop4 )
@SP
A=M
M=D
@SP
M=M+1
@ 891
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 892
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
D=D-M
@ localLoop5
D;JGT
D=0
@ localLoop6
0;JMP
( localLoop5 )
D=-1
( localLoop6 )
@SP
A=M
M=D
@SP
M=M+1
@ 891
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 891
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
D=D-M
@ localLoop7
D;JGT
D=0
@ localLoop8
0;JMP
( localLoop7 )
D=-1
( localLoop8 )
@SP
A=M
M=D
@SP
M=M+1
@ 32767
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 32766
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
D=M-D
@ localLoop9
D;JGT
D=0
@ localLoop10
0;JMP
( localLoop9 )
D=-1
( localLoop10 )
@SP
A=M
M=D
@SP
M=M+1
@ 32766
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 32767
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
D=M-D
@ localLoop11
D;JGT
D=0
@ localLoop12
0;JMP
( localLoop11 )
D=-1
( localLoop12 )
@SP
A=M
M=D
@SP
M=M+1
@ 32766
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 32766
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
D=M-D
@ localLoop13
D;JGT
D=0
@ localLoop14
0;JMP
( localLoop13 )
D=-1
( localLoop14 )
@SP
A=M
M=D
@SP
M=M+1
@ 57
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 31
D=A
@SP
A=M
M=D
@SP
M=M+1
@ 53
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
@ 112
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
@SP
AM=M-1
M=-M
@SP
M=M+1
@SP
AM=M-1
D=M
@SP
AM=M-1
M=D&M
@SP
M=M+1
@ 82
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
M=D|M
@SP
M=M+1
@SP
AM=M-1
M=!M
@SP
M=M+1