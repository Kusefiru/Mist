<script>
    import { User } from 'phosphor-svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import ItemHeader from '$lib/components/item/ItemHeader.svelte';
    import ControlsRow from '$lib/components/tracks/ControlsRow.svelte';
    import TrackList from '$lib/components/tracks/TrackList.svelte';
    import FormattedArtists from '$lib/components/ui/FormattedArtists.svelte';
    import { buildAddToPlaylistGroup } from '$lib/components/ui/menu/actions/playlist';
    import { cache } from '$lib/stores/cache.svelte';
    import { formatDurationReadable } from '$lib/utils/format';
    import { untrack } from 'svelte';
    import { fade } from 'svelte/transition';

    let { params } = $props();

    const scrollToId = $derived(page.url.searchParams.get('t'));

    /* Content states */
    let album = $state(null);
    let discEntries = $state([]);
    let albumQueue = $state([]);

    let menuActions = $derived.by(() => {
        return [
            buildAddToPlaylistGroup(albumQueue),
            [
                {
                    icon: User,
                    label: 'Go to artist...',
                    children: [
                        album?.artistIds.map((a) => ({
                            icon: User,
                            label: a.name,
                            handler: () => goto(`/app/artist/${a.id}`)
                        }))
                    ]
                }
            ]
        ];
    });

    /* This function clears state so that switching album does not look weird */
    function clearState() {
        album = null;
        discEntries = [];
        albumQueue = [];
    }

    async function loadAlbum(albumId) {
        album = await cache.getAlbum(albumId);

        const tracks = album.songIds
            .map((id) => cache.tracks.get(id))
            .sort((a, b) => (a.disc ?? 1) - (b.disc ?? 1) || a.track - b.track);

        const discs = {};
        for (const track of tracks) {
            const disc = track.disc ?? 1;
            if (!discs[disc]) discs[disc] = [];
            discs[disc].push(track.id);
        }
        discEntries = discs;

        albumQueue = tracks.map((t) => t.id);
    }

    $effect(() => {
        const albumId = params.album_id;
        clearState();
        untrack(() => loadAlbum(albumId));
    });
</script>

<div class="relative px-8 pt-2 pb-12">
    <div class="relative z-10 flex flex-col gap-4">
        <ItemHeader item={album}>
            {#snippet title()}
                <h2 class="break-words whitespace-normal">
                    {album.name}
                </h2>
                <h2 class="text-ink-800 italic">{album.version}</h2>
            {/snippet}
            {#snippet subtitle()}
                <FormattedArtists text={album.artistsStr} artistMap={album.artistIds} />
            {/snippet}
            {#snippet category()}
                {album.typeStr}
            {/snippet}
            {#snippet details()}
                {#if !album.hasSameReleaseDate}
                    {album.originalDateStr} • Released {album.releaseDateStr} 
                {:else}
                    {album.releaseDateStr} 
                {/if}
                • {album.songCount} tracks • {formatDurationReadable(album.duration)}
            {/snippet}
        </ItemHeader>

        {#if album}
            <section in:fade={{ duration: 300 }} class="flex flex-col gap-4">
                <ControlsRow queue={$state.snapshot(albumQueue)} {menuActions} />
                <TrackList tracks={discEntries} variant="album" {scrollToId} />
                <span class="pl-2 text-sm font-semibold text-ink-600 select-none">
                    ℗ {album.releaseDate.year} {album.labels.join(', ')}
                </span>
            </section>
        {/if}
    </div>
</div>
