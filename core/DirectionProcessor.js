
// giá trị 0: không có vật cản
const DIRECTIONS = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 }
]
export default function findPath(startRow, startCol, targetRow, targetCol, grid) {
    const queue = [createInitialState(startRow, startCol)];
    while (queue.length > 0) {
        const current = queue.shift();

        if (isTarget(current, targetRow, targetCol)) {
            return current.path;
        } 3

        const nextStates = getNextStates(current, grid);

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

function getNextStates(current, grid) {
    const states = [];
    for (const direction of DIRECTIONS) {

        const nextRow = current.row + direction.row;
        const nextCol = current.col + direction.col;

        if (!checkEdge(nextRow, nextCol, grid)) {
            continue;
        }

        if (!aroundEmpty(nextRow, nextCol, grid)) {
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
