export function sortByName(a, b) {
    return (a.name || '').localeCompare(b.name || '');
}

export function sortByDateReleased(a, b) {
    const dateA = new Date(
        a.date.year || 0,
        (a.date.month || 1) - 1,
        a.date.day || 1
    ).getTime();

    const dateB = new Date(
        b.date.year || 0,
        (b.date.month || 1) - 1,
        b.date.day || 1
    ).getTime();

    return dateA - dateB; // Ascending (oldest first)
}

export function sortByArtist(a, b) {
    const artistCompare = (a.artistsStr || '').localeCompare(b.artistsStr || '');
    if (artistCompare !== 0) return artistCompare;
    return sortByDateReleased(a, b); // Then by year
}

export function sortByDateAdded(a, b) {
    return new Date(b.created) - new Date(a.created);
}

export function sortByPlayCount(a, b) {
    return (b.playCount || 0) - (a.playCount || 0);
}

export function sortByDuration(a, b) {
    return (b.duration || 0) - (a.duration || 0);
}

export function sortByRandom(a, b) {
    return Math.random() - 0.5;
}
