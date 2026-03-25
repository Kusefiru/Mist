<script>
    import { cache } from '$lib/stores/cache.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';

    let { artist, showDate = false } = $props();
</script>

{#snippet cardCover(coverArt)}
    <div class="absolute inset-0 z-0 overflow-hidden rounded-[0.4rem] [filter:blur(0)]">
        <div
            class="absolute inset-0 scale-110 bg-cover bg-center blur-md transition-transform group-hover:scale-125"
            style="background-image: url('{coverArt}');"
        ></div>
    </div>
    <div
        class="absolute inset-0 z-5 bg-surface-10/40 shadow-[inset_0_0_32px_oklch(from_var(--color-surface-30)_l_c_h_/_1.0)] transition-colors group-hover:bg-surface-10/60 dark:bg-surface-50/40 dark:group-hover:bg-surface-50/60"
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
    class="group relative flex h-full cursor-pointer flex-row overflow-hidden rounded-[0.4rem] shadow-md shadow-surface-30"
>
    {@render cardCover(cache.getCoverArt(artist.coverArtId))}
    <div
        class="z-10 my-2 mr-2 flex flex-1 flex-col gap-1 justify-end"
    >
        <p
            class="line-clamp-2 text-xl font-semibold text-ink-800 transition-colors group-hover:text-primary-10 hover:underline"
            title={artist.name}
        >
            {artist.name}
        </p>
        <p class="text-sm text-ink-700">{artist.albumCount} releases</p>
    </div>
</div>
