<script>
    import { CaretLeft, CornersIn, CornersOut, Queue } from 'phosphor-svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import { audio } from '$lib/audio/manager.svelte.js';
    import { audioState } from '$lib/stores/audio.svelte';
    import { ui } from '$lib/stores/ui.svelte';
    import { formatDuration } from '$lib/utils/format';

    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import Slider from '$lib/components/ui/Slider.svelte';
    import SliderVolume from '$lib/components/ui/SliderVolume.svelte';
    import PlaybackPanel from '$lib/components/layout/PlaybackPanel.svelte';
    import Stage from './Stage.svelte';
    import PlayQueue from '$lib/components/layout/PlayQueue.svelte';

    import { onMount } from 'svelte';
    import { fly, fade, scale } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    let { onClose } = $props();

    let fullscreenElement = $state(null);
    let isInBrowserFullscreen = $state(false);
    let showControls = $state(true);
    let hideControlsTimeout = $state(null);
    let visualizerContainer = $state(null);

    // If current track cover should appear
    const hideCurrentTrackCover = $derived(ui.stage.mode === 'cover' && ui.stage.cover === 'track');

    // Current cover (always use track cover)
    let currentCoverUrl = $state('');

    const currentTrack = $derived(cache.tracks.get(audioState.currentTrackId));
    const totalTime = $derived(currentTrack?.duration || null);
    const currentTime = $derived(audioState.progress || null);

    $effect(() => {
        if (currentTrack?.coverArtId) {
            currentCoverUrl = cache.getCoverArt(currentTrack.coverArtId, 1024);
        }
    });

    function toggleBrowserFullscreen() {
        if (!document.fullscreenElement) {
            fullscreenElement?.requestFullscreen?.() ||
                fullscreenElement?.webkitRequestFullscreen?.() ||
                fullscreenElement?.mozRequestFullScreen?.() ||
                fullscreenElement?.msRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() ||
                document.webkitExitFullscreen?.() ||
                document.mozCancelFullScreen?.() ||
                document.msExitFullscreen?.();
        }
    }

    function resetHideControlsTimer() {
        showControls = true;

        if (hideControlsTimeout) {
            clearTimeout(hideControlsTimeout);
        }

        hideControlsTimeout = setTimeout(() => {
            showControls = false;
        }, 3000);
    }

    onMount(() => {
        if (visualizerContainer) {
            const resizeObserver = new ResizeObserver(() => {
                window.dispatchEvent(new Event('resize'));
            });
            resizeObserver.observe(visualizerContainer);
        }

        const handleFullscreenChange = () => {
            isInBrowserFullscreen = !!document.fullscreenElement;
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        resetHideControlsTimer();

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

            if (hideControlsTimeout) {
                clearTimeout(hideControlsTimeout);
            }

            if (document.fullscreenElement) {
                document.exitFullscreen?.() ||
                    document.webkitExitFullscreen?.() ||
                    document.mozCancelFullScreen?.() ||
                    document.msExitFullscreen?.();
            }
        };
    });
</script>

<div
    bind:this={fullscreenElement}
    class="absolute inset-0 flex flex-col bg-surface-10"
    onmousemove={resetHideControlsTimer}
    onclick={resetHideControlsTimer}
    onwheel={resetHideControlsTimer}
    transition:fly={{ y: '100%', duration: 500, opacity: 100, easing: cubicOut }}
>
    <div bind:this={visualizerContainer} class="absolute inset-0">
        <!-- Background track cover -->
        <div class="absolute inset-0 z-0 overflow-hidden">
            {#key currentCoverUrl}
                <div
                    class="absolute inset-0 scale-110 bg-cover bg-center blur-lg"
                    style="background-image: url('{currentCoverUrl}');"
                    in:fade={{ duration: 600 }}
                    out:fade={{ duration: 600 }}
                ></div>
            {/key}

            <div class="absolute inset-0 z-5 bg-surface-10/50 dark:bg-surface-30/50"></div>
        </div>

        <!-- Top/Bottom gradient overlay -->
        <div
            class="pointer-events-none absolute top-0 right-0 left-0 z-0 h-48 bg-gradient-to-t from-transparent to-surface-50/70"
        ></div>
        <div
            class="pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-48 bg-gradient-to-b from-transparent to-surface-50/70"
        ></div>

        <Stage {showControls} />

        <div class="bg-grain absolute inset-0 z-15"></div>

        <div class="absolute inset-0 z-20">
            {#if showControls}
                <div
                    class="fixed top-8 left-8 z-30 flex items-center gap-2"
                    transition:fade={{ duration: 300 }}
                >
                    <button
                        onclick={onClose}
                        class="rounded p-2 text-ink-800 transition-colors hover:text-primary-10"
                        title="Back"
                    >
                        <CaretLeft size={'1.75rem'} />
                    </button>
                </div>
            {/if}

            <div class="fixed bottom-12 left-8 z-30 w-[40%]">
                {#if currentTrack}
                    <div class="flex items-end text-ink-900 select-none">
                        <div
                            class="flex aspect-square shrink-0 items-center justify-center overflow-hidden transition-[width,height,opacity] ease-out
                                   [--cover-size:8rem] xl:[--cover-size:10rem] 2xl:[--cover-size:12rem]"
                            class:mr-4={!hideCurrentTrackCover}
                            class:opacity-0={hideCurrentTrackCover}
                            style:height={hideCurrentTrackCover ? '0px' : 'var(--cover-size)'}
                            style:width={hideCurrentTrackCover ? '0px' : 'var(--cover-size)'}
                        >
                            <FadeImage
                                src={currentCoverUrl}
                                alt="Cover Art"
                                class="max-h-full max-w-full rounded object-contain"
                            />
                        </div>
                        <div class="flex min-w-0 flex-col">
                            <span
                                class="truncate text-2xl font-bold xl:text-4xl"
                                title={currentTrack.title}
                            >
                                {currentTrack.title}
                            </span>
                            <span
                                class="truncate text-xl font-semibold text-ink-800 xl:text-2xl"
                                title={currentTrack.artistsStr}
                            >
                                {currentTrack.artistsStr}
                            </span>
                            <span
                                class="font-base truncate text-xl text-ink-700 xl:text-2xl"
                                title={currentTrack.album}
                            >
                                {currentTrack.album}
                            </span>
                        </div>
                    </div>
                {/if}
            </div>

            {#if showControls}
                <div
                    class="fixed bottom-12 left-1/2 z-30 flex -translate-x-1/2 items-center"
                    transition:fade={{ duration: 300 }}
                >
                    <PlaybackPanel size={'1.75rem'} />
                </div>
            {/if}

            {#if showControls}
                <div
                    class="fixed right-8 bottom-12 z-30 flex flex-row items-center gap-4"
                    transition:fade={{ duration: 300 }}
                >
                    <button
                        onclick={() => (ui.stage.showPlayQueue = !ui.stage.showPlayQueue)}
                        class="rounded p-2 text-ink-800 transition-colors hover:text-primary-10"
                        class:text-primary-10={ui.stage.showPlayQueue}
                        title="Toggle queue"
                    >
                        <Queue size={'1.75rem'} />
                    </button>
                    <div class="w-[8rem]">
                        <SliderVolume bind:value={audioState.volume} size={'1.75rem'} />
                    </div>
                    <button
                        onclick={toggleBrowserFullscreen}
                        class="rounded p-2 text-ink-800 transition-colors hover:text-primary-10"
                        title={isInBrowserFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {#if isInBrowserFullscreen}
                            <CornersIn size={'1.75rem'} />
                        {:else}
                            <CornersOut size={'1.75rem'} />
                        {/if}
                    </button>
                </div>
            {/if}

            <div class="fixed right-8 bottom-4 left-8 z-30">
                <div class="flex items-center">
                    <span
                        class="shrink-0 overflow-hidden text-right text-sm text-ink-800 tabular-nums transition-[width,opacity]"
                        class:w-0={!showControls}
                        class:w-[3rem]={showControls}
                        class:opacity-0={!showControls}
                        class:mr-4={showControls}
                    >
                        {formatDuration(currentTrack ? currentTime : null)}
                    </span>
                    <Slider
                        value={totalTime ? (currentTime / totalTime) * 100 : 0}
                        onValueCommit={(v) => audio.seek(v / 100)}
                    />
                    <span
                        class="shrink-0 overflow-hidden text-left text-sm text-ink-800 tabular-nums transition-[width,opacity]"
                        class:w-0={!showControls}
                        class:w-[3rem]={showControls}
                        class:opacity-0={!showControls}
                        class:ml-4={showControls}
                    >
                        {formatDuration(currentTrack ? totalTime : null)}
                    </span>
                </div>
            </div>

            {#if ui.stage.showPlayQueue && showControls}
                <div
                    class="fixed top-8 right-6 bottom-26 z-40 m-2 w-[var(--min-queue-size)] rounded bg-surface-50/70 pb-2"
                    transition:fly={{ x: 380, duration: 300, easing: cubicOut }}
                >
                    <PlayQueue />
                </div>
            {/if}
        </div>
    </div>
</div>
