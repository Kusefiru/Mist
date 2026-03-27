<script>
    import ArtistCard from '$lib/components/artist/ArtistCard.svelte';

    let { artists } = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3 pb-4">
    {#each artists as artist}
        {#key artist.id}
            <a href="/app/artist/{artist.id}">
                <ArtistCard {artist} />
            </a>
        {/key}
    {/each}
</div>
