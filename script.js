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
const SUPABASE_URL = "https://tpmugvtxgkagdozrkcfy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Tj0fgw02gBrxnns4FloHzg_4c1yNUKx";
const SUPABASE_TABLE = "dough_sessions";

let stages = [];
let currentStage = 0;
let currentInterval = null;
let stageStartedAt = null;
let stageElapsedBeforePause = 0;
let processStartedAt = null;
let isRunning = false;
let processLocked = false;

let cloudReady = false;
let currentSessionId = null;
let pollInterval = null;
let isApplyingRemote = false;
let lastCloudSyncAt = 0;
let controlIssuedAt = 0;

function hasSupabaseConfig() {
  return (
    SUPABASE_URL !== "REPLACE_SUPABASE_URL" &&
    SUPABASE_ANON_KEY !== "REPLACE_SUPABASE_ANON_KEY"
  );
}

function supabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function supabaseUpsert(payload) {
  if (!cloudReady || !currentSessionId) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?on_conflict=session_id`,
    {
    method: "POST",
      headers: {
        ...supabaseHeaders(),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([{ session_id: currentSessionId, state: payload }]),
    },
  );
  if (!res.ok) {
    const details = await res.text();
    throw new Error(`cloud save failed (${res.status}) ${details}`);
  }
  return res.json();
}

async function supabaseRead(sessionId) {
  if (!cloudReady) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?session_id=eq.${encodeURIComponent(sessionId)}&select=state`,
    { headers: supabaseHeaders() },
  );
  if (!res.ok) {
    const details = await res.text();
    throw new Error(`cloud read failed (${res.status}) ${details}`);
  }
  const rows = await res.json();
  return rows.length ? rows[0].state : null;
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
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = String(Math.floor(safe / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function getTotalDuration() {
  return stages.reduce((sum, stage) => sum + stage.duration, 0);
}

function getTotalElapsed(now) {
  if (!stages.length || currentStage >= stages.length)
    return getTotalDuration();

  const doneSeconds = stages
    .slice(0, currentStage)
    .reduce((sum, stage) => sum + stage.duration, 0);
  const liveElapsed = stageStartedAt
    ? Math.floor((now - stageStartedAt) / 1000)
    : 0;
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

function generateSessionId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getCurrentState() {
  return {
    flour: parseFloat(flourInput.value) || null,
    temp: parseFloat(tempInput.value) || null,
    hydration: parseFloat(hydrationInput.value) || DEFAULT_HYDRATION,
    water: (
      (parseFloat(flourInput.value) || 0) *
      ((parseFloat(hydrationInput.value) || DEFAULT_HYDRATION) / 100)
    ).toFixed(1),
    yeast: ((parseFloat(flourInput.value) || 0) * 0.02).toFixed(2),
    salt: ((parseFloat(flourInput.value) || 0) * 0.02).toFixed(2),
    stages,
    currentStage,
    isRunning,
    processLocked,
    stageStartedAt,
    stageElapsedBeforePause,
    processStartedAt,
    commandAt: controlIssuedAt,
    updatedAtMs: Date.now(),
  };
}

function applyState(state) {
  if (!state) return;

  flourInput.value = state.flour ?? "";
  tempInput.value = state.temp ?? "";
  hydrationInput.value = state.hydration ?? DEFAULT_HYDRATION;

  stages = state.stages || [];
  currentStage =
    typeof state.currentStage === "number" ? state.currentStage : 0;
  isRunning = Boolean(state.isRunning);
  processLocked = Boolean(state.processLocked);
  stageStartedAt = state.stageStartedAt || null;
  stageElapsedBeforePause = state.stageElapsedBeforePause || 0;
  processStartedAt = state.processStartedAt || null;
  controlIssuedAt = state.commandAt || 0;

  if (state.water && state.yeast && state.salt) {
    renderIngredients(state.water, state.yeast, state.salt);
  }

  if (stages.length) {
    if (isRunning) {
      runStage();
    } else {
      renderStage(
        currentStage,
        Math.min(stageElapsedBeforePause, stages[currentStage]?.duration || 0),
      );
      renderTimeline(getTotalElapsed(Date.now()));
      if (currentInterval) clearInterval(currentInterval);
    }
  } else {
    stagesDiv.innerHTML = "";
    timelineDiv.innerHTML = "";
    if (currentInterval) clearInterval(currentInterval);
  }

  updateControlState();
}

function saveProgress(data) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const updated = { ...existing, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

async function syncCloud(force = false) {
  if (!cloudReady || !currentSessionId || isApplyingRemote) return;
  const now = Date.now();
  if (!force && now - lastCloudSyncAt < 1000) return;
  try {
    const remote = await supabaseRead(currentSessionId);
    const remoteCommandAt = remote?.commandAt || 0;
    if (remote && remoteCommandAt > controlIssuedAt) {
      isApplyingRemote = true;
      applyState(remote);
      saveProgress({ ...remote, sessionId: currentSessionId });
      isApplyingRemote = false;
      return;
    }
    await supabaseUpsert(getCurrentState());
    lastCloudSyncAt = now;
    sessionStatus.textContent = `Cloud: session ${currentSessionId}`;
  } catch (error) {
    sessionStatus.textContent = `Cloud: ${error.message}`;
  }
}

function persistAll(extra = {}, forceSync = false) {
  const payload = {
    ...getCurrentState(),
    ...extra,
    sessionId: currentSessionId,
  };
  saveProgress(payload);
  void syncCloud(forceSync);
}

function setSessionCode(code) {
  currentSessionId = code;
  sessionIdInput.value = code;
  resetPoll();
}

function leaveSession() {
  currentSessionId = null;
  sessionIdInput.value = "";
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = null;
  sessionStatus.textContent = cloudReady ? "Cloud: ready" : "Cloud: set Supabase config";
}

function resetPoll() {
  if (pollInterval) clearInterval(pollInterval);
  if (!cloudReady || !currentSessionId) return;
  pollInterval = setInterval(async () => {
    try {
      const remote = await supabaseRead(currentSessionId);
      if (!remote) return;
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      const remoteUpdated = remote.updatedAtMs || 0;
      const localUpdated = local.updatedAtMs || 0;
      const remoteCommandAt = remote.commandAt || 0;
      const localCommandAt = local.commandAt || 0;
      const hasNewerCommand = remoteCommandAt > localCommandAt;
      const hasNewerStateAtSameCommand =
        remoteCommandAt === localCommandAt && remoteUpdated > localUpdated;
      if (!hasNewerCommand && !hasNewerStateAtSameCommand) return;
      isApplyingRemote = true;
      applyState(remote);
      saveProgress({ ...remote, sessionId: currentSessionId });
      isApplyingRemote = false;
    } catch {
      sessionStatus.textContent = "Cloud: poll failed";
    }
  }, 2000);
}

async function joinSession() {
  const raw = sessionIdInput.value.trim().toUpperCase();
  if (!raw) return;
  if (!cloudReady) return alert("Set Supabase config in script.js first.");

  try {
    const remote = await supabaseRead(raw);
    if (!remote) return alert("Session not found");
    setSessionCode(raw);
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const remoteUpdated = remote.updatedAtMs || 0;
    const localUpdated = local.updatedAtMs || 0;
    const remoteCommandAt = remote.commandAt || 0;
    const localCommandAt = local.commandAt || 0;

    if (
      local.sessionId === raw &&
      (localCommandAt > remoteCommandAt ||
        (localCommandAt === remoteCommandAt && localUpdated > remoteUpdated))
    ) {
      applyState(local);
      void syncCloud(true);
    } else {
      isApplyingRemote = true;
      applyState(remote);
      saveProgress({ ...remote, sessionId: raw });
      isApplyingRemote = false;
    }
    sessionStatus.textContent = `Cloud: joined ${raw}`;
    resetPoll();
  } catch (error) {
    sessionStatus.textContent = `Cloud: ${error.message}`;
  }
}

function clearAllState() {
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
}

function setDefaultInputs() {
  flourInput.value = "180";
  tempInput.value = "20";
  hydrationInput.value = String(DEFAULT_HYDRATION);
}

function completeRun() {
  isRunning = false;
  currentStage = stages.length;
  stageStartedAt = null;
  stageElapsedBeforePause = 0;
  controlIssuedAt = Date.now();
  updateControlState();
  persistAll({}, true);
  renderTimeline(getTotalDuration());
  renderStage(currentStage, 0);
  alert("Dough ready to bake!");
}

function runCalculation() {
  const flour = parseFloat(flourInput.value);
  const temp = parseFloat(tempInput.value);
  const hydration = parseFloat(hydrationInput.value);

  if (
    !flour ||
    !temp ||
    !hydration ||
    flour <= 0 ||
    temp <= 0 ||
    hydration <= 0
  ) {
    return alert("Enter valid values.");
  }

  if (currentInterval) clearInterval(currentInterval);
  isRunning = false;
  controlIssuedAt = Date.now();

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
  persistAll({ water, yeast, salt }, true);
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
    const stageElapsedLive = stageStartedAt
      ? Math.floor((now - stageStartedAt) / 1000)
      : 0;
    const stageElapsed = Math.max(
      0,
      stageElapsedBeforePause + stageElapsedLive,
    );

    renderStage(currentStage, Math.min(stageElapsed, stage.duration));
    renderTimeline(getTotalElapsed(now));
    if (cloudReady && currentSessionId) void syncCloud();

    if (stageElapsed >= stage.duration) {
      alertSound.play().catch(() => {});
      alert(`${stage.name} complete`);
      currentStage += 1;
      stageStartedAt = now;
      stageElapsedBeforePause = 0;
      if (currentStage >= stages.length) {
        completeRun();
      } else {
        persistAll({}, true);
      }
    }
  };

  tick();
  currentInterval = setInterval(tick, 1000);
}

calculateBtn.addEventListener("click", () => {
  runCalculation();
});

hydrationInput.addEventListener("input", () => {
  const flour = parseFloat(flourInput.value);
  const temp = parseFloat(tempInput.value);
  const hydration = parseFloat(hydrationInput.value);
  if (
    !flour ||
    !temp ||
    !hydration ||
    flour <= 0 ||
    temp <= 0 ||
    hydration <= 0
  )
    return;
  runCalculation();
});

startBtn.addEventListener("click", () => {
  if (!stages.length || currentStage >= stages.length) return;

  if (isRunning) {
    const now = Date.now();
    const elapsedThisRun = stageStartedAt
      ? Math.floor((now - stageStartedAt) / 1000)
      : 0;
    stageElapsedBeforePause += Math.max(0, elapsedThisRun);
    isRunning = false;
    stageStartedAt = null;
    controlIssuedAt = Date.now();
    if (currentInterval) clearInterval(currentInterval);
    updateControlState();
    persistAll({}, true);
    renderStage(
      currentStage,
      Math.min(stageElapsedBeforePause, stages[currentStage].duration),
    );
    renderTimeline(getTotalElapsed(Date.now()));
    return;
  }

  if (!currentSessionId && cloudReady) {
    setSessionCode(generateSessionId());
  }

  isRunning = true;
  processLocked = true;
  controlIssuedAt = Date.now();
  updateControlState();
  processStartedAt = processStartedAt || Date.now();
  stageStartedAt = Date.now();
  persistAll({}, true);
  runStage();
});

resetBtn.addEventListener("click", async () => {
  if (isRunning || !processLocked) return;
  if (currentInterval) clearInterval(currentInterval);
  const sessionToReset = currentSessionId;
  clearAllState();
  controlIssuedAt = Date.now();
  updateControlState();
  setDefaultInputs();
  localStorage.removeItem(STORAGE_KEY);

  if (cloudReady && sessionToReset) {
    currentSessionId = sessionToReset;
    await syncCloud(true);
  }

  leaveSession();
});

joinSessionBtn.addEventListener("click", () => {
  void joinSession();
});

copySessionBtn.addEventListener("click", async () => {
  if (!currentSessionId) return;
  await navigator.clipboard.writeText(currentSessionId);
  sessionStatus.textContent = `Cloud: copied ${currentSessionId}`;
});

function loadProgress() {
  localStorage.removeItem(STORAGE_KEY);
  clearAllState();
  setDefaultInputs();
  updateControlState();
  leaveSession();
}

function initCloud() {
  if (!hasSupabaseConfig()) {
    sessionStatus.textContent = "Cloud: set Supabase config";
    return;
  }
  cloudReady = true;
  sessionStatus.textContent = "Cloud: ready";
}

initCloud();
loadProgress();
