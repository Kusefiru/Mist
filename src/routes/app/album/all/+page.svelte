<!-- src/routes/app/album/all/+page.svelte -->
<script>
    import { Heart, SortAscending, SortDescending } from 'phosphor-svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import {
        sortByArtist,
        sortByDateAdded,
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
        { value: sortByArtist, label: 'Artist' },
        { value: sortByDuration, label: 'Duration' },
        { value: sortByName, label: 'Name' },
        { value: sortByRandom, label: 'Random' },
        { value: sortByDateAdded, label: 'Recently added' },
        { value: sortByDateReleased, label: 'Release Date' }
    ];

    let sortByFunc = $state(sortByDateAdded);
    let sortOrder = $state('asc');
    let filterFavorite = $state(false);

    const libraries = $derived.by(() =>
        Array.from(cache.folders, (f) => ({ value: f[0], label: f[1] }))
    );
    let selectedLibraries = $derived(Array.from(cache.folders.keys()));

    const filters = $derived({
        libraries: new Set(selectedLibraries),
        starred: filterFavorite
    });

    const albums = $derived.by(() =>
        cache.getFilteredAlbums(sortByFunc, $state.snapshot(filters), sortOrder)
    );
</script>

<div class="overflow-auto px-8 pt-2 pb-10">
    <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold text-ink-900">Albums</h2>
            <div
                class="rounded bg-primary-20 px-1 text-sm font-semibold text-ink-100 select-none dark:text-ink-900"
            >
                {albums.length}
            </div>
        </div>
        <div class="flex items-center gap-2 text-base text-ink-900">
            Sort by:
            <Select items={sortOptions} bind:value={sortByFunc} />
            <button
                onclick={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
                class="mr-1 rounded p-1 transition-colors hover:bg-surface-40 hover:text-primary-10"
                title={sortOrder}
            >
                {#if sortOrder === 'asc'}
                    <SortAscending size={'1.5rem'} />
                {:else}
                    <SortDescending size={'1.5rem'} />
                {/if}
            </button>
            <button
                onclick={() => (filterFavorite = !filterFavorite)}
                class="mr-1 rounded p-1 transition-colors hover:bg-surface-40 hover:text-primary-10"
                class:text-primary-10={filterFavorite}
                title="Favorites"
            >
                <Heart size={'1.5rem'} weight={filterFavorite ? 'fill' : 'regular'} />
            </button>
            {#if libraries.length > 1}
                Libraries:
                <MultiSelect items={libraries} bind:value={selectedLibraries} />
            {/if}
        </div>
    </div>
    {#if albums.length > 0}
        <AlbumGrid {albums} />
    {:else}
        <div
            class="flex flex-col items-center gap-4 py-12 text-center font-medium text-ink-500 select-none"
        >
            <span>No album match set filters.</span>
        </div>
    {/if}
</div>
