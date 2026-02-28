<script>
    import { fade } from 'svelte/transition';
    import logo from '$lib/assets/logo.svg';
</script>

<div
    transition:fade={{ duration: 300 }}
    class="fixed inset-0 z-50 flex items-center justify-center bg-surface-30"
>
    <img src={logo} alt="Mist" class="h-auto w-64" />
</div>
