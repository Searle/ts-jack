import { diff } from "./diff";
import chalk from "chalk";

export const displayDiffSideBySide = (
    leftString: string,
    rightString: string,
    showBefore = 0,
    showAfter = showBefore
): void => {
    const leftLines = leftString.split(/\r?\n/);
    const rightLines = rightString.split(/\r?\n/);
    const rightLinesValue: string[] = [];
    const rightLinesComment: string[] = [];
    rightLines.forEach((line) => {
        const match = line.match(/^(.*?)(\s*(?:\/\/.*))?$/)!;
        if (match[1].length) {
            rightLinesValue.push(match[1]);
            rightLinesComment.push(match[2]);
        } else {
            rightLinesValue.push(line);
            rightLinesComment.push("");
        }
    });

    const changes = diff(
        leftLines.length,
        rightLines.length,
        (leftIndex) => leftLines[leftIndex].replace(/\s*(?:\/\/.*)?$/, ""),
        (rightIndex) => rightLines[rightIndex].replace(/\s*(?:\/\/.*)?$/, "")
    );

    let leftIndex = 0;
    let rightIndex = 0;
    let leftWidth = 10;
    const diffs: Array<{
        show?: true;
        removed?: boolean;
        added?: boolean;
        leftIndex?: number;
        rightIndex?: number;
        leftLine?: string;
        rightLine?: string;
    }> = [];

    /// console.log("CHANGES", changes);

    for (const part of changes) {
        const { removed, added } = part;
        const same = !removed && !added;
        if (same) {
            leftIndex = rightIndex = Math.max(rightIndex, leftIndex);
        }
        for (let i = 0; i < part.count; ++i) {
            const leftLine = leftLines[part.leftIndex + i];
            const rightLine = rightLines[part.rightIndex + i];
            if (removed || same) {
                diffs[leftIndex] = {
                    ...diffs[leftIndex],
                    leftIndex: part.leftIndex + i,
                    leftLine,
                    removed,
                };
                if (leftWidth < leftLine.length) leftWidth = leftLine.length;
                leftIndex++;
            }
            if (added || same) {
                diffs[rightIndex] = {
                    ...diffs[rightIndex],
                    rightIndex: part.rightIndex + i,
                    rightLine,
                    added,
                };
                rightIndex++;
            }
        }
    }
    for (let i = 0; i < diffs.length; ++i) {
        for (let j = i - showAfter; j <= i + showBefore; ++j) {
            if (
                j >= 0 &&
                j < diffs.length &&
                (diffs[j].added || diffs[j].removed)
            ) {
                diffs[i].show = true;
            }
        }
    }
    if (leftWidth > 40) {
        leftWidth = 40;
    }
    let showDots = true;
    for (let i = 0; i < diffs.length; ++i) {
        const {
            show,
            removed,
            added,
            leftIndex,
            rightIndex,
            leftLine,
            rightLine,
        } = diffs[i];
        if (!show) {
            if (showDots) {
                console.log(`${"".padEnd(leftWidth + 5)}...`);
                showDots = false;
            }
            continue;
        }
        showDots = true;
        const leftIndexStr = (leftIndex ?? "").toString().padStart(4);
        const rightIndexStr = (rightIndex ?? "").toString().padStart(4);
        const leftLine1 = (leftLine ?? "").padEnd(leftWidth);
        const rightLine1 = rightLine ?? "";
        const leftLine2 = chalk[removed ? "bgRedBright" : "gray"](leftLine1);
        const rightLine2 = chalk[added ? "bgGreenBright" : "gray"](rightLine1);
        console.log(
            `${leftIndexStr} ${leftLine2} | ${rightIndexStr} ${rightLine2}`
        );
    }
};
