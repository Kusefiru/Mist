// lib/stores/auth.svelte.ts
import md5 from "md5";
import { browser } from "$app/environment";
import { database } from "$lib/db/index";

class Session {
    serverUrl = $state(null);
    username = $state(null);
    salt = $state(null);
    token = $state(null);
    loaded = $state(false);

    // Derived computed property
    isAuthenticated = $derived(!!this.token);

    async load() {
        // Only load session in browser
        if (!browser) return;

        try {
            const login = await database.getLogin();
            if (login) {
                this.serverUrl = login.serverUrl;
                this.username = login.username;
                this.salt = login.salt;
                this.token = login.token;
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        } finally {
            this.loaded = true;
        }
    }

    async save(serverUrl, username, password) {
        this.serverUrl = serverUrl;
        this.username = username;
        this.salt = Math.random().toString(36).substring(2, 10);
        this.token = md5(password + this.salt);

        if (browser) {
            try {
                await database.setLogin(serverUrl, username, this.salt, this.token);
            } catch (error) {
                console.error("Failed to save session:", error);
            }
        }
    }

    async clear() {
        this.serverUrl = null;
        this.username = null;
        this.salt = null;
        this.token = null;

        if (browser) {
            try {
                await database.clearLogin();
            } catch (error) {
                console.error("Failed to clear session:", error);
            }
        }
    }
}

export const session = new Session();
