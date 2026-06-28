import urllib.request
import json
import os
import ssl
import time

ssl._create_default_https_context = ssl._create_unverified_context

def download_image(query, filename):
    try:
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

items = {
    "mango fruit": "public/products/mango.png",
    "watermelon slice": "public/products/watermelon.png",
    "red apple fruit": "public/products/apple.png",
    "white rice grains bowl": "public/products/rice.png",
    "wheat grains": "public/products/wheat.png",
    "sliced bread loaf": "public/products/bread.png",
    "glass of milk": "public/products/milk.png",
    "clarified butter ghee": "public/products/ghee.png",
    "block of butter": "public/products/butter.png",
    "paneer cottage cheese": "public/products/paneer.png",
    "raw whole chicken": "public/products/whole_chicken.png",
    "raw chicken meat cut": "public/products/cut_chicken.png",
    "raw mutton meat": "public/products/mutton.png",
    "raw lamb meat pieces": "public/products/cut_mutton.png",
    "rohu fish raw": "public/products/rohu.png",
    "katla fish raw": "public/products/katla.png",
    "raw prawns shrimps": "public/products/chingri.png",
    "hilsa fish ilish": "public/products/elish.png",
    "brown chicken eggs": "public/products/chicken_eggs.png",
    "duck eggs": "public/products/duck_eggs.png"
}

os.makedirs("public/products", exist_ok=True)
for item, path in items.items():
    download_image(item, path)
    time.sleep(2)
