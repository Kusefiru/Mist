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
