<script>
    import { scale } from 'svelte/transition';

    let {
        title = 'Are you sure?',
        message = '',
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        onConfirm,
        onClose
    } = $props();

    let processing = $state(false);

    async function handleConfirm() {
        processing = true;
        try {
            await onConfirm?.();
        } finally {
            processing = false;
        }
    }
</script>

<div
    class="flex flex-col rounded bg-surface-40 p-6 shadow-xl shadow-neutral-950/50"
    style="width: 380px;"
    transition:scale={{ duration: 200, start: 0.95 }}
    onclick={(e) => e.stopPropagation()}
>
    <h2 class="mb-2 text-xl font-bold text-ink-900">{title}</h2>
    {#if message}
        <p class="mb-6 text-base text-ink-800">{message}</p>
    {/if}
    <div class="flex justify-end gap-3">
        <button
            onclick={onClose}
            disabled={processing}
            class="rounded px-4 py-1.5 font-medium text-ink-900 transition-colors hover:text-primary-20 disabled:opacity-50"
        >
            {cancelLabel}
        </button>
        <button
            onclick={handleConfirm}
            disabled={processing}
            class="rounded bg-primary-10 px-4 py-1.5 font-medium text-ink-100 shadow-sm shadow-surface-50 transition-colors hover:bg-primary-20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-ink-900"
        >
            {processing ? 'Please wait…' : confirmLabel}
        </button>
    </div>
</div>
