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

        const mainAxis = options.offset?.mainAxis ?? 0;
        const crossAxis = options.offset?.crossAxis ?? 0;

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
                            offset({ mainAxis, crossAxis }),
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
