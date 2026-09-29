const boardGame = document.getElementById("boardgame");

for (i = 0; i < 144; i++) {
    const cell = document.createElement("button");
    cell.className = "cell";
    boardGame.appendChild(cell);
}


