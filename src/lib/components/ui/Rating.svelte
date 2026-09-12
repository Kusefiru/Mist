<script>
    import { Star } from 'phosphor-svelte';
    import { cache } from '$lib/stores/cache.svelte.js';

    let { id, size = 20, hidden = false } = $props();

    const rating = $derived(cache.ratings.get(id) ?? 0);

    let hovered = $state(0);

    function updateRating(r) {
        const newRating = (r === rating) ? 0 : r;
        cache.ratings.set(id, newRating);
    }
</script>

{#if !hidden || (rating > 0)}
    <div class="flex">
        {#each {length: 5} as _, i}
            {@const starRating = i + 1}
            {@const filled = hovered > 0 ? starRating <= hovered : starRating <= rating}

            <button
                class="flex-shrink-0 cursor-pointer transition-colors text-ink-700"
                class:text-yellow-10={filled || hovered > 0}
                onclick={() => {updateRating(starRating)}}
                onmouseenter={() => (hovered = starRating)}
                onmouseleave={() => (hovered = 0)}
            >
                <Star {size} weight={filled ? 'fill' : 'bold'} />
            </button>
        {/each}
    </div>
{/if}
