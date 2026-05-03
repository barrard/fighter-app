# Changelog

## 2026-05-02

### Character System

- Reduced the playable roster from 12 fighters to 6:
  `Knight`, `Mage`, `Archer`, `Rogue`, `Berserker`, `Monk`.
- Expanded `shared/Characters.js` to include:
  - per-fighter combat tuning
  - procedural visual metadata
  - optional ranged attack definitions

### Input and Combat

- Added a universal ranged combo command: `forward, forward, X`.
- Implemented shared combo detection logic in `shared/comboSystem.js`.
- Extended `ATTACK_TYPES` with `RANGED`.
- Wired combo-aware ranged activation into both:
  - client prediction/input handling
  - authoritative server input processing

### Ranged Attack Architecture

- Replaced the old "instant long-range hitbox" approach with a deterministic
  startup-and-flight model.
- Added `shared/projectileSim.js` so server and client derive projectile spawn
  and travel from the same inputs.
- Server now snapshots:
  - `attackStartTick`
  - `projectileSpawnX`
  - `projectileSpawnHeight`
- Server remains authoritative for:
  - move validation
  - hit detection
  - damage
  - knockback

### Rendering and Sandbox

- Upgraded procedural fighter rendering with stronger silhouettes, accessories,
  and weapon cues.
- Updated character select portraits to match the new 6-fighter roster.
- Updated `TrainingGrounds` and `AnimationTest` to serve as the first sandbox
  for combo/ranged/animation work.

### Verification

- Verified client build with `npm run build` in `react-fighter`.
- Verified server syntax with `node --check` on changed server files.
- `npm run lint` still reports pre-existing repo issues outside the scope of
  this change set.
