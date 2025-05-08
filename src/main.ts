import type { Position, State, Tool } from '../types';
import search from './lib/bfs';
import dfs_solve from './lib/dfs';
import run from './loop';
import player from './player';
import getRenderer, { buildRenderer } from './renderer';
import buildState, { buildState2, type State2 } from './state';
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
  const COUNT = 50;

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

  // const stateController = buildState(COUNT);
  // const renderer = getRenderer(ctx, { SIZE, COUNT }, stateController.getState());

  const renderer = buildRenderer(ctx, SIZE, COUNT);
  const stateController = buildState2(COUNT);


  const { onWidthChange, getWidth, ...widthCtrl } = handleWidth(canvasContainer);

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
    // renderer.draw(stateController.getState());
  })

  widthCtrl.init();

  const resetButton = document.createElement("button");
  controlsContainer.appendChild(resetButton);
  resetButton.innerText = "Reset";
  resetButton.addEventListener("click", () => {
    // stateController.reset();
    // renderer.reset();
  })

  const solveButton = document.createElement("button");
  controlsContainer.appendChild(solveButton);
  solveButton.innerText = "Solve";
  solveButton.addEventListener("click", () => {
    const solution = solveMaze(stateController.getState(), COUNT);

    if (!solution) return;

    stateController.setSolution(solution.result);
  })

  const playSolveButton = document.createElement("button");
  controlsContainer.appendChild(playSolveButton);
  playSolveButton.innerText = "Play Solution";

  const pauseButton = document.createElement("button");
  controlsContainer.appendChild(pauseButton);
  pauseButton.innerText = "Pause";

  const playDFSButton = document.createElement("button");
  controlsContainer.appendChild(playDFSButton);
  playDFSButton.innerText = "Play DFS";

  const playerControl = player(() => { console.log("this is playing!") }, 20);

  function resultSequence(result: Position[], sequence: Position[][], seen_sequence?: Position[][], hide_path = false) {
    let i = 0;

    return () => {

      const len = sequence.length;
      if (i > len - 1) {
        if (i > len + 5) {
          i = 0;
          return;
        }
        stateController.setSolution(result);
        playerControl.pause();
      } else {
        const path = sequence[i];
        if (!hide_path) {
          stateController.setSolution(path);
        }
        if (seen_sequence && seen_sequence.length > i) {
          stateController.setSeen(seen_sequence[i])
        }
      }

      i++;
    }
  }


  playSolveButton.addEventListener("click", () => {
    const solution = solveMaze(stateController.getState(), COUNT);

    console.log(solution)
    if (!solution) return;

    const sequenceThing = resultSequence(solution.result, solution.path_sequence, solution.seen_sequence, true);
    playerControl.setCb(sequenceThing)

    playerControl.play();
  })

  playDFSButton.addEventListener("click", () => {
    const solution = solveMazeDFS(stateController.getState(), COUNT);

    console.log(solution);
    if (!solution) return;

    const sequenceThing = resultSequence(solution.result, solution.paths_travelled, solution.seen_sequence);
    playerControl.setCb(sequenceThing)

    playerControl.play();
  })

  pauseButton.addEventListener("click", () => {
    if (pauseButton.innerText == "Continue") {
      playerControl.play();
      pauseButton.innerText = "Pause";
    } else {
      playerControl.pause();
      pauseButton.innerText = "Continue";
    }
  })

  const fillButton = document.createElement("button");
  controlsContainer.appendChild(fillButton);
  fillButton.innerText = "Fill";

  fillButton.addEventListener("click", () => {
    stateController.fill();
  })

  canvas.addEventListener("mousemove", (e) => {
    const { mouse_x, mouse_y } = getCanvasMousePosition(e);

    stateController.setMouseCoordinates({ x: mouse_x, y: mouse_y })
  })

  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  })


  canvas.addEventListener("mousedown", (e) => {
    stateController.setPressed(e.button == 2 ? "right" : "left");
  })

  window.addEventListener("keypress", (e) => {
    const tools: Tool[] = ["wall", "start", "end"];
    console.log(e.key)
    if (e.key === "e") {
      e.preventDefault();

      const currentTool = stateController.getState().tool;
      const i = tools.findIndex(t => t === currentTool);
      if (i === -1) return;

      console.log(i);

      let new_tool: Tool = "wall";
      if (i === tools.length - 1) {
        new_tool = tools[0]
      } else {
        new_tool = tools[i + 1]
      }

      stateController.setTool(new_tool);
    }
  })

  window.addEventListener("mouseup", () => {
    stateController.setPressed(null);
  })

  function getCanvasMousePosition(e: MouseEvent) {
    const mouse_x_raw = e.offsetX;
    const mouse_y_raw = e.offsetY;
    const mouse_x = Math.floor((mouse_x_raw / getWidth()) * COUNT);
    const mouse_y = Math.floor((mouse_y_raw / getWidth()) * COUNT);
    return { mouse_x, mouse_y }
  }

  run(renderer.render, stateController.getState)


  // search()

  // DEBUG

  const infoBox = document.createElement("div");
  const p1 = document.createElement("p");
  const p2 = document.createElement("p");

  infoBox.style.position = "fixed";
  infoBox.style.bottom = "0";
  infoBox.style.right = "0";
  p1.innerText = "";
  p2.innerText = "";

  infoBox.appendChild(p1);
  infoBox.appendChild(p2);

  // stateController.onChange(state => {
  //   p1.innerText = state.mouseButton ? state.mouseButton : "Not pressed"
  //   p2.innerText = state.tool;
  // })

  // document.body.appendChild(infoBox)
  // const state = stateController.getState();
  // const bt = state.mouseButton;
  // p1.innerText = bt ? bt : "Not pressed";
  // p2.innerText = state.tool;

}



document.addEventListener("DOMContentLoaded", () => {
  main();
})



// some state object which is passed to draw(state: State) the state object can
// be manipulated by multiple things before redraw

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

function convertToStringArr(walls: boolean[][]): string[] {
  return walls.map(row => row.map(r => {
    if (r) return "#";
    return " "
  }).join(""));
}

function createStringMaze(walls: Position[], width: number): string[] {
  const arr = Array.from(Array(width));
  let boolArr = arr.map(_ => arr.map(_ => false));
  for (let i = 0; i < walls.length; i++) {
    const { x, y } = walls[i];
    if (x >= width || x < 0 || y >= width || y < 0) continue;
    console.log(x, y, width)
    boolArr[y][x] = true;
  }

  return convertToStringArr(boolArr)
}

function solveMaze(state: State2, dim: number) {
  if (!state.start || !state.end) return undefined;


  const maze = createStringMaze(state.walls, dim)
  const solution = search(maze, state.start, state.end);
  return solution
}

function solveMazeDFS(state: State2, dim: number) {
  if (!state.start || !state.end) return undefined;


  const maze = createStringMaze(state.walls, dim)
  const solution = dfs_solve(maze, "#", state.start, state.end);
  return solution
}
