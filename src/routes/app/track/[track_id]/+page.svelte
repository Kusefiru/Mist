<script>
    import { cache } from '$lib/stores/cache.svelte';
    import { goto } from "$app/navigation";

    let { params } = $props();

    $effect(() => {
        /* Just redirect, this page does nothing */
        const track = cache.tracks.get(params.track_id);
        if (track) goto(`/app/album/${track.albumId}`);
        goto(`/app/home`);
    })
</script>
