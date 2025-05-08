import type { State2 } from "./state"

export default function run(render: (state: State2) => void, getState: () => State2) {
        render(getState());

        requestAnimationFrame(() => run(render, getState));
}
