const COL = 16;
const ROW = 9;

const grid = Array.from({ length: ROW }, () => Array(COL).fill(0));

let selected = [];

const boardGame = document.getElementById("boardgame");

for (i = 0; i < grid.length; i++) {
  for (j = 0; j < grid[0].length; j++) {
    const create_element = document.createElement("button");
    create_element.className = "cell border-0 p-2";
    create_element.dataset.row = i;
    create_element.dataset.col = j;
    boardGame.appendChild(create_element);
  }
}

// sự kiện khi bấm
boardGame.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  cell.classList.toggle("active");
  selected.push({ row: cell.dataset.row, col: cell.dataset.col, el: cell });
  if (selected.length >= 1) {
    backState(selected);
  }
});

// reset state, clean select arr
function backState(list) {
  const cell = list.el;
  cell.classList.toggle("active");
  selected.length = 0;
}

setInterval(() => {
  console.log(selected);
}, 5000);
