export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).send("Missing url");
    return;
  }

  const response = await fetch("http://localhost:3000/api/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: target })
  });

  const data = await response.json();
  const streamUrl = data.stream;

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
        <video controls autoplay style="width:100%;height:auto;max-height:100vh;">
          <source src="${streamUrl}" type="video/mp4">
        </video>
      </body>
    </html>
  `);
}
