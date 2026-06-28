import urllib.request
import re
import ssl
import urllib.parse

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://html.duckduckgo.com/html/?q=side+view+scooter+delivery+filetype:jpg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        links = re.findall(r'(https://[^"]+\.jpg)', html)
        for link in set(links):
            if "wikimedia" in link or "flickr" in link:
                print(link)
except Exception as e:
    print(e)
