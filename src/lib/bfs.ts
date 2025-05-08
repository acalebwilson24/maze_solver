import type { Position } from "../../types"

const directions = [
        [0, 1],
        [1, 0],
        [-1, 0],
        [0, -1]
]

function solve(maze: string[], start: Position, end: Position): { result: Position[], seen_sequence: Position[][], path_sequence: Position[][] } {
        const queue: Position[][] = [[start]];
        const tested_paths_sequence: Position[][] = [];
        let seen_sequence: Position[][] = [];
        const seen: boolean[][] = maze.map(r => r.split("").map(n => false));

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
                                path_sequence: tested_paths_sequence,
                                seen_sequence: seen_sequence
                        }
                };


                tested_paths_sequence.push(current_path);


                for (let i = 0; i < directions.length; i++) {
                        const d = directions[i];
                        queue.push([...current_path, { x: node.x + d[0], y: node.y + d[1] }]);
                }

                seen[node.y][node.x] = true;
                seen_sequence.push(convertSeen(seen));
        }

        return {
                result: [],
                path_sequence: tested_paths_sequence,
                seen_sequence: seen_sequence
        };
}

function convertSeen(seen: boolean[][]): Position[] {
        const new_seen: Position[] = [];

        for (let y = 0; y < seen.length; y++) {
                for (let x = 0; x < seen[y].length; x++) {
                        if (seen[y][x]) {
                                new_seen.push({ x, y });
                        }
                }
        }

        return new_seen;
}

function convertBoolSequenceToPos(seq: boolean[][][]): Position[][] {
        let new_seq: Position[][] = [];

        for (let i = 0; i < seq.length; i++) {
                const curr = seq[i];
                console.log("Converting", curr);
                let seen: Position[] = [];
                for (let y = 0; y < curr.length; y++) {
                        for (let x = 0; x < curr[y].length; x++) {
                                if (curr[y][x]) {
                                        seen = [...seen, { x, y }];
                                }
                        }
                }
                console.log("Adding", seen);
                new_seq = [...new_seq, [...seen]];
        }

        return new_seq;
}

export default solve;
