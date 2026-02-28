<script>
    import { Heart } from 'phosphor-svelte';
    import { cache } from '$lib/stores/cache.svelte.js';
    import { star, unstar } from '$lib/opensubsonic/api';

    let { trackId, size = 20, hidden = false } = $props();
    const starred = $derived(cache.stars.has(trackId));

    function toggleStar() {
        if (!starred) {
            cache.stars.add(trackId);
            star(trackId);
        } else {
            cache.stars.delete(trackId);
            unstar(trackId);
        }
    }
</script>

{#if !hidden || starred}
    <button
        class="flex-shrink-0 cursor-pointer transition-colors hover:text-primary-20"
        class:text-primary-10={starred}
        onclick={toggleStar}
    >
        <Heart {size} weight={starred ? 'fill' : 'bold'} />
    </button>
{/if}
