export async function fetchUnsplashImage(query: string): Promise<string> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log('No Unsplash API key found');
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';
  }
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${accessKey}&orientation=landscape&per_page=1`;
  console.log('Unsplash API fetch URL:', url);
  const res = await fetch(url);
  if (!res.ok) {
    console.log('Unsplash API error:', res.status, res.statusText);
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';
  }
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    console.log('Unsplash API result:', data.results[0].urls.regular);
    return data.results[0].urls.regular;
  }
  console.log('Unsplash API returned no results for:', query);
  return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';
} 