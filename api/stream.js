import express from "express";
import { pipeline, Readable } from "stream";
import { promisify } from "util";

const app = express();
const pipe = promisify(pipeline);

app.get("/api/stream", async (req, res) => {
  const target = req.query.url;

  if (!target) {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  try {
    const range = req.headers.range || "";
    const upstream = await fetch(target, {
      headers: range ? { Range: range } : {}
    });

    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "video/mp4");

    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");
    const acceptRanges = upstream.headers.get("accept-ranges");

    if (contentLength) res.setHeader("Content-Length", contentLength);
    if (contentRange) res.setHeader("Content-Range", contentRange);
    if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);

    const nodeStream = Readable.fromWeb(upstream.body);

    await pipe(nodeStream, res);

  } catch (err) {
    console.error("Stream error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Stream failed" });
    } else {
      res.end();
    }
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Express server running on http://localhost:3000");
});
