import urllib.request, json
url = "https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=Grocery_store"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp = urllib.request.urlopen(req).read().decode('utf-8')
    data = json.loads(resp)
    pages = data['query']['pages']
    for page_id in pages:
        if 'original' in pages[page_id]:
            print(pages[page_id]['original']['source'])
except Exception as e:
    print(e)
