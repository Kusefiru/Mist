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
</script>

<ul class="overflow-y-hidden">
    <HeaderRow {columns} />
    {#each rows as row}
        {#if row.type === 'disc'}
            <DiscRow disc={row.disc} />
        {:else}
            <TrackRow
                trackId={row.trackId}
                queueIds={resolvedQueueIds}
                index={row.index}
                {variant}
                {columns}
            />
        {/if}
    {/each}
</ul>
