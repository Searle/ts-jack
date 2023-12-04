import React from "react";

// Assuming these classes are available as TypeScript classes
import ALU_test from "./alu_test";
import Memory_test from "./memory_test";
import PC_test from "./pc_test";
import Instruction_test from "./instruction_test";
import PC_controller_test from "./pc_controller_test";
import CPU_test from "./cpu_test";
import ROM_test from "./rom_test";
import HACK_original_test from "./hack_original_test";

const TestPage: React.FC = () => {
    const verbose = false;

    const handleALUTest = () => {
        new ALU_test().test(verbose);
    };

    const handleMemoryTest = () => {
        new Memory_test().test(verbose);
    };

    const handlePCTest = () => {
        new PC_test().test(verbose);
    };

    const handleInstructionTest = () => {
        new Instruction_test().test(verbose);
    };

    const handlePCControllerTest = () => {
        new PC_controller_test().test(verbose);
    };

    const handleCPUTest = () => {
        new CPU_test().test(verbose);
    };

    const handleROMTest = () => {
        new ROM_test().test(verbose);
    };

    const handleAllTest = () => {
        const hackTest = new HACK_original_test();
        hackTest.test([1, 1, 1, 0, 0, 0, 0, 0]);
    };

    return (
        <div>
            <button onClick={handleALUTest}>Test ALU</button>
            <button onClick={handleMemoryTest}>Test Memory</button>
            <button onClick={handlePCTest}>Test PC</button>
            <button onClick={handleInstructionTest}>Test Instruction</button>
            <button onClick={handlePCControllerTest}>Test PC Controller</button>
            <button onClick={handleCPUTest}>Test CPU</button>
            <button onClick={handleROMTest}>Test ROM</button>
            <button onClick={handleAllTest}>Complete Test</button>
            <textarea
                id="program"
                name="program"
                rows={100}
                cols={15}
            ></textarea>
        </div>
    );
};

export default TestPage;
