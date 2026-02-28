// src/api.js

import md5 from "md5";
import { get } from 'svelte/store';
import { session } from "$lib/stores/auth.svelte.js";

// Utility methods

function buildUrl(endpoint, extraParams = {}) {
    const url = new URL(`${session.serverUrl}/rest/${endpoint}`);
    const params = {
        u: session.username,
        t: session.token,
        s: session.salt,
        v: '1.16.1',
        c: 'Mist',
        f: 'json',
        ...extraParams
    }

    Object.entries(params).forEach(([k, v]) => {
        if (Array.isArray(v)) {
            v.forEach(item => url.searchParams.append(k, item));
        } else {
            url.searchParams.set(k, v);
        }
    });

    return url.toString();
}

// API implementation

export function download(id) {
    return buildUrl('download.view', { id });
}

export async function getAlbum(id) {
    const response = await fetch(buildUrl('getAlbum.view', { id }));
    const data = await response.json();

    return data['subsonic-response'].album;
}

export async function getAlbumList(type, size) {
    const response = await fetch(buildUrl('getAlbumList.view', { type, size }));
    const data = await response.json();

    return data['subsonic-response'].albumList;
}

export async function getAlbumList2(type, options = {}) {
    const response = await fetch(buildUrl('getAlbumList2.view', { type, ...options }));
    const data = await response.json();

    return data['subsonic-response'].albumList2.album;
}

export async function getArtist(id) {
    const response = await fetch(buildUrl('getArtist.view', { id }));
    const data = await response.json();

    return data['subsonic-response'].artist;
}

export async function getArtists() {
    const response = await fetch(buildUrl('getArtists.view'));
    const data = await response.json();

    return data['subsonic-response'].artists;
}

export async function getArtistInfo2(id, options = {}) {
    const response = await fetch(buildUrl('getArtistInfo2.view', { id, ...options }));
    const data = await response.json();

    return data['subsonic-response'].artistInfo2;
}

export async function getAvatar(username) {
    const response = await fetch(buildUrl('getAvatar.view', { username }));
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

export async function getIndexes(musicFolderId, isModifiedSince) {
    const response = await fetch(buildUrl('getIndexes.view', { musicFolderId, isModifiedSince }));
    const data = await response.json();

    return data['subsonic-response'].indexes;
}

export async function getMusicDirectory(id) {
    const response = await fetch(buildUrl('getMusicDirectory.view', { id }));
    const data = await response.json();

    return data['subsonic-response'].directory;
}

export async function getMusicFolders() {
    const response = await fetch(buildUrl('getMusicFolders.view'));
    const data = await response.json();

    return data['subsonic-response'].musicFolders.musicFolder;
}

export async function getPlaylist(id) {
    const response = await fetch(buildUrl('getPlaylist.view', { id }));
    const data = await response.json();

    return data['subsonic-response'].playlist;
}

export async function getPlaylists() {
    const response = await fetch(buildUrl('getPlaylists.view'));
    const data = await response.json();

    return data['subsonic-response'].playlists.playlist;
}

export async function getPlayQueue() {
    const response = await fetch(buildUrl('getPlayQueue.view'));
    const data = await response.json();

    return data['subsonic-response'].playQueue;
}

export async function getSong(id) {
    const response = await fetch(buildUrl('getSong.view', { id }));
    const data = await response.json();

    return data['subsonic-response'].song;
}

export async function getStarred() {
    const response = await fetch(buildUrl('getStarred.view'));
    const data = await response.json();

    return data['subsonic-response'].starred;
}

export async function getTopSongs(name) {
    const response = await fetch(buildUrl('getTopSongs.view', { artist: name, count: 10 }));
    const data = await response.json();

    return data['subsonic-response'].topSongs.song;
}

export async function getUser(name) {
    const response = await fetch(buildUrl('getUser.view', { name }));
    const data = await response.json();

    return data['subsonic-response'].user;
}

export function getCoverArtUrl(coverArtId, size) {
    const data = buildUrl('getCoverArt.view', { id: coverArtId, size });
    return data;
}

export function getStreamUrl(id) {
    return buildUrl('stream.view', { id });
}

export async function ping() {
    const response = await fetch(buildUrl('ping.view'));
    const data = await response.json();

    return data['subsonic-response'].status;
}

export async function savePlayQueue(trackIds, current, position) {
    const response = await fetch(buildUrl('savePlayQueue.view', { id: trackIds, current, position }));
    const data = await response.json();
}

export async function scrobble(id, time, submission = false) {
    const response = await fetch(buildUrl('scrobble.view', { id, time, submission }));
    const data = await response.json();
}

export async function search3(query) {
    const response = await fetch(buildUrl('search3.view', { query, songCount: 10 }));
    const data = await response.json();

    return data['subsonic-response'].searchResult3;
}

export async function star(id) {
    const response = await fetch(buildUrl('star.view', { id }));
    const data = await response.json();
}

export async function unstar(id) {
    const response = await fetch(buildUrl('unstar.view', { id }));
    const data = await response.json();
}
