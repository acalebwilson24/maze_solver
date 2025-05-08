import type { Position } from "../main.ts"

const directions = [
        [0, 1],
        [1, 0],
        [-1, 0],
        [0, -1]
]

function solve(maze: string[], start: Position, end: Position): { result: Position[], tested_paths_sequence: Position[][] } {
        const queue: Position[][] = [[start]];
        const tested_paths_sequence: Position[][] = [];
        const seen: boolean[][] = maze.map(r => r.split("").map(n => false));

        console.log(maze);
        while (queue.length) {
                const current_path = queue.shift();

                if (!current_path || current_path.length === 0) continue;

                const node = current_path[current_path.length - 1];

                if (node.x < 0 || node.x >= maze[0].length || node.y < 0 || node.y >= maze.length) continue;

                if (seen[node.y][node.x]) continue;

                if (maze[node.y][node.x] === "#") continue;

                if (node.x === end.x && node.y === end.y) {
                        return {
                                result: current_path,
                                tested_paths_sequence
                        }
                };


                tested_paths_sequence.push(current_path);

                for (let i = 0; i < directions.length; i++) {
                        const d = directions[i];
                        queue.push([...current_path, { x: node.x + d[0], y: node.y + d[1] }]);
                }

                seen[node.y][node.x] = true;
        }

        return {
                result: [],
                tested_paths_sequence
        };
}

export default solve;
