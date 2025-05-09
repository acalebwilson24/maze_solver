import type { InputState, MouseButton, Position, State, Tool } from "../types.ts";

export type StateController2 = {
        setMouseCoordinates: (crd?: Position) => void
        setPressed: (buttonState: MouseButton) => void
        setTool: (tool: Tool) => void
        setSolution: (solution?: Position[]) => void
        getState: () => State,
        fill: () => void,
        clear: () => void
        setSeen: (seen: Position[]) => void
}



const initialState: State = {
        walls: [],
        mouseButton: null,
        tool: "wall"
}

const initialInputState: InputState = {
        mouseButton: null,
        tool: "wall"
}

export function buildInputState() {
        let state = initialInputState;
        const onChangeFuncs: { (state: InputState): void }[] = [];

        function onChange(fn: (state: InputState) => void) {
                onChangeFuncs.push(fn);
        }

        function setState(newState: InputState) {
                state = newState;
                onChangeFuncs.forEach(fn => fn(state));
        }

        function setMouseCoordinates(c: Position) {
                setState({ ...state, mouseCoordinates: c });
        }

        function setButton(b: MouseButton) {
                setState({ ...state, mouseButton: b });
        }

        function setTool(t: Tool) {
                setState({ ...state, tool: t });
        }


        return {
                setMouseCoordinates,
                setButton,
                setTool,
                onChange
        }
}

export function buildFullState(count: number) {
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

        function setState(_state: State) {
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

        let fill_rects: Position[] = [];

        function fill() {
                const rects: Position[] = fill_rects;
                if (rects.length) {
                        state.walls = rects;
                        return
                }

                for (let y = 0; y < count; y++) {
                        for (let x = 0; x < count; x++) {
                                rects.push({ x, y });
                        }
                }
                state.walls = rects;
                fill_rects = rects.map(r => ({ ...r }));
        }

        function clear() {
                state.walls = [];
        }


        function setSolution(solution?: Position[]) {
                state.solution = solution
                setState(state);
        }

        function setSeen(seen?: Position[]) {
                state.seen = seen;
                setState(state);
        }

        function setBaseState(newBaseState: InputState) {
                state = { ...state, ...newBaseState }
                setState(state);
        }

        return {
                setInputState: setBaseState,
                fill,
                clear,
                setSolution,
                setSeen,
                getState: () => state
        }
}

