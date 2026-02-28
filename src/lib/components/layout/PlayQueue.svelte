<script>
    import { audio } from '$lib/audio/manager.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';
    import { audioState } from '$lib/stores/audio.svelte';

    let columns = ['cover', 'title', 'starred', 'actions'];

    // For autoscroll to currently playing track
    let scrollContainer = $state(null);
    let playingRow = $state(null);
    $effect(() => {
        // Trigger on track change
        audioState.index;
        playingRow?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });

    function scrollRef(node, i) {
        $effect(() => {
            if (audioState.playOrder[audioState.index] === i) {
                playingRow = node;
            }
        });
    }
</script>

<div class="flex h-full flex-col px-2">
    <div
        class="flex h-18 items-center justify-between px-2 text-xl font-bold text-ink-800 select-none"
    >
        <div class="flex items-center gap-2">
            <h3 class="text-xl font-bold text-ink-800">Play queue</h3>
            <div class="rounded bg-ink-600 px-1 text-sm font-semibold text-surface-30">
                {audioState.playQueue.length}
            </div>
        </div>
        <button
            onclick={() => audio.clearQueue()}
            class="flex cursor-pointer items-baseline-last text-sm font-bold text-primary-10 transition hover:text-primary-20 hover:underline"
        >
            Empty queue
        </button>
    </div>
    {#if audioState.playQueue.length > 0}
        <div bind:this={scrollContainer} class="flex-1 overflow-x-hidden overflow-y-auto">
            <ul class="pb-10">
                {#each audioState.playQueue as trackId, i}
                    <li use:scrollRef={i}>
                        <TrackRow {trackId} queueIndex={i} variant="queue" {columns} />
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
