<script>
    import { CaretRight, MagnifyingGlass } from 'phosphor-svelte';
    import { floating } from '$lib/actions/floating';

    let {
        groups = [],
        depth = 0,
        activePath = [],
        onPathChange,
        onClose,
        // Contains a search bar
        searchable = false,
        // Parent menu item for submenus
        reference = null,
        // Only true for the root menu
        root = false
    } = $props();

    let searchQuery = $state('');
    let searchInputEl = $state(null);

    $effect(() => {
        if (searchable) searchInputEl?.focus();
    });

    let filteredGroups = $derived.by(() => {
        if (!searchable || !searchQuery.trim()) return groups;
        const q = searchQuery.trim().toLowerCase();
        return groups
            .map((group) => group.filter((action) => action.label?.toLowerCase().includes(q)))
            .filter((group) => group.length > 0);
    });

    let activeIndex = $derived(activePath[depth] ?? -1);

    let flatItems = $derived(
        filteredGroups.flatMap((group, gi) =>
            group.map((action, ai) => ({
                action,
                gi,
                flat: gi * 1000 + ai
            }))
        )
    );

    let itemRefs = $state({});

    function handlePanelPointerLeave() {
        // Remove submenus when leaving an item
        onPathChange(activePath.slice(0, depth));
    }

    function handleItemPointerEnter(flatIdx) {
        // Append submenus when entering an item
        onPathChange([...activePath.slice(0, depth), flatIdx]);
    }

    function handleAction(action) {
        // Actions with children should not have a handler
        if (action.children) return;

        action.handler?.();
        onClose();
    }
</script>

<div
    use:floating={{
        reference: !root ? reference : null,
        placement: 'right-start',
        offset: { mainAxis: 4, crossAxis : -4 }
    }}
    class:fixed={!root}
    class="panel z-50 w-max max-w-[14rem] min-w-[10rem] rounded bg-surface-40 p-1 shadow-lg shadow-neutral-950/50"
    onpointerleave={handlePanelPointerLeave}
>
    {#if searchable}
        <div class="mb-1 flex items-center gap-2 rounded-xs bg-surface-10 px-2 py-1.5">
            <MagnifyingGlass size="1rem" class="shrink-0 text-ink-500" />
            <input
                bind:this={searchInputEl}
                bind:value={searchQuery}
                type="text"
                placeholder="Search..."
                class="w-full border-none bg-transparent p-0 text-sm text-ink-900 placeholder-ink-500 focus:border-none focus:ring-0 focus:outline-none"
            />
        </div>
        {#if flatItems.length === 0}
            <div class="px-2 py-1.5 text-sm text-ink-500 select-none">No matches</div>
        {/if}
    {/if}

    {#each flatItems as { action, gi, flat }, i}
        {#if i > 0 && flatItems[i - 1].gi !== gi}
            <div class="mx-1 my-1 border-t border-ink-500" role="separator" />
        {/if}

        <button
            bind:this={itemRefs[flat]}
            class="item flex w-full cursor-pointer items-center gap-2 rounded-xs px-2 py-1.5 text-base text-ink-800 transition-colors hover:bg-surface-10 hover:text-primary-10"
            class:active={activeIndex === flat}
            onclick={() => handleAction(action)}
            onpointerenter={() => handleItemPointerEnter(flat)}
        >
            {#if action.icon}
                <action.icon size="1.25rem" class="shrink-0" />
            {/if}

            <span class="line-clamp-1 flex-1 text-left text-ink-900">
                {action.label}
            </span>

            {#if action.children}
                <CaretRight size="1rem" class="chevron shrink-0" />
            {/if}
        </button>

        {#if action.children && activeIndex === flat}
            <svelte:self
                groups={action.children}
                depth={depth + 1}
                {activePath}
                {onPathChange}
                {onClose}
                searchable={action.searchable}
                reference={itemRefs[flat]}
            />
        {/if}
    {/each}
</div>
