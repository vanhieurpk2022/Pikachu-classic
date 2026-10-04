import { createGrid, createBoardGame } from "./initboard.js";
import findPath from "./DirectionProcessor.js";

const COL = 18;
const ROW = 11;


let selected = [{ row: 1, col: 4 }, { row: 1, col: 8 }];
const boardGame = document.getElementById("boardgame");
const grid = createGrid(ROW, COL);
createBoardGame(grid, boardGame);
grid[1][5] = 3;
grid[1][3] = 3;
grid[1][6] = 3;
grid[1][7] = 3;
grid[2][4] = 3;


// sự kiện khi bấm
// boardGame.addEventListener("click", (e) => {
//   const cell = e.target.closest(".cell");
//   if (!cell) return;
//   cell.classList.toggle("active");
//   selected.push({
//     row: Number(cell.dataset.row),
//     col: Number(cell.dataset.col),
//     el: cell
//   }); if (selected.length > 1) {
//     console.log(defineGraph(selected))
//     backState(selected);
//   }
// });

// reset state, clean select arr
function backState(list) {
  list.forEach(item => {
    item.el.classList.remove("active")
  });
  selected.length = 0;
}


// setInterval(() => {
//   console.log(re);
// }, 5000);
