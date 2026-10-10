import { findPath } from "./directionProcessor.js";
import defineGraph, { removeLine } from "./drawLine.js";
import { createGrid, createBoardGame, initValue, boardGameLevel } from "./initBoard.js";
import { isSameValue, backState, shuffle, clearCells, render, shuffeMiddleGame, renderImages, hint, checkShuffle, checkWinner, showResultPopup } from "./gameUtils.js";
import { blockGravity } from "./level.js";

const COL = 18;
const ROW = 11;
let selected = [];
let value = shuffle(initValue(36, 4));
let arr = null;
let winner = false;
let overTimer = false;

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const boardGame = document.getElementById("boardgame");
const maingame = document.getElementById("maingame");


const grid = createGrid(ROW, COL, value);
if (mode === "3") {
  boardGameLevel(ROW, COL, grid, boardGame, 50, 50);
} else {
  createBoardGame(ROW, COL, grid, boardGame, 50, 50);
}

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
    let path = null;
    if (mode === '3') {
      path = findPath(a.row, a.col, b.row, b.col, grid, grid[a.row][a.col], mode);
    } else {
      path = findPath(a.row, a.col, b.row, b.col, grid, grid[a.row][a.col], "1");
    }

    if (path) {
      clearCells(a.row, a.col, b.row, b.col, grid);
      defineGraph(path, boardGame);


      setTimeout(() => {
        removeLine(boardGame);
        render(grid, boardGame);
        checkShuffle(grid, mode);
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
    case "2":
      blockGravity(grid);
      break;
    case "3":
      blockGravity(grid);
      break;


  }
});

// hint
const getHint = document.getElementById("hint");
let hintTimer = null;

getHint.addEventListener("click", () => {
  const path = hint(grid, mode);
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


// timer
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

