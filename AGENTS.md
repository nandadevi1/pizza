# AGENTS.md - Pizza Dough Tracker (web app 2)

## Project Overview
Simple mobile-first pizza dough tracking web app. Vanilla JavaScript (ES2023), HTML5, CSS3. No build system or dependencies. Calculates ingredients and tracks dough stages with progress bars.

## Global Collaboration Rule
- Implement only what the user explicitly requests.
- Do not add extra features proactively.
- If an additional feature appears necessary, ask for approval before implementing it.

## File Structure
```
web app 2/
├── index.html              # Main UI with inputs, timeline, and stage display
├── script.js               # Core logic (calculation, timer engine, persistence)
├── style.css               # Mobile-first styles and timeline visuals
├── sounds/
│   └── stage-complete.mp3  # Audio notification
├── Documents/
│   └── mockup.jpg          # Visual reference for timeline concept
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
- Named functions with camelCase: `calculateStageDurations()`, `saveProgress()`
- Template literals for HTML generation
- Guard clauses with early returns
- Use `Math.round()` for calculations, `.toFixed()` for display

### CSS (style.css)
- Mobile-first responsive design
- Simple class names in kebab-case: `.stage-container`, `.progress-bar`
- Use `#ddd`, `#4caf50`, `#2196f3` for UI colors
- `transition` for smooth progress bar animation

### HTML (index.html)
- Semantic structure with IDs for JS access
- Input types: `number` for flour/temp
- Viewport meta tag required
- Audio element for stage notifications

### Naming Conventions
- **Files:** lowercase (`index.html`, `script.js`, `style.css`)
- **Variables:** camelCase (`flourInput`, `currentStage`)
- **Functions:** camelCase with verbs (`calculateStageDurations()`)
- **CSS Classes:** kebab-case (`stage-container`, `progress-inner`)

## Data Model
```javascript
Stage = {
  name: string,      // "Autolyse", "Fermentation", "Proofing"
  color: string,     // Hex color used in timeline
  duration: number   // seconds
}

Progress = {
  flour: number,
  temp: number,
  water: string,
  yeast: string,
  salt: string,
  stages: Stage[],
  currentStage: number,
  isRunning: boolean,
  stageStartedAt: number | null,
  processStartedAt: number | null
}
```

## Key Implementation Patterns

### Storage
- Key: `"pizzaTracker"`
- Merge updates: `{ ...existing, ...data }`
- Save on ingredient calculation and stage completion

### Stage Progression
- Calculate durations based on temp/hydration factors
- `setInterval()` with 1-second updates
- Progress bar width updated via percentage calculation
- Play sound on completion, auto-advance to next stage
- Save stage timestamps so the run can resume after app close/reopen

### Timeline Visual Map
- Render segmented horizontal timeline where each segment width maps to stage duration
- Overlay overall progress indicator across full process
- Show stage legend and current stage marker in real time

### Temperature/Hydration Formula
- Base times: Autolyse 20min, Fermentation 120min, Proofing 60min
- Factors: `tempFactor = 22 / temp`, `hydrationFactor = 65 / hydration`
- Duration = base × 60 × factors (in seconds)

### Error Handling
- Validate inputs: `if (!flour || !temp) return alert(...)`
- Silent failures acceptable for non-critical operations

## Development Notes
- Refresh browser to test changes
- Clear localStorage in console to reset: `localStorage.removeItem("pizzaTracker")`
- Test mobile viewport in dev tools
- Audio requires user interaction first (browser policy)

## External APIs
- `localStorage` for persistence
- `HTMLAudioElement` for notifications
