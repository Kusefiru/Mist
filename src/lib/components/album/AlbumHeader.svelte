<script>
    import { formatDurationReadable } from '$lib/utils/format';
    import { cache } from '$lib/stores/cache.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import FormattedArtists from '$lib/components/ui/FormattedArtists.svelte';
    import Star from '$lib/components/ui/Star.svelte';

    let { album } = $props();
</script>

{#snippet cardCover(coverArt)}
    <div class="absolute inset-0 z-0 overflow-hidden rounded-[0.4rem] [filter:blur(0)]">
        <div
            class="absolute inset-0 scale-110 bg-cover bg-center blur-md transition-transform group-hover:scale-125 motion-reduce:transition-none"
            style="background-image: url('{coverArt}');"
        ></div>
    </div>
    <div
        class="absolute inset-0 z-5 bg-surface-10/50 shadow-[inset_0_0_48px_oklch(from_var(--color-surface-30)_l_c_h_/_1.0)] dark:bg-surface-50/50"
    ></div>
    <div class="relative z-10 mr-4 flex size-44 items-center justify-center sm:size-56 lg:size-64">
        <FadeImage
            src={coverArt}
            alt={album.name}
            class="max-h-full max-w-full rounded object-contain"
        />
    </div>
{/snippet}

{#if album}
    <div
        class="group relative flex items-end overflow-hidden rounded-[0.4rem] p-4 shadow-md shadow-surface-30 select-none"
    >
        {@render cardCover(cache.getCoverArt(album.coverArtId))}
        <div class="relative z-10 flex flex-col pr-12 text-ink-700 lg:gap-1">
            <h4 class="text-sm font-bold uppercase">{album.typeStr}</h4>
            <div class="flex flex-row items-baseline gap-2 text-ink-800">
                <h2 class="text-2xl font-bold break-words whitespace-normal lg:text-3xl">
                    {album.name}
                </h2>
                <h2 class="text-2xl font-bold text-ink-700 italic lg:text-3xl">{album.version}</h2>
                <Star size={'1.75rem'} />
            </div>
            <h3 class="text-xl lg:text-2xl">
                <FormattedArtists text={album.artistsStr} artistMap={album.artistIds} />
            </h3>
            <h3 class="truncate text-lg font-semibold">
                {album.dateStr} • {album.songCount} tracks • {formatDurationReadable(
                    album.duration
                )}
            </h3>
        </div>
    </div>
{:else}
    <!-- Basic placeholder while item isn't visible -->
    <div
        class="relative flex animate-pulse items-end overflow-hidden rounded-[0.4rem] p-4 shadow-md shadow-surface-30"
    >
        <div
            class="mr-4 aspect-square size-44 overflow-hidden rounded bg-surface-30 sm:size-56 lg:size-64"
        ></div>
    </div>
{/if}
