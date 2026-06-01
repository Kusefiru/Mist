<script>
    let { html = '', lines = 5 } = $props();

    let expanded = $state(false);
    let contentEl = $state(null);

    let height = $derived(expanded ? `${contentEl?.scrollHeight ?? 0}px` : `${lines * 1.5}rem`);

    const sanitized = $derived.by(() => {
        if (!html) return '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.querySelectorAll('a').forEach((a) => a.remove());
        return doc.body.innerHTML.trim();
    });
</script>

{#if sanitized}
    <div class="flex flex-col gap-2 rounded-[0.4rem] bg-surface-20 px-4 py-3">
        <div
            bind:this={contentEl}
            class="overflow-hidden text-ink-900 transition-[height] duration-300 ease-in-out"
            style:height
        >
            {@html sanitized}
        </div>

        <button
            class="flex text-sm font-bold text-ink-600 transition-colors hover:text-primary-10"
            onclick={() => (expanded = !expanded)}
        >
            {#if expanded}
                Show less
            {:else}
                Show more
            {/if}
        </button>
    </div>
{/if}
