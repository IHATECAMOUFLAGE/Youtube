import fetch from "node-fetch";

async function main() {
  try {
    const url1 = "https://downr.org/.netlify/functions/analytics";
    const res1 = await fetch(url1);

    const headers1 = res1.headers;
    const setCookie = headers1.get("set-cookie");

    console.log("First response cookie:", setCookie);

    const newHeaders = {
      "Cookie": setCookie || "",
      "Origin": "https://downr.org",
      "Referer": "https://downr.org",
      "url": "https://www.youtube.com/watch?v=wPeUb2SVmEc"
    };

    const url2 = "https://downr.org/.netlify/functions/nyt";
    const res2 = await fetch(url2, {
      method: "GET",
      headers: newHeaders
    });

    const body2 = await res2.text();

    console.log("Second response status:", res2.status);
    console.log("Second response body:", body2);

  } catch (err) {
    console.error("Error:", err);
  }
}

main();
