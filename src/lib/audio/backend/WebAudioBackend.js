import { GenericBackend } from './GenericBackend';
import { getStreamUrl } from '$lib/opensubsonic/api';

/**
 * Simplified Web Audio API backend.
 * Uses a single Audio element and relies on AudioManager for queue management.
 */
export class WebAudioBackend extends GenericBackend {
    constructor(audioState) {
        super(audioState);

        // Single audio element
        this.audio = null;

        // Web Audio API nodes
        this.audioContext = null;
        this.source = null;
        this.analyser = null;
        this.trackGain = null;
        this.volumeGainNode = null;

        // Current track
        this.currentTrackId = null;

        // Progress tracking
        this.frameRequest = null;
        this.updateProgress = this.updateProgress.bind(this);
    }

    async initialize() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create gain nodes
        this.trackGain = this.audioContext.createGain();
        this.volumeGainNode = this.audioContext.createGain();

        // Create analyser for visualization
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        // Connect: trackGain -> volumeGain -> analyser -> destination
        this.trackGain.connect(this.volumeGainNode);
        this.volumeGainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Create audio element
        this.audio = new Audio();
        this.audio.crossOrigin = 'anonymous';
        this.audio.preload = 'auto';

        // Set initial volume
        this.setVolume(this.audioState.volume);
    }

    connectAudioElement() {
        if (!this.audio || !this.audioContext) return;

        try {
            // Disconnect old source if exists
            if (this.source) {
                try {
                    this.source.disconnect();
                } catch (e) {
                    // Already disconnected
                }
            }

            // Create new source and connect
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.trackGain);
        } catch (e) {
            console.warn('Could not connect audio element:', e);
        }
    }

    async loadTrack(trackId, track, play = true, seek = 0) {
        // Store current track ID
        this.currentTrackId = trackId;

        // Set up the audio element
        this.audio.src = getStreamUrl(trackId);

        // Calculate track gain from replayGain
        const trackGainValue = Math.min(1.0, Math.pow(10, track.replayGain / 20));
        this.trackGain.gain.value = trackGainValue;

        // Connect to Web Audio API if not already connected
        if (!this.source) {
            this.connectAudioElement();
        }

        // Set up event listeners
        this.setupAudioListeners(trackId, seek);

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // Start playback if requested
        if (play) {
            try {
                await this.audio.play();
            } catch (e) {
                console.warn('Playback prevented:', e);
                if (this.onError) {
                    this.onError(e);
                }
            }
        }
    }

    setupAudioListeners(trackId, seek) {
        // Remove old listeners
        this.audio.onloadedmetadata = null;
        this.audio.onplay = null;
        this.audio.onpause = null;
        this.audio.onended = null;
        this.audio.onerror = null;

        this.audio.onloadedmetadata = () => {
            // Handle initial seek
            this.audio.currentTime = seek;

            if (this.onMetadataLoaded) {
                this.onMetadataLoaded(trackId, this.audio.duration);
            }
        };

        this.audio.onplay = () => {
            this.frameRequest = requestAnimationFrame(this.updateProgress);
            if (this.onPlayStateChange) {
                this.onPlayStateChange(true);
            }
        };

        this.audio.onpause = () => {
            if (this.frameRequest) {
                cancelAnimationFrame(this.frameRequest);
                this.frameRequest = null;
            }
            if (this.onPlayStateChange) {
                this.onPlayStateChange(false);
            }
        };

        this.audio.onended = () => {
            if (this.frameRequest) {
                cancelAnimationFrame(this.frameRequest);
                this.frameRequest = null;
            }
            // Let AudioManager handle what happens next (loop, next track, etc.)
            if (this.onTrackEnd) {
                this.onTrackEnd();
            }
        };

        this.audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            if (this.onError) {
                this.onError(e);
            }
        };
    }

    async play() {
        if (!this.audio) return;

        // Resume audio context if needed
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            await this.audio.play();
        } catch (e) {
            console.warn('Playback prevented:', e);
            if (this.onError) {
                this.onError(e);
            }
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }

    seek(percent) {
        if (!this.audio) return;
        const duration = this.audio.duration;
        if (isNaN(duration) || duration === 0) return;
        // Clamp percentage to 0 - 1
        percent = Math.max(0, Math.min(percent, 1));
        this.audio.currentTime = percent * duration;
        // Call onProgress manually if audio is not playing
        if (this.audio.paused && this.onProgress) {
            this.onProgress(this.audio.currentTime);
        }
    }

    setVolume(volume) {
        // Volume is 0-100, convert to 0-1
        const normalizedVolume = volume / 100;
        if (this.volumeGainNode) {
            this.volumeGainNode.gain.value = normalizedVolume;
        }
    }

    getCurrentTime() {
        return this.audio ? this.audio.currentTime : 0;
    }

    getDuration() {
        return this.audio ? this.audio.duration : 0;
    }

    getAnalyser() {
        return this.analyser;
    }

    updateProgress() {
        if (this.audio && this.onProgress) {
            this.onProgress(this.audio.currentTime);
        }

        this.frameRequest = requestAnimationFrame(this.updateProgress);
    }

    destroy() {
        // Cancel animation frame
        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
            this.frameRequest = null;
        }

        // Pause and clean up audio element
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            this.audio = null;
        }

        // Disconnect source
        if (this.source) {
            try {
                this.source.disconnect();
            } catch (e) {
                // Already disconnected
            }
            this.source = null;
        }

        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
        this.trackGain = null;
        this.volumeGainNode = null;
        this.currentTrackId = null;
    }
}
