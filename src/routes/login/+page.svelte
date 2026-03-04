<script>
    import { goto } from '$app/navigation';
    import { ping } from '$lib/opensubsonic/api';
    import { database } from '$lib/db/index.js';
    import { session } from '$lib/stores/auth.svelte.js';
    import logo from '$lib/assets/logo.svg';
    import toast from 'svelte-french-toast';

    let serverUrl = $state('');
    let username = $state('');
    let password = $state('');
    let loading = $state(false);

    function normalizeUrl(url) {
        url = url.trim();
        if (!url) return url;

        // Add https:// if no protocol is specified
        if (!url.match(/^https?:\/\//i)) {
            // Test if url is IP (xxx.xxx.xxx.xxx)
            const isIp = url.match(/\b(?:\d{1,3}.){3}\d{1,3}\b/g);
            // Add http to IP addresses, else https
            url = (isIp ? 'http://' : 'https://') + url;
        }

        return url;
    }

    async function login() {
        // Validate inputs
        if (!serverUrl.trim()) {
            toast.error('Please enter a server URL');
            return;
        }

        if (!username.trim()) {
            toast.error('Please enter a username');
            return;
        }

        if (!password) {
            toast.error('Please enter a password');
            return;
        }

        const normalizedUrl = normalizeUrl(serverUrl);

        loading = true;

        try {
            // Set login information
            await session.save(normalizedUrl, username, password);

            // Try to connect
            const status = await ping();

            if (status !== 'ok') {
                toast.error('Invalid credentials or server not reachable');
                await database.clearLogin();
                loading = false;
                return;
            }

            toast.success('Login successful!');
            goto('/app/home');
        } catch (err) {
            console.error('Login error:', err);
            toast.error('Failed to connect to server. Please check your URL and try again.');
            await database.clearLogin();
            loading = false;
        }
    }

    function handleKeydown(event) {
        if (event.key === 'Enter' && !loading) {
            login();
        }
    }
</script>

<div class="fixed inset-0 flex flex-col bg-surface-10">
    <div class="bg-grain flex flex-1 items-center justify-center">
        <div class="flex flex-col rounded bg-surface-30 p-8 shadow-xl" style="width: 420px;">
            <!-- Logo and Title -->
            <div class="mb-8 flex items-center justify-center gap-4">
                <img src={logo} alt="Mist" class="h-20 w-20" />
                <h1 class="font-mplus text-4xl font-bold text-surface-70">Mist</h1>
            </div>

            <!-- Input Fields -->
            <div class="flex flex-col gap-4">
                <input
                    class="w-full border-b-2 border-ink-300 bg-transparent px-4 py-2 text-ink-800 placeholder-ink-400 transition-colors autofill:bg-transparent autofill:text-ink-800 focus:border-primary-10 focus:outline-none"
                    bind:value={serverUrl}
                    placeholder="Server URL"
                    disabled={loading}
                    onkeydown={handleKeydown}
                    autocomplete="url"
                />
                <input
                    class="w-full border-b-2 border-ink-300 bg-transparent px-4 py-2 text-ink-800 placeholder-ink-400 transition-colors autofill:bg-transparent autofill:text-ink-800 focus:border-primary-10 focus:outline-none"
                    bind:value={username}
                    placeholder="Username"
                    disabled={loading}
                    onkeydown={handleKeydown}
                    autocomplete="username"
                />
                <input
                    class="w-full border-b-2 border-ink-300 bg-transparent px-4 py-2 text-ink-800 placeholder-ink-400 transition-colors autofill:bg-transparent autofill:text-ink-800 focus:border-primary-10 focus:outline-none"
                    bind:value={password}
                    type="password"
                    placeholder="Password"
                    disabled={loading}
                    onkeydown={handleKeydown}
                    autocomplete="current-password"
                />
            </div>

            <!-- Login Button -->
            <button
                class="mt-8 rounded bg-primary-10 px-6 py-3 font-medium text-surface-20 transition-colors hover:bg-primary-20 disabled:cursor-not-allowed disabled:opacity-50"
                onclick={login}
                disabled={loading}
            >
                {loading ? 'Logging in…' : 'Login'}
            </button>
        </div>
    </div>
</div>

<style>
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
        -webkit-text-fill-color: #191412 !important;
        transition: background-color 5000s ease-in-out 0s;
    }
</style>
