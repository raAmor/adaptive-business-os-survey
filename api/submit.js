// In-memory global store for serverless lifecycle + persistence helper
let submissions = global.__SURVEY_SUBMISSIONS__ || [];
global.__SURVEY_SUBMISSIONS__ = submissions;

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
      id: 'RESP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      receivedAt: new Date().toISOString(),
      ...data
    };

    submissions.push(submission);
    global.__SURVEY_SUBMISSIONS__ = submissions;

    return res.status(200).json({ success: true, id: submission.id, count: submissions.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
