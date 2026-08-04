<script>
    import ItemCard from '$lib/components/item/ItemCard.svelte';

    let {
        items,
        getHref,
        subtitle: renderSubtitle // destructure
    } = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3 pb-4">
    {#each items as item}
        {#key item.id}
            <a href={getHref(item)}>
                <ItemCard {item}>
                    {#snippet subtitle()}
                        {@render renderSubtitle(item)}
                    {/snippet}
                </ItemCard>
            </a>
        {/key}
    {/each}
</div>
