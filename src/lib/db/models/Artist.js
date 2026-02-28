import { Base } from './Base'
import { Album } from './Album';

export class Artist extends Base {
    constructor(data) {
        super(data);
        //
        this.name = data.name;
        this.sortName = data.sortName;
        // Albums
        this.albumIds = data.albumIds;
        this.albumCount = data.albumCount;
        this.coverArtId = data.coverArtId;
    }

    static fromOpenSubsonic(data) {
        return new Artist({
            id: data.id,
            name: data.name,
            sortName: data.sortName,
            // Songs management
            albumIds: data.album?.map(s => s.id) || [],
            albumCount: data.albumCount,
            // Metadata
            coverArtId: data.coverArt || ""
        })
    }

    // To reimplement: return JSON structure of this class
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            sortName: this.sortName,
            albumIds: this.albumIds,
            albumCount: this.albumCount,
            coverArtId: this.coverArtId
        }
    }
}
