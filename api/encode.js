export default function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).send("Missing url");
    return;
  }

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html>
      <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
        <video controls autoplay style="width:100%;height:auto;max-height:100vh;">
          <source src="/api/stream?url=${target}" type="video/mp4">
        </video>
      </body>
    </html>
  `);
}
