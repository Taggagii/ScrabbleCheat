// visual board stuff
const board = document.getElementById('board');
const SQUARES_PER_SIDE = 15;

const inputs = [];

let vertical = false;

for (let y = 0; y < SQUARES_PER_SIDE; ++y) {
    const row = [];
    for (let x = 0; x < SQUARES_PER_SIDE; ++x) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        
        const textInput = document.createElement('input');
        textInput.classList.add('tileInput');

        textInput.addEventListener('keydown', (event) => {
            event.preventDefault();

            let inputValue = event.key?.toUpperCase();
            let direction = 1
            let border = SQUARES_PER_SIDE;

            if (inputValue === 'BACKSPACE') {
                direction = -1;
                border = -1;
                inputValue = '';
            } else if (inputValue === ' ') {
                inputValue = '';
            }

            if (inputValue.length > 1 || (inputValue !== '' && !inputValue.match(/[A-Z ]/))) return;

            event.target.value = inputValue;

            const oldX = vertical ? y : x;
            const oldY = vertical ? x : y;

            let nextX = ((oldX + direction % SQUARES_PER_SIDE) + SQUARES_PER_SIDE) % SQUARES_PER_SIDE;
            let nextY = oldY + direction * Number(direction * nextX < direction * oldX);

            nextX ^= Number(vertical) * nextY;
            nextY ^= Number(vertical) * nextX;
            nextX ^= Number(vertical) * nextY;

            if (nextY < 0 || nextY >= SQUARES_PER_SIDE) return;

            inputs[nextY][nextX].focus();
        });

        row.push(textInput);


        tile.appendChild(textInput);

        board.appendChild(tile);
    }
    inputs.push(row);
}

// ------ board initialization functions ------

const buildBoard = () => {
    const board = inputs.map((row) => row.map((input) => ({
        letter: input.value,
        wordMultiplier: 1,
        letterMultiplier: 1,
    })));

    const tripleWordLocations = [
        [0, 0],
        [7, 0],
        [14, 0],
        [0, 7],
        [14, 7],
        [0, 14],
        [7, 14],
        [14, 14],
    ];

    const doubleWordLocations = [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [13, 1],
        [12, 2],
        [11, 3],
        [10, 4],
        [1, 13],
        [2, 12],
        [3, 11],
        [4, 10],
        [10, 10],
        [11, 11],
        [12, 12],
        [13, 13],
        [7, 7],
    ];

    const tripleLetterLocations = [
        [5, 1],
        [9, 1],
        [1, 5],
        [5, 5],
        [9, 5],
        [13, 5],
        [1, 9],
        [5, 9],
        [9, 9],
        [13, 9],
        [5, 13],
        [9, 13],
    ];

    const doubleLetterLocations = [
        [3, 0],
        [11, 0],
        [6, 2],
        [8, 2],
        [0, 3],
        [7, 3],
        [14, 3],
        [2, 6],
        [6, 6],
        [8, 6],
        [12, 6],
        [3, 7],
        [11, 7],
        [2, 8],
        [6, 8],
        [8, 8],
        [12, 8],
        [0, 11],
        [7, 11],
        [14, 11],
        [6, 12],
        [8, 12],
        [3, 14],
        [11, 14],
    ];

    tripleWordLocations.forEach((location) => {
        const [x, y] = location;
        if (board[y][x].letter) return;
        board[y][x].wordMultiplier = 3;
    });

    doubleWordLocations.forEach((location) => {
        const [x, y] = location;
        if (board[y][x].letter) return;
        board[y][x].wordMultiplier = 2;
    });

    tripleLetterLocations.forEach((location) => {
        const [x, y] = location;
        if (board[y][x].letter) return;
        board[y][x].letterMultiplier = 3;
    });

    doubleLetterLocations.forEach((location) => {
        const [x, y] = location;
        if (board[y][x].letter) return;
        board[y][x].letterMultiplier = 2;
    });
    

    return structuredClone(board);
};

// ------ initialize structures ------
const VERTICAL = [0, 1];
const HORIZONTAL = [1, 0];

let file = new XMLHttpRequest();
file.open("GET", "/wordlist.txt", false);
let wordListRaw = '';
file.onreadystatechange = () => {
    if (file.readyState === 4 && (file.status === 200 || file.status == 0)) {
        wordListRaw = file.responseText;
    }
}
file.send(null);
const wordList = wordListRaw.split('\n').map((word) => word.trim());
const wordListLookup = new Set(wordList);

const substringLookup = new Set();
wordList.forEach((word) => {
    for (let i = 1; i <= word.length; ++i) {
        for (let ii = 0; ii < i; ++ii) {
            substringLookup.add(word.slice(ii, i));
        }
    }
});

const letterValueLookup = {
    "A": 1,
    "E": 1,
    "I": 1,
    "O": 1,
    "U": 1,
    "L": 1,
    "N": 1,
    "S": 1,
    "T": 1,
    "R": 1,

    "D": 2,
    "G": 2,

    "B": 3,
    "C": 3,
    "M": 3,
    "P": 3,

    "F": 4,
    "H": 4,
    "V": 4,
    "W": 4,
    "Y": 4,

    "K": 5,

    "J": 6,
    "X": 6,

    "Q": 10,
    "Z": 10,

    "?": 0,

}

// ------ board functions ------

const boardSet = (x, y, value, board, invalidateLocation = false) => {
    if (!board[y] || !board[y][x]) {
        return;
    }

    if (board[y][x].letter) {
        const message = `Trying to set value ${[x, y]} to value ${value} despite it already being populated by ${board[y][x].letter}`;
        throw Error(message);
    }

    board[y][x].letter = value.toUpperCase();
    if (invalidateLocation) {
        board[y][x].letterMultiplier = 1;
        board[y][x].wordMultiplier = 1;
    }
}

const boardGet = (x, y, board) => {
    if (!board[y] || !board[y][x]) {
        return;
    }
    return board[y][x].letter;
}

const printBoard = (board) => {
    board.forEach((line) => {
        const lineToPrint = line.map((tile) => {
            
            if (tile.letterMultiplier > 1) {
                return tile.letterMultiplier;
            }
            
            if (tile.wordMultiplier > 1) {
                return tile.wordMultiplier;
            }
            if (tile.letter) {
                return tile.letter;
            }

            return ' '

        }).map((letter) => letter).join(' | ');
        console.log(lineToPrint)
        console.log('-'.repeat(lineToPrint.length))
    })
}

// ------ low level scrabble functions ------

const findWord = (x, y, dir, board) => {
    if (!boardGet(x, y, board)) {
        return undefined;
    }

    // get to the start of the word recursively
    if (boardGet(x - dir[0], y - dir[1], board)) {
        return findWord(x - dir[0], y - dir[1], dir, board);
    }

    // we're at the start of the word, find the length of the word
    let lengthOfWord = 0;
    while (boardGet(x + dir[0] * ++lengthOfWord, y + dir[1] * lengthOfWord, board));

    let word = [];
    for (let i = 0; i < lengthOfWord; ++i) {
        word.push(boardGet(x + dir[0] * i, y + dir[1] * i, board))
    }

    return {
        startingIndex: [x, y],
        endingIndex: [x + dir[0] * (lengthOfWord - 1), y + dir[1] * (lengthOfWord - 1)],
        direction: dir,
        length: lengthOfWord,
        word: word.join(''),
    }
}

const validWord = (x, y, dir, board) => {
    const wordInfo = findWord(x, y, dir, board);
    if (!wordInfo) {
        return false;
    }

    return wordListLookup.has(wordInfo.word);
}

const validSubstring = (x, y, dir, board) => {
    const substringInfo = findWord(x, y, dir, board);
    if (!substringInfo) {
        return false;
    }

    return substringLookup.has(substringInfo.word);
}

// ------ score functions ------

const naiveWordScore = (wordInfo, board, logging = false) => {
    let totalWordMultiplier = 1;
    let wordScore = 0;
    for (let i = 0; i < wordInfo.length; ++i) {
        const x = wordInfo.startingIndex[0] + wordInfo.direction[0] * i;
        const y = wordInfo.startingIndex[1] + wordInfo.direction[1] * i;

        const letterInfo = board[y][x];

        totalWordMultiplier *= letterInfo.wordMultiplier;

        const letterScore = letterValueLookup[letterInfo.letter] * letterInfo.letterMultiplier;
        wordScore += letterScore;
    }

    wordScore *= totalWordMultiplier;

    return wordScore;
}

const calculateFinalScore = (validFrame, logging=false) => {
    const { board, addedLetters, direction, perpendicularDirection } = validFrame;

    const wordInfo = findWord(addedLetters[0].x, addedLetters[0].y, direction, board);
    if (logging) console.log(wordInfo.word, naiveWordScore(wordInfo, board, logging))
        
    let totalScore = naiveWordScore(wordInfo, board);
        
    addedLetters.forEach((letter) => {
        const perpWordInfo = findWord(letter.x, letter.y, perpendicularDirection, board);
        if (perpWordInfo.length == 1) {
            return;
        }

        if (logging) console.log(perpWordInfo.word, naiveWordScore(perpWordInfo, board, logging))

        const smallWordScore = naiveWordScore(perpWordInfo, board);

        totalScore += smallWordScore;
    });

    if (addedLetters.length === 7) {
        totalScore += 50; // bingo!
    }

    return totalScore
}

// ------ high level scrabble functions ------

const findAllValidFrames = async (letters, board) => {
    const executionFrames = [];
    const validBoards = [];

    // first we initialize all the possible starting execution boards
    // for each active tile in the board
    const surroundingTileOffsets = [
        [-1, 0],
        [1, 0],
        [0, 1],
        [0, -1]
    ];
    const ordinals = [VERTICAL, HORIZONTAL];

    console.log('building execution boards')
    let noActiveBoards = true;
    for (let x = 0; x < board.length; ++x) {
        for (let y = 0; y < board.length; ++y) {
            if (!boardGet(x, y, board)) continue;
            noActiveBoards = false

            // active tile
            // go to all surrounding tiles
            surroundingTileOffsets.forEach((offsetPair) => {
                const newX = x + offsetPair[0];
                const newY = y + offsetPair[1];

                if (boardGet(newX, newY, board)) {
                    return;
                }

                const direction = [Math.abs(offsetPair[0]), Math.abs(offsetPair[1])];
                const perpendicularDirection = [direction[1], direction[0]];

                letters.forEach((letter, letterIndex) => {
                    const tempBoard = structuredClone(board);
                    boardSet(newX, newY, letter, tempBoard);

                    if (!validSubstring(newX, newY, perpendicularDirection, tempBoard)) {
                        return;
                    }

                    if (!validWord(newX, newY, direction, tempBoard)) {
                        return;
                    }

                    const wordInfo = findWord(newX, newY, perpendicularDirection, tempBoard);
                    executionFrames.push({
                        startingIndex: wordInfo.startingIndex,
                        endingIndex: wordInfo.endingIndex,
                        board: tempBoard,
                        direction: perpendicularDirection,
                        letters: [...letters.slice(0, letterIndex), ...letters.slice(letterIndex + 1)],
                        addedLetters: [{ x: newX, y: newY, letter }]
                    });
                });
            })


            ordinals.forEach((direction) => {
                if (validSubstring(x, y, direction, board)) {
                    const tempBoard = structuredClone(board);
                    const wordInfo = findWord(x, y, direction, tempBoard);

                    executionFrames.push({
                        startingIndex: wordInfo.startingIndex,
                        endingIndex: wordInfo.endingIndex,
                        board: tempBoard,
                        direction,
                        letters,
                        addedLetters: [],
                    });
                }
            });
        }
    }

    if (noActiveBoards) {
        const centerX = 7;
        const centerY = 7;
        letters.forEach((letter, letterIndex) => {
            ordinals.forEach((direction) => {
                const tempBoard = structuredClone(board);
                boardSet(centerX, centerY, letter, tempBoard);

                const wordInfo = findWord(centerX, centerY, direction, tempBoard);
                executionFrames.push({
                    startingIndex: wordInfo.startingIndex,
                    endingIndex: wordInfo.endingIndex,
                    board: tempBoard,
                    direction: direction,
                    letters: [...letters.slice(0, letterIndex), ...letters.slice(letterIndex + 1)],
                    addedLetters: [{ x: centerX, y: centerY, letter }]
                });

            });

        });
    } 

    const progressBar = document.getElementById('progressBar');
    const boardStates = document.getElementById('boardStates');
    progressBar.innerHTML = "50";
    
    console.log('starting execution frame computation', executionFrames.length)
    
    const sleep = async (ms) => new Promise((r) => setTimeout(r, ms));
    
    let i = 0;
    let max = 0;
    // handle execution frames
    while (executionFrames.length) {
        max = Math.max(max, executionFrames.length);
        if (++i >= 500) {
            progressBar.value = Math.floor((executionFrames.length / max) * 100);
            boardStates.innerHTML = `Remaining board states to compute: ${executionFrames.length}`;
            i = 0;
            await sleep(0)
        }

        // console.log('execution frames left', executionFrames.length)
        
        // progressBar.value = executionFrames.length / 4000;
        // progressBar.innerHTML = `Frames: ${executionFrames.length}`
        // progressBar.max = Math.max(progressBar.max, executionFrames.length).toString();
        const currentFrame = executionFrames.shift()
        const { startingIndex, endingIndex, direction, addedLetters } = currentFrame;
        const perpendicularDirection = [direction[1], direction[0]];
        const currentLetters = currentFrame.letters;
        const currentBoard = currentFrame.board;

        const possibleLocations = [
            [endingIndex[0] + direction[0], endingIndex[1] + direction[1]],
            [startingIndex[0] - direction[0], startingIndex[1] - direction[1]]
        ]

        currentLetters.forEach((letter, letterIndex) => {
            const newLetters = [...currentLetters.slice(0, letterIndex), ...currentLetters.slice(letterIndex + 1)];

            possibleLocations.forEach((possibleLocation) => {
                const tempBoard = structuredClone(currentBoard);
                const [newX, newY] = possibleLocation;

                boardSet(newX, newY, letter, tempBoard);

                if (!validSubstring(newX, newY, direction, tempBoard)) {
                    return;
                }

                if (!validWord(newX, newY, perpendicularDirection, tempBoard) && findWord(newX, newY, perpendicularDirection, tempBoard).length > 1) {
                    return;
                }


                if (validWord(newX, newY, direction, tempBoard)) {
                    validBoards.push({
                        board: structuredClone(tempBoard),
                        addedLetters: [...addedLetters, { x: newX, y: newY, letter }],
                        direction,
                        perpendicularDirection,
                    });
                }

                const wordInfo = findWord(newX, newY, direction, tempBoard);
                executionFrames.push({
                    startingIndex: wordInfo.startingIndex,
                    endingIndex: wordInfo.endingIndex,
                    board: tempBoard,
                    direction,
                    letters: newLetters,
                    addedLetters: [...addedLetters, { x: newX, y: newY, letter }],
                });
            });
        });
    }

    boardStates.innerHTML = '';

    return validBoards
}

const findBestBoard = (validFrames) => {
    const bestScoreIndexCombo = validFrames.reduce((bestCombo, validFrame, index) => {
        const score = calculateFinalScore(validFrame);
        if (score > bestCombo.score) {
            return { index, score };
        }
        return bestCombo;
    }, { score: 0, index: -1 })

    console.log('best score', bestScoreIndexCombo.score);
    calculateFinalScore(validFrames[bestScoreIndexCombo.index], true);

    return validFrames[bestScoreIndexCombo.index].board;
}


// ------ front end interaction functions ------

const updateFrontEndBoard = (board) => {
    for (let y = 0; y < SQUARES_PER_SIDE; ++y) {
        for (let x = 0; x < SQUARES_PER_SIDE; ++x) {
            const newClassList = [];

            if (!board[y][x].letter) {
                if (board[y][x].letterMultiplier === 2) {
                    newClassList.push('doubleLetterScore');
                } else if (board[y][x].letterMultiplier === 3) {
                    newClassList.push('tripleLetterScore');
                } else if (board[y][x].wordMultiplier === 2) {
                    newClassList.push('doubleWordScore');
                } else if (board[y][x].wordMultiplier === 3) {
                    newClassList.push('tripleWordScore');
                }
            } else {
                const newLetter = !inputs[y][x].value && board[y][x].letter;
    
                inputs[y][x].value = board[y][x].letter;
    
                if (newLetter) {
                    newClassList.push('newlyPlacedInput');
                } else {
                    newClassList.push('placedInput');
                }
            }
            

            inputs[y][x].classList = newClassList;
            
        }
    }
}

updateFrontEndBoard(buildBoard());

const main = async () => {
    const currentBoard = buildBoard();

    const letters = document.getElementById('letters')

    const validFrames = await findAllValidFrames(letters.value.split(''), currentBoard);

    const bestBoard = findBestBoard(validFrames);

    updateFrontEndBoard(bestBoard);
}


const directionSwapButton = document.getElementById('directionSwap');

const swapTypingDirection = (event) => {
    vertical ^= 1;

    directionSwapButton.value = 'Typing direction: ' + (vertical ? 'vertical' : 'horizontal');
    event.preventDefault();
}

directionSwapButton.addEventListener('mousedown', swapTypingDirection);

board.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        swapTypingDirection(event);
    }

})


