// Base class for audio playback backends.
export class GenericBackend {
    constructor(audioState) {
        this.audioState = audioState;
        this.onTrackEnd = null;
        this.onPlayStateChange = null;
        this.onError = null;
        this.onProgress = null;
        this.onMetadataLoaded = null;
    }

    /* Initialize the backend */
    async initialize() {
        throw new Error('initialize() must be implemented by subclass');
    }

    /* Load and optionally play a track */
    async loadTrack(trackId, track, play = true, seek = 0) {
        throw new Error('loadTrack() must be implemented by subclass');
    }

    /* Start playback */
    async play() {
        throw new Error('play() must be implemented by subclass');
    }

    /* Pause playback */
    pause() {
        throw new Error('pause() must be implemented by subclass');
    }

    /* Seek to a specific position */
    seek(percent) {
        throw new Error('seek() must be implemented by subclass');
    }

    /* Completly stop audio (cannot be played again before loading a new track) */
    stop() {
        throw new Error('stop() must be implemented by subclass');
    }

    /* Set the volume */
    setVolume(volume) {
        throw new Error('setVolume() must be implemented by subclass');
    }

    /* Get the current playback position in seconds */
    getCurrentTime() {
        throw new Error('getCurrentTime() must be implemented by subclass');
    }

    /* Get the duration of the current track in seconds */
    getDuration() {
        throw new Error('getDuration() must be implemented by subclass');
    }

    /* Get the analyser node for visualization */
    getAnalyser() {
        return null;
    }

    /* Clean up */
    destroy() {
        throw new Error('destroy() must be implemented by subclass');
    }
}
