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

        if (filters.get("libraries")) {
            filtered_albums = filtered_albums.filter(a => filters.get("libraries").has(a.folderId));
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
        const playlist = this.playlists.get(playlistId);
        if (!playlist) return null;
        if (playlist.songIds && (playlist.songCount > 0) && (playlist.songIds.length == playlist.songCount)) {
            return playlist;
        }

        const playlistWithSongs = await api.getPlaylist(playlist.id);
        for (const trackRaw of playlistWithSongs.entry) {
            // Cache track
            const track = Track.fromOpenSubsonic(trackRaw);
            this.tracks.set(track.id, track);
        }
        const updatedPlaylist = Playlist.fromOpenSubsonic(playlistWithSongs);
        this.playlists.set(playlist.id, updatedPlaylist);

        return updatedPlaylist;
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
