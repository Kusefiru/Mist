/* Functions for local storage (need fast access, small data) */

export function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

export function loadTheme(theme) {
    return localStorage.getItem('theme');
}
