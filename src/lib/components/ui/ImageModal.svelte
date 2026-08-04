<script>
    import { X } from 'phosphor-svelte';
    import { fade, scale } from 'svelte/transition';

    let { src, alt = '', onClose } = $props();

    function handleKeydown(e) {
        if (e.key === 'Escape') onClose();
    }

    // Portal to document.body so this always escapes any ancestor
    // stacking context (e.g. z-10 wrappers on individual pages) and
    // reliably renders above the footer / fullscreen player.
    function portal(node) {
        document.body.appendChild(node);
        return {
            destroy() {
                node.remove();
            }
        };
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
    use:portal
    class="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/80 p-12 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    onclick={onClose}
>
    <button
        class="absolute top-6 right-6 rounded p-2 text-ink-100 transition-colors hover:bg-surface-30/30"
        onclick={onClose}
        aria-label="Close"
    >
        <X size="1.75rem" />
    </button>

    <img
        {src}
        {alt}
        class="max-h-full max-w-full rounded object-contain shadow-2xl shadow-neutral-950/50"
        transition:scale={{ duration: 200, start: 0.95 }}
        onclick={(e) => e.stopPropagation()}
    />
</div>
