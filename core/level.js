
export function blockGravity(grid) {
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