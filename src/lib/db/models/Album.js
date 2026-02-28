// src/lib/db/models/Album.js
import { Base } from './Base'
import { Track } from './Track';
import { formatDuration } from '$lib/utils/format';

export class Album extends Base {
    constructor(data) {
        super(data);
        //
        this.name = data.name;
        this.sortName = data.sortName;
        this.version = data.version;
        this.date = data.date;
        // Artist
        this.artistIds = data.artistIds;
        this.displayArtist = data.displayArtist;
        // Songs
        this.songIds = data.songIds;
        this.songCount = data.songCount;
        this.duration = data.duration;
        // Classification
        this.releaseTypes = data.releaseTypes;
        // Metadata
        this.created = data.created;
        this.coverArtId = data.coverArtId;
        this.folderId = data.folderId;
    }

    // Get artists as a display string
    get artistsStr() {
        if (this.displayArtist) {
            return this.displayArtist;
        }
        return data.artistIds?.map(a => a.name).join(", ") || "";
    }

    get dateStr() {
        if (this.date.month && this.date.day) {
            return Intl.DateTimeFormat(navigator.language, { day: 'numeric', month: 'short', year: 'numeric' })
                .format(new Date(this.date.year, this.date.month - 1, this.date.day));
        }
        return String(this.date.year);
    }

    get durationStr() {
        return formatDuration(this.duration);
    }

    get typeStr() {
        return this.releaseTypes.join(' · ');
    }

    // To reimplement: create class from API data
    static fromOpenSubsonic(data, folderId) {
        return new Album({
            id: data.id,
            name: data.name,
            sortName: data.sortName,
            version: data.version,
            // Date management
            date: data.releaseDate && (data.releaseDate.year || data.releaseDate.month || data.releaseDate.day)
                ? { year: data.releaseDate.year, month: data.releaseDate.month, day: data.releaseDate.day }
                : { year: data.year },
            // Artists management
            artistIds: data.artists?.length > 0
                ? data.artists.map(a => ({ id: a.id, name: a.name }))
                : data.artistId
                    ? [{ id: data.artistId, name: data.artist }]
                    : [],
            displayArtist: data.displayArtist || null,
            // Songs management
            songIds: data.song?.map(s => s.id) || [],
            songCount: data.songCount,
            duration: data.duration,
            // Classification
            releaseTypes: data.releaseTypes || [],
            // Metadata
            coverArtId: data.coverArt || "",
            created: data.created,
            folderId: folderId
        })
    }

    // To reimplement: return JSON structure of this class
    // Unmaintained at the moment
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            sortName: this.sortName,
            version: this.version,
            date: this.date,
            artistIds: this.artistIds,
            displayArtist: this.displayArtist,
            songIds: this.songIds,
            songCount: this.songCount,
            duration: this.duration,
            created: this.created,
            coverArtId: this.coverArtId,
            folderId: this.folderId
        }
    }
}
