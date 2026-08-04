<script>
    import { cache } from '$lib/stores/cache.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';

    let { 
        item,
        subtitle,   // Optional
    } = $props();
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
            alt={item.name}
            loading="lazy"
        />
    </div>
{/snippet}

<div
    class="group relative flex h-full cursor-pointer flex-row overflow-hidden rounded-[0.4rem] shadow-md shadow-surface-50"
>
    {@render cardCover(cache.getCoverArt(item.coverArtId))}
    <div class="z-10 my-2 mr-2 flex flex-1 flex-col justify-end gap-1">
        <p
            class="line-clamp-2 text-xl font-semibold text-ink-900 hover:underline"
            title={item.name}
        >
            {item.name}
        </p>
        {#if subtitle}
            <p class="line-clamp-1 text-sm text-ink-800" title={item.artistsStr}>
                {@render subtitle()}
            </p>
        {/if}
    </div>
</div>
