<script>
    import { cache } from '$lib/stores/cache.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';

    let { artist, showDate = false } = $props();
    let hovered = $state(false);
</script>

{#snippet cardCover(coverArt)}
    <div
        class="absolute inset-0 z-0 scale-110 bg-cover bg-center blur-xl transition-transform group-hover:scale-125"
        style="background-image: url('{coverArt}');"
    ></div>
    <div
        class="absolute inset-0 z-5 bg-surface-10/50 shadow-[inset_0_0_32px_oklch(from_var(--color-surface-30)_l_c_h_/_1.0)]"
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
    onmouseenter={() => (hovered = true)}
    onmouseleave={() => (hovered = false)}
    class="group relative flex h-full cursor-pointer flex-row overflow-hidden rounded shadow "
>
    {@render cardCover(cache.getCoverArt(artist.coverArtId))}
    <div class="z-10 flex flex-1 flex-col justify-end py-2">
        <p
            class="line-clamp-2 text-xl font-semibold text-ink-800 transition-colors group-hover:text-primary-10 hover:underline"
            title={artist.name}
        >
            {artist.name}
        </p>
        <p class="text-sm text-ink-700">{artist.albumCount} releases</p>
    </div>
</div>
