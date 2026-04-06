import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

const PROXY_URL = "http://xjtnujpf:b3pzt68plr0c@31.59.20.176:6754";

const httpsAgent = new HttpsProxyAgent(PROXY_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Origin": "https://downr.org",
    "Referer": "https://downr.org/"
  };

  try {
    console.log("Step 1: Warming up session via Analytics...");
    
    await fetch("https://downr.org/.netlify/functions/analytics", {
      method: "GET",
      headers: headers,
      agent: httpsAgent 
    });

    console.log("Step 2: Fetching video data...");

    const videoResp = await fetch("https://downr.org/.netlify/functions/nyt", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ url: url }),
      agent: httpsAgent 
    });

    const responseText = await videoResp.text();

    if (!videoResp.ok) {
      console.error("Error from Downr:", responseText);
      return res.status(videoResp.status).json({ 
        error: "Downr backend returned an error", 
        details: responseText 
      });
    }

    const data = JSON.parse(responseText);
    return res.status(200).json(data);

  } catch (error) {
    console.error("Proxy or Network Error:", error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({ 
        error: "Proxy Connection Failed", 
        message: "Could not connect to the residential proxy. Check if it is online." 
      });
    }

    return res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message 
    });
  }
}
