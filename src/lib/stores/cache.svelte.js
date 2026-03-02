// lib/stores/cache.svelte.ts
import { database } from "$lib/db";
import { Album } from "$lib/db/models/Album";
import { Artist } from "$lib/db/models/Artist";
import { Track } from "$lib/db/models/Track";
import { Playlist } from "$lib/db/models/Playlist";
import { getCoverArtUrl } from "$lib/opensubsonic/api";
import * as api from '$lib/opensubsonic/api';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

class Cache {
    serverId = $state('');
    userId = $state('');
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
        const userId = user?.username || null;

        if (!serverId || !userId) {
            console.error('Cache init failed: serverId or userId is missing', { serverId, userId });
            return;
        }

        this.serverId = serverId;
        this.userId = userId;

        await this.fetch();

        this.initialized = true;
    }

    // Promise to wait for cache to be initialized (especially if refreshing the page)
    ready() {
        if (this.initialized) return Promise.resolve();
        return new Promise(resolve => {
            const check = $effect.root(() => {
                $effect(() => {
                    if (this.initialized) {
                        resolve();
                        check();
                    }
                });
            });
        });
    }

    async _fetchAlbums() {
        this.folders.clear();
        this.albums.clear();

        const musicFolders = await api.getMusicFolders();
        for(const musicFolder of musicFolders) {
            this.folders.set(musicFolder.id, musicFolder.name);

            // Get all albums from folder
            const albumsRaw = [];
            const pageSize = 500;
            let offset = 0;
            let hasMore = true;

            while (hasMore) {
                const albumList = await api.getAlbumList2('alphabeticalByName', {
                    musicFolderId: musicFolder.id,
                    size: pageSize,
                    offset: offset
                });
                if (albumList.length > 0) {
                    albumsRaw.push(...albumList);
                }
                if (albumList.length < 500) {
                    hasMore = false;
                } else {
                    offset += pageSize;
                }
            }

            // Set to cache along with cover urls
            albumsRaw.forEach(a => {
                this.albums.set(a.id, Album.fromOpenSubsonic(a, musicFolder.id));
                /* this.#covers.set(a.coverArt, getCoverArtUrl(a.coverArt)) */
            });
        }
    }

    async _fetchArtists() {
        this.artists.clear();

        const artistsResponse = await api.getArtists();
        const artistsRaw = artistsResponse.index?.flatMap(idx => idx.artist || []) || [];

        // Set to cache along with cover urls
        artistsRaw.forEach(a => {
            this.artists.set(a.id, Artist.fromOpenSubsonic(a));
            /* this.#covers.set(a.coverArt, getCoverArtUrl(a.coverArt)) */
        });
    }

    async _fetchPlaylists(lastFetchTime) {
        this.playlists.clear();

        const playlistsRaw = await api.getPlaylists();

        playlistsRaw.forEach(p => {
            this.playlists.set(p.id, Playlist.fromOpenSubsonic(p));
            /* this.#covers.set(p.coverArt, getCoverArtUrl(p.coverArt)); */
        });
    }

    async fetch() {
        await this._fetchAlbums();
        await this._fetchArtists();
        await this._fetchPlaylists();

        // Additional data only refetch through full sync
        const starred = await api.getStarred();

        starred.artist?.forEach(a => this.stars.add(a.id));
        starred.album?.forEach(a => this.stars.add(a.id));
        starred.song?.forEach(s => this.stars.add(s.id));
    }

    /* Album methods */
    async getAlbum(albumId) {
        const album = this.albums.get(albumId);
        if (!album) return null;
        if (album.songIds && (album.songIds.length == album.songCount)) {
            return album;
        }

        const AlbumID3WithSongs = await api.getAlbum(album.id);
        for (const trackRaw of AlbumID3WithSongs.song) {
            // Cache track
            const track = Track.fromOpenSubsonic(trackRaw);
            this.tracks.set(track.id, track);
        }
        const updatedAlbum = Album.fromOpenSubsonic(AlbumID3WithSongs, album.folderId);
        this.albums.set(album.id, updatedAlbum);

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
        if (playlist.songIds && (playlist.songIds.length == playlist.songCount)) {
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
    getCoverArt(id, size = 512) {
    /*     if (!this.#covers.has(id)) {
            const coverArt = getCoverArtUrl(id);
            this.#covers.set(id, coverArt);
        }
        return this.#covers.get(id); */
        return getCoverArtUrl(id, size);
    }
}

export const cache = new Cache();
