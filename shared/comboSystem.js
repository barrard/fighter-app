export const COMBO_WINDOWS = {
    forwardTapGapTicks: 12,
    rangedFollowupTicks: 10,
};

export const createComboState = () => ({
    forwardTapCount: 0,
    lastForwardTapTick: -Infinity,
    rangedReadyUntilTick: -Infinity,
});

export const updateForwardComboState = (comboState, currentInput, previousInput, facing, currentTick) => {
    if (!comboState || !currentInput || currentTick == null) return comboState;

    const forwardKey = facing === "left" ? "left" : "right";
    const forwardPressed = Boolean(currentInput[forwardKey]);
    const wasForwardPressed = Boolean(previousInput?.[forwardKey]);

    if (forwardPressed && !wasForwardPressed) {
        const withinGap = currentTick - comboState.lastForwardTapTick <= COMBO_WINDOWS.forwardTapGapTicks;
        comboState.forwardTapCount = withinGap ? comboState.forwardTapCount + 1 : 1;
        comboState.lastForwardTapTick = currentTick;

        if (comboState.forwardTapCount >= 2) {
            comboState.forwardTapCount = 0;
            comboState.rangedReadyUntilTick = currentTick + COMBO_WINDOWS.rangedFollowupTicks;
        }
    }

    if (currentTick > comboState.rangedReadyUntilTick) {
        comboState.rangedReadyUntilTick = -Infinity;
    }

    return comboState;
};

export const consumeRangedCombo = (comboState, currentTick) => {
    if (!comboState || currentTick == null) return false;
    if (currentTick <= comboState.rangedReadyUntilTick) {
        comboState.rangedReadyUntilTick = -Infinity;
        comboState.forwardTapCount = 0;
        return true;
    }
    return false;
};
