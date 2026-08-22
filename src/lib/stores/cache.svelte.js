// lib/stores/cache.svelte.ts
import { database } from "$lib/db";
import { Album } from "$lib/db/models/Album";
import { Artist } from "$lib/db/models/Artist";
import { Track } from "$lib/db/models/Track";
import { Playlist } from "$lib/db/models/Playlist";
import { User } from "$lib/db/models/User";
import { getCoverArtUrl } from "$lib/opensubsonic/api";
import * as api from '$lib/opensubsonic/api';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

class Cache {
    serverId = $state('');
    user = $state(null);
    initialized = $state(false);

    // Use SvelteMap for reactivity
    albums = $state(new SvelteMap());
    artists = $state(new SvelteMap());
    playlists = $state(new SvelteMap());
    tracks = $state(new SvelteMap());
    folders = $state(new SvelteMap());
    stars = $state(new SvelteSet());

    #covers = new Map();

    // Initialize cache for a specific server/user
    async init(serverId, user) {
        if (!serverId || !user) {
            console.error('Cache init failed: serverId or userId is missing', { serverId, userId });
            return;
        }

        this.serverId = serverId;
        this.user = User.fromOpenSubsonic(user);

        this.fetch();

        this.initialized = true;
    }

    async _fetchAlbums() {
        this.folders.clear();
        this.albums.clear();

        const musicFolders = await api.getMusicFolders();
        const folderPromises = musicFolders.map(async (musicFolder) => {
            this.folders.set(musicFolder.id, musicFolder.name);

            // Get all albums from folder
            const pageSize = 500;
            let offset = 0;
            let hasMore = true;

            while (hasMore) {
                const albumList = await api.getAlbumList2('alphabeticalByName', {
                    musicFolderId: musicFolder.id,
                    size: pageSize,
                    offset: offset
                });
                // Add albums if not yet loaded (skip already fetched albums)
                albumList.forEach(a => this.albums.set(a.id, Album.fromOpenSubsonic(a, musicFolder.id)));
                if (albumList.length < pageSize) {
                    hasMore = false;
                } else {
                    offset += pageSize;
                }
            }
        });
        await Promise.all(folderPromises);
    }

    async _fetchArtists() {
        this.artists.clear();

        const artistsResponse = await api.getArtists();
        const artistsRaw = artistsResponse.index?.flatMap(idx => idx.artist || []) || [];

        // Set to cache along with cover urls
        artistsRaw.forEach(a => {
            this.artists.set(a.id, Artist.fromOpenSubsonic(a));
        });
    }

    async _fetchPlaylists() {
        this.playlists.clear();

        const playlistsRaw = await api.getPlaylists();

        playlistsRaw.forEach(p => {
            this.playlists.set(p.id, Playlist.fromOpenSubsonic(p));
        });
    }

    async fetch() {
        this._fetchAlbums();
        this._fetchArtists();
        this._fetchPlaylists();

        // Additional data only refetch through full sync
        const starred = await api.getStarred();

        starred.artist?.forEach(a => this.stars.add(a.id));
        starred.album?.forEach(a => this.stars.add(a.id));
        starred.song?.forEach(s => this.stars.add(s.id));
    }

    /* Album methods */
    async getAlbum(albumId) {
        const album = this.albums.get(albumId);
        // Album already in cache, return immediately
        if (album?.songIds && (album?.songIds.length == album?.songCount)) {
            return album;
        }

        // Fetch from server
        const AlbumID3WithSongs = await api.getAlbum(albumId);
        if (!AlbumID3WithSongs) {
            return null;
        }
        for (const trackRaw of AlbumID3WithSongs.song) {
            // Cache track
            const track = Track.fromOpenSubsonic(trackRaw);
            this.tracks.set(track.id, track);
        }
        const updatedAlbum = Album.fromOpenSubsonic(AlbumID3WithSongs, album?.folderId || -1);
        this.albums.set(albumId, updatedAlbum);

        return updatedAlbum;
    }

    async getAlbumList(type, options = {}) {
        const albumList = await api.getAlbumList2(type, options);

        for (const album of albumList) {
            if (!this.albums.has(album.id)) {
                this.albums.set(album.id, Album.fromOpenSubsonic(album));
            }
        }

        return albumList.map((a) => this.albums.get(a.id));
    }

    getFilteredAlbums(sortBy, filters, sortOrder = 'asc') {
        let filtered_albums = Array.from(this.albums.values());

        if (filters.starred) {
            filtered_albums = filtered_albums.filter(a => this.stars.has(a.id));
        }

        if (filters.libraries) {
            filtered_albums = filtered_albums.filter(a => filters.libraries.has(a.folderId));
        }

        if (sortBy) {
            filtered_albums = filtered_albums.sort(sortBy);
        }

        if (sortOrder === 'desc') {
            filtered_albums.reverse();
        }

        return filtered_albums;
    }

    /* Artist methods */
    async getArtist(artistId) {
        const artist = this.artists.get(artistId);

        if (!artist) {
            const ArtistWithAlbumsID3 = await api.getArtist(artistId);
            return Artist.fromOpenSubsonic(ArtistWithAlbumsID3);
        }

        if (artist.albumIds && (artist.albumIds.length == artist.albumCount)) {
            return artist;
        }

        const ArtistWithAlbumsID3 = await api.getArtist(artist.id);
        const updatedArtist = Artist.fromOpenSubsonic(ArtistWithAlbumsID3);
        this.artists.set(artist.id, updatedArtist);

        return updatedArtist;
    }

    async getTopTracks(artistName) {
        const topSongs = await api.getTopSongs(artistName) || [];

        for (const topSong of topSongs) {
            if (!this.tracks.has(topSong.id)) {
                this.tracks.set(topSong.id, Track.fromOpenSubsonic(topSong));
            }
        }

        return topSongs.map((t) => this.tracks.get(t.id));
    }

    async getArtistRadio(artistId) {
        let artist = this.artists.get(artistId);

        if (!artist) {
            const ArtistWithAlbumsID3 = await api.getArtist(artistId);
            artist = Artist.fromOpenSubsonic(ArtistWithAlbumsID3);
        }

        const similarSongs = await api.getSimilarSongs2(artist.id);
        for (const songRaw of similarSongs) {
            const song = Track.fromOpenSubsonic(songRaw);
            this.tracks.set(song.id, song);
        }
        /* Create a fake Playlist object from received data */
        const radioPlaylist = {
            id: artist.id,
            name: `${artist.name} Radio`,
            comment: "",    // TODO
            entry: similarSongs,
            songCount: similarSongs.length,
            duration: similarSongs.reduce((sum, song) => sum + song.duration, 0),
            coverArt: artist.coverArtId,
            created: Date.now(),
            changed: Date.now()
        }

        return Playlist.fromOpenSubsonic(radioPlaylist);
    }

    getFilteredArtists(sortBy, filters, sortOrder = 'asc') {
        let filtered_artists = Array.from(this.artists.values());

        if (filters.starred) {
            filtered_artists = filtered_artists.filter(a => this.stars.has(a.id));
        }

        if (sortBy) {
            filtered_artists = filtered_artists.sort(sortBy);
        }

        if (sortOrder === 'desc') {
            filtered_artists.reverse();
        }

        return filtered_artists;
    }

    /* Playlist methods */
    async getPlaylist(playlistId) {
        let playlist = this.playlists.get(playlistId);

        if (playlist && playlist.songIds && (playlist.songCount > 0) && (playlist.songIds.length == playlist.songCount)) {
            return playlist;
        }

        const playlistWithSongs = await api.getPlaylist(playlistId);
        for (const trackRaw of playlistWithSongs.entry) {
            // Cache track
            const track = Track.fromOpenSubsonic(trackRaw);
            this.tracks.set(track.id, track);
        }
        const updatedPlaylist = Playlist.fromOpenSubsonic(playlistWithSongs);
        this.playlists.set(playlistId, updatedPlaylist);

        return updatedPlaylist;
    }

    getEditablePlaylists() {
        let editable_playlists = Array.from(this.playlists.values());

        return editable_playlists.filter(p => p.isEditableBy(this.user?.id));
    }

    getFilteredPlaylists(sortBy, filters, sortOrder = 'asc') {
        let filtered_playlists = Array.from(this.playlists.values());

        if (filters.starred) {
            filtered_playlists = filtered_playlists.filter(a => this.stars.has(a.id));
        }

        if (sortBy) {
            filtered_playlists = filtered_playlists.sort(sortBy);
        }

        if (sortOrder === 'desc') {
            filtered_playlists.reverse();
        }

        return filtered_playlists;
    }

    async editPlaylist(playlistId = null, name = null, comment = null, isPublic = null, trackIds = []) {
        if (!playlistId) {
            /* Create new playlist if no ID given */
            const playlist = await api.createPlaylist(name);
            if (!playlist) return null;
            playlistId = playlist.id;
        }

        /* Update playlist info */
        await api.updatePlaylist(playlistId, { name, comment, public: isPublic, songIdToAdd: trackIds });

        /* Refetch playlist for update */
        const playlistWithSongs = await api.getPlaylist(playlistId);
        this.playlists.set(playlistId, Playlist.fromOpenSubsonic(playlistWithSongs));
        return this.playlists.get(playlistId);
    }

    async deletePlaylist(playlistId) {
        await api.deletePlaylist(playlistId);
        this.playlists.delete(playlistId);
    }

    async addToPlaylist(playlistId, trackId) {
        await api.updatePlaylist(playlistId, { songIdToAdd: trackId });

        /* Refetch playlist for update */
        const playlistWithSongs = await api.getPlaylist(playlistId);
        this.playlists.set(playlistId, Playlist.fromOpenSubsonic(playlistWithSongs));
    }

    async removeFromPlaylist(playlistId, index) {
        await api.updatePlaylist(playlistId, { songIndexToRemove: index });

        /* Refetch playlist for update */
        const playlistWithSongs = await api.getPlaylist(playlistId);
        this.playlists.set(playlistId, Playlist.fromOpenSubsonic(playlistWithSongs));
    }

    /* Track methods */
    setTrack(track) {
        this.tracks.set(track.id, Track.fromOpenSubsonic(track));
    }

    async getTrack(trackId) {
        if (!this.tracks.has(trackId)) {
            const child = await api.getSong(trackId);
            this.setTrack(child);
        }
        return this.tracks.get(trackId);
    }

    async getTrackRadio(trackId) {
        let track = this.tracks.get(trackId);

        if (!track) {
            const child = await api.getSong(trackId);
            this.setTrack(child);
            track = this.tracks.get(trackId);
        }

        const similarSongs = await api.getSimilarSongs2(track.id);
        for (const songRaw of similarSongs) {
            const song = Track.fromOpenSubsonic(songRaw);
            this.tracks.set(song.id, song);
        }
        /* Create a fake Playlist object from received data */
        const radioPlaylist = {
            id: track.id,
            name: `${track.title} Radio`,
            comment: "",    // TODO
            entry: similarSongs,
            songCount: similarSongs.length,
            duration: similarSongs.reduce((sum, song) => sum + song.duration, 0),
            coverArt: track.coverArtId,
            created: Date.now(),
            changed: Date.now()
        }

        return Playlist.fromOpenSubsonic(radioPlaylist);
    }

    /* Cover art methods */
    getCoverArt(id, size = 256) {
        const key = `${id}:${size}`;
        if (!this.#covers.has(key)) {
            this.#covers.set(key, getCoverArtUrl(id, size));
        }
        return this.#covers.get(key);
    }
}

export const cache = new Cache();
