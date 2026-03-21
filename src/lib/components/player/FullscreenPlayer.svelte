<script>
    import { CaretDown, CornersIn, CornersOut } from 'phosphor-svelte';
    import { cache } from '$lib/stores/cache.svelte';
    import { audio } from '$lib/audio/manager.svelte.js';
    import { audioState } from '$lib/stores/audio.svelte';
    import { ui } from '$lib/stores/ui.svelte';
    import CenterCard from './CenterCard.svelte';
    import ControlPanel from './ControlPanel.svelte';
    import Visualizer from './Visualizer.svelte';
    import PlayQueue from '$lib/components/layout/PlayQueue.svelte';
    import { onMount } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { visualizerStore } from '$lib/stores/visualizer.svelte';

    let { onClose } = $props();

    let fullscreenElement = $state(null);
    let isInBrowserFullscreen = $state(false);
    let showControls = $state(true);
    let hideControlsTimeout = $state(null);
    let visualizerContainer = $state(null);
    // Covers
    let currentCoverUrl = $state('');

    const currentTrack = $derived(cache.tracks.get(audioState.currentTrackId));

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
        <div class="absolute inset-0 z-0 overflow-hidden">
            <!-- Previous cover art (fading out) -->
            {#key currentCoverUrl}
                <div
                    class="absolute inset-0 scale-110 bg-cover bg-center blur-lg"
                    style="background-image: url('{currentCoverUrl}');"
                    in:fade={{ duration: 600 }}
                    out:fade={{ duration: 600 }}
                ></div>
            {/key}

            <div
                class="absolute inset-0 z-5 bg-surface-10/40 dark:bg-surface-50/40 shadow-[inset_0_0_64px_oklch(from_var(--color-surface-30)_l_c_h_/_1.0)]"
            ></div>
        </div>

        <!-- Middle layer: Visualizer -->
        {#if visualizerStore.current}
            <Visualizer visualizerClass={visualizerStore.current} />
        {/if}

        <!-- Grain layer -->
        <div class="bg-grain absolute inset-0 z-15"></div>

        <!-- Top layer: Interface -->
        <div class="absolute inset-0 z-20">
            <!-- Top right buttons -->
            {#if showControls}
                <div
                    class="fixed top-6 z-50 flex items-center gap-3 transition-all"
                    class:right-6={!ui.showPlayQueue}
                    class:right-[calc(400px+1.5rem)]={ui.showPlayQueue}
                    transition:fade={{ duration: 300 }}
                >
                    <button
                        onclick={toggleBrowserFullscreen}
                        class="rounded p-2 text-ink-700 transition-colors hover:bg-surface-30/70 hover:text-primary-10"
                        title={isInBrowserFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {#if isInBrowserFullscreen}
                            <CornersIn size={"1.75rem"} />
                        {:else}
                            <CornersOut size={"1.75rem"} />
                        {/if}
                    </button>
                    <button
                        onclick={onClose}
                        class="rounded p-2 text-ink-700 transition-colors hover:bg-surface-30/70 hover:text-primary-10"
                        title="Reduce player"
                    >
                        <CaretDown size={"1.75rem"} />
                    </button>
                </div>
            {/if}

            <!-- Main content area - center card always centered -->
            <div class="flex h-full w-full items-center justify-center p-4">
                <div class="flex flex-col items-center">
                    <CenterCard {currentTrack} />
                    {#if showControls}
                        <ControlPanel {currentTrack} />
                    {/if}
                </div>
            </div>

            <!-- Play Queue Sidebar -->
            {#if ui.showPlayQueue && showControls}
                <div
                    class="fixed top-0 right-0 z-30 h-full w-[400px] bg-surface-30/70"
                    transition:fly={{ x: 380, duration: 300, easing: cubicOut }}
                >
                    <PlayQueue />
                </div>
            {/if}
        </div>
    </div>
</div>
