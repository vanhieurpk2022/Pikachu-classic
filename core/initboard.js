// init button
export function createBoardGame(grid, id) {

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] != -1) {
                const create_element = document.createElement("button");
                create_element.className = "cell border-0 p-2";
                create_element.dataset.row = i;
                create_element.dataset.col = j;
                id.appendChild(create_element);
            }

        }
    }
}

// init board game
export function createGrid(row, col) {
    let items = [];
    for (let i = 0; i < row; i++) {
        items[i] = [];
        for (let j = 0; j < col; j++) {
            if (i === 0 || j === 0 || i === row - 1 || j === col - 1) {
                items[i][j] = -1;
            } else {
                items[i][j] = 0;
            }
        }
    }
    return items;
}