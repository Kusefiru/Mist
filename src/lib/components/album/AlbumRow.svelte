<script>
    import AlbumCard from './AlbumCard.svelte';
    import { CaretLeft, CaretRight } from 'phosphor-svelte';
import { remToPx } from '$lib/utils/pxmath';

    let { albums = [], title = '' } = $props();

    let scrollContainer = $state(null);
    let scrollOffset = $state(0);
    let cardWidth = $state(remToPx(12));
    let gap = 12; // gap-3 = 12px

    // Calculate how many cards can fit in the visible area
    let visibleCount = $state(4);

    // Derive whether we can scroll
    let canScrollLeft = $derived(scrollOffset > 0);
    let canScrollRight = $derived(scrollOffset + visibleCount < albums.length);

    function scrollLeft() {
        if (canScrollLeft) {
            scrollOffset = Math.max(0, scrollOffset - 2);
        }
    }

    function scrollRight() {
        if (canScrollRight) {
            scrollOffset = Math.min(albums.length - visibleCount, scrollOffset + 2);
        }
    }

    // Calculate visible count and card width based on container width
    $effect(() => {
        if (scrollContainer) {
            const updateDimensions = () => {
                const containerWidth = scrollContainer.clientWidth;
                const minCardWidth = remToPx(12);
                const count = Math.floor((containerWidth + gap) / (minCardWidth + gap));
                visibleCount = Math.max(1, count);
                cardWidth = (containerWidth - gap * (count - 1)) / count;
            };

            updateDimensions();
            const resizeObserver = new ResizeObserver(updateDimensions);
            resizeObserver.observe(scrollContainer);

            return () => resizeObserver.disconnect();
        }
    });

    // Calculate transform offset for smooth scrolling
    let translateX = $derived(-(scrollOffset * (cardWidth + gap)));
</script>

<div class="relative flex flex-col w-full gap-4">
    <!-- Title and navigation buttons -->
    <div class="flex items-center justify-between gap-2">
        <h2 class="text-2xl font-bold text-ink-800">{title}</h2>

        <div class="flex gap-4">
            <button
                onclick={scrollLeft}
                disabled={!canScrollLeft}
                class="rounded p-2 text-ink-800 transition-colors hover:bg-surface-20 hover:text-primary-10 disabled:text-ink-400 disabled:hover:bg-transparent"
                aria-label="Scroll left"
            >
                <CaretLeft size={24} weight="bold" />
            </button>
            <button
                onclick={scrollRight}
                disabled={!canScrollRight}
                class="rounded p-2 text-ink-800 transition-colors hover:bg-surface-20 hover:text-primary-10 disabled:text-ink-400 disabled:hover:bg-transparent"
                aria-label="Scroll right"
            >
                <CaretRight size={24} weight="bold" />
            </button>
        </div>
    </div>

    <!-- Main cards container with padding -->
    <div bind:this={scrollContainer} class="relative">
        <div
            class="flex gap-3 transition-transform duration-500 ease-out"
            style="transform: translateX({translateX}px);"
        >
            {#each albums as album}
                <div class="flex-shrink-0" style="width: {cardWidth}px;">
                    <a href="/app/album/{album.id}">
                        <AlbumCard {album} />
                    </a>
                </div>
            {/each}
        </div>
    </div>
</div>
