async function fetchFromDownr(videoUrl) {
  try {
    const response = await fetch("https://downr.org/.netlify/functions/nyt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://downr.org",
        // We add a User-Agent so the API thinks this is a standard browser request
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      body: JSON.stringify({ url: videoUrl })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Downr backend returned error: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch from Downr:", error);
    throw error;
  }
}

// Usage
fetchFromDownr("https://www.youtube.com/watch?v=DXVHmGoCTco&vl=en")
  .then(data => console.log(data))
  .catch(err => console.error(err));
