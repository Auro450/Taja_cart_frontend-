from PIL import Image
from collections import Counter
img = Image.open("public/scooter-raw.png").convert("RGB")
colors = img.getdata()
common_color = Counter(colors).most_common(1)[0][0]
print(f"#{common_color[0]:02x}{common_color[1]:02x}{common_color[2]:02x}")
