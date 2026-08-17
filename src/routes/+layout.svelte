<script>
    import '../app.css';
    import { session } from '$lib/stores/auth.svelte.js';
    import { cache } from '$lib/stores/cache.svelte.js';
    import { ui } from '$lib/stores/ui.svelte';
    import logo from '$lib/assets/logo.svg';
    import ModalPortal from '$lib/components/ui/modal/ModalPortal.svelte';

    import { onMount } from 'svelte';
    import { Toaster } from 'svelte-french-toast';
    import { saveTheme } from '$lib/db/local';

    let { children } = $props();

    $effect(() => {
        // dark theme or auto and browser is dark mode
        const isDark =
            ui.theme === 'dark' ||
            (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
        saveTheme(ui.theme);
    });
</script>

<svelte:head>
    <link rel="icon" href={logo} />
</svelte:head>

<ModalPortal />
<Toaster
    position="bottom-center"
    containerStyle="bottom: 120px;"
    toastOptions={{
        className: 'bg-primary-10! text-ink-100! font-semibold! shadow! rounded! dark:text-ink-900!'
    }}
/>

{@render children()}
