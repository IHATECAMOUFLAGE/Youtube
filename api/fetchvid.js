import { gotScraping } from 'got-scraping';

const PROXY_URL = "http://xjtnujpf:b3pzt68plr0c@31.59.20.176:6754";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing "url" query parameter' });

  let cookieJar = {};

  try {
    const options = {
      proxyUrl: PROXY_URL,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Upgrade-Insecure-Requests": "1"
      },
      cookieJar: cookieJar,
      responseType: 'json',
      throwHttpErrors: false,
      retry: 0
    };

    await gotScraping.get("https://downr.org/", options);
    await gotScraping.get("https://downr.org/.netlify/functions/analytics", options);

    const videoResp = await gotScraping.post("https://downr.org/.netlify/functions/nyt", {
      ...options,
      headers: {
        ...options.headers,
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
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
}
