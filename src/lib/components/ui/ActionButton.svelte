<script>
    let { Icon, title = '', onclick, primary = true, iconOnly = false } = $props();

    let buttonStyle = $derived(
        primary
            ? 'bg-primary-10 text-ink-100 hover:bg-primary-20 dark:text-ink-900'
            : 'bg-surface-50 text-ink-900 hover:bg-surface-40 hover:text-primary-10'
    );
    let iconWeight = $derived(primary ? 'fill' : 'regular');
</script>

<button
    {onclick}
    class="inline-flex cursor-pointer items-center gap-2 rounded px-4 py-1.5 shadow-sm shadow-surface-50 transition-colors {buttonStyle}"
    {title}
>
    <Icon size={'1.25rem'} weight={iconWeight} />
    {#if !iconOnly}
        <span class="font-medium">{title}</span>
    {/if}
</button>
