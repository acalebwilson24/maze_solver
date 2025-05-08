import type { Position } from "../../types"

const directions = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0]
]

function walk(maze: string[], wall: string, curr: Position, end: Position, seen: boolean[][], path: Position[], add: (path: Position[]) => void): boolean {
        const max_y = maze.length;
        if (max_y === 0) return false;

        const max_x = maze[0].length;

        if (curr.x >= max_x || curr.x < 0 || curr.y >= max_y || curr.y < 0) {
                return false;
        }

        const value = maze[curr.y][curr.x];

        if (value == wall) {
                return false;
        }

        if (curr.y === end.y && curr.x === end.x) {
                path.push(curr);
                return true;
        }

        if (seen[curr.y][curr.x]) {
                return false;
        }

        path.push(curr)
        seen[curr.y][curr.x] = true;

        for (let i = 0; i < directions.length; i++) {
                const new_curr = {
                        x: curr.x + directions[i][1],
                        y: curr.y + directions[i][0]
                }
                const result = walk(maze, wall, new_curr, end, seen, path, add);

                if (result) {
                        return true;
                }
        }

        add([...path]);
        path.pop();
        return false;
}

function tracker() {
        const paths: Position[][] = [];

        function add(path: Position[]) {
                paths.push(path);
        }

        return {
                getPaths: () => paths,
                add
        }
}


function massage_paths(_paths: Position[][]) {
        // get i path
        // invert and break into subsequent paths
        // [0], [0,1], [0, 2] etc up to full
        // check overlap with next path
        // reverse back to overlao

        let paths = [..._paths];
        let new_paths: Position[][] = [];

        if (paths.length === 0) return {
                paths: [],
                seen_sequence: []
        };

        const seen: Position[] = [];

        let path: Position[] | undefined = undefined;

        let prev_path: Position[] = [];

        while (paths.length) {
                path = paths.shift();
                if (!path) {
                        path = paths.shift();
                        continue;
                }

                let overlap_index = 0;
                let contained = prev_path && prev_path.length > path.length;

                if (prev_path && !contained) {
                        for (let i = 0; i < prev_path.length; i++) {
                                // need to check if prev is entirely contained by curr

                                if (i >= path.length) {
                                        contained = true;
                                        break;
                                }

                                const curr = path[i];
                                const prev = prev_path[i];

                                if (!are_equal(curr, prev)) {
                                        overlap_index = i - 1;
                                        break;
                                }

                        }
                }

                let sequential_paths: Position[][] = [];

                if (contained) {
                        sequential_paths.push([...path]);
                } else {
                        for (let i = overlap_index; i < path.length; i++) {
                                sequential_paths.push(path.slice(0, i + 1));
                        }
                }

                sequential_paths.forEach(p => new_paths.push(p));
                prev_path = [...path];
        }

        let seen_sequence: Position[][] = [];

        for (let i = 0; i < new_paths.length; i++) {
                if (i === 0 || new_paths[i - 1].length < new_paths[i].length) {
                        const path = new_paths[i];
                        const last = path[path.length - 1];
                        if (i === 0) {
                                seen_sequence.push([{ ...last }]);
                        } else {
                                const prev_sequence = seen_sequence[seen_sequence.length - 1];
                                seen_sequence.push([...prev_sequence, { ...last }]);
                        }
                } else {
                        const prev_sequence = seen_sequence[seen_sequence.length - 1];
                        seen_sequence.push([...prev_sequence]);
                }
        }

        return {
                paths: new_paths,
                seen_sequence
        };
}

function are_equal(a: Position, b: Position) {
        return a.x === b.x && a.y === b.y;
}



export default function dfs_solve(maze: string[], wall: string, start: Position, end: Position) {
        let path: Position[] = [];
        let t = tracker();
        let seen = maze.map(row => row.split("").map(_ => false));

        walk(maze, wall, start, end, seen, path, t.add);

        t.add(path);

        const paths = massage_paths(t.getPaths());



        return {
                result: path,
                paths_travelled: paths.paths,
                seen_sequence: paths.seen_sequence
        };
}
