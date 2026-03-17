<script>
    let { value = $bindable(0), onValueCommit = null } = $props();

    let isDragging = $state(false);
    let sliderRef = $state(null);

    function computePercent(clientX) {
        if (!sliderRef) return 0;

        const rect = sliderRef.getBoundingClientRect();

        return Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    }

    function commit(clientX) {
        const next = computePercent(clientX);

        // If onValueCommit exist, update through it, else update bindable
        if (onValueCommit) {
            onValueCommit(next);
        } else {
            value = next;
        }
    }

    function handlePointerDown(e) {
        isDragging = true;
        sliderRef.setPointerCapture(e.pointerId);
        commit(e.clientX);
        e.preventDefault();
    }

    function handlePointerMove(e) {
        if (isDragging) commit(e.clientX);
    }

    function handlePointerUp(e) {
        isDragging = false;
        sliderRef.releasePointerCapture(e.pointerId);
    }
</script>

<div
    bind:this={sliderRef}
    class="relative flex w-full cursor-pointer touch-none items-center select-none"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
>
    <div class="relative h-1 w-full grow overflow-hidden rounded-full bg-surface-10 dark:bg-surface-50">
        <div class="h-full rounded-full bg-primary-10" style="width: {value}%"></div>
    </div>
</div>
