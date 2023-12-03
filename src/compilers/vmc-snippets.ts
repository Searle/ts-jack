export default `
{sys_init}
  @ %_stack_address
  D=A
  @0
  M=D

{push-constant}
  @ %_literal
  D=A
  @SP // push D to stack
  A=M
  M=D
  @SP // inc sp
  M=M+1

{push-direct}
  @ %_source_address
  D=M
  @SP // push D to stack
  A=M
  M=D
  @SP // inc stack
  M=M+1

{push-indirect}
  @ %_offset // calc source address and store in D
  D=A
  @ %_base_pointer
  D=D+M
  A=D // get value from source address and store in D
  D=M
  @SP // push D to stack
  A=M
  M=D
  @SP // inc stack
  M=M+1

{pop-direct}
  @SP // pop stack to D
  AM=M-1
  D=M
  @ %_dest_address // store D to destination
  M=D

{pop-indirect}
  @ %_offset
  D=A
  @ %_base_pointer // calc dest_address
  D=D+M
  @SP // temporarily store dest address on top of stack
  A=M
  M=D
  @SP // pop to D
  AM=M-1
  D=M
  @SP // get dest address from above stack
  A=M+1
  A=M
  M=D // store D to dest_address

{add}
  @SP // pop from stack to D
  AM=M-1
  D=M
  @SP // dec sp and set A to sp
  AM=M-1
  M=D+M // add D to *A
  @SP // inc sp
  M=M+1

{sub}
  @SP // pop from stack to D
  AM=M-1
  D=M
  @SP // dec sp and set A to sp
  AM=M-1
  M=D-M // pop stack, sub from D and push to stack
  M=-M
  @SP // inc sp
  M=M+1

{eq}
  @SP // pop stack to D
  AM=M-1
  D=M
  @SP // pop stack and subtract from D
  AM=M-1
  D=D-M
  @ %_localLoop_0
  D;JEQ // 0? -> eq
  D=-1 // not 0
  ( %_localLoop_0 )
  D=!D // negate
  @SP
  A=M
  M=D // push 0 or -1 to stack
  @SP
  M=M+1

{neg}
  @SP // dec stack
  AM=M-1
  M=-M // invert sign of last stack member in place
  @SP // inc stack
  M=M+1

{gt}  // true if SP-2 greater than SP-1
  @SP // pop stack to D
  AM=M-1
  D=M
  @SP // pop stack and subtract D from M
  AM=M-1
  D=M-D
  @ %_jmp_if_greater // Jump if greater
  D;JGT
  D=0
  @ %_jmp_final
  0;JMP
  ( %_jmp_if_greater )
  D=-1
  ( %_jmp_final )
  @SP // push D to stack
  A=M
  M=D
  @SP // inc stack
  M=M+1

{lt}  // true if SP-2 less than SP-1
  @SP // pop stack to D
  AM=M-1
  D=M
  @SP // pop stack and subtract D from M
  AM=M-1
  D=D-M
  @ %_jmp_if_greater // Jump if greater
  D;JGT
  D=0
  @ %_jmp_final
  0;JMP
  ( %_jmp_if_greater )
  D=-1
  ( %_jmp_final )
  @SP // push D to stack
  A=M
  M=D
  @SP // inc stack
  M=M+1

{and} // bitwise and
  @SP // pop stack to D
  AM=M-1
  D=M
  @SP // pop stack and push D AND M
  AM=M-1
  M=D&M
  @SP // inc SP
  M=M+1

{or} // bitwise and
  @SP // pop stack to D
  AM=M-1
  D=M
  @SP // pop stack and push D AND M
  AM=M-1
  M=D|M
  @SP // inc SP
  M=M+1

{not} // biswise not
  @SP //dec stack
  AM=M-1
  M=!M // NOT stack in place
  @SP // inc stack
  M=M+1

{label}
  (%_label)

{goto}
  @ %_label
  0;JMP

{if-goto}
  @SP
  AM=M-1
  D=M
  @ %_label
  D;JNE

{call}
  %_set_arg // store new ARG in R13
  @ %_return_address  // store return address on stack
  D=A
  @SP
  A=M
  M=D
  @SP
  M=M+1
  @1 // store LCL on stack
  D=M
  @SP
  A=M
  M=D
  @SP // inc stack
  M=M+1
  @2 // store ARG on stack
  D=M
  @SP
  A=M
  M=D
  @SP // inc stack
  M=M+1
  @3 // store THIS on stack
  D=M
  @SP
  A=M // target
  M=D
  @SP // inc stack
  M=M+1
  @4 // store THAT on stack
  D=M
  @SP
  A=M
  M=D
  @SP // inc stack
  M=M+1
  @R13 // restore ARG
  D=M
  @2
  M=D
  @SP // set LCL
  D=M
  @1
  M=D
  @ %_function_name // Call function
  0;JMP
  ( %_return_address )

{function}
  ( %_function_name )
  %_local_vars

{init-local-vars}
  @SP // push 0 to stack
  A=M
  M=0
  @SP
  M=M+1

{return}

  @2 // store ARG to R14
  D=M
  @R14
  M=D

  @SP // store return value to R13
  AM=M-1
  D=M
  @R13
  M=D

  @1 // set stack to LCL -1
  D=M-1
  @SP
  M=D
  A=M // restore that
  D=M
  @4
  M=D
  @SP // dec stack
  M=M-1
  A=M // restore this
  D=M
  @3
  M=D
  @SP // dec stack
  M=M-1
  A=M // restore arg
  D=M
  @2
  M=D
  @SP // dec stack
  M=M-1
  A=M // restore local
  D=M
  @1
  M=D
  @SP // dec stack
  M=M-1
//stack points now to return address,
//which could also be ARG 0

  A=M // store return address to temp R15
  D=M
  @R15
  M=D

  @R13 // store return value to former ARG 0
  D=M
  @R14
  A=M
  M=D

  @R14 // restore SP
  D=M+1
  @SP
  M=D

  @R15 // jump to return address
  A=M
  0;JMP
`;
