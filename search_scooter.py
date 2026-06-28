import urllib.request
import json
import ssl
import urllib.parse

ssl._create_default_https_context = ssl._create_unverified_context

def search_wikimedia(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch={urllib.parse.quote(query)}&gsrlimit=10&prop=imageinfo&iiprop=url"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for page_id, page_data in pages.items():
                imageinfo = page_data.get('imageinfo', [{}])[0]
                img_url = imageinfo.get('url')
                title = page_data.get('title')
                print(f"URL: {img_url}")
    except Exception as e:
        print(f"Error: {e}")

search_wikimedia("food delivery scooter")
search_wikimedia("delivery van")
