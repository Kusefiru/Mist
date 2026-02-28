import { Base } from './Base';
import { formatDuration } from '$lib/utils/format';

export class Track extends Base {
    constructor(data) {
        super(data);
        //
        this.title = data.title;
        this.sortName = data.sortName;
        this.duration = data.duration;
        this.track = data.track;
        this.disc = data.disc;
        // Album
        this.album = data.album;
        this.albumId = data.albumId,
        // Artists
        this.artistIds = data.artistIds;
        this.displayArtist = data.displayArtist;
        // Album artists
        this.albumArtistIds = data.albumArtistIds;
        this.displayAlbumArtist = data.displayAlbumArtist;
        // Metadata
        this.replayGain = data.replayGain;
        this.created = data.created;
        this.content = data.content;
        this.explicit = data.explicit;
        this.coverArtId = data.coverArtId;
    }

    // Get artists as a display string
    get artistsStr() {
        if (this.displayArtist) {
            return this.displayArtist;
        }
        return data.artistIds?.map(a => a.name).join(", ") || "";
    }

    get albumArtistsStr() {
        if (this.displayAlbumArtist) {
            return this.displayAlbumArtist;
        }
        return data.albumArtistIds?.map(a => a.name).join(", ") || "";
    }

    get durationStr() {
        return formatDuration(this.duration);
    }

    // To reimplement: create class from API data
    static fromOpenSubsonic(data) {
        return new Track({
            id: data.id,
            title: data.title,
            sortName: data.sortName,
            duration: data.duration,
            track: data.track || 0,
            disc: data.discNumber || 0,
            // Album
            album: data.album || null,
            albumId: data.albumId || null,
            // Artists management
            artistIds: data.artists?.length > 0
                ? data.artists.map(a => ({ id: a.id, name: a.name }))
                : data.artistId
                    ? [{ id: data.artistId, name: data.artist }]
                    : [],
            displayArtist: data.displayArtist || null,
            // Album Artists management
            albumArtistIds: data.albumArtists?.length > 0
                ? data.albumArtists.map(a => ({ id: a.id, name: a.name }))
                : [],
            displayAlbumArtist: data.displayAlbumArtist || null,
            // Metadata
            replayGain: (data.replayGain.trackGain || 0) + (data.replayGain.baseGain || 0),
            coverArtId: data.coverArt || "",
            created: data.created,
            content: data.contentType === 'audio/mpeg'
                ? "MP3 " + data.bitRate
                : data.contentType.replace('audio/', '').toUpperCase(),
            explicit: data.explicitStatus || ""
        })
    }

    // To reimplement: return JSON structure of this class
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            sortName: this.sortName,
            duration: this.duration,
            track: this.track,
            disc: this.disc,
            album: this.album,
            albumId: this.albumId,
            artistIds: this.artistIds,
            displayArtist: this.displayArtist,
            albumArtistIds: this.albumArtistIds,
            displayAlbumArtist: this.displayAlbumArtist,
            replayGain: this.replayGain,
            created: this.created,
            coverArtId: this.coverArtId,
            content: this.content,
            explicit: this.explicit
        }
    }
}
