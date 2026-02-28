<script>
    import '../app.css';
    import { session } from '$lib/stores/auth.svelte.js';
    import { cache } from '$lib/stores/cache.svelte.js';
    import logo from '$lib/assets/logo.svg';

    import { onMount } from 'svelte';
    import { Toaster } from 'svelte-french-toast';

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={logo} />
</svelte:head>

<Toaster
    position="bottom-center"
    containerStyle="bottom: 120px;"
    toastOptions={{
        className: 'bg-primary-10! text-surface-10! shadow! rounded!'
    }}
/>

{@render children()}
