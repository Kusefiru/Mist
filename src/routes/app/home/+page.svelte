<script>
    import AlbumCardLarge from '$lib/components/album/AlbumCardLarge.svelte';
    import AlbumRow from '$lib/components/album/AlbumRow.svelte';
    import ArtistCardLarge from '$lib/components/artist/ArtistCardLarge.svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import { shuffleArray } from "$lib/utils/shuffle";

    async function loadHomepage() {
        const recent = await cache.getAlbumList('recent', { size: 4 });
        const newest = await cache.getAlbumList('newest', { size: 20 });
        const random = await cache.getAlbumList('random', { size: 20 });
        const artist = shuffleArray([...cache.artists.values()]).slice(0, 4);

        return { newest, recent, random, artist };
    }

    const homepagePromise = loadHomepage();
</script>

{#await homepagePromise then { newest, recent, random, artist }}
    <div class="flex flex-col gap-6 overflow-x-clip overflow-y-auto px-8 pt-2 pb-12">
        <div class="relative flex w-full flex-col gap-4">
            <h2 class="text-2xl font-bold text-ink-800">Welcome, {cache.userId}</h2>
            {#if recent.length > 0}
                <div class="grid h-[120px] grid-cols-4 grid-rows-1 gap-3">
                    {#each recent as album}
                        <a href="/app/album/{album.id}">
                            <AlbumCardLarge {album} />
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
        <AlbumRow title="New albums" albums={newest} />
        <AlbumRow title="Random albums" albums={random} />
        <div class="relative flex w-full flex-col gap-4">
            <h2 class="text-2xl font-bold text-ink-800">Random artists</h2>
            <div class="grid h-[120px] grid-cols-4 grid-rows-1 gap-3">
                {#each artist as artist}
                    <a href="/app/artist/{artist.id}">
                        <ArtistCardLarge {artist} />
                    </a>
                {/each}
            </div>
        </div>
    </div>
{/await}
