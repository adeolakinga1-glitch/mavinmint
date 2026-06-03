from pathlib import Path
import pytesseract
from PIL import Image

dir_path = Path('.')
for p in sorted(dir_path.glob('IMG_*.jpg')):
    print('FILE:', p.name)
    try:
        text = pytesseract.image_to_string(Image.open(p))
        print(text)
    except Exception as e:
        print('ERROR:', e)
    print('-' * 40)
