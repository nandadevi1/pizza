# AGENTS.md - Dingo Pizza Calculator (web app 2)

## Project Overview
Mobile-first Neapolitan pizza dough calculator. Vanilla JavaScript (ES2023), HTML5, CSS3. No build system or dependencies. Computes a dough formula (flour, water, salt, yeast, hydration) from flour type, ambient temperature, oven temperature, and hydration mode. No timers or stage tracking.

## Global Collaboration Rule
- Implement only what the user explicitly requests.
- Do not add extra features proactively.
- If an additional feature appears necessary, ask for approval before implementing it.

## File Structure
```
├── index.html              # Main UI: tabs, Calculator + Details panels
├── script.js               # Core logic (formula calc, tab switching, persistence)
├── style.css               # Mobile-first styles, tabs, formula grid
├── bak_index.html          # Old version backup (pre-2.0)
├── gemini.md               # Dev notes / reference
├── New data/               # Reference docs (calculator.md, calculation2.md, calibrate.txt)
├── Documents/              # Design refs (mockups, Pizza 2.html/.md), gitignored
└── AGENTS.md               # This file
```

## Commands
No build, lint, or test commands. Static HTML/CSS/JS app.

**Run locally:**
```bash
# Python HTTP server
python -m http.server 8000

# Or Node.js serve
npx serve .
```

**Open:** `http://localhost:8000`

## Code Style Guidelines

### JavaScript (script.js)
- Use `const` by default, `let` for reassignment
- Cache DOM elements at top of file
- Arrow functions for event listeners
- Named functions with camelCase: `buildPlan()`, `runCalculation()`
- Template literals for HTML generation
- Guard clauses with early returns
- `roundTo(value, digits)` for calculations, `.toFixed()` not used

### CSS (style.css)
- Mobile-first responsive design
- Simple class names in kebab-case: `.tab-btn`, `.ingredient-item`
- `@media (min-width: 640px)` breakpoint for desktop
- `transition` for smooth UI feedback

### HTML (index.html)
- Semantic structure with IDs for JS access
- Tab panels use `role="tablist"` / `role="tab"` / `role="tabpanel"` with `hidden` attribute
- Input types: `number` for flour/temp/oven, `select` for flour type/hydration mode
- Viewport meta tag required

### Naming Conventions
- **Files:** lowercase (`index.html`, `script.js`, `style.css`)
- **Variables:** camelCase (`flourInput`, `flourTypeInput`)
- **Functions:** camelCase with verbs (`runCalculation()`, `saveInputs()`)
- **CSS Classes:** kebab-case (`tab-panel`, `button-row`)

## Formula Logic
- Constants: `FLOUR_PER_PIZZA = 90`, `SALT_PERCENT = 2.5`, `YEAST_PERCENT = 0.1`
- `FLOUR_TYPES`: `caputo` (hydration 62), `t65` (hydration 61), each with a confidence rating
- `OVEN_CORRECTIONS`: `[ovenTemp, hydrationDelta]` breakpoints, interpolated linearly via `interpolate()`
- `recommendedHydration = flourType.hydration + ovenCorrection`; manual mode overrides it
- `water = flour * hydration / 100`, `salt = flour * 0.025`, `yeast = flour * 0.001`
- Default profile: HOME-OVEN-220-7C (oven 220°C, fridge 7°C)

## Storage
- Key: `"pizzaTracker"`
- `saveInputs(data)` stores all input/select values as an object keyed by element id
- `loadInputs()` restores values on load; `toggleConditionalInputs()` shows manual hydration input only in manual mode
- Reset clears localStorage and reloads the page

## Error Handling
- Validate inputs in `runCalculation()`: flour type, flour >= 90 g, ambient > 0, settings numeric/non-negative
- Failures show `alert()` and return early

## Development Notes
- Refresh browser to test changes
- Clear localStorage in console to reset: `localStorage.removeItem("pizzaTracker")`
- Test mobile viewport in dev tools
- `Documents/` and `Data/` are gitignored; do not commit their contents
