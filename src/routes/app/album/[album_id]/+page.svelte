<script>
    import AlbumHeader from '$lib/components/album/AlbumHeader.svelte';
    import ControlsRow from '$lib/components/tracks/ControlsRow.svelte';
    import DiscRow from '$lib/components/tracks/DiscRow.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import { untrack } from 'svelte';
    import { fade } from 'svelte/transition';

    let { params } = $props();

    /* Content states */
    let album = $state(null);
    let discEntries = $state([]);
    let albumQueue = $state([]);

    /* This function clears state so that switching album does not look weird */
    function clearState() {
        album = null;
        discEntries = [];
        albumQueue = [];
    }

    async function loadAlbum(albumId) {
        album = await cache.getAlbum(albumId);

        const tracks = album.songIds
            .map((id) => cache.tracks.get(id))
            .sort((a, b) => (a.disc ?? 1) - (b.disc ?? 1) || a.track - b.track);

        const discs = {};
        for (const track of tracks) {
            const disc = track.disc ?? 1;
            if (!discs[disc]) discs[disc] = [];
            discs[disc].push(track.id);
        }
        discEntries = Object.entries(discs);

        albumQueue = discEntries.flatMap(([, t]) => t);
    }

    $effect(() => {
        const albumId = params.album_id;
        clearState();
        untrack(() => loadAlbum(albumId));
    });
</script>

<div class="relative overflow-auto px-8 pt-2 pb-12">
    <div class="relative z-10 flex flex-col text-ink-800">
        <AlbumHeader {album} />
        <ControlsRow queue={$state.snapshot(albumQueue)} />
        {#if discEntries.length > 0}
            <div in:fade={{ duration: 300 }} class="flex-1 overflow-x-hidden overflow-y-auto">
                <ul class="py-4">
                    <HeaderRow />
                    {#each discEntries as [disc, trackIds]}
                        {#if discEntries.length > 1}
                        <DiscRow {disc} />
                        {/if}
                        {#each trackIds as trackId}
                            <TrackRow {trackId} queueIds={albumQueue} variant="album" />
                        {/each}
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
</div>
