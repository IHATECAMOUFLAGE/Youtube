import puppeteer from "puppeteer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing "url" query parameter' });

  try {
    const browser = await puppeteer.launch({
      headless: "new"
    });

    const page = await browser.newPage();

    await page.goto("https://downr.org", {
      waitUntil: "networkidle2"
    });

    const result = await page.evaluate(async (targetUrl) => {
      const response = await fetch("https://downr.org/.netlify/functions/nyt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: targetUrl })
      });

      return await response.json();
    }, url);

    await browser.close();

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
}
