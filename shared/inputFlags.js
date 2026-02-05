import { ATTACK_TYPES, isPunch, isKick } from './attackTypes.js';

export const INPUT_FLAGS = {
    left: 1 << 0,
    right: 1 << 1,
    jump: 1 << 2,
    crouch: 1 << 3,
    // Bits 4-6 reserved for attackType (3 bits = 0-7)
    // Legacy punch/kick flags removed - derived from attackType
};

// Mask for extracting attackType from bits 4-6
const ATTACK_TYPE_MASK = 0b1110000; // bits 4-6
const ATTACK_TYPE_SHIFT = 4;

export const encodeInputMask = (frame = {}) => {
    let mask = 0;
    if (frame.left) mask |= INPUT_FLAGS.left;
    if (frame.right) mask |= INPUT_FLAGS.right;
    if (frame.jump) mask |= INPUT_FLAGS.jump;
    if (frame.crouch) mask |= INPUT_FLAGS.crouch;

    // Encode attackType in bits 4-6
    const attackType = frame.attackType || ATTACK_TYPES.NONE;
    mask |= (attackType & 0b111) << ATTACK_TYPE_SHIFT;

    return mask;
};

export const decodeInputMask = (mask = 0) => {
    const attackType = (mask >> ATTACK_TYPE_SHIFT) & 0b111;

    return {
        left: Boolean(mask & INPUT_FLAGS.left),
        right: Boolean(mask & INPUT_FLAGS.right),
        jump: Boolean(mask & INPUT_FLAGS.jump),
        crouch: Boolean(mask & INPUT_FLAGS.crouch),
        attackType,
        // Derive legacy punch/kick booleans for compatibility
        punch: isPunch(attackType),
        kick: isKick(attackType),
    };
};
