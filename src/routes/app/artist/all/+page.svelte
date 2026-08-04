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

    import ItemGrid from '$lib/components/item/ItemGrid.svelte';
    import Select from '$lib/components/ui/Select.svelte';

    const sortOptions = [
        { value: sortByName, label: 'Name' },
        { value: sortByRandom, label: 'Random' }
    ];

    let sortByFunc = $state(sortByName);
    let sortOrder = $state('asc');
    let filterFavorite = $state(false);

    const filters = $derived({
        starred: filterFavorite
    });

    const artists = $derived.by(() => cache.getFilteredArtists(sortByFunc, filters, sortOrder));
</script>

<div class="overflow-auto px-8 pt-2 pb-10">
    <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold text-ink-900">Artists</h2>
            <div
                class="rounded bg-primary-20 px-1 text-sm font-semibold text-ink-100 select-none dark:text-ink-900"
            >
                {artists.length}
            </div>
        </div>
        <div class="flex items-center gap-2 text-base font-normal text-ink-900">
            Sort by:
            <Select items={sortOptions} bind:value={sortByFunc} />
            <button
                onclick={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
                class="mr-1 rounded p-1 transition-colors hover:bg-surface-40 hover:text-primary-10"
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
        </div>
    </div>
    {#if artists.length > 0}
        <ItemGrid items={artists} getHref={(artist) => `/app/artist/${artist.id}`} >
            {#snippet subtitle(artist)}
                {artist.albumCount} releases
            {/snippet}
        </ItemGrid>
    {:else}
        <div
            class="flex flex-col items-center gap-4 py-12 text-center font-medium text-ink-500 select-none"
        >
            <span>No artist match set filters.</span>
        </div>
    {/if}
</div>
