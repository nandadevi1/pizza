# Pizza Dough Calculator — Reference Document for LLMs

> **CRITICAL — READ THIS FIRST**
>
> This document lets you (an LLM) calculate pizza dough ingredients **identically** to the Dingo Pizza web app. You must follow every step. **The yeast amount is NOT optional, NOT approximate, and must NEVER be skipped.** It is always calculated using the formulas below. Do not round prematurely. Do not use "typical" or "standard" yeast amounts from memory. Do not omit yeast because the amount seems small. The yeast is **SAF-Instant Red** (instant dry yeast, *Saccharomyces cerevisiae*, ~97% yeast cells, ~3% moisture). Mix directly into flour — no rehydration needed.
>
> **Product:** [SAF-Instant Red](https://saf-instant.com/en/home-baking/our-products/saf-instant-the-original-red-11g/) — "The Original Red" instant dry yeast, recommended for pizza, bread, baguette (lean/low-sugar doughs). Available in 11g sachets. The #1-selling instant yeast worldwide, made by Lesaffre.
>
> **If a user asks for pizza dough ingredients, you MUST calculate all four outputs: water, yeast, salt, and timeline. Never skip yeast.**

---

## 1. Inputs

| Input | Unit | Valid Range | Default | Description |
|-------|------|-------------|---------|-------------|
| **Flour** | grams | > 0 | 180 | Weight of flour (the 100% baker's-percentage base) |
| **Room temperature** | °C | 0–40 | 20 | Ambient room temperature during room-temperature stages |
| **Hydration** | % | 40–90 | 65 | Water as a percentage of flour weight |
| **Proof mode** | — | `room_overnight` or `room_temperature` | `room_overnight` | Fermentation/proofing strategy |

If the user does not specify hydration, use **65%**. If the user does not specify proof mode, use **`room_overnight`** (the app default). If the user does not specify temperature, use **20°C**.

### Proof modes

- **`room_overnight`** — Autolyse → Bulk/bench rest → Room fermentation (5 h) → Overnight cold proof (12 h at 4 °C) → Temper (2 h at room temp). Total ≈ 19–20 h.
- **`room_temperature`** — Autolyse → Bulk/bench rest → Final proof at room temperature (≈3 h, adjusted for temperature). Total ≈ 3.5–4 h.

---

## 2. ⚠️ MANDATORY YEAST CALCULATION — DO NOT SKIP

> **The yeast is SAF-Instant Red instant dry yeast.**
> The amount is computed from a fermentation model. It varies with temperature, hydration, and proof mode. **You must calculate it every time.** Do not use a fixed amount. Do not approximate. Do not skip this step because the number is small (it will often be less than 1 gram — that is correct).

### The yeast calculation has exactly 7 steps. Follow them in order:

### Step 1: Clamp temperature

```
roomTempC = clamp(0, 40, inputTemp)
```

Where `clamp(min, max, value)` means: if value < 0, use 0; if value > 40, use 40; otherwise use value. The full range 0–40°C is supported. Do not reject any temperature in this range.

### Step 2: Compute the activity factor

This is the Q10 model. Yeast activity doubles every 10°C above 21°C and halves every 10°C below.

```
af = 2 ^ ((roomTempC - 21) / 10)
```

You must compute this with the actual temperature. Use a calculator. Examples:

| Temperature | Calculation | Factor |
|-------------|-------------|--------|
| 0 °C | 2^(-2.1) | 0.2333 |
| 5 °C | 2^(-1.6) | 0.3299 |
| 10 °C | 2^(-1.1) | 0.4665 |
| 12 °C | 2^(-0.9) | 0.5359 |
| 15 °C | 2^(-0.6) | 0.6598 |
| 18 °C | 2^(-0.3) | 0.8123 |
| 20 °C | 2^(-0.1) | 0.9330 |
| 21 °C | 2^(0) | 1.0000 |
| 22 °C | 2^(0.1) | 1.0718 |
| 24 °C | 2^(0.3) | 1.2311 |
| 25 °C | 2^(0.4) | 1.3195 |
| 26 °C | 2^(0.5) | 1.4142 |
| 28 °C | 2^(0.7) | 1.6245 |
| 30 °C | 2^(0.9) | 1.8661 |
| 32 °C | 2^(1.1) | 2.1435 |
| 35 °C | 2^(1.4) | 2.6390 |
| 37 °C | 2^(1.6) | 3.0314 |
| 40 °C | 2^(1.9) | 3.7321 |

Also compute the cold-temperature activity factor (always the same):

```
afCold = 2 ^ ((4 - 21) / 10) = 2^(-1.7) = 0.3078
```

### Step 3: Determine the bulk/bench duration

```
IF hydration ≥ 75:
    bulkHours = 2.25        (high-hydration doughs get bulk fermentation)
ELSE:
    bulkHours = 20/60 = 0.3333   (normal doughs get a bench rest)
```

### Step 4: Compute the Effective Fermentation Units (EFU)

The EFU is the total "fermentation work." Each stage contributes `hours × activityFactor(temperature)`.

**IF proof mode is `room_temperature`:**

```
proofHours = 3 / af          (proof time adjusts inversely with temperature)
EFU = (bulkHours + proofHours) × af
```

This simplifies to: `EFU = bulkHours × af + 3` (the proof always contributes exactly 3 EFU).

**IF proof mode is `room_overnight`:**

```
roomFermentHours = 5         (fixed)
temperHours = 2              (fixed)
coldProofHours = 12          (fixed, at 4°C)

EFU = (bulkHours + roomFermentHours + temperHours) × af + coldProofHours × afCold
    = (bulkHours + 5 + 2) × af + 12 × 0.3078
    = (bulkHours + 7) × af + 3.6934
```

### Step 5: Compute the yeast percentage

```
yeastPct = 1.6 / EFU
```

Then clamp to the allowed range:

```
IF yeastPct < 0.03: yeastPct = 0.03
IF yeastPct > 1.0:  yeastPct = 1.0
```

The result is a baker's percentage (percentage of flour weight). It will typically be between 0.03% and 0.5%.

### Step 6: Compute the yeast weight in grams

```
yeastGrams = flour × yeastPct / 100
```

Round to **2 decimal places**.

### Step 7: State the result clearly

Always state:
- The yeast percentage (e.g., "0.15%")
- The yeast weight (e.g., "0.27g")
- That it is SAF-Instant Red instant dry yeast
- That the amount is small but correct for the fermentation time

**Example statement:** "Use 0.27g of SAF-Instant Red instant dry yeast (0.15% of flour weight). This small amount is correct — the long overnight fermentation (19+ hours with 12h cold proof) requires very little yeast."

---

## 3. Other Ingredients (simple — but still calculate)

### Water

```
waterGrams = flour × hydration / 100
```

Round to **1 decimal place**.

### Salt

```
saltGrams = flour × 0.025
```

Round to **2 decimal places**.

Salt is always 2.5% of flour weight. This is fixed and never changes.

---

## 4. Complete Calculation Template

When a user asks for ingredients, follow this exact template:

```
GIVEN: flour = ___ g, temp = ___ °C, hydration = ___ %, proofMode = ___

STEP 1: roomTempC = clamp(0, 40, temp) = ___
STEP 2: af = 2^((roomTempC - 21)/10) = ___
         afCold = 0.3078 (constant)
STEP 3: bulkHours = (hydration ≥ 75) ? 2.25 : 0.3333 = ___
STEP 4: EFU = ___ (see formula for proof mode)
STEP 5: yeastPct = clamp(0.03, 1.0, 1.6 / EFU) = ___%
STEP 6: yeastGrams = flour × yeastPct / 100 = ___ g (2 decimals)

waterGrams = flour × hydration / 100 = ___ g (1 decimal)
saltGrams = flour × 0.025 = ___ g (2 decimals)
```

---

## 5. Constants Reference

| Constant | Value | Notes |
|----------|-------|-------|
| Reference temperature | 21 °C | Activity factor = 1.0 at this temperature |
| Cold proof temperature | 4 °C | Assumed refrigerator temperature |
| Q10 coefficient | 2 | Yeast activity doubles per 10°C |
| Target EFU | 1.6 | Yeast % = 1.6 / EFU |
| Min yeast % | 0.03% | Clamp lower bound |
| Max yeast % | 1.0% | Clamp upper bound |
| Salt % | 2.5% | Fixed, always |
| Autolyse | 25 min | Fixed, all modes |
| Bench rest (hydration < 75%) | 20 min (0.3333 h) | Fixed |
| Bulk ferment (hydration ≥ 75%) | 2.25 h | Fixed |
| Room fermentation (overnight) | 5 h | Fixed |
| Overnight cold proof | 12 h at 4°C | Fixed |
| Final proof base (room temp mode) | 3 h at 21°C | Adjusted: 3/af hours |
| Temper | 2 h | Overnight mode only |

---

## 6. Worked Examples — YEAST FOCUS

Each example shows the full yeast calculation step by step. **Read these carefully.**

### Example 1: 180g flour, 28°C, 65% hydration, room_overnight (DEFAULT)

This is the exact example from the user's question.

```
STEP 1: roomTempC = 28 (within 0–40, no clamping)

STEP 2: af = 2^((28-21)/10) = 2^0.7 = 1.6245
         afCold = 0.3078

STEP 3: bulkHours = 0.3333 (hydration 65 < 75)

STEP 4: EFU = (0.3333 + 5 + 2) × 1.6245 + 12 × 0.3078
            = 7.3333 × 1.6245 + 3.6934
            = 11.9131 + 3.6934
            = 15.6065

STEP 5: yeastPct = 1.6 / 15.6065 = 0.1025%
         (within 0.03–1.0, no clamping needed)

STEP 6: yeastGrams = 180 × 0.1025 / 100 = 0.18 g

waterGrams = 180 × 65 / 100 = 117.0 g
saltGrams = 180 × 0.025 = 4.50 g
```

**Result:**
- **Flour:** 180 g
- **Water:** 117.0 g
- **SAF-Instant Red yeast:** 0.18 g (0.10% of flour weight)
- **Salt:** 4.50 g

> The yeast amount is tiny — less than 0.2g. This is **correct**. At 28°C with 19+ hours of total fermentation (including 12h cold proof), very little yeast is needed. More yeast would cause overproofing.

### Example 2: 180g flour, 20°C, 65% hydration, room_overnight

```
STEP 1: roomTempC = 20
STEP 2: af = 2^(-0.1) = 0.9330; afCold = 0.3078
STEP 3: bulkHours = 0.3333
STEP 4: EFU = (0.3333 + 5 + 2) × 0.9330 + 12 × 0.3078
            = 7.3333 × 0.9330 + 3.6934
            = 6.8420 + 3.6934
            = 10.5354
STEP 5: yeastPct = 1.6 / 10.5354 = 0.1519%
STEP 6: yeastGrams = 180 × 0.1519 / 100 = 0.27 g

water = 117.0 g, salt = 4.50 g
```

**Result:** 117.0 g water, **0.27 g SAF-Instant Red yeast** (0.15%), 4.50 g salt.

> Note: at 20°C (cooler than 28°C), more yeast is needed (0.27g vs 0.18g) because yeast is less active at lower temperatures. The EFU model captures this automatically.

### Example 3: 180g flour, 28°C, 65% hydration, room_temperature

```
STEP 1: roomTempC = 28
STEP 2: af = 1.6245; afCold = 0.3078
STEP 3: bulkHours = 0.3333
STEP 4: proofHours = 3 / 1.6245 = 1.8467
         EFU = (0.3333 + 1.8467) × 1.6245
             = 2.1800 × 1.6245
             = 3.5414
STEP 5: yeastPct = 1.6 / 3.5414 = 0.4518%
STEP 6: yeastGrams = 180 × 0.4518 / 100 = 0.81 g

water = 117.0 g, salt = 4.50 g
Final proof duration = 1.85 h (1 h 51 min)
```

**Result:** 117.0 g water, **0.81 g SAF-Instant Red yeast** (0.45%), 4.50 g salt.

> Note: room_temperature mode needs much more yeast (0.81g vs 0.18g for overnight) because the total fermentation is only ~3.5 hours instead of ~19 hours. Shorter fermentation = more yeast needed.

### Example 4: 500g flour, 22°C, 65% hydration, room_overnight

```
STEP 1: roomTempC = 22
STEP 2: af = 2^(0.1) = 1.0718; afCold = 0.3078
STEP 3: bulkHours = 0.3333
STEP 4: EFU = (0.3333 + 5 + 2) × 1.0718 + 12 × 0.3078
            = 7.3333 × 1.0718 + 3.6934
            = 7.8598 + 3.6934
            = 11.5532
STEP 5: yeastPct = 1.6 / 11.5532 = 0.1385%
STEP 6: yeastGrams = 500 × 0.1385 / 100 = 0.69 g

water = 500 × 65 / 100 = 325.0 g
salt = 500 × 0.025 = 12.50 g
```

**Result:** 325.0 g water, **0.69 g SAF-Instant Red yeast** (0.14%), 12.50 g salt.

### Example 5: 180g flour, 20°C, 80% hydration, room_overnight (HIGH HYDRATION)

```
STEP 1: roomTempC = 20
STEP 2: af = 0.9330; afCold = 0.3078
STEP 3: bulkHours = 2.25 (hydration 80 ≥ 75!)
STEP 4: EFU = (2.25 + 5 + 2) × 0.9330 + 12 × 0.3078
            = 9.25 × 0.9330 + 3.6934
            = 8.2803 + 3.6934
            = 11.9737
STEP 5: yeastPct = 1.6 / 11.9737 = 0.1336%
STEP 6: yeastGrams = 180 × 0.1336 / 100 = 0.24 g

water = 180 × 80 / 100 = 144.0 g
salt = 4.50 g
```

**Result:** 144.0 g water, **0.24 g SAF-Instant Red yeast** (0.13%), 4.50 g salt.

> Note: high hydration (80%) changes bulkHours from 0.3333 to 2.25, which increases EFU and slightly decreases yeast. The water also increases from 117.0g to 144.0g.

### Example 6: 1000g flour, 21°C, 65% hydration, room_overnight

```
STEP 1: roomTempC = 21
STEP 2: af = 2^0 = 1.0000; afCold = 0.3078
STEP 3: bulkHours = 0.3333
STEP 4: EFU = (0.3333 + 5 + 2) × 1.0 + 12 × 0.3078
            = 7.3333 + 3.6934
            = 11.0267
STEP 5: yeastPct = 1.6 / 11.0267 = 0.1451%
STEP 6: yeastGrams = 1000 × 0.1451 / 100 = 1.45 g

water = 650.0 g, salt = 25.00 g
```

**Result:** 650.0 g water, **1.45 g SAF-Instant Red yeast** (0.15%), 25.00 g salt.

### Example 7: 250g flour, 22°C, 70% hydration, room_temperature

```
STEP 1: roomTempC = 22
STEP 2: af = 1.0718; afCold = 0.3078
STEP 3: bulkHours = 0.3333 (hydration 70 < 75)
STEP 4: proofHours = 3 / 1.0718 = 2.7991
         EFU = (0.3333 + 2.7991) × 1.0718
             = 3.1324 × 1.0718
             = 3.3593
STEP 5: yeastPct = 1.6 / 3.3593 = 0.4763%
STEP 6: yeastGrams = 250 × 0.4763 / 100 = 1.19 g

water = 250 × 70 / 100 = 175.0 g
salt = 250 × 0.025 = 6.25 g
Final proof = 2.80 h (2 h 48 min)
```

**Result:** 175.0 g water, **1.19 g SAF-Instant Red yeast** (0.48%), 6.25 g salt.

---

## 7. Quick Reference Table (180g flour, 65% hydration)

| Temp | Mode | af | EFU | Yeast % | Yeast (g) | Water (g) | Salt (g) |
|------|------|-----|-------|---------|-----------|-----------|----------|
| 0°C | room_overnight | 0.2333 | 5.4040 | 0.2961% | 0.53 | 117.0 | 4.50 |
| 5°C | room_overnight | 0.3299 | 6.1125 | 0.2618% | 0.47 | 117.0 | 4.50 |
| 10°C | room_overnight | 0.4665 | 7.1145 | 0.2249% | 0.40 | 117.0 | 4.50 |
| 15°C | room_overnight | 0.6598 | 8.5316 | 0.1875% | 0.34 | 117.0 | 4.50 |
| 18°C | room_overnight | 0.8123 | 9.6500 | 0.1658% | 0.30 | 117.0 | 4.50 |
| 20°C | room_overnight | 0.9330 | 10.5354 | 0.1519% | 0.27 | 117.0 | 4.50 |
| 21°C | room_overnight | 1.0000 | 11.0267 | 0.1451% | 0.26 | 117.0 | 4.50 |
| 22°C | room_overnight | 1.0718 | 11.5532 | 0.1385% | 0.25 | 117.0 | 4.50 |
| 25°C | room_overnight | 1.3195 | 13.3698 | 0.1197% | 0.22 | 117.0 | 4.50 |
| 28°C | room_overnight | 1.6245 | 15.6065 | 0.1025% | 0.18 | 117.0 | 4.50 |
| 30°C | room_overnight | 1.8661 | 17.3779 | 0.0921% | 0.17 | 117.0 | 4.50 |
| 35°C | room_overnight | 2.6390 | 23.0461 | 0.0694% | 0.12 | 117.0 | 4.50 |
| 40°C | room_overnight | 3.7321 | 31.0623 | 0.0515% | 0.09 | 117.0 | 4.50 |
| 0°C | room_temperature | 0.2333 | 3.0777 | 0.5199% | 0.94 | 117.0 | 4.50 |
| 5°C | room_temperature | 0.3299 | 3.1099 | 0.5145% | 0.93 | 117.0 | 4.50 |
| 10°C | room_temperature | 0.4665 | 3.1555 | 0.5071% | 0.91 | 117.0 | 4.50 |
| 15°C | room_temperature | 0.6598 | 3.2199 | 0.4969% | 0.89 | 117.0 | 4.50 |
| 20°C | room_temperature | 0.9330 | 3.3110 | 0.4832% | 0.87 | 117.0 | 4.50 |
| 21°C | room_temperature | 1.0000 | 3.3333 | 0.4800% | 0.86 | 117.0 | 4.50 |
| 22°C | room_temperature | 1.0718 | 3.3573 | 0.4766% | 0.86 | 117.0 | 4.50 |
| 25°C | room_temperature | 1.3195 | 3.4398 | 0.4651% | 0.84 | 117.0 | 4.50 |
| 28°C | room_temperature | 1.6245 | 3.5414 | 0.4518% | 0.81 | 117.0 | 4.50 |
| 30°C | room_temperature | 1.8661 | 3.6220 | 0.4417% | 0.80 | 117.0 | 4.50 |
| 35°C | room_temperature | 2.6390 | 3.8796 | 0.4124% | 0.74 | 117.0 | 4.50 |
| 40°C | room_temperature | 3.7321 | 4.2439 | 0.3770% | 0.68 | 117.0 | 4.50 |

---

## 8. Stage Timeline by Proof Mode

**Room overnight mode (`room_overnight`):**

| Step | Stage | Duration | Temperature |
|------|-------|----------|-------------|
| 1 | Autolyse | 25 min | Room temp |
| 2 | Bulk Fermentation / Bench Rest | 20 min (or 2.25 h if hydration ≥ 75%) | Room temp |
| 3 | Room Ferment | 5 h | Room temp |
| 4 | Overnight Cold Proof | 12 h | 4 °C (refrigerator) |
| 5 | Temper | 2 h | Room temp |

**Room temperature mode (`room_temperature`):**

| Step | Stage | Duration | Temperature |
|------|-------|----------|-------------|
| 1 | Autolyse | 25 min | Room temp |
| 2 | Bulk Fermentation / Bench Rest | 20 min (or 2.25 h if hydration ≥ 75%) | Room temp |
| 3 | Final Proof | `3 / af` hours (≈3 h at 21°C; shorter when warmer, longer when cooler) | Room temp |

Final proof duration examples:
- 0°C: 3 / 0.233 = 12.87 h (12 h 52 min)
- 5°C: 3 / 0.330 = 9.09 h (9 h 5 min)
- 10°C: 3 / 0.467 = 6.43 h (6 h 26 min)
- 20°C: 3 / 0.933 = 3.22 h (3 h 13 min)
- 21°C: 3 / 1.000 = 3.00 h (3 h 00 min)
- 25°C: 3 / 1.320 = 2.27 h (2 h 16 min)
- 28°C: 3 / 1.625 = 1.85 h (1 h 51 min)
- 35°C: 3 / 2.639 = 1.14 h (1 h 8 min)
- 40°C: 3 / 3.732 = 0.80 h (48 min)

---

## 9. About SAF-Instant Red Yeast

### Product details

- **Name:** SAF-Instant Red "The Original Red"
- **Manufacturer:** Lesaffre (invented instant dry yeast in 1973)
- **Type:** Instant dry yeast (IDY)
- **Organism:** *Saccharomyces cerevisiae*
- **Composition:** >98.5% yeast, <1.5% emulsifier (sorbitan monostearate E491)
- **Moisture:** ~3% (vs ~8% for active dry, ~70% for fresh yeast)
- **Yeast cell concentration:** ~97% (highest of all yeast types)
- **Use:** Mix directly into flour — no rehydration or proofing needed
- **Recommended for:** Lean/low-sugar doughs — pizza, bread, baguette
- **Storage:** Unopened at room temperature up to 2 years; once opened, refrigerate in airtight container, use within 4–6 months
- **Format:** 11g sachets (home baking) or larger bulk packs (professional)

### Yeast conversion context

The app calculates everything in terms of **instant dry yeast** (SAF-Instant Red). If a user has a different yeast type, here are the conversion ratios:

| From | To | Multiplier |
|------|-----|------------|
| Fresh yeast | Instant dry yeast | × 0.33 (divide by 3) |
| Fresh yeast | Active dry yeast | × 0.40 (divide by 2.5) |
| Active dry yeast | Instant dry yeast | × 0.75 |
| Instant dry yeast | Fresh yeast | × 3 |
| Instant dry yeast | Active dry yeast | × 1.33 |

Example: If a recipe calls for 3g fresh yeast, use 1g instant dry yeast (3 × 0.33 = 1).

### Why instant dry yeast for pizza?

- **Convenience:** No need to dissolve in water — mix directly with flour
- **Reliability:** Longer shelf life than fresh yeast, more stable
- **Consistency:** Same strain as fresh yeast, no flavor difference
- **Precision:** Fine granules dissolve on contact with dough
- **Professional standard:** #1-selling yeast worldwide, used by professionals

The source data confirms: "Instant dry yeast is much more stable, has a longer shelf life, and is more reliable and convenient to store than fresh. Also, there is no flavor difference — it's the same strain of yeast."

### Typical yeast percentages for context

| Use case | Instant dry yeast % | Source |
|----------|---------------------|--------|
| 24h cold ferment | 0.07–0.10% | External references |
| 48h cold ferment | 0.03–0.05% | External references |
| 72h cold ferment | 0.02–0.03% | External references |
| 20–24h room temp (Neapolitan) | 0.04% | Source data (chunk_010) |
| Short same-day (thin-crust) | 0.82% | Source data (chunk_010) |
| Cold-proofed with poolish | 0.25% | Source data (chunk_008) |
| **App: room_overnight, 20°C** | **0.15%** | Calculated |
| **App: room_overnight, 28°C** | **0.10%** | Calculated |
| **App: room_temperature, 21°C** | **0.48%** | Calculated |

The app's calculated percentages fall within the expected range for their respective fermentation durations.

---

## 10. Validation Rules

Reject input (inform user) if:

- Flour is missing, zero, or negative
- Temperature is missing or outside 0–40°C
- Hydration is outside 40–90%
- (Temperature is then clamped to 0–40°C before calculation — values within this range are used as-is)

---

## 11. Underlying Principles (from source data in `Data/` folder)

### Temperature and fermentation
- "The higher the temperature, the faster the fermentation. It's an exponential relationship, so small factors can make a big difference." (chunk_001)
- The Q10 model (activity doubles per 10°C) is the standard biological approximation.
- Reference room temperature is 21°C / 70°F.

### Yeast amounts
- "You can make doughs with varying quantities of yeast. Use the doughs with more yeast at the beginning of service and the doughs with less yeast last." (chunk_001)
- "A dough with a small amount of yeast needs more time to cold-proof because the lower temperature slows its development." (chunk_010)
- Yeast percentages range from 0.04% (long fermentation) to 0.82% (short same-day). (chunk_008, chunk_010)
- "Some pizzaioli adjust the yeast amount (more in the winter, less in the summer)." (chunk_008)

### Salt
- Book recipes use 2.11%–3.18% of flour weight. The app uses 2.5%. (chunk_002)

### Autolyse
- "The dough rests for 20–30 minutes." The app uses 25 minutes. (chunk_002)
- Autolyse is recommended for high-hydration doughs (≥75%). (chunk_003, chunk_004)

### Bulk fermentation vs. bench rest
- Full gluten development: bench rest 15–20 min, no bulk ferment. (chunk_003, chunk_005)
- Medium gluten development: bulk ferment 2–2.5 h with folds. (chunk_005)
- App uses 20 min bench rest for hydration < 75%, 2.25 h bulk ferment for ≥ 75%.

### Cold proofing
- "Cold-proofing slows down fermentation and is typically accomplished by refrigerating the dough for 24–96 hours." (chunk_007)
- "Most refrigerators have temperatures in the range of 0.5–4.4°C / 33–40°F. If possible, adjust the temperature to 4°C / 39°F." (chunk_007)
- App uses 12 h at 4°C.

### Tempering
- "We recommended tempering these doughs for 2 hours." (chunk_001)
- "We recommend tempering cold-proofed dough for 2 h." (chunk_008)
- App uses 2 h tempering for room_overnight mode.

### Room-temperature proofing
- "2- and 3-hour proofing times produced the best results." (chunk_008)
- "Room temperature (21°C / 70°F)" is the reference condition. (chunk_008)
- App uses 3 h at 21°C as base, adjusted inversely by temperature.

### Baker's percentage
- All ingredients expressed as percentage of flour weight (flour = 100%). (chunk_002)

---

## 12. Summary Formula Card

```
GIVEN:  flour (g), temp (°C), hydration (%), proofMode

roomTempC = clamp(0, 40, temp)
af  = 2 ^ ((roomTempC - 21) / 10)
afc = 2 ^ (-1.7) = 0.3078
bulk = (hydration ≥ 75) ? 2.25 : 0.3333     // hours

IF proofMode == "room_temperature":
    EFU = bulk × af + 3
    proofHours = 3 / af                      // for display

IF proofMode == "room_overnight":
    EFU = (bulk + 7) × af + 12 × 0.3078

yeastPct = clamp(0.03, 1.0, 1.6 / EFU)      // baker's %

water = flour × hydration / 100             // g, 1 decimal
yeast = flour × yeastPct / 100              // g, 2 decimals — ALWAYS CALCULATE
salt  = flour × 0.025                       // g, 2 decimals

YEAST IS SAF-INSTANT RED INSTANT DRY YEAST.
NEVER SKIP THE YEAST CALCULATION.
NEVER SUBSTITUTE A FIXED OR "TYPICAL" YEAST AMOUNT.
THE CALCULATED AMOUNT IS OFTEN VERY SMALL (UNDER 1g) — THIS IS CORRECT.
```
