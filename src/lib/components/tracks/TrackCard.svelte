<script>
    import { Heart } from 'phosphor-svelte';

    import FormattedArtists from '$lib/components/ui/FormattedArtists.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import Star from '$lib/components/ui/Star.svelte';

    import { cache } from '$lib/stores/cache.svelte';

    let { track } = $props();
    const starred = $derived(cache.stars.has(track.id));
</script>

<div class="flex max-w-[90%] items-center gap-4 text-ink-800 select-none">
    <div class="flex size-18 shrink-0 items-center justify-center">
        <FadeImage
            src={cache.getCoverArt(track.coverArtId)}
            alt="Cover Art"
            class="max-h-full max-w-full rounded object-contain"
        />
    </div>
    <div class="flex min-w-0 flex-col">
        <h3 class="truncate text-lg font-semibold" title={track.title}>
            {track.title}
        </h3>
        <h4 class="truncate text-base text-ink-700" title={track.artistsStr}>
            <FormattedArtists text={track.artistsStr} artistMap={track.artistIds} />
        </h4>
        <h4 class="truncate text-base font-semibold text-ink-700" title={track.album}>
            <a href="/app/album/{track.albumId}" class="hover:underline">
                {track.album}
            </a>
        </h4>
    </div>
    <Star trackId={track.id} size={"1.5rem"} />
</div>
