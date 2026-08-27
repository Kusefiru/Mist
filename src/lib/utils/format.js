export function formatDate(year, month, day) {
    if (month && day) {
        return Intl.DateTimeFormat(navigator.language, { day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(year, month - 1, day));
    }
    return `${year}`;
}

export function formatDuration(seconds) {
    if (typeof seconds !== 'number') return '0:00';

    seconds = Math.floor(seconds || 0);

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }
}

export function formatDurationReadable(seconds) {
    if (typeof seconds !== 'number') return '';

    seconds = Math.floor(seconds || 0);

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}h ${String(mins).padStart(2, '0')}min ${String(secs).padStart(2, '0')}s`;
    } else {
        return `${mins}min ${String(secs).padStart(2, '0')}s`;
    }
}
