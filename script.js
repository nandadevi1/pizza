const flourInput = document.getElementById("flour");
const tempInput = document.getElementById("temp");
const calculateBtn = document.getElementById("calculate");
const startBtn = document.getElementById("start");
const ingredientsDiv = document.getElementById("ingredients");
const stagesDiv = document.getElementById("stages");
const timelineDiv = document.getElementById("timeline");
const alertSound = document.getElementById("alert-sound");

const STORAGE_KEY = "pizzaTracker";
const HYDRATION = 65;

let stages = [];
let currentStage = 0;
let currentInterval = null;
let stageStartedAt = null;
let processStartedAt = null;
let isRunning = false;

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
  const stageElapsed = stageStartedAt ? Math.floor((now - stageStartedAt) / 1000) : 0;
  return Math.min(doneSeconds + Math.max(0, stageElapsed), getTotalDuration());
}

function renderIngredients(water, yeast, salt) {
  ingredientsDiv.innerHTML = `
    <h2 class="ingredients-title">Ingredients</h2>
    <div class="ingredients-grid">
      <div class="ingredient-item"><strong>Water</strong>${water} g</div>
      <div class="ingredient-item"><strong>Dry Yeast</strong>${yeast} g</div>
      <div class="ingredient-item"><strong>Salt</strong>${salt} g</div>
      <div class="ingredient-item"><strong>Hydration</strong>${HYDRATION.toFixed(1)}%</div>
    </div>
  `;
}

function renderTimeline(totalElapsed = 0) {
  if (!stages.length) {
    timelineDiv.innerHTML = "";
    return;
  }

  const totalDuration = getTotalDuration();
  const overallPercent = Math.min((totalElapsed / totalDuration) * 100, 100);

  const segmentsHtml = stages
    .map((stage) => {
      const width = ((stage.duration / totalDuration) * 100).toFixed(2);
      return `<div class="timeline-segment" style="width:${width}%;background:${stage.color}"></div>`;
    })
    .join("");

  const legendHtml = stages
    .map((stage, index) => {
      const marker = index === currentStage && isRunning ? " (Current)" : "";
      return `<li><span class="swatch" style="background:${stage.color}"></span>${stage.name}${marker}</li>`;
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
  startBtn.disabled = true;
  saveProgress({ isRunning, currentStage, stageStartedAt });
  renderTimeline(getTotalDuration());
  renderStage(currentStage, 0);
  alert("Dough ready to bake!");
}

calculateBtn.addEventListener("click", () => {
  const flour = parseFloat(flourInput.value);
  const temp = parseFloat(tempInput.value);

  if (!flour || !temp || flour <= 0 || temp <= 0) return alert("Enter valid values.");

  const water = ((flour * HYDRATION) / 100).toFixed(1);
  const yeast = (flour * 0.02).toFixed(2);
  const salt = (flour * 0.02).toFixed(2);

  renderIngredients(water, yeast, salt);
  stages = calculateStageDurations(HYDRATION, temp);
  currentStage = 0;
  isRunning = false;
  stageStartedAt = null;
  processStartedAt = null;
  stagesDiv.innerHTML = "";
  renderTimeline(0);

  startBtn.disabled = false;
  saveProgress({
    flour,
    temp,
    water,
    yeast,
    salt,
    hydration: HYDRATION.toFixed(1),
    stages,
    currentStage,
    isRunning,
    stageStartedAt,
    processStartedAt,
  });
});

startBtn.addEventListener("click", () => {
  if (!stages.length || isRunning || currentStage >= stages.length) return;
  isRunning = true;
  startBtn.disabled = true;
  processStartedAt = processStartedAt || Date.now();
  stageStartedAt = Date.now();
  saveProgress({ isRunning, processStartedAt, stageStartedAt, currentStage });
  runStage();
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
    const stageElapsed = Math.max(0, Math.floor((now - stageStartedAt) / 1000));

    renderStage(currentStage, Math.min(stageElapsed, stage.duration));
    renderTimeline(getTotalElapsed(now));

    if (stageElapsed >= stage.duration) {
      alertSound.play().catch(() => {});
      alert(`${stage.name} complete`);
      currentStage += 1;
      stageStartedAt = now;
      if (currentStage >= stages.length) {
        completeRun();
      } else {
        saveProgress({ currentStage, stageStartedAt });
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
  stages = saved.stages || [];
  currentStage = typeof saved.currentStage === "number" ? saved.currentStage : 0;
  isRunning = Boolean(saved.isRunning);
  stageStartedAt = saved.stageStartedAt || null;
  processStartedAt = saved.processStartedAt || null;

  if (saved.water && saved.yeast && saved.salt) {
    renderIngredients(saved.water, saved.yeast, saved.salt);
  }

  if (stages.length) {
    startBtn.disabled = currentStage >= stages.length || isRunning;
    const now = Date.now();

    if (isRunning && stageStartedAt) {
      runStage();
      return;
    }

    const stageElapsed = 0;
    renderStage(currentStage, stageElapsed);
    renderTimeline(getTotalElapsed(now));
  }
}

loadProgress();
