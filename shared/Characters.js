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

    // Attack active frames (when hitbox is active)
    punchActiveStart: 3,
    punchActiveEnd: 8,
    kickActiveStart: 5,
    kickActiveEnd: 12,
};

const createCharacter = (id, name, color, stats = {}) => ({
    id,
    name,
    color,
    stats: { ...BASE_STATS, ...stats },
});

const CHARACTERS = [
    createCharacter(1, "Knight", "#3b82f6"),
    createCharacter(2, "Mage", "#8b5cf6"),
    createCharacter(3, "Archer", "#22c55e"),
    createCharacter(4, "Paladin", "#eab308"),
    createCharacter(5, "Rogue", "#6b7280"),
    createCharacter(6, "Berserker", "#ef4444"),
    createCharacter(7, "Druid", "#10b981"),
    createCharacter(8, "Monk", "#f59e0b"),
    createCharacter(9, "Ninja", "#1e293b"),
    createCharacter(10, "Samurai", "#f43f5e"),
    createCharacter(11, "Witch", "#8b5cf6"),
    createCharacter(12, "Pirate", "#06b6d4"),
];

export default CHARACTERS;

export const getCharacterById = (id) => CHARACTERS.find((c) => c.id === id);
