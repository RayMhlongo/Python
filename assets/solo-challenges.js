(function () {
  const challenge = (title, description, hint, solutionIdea, starterCode) => ({
    title,
    description,
    hint,
    solutionIdea,
    starterCode
  });

  window.PyteSoloChallengeBank = {
    pyteRace: {
      label: "Pyte race Original",
      levels: {
        Amateur: [
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
        Beginner: [
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
        Intermediate: [
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
        Advanced: [
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
        Expert: [
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
        Amateur: [
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
        Beginner: [
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
        Intermediate: [
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
        Advanced: [
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
        Expert: [
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
})();
