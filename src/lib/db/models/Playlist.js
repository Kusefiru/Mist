import { Base } from './Base'
import { Track } from './Track';
import { formatDuration } from '$lib/utils/format';

export class Playlist extends Base {
    constructor(data) {
        super(data);
        //
        this.name = data.name;
        this.comment = data.comment;
        // Songs
        this.songIds = data.songIds;
        this.songCount = data.songCount;
        this.duration = data.duration;
        // Management
        this.owner = data.owner;
        this.users = data.users;
        this.public = data.public;
        this.readonly = data.readonly;
        this.expiry = data.expiry;
        // Metadata
        this.created = data.created;
        this.updated = data.updated;
        this.coverArtId = data.coverArtId;
    }

    get durationStr() {
        return formatDuration(this.duration);
    }

    isEditableBy(userId) {
        // Rely on readonly if defined
        if (this.readonly !== null) {
            return this.readonly === false;
        }
        // Or rely on owner if defined
        if (this.owner !== "") {
            return this.owner === userId;
        }
        // Else defaults to editable
        return true;
    }

    // To reimplement: create class from API data
    static fromOpenSubsonic(data) {
        return new Playlist({
            id: data.id,
            name: data.name,
            comment: data.comment || "",
            // Songs management
            songIds: data.entry?.map(e => e.id) || [],
            songCount: data.songCount,
            duration: data.duration,
            // Playlist management
            owner: data.owner || "",
            users: data.allowedUser || [],
            public: data.public ?? true,
            readonly: data.readonly ?? null,
            expiry: data.validUntil ?? null,
            // Metadata
            coverArtId: data.coverArt || "",
            created: data.created,
            updated: data.changed,
        })
    }

    // To reimplement: return JSON structure of this class
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            comment: this.comment,
            songIds: this.songIds,
            songCount: this.songCount,
            duration: this.duration,
            owner: this.owner,
            users: this.users,
            public: this.public,
            readonly: this.readonly,
            expiry: this.expiry,
            created: this.created,
            updated: this.updated,
            coverArtId: this.coverArtId,
        }
    }
}

export class PlaylistWithTracks extends Playlist {
    constructor(playlist, songs) {
        super(playlist);
        this.song = songs;
    }
}
