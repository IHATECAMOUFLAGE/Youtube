import express from "express";
import fetch from "node-fetch";
import { Innertube } from "youtubei.js";

const app = express();
const PORT = process.env.PORT || 3000;

let innertubePromise;

function getInnertube() {
  if (!innertubePromise) {
    innertubePromise = Innertube.create();
  }
  return innertubePromise;
}

app.get("/api/search", async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ results: [] });
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
    console.error("Search error:", error);
    res.status(500).json({ results: [] });
  }
});

app.get("/api/fetch", async (req, res) => {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ error: "Missing ?url= parameter" });
    }

    const apiUrl = `https://www.acethinker.ai/downloader/api/dlapinewv2.php?url=${encodeURIComponent(
      targetUrl
    )}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.acethinker.ai/"
      }
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: "Failed to fetch from API" });
    }

    const data = await apiRes.json();
    const resData = data?.res_data;

    if (!resData || resData.message !== "success") {
      return res.status(404).json({ error: "Video not found or extraction failed", raw: data });
    }

    const formats = resData.formats || [];
    let selectedFormat = formats.find((f) => f.quality === "360p");

    if (!selectedFormat) {
      selectedFormat = formats.find(
        (f) => f.acodec && f.acodec !== "none"
      );
    }

    if (!selectedFormat) {
      return res.status(404).json({ error: "No suitable video format with audio found" });
    }

    res.setHeader("Content-Type", "application/json");
    res.json({
      title: resData.title,
      duration: resData.duration,
      thumbnail: resData.thumbnail,
      quality: selectedFormat.quality,
      downloadUrl: selectedFormat.url,
      ext: selectedFormat.ext
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});