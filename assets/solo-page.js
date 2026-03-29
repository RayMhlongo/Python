(function () {
  const shared = window.PyteApp;
  const challengeBank = window.PyteSoloChallengeBank;

  if (!shared || !challengeBank || !document.getElementById("challengeSource")) {
    return;
  }

  const {
    STORAGE_KEYS,
    copyText,
    createStatusController,
    safeStorageGet,
    safeStorageSet
  } = shared;

  const refs = {
    pageStatus: document.getElementById("pageStatus"),
    challengeSource: document.getElementById("challengeSource"),
    challengeLevel: document.getElementById("challengeLevel"),
    newChallengeButton: document.getElementById("newChallengeButton"),
    useStarterButton: document.getElementById("useStarterButton"),
    copyChallengeButton: document.getElementById("copyChallengeButton"),
    markCompleteButton: document.getElementById("markCompleteButton"),
    toggleHintButton: document.getElementById("toggleHintButton"),
    toggleSolutionButton: document.getElementById("toggleSolutionButton"),
    toggleStarterPreviewButton: document.getElementById("toggleStarterPreviewButton"),
    challengeSourcePill: document.getElementById("challengeSourcePill"),
    challengeLevelPill: document.getElementById("challengeLevelPill"),
    challengeCountPill: document.getElementById("challengeCountPill"),
    challengeTitle: document.getElementById("challengeTitle"),
    challengeDescription: document.getElementById("challengeDescription"),
    challengeHint: document.getElementById("challengeHint"),
    challengeSolution: document.getElementById("challengeSolution"),
    challengeStarterPreview: document.getElementById("challengeStarterPreview"),
    challengePersistenceNote: document.getElementById("challengePersistenceNote"),
    soloSeenCount: document.getElementById("soloSeenCount"),
    soloCompletedCount: document.getElementById("soloCompletedCount"),
    soloPoolCount: document.getElementById("soloPoolCount"),
    soloActionNote: document.getElementById("soloActionNote")
  };

  const state = {
    currentChallenge: null,
    progress: loadStoredJson(STORAGE_KEYS.soloProgress, {
      seenIds: [],
      completedIds: []
    })
  };

  const status = createStatusController(refs.pageStatus, () => ({
    message: "Ready",
    mode: "ready"
  }));

  function loadStoredJson(key, fallback) {
    const raw = safeStorageGet(key);

    if (!raw) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function saveStoredJson(key, value) {
    safeStorageSet(key, JSON.stringify(value));
  }

  function formatLevelLabel(sourceKey, level) {
    if (sourceKey === "days100" && level === "God Level") {
      return "God Level | Phathu's Intelligence";
    }

    return level;
  }

  function makeChallengeId(sourceKey, level, title) {
    return `${sourceKey}::${level}::${String(title || "").trim().toLowerCase()}`;
  }

  function toggleDetail(button, panel, showLabel, hideLabel) {
    const nextHidden = !panel.hidden;
    panel.hidden = nextHidden;
    button.textContent = nextHidden ? showLabel : hideLabel;
    button.setAttribute("aria-expanded", String(!nextHidden));
  }

  function findChallengeById(sourceKey, level, challengeId) {
    const group = challengeBank[sourceKey];
    const pool = group?.levels?.[level] || [];

    return pool.find((entry) => makeChallengeId(sourceKey, level, entry.title) === challengeId) || null;
  }

  function rememberPreferences() {
    saveStoredJson(STORAGE_KEYS.soloPreferences, {
      sourceKey: refs.challengeSource.value,
      level: refs.challengeLevel.value
    });
  }

  function hydrateChallenge(sourceKey, level, challenge) {
    const group = challengeBank[sourceKey];
    const pool = group?.levels?.[level] || [];

    if (!challenge || !group || !pool.length) {
      return null;
    }

    return {
      ...challenge,
      challengeId: makeChallengeId(sourceKey, level, challenge.title),
      sourceKey,
      sourceLabel: group.label,
      level,
      count: pool.length
    };
  }

  function saveCurrentChallenge() {
    if (!state.currentChallenge) {
      return;
    }

    saveStoredJson(STORAGE_KEYS.soloCurrentChallenge, {
      sourceKey: state.currentChallenge.sourceKey,
      level: state.currentChallenge.level,
      challengeId: state.currentChallenge.challengeId
    });
  }

  function ensureProgressArrays() {
    if (!Array.isArray(state.progress.seenIds)) {
      state.progress.seenIds = [];
    }

    if (!Array.isArray(state.progress.completedIds)) {
      state.progress.completedIds = [];
    }
  }

  function recordSeen(challengeId) {
    ensureProgressArrays();

    if (!state.progress.seenIds.includes(challengeId)) {
      state.progress.seenIds.push(challengeId);
      saveStoredJson(STORAGE_KEYS.soloProgress, state.progress);
    }
  }

  function markComplete(options = {}) {
    if (!state.currentChallenge) {
      status.flash("Pick a challenge first.", "warning");
      return;
    }

    ensureProgressArrays();

    if (!state.progress.completedIds.includes(state.currentChallenge.challengeId)) {
      state.progress.completedIds.push(state.currentChallenge.challengeId);
      saveStoredJson(STORAGE_KEYS.soloProgress, state.progress);
    }

    updateProgressSummary();
    updateActionNote(`Marked "${state.currentChallenge.title}" as complete.`);

    if (!options.silent) {
      status.flash("Challenge marked complete.", "ready");
    }
  }

  function isCurrentChallengeComplete() {
    return Boolean(
      state.currentChallenge &&
        Array.isArray(state.progress.completedIds) &&
        state.progress.completedIds.includes(state.currentChallenge.challengeId)
    );
  }

  function updateActionNote(message) {
    refs.soloActionNote.textContent = message;
  }

  function updateProgressSummary() {
    ensureProgressArrays();
    refs.soloSeenCount.textContent = String(state.progress.seenIds.length);
    refs.soloCompletedCount.textContent = String(state.progress.completedIds.length);
    refs.soloPoolCount.textContent = state.currentChallenge ? String(state.currentChallenge.count) : "0";
    refs.markCompleteButton.textContent = isCurrentChallengeComplete() ? "Completed" : "Mark Complete";
    refs.markCompleteButton.disabled = !state.currentChallenge;
  }

  function renderChallenge() {
    if (!state.currentChallenge) {
      refs.challengeTitle.textContent = "No challenge available";
      refs.challengeDescription.textContent = "Try another source or difficulty level.";
      refs.challengeHint.hidden = true;
      refs.challengeSolution.hidden = true;
      refs.challengeStarterPreview.hidden = true;
      refs.useStarterButton.disabled = true;
      refs.copyChallengeButton.disabled = true;
      refs.toggleHintButton.disabled = true;
      refs.toggleSolutionButton.disabled = true;
      refs.toggleStarterPreviewButton.disabled = true;
      refs.challengePersistenceNote.textContent = "Choose a source and difficulty to load a prompt.";
      updateProgressSummary();
      return;
    }

    refs.challengeSourcePill.textContent = state.currentChallenge.sourceLabel;
    refs.challengeLevelPill.textContent = formatLevelLabel(state.currentChallenge.sourceKey, state.currentChallenge.level);
    refs.challengeCountPill.textContent = `${state.currentChallenge.count} in this pool`;
    refs.challengeTitle.textContent = state.currentChallenge.title;
    refs.challengeDescription.textContent = state.currentChallenge.description;
    refs.challengeHint.textContent = `Hint: ${state.currentChallenge.hint}`;
    refs.challengeSolution.textContent = `Solution idea: ${state.currentChallenge.solutionIdea}`;
    refs.challengeStarterPreview.textContent = `${state.currentChallenge.starterCode.trimEnd()}\n`;
    refs.challengeHint.hidden = true;
    refs.challengeSolution.hidden = true;
    refs.challengeStarterPreview.hidden = true;
    refs.toggleHintButton.textContent = "Reveal Hint";
    refs.toggleHintButton.setAttribute("aria-expanded", "false");
    refs.toggleSolutionButton.textContent = "Reveal Solution Idea";
    refs.toggleSolutionButton.setAttribute("aria-expanded", "false");
    refs.toggleStarterPreviewButton.textContent = "Preview Starter Code";
    refs.toggleStarterPreviewButton.setAttribute("aria-expanded", "false");
    refs.useStarterButton.disabled = false;
    refs.copyChallengeButton.disabled = false;
    refs.toggleHintButton.disabled = false;
    refs.toggleSolutionButton.disabled = false;
    refs.toggleStarterPreviewButton.disabled = false;
    refs.challengePersistenceNote.textContent = "Your current prompt, filters, and completion progress stay on this device.";
    updateActionNote(`Working on "${state.currentChallenge.title}".`);
    updateProgressSummary();
  }

  function chooseChallenge(options = {}) {
    const sourceKey = refs.challengeSource.value;
    const level = refs.challengeLevel.value;
    const group = challengeBank[sourceKey];
    const pool = group?.levels?.[level] || [];

    rememberPreferences();

    if (!pool.length) {
      state.currentChallenge = null;
      renderChallenge();
      status.flash("This challenge pool is empty.", "warning");
      return;
    }

    let selected = null;

    if (options.challengeId) {
      selected = findChallengeById(sourceKey, level, options.challengeId);
    }

    if (!selected) {
      const currentId = state.currentChallenge?.challengeId;
      const availablePool = pool.filter((entry) => makeChallengeId(sourceKey, level, entry.title) !== currentId);
      const selectionPool = availablePool.length ? availablePool : pool;
      selected = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    }

    state.currentChallenge = hydrateChallenge(sourceKey, level, selected);
    recordSeen(state.currentChallenge.challengeId);
    saveCurrentChallenge();
    renderChallenge();

    if (!options.silent) {
      status.flash("Fresh challenge ready.", "ready");
    }
  }

  async function copyChallengePrompt() {
    if (!state.currentChallenge) {
      status.flash("Pick a challenge first.", "warning");
      return;
    }

    const challengeText = [
      state.currentChallenge.title,
      state.currentChallenge.description,
      "",
      "Starter code:",
      state.currentChallenge.starterCode.trimEnd()
    ].join("\n");
    const copied = await copyText(challengeText);
    status.flash(copied ? "Challenge copied." : "Could not copy the challenge.", copied ? "ready" : "warning");
  }

  function moveStarterToPractice() {
    if (!state.currentChallenge) {
      status.flash("Pick a challenge first.", "warning");
      return;
    }

    const starterCode = `${state.currentChallenge.starterCode.trimEnd()}\n`;
    safeStorageSet(STORAGE_KEYS.draftCode, starterCode);
    safeStorageSet(STORAGE_KEYS.draftInput, "");
    safeStorageSet(
      STORAGE_KEYS.practiceChallengeContext,
      JSON.stringify({
        title: state.currentChallenge.title,
        description: state.currentChallenge.description,
        sourceLabel: state.currentChallenge.sourceLabel,
        levelLabel: formatLevelLabel(state.currentChallenge.sourceKey, state.currentChallenge.level)
      })
    );
    status.flash("Starter moved into the practice page.", "ready");
    window.setTimeout(() => {
      window.location.href = "./practice.html?starter=1";
    }, 180);
  }

  function restoreInitialState() {
    const savedPreferences = loadStoredJson(STORAGE_KEYS.soloPreferences, {
      sourceKey: "pyteRace",
      level: "Amateur"
    });

    if (savedPreferences.sourceKey && challengeBank[savedPreferences.sourceKey]) {
      refs.challengeSource.value = savedPreferences.sourceKey;
    }

    const allowedLevels = challengeBank[refs.challengeSource.value]?.levels || {};
    if (savedPreferences.level && allowedLevels[savedPreferences.level]) {
      refs.challengeLevel.value = savedPreferences.level;
    }

    const savedChallenge = loadStoredJson(STORAGE_KEYS.soloCurrentChallenge, null);

    if (
      savedChallenge &&
      savedChallenge.sourceKey === refs.challengeSource.value &&
      savedChallenge.level === refs.challengeLevel.value &&
      findChallengeById(savedChallenge.sourceKey, savedChallenge.level, savedChallenge.challengeId)
    ) {
      chooseChallenge({
        silent: true,
        challengeId: savedChallenge.challengeId
      });
      return;
    }

    chooseChallenge({ silent: true });
  }

  refs.challengeSource.addEventListener("change", () => chooseChallenge());
  refs.challengeLevel.addEventListener("change", () => chooseChallenge());
  refs.newChallengeButton.addEventListener("click", () => chooseChallenge());
  refs.useStarterButton.addEventListener("click", moveStarterToPractice);
  refs.copyChallengeButton.addEventListener("click", copyChallengePrompt);
  refs.markCompleteButton.addEventListener("click", () => markComplete());
  refs.toggleHintButton.addEventListener("click", () => {
    toggleDetail(refs.toggleHintButton, refs.challengeHint, "Reveal Hint", "Hide Hint");
  });
  refs.toggleSolutionButton.addEventListener("click", () => {
    toggleDetail(refs.toggleSolutionButton, refs.challengeSolution, "Reveal Solution Idea", "Hide Solution Idea");
  });
  refs.toggleStarterPreviewButton.addEventListener("click", () => {
    toggleDetail(refs.toggleStarterPreviewButton, refs.challengeStarterPreview, "Preview Starter Code", "Hide Starter Code");
  });

  restoreInitialState();
  status.render();
})();
