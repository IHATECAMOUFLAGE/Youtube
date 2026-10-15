import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.get("/api/fetch", async (req, res) => {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      res.status(400).json({ error: "Missing ?url= parameter" });
      return;
    }

    // Construct the AceThinker API URL
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
      res.status(apiRes.status).json({ error: "Failed to fetch from API" });
      return;
    }

    const data = await apiRes.json();
    const resData = data?.res_data;

    if (!resData || resData.message !== "success") {
      res.status(404).json({ error: "Video not found or extraction failed", raw: data });
      return;
    }

    // Locate the 360p format (which includes combined audio & video)
    const formats = resData.formats || [];
    let selectedFormat = formats.find((f) => f.quality === "360p");

    // Fallback: If 360p isn't found, find the first format that has an audio codec
    if (!selectedFormat) {
      selectedFormat = formats.find(
        (f) => f.acodec && f.acodec !== "none"
      );
    }

    if (!selectedFormat) {
      res.status(404).json({ error: "No suitable video format with audio found" });
      return;
    }

    // Return the response with video details and direct download URL
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
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});