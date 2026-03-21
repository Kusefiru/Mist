<script>
    import { SmileySad, MusicNotesSimple, Users, VinylRecord } from 'phosphor-svelte';
    import { page } from '$app/stores';
    import AlbumGrid from '$lib/components/album/AlbumGrid.svelte';
    import ArtistGrid from '$lib/components/artist/ArtistGrid.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';
    import { Track } from '$lib/db/models/Track.js';
    import { search3 } from '$lib/opensubsonic/api';
    import { cache } from '$lib/stores/cache.svelte';

    let columns = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];

    let albums = $state([]);
    let artists = $state([]);
    let tracks = $state([]);
    let { data } = $props();

    // Access search query from URL
    async function loadSearch(query) {
        const results = await search3(query.trim());

        albums = await Promise.all(results.album?.map((a) => cache.getAlbum(a.id)) || []);
        artists = await Promise.all(results.artist?.map((a) => cache.getArtist(a.id)) || []);
        results.song?.forEach((s) => {
            cache.setTrack(s);
        });
        tracks = await Promise.all(results.song?.map((s) => cache.getTrack(s.id)) || []);

        return { albums, artists, tracks };
    }

    const query = $derived($page.url.searchParams.get('q'));
    const searchPromise = $derived(loadSearch(query));
</script>

<div class="relative overflow-auto px-8 pt-2 pb-12">
    {#await searchPromise}
        <div class="flex flex-col items-center gap-4 py-12 text-center text-ink-500">
            <p class="text-2xl">Searching...</p>
        </div>
    {:then { albums, artists, tracks }}
        {#if tracks?.length > 0}
            <h2 class="flex items-center pt-4 text-2xl font-bold text-ink-800">
                <MusicNotesSimple size={"1.75rem"} class="mr-2" />
                <span>Tracks</span>
            </h2>
            <ul class="py-4">
                <HeaderRow {columns} />
                {#each tracks as track}
                    <TrackRow
                        trackId={track.id}
                        queueIds={tracks.map((t) => t.id)}
                        variant="playlist"
                        {columns}
                    />
                {/each}
            </ul>
        {/if}
        {#if albums?.length > 0}
            <h2 class="flex items-center py-4 text-2xl font-bold text-ink-800">
                <VinylRecord size={"1.75rem"} class="mr-2" />
                <span>Albums</span>
            </h2>
            <AlbumGrid {albums} />
        {/if}
        {#if artists?.length > 0}
            <h2 class="flex items-center py-4 text-2xl font-bold text-ink-800">
                <Users size={"1.75rem"} class="mr-2" />
                <span>Artists</span>
            </h2>
            <ArtistGrid {artists} />
        {/if}
        {#if !tracks?.length && !albums?.length && !artists?.length}
            <div class="flex flex-col items-center gap-4 py-12 text-center text-ink-500">
                <SmileySad size={"3rem"} />
                <p class="text-2xl">No results found for: "{query}"</p>
            </div>
        {/if}
    {/await}
</div>
