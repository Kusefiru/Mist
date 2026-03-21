<script>
    import {
        CaretUp,
        Play,
        Pause,
        SkipBack,
        SkipForward,
        Shuffle,
        Queue,
        Repeat
    } from 'phosphor-svelte';

    import Slider from '$lib/components/ui/Slider.svelte';
    import SliderVolume from '$lib/components/ui/SliderVolume.svelte';
    import FormattedArtists from '$lib/components/ui/FormattedArtists.svelte';

    import { audio } from '$lib/audio/manager.svelte.js';
    import { audioState } from '$lib/stores/audio.svelte';
    import { ui } from '$lib/stores/ui.svelte';
    import { formatDuration } from '$lib/utils/format';
    import { cache } from '$lib/stores/cache.svelte';
    import PlaybackPanel from '../layout/PlaybackPanel.svelte';
    import TrackCard from '../tracks/TrackCard.svelte';

    const currentTrack = $derived(cache.tracks.get(audioState.currentTrackId));
    const totalTime = $derived(currentTrack?.duration || null);
    const currentTime = $derived(audioState.progress || null);

    $effect(() => {
        audio.setVolume(audioState.volume);
    });
</script>

<div class="flex h-[6.5rem] w-full items-center px-4">
    <!-- Left: Cover Art + Track Info -->
    <div class="flex w-[28%]">
        {#if currentTrack}
            <TrackCard track={currentTrack} />
        {/if}
    </div>

    <!-- Center: Controls and Progress Bar -->
    <div class="relative flex w-[44%] min-w-0 flex-col items-center justify-center select-none">
        <PlaybackPanel size={"1.75rem"} />
        <div class="flex w-full items-center gap-2 pt-2">
            <span class="shrink-0 text-sm text-ink-700"
                >{formatDuration(currentTrack ? currentTime : null)}</span
            >
            <Slider
                value={totalTime ? (currentTime / totalTime) * 100 : 0}
                onValueCommit={(v) => audio.seek(v / 100)}
            />
            <span class="shrink-0 text-sm text-ink-700"
                >{formatDuration(currentTrack ? totalTime : null)}</span
            >
        </div>
    </div>

    <!-- Right: (Optional space for future features or keep empty) -->
    <div class="flex w-[28%] min-w-0 items-center gap-4">
        <div class="flex w-full items-center justify-end gap-2 text-ink-800">
            <!-- TODO: Make as a single component -->
            <div class="w-36 px-2">
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
                <Queue size={"1.75rem"} />
            </button>
            <button
                onclick={() => {
                    ui.showFullscreenPlayer = !ui.showFullscreenPlayer;
                }}
                disabled={!currentTrack}
                class="mr-1 rounded p-1 transition-colors hover:bg-surface-10 hover:text-primary-10 disabled:text-ink-600"
                title="Fullscreen mode"
            >
                <CaretUp size={"1.75rem"} />
            </button>
        </div>
    </div>
</div>
