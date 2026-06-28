import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://html.duckduckgo.com/html/?q=grocery+delivery+scooter+site:unsplash.com"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        links = re.findall(r'href="https://unsplash\.com/photos/([^"]+)"', html)
        if links:
            for link in links:
                print(f"https://images.unsplash.com/photo-{link}?auto=format&fit=crop&w=800")
        else:
            print("No Unsplash links found.")
except Exception as e:
    print(e)
