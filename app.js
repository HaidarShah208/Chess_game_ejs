const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let player = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (uniquesocket) => {
  console.log("connected");
  if (!player.white) {
    player.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
  } else if (!player.black) {
    player.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("spectatorRole");
  }



  uniquesocket.on("disconnect", function () {
    if (uniquesocket.id === player.white) {
      delete player.white;
    } else if (uniquesocket.id === player.black) {
      delete player.black;
    }
  });



  uniquesocket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && uniquesocket.id !== player.white) return;
      if (chess.turn() === "b" && uniquesocket.id !== player.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("invalid move", move);
        uniquesocket.emit("invalid move", move);
      }
    } catch (err) {
      console.log("invalid move", move);
      uniquesocket.emit("invalid move", move);
    }
  });
});

server.listen(3000, function () {
  console.log("server listening on port 3000");
});
