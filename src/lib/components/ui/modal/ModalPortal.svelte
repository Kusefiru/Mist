<script>
    import { fade } from 'svelte/transition';
    import { modal } from '$lib/stores/modal.svelte.js';

    function portal(node) {
        document.body.appendChild(node);
        return {
            destroy() {
                node.remove();
            }
        };
    }

    function handleKeydown(e) {
        if (e.key === 'Escape' && modal.component) modal.close();
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if modal.component}
    <div
        use:portal
        class="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/50 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        onclick={() => modal.close()}
    >
        <modal.component {...modal.props} onClose={() => modal.close()} />
    </div>
{/if}
