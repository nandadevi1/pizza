const flourInput = document.getElementById("flour");
const tempInput = document.getElementById("temp");
const hydrationInput = document.getElementById("hydration");
const calculateBtn = document.getElementById("calculate");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const ingredientsDiv = document.getElementById("ingredients");
const stagesDiv = document.getElementById("stages");
const timelineDiv = document.getElementById("timeline");
const alertSound = document.getElementById("alert-sound");

const STORAGE_KEY = "pizzaTracker";
const DEFAULT_HYDRATION = 65;

let stages = [];
let currentStage = 0;
let currentInterval = null;
let stageStartedAt = null;
let stageElapsedBeforePause = 0;
let processStartedAt = null;
let isRunning = false;
let processLocked = false;

function calculateStageDurations(hydration, temp) {
  const baseAutolyse = 20;
  const baseFermentation = 120;
  const baseProofing = 60;

  const tempFactor = 22 / temp;
  const hydrationFactor = 65 / hydration;

  return [
    {
      name: "Autolyse",
      color: "#ff3b30",
      duration: Math.round(baseAutolyse * 60 * hydrationFactor),
    },
    {
      name: "Fermentation",
      color: "#0ea5e9",
      duration: Math.round(
        baseFermentation * 60 * tempFactor * hydrationFactor,
      ),
    },
    {
      name: "Proofing",
      color: "#34d399",
      duration: Math.round(baseProofing * 60 * tempFactor * hydrationFactor),
    },
  ];
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}m ${secs}s`;
}

function getTotalDuration() {
  return stages.reduce((sum, stage) => sum + stage.duration, 0);
}

function getTotalElapsed(now) {
  if (!stages.length || currentStage >= stages.length) return getTotalDuration();

  const doneSeconds = stages
    .slice(0, currentStage)
    .reduce((sum, stage) => sum + stage.duration, 0);
  const liveElapsed = stageStartedAt ? Math.floor((now - stageStartedAt) / 1000) : 0;
  const stageElapsed = Math.max(0, stageElapsedBeforePause + liveElapsed);
  return Math.min(doneSeconds + Math.max(0, stageElapsed), getTotalDuration());
}

function setEditingEnabled(enabled) {
  flourInput.disabled = !enabled;
  tempInput.disabled = !enabled;
  hydrationInput.disabled = !enabled;
  calculateBtn.disabled = !enabled;
}

function updateControlState() {
  setEditingEnabled(!processLocked);
  startBtn.disabled = !stages.length || currentStage >= stages.length;
  startBtn.textContent = isRunning ? "STOP" : "START";
  resetBtn.disabled = !processLocked || isRunning;
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

function getOverallPercent(totalElapsed) {
  if (!stages.length) return 0;
  const totalDuration = getTotalDuration();
  const clampedElapsed = Math.min(Math.max(0, totalElapsed), totalDuration);
  const weights = calculateTimelineWeights();
  let weightedPercent = 0;
  let elapsedRemaining = clampedElapsed;

  stages.forEach((stage, index) => {
    if (elapsedRemaining <= 0) return;
    const stageElapsed = Math.min(elapsedRemaining, stage.duration);
    const stagePercent = stageElapsed / stage.duration;
    weightedPercent += (weights[index] || 0) * stagePercent;
    elapsedRemaining -= stageElapsed;
  });

  return Math.min(weightedPercent, 100);
}

function renderTimeline(totalElapsed = 0) {
  if (!stages.length) {
    timelineDiv.innerHTML = "";
    return;
  }

  const timelineWeights = calculateTimelineWeights();
  const overallPercent = getOverallPercent(totalElapsed);

  const segmentsHtml = stages
    .map((stage, index) => {
      const width = (timelineWeights[index] || 0).toFixed(2);
      return `<div class="timeline-segment" style="width:${width}%;background:${stage.color}"></div>`;
    })
    .join("");

  const legendHtml = stages
    .map((stage, index) => {
      const marker = index === currentStage ? " (Current)" : "";
      return `<li>${stage.name}${marker}</li>`;
    })
    .join("");

  timelineDiv.innerHTML = `
    <h2>Process Timeline</h2>
    <div class="timeline-track">
      ${segmentsHtml}
      <div class="timeline-fill" style="width:${overallPercent}%"></div>
    </div>
    <ul class="timeline-legend">${legendHtml}</ul>
  `;
}

function renderStage(stageIndex, stageElapsed) {
  if (stageIndex >= stages.length) {
    stagesDiv.innerHTML = `<p class="stage-title">All stages complete. Dough is ready.</p>`;
    return;
  }

  const stage = stages[stageIndex];
  const remaining = Math.max(0, stage.duration - stageElapsed);
  const percent = Math.min((stageElapsed / stage.duration) * 100, 100);

  stagesDiv.innerHTML = `
    <div class="stage-container ${remaining === 0 ? "stage-complete" : ""}">
      <div class="stage-title">${stage.name}</div>
      <div class="stage-timer">${remaining === 0 ? "Complete" : `Time left: ${formatTime(remaining)}`}</div>
      <div class="progress-bar">
        <div class="progress-inner" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

function completeRun() {
  isRunning = false;
  currentStage = stages.length;
  stageStartedAt = null;
  stageElapsedBeforePause = 0;
  updateControlState();
  saveProgress({ isRunning, currentStage, stageStartedAt, stageElapsedBeforePause, processLocked });
  renderTimeline(getTotalDuration());
  renderStage(currentStage, 0);
  alert("Dough ready to bake!");
}

calculateBtn.addEventListener("click", () => {
  runCalculation();
});

function runCalculation() {
  const flour = parseFloat(flourInput.value);
  const temp = parseFloat(tempInput.value);
  const hydration = parseFloat(hydrationInput.value);

  if (!flour || !temp || !hydration || flour <= 0 || temp <= 0 || hydration <= 0) {
    return alert("Enter valid values.");
  }

  if (currentInterval) clearInterval(currentInterval);
  isRunning = false;

  const water = ((flour * hydration) / 100).toFixed(1);
  const yeast = (flour * 0.02).toFixed(2);
  const salt = (flour * 0.02).toFixed(2);

  renderIngredients(water, yeast, salt);
  stages = calculateStageDurations(hydration, temp);
  currentStage = 0;
  stageStartedAt = null;
  stageElapsedBeforePause = 0;
  processStartedAt = null;
  processLocked = false;
  stagesDiv.innerHTML = "";
  renderTimeline(0);

  updateControlState();
  saveProgress({
    flour,
    temp,
    water,
    yeast,
    salt,
    hydration: hydration.toFixed(1),
    stages,
    currentStage,
    isRunning,
    stageStartedAt,
    stageElapsedBeforePause,
    processStartedAt,
    processLocked,
  });
}

hydrationInput.addEventListener("input", () => {
  const flour = parseFloat(flourInput.value);
  const temp = parseFloat(tempInput.value);
  const hydration = parseFloat(hydrationInput.value);
  if (!flour || !temp || !hydration || flour <= 0 || temp <= 0 || hydration <= 0) return;
  runCalculation();
});

startBtn.addEventListener("click", () => {
  if (!stages.length || currentStage >= stages.length) return;

  if (isRunning) {
    const now = Date.now();
    const elapsedThisRun = stageStartedAt ? Math.floor((now - stageStartedAt) / 1000) : 0;
    stageElapsedBeforePause += Math.max(0, elapsedThisRun);
    isRunning = false;
    stageStartedAt = null;
    if (currentInterval) clearInterval(currentInterval);
    updateControlState();
    saveProgress({ isRunning, stageStartedAt, stageElapsedBeforePause, currentStage, processLocked });
    renderStage(currentStage, Math.min(stageElapsedBeforePause, stages[currentStage].duration));
    renderTimeline(getTotalElapsed(Date.now()));
    return;
  }

  isRunning = true;
  processLocked = true;
  updateControlState();
  processStartedAt = processStartedAt || Date.now();
  stageStartedAt = Date.now();
  saveProgress({
    isRunning,
    processStartedAt,
    stageStartedAt,
    stageElapsedBeforePause,
    currentStage,
    processLocked,
  });
  runStage();
});

resetBtn.addEventListener("click", () => {
  if (isRunning || !processLocked) return;
  if (currentInterval) clearInterval(currentInterval);

  stages = [];
  currentStage = 0;
  stageStartedAt = null;
  stageElapsedBeforePause = 0;
  processStartedAt = null;
  isRunning = false;
  processLocked = false;

  ingredientsDiv.innerHTML = "";
  stagesDiv.innerHTML = "";
  timelineDiv.innerHTML = "";
  localStorage.removeItem(STORAGE_KEY);
  updateControlState();
});

function runStage() {
  if (!isRunning) return;
  if (currentInterval) clearInterval(currentInterval);

  const tick = () => {
    if (currentStage >= stages.length) {
      completeRun();
      return;
    }

    const now = Date.now();
    const stage = stages[currentStage];
    const stageElapsedLive = stageStartedAt ? Math.floor((now - stageStartedAt) / 1000) : 0;
    const stageElapsed = Math.max(0, stageElapsedBeforePause + stageElapsedLive);

    renderStage(currentStage, Math.min(stageElapsed, stage.duration));
    renderTimeline(getTotalElapsed(now));

    if (stageElapsed >= stage.duration) {
      alertSound.play().catch(() => {});
      alert(`${stage.name} complete`);
      currentStage += 1;
      stageStartedAt = now;
      stageElapsedBeforePause = 0;
      if (currentStage >= stages.length) {
        completeRun();
      } else {
        saveProgress({ currentStage, stageStartedAt, stageElapsedBeforePause, processLocked });
      }
    }
  };

  tick();
  currentInterval = setInterval(tick, 1000);
}

function saveProgress(data) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const updated = { ...existing, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function loadProgress() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!saved) return;

  flourInput.value = saved.flour || "";
  tempInput.value = saved.temp || "";
  hydrationInput.value = saved.hydration || DEFAULT_HYDRATION;
  stages = saved.stages || [];
  currentStage = typeof saved.currentStage === "number" ? saved.currentStage : 0;
  isRunning = Boolean(saved.isRunning);
  stageStartedAt = saved.stageStartedAt || null;
  stageElapsedBeforePause = saved.stageElapsedBeforePause || 0;
  processStartedAt = saved.processStartedAt || null;
  processLocked = Boolean(saved.processLocked);

  if (saved.water && saved.yeast && saved.salt) {
    renderIngredients(saved.water, saved.yeast, saved.salt);
  }

  if (stages.length) {
    updateControlState();
    const now = Date.now();

    if (isRunning && stageStartedAt) {
      runStage();
      return;
    }

    const stageElapsed = stageElapsedBeforePause;
    renderStage(currentStage, stageElapsed);
    renderTimeline(getTotalElapsed(now));
  } else {
    updateControlState();
  }
}

loadProgress();
