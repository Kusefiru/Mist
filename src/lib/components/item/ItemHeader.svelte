<script>
    import { fade } from 'svelte/transition';
    import { cache } from '$lib/stores/cache.svelte';
    import { modal } from '$lib/stores/modal.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import ImageModal from '$lib/components/ui/modal/ImageModal.svelte';
    import Star from '$lib/components/ui/Star.svelte';

    let {
        item,       // Must be an Album, Artist or Playlist
        title,      // Required: Header title
        subtitle,   // Optional
        category,   // Optional
        details     // Optional
    } = $props();

    let headerEl = $state(null);
    let stickyVisible = $state(false);

    $effect(() => {
        if (!headerEl) return;
        const observer = new IntersectionObserver(
            ([entry]) => { stickyVisible = !entry.isIntersecting; },
            { threshold: 0 }
        );
        observer.observe(headerEl);
        return () => observer.disconnect();
    });
</script>

{#snippet cardCover(coverArt)}
    <div class="absolute inset-0 z-0 overflow-hidden rounded-[0.4rem] [filter:blur(0)]">
        <div
            class="absolute inset-0 scale-110 bg-cover bg-center blur-md"
            style="background-image: url('{coverArt}');"
        ></div>
    </div>
    <div
        class="absolute inset-0 z-5 bg-surface-30/50 shadow-[inset_0_0_48px_oklch(from_var(--color-surface-40)_l_c_h_/_1.0)] dark:bg-surface-40/50"
    ></div>
    <button
        class="relative z-10 mr-4 flex size-44 cursor-pointer items-center justify-center sm:size-56 lg:size-64"
        onclick={() =>
            modal.open(ImageModal, {
                src: cache.getCoverArt(item.coverArtId, 1024),
                alt: item.name
            })}
        aria-label="View cover art"
    >
        <FadeImage src={coverArt} alt={item.name} class="max-h-full max-w-full rounded object-contain" />
    </button>
{/snippet}

{#if item}
    <div
        bind:this={headerEl}
        class="group relative flex items-end overflow-hidden rounded-[0.4rem] p-4 shadow-md shadow-surface-50 select-none"
    >
        {@render cardCover(cache.getCoverArt(item.coverArtId))}
        <div class="relative z-10 flex flex-col pr-12 text-ink-800 lg:gap-1">
            {#if category}
                <h4 class="text-sm font-bold uppercase">{@render category()}</h4>
            {/if}
            <div class="flex flex-row items-baseline gap-2 text-2xl font-bold text-ink-900 lg:text-3xl">
                {@render title()}
                <Star id={item.id} size={'1.75rem'} />
            </div>
            {#if subtitle}
                <h3 class="text-xl lg:text-2xl">{@render subtitle()}</h3>
            {/if}
            {#if details}
                <h3 class="truncate text-lg font-semibold">{@render details()}</h3>
            {/if}
        </div>
    </div>

    <!-- Sticky header, appears when observer goes outside the view -->
    <div class="sticky top-0 z-20 h-0 overflow-visible">
        {#if stickyVisible}
            <div class="-mx-8 bg-surface-30 px-8" transition:fade={{ duration: 150 }}>
                <div
                    class="relative flex items-end gap-3 overflow-hidden rounded-[0.4rem] px-3 py-2 shadow-md shadow-surface-50 select-none"
                >
                    <div class="absolute inset-0 z-0 overflow-hidden">
                        <div
                            class="absolute inset-0 scale-110 bg-cover bg-center blur-md"
                            style="background-image: url('{cache.getCoverArt(item.coverArtId)}');"
                        ></div>
                    </div>
                    <div
                        class="absolute inset-0 z-5 bg-surface-30/70 shadow-[inset_0_0_24px_oklch(from_var(--color-surface-40)_l_c_h_/_1.0)] dark:bg-surface-40/70"
                    ></div>
                    <div
                        class="relative z-10 flex size-14 flex-shrink-0 items-center justify-center overflow-hidden rounded lg:size-16"
                    >
                        <FadeImage src={cache.getCoverArt(item.coverArtId)} alt={item.name} class="max-h-full max-w-full rounded object-contain" />
                    </div>
                    <div class="relative z-10 flex flex-col min-w-0 flex-col">
                        <div class="truncate text-xl font-bold text-ink-900 lg:text-xl">
                            {@render title()}
                        </div>
                        {#if subtitle}
                            <div class="truncate text-lg text-ink-800 lg:text-lg">
                                {@render subtitle()}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
{:else}
    <div
        class="relative flex animate-pulse items-end overflow-hidden rounded-[0.4rem] bg-surface-40 p-4 shadow-md shadow-surface-50"
    >
        <div
            class="mr-4 aspect-square size-44 overflow-hidden rounded bg-surface-50/50 sm:size-56 lg:size-64"
        ></div>
    </div>
{/if}
