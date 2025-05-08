export type Position = { x: number, y: number }

export type Rect = {
        position: Position, size: { width: number, height: number },
        colour: string
}

export type State = {
        wall_grid: boolean[][],
        wall_arr: Position[]
        start?: Position,
        end?: Position,

        // mouse
        mouseCoordinates: Position,
        mouseButton: MouseButton

        // tool
        tool: Tool

        solution: Position[]
}

export type Tool = "wall" | "start" | "end";

export type MouseButton = null | "left" | "right"
