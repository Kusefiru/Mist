<script>
    import {
        Broadcast,
        CaretDown,
        CaretUp,
        MusicNotesSimple,
        Play,
        Shuffle,
        Users,
        VinylRecord
    } from 'phosphor-svelte';

    import ItemGrid from '$lib/components/item/ItemGrid.svelte';
    import ItemHeader from '$lib/components/item/ItemHeader.svelte';
    import TrackList from '$lib/components/tracks/TrackList.svelte';
    import CollapsibleText from '$lib/components/ui/CollapsibleText.svelte';

    import * as api from '$lib/opensubsonic/api';
    import { cache } from '$lib/stores/cache.svelte';
    import { audio } from '$lib/audio/manager.svelte.js';
    import { untrack } from 'svelte';
    import { fade } from 'svelte/transition';
    import ActionButton from '$lib/components/ui/ActionButton.svelte';
    import { goto } from '$app/navigation';
    import { sortByDateReleased } from '$lib/utils/sorting.js';

    let { params } = $props();

    const TRACKS_DEFAULT = 5;
    const ALBUM_MAIN = new Set(['album', 'lp']);
    const ALBUM_SINGLE = new Set(['single', 'ep']);

    let columns = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];

    let artist = $state(null);
    let biography = $state('');
    let albumsSorted = $state({
        main: [],
        singles: [],
        others: [],
        appears: []
    });
    let topTrackIds = $state([]);
    let tracksExpanded = $state(false);
    let similarArtists = $state([]);

    let visibleTrackIds = $derived(
        tracksExpanded ? topTrackIds : topTrackIds.slice(0, TRACKS_DEFAULT)
    );

    function clearState() {
        artist = null;
        biography = '';
        albumsSorted = {
            main: [],
            singles: [],
            others: [],
            appears: []
        };
        topTrackIds = [];
        tracksExpanded = false;
        similarArtists = [];
    }

    function getCategory(album) {
        const isMainArtist = album.artistIds.some((ar) => ar.id === artist.id);
        if (!isMainArtist) return 'appears';
        if (album.releaseTypes.some((t) => ALBUM_MAIN.has(t))) return 'main';
        if (album.releaseTypes.some((t) => ALBUM_SINGLE.has(t))) return 'singles';
        return 'others';
    }

    async function loadArtist(artistId) {
        artist = await cache.getArtist(artistId);

        const topTracks = await cache.getTopTracks(artist.name);
        topTrackIds = topTracks.map((t) => t.id);

        const artistInfo = await api.getArtistInfo2(artist.id, { count: 8 });
        biography = artistInfo?.biography || '';

        // Sort albums by date (reversed, latest first)
        const albums = (
            artist.albumIds?.map((id) => cache.albums.get(id)).filter(Boolean) ?? []
        ).sort(sortByDateReleased).reverse();
        // Then categorize albums
        for (const album of albums) {
            albumsSorted[getCategory(album)].push(album);
        }

        similarArtists = [];
        artistInfo.similarArtist?.forEach((a) =>
            cache.getArtist(a.id).then((artist) => {
                similarArtists.push(artist);
            })
        );
    }

    $effect(() => {
        const artistId = params.artist_id;
        clearState();
        untrack(() => loadArtist(artistId));
    });
</script>

<div class="relative px-8 pt-2 pb-12">
    <div class="relative z-10 flex flex-col gap-4">
        <ItemHeader item={artist}>
            {#snippet title()}
                <h2 class="break-words whitespace-normal">
                    {artist.name}
                </h2>
            {/snippet}
            {#snippet category()}
                Artist
            {/snippet}
            {#snippet details()}
                {artist.albumCount} releases
            {/snippet}
        </ItemHeader>

        {#if artist !== null}
            <div in:fade={{ duration: 200 }} class="flex space-x-4">
                {#if topTrackIds.length > 0}
                    <ActionButton
                        Icon={Play}
                        title="Play"
                        onclick={() => {
                            audio.setShuffle(false);
                            audio.setQueue(topTrackIds);
                        }}
                    />
                    <ActionButton
                        Icon={Shuffle}
                        title="Shuffle"
                        onclick={() => {
                            audio.setShuffle(true);
                            audio.setQueue(topTrackIds);
                        }}
                        primary={false}
                    />
                {/if}
                <ActionButton
                    Icon={Broadcast}
                    title="Radio"
                    onclick={() => {
                        goto(`/app/artist/${artist.id}/radio`);
                    }}
                    primary={false}
                />
            </div>
        {/if}

        {#if biography}
            <CollapsibleText html={biography} lines={2} />
        {/if}

        {#if topTrackIds.length > 0}
            <section in:fade={{ duration: 300 }} class="flex flex-col gap-3">
                <h2 class="flex items-center gap-2 text-xl font-bold text-ink-900">
                    <MusicNotesSimple size="1.5rem" class="text-primary-10" />
                    Top Tracks
                </h2>
                <ul class="overflow-y-hidden">
                    <TrackList tracks={{ '': visibleTrackIds }} queueIds={topTrackIds} variant="playlist" {columns} />
                </ul>
                {#if topTrackIds.length > TRACKS_DEFAULT}
                    <button
                        onclick={() => (tracksExpanded = !tracksExpanded)}
                        class="flex text-sm font-bold text-ink-500 transition-colors hover:text-primary-10"
                    >
                        {#if tracksExpanded}
                            Show less
                        {:else}
                            Show more
                        {/if}
                    </button>
                {/if}
            </section>
        {/if}

        {#if albumsSorted.main.length > 0}
            <section in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center gap-2 text-xl font-bold text-ink-900">
                    <VinylRecord size={'1.5rem'} class="text-primary-10" />
                    <span>Albums</span>
                </h2>
                <ItemGrid items={albumsSorted.main} getHref={(album) => `/app/album/${album.id}`} >
                    {#snippet subtitle(album)}
                        {album.dateStr}
                    {/snippet}
                </ItemGrid>
            </section>
        {/if}

        {#if albumsSorted.singles.length > 0}
            <section in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center gap-2 text-xl font-bold text-ink-900">
                    <VinylRecord size={'1.5rem'} class="text-primary-10" />
                    <span>Singles & EPs</span>
                </h2>
                <ItemGrid items={albumsSorted.singles} getHref={(album) => `/app/album/${album.id}`} >
                    {#snippet subtitle(album)}
                        {album.dateStr}
                    {/snippet}
                </ItemGrid>
            </section>
        {/if}

        {#if albumsSorted.others.length > 0}
            <section in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center gap-2 text-xl font-bold text-ink-900">
                    <VinylRecord size={'1.5rem'} class="text-primary-10" />
                    <span>Others</span>
                </h2>
                <ItemGrid items={albumsSorted.others} getHref={(album) => `/app/album/${album.id}`} >
                    {#snippet subtitle(album)}
                        {album.dateStr}
                    {/snippet}
                </ItemGrid>
            </section>
        {/if}

        {#if albumsSorted.appears.length > 0}
            <section in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center gap-2 text-xl font-bold text-ink-900">
                    <VinylRecord size={'1.5rem'} class="text-primary-10" />
                    <span>Appears on</span>
                </h2>
                <ItemGrid items={albumsSorted.appears} getHref={(album) => `/app/album/${album.id}`} >
                    {#snippet subtitle(album)}
                        {album.dateStr}
                    {/snippet}
                </ItemGrid>
            </section>
        {/if}

        {#if similarArtists.length > 0}
            <section in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <h2 class="flex items-center gap-2 text-xl font-bold text-ink-900">
                    <Users size={'1.5rem'} class="text-primary-10" />
                    <span>Similar Artists</span>
                </h2>
                <ItemGrid items={similarArtists} getHref={(artist) => `/app/artist/${artist.id}`} >
                    {#snippet subtitle(artist)}
                        {artist.albumCount} releases
                    {/snippet}
                </ItemGrid>
            </section>
        {/if}
    </div>
</div>
