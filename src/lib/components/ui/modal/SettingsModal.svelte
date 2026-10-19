<script>
    import { HardDrives, Info, Palette } from 'phosphor-svelte';
    import { scale } from 'svelte/transition';
    import {
        PUBLIC_VERSION_COMMIT,
        PUBLIC_VERSION_TAG,
        PUBLIC_VERSION_TYPE
    } from '$env/static/public';
    import Select from '$lib/components/ui/Select.svelte';
    import { ui } from '$lib/stores/ui.svelte';
    import { server } from '$lib/stores/server.svelte';

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

<div
    class="flex max-h-[80vh] w-[48rem] max-w-[90vw] flex-col rounded bg-surface-40 p-6 shadow-xl shadow-neutral-950/50"
    transition:scale={{ duration: 200, start: 0.95 }}
    onclick={(e) => e.stopPropagation()}
>
    <h2 class="mb-4 text-xl font-bold text-ink-900">Settings</h2>

    <div class="space-y-4 overflow-y-auto px-6 pt-2 pb-6 text-ink-900 select-none">
        <section>
            <div class="mb-2 flex items-center gap-3">
                <Palette size="2rem" class="text-primary-10" />
                <h2 class="text-2xl font-semibold">Appearance</h2>
            </div>

            <div class="flex items-center justify-between px-8 py-4">
                <h3>Theme</h3>
                <div class="flex w-56 justify-end">
                    <Select items={themeOptions} bind:value={ui.theme} />
                </div>
            </div>
        </section>

        <section>
            <div class="mb-2 flex items-center gap-3">
                <HardDrives size="2rem" class="text-primary-10" />
                <h2 class="text-2xl font-semibold">Server</h2>
            </div>

            <div class="px-8 py-4">
                <div class="flex items-center justify-between">
                    <h3>Prefer sonic similarity</h3>
                    <div class="flex w-56 justify-end">
                        <input
                            type="checkbox"
                            bind:checked={ui.media.preferSonicSimilarity}
                            class="rounded border-primary-10 text-primary-10 focus:ring-0 focus:outline-none disabled:opacity-50"
                        />
                    </div>
                </div>
                <p class="text-sm text-ink-600">
                    Track radio uses sonic analysis instead of metadata-based similarity.<br />
                    Requires the server to support the sonicSimilarity endpoint.
                </p>
                <p class="text-sm text-ink-600 font-bold">
                    {#if server.supports('sonicSimilarity')}
                        Supported by the current server.
                    {:else}
                        Not supported by the current server.
                    {/if}
                </p>
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

                <div class="flex w-56 justify-end gap-1 select-text">
                    <a href={versionHref} target="_blank" class="text-primary-10 hover:underline"
                        >{versionLabel}</a
                    >
                    {#if commitLabel}
                        <span>({commitLabel})</span>
                    {/if}
                </div>
            </div>
        </section>
    </div>
</div>
