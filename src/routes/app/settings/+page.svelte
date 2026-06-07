<script>
    import { Info, Palette } from 'phosphor-svelte';
    import {
        PUBLIC_VERSION_COMMIT,
        PUBLIC_VERSION_TAG,
        PUBLIC_VERSION_TYPE
    } from '$env/static/public';
    import Select from '$lib/components/ui/Select.svelte';
    import { ui } from '$lib/stores/ui.svelte';

    const themeOptions = [
        { value: 'auto', label: 'System' },
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' }
    ];

    const versionHref =
        PUBLIC_VERSION_TYPE === 'release' || PUBLIC_VERSION_TYPE === 'prerelease'
            ? `https://www.github.com/Kusefiru/Mist/releases/tag/${PUBLIC_VERSION_TAG}`
            : `https://www.github.com/Kusefiru/Mist/commit/${PUBLIC_VERSION_COMMIT}`;
    const versionLabel =
        PUBLIC_VERSION_TYPE === 'release' || PUBLIC_VERSION_TYPE === 'prerelease'
            ? PUBLIC_VERSION_TAG
            : 'dev';
    const commitLabel = PUBLIC_VERSION_COMMIT?.slice(0, 7);
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

        <section>
            <div class="mb-2 flex items-center gap-3">
                <Info size="2rem" class="text-primary-10" />
                <div>
                    <h2 class="text-2xl font-semibold">About</h2>
                </div>
            </div>

            <div class="flex items-center justify-between px-8 py-4">
                <h3>Version</h3>

                <div class="w-56 select-text">
                    <a href={versionHref} target="_blank" class="text-primary-10 hover:underline"
                        >{versionLabel}</a
                    >
                    {#if commitLabel}
                        ({commitLabel})
                    {/if}
                </div>
            </div>
        </section>
    </div>
</div>
