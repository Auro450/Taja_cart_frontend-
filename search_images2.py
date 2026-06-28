import urllib.request
import json
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

def search_unsplash(query):
    # Unsplash frontend search API (undocumented but works without key sometimes)
    url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(query)}&per_page=5"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            for photo in data.get('results', []):
                print(f"Desc: {photo.get('alt_description')}")
                print(f"URL: {photo.get('urls', {}).get('regular')}\n")
    except Exception as e:
        print(f"Error: {e}")

import urllib.parse
search_unsplash("grocery delivery")
search_unsplash("food delivery scooter")
