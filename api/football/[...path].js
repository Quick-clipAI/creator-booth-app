// /api/football/[...path].js
// Server-side proxy for API-Football, called directly (api-sports.io),
// NOT through the RapidAPI marketplace.
// Solves two problems at once:
//   1. CORS — a same-origin call to our own /api route never hits CORS.
//   2. Key exposure — the key stays in a Vercel env var (API_SPORTS_KEY),
//      never sent to or stored in the browser.
//
// Usage from the frontend:
//   /api/football/status                -> https://v3.football.api-sports.io/status
//   /api/football/fixtures?live=all     -> https://v3.football.api-sports.io/fixtures?live=all
// Any path/query after /api/football/ is forwarded through untouched.

export default async function handler(req, res) {
  // CORS: needed now that the Android app (bundled locally, different origin) calls this same
  // endpoint via its absolute URL instead of a same-origin relative path. The comment below
  // predates the app; same-origin calls from the website are still unaffected either way.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.API_SPORTS_KEY;
  if (!key) {
    return res.status(500).json({
      error: 'Server is missing API_SPORTS_KEY. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.'
    });
  }

  const { path = [] } = req.query;
  const upstreamPath = Array.isArray(path) ? path.join('/') : String(path);

  // Rebuild the query string, dropping the catch-all "path" param Vercel injects.
  const params = new URLSearchParams(req.query);
  params.delete('path');
  const qs = params.toString();

  const url = `https://v3.football.api-sports.io/${upstreamPath}${qs ? '?' + qs : ''}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        'x-apisports-key': key
      }
    });
    const data = await upstream.json().catch(() => ({}));
    // Cache lightweight, fast-changing data briefly at the edge to save on quota.
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach API-Football: ' + (err && err.message) });
  }
}
