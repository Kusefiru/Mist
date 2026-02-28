<script>
    import { SmileySad } from 'phosphor-svelte';
    import PlaylistHeader from '$lib/components/playlist/PlaylistHeader.svelte';
    import ControlsRow from '$lib/components/tracks/ControlsRow.svelte';
    import HeaderRow from '$lib/components/tracks/HeaderRow.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';

    import { cache } from '$lib/stores/cache.svelte';

    let { params } = $props();

    let columns = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];

    async function loadPlaylist(playlistId) {
        await cache.ready();

        const playlist = await cache.getPlaylist(playlistId);

        return { playlist };
    }

    const playlistPromise = $derived(loadPlaylist(params.playlist_id));
</script>

{#await playlistPromise then { playlist }}
    <div class="relative overflow-hidden px-8 pt-2 pb-12">
        <div class="relative z-10 flex flex-col">
            <PlaylistHeader {playlist} />
            {#if playlist.songCount > 0}
                <ControlsRow queue={playlist.songIds} />
                <ul class="py-4">
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
            {:else}
                <div class="flex flex-col items-center gap-4 py-12 text-center text-ink-500">
                    <SmileySad size={40} />
                    <p class="text-xl">Looks like this playlist is empty.</p>
                </div>
            {/if}
        </div>
    </div>
{/await}
