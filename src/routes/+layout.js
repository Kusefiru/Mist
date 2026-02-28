import { redirect } from "@sveltejs/kit";
import { session } from '$lib/stores/auth.svelte.js';

export const ssr = false;

export async function load({ url }) {
    await session.load();

    // Redirect from root
    if (url.pathname === '/' || url.pathname === '/app') {
        throw redirect(307, session.isAuthenticated ? '/app/home' : '/login');
    }

    // Redirect away from /login if already authenticated
    if (url.pathname === '/login' && session.isAuthenticated) {
        throw redirect(307, '/app/home');
    }
}
