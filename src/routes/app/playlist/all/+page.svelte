<!-- src/routes/app/album/all/+page.svelte -->
<script>
    import { SortAscending, SortDescending } from 'phosphor-svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import {
        sortByArtist,
        sortByDateAdded,
        sortByDateReleased,
        sortByDuration,
        sortByName,
        sortByRandom
    } from '$lib/utils/sorting';

    import PlaylistGrid from '$lib/components/playlist/PlaylistGrid.svelte';
    import Select from '$lib/components/ui/Select.svelte';

    const sortOptions = [
        { value: sortByName, label: 'Name' },
        { value: sortByDuration, label: 'Duration' },
        { value: sortByRandom, label: 'Random' }
    ];

    let sortByFunc = $state(sortByName);
    let sortOrder = $state('asc');
    let filters = $state({});
    let playlists = $derived.by(() => cache.getFilteredPlaylists(sortByFunc, filters, sortOrder));

    function toggleSortOrder() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
</script>

<div class="overflow-auto px-8 pt-2 pb-10">
    <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold text-ink-800">Playlists</h2>
            <div class="rounded bg-primary-20 px-1 text-sm font-semibold text-fill select-none">
                {playlists.length}
            </div>
        </div>
        <div class="flex items-center gap-2 text-base font-normal text-ink-800">
            Sort by:
            <Select items={sortOptions} bind:value={sortByFunc} />
            <button
                onclick={toggleSortOrder}
                class="mr-1 rounded p-1 transition-colors hover:bg-surface-30/50 hover:text-primary-10"
            >
                {#if sortOrder === 'asc'}
                    <SortAscending size={24} />
                {:else}
                    <SortDescending size={24} />
                {/if}
            </button>
        </div>
    </div>
    <PlaylistGrid {playlists} />
</div>
