import express from "express";
import fetch from "node-fetch";
import { Innertube } from "youtubei.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Innertube for YouTube searching
let innertubePromise;

function getInnertube() {
  if (!innertubePromise) {
    innertubePromise = Innertube.create();
  }
  return innertubePromise;
}

// Helper function to extract direct video data via AceThinker
async function extractVideoData(targetUrl) {
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
    throw new Error("Failed to fetch from extraction API");
  }

  const data = await apiRes.json();
  const resData = data?.res_data;

  if (!resData || resData.message !== "success") {
    throw new Error("Video not found or extraction failed");
  }

  const formats = resData.formats || [];
  let selectedFormat = formats.find((f) => f.quality === "360p");

  if (!selectedFormat) {
    selectedFormat = formats.find((f) => f.acodec && f.acodec !== "none");
  }

  if (!selectedFormat) {
    throw new Error("No suitable video format with audio found");
  }

  return {
    title: resData.title,
    duration: resData.duration,
    thumbnail: resData.thumbnail,
    quality: selectedFormat.quality,
    downloadUrl: selectedFormat.url,
    ext: selectedFormat.ext
  };
}

// 1. YouTube Search Endpoint
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

// 2. AceThinker Video JSON Fetch Endpoint
app.get("/api/fetch", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing ?url= parameter" });
    }

    const videoData = await extractVideoData(targetUrl);
    res.setHeader("Content-Type", "application/json");
    res.json(videoData);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 3. Direct Video Stream/Proxy Endpoint (/api/stream?url=...)
app.get("/api/stream", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing ?url= parameter" });
    }

    const videoData = await extractVideoData(targetUrl);

    // Fetch the direct video stream from the target CDN
    const mediaRes = await fetch(videoData.downloadUrl, {
      headers: {
        // Pass range header forward if present to support seeking/partial content streaming
        ...(req.headers.range ? { Range: req.headers.range } : {}),
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!mediaRes.ok && mediaRes.status !== 206) {
      return res.status(502).json({ error: "Failed to stream media content from source" });
    }

    // Forward relevant headers from the media source
    res.status(mediaRes.status);
    res.setHeader("Content-Type", mediaRes.headers.get("content-type") || `video/${videoData.ext || 'mp4'}`);
    
    if (mediaRes.headers.get("content-length")) {
      res.setHeader("Content-Length", mediaRes.headers.get("content-length"));
    }
    if (mediaRes.headers.get("content-range")) {
      res.setHeader("Content-Range", mediaRes.headers.get("content-range"));
    }
    res.setHeader("Accept-Ranges", "bytes");

    // Pipe the remote media stream directly into the Express response
    mediaRes.body.pipe(res);
  } catch (err) {
    console.error("Stream error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});