async function fetchFromDownr(videoUrl) {
  const response = await fetch("https://downr.org/.netlify/functions/nyt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "https://downr.org"
    },
    body: JSON.stringify({ url: videoUrl })
  });

  if (!response.ok) {
    throw new Error("Downr backend returned an error");
  }

  return response.json();
}
