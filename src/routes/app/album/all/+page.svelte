<!-- src/routes/app/album/all/+page.svelte -->
<script>
    import { SortAscending, SortDescending } from 'phosphor-svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import {
        sortByArtist,
        sortByDateReleased,
        sortByDuration,
        sortByName,
        sortByRandom
    } from '$lib/utils/sorting';

    import AlbumGrid from '$lib/components/album/AlbumGrid.svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import MultiSelect from '$lib/components/ui/MultiSelect.svelte';
    import { SvelteMap } from 'svelte/reactivity';

    const sortOptions = [
        { value: sortByName, label: 'Name' },
        { value: sortByArtist, label: 'Artist' },
        { value: sortByDuration, label: 'Duration' },
        { value: sortByDateReleased, label: 'Release Date' },
        { value: sortByRandom, label: 'Random' }
    ];

    let sortByFunc = $state(sortByName);
    let sortOrder = $state('asc');
    let filters = new SvelteMap();
    let albums = $derived.by(() =>
        cache.getFilteredAlbums(sortByFunc, $state.snapshot(filters), sortOrder)
    );

    const libraries = $derived.by(() =>
        Array.from(cache.folders, (f) => ({ value: f[0], label: f[1] }))
    );
    let selectedLibraries = $state(Array.from(cache.folders.keys()));

    $effect(() => {
        filters.set('libraries', new Set(selectedLibraries));
    });

    function toggleSortOrder() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
</script>

<div class="overflow-auto px-8 pt-2 pb-10">
    <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold text-ink-800">Albums</h2>
            <div class="rounded bg-ink-500 px-1 text-sm font-semibold text-surface-10 select-none">
                {albums.length}
            </div>
        </div>
        <div class="flex items-center gap-2 text-base text-ink-800">
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
            Libraries:
            <MultiSelect items={libraries} bind:value={selectedLibraries} />
        </div>
    </div>
    <AlbumGrid {albums} />
</div>
