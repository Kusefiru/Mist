<script>
    import { Pause, Play, Repeat, RepeatOnce, Shuffle, SkipBack, SkipForward } from 'phosphor-svelte';
    import { audioState, RepeatMode } from '$lib/stores/audio.svelte';
    import { audio } from '$lib/audio/manager.svelte';

    let { size } = $props();

    function togglePlay() {
        if (audioState.playing) {
            audio.pause();
        } else {
            audio.resume();
        }
    }
</script>

<div class="flex items-center justify-center gap-2 text-ink-900">
    <button
        class="mx-2 rounded p-1 transition-colors hover:bg-surface-30 hover:text-primary-10"
        class:text-primary-10={audioState.shuffled}
        onclick={() => {
            audio.setShuffle(!audioState.shuffled);
        }}
        title="Shuffle"
    >
        <Shuffle {size} />
    </button>
    <button
        class="mr-3 rounded p-1 transition-colors hover:bg-surface-30 hover:text-primary-10"
        onclick={() => audio.previous()}
        title="Previous"
    >
        <SkipBack {size} />
    </button>
    <button
        onclick={togglePlay}
        class="rounded bg-primary-10 p-2 text-ink-100 transition-colors hover:bg-primary-20 dark:text-ink-900"
        title={audioState.playing ? 'Pause' : 'Play'}
    >
        {#if audioState.playing}
            <Pause {size} weight="fill" />
        {:else}
            <Play {size} weight="fill" />
        {/if}
    </button>
    <button
        class="ml-3 rounded p-1 transition-colors hover:bg-surface-30 hover:text-primary-10"
        onclick={() => audio.next()}
        title="Next"
    >
        <SkipForward {size} />
    </button>
    <button
        class="mx-2 rounded p-1 transition-colors hover:bg-surface-30 hover:text-primary-10"
        class:text-primary-10={audioState.repeat > RepeatMode.NONE}
        onclick={() => {
            audioState.repeat = (audioState.repeat + 1) % Object.keys(RepeatMode).length;
        }}
        title="Repeat"
    >
        {#if audioState.repeat == RepeatMode.TRACK}
            <RepeatOnce {size} />
        {:else}
            <Repeat {size} />
        {/if}
    </button>
</div>
