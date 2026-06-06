<script>
    import { cache } from '$lib/stores/cache.svelte';
    import { formatDuration } from '$lib/utils/format';
    import FadeImage from '../FadeImage.svelte';
    import FormattedArtists from '../FormattedArtists.svelte';

    let { artist, onclick } = $props();
</script>

<button
    class="flex w-full items-center gap-3 rounded px-2 transition-colors hover:bg-surface-10"
    onclick={onclick}
>
    <div class="flex size-[2.5rem] items-center justify-center rounded select-none">
        {#if artist.coverArtId}
            <FadeImage
                src={cache.getCoverArt(artist.coverArtId, 32)}
                alt="cover"
                class="max-h-full max-w-full rounded object-contain"
                loading="lazy"
            />
        {/if}
    </div>
    <span class="flex w-full text-base font-medium text-ink-900">{artist.name}</span>
</button>
