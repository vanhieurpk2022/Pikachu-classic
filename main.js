const COL = 18;
const ROW = 11;
const gameMode = {
  mode: 1,
};
let timer = null;
let onBoardClick = null;
let onHintClick = null;
let onShuffleClick = null;
let renderTimer = null;
let forward = null;
let lazerTimer = null;
let lazerStopTimer = null;
let lazerNextTimer = null;
let useTime = false;
let busy = false;
let bossAttackTimer = null;
let lazerFireTimer = null;
let damgeBoss = null;
let hpBoss = 100;
let COMBO_TIMES = 5000;
let getCombo = null;
let combo = null;
let hpPlayer = 100;
let rd = null;
const BASE_DAMGE = 5;
const getHtml = document.getElementById("result-overlay");
const stage = document.getElementById('stage');
const progress = document.querySelector(".progress");
const bar = progress.querySelector(".progress-bar");
const progress_boss = document.getElementById("progress-boss");
const bar_boss = document.getElementById("bar-timer");
const bonusMess = document.getElementById("bonus");
const randIn = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
let BONUS_POINT = {
  heath: randIn(0, 10),
  dame: randIn(0, 10)
}
function whenGameStart() {
  const boardGame = document.getElementById("boardgame");


  // shuffle
  const getShuffle = document.getElementById("shuffle");
  const getHint = document.getElementById("hint");

  const boss = document.getElementById('boss');
  const sprite = document.getElementById('sprite');
  const shakeBox = document.getElementById('screen-game');


  if (!getHtml.classList.contains("d-none")) {
    getHtml.classList.add("d-none");
  }
  boardGame.innerHTML = "";
  boardGame.removeEventListener("click", onBoardClick);
  getHint.removeEventListener("click", onHintClick);
  getShuffle.removeEventListener("click", onShuffleClick);
  clearInterval(timer);
  stopLevel4Timer();
  stopLevel5Timer();
  stopAllTimers();
  hpPlayer = 100;
  hpBoss = 100;

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

    if (!useTime) {
      if (gameMode.mode === 4) {
        showImage(item.row, item.col, grid, boardGame);
      }
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

        if (gameMode.mode === 6) {
          addCombo();
          let dmg = BASE_DAMGE + Math.min(combo, 3);

          if (Math.random() > 0.5) {
            dmg = dmg + BONUS_POINT.dame;
            hpPlayer = Math.min(hpPlayer + BONUS_POINT.heath, 100);
            setProgress(hpPlayer);
          }
          hpBoss = hpBoss - dmg;
          if (hpBoss < 0) {
            stopAllTimers();
            popUpShowWinner(gameMode.mode, true, getHtml);
          }
          hitBoss(sprite);
          setProgressBoss(hpBoss);

        }
      }

    } else {
      if (gameMode.mode === 4) {
        if (!useTime) {
          setTimeout(() => {
            hideImage(a.row, a.col, boardGame);
            hideImage(b.row, b.col, boardGame);
          }, 600);
        }

      }
    }

    backState(selected);
    winner = checkWinner(grid);

    if (winner) {
      if (gameMode.mode === 5) {
        stopLevel5Timer();
      } else if (gameMode.mode === 4) {
        stopLevel4Timer();
      }

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
      case 4:
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
        if (useTime) { // đảo lại lấy mặt úp
          selected.forEach(p => { hideImage(p.row, p.col, boardGame) });
          backState(selected);
          renderImages(grid, boardGame);
        } else {
          // Đảo lại lấy mặt bình thường
          renderImages(grid, boardGame, gameMode.mode);

        }

        break;

      default:
        backState(selected);
        renderImages(grid, boardGame, gameMode.mode);
        break;
    }


  };
  getShuffle.addEventListener("click", onShuffleClick);






  let timerPlay = 8 * 60;
  const numberOfTime = document.getElementById("timeplay");
  let elapse = 0;
  setProgress(100);
  if (gameMode.mode === 6) {
    numberOfTime.textContent = "";

    randomTimeAttck(shakeBox, boss, sprite, stage, grid, boardGame, gameMode.mode);
    sprite.addEventListener('animationend', resetAnimationBoss);

  } else {
    numberOfTime.textContent = caculateTime(timerPlay - elapse);
    timer = setInterval(() => {
      elapse++;
      const timePercent = 100 - (elapse / timerPlay) * 100;
      setProgress(Math.max(timePercent, 0));
      numberOfTime.textContent = caculateTime(timerPlay - elapse);
      if (elapse >= timerPlay) {
        if (gameMode.mode === 5) {
          stopLevel5Timer();
        }
        popUpShowWinner(gameMode.mode, false, getHtml);
      }

    }, 1000);
  }



  if (gameMode.mode === 4) {
    startLevel4Timer(grid, boardGame, gameMode.mode, selected);
  } else if (gameMode.mode === 5) {
    startLevel5Timer(ROW, COL, grid, boardGame);
  }

}

// End Function WhenStart();

function caculateTime(sec) {
  const minutes = String(Math.floor(sec / 60)).padStart(2, "0");
  const seconds = String(sec % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function setProgress(percent) {
  bar.style.width = percent + "%";
  progress.setAttribute("aria-valuenow", Math.round(percent));
}
function setProgressBoss(percent) {
  bar_boss.style.width = percent + "%";
  progress_boss.setAttribute("aria-valuenow", Math.round(percent));
}

function startLevel5Timer(row, col, grid, boardgame) {
  stopLevel5Timer();

  const minRow = 1, maxRow = row - 2;
  const minCol = 1, maxCol = col - 2;

  let curRow = randIn(minRow, maxRow);
  let curCol = randIn(minCol, maxCol);
  drawLazer(curRow, curCol, grid);

  lazerTimer = setInterval(() => {
    let r, c;
    do {
      r = randIn(minRow, maxRow);
      c = randIn(minCol, maxCol);
    } while (r === curRow && c === curCol);

    curRow = r;
    curCol = c;
    drawLazer(curRow, curCol, grid);
  }, 1000);

  lazerStopTimer = setTimeout(() => {
    clearInterval(lazerTimer);
    lazerTimer = null;

    lazerFireTimer = setTimeout(() => {

      fireLazer(curRow, curCol, grid);
      renderImages(grid, boardgame, gameMode.mode);

      lazerNextTimer = setTimeout(() => {
        startLevel5Timer(row, col, grid, boardgame);
      }, 1000);
    }, 1500);
  }, 5000);
}

function stopLevel5Timer() {
  clearInterval(lazerTimer);
  clearTimeout(lazerStopTimer);
  clearTimeout(lazerNextTimer);   // thêm mới
  lazerTimer = lazerStopTimer = lazerNextTimer = null;
}

function startLevel4Timer(grid, boardGame, mode, selected) {
  stopLevel4Timer();

  renderTimer = setInterval(() => {
    if (useTime) {
      // úp
      renderImages(grid, boardGame, mode);
    } else {
      // Đang mặt bình thường
      selected.forEach(p => hideImage(p.row, p.col, boardGame));
      backState(selected);
      renderImages(grid, boardGame);
    }
    useTime = !useTime;
  }, 5000);
}

function stopLevel4Timer() {
  clearInterval(renderTimer);
  renderTimer = null;
  useTime = false;
}


function fireLazer(row, col, grid) {
  let arr = flatArrayLazer(row, col, grid);
  let values = arr.map(p => grid[p.row][p.col]);
  shuffle(values);


  for (let i = 0; i < arr.length; i++) {
    const p = arr[i];
    grid[p.row][p.col] = values[i];
  }
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
  } else {
    stopAllTimers()
  }

  // ẩn đi kết quả khi chuyển màn
  if (!getHtml.classList.contains("d-none")) {
    getHtml.classList.add("d-none");
  }

  if (Number(mode) === 6) {
    showBoss(stage)
  } else {
    hideBoss(stage);
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
        if (mode == 4) {
          create_element.style.backgroundImage = ``;
          create_element.style.backgroundColor = `#FFF`;

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

function flatArrayLazer(row, col, grid) {
  let cells = [];

  for (let i = 1; i < grid[0].length - 1; i++) {
    if (grid[row][i] !== -1 && grid[row][i] !== 0) {
      cells.push({ row, col: i })
    }
  }

  for (let i = 1; i < grid.length - 1; i++) {
    if (i === row) continue;
    if (grid[i][col] !== -1 && grid[i][col] !== 0) {
      cells.push({ row: i, col })
    }
  }

  return cells;
}


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
      if (grid[i][j] === -1) continue;

      const cell = board.querySelector(`[data-row="${i}"][data-col="${j}"]`);
      if (!cell) continue;

      // ô trống
      if (grid[i][j] === 0) {
        cell.style.backgroundImage = "";
        cell.classList.add("empty", "bg-transparent", "border-0");
        cell.disabled = true;
        continue;
      }

      // ô có block -> khôi phục trạng thái bình thường
      cell.classList.remove("empty", "bg-transparent", "border-0");
      cell.disabled = false;

      if (mode === 4) {
        cell.style.backgroundImage = "";
        cell.style.backgroundColor = "#FFF";
      } else {
        cell.style.backgroundImage = `url("./Resources/pieces${grid[i][j]}.png")`;
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

// sự kiện vẽ

function drawLazer(row, col, grid) {
  document.querySelectorAll(".laser").forEach(c => c.classList.remove("laser"));

  // cả hàng
  for (let c = 1; c < grid[0].length - 1; c++) {
    if (grid[row][c] === -1) continue;
    document
      .querySelector(`[data-row="${row}"][data-col="${c}"]`)
      ?.classList.add("laser");
  }

  // cả cột
  for (let r = 1; r < grid.length - 1; r++) {
    if (grid[r][col] === -1) continue;
    document
      .querySelector(`[data-row="${r}"][data-col="${col}"]`)
      ?.classList.add("laser");
  }
}


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


// Boss Action
function resetAnimationBoss(e) {

  if (e.animationName === 'atk') {

    boss.classList.remove('attack');

    sprite.classList.remove('attack');

    stage.classList.remove('attack');

    busy = false;
  }

  if (e.animationName === 'hit') {
    sprite.classList.remove('hit');
  }
}
function stopAllTimers() {
  clearInterval(timer);
  stopLevel4Timer();
  stopLevel5Timer();
  stopBoss();
  resetCombo();
}
function stopBoss() {
  clearTimeout(bossAttackTimer);
  busy = false;
  bossAttackTimer = null;
}

function randomTimeAttck(shakeBox, boss, sprite, stage, grid, board, mode) {
  const delay = 5000 + Math.random() * 5000;

  bossAttackTimer = setTimeout(() => {
    bossAttack(shakeBox, boss, sprite, stage);

    // tấn công xong các block bị rớt xuống

    const getValues = randIn(1, 36);
    dropBlock(getValues, grid);
    checkShuffle(grid, mode);
    renderImages(grid, board, mode);
    hpPlayer = hpPlayer - 8;
    setProgress(hpPlayer);
    if (hpPlayer <= 0) {
      stopAllTimers();
      popUpShowWinner(mode, false, getHtml);
      return;
    }
    randomTimeAttck(shakeBox, boss, sprite, stage, grid, board, mode);
  }, delay)

}

function dropBlock(rd, grid) {
  const values = [];
  for (let i = 1; i < grid.length - 1; i++) {
    for (let j = 1; j < grid[0].length - 1; j++) {
      if (grid[i][j] === 0) {
        values.push({ row: i, col: j });
      }
    }
  }
  if (values.length < 2) return;
  shuffle(values) // trùng ô roll lại
  const [c1, c2] = values;
  grid[c1.row][c1.col] = rd;
  grid[c2.row][c2.col] = rd;
}

function bossAttack(shakeBox, boss, sprite, stage) {
  if (busy) return;
  busy = true;

  boss.classList.add('attack');     // dừng animation thở
  sprite.classList.add('attack');   // chạy sprite tấn công
  stage.classList.add('attack');    // stage rung
  shake(shakeBox);
}
function hitBoss(sprite) {
  if (hpBoss < 0) return;
  sprite.classList.remove('hit');
  void sprite.offsetWidth;
  sprite.classList.add('hit');
}

function hideBoss(stage) {
  if (!stage.classList.contains("d-none")) {
    stage.classList.add('d-none');
  }
}
function showBoss(stage) {
  stage.classList.remove("d-none")
}

/*
   * Rung một element
   */
function shake(el) {

  // Xóa animation cũ
  el.classList.remove('shake');

  // Ép browser reset animation
  void el.offsetWidth;

  // Chạy animation
  el.classList.add('shake');

  // Animation kết thúc thì xóa class
  el.addEventListener(
    'animationend',
    e => {

      if (e.target === el) {
        el.classList.remove('shake');
      }

    },
    { once: true }
  );
}

function addCombo() {
  combo++;
  clearInterval(getCombo);
  getCombo = setInterval(() => {
    combo = 0;
  }, COMBO_TIMES);
}

function resetCombo() {
  clearInterval(getCombo);
  combo = 0;
  getCombo = null;
  hpBoss = 100;
  setProgressBoss(hpBoss);
}
