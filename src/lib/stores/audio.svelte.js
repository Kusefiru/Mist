// lib/stores/audioState.svelte.ts
import { database } from '$lib/db/index';
import { throttle } from '$lib/utils/throttle';
import { cache } from './cache.svelte';

class AudioState {
    // Current session info
    serverId = $state('');
    userId = $state('');

    // Play info
    progress = $state(0);
    volume = $state(100);

    // Queue management
    playQueue = $state([]);
    playOrder = $state([]);
    index = $state(0);
    shuffled = $state(false);
    looping = $state(false);

    // Unsaved (runtime only)
    playing = $state(false);
    currentTrackId = $state(null);

    #loaded = false;

    constructor() {
        this.saveProgress = throttle(this.#saveProgress.bind(this), 500);
        this.saveQueue = throttle(this.#saveQueue.bind(this), 500);
    }

    // Initialize for a specific server/user
    async init(serverId, userId) {
        this.serverId = serverId;
        this.userId = userId;
        await this.loadState();
    }

    async loadState() {
        if (!this.serverId || !this.userId) {
            console.warn('Cannot load audio state: serverId or userId not set');
            return;
        }

        try {
            const audioState = await database.getAudioState(this.serverId, this.userId);
            if (audioState) {
                // Load progress
                this.progress = audioState.progress?.progress || 0;
                this.volume = audioState.progress?.volume || 100;

                // Load queue
                this.index = audioState.queue?.index || 0;
                this.playOrder = audioState.queue?.playOrder || [];
                this.playQueue = audioState.queue?.playQueue || [];
                this.shuffled = audioState.queue?.shuffled || false;
                this.looping = audioState.queue?.looping || false;
            }

            const trackData = await database.getTrackData(this.serverId, this.userId);
            if (trackData) {
                trackData.forEach(t => cache.tracks.set(t.id, t));
            }
        } catch (error) {
            console.error('Failed to load audio state:', error);
        }

        this.#loaded = true;
    }

    async #saveProgress() {
        if (!this.#loaded || !this.serverId || !this.userId) return;

        try {
            const progressData = {
                progress: $state.snapshot(this.progress),
                volume: $state.snapshot(this.volume)
            };
            await database.setAudioProgress(this.serverId, this.userId, progressData);
        } catch (error) {
            console.error('Failed to save audio progress:', error);
        }
    }

    async #saveQueue() {
        if (!this.#loaded || !this.serverId || !this.userId) return;

        try {
            const queueData = {
                index: $state.snapshot(this.index),
                playOrder: $state.snapshot(this.playOrder),
                playQueue: $state.snapshot(this.playQueue),
                shuffled: $state.snapshot(this.shuffled),
                looping: $state.snapshot(this.looping)
            };
            await database.setAudioQueue(this.serverId, this.userId, queueData);
            await database.setTrackData(this.serverId, this.userId, Array.from(this.playQueue.map(t => cache.tracks.get(t))));
        } catch (error) {
            console.error('Failed to save audio queue:', error);
        }
    }

    async clearState() {
        this.progress = 0;
        this.volume = 100;
        this.playOrder = [];
        this.playQueue = [];
        this.index = 0;
        this.shuffled = false;
        this.looping = false;
        this.playing = false;
        this.currentTrackId = null;

        // Clear from database
        if (this.serverId && this.userId) {
            try {
                await database.setAudioProgress(this.serverId, this.userId, {
                    progress: 0,
                    volume: 100
                });
                await database.setAudioQueue(this.serverId, this.userId, {
                    index: 0,
                    playOrder: [],
                    playQueue: [],
                    shuffled: false,
                    looping: false
                });
            } catch (error) {
                console.error('Failed to clear audio state:', error);
            }
        }
    }
}

export const audioState = new AudioState();
