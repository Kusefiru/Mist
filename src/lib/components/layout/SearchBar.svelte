<script>
    import { MagnifyingGlass, X } from 'phosphor-svelte';
    import { goto } from '$app/navigation';
    import { debounce } from '$lib/utils/debounce';

    let searchQuery = $state('');

    const debouncedSearch = debounce((query) => {
        if (query.trim()) {
            goto(`/app/search?q=${encodeURIComponent(query.trim())}`, { keepFocus: true });
        }
    }, 500);

    function handleSearchInput(e) {
        searchQuery = e.target.value;
        debouncedSearch(searchQuery);
    }

    function handleSearchKeydown(e) {
        // Immediate search on Enter key
        if (e.key === 'Enter' && searchQuery.trim()) {
            goto(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`, { keepFocus: true });
        }
    }

    function clearSearch() {
        searchQuery = '';
    }
</script>

<div class="w-1/2 space-x-2">
    <div
        class="flex items-center rounded border-1 border-transparent bg-surface-20 px-2 transition-colors focus-within:border-primary-10"
    >
        <MagnifyingGlass size={"1.5rem"} class="flex-shrink-0 text-ink-800" />
        <input
            class="max-w w-full border-none bg-transparent text-ink-800 placeholder-ink-400 focus:border-none focus:ring-0 focus:outline-none"
            type="text"
            placeholder="Search..."
            bind:value={searchQuery}
            oninput={handleSearchInput}
            onkeydown={handleSearchKeydown}
        />
        {#if searchQuery}
            <button
                onclick={clearSearch}
                class="flex-shrink-0 text-ink-400 transition-colors hover:text-primary-10"
                aria-label="Clear search"
            >
                <X size={"1.5rem"} />
            </button>
        {/if}
    </div>
</div>
