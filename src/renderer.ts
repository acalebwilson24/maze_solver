import type { Position, State } from "../types"
import type { State2 } from "./state";

export function buildRenderer(ctx: CanvasRenderingContext2D, initial_width: number, rows: number) {
        let width = initial_width;
        let stored_state: State2 | undefined = undefined;

        const hoverStyles = {
                "wall": "rgba(50, 50, 150, 0.3)",
                "start": "rgba(0, 200, 0, 0.3)",
                "end": "rgba(200, 0, 0, 0.3)"
        }

        const drawnStyles = {
                "wall": "black",
                "start": "rgba(0, 200, 0, 1)",
                "end": "rgba(200, 0, 0, 0.3)"
        }

        function drawRect(w: number, coords?: Position, colour?: string) {
                if (!coords) return;
                ctx.fillStyle = colour || "black";
                ctx.fillRect(coords.x * w, coords.y * w, w, w);
        }

        function render(state: State2) {
                stored_state = state;
                ctx.reset();

                const tile_width = Math.round(width / rows);

                for (let i = 0; i < state.walls.length; i++) {
                        const coords = state.walls[i];
                        drawRect(tile_width, coords)
                }

                drawRect(tile_width, state.start, drawnStyles["start"]);

                drawRect(tile_width, state.end, drawnStyles["end"]);

                drawRect(tile_width, state.mouseCoordinates, hoverStyles[state.tool]);

                if (state.seen) {
                        for (let i = 0; i < state.seen.length; i++) {
                                drawRect(tile_width, state.seen[i], `rgba(255,128,255,0.3)`);
                        }

                }

                if (state.solution) {
                        for (let i = 0; i < state.solution.length; i++) {
                                const opacity = i === state.solution.length - 1 ? 1.0 : 0.5;
                                drawRect(tile_width, state.solution[i], `rgba(255,255,255,${opacity})`);
                        }
                }
        }

        return {
                render,
                setWidth: (w: number) => {
                        width = w;
                        stored_state && render(stored_state);
                }
        }
}

export default function getRenderer(ctx: CanvasRenderingContext2D, size: { SIZE: number, COUNT: number }, state: State) {
        let { SIZE, COUNT
        } = size;


        const hoverStyles = {
                "wall": "rgba(50, 50, 150, 0.3)",
                "start": "rgba(0, 200, 0, 0.3)",
                "end": "rgba(200, 0, 0, 0.3)"
        }

        function draw(state: State) {
                // console.log(state);
                ctx.reset();

                console.log("render!", state)

                const gap = Math.round(SIZE / COUNT);

                for (let i = 0; i < state.wall_arr.length; i++) {
                        const { x, y } = state.wall_arr[i];
                        ctx.fillRect(x * gap, y * gap, gap, gap);
                }

                if (state.start) {
                        ctx.fillStyle = "rgba(0, 200, 0, 1)";
                        ctx.fillRect(state.start.x * gap, state.start.y * gap, gap, gap);
                }

                if (state.end) {
                        ctx.fillStyle = "rgba(200, 0, 0, 1)";
                        ctx.fillRect(state.end.x * gap, state.end.y * gap, gap, gap);
                }

                if (state.solution) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                        for (let i = 0; i < state.solution.length; i++) {
                                const { x, y } = state.solution[i];
                                ctx.fillRect(x * gap, y * gap, gap, gap);
                        }
                }

                if (state.mouseCoordinates.x >= 0 && state.mouseCoordinates.y >= 0) {
                        const { x, y } = state.mouseCoordinates;
                        ctx.fillStyle = hoverStyles[state.tool];
                        ctx.fillRect(x * gap, y * gap, gap, gap)
                }
        }

        draw(state);

        return {
                draw,
                setWidth: (w: number) => { SIZE = w },
                reset: () => ctx.reset()
        };
}
