import type { MouseButton, Position, State, Tool } from "../types.ts";

type StateController = {
        getState: () => State,
        setMouseCoordinates: (crd: Position) => void
        addWall: (p: Position) => void
        deleteWall: (position: Position) => void
        setPressed: (buttonState: MouseButton) => void
        onChange: (fn: (state: State, prevState: State) => void) => void
        reset: () => void
        setStart: (p: Position) => void
        setEnd: (p: Position) => void
        setTool: (tool: Tool) => void
        setSolution: (solution: Position[]) => void
}

export type StateController2 = {
        setMouseCoordinates: (crd?: Position) => void
        setPressed: (buttonState: MouseButton) => void
        setTool: (tool: Tool) => void
        setSolution: (solution?: Position[]) => void
        getState: () => State2
}

export type State2 = {
        walls: Position[],
        mouseButton: MouseButton,
        mouseCoordinates?: Position,
        tool: Tool,
        solution?: Position[]
        start?: Position,
        end?: Position
}

const initialState: State2 = {
        walls: [],
        mouseButton: null,
        tool: "wall"
}


export function buildState2(count: number): StateController2 {
        let state = initialState;

        const methods: { [key: string]: { [key: string]: { (coords?: Position): void } | undefined } | undefined } = {
                "wall": {
                        "left": addWall,
                        "right": removeWall
                },
                "start": {
                        "left": setStart
                },
                "end": {
                        "left": setEnd
                }
        }

        function setState(_state: State2) {
                state = _state;

                if (state.mouseButton) {
                        handleMouse();
                }
        }

        function handleMouse() {
                const b = state.mouseButton;
                const coords = state.mouseCoordinates;
                if (!coords || coords.x >= count || coords.y >= count || !b) return;

                const tool_m = methods[state.tool];
                if (!tool_m) {
                        console.error("Invalid tool");
                        return
                }

                const m = tool_m[b];
                if (!m) {
                        console.error("No registered function")
                        return;
                }
                m(coords);
        }

        function addWall(coords?: Position) {
                if (!coords || state.walls.find(w => w.x === coords.x && w.y === coords.y)) return;
                state.walls.push(coords);
        }

        function removeWall(coords?: Position) {
                if (!coords) return;
                state.walls = state.walls.filter(w => w.x !== coords.x || w.y !== coords.y);
        }

        function setStart(p?: Position) {
                state.start = p;
        }

        function setEnd(p?: Position) {
                state.end = p;
        }

        function setMouseCoordinates(p?: Position) {
                state.mouseCoordinates = p;
                setState(state);
        }

        function setTool(tool: Tool) {
                state.tool = tool;
                setState(state);
        }

        function setPressed(p: MouseButton) {
                state.mouseButton = p;
                setState(state);
        }

        function setSolution(solution?: Position[]) {
                state.solution = solution
                setState(state);
        }

        return {
                setMouseCoordinates,
                setTool,
                setPressed,
                setSolution,
                getState: () => state
        }
}

export default function buildState(count: number): StateController {
        const arr = Array.from(Array(count));
        const initialState: State = {
                wall_grid: arr.map(_ => arr.map(_ => false)),
                wall_arr: [],
                mouseButton: null,
                mouseCoordinates: {
                        x: -1,
                        y: -1
                },
                tool: "wall",
                solution: []
        }
        let state: State = initialState;
        const onChangeFuncs: { (state: State, prevState: State): void }[] = [];

        function changed(prevState: State) {
                onChangeFuncs.forEach(f => f(state, prevState));
        }

        function addWall(p: Position) {
                const newArr = [...state.wall_arr];
                if (!state.wall_arr.find(_p => p.x === _p.x && p.y === _p.y)) {
                        newArr.push(p);
                        console.log(newArr);
                } else {
                        return;
                }

                const newGrid = [...initialState.wall_grid];
                for (let i = 0; i < newArr.length; i++) {
                        const { x, y } = newArr[i];
                        newGrid[y][x] = true;
                }

                const prevState = { ...state };

                state = {
                        ...state,
                        wall_grid: newGrid,
                        wall_arr: newArr
                }

                changed(prevState);
        }

        function deleteWall(p: Position) {
                if (!state.wall_arr.find(_p => p.x === _p.x && p.y === _p.y)) return;
                const newWalls = [...state.wall_grid];
                newWalls[p.y][p.x] = false;

                const newWallArr = [...state.wall_arr].filter(_p => !(_p.x === p.x && _p.y === p.y));
                const prevState = { ...state };

                state = {
                        ...state,
                        wall_grid: newWalls,
                        wall_arr: newWallArr
                }
                changed(prevState);
        }

        function setPressed(buttonState: MouseButton) {
                const prevState = { ...state };
                state = {
                        ...state,
                        mouseButton: buttonState
                }
                changed(prevState);
        }

        function setMouseCoordinates(crd: Position) {
                const prevState = { ...state };
                state = {
                        ...state,
                        mouseCoordinates: {
                                ...crd
                        }
                }
                changed(prevState);
        }

        function setStart(p: Position) {
                const prevState = { ...state };
                if (state.start) {
                        const { x, y } = state.start;
                        if (x === p.x && y === p.y) return;
                }

                state = {
                        ...state,
                        start: p
                }
                changed(prevState);
        }

        function setEnd(p: Position) {
                const prevState = { ...state };
                state = {
                        ...state,
                        end: p
                }
                changed(prevState);
        }

        function setTool(tool: Tool) {
                const prevState = { ...state };
                state = {
                        ...state,
                        tool
                }
                changed(prevState);
        }

        function setSolution(solution: Position[]) {
                const prevState = { ...state };
                state = {
                        ...state,
                        solution
                }
                changed(prevState);
        }

        return {
                getState: () => state,
                deleteWall,
                addWall,
                setPressed,
                setMouseCoordinates,
                onChange: (fn: (state: State, prevState: State) => void) => {
                        onChangeFuncs.push(fn);
                },
                reset: () => { state = initialState },
                setStart,
                setEnd,
                setTool,
                setSolution
        }
}
