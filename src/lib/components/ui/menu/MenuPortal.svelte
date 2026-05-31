<script>
    import { onDestroy } from 'svelte';
    import { floating } from '$lib/actions/floating';
    import { menu } from '$lib/stores/menu.svelte.js';
    import MenuPanel from './MenuPanel.svelte';

    let menuEl = $state(null);

    let virtualReference = $derived.by(() => {
        if (!menu.anchor) return null;

        if ('x' in menu.anchor) {
            return {
                getBoundingClientRect() {
                    return {
                        x: menu.anchor.x,
                        y: menu.anchor.y,
                        left: menu.anchor.x,
                        right: menu.anchor.x,
                        top: menu.anchor.y,
                        bottom: menu.anchor.y,
                        width: 0,
                        height: 0
                    };
                }
            };
        }

        return menu.anchor.element;
    });

    function placement() {
        if (!menu.anchor || 'x' in menu.anchor) {
            return 'bottom-start';
        }

        return menu.anchor.placement ?? 'bottom-end';
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

    function handlePointerDown(event) {
        // If click is on the menu, do nothing (transmitted to MenuPanel)
        if (menuEl?.contains(event.target)) return;
        menu.close();
    }

    function handleScroll() {
        menu.close();
    }

    $effect(() => {
        if (!menu.visible) return;

        document.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('scroll', handleScroll, true);
        };
    });

    onDestroy(() => {
        document.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('scroll', handleScroll, true);
    });
</script>

{#if menu.visible}
    <div
        bind:this={menuEl}
        use:portal
        use:floating={{
            reference: virtualReference,
            placement: placement()
        }}
        class="fixed z-50"
    >
        <MenuPanel
            root={true}
            groups={menu.groups}
            activePath={menu.submenuPath}
            onPathChange={(p) => menu.setSubmenuPath(p)}
            onClose={() => menu.close()}
        />
    </div>
{/if}
