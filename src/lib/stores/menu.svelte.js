class MenuStore {
    /**
     * A list of action. Each action is:
     *   - icon: Icon for this action
     *   - label: Text for this action
     *   - handler: Handler when this action is selected
     *   - children (optional): Sub action list when this action is hovered
     */
    groups = $state([]);

    /* For which component is the menu open */
    owner = $state(null);

    /**
     * Anchor is either:
     *   - element, placement: When opened relative to an element
     *   - x, y: When opened through right-click
     */
    anchor = $state(null);

    /* If the menu is visible (open) */
    visible = $state(false);

    /* Sub items opened by this menu */
    submenuPath = $state(/** @type {number[]} */ ([]));

    open(anchor, groups, owner) {
        this.groups = groups;
        this.owner = owner;
        this.anchor = anchor;
        this.visible = true;
        this.submenuPath = [];
    }

    close() {
        this.visible = false;
        this.submenuPath = [];
    }

    setSubmenuPath(path) {
        this.submenuPath = path;
    }

    /* Open anchored to a an element (e.g. a button). */
    openFromElement(element, groups, owner = null, placement = 'bottom-end') {
        this.open({ element, placement }, groups, owner);
    }

    /* Open at an event coordinate. */
    openFromContext(event, groups, owner = null) {
        event.preventDefault();
        this.open({ x: event.clientX, y: event.clientY }, groups, owner);
    }

    /* If this menu is open and owned by the given component. */
    isOpenFor(component) {
        return this.visible && this.owner === component;
    }
}

export const menu = new MenuStore();
