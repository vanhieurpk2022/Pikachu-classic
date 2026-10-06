import findPath from "./DirectionProcessor.js";
import defineGraph, { removeLine } from "./DrawLine.js";
import { createGrid, createBoardGame, initValue } from "./initboard.js";
import { isSameValue, backState, shuffle, clearCells } from "./GameUtils.js";

const COL = 18;
const ROW = 11;
let selected = [];
let value = shuffle(initValue(36, 4));
let arr = null;

const grid = createGrid(ROW, COL, value);
const boardGame = document.getElementById("boardgame");

createBoardGame(grid, boardGame);


// sự kiện khi bấm
boardGame.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");

  if (!cell) return;

  cell.classList.toggle("active");

  selected.push({
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col),
    el: cell
  });

  if (selected.length < 2) return;
  let x = selected[0].row;
  let y = selected[0].col;
  let x2 = selected[1].row;
  let y2 = selected[1].col;

  if (isSameValue(x, y, x2, y2, grid)) {

    arr = findPath(x, y, x2, y2, grid, grid[x][y]);
    if (!arr) return;
    clearCells(x, y, x2, y2, grid);
    defineGraph(arr, boardGame)

    // render lại

  }


  backState(selected);

});




setInterval(() => {
  removeLine(boardGame);
}, 750);
