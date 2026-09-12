/* Functions for local storage (need fast access, small data) */

const UI_KEY = 'ui';

export function saveUI(state) {
    try {
        localStorage.setItem(UI_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save UI state:', error);
    }
}

export function loadUI() {
    try {
        const raw = localStorage.getItem(UI_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error('Failed to load UI state:', error);
        return null;
    }
}
