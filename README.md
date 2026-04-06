# Infared - Alternative Youtube Frontend

This project is a custom Alternative youtube frontend built for educational and personal use.

## 🚫 Important Usage Notice

This project is **NOT open‑source** in the traditional sense.  
You are allowed to:

- Download it  
- Run it  
- Host it for yourself 
- Modify it **privately** *This means that you cannot share this said **private** version with anyone without explicit permission and credit by the author/creator*

You are **NOT allowed** to:

- Claim you created this project  
- Claim partial or complete ownership  
- Redistribute modified versions  *without permission*
- Re‑upload this project anywhere *without complete credit* (complete credit means the server name **Infared**, **original git repo**, discord ID (**_maacy_**) and author email (**ihatecamouflage@hotmail.com**))
- Use loopholes, reinterpretations, or technicalities to bypass these restrictions

Any attempt to bypass these rules — including through rewording, reframing, is explicitly forbidden.

## Permissions

If you want to modify **and** redistribute this project publicly, you **must** obtain permission from the owner.

# Allowed people able to modify & redistribute:
- DISCORD ID: **divinelordkaio**
- DISCORD SERVER'S SITE DEVELOPERS: **https://discord.gg/ryhPyrX8gt**

## Attribution

Created by the original owner.  
All rights reserved.  
Unauthorized redistribution or misrepresentation is prohibited.

## Deployment

To deploy the site, use a non static hosting service such as render, Your own VPS server, fly.io, glitch, heroku, or others to deploy.

After that, you have the website!

### Discord: **https://discord.gg/ujGFjYcuWn**

Made by Infared.


## Using the metadata API

To use the metadata API that we have, go to any of our links
Example:

`https://example.com`

and go to:

`https://example.com/api/search?query=`

infront of the `?query=` parameter, add the query for your search.

Example fetch:

```python
import requests

url = 'https://youtuliz.b-cdn.net'
API_BASE = '/api/search?query='
query = "Trending Videos"

fullurl = url + API_BASE + query

print(requests.get(fullurl).json())
```

Or alternatively in NODEJS:

```nodejs < ^18
import fetch from "node-fetch";

const url = "https://youtuliz.b-cdn.net";
const API_BASE = "/api/search?query=";
const query = "Trending Videos";

const fullurl = url + API_BASE + query;

fetch(fulurl)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error("Error:", err));
```

Or

```nodejs > ^18
const url = "https://youtuliz.b-cdn.net";
const API_BASE = "/api/search?query=";

const query = "Trending Videos";
const fullurl = url + API_BASE + query;

async function run() {
  try {
    const res = await fetch(fullurl);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
```

Or alternatively:

```javascript
const url = "https://youtuliz.b-cdn.net";
const API_BASE = "/api/search?query=";

const query = "Trending Videos";
const fullurl = url + API_BASE + encodeURIComponent(query);

fetch(fullurl)
.then(res => res.json())
.then(data => {
    console.log("API result:", data);
})
.catch(err => {
    console.error("Error:", err);
});
```

Or alternatively:

```php w/ cURL
<?php

$url = "https://youtuliz.b-cdn.net";
$API_BASE = "/api/search?query=";

$query = "Trending Videos";
$fullUrl = $url . $API_BASE . urlencode($query);

$ch = curl_init($fullUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);

if (curl_errno($ch)) {
    echo "cURL Error: " . curl_error($ch);
} else {
    header('Content-Type: application/json');
    echo $result;
}

curl_close($ch); 

?>
```

Or alternatively:

```ruby
require "net/http"
require "uri"

base = "https://youtuliz.b-cdn.net"
api = "/api/search?query="
query = URI.encode_www_form_component("Trending Videos")

url = URI.parse(base + api + query)
response = Net::HTTP.get(url)

puts response
```

Or alternatively:

```swift
import Foundation

let base = "https://youtuliz.b-cdn.net"
let api = "/api/search?query="
let query = "Trending Videos".addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!

let url = URL(string: base + api + query)!

let task = URLSession.shared.dataTask(with: url) { data, _, _ in
    if let data = data, let text = String(data: data, encoding: .utf8) {
        print(text)
    }
}

task.resume()
```
