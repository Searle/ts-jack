// Derived from https://github.com/kpdecker/jsdiff/blob/master/src/diff/base.js
// License: See ./diff.ts.LICENSE

interface DiffOptions {
    maxEditLength?: number;
}

interface Component0 {
    count: number;
    added?: boolean;
    removed?: boolean;
}

interface Path {
    rightIndex: number;
    components: Component0[];
}

interface Component extends Component0 {
    leftIndex: number;
    rightIndex: number;
}

export const diff = (
    leftLength: number,
    rightLength: number,
    getLeftValue: (index: number) => string,
    getRightValue: (index: number) => string,
    options?: DiffOptions
): Component[] => {
    let editLength = 1;
    let maxEditLength = rightLength + leftLength;
    if (options?.maxEditLength) {
        maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }

    const bestPath: (Path | undefined)[] = [{ rightIndex: -1, components: [] }];

    const extractCommon = (basePath: Path, diagonalPath: number): number => {
        let rightIndex = basePath.rightIndex;
        let leftIndex = rightIndex - diagonalPath;
        let commonCount = 0;
        while (
            rightIndex + 1 < rightLength &&
            leftIndex + 1 < leftLength &&
            getLeftValue(leftIndex + 1) === getRightValue(rightIndex + 1)
        ) {
            rightIndex++;
            leftIndex++;
            commonCount++;
        }

        if (commonCount) {
            basePath.components.push({ count: commonCount });
        }

        basePath.rightIndex = rightIndex;
        return leftIndex;
    };

    const leftIndex = extractCommon(bestPath[0]!, 0);
    if (
        bestPath[0]!.rightIndex + 1 >= rightLength &&
        leftIndex + 1 >= leftLength
    ) {
        return [{ leftIndex: 0, rightIndex: 0, count: rightLength }];
    }

    const pushComponent = (
        components: Component0[],
        added: boolean | undefined,
        removed: boolean | undefined
    ): void => {
        const last = components[components.length - 1];
        if (last && last.added === added && last.removed === removed) {
            components[components.length - 1] = {
                count: last.count + 1,
                added,
                removed,
            };
        } else {
            components.push({ count: 1, added, removed });
        }
    };

    const buildValues = (components0: Component0[]): Component[] => {
        let rightIndex = 0;
        let leftIndex = 0;
        const components: Component[] = components0 as Component[];

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            component.leftIndex = leftIndex;
            component.rightIndex = rightIndex;
            if (component.removed) {
                leftIndex += component.count;
                if (i && components[i - 1].added) {
                    const tmp = components[i - 1];
                    components[i - 1] = components[i];
                    components[i] = tmp;
                }
                continue;
            }
            if (component.added) {
                rightIndex += component.count;
                continue;
            }
            leftIndex += component.count;
            rightIndex += component.count;
        }

        const lastComponent = components[components.length - 1];
        if (
            components.length > 1 &&
            (lastComponent.added || lastComponent.removed) &&
            (lastComponent.leftIndex >= leftLength ||
                lastComponent.rightIndex >= rightLength)
        ) {
            const leftValue =
                lastComponent.leftIndex >= leftLength
                    ? "???"
                    : getLeftValue(lastComponent.leftIndex);
            const rightValue =
                lastComponent.rightIndex >= rightLength
                    ? "???"
                    : getRightValue(lastComponent.rightIndex);
            console.log(
                `DIFF: removing lastComponent [${leftValue}] [${rightValue}]`,
                lastComponent
            );
            components.pop();
        }

        return components as Component[];
    };

    const execEditLength = (): Component[] | undefined => {
        for (
            let diagonalPath = -1 * editLength;
            diagonalPath <= editLength;
            diagonalPath += 2
        ) {
            let basePath;
            const addPath = bestPath[diagonalPath - 1];
            const removePath = bestPath[diagonalPath + 1];
            let leftIndex =
                (removePath ? removePath.rightIndex : 0) - diagonalPath;
            if (addPath) {
                bestPath[diagonalPath - 1] = undefined;
            }

            const canAdd = addPath && addPath.rightIndex + 1 < rightLength;
            const canRemove =
                removePath && 0 <= leftIndex && leftIndex < leftLength;
            if (!canAdd && !canRemove) {
                bestPath[diagonalPath] = undefined;
                continue;
            }

            if (
                !canAdd ||
                (canRemove && addPath.rightIndex < removePath.rightIndex)
            ) {
                basePath = {
                    rightIndex: removePath!.rightIndex,
                    components: [...removePath!.components],
                };
                pushComponent(basePath.components, undefined, true);
            } else {
                basePath = addPath;
                basePath.rightIndex++;
                pushComponent(basePath.components, true, undefined);
            }

            leftIndex = extractCommon(basePath, diagonalPath);

            if (
                basePath.rightIndex + 1 >= rightLength &&
                leftIndex + 1 >= leftLength
            ) {
                return buildValues(basePath.components);
            }

            bestPath[diagonalPath] = basePath;
        }

        editLength++;
    };

    while (editLength <= maxEditLength) {
        const components = execEditLength();
        if (components) return components;
    }

    return [];
};
