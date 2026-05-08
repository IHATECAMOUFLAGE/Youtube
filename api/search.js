export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ results: [] });
    return;
  }

  try {
    const results = [];
    const seen = new Set();

    async function addVideo(id) {
      if (!id || seen.has(id)) return;
      seen.add(id);

      const watchUrl = `https://www.youtube.com/watch?v=${id}`;

      const oembedUrl =
        "https://www.youtube.com/oembed?url=" +
        encodeURIComponent(watchUrl) +
        "&format=json";

      try {
        const response = await fetch(oembedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json"
          }
        });

        if (!response.ok) return;

        const data = await response.json();

        results.push({
          id,
          title: data.title || "",
          thumbnail:
            data.thumbnail_url ||
            `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
          duration: "unknown",
          views: "unknown",
          channel: data.author_name || "YouTube"
        });
      } catch {}
    }

    const directRegex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;

    let match;

    while ((match = directRegex.exec(query)) !== null) {
      await addVideo(match[1]);
    }

    const rawIdRegex = /\b[a-zA-Z0-9_-]{11}\b/g;

    while ((match = rawIdRegex.exec(query)) !== null) {
      await addVideo(match[0]);
    }

    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ results: [] });
  }
}