// src/api.js

import md5 from "md5";
import { get } from 'svelte/store';
import { session } from "$lib/stores/auth.svelte.js";
import toast from "svelte-french-toast";

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

async function ask(endpoint, extraParams = {}) {
    const response = await fetch(buildUrl(endpoint, extraParams));
    if (!response.ok) {
        toast.error(`${response.status}: ${response.statusText}`);
        return null;
    }
    const reply = await response.json();
    const data = reply["subsonic-response"];

    if (data.status !== 'ok') {
        toast.error(`In ${endpoint}: ${data.error.message} (error ${data.error.code})`);
        return null;
    }
    return data;
}

// API implementation

export function download(id) {
    return buildUrl('download.view', { id });
}

export async function getAlbum(id) {
    const reply = await ask('getAlbum.view', { id });
    return reply?.album || null;
}

export async function getAlbumList(type, size) {
    const reply = await ask('getAlbumList.view', { type, size });
    return reply?.albumList?.album || [];
}

export async function getAlbumList2(type, options = {}) {
    const reply = await ask('getAlbumList2.view', { type, ...options });
    return reply?.albumList2?.album || [];
}

export async function getArtist(id) {
    const reply = await ask('getArtist.view', { id });
    return reply?.artist || null;
}

export async function getArtists() {
    const reply = await ask('getArtists.view', { id: 'aaaa' });
    return reply?.artists || [];
}

export async function getArtistInfo2(id, options = {}) {
    const reply = await ask('getArtistInfo2.view', { id, ...options });
    return reply?.artistInfo2;
}

export async function getAvatar(username) {
    const response = await fetch(buildUrl('getAvatar.view', { username }));
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

export async function getIndexes(musicFolderId, isModifiedSince) {
    const reply = await ask('getIndexes.view', { musicFolderId, isModifiedSince });
    return reply?.indexes;
}

export async function getMusicDirectory(id) {
    const reply = await ask('getMusicDirectory.view', { id });
    return reply?.directory;
}

export async function getMusicFolders() {
    const reply = await ask('getMusicFolders.view');
    return reply?.musicFolders?.musicFolder || [];
}

export async function getPlaylist(id) {
    const reply = await ask('getPlaylist.view', { id });
    return reply?.playlist || null;
}

export async function getPlaylists() {
    const reply = await ask('getPlaylists.view');
    return reply?.playlists?.playlist || [];
}

export async function getPlayQueue() {
    const reply = await ask('getPlayQueue.view');
    return reply?.playQueue;
}

export async function getSong(id) {
    const reply = await ask('getSong.view', { id });
    return reply?.song;
}

export async function getStarred() {
    const reply = await ask('getStarred.view');
    return reply?.starred || {};
}

export async function getTopSongs(name) {
    const reply = await ask('getTopSongs.view', { artist: name, count: 10 });
    return reply?.topSongs?.song || [];
}

export async function getUser(name) {
    const reply = await ask('getUser.view', { username: name });
    return reply?.user;
}

export function getCoverArtUrl(coverArtId, size) {
    const data = buildUrl('getCoverArt.view', { id: coverArtId, size });
    return data;
}

export function getStreamUrl(id) {
    return buildUrl('stream.view', { id });
}

export async function ping() {
    const reply = await ask('ping.view');
    return reply?.status;
}

export async function savePlayQueue(trackIds, current, position) {
    const reply = await ask('savePlayQueue.view', { id: trackIds, current, position });
    return reply?.status;
}

export async function scrobble(id, time, submission = false) {
    const reply = await ask('scrobble.view', { id, time, submission });
    return reply?.status;
}

export async function search3(query) {
    const reply = await ask('search3.view', { query, songCount: 10 });
    return reply?.searchResult3;
}

export async function star(id) {
    const reply = await ask('star.view', { id });
    return reply?.status;
}

export async function unstar(id) {
    const reply = await ask('unstar.view', { id });
    return reply?.status;
}
