import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://html.duckduckgo.com/html/?q=delivery+scooter+side+view+site:unsplash.com"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        links = re.findall(r'href="https://unsplash\.com/photos/([^"]+)"', html)
        for link in set(links):
            print(link)
except Exception as e:
    print(e)
