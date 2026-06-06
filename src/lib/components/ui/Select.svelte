<script>
    import { CaretDown } from 'phosphor-svelte';
    import { floating } from '$lib/actions/floating';

    let {
        items = [],
        value = $bindable(null),
        open = $bindable(false),
        placement = 'bottom-start',
        placeholder = 'Select...'
    } = $props();

    let buttonElement = $state(null);
    let dropdownEl = $state(null);

    let label = $derived.by(() => {
        const item = items.find((item) => item.value === value);
        return item?.label || placeholder;
    });

    function handleSelect(itemValue) {
        value = itemValue;
        open = false;
    }

    function portal(node) {
        document.body.appendChild(node);
        return {
            destroy() {
                node.remove();
            }
        };
    }

    function handlePointerDown(event) {
        if (dropdownEl?.contains(event.target)) return;
        if (buttonElement?.contains(event.target)) return;
        open = false;
    }

    function handleScroll() {
        open = false;
    }

    $effect(() => {
        if (!open) return;

        document.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('scroll', handleScroll, true);
        };
    });
</script>

<button
    bind:this={buttonElement}
    class="flex min-w-[10rem] items-center justify-between rounded px-3 py-1.5 text-ink-800 transition-colors hover:bg-surface-40 hover:text-primary-10"
    onclick={() => (open = !open)}
>
    <span class="text-base">{label}</span>
    <CaretDown size={'1.25rem'} />
</button>

{#if open && buttonElement}
    <ul
        bind:this={dropdownEl}
        use:portal
        use:floating={{ reference: buttonElement, placement }}
        class="fixed z-50 min-w-[10rem] rounded bg-surface-40 p-1 shadow-lg shadow-neutral-950/50"
        style="min-width: {buttonElement.offsetWidth}px;"
    >
        {#each items as item}
            <li>
                <button
                    class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-base text-ink-900 transition-colors hover:bg-surface-00 {item.value ===
                    value
                        ? 'bg-surface-10'
                        : ''}"
                    onclick={() => handleSelect(item.value)}
                >
                    {#if item.icon}
                        <item.icon size={'1.25rem'} />
                    {/if}
                    <span>{item.label}</span>
                </button>
            </li>
        {/each}
    </ul>
{/if}
