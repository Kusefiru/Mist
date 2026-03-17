import { loadTheme } from "$lib/db/local";

function getInitialTheme() {
    const theme = loadTheme();
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const ui = $state({
    showPlayQueue: false,
    showFullscreenPlayer: false,
    darkTheme: getInitialTheme()
});
