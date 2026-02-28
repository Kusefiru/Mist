<script>
    import PlaylistCard from '$lib/components/playlist/PlaylistCard.svelte';

    let { playlists } = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 pb-4">
    {#each playlists as playlist}
        <a href="/app/playlist/{playlist.id}">
            <PlaylistCard {playlist} />
        </a>
    {/each}
</div>
