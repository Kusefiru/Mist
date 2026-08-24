<script>
    import { GearSix, SmileySad, TrashSimple } from 'phosphor-svelte';
    import { goto } from '$app/navigation';
    import ItemHeader from '$lib/components/item/ItemHeader.svelte';
    import ControlsRow from '$lib/components/tracks/ControlsRow.svelte';
    import TrackList from '$lib/components/tracks/TrackList.svelte';
    import CollapsibleText from '$lib/components/ui/CollapsibleText.svelte';

    import { cache } from '$lib/stores/cache.svelte';
    import { formatDurationReadable } from '$lib/utils/format';
    import { fade } from 'svelte/transition';
    import { untrack } from 'svelte';
    import { modal } from '$lib/stores/modal.svelte.js';
    import { buildAddToPlaylistGroup } from '$lib/components/ui/menu/actions/playlist';
    import PlaylistEditModal from '$lib/components/ui/modal/PlaylistEditModal.svelte';
    import ConfirmModal from '$lib/components/ui/modal/ConfirmModal.svelte';
    import toast from 'svelte-french-toast';

    let { params } = $props();

    let columns = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];

    let menuActions = $derived.by(() => {
        return [
            buildAddToPlaylistGroup(playlist.songIds),
            (playlist.isEditableBy(cache.user.id)
                ? [
                    {
                        icon: GearSix,
                        label: 'Edit playlist',
                        handler: () => {
                            modal.open(PlaylistEditModal, {
                                playlist,
                                onConfirm: () => loadPlaylist(playlist.id)
                            })
                        }
                    },
                    {
                        icon: TrashSimple,
                        label: 'Delete playlist',
                        handler: () => {
                            modal.open(ConfirmModal, {
                                title: 'Delete playlist?',
                                message: `"${playlist.name}" will be permanently deleted. This cannot be undone.`,
                                confirmLabel: 'Delete',
                                danger: true,
                                onConfirm: deletePlaylist
                            })
                        }
                    }
                ]
                : []
            )
        ];
    });

    /* Content states */
    let playlist = $state(null);

    /* This function clears state so that switching album does not look weird */
    function clearState() {
        playlist = null;
    }

    async function loadPlaylist(playlistId) {
        playlist = await cache.getPlaylist(playlistId);
    }

    async function deletePlaylist() {
        await cache.deletePlaylist(playlist.id);
        toast.success('Playlist deleted.');
        modal.close();
        goto(`/app/playlist/all`);
    }

    $effect(() => {
        const playlistId = params.playlist_id;
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
            <ControlsRow queue={$state.snapshot(playlist.songIds)} {menuActions} />
            {#if playlist.comment}
                <CollapsibleText html={playlist.comment} lines={2} />
            {/if}
            {#if playlist.songCount > 0}
                <div in:fade={{ duration: 300 }} class="flex-1 overflow-x-hidden overflow-y-auto">
                    <TrackList tracks={{ '': playlist.songIds }} sourceId={playlist.id} variant="playlist" {columns} />
                </div>
            {:else}
                <div class="flex flex-col items-center py-12 text-center text-ink-500">
                    <SmileySad size={'3rem'} />
                    <p class="text-xl">Looks like this playlist is empty.</p>
                </div>
            {/if}
        {/if}
    </div>
</div>
