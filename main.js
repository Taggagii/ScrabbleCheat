/*
    Scrabble Bot

    It should be able to take in a list of letters and a word list and find all the possible words and then the best one

    Process:
        you have a board, it has some letters already placed on it, we need to find a way to place our letters such that we can build words
        approach: place a letter, find all valid words that could be built using the starting prefix and the remaining letters
        issue: the remaining letters could be more letters on the board
        solution: don't solve by remaining letters on the board or do (more thought here, I'm going to draw a picture)
*/

const { dir } = require('console');
const fs = require('fs');

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

const boardSet = (x, y, value, board) => {
    board[y][x].letter = value.toUpperCase();
}

const boardGet = (x, y, board) => {
    return board[y][x].letter;
}


const printBoard = (board) => {
    board.forEach((line) => {
        const lineToPrint = line.map((tile) => tile.letter).map((letter) => letter || ' ').join(' | ');
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

boardSet(7, 7, 'A', globalBoard);
boardSet(8, 7, 'P', globalBoard);
boardSet(9, 7, 'P', globalBoard);
boardSet(10, 7, 'L', globalBoard);
boardSet(11, 7, 'E', globalBoard);


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
    for (let x = 0; x < board.length; ++x) {
        for (let y = 0; y < board.length; ++y) {
            if (!boardGet(x, y, board)) continue;

            // active tile
            // go to all surrounding tiles
            surroundingTileOffsets.forEach((offsetPair) => {
                const newX = x + offsetPair[0];
                const newY = y + offsetPair[1];

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
                        letters: [...letters.slice(0, letterIndex), ...letters.slice(letterIndex + 1)]
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
                    });
                }
            });
        }
    }

    // handle execution frames
    while (executionFrames.length) {
        const currentFrame = executionFrames.shift()
        const {startingIndex, endingIndex, direction} = currentFrame;
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
                    

                    validBoards.push(structuredClone(tempBoard));
                }

                const wordInfo = findWord(newX, newY, direction, tempBoard);
                executionFrames.push({
                    startingIndex: wordInfo.startingIndex,
                    endingIndex: wordInfo.endingIndex,
                    board: tempBoard,
                    direction,
                    letters: newLetters,
                });
            });
        });
    }

    return validBoards
}

console.log('starting')

printBoard(globalBoard)
const validBoards = findAllValidBoardStates(['I', 'E', 'S'], globalBoard);

console.log(validBoards.length)

// validBoards.forEach((validBoard) => {
//     printBoard(validBoard)
//     console.log()
// })

