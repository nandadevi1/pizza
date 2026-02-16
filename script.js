import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

const flourInput = document.getElementById("flour");
const tempInput = document.getElementById("temp");
const hydrationInput = document.getElementById("hydration");
const calculateBtn = document.getElementById("calculate");
const startBtn = document.getElementById("start");
const resetBtn = document.getElementById("reset");
const sessionIdInput = document.getElementById("session-id");
const joinSessionBtn = document.getElementById("join-session");
const copySessionBtn = document.getElementById("copy-session");
const sessionStatus = document.getElementById("session-status");
const ingredientsDiv = document.getElementById("ingredients");
const stagesDiv = document.getElementById("stages");
const timelineDiv = document.getElementById("timeline");
const alertSound = document.getElementById("alert-sound");

const STORAGE_KEY = "pizzaTracker";
const DEFAULT_HYDRATION = 65;

let db = null;
let unsubscribe = null;
let cloudReady = false;
let currentSessionId = null;

let stages = [];
let currentStage = 0;
let currentInterval = null;
let stageStartedAt = null;
let stageElapsedBeforePause = 0;
let processStartedAt = null;
let isRunning = false;
let processLocked = false;

function initFirebase() {
  const completeConfig = Object.values(firebaseConfig).every(
    (value) => typeof value === "string" && value !== "REPLACE_ME" && value.length > 0,
  );
  if (!completeConfig) {
    sessionStatus.textContent = "Cloud: set Firebase config in script.js";
    return;
  }

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  cloudReady = true;
  sessionStatus.textContent = "Cloud: ready";
}

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
      duration: Math.round(baseFermentation * 60 * tempFactor * hydrationFactor),
    },
    {
      name: "Proofing",
      color: "#34d399",
      duration: Math.round(baseProofing * 60 * tempFactor * hydrationFactor),
    },
  ];
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = String(Math.floor(safe / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
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
  return Math.min(doneSeconds + stageElapsed, getTotalDuration());
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

function generateSessionId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function stateObject() {
  return {
    flour: parseFloat(flourInput.value) || null,
    temp: parseFloat(tempInput.value) || null,
    hydration: parseFloat(hydrationInput.value) || DEFAULT_HYDRATION,
    stages,
    currentStage,
    stageStartedAt,
    stageElapsedBeforePause,
    processStartedAt,
    isRunning,
    processLocked,
    water: ((parseFloat(flourInput.value) || 0) * ((parseFloat(hydrationInput.value) || DEFAULT_HYDRATION) / 100)).toFixed(1),
    yeast: ((parseFloat(flourInput.value) || 0) * 0.02).toFixed(2),
    salt: ((parseFloat(flourInput.value) || 0) * 0.02).toFixed(2),
  };
}

function applyState(state) {
  flourInput.value = state.flour ?? "";
  tempInput.value = state.temp ?? "";
  hydrationInput.value = state.hydration ?? DEFAULT_HYDRATION;

  stages = state.stages || [];
  currentStage = typeof state.currentStage === "number" ? state.currentStage : 0;
  stageStartedAt = state.stageStartedAt || null;
  stageElapsedBeforePause = state.stageElapsedBeforePause || 0;
  processStartedAt = state.processStartedAt || null;
  isRunning = Boolean(state.isRunning);
  processLocked = Boolean(state.processLocked);

  if (state.water && state.yeast && state.salt) {
    renderIngredients(state.water, state.yeast, state.salt);
  } else {
    ingredientsDiv.innerHTML = "";
  }

  if (stages.length) {
    renderTimeline(getTotalElapsed(Date.now()));
    renderStage(currentStage, Math.min(getTotalElapsed(Date.now()), stages[currentStage]?.duration || 0));
  } else {
    timelineDiv.innerHTML = "";
    stagesDiv.innerHTML = "";
  }

  updateControlState();

  if (isRunning && stages.length) {
    runStage();
  } else if (currentInterval) {
    clearInterval(currentInterval);
  }
}

function saveLocal(data) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const updated = { ...existing, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

async function saveCloud() {
  if (!cloudReady || !currentSessionId) return;
  await setDoc(
    doc(db, "sessions", currentSessionId),
    {
      ...stateObject(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

async function persistState(extra = {}) {
  const payload = { ...stateObject(), ...extra };
  saveLocal(payload);
  try {
    await saveCloud();
  } catch {
    sessionStatus.textContent = "Cloud: save failed";
  }
}

function setSessionCode(code) {
  currentSessionId = code;
  sessionIdInput.value = code;
  const url = new URL(window.location.href);
  url.searchParams.set("session", code);
  window.history.replaceState({}, "", url);
}

async function joinSession(code) {
  if (!cloudReady) return alert("Set Firebase config first.");
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return;

  if (unsubscribe) unsubscribe();
  const ref = doc(db, "sessions", trimmed);
  const snap = await getDoc(ref);
  if (!snap.exists()) return alert("Session not found");

  setSessionCode(trimmed);
  applyState(snap.data());
  saveLocal({ ...snap.data(), sessionId: trimmed });
  sessionStatus.textContent = `Cloud: joined ${trimmed}`;

  unsubscribe = onSnapshot(ref, (docSnap) => {
    if (!docSnap.exists()) return;
    applyState(docSnap.data());
    saveLocal({ ...docSnap.data(), sessionId: trimmed });
  });
}

function runCalculation() {
  const flour = parseFloat(flourInput.value);
  const temp = parseFloat(tempInput.value);
  const hydration = parseFloat(hydrationInput.value);

  if (!flour || !temp || !hydration || flour <= 0 || temp <= 0 || hydration <= 0) {
    return alert("Enter valid values.");
  }

  if (currentInterval) clearInterval(currentInterval);
  isRunning = false;
  processLocked = false;

  const water = ((flour * hydration) / 100).toFixed(1);
  const yeast = (flour * 0.02).toFixed(2);
  const salt = (flour * 0.02).toFixed(2);

  renderIngredients(water, yeast, salt);
  stages = calculateStageDurations(hydration, temp);
  currentStage = 0;
  stageStartedAt = null;
  stageElapsedBeforePause = 0;
  processStartedAt = null;

  renderTimeline(0);
  stagesDiv.innerHTML = "";
  updateControlState();
  persistState({ water, yeast, salt });
}

function completeRun() {
  isRunning = false;
  currentStage = stages.length;
  stageStartedAt = null;
  stageElapsedBeforePause = 0;
  updateControlState();
  persistState();
  renderTimeline(getTotalDuration());
  renderStage(currentStage, 0);
  alert("Dough ready to bake!");
}

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
        persistState();
      }
    }
  };

  tick();
  currentInterval = setInterval(tick, 1000);
}

calculateBtn.addEventListener("click", runCalculation);

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
    persistState();
    renderStage(currentStage, Math.min(stageElapsedBeforePause, stages[currentStage].duration));
    renderTimeline(getTotalElapsed(Date.now()));
    return;
  }

  if (!currentSessionId) setSessionCode(generateSessionId());
  isRunning = true;
  processLocked = true;
  processStartedAt = processStartedAt || Date.now();
  stageStartedAt = Date.now();
  updateControlState();
  persistState();
  runStage();
  sessionStatus.textContent = `Cloud: session ${currentSessionId}`;
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
  persistState();
});

joinSessionBtn.addEventListener("click", async () => {
  await joinSession(sessionIdInput.value);
});

copySessionBtn.addEventListener("click", async () => {
  if (!currentSessionId) return;
  await navigator.clipboard.writeText(currentSessionId);
  sessionStatus.textContent = `Cloud: copied ${currentSessionId}`;
});

function loadLocal() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!saved) {
    hydrationInput.value = DEFAULT_HYDRATION;
    updateControlState();
    return;
  }

  if (saved.sessionId) setSessionCode(saved.sessionId);
  applyState(saved);
}

function bootFromUrl() {
  const code = new URL(window.location.href).searchParams.get("session");
  if (code) {
    sessionIdInput.value = code.toUpperCase();
  }
}

initFirebase();
bootFromUrl();
loadLocal();

if (cloudReady && sessionIdInput.value) {
  joinSession(sessionIdInput.value);
}
