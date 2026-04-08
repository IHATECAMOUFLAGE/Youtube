import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.get("/api/fetch", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing ?url=" });
  }

  try {
    const response = await fetch(targetUrl);
    const text = await response.text();

    res.status(200).json({
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: text
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch URL", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
