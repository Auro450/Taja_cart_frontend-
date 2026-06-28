import urllib.request
import json
import ssl
import urllib.parse

ssl._create_default_https_context = ssl._create_unverified_context

def search_wikimedia(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch={urllib.parse.quote(query)}&gsrlimit=5&prop=imageinfo&iiprop=url|extmetadata"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for page_id, page_data in pages.items():
                imageinfo = page_data.get('imageinfo', [{}])[0]
                title = page_data.get('title')
                img_url = imageinfo.get('url')
                meta = imageinfo.get('extmetadata', {})
                desc = meta.get('ImageDescription', {}).get('value', 'No desc')
                print(f"Title: {title}\nDesc: {desc}\nURL: {img_url}\n")
    except Exception as e:
        print(f"Error: {e}")

search_wikimedia("delivery scooter profile")
search_wikimedia("delivery scooter side")
