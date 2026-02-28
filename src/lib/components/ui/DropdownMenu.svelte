<script>
    import { DotsThreeVertical } from 'phosphor-svelte';
    import { onDestroy } from 'svelte';

    const positionClasses = {
        'bottom-right': 'top-full right-0 mt-1',
        'bottom-left': 'top-full left-0 mt-1',
        'top-right': 'bottom-full right-0 mb-1',
        'top-left': 'bottom-full left-0 mb-1'
    };

    let {
        actions = [],
        context = null,
        open = $bindable(false),
        position = 'bottom-right'
    } = $props();

    let buttonElement = $state(null);
    let menuStyle = $state('');

    function computeMenuPosition() {
        if (!buttonElement) return;
        const rect = buttonElement.getBoundingClientRect();
        const isTop = position.startsWith('top');
        const isRight = position.endsWith('right');

        if (isTop) {
            menuStyle = `bottom: ${window.innerHeight - rect.top + 4}px;`;
        } else {
            menuStyle = `top: ${rect.bottom + 4}px;`;
        }

        if (isRight) {
            menuStyle += ` right: ${window.innerWidth - rect.right}px;`;
        } else {
            menuStyle += ` left: ${rect.left}px;`;
        }
    }

    // Portal action: moves the element to document.body
    function portal(node) {
        document.body.appendChild(node);
        return {
            destroy() {
                node.remove();
            }
        };
    }

    function openMenu() {
        computeMenuPosition();
        open = true;
        window.addEventListener('scroll', closeOnScroll, { capture: true, once: true });
    }

    function closeOnScroll() {
        open = false;
    }

    onDestroy(() => {
        window.removeEventListener('scroll', closeOnScroll, { capture: true });
    });
</script>

<div class="relative inline-block">
    <button
        bind:this={buttonElement}
        class="cursor-pointer transition-colors hover:text-primary-10"
        onclick={openMenu}
        onfocusout={() => {
            setTimeout(() => {
                open = false;
            }, 200);
        }}
    >
        <DotsThreeVertical size={22} weight={'bold'} />
    </button>
    {#if open && buttonElement}
        <ul
            class="fixed z-500 mt-1 min-w-[10rem] rounded border border-surface-50 bg-surface-30 p-1 shadow-lg"
            style={menuStyle}
            use:portal
        >
            {#each actions as action}
                <button
                    class="flex w-full cursor-pointer items-center gap-2 rounded-xs px-2 py-1.5 text-base text-ink-700 transition-colors hover:bg-surface-10 hover:text-primary-10"
                    onclick={() => action.handler(context)}
                >
                    {#if action.icon}
                        <action.icon size={22} />
                    {/if}
                    {action.label}
                </button>
            {/each}
        </ul>
    {/if}
</div>
