import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://html.duckduckgo.com/html/?q=delivery+scooter+side+view+realistic+filetype:png"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = re.findall(r'href="([^"]+\.png[^"]*)"', html)
    print("Found links:")
    for link in links[:10]:
        print(link)
except Exception as e:
    print(e)
