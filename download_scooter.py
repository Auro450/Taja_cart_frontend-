import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://html.duckduckgo.com/html/?q=delivery+scooter+with+box+on+back+photo"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        # Find image urls
        images = re.findall(r'src="(//external-content.duckduckgo.com/iu/\?u=[^"]+)"', html)
        if images:
            img_url = "https:" + images[0].replace("&amp;", "&")
            print("Downloading:", img_url)
            # Save it to public folder
            urllib.request.urlretrieve(img_url, "/Users/macofdevil/Taaja_cart/public/delivery-scooter.jpg")
            print("Saved as delivery-scooter.jpg")
        else:
            print("No images found")
except Exception as e:
    print(e)
