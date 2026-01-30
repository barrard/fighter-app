const PLAYER_FIELD_SHORT = {
    id: "i",
    x: "x",
    lastProcessedTick: "l",
    height: "h",
    verticalVelocity: "vv",
    horizontalVelocity: "hv",
    serverTick: "ts",
    health: "hp",
};

const PLAYER_FIELD_LONG = Object.entries(PLAYER_FIELD_SHORT).reduce((acc, [long, short]) => {
    acc[short] = long;
    return acc;
}, {});

const ACTION_FLAGS = {
    isJumping: 1 << 0,
    isKicking: 1 << 1,
    isPunching: 1 << 2,
};
const STATUS_FLAGS = {
    facingLeft: 1 << 0,
    inHitStun: 1 << 1,
};

const toBoolean = (value) => Boolean(value);

const encodeActionMask = (player) => {
    let mask = 0;
    for (const [prop, bit] of Object.entries(ACTION_FLAGS)) {
        if (player[prop]) {
            mask |= bit;
        }
    }
    return mask;
};

const decodeActionMask = (mask = 0, target = {}) => {
    target.isJumping = Boolean(mask & ACTION_FLAGS.isJumping);
    target.isKicking = Boolean(mask & ACTION_FLAGS.isKicking);
    target.isPunching = Boolean(mask & ACTION_FLAGS.isPunching);
    return target;
};

const encodeStatusMask = (player = {}) => {
    let mask = 0;
    if (player.facing === "left") {
        mask |= STATUS_FLAGS.facingLeft;
    }
    if ((player.hitStun || 0) > 0) {
        mask |= STATUS_FLAGS.inHitStun;
    }
    return mask;
};

const decodeStatusMask = (mask = 0, target = {}) => {
    target.facing = mask & STATUS_FLAGS.facingLeft ? "left" : "right";
    target.hitStun = mask & STATUS_FLAGS.inHitStun ? (target.hitStun || 1) : 0;
    return target;
};

export const encodePlayerState = (player = {}) => {
    const encoded = {};
    for (const [longKey, shortKey] of Object.entries(PLAYER_FIELD_SHORT)) {
        if (player[longKey] !== undefined) {
            encoded[shortKey] = player[longKey];
        }
    }
    const hasActionProps = Object.keys(ACTION_FLAGS).some((key) => player[key] !== undefined);
    if (hasActionProps) {
        encoded.a = encodeActionMask(player);
    }
    const statusMask = encodeStatusMask(player);
    if (statusMask !== 0) {
        encoded.s = statusMask;
    }
    return encoded;
};

export const decodePlayerState = (payload = {}) => {
    if (payload == null) return {};
    if ("lastProcessedTick" in payload || "horizontalVelocity" in payload) {
        return payload;
    }

    const decoded = {};
    for (const [shortKey, longKey] of Object.entries(PLAYER_FIELD_LONG)) {
        if (payload[shortKey] !== undefined) {
            decoded[longKey] = payload[shortKey];
        }
    }

    if (payload.a !== undefined) {
        decodeActionMask(Number(payload.a) || 0, decoded);
    } else {
        // Normalize booleans for legacy payloads
        if (payload.j !== undefined || decoded.isJumping !== undefined) {
            decoded.isJumping = toBoolean(payload.j ?? decoded.isJumping);
        }
        if (payload.k !== undefined || decoded.isKicking !== undefined) {
            decoded.isKicking = toBoolean(payload.k ?? decoded.isKicking);
        }
        if (payload.p !== undefined || decoded.isPunching !== undefined) {
            decoded.isPunching = toBoolean(payload.p ?? decoded.isPunching);
        }
    }

    if (payload.s !== undefined) {
        decodeStatusMask(Number(payload.s) || 0, decoded);
    } else {
        if (payload.f !== undefined || decoded.facing !== undefined) {
            decoded.facing = payload.f ?? decoded.facing;
        } else {
            decoded.facing = decoded.facing || "right";
        }
        if (payload.hs !== undefined || decoded.hitStun !== undefined) {
            decoded.hitStun = payload.hs ?? decoded.hitStun ?? 0;
        } else {
            decoded.hitStun = decoded.hitStun || 0;
        }
    }

    if (!decoded.facing) {
        decoded.facing = "right";
    }

    return decoded;
};

export const encodeGameStatePayload = ({ simulationTick = 0, players = [] } = {}) => ({
    st: simulationTick,
    p: players.map((player) => encodePlayerState(player)),
});

export const decodeGameStatePayload = (payload = {}) => {
    if (!payload) {
        return { simulationTick: 0, players: [] };
    }

    if (Array.isArray(payload.players)) {
        return {
            simulationTick: payload.simulationTick ?? 0,
            players: payload.players.map((player) => decodePlayerState(player)),
        };
    }

    const simulationTick = payload.st ?? payload.simulationTick ?? 0;
    const playersPayload = Array.isArray(payload.p) ? payload.p : payload.players || [];

    return {
        simulationTick,
        players: playersPayload.map((player) => decodePlayerState(player)),
    };
};
