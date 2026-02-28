<script>
    import { VinylRecord } from 'phosphor-svelte';

    let { disc } = $props();
</script>

<div class="my-1 flex h-8 items-center rounded bg-surface-30 px-2 text-ink-800 shadow select-none">
    <div class="flex w-[3rem] justify-center">
        <VinylRecord size={24} />
    </div>
    <h3 class="pl-2 text-base">Disc {disc}</h3>
</div>
