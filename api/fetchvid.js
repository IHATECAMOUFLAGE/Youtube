import { Innertube, UniversalCache } from 'youtubei.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

const PROXY_POOL = [
  'http://xjtnujpf:b3pzt68plr0c@31.59.20.176:6754',
  'http://xjtnujpf:b3pzt68plr0c@23.95.150.145:6114',
  'http://xjtnujpf:b3pzt68plr0c@198.23.239.134:6540',
  'http://xjtnujpf:b3pzt68plr0c@45.38.107.97:6014',
  'http://xjtnujpf:b3pzt68plr0c@107.172.163.27:6543'
];

const CLIENTS = [
  'ANDROID',
  'ANDROID_EMBEDDED',
  'WEB_REMIX',
  'TV_EMBEDDED'
];

const getRandomProxy = () => {
  const proxy = PROXY_POOL[Math.floor(Math.random() * PROXY_POOL.length)];
  return new HttpsProxyAgent(proxy);
};

async function tryClient(client, videoId) {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      client,
      request_options: {
        agent: getRandomProxy(),
        timeout: 8000
      }
    });

    const info = await yt.getInfo(videoId);

    if (!info.streaming_data) {
      return { ok: false, reason: info.playability_status?.reason };
    }

    return { ok: true, info };

  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', true);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing \"id\" query parameter' });

  for (const client of CLIENTS) {
    const result = await tryClient(client, id);

    if (result.ok) {
      const info = result.info;
      const streamingData = info.streaming_data;

      let bestFormat = streamingData.adaptive_formats
        .filter(f => f.mime_type.includes('video/mp4'))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

      if (!bestFormat) bestFormat = streamingData.adaptive_formats[0];

      return res.status(200).json({
        clientUsed: client,
        proxyUsed: 'rotating',
        title: info.basic_info.title,
        author: info.basic_info.author,
        thumbnail: info.basic_info.thumbnail[0].url,
        duration: info.basic_info.duration,
        streamUrl: bestFormat?.url || null,
        quality: bestFormat?.quality_label || 'unknown'
      });
    }
  }

  res.status(500).json({
    error: 'All clients failed. YouTube blocked every attempt.',
    note: 'Try adding more residential proxies or authenticated cookies.'
  });
}
