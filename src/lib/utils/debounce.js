export function debounce(fn, delay) {
    let t;
    const debounced = (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(t);
    return debounced;
}
