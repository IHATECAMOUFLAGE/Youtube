import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.get("/api/fetch", async (req, res) => {
  try {
    const analyticsRes = await fetch("https://downr.org/.netlify/functions/analytics");
    const cookie = analyticsRes.headers.get("set-cookie");

    const nytRes = await fetch("https://downr.org/.netlify/functions/nyt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://downr.org",
        "Referer": "https://downr.org/"
      },
      body: JSON.stringify({ url: "https://example.com" })
    });

    const body = await nytRes.text();

    res.setHeader("Content-Type", "application/json");
    res.status(nytRes.status).send(body);
  } catch (err) {
    res.status(500).json({ error: "Failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
