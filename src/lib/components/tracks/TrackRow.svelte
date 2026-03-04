<script>
    import { cache } from '$lib/stores/cache.svelte';
    import {
        DownloadSimple,
        Heart,
        Play,
        RowsPlusBottom,
        RowsPlusTop,
        TrashSimple,
        VinylRecord
    } from 'phosphor-svelte';

    import { formatDuration } from '$lib/utils/format';
    import { audio } from '$lib/audio/manager.svelte.js';
    import { audioState } from '$lib/stores/audio.svelte.js';
    import { download, getCoverArtUrl } from '$lib/opensubsonic/api';
    import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
    import Explicit from '$lib/components/ui/Explicit.svelte';
    import FadeImage from '$lib/components/ui/FadeImage.svelte';
    import FormattedArtists from '$lib/components/ui/FormattedArtists.svelte';
    import PlayingIndicator from '$lib/components/ui/PlayingIndicator.svelte';
    import Star from '$lib/components/ui/Star.svelte';
    import { goto } from '$app/navigation';

    const baseActions = [
        {
            icon: RowsPlusTop,
            label: 'Queue next',
            handler: (track) => audio.setQueueNext(track.id)
        },
        {
            icon: RowsPlusBottom,
            label: 'Queue last',
            handler: (track) => audio.setQueueLast(track.id)
        }
    ];

    let {
        trackId,
        queueIds = null,
        queueIndex = null,
        variant = 'album',
        columns = ['track', 'title', 'duration', 'quality', 'starred', 'actions']
    } = $props();

    let track = $derived(cache.tracks.get(trackId));
    let starred = $derived(cache.stars.has(trackId));
    let index = queueIds?.indexOf(trackId) || 0;
    let hovered = $state(false);
    let dropdownOpen = $state(false);
    let imageLoaded = $state(false);

    /** In 'queue' variant, check that index of track in queue matches played track index
     *  Else, check that ID of track matches played track ID
     */
    let isCurrentlyPlaying = $derived(
        variant === 'queue'
            ? queueIndex === audioState.playOrder[audioState.index]
            : trackId === audioState.currentTrackId
    );

    let trackActions = $derived([
        ...baseActions,
        ...(variant !== 'queue' && cache.user.canDownload
            ? [
                  {
                      icon: DownloadSimple,
                      label: 'Download',
                      handler: (track) => {
                          window.location.href = download(track.id);
                      }
                  }
              ]
            : []),
        ...(variant === 'queue'
            ? [
                  {
                      icon: VinylRecord,
                      label: 'Go to album',
                      handler: (track) => goto(`/app/album/${track.albumId}`)
                  },
                  {
                      icon: TrashSimple,
                      label: 'Remove',
                      handler: (track) => audio.remove(queueIndex)
                  }
              ]
            : [])
    ]);

    function onDoubleClick() {
        if (variant === 'queue') {
            audio.playIndex(queueIndex);
        } else {
            audio.setQueue(queueIds, index);
        }
    }
</script>

{#snippet cardCover(coverArt)}
    <div class="flex size-[3rem] rounded p-0.5 items-center justify-center select-none">
        <FadeImage class="max-h-full max-w-full rounded object-contain" src={coverArt} alt="cover" loading="lazy" />
    </div>
{/snippet}

<div
    onmouseenter={() => (hovered = true)}
    onmouseleave={() => (hovered = false)}
    ondblclick={onDoubleClick}
    class="relative flex h-14 items-center rounded px-2"
    class:shadow={hovered || dropdownOpen}
>
    <!-- Background effect when hovered -->
    {#if hovered || dropdownOpen}
        <div
            class="absolute inset-0 -z-10 rounded bg-surface-10/50 shadow-[inset_0_0_32px_oklch(from_var(--color-surface-30)_l_c_h_/_1.0)]"
        ></div>
    {/if}
    <!-- Track number -->
    {#if columns.includes('track')}
        <div class="w-[3rem] text-center text-base text-ink-800 select-none">
            {#if variant === 'album'}
                {track.track}
            {:else}
                {index + 1}
            {/if}
        </div>
    {/if}
    <!-- Album cover -->
    {#if columns.includes('cover')}
        {@render cardCover(cache.getCoverArt(track.coverArtId, 256))}
    {/if}
    {#if columns.includes('title')}
        <div class="min-w-0 flex-1 pl-2 select-none">
            <div class="flex w-full min-w-0 flex-col">
                <span
                    class="-mt-1 flex w-full items-center text-lg font-semibold text-ink-800"
                    class:gap-1={isCurrentlyPlaying}
                    class:text-primary-10={isCurrentlyPlaying}
                >
                    {#if isCurrentlyPlaying}
                        <PlayingIndicator size={20} paused={!audioState.playing} />
                    {/if}
                    <Explicit explicit={track.explicit} />
                    <span class="truncate" title={track.title}>{track.title}</span>
                </span>
                <span class="w-full truncate text-base text-ink-700" title={track.artistsStr}
                    ><FormattedArtists text={track.artistsStr} artistMap={track.artistIds} /></span
                >
            </div>
        </div>
    {/if}
    {#if columns.includes('album')}
        <div
            class="min-w-0 flex-1 truncate pl-2 text-base text-ink-800 select-none"
            title={track.album}
        >
            <a href="/app/album/{track.albumId}" class="hover:underline">
                {track.album}
            </a>
        </div>
    {/if}
    {#if columns.includes('duration')}
        <div class="w-[5rem] text-right text-base text-ink-800 select-none">
            {formatDuration(track.duration)}
        </div>
    {/if}
    {#if columns.includes('starred')}
        <div class="flex w-[3rem] items-center justify-center text-ink-800 select-none">
            <Star trackId={track.id} size={18} hidden={!hovered} />
        </div>
    {/if}
    {#if columns.includes('quality')}
        <div
            class="flex w-[5rem] items-center justify-center rounded border-1 border-ink-500 px-2 text-sm text-ink-500 select-none"
        >
            {track.content}
        </div>
    {/if}
    {#if columns.includes('actions')}
        <div
            class="relative z-20 flex w-[2rem] items-center justify-center pt-1 text-ink-800 select-none"
        >
            {#if hovered || dropdownOpen}
                <DropdownMenu actions={trackActions} context={track} bind:open={dropdownOpen} />
            {/if}
        </div>
    {/if}
</div>
