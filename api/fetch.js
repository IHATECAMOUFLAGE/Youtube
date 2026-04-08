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
    const analyticsRes = await fetch("https://downr.org/.netlify/functions/analytics");
    const analyticsHeaders = analyticsRes.headers;
    const setCookie = analyticsHeaders.get("set-cookie");

    const forwardHeaders = {};
    if (setCookie) forwardHeaders["Cookie"] = setCookie;

    const secondRes = await fetch(targetUrl, {
      method: "GET",
      headers: forwardHeaders
    });

    const body = await secondRes.text();

    res.status(secondRes.status).json({
      status: secondRes.status,
      headers: Object.fromEntries(secondRes.headers.entries()),
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
