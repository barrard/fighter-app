export const getProjectileSpawnTick = (attackStartTick, rangedAttack = {}) =>
    (attackStartTick ?? 0) + (rangedAttack.startupFrames ?? 0);

export const getProjectileState = ({
    currentTick,
    attackStartTick,
    facing = "right",
    rangedAttack,
    spawnX = 0,
    spawnHeight = 0,
} = {}) => {
    if (!rangedAttack || attackStartTick == null || currentTick == null) {
        return { active: false, spawned: false, expired: true };
    }

    const spawnTick = getProjectileSpawnTick(attackStartTick, rangedAttack);
    const flightTicks = Math.max(0, currentTick - spawnTick);
    const maxTravelFrames = rangedAttack.maxTravelFrames ?? 18;
    const direction = facing === "left" ? -1 : 1;
    const speed = rangedAttack.projectileSpeed ?? 16;
    const spawned = currentTick >= spawnTick;
    const expired = flightTicks > maxTravelFrames;

    if (!spawned || expired) {
        return {
            active: false,
            spawned,
            expired,
            spawnTick,
            x: spawnX,
            relativeHeight: spawnHeight + (rangedAttack.yOffset ?? 0),
        };
    }

    return {
        active: true,
        spawned: true,
        expired: false,
        spawnTick,
        x: spawnX + direction * speed * flightTicks,
        relativeHeight: spawnHeight + (rangedAttack.yOffset ?? 0),
        ageTicks: flightTicks,
    };
};
