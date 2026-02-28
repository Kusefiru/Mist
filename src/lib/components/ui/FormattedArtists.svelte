<script>
    let { text, artistMap } = $props();

    // Parse the text and create segments with artist links
    function parseArtists(text, artistMap) {
        const segments = [];

        // Create array of {id, name, index} for all artists found in text
        const foundArtists = [];
        for (const artist of artistMap) {
            let index = text.indexOf(artist.name);
            while (index !== -1) {
                foundArtists.push({ id: artist.id, name: artist.name, index });
                index = text.indexOf(artist.name, index + 1);
            }
        }

        // Sort by position in text
        foundArtists.sort((a, b) => a.index - b.index);

        // Build segments
        let pos = 0;
        for (const artist of foundArtists) {
            // Add text before this artist
            if (artist.index > pos) {
                segments.push({ type: 'text', content: text.slice(pos, artist.index) });
            }
            // Add artist link
            segments.push({ type: 'link', id: artist.id, content: artist.name });
            pos = artist.index + artist.name.length;
        }

        // Add remaining text
        if (pos < text.length) {
            segments.push({ type: 'text', content: text.slice(pos) });
        }

        return segments;
    }

    const segments = $derived(parseArtists(text, artistMap));
</script>

<span class="artist-text">
    {#each segments as segment}
        {#if segment.type === 'link'}
            <a href="/app/artist/{segment.id}" class="hover:underline">{segment.content}</a>
        {:else}
            {segment.content}
        {/if}
    {/each}
</span>
