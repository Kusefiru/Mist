<script>
    import AlbumCard from '$lib/components/album/AlbumCard.svelte';

    let { albums, options = {} } = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3 pb-4">
    {#each albums as album}
        <a href="/app/album/{album.id}">
            <AlbumCard {album} {...options} />
        </a>
    {/each}
</div>
