import { search3 } from '$lib/opensubsonic/api';

export async function load({ url }) {
  const query = url.searchParams.get('q');

  if (!query || query.trim() === '') {
    return {
      query: '',
      results: null
    };
  }

  try {
    const results = await search3(query.trim());

    return {
      query: query.trim(),
      results: results
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      query: query.trim(),
      results: {
        artist: [],
        album: [],
        song: []
      },
      error: 'Failed to fetch search results'
    };
  }
}
