import { Innertube, UniversalCache } from "youtubei.js";
import { HttpsProxyAgent } from "https-proxy-agent";

const PROXY_POOL = [
  "http://116.80.65.77:3172",
  "http://45.136.131.59:8444",
  "http://122.3.121.231:8082",
  "http://181.78.203.148:999",
  "http://45.177.16.132:999",
  "http://103.31.135.214:8181",
  "http://114.9.55.102:1111",
  "http://190.15.194.72:8080",
  "http://65.21.201.149:8080",
  "http://38.156.73.61:8080",
  "http://113.192.30.243:1111",
  "http://103.189.223.35:8080",
  "http://175.111.96.157:3128",
  "http://103.134.246.42:3172",
  "http://38.145.208.220:8448",
  "http://193.38.224.169:8081",
  "http://27.147.137.234:9108",
  "http://129.205.198.122:8080",
  "http://200.92.201.126:999",
  "http://103.187.162.75:8085",
  "http://94.72.57.157:8080",
  "http://64.227.76.27:1080",
  "http://38.65.174.107:999",
  "http://209.38.154.7:1080",
  "http://14.232.228.80:8080",
  "http://103.132.52.196:8080",
  "http://38.145.208.211:8453",
  "http://38.34.179.53:8451",
  "http://38.158.83.233:999",
  "http://8.219.97.248:80",
  "http://38.145.220.173:8444",
  "http://103.174.122.203:8080",
  "http://150.107.140.238:3128",
  "http://159.223.71.162:8080",
  "http://38.145.218.234:8447",
  "http://103.155.196.153:8080",
  "http://150.241.71.15:1080",
  "http://210.223.44.230:3128",
  "http://5.161.50.82:8118",
  "http://51.79.135.131:8080",
  "http://34.101.184.164:3128",
  "http://45.136.130.188:8449",
  "http://20.24.43.214:80",
  "http://200.174.198.32:8888",
  "http://113.160.132.26:8080",
  "http://167.71.196.28:8080",
  "http://38.34.179.69:8447",
  "http://180.250.219.58:53281",
  "http://45.12.151.226:2829",
  "http://86.53.183.16:1080",
  "http://35.225.22.61:80",
  "http://109.135.16.145:8789",
  "http://185.118.51.230:3128",
  "http://116.80.95.238:7777",
  "http://91.233.223.147:3128",
  "http://116.80.96.101:3172",
  "http://62.113.119.14:8080",
  "http://103.133.25.247:8080",
  "http://212.108.115.39:8080",
  "http://36.37.155.160:8080",
  "http://38.156.72.10:8080",
  "http://158.160.215.167:8123",
  "http://147.45.186.28:3128",
  "http://89.208.106.138:10808",
  "http://122.54.119.79:8080",
  "http://138.197.68.35:4857",
  "http://116.80.65.76:3172",
  "http://37.187.109.70:10111",
  "http://38.145.220.49:8444",
  "http://38.34.179.181:8447",
  "http://203.205.33.131:1452",
  "http://195.133.44.205:7777",
  "http://185.114.73.2:1080",
  "http://181.78.74.163:999",
  "http://113.192.31.199:8080",
  "http://45.136.131.35:8452",
  "http://45.136.131.29:8452",
  "http://46.175.148.17:2040",
  "http://47.238.203.170:50000",
  "http://24.152.59.110:999",
  "http://38.34.179.179:8449",
  "http://49.156.22.177:8082",
  "http://185.228.137.178:3128",
  "http://38.34.179.186:8444",
  "http://182.53.202.208:8080",
  "http://45.136.130.193:8447",
  "http://38.34.183.13:8449",
  "http://38.34.179.39:8452",
  "http://38.34.179.56:8450",
  "http://38.145.203.98:8446",
  "http://38.145.208.174:8444",
  "http://34.96.238.40:8080",
  "http://38.145.218.217:8450",
  "http://38.145.220.72:8445",
  "http://45.136.131.28:8449",
  "http://38.145.220.175:8449",
  "http://45.136.130.178:8453",
  "http://38.34.179.18:8451",
  "http://38.145.203.39:8445"
];

const CLIENTS = ["ANDROID", "ANDROID_EMBEDDED", "WEB_REMIX", "TV_EMBEDDED"];

const getRandomProxy = () => {
  const proxy = PROXY_POOL[Math.floor(Math.random() * PROXY_POOL.length)];
  return new HttpsProxyAgent(proxy);
};

async function tryInvidious(id) {
  try {
    const r = await fetch(`https://yewtu.be/api/v1/videos/${id}`);
    if (!r.ok) return null;
    const j = await r.json();
    if (!j.formatStreams) return null;
    return {
      title: j.title,
      author: j.author,
      thumbnail: j.videoThumbnails?.[0]?.url || null,
      duration: j.lengthSeconds,
      streamUrl: j.formatStreams?.[0]?.url || null,
      quality: j.formatStreams?.[0]?.quality || "unknown"
    };
  } catch {
    return null;
  }
}

async function tryPiped(id) {
  try {
    const r = await fetch(`https://pipedapi.kavin.rocks/streams/${id}`);
    if (!r.ok) return null;
    const j = await r.json();
    if (!j.videoStreams) return null;
    return {
      title: j.title,
      author: j.uploader,
      thumbnail: j.thumbnailUrl,
      duration: j.duration,
      streamUrl: j.videoStreams?.[0]?.url || null,
      quality: j.videoStreams?.[0]?.quality || "unknown"
    };
  } catch {
    return null;
  }
}

async function tryNewPipe(id) {
  try {
    const r = await fetch(`https://newpipeapi.org/api/v1/video/${id}`);
    if (!r.ok) return null;
    const j = await r.json();
    if (!j.videoStreams) return null;
    return {
      title: j.title,
      author: j.uploader,
      thumbnail: j.thumbnail,
      duration: j.duration,
      streamUrl: j.videoStreams?.[0]?.url || null,
      quality: j.videoStreams?.[0]?.quality || "unknown"
    };
  } catch {
    return null;
  }
}

async function tryInnertube(client, id) {
  try {
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      client,
      request_options: { agent: getRandomProxy(), timeout: 8000 }
    });
    const info = await yt.getInfo(id);
    if (!info.streaming_data) return null;
    let best = info.streaming_data.adaptive_formats
      .filter(f => f.mime_type.includes("video/mp4"))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
    if (!best) best = info.streaming_data.adaptive_formats[0];
    return {
      title: info.basic_info.title,
      author: info.basic_info.author,
      thumbnail: info.basic_info.thumbnail[0].url,
      duration: info.basic_info.duration,
      streamUrl: best?.url || null,
      quality: best?.quality_label || "unknown"
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", true);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing \"id\" query parameter" });

  const inv = await tryInvidious(id);
  if (inv) return res.status(200).json(inv);

  const pip = await tryPiped(id);
  if (pip) return res.status(200).json(pip);

  const np = await tryNewPipe(id);
  if (np) return res.status(200).json(np);

  for (const client of CLIENTS) {
    const it = await tryInnertube(client, id);
    if (it) return res.status(200).json(it);
  }

  res.status(500).json({ error: "All sources failed" });
}
