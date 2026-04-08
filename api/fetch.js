import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.get("/api/fetch", async (req, res) => {
  try {
    const analyticsRes = await fetch("https://downr.org/.netlify/functions/analytics");

    const cookie = analyticsRes.headers.get("set-cookie");

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      cookieReceived: cookie
    });

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
