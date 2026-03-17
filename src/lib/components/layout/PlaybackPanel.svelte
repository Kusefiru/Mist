<script>
    import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from 'phosphor-svelte';
    import { audioState } from '$lib/stores/audio.svelte';
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

<div class="flex items-center justify-center gap-2 text-ink-800">
    <button
        class="mx-2 rounded p-1 transition-colors hover:bg-surface-20 hover:text-primary-10"
        class:text-primary-10={audioState.shuffled}
        onclick={() => {
            audio.setShuffle(!audioState.shuffled);
        }}
        title="Shuffle"
    >
        <Shuffle {size} />
    </button>
    <button
        class="mr-3 rounded p-1 transition-colors hover:bg-surface-20 hover:text-primary-10"
        onclick={() => audio.previous()}
        title="Previous"
    >
        <SkipBack {size} />
    </button>
    <button
        onclick={togglePlay}
        class="rounded bg-primary-10 p-2 text-fill transition-colors hover:bg-primary-20"
        title={audioState.playing ? 'Pause' : 'Play'}
    >
        {#if audioState.playing}
            <Pause {size} weight="fill" />
        {:else}
            <Play {size} weight="fill" />
        {/if}
    </button>
    <button
        class="ml-3 rounded p-1 transition-colors hover:bg-surface-20 hover:text-primary-10"
        onclick={() => audio.next()}
        title="Next"
    >
        <SkipForward {size} />
    </button>
    <button
        class="mx-2 rounded p-1 transition-colors hover:bg-surface-20 hover:text-primary-10"
        class:text-primary-10={audioState.looping}
        onclick={() => {
            audioState.looping = !audioState.looping;
        }}
        title="Repeat"
    >
        <Repeat {size} />
    </button>
</div>
