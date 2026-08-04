<script>
    import ItemHeader from '$lib/components/item/ItemHeader.svelte';
    import ControlsRow from '$lib/components/tracks/ControlsRow.svelte';
    import DiscRow from '$lib/components/tracks/DiscRow.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';
    import FormattedArtists from '$lib/components/ui/FormattedArtists.svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import { formatDurationReadable } from '$lib/utils/format';
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

<div class="relative px-8 pt-2 pb-12">
    <div class="relative z-10 flex flex-col gap-4">
        <ItemHeader item={album}>
            {#snippet title()}
                <h2 class="break-words whitespace-normal">
                    {album.name}
                </h2>
                <h2 class="text-ink-800 italic">{album.version}</h2>
            {/snippet}
            {#snippet subtitle()}
                <FormattedArtists text={album.artistsStr} artistMap={album.artistIds} />
            {/snippet}
            {#snippet category()}
                {album.typeStr}
            {/snippet}
            {#snippet details()}
                {album.dateStr} • {album.songCount} tracks • {formatDurationReadable(album.duration)}
            {/snippet}
        </ItemHeader>

        <section in:fade={{ duration: 300 }} class="flex flex-col gap-4">
            <ControlsRow queue={$state.snapshot(albumQueue)} />
            {#if discEntries.length > 0}
                <ul class="overflow-y-hidden">
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
            {/if}
        </section>
    </div>
</div>
