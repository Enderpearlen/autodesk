"""Knipt een lange schermafbeelding in stukken om beter te kunnen bekijken."""
import sys
from PIL import Image
src, h = sys.argv[1], int(sys.argv[2])
im = Image.open(src)
n = 0
for y in range(0, im.height, h):
    im.crop((0, y, im.width, min(y + h, im.height))).save(src.replace('.png', f'-{n:02d}.png'))
    n += 1
print(n)
