(function () {
  const shared = window.PyteApp;

  if (!shared || !document.getElementById("codeEditor")) {
    return;
  }

  const {
    DEFAULT_CODE,
    DEFAULT_INPUT,
    STORAGE_KEYS,
    createStatusController,
    getQueryParam,
    safeStorageGet,
    safeStorageSet
  } = shared;

  const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";

  const refs = {
    pageStatus: document.getElementById("pageStatus"),
    codeEditor: document.getElementById("codeEditor"),
    programInput: document.getElementById("programInput"),
    outputConsole: document.getElementById("outputConsole"),
    runButton: document.getElementById("runButton"),
    stopButton: document.getElementById("stopButton"),
    clearOutputButton: document.getElementById("clearOutputButton"),
    resetCodeButton: document.getElementById("resetCodeButton"),
    saveCodeButton: document.getElementById("saveCodeButton"),
    loadCodeButton: document.getElementById("loadCodeButton")
  };

  const state = {
    editor: null,
    worker: null,
    workerUrl: "",
    runtimeReady: false,
    isRunning: false
  };

  function currentEditorTheme() {
    return document.documentElement.dataset.theme === "angel" ? "default" : "material-darker";
  }

  const status = createStatusController(refs.pageStatus, () => {
    if (!state.runtimeReady) {
      return { message: "Connecting...", mode: "loading" };
    }

    if (state.isRunning) {
      return { message: "Running...", mode: "running" };
    }

    return { message: "Ready", mode: "ready" };
  });

  function appendOutput(text) {
    if (!text) {
      return;
    }

    refs.outputConsole.textContent += text;
    refs.outputConsole.scrollTop = refs.outputConsole.scrollHeight;
  }

  function appendRuntimeError(message) {
    if (!message) {
      return;
    }

    if (refs.outputConsole.textContent && !refs.outputConsole.textContent.endsWith("\n")) {
      refs.outputConsole.textContent += "\n";
    }

    refs.outputConsole.textContent += message.trimEnd() + "\n";
    refs.outputConsole.scrollTop = refs.outputConsole.scrollHeight;
  }

  function clearOutput() {
    refs.outputConsole.textContent = "";
  }

  function refreshEditorSoon() {
    if (state.editor && typeof state.editor.refresh === "function") {
      window.requestAnimationFrame(() => state.editor.refresh());
    }
  }

  function getEditorValue() {
    return state.editor.getValue();
  }

  function setEditorValue(value) {
    state.editor.setValue(value);
    refreshEditorSoon();
  }

  function updateLoadButtonState() {
    refs.loadCodeButton.disabled = safeStorageGet(STORAGE_KEYS.savedCode) === null;
  }

  function storeDraft() {
    safeStorageSet(STORAGE_KEYS.draftCode, getEditorValue());
    safeStorageSet(STORAGE_KEYS.draftInput, refs.programInput.value);
  }

  function restoreDraft() {
    const draftCode = safeStorageGet(STORAGE_KEYS.draftCode);
    const draftInput = safeStorageGet(STORAGE_KEYS.draftInput);

    if (draftCode !== null && draftCode.trim()) {
      setEditorValue(draftCode);
    } else {
      setEditorValue(DEFAULT_CODE);
    }

    refs.programInput.value = draftInput !== null ? draftInput : DEFAULT_INPUT;
  }

  function saveLocally() {
    const codeSaved = safeStorageSet(STORAGE_KEYS.savedCode, getEditorValue());
    const inputSaved = safeStorageSet(STORAGE_KEYS.savedInput, refs.programInput.value);

    status.flash(codeSaved && inputSaved ? "Saved on this device." : "Could not save right now.", codeSaved && inputSaved ? "ready" : "warning");
    updateLoadButtonState();
  }

  function loadSaved() {
    const savedCode = safeStorageGet(STORAGE_KEYS.savedCode);
    const savedInput = safeStorageGet(STORAGE_KEYS.savedInput);

    if (savedCode === null) {
      status.flash("No saved code found yet.", "warning");
      return;
    }

    setEditorValue(savedCode);
    refs.programInput.value = savedInput || "";
    storeDraft();
    status.flash("Saved code loaded.", "ready");
  }

  function resetExample() {
    setEditorValue(DEFAULT_CODE);
    refs.programInput.value = DEFAULT_INPUT;
    storeDraft();
    status.flash("Example restored.", "ready");
  }

  function initializeEditor() {
    refs.codeEditor.value = DEFAULT_CODE;
    refs.codeEditor.spellcheck = false;
    refs.codeEditor.setAttribute("autocorrect", "off");
    refs.codeEditor.setAttribute("autocapitalize", "off");

    if (window.CodeMirror) {
      state.editor = window.CodeMirror.fromTextArea(refs.codeEditor, {
        mode: "python",
        theme: currentEditorTheme(),
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        viewportMargin: Infinity,
        autofocus: false
      });
      state.editor.on("change", storeDraft);
    } else {
      refs.codeEditor.classList.add("plain-editor");
      refs.codeEditor.addEventListener("input", storeDraft);
      state.editor = {
        getValue() {
          return refs.codeEditor.value;
        },
        setValue(value) {
          refs.codeEditor.value = value;
        },
        focus() {
          refs.codeEditor.focus();
        },
        refresh() {}
      };
      status.flash("Editor ready.", "warning");
    }

    restoreDraft();
    updateLoadButtonState();
    refreshEditorSoon();
    window.addEventListener("resize", refreshEditorSoon);
    window.visualViewport?.addEventListener("resize", refreshEditorSoon);
  }

  function syncButtons() {
    refs.runButton.disabled = state.isRunning;
    refs.stopButton.disabled = !state.isRunning;
    updateLoadButtonState();
  }

  function terminateWorker() {
    if (state.worker) {
      state.worker.terminate();
      state.worker = null;
    }

    if (state.workerUrl) {
      URL.revokeObjectURL(state.workerUrl);
      state.workerUrl = "";
    }
  }

  function handleWorkerMessage(event) {
    const data = event.data || {};

    if (data.type === "status") {
      status.render();
      return;
    }

    if (data.type === "ready") {
      state.runtimeReady = true;
      status.render();
      syncButtons();
      return;
    }

    if (data.type === "run-start") {
      state.isRunning = true;
      clearOutput();
      status.render();
      syncButtons();
      return;
    }

    if (data.type === "stdout" || data.type === "stderr") {
      appendOutput(data.text || "");
      return;
    }

    if (data.type === "run-complete") {
      state.isRunning = false;
      status.render();
      syncButtons();
      return;
    }

    if (data.type === "run-error") {
      state.isRunning = false;
      appendRuntimeError(data.message || "An unknown runtime error occurred.");
      status.flash("Check your code and try again.", "error", 2800);
      syncButtons();
      return;
    }

    if (data.type === "runtime-error") {
      state.runtimeReady = false;
      state.isRunning = false;
      appendRuntimeError("Runner issue: " + (data.message || "Could not load the Python tools."));
      status.flash("Something needs attention.", "error", 3200);
      syncButtons();
    }
  }

  function createWorker() {
    if (state.worker) {
      return;
    }

    const workerSource = `
      const PYODIDE_BASE = ${JSON.stringify(PYODIDE_BASE)};
      let pyodidePromise = null;
      let readySent = false;

      function send(type, payload = {}) {
        self.postMessage({ type, ...payload });
      }

      function cleanMessage(error) {
        const message = error && error.message ? error.message : String(error);
        return message.replace(/^PythonError:\\s*/, "").trim();
      }

      async function getPyodide() {
        if (!pyodidePromise) {
          pyodidePromise = (async () => {
            send("status", { message: "Loading..." });
            importScripts(PYODIDE_BASE + "pyodide.js");
            return loadPyodide({ indexURL: PYODIDE_BASE });
          })().catch((error) => {
            pyodidePromise = null;
            throw error;
          });
        }

        const pyodide = await pyodidePromise;
        if (!readySent) {
          readySent = true;
          send("ready", { message: "Ready" });
        }
        return pyodide;
      }

      self.onmessage = async (event) => {
        const data = event.data || {};

        if (data.type === "init") {
          try {
            await getPyodide();
          } catch (error) {
            send("runtime-error", { message: cleanMessage(error) });
          }
          return;
        }

        if (data.type === "run") {
          let pyodide;
          let stdoutDecoder;
          let stderrDecoder;

          try {
            pyodide = await getPyodide();
            const inputLines = Array.isArray(data.inputLines) ? [...data.inputLines] : [];
            const readInput = (promptText = "") => {
              if (!inputLines.length) {
                const detail = promptText ? 'input() needs a value for "' + promptText + '"' : "input() needs another value";
                throw new Error(detail + ". Add one line per input() call in Program Input.");
              }
              return String(inputLines.shift());
            };

            stdoutDecoder = new TextDecoder();
            stderrDecoder = new TextDecoder();

            pyodide.setStdout({
              write(buffer) {
                const text = stdoutDecoder.decode(buffer, { stream: true });
                if (text) {
                  send("stdout", { text });
                }
                return buffer.length;
              }
            });

            pyodide.setStderr({
              write(buffer) {
                const text = stderrDecoder.decode(buffer, { stream: true });
                if (text) {
                  send("stderr", { text });
                }
                return buffer.length;
              }
            });

            send("run-start");
            const scope = pyodide.toPy({ __name__: "__main__", input: readInput });

            try {
              await pyodide.runPythonAsync(data.code || "", {
                globals: scope,
                filename: "<user_code>"
              });
            } finally {
              scope.destroy();
            }

            const stdoutFlush = stdoutDecoder.decode();
            const stderrFlush = stderrDecoder.decode();

            if (stdoutFlush) {
              send("stdout", { text: stdoutFlush });
            }

            if (stderrFlush) {
              send("stderr", { text: stderrFlush });
            }

            send("run-complete");
          } catch (error) {
            if (stdoutDecoder) {
              const stdoutFlush = stdoutDecoder.decode();
              if (stdoutFlush) {
                send("stdout", { text: stdoutFlush });
              }
            }

            if (stderrDecoder) {
              const stderrFlush = stderrDecoder.decode();
              if (stderrFlush) {
                send("stderr", { text: stderrFlush });
              }
            }

            send("run-error", { message: cleanMessage(error) });
          } finally {
            if (pyodide) {
              pyodide.setStdout();
              pyodide.setStderr();
            }
          }
        }
      };
    `;

    state.workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    state.worker = new Worker(state.workerUrl);
    state.worker.addEventListener("message", handleWorkerMessage);
    state.worker.addEventListener("error", (event) => {
      state.runtimeReady = false;
      state.isRunning = false;
      appendRuntimeError("Worker error: " + event.message);
      status.flash("Something needs attention.", "error", 3200);
      syncButtons();
    });
    state.worker.postMessage({ type: "init" });
  }

  function restartWorker(message) {
    terminateWorker();
    state.runtimeReady = false;
    state.isRunning = false;
    status.flash(message, "loading", 1800);
    syncButtons();
    createWorker();
  }

  function runCode() {
    createWorker();

    const inputLines = refs.programInput.value.replace(/\r\n/g, "\n").split("\n");
    if (inputLines.length === 1 && inputLines[0] === "") {
      inputLines.length = 0;
    }

    state.worker.postMessage({
      type: "run",
      code: getEditorValue(),
      inputLines
    });

    storeDraft();
  }

  refs.runButton.addEventListener("click", runCode);
  refs.stopButton.addEventListener("click", () => {
    if (state.isRunning) {
      restartWorker("Stopping...");
    }
  });
  refs.clearOutputButton.addEventListener("click", () => {
    clearOutput();
    if (!state.isRunning) {
      status.flash("Output cleared.", state.runtimeReady ? "ready" : "loading");
    }
  });
  refs.resetCodeButton.addEventListener("click", resetExample);
  refs.saveCodeButton.addEventListener("click", saveLocally);
  refs.loadCodeButton.addEventListener("click", loadSaved);
  refs.programInput.addEventListener("input", storeDraft);
  window.addEventListener("pyte:theme", () => {
    if (state.editor && typeof state.editor.setOption === "function") {
      state.editor.setOption("theme", currentEditorTheme());
      refreshEditorSoon();
    }
  });

  initializeEditor();
  createWorker();
  syncButtons();
  status.render();

  if (getQueryParam("starter") === "1") {
    status.flash("Starter code loaded.", "ready");
    window.history.replaceState({}, "", window.location.pathname);
  }
})();
