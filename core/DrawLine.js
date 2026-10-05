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

export default function defineGraph(arr, parent) {
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

export function removeLine(parent) {
    parent.querySelectorAll(".seg").forEach(s => s.remove());
}