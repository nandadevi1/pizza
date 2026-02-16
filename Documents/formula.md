# Pizza Dough App Formula Spec (Implementation-Focused)

## Scope
This spec defines only the calculations the web app should implement.
It excludes mixer-specific instructions, shaping technique, pan handling, and oven operation details.

## Design Goals From Source Material
- Fermentation timing is schedule-first and temperature-sensitive.
- Use baker's percentages as the canonical ingredient model.
- Room-temperature baseline is 21 C (70 F).
- Cold-proof workflows are common for thin/medium crust; tempering is required before shaping/baking.
- Autolyse is optional and mainly useful for high-hydration doughs.

## App Inputs
- `flour_g` (default: `180`)
- `hydration_pct` (default: `65`)
- `room_temp_c` (default: `20`)
- `proof_mode` (enum):
  - `same_day_room`
  - `cold_24h`
  - `cold_48h`
- `dough_family` (enum):
  - `medium_crust` (default)
  - `high_hydration`

## App Outputs
- Ingredients (grams): `water_g`, `salt_g`, `instant_dry_yeast_g`
- Stage durations (seconds):
  - `autolyse_sec`
  - `bulk_or_bench_sec`
  - `final_proof_sec`
  - `temper_sec`
- Derived status info:
  - `target_use_time`
  - `schedule_total_sec`

## Canonical Ingredient Model (Baker's %)
Use flour as 100%.

### Hydration
- `water_pct = hydration_pct`
- `water_g = flour_g * water_pct / 100`

### Salt
From the source ranges (roughly ~2.1% to ~3.2%), set app default to a practical midpoint:
- `salt_pct = 2.5`
- `salt_g = flour_g * 0.025`

### Instant Dry Yeast (IDY)
Use a temperature-time normalized model to make yeast amount track schedule.

#### Fermentation activity factor
- `activity(T) = 2 ^ ((T - 21) / 10)`

#### Effective fermentation units (EFU)
Sum EFU over planned fermentation windows:
- `EFU = sum(hours_i * activity(temp_i))`

For app modes:
- `same_day_room`:
  - fermentation windows:
    - bulk/bench at `room_temp_c`
    - final proof at `room_temp_c`
- `cold_24h`:
  - windows:
    - short room stage at `room_temp_c`
    - cold stage at `4 C` for 24h
    - temper at `room_temp_c` (2h)
- `cold_48h`:
  - windows:
    - short room stage at `room_temp_c`
    - cold stage at `4 C` for 48h
    - temper at `room_temp_c` (2h)

#### Yeast percentage formula
Calibrated to align with same-day thin-crust style ranges from source (high yeast for short room proof, much lower for long schedules):
- `yeast_pct = clamp(0.03, 1.00, 1.6 / EFU)`
- `instant_dry_yeast_g = flour_g * yeast_pct / 100`

## Stage Logic

### 1) Autolyse
Only recommended for high-hydration workflows.
- if `dough_family == high_hydration`: `autolyse_sec = 20 to 30 min` (use `25 * 60` default)
- else: `autolyse_sec = 0`

### 2) Bulk or Bench
From source:
- Full-gluten workflows: bench rest ~15-20 min.
- Medium-gluten/high-hydration workflows: bulk fermentation ~2-2.5 h with folds.

App mapping:
- if `dough_family == high_hydration`:
  - `bulk_or_bench_sec = 2.25 * 3600`
- else:
  - `bulk_or_bench_sec = 20 * 60`

### 3) Final Proof (mode-based base values)
Use source-aligned base times at baseline temperatures.

- `same_day_room`:
  - medium_crust: `3h`
  - high_hydration: `3h`
- `cold_24h`: cold proof `24h`
- `cold_48h`: cold proof `48h`

Temperature correction for room proofs only:
- `room_proof_adjust = activity(21) / activity(room_temp_c)`
- `final_proof_room_sec = base_room_proof_sec * room_proof_adjust`

For cold modes:
- cold block is fixed (`24h` or `48h` at 4 C)

### 4) Tempering
Source guidance: cold-proofed medium crust should temper ~2h before shaping/baking.
- if mode is `cold_24h` or `cold_48h`: `temper_sec = 2 * 3600`
- else: `temper_sec = 0`

## Concrete Duration Assembly

### same_day_room
- `autolyse_sec` (0 or 1500)
- `bulk_or_bench_sec` (1200 or 8100)
- `final_proof_sec = final_proof_room_sec`
- `temper_sec = 0`

### cold_24h
- `autolyse_sec` (0 or 1500)
- `bulk_or_bench_sec` (1200 or 8100)
- `final_proof_sec = 24 * 3600`
- `temper_sec = 2 * 3600`

### cold_48h
- `autolyse_sec` (0 or 1500)
- `bulk_or_bench_sec` (1200 or 8100)
- `final_proof_sec = 48 * 3600`
- `temper_sec = 2 * 3600`

## Validation Rules
- `flour_g > 0`
- `hydration_pct` recommended range: `55-87` (from source style spread)
- `room_temp_c` practical range: `15-30`
- If `hydration_pct >= 75`, force `dough_family = high_hydration` unless user explicitly overrides.

## Rounding Rules
- Display grams with `1` decimal for water and `2` decimals for salt/yeast.
- Keep internal computation in full precision; round only for UI.
- Stage durations stored as integer seconds.

## What Not To Encode In This App Version
- Preferment net-content accounting (poolish/levain flour-water carryover)
- Mixer-type-specific timing
- Fold counting as a separate timer stage
- Dough CPR / recovery workflows
- Pan-specific proofing/baking variations

## Default Startup State
- `flour_g = 180`
- `room_temp_c = 20`
- `hydration_pct = 65`
- `dough_family = medium_crust`
- `proof_mode = same_day_room`
