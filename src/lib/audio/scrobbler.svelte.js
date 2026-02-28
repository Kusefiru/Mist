import { scrobble } from "$lib/opensubsonic/api";

const HEARTBEAT_INTERVAL = 30000;   // 30s

export class Scrobbler {
    heartbeat = null;

    constructor(trackId, duration) {
        this.trackId = trackId;
        this.scrobbleTreshold = Math.min(duration * 0.5, 240) * 1000;
        this.lastCheck = Date.now();
        this.elapsed = 0;       // How much of the track have been played already (in ms)
        /* If track has been scrolled. <30s tracks are considered already scrolled (shouldn't be logged) */
        this.scrobbled = (duration < 30);
        this.paused = true;
    }

    end() {
        this.update();
        this.stopHeartbeat();
    }

    pause() {
        if (!this.paused) {
            this.update();
            this.paused = true;
            this.stopHeartbeat();
        }
    }

    play() {
        if (this.paused) {
            this.paused = false;
            this.lastCheck = Date.now();
            if (!this.heartbeat) this.startHeartbeat();
            scrobble(this.trackId, this.lastCheck, false);
        }
    }

    startHeartbeat() {
        this.heartbeat = setInterval(() => {
            if (!this.paused) {
                this.update();
            }
        }, HEARTBEAT_INTERVAL);
    }

    stopHeartbeat() {
        if (this.heartbeat) {
            clearInterval(this.heartbeat);
            this.heartbeat = null;
        }
    }

    update() {
        const now = Date.now();
        this.elapsed += now - this.lastCheck;
        this.lastCheck = now;

        scrobble(this.trackId, this.lastCheck, false);
        if (!this.scrobbled && (this.elapsed > this.scrobbleTreshold)) {
            scrobble(this.trackId, this.lastCheck, true);
            this.scrobbled = true;
        }
    }
}
