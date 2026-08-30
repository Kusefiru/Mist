<script>
    import { VinylRecord } from 'phosphor-svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import { cache } from '$lib/stores/cache.svelte';

    let { disc } = $props();
</script>

<div class="my-1 flex h-12 items-center rounded bg-surface-10 px-2 text-ink-900 shadow-surface-50 shadow-sm select-none">
    <div class="flex w-[3rem] justify-center">
        {#if disc?.coverArtId}
            <FadeImage
                src={cache.getCoverArt(disc.coverArtId, 32)}
                alt={disc.displayTitle}
                class="size-10 rounded object-contain"
                loading="lazy"
            />
        {:else}
            <VinylRecord size={'1.5rem'} />
        {/if}
    </div>
    <h3 class="pl-2 text-base">{disc.displayTitle}</h3>
</div>
