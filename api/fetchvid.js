import { Innertube } from 'youtubei.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing "id" query parameter' });
  }

  try {
    const proxyRes = await fetch('https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=ipport&format=text');
    const proxyText = await proxyRes.text();
    const proxies = proxyText.trim().split('\n').filter(p => p.length > 0);

    if (proxies.length === 0) {
      return res.status(500).json({ error: 'No proxies available' });
    }

    const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
    const proxyUrl = `http://${randomProxy}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    const yt = await Innertube.create({
      cache: undefined,
      client: 'TV_EMBEDDED',
      request_options: {
        agent: agent,
        timeout: 8000
      }
    });

    const info = await yt.getInfo(id);
    const streamingData = info.streaming_data;

    if (!streamingData) {
      return res.status(403).json({ 
        error: 'Streaming data blocked by YouTube.',
        status: info.playability_status.status,
        reason: info.playability_status.reason 
      });
    }

    let bestFormat = streamingData.adaptive_formats
      .filter(format => format.mime_type.includes('video/mp4'))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    if (!bestFormat && streamingData.adaptive_formats.length > 0) {
       bestFormat = streamingData.adaptive_formats[0];
    }

    const response = {
      title: info.basic_info.title,
      author: info.basic_info.author,
      thumbnail: info.basic_info.thumbnail[0].url,
      duration: info.basic_info.duration,
      streamUrl: bestFormat ? bestFormat.url : null,
      quality: bestFormat ? bestFormat.quality_label : 'unknown'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch video info. The random proxy might be dead.',
      details: error.message 
    });
  }
}
