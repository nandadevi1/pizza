# Home-Oven Pizza Dough Calculator
## Neapolitan-inspired dough adapted for a 220°C home oven

**Version:** 1.0  
**Date:** 2026-08-10

> **UPDATE (2026-08-11):** The default yeast baseline changed from **0.10%** to **1.0%** instant dry yeast, based on Tony Gemignani, *The Pizza Bible* (2014), "Master Dough without Starter" (4.5 g active dry yeast / 453 g flour = 1.0%). All **0.10%** references below are superseded.

This calculator is designed for the following fixed conditions:

- **Oven:** 220°C maximum
- **Refrigerator:** 7°C
- **Yeast:** Saf-instant® The Original Red, instant dry yeast
- **Dough:** lean dough; no sugar and no oil by default
- **Process:** room-temperature fermentation → refrigeration → final warm-up → bake
- **Flours:** Caputo 00 Pizzeria and an unspecified Spanish T65

The calculator deliberately does **not** try to reproduce a true high-temperature Neapolitan dough. A conventional 220°C oven produces a substantially longer bake than the ~430–480°C environment used for Neapolitan pizza, so hydration and dough handling are adapted to the actual oven.

---

# 1. Inputs

## Required

Give these two values:

```text
Ambient temperature: XX °C
Flour: XXX g
```

Example:

```text
Ambient temperature: 21 °C
Flour: 180 g
```

## Optional

If known, also provide:

```text
Flour: Caputo 00 Pizzeria / Spanish T65
Expected fridge time: overnight / 24 h / 48 h / 72 h
```

The calculator can still run without the optional inputs.

---

# 2. Fixed conditions

| Parameter | Value |
|---|---:|
| Oven | **220°C** |
| Refrigerator | **7°C** |
| Salt | **2.5%** |
| Yeast | **Saf-instant Red IDY** |
| Sugar | 0% |
| Oil | 0% |

Saf-instant Red is specifically intended for lean or low-sugar doughs, including pizza. Saf says it can be mixed directly into the flour and does not require rehydration. Its official general-purpose home-baking dosage is 1 × 11 g sachet per 500–1000 g flour; that dosage is for normal home baking and is **not** used as the pizza-fermentation calculation here.

Source: Saf-instant, The Original Red 11g:
https://saf-instant.com/en/home-baking/our-products/saf-instant-the-original-red-11g/

Saf also offers the Red product in 125 g packaging, which is more practical than repeatedly opening 11 g sachets when very small pizza-yeast doses are required.

---

# 3. Flour assumptions

## 3.1 Caputo 00

This calculator assumes the **Caputo Pizzeria 00** product if "Caputo 00" is selected.

Mulino Caputo lists the Pizzeria 1 kg flour as:

- Tipo 00
- Protein: **12.5%**
- W: **260–280**
- P/L: **0.50–0.60**
- Intended for well-hydrated, light doughs and classic Neapolitan pizza

Source:
https://www.mulinocaputo.it/en/products/pizzeria/

### Important

Caputo sells several different 00 flours. "00" by itself does not define strength.

If the bag is actually Caputo Chef, Cuoco, Nuvola, etc., the calculator should use the specifications printed on that specific bag instead.

---

## 3.2 Spanish T65

"T65" alone is **not enough information to determine flour strength**.

The T-number describes a flour's mineral/ash classification, not its gluten strength. Two T65 flours can behave differently because of wheat variety, protein, milling and other characteristics.

Therefore the calculator uses a conservative provisional setting:

- **Default hydration: 61%**
- Normal adjustment range: **60–63%**
- Start with 61% and adjust after observing the dough

If the T65 package provides protein %, W, or another strength specification, those values should replace the generic T65 assumption.

Do not assume that every T65 flour can accept the same hydration as Caputo Pizzeria 00.

---

# 4. Hydration model

## Why not simply use 65–66%?

Neapolitan-style dough is commonly around 60–65% hydration, but the baking environment matters.

At 220°C, the pizza takes considerably longer to bake than a true Neapolitan pizza. A longer bake removes more water from the dough and can make a high-hydration crust dry or overbaked before the toppings and interior are properly finished.

Therefore this calculator starts lower.

## Recommended starting hydration

| Flour | Starting hydration | Working range |
|---|---:|---:|
| Caputo 00 Pizzeria | **62%** | 61–64% |
| Spanish T65 | **61%** | 60–63% |

### Formula

```text
Water (g) = Flour (g) × Hydration %
```

Example for 180 g flour:

Caputo 00 at 62%:

```text
180 × 0.62 = 111.6 g water
```

T65 at 61%:

```text
180 × 0.61 = 109.8 g water
```

### Water adjustment rule

Do not necessarily add all the calculated water immediately.

For an unfamiliar T65, reserve approximately **2% of the flour weight** as water.

For 180 g flour:

```text
2% × 180 = 3.6 g
```

Start with 108.0 g of the 61% T65 formula's 109.8 g water, then add the final 1.8 g only if the dough can comfortably absorb it.

For Caputo 00, a smaller reserve of 1% is reasonable.

This is not a correction to baker's math; it is a practical mixing technique for controlling dough consistency.

---

# 5. Salt

Use:

```text
Salt = Flour × 0.025
```

or **2.5% baker's percentage**.

Examples:

| Flour | Salt |
|---:|---:|
| 150 g | 3.75 g |
| 180 g | 4.50 g |
| 200 g | 5.00 g |
| 250 g | 6.25 g |
| 300 g | 7.50 g |
| 500 g | 12.50 g |
| 1000 g | 25.00 g |

2.5% is deliberately kept fixed while the calculator is being calibrated. Changing salt and yeast simultaneously would make it difficult to determine what caused a fermentation change.

---

# 6. Yeast model

## Important limitation

There is no scientifically reliable universal equation that takes only flour weight and ambient temperature and predicts the exact amount of commercial instant yeast needed for a particular pizza dough.

Yeast performance depends on:

- yeast strain and formulation
- yeast age/storage
- flour
- dough temperature
- salt
- hydration
- mixing
- fermentation time
- refrigerator temperature
- dough mass/geometry
- inoculation level

Therefore the yeast calculation below is a **controlled starting model**, not a laboratory prediction.

It is deliberately conservative and should be calibrated from actual dough behavior.

---

# 7. Default yeast target

Because the process includes:

```text
room-temperature fermentation
        ↓
7°C refrigeration
        ↓
final warm-up
        ↓
220°C bake
```

the default starting point is:

## **0.10% instant dry yeast**

This is intentionally far below Saf's general-purpose home-baking dosage because this dough is designed for a substantially longer fermentation.

### Formula

```text
Yeast (g) = Flour (g) × 0.001
```

Examples:

| Flour | 0.10% IDY |
|---:|---:|
| 150 g | 0.15 g |
| 180 g | 0.18 g |
| 200 g | 0.20 g |
| 250 g | 0.25 g |
| 300 g | 0.30 g |
| 500 g | 0.50 g |
| 1000 g | 1.00 g |

This is a **starting point for an overnight-to-about-48-hour schedule at a 7°C refrigerator**, not a fixed rule for 72+ hours.

---

# 8. Adjusting yeast for planned cold time

If the intended refrigerated time is known, use this adjustment:

| Approx. total schedule | Starting IDY | Comment |
|---|---:|---|
| Overnight / ~18–24 h | **0.10–0.15%** | More yeast because total time is shorter |
| ~24–48 h | **0.08–0.10%** | Recommended default zone |
| ~48–72 h | **0.05–0.08%** | Reduce yeast; 7°C is warmer than an ideal 2–5°C retarder |
| >72 h | **0.03–0.05%** | Use only after successful calibration |

For the calculator's default case, use **0.10%** unless the planned cold duration is known to be long.

At 7°C, do not assume the dough is "stopped." Fermentation continues, only much more slowly.

---

# 9. Ambient temperature and room fermentation

The room-temperature stage should **not be treated as a rigid 5–6 hour timer**.

Instead:

> The calculator predicts a time window; the dough determines when refrigeration actually happens.

For a 0.10% IDY starting dose, a useful first-pass temperature correction is based on approximately doubling/halving fermentation rate for each 10°C change.

### Approximate room-temperature target

| Ambient | Predicted RT window | Start checking |
|---:|---:|---:|
| 18°C | ~6–7 h | ~5.5 h |
| 19°C | ~5.5–6.5 h | ~5 h |
| 20°C | ~5–6 h | ~4.5 h |
| **21°C** | **~4.5–5.5 h** | **~4 h** |
| 22°C | ~4–5 h | ~3.5 h |
| 23°C | ~4–4.5 h | ~3.25 h |
| 24°C | ~3.5–4 h | ~3 h |
| 25°C | ~3–4 h | ~2.75 h |
| 26°C | ~3–3.5 h | ~2.5 h |
| 27°C | ~2.5–3.5 h | ~2.25 h |

These are starting estimates, not guarantees.

### Why the calculator uses a window

Room temperature is not necessarily dough temperature.

If the room is 24°C but the water is cold and the dough finishes mixing at 21°C, fermentation will initially behave more like a 21°C dough.

Conversely, if the room is 21°C and the dough leaves mixing at 26–27°C, it can ferment much faster.

---

# 10. The actual refrigeration trigger

Do not refrigerate simply because the timer expires.

For this process, aim for **partial fermentation**, not a fully doubled dough.

A useful target is approximately:

- dough visibly expanded
- smoother surface
- some gas development
- relaxed gluten
- approximately **30–50% volume increase** as a starting target
- no signs of collapse

The exact visual target will need calibration with your flour.

If the dough is already very inflated at the scheduled time:

**refrigerate earlier.**

If it has barely changed:

**give it more time.**

This is more reliable than pretending that a yeast percentage can predict fermentation to the minute.

---

# 11. Balling strategy

For this particular process:

### Recommended

```text
Mix
↓
Room-temperature bulk fermentation
↓
Divide / ball
↓
Refrigerate at 7°C
↓
Warm before baking
```

For a single pizza, simply make one ball.

Balling before refrigeration makes the final proof predictable and means the dough is already in the form you need for baking.

---

# 12. Removing dough from the refrigerator

At 7°C, the dough will still be cold and relatively tight.

Start with:

**2–3 hours at room temperature before baking**

but use dough condition as the final guide.

A longer cold-fermented dough may need less warm-up if it is already highly fermented.

A dough that is still tight and under-fermented may need more time.

Do not force a fixed warm-up time.

---

# 13. Oven strategy at 220°C

A 220°C oven cannot reproduce the rapid bake of a Neapolitan oven.

Research on pizza baking physics and home-oven pizza confirms that lower baking temperatures mean longer baking and greater moisture loss, changing the crust texture.

Therefore the target is:

> **Neapolitan-inspired dough optimized for a conventional home oven, not authentic Neapolitan baking behavior.**

### Strong recommendation

Use a:

- pizza steel, or
- pizza stone

if available.

Preheat it thoroughly, ideally **45–60 minutes**.

The objective is not merely to get the oven air to 220°C. The baking surface needs to accumulate thermal energy so that it can transfer heat rapidly to the dough.

---

# 14. Toppings need to be adapted too

At 220°C, excessive wet topping is a problem.

Prefer:

- well-drained mozzarella
- restrained sauce
- thin topping layer
- ingredients that are not releasing large quantities of water

A very wet pizza can remain soft in the center because the oven cannot remove moisture as quickly as a 450°C+ pizza oven.

---

# 15. Worked example: 180 g flour

## A. Caputo 00 Pizzeria

Assumptions:

```text
Flour: 180 g
Ambient: 21°C
Fridge: 7°C
Oven: 220°C
Cold time: overnight to ~48 h
```

Formula:

| Ingredient | Baker's % | Weight |
|---|---:|---:|
| Caputo 00 Pizzeria | 100% | **180.0 g** |
| Water | **62%** | **111.6 g** |
| Salt | **2.5%** | **4.5 g** |
| Saf-Instant Red | **0.10%** | **0.18 g** |
| Total | 164.6% | **296.28 g** |

Predicted room-temperature stage:

**~4.5–5.5 h at 21°C**

Start checking:

**~4 h**

Refrigerate when the dough has reached the target partial-fermentation state rather than simply waiting for the clock.

---

## B. Spanish T65

Assumptions:

```text
Flour: 180 g
Ambient: 21°C
Fridge: 7°C
Oven: 220°C
Cold time: overnight to ~48 h
```

Formula:

| Ingredient | Baker's % | Weight |
|---|---:|---:|
| Spanish T65 | 100% | **180.0 g** |
| Water | **61%** | **109.8 g** |
| Salt | **2.5%** | **4.5 g** |
| Saf-Instant Red | **0.10%** | **0.18 g** |
| Total | 163.5% | **294.48 g** |

Predicted room-temperature stage:

**~4.5–5.5 h at 21°C**

Again, use the dough rather than the clock as the final trigger.

---

# 16. Yeast measurement: minimum waste

## Best option: 0.01 g scale

For this calculator, a scale capable of resolving **0.01 g** is strongly recommended.

For example:

```text
Required yeast = 0.18 g
Weigh = 0.18 g
```

This produces essentially no intentional waste.

It is much better than trying to estimate yeast by volume.

---

# 17. If the scale cannot reliably measure 0.1–0.3 g

Use a temporary yeast suspension.

Example:

```text
1.00 g Saf-Instant Red
9.00 g water
----------------
10.00 g suspension
```

Concentration:

```text
10% yeast by weight
```

Therefore:

```text
1.00 g suspension = 0.10 g yeast
```

For a target of 0.18 g yeast:

```text
0.18 / 0.10 = 1.80 g suspension
```

That 1.80 g suspension contains:

```text
0.18 g yeast
1.62 g water
```

Therefore subtract **1.62 g** from the recipe's calculated water.

### Important

This does not magically improve accuracy if the yeast is not dispersed uniformly.

Mix the suspension thoroughly and use it immediately.

Do not make a large stock and keep it for days.

Saf states that opened consumer sachets should be used within 48 hours, or under the storage conditions specified by the manufacturer for larger packaging.

Source:
https://saf-instant.com/en/home-baking/our-products/saf-instant-the-original-red-11g/

---

# 18. Better home strategy for repeated baking

If you make pizza regularly, the best setup is:

1. Buy the larger Saf-Instant Red package.
2. Keep it sealed, cool and dry.
3. Use a 0.01 g scale.
4. Weigh the yeast directly.
5. Avoid unnecessary dilution.

This gives the least waste and the best reproducibility.

Saf's official product information states that the Red yeast is available in 125 g packaging and that it does not need to be rehydrated.

---

# 19. How the calculator should be used

Every batch begins with:

```text
Ambient temperature: ___ °C
Flour amount: ___ g
Flour: Caputo 00 Pizzeria / T65
Expected fridge time: ___
```

Then calculate:

```text
Hydration
↓
Water
↓
Salt
↓
Yeast
↓
Predicted room fermentation
↓
Refrigeration trigger
↓
Cold-fermentation window
↓
Warm-up
↓
220°C baking
```

---

# 20. Output template

Use this format for future calculations:

```text
PIZZA DOUGH CALCULATION

Inputs
------
Ambient: XX°C
Flour: XXX g
Flour type: Caputo 00 Pizzeria / T65
Fridge: 7°C
Oven: 220°C
Expected cold time: XX h

Formula
-------
Flour: XXX g
Water: XXX g (XX%)
Salt: XX g (2.5%)
Saf-Instant Red: XX g (XX%)

Total dough: XXX g

Fermentation
------------
Room temperature: XX°C
Predicted RT time: XX–XX h
Start checking: XX h
Refrigerate when: approximately 30–50% volume increase
Fridge: 7°C
Recommended cold window: XX–XX h

Before baking
-------------
Remove from fridge: approximately X–X h before baking
Final condition: relaxed, expanded, extensible

Bake
----
Oven: 220°C
Steel/stone: recommended
Preheat: 45–60 min
Toppings: keep relatively dry/light
```

---

# 21. Calibration log

The most valuable improvement will come from recording actual batches.

| Batch | Flour | Ambient | Yeast % | RT time | Fridge °C | Cold time | Dough at fridge | Dough at bake | Bake result |
|---|---|---:|---:|---:|---:|---:|---|---|---|
| 1 | Caputo | | | | 7 | | | | |
| 2 | Caputo | | | | 7 | | | | |
| 3 | T65 | | | | 7 | | | | |
| 4 | T65 | | | | 7 | | | | |

Record especially:

- actual room temperature
- actual dough temperature after mixing, if possible
- yeast weight
- time until refrigeration
- dough volume increase before refrigeration
- time in refrigerator
- dough condition when removed
- time to become workable
- oven bake time
- crust color
- underside color
- crumb structure
- whether the center was dry, wet or gummy
- whether the dough stretched easily or tore/recoiled

After 3–5 controlled batches, yeast and hydration can be adjusted much more confidently.

---

# 22. Decision rules for future batches

### Dough too gassy / over-fermented before refrigeration

Next batch:

- reduce yeast by ~10–20%, **or**
- refrigerate earlier

Do not change yeast and hydration simultaneously.

### Dough barely fermented before refrigeration

Next batch:

- increase yeast by ~10–20%, **or**
- extend room-temperature fermentation

### Dough is difficult to stretch and tears

Possible causes:

- under-fermentation
- insufficient rest after refrigeration
- flour too strong for the schedule
- hydration too low

First increase warm-up/rest time before increasing hydration.

### Dough is excessively sticky

First suspect:

- hydration too high for the flour
- dough too warm
- insufficient gluten development
- over-fermentation

Do not immediately add bench flour to compensate.

### Pizza is pale and dry after a long 220°C bake

Possible responses:

- increase top heat if the oven permits
- improve preheating/thermal mass
- reduce hydration slightly
- reduce topping moisture
- consider a steel rather than a stone
- bake smaller/thinner

### Base is cooked but top is pale

The limitation is primarily oven heat distribution, not necessarily the dough formula.

---

# 23. Current recommended baseline

Until real batch data is collected, use:

## Caputo 00 Pizzeria

```text
Hydration: 62%
Salt: 2.5%
IDY: 0.10%
Fridge: 7°C
Oven: 220°C
```

## Spanish T65

```text
Hydration: 61%
Salt: 2.5%
IDY: 0.10%
Fridge: 7°C
Oven: 220°C
```

At approximately 21°C ambient:

```text
Room fermentation: ~4.5–5.5 h
Start checking: ~4 h
```

Do not treat those times as fixed. Refrigerate according to dough development.

---

# 24. Evidence and confidence

### High confidence

- Baker's percentage calculation
- Hydration calculation
- Saf-Instant Red being an instant yeast intended for lean/low-sugar dough and pizza
- 7°C being a meaningful cold-fermentation temperature rather than a complete stop
- 220°C requiring a different baking strategy from true Neapolitan temperatures
- Caputo Pizzeria specifications when that exact product is used

### Moderate confidence

- Starting at ~61–62% hydration for this 220°C setup
- 2.5% salt
- 0.10% IDY as the practical starting point for an overnight-to-48 h schedule
- 4–6 h room-temperature fermentation around 20–22°C

### Low confidence / must be calibrated

- Exact yeast percentage for a particular ambient temperature
- Exact fermentation time to the minute
- Exact hydration for the unspecified Spanish T65
- Exact maximum cold-fermentation duration at 7°C
- Exact bake time at 220°C

The calculator should therefore be treated as a **controlled starting model**. The goal is not to pretend that yeast activity can be predicted perfectly from a formula; it is to reduce the number of uncontrolled variables and make each batch informative.

---

# Sources

1. **Saf-instant — The Original Red 11g**  
   Official product information and usage instructions.

2. **Mulino Caputo — Pizzeria 1kg**  
   Official specifications for Caputo Pizzeria 00: 12.5% protein, W 260–280, P/L 0.50–0.60.

3. **Ooni — Pizza Dough Hydration Explained**  
   General hydration behavior and the typical 60–65% range for Neapolitan-style dough.

4. **Serious Eats — Breville Pizzaiolo review**  
   Discussion of the large difference between high-temperature Neapolitan baking and conventional home ovens, including the effect of longer baking on moisture and crust texture.

5. **Pizza Dough Yeast Calculator / Dough School**  
   Useful secondary reference for the scale of yeast percentages used in long cold-fermented pizza. This is treated as a reference point, not an authoritative fermentation law.

6. **Pizza community reports**  
   Used only as anecdotal evidence that very small IDY quantities can work in long pizza fermentations. These reports are not treated as controlled experimental evidence.

