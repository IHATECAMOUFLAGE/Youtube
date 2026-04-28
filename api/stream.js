export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: "Missing url" });

    return res.json({
      stream: `/api/stream?url=${encodeURIComponent(url)}`
    });
  }

  const target = req.query.url;
  if (!target) return res.status(400).send("Missing url");

  try {
    const upstream = await fetch(target);

    res.setHeader("Content-Type", upstream.headers.get("content-type") || "video/mp4");

    upstream.body.pipe(res);
  } catch (err) {
    res.status(500).send("Stream failed");
  }
}
