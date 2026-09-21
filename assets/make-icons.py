"""Generate the pixel chip icon set from one 16x16 source grid.

Run from the project root:  python assets/make-icons.py
"""
import os

from PIL import Image, ImageDraw

NAVY = (10, 14, 39, 255)
CYAN = (61, 232, 196, 255)
GOLD = (255, 211, 77, 255)

HERE = os.path.dirname(os.path.abspath(__file__))

base = Image.new("RGBA", (16, 16), NAVY)
d = ImageDraw.Draw(base)

# chip package
d.rectangle([2, 2, 13, 13], fill=CYAN)
d.rectangle([4, 4, 11, 11], fill=NAVY)
d.rectangle([6, 6, 9, 9], fill=GOLD)

# four pins
for x, y in [(7, 0), (7, 14), (0, 7), (14, 7)]:
    d.rectangle([x, y, x + 1, y + 1], fill=CYAN)

TARGETS = [
    (180, "apple-touch-icon.png"),
    (192, "icon-192.png"),
    (512, "icon-512.png"),
]

for size, name in TARGETS:
    img = base.resize((size, size), Image.NEAREST)
    img.save(os.path.join(HERE, name))
    print("wrote", name, size)

print("done")
