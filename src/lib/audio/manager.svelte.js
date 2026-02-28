import { audioState } from '$lib/stores/audio.svelte';
import { cache } from '$lib/stores/cache.svelte';
import { shuffleArray } from '$lib/utils/shuffle';
import { Scrobbler } from './scrobbler.svelte';
import toast from 'svelte-french-toast';
import { WebAudioBackend } from './backend/WebAudioBackend';

class AudioManager {
    constructor() {
        // Backend for audio playback
        this.backend = null;

        // Scrobbling
        this.scrobbler = null;

        // Media Session API
        this.currentTrack = null;
    }

    async initialize(BackendClass = WebAudioBackend) {
        // Initialize the playback backend
        this.backend = new BackendClass(audioState);
        await this.backend.initialize();

        // Set up backend callbacks
        this.backend.onTrackEnd = () => {
            // Track ended, move to next
            this.next();
        };

        this.backend.onPlayStateChange = (playing) => {
            audioState.playing = playing;

            if (playing && this.scrobbler) {
                this.scrobbler.play();
            } else if (!playing && this.scrobbler) {
                this.scrobbler.pause();
            }
        };

        this.backend.onError = (error) => {
            console.error('Backend error:', error);
            audioState.playing = false;
        };

        this.backend.onProgress = (currentTime) => {
            audioState.progress = currentTime;
        };

        this.backend.onMetadataLoaded = (trackId, duration) => {
            // Clean up old scrobbler if switching tracks
            if (this.scrobbler && this.scrobbler.trackId !== trackId) {
                this.scrobbler.end();
                this.scrobbler = null;
            }

            // Create new scrobbler
            if (!this.scrobbler) {
                this.scrobbler = new Scrobbler(trackId, duration);
            }

            // Start scrobbling if already playing
            if (audioState.playing) {
                this.scrobbler.play();
            }
        };
    }

    _getTrackIdFromIndex(index) {
        if ((index < 0) || (index >= audioState.playOrder.length)) return;
        return audioState.playQueue[audioState.playOrder[index]];
    }

    restore() {
        if (!this.backend) {
            this.initialize(WebAudioBackend);
        }
        this.setVolume(audioState.volume);
        this.playTrack(this._getTrackIdFromIndex(audioState.index), false, audioState.progress);
    }

    // Set audio volume. Should receive a value between 0 and 100.
    setVolume(volume) {
        audioState.volume = volume;
        if (this.backend) {
            this.backend.setVolume(volume);
        }
    }

    // Similar to playTrack, but given a specific queue index
    playIndex(index) {
        audioState.index = index - 1;
        this.next();
    }

    playTrack(trackId, play = true, seek = 0) {
        const track = cache.tracks.get(trackId);
        if (!track) return;

        // Update state
        audioState.currentTrackId = trackId;
        this.currentTrack = track;

        // Update Media Session API
        this.updateMediaSession(track);

        // Update document title
        document.title = `${track.title} - ${track.artistsStr} - Mist`;

        // Load track in backend
        if (this.backend) {
            this.backend.loadTrack(trackId, track, play, seek);
        }
    }

    // Separate method for media session
    updateMediaSession(track) {
        if (!navigator?.mediaSession) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artistsStr,
            album: track.album || '',
            artwork: track.coverArt ? [
                { src: cache.getCoverArt(track.coverArtId), sizes: '512x512', type: 'image/jpeg' }
            ] : []
        });

        navigator.mediaSession.setActionHandler('play', () => this.resume());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            if (this.backend) {
                const offset = details.seekOffset || 15;
                const duration = this.backend.getDuration();
                this.backend.seek(duration - offset / duration);
            }
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            if (this.backend) {
                const offset = details.seekOffset || 15;
                const duration = this.backend.getDuration();
                this.backend.seek(duration + offset / duration);
            }
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime !== undefined && this.backend) {
                const duration = this.backend.getDuration();
                if (duration > 0) {
                    this.backend.seek(details.seekTime / duration);
                }
            }
        });
    }

    // Provide access to analyser for external analysis modules
    getAnalyser() {
        return this.backend ? this.backend.getAnalyser() : null;
    }

    // Queue management

    // Clear existing queue
    clearQueue() {
        this.pause();
        audioState.playOrder = [];
        audioState.playQueue = [];
        audioState.index = 0;
        audioState.currentTrackId = null;
    }

    // Set queue to track(s)
    setQueue(trackIds, startIndex = 0) {
        this.clearQueue();
        this.pause();

        const items = Array.isArray(trackIds) ? trackIds : [trackIds];
        audioState.playQueue = items;
        audioState.playOrder = Array.from({ length: items.length }, (_, i) => i);
        if (audioState.shuffled) {
            audioState.playOrder = shuffleArray([...audioState.playOrder])
        }
        toast.success(`Queued ${items.length} track(s).`);

        // Reset play index, and request queue next
        audioState.index = startIndex - 1;
        this.next();
    }

    // Queue next
    setQueueNext(trackIds) {
        this.insert(trackIds, audioState.index + 1);
    }

    setQueueLast(trackIds) {
        this.insert(trackIds, audioState.playQueue.length);
    }

    insert(trackIds, insertAt) {
        const items = Array.isArray(trackIds) ? trackIds : [trackIds];

        // Update current indexes
        audioState.playOrder = audioState.playOrder.map((i) => (i >= insertAt ? i + items.length : i));
        // Insert new items
        audioState.playQueue.splice(insertAt, 0, ...items);

        const newOrderEntries = Array.from({ length: items.length }, (_, i) => (i + insertAt));
        // Find where to splice play order
        let spliceAt = audioState.playOrder.findIndex(i => (i >= insertAt));
        if (spliceAt === -1) {
            spliceAt = audioState.playOrder.length;
        }

        if (!audioState.shuffled) {
            audioState.playOrder.splice(spliceAt, 0, ...newOrderEntries);
        } else {
            audioState.playOrder.splice(spliceAt, 0, ...shuffleArray(newOrderEntries));
        }

        toast.success(`Queued ${items.length} track(s).`);
    }

    remove(index) {
        if ((index < 0) || (index >= audioState.playOrder.length)) return;

        const queueIndex = audioState.playOrder.indexOf(index);

        // Remove item from queue
        audioState.playQueue.splice(index, 1);
        // Need to rebuild playOrder so that indexes still match
        audioState.playOrder = audioState.playOrder
            .filter((_, i) => i !== queueIndex)
            .map(i => i > index ? i - 1 : i);
        // Also update current index
        if (queueIndex < audioState.index) {
            audioState.index--;
        } else if (queueIndex === audioState.index) {
            audioState.progress = 0;
            if (audioState.playQueue.length === 0) {
                this.clearQueue();
            } else if (audioState.index >= audioState.playOrder.length) {
                // Reset to first track of queue
                audioState.index = 0;
                // Only auto-play if looping is enabled AND was playing
                this.playTrack(this._getTrackIdFromIndex(audioState.index), audioState.looping && audioState.playing);
            } else {
                // Continue playing the next track in queue only if was playing
                this.playTrack(this._getTrackIdFromIndex(audioState.index), audioState.playing);
            }
        }
    }

    // Shuffle mode
    setShuffle(shuffle) {
        const currentIndex = audioState.playOrder[audioState.index];

        audioState.shuffled = shuffle;
        if (audioState.shuffled) {
            audioState.playOrder = shuffleArray([...audioState.playOrder]);
        } else {
            audioState.playOrder = Array.from({ length: audioState.playOrder.length }, (_, i) => i);
        }

        // Update current index
        audioState.index = audioState.playOrder.indexOf(currentIndex);
    }

    // Skip to next track in the queue
    next() {
        audioState.index = audioState.index + 1;
        if (audioState.index >= audioState.playOrder.length) {
            // Reset to first track of queue
            audioState.index = 0;
            // Only auto-play if looping is enabled
            this.playTrack(this._getTrackIdFromIndex(audioState.index), audioState.looping);
        } else {
            // Continue playing the next track in queue
            this.playTrack(this._getTrackIdFromIndex(audioState.index));
        }
    }

    // Go back to the previously played track
    previous() {
        if (audioState.index > 0) {
            audioState.index = audioState.index - 1;
        }

        this.playTrack(this._getTrackIdFromIndex(audioState.index));
    }

    // Pause current playback
    pause() {
        if (this.backend) {
            this.backend.pause();
        }
    }

    // Resume current playback
    resume() {
        if (this.backend) {
            this.backend.play();
        }
    }

    seek(percent) {
        if (this.backend) {
            this.backend.seek(percent);
        }
    }

    // Clean up resources
    destroy() {
        if (this.scrobbler) {
            this.scrobbler.end();
            this.scrobbler = null;
        }

        if (this.backend) {
            this.backend.destroy();
            this.backend = null;
        }
    }
}

export const audio = new AudioManager();
