<script>
    import { tick, untrack } from 'svelte';
    import DiscRow from './DiscRow.svelte';
    import HeaderRow from './HeaderRow.svelte';
    import TrackRow from './TrackRow.svelte';

    let {
        tracks, // Dict of {section: trackId[]}
        sourceId = "", // Origin of the tracks (album ID, ...)
        variant = 'album',
        columns = ['track', 'title', 'duration', 'quality', 'starred', 'actions'],
        scrollToId = null, // Where to scroll if needed
        initialCount = undefined // How much tracks to show initially
    } = $props();

    const queueIds = $derived(Object.values(tracks).flat());

    const rows = $derived.by(() => {
        const result = [];
        let index = 0;
        for (const [key, trackIds] of Object.entries(tracks)) {
            if (key !== '' && Object.keys(tracks).length > 1) {
                result.push({ type: 'disc', disc: key });
            }
            for (const trackId of trackIds) {
                result.push({ type: 'track', trackId, index });
                index++;
            }
        }
        return result;
    });

    // Expand logic
    let expanded = $state(false);

    const visibleRows = $derived.by(() => {
        if (initialCount == null) return rows;
        let count = 0;
        const result = [];
        for (const row of rows) {
            if (row.type === 'track') {
                if (!expanded && count >= initialCount) break;
                count++;
            }
            result.push(row);
        }
        return result;
    });

    // Scroll logic
    let scrollContainer = $state(null);

    $effect(() => {
        // Trigger on mount
        if (scrollContainer) {
            // Tick to wait for scrollContainer to exist
            // Untrack to avoid scrollContainer changes from calling this
            tick().then(() =>
                untrack(() =>
                    scrollContainer?.scrollIntoView({ block: 'center', behavior: 'smooth' })
                )
            );
        }
    });

    function scrollRef(node, trackId) {
        $effect(() => {
            if (scrollToId && trackId === scrollToId) {
                scrollContainer = node;
            }
        });
    }
</script>

<ul class="overflow-y-hidden">
    <HeaderRow {columns} />
    {#each visibleRows as row}
        {#if row.type === 'disc'}
            <DiscRow disc={row.disc} />
        {:else}
            <!-- Note: we use trackId for reference which could be an issue if tracks are duplicated.
                 However, only album support scrolling to a given track (and an album should not have duplicate trackIds).
            -->
            <li use:scrollRef={row.trackId}>
                <TrackRow
                    trackId={row.trackId}
                    {sourceId}
                    {queueIds}
                    index={row.index}
                    {variant}
                    {columns}
                />
            </li>
        {/if}
    {/each}
</ul>
{#if initialCount && queueIds.length > initialCount}
    <button
        onclick={() => (expanded = !expanded)}
        class="mt-2 flex text-sm font-bold text-ink-500 transition-colors hover:text-primary-10"
    >
        {expanded ? 'Show less' : 'Show more'}
    </button>
{/if}
