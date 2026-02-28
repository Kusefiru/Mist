<script>
    import { CaretDown } from 'phosphor-svelte';

    const positionClasses = {
        'bottom-right': 'top-full right-0 mt-1',
        'bottom-left': 'top-full left-0 mt-1',
        'top-right': 'bottom-full right-0 mb-1',
        'top-left': 'bottom-full left-0 mb-1'
    };

    let {
        items = [],
        value = $bindable([]), // Array of selected values
        onValueChange = () => {},
        open = $bindable(false),
        position = 'bottom-left',
        placeholder = 'Select...'
    } = $props();

    let buttonElement = $state(null);

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

    function isChecked(itemValue) {
        return value.includes(itemValue);
    }
</script>

<div class="relative inline-block">
    <button
        bind:this={buttonElement}
        class="flex min-w-[10rem] items-center justify-between gap-2 rounded px-3 py-1.5 text-ink-700 transition-colors hover:bg-surface-20 hover:text-primary-10"
        onclick={() => {
            open = !open;
        }}
        onfocusout={() => {
            setTimeout(() => {
                open = false;
            }, 200);
        }}
    >
        <span class="text-base">{label}</span>
        <CaretDown size={20} />
    </button>

    {#if open && buttonElement}
        <ul
            class="absolute z-50 mt-1 min-w-[10rem] rounded border border-surface-50 bg-surface-30 p-1 shadow-lg {positionClasses[
                position
            ]}"
            style="min-width: {buttonElement.offsetWidth}px;"
        >
            {#each items as item}
                <li>
                    <button
                        class="flex w-full items-center gap-2 rounded px-2 py-1.5 truncate text-base text-ink-700 transition-colors hover:bg-surface-10 hover:text-primary-10"
                        onclick={() => onToggle(item.value)}
                    >
                        <input
                            type="checkbox"
                            checked={isChecked(item.value)}
                            class="pointer-events-none rounded border-primary-10 text-primary-10"
                        />
                        <span>{item.label}</span>
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>
