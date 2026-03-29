(function () {
  const shared = window.PyteApp;
  const challengeBank = window.PyteSoloChallengeBank;

  if (!shared || !challengeBank || !document.getElementById("challengeSource")) {
    return;
  }

  const {
    STORAGE_KEYS,
    createStatusController,
    safeStorageSet
  } = shared;

  const refs = {
    pageStatus: document.getElementById("pageStatus"),
    challengeSource: document.getElementById("challengeSource"),
    challengeLevel: document.getElementById("challengeLevel"),
    newChallengeButton: document.getElementById("newChallengeButton"),
    useStarterButton: document.getElementById("useStarterButton"),
    toggleHintButton: document.getElementById("toggleHintButton"),
    toggleSolutionButton: document.getElementById("toggleSolutionButton"),
    challengeSourcePill: document.getElementById("challengeSourcePill"),
    challengeLevelPill: document.getElementById("challengeLevelPill"),
    challengeCountPill: document.getElementById("challengeCountPill"),
    challengeTitle: document.getElementById("challengeTitle"),
    challengeDescription: document.getElementById("challengeDescription"),
    challengeHint: document.getElementById("challengeHint"),
    challengeSolution: document.getElementById("challengeSolution")
  };

  const state = {
    currentChallenge: null
  };

  const status = createStatusController(refs.pageStatus, () => ({
    message: "Ready",
    mode: "ready"
  }));

  function formatLevelLabel(sourceKey, level) {
    if (sourceKey === "days100" && level === "God Level") {
      return "God Level | Phathu's Intelligence";
    }

    return level;
  }

  function toggleDetail(button, panel, showLabel, hideLabel) {
    const nextHidden = !panel.hidden;
    panel.hidden = nextHidden;
    button.textContent = nextHidden ? showLabel : hideLabel;
    button.setAttribute("aria-expanded", String(!nextHidden));
  }

  function pickChallenge(options = {}) {
    const sourceKey = refs.challengeSource.value;
    const level = refs.challengeLevel.value;
    const group = challengeBank[sourceKey];
    const pool = group?.levels?.[level] || [];

    if (!pool.length) {
      refs.challengeTitle.textContent = "No challenge available";
      refs.challengeDescription.textContent = "Try another source or difficulty level.";
      refs.challengeHint.hidden = true;
      refs.challengeSolution.hidden = true;
      refs.useStarterButton.disabled = true;
      status.flash("This challenge pool is empty.", "warning");
      return;
    }

    const selected = pool[Math.floor(Math.random() * pool.length)];
    state.currentChallenge = {
      ...selected,
      sourceKey,
      sourceLabel: group.label,
      level,
      count: pool.length
    };

    refs.challengeSourcePill.textContent = state.currentChallenge.sourceLabel;
    refs.challengeLevelPill.textContent = formatLevelLabel(sourceKey, level);
    refs.challengeCountPill.textContent = `${state.currentChallenge.count} in this pool`;
    refs.challengeTitle.textContent = state.currentChallenge.title;
    refs.challengeDescription.textContent = state.currentChallenge.description;
    refs.challengeHint.textContent = `Hint: ${state.currentChallenge.hint}`;
    refs.challengeSolution.textContent = `Solution idea: ${state.currentChallenge.solutionIdea}`;
    refs.challengeHint.hidden = true;
    refs.challengeSolution.hidden = true;
    refs.toggleHintButton.textContent = "Reveal Hint";
    refs.toggleHintButton.setAttribute("aria-expanded", "false");
    refs.toggleSolutionButton.textContent = "Reveal Solution Idea";
    refs.toggleSolutionButton.setAttribute("aria-expanded", "false");
    refs.useStarterButton.disabled = false;

    if (!options.silent) {
      status.flash("Fresh challenge ready.", "ready");
    }
  }

  function moveStarterToPractice() {
    if (!state.currentChallenge) {
      status.flash("Pick a challenge first.", "warning");
      return;
    }

    const starterCode = `${state.currentChallenge.starterCode.trimEnd()}\n`;
    safeStorageSet(STORAGE_KEYS.draftCode, starterCode);
    safeStorageSet(STORAGE_KEYS.draftInput, "");
    status.flash("Starter moved into the practice page.", "ready");
    window.setTimeout(() => {
      window.location.href = "./practice.html?starter=1";
    }, 180);
  }

  refs.challengeSource.addEventListener("change", () => pickChallenge());
  refs.challengeLevel.addEventListener("change", () => pickChallenge());
  refs.newChallengeButton.addEventListener("click", () => pickChallenge());
  refs.useStarterButton.addEventListener("click", moveStarterToPractice);
  refs.toggleHintButton.addEventListener("click", () => {
    toggleDetail(refs.toggleHintButton, refs.challengeHint, "Reveal Hint", "Hide Hint");
  });
  refs.toggleSolutionButton.addEventListener("click", () => {
    toggleDetail(refs.toggleSolutionButton, refs.challengeSolution, "Reveal Solution Idea", "Hide Solution Idea");
  });

  pickChallenge({ silent: true });
  status.render();
})();
