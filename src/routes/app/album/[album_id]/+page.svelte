<script>
    import AlbumHeader from '$lib/components/album/AlbumHeader.svelte';
    import ControlsRow from '$lib/components/tracks/ControlsRow.svelte';
    import DiscRow from '$lib/components/tracks/DiscRow.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import { untrack } from 'svelte';

    let { params } = $props();
    let albumPromise = $state(loadAlbum(params.album_id));

    async function loadAlbum(albumId) {
        const album = await cache.getAlbum(albumId);
        if (!album?.songIds) return { album, discEntries: [] };

        const tracks = album.songIds
            .map(id => cache.tracks.get(id))
            .sort((a, b) => (a.disc ?? 1) - (b.disc ?? 1) || a.track - b.track);

        const discs = {};
        for (const track of tracks) {
            const disc = track.disc ?? 1;
            if (!discs[disc]) discs[disc] = [];
            discs[disc].push(track.id);
        }
        const discEntries = Object.entries(discs);
        const albumQueue = discEntries.flatMap(([, t]) => t);

        return { album, discEntries, albumQueue };
    }

    $effect(() => {
        const albumId = params.album_id;
        albumPromise = untrack(() => loadAlbum(albumId));
    })
</script>

{#await albumPromise then { album, discEntries, albumQueue }}
    <div class="relative overflow-auto px-8 pt-2 pb-12">
        <div class="relative z-10 flex flex-col text-ink-800">
            <AlbumHeader {album} />
            <ControlsRow queue={albumQueue} />
            <div class="flex-1 overflow-x-hidden overflow-y-auto">
                <ul class="py-4">
                    <HeaderRow />
                    {#each discEntries as [disc, trackIds]}
                        <DiscRow {disc} />
                        {#each trackIds as trackId}
                            <TrackRow {trackId} queueIds={albumQueue} variant="album" />
                        {/each}
                    {/each}
                </ul>
            </div>
        </div>
    </div>
{/await}
