<script>
    import { MagnifyingGlass, X } from 'phosphor-svelte';
    import { goto } from '$app/navigation';
    import { debounce } from '$lib/utils/debounce';
    import { search3 } from '$lib/opensubsonic/api';
    import { cache } from '$lib/stores/cache.svelte';
    import SearchPanel from './SearchPanel.svelte';

    let searchQuery = $state('');
    let isOpen = $state(false);
    let isLoading = $state(false);
    let results = $state({ tracks: [], artists: [], albums: [] });
    let inputEl = $state(null);
    let containerEl = $state(null);

    const hasResults = $derived(
        results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0
    );

    // Search panel displays 8 max items, so we need to fetch 9 to ensure we know if more results are available
    const FETCH_COUNT = 9;

    async function runSearch(query) {
        if (!query.trim()) return;

        isLoading = true;
        isOpen = true;

        try {
            const raw = await search3(query.trim(), FETCH_COUNT, 0, FETCH_COUNT, 0, FETCH_COUNT, 0);
            if (!raw) return;

            raw.song?.forEach((s) => cache.setTrack(s));
            const [tracks, artists, albums] = await Promise.all([
                Promise.all((raw.song || []).map((s) => cache.getTrack(s.id))),
                Promise.all((raw.artist || []).map((a) => cache.getArtist(a.id))),
                Promise.all((raw.album || []).map((a) => cache.getAlbum(a.id)))
            ]);

            results = { tracks, artists, albums };
        } finally {
            isLoading = false;
        }
    }

    // Tracked so it can be cancelled
    const debouncedSearch = debounce(runSearch, 400);

    function handleInput(e) {
        searchQuery = e.target.value;
        if (searchQuery.trim()) {
            debouncedSearch(searchQuery);
        } else {
            results = { tracks: [], artists: [], albums: [] };
            isOpen = false;
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Enter' && searchQuery.trim()) navigateToFullResults();
        if (e.key === 'Escape') {
            isOpen = false;
            inputEl?.blur();
        }
    }

    function navigateToFullResults(type = 'tracks') {
        if (!searchQuery.trim()) return;
        debouncedSearch.cancel();
        isOpen = false;
        goto(`/app/search?q=${encodeURIComponent(searchQuery.trim())}&type=${type}`, {
            keepFocus: true
        });
    }

    function clearSearch() {
        isOpen = false;
        results = { tracks: [], artists: [], albums: [] };
        searchQuery = '';
    }

    function handleWindowClick(e) {
        if (containerEl && !containerEl.contains(e.target)) isOpen = false;
    }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="relative w-1/2" bind:this={containerEl}>
    <div
        class="flex items-center rounded border-2 border-transparent bg-surface-10 px-2 transition-colors focus-within:border-primary-20"
        class:rounded-b-none={isOpen}
        class:focus-within:border-b-transparent={isOpen}
    >
        <MagnifyingGlass size="1.25rem" class="ml-2 flex-shrink-0 text-ink-800" />

        <input
            bind:this={inputEl}
            class="w-full border-none bg-transparent p-2 font-medium text-ink-800 placeholder-ink-500 focus:border-none focus:ring-0 focus:outline-none"
            type="text"
            placeholder="Search..."
            bind:value={searchQuery}
            oninput={handleInput}
            onkeydown={handleKeydown}
            onfocus={() => {
                if (isLoading || hasResults) {
                    isOpen = true;
                }
            }}
        />
        {#if searchQuery}
            <button
                onclick={clearSearch}
                class="flex-shrink-0 text-ink-500 transition-colors hover:text-primary-10"
                aria-label="Clear search"
            >
                <X size="1.25rem" />
            </button>
        {/if}
    </div>

    {#if isOpen}
        <SearchPanel
            {results}
            {isLoading}
            query={searchQuery}
            onViewAll={navigateToFullResults}
            onClose={() => (isOpen = false)}
        />
    {/if}
</div>
