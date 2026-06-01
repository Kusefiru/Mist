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
            class="absolute inset-0 scale-110 bg-cover bg-center blur-md"
            style="background-image: url('{coverArt}');"
        ></div>
    </div>
    <div
        class="absolute inset-0 z-5 bg-surface-30/50 shadow-[inset_0_0_32px_oklch(from_var(--color-surface-40)_l_c_h_/_1.0)] transition-shadow group-hover:shadow-[inset_0_0_32px_oklch(from_var(--color-primary-10)_l_c_h_/_1.0)] dark:bg-surface-40/50"
    ></div>
    <div class="relative z-10 flex aspect-square items-center justify-center p-2">
        <FadeImage
            class="max-h-full max-w-full rounded object-contain"
            src={coverArt}
            alt={artist.name}
            loading="lazy"
        />
    </div>
{/snippet}

<div
    use:lazyLoad={() => (visible = true)}
    class="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[0.4rem] shadow-md shadow-surface-50"
>
    {#if visible}
        {@render cardCover(cache.getCoverArt(artist.coverArtId))}
        <div class="z-10 mx-2 mb-2 flex h-18 flex-col gap-1">
            <p
                class="line-clamp-2 text-base font-semibold text-ink-900 hover:underline"
                title={artist.name}
            >
                {artist.name}
            </p>
            <p class="text-sm text-ink-800">{artist.albumCount} releases</p>
        </div>
    {:else}
        <!-- Basic placeholder while item isn't visible -->
        <div class="animate-pulse bg-surface-40">
            <div class="m-2 aspect-square overflow-hidden rounded bg-surface-50/50"></div>
            <div class="m-2 flex h-18 flex-col rounded bg-surface-50/50"></div>
        </div>
    {/if}
</div>
