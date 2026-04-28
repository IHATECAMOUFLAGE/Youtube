import { v4 as uuid } from "uuid";

const streams = new Map();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: "Missing url" });

    const id = uuid();
    streams.set(id, url);

    return res.json({ stream: `/api/stream?id=${id}` });
  }

  const id = req.query.id;
  const target = streams.get(id);

  if (!target) return res.status(404).send("Invalid stream id");

  try {
    const upstream = await fetch(target);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "video/mp4");
    upstream.body.pipe(res);
  } catch (err) {
    res.status(500).send("Stream failed");
  }
}