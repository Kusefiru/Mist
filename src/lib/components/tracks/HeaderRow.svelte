<script>
    import { Clock, Hash, Heart } from 'phosphor-svelte';

    let { columns = ['track', 'title', 'duration', 'quality', 'starred', 'actions'] } = $props();
</script>

<div class="flex h-8 items-center px-2 text-sm text-ink-800 select-none">
    <!-- Track number -->
    {#if columns.includes('track')}
        <div class="flex w-[3rem] justify-center">
            <Hash size={"1rem"} />
        </div>
    {/if}
    {#if columns.includes('cover')}
        <div class="w-[3rem]"></div>
    {/if}
    {#if columns.includes('title')}
        <div class="min-w-0 flex-1 pl-2">Track</div>
    {/if}
    {#if columns.includes('album')}
        <div class="min-w-0 flex-1 pl-2">Album</div>
    {/if}
    {#if columns.includes('duration')}
        <div class="flex w-[5rem] justify-end text-center">
            <Clock size={"1rem"} />
        </div>
    {/if}
    {#if columns.includes('starred')}
        <div class="flex w-[3rem] items-center justify-center">
            <Heart size={"1rem"} />
        </div>
    {/if}
    {#if columns.includes('quality')}
        <div class="w-[5rem] items-center px-2 text-center">Quality</div>
    {/if}
    {#if columns.includes('actions')}
        <div class="relative w-[2rem] justify-center text-center"></div>
    {/if}
</div>
