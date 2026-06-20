const flourInput = document.getElementById("flour");
const tempInput = document.getElementById("temp");
const hydrationInput = document.getElementById("hydration");
const proofModeInput = document.getElementById("proof-mode");
const calculateBtn = document.getElementById("calculate");
const resetBtn = document.getElementById("reset");
const ingredientsDiv = document.getElementById("ingredients");
const stagesDiv = document.getElementById("stages");
const timelineDiv = document.getElementById("timeline");

const STORAGE_KEY = "pizzaTracker";
const DEFAULT_HYDRATION = 65;
const DEFAULT_PROOF_MODE = "room_overnight";

let stages = [];

function clamp(min, max, value) {
  return Math.min(max, Math.max(min, value));
}

function activityFactor(tempC) {
  return 2 ** ((tempC - 21) / 10);
}

function buildStagePlan(hydration, proofMode, roomTempC) {
  const isHighHydration = hydration >= 75;
  const autolyseSec = 25 * 60;
  const bulkOrBenchSec = isHighHydration ? Math.round(2.25 * 3600) : 20 * 60;
  const roomProofSec = Math.round(3 * 3600 * (activityFactor(21) / activityFactor(roomTempC)));
  const roomOvernightRoomSec = 5 * 3600;
  const overnightColdSec = 12 * 3600;
  const temperSec = proofMode === "room_temperature" ? 0 : 2 * 3600;

  const stagePlan = [];
  stagePlan.push({ name: "Autolyse", color: "#ff3b30", duration: autolyseSec });
  stagePlan.push({
    name: "Bulk Fermentation",
    color: "#0ea5e9",
    duration: bulkOrBenchSec,
  });
  stagePlan.push({
    name: proofMode === "room_temperature" ? "Final Proof" : "Cold Proof",
    color: "#f59e0b",
    duration: proofMode === "room_temperature" ? roomProofSec : 0,
  });
  if (proofMode === "room_overnight") {
    stagePlan.length = 0;
    stagePlan.push({ name: "Autolyse", color: "#ff3b30", duration: autolyseSec });
    stagePlan.push({
      name: "Bulk Fermentation",
      color: "#0ea5e9",
      duration: bulkOrBenchSec,
    });
    stagePlan.push({
      name: "Room Ferment",
      color: "#f59e0b",
      duration: roomOvernightRoomSec,
    });
    stagePlan.push({
      name: "Overnight Cold Proof",
      color: "#a78bfa",
      duration: overnightColdSec,
    });
  }
  if (temperSec > 0) {
    stagePlan.push({ name: "Temper", color: "#34d399", duration: temperSec });
  }

  return {
    stagePlan,
    autolyseSec,
    bulkOrBenchSec,
    roomProofSec,
    temperSec,
    roomOvernightRoomSec,
    overnightColdSec,
  };
}

function calculateYeastPct(
  proofMode,
  bulkOrBenchSec,
  roomProofSec,
  temperSec,
  roomTempC,
  roomOvernightRoomSec,
  overnightColdSec,
) {
  const bulkOrBenchHours = bulkOrBenchSec / 3600;
  const roomProofHours = roomProofSec / 3600;
  const temperHours = temperSec / 3600;
  const roomOvernightRoomHours = roomOvernightRoomSec / 3600;
  const overnightColdHours = overnightColdSec / 3600;

  let efu = 0;
  if (proofMode === "room_temperature") {
    efu = (bulkOrBenchHours + roomProofHours) * activityFactor(roomTempC);
  } else if (proofMode === "room_overnight") {
    efu =
      (bulkOrBenchHours + roomOvernightRoomHours + temperHours) * activityFactor(roomTempC) +
      overnightColdHours * activityFactor(4);
  }

  return clamp(0.03, 1.0, 1.6 / Math.max(efu, 0.01));
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours && minutes) return `${hours} hr ${minutes} min`;
  if (hours) return `${hours} hr`;
  return `${minutes} min`;
}

function getTotalDuration() {
  return stages.reduce((sum, stage) => sum + stage.duration, 0);
}

function updateControlState() {
  resetBtn.disabled = !stages.length;
}

function renderIngredients(water, yeast, salt) {
  const hydration = parseFloat(hydrationInput.value) || DEFAULT_HYDRATION;
  ingredientsDiv.innerHTML = `
    <h2 class="ingredients-title">Ingredients</h2>
    <div class="ingredients-grid">
      <div class="ingredient-item"><strong>Water</strong>${water} g</div>
      <div class="ingredient-item"><strong>Dry Yeast</strong>${yeast} g</div>
      <div class="ingredient-item"><strong>Salt</strong>${salt} g</div>
      <div class="ingredient-item"><strong>Hydration</strong>${hydration.toFixed(1)}%</div>
    </div>
  `;
}

function calculateTimelineWeights() {
  const totalDuration = getTotalDuration();
  if (!totalDuration) return [];
  const alpha = 0.45;
  const minVisualShare = 0.15;
  const rawWeights = stages.map((stage) => {
    const share = stage.duration / totalDuration;
    return minVisualShare + alpha * share;
  });
  const sum = rawWeights.reduce((acc, weight) => acc + weight, 0);
  return rawWeights.map((weight) => (weight / sum) * 100);
}

function renderTimeline() {
  if (!stages.length) {
    timelineDiv.innerHTML = "";
    return;
  }

  const timelineWeights = calculateTimelineWeights();
  const totalDuration = getTotalDuration();

  const segmentsHtml = stages
    .map((stage, index) => {
      const width = (timelineWeights[index] || 0).toFixed(2);
      return `
        <div class="timeline-segment" style="width:${width}%;background:${stage.color}">
          <span>${index + 1}</span>
        </div>
      `;
    })
    .join("");

  const legendHtml = stages
    .map((stage, index) => {
      return `
        <li>
          <span class="swatch" style="background:${stage.color}"></span>
          <span class="stage-step">Step ${index + 1}</span>
          <strong>${stage.name}</strong>
          <span>${formatTime(stage.duration)}</span>
        </li>
      `;
    })
    .join("");

  timelineDiv.innerHTML = `
    <h2>Process Timeline</h2>
    <p class="timeline-total">Total time: ${formatTime(totalDuration)}</p>
    <div class="timeline-track">
      ${segmentsHtml}
    </div>
    <ul class="timeline-legend">${legendHtml}</ul>
  `;
}

function getCurrentState() {
  const flour = parseFloat(flourInput.value) || 0;
  const hydration = parseFloat(hydrationInput.value) || DEFAULT_HYDRATION;
  const roomTempC = clamp(15, 30, parseFloat(tempInput.value) || 20);
  const proofMode = proofModeInput.value || DEFAULT_PROOF_MODE;
  const {
    bulkOrBenchSec,
    roomProofSec,
    temperSec,
    roomOvernightRoomSec,
    overnightColdSec,
  } = buildStagePlan(hydration, proofMode, roomTempC);
  const yeastPct = calculateYeastPct(
    proofMode,
    bulkOrBenchSec,
    roomProofSec,
    temperSec,
    roomTempC,
    roomOvernightRoomSec,
    overnightColdSec,
  );

  return {
    flour: flour || null,
    temp: parseFloat(tempInput.value) || null,
    hydration,
    proofMode,
    water: ((flour * hydration) / 100).toFixed(1),
    yeast: (flour * (yeastPct / 100)).toFixed(2),
    salt: (flour * 0.025).toFixed(2),
    stages,
    updatedAtMs: Date.now(),
  };
}

function applyState(state) {
  if (!state) return;

  flourInput.value = state.flour ?? "";
  tempInput.value = state.temp ?? "";
  hydrationInput.value = state.hydration ?? DEFAULT_HYDRATION;
  proofModeInput.value = state.proofMode || DEFAULT_PROOF_MODE;

  stages = state.stages || [];

  if (state.water && state.yeast && state.salt) {
    renderIngredients(state.water, state.yeast, state.salt);
  }

  if (stages.length) {
    renderTimeline();
  } else {
    stagesDiv.innerHTML = "";
    timelineDiv.innerHTML = "";
  }

  updateControlState();
}

function saveProgress(data) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const updated = { ...existing, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function persistAll(extra = {}) {
  const payload = {
    ...getCurrentState(),
    ...extra,
  };
  saveProgress(payload);
}

function clearAllState() {
  stages = [];
  ingredientsDiv.innerHTML = "";
  stagesDiv.innerHTML = "";
  timelineDiv.innerHTML = "";
}

function setDefaultInputs() {
  flourInput.value = "180";
  tempInput.value = "20";
  hydrationInput.value = String(DEFAULT_HYDRATION);
  proofModeInput.value = DEFAULT_PROOF_MODE;
}

function runCalculation() {
  const flour = parseFloat(flourInput.value);
  const temp = parseFloat(tempInput.value);
  const hydrationRaw = parseFloat(hydrationInput.value);
  const hydration = hydrationRaw;
  const roomTempC = clamp(15, 30, temp);
  const proofMode = proofModeInput.value || DEFAULT_PROOF_MODE;

  if (
    !flour ||
    !temp ||
    !hydrationRaw ||
    flour <= 0 ||
    temp <= 0 ||
    hydration < 40 ||
    hydration > 90
  ) {
    return alert("Enter valid values.");
  }

  const water = ((flour * hydration) / 100).toFixed(1);
  const salt = (flour * 0.025).toFixed(2);
  const {
    stagePlan,
    bulkOrBenchSec,
    roomProofSec,
    temperSec,
    roomOvernightRoomSec,
    overnightColdSec,
  } = buildStagePlan(hydration, proofMode, roomTempC);
  const yeastPct = calculateYeastPct(
    proofMode,
    bulkOrBenchSec,
    roomProofSec,
    temperSec,
    roomTempC,
    roomOvernightRoomSec,
    overnightColdSec,
  );
  const yeast = (flour * (yeastPct / 100)).toFixed(2);

  renderIngredients(water, yeast, salt);
  stages = stagePlan;
  stagesDiv.innerHTML = "";
  renderTimeline();

  updateControlState();
  persistAll({ water, yeast, salt });
}

calculateBtn.addEventListener("click", () => {
  runCalculation();
});

resetBtn.addEventListener("click", () => {
  if (resetBtn.disabled) return;
  if (!stages.length) return;
  clearAllState();
  updateControlState();
  setDefaultInputs();
  localStorage.removeItem(STORAGE_KEY);
});

function loadProgress() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  setDefaultInputs();
  if (saved) {
    applyState(saved);
  } else {
    clearAllState();
    updateControlState();
  }
}

loadProgress();
