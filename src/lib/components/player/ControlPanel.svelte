<script>
    import {
        Play,
        Pause,
        SkipBack,
        SkipForward,
        Shuffle,
        Queue,
        Repeat,
        Waveform
    } from 'phosphor-svelte';
    import { audio } from '$lib/audio/manager.svelte.js';
    import { audioState } from '$lib/stores/audio.svelte';
    import { ui } from '$lib/stores/ui.svelte';
    import Select from '$lib/components/ui//Select.svelte';
    import SliderVolume from '$lib/components/ui/SliderVolume.svelte';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import { visualizerStore } from '$lib/stores/visualizer.svelte';
    import { BarVisualizer } from '$lib/visualizers/bar';
    import PlaybackPanel from '../layout/PlaybackPanel.svelte';

    let { currentTrack } = $props();

    const visualizers = [
        { value: null, label: 'None' },
        { value: BarVisualizer, label: 'Bars' }
    ];

    function togglePlay() {
        if (audioState.playing) {
            audio.pause();
        } else {
            audio.resume();
        }
    }

    $effect(() => {
        audio.setVolume(audioState.volume);
    })
</script>

<div
    class="mt-4 rounded bg-surface-30/60 px-6 py-4 shadow-xl transition-all"
    style="width: 700px;"
    transition:slide={{ duration: 300 }}
>
    <div class="flex items-center justify-between gap-4 text-ink-700">
        <!-- Visualizer selector -->
        <div class="relative z-50 flex min-w-[160px] items-center gap-2">
            <Select items={visualizers} bind:value={visualizerStore.current} />
        </div>

        <!-- Playback controls -->
        <PlaybackPanel size={28} />

        <!-- Volume and Queue toggle -->
        <div class="flex min-w-[160px] items-center justify-end gap-2">
            <div class="w-28">
                <SliderVolume bind:value={audioState.volume} />
            </div>
            <button
                onclick={() => {
                    ui.showPlayQueue = !ui.showPlayQueue;
                }}
                class="mr-1 rounded p-1 transition-colors hover:bg-surface-10 hover:text-primary-10"
                class:text-primary-10={ui.showPlayQueue}
                title="Toggle queue"
            >
                <Queue size={28} />
            </button>
        </div>
    </div>
</div>
