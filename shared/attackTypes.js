// Attack type constants for directional attacks
// Used by both server and client

export const ATTACK_TYPES = {
    NONE: 0,
    HIGH_PUNCH: 1,
    MID_PUNCH: 2,
    LOW_PUNCH: 3,
    HIGH_KICK: 4,
    MID_KICK: 5,
    LOW_KICK: 6,
};

export const ATTACK_TYPE_NAMES = {
    [ATTACK_TYPES.HIGH_PUNCH]: 'highPunch',
    [ATTACK_TYPES.MID_PUNCH]: 'midPunch',
    [ATTACK_TYPES.LOW_PUNCH]: 'lowPunch',
    [ATTACK_TYPES.HIGH_KICK]: 'highKick',
    [ATTACK_TYPES.MID_KICK]: 'midKick',
    [ATTACK_TYPES.LOW_KICK]: 'lowKick',
};

export const isPunch = (type) => type >= ATTACK_TYPES.HIGH_PUNCH && type <= ATTACK_TYPES.LOW_PUNCH;
export const isKick = (type) => type >= ATTACK_TYPES.HIGH_KICK && type <= ATTACK_TYPES.LOW_KICK;

export const getAttackTypeName = (type) => ATTACK_TYPE_NAMES[type] || null;
