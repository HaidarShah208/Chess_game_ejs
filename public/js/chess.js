const socket = io();

const chess = new Chess();
const boardElement = document.querySelector(".boardElement");

let playerRole = null;
let draggedPiece = null;
let sourceSquare = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, colindex) => {
      const colElement = document.createElement("div");
      colElement.classList.add(
        "square",
        (rowindex + colindex) % 2 == 0 ? "light" : "dark"
      );

      colElement.dataset.row = rowindex;
      colElement.dataset.col = colindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add("piece");
        
        if (playerRole === 'w') {
          pieceElement.classList.add(square.color === 'w' ? "white" : "black");
        } else if (playerRole === 'b') {
          pieceElement.classList.add(square.color === 'b' ? "white" : "black");
        } else {
          pieceElement.classList.add(square.color === 'w' ? "white" : "black");
        }

        pieceElement.innerText = getPiecesUnicorn(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: colindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });
        colElement.appendChild(pieceElement);
      }

      colElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      colElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: Number(colElement.dataset.row),
            col: Number(colElement.dataset.col),
          };
          handlemove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(colElement);
    });
  });

  if(playerRole === 'b'){
    boardElement.classList.add('flipped')
  }else{
    boardElement.classList.remove('flipped')
  }
};

const handlemove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };
  socket.emit("move", move);
};

socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});
socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});
socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});
socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

const getPiecesUnicorn = (piece) => {
  const unicornPieces = {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
    P: "♟",
    R: "♜",
    N: "♞",
    B: "♝",
    Q: "♛",
    K: "♚",
  };
  return unicornPieces[piece.type] || "";
};

renderBoard();
