import { redirect } from "@sveltejs/kit";
import { browser } from '$app/environment';
import { audioState } from '$lib/stores/audio.svelte';
import { session } from "$lib/stores/auth.svelte";
import { cache } from '$lib/stores/cache.svelte';
import { getUser } from "$lib/opensubsonic/api";

export async function load() {
    if (!browser) return {};

    if (!session.isAuthenticated) {
        throw redirect(307, '/login');
    }

    const user = await getUser(session.username);
    // Initialize cache
    cache.init(session.serverUrl, user);
    // Initialize audio state (needs to be awaited)
    await audioState.init(session.serverUrl, session.username);

    return { user };
}
