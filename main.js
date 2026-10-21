const COL = 18;
const ROW = 11;
const gameMode = {
  mode: 1,
};
let timer = null;
let onBoardClick = null;
let onHintClick = null;
let onShuffleClick = null;

const getHtml = document.getElementById("result-overlay");

function whenGameStart() {

  const boardGame = document.getElementById("boardgame");
  const maingame = document.getElementById("maingame");


  // shuffle
  const getShuffle = document.getElementById("shuffle");
  const getHint = document.getElementById("hint");
  const progress = document.querySelector(".progress");
  const bar = progress.querySelector(".progress-bar");


  if (!getHtml.classList.contains("d-none")) {
    getHtml.classList.add("d-none");
  }
  boardGame.innerHTML = "";
  boardGame.removeEventListener("click", onBoardClick);
  getHint.removeEventListener("click", onHintClick);
  getShuffle.removeEventListener("click", onShuffleClick);
  clearInterval(timer);



  let selected = [];
  let value = shuffle(initValue(36, 4));
  let winner = false;
  const grid = createGrid(ROW, COL, value);

  createBoardGame(ROW, COL, grid, boardGame, 50, 50, gameMode.mode);

  // Grid game
  onBoardClick = (e) => {
    const cell = e.target.closest(".cell");
    if (!cell || cell.classList.contains("empty")) return;
    if (cell.classList.contains("active")) return;

    cell.classList.add("active");
    const item = {
      row: Number(cell.dataset.row),
      col: Number(cell.dataset.col),
      el: cell,
    };
    selected.push(item);

    if (gameMode.mode === 4) {
      showImage(item.row, item.col, grid, boardGame);
    }

    if (selected.length < 2) return;
    const [a, b] = selected;
    if (isSameValue(a.row, a.col, b.row, b.col, grid)) {
      let path = null;
      if (gameMode.mode === 3) {
        path = findPath(a.row, a.col, b.row, b.col, grid, grid[a.row][a.col], gameMode.mode);
      } else {
        path = findPath(a.row, a.col, b.row, b.col, grid, grid[a.row][a.col], "1");
      }

      if (path) {
        clearCells(a.row, a.col, b.row, b.col, grid);
        defineGraph(path, boardGame);


        setTimeout(() => {

          switch (gameMode.mode) {

            case 4:
              removeLine(boardGame);
              render(grid, boardGame);
              checkShuffle(grid, gameMode.mode);
              break;

            default:
              removeLine(boardGame);
              render(grid, boardGame);
              checkShuffle(grid, gameMode.mode);
              renderImages(grid, boardGame);
              break;

          }

        }, 350);
      }
    } else {
      if (gameMode.mode === 4) {
        setTimeout(() => {
          hideImage(a.row, a.col, boardGame);
          hideImage(b.row, b.col, boardGame);
        }, 600);
      }
    }

    backState(selected);
    winner = checkWinner(grid);

    if (winner) {
      clearInterval(timer);
      popUpShowWinner(gameMode.mode, true, getHtml);
    }


    // thêm tính năng
    switch (gameMode.mode) {
      case 2:
        blockGravity(grid);
        break;
      case 3:
        blockGravity(grid);
        break;


    }
  };

  boardGame.addEventListener("click", onBoardClick);

  // hint
  let hintTimer = null;

  onHintClick = () => {
    const path = hint(grid, gameMode.mode);
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
  };
  getHint.addEventListener("click", onHintClick);



  onShuffleClick = () => {
    shuffeMiddleGame(grid);

    switch (gameMode.mode) {
      case 4:
        selected.forEach(p => { hideImage(p.row, p.col, boardGame) });
        backState(selected);

        break;

      default:
        backState(selected);
        break;
    }
    renderImages(grid, boardGame, gameMode.mode);


  };
  getShuffle.addEventListener("click", onShuffleClick);


  // timer

  function setProgress(percent) {
    bar.style.width = percent + "%";
    progress.setAttribute("aria-valuenow", Math.round(percent));
  }

  function caculateTime(sec) {
    const minutes = String(Math.floor(sec / 60)).padStart(2, "0");
    const seconds = String(sec % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  const timerPlay = 8 * 60;
  const numberOfTime = document.getElementById("timeplay");
  let elapse = 0;
  setProgress(100);


  timer = setInterval(() => {
    elapse++;
    const timePercent = 100 - (elapse / timerPlay) * 100;
    setProgress(Math.max(timePercent, 0));
    numberOfTime.textContent = caculateTime(timerPlay - elapse);
    if (elapse >= timerPlay) {
      popUpShowWinner(gameMode.mode, false, getHtml);
    }


  }, 1000);

}








// chuyển màn hình
const SCREENS = ["screen-home", "screen-level", "screen-game"];

function showScreen(id, mode) {
  SCREENS.forEach(screenId => {
    const el = document.getElementById(screenId);
    el.classList.toggle("d-none", screenId !== id);
  });
  if (mode !== undefined) {
    gameMode.mode = Number(mode);
    whenGameStart();
  }

  if (!getHtml.classList.contains("d-none")) {
    getHtml.classList.add("d-none");
  }
}


//  Chế độ cho các độ khó khác

function blockGravity(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  for (let j = 1; j < cols - 1; j++) {
    const stack = [];
    for (let i = 1; i < rows - 1; i++) {
      if (grid[i][j] !== 0) {
        stack.push(grid[i][j]);
      }
    }
    for (let i = rows - 2; i >= 1; i--) {
      grid[i][j] = stack.length > 0 ? stack.pop() : 0;
    }
  }
}

// Khởi tạo Menu game 
function createBoardGame(row, col, grid, id, sizeRow, sizeCol, mode) {
  id.style.display = "grid";
  id.style.gap = "2px";
  id.style.width = "max-content";
  id.style.margin = "0 auto";
  id.style.gridTemplateColumns = `repeat(${col},${sizeCol}px)`;
  id.style.gridTemplateRows = `repeat(${row},${sizeRow}px)`;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const create_element = document.createElement("button");
      create_element.dataset.row = i;
      create_element.dataset.col = j;


      if (grid[i][j] !== -1) {
        create_element.className = "cell position-relative";
        if (mode === 4) {
          create_element.style.backgroundColor = `#FFF")`;
        } else {
          create_element.style.backgroundImage = `url("./Resources/pieces${grid[i][j]}.png")`;
        }
      } else if (grid[i][j] == -1) {
        create_element.className = "cell empty position-relative visible bg-transparent border-0 user-select-none";

        if (mode === 3) {
          create_element.style.backgroundImage = `url("./Resources/tile.jpg")`;

        }

        create_element.disabled = true;

      }
      id.appendChild(create_element);
    }
  }
}

// khởi tạo game Level 4
function initGameLevel4(grid, board) {


  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] != -1) {
        const create_element = document.createElement("button");
        create_element.className = "cell position-relative";
        create_element.dataset.row = i;
        create_element.dataset.col = j;
        create_element.style.backgroundColor = "#FFF"
        board.appendChild(create_element);
      }

    }
  }
}

function showImage(row, col, grid, board) {
  const button = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!button) return;
  button.style.backgroundImage = `url("./Resources/pieces${grid[row][col]}.png")`;
}

function hideImage(row, col, board) {
  const button = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  button.style.backgroundImage = '';
  button.style.backgroundColor = "#FFF"
}

function initValue(sizeElement, loop) {
  let value = [];
  for (let i = 1; i < sizeElement + 1; i++) {
    for (let j = 0; j < loop; j++) {
      value.push(i)
    }
  }
  return value;
}

function createGrid(row, col, arr) {
  let items = [];
  for (let i = 0; i < row; i++) {
    items[i] = [];
    for (let j = 0; j < col; j++) {
      if (i === 0 || j === 0 || i === row - 1 || j === col - 1) {
        items[i][j] = -1;
      } else {
        items[i][j] = arr.pop();
      }
    }
  }
  return items;
}


function boardGameLevel(row, col, grid, id, sizeRow, sizeCol) {
  id.style.display = "grid";
  id.style.gap = "2px";
  id.style.width = "max-content";
  id.style.margin = "0 auto";
  id.style.gridTemplateColumns = `repeat(${col},${sizeCol}px)`;
  id.style.gridTemplateRows = `repeat(${row},${sizeRow}px)`;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] != -1) {
        const create_element = document.createElement("button");
        create_element.className = "cell position-relative";
        create_element.dataset.row = i;
        create_element.dataset.col = j;
        create_element.style.backgroundImage = `url("./Resources/pieces${grid[i][j]}.png")`;
        id.appendChild(create_element);
      } else if (grid[i][j] === -1) {
        const create_element = document.createElement("button");
        create_element.className = "cell empty position-relative visible bg-transparent border-0 user-select-none";
        create_element.dataset.row = i;
        create_element.dataset.col = j;
        create_element.disabled = true;
        create_element.style.backgroundImage = `url("./Resources/tile.jpg")`;
        id.appendChild(create_element);
      }

    }
  }
}


// Game Utils

function shuffle(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let j = Math.floor(Math.random() * (arr.length - i));

    let tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;

  }

  return arr;
}
function isSameValue(row, col, targetRow, targetCol, grid) {
  return (grid[row][col] === grid[targetRow][targetCol]);
}

// reset state, clean select arr
function backState(list) {
  list.forEach(item => {
    item.el.classList.remove("active")
  });
  list.length = 0;
}

function clearCells(row, col, targetRow, targetCol, grid) {

  grid[row][col] = 0;
  grid[targetRow][targetCol] = 0;
}

function render(grid, board) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] !== 0) continue;

      const cell = board.querySelector(`[data-row="${i}"][data-col="${j}"]`);
      if (!cell) continue;
      cell.style.backgroundImage = "";
      cell.classList.add("empty", "bg-transparent", "border-0");
      cell.disabled = true;
    }
  }
}

function shuffeMiddleGame(grid) {
  const position = [];
  const values = [];

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] > 0) {
        position.push({ i, j });
        values.push(grid[i][j]);
      }
    }
  }

  for (let k = values.length - 1; k > 0; k--) {
    const rd = Math.floor(Math.random() * (k + 1));
    [values[k], values[rd]] = [values[rd], values[k]];
  }

  position.forEach(({ i, j }, idx) => {
    grid[i][j] = values[idx];

  })
}


function renderImages(grid, board, mode) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == -1 || grid[i][j] == 0) continue;
      const cell = board.querySelector(`[data-row="${i}"][data-col="${j}"]`);
      if (mode === 4) {
        if (cell) cell.style.backgroundImage = `#FFF`;

      } else {
        if (cell) cell.style.backgroundImage = `url("./Resources/pieces${grid[i][j]}.png")`;

      }
    }
  }
}

function hint(grid, mode) {
  const pieces = [];


  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] > 0) {
        pieces.push({ row: i, col: j, type: grid[i][j] });
      }
    }
  }

  // vét hết các đường
  for (let a = 0; a < pieces.length; a++) {
    for (let b = a + 1; b < pieces.length; b++) {
      const p1 = pieces[a];
      const p2 = pieces[b];

      if (p1.type !== p2.type) continue;
      let re = null;
      if (mode === 3) {
        re = findPath(p1.row, p1.col, p2.row, p2.col, grid, p1.type, mode);
      } else {
        re = findPath(p1.row, p1.col, p2.row, p2.col, grid, p1.type);
      }
      if (re) {
        return re;
      }
    }
  }

  return null;
}


function hasValidMove(grid, mode) {
  const pieces = [];


  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] > 0) {
        pieces.push({ row: i, col: j, type: grid[i][j] });
      }
    }
  }

  // vét hết các đường
  for (let a = 0; a < pieces.length; a++) {
    for (let b = a + 1; b < pieces.length; b++) {
      const p1 = pieces[a];
      const p2 = pieces[b];

      if (p1.type !== p2.type) continue;
      let path = null;
      if (mode === 3) {
        let path = findPath(p1.row, p1.col, p2.row, p2.col, grid, p1.type, mode);
        if (path) {
          return true;
        }
      } else {
        path = findPath(p1.row, p1.col, p2.row, p2.col, grid, p1.type);
        if (path) {
          return true;
        }
      }

    }
  }

  return false;
}

function checkShuffle(grid, mode) {
  let tries = 0;
  const MAX_TRIES = 100;

  while (!hasValidMove(grid, mode) && tries < MAX_TRIES) {
    shuffeMiddleGame(grid);
    tries++;
  }

}


function checkWinner(grid) {
  for (const i of grid) {
    for (const j of i) {
      if (j > 0) {
        return false;
      }
    }
  }
  return true;
}



// Các sự kiện liên quan đến vẽ

function dirTo(x, y) {
  if (x.row > y.row) return "up";
  if (x.row < y.row) return "down";
  if (x.col > y.col) return "left";
  return "right";
}

function addSeg(button, dir) {
  const seg = document.createElement("div");
  seg.className = "seg " + dir;
  button.appendChild(seg);
}

function defineGraph(arr, parent) {
  for (let i = 0; i < arr.length; i++) {
    const p = arr[i];

    const button = parent.querySelector(
      `[data-row="${p.row}"][data-col="${p.col}"]`
    );
    if (!button) continue;

    // vẽ vạch đằng sau
    if (i > 0) {
      const prev = arr[i - 1];
      addSeg(button, dirTo(p, prev));
    }

    // vẽ vạch đằng trước
    if (i < arr.length - 1) {
      const next = arr[i + 1];
      addSeg(button, dirTo(p, next));
    }
  }
}

function removeLine(parent) {
  parent.querySelectorAll(".seg").forEach(s => s.remove());
}

function popUpShowWinner(curLevel, isWinner, getHtml) {
  const curBtn = () => showScreen('screen-game', `${Number(curLevel)}`);
  const nextBtn = () => showScreen('screen-game', `${Number(curLevel) + 1}`);
  const back = () => showScreen('screen-level');

  getHtml.classList.remove("d-none");
  getHtml.innerHTML = `
      <div class="bg-warning border border-dark border-3 text-center p-4" style="width: 500px; max-width: 90vw; min-height: 450px; border-radius: 28px; font-family: 'Patrick Hand', sans-serif;">
        <h3 id="title-winner" class="mb-5" style="font-size: 48px;">${isWinner ? "Chúc mừng bạn đã chiến thằng" : "Bạn đã thất bại"}</h3>
            ${isWinner ? `<button id="btn-next" class="btn btn-link text-dark text-decoration-none d-block mx-auto fs-4">Màn tiếp theo</button>` : ""}

        <!-- cần gắn sự kiện quay lại màn -->
        <button id="btn-replay-menu" class="btn btn-link text-dark text-decoration-none d-block mx-auto fs-4" >Chơi lại</button>
        <button id="btn-back-menu" class="btn btn-link text-dark text-decoration-none d-block mx-auto fs-4">Quay lại</button>
      </div>
  `
  getHtml.querySelector("#btn-replay-menu").addEventListener("click", curBtn);
  getHtml.querySelector("#btn-back-menu").addEventListener("click", back)
  getHtml.querySelector("#btn-next")?.addEventListener("click", nextBtn)
  clearInterval(timer);
}


// Core xử lí

// giá trị 0: không có vật cản
const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: -1 }
]
function findPath(startRow, startCol, targetRow, targetCol, grid, value, mode) {
  const queue = [createInitialState(startRow, startCol)];
  while (queue.length > 0) {
    const current = queue.shift();
    if (isTarget(current, targetRow, targetCol)) {
      return current.path;
    }
    const nextStates = getNextStates(current, grid, value, mode);

    for (const state of nextStates) {
      queue.push(state);
    }
  }

  return null;
}

function createInitialState(row, col) {
  return {
    row,
    col,
    turn: 0,
    direction: null,
    path: [
      { row, col }
    ]
  }
}

function isTarget(state, targetRow, targetCol) {
  return (state.row === targetRow && state.col === targetCol);
}

function getNextStates(current, grid, value, mode) {
  const states = [];
  for (const direction of DIRECTIONS) {

    const nextRow = current.row + direction.row;
    const nextCol = current.col + direction.col;


    if (!checkEdge(nextRow, nextCol, grid)) {
      continue;
    }

    if (!aroundEmpty(nextRow, nextCol, grid, value, mode)) {
      continue;
    }

    const turn = calculateTurn(current.direction, direction, current.turn);

    if (turn > 2) {
      continue;
    }

    states.push({
      row: nextRow,
      col: nextCol,
      turn,
      direction,
      path: [
        ...current.path,
        {
          row: nextRow,
          col: nextCol
        }
      ]
    });
  }

  return states;
}

function calculateTurn(currentDirection, nextDirection, currentTurn) {
  if (currentDirection === null) {
    return currentTurn;
  }

  const isSameDirection = currentDirection.row === nextDirection.row
    && currentDirection.col === nextDirection.col;

  if (isSameDirection) {
    return currentTurn;
  }

  return currentTurn + 1;
}


function checkEdge(x, y, grid) {
  return x >= 0 && x < grid.length && y >= 0 && y < grid[0].length;
}

function aroundEmpty(x, y, grid, value, mode) {
  if (mode === 3) {
    return grid[x][y] == 0 || grid[x][y] == value;
  }
  return grid[x][y] == 0 || grid[x][y] == -1 || grid[x][y] == value;
}
