<script>
    import { tick, untrack } from 'svelte';
    import DiscRow from './DiscRow.svelte';
    import HeaderRow from './HeaderRow.svelte';
    import TrackRow from './TrackRow.svelte';

    let {
        tracks, // Dict of {section: trackId[]}
        queueIds = null,
        variant = 'album',
        columns = ['track', 'title', 'duration', 'quality', 'starred', 'actions'],
        scrollToId = null // Where to scroll if needed
    } = $props();

    const resolvedQueueIds = $derived(queueIds ?? Object.values(tracks).flat());

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
    {#each rows as row}
        {#if row.type === 'disc'}
            <DiscRow disc={row.disc} />
        {:else}
            <!-- Note: we use trackId for reference which could be an issue if tracks are duplicated.
                 However, only album support scrolling to a given track (and an album should not have duplicate trackIds).
            -->
            <li use:scrollRef={row.trackId}>
                <TrackRow
                    trackId={row.trackId}
                    queueIds={resolvedQueueIds}
                    index={row.index}
                    {variant}
                    {columns}
                />
            </li>
        {/if}
    {/each}
</ul>
