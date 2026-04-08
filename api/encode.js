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
    const upstream = await fetch(target);

    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Content-Length", upstream.headers.get("content-length") || "");

    upstream.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Stream failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`encode.js running on ${PORT}`);
});
