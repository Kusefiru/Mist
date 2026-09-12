<script>
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    import { cache } from '$lib/stores/cache.svelte';
    import { audioState } from '$lib/stores/audio.svelte';
    import { BarVisualizer } from '$lib/visualizers/bar';

    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import Visualizer from './Visualizer.svelte';
    import { ui } from '$lib/stores/ui.svelte';

    let { showControls } = $props();

    const currentTrack = $derived(cache.tracks.get(audioState.currentTrackId));

    const coverArtId = $derived.by(() => {
        if (ui.stage.cover === 'album') {
            return cache.albums.get(currentTrack?.albumId)?.coverArtId;
        }

        if (ui.stage.cover === 'artist') {
            const artistId = currentTrack?.artistIds?.[0]?.id;
            return cache.artists.get(artistId)?.coverArtId;
        }

        return currentTrack?.coverArtId;
    });

    const coverOptions = [
        { value: 'track', label: 'Track' },
        { value: 'album', label: 'Album' },
        { value: 'artist', label: 'Artist' }
    ];

    const visualizerOptions = [{ value: 'bar', label: 'Bars', component: BarVisualizer }];
    const visualizer = $derived(
        visualizerOptions.find((v) => v.value === ui.stage.visualizer)?.component ?? BarVisualizer
    );

    let hoveringCover = $state(false);
    let hoveringVisualizer = $state(false);

    function setSelectedStage(stage) {
        ui.stage.mode = stage;
    }

    function selectCover(option) {
        ui.stage.mode = 'cover';
        ui.stage.cover = option;

        hoveringCover = false;
    }

    function selectVisualizer(value) {
        ui.stage.mode = 'visualizer';
        ui.stage.visualizer = value;

        hoveringVisualizer = false;
    }
</script>

<!-- Center content -->
{#key [ui.stage.mode, ui.stage.cover]}
    <div
        class="absolute inset-0 z-10 flex items-center justify-center p-16"
        transition:fade={{ duration: 300 }}
    >
        {#if ui.stage.mode === 'cover'}
            <div class="flex size-96 items-center justify-center xl:size-128 2xl:size-160">
                <FadeImage
                    src={cache.getCoverArt(coverArtId, 1024)}
                    alt={currentTrack?.title}
                    class="max-h-full max-w-full rounded-[0.4rem] object-contain shadow-2xl shadow-neutral-950/50"
                />
            </div>
        {:else if ui.stage.mode === 'visualizer'}
            <Visualizer visualizerClass={visualizer} />
        {:else if ui.stage.mode === 'lyrics'}
            <div class="text-xl font-medium text-ink-800 select-none">Lyrics coming soon.</div>
        {/if}
    </div>
{/key}

<!-- View selector -->
{#if showControls}
    <div
        class="fixed top-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 p-1 font-semibold text-ink-800 select-none"
        transition:fade={{ duration: 300 }}
    >
        <!-- Cover -->
        <div
            class="relative"
            onpointerenter={() => (hoveringCover = true)}
            onpointerleave={() => (hoveringCover = false)}
        >
            <button
                onclick={() => setSelectedStage('cover')}
                class="flex w-[6rem] cursor-pointer items-center justify-center px-3 py-1.5 text-base transition-colors hover:text-primary-10"
                class:text-primary-10={ui.stage.mode === 'cover'}
            >
                Cover
            </button>

            {#if hoveringCover}
                <div
                    class="absolute top-full right-0 z-10 w-[6rem] rounded bg-surface-10/70"
                    transition:fly={{
                        y: -6,
                        duration: 200,
                        easing: cubicOut
                    }}
                >
                    {#each coverOptions as option}
                        <button
                            onclick={() => selectCover(option.value)}
                            class="flex w-full cursor-pointer items-center justify-center rounded px-2 py-1.5 text-center text-base text-ink-900 transition-colors hover:text-primary-10"
                            class:text-primary-10={ui.stage.mode === 'cover' &&
                                ui.stage.cover === option.value}
                        >
                            {option.label}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <span>|</span>

        <!-- Visualizer -->
        <div
            class="relative"
            onpointerenter={() => (hoveringVisualizer = true)}
            onpointerleave={() => (hoveringVisualizer = false)}
        >
            <button
                onclick={() => setSelectedStage('visualizer')}
                class="flex w-[6rem] cursor-pointer items-center justify-center px-3 py-1.5 text-base transition-colors hover:text-primary-10"
                class:text-primary-10={ui.stage.mode === 'visualizer'}
            >
                Visualizer
            </button>

            {#if hoveringVisualizer}
                <div
                    class="absolute top-full right-0 z-10 w-[6rem] rounded bg-surface-10/70"
                    transition:fly={{
                        y: -6,
                        duration: 200,
                        easing: cubicOut
                    }}
                >
                    {#each visualizerOptions as option}
                        <button
                            onclick={() => selectVisualizer(option.value)}
                            class="flex w-full cursor-pointer items-center justify-center rounded px-2 py-1.5 text-center text-base text-ink-900 transition-colors hover:text-primary-10"
                            class:text-primary-10={ui.stage.mode === 'visualizer' &&
                                ui.stage.visualizer === option.value}
                        >
                            {option.label}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <span>|</span>

        <!-- Lyrics -->
        <button
            onclick={() => setSelectedStage('lyrics')}
            class="flex w-[6rem] cursor-pointer items-center justify-center px-3 py-1.5 text-base transition-colors hover:text-primary-10"
            class:text-primary-10={ui.stage.mode === 'lyrics'}
        >
            Lyrics
        </button>
    </div>
{/if}
