
// giá trị 0: không có vật cản
export const DIRECTION = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    right: { row: 0, col: 1 },
    left: { row: 0, col: -1 }
}

function findPath(row, col, targetRow, targetCol, turn, grid) {


}


/**
 * 
 * @param {*} row : chỉ số dòng hiện tại
 * @param {*} col : chỉ số cột hiện tại
 * @returns Trả về danh sách đối tượng chứa các hướng nó đi được
 */
export function multiDirection(row, col, grid) {
    return [
        [...oneDirection(row, col, grid, DIRECTION.up)],
        [...oneDirection(row, col, grid, DIRECTION.down)],
        [...oneDirection(row, col, grid, DIRECTION.right)],
        [...oneDirection(row, col, grid, DIRECTION.left)]
    ];

}

/**
 * Gặp vật cản bỏ hướng đấy
 * @param {*} row : chỉ số dòng hiện tại
 * @param {*} col : chỉ số cột hiện tại
 * @returns list :ghi lại các đường đi
 */
export function oneDirection(row, col, grid, direction) {
    let list = []
    let x = row;
    let y = col;
    while (true) {

        x += direction.row;
        y += direction.col;
        if (!checkEdge(x, y, grid)) break;
        if (!aroundEmpty(x, y, grid)) break;
        list.push({ row: x, col: y })
    }

    return list;
}

/**
 * check tọa độ hợp lệ
 * dòng, cột nằm trong mảng -> true
 * dòng, cột tại biên -> true
 * @param {*} x : tọa độ X
 * @param {*} y : tọa độ y
 * @returns : kiểm tra xem tọa độ còn ở trong khoảng hợp lệ không
 */
function checkEdge(x, y, grid) {
    return x >= 0 && x < grid.length && y >= 0 && y < grid[0].length;
}

/**
 * check xem xung quanh nó có trống ?
 * @param {*} x : tọa độ X
 * @param {*} y : tọa độ y
 * @returns kiểm tra xem tại ô đó có vật cản không
 */
function aroundEmpty(x, y, grid) {
    return grid[x][y] == 0 || grid[x][y] == -1;
}
