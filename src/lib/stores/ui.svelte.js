import { loadTheme } from "$lib/db/local";

export const ui = $state({
    showPlayQueue: false,
    showFullscreenPlayer: false,
    theme: loadTheme()
});
