class ModalStore {
    /* The component to render, or null if no modal is open */
    component = $state(null);

    /* Props passed to that component */
    props = $state({});

    open(component, props = {}) {
        this.component = component;
        this.props = props;
    }

    close() {
        this.component = null;
        this.props = {};
    }
}

export const modal = new ModalStore();
