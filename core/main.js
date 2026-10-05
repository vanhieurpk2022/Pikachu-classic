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

  if (isSameValue(selected[0].row, selected[0].col, selected[1].row, selected[1].col, grid)) {

    arr = findPath(selected[0].row, selected[0].col, selected[1].row, selected[1].col, grid);
    console.log(arr);
    if (!arr) return;
    clearCells(selected[0].row, selected[0].col, selected[1].row, selected[1].col, grid);

    defineGraph(arr, boardGame)
  }


  backState(selected);

});




setInterval(() => {
  removeLine(boardGame);
}, 750);
