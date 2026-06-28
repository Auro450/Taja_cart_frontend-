import urllib.request
import json
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&titles=File:Govecs_Electric_Scooter_Delivery_Box.JPG"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        pages = data.get('query', {}).get('pages', {})
        for page_id, page_data in pages.items():
            imageinfo = page_data.get('imageinfo', [{}])[0]
            print(f"URL: {imageinfo.get('url')}")
            meta = imageinfo.get('extmetadata', {})
            desc = meta.get('ImageDescription', {}).get('value', 'No desc')
            print(f"Desc: {desc}")
except Exception as e:
    print(e)
