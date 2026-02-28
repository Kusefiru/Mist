import { cache } from "$lib/stores/cache.svelte";
import { shuffleArray } from "$lib/utils/shuffle";

export async function load({ params, parent }) {
    await cache._fetchPlaylists();
}
