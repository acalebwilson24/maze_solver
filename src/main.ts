import './style.css'

function main() {
  const root = document.getElementById("app")
  if (!root) return;

  const container = document.createElement("div");
  container.classList.add("container");

  const canvasContainer = document.createElement("div");
  canvasContainer.classList.add("canvas-container");
  container.appendChild(canvasContainer);

  const controlsContainer = document.createElement("div");
  controlsContainer.classList.add("controls-container");
  container.appendChild(controlsContainer);


  root.appendChild(container);

  const grid_canvas = document.createElement("canvas");
  const canvas = document.createElement("canvas");
  canvas.classList.add("main-canvas")
  grid_canvas.classList.add("grid-canvas")

  const SIZE = 1000;
  const COUNT = 25;

  canvas.width = SIZE;
  canvas.height = SIZE;

  grid_canvas.width = SIZE;
  grid_canvas.height = SIZE;


  // root.appendChild(grid_canvas);
  // root.appendChild(canvas);
  canvasContainer.appendChild(grid_canvas);
  canvasContainer.appendChild(canvas);

  canvas.style.border = "1px solid black";

  const grid_ctx = grid_canvas.getContext("2d")
  const ctx = canvas.getContext("2d");

  if (!ctx) return
  if (!grid_ctx) return

  const stateController = buildState();
  const renderer = canvasControl(ctx, { SIZE, COUNT }, stateController.getState());

  const { onWidthChange, init, getWidth } = handleWidth(canvasContainer);

  onWidthChange(draw_grid)

  function draw_grid(width: number) {
    canvasContainer.style.minHeight = width + "px"
    grid_canvas.width = width;
    grid_canvas.height = width;
    const gap = Math.round(width / COUNT)
    if (!grid_ctx) return
    for (let i = gap; i < width; i += gap) {
      grid_ctx.moveTo(0, i); grid_ctx.lineTo(width,
        i); grid_ctx.stroke();

      grid_ctx.moveTo(i, 0); grid_ctx.lineTo(i, width); grid_ctx.stroke();
    }
  }

  onWidthChange((width) => {
    canvas.width = width;
    canvas.height = width;
    renderer.setWidth(width);
    renderer.draw(stateController.getState());
  })

  init();



  const resetButton = document.createElement("button");
  controlsContainer.appendChild(resetButton);
  resetButton.innerText = "Reset";
  resetButton.addEventListener("click", () => {
    stateController.reset();
    renderer.reset();
  })



  function mouseHandler() {
    let position = { x: 0, y: 0 }

    const onChangeFuncs: { (p: typeof position): void }[] = [];

    function onChange(func: (p: typeof position) => void) {
      onChangeFuncs.push(func)
    }

    function setPosition(mouse_x: number, mouse_y: number) {
      position.x =
        mouse_x; position.y = mouse_y;

      onChangeFuncs.forEach(f => f(position));
    }

    return { position, setPosition, onChange }
  }

  canvas.addEventListener("mousemove", (e) => {
    const { mouse_x, mouse_y } = getCanvasMousePosition(e);

    stateController.setMouseCoordinates({ x: mouse_x, y: mouse_y })
    renderer.draw(stateController.getState());
  })

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  })


  canvas.addEventListener("mousedown", (e) => {
    stateController.setPressed(e.button == 2 ? "right" : "left");
    renderer.draw(stateController.getState());
  })

  window.addEventListener("mouseup", () => {
    stateController.setPressed(null);
    renderer.draw(stateController.getState());
  })

  function getCanvasMousePosition(e: MouseEvent) {
    const mouse_x_raw = e.offsetX;
    const mouse_y_raw = e.offsetY;
    const width = canvas.width;
    const mouse_x = Math.floor((mouse_x_raw / getWidth(canvasContainer.clientWidth)) * COUNT);
    const mouse_y = Math.floor((mouse_y_raw / getWidth(canvasContainer.clientWidth)) * COUNT);
    return { mouse_x, mouse_y }
  }

  stateController.onChange(state => {
    const bt = state.mouseButton;
    const { x, y } = state.mouseCoordinates;

    if (bt === "left") {
      // paint mode
      const r = state.rects.find(r => r.position.x === x && r.position.y === y);
      if (r) return;
      stateController.addRect({
        colour: "pink",
        position: { x, y },
        size: { width: 1, height: 1 }
      });
    } else if (bt === "right") {
      stateController.deleteRect(state.mouseCoordinates);
    }
  })

  // DEBUG

  const infoBox = document.createElement("div");
  infoBox.style.position = "fixed";
  infoBox.style.bottom = "0";
  infoBox.style.right = "0";
  infoBox.innerText = "";

  stateController.onChange(state => {
    infoBox.innerText = state.mouseButton ? state.mouseButton : "Not pressed"
  })

  document.body.appendChild(infoBox)

  const bt = stateController.getState().mouseButton;
  infoBox.innerText = bt ? bt : "Not pressed";
}



document.addEventListener("DOMContentLoaded", () => {
  main();
})

type Params = { x: number, y: number, w: number, h: number }

type Square = { x: number, y: number }

type MouseHandler = {
  position: { x: number, y: number }, setPosition:
  (mouse_x: number, mouse_y: number) => void, onChange: (func: (p: {
    x: number,
    y: number
  }) => void) => void
}

function canvasControl(ctx: CanvasRenderingContext2D, size: { SIZE: number, COUNT: number }, state: State) {
  let { SIZE, COUNT
  } = size;


  function draw(state: State) {
    // console.log(state);
    ctx.reset();

    console.log("render!", state)

    const gap = Math.round(SIZE / COUNT);

    for (let i = 0; i < state.rects.length; i++) {
      const r = state.rects[i];
      // console.log("Rendering rect", r);
      ctx.fillStyle = "blue";
      ctx.fillRect(r.position.x * gap, r.position.y * gap, r.size.width * gap, r.size.height * gap);
    }

    if (state.mouseCoordinates.x >= 0 && state.mouseCoordinates.y >= 0) {
      const { x, y } = state.mouseCoordinates;
      ctx.fillStyle = "rgba(50,50,150,0.5)";
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



// some state object which is passed to draw(state: State) the state object can
// be manipulated by multiple things before redraw

type Position = { x: number, y: number }

type Rect = {
  position: Position, size: { width: number, height: number },
  colour: string
}

type State = {
  rects: Rect[],

  // mouse
  mouseCoordinates: Position,
  mouseButton: MouseButton
}

type MouseButton = null | "left" | "right"

type StateController = {
  getState: () => State,
  setMouseCoordinates: (crd: Position) => void
  addRect: (rect: Rect) => void
  deleteRect: (position: Position) => void
  setPressed: (buttonState: MouseButton) => void
  onChange: (fn: (state: State) => void) => void
  reset: () => void
}

function buildState(): StateController {
  const initialState: State = {
    rects: [],
    mouseButton: null,
    mouseCoordinates: {
      x: -1,
      y: -1
    }
  }
  let state: State = initialState;
  const onChangeFuncs: { (state: State): void }[] = [];

  function changed() {
    onChangeFuncs.forEach(f => f(state));
  }

  function addRect(rect: Rect) {
    state = {
      ...state, rects: [...state.rects,
        rect]
    }
    changed();
  }

  function deleteRect(position: Position) {
    const newRects = state.rects.filter(r => r.position.x !== position.x || r.position.y !== position.y);
    state = {
      ...state,
      rects: newRects
    }
    changed();
  }

  function setPressed(buttonState: MouseButton) {
    state = {
      ...state,
      mouseButton: buttonState
    }
    changed();
  }

  function setMouseCoordinates(crd: Position) {
    state = {
      ...state,
      mouseCoordinates: crd
    }
    changed();
  }

  return {
    getState: () => state,
    deleteRect,
    addRect,
    setPressed,
    setMouseCoordinates,
    onChange: (fn: (state: State) => void) => {
      onChangeFuncs.push(fn);
    },
    reset: () => { state = initialState }
  }
}

function handleWidth(divToMeasure: HTMLElement) {
  let width = 0;
  let breaks = [1000, 800, 600, 400]
  const onChangeFuncs: { (w: number): void }[] = [];

  window.addEventListener("resize", updateWidth)

  function updateWidth() {
    const new_width = breaks.find(b => divToMeasure.clientWidth > b) ?? 400;
    if (new_width !== width) {
      width = new_width;
      onChangeFuncs.forEach(fn => fn(width));
    }
  }

  function onChange(fn: (w: number) => void) {
    onChangeFuncs.push(fn);
  }

  return {
    onWidthChange: onChange,
    init: updateWidth,
    getWidth: () => width
  }
}
