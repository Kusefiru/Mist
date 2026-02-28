<script>
    import { cache } from '$lib/stores/cache.svelte';
    import { audio } from '$lib/audio/manager.svelte.js';
    import { audioState } from '$lib/stores/audio.svelte';
    import { formatDuration } from '$lib/utils/format';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
    import { onMount } from 'svelte';

    let { currentTrack } = $props();

    const totalTime = $derived(currentTrack?.duration || null);
    const currentTime = $derived(audioState.progress || null);

    let coverSize = $state(350);
    const padding = 32; // 8 * 4 (p-8)
    const progressHeight = 48; // Approximate height for progress bar section

    // Calculate card dimensions based on cover size
    const cardHeight = $derived(coverSize + padding * 2 + progressHeight);
    const cardWidth = $derived(coverSize * 2 + padding * 3); // Cover + gap + info area

    onMount(() => {
        const updateSize = () => {
            const vh = window.innerHeight;
            const vw = window.innerWidth;

            // Scale cover art based on screen size
            if (vw < 1400 || vh < 800) {
                coverSize = 360;
            } else if (vw < 1800 || vh < 1000) {
                coverSize = 400;
            } else {
                coverSize = 460;
            }
            console.log(coverSize);
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    });
</script>

<div
    class="flex flex-col rounded bg-surface-30/70 p-8 shadow-xl transition-all select-none"
    style="width: {cardWidth}px; height: {cardHeight}px;"
>
    <!-- Cover art and track info - horizontal layout -->
    <div class="flex min-h-0 flex-1 gap-8">
        <div
            class="flex flex-shrink-0 items-center justify-center"
            style="height: {coverSize}px; width: {coverSize}px;"
        >
            <FadeImage
                class="max-h-full max-w-full rounded object-contain"
                src={cache.getCoverArt(currentTrack.coverArtId, 2048)}
                alt={currentTrack?.title}
            />
        </div>

        <div class="flex min-w-0 flex-1 flex-col justify-end gap-2" style="height: {coverSize}px;">
            <h2 class="text-3xl font-bold text-ink-900">
                {currentTrack.title}
            </h2>
            <h3 class="text-xl text-ink-800">
                {currentTrack.artistsStr}
            </h3>
            <h3 class="text-xl font-semibold text-ink-700">
                {currentTrack.album}
            </h3>
        </div>
    </div>

    <!-- Progress bar spanning full width -->
    <div class="mt-6">
        <div class="flex items-center gap-3">
            <span class="min-w-[45px] shrink-0 text-right text-sm text-ink-700">
                {formatDuration(currentTrack ? currentTime : null)}
            </span>
            <ProgressBar
                value={totalTime ? (currentTime / totalTime) * 100 : 0}
                onValueCommit={(v) => audio.seek(v)}
            />
            <span class="min-w-[45px] shrink-0 text-left text-sm text-ink-700">
                {formatDuration(currentTrack ? totalTime : null)}
            </span>
        </div>
    </div>
</div>
