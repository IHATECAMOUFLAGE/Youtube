app.get("/api/encode/stream", async (req, res) => {
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

    const status = upstream.status;
    const contentType = upstream.headers.get("content-type") || "video/mp4";
    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");
    const acceptRanges = upstream.headers.get("accept-ranges");

    res.status(status);
    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    if (contentRange) res.setHeader("Content-Range", contentRange);
    if (acceptRanges) res.setHeader("Accept-Ranges", acceptRanges);

    upstream.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Stream failed", details: err.message });
  }
});
