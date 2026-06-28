import urllib.request
import json
import ssl
import urllib.parse

ssl._create_default_https_context = ssl._create_unverified_context

def search_wikimedia(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch={urllib.parse.quote(query)}&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for page_id, page_data in pages.items():
                imageinfo = page_data.get('imageinfo', [{}])[0]
                img_url = imageinfo.get('url')
                meta = imageinfo.get('extmetadata', {})
                desc = meta.get('ImageDescription', {}).get('value', '').lower()
                if 'side' in desc or 'profile' in desc:
                    print(f"URL: {img_url}\nDesc: {desc}\n")
    except Exception as e:
        print(f"Error: {e}")

search_wikimedia("delivery scooter")
search_wikimedia("delivery moped")
