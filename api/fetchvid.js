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

    if (!ytdl.validateURL(videoUrl)) {
      return res.status(400).json({ error: 'Invalid YouTube Video ID' });
    }

    const info = await ytdl.getInfo(videoUrl);

    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    
    const bestFormat = formats.length > 0 ? formats[0] : null;

    const responseData = {
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      duration: info.videoDetails.lengthSeconds,
      streamUrl: bestFormat ? bestFormat.url : null
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch video info' });
  }
}
