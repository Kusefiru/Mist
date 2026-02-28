<script>
    import FadeImage from '$lib/components/ui/FadeImage.svelte';

    const { avatar = null, actions = [], context = null } = $props();

    let open = $state(false);
    let buttonElement = $state(null);
</script>

<div class="relative inline-block">
    <button
        bind:this={buttonElement}
        class="inline-flex size-12 cursor-pointer items-center justify-center rounded-full hover:outline hover:outline-2 hover:outline-primary-10"
        class:outline-primary-10={open}
        onclick={() => {
            open = !open;
        }}
        onfocusout={() => {
            setTimeout(() => {
                open = false;
            }, 200);
        }}
        aria-label="User menu"
    >
        <FadeImage src={avatar} alt="Avatar" class="rounded-full object-cover" />
    </button>
    {#if open && buttonElement}
        <ul
            class="absolute right-0 z-50 mt-1 min-w-[10rem] rounded border border-surface-50 bg-surface-30 p-1 shadow-lg"
        >
            {#each actions as action}
                <li>
                    <button
                        class="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-base text-ink-700 transition-colors hover:bg-surface-10 hover:text-primary-10"
                        onclick={() => action.handler(context)}
                    >
                        {#if action.icon}
                            <action.icon size={22} />
                        {/if}
                        <span>{action.label}</span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>
