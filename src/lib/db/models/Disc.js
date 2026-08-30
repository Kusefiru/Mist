export class Disc {
    constructor(index, title, coverArtId, songIds = []) {
        this.index = index;
        this.title = title;
        this.coverArtId = coverArtId;
        this.songIds = songIds;
    }

    get displayTitle() {
        return this.title || `Disc ${this.index}`;
    }
}
