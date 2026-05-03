// Single source of truth for character definitions and stats
// Used by both server and client

export const BASE_STATS = {
    // Dimensions
    width: 50,
    height: 100,

    // Movement
    movementSpeed: 5,
    jumpVelocity: -15,

    // Attack timing (milliseconds)
    punchDuration: 300,
    kickDuration: 400,

    // Punch hitbox
    armWidth: 30,
    armHeight: 10,
    armYOffset: 30,

    // Kick hitbox
    legWidth: 35,
    legHeight: 8,
    legYOffset: 70,

    // Combat stats
    health: 100,
    punchDamage: 10,
    kickDamage: 15,
    punchKnockback: 8,
    kickKnockback: 12,

    // Attack active frames (when hitbox is active) - legacy, kept for compatibility
    punchActiveStart: 3,
    punchActiveEnd: 8,
    kickActiveStart: 5,
    kickActiveEnd: 12,

    // Directional attack stats
    attacks: {
        highPunch: { duration: 250, width: 28, height: 10, yOffset: 15, damage: 8, knockback: 6, activeStart: 2, activeEnd: 6 },
        midPunch:  { duration: 300, width: 30, height: 10, yOffset: 30, damage: 10, knockback: 8, activeStart: 3, activeEnd: 8 },
        lowPunch:  { duration: 280, width: 25, height: 10, yOffset: 55, damage: 7, knockback: 5, activeStart: 3, activeEnd: 7 },
        highKick:  { duration: 450, width: 38, height: 8, yOffset: 10, damage: 18, knockback: 14, activeStart: 6, activeEnd: 14 },
        midKick:   { duration: 400, width: 35, height: 8, yOffset: 50, damage: 15, knockback: 12, activeStart: 5, activeEnd: 12 },
        lowKick:   { duration: 350, width: 40, height: 8, yOffset: 85, damage: 12, knockback: 10, activeStart: 4, activeEnd: 10 },
    },

    rangedAttack: null,
    visual: {
        headShape: "round",
        bodyShape: "athletic",
        shoulderScale: 1,
        hipScale: 1,
        accentColor: "#f8fafc",
        secondaryColor: "#111827",
        hairStyle: "none",
        accessory: "none",
        weapon: "none",
    },
};

const createCharacter = (id, name, color, stats = {}) => ({
    id,
    name,
    color,
    stats: {
        ...BASE_STATS,
        ...stats,
        attacks: { ...BASE_STATS.attacks, ...(stats.attacks || {}) },
        visual: { ...BASE_STATS.visual, ...(stats.visual || {}) },
    },
});

const CHARACTERS = [
    createCharacter(1, "Knight", "#2563eb", {
        width: 54,
        height: 108,
        movementSpeed: 4.4,
        jumpVelocity: -14,
        health: 120,
        punchDamage: 12,
        kickDamage: 16,
        visual: {
            headShape: "square",
            bodyShape: "heavy",
            shoulderScale: 1.35,
            hipScale: 1.05,
            accentColor: "#bfdbfe",
            secondaryColor: "#94a3b8",
            accessory: "pauldron",
            weapon: "sword",
        },
    }),
    createCharacter(2, "Mage", "#7c3aed", {
        width: 46,
        height: 104,
        movementSpeed: 4.8,
        jumpVelocity: -15.5,
        health: 88,
        punchDamage: 8,
        kickDamage: 12,
        rangedAttack: {
            duration: 520,
            width: 34,
            height: 18,
            yOffset: 28,
            xOffset: 130,
            damage: 14,
            knockback: 9,
            startupFrames: 6,
            projectileSpeed: 14,
            maxTravelFrames: 18,
            activeStart: 6,
            activeEnd: 18,
            projectileColor: "#c4b5fd",
            effect: "orb",
        },
        visual: {
            headShape: "round",
            bodyShape: "robe",
            shoulderScale: 0.95,
            hipScale: 1.25,
            accentColor: "#ddd6fe",
            secondaryColor: "#4c1d95",
            hairStyle: "hood",
            accessory: "glow",
            weapon: "staff",
        },
    }),
    createCharacter(3, "Archer", "#16a34a", {
        width: 48,
        height: 102,
        movementSpeed: 5.3,
        jumpVelocity: -15.2,
        health: 94,
        punchDamage: 9,
        kickDamage: 13,
        rangedAttack: {
            duration: 480,
            width: 42,
            height: 10,
            yOffset: 34,
            xOffset: 145,
            damage: 12,
            knockback: 8,
            startupFrames: 5,
            projectileSpeed: 18,
            maxTravelFrames: 18,
            activeStart: 5,
            activeEnd: 17,
            projectileColor: "#fde68a",
            effect: "arrow",
        },
        visual: {
            headShape: "oval",
            bodyShape: "light",
            shoulderScale: 1,
            hipScale: 0.95,
            accentColor: "#bbf7d0",
            secondaryColor: "#14532d",
            hairStyle: "hood",
            accessory: "quiver",
            weapon: "bow",
        },
    }),
    createCharacter(4, "Rogue", "#475569", {
        width: 44,
        height: 98,
        movementSpeed: 5.8,
        jumpVelocity: -16,
        health: 90,
        punchDamage: 9,
        kickDamage: 11,
        rangedAttack: {
            duration: 360,
            width: 28,
            height: 10,
            yOffset: 32,
            xOffset: 120,
            damage: 10,
            knockback: 6,
            startupFrames: 4,
            projectileSpeed: 20,
            maxTravelFrames: 14,
            activeStart: 4,
            activeEnd: 12,
            projectileColor: "#e2e8f0",
            effect: "dagger",
        },
        visual: {
            headShape: "oval",
            bodyShape: "light",
            shoulderScale: 0.9,
            hipScale: 0.88,
            accentColor: "#e2e8f0",
            secondaryColor: "#0f172a",
            hairStyle: "short",
            accessory: "mask",
            weapon: "dagger",
        },
    }),
    createCharacter(5, "Berserker", "#dc2626", {
        width: 58,
        height: 110,
        movementSpeed: 4.9,
        jumpVelocity: -14.5,
        health: 112,
        punchDamage: 13,
        kickDamage: 17,
        visual: {
            headShape: "round",
            bodyShape: "heavy",
            shoulderScale: 1.45,
            hipScale: 1.1,
            accentColor: "#fca5a5",
            secondaryColor: "#7f1d1d",
            hairStyle: "crest",
            accessory: "fur",
            weapon: "axe",
        },
    }),
    createCharacter(6, "Monk", "#ea580c", {
        width: 46,
        height: 100,
        movementSpeed: 5.4,
        jumpVelocity: -16.4,
        health: 96,
        punchDamage: 11,
        kickDamage: 14,
        attacks: {
            highKick: { duration: 420, width: 42, height: 8, yOffset: 8, damage: 19, knockback: 13, activeStart: 5, activeEnd: 13 },
            midKick: { duration: 360, width: 38, height: 8, yOffset: 48, damage: 16, knockback: 11, activeStart: 4, activeEnd: 11 },
        },
        visual: {
            headShape: "round",
            bodyShape: "lean",
            shoulderScale: 0.95,
            hipScale: 0.92,
            accentColor: "#fdba74",
            secondaryColor: "#7c2d12",
            hairStyle: "topknot",
            accessory: "sash",
            weapon: "beads",
        },
    }),
];

export default CHARACTERS;

export const getCharacterById = (id) => CHARACTERS.find((c) => c.id === id);
