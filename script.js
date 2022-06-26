const NUMBER_OF_GUESSES = 6;
const COLORS = {
    'yellow': '#CCCC00',
    'green': '#66CC33',
    'grey': '#101010'
};
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
let streak = 0;
let score = 0;
let checkingGuess = false;
console.log(rightGuessString);

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
      const animationName = `${prefix}${animation}`;
      // const node = document.querySelector(element);
      const node = element;
      node.style.setProperty('--animate-duration', '0.3s');

      node.classList.add(`${prefix}animated`, animationName);

      // When the animation ends, we clean the classes and resolve the Promise
      function handleAnimationEnd(event) {
          event.stopPropagation();
          node.classList.remove(`${prefix}animated`, animationName);
          resolve('Animation ended');
      }

      node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return;
    }
    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse");
    box.textContent = pressedKey;
    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor;
            if (oldColor === COLORS['green']) {
                return;
            }

            if (oldColor === COLORS['yellow'] && color !== COLORS['green']) {
                return;
            }

            elem.style.backgroundColor = color;
            break;
        }
    }
}

function clearGameBoard() {
    for (let row of document.getElementsByClassName("letter-row")) {
        for (let box of row.children) {
            box.textContent = "";
            box.style.backgroundColor = "";
            box.classList.remove("filled-box");
        }
    }
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.style.backgroundColor = "#696969";
    }
}

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
    let guessString = '';
    let rightGuess = Array.from(rightGuessString);
    checkingGuess = true;

    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != 5) {
        alert("Not enough letters!");
        checkingGuess = false;
        return;
    }

    if (!WORDS.includes(guessString)) {
        alert("Word not in list!");
        checkingGuess = false;
        return;
    }

    let totalDelay = 0;
    for (let i = 0; i < 5; i++) {
        let letterColor = '';
        let box = row.children[i];
        let letter = currentGuess[i];

        let letterPosition = rightGuess.indexOf(currentGuess[i]);
        console.log(letter + ' ' + letterPosition);
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = COLORS['grey'];
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position
            const re = new RegExp(letter, 'g');
            const guessCount = guessString.match(re).length;
            const rightCount = rightGuessString.match(re).length;
            if (currentGuess[i] === rightGuess[i]) {
                // shade green
                letterColor = COLORS['green'];
            } else {
                // shade box yellow
                // check for double letters in guess word
                if (guessCount > rightCount && i < currentGuess.lastIndexOf(letter)) {
                    letterColor = COLORS['grey'];
                } else {
                    // check if previous double letter was not already
                    letterColor = COLORS['yellow'];
                    if (guessCount > rightCount) {
                        if (i == currentGuess.lastIndexOf(letter)) {
                            for (let j = i - 1; j >= 0; j--) {
                                if (currentGuess[j] == currentGuess[i] && currentGuess[j] === rightGuess[j]) {
                                    letterColor = COLORS['grey'];
                                }
                            }
                        }
                    }
                }
            }
            // check for double letters in right word
            if (rightCount >= guessCount) {
                rightGuess[letterPosition] = "#";
            }
        }

        let delay = 200 * i;
        totalDelay += delay;
        setTimeout(()=> {
            // animate
            animateCSS(box, 'flipInX');
            // shade box
            box.style.backgroundColor = letterColor;
            shadeKeyBoard(letter, letterColor);
        }, delay);
    }

    setTimeout(()=> {
        checkingGuess = false;
        if (guessString === rightGuessString) {
            streak += 1;
            score += 1 + guessesRemaining;
            guessesRemaining = NUMBER_OF_GUESSES;
            currentGuess = [];
            nextLetter = 0;
            rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
            alert("You guessed right!");
            document.getElementById("streak").textContent = "streak: " + streak + " score: " + score;
            clearGameBoard();
            console.log(rightGuessString);
            return;
        } else {
            guessesRemaining -= 1;
            currentGuess = [];
            nextLetter = 0;

            if (guessesRemaining === 0) {
                alert("You've run out of guesses! Game over!");
                alert(`The right word was: "${rightGuessString}"`);
                guessesRemaining = NUMBER_OF_GUESSES;
                rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];
                streak = 0;
                score = 0;
                document.getElementById("streak").textContent = "streak: " + streak + " score: " + score;
                clearGameBoard();
                console.log(rightGuessString);
                return;
            }
        }
    }, totalDelay);

}

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return;
    }

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        if (!checkingGuess) {
            checkGuess();
        }
        return;
    }

    let found = pressedKey.match(/[a-z]/gi);
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
        return;
    }
    let key = target.textContent;

    if (key === "Del") {
        key = "Backspace";
    }

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}));
});

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

initBoard();
