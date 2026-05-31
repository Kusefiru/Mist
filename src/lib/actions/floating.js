// floating.js
import {
    computePosition,
    autoUpdate,
    offset,
    flip,
    shift,
    size
} from '@floating-ui/dom';

export function floating(node, options = {}) {
    let cleanup;

    function setup() {
        cleanup?.();

        const reference = options?.reference;
        if (!reference) return;

        cleanup = autoUpdate(
            reference,
            node,
            async () => {
                const { x, y } = await computePosition(
                    reference,
                    node,
                    {
                        placement: options.placement ?? 'bottom-start',
                        middleware: [
                            offset({ mainAxis: 4, crossAxis: -4 }), // account for internal menu padding
                            flip(),
                            shift({ padding: 8 })
                        ]
                    }
                );

                Object.assign(node.style, {
                    left: `${x}px`,
                    top: `${y}px`
                });
            }
        );
    }

    setup();

    return {
        update(newOptions) {
            options = newOptions ?? {};
            setup();
        },
        destroy() {
            cleanup?.();
        }
    };
}
