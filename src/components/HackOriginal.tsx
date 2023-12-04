import React, { useState, useEffect, useCallback } from "react";
import HACK_original from "../hack_original/hack_original";
import Default from "../hack_original/utility/defaults";

const SimPage: React.FC = () => {
    const [hack, setHack] = useState(() => new HACK_original());
    const [cycleInterval, setCycleInterval] = useState<NodeJS.Timeout | null>(
        null
    );
    const [setupCycles, setSetupCycles] = useState(5000000);
    const [cyclesPerFrame, setCyclesPerFrame] = useState(35000);
    const [fps, setFps] = useState(60);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [program, setProgram] = useState("");

    const loadRom = useCallback(() => {
        const programBinary = Default.stringProgramToBin(program);
        hack.rom.flash(programBinary);
        hack.ram.wipe();
        hack.reset = true;
        console.log("Rom loaded.");
    }, [hack, program]);

    useEffect(() => {
        // Fetch and preload Pong program
        fetch(
            "https://raw.githubusercontent.com/magiwanders/Nand2Tetris-Hack-Computer-JS-Reimplementation/master/Pong.hack"
        )
            .then((response) => response.text())
            .then((text) => {
                setProgram(text);
                loadRom();
            });

        // Clean up the interval on component unmount
        return () => {
            if (cycleInterval) {
                clearInterval(cycleInterval);
            }
        };
    }, [cycleInterval, loadRom]);

    const [isRunning, setIsRunning] = useState(false);

    const refreshScreen = () => {
        // TODO
    };

    const handleFileChange = () => {
        // TODO
    };

    const startSimulation = () => {
        // Perform setup cycles
        for (let i = 0; i < setupCycles; i++) {
            hack.cycle();
        }

        // Start the interval if FPS is not zero
        if (fps !== 0) {
            const interval = setInterval(() => {
                for (let i = 0; i < cyclesPerFrame; i++) {
                    hack.cycle();
                }
                refreshScreen(); // Implement this function to update the screen
            }, 1000 / fps);

            setCycleInterval(interval);
        }

        setIsRunning(true);
    };

    const stopSimulation = () => {
        if (cycleInterval) {
            clearInterval(cycleInterval);
            setCycleInterval(null);
        }

        // Reset the HACK computer
        hack.reset = true;
        hack.ram.wipe();
        console.log("Simulation stopped. Reset and Ram Wiped.");

        setIsRunning(false);
    };

    const startStopSim = () => {
        if (isRunning) {
            stopSimulation();
        } else {
            startSimulation();
        }
    };

    const toggleTutorial = () => {
        setShowTutorial(!showTutorial);
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const writeRAM = () => {
        /*
        const ramCell = parseInt(document.getElementById("ram_cell").value, 10);
        const ramValue = parseInt(
            document.getElementById("ram_value").value,
            10
        );
        hack.ram.write_word(ramCell, ramValue);
        // Reset input fields or handle state if using controlled components
        */
    };

    const readRom = () => {
        /*
        const address = parseInt(
            document.getElementById("read_rom_address").value,
            10
        );
        const romValue = hack.rom.rom[address];
        // Update state to display ROM value or directly manipulate the DOM
        */
    };

    const advanceCycle = () => {
        hack.cycle();
        console.log("Cycle advanced");
        // Additional logging or state updates
    };

    const resetSimulation = () => {
        if (cycleInterval) {
            clearInterval(cycleInterval);
            setCycleInterval(null);
        }

        // Reset the HACK computer's internal state
        hack.reset = true;
        hack.ram.wipe();
        hack.cpu.wipe(); // If CPU has a reset method
        // Possibly reset other components if necessary

        setIsRunning(false);
        console.log("Simulation reset.");
    };

    const advanceFrame = () => {
        for (let i = 0; i < cyclesPerFrame; i++) {
            hack.cycle();
        }
        refreshScreen(); // Implement this function to update the screen
    };

    return (
        <div>
            <h1>Nand2Tetris Hack Computer</h1>
            <h3>Javascript Re-Implementation - Pong preloaded!</h3>

            <button onClick={toggleTutorial}>
                {showTutorial ? "Hide Tutorial" : "Show Tutorial"}
            </button>

            {showTutorial && (
                <div id="tutorial">
                    {/* Place your tutorial content here */}
                </div>
            )}

            <button onClick={toggleSettings}>
                {showSettings ? "Hide Settings" : "Show Settings"}
            </button>

            {showSettings && (
                <div id="settings">
                    {/* Settings content */}
                    <label htmlFor="setup_cycles">
                        Number of setup cycles:
                    </label>
                    <input
                        type="number"
                        id="setup_cycles"
                        name="setup_cycles"
                        value={setupCycles}
                        onChange={(e) =>
                            setSetupCycles(parseInt(e.target.value, 10))
                        }
                    />
                    <br />
                    <label htmlFor="cycles_per_frame">
                        Number of cycles per frame:
                    </label>
                    <input
                        type="number"
                        id="cycles_per_frame"
                        name="cycles_per_frame"
                        value={cyclesPerFrame}
                        onChange={(e) =>
                            setCyclesPerFrame(parseInt(e.target.value, 10))
                        }
                    />
                    <br />
                    <label htmlFor="fps">Frames per second:</label>
                    <input
                        type="number"
                        id="fps"
                        name="fps"
                        value={fps}
                        onChange={(e) => setFps(parseInt(e.target.value, 10))}
                    />
                    <br />
                    {/* Additional settings inputs */}
                    <button onClick={writeRAM}>Write to RAM</button>
                </div>
            )}

            <button
                onClick={startStopSim}
                style={{ backgroundColor: isRunning ? "red" : "lightgreen" }}
            >
                {isRunning ? "STOP" : "START"}
            </button>
            <button onClick={resetSimulation}>Reset</button>
            <button onClick={advanceCycle}>Cycle</button>
            <button onClick={advanceFrame}>Frame</button>

            <canvas
                id="screen"
                width="512"
                height="256"
                style={{ border: "1px solid" }}
            ></canvas>
            <button onClick={refreshScreen}>Manual Refresh</button>

            <button onClick={readRom}>Read ROM</button>
            <input type="number" min="0" max="32767" id="read_rom_address" />
            <span id="read_rom_result">#</span>

            <input
                type="file"
                id="rom_file"
                name="rom_file"
                onChange={handleFileChange}
            />
            <button onClick={loadRom}>Load in ROM</button>

            {/* Additional UI elements */}
        </div>
    );
};

export default SimPage;
