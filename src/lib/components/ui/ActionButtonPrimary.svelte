<script>
    let { Icon, text = '', onClick } = $props();
</script>

<button
    onclick={onClick}
    class="text-md flex w-full cursor-pointer items-center gap-2 rounded bg-primary-10 px-3 py-1.5 text-surface-10 shadow-md transition-colors hover:bg-primary-20"
>
    <Icon size={22} weight="fill" />
    <span>{text}</span>
</button>
