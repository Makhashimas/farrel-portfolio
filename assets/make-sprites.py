#!/usr/bin/env python3
"""FARREL.OS pixel sprite generator.

Hand-drawn ASCII sprites + programmatic shapes -> compact SVGs
(one rect per horizontal run, crispEdges). Also renders a preview sheet.

Run:  python assets/make-sprites.py
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'art')
os.makedirs(OUT, exist_ok=True)

PAL = {
    'O': '#0b0f24',  # ink outline
    'K': '#0b0f24',  # ink
    'S': '#f2e9d8',  # bone
    's': '#cdbfa4',  # bone shade
    'N': '#2a2a33',  # nose / dark hollow
    'H': '#1c1917',  # hat black
    'h': '#3a322d',  # hat highlight
    'B': '#141210',  # black plastic
    'b': '#4a3a2e',  # dark wood
    'G': '#ffd34d',  # gold
    'g': '#b8912a',  # gold dim
    'R': '#d32f2f',  # red
    'r': '#8f1d1d',  # red dim
    'W': '#f5e7cd',  # cream
    'w': '#b39b73',  # cream dim
    'A': '#9aa0b4',  # steel
    'a': '#5b6070',  # steel dim
    'C': '#e8e9ee',  # cassette cream
    'c': '#a9adbd',  # cassette shade
    'L': '#d8dae2',  # string
    'V': '#17151c',  # vinyl black
    'v': '#2b2833',  # vinyl groove
}


class Grid:
    def __init__(self, w, h):
        self.w, self.h, self.g = w, h, {}

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.g[(int(x), int(y))] = c

    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.px(x, y, c)

    def disc(self, cx, cy, r, c):
        R = int(math.ceil(r))
        for y in range(int(cy - R), int(cy + R) + 1):
            for x in range(int(cx - R), int(cx + R) + 1):
                if math.hypot(x - cx, y - cy) <= r:
                    self.px(x, y, c)

    def ring(self, cx, cy, r0, r1, c):
        R = int(math.ceil(r1))
        for y in range(int(cy - R), int(cy + R) + 1):
            for x in range(int(cx - R), int(cx + R) + 1):
                if r0 <= math.hypot(x - cx, y - cy) <= r1:
                    self.px(x, y, c)

    def rows(self):
        out = []
        for y in range(self.h):
            out.append(''.join(self.g.get((x, y), '.') for x in range(self.w)))
        return out


def from_ascii(rows):
    w = max(len(r) for r in rows)
    g = Grid(w, len(rows))
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != '.':
                g.px(x, y, ch)
    return g


def outline(g, c='O'):
    """1px ink outline around the silhouette (4-neighbour)."""
    add = {}
    for (x, y) in list(g.g.keys()):
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if (nx, ny) not in g.g and 0 <= nx < g.w and 0 <= ny < g.h:
                add[(nx, ny)] = c
    for k, v in add.items():
        g.g[k] = v
    return g


def to_svg(g, name):
    """Run-length merge per row -> compact SVG."""
    parts = []
    for y in range(g.h):
        x = 0
        while x < g.w:
            ch = g.g.get((x, y))
            if ch is None:
                x += 1
                continue
            run = 1
            while x + run < g.w and g.g.get((x + run, y)) == ch:
                run += 1
            parts.append('<rect x="%d" y="%d" width="%d" height="1" fill="%s"/>'
                         % (x, y, run, PAL[ch]))
            x += run
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
           'shape-rendering="crispEdges" aria-hidden="true" focusable="false">%s</svg>'
           % (g.w, g.h, ''.join(parts)))
    path = os.path.join(OUT, 'px-%s.svg' % name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    return path


# ------------------------------------------------------------------
# hand-drawn sprites
# ------------------------------------------------------------------
SKULL = [
    "....HHHHHHHHHH......",
    "....HHHHHHHHHH......",
    "....hHHHHHHHHh......",
    "....HHHHHHHHHH......",
    "....GGGGGGGGGG......",
    "...BBBBBBBBBBBB.....",
    "....SSSSSSSSSS......",
    "...SSSSSSSSSSSS.....",
    "..SSSSSSSSSSSSSS....",
    "..SGGGGGGGGGGGGS....",
    "..SKKKKKKKKKKKKS....",
    "..SSSSSSSSSSSSSS....",
    "..SSSSSNNNNSSSSS....",
    "..SSSSSNNNNSSSSS....",
    "...SSSSSSSSSSSS.....",
    "....SKKKKKKKKS......",
    "....SKSKSKSKSK......",
    ".....SSSSSSSS.......",
    "......SSSSSS........",
]

GUITAR = [
    "......KKKK..........",
    ".....KKKKKK.........",
    ".....KAKKAK.........",
    ".....KKKKKK.........",
    "......bbbb..........",
    "......bLLb..........",
    "......bLLb..........",
    "......bLLb..........",
    "......bLLb..........",
    "......bLLb..........",
    "......bLLb..........",
    "......bLLb..........",
    "......bLLb..........",
    ".....GGGGGG.........",
    "....GGGGGGGG........",
    "...GGGGGGGGGGG......",
    "..GGGGGGGGGGGGGG....",
    "..GGGGGGGGGGGGGGG...",
    "..GGGGKKKKKKGGGGGG..",
    "..GGGGKKKKKKGGGGGG..",
    "..GGGGGGGGGGGGGGGG..",
    "..GGGGKKKKKKGGGGGG..",
    "..GGGGKKKKKKGGGGGG..",
    "..GGGGGGGGGGGGGGGG..",
    "..GGGGGGGGGGGGAAAG..",
    "..GGGGGGGGGGGGGGGG..",
    "...GGGGGGGGGGGGGG...",
    "....GGGGGGGGGGGG....",
    "......GGGGGGGG......",
]

HAT = [
    "...HHHHHHHHHH...",
    "..HHHHHHHHHHHH..",
    "..HhHHHHHHHHHh..",
    "..HHHHHHHHHHHH..",
    "..GGGGGGGGGGGG..",
    ".BBBBBBBBBBBBBB.",
    "BBBBBBBBBBBBBBBB",
    "BBBBBBBBBBBBBBBB",
]


def build_cross():
    W, H, cx = 25, 33, 12
    ay0, ay1 = 8, 14
    sx0, sx1 = 9, 15
    g = Grid(W, H)
    for y in range(H):
        for x in range(W):
            in_cross = (sx0 <= x <= sx1) or (ay0 <= y <= ay1)
            d = math.hypot(x - cx, y - (ay0 + ay1) / 2)
            in_ring = 8.0 <= d <= 11.5
            if in_cross or in_ring:
                g.px(x, y, 'r' if ((x + y) % 4) < 2 else 'G')
    for y in range(H):
        for x in range(W):
            d = math.hypot(x - cx, y - 11)
            if d <= 2.4:
                g.px(x, y, 'K')
            elif d <= 3.6 and (x, y) in g.g:
                g.px(x, y, 'R')
    return g


def build_emblem():
    W = H = 27
    c = 13
    g = Grid(W, H)
    g.ring(c, c, 10.4, 12.6, 'G')
    for rx, ry in ((13, 1), (13, 25), (1, 13), (25, 13)):
        g.px(rx, ry, 'R')
    letters = {
        'G': [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
        'N': ["#...#", "##..#", "##..#", "#.#.#", "#..##", "#...#", "#...#"],
        'R': ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    }
    for i, ch in enumerate('GNR'):
        pat = letters[ch]
        x0 = 4 + i * 7
        for y, row in enumerate(pat):
            for x, p in enumerate(row):
                if p == '#':
                    g.px(x0 + x, 10 + y, 'W')
    return g


def build_amp():
    W, H = 22, 30
    g = Grid(W, H)
    # head
    g.rect(2, 0, 19, 6, 'B')
    g.rect(2, 0, 19, 0, 'b')
    g.rect(3, 2, 18, 2, 'g')
    for kx in (4, 7, 10, 13, 16):
        g.px(kx, 4, 'G')
        g.px(kx + 1, 4, 'G')
    # cabs
    for y0 in (9, 20):
        g.rect(1, y0, 20, y0 + 8, 'B')
        g.rect(1, y0, 20, y0, 'b')
        for y in range(y0 + 2, y0 + 7):
            for x in range(3, 19):
                g.px(x, y, 'g' if (x + y) % 2 == 0 else 'w')
        g.rect(3, y0 + 1, 18, y0 + 1, 'G')
    return g


def build_drums():
    W, H = 28, 22
    g = Grid(W, H)
    # hi-hat stand + cymbal (left)
    g.rect(2, 3, 2, 20, 'a')
    g.rect(0, 3, 6, 3, 'G')
    g.rect(1, 4, 5, 4, 'g')
    # crash stand + cymbal (right)
    g.rect(26, 2, 26, 20, 'a')
    g.rect(23, 0, 27, 0, 'G')
    g.rect(24, 1, 27, 1, 'g')
    # kick drum
    g.disc(11, 13, 7.6, 'R')
    g.disc(11, 13, 6.0, 'W')
    g.disc(11, 13, 1.4, 'K')
    g.ring(11, 13, 7.0, 7.6, 'r')
    # snare
    g.disc(20, 8, 3.6, 'R')
    g.rect(17, 5, 23, 5, 'W')
    return g


def build_vinyl():
    W = H = 20
    c = 9.5
    g = Grid(W, H)
    g.disc(c, c, 8.6, 'V')
    g.ring(c, c, 7.0, 7.4, 'v')
    g.ring(c, c, 5.4, 5.8, 'v')
    g.ring(c, c, 3.9, 4.3, 'v')
    g.disc(c, c, 2.8, 'G')
    g.disc(c, c, 0.8, 'K')
    # sheen on the upper-left
    for y in range(H):
        for x in range(W):
            d = math.hypot(x - c, y - c)
            ang = math.degrees(math.atan2(y - c, x - c))
            if 4.5 <= d <= 8.2 and 190 <= ang <= 245:
                g.px(x, y, 'a')
    return g


def build_reel():
    W = H = 14
    c = 6.5
    g = Grid(W, H)
    g.disc(c, c, 6.2, 'C')
    g.ring(c, c, 2.8, 3.4, 'c')
    g.disc(c, c, 1.5, 'K')
    for i, ang in enumerate((0, 90, 180, 270)):
        rx = c + 4.6 * math.cos(math.radians(ang))
        ry = c + 4.6 * math.sin(math.radians(ang))
        # one gold spoke so the spin is visible at 90-degree steps
        g.disc(rx, ry, 1.15, 'G' if i == 0 else 'K')
    return g


def build_screw():
    W = H = 7
    g = Grid(W, H)
    g.disc(3, 3, 3.2, 'A')
    g.rect(3, 1, 3, 5, 'K')
    g.rect(1, 3, 5, 3, 'K')
    g.px(1, 1, 'W')
    g.px(1, 2, 'W')
    return g


def build_jack():
    W = H = 11
    g = Grid(W, H)
    g.disc(5, 5, 5.2, 'A')
    g.disc(5, 5, 2.4, 'K')
    g.px(5, 1, 'W')
    g.px(4, 1, 'W')
    return g


def build_icons():
    out = {}
    for name, flip in (('prev', False), ('next', True)):
        g = Grid(12, 12)
        for t0 in (0, 5):
            for i, (ya, yb) in enumerate(((5, 6), (4, 7), (3, 8), (2, 9), (1, 10))):
                x = t0 + 1 + i
                if flip:
                    x = 11 - x
                g.rect(x, ya, x, yb, 'K')
        out[name] = g
    g = Grid(12, 12)
    g.rect(3, 3, 8, 8, 'K')
    out['stop'] = g
    return out


SPRITES = {
    'skull': outline(from_ascii(SKULL)),
    'guitar': outline(from_ascii(GUITAR)),
    'hat': outline(from_ascii(HAT)),
    'cross': outline(build_cross()),
    'emblem': outline(build_emblem()),
    'amp': outline(build_amp()),
    'drums': outline(build_drums()),
    'vinyl': outline(build_vinyl()),
    'reel': build_reel(),
    'screw': build_screw(),
    'jack': build_jack(),
}

for k, v in build_icons().items():
    SPRITES[k] = v


def preview():
    names = list(SPRITES.keys())
    cols, cell, scale = 5, 150, 7
    rows = (len(names) + cols - 1) // cols
    img = Image.new('RGB', (cols * cell, rows * cell), (107, 114, 128))
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    for i, name in enumerate(names):
        g = SPRITES[name]
        px = (i % cols) * cell + (cell - g.w * scale) // 2
        py = (i // cols) * cell + 16
        for (x, y), ch in g.g.items():
            col = PAL[ch]
            col = tuple(int(col[j:j + 2], 16) for j in (1, 3, 5))
            d.rectangle([px + x * scale, py + y * scale,
                         px + (x + 1) * scale - 1, py + (y + 1) * scale - 1], fill=col)
        d.text((8, (i // cols) * cell + 2), '%d %s' % (i, name), fill=(20, 20, 20), font=font)
    img.save(os.path.join(HERE, '_sprites_preview.png'))
    print('preview written')


if __name__ == '__main__':
    for k, v in SPRITES.items():
        p = to_svg(v, k)
        print('%-8s %2dx%-2d -> %s' % (k, v.w, v.h, os.path.basename(p)))
    preview()
