<script>
    import { SpeakerSimpleLow, SpeakerSimpleHigh, SpeakerSimpleX } from 'phosphor-svelte';

    let { value = $bindable() } = $props();

    let isDragging = $state(false);
    let sliderRef = $state(null);

    let icon = $derived(
        value === 0 ? SpeakerSimpleX : value < 50 ? SpeakerSimpleLow : SpeakerSimpleHigh
    );

    function updateValue(clientX) {
        if (!sliderRef) return;

        const rect = sliderRef.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));

        value = Math.round(percentage);
    }

    function handlePointerDown(e) {
        isDragging = true;
        updateValue(e.clientX);
        e.preventDefault();
    }

    function handlePointerMove(e) {
        if (isDragging) {
            updateValue(e.clientX);
        }
    }

    function handlePointerUp() {
        isDragging = false;
    }

    $effect(() => {
        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);

            return () => {
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
            };
        }
    });
</script>

<div class="flex w-full items-center justify-end">
    <div class="pr-2 text-lg text-ink-700">
        <svelte:component this={icon} size={28} />
    </div>

    <div
        bind:this={sliderRef}
        class="relative flex w-full cursor-pointer touch-none items-center select-none"
        onpointerdown={handlePointerDown}
    >
        <div class="relative h-1 w-full grow overflow-hidden rounded-full bg-surface-10">
            <div class="h-full rounded-full bg-primary-10" style="width: {value}%"></div>
        </div>
    </div>
</div>
