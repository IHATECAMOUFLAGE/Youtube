import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.get("/api/encode", async (req, res) => {
  const target = req.query.url;

  if (!target) {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  if (!target.startsWith("https://")) {
    res.status(400).json({ error: "Invalid target" });
    return;
  }

  try {
    const range = req.headers.range || "";
    const upstream = await fetch(target, {
      headers: range ? { Range: range } : {}
    });

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length");
    const status = upstream.status;

    res.status(status);
    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);

    const contentRange = upstream.headers.get("content-range");
    if (contentRange) res.setHeader("Content-Range", contentRange);

    const acceptRanges = upstream.headers.get("accept-ranges");
    if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);

    upstream.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Stream failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`encode.js running on ${PORT}`);
});
