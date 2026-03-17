<script>
    import { cache } from '$lib/stores/cache.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import Star from '$lib/components/ui/Star.svelte';

    let { artist } = $props();
</script>

{#snippet cardCover(coverArt)}
    <div
        class="absolute inset-0 z-0 scale-110 bg-cover bg-center blur-md transition-transform group-hover:scale-125"
        style="background-image: url('{coverArt}');"
    ></div>
    <div
        class="absolute inset-0 z-5 bg-surface-10/50 shadow-[inset_0_0_48px_oklch(from_var(--color-surface-30)_l_c_h_/_1.0)] dark:bg-surface-50/50"
    ></div>
    <div class="relative z-10 mr-4 flex size-64 items-center justify-center">
        <FadeImage
            src={coverArt}
            alt={artist.name}
            class="max-h-full max-w-full rounded object-contain"
        />
    </div>
{/snippet}

<div
    class="group relative flex items-end p-4 shadow-md select-none [clip-path:inset(0_round_0.4rem)]"
>
    {@render cardCover(cache.getCoverArt(artist.coverArtId))}
    <div class="relative z-10 flex flex-col gap-1 pr-12 text-ink-700">
        <h4 class="text-sm font-bold uppercase">Artist</h4>
        <h2 class="text-3xl font-bold break-words whitespace-normal text-ink-800">
            {artist.name}
            <Star size={28} />
        </h2>
        <h3 class="truncate text-lg font-semibold">{artist.albumCount} releases</h3>
    </div>
</div>
