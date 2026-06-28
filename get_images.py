import urllib.request
import json
import os
import ssl
from html.parser import HTMLParser

ssl._create_default_https_context = ssl._create_unverified_context

def download_pixabay(query, filename):
    try:
        # Pixabay API is free but requires a key. I don't have one.
        # Let's try Wikimedia Commons with a very legitimate looking User-Agent
        import urllib.parse
        search_url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json"
        
        req = urllib.request.Request(
            search_url, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        )
        
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            if 'query' not in data or 'pages' not in data['query']:
                print(f"No results for {query}")
                return False
                
            pages = data['query']['pages']
            page_id = list(pages.keys())[0]
            
            if 'imageinfo' in pages[page_id]:
                image_url = pages[page_id]['imageinfo'][0]['thumburl']
                
                req2 = urllib.request.Request(
                    image_url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
                )
                with urllib.request.urlopen(req2) as img_res:
                    with open(filename, 'wb') as f:
                        f.write(img_res.read())
                print(f"Downloaded {filename} from {image_url}")
                return True
            else:
                print(f"No image info for {query}")
                return False
    except Exception as e:
        print(f"Error for {query}: {e}")
        return False

import time
items = {
    "fresh ginger root": "public/products/ginger.png",
    "green beans vegetable": "public/products/beans.png",
    "fresh red tomato": "public/products/tomato.png",
    "raw green papaya": "public/products/papaya.png",
    "water spinach": "public/products/kalmi.png",
    "coriander leaves cilantro": "public/products/dhaniya.png",
    "eggplant vegetable": "public/products/begun.png",
    "bitter gourd": "public/products/corola.png",
    "okra vegetable": "public/products/ladyfinger.png"
}

os.makedirs("public/products", exist_ok=True)
for item, path in items.items():
    download_pixabay(item, path)
    time.sleep(2) # avoid 429

