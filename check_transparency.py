from PIL import Image
import os
for img in ['apple.png', 'tomato.png', 'pumpkin.png', 'watermelon.png']:
    path = f"public/products/{img}"
    if os.path.exists(path):
        i = Image.open(path)
        if i.mode in ('RGBA', 'LA') or (i.mode == 'P' and 'transparency' in i.info):
            print(f"{img} has transparency support")
        else:
            print(f"{img} does NOT have transparency support")
