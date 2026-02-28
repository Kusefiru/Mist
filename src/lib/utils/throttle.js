export function throttle(fn, delay) {
    let lastCall = 0;
    let queued = false;

    return (...args) => {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
}
