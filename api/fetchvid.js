import { gotScraping } from 'got-scraping';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing "url" query parameter' });

  try {
    const baseOptions = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Upgrade-Insecure-Requests": "1"
      },
      throwHttpErrors: false,
      retry: { limit: 0 }
    };

    // Initial requests (HTML)
    await gotScraping.get("https://downr.org/", baseOptions);
    await gotScraping.get("https://downr.org/.netlify/functions/analytics", baseOptions);

    // POST request (JSON)
    const videoResp = await gotScraping.post("https://downr.org/.netlify/functions/nyt", {
      ...baseOptions,
      responseType: 'json',
      headers: {
        ...baseOptions.headers,
        "Content-Type": "application/json",
        "Origin": "https://downr.org",
        "Referer": "https://downr.org/"
      },
      json: { url: url }
    });

    if (videoResp.statusCode !== 200) {
      return res.status(videoResp.statusCode).json({ 
        error: "Downr backend returned an error", 
        details: videoResp.body 
      });
    }

    return res.status(200).json(videoResp.body);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
}
