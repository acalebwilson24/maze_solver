export type Position = { x: number, y: number }

export type Rect = {
        position: Position, size: { width: number, height: number },
        colour: string
}

export type State = InputState & {
        walls: Position[],
        solution?: Position[]
        seen?: Position[]
        start?: Position,
        end?: Position
}

export type InputState = {
        mouseButton: MouseButton,
        mouseCoordinates?: Position,
        tool: Tool,
}


export type Tool = "wall" | "start" | "end";

export type MouseButton = null | "left" | "right"
