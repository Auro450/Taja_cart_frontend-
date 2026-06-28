from PIL import Image
import numpy as np

def make_transparent(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    
    # Get top-left pixel as background color
    bg_r, bg_g, bg_b, _ = data[0, 0]
    print(f"Background color detected: {bg_r}, {bg_g}, {bg_b}")
    
    # Extract channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Tolerance
    tolerance = 20
    mask = (abs(r - bg_r) < tolerance) & (abs(g - bg_g) < tolerance) & (abs(b - bg_b) < tolerance)
    
    # Set alpha to 0 for background pixels
    data[mask, 3] = 0
    
    Image.fromarray(data).save(output_path)
    print("Done")

make_transparent("public/scooter-raw.png", "public/scooter-transparent.png")
