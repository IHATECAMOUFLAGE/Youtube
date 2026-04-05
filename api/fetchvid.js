import ytdl from '@distube/ytdl-core';

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
    const videoUrl = `https://www.youtube.com/watch?v=${id}`;
    
    const options = {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    };

    const info = await ytdl.getInfo(videoUrl, options);
    
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    const bestFormat = formats.length > 0 ? formats[0] : null;

    if (!bestFormat) {
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      const videoFormats = ytdl.filterFormats(info.formats, 'videoonly');
      
      if (!audioFormats.length && !videoFormats.length) {
         return res.status(500).json({ error: 'No streamable formats found' });
      }
    }

    res.status(200).json({
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      duration: info.videoDetails.lengthSeconds,
      streamUrl: bestFormat ? bestFormat.url : null 
    });

  } catch (error) {
    console.error('Detailed Error:', error.message);
    
    if (error.message && error.message.includes('Sign in')) {
      return res.status(403).json({ 
        error: 'YouTube is blocking this request (Bot detection). This is a common issue on free hosting.' 
      });
    }

    res.status(500).json({ error: 'Failed to fetch video info. The video ID might be invalid, or YouTube blocked the server IP.' });
  }
}
