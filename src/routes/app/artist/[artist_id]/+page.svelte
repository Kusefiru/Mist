<script>
    import { MusicNotesSimple, Users, VinylRecord } from 'phosphor-svelte';
    import AlbumGrid from '$lib/components/album/AlbumGrid.svelte';
    import ArtistGrid from '$lib/components/artist/ArtistGrid.svelte';
    import ArtistHeader from '$lib/components/artist/ArtistHeader.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';

    import * as api from '$lib/opensubsonic/api';
    import { cache } from '$lib/stores/cache.svelte';

    let { params } = $props();

    let columns = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];

    async function loadArtist(artistId) {
        const parser = new DOMParser();

        const artist = await cache.getArtist(artistId);
        const [topTracks, artistInfo] = await Promise.all([
            cache.getTopTracks(artist.name),
            api.getArtistInfo2(artist.id, { count: 8 })
        ]);
        // Sanitize biography (remove external links)
        const biography = parser.parseFromString(artistInfo.biography || '', 'text/html');
        biography.querySelectorAll('a').forEach((a) => a.remove());
        // Get data for similar artists
        const similarArtists = await Promise.all(
            artistInfo.similarArtist?.map((a) => cache.getArtist(a.id)) || []
        );

        const albums = artist.albumIds?.map((id) => cache.albums.get(id)).filter(Boolean);
        const albumsMain = albums.filter((al) => al.artistIds.some((ar) => ar.id === artist.id));
        const albumsAppear = albums.filter((a) => !albumsMain.includes(a));

        return {
            artist,
            albumsMain,
            albumsAppear,
            topTracks,
            biography: biography.body.innerHTML,
            similarArtists
        };
    }

    const artistPromise = $derived(loadArtist(params.artist_id));
</script>

{#await artistPromise then { artist, albumsMain, albumsAppear, topTracks, biography, similarArtists }}
    <div class="relative overflow-auto px-8 pt-2 pb-12">
        <div class="relative z-10 flex flex-col gap-4">
            <ArtistHeader {artist} />
            {#if biography}
                <span class="mx-16 rounded bg-surface-20 p-4 text-lg text-ink-700 select-none"
                    >{@html biography}</span
                >
            {/if}
            {#if topTracks.length > 0}
                <h2 class="flex items-center text-2xl font-bold text-ink-800">
                    <MusicNotesSimple size={"1.75rem"} class="mr-2" />
                    <span>Top tracks</span>
                </h2>
                <ul>
                    <HeaderRow {columns} />
                    {#each topTracks as track}
                        <TrackRow
                            trackId={track.id}
                            queueIds={topTracks.map((t) => t.id)}
                            variant="playlist"
                            {columns}
                        />
                    {/each}
                </ul>
            {/if}
            {#if albumsMain.length > 0}
                <h2 class="flex items-center text-2xl font-bold text-ink-800">
                    <VinylRecord size={"1.75rem"} class="mr-2" />
                    <span>Albums</span>
                </h2>
                <AlbumGrid albums={albumsMain} options={{ showDate: true }} />
            {/if}
            {#if albumsAppear.length > 0}
                <h2 class="flex items-center text-2xl font-bold text-ink-800">
                    <VinylRecord size={"1.75rem"} class="mr-2" />
                    <span>Appears on</span>
                </h2>
                <AlbumGrid albums={albumsAppear} options={{ showDate: true }} />
            {/if}
            {#if similarArtists.length > 0}
                <h2 class="flex items-center text-2xl font-bold text-ink-800">
                    <Users size={"1.75rem"} class="mr-2" />
                    <span>Similar Artists</span>
                </h2>
                <ArtistGrid artists={similarArtists} />
            {/if}
        </div>
    </div>
{/await}
