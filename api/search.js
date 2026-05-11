export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ results: [] });
    return;
  }

  try {
    const results = [];
    const seen = new Set();

    const searchUrl =
      "https://video.search.yahoo.com/search/video?" +
      new URLSearchParams({
        p: query + " youtube",
        fr: "sfp"
      });

    const searchResponse = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html"
      }
    });

    if (!searchResponse.ok) {
      res.status(200).json({ results: [] });
      return;
    }

    const html = await searchResponse.text();

    const cards = html.split('<li class="tile').slice(1);

    const ids = [];

    for (const card of cards) {
      const refMatch = card.match(/data-referenceurl="([^"]+)"/);
      const hrefMatch = card.match(/href="([^"]+)"/);

      const url = refMatch?.[1] || hrefMatch?.[1];
      if (!url) continue;

      const idMatch = url.match(/v=([^&]+)/);
      if (!idMatch) continue;

      const id = idMatch[1];
      if (!id || seen.has(id)) continue;

      seen.add(id);
      ids.push(id);
    }

    if (ids.length === 0) {
      res.status(200).json({ results: [] });
      return;
    }

    for (const card of cards) {
      const refMatch = card.match(/data-referenceurl="([^"]+)"/);
      const hrefMatch = card.match(/href="([^"]+)"/);
      const url = refMatch?.[1] || hrefMatch?.[1];
      if (!url) continue;

      const idMatch = url.match(/v=([^&]+)/);
      if (!idMatch) continue;

      const id = idMatch[1];
      if (!ids.includes(id)) continue;

      const titleMatch = card.match(/tile-title[^>]*>(.*?)<\/p>/s);
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
        : "";

      const thumbMatch = card.match(/<img[^>]+src="([^"]+)"/);
      const thumbnail =
        thumbMatch?.[1] ||
        `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

      const durationMatch = card.match(/class="[^"]*time[^"]*"[^>]*>(.*?)<\/p>/);
      const duration = durationMatch?.[1]?.trim() || "unknown";

      const viewsMatch = card.match(/(\d[\d.,]*[MK]?) views/i);
      const views = viewsMatch?.[1] || "unknown";

      const channelMatch = card.match(/tile-domain[^>]*>(.*?)<\/p>/);
      const channel = channelMatch
        ? channelMatch[1].replace(/<[^>]+>/g, "").trim()
        : "YouTube";

      results.push({
        id,
        title,
        thumbnail,
        duration,
        views,
        channel
      });
    }

    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ results: [] });
  }
}
