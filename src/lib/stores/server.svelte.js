import { getOpenSubsonicExtensions } from '$lib/opensubsonic/api';

class ServerCapabilities {
    loaded = $state(false);
    extensions = $state([]);

    async load() {
        try {
            this.extensions = await getOpenSubsonicExtensions();
        } catch (error) {
            console.warn('Could not fetch server extensions:', error);
            this.extensions = [];
        }
        this.loaded = true;
    }

    supports(name, version = 1) {
        return this.extensions.some((e) => e.name === name && e.versions?.includes(version));
    }
}

export const server = new ServerCapabilities();
