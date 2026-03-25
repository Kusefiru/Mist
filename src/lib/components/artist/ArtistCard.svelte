<script>
    import { lazyLoad } from '$lib/actions/lazyLoad';
    import { cache } from '$lib/stores/cache.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';

    let { artist } = $props();
    let visible = $state(false);
</script>

{#snippet cardCover(coverArt)}
    <div class="absolute inset-0 z-0 overflow-hidden rounded-[0.4rem] [filter:blur(0)]">
        <div
            class="absolute inset-0 scale-110 bg-cover bg-center blur-md transition-transform group-hover:scale-125 motion-reduce:transition-none"
            style="background-image: url('{coverArt}');"
        ></div>
    </div>
    <div
        class="absolute inset-0 z-5 bg-surface-10/40 shadow-[inset_0_0_32px_oklch(from_var(--color-surface-30)_l_c_h_/_1.0)] transition-colors group-hover:bg-surface-10/60 dark:bg-surface-50/40 dark:group-hover:bg-surface-50/60"
    ></div>
    <div class="relative z-10 aspect-square overflow-hidden p-2">
        <div class="flex size-full items-center justify-center">
            <FadeImage
                class="max-h-full max-w-full rounded object-contain"
                src={coverArt}
                alt={artist.name}
                loading="lazy"
            />
        </div>
    </div>
{/snippet}

<div
    use:lazyLoad={() => (visible = true)}
    class="group relative flex h-full cursor-pointer flex-col shadow overflow-hidden rounded-[0.4rem]"
>
    {#if visible}
        {@render cardCover(cache.getCoverArt(artist.coverArtId))}
        <div
            class="z-10 mx-2 mb-2 flex flex-1 flex-col gap-1"
        >
            <p
                class="line-clamp-2 text-base font-semibold text-ink-800 transition-colors group-hover:text-primary-10 hover:underline"
                title={artist.name}
            >
                {artist.name}
            </p>
            <p class="text-sm text-ink-700">{artist.albumCount} releases</p>
        </div>
    {:else}
        <!-- Basic placeholder while item isn't visible -->
        <div
            class="relative z-10 m-2 aspect-square animate-pulse overflow-hidden rounded bg-surface-20"
        ></div>
        <div class="z-10 flex h-20 flex-col gap-1 px-2 pb-2">
            <div class="h-4 w-full animate-pulse rounded bg-surface-20"></div>
            <div class="h-4 w-3/4 animate-pulse rounded bg-surface-20"></div>
            <div class="h-4 w-1/2 animate-pulse rounded bg-surface-20"></div>
        </div>
    {/if}
</div>
