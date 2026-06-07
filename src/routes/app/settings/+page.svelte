<script>
    import { Palette } from 'phosphor-svelte';
    import Select from '$lib/components/ui/Select.svelte';
    import { ui } from '$lib/stores/ui.svelte';

    const themeOptions = [
        { value: 'auto', label: 'System' },
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' }
    ];
</script>

<div class="overflow-auto p-6">
    <div class="mx-auto max-w-[48rem] space-y-4 text-ink-900 select-none">
        <section>
            <div class="mb-2 flex items-center gap-3">
                <Palette size="2rem" class="text-primary-10" />
                <h2 class="text-2xl font-semibold">Appearance</h2>
            </div>

            <div class="flex items-center justify-between px-8 py-4">
                <h3>Theme</h3>
                <div class="w-56">
                    <Select items={themeOptions} bind:value={ui.theme} />
                </div>
            </div>
        </section>
    </div>
</div>
