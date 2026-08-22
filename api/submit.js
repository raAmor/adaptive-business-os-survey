const GIST_ID = process.env.GIST_ID || '94c79b76755871d2efe16260fe73fcaa';
const GH_TOKEN = process.env.GH_TOKEN;

async function getResponses() {
  try {
    if (!GH_TOKEN) return global.__SURVEY_SUBMISSIONS__ || [];
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `Bearer ${GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Adaptive-OS-Survey'
      },
      cache: 'no-store'
    });
    if (!res.ok) return global.__SURVEY_SUBMISSIONS__ || [];
    const data = await res.json();
    const content = data.files && data.files['responses.json'] ? data.files['responses.json'].content : '[]';
    return JSON.parse(content || '[]');
  } catch (e) {
    console.error('Error fetching responses:', e);
    return global.__SURVEY_SUBMISSIONS__ || [];
  }
}

async function saveResponses(list) {
  global.__SURVEY_SUBMISSIONS__ = list;
  if (!GH_TOKEN) return true;

  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${GH_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Adaptive-OS-Survey'
    },
    body: JSON.stringify({
      files: {
        'responses.json': {
          content: JSON.stringify(list, null, 2)
        }
      }
    })
  });
  return res.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    const submission = {
      id: data.id || ('RESP_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
      receivedAt: new Date().toISOString(),
      ...data
    };

    const existing = await getResponses();
    if (!existing.some(e => e.id === submission.id)) {
      existing.push(submission);
    }
    
    await saveResponses(existing);

    return res.status(200).json({ success: true, id: submission.id, totalCount: existing.length });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ error: err.message });
  }
}
