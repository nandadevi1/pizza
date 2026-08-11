const flourTypeInput = document.getElementById("flour-type");
const flourInput = document.getElementById("flour");
const tempInput = document.getElementById("temp");
const ovenTempInput = document.getElementById("oven-temp");
const fridgeTempInput = document.getElementById("fridge-temp");
const hydrationModeInput = document.getElementById("hydration-mode");
const manualHydrationInput = document.getElementById("manual-hydration");
const calculateBtn = document.getElementById("calculate");
const resetBtn = document.getElementById("reset");
const ingredientsDiv = document.getElementById("ingredients");
const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));

const STORAGE_KEY = "pizzaTracker";
const FLOUR_PER_PIZZA = 90;
const SALT_PERCENT = 2.5;
const YEAST_PERCENT = 1.0;
const FLOUR_TYPES = {
  caputo: { name: "Caputo 00 Pizzeria", hydration: 62, confidence: "high" },
  t65: { name: "Spanish T65", hydration: 61, confidence: "medium" },
};
const OVEN_CORRECTIONS = [[200, -2], [210, -1], [220, 0], [230, 0.5], [240, 1], [250, 1.5], [275, 2.5], [300, 3.5], [350, 5]];

function roundTo(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function interpolate(points, value) {
  if (value <= points[0][0]) return { value: points[0][1], extrapolated: value < points[0][0] };
  const last = points[points.length - 1];
  if (value >= last[0]) return { value: last[1], extrapolated: value > last[0] };
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    if (value >= x1 && value <= x2) return { value: y1 + ((value - x1) / (x2 - x1)) * (y2 - y1), extrapolated: false };
  }
  return { value: 0, extrapolated: true };
}

function buildPlan(flourTypeKey, flour, ambient, settings) {
  const flourType = FLOUR_TYPES[flourTypeKey];
  const ovenCorrection = interpolate(OVEN_CORRECTIONS, settings.ovenTemp);
  const recommendedHydration = flourType.hydration + ovenCorrection.value;
  const hydration = settings.hydrationMode === "manual" ? settings.manualHydration : recommendedHydration;
  const water = flour * hydration / 100;
  const salt = flour * SALT_PERCENT / 100;
  const yeast = flour * YEAST_PERCENT / 100;
  const totalDough = flour + water + salt + yeast;

  return {
    flourType, flour, hydration: roundTo(hydration, 1), recommendedHydration: roundTo(recommendedHydration, 1),
    hydrationMode: settings.hydrationMode, water: roundTo(water, 2), salt: roundTo(salt, 2),
    yeast: roundTo(yeast, 3), yeastPct: YEAST_PERCENT, totalDough: roundTo(totalDough, 2),
  };
}

function renderIngredients(plan) {
  const hydrationDetail = plan.hydrationMode === "manual"
    ? `Recommended ${plan.recommendedHydration}% · using ${plan.hydration}%`
    : `${plan.hydration}% auto recommendation`;
  ingredientsDiv.innerHTML = `
    <h2 class="ingredients-title">Formula</h2>
    <div class="ingredients-grid">
      <div class="ingredient-item"><strong>Flour (${plan.flourType.name})</strong>${plan.flour} g</div>
      <div class="ingredient-item"><strong>Water</strong>${plan.water} g</div>
      <div class="ingredient-item"><strong>Hydration</strong>${hydrationDetail}</div>
      <div class="ingredient-item"><strong>Guérande coarse salt</strong>${plan.salt} g (${SALT_PERCENT}% baker's percentage)</div>
      <div class="ingredient-item"><strong>Model yeast (${plan.yeastPct}%)</strong>${plan.yeast} g</div>
      <div class="ingredient-item"><strong>Total dough</strong>${plan.totalDough} g</div>
    </div>
  `;
}

function clearResults() {
  ingredientsDiv.innerHTML = "";
}

function getSettings() {
  return {
    ovenTemp: parseFloat(ovenTempInput.value), fridgeTemp: parseFloat(fridgeTempInput.value),
    hydrationMode: hydrationModeInput.value, manualHydration: parseFloat(manualHydrationInput.value), ambient: parseFloat(tempInput.value),
  };
}

function saveInputs(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadInputs() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!saved) return;
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    if (saved[input.id] !== undefined) input.value = saved[input.id];
  });
  toggleConditionalInputs();
}

function toggleConditionalInputs() {
  manualHydrationInput.hidden = hydrationModeInput.value !== "manual";
}

function runCalculation() {
  const flourTypeKey = flourTypeInput.value;
  const flour = parseFloat(flourInput.value);
  const ambient = parseFloat(tempInput.value);
  const settings = getSettings();
  if (!FLOUR_TYPES[flourTypeKey]) return alert("Select a flour type.");
  if (!flour || flour < FLOUR_PER_PIZZA) return alert(`Minimum is ${FLOUR_PER_PIZZA} g of flour.`);
  if (!ambient || ambient <= 0) return alert("Enter a valid ambient temperature.");
  if (Object.values(settings).some((value) => typeof value === "number" && (!Number.isFinite(value) || value < 0))) return alert("Enter valid calculation settings.");
  const plan = buildPlan(flourTypeKey, flour, ambient, settings);
  renderIngredients(plan);
  const fields = Array.from(document.querySelectorAll("input, select"));
  saveInputs(Object.fromEntries(fields.map((input) => [input.id, input.value])));
  resetBtn.disabled = false;
}

tabButtons.forEach((btn) => btn.addEventListener("click", () => {
  const target = btn.dataset.tab;
  tabButtons.forEach((button) => {
    const active = button === btn;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  tabPanels.forEach((panel) => { panel.hidden = panel.id !== target; });
}));

hydrationModeInput.addEventListener("change", toggleConditionalInputs);
calculateBtn.addEventListener("click", runCalculation);
resetBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
});

loadInputs();
