<script>
    import { cache } from '$lib/stores/cache.svelte';
    import { audio } from '$lib/audio/manager.svelte.js';
    import { audioState } from '$lib/stores/audio.svelte';
    import { formatDuration } from '$lib/utils/format';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import Slider from '$lib/components/ui/Slider.svelte';
    import { onMount } from 'svelte';

    let { currentTrack } = $props();

    const totalTime = $derived(currentTrack?.duration || null);
    const currentTime = $derived(audioState.progress || null);
</script>

<div
    class="flex flex-col rounded bg-surface-30/70 p-8 shadow-xl transition-all select-none"
    style="width: calc(var(--fs-min-cover-size) * 2 + 2rem * 3); height: calc(var(--fs-min-cover-size) + 2rem * 2 + 3rem);"
>
    <!-- Cover art and track info - horizontal layout -->
    <div class="flex min-h-0 flex-1 gap-8">
        <div
            class="flex flex-shrink-0 items-center justify-center"
            style="height: var(--fs-min-cover-size); width: var(--fs-min-cover-size);"
        >
            <FadeImage
                class="max-h-full max-w-full rounded object-contain"
                src={cache.getCoverArt(currentTrack.coverArtId, 2048)}
                alt={currentTrack?.title}
            />
        </div>

        <div
            class="flex min-w-0 flex-1 flex-col justify-end gap-2"
            style="height: var(--fs-min-cover-size);"
        >
            <h2 class="text-2xl font-bold text-ink-900 lg:text-3xl">
                {currentTrack.title}
            </h2>
            <h3 class="line-clamp-1 text-lg text-ink-800 lg:text-xl">
                {currentTrack.artistsStr}
            </h3>
            <h3 class="line-clamp-2 text-lg font-semibold text-ink-700 lg:text-xl">
                {currentTrack.album}
            </h3>
        </div>
    </div>

    <!-- Progress bar spanning full width -->
    <div class="mt-6">
        <div class="flex items-center gap-3">
            <span class="min-w-[3rem] shrink-0 text-right text-sm text-ink-700">
                {formatDuration(currentTrack ? currentTime : null)}
            </span>
            <Slider
                value={totalTime ? (currentTime / totalTime) * 100 : 0}
                onValueCommit={(v) => audio.seek(v / 100)}
            />
            <span class="min-w-[3rem] shrink-0 text-left text-sm text-ink-700">
                {formatDuration(currentTrack ? totalTime : null)}
            </span>
        </div>
    </div>
</div>
