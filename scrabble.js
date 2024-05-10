
const fs = require('fs');
const prompt = require('prompt-sync')();

const VERTICAL = [0, 1];
const HORIZONTAL = [1, 0];

const buildBoard = () => {
    const boardSideLength = 15;
    const board = [];

    for (let y = 0; y < boardSideLength; ++y) {
        const temp = [];
        for (let x = 0; x < boardSideLength; ++x) {
            temp.push({
                letter: '',
                wordMultiplier: 1,
                letterMultiplier: 1,
            });
        }
        board.push(temp);
    }

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
        board[x][y].wordMultiplier = 3;
    });

    doubleWordLocations.forEach((location) => {
        const [x, y] = location;
        board[x][y].wordMultiplier = 2;
    });

    tripleLetterLocations.forEach((location) => {
        const [x, y] = location;
        board[x][y].letterMultiplier = 3;
    });

    doubleLetterLocations.forEach((location) => {
        const [x, y] = location;
        board[x][y].letterMultiplier = 2;
    });

    return board;
};

const globalBoard = buildBoard();

const wordListRaw = fs.readFileSync('wordlist.txt', 'utf8');
const wordList = wordListRaw.split('\n').map((word) => word.trim());
const wordListLookup = new Set(wordList);

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

const substringLookup = new Set();
wordList.forEach((word) => {
    for (let i = 1; i <= word.length; ++i) {
        for (let ii = 0; ii < i; ++ii) {
            substringLookup.add(word.slice(ii, i));
        }
    }
});

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
            if (tile.letter) {
                return tile.letter;
            }

            // if (tile.letterMultiplier > 1) {
            //     return tile.letterMultiplier;
            // }

            // if (tile.wordMultiplier > 1) {
            //     return tile.wordMultiplier;
            // }

            return ' '

        }).map((letter) => letter).join(' | ');
        console.log(lineToPrint)
        console.log('-'.repeat(lineToPrint.length))
    })
}

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

// printBoard()



// console.log(validWord(11, 7, HORIZONTAL))
// console.log(validPrefix(11, 7, HORIZONTAL))

const findAllValidBoardStates = (letters, board) => {
    const executionFrames = [];
    const validBoards = [];

    // first we initialize all the possible starting execution boards
    // for each active tile in the board
    const surroundingTileOffsets = [
        [-1, 0],
        [1, 0],
        [0, 1],
        [0, -1]
    ]
    console.log('building execution boards')
    for (let x = 0; x < board.length; ++x) {
        for (let y = 0; y < board.length; ++y) {
            if (!boardGet(x, y, board)) continue;

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

            const ordinals = [VERTICAL, HORIZONTAL];

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

    console.log('starting execution frame computation', executionFrames.length)
    // handle execution frames
    while (executionFrames.length) {
        console.log('execution frames left', executionFrames.length)
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

    return validBoards
}


const naiveWordScore = (wordInfo, board) => {
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

const calculateFinalScore = (validFrame) => {
    const { board, addedLetters, direction, perpendicularDirection } = validFrame;

    // printBoard(board);

    const wordInfo = findWord(addedLetters[0].x, addedLetters[0].y, direction, board);

    let totalScore = naiveWordScore(wordInfo, board);
    // console.log('score of big word', wordInfo.word, totalScore)

    addedLetters.forEach((letter) => {
        const perpWordInfo = findWord(letter.x, letter.y, perpendicularDirection, board);
        if (perpWordInfo.length == 1) {
            return;
        }

        // console.log('score of word', perpWordInfo.word, naiveWordScore(perpWordInfo, board))

        totalScore += naiveWordScore(perpWordInfo, board);
    });

    return totalScore
}

boardSet(7, 7, 'I', globalBoard, true);
boardSet(8, 7, 'O', globalBoard, true);
boardSet(9, 7, 'N', globalBoard, true);

boardSet(7, 6, 'A', globalBoard, true);
boardSet(8, 6, 'D', globalBoard, true);
boardSet(6, 6, 'G', globalBoard, true);
boardSet(5, 6, 'E', globalBoard, true);

boardSet(8, 8, 'E', globalBoard, true);

boardSet(5, 5, 'B', globalBoard, true);
boardSet(4, 5, 'E', globalBoard, true);
boardSet(3, 5, 'R', globalBoard, true);

boardSet(7, 5, 'L', globalBoard, true);
boardSet(7, 8, 'D', globalBoard, true);

boardSet(7, 4, 'R', globalBoard, true);
boardSet(7, 3, 'E', globalBoard, true);
boardSet(7, 2, 'T', globalBoard, true);
boardSet(7, 1, 'N', globalBoard, true);
boardSet(7, 0, 'I', globalBoard, true);

boardSet(6, 2, 'A', globalBoard, true);
boardSet(8, 2, 'E', globalBoard, true);

boardSet(5, 2, 'C', globalBoard, true);
boardSet(4, 2, 'N', globalBoard, true);
boardSet(3, 2, 'I', globalBoard, true);
boardSet(2, 2, 'Z', globalBoard, true);

boardSet(8, 1, 'A', globalBoard, true);

boardSet(9, 1, 'N', globalBoard, true);
boardSet(9, 2, 'S', globalBoard, true);
boardSet(9, 0, 'U', globalBoard, true);

boardSet(5, 8, 'W', globalBoard, true);
boardSet(6, 8, 'I', globalBoard, true);

boardSet(2, 3, 'A', globalBoard, true);
boardSet(1, 3, 'I', globalBoard, true);
boardSet(3, 3, 'T', globalBoard, true);
boardSet(0, 3, 'F', globalBoard, true);

boardSet(5, 1, 'U', globalBoard, true);
boardSet(5, 3, 'S', globalBoard, true);

boardSet(0, 4, 'L', globalBoard, true);
boardSet(0, 5, 'A', globalBoard, true);
boardSet(0, 6, 'V', globalBoard, true);
boardSet(0, 7, 'O', globalBoard, true);
boardSet(0, 8, 'N', globalBoard, true);
boardSet(0, 9, 'E', globalBoard, true);

boardSet(1, 9, 'T', globalBoard, true);
boardSet(2, 9, 'A', globalBoard, true);

boardSet(2, 10, 'H', globalBoard, true);
boardSet(3, 10, 'E', globalBoard, true);
boardSet(4, 10, 'P', globalBoard, true);
boardSet(5, 10, 'S', globalBoard, true);



printBoard(globalBoard)



prompt('This board good?');
console.log('finding board states')
const validBoards = findAllValidBoardStates('EEPEHQI'.split(''), globalBoard);

console.log(validBoards.length)

console.log('getting scores')
const bestScoreIndexCombo = validBoards.reduce((bestCombo, validFrame, index) => {
    const score = calculateFinalScore(validFrame);
    if (score > bestCombo.score) {
        return { index, score };
    }
    return bestCombo;
}, { score: 0, index: -1 })


console.log(bestScoreIndexCombo)
printBoard(validBoards[bestScoreIndexCombo.index].board)

validBoards[bestScoreIndexCombo.index].addedLetters.forEach((letter) => {
    console.log(`boardSet(${letter.x}, ${letter.y}, '${letter.letter}', globalBoard, true);`)
});
