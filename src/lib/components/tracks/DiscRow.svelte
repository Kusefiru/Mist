<script>
    import { VinylRecord } from 'phosphor-svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import { cache } from '$lib/stores/cache.svelte';

    let { disc } = $props();
</script>

<div class="my-1 flex h-12 items-center rounded bg-surface-10 px-2 text-ink-900 shadow-surface-50 shadow-sm select-none">
    <div class="flex w-[3rem] justify-center">
        {#if disc?.coverArtId}
            <div class="flex size-10 shrink-0 items-center justify-center">
                <FadeImage
                    src={cache.getCoverArt(disc.coverArtId, 64)}
                    alt={disc.displayTitle}
                    class="rounded-sm object-contain"
                    loading="lazy"
                />
            </div>
        {:else}
            <VinylRecord size={'1.5rem'} />
        {/if}
    </div>
    <h3 class="pl-2 text-base">{disc.displayTitle}</h3>
</div>
