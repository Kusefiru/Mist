<script>
    import { CircleNotch, MusicNotesSimple, Users, VinylRecord } from 'phosphor-svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onDestroy } from 'svelte';
    import ActionButton from '$lib/components/ui/ActionButton.svelte';
    import ItemGrid from '$lib/components/item/ItemGrid.svelte';
    import TrackList from '$lib/components/tracks/TrackList.svelte';
    import FormattedArtists from '$lib/components/ui/FormattedArtists.svelte';
    import { search3 } from '$lib/opensubsonic/api';
    import { cache } from '$lib/stores/cache.svelte';

    const TRACK_COLUMNS = ['track', 'cover', 'title', 'album', 'duration', 'starred', 'actions'];
    const PAGE_SIZE = 50;

    const TYPE_OPTIONS = [
        { value: 'tracks', label: 'Tracks', icon: MusicNotesSimple },
        { value: 'artists', label: 'Artists', icon: Users },
        { value: 'albums', label: 'Albums', icon: VinylRecord }
    ];

    let loadedQuery = $state('');

    let tracks = $state([]);
    let artists = $state([]);
    let albums = $state([]);

    const hasMoreTracks = $derived(tracks.length > 0 && tracks.length % PAGE_SIZE === 0);
    const hasMoreArtists = $derived(artists.length > 0 && artists.length % PAGE_SIZE === 0);
    const hasMoreAlbums = $derived(albums.length > 0 && albums.length % PAGE_SIZE === 0);

    let fetching = $state(false);
    let initialized = $state(false);

    let sentinelEl = $state(null);
    let observer = null;

    // Format raw data to cache model
    async function formatAndAppend(raw, type) {
        if (type === 'tracks') {
            const songsRaw = raw.song || [];
            songsRaw.forEach((s) => cache.setTrack(s));
            const songsCache = await Promise.all(songsRaw.map((s) => cache.getTrack(s.id)));
            tracks = [...tracks, ...songsCache];
        } else if (type === 'artists') {
            const artistsRaw = raw.artist || [];
            const artistsCache = await Promise.all(artistsRaw.map((a) => cache.getArtist(a.id)));
            artists = [...artists, ...artistsCache];
        } else if (type === 'albums') {
            const albumsRaw = raw.album || [];
            const albumsCache = await Promise.all(albumsRaw.map((a) => cache.getAlbum(a.id)));
            albums = [...albums, ...albumsCache];
        }
    }

    // First query (get PAGE_SIZE of each type)
    async function initQuery(query) {
        loadedQuery = query;
        tracks = [];
        artists = [];
        albums = [];
        fetching = false;
        initialized = false;

        fetching = true;
        try {
            const raw = await search3(query, PAGE_SIZE, 0, PAGE_SIZE, 0, PAGE_SIZE, 0);
            if (!raw) return;
            await Promise.all([
                formatAndAppend(raw, 'tracks'),
                formatAndAppend(raw, 'artists'),
                formatAndAppend(raw, 'albums')
            ]);
        } finally {
            fetching = false;
            initialized = true;
        }
    }

    // Subsequent pages: only fetch the active category
    async function fetchNextPage(query, type) {
        if (fetching) return;
        fetching = true;
        try {
            const albumCount = type === 'albums' ? PAGE_SIZE : 0;
            const artistCount = type === 'artists' ? PAGE_SIZE : 0;
            const songCount = type === 'tracks' ? PAGE_SIZE : 0;
            const albumOff = type === 'albums' ? albums.length : 0;
            const artistOff = type === 'artists' ? artists.length : 0;
            const songOff = type === 'tracks' ? tracks.length : 0;

            const raw = await search3(
                query,
                artistCount,
                artistOff,
                albumCount,
                albumOff,
                songCount,
                songOff
            );
            if (!raw) return;
            await formatAndAppend(raw, type);
        } finally {
            fetching = false;
        }
    }

    const query = $derived($page.url.searchParams.get('q') || '');
    const activeType = $derived($page.url.searchParams.get('type') || 'tracks');

    const activeHasMore = $derived(
        activeType === 'tracks'
            ? hasMoreTracks
            : activeType === 'artists'
              ? hasMoreArtists
              : hasMoreAlbums
    );

    // Only re-init when the query actually changes
    $effect(() => {
        if (query && query !== loadedQuery) {
            initQuery(query);
        }
    });

    // IntersectionObserver for infinite scroll (next pages only)
    $effect(() => {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (!sentinelEl) return;

        observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !fetching && activeHasMore && initialized) {
                    fetchNextPage(query, activeType);
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(sentinelEl);
    });

    onDestroy(() => observer?.disconnect());
</script>

<div class="relative overflow-auto px-8 pt-4 pb-12">
    <div class="mb-4 flex flex-col gap-4">
        <h2 class="text-lg font-medium text-ink-900 select-none">
            Results for <span class="font-semibold">"{query}"</span>
        </h2>

        <div class="flex space-x-4">
            {#each TYPE_OPTIONS as opt}
                <ActionButton
                    Icon={opt.icon}
                    onclick={() =>
                        goto(`/app/search?q=${encodeURIComponent(query)}&type=${opt.value}`, {
                            replaceState: true
                        })}
                    title={opt.label}
                    primary={activeType === opt.value}
                />
            {/each}
        </div>
    </div>

    {#if activeType === 'tracks'}
        {#if tracks.length > 0}
            <div class="pb-2">
                <TrackList tracks={{ '': tracks.map((t) => t.id) }} variant="playlist" columns={TRACK_COLUMNS} />
            </div>
        {/if}
    {:else if activeType === 'artists'}
        {#if artists.length > 0}
            <ItemGrid items={artists} getHref={(artist) => `/app/artist/${artist.id}`} >
                {#snippet subtitle(artist)}
                    {artist.albumCount} releases
                {/snippet}
            </ItemGrid>
        {/if}
    {:else if activeType === 'albums'}
        {#if albums.length > 0}
            <ItemGrid items={albums} getHref={(album) => `/app/album/${album.id}`} >
                {#snippet subtitle(album)}
                    <FormattedArtists text={album.artistsStr} artistMap={album.artistIds} />
                {/snippet}
            </ItemGrid>
        {/if}
    {/if}

    <!-- sentinel (triggers loading more item if scrolling past this) -->
    {#if activeHasMore}
        <div bind:this={sentinelEl} class="flex justify-center py-6">
            {#if fetching}
                <CircleNotch size="1.5rem" class="animate-spin text-ink-400" />
            {/if}
        </div>
    {:else if initialized}
        <span class="flex text-sm font-bold text-ink-500 select-none">End of results</span>
    {/if}
</div>
