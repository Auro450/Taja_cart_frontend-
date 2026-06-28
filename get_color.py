from PIL import Image
img = Image.open("public/scooter-raw.png").convert("RGB")
# Get pixel at 10,10 (should be background)
r, g, b = img.getpixel((10, 10))
print(f"#{r:02x}{g:02x}{b:02x}")
