export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ results: [] });
  }

  try {
    // if query is already a youtube url
    let videoId = null;

    const directMatch = query.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );

    if (directMatch) {
      videoId = directMatch[1];
    } else {
      // otherwise assume query itself is the id
      const idMatch = query.match(/^([a-zA-Z0-9_-]{11})$/);
      if (idMatch) {
        videoId = idMatch[1];
      }
    }

    if (!videoId) {
      return res.status(400).json({ results: [] });
    }

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const oembedUrl =
      "https://www.youtube.com/oembed?url=" +
      encodeURIComponent(watchUrl) +
      "&format=json";

    const response = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return res.status(200).json({ results: [] });
    }

    const data = await response.json();

    // exact same structure as before
    const results = [
      {
        id: videoId,
        title: data.title || "",
        thumbnail:
          data.thumbnail_url ||
          `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        duration: "",
        views: "",
        channel: data.author_name || "YouTube"
      }
    ];

    return res.status(200).json({ results });
  } catch (e) {
    return res.status(500).json({ results: [] });
  }
}