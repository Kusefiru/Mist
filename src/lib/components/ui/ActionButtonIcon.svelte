<script>
    let { Icon, onClick } = $props();
</script>

<button
    onclick={onClick}
    class="flex w-full cursor-pointer items-center rounded bg-surface-30 px-3 py-1.5 text-ink-800 shadow-md transition-colors hover:bg-surface-20 hover:text-primary-10"
>
    <Icon size={22} />
</button>
