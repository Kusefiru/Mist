// src/lib/db/models/Album.js
import { Base } from './Base'
import { Track } from './Track';
import { formatDate, formatDuration } from '$lib/utils/format';

export class Album extends Base {
    constructor(data) {
        super(data);
        //
        this.name = data.name;
        this.sortName = data.sortName;
        this.version = data.version;
        this.originalDate = data.originalDate;
        this.releaseDate = data.releaseDate;
        // Artist
        this.artistIds = data.artistIds;
        this.displayArtist = data.displayArtist;
        // Songs
        this.songIds = data.songIds;
        this.songCount = data.songCount;
        this.duration = data.duration;
        this.discs = data.discs;
        // Classification
        this.releaseTypes = data.releaseTypes;
        this.compilation = data.compilation;
        this.explicit = data.explicit;
        this.labels = data.labels;
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

    get originalDateStr() {
        return formatDate(this.originalDate.year, this.originalDate.month, this.originalDate.day);
    }

    get releaseDateStr() {
        return formatDate(this.releaseDate.year, this.releaseDate.month, this.releaseDate.day);
    }

    get hasSameReleaseDate() {
        return (
            this.originalDate.year === this.releaseDate.year &&
            this.originalDate.month === this.releaseDate.month &&
            this.originalDate.day === this.releaseDate.day
        );
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
            releaseDate: {
                year: data.releaseDate?.year ?? data.year,
                month: data.releaseDate?.month ?? 0,
                day: data.releaseDate?.day ?? 0
            },
            originalDate: {
                year: data.originalReleaseDate?.year ?? data.releaseDate?.year ?? data.year,
                month: data.originalReleaseDate?.month ?? data.releaseDate?.month ?? 0,
                day: data.originalReleaseDate?.day ?? data.releaseDate?.day ?? 0
            },
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
            discs: data.discTitles ?? [],
            // Classification
            releaseTypes: data.releaseTypes || [],
            compilation: data.isCompilation || false,
            explicit: data.explicitStatus || "",
            labels: data.recordLabels?.map(l => l.name) || [],
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
