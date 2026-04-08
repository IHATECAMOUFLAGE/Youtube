import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(express.json());

// POST /api/fetch  with body: { "url": "https://example.com" }
app.post("/api/fetch", async (req, res) => {
  const targetUrl = req.body.url;

  if (!targetUrl) {
    return res.status(400).json({ error: "Missing 'url' in JSON body" });
  }

  try {
    const analyticsRes = await fetch("https://downr.org/.netlify/functions/analytics");
    const analyticsHeaders = analyticsRes.headers;
    const setCookie = analyticsHeaders.get("set-cookie");

    const forwardHeaders = {
      "Content-Type": "application/json"
    };

    if (setCookie) {
      forwardHeaders["Cookie"] = setCookie;
    }

    const nytRes = await fetch("https://downr.org/.netlify/functions/nyt", {
      method: "POST",
      headers: forwardHeaders,
      body: JSON.stringify({ url: targetUrl })
    });

    const body = await nytRes.text();

    res.status(nytRes.status).json({
      status: nytRes.status,
      headers: Object.fromEntries(nytRes.headers.entries()),
      body
    });

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch",
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
