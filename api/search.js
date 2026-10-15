import { Innertube } from "youtubei.js";

let innertubePromise;

function getInnertube() {
  if (!innertubePromise) {
    innertubePromise = Innertube.create();
  }
  return innertubePromise;
}

export default async function handler(req, res) {
  const query = req.query.query;

  if (!query) {
    res.status(400).json({ results: [] });
    return;
  }

  try {
    const innertube = await getInnertube();
    const search = await innertube.search(String(query));
    const results = search.results
      .filter((video) => video.video_id)
      .map((video) => ({
        id: video.video_id,
        title: video.title?.toString() || "",
        thumbnail:
          video.best_thumbnail?.url ||
          video.thumbnails?.[0]?.url ||
          `https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`,
        duration: video.duration?.text || (video.is_live ? "Live" : "unknown"),
        views:
          video.short_view_count?.toString() ||
          video.view_count?.toString() ||
          "unknown",
        channel: video.author?.name || "YouTube"
      }));

    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ results: [] });
  }
}
