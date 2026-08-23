import { ListPlus, PlusCircle, Playlist } from 'phosphor-svelte';
import { cache } from '$lib/stores/cache.svelte';
import { modal } from '$lib/stores/modal.svelte.js';
import PlaylistEditModal from '$lib/components/ui/modal/PlaylistEditModal.svelte';
import toast from 'svelte-french-toast';

export function buildAddToPlaylistGroup(trackIds) {
    const ids = Array.isArray(trackIds) ? trackIds : [trackIds];
    const editablePlaylists = cache.getEditablePlaylists();

    return [
        {
            icon: ListPlus,
            label: 'Add to playlist',
            searchable: true,
            children: [
                [{
                    icon: PlusCircle,
                    label: 'New playlist...',
                    pinned: true,
                    handler: () => {
                        modal.open(PlaylistEditModal, { trackIds: ids });
                    }
                }],
                ...(editablePlaylists.length > 0
                    ? [
                        editablePlaylists.map((p) => ({
                            icon: Playlist,
                            label: p.name,
                            handler: () => {
                                cache.addToPlaylist(p.id, ids);
                                toast.success(
                                    ids.length > 1
                                        ? `Added ${ids.length} tracks to "${p.name}".`
                                        : `Added to "${p.name}".`
                                );
                            }
                        }))
                    ]
                    : [])
            ]
        }
    ];
}
