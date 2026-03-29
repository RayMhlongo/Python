const { randomUUID } = require("crypto");

function normalizeMultiline(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .replace(/[ \t]+/g, " ")
    .toLowerCase();
}

function normalizeCodeLine(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*([=+\-*/%(),:<>])\s*/g, "$1")
    .toLowerCase();
}

const ROOM_CHALLENGES = [
  {
    id: "output-hello",
    type: "Python output prediction",
    difficulty: "Amateur",
    title: "Greeting Output",
    prompt: "Predict the exact output of this code.",
    code: `name = "Angel"\nprint("Hello", name)`,
    answerLabel: "Exact output",
    answerPlaceholder: "Type the output exactly as it would appear.",
    points: 10,
    validator: {
      kind: "exact",
      answers: ["hello angel"]
    },
    explanation: "print adds a space between arguments, so the output is Hello Angel."
  },
  {
    id: "fix-indent",
    type: "Fix-the-code",
    difficulty: "Beginner",
    title: "Repair the Condition",
    prompt: "Write the corrected second line only so this code becomes valid Python.",
    code: `score = 90\nif score > 50\n    print("Pass")`,
    answerLabel: "Corrected line",
    answerPlaceholder: "Example: if score > 50:",
    points: 12,
    validator: {
      kind: "code-line",
      answers: ["if score > 50:", "if score>50:"]
    },
    explanation: "The if statement is missing the trailing colon."
  },
  {
    id: "mc-loop",
    type: "Multiple choice Python basics",
    difficulty: "Beginner",
    title: "Loop Choice",
    prompt: "Which option prints the numbers 0, 1, and 2?",
    choices: [
      { id: "A", text: "for i in range(1, 3): print(i)" },
      { id: "B", text: "for i in range(3): print(i)" },
      { id: "C", text: "for i in range(0, 2): print(i)" },
      { id: "D", text: "for i in [1, 2, 3]: print(i)" }
    ],
    answerLabel: "Choice",
    answerPlaceholder: "Type A, B, C, or D",
    points: 10,
    validator: {
      kind: "choice",
      answers: ["b"]
    },
    explanation: "range(3) yields 0, 1, 2."
  },
  {
    id: "predict-slice",
    type: "Predict-the-result",
    difficulty: "Intermediate",
    title: "Slice Result",
    prompt: "What does this print?",
    code: `word = "python"\nprint(word[1:4])`,
    answerLabel: "Output",
    answerPlaceholder: "Type the printed result.",
    points: 12,
    validator: {
      kind: "exact",
      answers: ["yth"]
    },
    explanation: "Index 1 up to but not including index 4 gives yth."
  },
  {
    id: "small-task-even",
    type: "Small coding task",
    difficulty: "Intermediate",
    title: "Even Check",
    prompt: "Write the missing return line only for a function that returns True when number is even.",
    code: `def is_even(number):\n    # your line here`,
    answerLabel: "Return line",
    answerPlaceholder: "Example: return something",
    points: 14,
    validator: {
      kind: "code-line",
      answers: [
        "return number % 2 == 0",
        "return(number % 2 == 0)",
        "return number%2==0"
      ]
    },
    explanation: "A number is even when the remainder after division by 2 is zero."
  },
  {
    id: "function-result",
    type: "Function-based challenge",
    difficulty: "Intermediate",
    title: "Function Return",
    prompt: "Predict the return value of the function call.",
    code: `def bump(value):\n    return value + 3\n\nprint(bump(7))`,
    answerLabel: "Output",
    answerPlaceholder: "Type the final printed value.",
    points: 12,
    validator: {
      kind: "number",
      answers: [10]
    },
    explanation: "bump(7) returns 10, which is printed."
  },
  {
    id: "logic-discount",
    type: "Beginner-friendly logic task",
    difficulty: "Beginner",
    title: "Discount Math",
    prompt: "A product costs 80 and the discount is 15. What is the final price after subtracting the discount?",
    answerLabel: "Number",
    answerPlaceholder: "Type the numeric answer only.",
    points: 10,
    validator: {
      kind: "number",
      answers: [65]
    },
    explanation: "80 - 15 = 65."
  },
  {
    id: "output-list",
    type: "Python output prediction",
    difficulty: "Advanced",
    title: "List Length",
    prompt: "Predict the exact output.",
    code: `items = ["a", "b", "c", "d"]\nprint(len(items))`,
    answerLabel: "Output",
    answerPlaceholder: "Type the printed result.",
    points: 12,
    validator: {
      kind: "number",
      answers: [4]
    },
    explanation: "The list contains four items."
  },
  {
    id: "fix-nameerror",
    type: "Fix-the-code",
    difficulty: "Advanced",
    title: "Repair the Variable Name",
    prompt: "Write the corrected print line only.",
    code: `total = 18\nprint(totl)`,
    answerLabel: "Corrected line",
    answerPlaceholder: "Type the fixed line.",
    points: 14,
    validator: {
      kind: "code-line",
      answers: ["print(total)"]
    },
    explanation: "The variable name should match the declared name total."
  },
  {
    id: "mc-dict",
    type: "Multiple choice Python basics",
    difficulty: "Intermediate",
    title: "Dictionary Access",
    prompt: "Which option gets the value 99 from this dictionary: scores = {\"Angel\": 99}?",
    choices: [
      { id: "A", text: "scores(Angel)" },
      { id: "B", text: "scores[\"Angel\"]" },
      { id: "C", text: "scores->Angel" },
      { id: "D", text: "scores.Angel" }
    ],
    answerLabel: "Choice",
    answerPlaceholder: "Type A, B, C, or D",
    points: 10,
    validator: {
      kind: "choice",
      answers: ["b"]
    },
    explanation: "Dictionary values are accessed with square brackets and a key."
  },
  {
    id: "predict-boolean",
    type: "Predict-the-result",
    difficulty: "Advanced",
    title: "Boolean Logic",
    prompt: "What does this print?",
    code: `ready = True\nconnected = False\nprint(ready and connected)`,
    answerLabel: "Output",
    answerPlaceholder: "Type the printed result.",
    points: 12,
    validator: {
      kind: "exact",
      answers: ["false"]
    },
    explanation: "True and False evaluates to False."
  },
  {
    id: "small-task-loop",
    type: "Small coding task",
    difficulty: "Advanced",
    title: "Loop Header",
    prompt: "Write the loop header only to repeat three times using i as the variable.",
    answerLabel: "Loop line",
    answerPlaceholder: "Example: for i in something:",
    points: 14,
    validator: {
      kind: "code-line",
      answers: ["for i in range(3):", "for i in range (3):"]
    },
    explanation: "range(3) runs with 0, 1, and 2."
  },
  {
    id: "function-join",
    type: "Function-based challenge",
    difficulty: "Advanced",
    title: "String Builder",
    prompt: "What does this function call print?",
    code: `def label(name, score):\n    return f"{name}:{score}"\n\nprint(label("Beloved", 88))`,
    answerLabel: "Output",
    answerPlaceholder: "Type the printed result.",
    points: 14,
    validator: {
      kind: "exact",
      answers: ["beloved:88"]
    },
    explanation: "The f-string joins the name, a colon, and the numeric score."
  },
  {
    id: "logic-average",
    type: "Beginner-friendly logic task",
    difficulty: "Advanced",
    title: "Average Score",
    prompt: "Three quiz scores are 70, 80, and 100. What is the average?",
    answerLabel: "Number",
    answerPlaceholder: "Type the numeric answer only.",
    points: 12,
    validator: {
      kind: "number",
      answers: [83.3333, 83.33]
    },
    explanation: "The total is 250, divided by 3."
  }
];

function sanitizeChallenge(challenge) {
  return {
    id: challenge.id,
    type: challenge.type,
    difficulty: challenge.difficulty,
    title: challenge.title,
    prompt: challenge.prompt,
    code: challenge.code || "",
    choices: challenge.choices || [],
    answerLabel: challenge.answerLabel,
    answerPlaceholder: challenge.answerPlaceholder,
    points: challenge.points,
    explanation: challenge.explanation
  };
}

function evaluateChallenge(challenge, submittedAnswer) {
  const validator = challenge.validator;
  const raw = String(submittedAnswer || "").trim();

  if (!raw) {
    return {
      correct: false,
      normalizedAnswer: "",
      submittedAnswer: raw
    };
  }

  if (validator.kind === "exact") {
    const normalized = normalizeMultiline(raw);
    return {
      correct: validator.answers.includes(normalized),
      normalizedAnswer: normalized,
      submittedAnswer: raw
    };
  }

  if (validator.kind === "choice") {
    const normalized = raw.trim().toLowerCase();
    return {
      correct: validator.answers.includes(normalized),
      normalizedAnswer: normalized,
      submittedAnswer: raw
    };
  }

  if (validator.kind === "code-line") {
    const normalized = normalizeCodeLine(raw);
    const accepted = validator.answers.map(normalizeCodeLine);
    return {
      correct: accepted.includes(normalized),
      normalizedAnswer: normalized,
      submittedAnswer: raw
    };
  }

  if (validator.kind === "number") {
    const parsed = Number(raw);
    return {
      correct: validator.answers.some((answer) => Math.abs(answer - parsed) < 0.01),
      normalizedAnswer: Number.isFinite(parsed) ? parsed : raw,
      submittedAnswer: raw
    };
  }

  return {
    correct: false,
    normalizedAnswer: raw,
    submittedAnswer: raw
  };
}

function pickRandomChallenge(excludedIds = []) {
  const available = ROOM_CHALLENGES.filter((challenge) => !excludedIds.includes(challenge.id));
  const pool = available.length ? available : ROOM_CHALLENGES;
  const selected = pool[Math.floor(Math.random() * pool.length)];

  return {
    roundId: randomUUID(),
    createdAt: Date.now(),
    challenge: sanitizeChallenge(selected),
    internal: selected
  };
}

module.exports = {
  ROOM_CHALLENGES,
  evaluateChallenge,
  pickRandomChallenge,
  sanitizeChallenge
};
