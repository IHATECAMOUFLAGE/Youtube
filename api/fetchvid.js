import { Innertube, UniversalCache } from 'youtubei.js';

let innertubeInstance = null;

const getInnertube = async () => {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      cache: new UniversalCache(false)
    });
  }
  return innertubeInstance;
};

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
    const yt = await getInnertube();
    const info = await yt.getInfo(id);
    const streamingData = info.streaming_data;
    
    if (!streamingData) {
      return res.status(404).json({ error: 'No streaming data found. Video might be region locked or private.' });
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
    console.error('youtubei.js Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch video info via Innertube.',
      details: error.message 
    });
  }
}
