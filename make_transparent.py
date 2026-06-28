from PIL import Image
import numpy as np

def remove_green(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    
    # Extract channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Identify bright green (chroma key)
    # The background is very green. So G is high, R and B are lower.
    mask = (g > 150) & (r < 100) & (b < 100)
    
    # Set alpha to 0 for green pixels
    data[mask, 3] = 0
    
    # Save image
    Image.fromarray(data).save(output_path)
    print("Done")

remove_green("public/scooter-raw.png", "public/scooter-transparent.png")
