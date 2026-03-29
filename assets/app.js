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

const STORAGE_KEYS = {
  savedCode: "pyte.saved.code.v1",
  savedInput: "pyte.saved.input.v1",
  draftCode: "pyte.draft.code.v1",
  draftInput: "pyte.draft.input.v1",
  roomSession: "pyte.room.session.v1",
  clientToken: "pyte.room.client-token.v1"
};

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";

const challenge = (title, description, hint, solutionIdea, starterCode) => ({
  title,
  description,
  hint,
  solutionIdea,
  starterCode
});

const SOLO_CHALLENGE_BANK = {
  pyteRace: {
    label: "Pyte race Original",
    levels: {
      "Amateur": [
        challenge(
          "Welcome Banner",
          "Print the site name on one line, then print a second line that says practice starts now.",
          "Use two print statements.",
          "This is a quick print formatting drill.",
          `# Print the site name and one more line below it.
`
        ),
        challenge(
          "Snack Splitter",
          "You have a total number of snack bars and a number of friends. Print how many bars each friend gets using integer division and how many remain.",
          "Use // for full shares and % for leftovers.",
          "Store the total and friend count in variables, then print the two results clearly.",
          `snack_bars = 23
friends = 5

# Print full bars per friend
# Print leftover bars
`
        )
      ],
      "Beginner": [
        challenge(
          "Odd or Even Radar",
          "Check whether a number is even or odd, then print the correct label.",
          "Use the remainder operator with 2.",
          "If number % 2 is 0, print Even, otherwise print Odd.",
          `number = 17

# Print Even or Odd
`
        ),
        challenge(
          "Countdown Launch",
          "Use a loop to print a countdown from 5 to 1, then print Launch!",
          "range() can count backwards.",
          "Loop from 5 down to 1 and print after the loop finishes.",
          `# Print 5 down to 1
# Then print Launch!
`
        )
      ],
      "Intermediate": [
        challenge(
          "Word Analyzer",
          "Given a word, print its length, the number of vowels in it, and whether it reads the same backwards.",
          "A reversed string can be built with slicing.",
          "Loop through the letters for vowels and compare the word to its reverse for the palindrome check.",
          `word = "level"

# Print the length
# Print the vowel count
# Print whether the word is a palindrome
`
        ),
        challenge(
          "Guess Feedback Loop",
          "A list of guesses is provided. Stop when a guess matches the secret number, and print Too low, Too high, or Correct.",
          "Loop through the guesses one at a time and compare them to the secret.",
          "Break out of the loop when the correct guess is found.",
          `secret = 42
guesses = [12, 50, 38, 42, 90]

# Print feedback for each guess until the answer is found
`
        )
      ],
      "Advanced": [
        challenge(
          "Scoreboard Parser",
          "Turn a string like Ray:12,Phathu:18,Lebo:9 into a dictionary, then print the top scorer and the total points.",
          "Split first by comma, then split each pair by colon.",
          "Build a dictionary of names to scores, then use max() and sum().",
          `raw_scores = "Ray:12,Phathu:18,Lebo:9,Nia:15"

# Convert raw_scores into a dictionary
# Print the top scorer
# Print the total points
`
        ),
        challenge(
          "Seat Map Builder",
          "Create a 3x4 seating chart from a flat list of names and print each row as a list.",
          "Use slicing inside a loop.",
          "Move through the list in row-size steps and slice out each row.",
          `names = ["Ray", "Phathu", "Ayo", "Zee", "Lebo", "Tina", "Kai", "Neo", "Mia", "Sam", "Ama", "Tebo"]
row_size = 4

# Print the seating chart rows
`
        )
      ],
      "Expert": [
        challenge(
          "Bracket Balance Checker",
          "Write a checker that returns True if (), [], and {} are balanced in a string and False otherwise.",
          "A stack is the cleanest tool here.",
          "Push opening brackets and pop when a closing bracket appears. The types must match.",
          `text = "{[()]}([])"

def is_balanced(value):
    # Return True or False
    pass

print(is_balanced(text))
`
        ),
        challenge(
          "Run-Length Encoder",
          "Compress a string by replacing repeated characters with the character followed by its count.",
          "Track the current character and how many times it has repeated.",
          "Walk through the string once, flush the previous run when the character changes, then append the final run.",
          `text = "aaabbccccdda"

def encode(value):
    # Return the encoded string
    pass

print(encode(text))
`
        )
      ],
      "God Level": [
        challenge(
          "Island Counter",
          "In a grid of 1s and 0s, count how many separate islands of 1s exist using four-direction movement.",
          "Depth-first search or breadth-first search both work.",
          "Visit each cell once. When you find an unvisited 1, explore its whole island and increase the count.",
          `grid = [
    [1, 1, 0, 0],
    [1, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 0, 0, 0]
]

def count_islands(map_grid):
    # Return the number of islands
    pass

print(count_islands(grid))
`
        ),
        challenge(
          "Packet Sum Decoder",
          "Flatten a nested list of integers and return the total sum of every number inside it.",
          "Recursion keeps this clean.",
          "If the current item is an integer, add it. If it is a list, recursively sum its contents.",
          `packets = [5, [2, 3], [1, [4, 6], 2], 9]

def packet_sum(data):
    # Return the sum of all integers
    pass

print(packet_sum(packets))
`
        )
      ]
    }
  },
  days100: {
    label: "100 Days Style",
    levels: {
      "Amateur": [
        challenge(
          "Morning Check-In",
          "Store a name and today's mood in variables, then print a two-line morning check-in message.",
          "Keep it simple with direct string output.",
          "This is a friendly starter on variables and print formatting.",
          `name = "Phathu"
mood = "focused"

# Print a two-line morning check-in
`
        ),
        challenge(
          "Minutes to Hours",
          "Convert a number of minutes into whole hours and remaining minutes.",
          "Use integer division and modulus together.",
          "Compute the number of full hours first, then the leftover minutes.",
          `minutes = 185

# Print the hours
# Print the remaining minutes
`
        )
      ],
      "Beginner": [
        challenge(
          "BMI Message",
          "Use height and weight variables to calculate BMI, then print a category such as Under, Balanced, or High using your own thresholds.",
          "BMI is weight divided by height squared.",
          "Calculate once, then classify it with if/elif/else.",
          `weight = 78
height = 1.76

# Calculate BMI
# Print a category message
`
        ),
        challenge(
          "Leap Year Lantern",
          "Check whether a year is a leap year and print the result.",
          "A leap year is divisible by 4, but centuries must also be divisible by 400.",
          "Use the standard leap-year rules in order.",
          `year = 2028

# Print whether the year is a leap year
`
        )
      ],
      "Intermediate": [
        challenge(
          "Shift Cipher Warmup",
          "Write a small encoder that shifts each lowercase letter forward by a fixed amount while leaving spaces untouched.",
          "Work with alphabet positions using ord() and chr().",
          "Convert each letter to an index, add the shift, wrap around 26, and convert back.",
          `message = "code now"
shift = 2

def encode(text, amount):
    # Return the shifted message
    pass

print(encode(message, shift))
`
        ),
        challenge(
          "Task Progress Board",
          "Given a list of task dictionaries with a completed flag, print how many are done, how many remain, and the completion percentage.",
          "Count completed tasks first, then compute the rest from the total.",
          "Use a loop or a comprehension to count done items.",
          `tasks = [
    {"title": "Syntax", "done": True},
    {"title": "Loops", "done": False},
    {"title": "Functions", "done": True},
    {"title": "Debugging", "done": False}
]

# Print done count, remaining count, and completion percent
`
        )
      ],
      "Advanced": [
        challenge(
          "Quiz Scoreboard",
          "A list of question results stores True for correct and False for wrong. Print the final score, percentage, and a performance label.",
          "Count the True values and divide by the total number of questions.",
          "Use the score and percentage to choose a label such as Solid, Strong, or Elite.",
          `results = [True, True, False, True, False, True, True]

# Print the score
# Print the percentage
# Print a performance label
`
        ),
        challenge(
          "Expense Summary",
          "Group a list of expenses by category and print the total spent per category from highest total to lowest.",
          "A dictionary accumulator works well here.",
          "Loop through the records, total each category, then sort the dictionary items by value descending.",
          `expenses = [
    ("data", 120),
    ("food", 90),
    ("transport", 60),
    ("food", 55),
    ("data", 40)
]

# Print totals per category from highest to lowest
`
        )
      ],
      "Expert": [
        challenge(
          "Flashcard Class",
          "Create a Flashcard class with a prompt and answer, then add a method that checks whether a user's answer is correct ignoring case and extra spaces.",
          "A small helper method can normalize the text before comparing.",
          "Use __init__ to store values and a check() method to compare cleaned strings.",
          `class Flashcard:
    def __init__(self, prompt, answer):
        pass

    def check(self, user_answer):
        pass

card = Flashcard("Capital of South Africa?", "Pretoria")
print(card.check(" pretoria "))
`
        ),
        challenge(
          "Ledger Class",
          "Create a simple account ledger class that stores deposits and withdrawals, then returns the final balance.",
          "A transaction list keeps the design tidy.",
          "Build methods to add positive and negative movements, then sum them in a balance method.",
          `class Ledger:
    def __init__(self):
        pass

    def deposit(self, amount):
        pass

    def withdraw(self, amount):
        pass

    def balance(self):
        pass

account = Ledger()
account.deposit(500)
account.withdraw(120)
print(account.balance())
`
        )
      ],
      "God Level": [
        challenge(
          "Phathu's Intelligence Staircase",
          "Count how many distinct ways a learner can climb a staircase if they may move 1 or 2 steps at a time.",
          "This becomes much faster with memoization.",
          "Define a function for n steps, cache previous answers, and combine the n-1 and n-2 cases.",
          `steps = 8

def climb_count(n, memo=None):
    # Return the number of valid ways
    pass

print(climb_count(steps))
`
        ),
        challenge(
          "Mini Template Renderer",
          "Replace placeholders like {{name}} inside a template string using values from a dictionary.",
          "Scan the string to locate opening and closing markers.",
          "Extract the key name inside each placeholder and substitute from the data dictionary.",
          `template = "Hello {{name}}, welcome to {{platform}}."
data = {"name": "Ray", "platform": "Pyte"}

def render(text, values):
    # Return the rendered string
    pass

print(render(template, data))
`
        )
      ]
    }
  }
};

const refs = {
  appStatus: document.getElementById("appStatus"),
  codeEditor: document.getElementById("codeEditor"),
  programInput: document.getElementById("programInput"),
  outputConsole: document.getElementById("outputConsole"),
  runButton: document.getElementById("runButton"),
  stopButton: document.getElementById("stopButton"),
  clearOutputButton: document.getElementById("clearOutputButton"),
  resetCodeButton: document.getElementById("resetCodeButton"),
  saveCodeButton: document.getElementById("saveCodeButton"),
  loadCodeButton: document.getElementById("loadCodeButton"),
  roomCodeInput: document.getElementById("roomCodeInput"),
  checkRoomButton: document.getElementById("checkRoomButton"),
  joinRoomButton: document.getElementById("joinRoomButton"),
  leaveRoomButton: document.getElementById("leaveRoomButton"),
  roomNotice: document.getElementById("roomNotice"),
  roomHeadline: document.getElementById("roomHeadline"),
  participantList: document.getElementById("participantList"),
  sessionScorePanel: document.getElementById("sessionScorePanel"),
  sessionAngelPoints: document.getElementById("sessionAngelPoints"),
  sessionBelovedPoints: document.getElementById("sessionBelovedPoints"),
  sessionRoundStatus: document.getElementById("sessionRoundStatus"),
  startChallengeButton: document.getElementById("startChallengeButton"),
  challengePhasePill: document.getElementById("challengePhasePill"),
  roomChallengeTitle: document.getElementById("roomChallengeTitle"),
  roomChallengeMeta: document.getElementById("roomChallengeMeta"),
  roomChallengePrompt: document.getElementById("roomChallengePrompt"),
  roomChallengeCode: document.getElementById("roomChallengeCode"),
  roomChallengeChoices: document.getElementById("roomChallengeChoices"),
  challengeAnswerInput: document.getElementById("challengeAnswerInput"),
  submitChallengeAnswerButton: document.getElementById("submitChallengeAnswerButton"),
  challengeResultSummary: document.getElementById("challengeResultSummary"),
  toggleRoundHistoryButton: document.getElementById("toggleRoundHistoryButton"),
  roundHistoryPanel: document.getElementById("roundHistoryPanel"),
  roundHistoryList: document.getElementById("roundHistoryList"),
  chatMessages: document.getElementById("chatMessages"),
  chatInput: document.getElementById("chatInput"),
  sendChatButton: document.getElementById("sendChatButton"),
  toggleSoloButton: document.getElementById("toggleSoloButton"),
  soloPracticePanel: document.getElementById("soloPracticePanel"),
  challengeSource: document.getElementById("challengeSource"),
  challengeLevel: document.getElementById("challengeLevel"),
  newChallengeButton: document.getElementById("newChallengeButton"),
  useStarterButton: document.getElementById("useStarterButton"),
  challengeSourcePill: document.getElementById("challengeSourcePill"),
  challengeLevelPill: document.getElementById("challengeLevelPill"),
  challengeCountPill: document.getElementById("challengeCountPill"),
  challengeTitle: document.getElementById("challengeTitle"),
  challengeDescription: document.getElementById("challengeDescription"),
  challengeHint: document.getElementById("challengeHint"),
  challengeSolution: document.getElementById("challengeSolution"),
  toggleHintButton: document.getElementById("toggleHintButton"),
  toggleSolutionButton: document.getElementById("toggleSolutionButton"),
  identityOptionAngel: document.getElementById("identityOptionAngel"),
  identityOptionBeloved: document.getElementById("identityOptionBeloved")
};

const state = {
  editor: null,
  socket: null,
  socketConnected: false,
  runtimeReady: false,
  isRunning: false,
  worker: null,
  workerUrl: "",
  currentSoloChallenge: null,
  currentRoomState: null,
  previewState: null,
  roomSession: loadRoomSession(),
  roundHistoryOpen: false,
  soloPanelOpen: false,
  statusOverride: null,
  statusTimer: 0
};

function setStatus(element, message, mode) {
  if (!element) {
    return;
  }
  element.textContent = message;
  element.dataset.state = mode;
}

function isLiveRoomConnected(roomState) {
  return Boolean(
    roomState &&
      Array.isArray(roomState.participants) &&
      roomState.participants.length === 2 &&
      roomState.participants.every((participant) => participant.status === "connected")
  );
}

function refreshAppStatus() {
  if (state.statusOverride) {
    setStatus(refs.appStatus, state.statusOverride.message, state.statusOverride.mode);
    return;
  }

  if (!state.runtimeReady) {
    setStatus(refs.appStatus, "Connecting...", "loading");
    return;
  }

  if (state.isRunning) {
    setStatus(refs.appStatus, "Running...", "running");
    return;
  }

  if (state.roomSession && isLiveRoomConnected(state.currentRoomState)) {
    setStatus(refs.appStatus, "Live room connected", "ready");
    return;
  }

  setStatus(refs.appStatus, "Ready", "ready");
}

function flashAppStatus(message, mode, duration = 2200) {
  window.clearTimeout(state.statusTimer);
  state.statusOverride = { message, mode };
  refreshAppStatus();

  if (duration > 0) {
    state.statusTimer = window.setTimeout(() => {
      state.statusOverride = null;
      refreshAppStatus();
    }, duration);
  }
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

function shouldShowSessionScore(roomState) {
  if (!roomState) {
    return false;
  }

  return isLiveRoomConnected(roomState) || Boolean(roomState.activeChallenge);
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function safeStorageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
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
  } catch (error) {
    return null;
  }
}

function saveRoomSession(roomId, identity) {
  const session = { roomId, identity, sessionToken: getClientToken() };
  safeStorageSet(STORAGE_KEYS.roomSession, JSON.stringify(session));
  state.roomSession = session;
}

function clearRoomSession() {
  safeStorageRemove(STORAGE_KEYS.roomSession);
  state.roomSession = null;
}

function debounce(fn, delay) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

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

function getEditorValue() {
  return state.editor.getValue();
}

function setEditorValue(value) {
  state.editor.setValue(value);
  refreshEditorSoon();
}

function refreshEditorSoon() {
  if (state.editor && typeof state.editor.refresh === "function") {
    window.requestAnimationFrame(() => state.editor.refresh());
  }
}

function storeDraft() {
  safeStorageSet(STORAGE_KEYS.draftCode, getEditorValue());
  safeStorageSet(STORAGE_KEYS.draftInput, refs.programInput.value);
}

const storeDraftDebounced = debounce(storeDraft, 220);

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

function updateLoadButtonState() {
  refs.loadCodeButton.disabled = safeStorageGet(STORAGE_KEYS.savedCode) === null;
}

function saveLocally() {
  const codeSaved = safeStorageSet(STORAGE_KEYS.savedCode, getEditorValue());
  const inputSaved = safeStorageSet(STORAGE_KEYS.savedInput, refs.programInput.value);

  flashAppStatus(
    codeSaved && inputSaved ? "Saved on this device." : "Could not save right now.",
    codeSaved && inputSaved ? "ready" : "warning"
  );
  updateLoadButtonState();
}

function loadSaved() {
  const savedCode = safeStorageGet(STORAGE_KEYS.savedCode);
  const savedInput = safeStorageGet(STORAGE_KEYS.savedInput);

  if (savedCode === null) {
    flashAppStatus("No saved code found yet.", "warning");
    return;
  }

  setEditorValue(savedCode);
  refs.programInput.value = savedInput || "";
  storeDraft();
  flashAppStatus("Saved code loaded.", "ready");
}

function resetExample() {
  setEditorValue(DEFAULT_CODE);
  refs.programInput.value = DEFAULT_INPUT;
  storeDraft();
  flashAppStatus("Example restored.", "ready");
}

function initializeEditor() {
  refs.codeEditor.value = DEFAULT_CODE;
  refs.codeEditor.spellcheck = false;
  refs.codeEditor.setAttribute("autocorrect", "off");
  refs.codeEditor.setAttribute("autocapitalize", "off");

  if (window.CodeMirror) {
    state.editor = window.CodeMirror.fromTextArea(refs.codeEditor, {
      mode: "python",
      theme: "material-darker",
      lineNumbers: true,
      indentUnit: 4,
      tabSize: 4,
      lineWrapping: true,
      viewportMargin: Infinity,
      autofocus: false
    });
    state.editor.on("change", storeDraftDebounced);
  } else {
    refs.codeEditor.classList.add("plain-editor");
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
    refs.codeEditor.addEventListener("input", storeDraftDebounced);
    flashAppStatus("Editor ready.", "warning");
  }

  restoreDraft();
  updateLoadButtonState();
  refreshEditorSoon();
  window.addEventListener("resize", refreshEditorSoon);
  window.visualViewport?.addEventListener("resize", refreshEditorSoon);
}

function syncEditorButtons() {
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
    refreshAppStatus();
    return;
  }

  if (data.type === "ready") {
    state.runtimeReady = true;
    refreshAppStatus();
    syncEditorButtons();
    return;
  }

  if (data.type === "run-start") {
    state.isRunning = true;
    clearOutput();
    refreshAppStatus();
    syncEditorButtons();
    return;
  }

  if (data.type === "stdout" || data.type === "stderr") {
    appendOutput(data.text || "");
    return;
  }

  if (data.type === "run-complete") {
    state.isRunning = false;
    refreshAppStatus();
    syncEditorButtons();
    return;
  }

  if (data.type === "run-error") {
    state.isRunning = false;
    appendRuntimeError(data.message || "An unknown runtime error occurred.");
    flashAppStatus("Check your code and try again.", "error", 2800);
    syncEditorButtons();
    return;
  }

  if (data.type === "runtime-error") {
    state.runtimeReady = false;
    state.isRunning = false;
    appendRuntimeError("Runner issue: " + (data.message || "Could not load the Python tools."));
    flashAppStatus("Something needs attention.", "error", 3200);
    syncEditorButtons();
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
          send("status", { message: "Loading Python runtime..." });
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
        send("ready", { message: "Python runtime ready." });
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
    flashAppStatus("Something needs attention.", "error", 3200);
    syncEditorButtons();
  });
  state.worker.postMessage({ type: "init" });
}

function restartWorker(message) {
  terminateWorker();
  state.runtimeReady = false;
  state.isRunning = false;
  flashAppStatus(message, "loading", 1800);
  syncEditorButtons();
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

function getSelectedIdentity() {
  const checked = document.querySelector('input[name="identity"]:checked');
  return checked ? checked.value : "Angel";
}

function formatLevelLabel(sourceKey, level) {
  return sourceKey === "days100" && level === "God Level" ? "God Level | Phathu's Intelligence" : level;
}

function pickSoloChallenge() {
  const sourceKey = refs.challengeSource.value;
  const level = refs.challengeLevel.value;
  const challenges = SOLO_CHALLENGE_BANK[sourceKey].levels[level];
  const selected = challenges[Math.floor(Math.random() * challenges.length)];

  state.currentSoloChallenge = {
    ...selected,
    sourceKey,
    level,
    count: challenges.length,
    sourceLabel: SOLO_CHALLENGE_BANK[sourceKey].label
  };

  refs.challengeSourcePill.textContent = state.currentSoloChallenge.sourceLabel;
  refs.challengeLevelPill.textContent = formatLevelLabel(sourceKey, level);
  refs.challengeCountPill.textContent = challenges.length + " in this pool";
  refs.challengeTitle.textContent = selected.title;
  refs.challengeDescription.textContent = selected.description;
  refs.challengeHint.textContent = "Hint: " + selected.hint;
  refs.challengeSolution.textContent = "Solution idea: " + selected.solutionIdea;
  refs.challengeHint.hidden = true;
  refs.challengeSolution.hidden = true;
  refs.toggleHintButton.textContent = "Reveal Hint";
  refs.toggleSolutionButton.textContent = "Reveal Solution Idea";
}

function maybeUseStarterCode() {
  if (!state.currentSoloChallenge) {
    return;
  }

  const currentCode = getEditorValue().trim();
  const starterCode = state.currentSoloChallenge.starterCode.trimEnd() + "\n";
  const shouldReplace = !currentCode || currentCode === DEFAULT_CODE.trim() || window.confirm("Replace the editor with this challenge starter code?");

  if (!shouldReplace) {
    return;
  }

  setEditorValue(starterCode);
  storeDraft();
  flashAppStatus("Starter code loaded.", "ready");
  window.setTimeout(() => state.editor.focus(), 220);
}

function toggleDetail(button, panel, showLabel, hideLabel) {
  panel.hidden = !panel.hidden;
  button.textContent = panel.hidden ? showLabel : hideLabel;
}

function toggleRoundHistory() {
  state.roundHistoryOpen = !state.roundHistoryOpen;
  setPanelState(refs.toggleRoundHistoryButton, refs.roundHistoryPanel, state.roundHistoryOpen, "Hide recent rounds", "Show recent rounds");
}

function toggleSoloPractice() {
  state.soloPanelOpen = !state.soloPanelOpen;
  setPanelState(refs.toggleSoloButton, refs.soloPracticePanel, state.soloPanelOpen, "Hide", "Open");
}

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "";
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatRoomStatus(status) {
  if (status === "ready") {
    return "Both players are here. Scores update live from this room.";
  }
  if (status === "challenge_active") {
    return "Challenge live. Each person gets one answer.";
  }
  if (status === "round_complete") {
    return "Round complete. Start another one when you are ready.";
  }
  return "Scores appear when both players are active together.";
}

function renderParticipantState(roomState) {
  refs.participantList.innerHTML = "";
  const stateToRender = roomState || {
    participants: [
      { identity: "Angel", status: "open" },
      { identity: "Beloved", status: "open" }
    ],
    roomId: ""
  };

  for (const participant of stateToRender.participants) {
    const chip = document.createElement("div");
    chip.className = "participant-chip " + participant.status;
    chip.textContent = `${participant.identity} ${participant.status === "open" ? "available" : participant.status}`;
    refs.participantList.appendChild(chip);
  }

  refs.roomHeadline.textContent = stateToRender.roomId ? `Room ${stateToRender.roomId}` : "Not in a room";
}

function setIdentityAvailability(roomState) {
  const selectedRoomSession = state.roomSession;
  const options = [
    { identity: "Angel", label: refs.identityOptionAngel },
    { identity: "Beloved", label: refs.identityOptionBeloved }
  ];

  for (const option of options) {
    const input = option.label.querySelector("input");
    const isJoinedIdentity = selectedRoomSession && selectedRoomSession.identity === option.identity;
    const available = !roomState || roomState.availableIdentities.includes(option.identity) || isJoinedIdentity;
    input.disabled = !available;
    option.label.setAttribute("aria-disabled", String(!available));
  }
}

function renderChat(messages) {
  refs.chatMessages.innerHTML = "";

  if (!messages || !messages.length) {
    refs.chatMessages.innerHTML = `<div class="message system">Messages between both players will appear here.</div>`;
    return;
  }

  for (const message of messages) {
    const item = document.createElement("div");
    item.className = `message ${message.kind === "system" ? "system" : message.identity.toLowerCase()}`;
    const name = message.kind === "system" ? "System" : message.identity;
    item.innerHTML = `
      <div class="message-head">
        <span class="message-name">${name}</span>
        <span>${formatTimestamp(message.createdAt)}</span>
      </div>
      <div>${message.kind === "system" ? message.text : `${message.identity}: ${message.text}`}</div>
    `;
    refs.chatMessages.appendChild(item);
  }

  refs.chatMessages.scrollTop = refs.chatMessages.scrollHeight;
}

function renderRoundHistory(history) {
  refs.roundHistoryList.innerHTML = "";

  if (!history || !history.length) {
    refs.roundHistoryList.innerHTML = `<div class="history-item">No rounds yet.</div>`;
    return;
  }

  for (const item of history) {
    const historyItem = document.createElement("div");
    const resultSummary = item.results
      .map((result) => `${result.identity}: ${result.correct ? "correct" : "wrong"} (+${result.pointsAwarded})`)
      .join(" | ");

    historyItem.className = "history-item";
    historyItem.innerHTML = `
      <strong>${item.challenge.title}</strong>
      <div>${resultSummary}</div>
      <div class="subtle-line">${item.explanation || ""}</div>
    `;
    refs.roundHistoryList.appendChild(historyItem);
  }
}

function renderRoomChallenge(roomState) {
  const active = roomState?.activeChallenge;
  const myIdentity = state.roomSession?.identity || "";
  const mySubmission = active && myIdentity ? active.submissions[myIdentity] : null;

  refs.challengeAnswerInput.disabled = true;
  refs.submitChallengeAnswerButton.disabled = true;
  refs.startChallengeButton.disabled = !(state.roomSession && roomState && roomState.roomStatus !== "challenge_active" && roomState.participants.every((item) => item.status === "connected"));

  if (!active) {
    refs.challengePhasePill.textContent = "Waiting";
    refs.roomChallengeTitle.textContent = "No live challenge yet";
    refs.roomChallengeMeta.textContent = "Join a room with both people connected to begin.";
    refs.roomChallengePrompt.textContent = "";
    refs.roomChallengeCode.hidden = true;
    refs.roomChallengeChoices.innerHTML = "";
    refs.challengeResultSummary.textContent = "Challenge results will appear here after the round ends.";
    return;
  }

  refs.challengePhasePill.textContent = active.status === "active" ? "Live now" : "Round done";
  refs.roomChallengeTitle.textContent = active.challenge.title;
  refs.roomChallengeMeta.textContent = `${active.challenge.difficulty} challenge | ${active.challenge.points} pts`;
  refs.roomChallengePrompt.textContent = active.challenge.prompt;

  if (active.challenge.code) {
    refs.roomChallengeCode.hidden = false;
    refs.roomChallengeCode.textContent = active.challenge.code;
  } else {
    refs.roomChallengeCode.hidden = true;
    refs.roomChallengeCode.textContent = "";
  }

  refs.roomChallengeChoices.innerHTML = "";

  for (const choice of active.challenge.choices || []) {
    const choiceItem = document.createElement("div");
    choiceItem.className = "choice-item";
    choiceItem.textContent = `${choice.id}: ${choice.text}`;
    refs.roomChallengeChoices.appendChild(choiceItem);
  }

  if (active.status === "active") {
    refs.challengeResultSummary.textContent = mySubmission?.submitted
      ? `${myIdentity} already submitted. Waiting for the other player or the round result.`
      : "Both players receive the same challenge. Submit once to lock in your answer.";
    refs.challengeAnswerInput.placeholder = active.challenge.answerPlaceholder || "Type your answer.";
    refs.challengeAnswerInput.disabled = !state.roomSession || mySubmission?.submitted;
    refs.submitChallengeAnswerButton.disabled = !state.roomSession || mySubmission?.submitted;
    return;
  }

  const summaryLines = active.results.map((result) => {
    const verdict = result.correct ? "correct" : "wrong";
    return `${result.identity}: ${verdict}, +${result.pointsAwarded}`;
  });

  refs.challengeResultSummary.textContent = `${summaryLines.join(" | ")}${active.explanation ? " | " + active.explanation : ""}`;
}

function renderRoomState(roomState) {
  state.currentRoomState = roomState;
  state.previewState = roomState;
  renderParticipantState(roomState);
  setIdentityAvailability(roomState);
  refs.sessionScorePanel.hidden = !shouldShowSessionScore(roomState);
  refs.sessionAngelPoints.textContent = roomState?.sessionScores?.Angel ?? 0;
  refs.sessionBelovedPoints.textContent = roomState?.sessionScores?.Beloved ?? 0;
  refs.sessionRoundStatus.textContent = formatRoomStatus(roomState?.roomStatus);
  refs.leaveRoomButton.disabled = !state.roomSession;
  refs.sendChatButton.disabled = !state.roomSession;
  refs.chatInput.disabled = !state.roomSession;
  refs.roomNotice.textContent = roomState.roomStatus === "challenge_active"
    ? "Challenge live. Submit one answer when you're ready."
    : isLiveRoomConnected(roomState)
      ? "Both players are here. You can start a challenge."
      : roomState.roomFull && !state.roomSession
        ? `${roomState.roomId} is full.`
        : roomState.availableIdentities.length
          ? `Available: ${roomState.availableIdentities.join(", ")}`
          : "Both names are currently in use.";
  renderRoomChallenge(roomState);
  renderChat(roomState.chat || []);
  renderRoundHistory(roomState.roundHistory || []);
  refreshAppStatus();
}

function emitWithAck(eventName, payload = {}) {
  return new Promise((resolve) => {
    if (!state.socket || !state.socket.connected) {
      resolve({
        ok: false,
        message: "The live room is offline right now."
      });
      return;
    }

    state.socket.emit(eventName, payload, (response) => {
      resolve(response || { ok: false, message: "The live room did not reply." });
    });
  });
}

async function previewRoom() {
  const result = await emitWithAck("room:preview", { roomId: refs.roomCodeInput.value.trim() });

  if (!result.ok) {
    refs.roomNotice.textContent = result.message || "Could not preview the room right now.";
    return;
  }

  renderRoomState(result.state);
}

async function joinRoom({ auto = false } = {}) {
  const roomId = refs.roomCodeInput.value.trim();
  const identity = auto && state.roomSession ? state.roomSession.identity : getSelectedIdentity();
  const result = await emitWithAck("room:join", {
    roomId,
    identity,
    sessionToken: getClientToken()
  });

  if (!result.ok) {
    refs.roomNotice.textContent = result.message || "Could not join the room right now.";
    if (result.state) {
      renderRoomState(result.state);
    }
    return;
  }

  saveRoomSession(result.roomId, identity);
  refs.roomCodeInput.value = result.roomId;
  renderRoomState(result.state);
  refs.roomNotice.textContent = `You joined ${result.roomId} as ${identity}.`;
}

async function leaveRoom() {
  await emitWithAck("room:leave");
  clearRoomSession();
  renderRoomState({
    roomId: refs.roomCodeInput.value.trim().toUpperCase(),
    participants: [
      { identity: "Angel", status: "open" },
      { identity: "Beloved", status: "open" }
    ],
    availableIdentities: ["Angel", "Beloved"],
    roomFull: false,
    chat: [],
    sessionScores: { Angel: 0, Beloved: 0 },
    roundHistory: [],
    activeChallenge: null,
    roomStatus: "waiting_for_players"
  });
  refs.roomNotice.textContent = "You left the room.";
}

async function sendChatMessage() {
  const text = refs.chatInput.value.trim();

  if (!text) {
    refs.roomNotice.textContent = "Type a message before sending.";
    return;
  }

  const result = await emitWithAck("chat:send", { text });

  if (!result.ok) {
    refs.roomNotice.textContent = result.message || "Message could not be sent right now.";
    return;
  }

  refs.chatInput.value = "";
}

async function startRoomChallenge() {
  const result = await emitWithAck("challenge:start");

  if (!result.ok) {
    refs.challengeResultSummary.textContent = result.message || "Challenge could not start.";
  }
}

async function submitRoomChallengeAnswer() {
  const answer = refs.challengeAnswerInput.value.trim();

  if (!answer) {
    refs.challengeResultSummary.textContent = "Type an answer before submitting.";
    return;
  }

  const result = await emitWithAck("challenge:submit", { answer });

  if (!result.ok) {
    refs.challengeResultSummary.textContent = result.message || "Answer could not be submitted.";
    return;
  }

  refs.challengeAnswerInput.value = "";
}

function bootSocket() {
  if (typeof window.io !== "function") {
    state.socket = null;
    state.socketConnected = false;
    refs.roomNotice.textContent = "Live room features are unavailable right now, but solo coding still works.";
    refreshAppStatus();
    return;
  }

  state.socket = window.io({
    transports: ["websocket", "polling"],
    reconnection: true
  });

  state.socket.on("connect", async () => {
    state.socketConnected = true;
    refreshAppStatus();
    if (state.roomSession) {
      refs.roomCodeInput.value = state.roomSession.roomId;
      const identityInput = document.querySelector(`input[name="identity"][value="${state.roomSession.identity}"]`);
      if (identityInput) {
        identityInput.checked = true;
      }
      await joinRoom({ auto: true });
    } else if (refs.roomCodeInput.value.trim()) {
      await previewRoom();
    }
  });

  state.socket.on("disconnect", () => {
    state.socketConnected = false;
    refreshAppStatus();
  });

  state.socket.on("connect_error", () => {
    state.socketConnected = false;
    refreshAppStatus();
  });

  state.socket.on("socket:status", (payload) => {
    state.socketConnected = Boolean(payload.connected);
    refreshAppStatus();
  });

  state.socket.on("room:state", (roomState) => {
    renderRoomState(roomState);
  });
}

function bindEvents() {
  refs.runButton.addEventListener("click", runCode);
  refs.stopButton.addEventListener("click", () => {
    if (state.isRunning) {
      restartWorker("Stopping...");
    }
  });
  refs.clearOutputButton.addEventListener("click", () => {
    clearOutput();
    if (!state.isRunning) {
      flashAppStatus("Output cleared.", state.runtimeReady ? "ready" : "loading");
    }
  });
  refs.resetCodeButton.addEventListener("click", resetExample);
  refs.saveCodeButton.addEventListener("click", saveLocally);
  refs.loadCodeButton.addEventListener("click", loadSaved);
  refs.programInput.addEventListener("input", storeDraftDebounced);
  refs.challengeSource.addEventListener("change", pickSoloChallenge);
  refs.challengeLevel.addEventListener("change", pickSoloChallenge);
  refs.newChallengeButton.addEventListener("click", pickSoloChallenge);
  refs.useStarterButton.addEventListener("click", maybeUseStarterCode);
  refs.toggleHintButton.addEventListener("click", () => toggleDetail(refs.toggleHintButton, refs.challengeHint, "Reveal Hint", "Hide Hint"));
  refs.toggleSolutionButton.addEventListener("click", () => toggleDetail(refs.toggleSolutionButton, refs.challengeSolution, "Reveal Solution Idea", "Hide Solution Idea"));
  refs.toggleRoundHistoryButton.addEventListener("click", toggleRoundHistory);
  refs.toggleSoloButton.addEventListener("click", toggleSoloPractice);
  refs.checkRoomButton.addEventListener("click", previewRoom);
  refs.joinRoomButton.addEventListener("click", () => joinRoom());
  refs.leaveRoomButton.addEventListener("click", leaveRoom);
  refs.sendChatButton.addEventListener("click", sendChatMessage);
  refs.startChallengeButton.addEventListener("click", startRoomChallenge);
  refs.submitChallengeAnswerButton.addEventListener("click", submitRoomChallengeAnswer);
}

initializeEditor();
pickSoloChallenge();
createWorker();
bootSocket();
bindEvents();
syncEditorButtons();
setPanelState(refs.toggleRoundHistoryButton, refs.roundHistoryPanel, state.roundHistoryOpen, "Hide recent rounds", "Show recent rounds");
setPanelState(refs.toggleSoloButton, refs.soloPracticePanel, state.soloPanelOpen, "Hide", "Open");
renderParticipantState(null);
setIdentityAvailability(null);
renderChat([]);
renderRoundHistory([]);
refreshAppStatus();
