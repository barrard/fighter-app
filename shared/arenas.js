// Arena registry — shared by client and server.
// worldWidth: game-coordinate width of the arena (server uses this for boundary clamping).
// floorYRatio: fraction of canvas height where the floor surface sits (client uses this for rendering).
// backgroundUrl: static asset path served by Vite (server ignores this field).

export const ARENAS = [
    {
        id: "street",
        name: "Street",
        backgroundUrl: "/arenas/street_blender.png",
        worldWidth: 1728,
        floorYRatio: 0.87,
    },
];

export const DEFAULT_ARENA_ID = "street";

export function getArena(id) {
    return ARENAS.find((a) => a.id === id) ?? ARENAS[0];
}
