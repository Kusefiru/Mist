<script>
    import '../app.css';
    import { session } from '$lib/stores/auth.svelte.js';
    import { cache } from '$lib/stores/cache.svelte.js';
    import { ui } from '$lib/stores/ui.svelte';
    import logo from '$lib/assets/logo.svg';

    import { onMount } from 'svelte';
    import { Toaster } from 'svelte-french-toast';
    import { saveTheme } from '$lib/db/local';

    let { children } = $props();

    $effect(() => {
        document.documentElement.classList.toggle('dark', ui.darkTheme);
        saveTheme(ui.darkTheme ? 'dark' : 'light');
    });
</script>

<svelte:head>
    <link rel="icon" href={logo} />
</svelte:head>

<Toaster
    position="bottom-center"
    containerStyle="bottom: 120px;"
    toastOptions={{
        className: 'bg-primary-20! text-fill! font-semibold! shadow! rounded!'
    }}
/>

{@render children()}
