export const INPUT_FLAGS = {
    ArrowLeft: 1 << 0,
    ArrowRight: 1 << 1,
    ArrowUp: 1 << 2,
    ArrowDown: 1 << 3,
    KeyP: 1 << 4,
    KeyK: 1 << 5,
};

export const encodeInputMask = (frame = {}) => {
    let mask = 0;
    if (frame.ArrowLeft) mask |= INPUT_FLAGS.ArrowLeft;
    if (frame.ArrowRight) mask |= INPUT_FLAGS.ArrowRight;
    if (frame.ArrowUp) mask |= INPUT_FLAGS.ArrowUp;
    if (frame.ArrowDown) mask |= INPUT_FLAGS.ArrowDown;
    if (frame.KeyP) mask |= INPUT_FLAGS.KeyP;
    if (frame.KeyK) mask |= INPUT_FLAGS.KeyK;
    return mask;
};

export const decodeInputMask = (mask = 0) => ({
    ArrowLeft: Boolean(mask & INPUT_FLAGS.ArrowLeft),
    ArrowRight: Boolean(mask & INPUT_FLAGS.ArrowRight),
    ArrowUp: Boolean(mask & INPUT_FLAGS.ArrowUp),
    ArrowDown: Boolean(mask & INPUT_FLAGS.ArrowDown),
    KeyP: Boolean(mask & INPUT_FLAGS.KeyP),
    KeyK: Boolean(mask & INPUT_FLAGS.KeyK),
});
