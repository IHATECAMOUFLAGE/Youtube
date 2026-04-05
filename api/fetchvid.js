import { Innertube, UniversalCache } from 'youtubei.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

let innertubeInstance = null;

const getInnertube = async () => {
  if (!innertubeInstance) {
    const PROXY_URL = 'http://xjtnujpf:b3pzt68plr0c@31.59.20.176:6754';
    const agent = new HttpsProxyAgent(PROXY_URL);

    innertubeInstance = await Innertube.create({
      cache: new UniversalCache(false),
      client: 'ANDROID', 
      request_options: {
        agent,
        timeout: 8000
      }
    });
  }
  return innertubeInstance;
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing \"id\" query parameter' });

  try {
    const yt = await getInnertube();
    const info = await yt.getInfo(id);

    const streamingData = info.streaming_data;

    if (!streamingData) {
      return res.status(403).json({
        error: 'Streaming data blocked by YouTube.',
        status: info.playability_status?.status,
        reason: info.playability_status?.reason
      });
    }

    let bestFormat = streamingData.adaptive_formats
      .filter(f => f.mime_type.includes('video/mp4'))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    if (!bestFormat) bestFormat = streamingData.adaptive_formats[0];

    res.status(200).json({
      title: info.basic_info.title,
      author: info.basic_info.author,
      thumbnail: info.basic_info.thumbnail[0].url,
      duration: info.basic_info.duration,
      streamUrl: bestFormat?.url || null,
      quality: bestFormat?.quality_label || 'unknown'
    });

  } catch (error) {
    console.error('youtubei.js Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch video info.',
      details: error.message
    });
  }
}
