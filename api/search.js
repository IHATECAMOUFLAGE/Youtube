export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ results: [] });
    return;
  }

  try {
    // extract youtube ids from query
    const ids = [];
    const seen = new Set();

    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)?([a-zA-Z0-9_-]{11})/g;

    let match;

    while ((match = regex.exec(query)) !== null) {
      const id = match[1];

      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }

    if (ids.length === 0) {
      res.status(200).json({ results: [] });
      return;
    }

    // use ytapi.apps.mattw.io instead of googleapis
    const apiUrl =
      "https://ytapi.apps.mattw.io/v3/videos?" +
      new URLSearchParams({
        part: "snippet,contentDetails,statistics",
        id: ids.join(","),
        key: "foo1"
      });

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      res.status(200).json({ results: [] });
      return;
    }

    const data = await response.json();

    const results = (data.items || []).map((item) => ({
      id: item.id,
      title: item.snippet?.title || "",
      thumbnail:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`,
      duration: item.contentDetails?.duration || "unknown",
      views: item.statistics?.viewCount || "unknown",
      channel: item.snippet?.channelTitle || "YouTube"
    }));

    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ results: [] });
  }
}