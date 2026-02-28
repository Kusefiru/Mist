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
                // Auth info (can support multiple servers)
                db.createObjectStore('auth', { keyPath: 'id' });

                // Server cache - one key per server
                // Key format: `${serverId}_artists`, `${serverId}_albums`, etc.
                db.createObjectStore('serverCache');

                // User context - per server+user
                // Key format: `${serverId}_${userId}_context`
                db.createObjectStore('userContext');

                // Metadata (lastFetchTime per server)
                db.createObjectStore('metadata');

                // Audio state per user
                db.createObjectStore('audioState');
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
    // Get any entity type for a server
    async get(serverId, entityType) {
        const db = await getDB();
        const key = `${serverId}_${entityType}`;
        const data = await db.get('serverCache', key) || [];

        const ModelClass = {
            'artists': Artist,
            'albums': Album,
            'tracks': Track,
            'playlists': Playlist
        }[entityType];

        return arrayToMap(data, ModelClass);
    }

    // Set any entity type for a server
    async set(serverId, entityType, dataMap) {
        const db = await getDB();
        const key = `${serverId}_${entityType}`;
        await db.put('serverCache', mapToArray(dataMap), key);
    }

    // Audio state per user
    async getAudioState(serverId, userId) {
        const db = await getDB();
        const key = `${serverId}_${userId}_audioState`;
        return await db.get('audioState', key) || {
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
        const key = `${serverId}_${userId}_audioState`;
        const current = await this.getAudioState(serverId, userId);
        await db.put('audioState', { ...current, queue: queueData }, key);
    }

    async setAudioProgress(serverId, userId, progressData) {
        const db = await getDB();
        const key = `${serverId}_${userId}_audioState`;
        const current = await this.getAudioState(serverId, userId);
        await db.put('audioState', { ...current, progress: progressData }, key);
    }

    // Tracks data for play queue restoration
    async setTrackData(serverId, userId, tracks) {
        if (!tracks) return;
        const db = await getDB();
        const key = `${serverId}_${userId}_trackData`;
        await db.put('audioState', tracks.map(t => t.toJSON()), key);
    }

    async getTrackData(serverId, userId) {
        const db = await getDB();
        const key = `${serverId}_${userId}_trackData`;
        const data = await db.get('audioState', key);
        return data ? data.map(t => new Track(t)) : [];
    }

    // Clear all data for a server
    async clearServer(serverId) {
        const db = await getDB();
        const tx = db.transaction(['serverCache', 'metadata'], 'readwrite');

        await Promise.all([
            tx.objectStore('serverCache').delete(`${serverId}_artists`),
            tx.objectStore('serverCache').delete(`${serverId}_albums`),
            tx.objectStore('serverCache').delete(`${serverId}_tracks`),
            tx.objectStore('serverCache').delete(`${serverId}_playlists`),
            tx.objectStore('metadata').delete(`${serverId}_lastFetchTime`),
            tx.done
        ]);
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
