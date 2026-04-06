import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const PROXY_URL = "http://xjtnujpf:b3pzt68plr0c@31.59.20.176:6754";
const httpsAgent = new HttpsProxyAgent(PROXY_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing "url" query parameter' });

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Upgrade-Insecure-Requests": "1"
  };

  const fetchWithCookies = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
        "Cookie": cookieString
      },
      agent: httpsAgent
    });
  };

  let cookieString = "";

  try {
    const homeResp = await fetchWithCookies("https://downr.org/");
    const rawHeaders = homeResp.headers.raw();
    const cookies = rawHeaders['set-cookie'] || [];
    
    if (cookies.length > 0) {
      cookieString = cookies.join('; ');
    }

    await fetchWithCookies("https://downr.org/.netlify/functions/analytics");

    const videoResp = await fetchWithCookies("https://downr.org/.netlify/functions/nyt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://downr.org",
        "Referer": "https://downr.org/"
      },
      body: JSON.stringify({ url: url })
    });

    const responseText = await videoResp.text();

    if (!videoResp.ok) {
      return res.status(videoResp.status).json({ 
        error: "Downr backend returned an error", 
        details: responseText 
      });
    }

    return res.status(200).json(JSON.parse(responseText));

  } catch (error) {
    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
}
