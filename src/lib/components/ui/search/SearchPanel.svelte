<script>
    import {
        CaretRight,
        CircleNotch,
        DotsThree,
        MusicNotesSimple,
        Users,
        VinylRecord
    } from 'phosphor-svelte';
    import { goto } from '$app/navigation';
    import TrackResult from './TrackResult.svelte';
    import ArtistResult from './ArtistResult.svelte';
    import AlbumResult from './AlbumResult.svelte';

    // Max number of displayed results per type
    const MAX_DISPLAY = 8;

    let { results, isLoading, query, onViewAll, onClose } = $props();

    const hasResults = $derived(
        results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0
    );

    function navigateTo(path) {
        goto(path);
        // Close menu after navigation
        onClose();
    }
</script>

{#snippet moreButton(text, type)}
    <button
        class="flex w-full items-center gap-2 rounded px-3 py-1.5 text-left text-xs font-semibold text-ink-500 transition-colors hover:bg-surface-10 hover:text-primary-10"
        onclick={() => onViewAll(type)}
    >
        <DotsThree size={'1rem'} weight={'bold'} />
        <span>{text}</span>
    </button>
{/snippet}

<div
    class="absolute top-full right-0 left-0 z-50 flex flex-col rounded-b-md bg-surface-40 shadow-lg shadow-neutral-950/50"
    style="max-height: 70vh;"
>
    <div class="min-h-0 flex-1 overflow-y-auto">
        {#if isLoading}
            <div class="flex items-center justify-center gap-2 py-8 text-ink-500">
                <CircleNotch size="1.25rem" class="animate-spin" />
                <span class="text-sm">Searching...</span>
            </div>
        {:else if !hasResults}
            <div class="py-8 text-center text-sm font-medium text-ink-500 select-none">
                No results for "<span class="font-semibold">{query}</span>"
            </div>
        {:else}
            {#if results.tracks.length > 0}
                <div class="flex flex-col gap-1 p-2">
                    <div
                        class="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-ink-500 select-none"
                    >
                        <MusicNotesSimple size={'1rem'} weight={'bold'} />
                        <span>Tracks</span>
                    </div>
                    {#each results.tracks.slice(0, MAX_DISPLAY) as track}
                        <TrackResult
                            {track}
                            onclick={() => navigateTo(`/app/album/${track.albumId}`)}
                        />
                    {/each}
                    {#if results.tracks.length > MAX_DISPLAY}
                        {@render moreButton('More tracks', 'tracks')}
                    {/if}
                </div>
            {/if}
            {#if results.artists.length > 0}
                {#if results.tracks.length > 0}
                    <div class="mx-1 border-t border-ink-500" role="separator"></div>
                {/if}
                <div class="flex flex-col gap-1 p-2">
                    <div
                        class="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-ink-500 select-none"
                    >
                        <Users size={'1rem'} weight={'bold'} />
                        <span>Artists</span>
                    </div>
                    {#each results.artists.slice(0, MAX_DISPLAY) as artist}
                        <ArtistResult
                            {artist}
                            onclick={() => navigateTo(`/app/artist/${artist.id}`)}
                        />
                    {/each}
                    {#if results.artists.length > MAX_DISPLAY}
                        {@render moreButton('More artists', 'artists')}
                    {/if}
                </div>
            {/if}
            {#if results.albums.length > 0}
                {#if results.tracks.length > 0 || results.artists.length > 0}
                    <div class="mx-1 border-t border-ink-500" role="separator"></div>
                {/if}
                <div class="flex flex-col gap-1 p-2">
                    <div
                        class="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-ink-500 select-none"
                    >
                        <VinylRecord size={'1rem'} weight={'bold'} />
                        <span>Albums</span>
                    </div>
                    {#each results.albums.slice(0, MAX_DISPLAY) as album}
                        <AlbumResult {album} onclick={() => navigateTo(`/app/album/${album.id}`)} />
                    {/each}
                    {#if results.albums.length > MAX_DISPLAY}
                        {@render moreButton('More albums', 'albums')}
                    {/if}
                </div>
            {/if}
        {/if}
    </div>

    {#if !isLoading && hasResults}
        <div class="mx-1 border-t border-ink-500"></div>
        <button
            class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-b-md px-4 py-2.5 text-sm font-medium text-primary-10 transition-colors hover:bg-surface-10"
            onclick={() => onViewAll()}
        >
            <span>View all results for "<span class="font-semibold">{query}</span>"</span>
            <CaretRight size="1rem" />
        </button>
    {/if}
</div>
