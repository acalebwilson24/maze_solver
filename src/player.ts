export default function player(cb: () => void, _interval?: number) {
        let _cb = cb;
        let fn: { (): void } | undefined = undefined;
        const interval = setInterval(() => {
                fn && fn();
        }, _interval ?? 20);

        function play() {
                fn = _cb;
        }

        function pause() {
                fn = undefined;
        }

        return {
                play,
                pause,
                setCb: (cb: { (): void }) => {
                        _cb = cb;
                }
        }

}
