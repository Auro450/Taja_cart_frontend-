from PIL import Image
img = Image.open("public/scooter-raw.png").convert("RGBA")
r, g, b, a = img.getpixel((10, 10))
print(f"Top-Left Pixel: rgba({r},{g},{b},{a})")
