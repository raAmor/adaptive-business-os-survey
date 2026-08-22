let submissions = global.__SURVEY_SUBMISSIONS__ || [];
global.__SURVEY_SUBMISSIONS__ = submissions;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user, x-pass');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = req.headers['x-user'] || req.query.user;
  const pass = req.headers['x-pass'] || req.query.pass;

  // Gate with credentials: tarteebat / andamoor
  if (user !== 'tarteebat' || pass !== 'andamoor') {
    return res.status(401).json({ error: 'Unauthorized: Invalid username or password' });
  }

  return res.status(200).json({
    success: true,
    total: (global.__SURVEY_SUBMISSIONS__ || []).length,
    results: global.__SURVEY_SUBMISSIONS__ || []
  });
}
