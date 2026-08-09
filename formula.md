# Neapolitan Pizza Dough — Formula Reference for Implementation

> **Source:** *Modernist Pizza* by The Cooking Lab (Nathan Myhrvold et al.), Volume 2 — Techniques and Ingredients. All recipe data, percentages, schedules, and temperatures below are extracted directly from that source unless marked otherwise.
>
> **Scope:** Neapolitan-style pizza dough only. Five recipe profiles are documented. Future expansion to other styles should follow the same profile-based structure.

---

## 1. Ingredient Definitions

| Ingredient | Type | Notes |
|---|---|---|
| **Flour** | Bread flour (11.5%–12.5% protein) or Tipo 00 pizza flour | Recommended: Le 5 Stagioni Pizza Napoletana, Caputo Pizzeria, or Polselli Classica. For AVPN: 00 flour with W 280–310, 12%–13% protein. |
| **Water** | Tap water | Temperature varies by recipe (see profiles). |
| **Salt** | Fine salt | Fine-ground table salt. |
| **Yeast** | Instant dry yeast (IDY) — normalized to **SAF-Instant Red** | All Modernist Pizza Neapolitan recipes use IDY except the AVPN recipe, which uses fresh yeast (see conversion policy in §5). |
| **Dough relaxer** (optional) | Adolph's meat tenderizer | Used only in Master and High-Hydration profiles. Acts as a protease-based dough relaxer. Optional but recommended. |

---

## 2. Baker's Percentage System

All recipes use **baker's percentage** (baker's math): flour is always **100%**, and every other ingredient is expressed as a percentage of flour weight.

### Scaling from flour weight

Given a target flour weight `F` (in grams) and a baker's percentage `P` for an ingredient:

```
ingredientWeight = F × P / 100
```

### Scaling from desired dough weight (DDW)

If you need a specific total dough weight and know the baker's percentages:

```
totalPercent = sum of all ingredient percentages
flourWeight = DDW × 100 / totalPercent
ingredientWeight = flourWeight × P / 100
```

### Dough ball weight

For Neapolitan pizza, the standard dough ball is **250 g** per 30 cm / 12 in pizza. To calculate flour for N pizzas:

```
totalDoughWeight = N × 250
flourWeight = totalDoughWeight × 100 / totalPercent
```

---

## 3. Neapolitan Recipe Profiles

Each profile is a self-contained formulation with fixed percentages and a fixed fermentation schedule. **Do not mix percentages from one profile with the schedule of another** — the yeast percentage is calibrated to the fermentation time and temperature of its own profile.

---

### Profile A: Master Neapolitan Pizza Dough (page 124)

**Description:** The Modernist Pizza master recipe. Mixed to full gluten development, bulk fermented at room temperature for 20–24 hours (unique among their doughs), then divided, balled, and proofed for 3 hours. Relatively low hydration (62.3%) designed for very hot ovens (450–480°C / 840–900°F, bake 60–90 seconds).

#### Ingredients (baker's %)

| Ingredient | Weight (1 kg batch) | Baker's % |
|---|---|---|
| Flour (bread or 00) | 610 g | 100 |
| Water, 21°C / 70°F | 380 g | 62.3 |
| Instant dry yeast (SAF-Instant Red) | 0.24 g | 0.04 |
| Fine salt | 12.15 g | 1.99 |
| Adolph's meat tenderizer (optional) | 0.06 g | 0.01 |

**Yield:** ~1,002 g (four 250 g dough balls → four 30 cm / 12 in pizzas)

#### Schedule

| Stage | Duration | Temperature |
|---|---|---|
| Mix to full gluten development | 8–10 min (stand mixer) | DDT 27°C / 80°F |
| Bulk ferment (covered) | 20–24 h | 21°C / 70°F |
| Divide into 250 g pieces | — | — |
| Preshape into balls | — | — |
| Proof (covered) | 3 h | 21°C / 70°F |
| **Total time** | ~27 h (active 15–20 min) | — |

---

### Profile B: Modernist High-Hydration Neapolitan Pizza Dough (page 127)

**Description:** A variation of the master recipe that achieves ~82% hydration through a pregelatinized flour slurry. Same yeast % and schedule as the master. Requires cooking a flour-water paste to 65°C / 175°F before mixing.

#### Ingredients

**Pregelatinized flour:**

| Ingredient | Weight | % (of slurry flour) |
|---|---|---|
| Water, 21°C / 70°F | 120 g | 400 |
| 00 flour | 30 g | 100 |

**Final dough:**

| Ingredient | Weight | Baker's % (of final flour) |
|---|---|---|
| Water, 21°C / 70°F | 380 g | 65.5 |
| Instant dry yeast | 0.24 g | 0.04 |
| 00 flour | 580 g | 100 |
| Adolph's meat tenderizer (optional) | 0.15 g | 0.03 |
| Fine salt | 13 g | 2.24 |

#### Net Contents (combined)

| Ingredient | Weight | Baker's % |
|---|---|---|
| Flour (total) | 610 g | 100 |
| Water (total) | 500 g | 81.97 |
| Salt | 13 g | 2.13 |
| Yeast | 0.24 g | 0.04 |

**Yield:** ~1,123 g

#### Schedule

Same as Profile A (20–24h bulk at 21°C, 3h proof at 21°C). DDT 27–28°C / 80–82°F.

---

### Profile C: Neapolitan Pizza Dough with Poolish (page 128)

**Description:** Uses a poolish preferment to aid flour hydration and improve texture. Cold-proofed for 1–2 days (refrigerator). Much higher yeast % than the master because the cold-proofing temperature slows fermentation dramatically.

#### Ingredients

**Poolish (prepare 12–16 h ahead):**

| Ingredient | Weight | Baker's % (of poolish flour) |
|---|---|---|
| Bread flour or 00 flour | 60 g | 100 |
| Water | 60 g | 100 |
| Instant dry yeast | 0.06 g | 0.1 |

**Final dough:**

| Ingredient | Weight | Baker's % (of final dough flour) |
|---|---|---|
| Water, 21°C / 70°F | 330 g | 61.68 |
| Instant dry yeast | 2.3 g | 0.43 |
| Bread flour or 00 flour | 535 g | 100 |
| Fine salt | 13.4 g | 2.5 |

#### Net Contents (combined — use these for scaling)

| Ingredient | Weight | Baker's % |
|---|---|---|
| Flour (total) | 595 g | 100 |
| Water (total) | 390 g | 65.55 |
| Salt | 13.4 g | 2.25 |
| Yeast (total) | 2.36 g | 0.40 |

**Yield:** ~1,001 g (four 250 g balls)

#### Schedule

| Stage | Duration | Temperature |
|---|---|---|
| Prepare poolish | 12–16 h | 21°C / 70°F |
| Mix to full gluten development | — | — |
| Bench rest (covered) | 20 min | — |
| Divide into 250 g, preshape | — | — |
| Cold proof (covered) | 1–2 days | 4°C / 39°F |
| Temper before baking | 2 h | room temp |
| **Total time** | ~48½ h (active 15–20 min) | — |

---

### Profile D: AVPN Neapolitan Pizza Dough (page 130)

**Description:** Adapted from the Associazione Verace Pizza Napoletana rules. Uses **fresh yeast** (not IDY). Long bulk fermentation and room-temperature proofing at a slightly lower temperature (20–20.5°C). Follows AVPN ingredient and method requirements.

#### Ingredients

| Ingredient | Weight (1 kg batch) | Baker's % |
|---|---|---|
| 00 flour, 12%–13% protein (W 280–310) | 620 g | 100 |
| Water, 21°C / 70°F | 400 g | 64.52 |
| Fresh yeast | 0.7 g | 0.11 |
| Fine salt | 17 g | 2.74 |

**Yield:** ~1,038 g (four 250 g balls)

#### Schedule

| Stage | Duration | Temperature |
|---|---|---|
| Mix to full gluten development | 5–7 min (hand) or ~15 min (machine) | — |
| Bulk ferment (covered) | 12–18 h | 20–20.5°C / 68–69°F |
| Divide into 250 g, preshape | — | — |
| Proof (covered) | 6–8 h | 20–20.5°C / 68–69°F |
| **Total time** | ~26 h (active 15–20 min) | — |

**Yeast note:** This recipe uses fresh yeast. See §5 for conversion to SAF-Instant Red IDY.

---

### Profile E: Emergency Neapolitan Pizza Dough (page 131)

**Description:** A same-day dough ready in ~2½–3 hours. Uses much higher yeast (1%), warmer water (38°C / 100°F), and higher salt. Sacrifices some flavor development for speed.

#### Ingredients

| Ingredient | Weight (1 kg batch) | Baker's % |
|---|---|---|
| Bread flour or 00 flour | 585 g | 100 |
| Water, 38°C / 100°F | 400 g | 68.38 |
| Fine salt | 20 g | 3.42 |
| Instant dry yeast (SAF-Instant Red) | 5.85 g | 1.0 |

**Yield:** ~1,011 g (four 250 g balls)

#### Schedule

| Stage | Duration | Temperature |
|---|---|---|
| Mix to full gluten development | — | — |
| Bench rest (covered) | 20 min | — |
| Divide into 250 g, preshape | — | — |
| Proof (covered) | 2 h | 21°C / 70°F |
| **Total time** | ~2½ h (active 10–15 min) | — |

---

## 4. Profile Summary Table

| Profile | Hydration | Salt | Yeast % | Yeast type | Bulk/Proof schedule | Temp |
|---|---|---|---|---|---|---|
| A — Master | 62.3% | 1.99% | 0.04% IDY | IDY | 20–24h bulk + 3h proof | 21°C |
| B — High-Hydration | 81.97% net | 2.13% | 0.04% IDY | IDY | 20–24h bulk + 3h proof | 21°C |
| C — Poolish | 65.55% net | 2.25% | 0.40% IDY | IDY | 12–16h poolish + 1–2d cold proof | 4°C cold |
| D — AVPN | 64.52% | 2.74% | 0.11% fresh | Fresh | 12–18h bulk + 6–8h proof | 20–20.5°C |
| E — Emergency | 68.38% | 3.42% | 1.0% IDY | IDY | 20 min bench + 2h proof | 21°C |

---

## 5. Yeast Conversion Policy

### Source-stated facts

- All Modernist Pizza Neapolitan recipes (except AVPN) use **instant dry yeast**.
- The AVPN recipe uses **fresh yeast** at 0.11%.
- The book states: "Instant dry yeast is much more stable, has a longer shelf life, and is more reliable and convenient to store than fresh. Also, there is no flavor difference — it's the same strain of yeast" (page 1:292 reference).
- The book does **not** provide an explicit fresh-to-IDY conversion ratio in Volume 2.

### General baking conversion (not from the source — standard industry practice)

The widely accepted conversion for baker's yeast:

| Fresh yeast | Active dry yeast | Instant dry yeast |
|---|---|---|
| 3 parts | 1.5 parts | 1 part |

**To convert fresh yeast to instant dry yeast:**
```
IDY weight = fresh yeast weight ÷ 3
IDY baker's % = fresh yeast baker's % ÷ 3
```

**To convert IDY to fresh yeast:**
```
fresh yeast weight = IDY weight × 3
```

### Applying the conversion to the AVPN recipe

AVPN fresh yeast: 0.11% → IDY equivalent: 0.11% ÷ 3 ≈ **0.037% IDY**

This is consistent with the Master recipe's 0.04% IDY, which has a similar total fermentation time at a similar temperature — providing confidence in the conversion.

**Implementation rule:** When a user requests IDY (SAF-Instant Red) for a recipe that the source gives in fresh yeast, apply the ÷3 conversion. Label the result as "converted from fresh yeast."

---

## 6. Scaling Formulas

### From flour weight

```
water   = flour × hydrationPct / 100
salt    = flour × saltPct / 100
yeast   = flour × yeastPct / 100
```

### From number of pizzas

```
doughBallWeight = 250  (for 30 cm / 12 in Neapolitan)
totalDoughWeight = numberOfPizzas × doughBallWeight
totalPercent = 100 + hydrationPct + saltPct + yeastPct  (+ relaxerPct if used)
flourWeight = totalDoughWeight × 100 / totalPercent
```

Then apply the flour-weight formulas above.

### From desired total dough weight

Same as above but `totalDoughWeight` is given directly.

---

## 7. Rounding and Precision Policy

| Ingredient | Precision | Notes |
|---|---|---|
| Flour | 1 g | Standard scale. |
| Water | 1 g | Standard scale. |
| Salt | 0.1 g | Standard scale or measuring spoons. |
| Yeast | 0.01 g | **Requires a precision scale** (jewelry scale). The book explicitly recommends one for quantities like 0.06 g. |

**For sub-gram yeast amounts** (Profiles A, B, D-converted): Round to 2 decimal places (0.01 g). Do not round to zero. The book notes you can approximate ⅛ tsp yeast and divide it into parts for very small amounts.

**Example:** For 180 g flour with Profile A (0.04% IDY):
```
yeast = 180 × 0.04 / 100 = 0.072 g → round to 0.07 g
```

This is a very small amount. It is correct. Do not "round up" to 0.25 g or 1 g — that would be 3.5× to 14× too much yeast and would overproof the dough.

---

## 8. Input Validation

| Input | Valid range | Error message |
|---|---|---|
| Flour weight | > 0 g | "Flour weight must be greater than zero." |
| Number of pizzas | ≥ 1 integer | "Number of pizzas must be at least 1." |
| Desired dough weight | > 0 g | "Dough weight must be greater than zero." |
| Profile selection | A, B, C, D, or E | "Select a valid recipe profile." |

Temperature is **not a free input** in this model. Each profile has its own fixed fermentation temperature. The book explicitly warns that "alternative proof temperatures could also lead to different results" and recommends using the recipe's recommended proof temperatures. Do not offer a temperature slider that adjusts yeast — that would be an unsupported interpolation.

---

## 9. Worked Examples

### Example 1: 180 g flour, Master Neapolitan (Profile A)

```
flour  = 180 g
water  = 180 × 62.3 / 100  = 112.14 → 112 g
salt   = 180 × 1.99 / 100  = 3.582  → 3.6 g
yeast  = 180 × 0.04 / 100  = 0.072  → 0.07 g (SAF-Instant Red IDY)
relaxer = 180 × 0.01 / 100 = 0.018  → 0.02 g (optional)
```

**Schedule:** Mix → bulk ferment 20–24h at 21°C → divide 250 g balls → proof 3h at 21°C.

### Example 2: 250 g flour, Poolish variation (Profile C, net contents)

```
flour  = 250 g
water  = 250 × 65.55 / 100 = 163.9  → 164 g
salt   = 250 × 2.25 / 100  = 5.625  → 5.6 g
yeast  = 250 × 0.40 / 100  = 1.0    → 1.0 g (SAF-Instant Red IDY)
```

Note: The poolish itself uses 0.1% yeast on poolish flour. For a 250 g total flour batch, the poolish would be ~25 g flour, 25 g water, 0.025 g yeast. The remaining yeast goes in the final dough.

**Schedule:** Prepare poolish 12–16h at 21°C → mix → bench rest 20 min → divide 250 g → cold proof 1–2 days at 4°C → temper 2h.

### Example 3: 4 pizzas, Emergency Neapolitan (Profile E)

```
totalDough = 4 × 250 = 1000 g
totalPercent = 100 + 68.38 + 3.42 + 1.0 = 172.80
flour = 1000 × 100 / 172.80 = 578.7 → 579 g
water = 579 × 68.38 / 100 = 395.9  → 396 g
salt  = 579 × 3.42 / 100  = 19.8   → 19.8 g
yeast = 579 × 1.0 / 100    = 5.79  → 5.8 g (SAF-Instant Red IDY)
```

**Schedule:** Mix with 38°C water → bench rest 20 min → divide 250 g → proof 2h at 21°C.

### Example 4: AVPN recipe with fresh yeast converted to IDY (Profile D)

```
flour  = 300 g
water  = 300 × 64.52 / 100 = 193.6  → 194 g
salt   = 300 × 2.74 / 100  = 8.22   → 8.2 g
freshYeast = 300 × 0.11 / 100 = 0.33 g
IDY = 0.33 / 3 = 0.11 g (SAF-Instant Red)
```

**Schedule:** Mix → bulk ferment 12–18h at 20–20.5°C → divide 250 g → proof 6–8h at 20–20.5°C.

---

## 10. Implementation Pseudocode

```javascript
// Profile definitions — all values are baker's percentages
const NEAPOLITAN_PROFILES = {
  master: {
    name: "Master Neapolitan Pizza Dough",
    source: "Modernist Pizza, page 124",
    flour: 100,
    water: 62.3,
    salt: 1.99,
    idy: 0.04,              // instant dry yeast %
    relaxer: 0.01,           // optional, Adolph's meat tenderizer
    waterTempC: 21,
    bulkFermentHours: [20, 24],
    bulkFermentTempC: 21,
    proofHours: 3,
    proofTempC: 21,
    doughBallWeight: 250,
    usesPreferment: false,
    yeastType: "IDY",
  },
  highHydration: {
    name: "Modernist High-Hydration Neapolitan Pizza Dough",
    source: "Modernist Pizza, page 127",
    // Net contents percentages (after combining pregelatinized slurry)
    flour: 100,
    water: 81.97,
    salt: 2.13,
    idy: 0.04,
    relaxer: 0.03,
    waterTempC: 21,
    bulkFermentHours: [20, 24],
    bulkFermentTempC: 21,
    proofHours: 3,
    proofTempC: 21,
    doughBallWeight: 250,
    usesPreferment: false,
    yeastType: "IDY",
    notes: "Requires pregelatinized flour slurry (30g flour + 120g water cooked to 65°C)",
  },
  poolish: {
    name: "Neapolitan Pizza Dough with Poolish",
    source: "Modernist Pizza, page 128",
    // Net contents percentages (poolish flour+water+yeast combined with final dough)
    flour: 100,
    water: 65.55,
    salt: 2.25,
    idy: 0.40,
    waterTempC: 21,
    prefermentHours: [12, 16],
    prefermentTempC: 21,
    coldProofDays: [1, 2],
    coldProofTempC: 4,
    temperHours: 2,
    doughBallWeight: 250,
    usesPreferment: true,
    yeastType: "IDY",
    prefermentYeastPct: 0.10,  // % of poolish flour
  },
  avpn: {
    name: "AVPN Neapolitan Pizza Dough",
    source: "Modernist Pizza, page 130 (adapted from AVPN rules)",
    flour: 100,
    water: 64.52,
    salt: 2.74,
    freshYeast: 0.11,
    idy: 0.11 / 3,             // converted: ≈ 0.037%
    waterTempC: 21,
    bulkFermentHours: [12, 18],
    bulkFermentTempC: 20.25,   // 20–20.5°C, midpoint
    proofHours: [6, 8],
    proofTempC: 20.25,
    doughBallWeight: 250,
    usesPreferment: false,
    yeastType: "fresh (convert to IDY by ÷3)",
  },
  emergency: {
    name: "Emergency Neapolitan Pizza Dough",
    source: "Modernist Pizza, page 131",
    flour: 100,
    water: 68.38,
    salt: 3.42,
    idy: 1.0,
    waterTempC: 38,
    benchRestMin: 20,
    proofHours: 2,
    proofTempC: 21,
    doughBallWeight: 250,
    usesPreferment: false,
    yeastType: "IDY",
  },
};

function calculateFromFlour(profile, flourWeight) {
  if (flourWeight <= 0) throw new Error("Flour weight must be > 0");
  const yeastPct = profile.idy ?? (profile.freshYeast / 3);
  return {
    flour: flourWeight,
    water: round(flourWeight * profile.water / 100, 1),
    salt: round(flourWeight * profile.salt / 100, 1),
    yeast: round(flourWeight * yeastPct / 100, 2),
    relaxer: profile.relaxer
      ? round(flourWeight * profile.relaxer / 100, 2)
      : null,
  };
}

function calculateFromPizzas(profile, numPizzas) {
  const totalDough = numPizzas * profile.doughBallWeight;
  const totalPct = profile.flour + profile.water + profile.salt
    + (profile.idy ?? profile.freshYeast / 3)
    + (profile.relaxer ?? 0);
  const flourWeight = totalDough * 100 / totalPct;
  return calculateFromFlour(profile, round(flourWeight, 1));
}

function round(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
```

---

## 11. Limitations and Important Notes

1. **No dynamic temperature model.** The source does not provide a continuous equation for adjusting yeast as a function of temperature. Each profile has fixed temperatures. Do not invent a Q10 or Arrhenius model — use the profiles as-is.

2. **Yeast % is tied to the schedule.** The 0.04% IDY in the Master recipe works because the dough ferments for 20–24 hours at 21°C. Using 0.04% IDY with a 2-hour proof would result in severely underproofed dough. Always use the yeast % together with its corresponding schedule.

3. **The book's general emergency rule:** "Add 0.8–1% instant dry yeast and you will have a dough that is ready in 2–3 hours." This is consistent with Profile E (1% IDY, 2h proof).

4. **Warm-proofing alternative:** The book tested warm-proofing at 27°C / 80°F with 65% RH as an alternative to room-temperature or cold-proofing for some styles, but for Neapolitan specifically, the recommended profiles are room-temperature (Profiles A, B, D) or cold-proof (Profile C).

5. **Desired dough temperature (DDT):** The book recommends 24–25°C / 75–78°F for most doughs, but specifically calls out 27°C / 80°F for the Master Neapolitan and Poolish versions, and 27–28°C / 80–82°F for the High-Hydration version.

6. **Cross-crusting:** The book found that Neapolitan dough can be used to make other styles and vice versa, but this document covers Neapolitan only.

7. **Poolish yeast calculation:** The poolish in Profile C uses 0.1% IDY on poolish flour weight. The book references "Strategies for Using Poolish, page 1:300" (Volume 1, not included in source) for calculating poolish yeast based on when you want to use it. The 0.1% value is for a 12–16 hour poolish at 21°C.

---

## 12. SAF-Instant Red Yeast — Product Reference

> **This is the yeast that all IDY amounts in this document refer to.**

### Product identification

| Field | Value |
|---|---|
| **Product name** | SAF-Instant "The Original Red" |
| **Type** | Instant dry yeast (IDY) |
| **Organism** | *Saccharomyces cerevisiae* |
| **Manufacturer** | Lesaffre |
| **Product page** | https://saf-instant.com/en/home-baking/our-products/saf-instant-the-original-red-11g/ |
| **Regional page** | https://saf-instant.asia/saf-instant-red/ |

### Product description (from official pages)

- "High performance instant dry yeast suitable for lean or low-sugar breads."
- "Recommended for all types of homemade bread recipes with lean or low sugar doughs, such as country bread, baguette, **pizza**."
- "The #1-selling instant yeast worldwide" (Lesaffre claim).
- "For less sweet dough with 0–5% sugar on flour weight. Great for pizza dough, bagels and baguettes."
- "Saf-instant® shortens the rise time while still allowing deep complex flavours to develop."

### Usage instructions (from official pages)

- **No rehydration required.** "Saf-instant® yeast can be directly mixed with other dry ingredients to form dough without being rehydrated."
- "Added directly to the flour, or at the start of the mixing process."
- "Saf-instant® does not require rehydration before use."
- **Do not** place in direct contact with ice or iced water.

### Packaging and storage

| Field | Value |
|---|---|
| **Pack sizes** | 11g sachet (×5/box), 125g sachet (×36/carton), 500g sachet (×20/carton), 3g sachet |
| **Shelf life** | 2 years from date of production (unopened) |
| **Storage (unopened)** | Dry place, away from heat |
| **Storage (opened)** | Use within 48 hours, or store sealed in refrigerator and use within 8 days |

### SAF-Instant manufacturer pizza recipe

> **Context only — this is the SAF manufacturer's own recipe, not a Modernist Pizza recipe and not specifically Neapolitan.** It is included as manufacturer reference data.

Source: https://saf-instant.asia/recipe/pizza-dough

| Ingredient | Weight | Baker's % |
|---|---|---|
| Wheat flour | 250 g | 100 |
| Water | 175 ml | 70.0 |
| Olive oil | 10 ml | 4.0 |
| Salt | 3.75 g | 1.50 |
| SAF-Instant Red IDY | 1 g | 0.40 |

**Method:**
1. Place all ingredients into mixer including water.
2. Mix 8 min on low speed. Final dough temperature 20–22°C.
3. Knead until smooth and elastic.
4. Divide into 2 pieces.
5. Proof 24–72 hours in chiller (refrigerator).
6. Bake 10–15 min at 250°C convection oven.

**Note:** This recipe uses 0.40% IDY — the same percentage as Modernist Pizza's Poolish variation (Profile C). The 24–72h cold-proof is also consistent. However, this is a generic pizza dough, not a Neapolitan-specific formulation. It includes olive oil (4%), which is not traditional in Neapolitan dough.

### Yeast type comparison (SAF-Instant range)

| Product | Sugar range | Use case |
|---|---|---|
| **SAF-Instant Red** | 0–5% sugar | Pizza, baguettes, lean breads |
| SAF-Instant Gold | 5–20% sugar | Sweet buns, sandwich loaves |
| SAF-Instant Blue | >20% sugar | Very sweet doughs (limited availability) |

**For all Neapolitan pizza dough calculations in this document, use SAF-Instant Red.** Neapolitan dough is a lean dough (no sugar), so Red is the correct product.

---

## 13. Quick Reference for LLMs

> **When a user asks for pizza dough ingredients, follow these steps:**

1. **Determine the profile.** If the user doesn't specify, ask: Do you want a long-fermentation master dough (24h+), a cold-proofed poolish version (48h), a traditional AVPN-style, or a quick emergency dough (2½h)?

2. **Get the flour weight** (or number of pizzas). If the user gives flour weight, scale from flour. If the user gives number of pizzas, calculate from 250 g per pizza.

3. **Calculate all ingredients using the profile's baker's percentages.** Use the formulas in §6. Do not skip yeast. Do not use "typical" amounts from memory.

4. **State the yeast as SAF-Instant Red** instant dry yeast. Give the amount in grams to 2 decimal places. If it seems very small (e.g., 0.07 g for 180 g flour), that is correct — say so and recommend a precision scale.

5. **State the full schedule** — fermentation times and temperatures are part of the recipe. Yeast % without the corresponding schedule is meaningless.

6. **If the user specifies a temperature** that differs from the profile, warn them: "This recipe is designed for [X]°C. Different temperatures will change fermentation speed. The book recommends using the recipe's specified temperature."

### Example response for "180g flour, 28°C, Neapolitan"

> For 180 g flour at 28°C ambient, I recommend the **Master Neapolitan** profile but note that the recipe is designed for 21°C / 70°F fermentation. At 28°C the dough will ferment significantly faster and may overproof during the 20–24 hour bulk ferment. You have two options:
>
> **Option 1 — Follow the recipe as written (recommended):** Find a cool spot at 21°C for the bulk ferment.
>
> - Flour: 180 g
> - Water (21°C): 112 g
> - Salt: 3.6 g
> - SAF-Instant Red yeast: 0.07 g
> - Bulk ferment: 20–24 h at 21°C
> - Proof: 3 h at 21°C
>
> **Option 2 — Emergency dough (works at any room temp, ready in ~2½h):**
>
> - Flour: 180 g
> - Water (38°C): 123 g
> - Salt: 6.2 g
> - SAF-Instant Red yeast: 1.8 g
> - Bench rest: 20 min
> - Proof: 2 h at 21°C
>
> The source does not provide a formula for adjusting yeast for different ambient temperatures. Do not guess — use a profile that matches your conditions.
