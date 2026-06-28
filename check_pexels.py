import urllib.request
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    print(f"Status: {response.status}")
except Exception as e:
    print(f"Error: {e}")
