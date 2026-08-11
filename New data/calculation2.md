# Pizza Dough Calculator 2
## Fully configurable fermentation, hydration, yeast, salt, refrigerator and oven model

Version 2.0 — 2026-08-10

> **UPDATE (2026-08-11):** The default yeast percentage changed from **0.10%** to **1.0%**, based on Tony Gemignani, *The Pizza Bible* (2014), "Master Dough without Starter" (4.5 g active dry yeast / 453 g flour = 1.0%). Yeast remains a configurable input; the examples below that reference 0.10% are superseded.

## Purpose

Calculation 1 used fixed conditions:

- Oven: 220°C
- Refrigerator: 7°C
- Salt: 2.5%
- Yeast: Saf-Instant Red
- Flour: Caputo 00 Pizzeria or Spanish T65

Calculation 2 makes these **configurable inputs**. The above values remain the defaults, but changing them must trigger the relevant downstream calculations.

The calculator must distinguish:

1. exact mathematics;
2. empirical estimates;
3. user overrides;
4. unknown/insufficient information.

It must never present an empirical fermentation estimate as exact.

---

# 1. Inputs

## Flour

Required:

```text
Flour amount (g)
Flour/product
```

Recommended:

```text
Brand
Protein %
W
P/L
Manufacturer hydration guidance
```

Optional:

```text
Whole-grain %
Rye %
Other flour %
```

For blends, flour = 100% is the **combined flour weight**.

## Fermentation

```text
Ambient temperature
Target final dough temperature (DDT)
Refrigerator temperature
Planned cold-fermentation duration
Ball before/after refrigeration
```

## Yeast

```text
Brand
Product
Type: IDY / ADY / fresh / other
Manufacturer dosage/reference
Activity factor, if known
```

Default:

```text
Saf-Instant Red
IDY
activity factor = 1.00
```

Do not assume another yeast is equivalent to Saf Red without evidence.

## Formula

```text
Salt %
Hydration: AUTO / MANUAL
```

Default salt:

```text
2.5%
```

Suggested normal pizza range:

```text
2.0–3.0%
```

## Baking

```text
Oven temperature
Pizza diameter
Crust style/thickness
Baking surface: steel / stone / tray / other
Preheat duration
Expected bake time
Top/bottom heat configuration
Convection: on/off
Topping moisture: low / medium / high
```

## Measurement

```text
Scale resolution
```

Useful because long-fermented pizza may require only 0.1–0.3 g IDY.

---

# 2. Recipe mathematics

Flour is always 100%.

For any ingredient:

```text
ingredient_g = flour_g × baker_percent / 100
```

Water:

```text
water_g = flour_g × hydration_percent / 100
```

Salt:

```text
salt_g = flour_g × salt_percent / 100
```

Total dough:

```text
total_dough_g =
    flour_g + water_g + salt_g + yeast_g + other_ingredients_g
```

Hydration:

```text
hydration_percent = total_water_g / total_flour_g × 100
```

If preferments are later supported, their flour and water must be included in total flour and total water.

Reference:
https://www.kingarthurbaking.com/blog/2023/01/11/bread-hydration

---

# 3. Hydration is now a model, not a fixed value

Hydration depends on:

- flour characteristics;
- oven temperature;
- pizza diameter/thickness;
- baking surface;
- expected bake time;
- topping moisture;
- desired crust;
- handling preference.

King Arthur specifically recommends tailoring pizza hydration to baking temperature because wetter dough can require longer baking in a conventional home oven and overbake the interior.

Reference:
https://www.kingarthurbaking.com/blog/2021/04/21/top-tips-for-artisan-pizza

## Starting hydration profiles

Current defaults:

| Flour | Starting hydration |
|---|---:|
| Caputo 00 Pizzeria | 62% |
| Spanish T65 | 61% |

These are **profiles**, not universal properties of all 00 or T65 flours.

If the exact flour's specifications are unknown, reduce confidence.

## Oven correction

Initial heuristic, relative to the 220°C baseline:

| Oven | Starting correction |
|---|---:|
| 200°C | -2 points |
| 210°C | -1 |
| 220°C | 0 |
| 230°C | +0.5 |
| 240°C | +1 |
| 250°C | +1.5 |
| 275°C | +2.5 |
| 300°C | +3.5 |
| 350°C | +5 |

Do not extrapolate this indefinitely. Above roughly 300°C the baking regime changes substantially.

Conceptually:

```text
hydration_target =
    flour_base
    + oven_correction
    + geometry_correction
    + surface_correction
    + bake_time_correction
    + topping_correction
```

These corrections are **heuristics**, not physical constants.

## Geometry

Starting guidance:

| Style | Correction |
|---|---:|
| Very thin/crispy | -1 to -2 |
| Thin/Neapolitan-inspired | 0 |
| Medium | +1 |
| Thick/pan | +2 to +5 |

## Surface

Small starting corrections:

| Surface | Correction |
|---|---:|
| Thin tray | -1 |
| Heavy tray | 0 |
| Stone | 0 |
| Steel | +0.5 |

## Topping moisture

| Toppings | Correction |
|---|---:|
| Low moisture | 0 |
| Medium | -0.5 |
| High | -1 |

The calculator should also recommend draining/reducing wet toppings rather than relying entirely on lower dough hydration.

## Manual hydration

If the user supplies a hydration value:

```text
Hydration mode = MANUAL
```

and it overrides AUTO.

Output both:

```text
Calculated recommendation: XX%
User override: YY%
Using: YY%
```

---

# 4. Salt is configurable

Default:

```text
2.5%
```

Formula:

```text
salt_g = flour_g × salt_percent / 100
```

Example:

```text
180 g × 2.5% = 4.50 g
```

Salt also affects fermentation. King Arthur notes that salt retards yeast fermentation through osmotic effects.

Reference:
https://www.kingarthurbaking.com/pro/reference/yeast

The calculator should therefore apply a **small empirical salt correction** to fermentation, not a supposedly exact linear formula.

Suggested interpretation:

| Salt | Fermentation tendency |
|---:|---|
| 2.0% | slightly faster |
| 2.5% | baseline |
| 3.0% | slightly slower |

Do not change hydration when only salt changes.

---

# 5. Yeast is configurable

The yeast calculation must account for:

```text
yeast product
yeast type
yeast activity
ambient temperature
dough temperature
room-stage duration
refrigerator temperature
cold duration
final warm-up
salt
flour
```

Conceptually:

```text
total_fermentation_load =
    room_load + cold_load + final_warm_load
```

and:

```text
required_yeast =
    target_fermentation_load / effective_yeast_activity
```

The exact target load must be calibrated empirically.

## Important yeast rule

Do not equate:

```text
0.10% Saf Red
```

with:

```text
0.10% Brand X
```

unless manufacturer or calibration evidence supports the conversion.

Saf's current consumer guidance for Red is one 11 g sachet per 500 g–1 kg flour. That is a general home-baking dosage, not a pizza-specific long-fermentation equation.

Reference:
https://saf-instant.com/en/home-baking/our-products/saf-instant-the-original-red-11g/

If another yeast is used and no equivalence data exists:

```text
activity_factor = 1.00 (temporary assumption)
confidence = low
```

The user should then calibrate from actual batches.

---

# 6. Yeast type conversion

Distinguish:

- instant dry yeast (IDY);
- active dry yeast (ADY);
- fresh/compressed yeast;
- other yeast products.

If manufacturer conversion is available, use it.

If not:

```text
conversion = UNKNOWN
```

Do not invent equivalence.

---

# 7. Yeast measurement and minimum waste

Input:

```text
scale_resolution
```

If a 0.01 g scale is available, direct weighing is preferred.

If the required dose is below reliable scale resolution, use a **fresh dilution**.

Example:

```text
1.00 g yeast + 9.00 g water = 10.00 g suspension
```

Concentration:

```text
10% yeast
```

If target yeast = 0.18 g:

```text
required suspension = 0.18 / 0.10 = 1.80 g
```

Water contributed by the suspension:

```text
1.80 - 0.18 = 1.62 g
```

Therefore:

```text
direct dough water =
    calculated water - suspension water
```

The calculator must show this explicitly.

Prepare only a small fresh dilution when needed; do not silently create a multi-day yeast stock.

Saf says its opened 11 g Red sachet should be used within 48 hours, stored cool and dry, and that the yeast does not require rehydration.

Reference:
https://saf-instant.com/en/home-baking/our-products/saf-instant-the-original-red-11g/

---

# 8. Dough temperature

Ambient temperature is not the same as dough temperature.

King Arthur identifies dough temperature as a major control variable for fermentation consistency and recommends controlling final dough temperature.

Reference:
https://www.kingarthurbaking.com/pro/reference/dough-temperature

Default target:

```text
DDT = 24–25°C
```

Input:

```text
target_DDT
```

Optional water-temperature calculation may use:

```text
target_DDT
flour temperature
room temperature
other ingredient temperatures
mixer/hand-mixing friction
```

A universal friction factor must not be assumed. If unknown, the calculator should recommend checking actual dough temperature after mixing.

---

# 9. Room-temperature fermentation

Do not output a single rigid time.

Output:

```text
Predicted RT window: X–Y h
Start checking: X h
```

The final refrigeration trigger is dough condition.

Starting target:

```text
~30–50% volume increase
```

plus:

- visible gas development;
- relaxed gluten;
- increased extensibility;
- structure retained;
- no collapse.

If the dough reaches the target earlier:

```text
refrigerate earlier
```

If it is clearly underdeveloped:

```text
continue RT fermentation
```

Temperature affects yeast activity, but the calculator should not pretend to predict the exact minute.

---

# 10. Refrigerator is configurable

Default:

```text
7°C
```

Input:

```text
fridge_temperature
```

The calculator must treat 4°C, 7°C and 10°C as different fermentation environments.

Cold fermentation slows yeast but does not necessarily stop it.

Baking Steel reports continued slow fermentation in refrigerated pizza dough and describes useful 24–48 h and 48–72 h windows in its own system.

Reference:
https://bakingsteel.com/blogs/recipes/how-long-does-pizza-dough-last-in-the-fridge

That source is evidence for the principle, not a universal formula.

## Cold-stage model

A first approximation can use:

```text
temperature_factor(T) =
    2 ^ ((T - reference_temperature) / 10)
```

This is a Q10-style approximation and must be treated as an empirical model, not exact yeast kinetics.

The calculator should label cold-stage predictions:

```text
ESTIMATE
```

---

# 11. Planned cold duration

Input:

```text
Overnight
18–24 h
24–48 h
48–72 h
72–96 h
Custom
```

Changing cold duration must recalculate the yeast requirement.

A dough intended for 24 h cold fermentation should not automatically use the same yeast dose as a dough intended for 72 h at the same refrigerator temperature.

---

# 12. Fermentation sequence

Configurable:

```text
Bulk RT → ball → cold
Bulk RT → cold → ball
Ball RT → cold
Bulk cold → ball → final proof
```

Default:

```text
Bulk RT → ball → cold → final warm-up
```

The selected sequence must be reflected in the fermentation load.

---

# 13. Final warm-up

Inputs:

```text
warm-up temperature
```

Default:

```text
ambient
```

Output:

```text
Estimated warm-up window: X–Y h
```

Final dough condition overrides the clock.

---

# 14. Oven is configurable

Inputs:

```text
oven_temperature
pizza_diameter
crust_style
baking_surface
preheat_duration
expected_bake_time
top_heat
bottom_heat
convection
topping_moisture
```

The calculator should distinguish:

```text
oven air temperature
```

from:

```text
baking-surface temperature
```

when the user has measured the latter.

A steel/stone can materially affect heat transfer even when oven air temperature is unchanged.

---

# 15. Expected bake time

Input:

```text
Expected bake time
```

If unknown:

```text
AUTO
```

The calculator should use bake time as a constraint on hydration.

For a conventional low-temperature oven, long baking generally favors lower hydration.

Reference:
https://www.kingarthurbaking.com/blog/2021/04/21/top-tips-for-artisan-pizza

---

# 16. Desired dough weight mode

Support two calculation modes.

## Flour-first

User supplies:

```text
flour_g
```

All other weights follow.

## Dough-weight-first

User supplies:

```text
target_dough_weight
```

Solve:

```text
flour =
    target_dough_weight / total_baker_percentage
```

Then calculate all ingredients.

---

# 17. Calculation order

The engine should execute in this order:

```text
INPUTS
  |
  +--> Flour profile
  +--> Oven profile
  +--> Refrigerator profile
  +--> Yeast profile
  +--> Salt %
  +--> Ambient temperature
  +--> DDT
  +--> Cold duration
  +--> Pizza geometry
  +--> Baking surface
  +--> Topping moisture
          |
          v
HYDRATION MODEL
          |
          v
WATER AMOUNT
          |
          v
SALT AMOUNT
          |
          v
FERMENTATION MODEL
          |
          v
YEAST DOSE
          |
          v
ROOM-TEMPERATURE WINDOW
          |
          v
COLD-STAGE LOAD
          |
          v
FINAL WARM-UP
          |
          v
BAKE STRATEGY
```

Important separation:

- changing **oven temperature** changes hydration/baking recommendations, not yeast directly;
- changing **fridge temperature** changes cold fermentation, not hydration directly;
- changing **salt** changes salt weight and may modestly affect fermentation;
- changing **yeast product** changes yeast calculation;
- changing **flour** changes hydration and potentially fermentation behavior.

---

# 18. Output format

Every calculation should return:

```text
FORMULA
-------
Flour:
Water:
Hydration:
Salt:
Salt %:
Yeast:
Yeast %:
Total dough:

FERMENTATION
------------
Ambient:
Target DDT:
Predicted RT window:
Start checking:
Refrigeration trigger:
Fridge:
Cold duration:
Final warm-up:

BAKING
------
Oven:
Surface:
Preheat:
Expected bake:
Hydration rationale:
Topping advice:

MEASUREMENT
-----------
Scale resolution:
Direct yeast weight:
Dilution required:
Dilution instructions:

CONFIDENCE
----------
Hydration:
Yeast:
Fermentation:
Main uncertainty:
```

---

# 19. Confidence system

## High

Known:

- flour;
- yeast;
- ambient;
- dough temperature;
- refrigerator;
- fermentation duration;
- oven.

And conditions are within the calibrated operating range.

## Medium

One or two important values are inferred.

## Low

Examples:

- unknown yeast activity;
- unknown flour strength;
- very high ambient temperature;
- unusual refrigerator temperature;
- very long fermentation;
- extrapolation beyond tested oven range.

The calculator must identify the reason for low confidence.

---

# 20. Calibration database

Each batch should optionally be logged:

```text
Date
Flour/product
Flour amount
Protein/W/P-L
Ambient
Dough temperature
Hydration
Salt %
Yeast brand/product/type
Yeast %
RT duration
Fridge temperature
Cold duration
Final warm-up
Oven temperature
Bake time
Surface
Result
```

Useful observations:

```text
Volume increase before refrigeration
Volume after cold fermentation
Stretchability
Gas development
Tear/recoil
Crumb
Bottom color
Top color
Center moisture
Overall result
```

The purpose is to turn the calculator from a generic model into a progressively calibrated model for the user's kitchen.

---

# 21. Calibration rules

If dough is too fast:

```text
reduce yeast
and/or
shorten RT stage
```

If dough is too slow:

```text
increase yeast
and/or
extend RT stage
```

If crust is wet/gummy after a long bake:

```text
reduce hydration
and/or
reduce topping moisture
and/or
improve heat transfer
```

If crust is dry:

```text
increase hydration slightly
and/or
reduce bake time
```

Do not change several major variables simultaneously unless necessary.

---

# 22. Default profile

For backward compatibility:

```text
PROFILE: HOME-OVEN-220-7C

Oven: 220°C
Fridge: 7°C
Salt: 2.5%
Yeast: Saf-Instant Red
Yeast activity factor: 1.00
Caputo 00 Pizzeria: 62%
Spanish T65: 61% provisional
```

These are defaults, not hard-coded constants.

If the user changes any value, the active profile becomes:

```text
CUSTOM
```

The default profile remains available as a preset.

---

# 23. Minimum input for a fully configurable calculation

Required:

```text
1. Flour amount
2. Flour/product
3. Ambient temperature
4. Oven temperature
5. Refrigerator temperature
6. Yeast product/type
7. Salt %
8. Planned cold duration
9. Pizza diameter/style
10. Baking surface
```

Strongly recommended:

```text
11. Dough temperature after mixing
12. Flour protein %
13. Flour W
14. Expected bake time
15. Topping moisture
16. Desired dough-ball weight
17. Scale resolution
```

---

# 24. What the calculator must never do

1. Treat manufacturer's general yeast dosage as a pizza fermentation equation.
2. Treat different yeast products as automatically equivalent.
3. Treat all 00 or T65 flours as equivalent.
4. Treat ambient temperature as dough temperature.
5. Assume refrigeration stops fermentation.
6. Give false precision such as "3.72 h fermentation."
7. Change yeast merely because oven temperature changed.
8. Change hydration merely because refrigerator temperature changed.
9. Hide a user override.
10. Present extrapolation as validated data.

---

# 25. Evidence status

### Strong evidence

- Baker's percentage and hydration mathematics.
- Dough temperature as a major fermentation-control variable.
- Salt retards yeast activity.
- Pizza hydration should be adapted to baking temperature.
- Refrigeration slows rather than necessarily stops fermentation.
- Saf-Instant Red is instant dry yeast intended for lean/low-sugar doughs including pizza.

Sources:

King Arthur — Dough Temperature:
https://www.kingarthurbaking.com/pro/reference/dough-temperature

King Arthur — Yeast:
https://www.kingarthurbaking.com/pro/reference/yeast

King Arthur — Artisan Pizza:
https://www.kingarthurbaking.com/blog/2021/04/21/top-tips-for-artisan-pizza

King Arthur — Bread Hydration:
https://www.kingarthurbaking.com/blog/2023/01/11/bread-hydration

Saf-instant — The Original Red:
https://saf-instant.com/en/home-baking/our-products/saf-instant-the-original-red-11g/

### Model assumptions requiring calibration

- exact yeast percentage;
- temperature-to-fermentation-rate relationship;
- flour-specific hydration correction;
- oven-temperature hydration correction;
- geometry correction;
- surface correction;
- salt-to-fermentation correction;
- yeast activity factors between brands.

These must be labeled estimates.

---

# 26. Core design principle

The calculator should not answer only:

> "What is the recipe?"

It should answer:

> **"Given this flour, yeast, salt, ambient temperature, refrigerator, oven and fermentation schedule, what is the most defensible starting formula, what are the uncertainties, and what should I monitor to correct it?"**

That is the architecture needed for a calculator that remains useful when the kitchen changes.
