<script>
    import { MusicNotesSimple, Users, VinylRecord } from 'phosphor-svelte';
    import AlbumGrid from '$lib/components/album/AlbumGrid.svelte';
    import ArtistGrid from '$lib/components/artist/ArtistGrid.svelte';
    import ArtistHeader from '$lib/components/artist/ArtistHeader.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';

    import * as api from '$lib/opensubsonic/api';
    import { cache } from '$lib/stores/cache.svelte';
    import { untrack } from 'svelte';
    import { fade } from 'svelte/transition';

    let { params } = $props();

    let columns = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];

    /* Content states */
    let artist = $state(null);
    let biography = $state('');
    let albumsMain = $state([]);
    let albumsAppear = $state([]);
    let topTrackIds = $state([]);
    let similarArtists = $state([]);

    /* This function clears state so that switching artist does not look weird */
    function clearState() {
        artist = null;
        biography = '';
        albumsMain = [];
        albumsAppear = [];
        topTrackIds = [];
        similarArtists = [];
    }

    async function loadArtist(artistId) {
        const parser = new DOMParser();

        artist = await cache.getArtist(artistId);

        const topTracks = await cache.getTopTracks(artist.name);
        topTrackIds = topTracks.map((t) => t.id);

        const artistInfo = await api.getArtistInfo2(artist.id, { count: 8 });
        // Sanitize biography (remove external links)
        const bio_html = parser.parseFromString(artistInfo.biography || '', 'text/html');
        bio_html.querySelectorAll('a').forEach((a) => a.remove());
        biography = bio_html.body.innerHTML;

        const albums = artist.albumIds?.map((id) => cache.albums.get(id)).filter(Boolean);
        albumsMain = albums.filter((al) => al.artistIds.some((ar) => ar.id === artist.id));
        albumsAppear = albums.filter((a) => !albumsMain.includes(a));

        similarArtists = [];
        artistInfo.similarArtist?.forEach((a) =>
            cache.getArtist(a.id).then((artist) => {
                similarArtists.push(artist);
            })
        );
    }

    $effect(() => {
        const artistId = params.artist_id;
        clearState();
        untrack(() => loadArtist(artistId));
    });
</script>

<div class="relative overflow-auto px-8 pt-2 pb-12">
    <div class="relative z-10 flex flex-col gap-4">
        <ArtistHeader {artist} />
        {#if biography}
            <span
                in:fade={{ duration: 300 }}
                class="mx-16 rounded bg-surface-20 p-4 text-lg text-ink-700 select-none"
                >{@html biography}</span
            >
        {/if}
        {#if topTrackIds.length > 0}
            <div in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center text-2xl font-bold text-ink-800">
                    <MusicNotesSimple size={'1.75rem'} class="mr-2" />
                    <span>Top tracks</span>
                </h2>
                <ul>
                    <HeaderRow {columns} />
                    {#each topTrackIds as trackId}
                        <TrackRow
                            {trackId}
                            queueIds={topTrackIds}
                            variant="playlist"
                            {columns}
                        />
                    {/each}
                </ul>
            </div>
        {/if}
        {#if albumsMain.length > 0}
            <div in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center text-2xl font-bold text-ink-800">
                    <VinylRecord size={'1.75rem'} class="mr-2" />
                    <span>Albums</span>
                </h2>
                <AlbumGrid albums={albumsMain} options={{ showDate: true }} />
            </div>
        {/if}
        {#if albumsAppear.length > 0}
            <div in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center text-2xl font-bold text-ink-800">
                    <VinylRecord size={'1.75rem'} class="mr-2" />
                    <span>Appears on</span>
                </h2>
                <AlbumGrid albums={albumsAppear} options={{ showDate: true }} />
            </div>
        {/if}
        {#if similarArtists.length > 0}
            <div in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center text-2xl font-bold text-ink-800">
                    <Users size={'1.75rem'} class="mr-2" />
                    <span>Similar Artists</span>
                </h2>
                <ArtistGrid artists={similarArtists} />
            </div>
        {/if}
    </div>
</div>
