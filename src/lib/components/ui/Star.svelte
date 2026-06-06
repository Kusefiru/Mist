<script>
    import { Heart, HeartBreak } from 'phosphor-svelte';
    import { cache } from '$lib/stores/cache.svelte.js';
    import { star, unstar } from '$lib/opensubsonic/api';

    let { id, size = 20, hidden = false } = $props();

    const starred = $derived(cache.stars.has(id));

    let hovered = $state(false);

    function toggleStar() {
        if (!starred) {
            cache.stars.add(id);
            star(id);
        } else {
            cache.stars.delete(id);
            unstar(id);
        }
    }
</script>

{#if !hidden || starred}
    <button
        class="flex-shrink-0 cursor-pointer transition-colors hover:text-primary-20"
        class:text-primary-10={starred}
        onclick={toggleStar}
        onmouseenter={() => (hovered = true)}
        onmouseleave={() => (hovered = false)}
    >
        {#if starred && hovered}
            <HeartBreak {size} weight='fill' />
        {:else}
            <Heart {size} weight={starred ? 'fill' : 'bold'} />
        {/if}
    </button>
{/if}
