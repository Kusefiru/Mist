<script>
    import { cache } from '$lib/stores/cache.svelte';
    import { scale } from 'svelte/transition';
    import toast from 'svelte-french-toast';

    let {
        playlist = null, // null if a new playlist
        trackIds = [], // tracks to add, if any
        onConfirm,
        onClose
    } = $props();

    const isEditing = $derived(!!playlist);

    let name = $derived(playlist?.name ?? '');
    let comment = $derived(playlist?.comment ?? '');
    let isPublic = $state(true);
    let processing = $state(false);

    async function handleEdit() {
        if (!name.trim() && !isEditing) {
            toast.error('Please enter a playlist name');
            return;
        }
        processing = true;
        try {
            const p = await cache.editPlaylist(
                playlist?.id ?? null,
                name.trim(),
                comment.trim(),
                isPublic,
                trackIds
            );
            if (p) {
                toast.success(`Playlist "${p.name}" ${isEditing ? 'edited' : 'created'}.`);
                onConfirm?.(p.id);
                onClose();
            } else {
                toast.error(`Failed to ${isEditing ? 'edit' : 'create'} playlist.`);
            }
        } finally {
            processing = false;
        }
    }
</script>

<div
    class="flex flex-col rounded bg-surface-40 p-6 shadow-xl shadow-neutral-950/50"
    style="width: 480px;"
    transition:scale={{ duration: 200, start: 0.95 }}
    onclick={(e) => e.stopPropagation()}
>
    <h2 class="mb-4 text-xl font-bold text-ink-900">
        {isEditing ? 'Edit playlist' : 'New playlist'}
    </h2>

    <div class="flex flex-col gap-2">
        <label class="block text-base font-medium text-ink-800">Title</label>
        <input
            bind:value={name}
            type="text"
            placeholder={'Playlist'}
            disabled={processing}
            class="mb-2 w-full rounded border-2 border-transparent bg-surface-10 px-4 py-2 text-ink-800 placeholder-ink-500 focus-within:border-primary-20 focus:ring-0 focus:outline-none"
        />
        <label class="block text-base font-medium text-ink-800">Description (optional)</label>
        <textarea
            bind:value={comment}
            rows="4"
            disabled={processing}
            class="mb-2 w-full resize-y rounded border-2 border-transparent bg-surface-10 px-4 py-2 text-ink-800 placeholder-ink-500 focus-within:border-primary-20 focus:ring-0 focus:outline-none"
        ></textarea>
        <label class="flex items-center gap-2 text-base font-medium text-ink-800 select-none">
            <input
                type="checkbox"
                bind:checked={isPublic}
                disabled={processing}
                class="pointer-events-none rounded border-primary-10 text-primary-10 focus:ring-0 focus:outline-none"
            />
            Public
        </label>
    </div>

    <div class="mt-6 flex justify-end gap-2">
        <button
            onclick={onClose}
            disabled={processing}
            class="rounded px-4 py-1.5 font-medium text-ink-900 transition-colors hover:text-primary-20 disabled:opacity-50"
        >
            Cancel
        </button>
        <button
            onclick={handleEdit}
            disabled={processing}
            class="rounded bg-primary-10 px-4 py-1.5 font-medium text-ink-100 shadow-sm shadow-surface-50 transition-colors hover:bg-primary-20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-ink-900"
        >
            {processing ? 'Saving…' : isEditing ? 'OK' : 'Create'}
        </button>
    </div>
</div>
