<script>
    import ItemLargeCard from '$lib/components/item/ItemLargeCard.svelte';
    import ItemRow from '$lib/components/item/ItemRow.svelte';
    import FormattedArtists from '$lib/components/ui/FormattedArtists.svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import { shuffleArray } from '$lib/utils/shuffle';

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
    <div class="flex flex-col gap-4 overflow-x-clip overflow-y-auto px-8 pt-2 pb-12 lg:gap-6">
        <div class="@container relative flex w-full flex-col gap-4">
            <h2 class="text-2xl font-bold text-ink-900 select-none">Welcome, {cache.user.id}</h2>
            {#if recent.length > 0}
                <div
                    class="grid h-[12.5rem] grid-cols-2 grid-rows-2 gap-3 @header-4col:h-[7.5rem] @header-4col:grid-cols-4 @header-4col:grid-rows-1"
                >
                    {#each recent as album}
                        <a href="/app/album/{album.id}">
                            <ItemLargeCard item={album}>
                                {#snippet subtitle()}
                                    <FormattedArtists text={album.artistsStr} artistMap={album.artistIds} />
                                {/snippet}
                            </ItemLargeCard>
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
        <ItemRow items={newest} getHref={(album) => `/app/album/${album.id}`} >
            {#snippet title()}
                New albums
            {/snippet}
            {#snippet subtitle(album)}
                <FormattedArtists text={album.artistsStr} artistMap={album.artistIds} />
            {/snippet}
        </ItemRow>
        <ItemRow items={random} getHref={(album) => `/app/album/${album.id}`} >
            {#snippet title()}
                Random albums
            {/snippet}
            {#snippet subtitle(album)}
                <FormattedArtists text={album.artistsStr} artistMap={album.artistIds} />
            {/snippet}
        </ItemRow>
        <div class="@container relative flex w-full flex-col gap-4">
            <h2 class="text-2xl font-bold text-ink-900 select-none">Random artists</h2>
            <div
                class="grid h-[12.5rem] grid-cols-2 grid-rows-2 gap-3 @header-4col:h-[7.5rem] @header-4col:grid-cols-4 @header-4col:grid-rows-1"
            >
                {#each artist as artist}
                    <a href="/app/artist/{artist.id}">
                        <ItemLargeCard item={artist}>
                            {#snippet subtitle()}
                                {artist.albumCount} releases
                            {/snippet}
                        </ItemLargeCard>
                    </a>
                {/each}
            </div>
        </div>
    </div>
{/await}
