import { findPath } from "./DirectionProcessor.js";
import defineGraph, { removeLine } from "./DrawLine.js";
import { createGrid, createBoardGame, initValue } from "./initboard.js";
import { isSameValue, backState, shuffle, clearCells, render, shuffeMiddleGame, renderImages, hint, checkShuffle, checkWinner, showResultPopup } from "./GameUtils.js";

const COL = 18;
const ROW = 11;
let selected = [];
let value = shuffle(initValue(36, 4));
let arr = null;
let winner = false;

const grid = createGrid(ROW, COL, value);
let overTimer = false;
const boardGame = document.getElementById("boardgame");
const maingame = document.getElementById("maingame");
createBoardGame(ROW, COL, grid, boardGame, 50, 50);
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

// Grid game
boardGame.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell || cell.classList.contains("empty")) return;
  if (cell.classList.contains("active")) return;

  cell.classList.add("active");
  selected.push({
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col),
    el: cell,
  });

  if (selected.length < 2) return;

  const [a, b] = selected;

  if (isSameValue(a.row, a.col, b.row, b.col, grid)) {
    const path = findPath(a.row, a.col, b.row, b.col, grid, grid[a.row][a.col]);
    if (path) {
      clearCells(a.row, a.col, b.row, b.col, grid);
      defineGraph(path, boardGame);

      setTimeout(() => {
        removeLine(boardGame);
        render(grid, boardGame);
        checkShuffle(grid);
        renderImages(grid, boardGame);
      }, 350);
    }
  }
  backState(selected);
  winner = checkWinner(grid);

  if (winner) {
    showResultPopup(true, maingame);
  }


  // thêm tính năng
  switch (mode) {
    case "1":

      break;


  }

});

// hint
const getHint = document.getElementById("hint");
let hintTimer = null;

getHint.addEventListener("click", () => {
  const path = hint(grid);
  if (!path || path.length < 2) return;

  clearTimeout(hintTimer);
  boardGame.querySelectorAll(".hint").forEach(c => c.classList.remove("hint"));

  const ends = [path[0], path[path.length - 1]];

  const cells = ends
    .map(p => boardGame.querySelector(`[data-row="${p.row}"][data-col="${p.col}"]`))
    .filter(Boolean);

  cells.forEach(c => c.classList.add("hint"));

  hintTimer = setTimeout(() => {
    cells.forEach(c => c.classList.remove("hint"));
  }, 3000);
});

// shuffle
const getShuffle = document.getElementById("shuffle");
getShuffle.addEventListener("click", () => {
  shuffeMiddleGame(grid);
  renderImages(grid, boardGame);
})

const progress = document.querySelector(".progress");
const bar = progress.querySelector(".progress-bar");

function setProgress(percent) {
  bar.style.width = percent + "%";
  progress.setAttribute("aria-valuenow", Math.round(percent));
}

function caculateTime(sec) {
  const minutes = String(Math.floor(sec / 60)).padStart(2, "0");
  const seconds = String(sec % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const timerPlay = 20 * 60;
const numberOfTime = document.getElementById("timeplay");
let elapse = 0;
setProgress(100);
// timer
const timer = setInterval(() => {
  elapse++;
  const timePercent = 100 - (elapse / timerPlay) * 100;
  setProgress(Math.max(timePercent, 0));
  numberOfTime.textContent = caculateTime(timerPlay - elapse);
  if (elapse >= timerPlay) {
    overTimer = true;
    clearTimeout(timer);
  }
  if (overTimer) {
    showResultPopup(false, maingame);
  }

}, 1000);

