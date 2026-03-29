(() => {
  const STORAGE_KEYS = {
    savedCode: "pyte.saved.code.v1",
    savedInput: "pyte.saved.input.v1",
    draftCode: "pyte.draft.code.v1",
    draftInput: "pyte.draft.input.v1",
    roomSession: "pyte.room.session.v1",
    clientToken: "pyte.room.client-token.v1",
    themeMode: "pyte.theme.mode.v1"
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
    createStatusController,
    getClientToken,
    getQueryParam,
    loadRoomSession,
    safeStorageGet,
    safeStorageRemove,
    safeStorageSet,
    saveRoomSession,
    setPanelState,
    setStatus
  };

  whenReady(() => {
    initTheme();
    initNavigation();
  });
})();
