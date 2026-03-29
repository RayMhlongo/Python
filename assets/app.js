(() => {
  const STORAGE_KEYS = {
    savedCode: "pyte.saved.code.v1",
    savedInput: "pyte.saved.input.v1",
    draftCode: "pyte.draft.code.v1",
    draftInput: "pyte.draft.input.v1",
    roomSession: "pyte.room.session.v1",
    clientToken: "pyte.room.client-token.v1",
    themeMode: "pyte.theme.mode.v1",
    roomServerUrl: "pyte.room.server-url.v1",
    soloPreferences: "pyte.solo.preferences.v1",
    soloProgress: "pyte.solo.progress.v1",
    soloCurrentChallenge: "pyte.solo.current-challenge.v1",
    practiceChallengeContext: "pyte.practice.challenge-context.v1"
  };

  const DEFAULT_CODE = `print("Welcome to Phathu and Ray's Pyte environment")
name = input("What is your name? ")
print(f"Hello, {name}!")

score = int(input("Enter your score: "))
if score >= 50:
    print("You passed.")
else:
    print("You failed.")`;

  const DEFAULT_INPUT = `Ray
72`;

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function safeStorageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (_error) {
      return;
    }
  }

  function getClientToken() {
    const existing = safeStorageGet(STORAGE_KEYS.clientToken);

    if (existing) {
      return existing;
    }

    const token = window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now());
    safeStorageSet(STORAGE_KEYS.clientToken, token);
    return token;
  }

  function loadRoomSession() {
    const raw = safeStorageGet(STORAGE_KEYS.roomSession);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  }

  function saveRoomSession(roomId, identity) {
    const session = { roomId, identity, sessionToken: getClientToken() };
    safeStorageSet(STORAGE_KEYS.roomSession, JSON.stringify(session));
    return session;
  }

  function clearRoomSession() {
    safeStorageRemove(STORAGE_KEYS.roomSession);
  }

  function getDefaultRoomServerUrl() {
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return window.location.origin;
    }

    return "";
  }

  function normalizeRoomServerUrl(value) {
    let nextValue = String(value || "").trim();

    if (!nextValue) {
      return getDefaultRoomServerUrl();
    }

    if (!/^https?:\/\//i.test(nextValue) && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
      nextValue = `${window.location.protocol}//${nextValue}`;
    }

    try {
      return new URL(nextValue).origin.replace(/\/+$/, "");
    } catch (_error) {
      return "";
    }
  }

  function loadRoomServerUrl() {
    const queryValue = getQueryParam("server") || getQueryParam("backend");
    const storedValue = queryValue || safeStorageGet(STORAGE_KEYS.roomServerUrl);
    const normalized = normalizeRoomServerUrl(storedValue);

    if (queryValue && normalized) {
      safeStorageSet(STORAGE_KEYS.roomServerUrl, normalized);
    }

    return normalized || getDefaultRoomServerUrl();
  }

  function saveRoomServerUrl(value) {
    const normalized = normalizeRoomServerUrl(value);

    if (normalized) {
      safeStorageSet(STORAGE_KEYS.roomServerUrl, normalized);
      return normalized;
    }

    safeStorageRemove(STORAGE_KEYS.roomServerUrl);
    return getDefaultRoomServerUrl();
  }

  async function copyText(value) {
    const text = String(value || "");

    if (!text) {
      return false;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_error) {
      return false;
    }

    return false;
  }

  function setStatus(element, message, mode) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.dataset.state = mode;
  }

  function createStatusController(element, getBaseStatus) {
    const state = {
      timer: 0,
      override: null
    };

    function render() {
      const next = state.override || getBaseStatus();
      setStatus(element, next.message, next.mode);
    }

    function flash(message, mode, duration = 2200) {
      window.clearTimeout(state.timer);
      state.override = {
        message,
        mode
      };
      render();

      if (duration > 0) {
        state.timer = window.setTimeout(() => {
          state.override = null;
          render();
        }, duration);
      }
    }

    function clear() {
      window.clearTimeout(state.timer);
      state.override = null;
      render();
    }

    return {
      render,
      flash,
      clear
    };
  }

  function applyTheme(mode) {
    const theme = mode === "angel" ? "angel" : "beloved";
    document.documentElement.dataset.theme = theme;
    safeStorageSet(STORAGE_KEYS.themeMode, theme);
    window.dispatchEvent(
      new CustomEvent("pyte:theme", {
        detail: { theme }
      })
    );

    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.themeChoice === theme);
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
    });
  }

  function initTheme() {
    const storedTheme = safeStorageGet(STORAGE_KEYS.themeMode) || "beloved";
    applyTheme(storedTheme);

    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        applyTheme(button.dataset.themeChoice);
      });
    });
  }

  function initNavigation() {
    const currentPage = document.body.dataset.page || "home";
    document.querySelectorAll("[data-nav-key]").forEach((link) => {
      const active = link.dataset.navKey === currentPage;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-current", active ? "page" : "false");
    });
  }

  function setPanelState(button, panel, isOpen, openLabel, closedLabel) {
    if (panel) {
      panel.hidden = !isOpen;
    }

    if (button) {
      button.textContent = isOpen ? openLabel : closedLabel;
      button.setAttribute("aria-expanded", String(isOpen));
    }
  }

  function whenReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  window.PyteApp = {
    DEFAULT_CODE,
    DEFAULT_INPUT,
    STORAGE_KEYS,
    applyTheme,
    clearRoomSession,
    copyText,
    createStatusController,
    getDefaultRoomServerUrl,
    getClientToken,
    getQueryParam,
    loadRoomSession,
    loadRoomServerUrl,
    normalizeRoomServerUrl,
    safeStorageGet,
    safeStorageRemove,
    safeStorageSet,
    saveRoomSession,
    saveRoomServerUrl,
    setPanelState,
    setStatus
  };

  whenReady(() => {
    initTheme();
    initNavigation();
  });
})();
