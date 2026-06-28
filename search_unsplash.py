import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://unsplash.com/s/photos/scooter-delivery"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        # Find images with alt text
        matches = re.findall(r'<img[^>]*alt="([^"]*)"[^>]*src="(https://images\.unsplash\.com/photo-[^"?]+)\?[^"]*"', html)
        for alt, src in matches:
            print(f"Alt: {alt}\nURL: {src}\n")
except Exception as e:
    print(e)
