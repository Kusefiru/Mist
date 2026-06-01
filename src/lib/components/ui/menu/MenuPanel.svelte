<script>
    import { CaretRight } from 'phosphor-svelte';
    import { floating } from '$lib/actions/floating';

    let {
        groups = [],
        depth = 0,
        activePath = [],
        onPathChange,
        onClose,
        // Parent menu item for submenus
        reference = null,
        // Only true for the root menu
        root = false
    } = $props();

    let activeIndex = $derived(activePath[depth] ?? -1);

    let flatItems = $derived(
        groups.flatMap((group, gi) =>
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
        offset: 4
    }}
    class:fixed={!root}
    class="panel z-50 w-max max-w-[24rem] min-w-[12rem] rounded bg-surface-40 p-1 shadow-lg shadow-neutral-950/50"
    onpointerleave={handlePanelPointerLeave}
>
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
                reference={itemRefs[flat]}
            />
        {/if}
    {/each}
</div>
