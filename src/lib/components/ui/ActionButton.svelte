<script>
    let { Icon, title = '', onclick, primary = true, iconOnly = false } = $props();

    let buttonStyle = $derived(primary ? "text-ink-100 bg-primary-10 hover:bg-primary-20 dark:text-ink-800" : "text-ink-800 bg-surface-30 hover:bg-surface-20")
    let iconWeight = $derived(primary ? "fill" : "regular")
</script>

<button
    onclick={onclick}
    class="inline-flex cursor-pointer items-center gap-2 rounded px-4 py-1.5 text-fill shadow-sm shadow-surface-30 transition-colors {buttonStyle}"
    title={title}
>
    <Icon size={"1.25rem"} weight={iconWeight} />
    {#if !iconOnly}
        <span class="font-medium">{title}</span>
    {/if}
</button>
