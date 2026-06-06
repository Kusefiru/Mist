<script>
    import { cache } from '$lib/stores/cache.svelte';
    import { formatDuration } from '$lib/utils/format';
    import FadeImage from '../FadeImage.svelte';
    import FormattedArtists from '../FormattedArtists.svelte';

    let { album, onclick } = $props();
</script>

<button
    class="flex w-full items-center gap-3 rounded px-2 transition-colors hover:bg-surface-10"
    onclick={onclick}
>
    <div class="flex size-[2.5rem] items-center justify-center rounded select-none">
        {#if album.coverArtId}
            <FadeImage
                src={cache.getCoverArt(album.coverArtId, 32)}
                alt="cover"
                class="max-h-full max-w-full rounded object-contain"
                loading="lazy"
            />
        {/if}
    </div>
    <div class="flex w-full min-w-0 flex-col text-left">
        <span class="truncate text-base font-medium text-ink-900">{album.name}</span>
        <span class="truncate text-sm text-ink-800"
            ><FormattedArtists text={album.artistsStr} artistMap={album.artistIds} /></span
        >
    </div>
</button>
