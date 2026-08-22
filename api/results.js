const GIST_ID = process.env.GIST_ID || '94c79b76755871d2efe16260fe73fcaa';
const GH_TOKEN = process.env.GH_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user, x-pass');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = req.headers['x-user'] || req.query.user;
  const pass = req.headers['x-pass'] || req.query.pass;

  // Protected Gate
  if (user !== 'tarteebat' || pass !== 'andamoor') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (!GH_TOKEN) {
      const fallbackList = global.__SURVEY_SUBMISSIONS__ || [];
      return res.status(200).json({ success: true, total: fallbackList.length, results: fallbackList });
    }

    const ghRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `Bearer ${GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Adaptive-OS-Survey'
      },
      cache: 'no-store'
    });

    if (!ghRes.ok) {
      const fallbackList = global.__SURVEY_SUBMISSIONS__ || [];
      return res.status(200).json({ success: true, total: fallbackList.length, results: fallbackList });
    }

    const data = await ghRes.json();
    const content = data.files && data.files['responses.json'] ? data.files['responses.json'].content : '[]';
    const list = JSON.parse(content || '[]');

    return res.status(200).json({
      success: true,
      total: list.length,
      results: list
    });
  } catch (err) {
    console.error('Results fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
}
