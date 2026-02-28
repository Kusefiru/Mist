<script>
    import { SmileySad, MusicNotesSimple, Users, VinylRecord } from 'phosphor-svelte';
    import { page } from '$app/stores';
    import AlbumGrid from '$lib/components/album/AlbumGrid.svelte';
    import ArtistGrid from '$lib/components/artist/ArtistGrid.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';
    import { cache } from '$lib/stores/cache.svelte';

    let columns = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];

    let albums = $state([]);
    let artists = $state([]);
    let trackIds = $state([]);
    let { data } = $props();

    // Access search query from URL
    $effect(() => {
        const query = $page.url.searchParams.get('q');
        albums = data.results.album?.map((a) => cache.albums.get(a.id)) || [];
        artists = data.results.artist?.map((a) => cache.artists.get(a.id)) || [];
        trackIds = data.results.song?.map((s) => s.id) || [];
    });
</script>

<div class="relative px-8 pt-2 pb-12">
    {#if data.results}
        {#if trackIds?.length > 0}
            <h2 class="flex items-center pt-4 text-2xl font-bold text-ink-800">
                <MusicNotesSimple size={28} class="mr-2" />
                <span>Tracks</span>
            </h2>
            <ul class="py-4">
                <HeaderRow {columns} />
                {#each trackIds as trackId}
                    <TrackRow {trackId} queueIds={trackIds} variant="playlist" {columns} />
                {/each}
            </ul>
        {/if}
        {#if albums?.length > 0}
            <h2 class="flex items-center py-4 text-2xl font-bold text-ink-800">
                <VinylRecord size={28} class="mr-2" />
                <span>Albums</span>
            </h2>
            <AlbumGrid {albums} />
        {/if}
        {#if artists?.length > 0}
            <h2 class="flex items-center py-4 text-2xl font-bold text-ink-800">
                <Users size={28} class="mr-2" />
                <span>Artists</span>
            </h2>
            <ArtistGrid {artists} />
        {/if}
        {#if !trackIds?.length && !albums?.length && !artists?.length}
            <div class="flex flex-col items-center gap-4 py-12 text-center text-ink-500">
                <SmileySad size={40} />
                <p class="text-2xl">No results found for: "{data.query}"</p>
            </div>
        {/if}
    {/if}
</div>
