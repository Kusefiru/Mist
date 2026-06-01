<script>
    import { audio } from '$lib/audio/manager.svelte';
    import TrackRow from '$lib/components/tracks/TrackRow.svelte';
    import { audioState } from '$lib/stores/audio.svelte';
    import { tick, untrack } from 'svelte';

    let columns = ['cover', 'title', 'starred', 'actions'];

    // For autoscroll to currently playing track
    let scrollContainer = $state(null);
    let playingRow = $state(null);

    $effect(() => {
        // Trigger on mount
        if (scrollContainer) {
            // Tick to wait for playingRow to exist
            // Untrack to avoid playingRow changes from calling this
            tick().then(() =>
                untrack(() => playingRow?.scrollIntoView({ block: 'start', behavior: 'instant' }))
            );
        }
    });

    $effect(() => {
        // Trigger on visibility change (when tab becomes visible again)
        function onVisibilityChange() {
            if (!document.hidden) {
                playingRow?.scrollIntoView({ block: 'start', behavior: 'instant' });
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    });

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
    <div class="flex h-[4rem] items-center justify-between px-2 text-xl select-none lg:h-[5rem]">
        <div class="flex items-center gap-2">
            <h3 class="text-xl font-bold text-ink-900">Play queue</h3>
            <div
                class="rounded bg-primary-20 px-1 text-sm font-semibold text-ink-100 dark:text-ink-900"
            >
                {audioState.playQueue.length}
            </div>
        </div>
        <button
            onclick={() => {
                audio.clearQueue();
                audio.stop();
            }}
            class="flex cursor-pointer items-baseline-last text-sm font-bold text-ink-600 transition-colors hover:text-primary-10"
        >
            Empty queue
        </button>
    </div>
    {#if audioState.playQueue.length > 0}
        <div bind:this={scrollContainer} class="flex-1 overflow-x-hidden overflow-y-auto">
            <ul class="pb-10">
                {#each audioState.playQueue as trackId, i}
                    <li use:scrollRef={i}>
                        {#key trackId}
                            <TrackRow {trackId} queueIndex={i} variant="queue" {columns} />
                        {/key}
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>
