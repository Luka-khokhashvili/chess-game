// 'app.js' script file for the chess game made by luka khokhashvili 

// ----------------->
/* table of content {
    1. Constants
    2. Initial configuration of the chessboard
    3. Function to create the chessboard
    4. Initialize the chessboard
    5. drag-and-drop functionality event listeners
    6. drag start Function
    7. drag over Function
    8. drag drop Function
    9. Function to check if a move is valid
    10. Function to check if a piece is an opponent's piece
    11. Function to change the current player
    12. Function to reverse square IDs
    13. Function to revert square IDs
    14. Function to check for a win condition
    15. Function to disable draggable for all squares
   } */
// ---------------->



// Constants 
const gameboard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const winDisplay = document.querySelector('#win-display');
const width = 8;
let playerGo = 'black';
playerDisplay.textContent = 'black';

// Initial configuration of the chessboard
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook
];

// Function to create the chessboard
function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = startPiece;
        square.firstChild?.setAttribute('draggable', true);
        square.setAttribute('square-id', i);
        const row = Math.floor((63 - i) / 8) + 1;
        if(row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? "charcoal-grey" : "copper");
        } else {
            square.classList.add(i % 2 === 0 ? "copper" : "charcoal-grey");
        }

        if(i <= 15) {
            square.firstChild.firstChild.classList.add('black');
        }
        if(i >= 48) {
            square.firstChild.firstChild.classList.add('white');
        }
        gameboard.append(square);
    })
}

// Initialize the chessboard
createBoard();

// Add event listeners for drag-and-drop functionality
const allSquares = document.querySelectorAll(".square");

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('drop', dragDrop);
})

let startPositionId;
let draggedElement;

// Function to handle drag start
function dragStart(e) {
    startPositionId = e.target.parentNode.getAttribute('square-id');
    draggedElement = e.target;
}

// Function to handle drag over
function dragOver(e) {
    e.preventDefault();

}

// Function to handle drag drop
function dragDrop(e) {
    e.stopPropagation();
    const correctGo = draggedElement.firstChild.classList.contains(playerGo);
    const taken = e.target.classList.contains('piece');
    const valid = checkIfValid(draggedElement.id, Number(startPositionId), Number(e.target.getAttribute('square-id')) || Number(e.target.parentNode.getAttribute('square-id')));
    const opponentGo = playerGo === "white" ? "black" : "white";
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo);

    if(correctGo) {
        if(takenByOpponent && valid) {
            e.target.parentNode.append(draggedElement);
            e.target.remove();
            checkForWin();
            changePlayer();
            return;
        }

        if(taken && !takenByOpponent) {
            infoDisplay.textContent = "you cannot go here!";
            setTimeout(() => infoDisplay.textContent = "", 2000);
            return;
        }

        if(valid) {
            e.target.append(draggedElement);
            checkForWin();
            changePlayer();
            return;
        }
    }
}

// Function to check if a move is valid
function checkIfValid(piece, startId, targetId) {
    const dx = Math.abs(targetId % 8 - startId % 8);
    const dy = Math.abs(Math.floor(targetId / 8) - Math.floor(startId / 8));
    const deltaX = targetId % 8 - startId % 8;
    const deltaY = Math.floor(targetId / 8) - Math.floor(startId / 8);
    const targetSquare = document.querySelector(`[square-id="${targetId}"]`);
    const pieceInTarget = targetSquare.firstChild;

    switch (piece) {
        // Pawn movement handler
        case 'pawn':
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15];
            const forwardOne = startId + width;
            const forwardTwo = startId + width * 2;

            if (
                (starterRow.includes(startId) && forwardTwo === targetId && !pieceInTarget) ||
                (forwardOne === targetId && !pieceInTarget) ||
                (forwardOne + 1 === targetId && pieceInTarget) ||
                (forwardOne - 1 === targetId && pieceInTarget)
            ) {
                return true;
            }
            break;

        // knight movement handler
        case 'knight':
            if (
                (dx === 1 && dy === 2) ||
                (dx === 2 && dy === 1)
            ) {
                if (!pieceInTarget || isOpponentPiece(pieceInTarget)) {
                    return true;
                }
                return true;
            }
            break;

        // bishop movement handler
        case 'bishop':
            if (dx === dy && !isOccupiedBetween(startId, targetId)) {
                return true;
            }
            break;

        // rook movement handler
        case 'rook':
            if (
                (deltaX === 0 || deltaY === 0) &&
                !isOccupiedBetween(startId, targetId)
            ) {
                return true;
            }
            break;

        // queen movement handler
        case 'queen':
            if (
                (dx === dy && !isOccupiedBetween(startId, targetId)) ||
                (deltaX === 0 || deltaY === 0) &&
                !isOccupiedBetween(startId, targetId)
            ) {
                return true;
            }
            break;

        // king movement handler
        case 'king':
            if (dx <= 1 && dy <= 1) {
                return true;
            }
            break;
        
        // default preset
        default:
            return false;
    }

    return false;
}

// Function to check if a piece is an opponent's piece
function isOccupiedBetween(startId, targetId) {
    const minX = Math.min(targetId % 8, startId % 8) + 1;
    const minY = Math.min(Math.floor(targetId / 8), Math.floor(startId / 8)) + 1;
    const maxX = Math.max(targetId % 8, startId % 8);
    const maxY = Math.max(Math.floor(targetId / 8), Math.floor(startId / 8));

    for (let x = minX, y = minY; x < maxX && y < maxY; x++, y++) {
        const square = document.querySelector(`[square-id="${x + y * 8}"]`);
        if (square && square.firstChild) {
            return true; // There's a piece between start and target
        }
    }

    return false; // No pieces between start and target
}

// Function to change the current player
function changePlayer() {
    if(playerGo === "black") {
        reverseIds();
        playerGo = "white";
        playerDisplay.textContent = 'white';
    } else {
        revertIds();
        playerGo = "black";
        playerDisplay.textContent = 'black';
    }
}

// Function to reverse square IDs
function reverseIds() {
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach((square, i) => 
        square.setAttribute('square-id', (width * width - 1) - i));
}

// Function to revert square IDs
function revertIds() {
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach((square, i) => square.setAttribute('square-id', i));
}

// Function to check for a win condition
function checkForWin() {
    const kings = Array.from(document.querySelectorAll('#king'));
    if(!kings.some(king => king.firstChild.classList.contains('white'))) {
        winDisplay.innerHTML = "Black Player Wins!";
        disableDraggable();
    }
    if(!kings.some(king => king.firstChild.classList.contains('black'))) {
        winDisplay.innerHTML = "White Player Wins!";
        disableDraggable();
    }
}

// Function to disable draggable for all squares
function disableDraggable() {
    const allSquares = document.querySelectorAll('.square');
    allSquares.forEach(square => {
        if (square.firstChild) {
            square.firstChild.setAttribute('draggable', false);
        }
    });
}
