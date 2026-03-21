<script>
    import { page } from '$app/state';

    let  { href, Icon, text = '' } = $props();

    const route = $derived(page.url.pathname);
</script>

<a
    {href}
    class="flex cursor-pointer items-center gap-2 rounded p-2 font-medium transition-colors select-none hover:bg-surface-10 hover:text-primary-10"
    class:text-primary-10={(route === href)}
>
    <Icon size={"2rem"} class="shrink-0" />
    {#if text}
        <span class="truncate text-base">{text}</span>
    {/if}
</a>
