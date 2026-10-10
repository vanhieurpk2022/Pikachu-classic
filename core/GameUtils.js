import { findPath } from "./DirectionProcessor.js";

export function shuffle(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let j = Math.floor(Math.random() * (arr.length - i));

        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;

    }

    return arr;
}
export function isSameValue(row, col, targetRow, targetCol, grid) {
    return (grid[row][col] === grid[targetRow][targetCol]);
}

// reset state, clean select arr
export function backState(list) {
    list.forEach(item => {
        item.el.classList.remove("active")
    });
    list.length = 0;
}

export function clearCells(row, col, targetRow, targetCol, grid) {

    grid[row][col] = 0;
    grid[targetRow][targetCol] = 0;
}

export function render(grid, board) {
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

export function shuffeMiddleGame(grid) {
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


export function renderImages(grid, board) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == -1 || grid[i][j] == 0) continue;
            const cell = board.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            if (cell) cell.style.backgroundImage = `url("./Resources/pieces${grid[i][j]}.png")`;
        }
    }
}

export function hint(grid) {
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

            const re = findPath(p1.row, p1.col, p2.row, p2.col, grid, p1.type);
            if (re) {
                return re;
            }
        }
    }

    return null;
}


function hasValidMove(grid) {
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

            if (findPath(p1.row, p1.col, p2.row, p2.col, grid, p1.type)) {
                return true;
            }
        }
    }

    return false;
}

export function checkShuffle(grid) {
    let tries = 0;
    const MAX_TRIES = 100;

    while (!hasValidMove(grid) && tries < MAX_TRIES) {
        shuffeMiddleGame(grid);
        tries++;
    }

}


export function checkWinner(grid) {
    for (const i of grid) {
        for (const j of i) {
            if (j > 0) {
                return false;
            }
        }
    }
    return true;
}

export function showResultPopup(isWin, id) {
    document.getElementById(id)?.remove();
    const title = isWin ? "Bạn đã thắng" : "Bạn đã thua";
    const nextBtn = isWin
        ? `<button id="btn-next" class="btn btn-link text-dark text-decoration-none d-block mx-auto fs-4">Màn tiếp theo</button>`
        : "";

    id.insertAdjacentHTML("beforeend", `
    <div id="result-overlay"
         class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75"
         style="z-index: 1050;">
      <div class="bg-warning border border-dark border-3 text-center p-4"
           style="width: 500px; max-width: 90vw; min-height: 450px; border-radius: 28px; font-family: 'Patrick Hand', sans-serif;">
        <h3 class="mb-5" style="font-size: 48px;">${title}</h3>
        ${nextBtn}
        <button id="btn-replay-menu" class="btn btn-link text-dark text-decoration-none d-block mx-auto fs-4">Chơi lại</button>
        <button id="btn-back-menu" class="btn btn-link text-dark text-decoration-none d-block mx-auto fs-4">Quay lại</button>
      </div>
    </div>
  `);

    // Gắn sự kiện sau khi chèn
    document.getElementById("btn-next")?.addEventListener("click", () => {
        const mode = Number(new URLSearchParams(location.search).get("mode") ?? 1);
        location.href = `init-grid.html?mode=${mode + 1}`;
    });
    document.getElementById("btn-replay-menu").addEventListener("click", () => location.reload());
    document.getElementById("btn-back-menu").addEventListener("click", () => location.href = "menu.html");
}


