<script>
    let { explicit } = $props();
</script>

{#if explicit === 'explicit'}
    <div class="rounded bg-ink-800 px-1.5 mr-1 text-xs text-surface-10 select-none" title="Explicit">E</div>
{:else if explicit === 'clean'}
    <div class="rounded bg-ink-800 px-1.5 mr-1 text-xs text-surface-10 select-none" title="Clean">C</div>
{/if}
