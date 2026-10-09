// init button
export function createBoardGame(row, col, grid, id, sizeRow, sizeCol) {
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
            } else if (grid[i][j] == -1) {

                const create_element = document.createElement("button");
                create_element.className = "cell empty position-relative visible bg-transparent border-0 user-select-none";
                create_element.dataset.row = i;
                create_element.dataset.col = j;
                create_element.disabled = true;
                id.appendChild(create_element);
            }

        }
    }
}

export function initValue(sizeElement, loop) {
    let value = [];
    for (let i = 1; i < sizeElement + 1; i++) {
        for (let j = 0; j < loop; j++) {
            value.push(i)
        }
    }
    return value;
}

// init board game
export function createGrid(row, col, arr) {
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

