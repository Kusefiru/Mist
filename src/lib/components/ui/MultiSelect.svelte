<script>
    import { CaretDown } from 'phosphor-svelte';
    import { floating } from '$lib/actions/floating';

    let {
        items = [],
        value = $bindable([]),
        onValueChange = () => {},
        open = $bindable(false),
        placement = 'bottom-start',
        placeholder = 'Select...'
    } = $props();

    let buttonElement = $state(null);
    let dropdownEl = $state(null);

    let label = $derived.by(() => {
        if (value.length === 0) return placeholder;
        if (value.length === 1) {
            const item = items.find((item) => item.value === value[0]);
            return item?.label || placeholder;
        }
        return `${value.length} selected`;
    });

    function onToggle(itemValue) {
        if (value.includes(itemValue)) {
            value = value.filter((v) => v !== itemValue);
        } else {
            value = [...value, itemValue];
        }
        onValueChange(value);
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
    class="flex min-w-[10rem] items-center justify-between gap-2 rounded px-3 py-1.5 text-ink-800 transition-colors hover:bg-surface-40 hover:text-primary-10"
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
                    class="flex w-full items-center gap-2 truncate rounded px-2 py-1.5 text-base text-ink-900 transition-colors hover:bg-surface-00"
                    onclick={() => onToggle(item.value)}
                >
                    <input
                        type="checkbox"
                        checked={value.includes(item.value)}
                        class="pointer-events-none rounded border-primary-10 text-primary-10"
                    />
                    <span>{item.label}</span>
                </button>
            </li>
        {/each}
    </ul>
{/if}
