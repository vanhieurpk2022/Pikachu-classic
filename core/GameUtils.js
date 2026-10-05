
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