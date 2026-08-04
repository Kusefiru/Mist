<script>
    import { SmileySad } from 'phosphor-svelte';
    import ItemHeader from '$lib/components/item/ItemHeader.svelte';
    import ControlsRow from '$lib/components/tracks/ControlsRow.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import { formatDurationReadable } from '$lib/utils/format';
    import { untrack } from 'svelte';
    import { fade } from 'svelte/transition';

    let { params } = $props();

    let columns = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];

    /* Content states */
    let playlist = $state(null);

    /* This function clears state so that switching album does not look weird */
    function clearState() {
        playlist = null;
    }

    async function loadPlaylist(playlistId) {
        playlist = await cache.getArtistRadio(playlistId);
    }

    $effect(() => {
        const playlistId = params.artist_id;
        clearState();
        untrack(() => loadPlaylist(playlistId));
    });
</script>

<div class="relative px-8 pt-2 pb-12">
    <div class="relative z-10 flex flex-col gap-4">
        <ItemHeader item={playlist}>
            {#snippet title()}
                <h2 class="break-words whitespace-normal">
                    {playlist.name}
                </h2>
            {/snippet}
            {#snippet category()}
                Playlist
            {/snippet}
            {#snippet details()}
                {playlist.songCount} tracks • {formatDurationReadable(playlist.duration)}
            {/snippet}
        </ItemHeader>

        {#if playlist}
            {#if playlist.songCount > 0}
                <ControlsRow queue={$state.snapshot(playlist.songIds)} />
            {/if}
            {#if playlist.songCount > 0}
                <div in:fade={{ duration: 300 }} class="flex-1 overflow-x-hidden overflow-y-auto">
                    <ul class="overflow-y-hidden">
                        <HeaderRow {columns} />
                        {#each playlist.songIds as trackId}
                            <TrackRow
                                {trackId}
                                queueIds={playlist.songIds}
                                variant="playlist"
                                {columns}
                            />
                        {/each}
                    </ul>
                </div>
            {:else}
                <div class="flex flex-col items-center py-12 text-center text-ink-500">
                    <SmileySad size={"3rem"} />
                    <p class="text-xl">Looks like this playlist is empty.</p>
                </div>
            {/if}
        {/if}
    </div>
</div>
