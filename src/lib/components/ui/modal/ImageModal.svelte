<script>
    import { X } from 'phosphor-svelte';
    import { scale } from 'svelte/transition';

    let { src, alt = '', onClose } = $props();
</script>

<img
    {src}
    {alt}
    class="max-h-[90%] max-w-[90%] rounded object-contain shadow-2xl shadow-neutral-950/50"
    transition:scale={{ duration: 200, start: 0.95 }}
    onclick={(e) => e.stopPropagation()}
/>
