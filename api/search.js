export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) {
    res.status(400).json({ results: [] });
    return;
  }
  const q = encodeURIComponent(query + " youtube");
  const url = "https://video.search.yahoo.com/search/video?p=" + q;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      }
    });
    const html = await response.text();
    const results = [];
    const regex = /<a[^>]+href="([^"]+youtube\.com\/watch\?v=[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    const seen = new Set();
    while ((match = regex.exec(html)) !== null) {
      const url = match[1];
      const idMatch = url.match(/v=([a-zA-Z0-9_-]{11})/);
      if (!idMatch) continue;
      const id = idMatch[1];
      if (seen.has(id)) continue;
      seen.add(id);
      const rawTitle = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const title = rawTitle || "Unknown Title";
      results.push({
        id,
        title,
        thumbnail: "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg",
        duration: "",
        views: "",
        channel: "YouTube"
      });
      if (results.length >= 30) break;
    }
    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ results: [] });
  }
}
