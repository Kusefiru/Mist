// lib/db/index.ts
import { openDB } from "idb";
import { browser } from "$app/environment";
import { Album } from "./models/Album";
import { Artist } from "./models/Artist";
import { Playlist } from "./models/Playlist";
import { Track } from "./models/Track";

let db = null;

async function getDB() {
    if (!browser) {
        throw new Error("Database can only be accessed in the browser");
    }

    if (!db) {
        db = await openDB("mist_db", 1, {
            async upgrade(db) {
                // Global auth store
                db.createObjectStore('auth', { keyPath: 'id' });

                // Server data
                db.createObjectStore('servers', { keyPath: 'id' });
            }
        });
    }

    return db;
}

// Helper functions
function mapToArray(map) {
    return Array.from(map.values());
}

function arrayToMap(arr, ModelClass) {
    return new Map(arr.map(item => [item.id, new ModelClass(item)]));
}

// Generic database interface
class DB {
    async #getServerRecord(db, serverId) {
        return await db.get('servers', serverId) || {
            id: serverId,
            audioState: {}
        };
    }

    // Audio state management
    async getAudioState(serverId, userId) {
        const db = await getDB();
        const record = await this.#getServerRecord(db, serverId);
        return record.audioState[userId] || {
            queue: {
                index: 0,
                playOrder: [],
                playQueue: [],
                shuffled: false,
                looping: false
            },
            progress: {
                progress: 0,
                volume: 100
            }
        };
    }

    async setAudioQueue(serverId, userId, queueData) {
        const db = await getDB();
        const record = await this.#getServerRecord(db, serverId);
        record.audioState[userId] = { ...record.audioState[userId], queue: queueData };
        await db.put('servers', record);
    }

    async setAudioProgress(serverId, userId, progressData) {
        const db = await getDB();
        const record = await this.#getServerRecord(db, serverId);
        record.audioState[userId] = { ...record.audioState[userId], progress: progressData };
        await db.put('servers', record);
    }

    // Tracks data for play queue restoration
    async setTrackData(serverId, userId, tracks) {
        if (!tracks) return;
        const db = await getDB();
        const record = await this.#getServerRecord(db, serverId);
        record.audioState[userId] = { ...record.audioState[userId], trackData: tracks.map(t => t.toJSON()) };
        await db.put('servers', record);
    }

    async getTrackData(serverId, userId) {
        const state = await this.getAudioState(serverId, userId);
        return state.trackData ? state.trackData.map(t => new Track(t)) : [];
    }

    // Clear all data for a server
    async clearServer(serverId) {
        const db = await getDB();
        await db.delete('servers', serverId);
    }

    // Auth methods (keeping compatibility with your existing code)
    async getLogin() {
        const db = await getDB();
        return await db.get('auth', 'session');
    }

    async setLogin(serverUrl, username, salt, token) {
        const db = await getDB();
        await db.put('auth', { id: 'session', serverUrl, username, salt, token });
    }

    async clearLogin() {
        const db = await getDB();
        await db.clear('auth');
    }
}

export const database = new DB();
