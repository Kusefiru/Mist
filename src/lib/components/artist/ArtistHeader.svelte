<script>
    import { cache } from '$lib/stores/cache.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import Star from '$lib/components/ui/Star.svelte';

    let { artist } = $props();
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
    <div class="relative z-10 mr-4 flex size-44 items-center justify-center sm:size-56 lg:size-64">
        <FadeImage
            src={coverArt}
            alt={artist.name}
            class="max-h-full max-w-full rounded object-contain"
        />
    </div>
{/snippet}

{#if artist}
    <div
        class="group relative flex items-end overflow-hidden rounded-[0.4rem] p-4 shadow-md shadow-surface-50 select-none"
    >
        {@render cardCover(cache.getCoverArt(artist.coverArtId))}
        <div class="relative z-10 flex flex-col pr-12 text-ink-800 lg:gap-1">
            <h4 class="text-sm font-bold uppercase">Artist</h4>
            <h2 class="text-2xl font-bold break-words whitespace-normal text-ink-900 lg:text-3xl">
                {artist.name}
                <Star id={artist.id} size={'1.75rem'} />
            </h2>
            <h3 class="truncate text-lg font-semibold">{artist.albumCount} releases</h3>
        </div>
    </div>
{:else}
    <!-- Basic placeholder while item isn't visible -->
    <div
        class="relative flex animate-pulse items-end overflow-hidden rounded-[0.4rem] bg-surface-40 p-4 shadow-md shadow-surface-50"
    >
        <div
            class="mr-4 aspect-square size-44 overflow-hidden rounded bg-surface-50/50 sm:size-56 lg:size-64"
        ></div>
    </div>
{/if}
