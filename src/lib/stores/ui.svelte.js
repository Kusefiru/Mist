import { browser } from '$app/environment';
import { saveUI, loadUI } from '$lib/db/local';

class UI {
    theme = $state('auto');

    main = $state({
        showPlayQueue: false
    });

    stage = $state({
        open: false,
        showPlayQueue: false,
        mode: 'cover',
        cover: 'track',
        visualizer: 'bar',
    });

    #loaded = false;

    constructor() {
        this.load();
    }

    load() {
        if (!browser) return;

        const saved = loadUI();
        if (saved) {
            this.theme = saved.theme ?? this.theme;
            this.main = { ...this.main, ...saved.main };
            this.stage = {...this.stage, ...saved.stage,};
        }

        this.#loaded = true;
    }

    save() {
        // Wait for state to be loaded before saving anything
        if (!browser || !this.#loaded) return;

        saveUI({
            theme: $state.snapshot(this.theme),
            main: $state.snapshot(this.main),
            stage: $state.snapshot(this.stage)
        });
    }
}

export const ui = new UI();
