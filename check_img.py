from PIL import Image
import numpy as np

img = Image.open("public/scooter-transparent.png").convert("RGBA")
data = np.array(img)
alpha = data[:,:,3]
non_transparent = np.count_nonzero(alpha > 0)
total = alpha.size
print(f"Non-transparent pixels: {non_transparent} out of {total} ({(non_transparent/total)*100:.2f}%)")
