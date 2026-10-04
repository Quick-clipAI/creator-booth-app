// /api/gemini.js
// Server-side proxy for Gemini's generateContent endpoint.
// The API key lives in a Vercel environment variable (GEMINI_API_KEY),
// never in the browser, so it can't be viewed via "view source" or dev tools.

export default async function handler(req, res) {
  // CORS: needed now that the Android app (bundled locally, different origin) calls this same
  // endpoint via its absolute URL instead of a same-origin relative path. The website itself is
  // unaffected — same-origin requests don't look at these headers at all.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: { message: 'Server is missing GEMINI_API_KEY. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.' }
    });
  }

  // The browser only ever sends the Gemini request body (contents / system_instruction / tools).
  // We forward it as-is to Google and relay the response back unchanged.
  const { contents, system_instruction, tools } = req.body || {};
  if (!contents) {
    return res.status(400).json({ error: { message: 'Missing "contents" in request body.' } });
  }

  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, system_instruction, tools })
    });

    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: { message: 'Could not reach Gemini: ' + (err && err.message) } });
  }
}
