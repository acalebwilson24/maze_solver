export type PlayState = "playing" | "paused" | "stopped"

export default function player() {
        let fn: { (): void } | undefined = undefined
        let interval: number | undefined = undefined;
        let speed: number = 20;

        const onChangeFuncs: { (state: PlayState): void }[] = [];

        function intervalFunc(fn: { (): void }) {
                fn && fn();
        }

        function play() {
                if (!fn) return;
                interval && clearInterval(interval);

                interval = setInterval(() => intervalFunc(fn as { (): void }), speed);

                onChangeFuncs.forEach(f => f("playing"));
        }

        function pause() {
                interval && clearInterval(interval);
                interval = undefined;

                onChangeFuncs.forEach(f => f("paused"));
        }

        function stop() {
                fn = undefined;

                interval && clearInterval(interval);
                interval = undefined;

                onChangeFuncs.forEach(f => f("stopped"));
        }

        function onChange(fn: (state: PlayState) => void) {
                onChangeFuncs.push(fn);
        }

        function setSpeed(i: number) {
                speed = i;
                if (getPlayState() === "playing") {
                        pause();
                        play();
                }
        }

        function getPlayState(): PlayState {
                if (interval && fn) {
                        return "playing"
                } else if (interval || (!interval && fn)) {
                        return "paused"
                } else {
                        return "stopped";
                }
        }

        return {
                play,
                pause,
                stop,
                setFn: (_fn: { (): void }) => {
                        fn = _fn;
                },
                onChange,
                getPlayState,
                setSpeed

        }

}
