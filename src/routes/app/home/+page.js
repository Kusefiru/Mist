import { cache } from "$lib/stores/cache.svelte";
import { shuffleArray } from "$lib/utils/shuffle";

export async function load({ params, parent }) {
    const recent = await cache.getAlbumList('recent', { size: 4 });
    const newest = await cache.getAlbumList('newest', { size: 20 });
    const random = await cache.getAlbumList('random', { size: 20 });
    const artist = shuffleArray([...cache.artists.values()]).slice(0, 4);

    return { newest, recent, random, artist };
}
