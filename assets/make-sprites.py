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
    # night set: cyan signal + periwinkle metal
    'T': '#3de8c4',  # cyan signal
    't': '#1f8f7a',  # cyan dim
    'P': '#7aa2f7',  # periwinkle
    'p': '#46589e',  # periwinkle dim
    # sunset set: warm orange + palm green
    'Q': '#ff9a5c',  # sunset orange
    'q': '#b35a24',  # sunset orange dim
    'E': '#4ec27a',  # palm green
    'e': '#2e7d4f',  # palm green dim
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


# ------------------------------------------------------------------
# night set: the sky over the bench - rocket, satellite, planet,
# telescope, comet, chip, scope, stars
# ------------------------------------------------------------------

ROCKET = [
    "......R......",
    ".....RRR.....",
    ".....RRR.....",
    "....RRRRR....",
    "....RRRRR....",
    "...WWWWWWW...",
    "...WWWWWWW...",
    "...WTTTTTW...",
    "...WTTTTTW...",
    "...WWWWWWW...",
    "...WWWWWWW...",
    "...WWWWWWW...",
    "...WWWWWWW...",
    "..RWWWWWWWR..",
    "..RRWWWWWRR..",
    "..RRRWWWRRR..",
    "..RRRWWWRRR..",
    "...RWWWWWR...",
    ".....GGG.....",
    ".....GQG.....",
    "....GQQQG....",
    ".....GQG.....",
    "......G......",
]

TELESCOPE = [
    "..............TT........",
    ".............TTTT.......",
    "............BBBBBB......",
    "..........BBBBBBBBB.....",
    "........BBBBBBBBBBBB....",
    "......BBBBBBBBBBBBB.....",
    "....BBBBBBBBBBBBBB......",
    "...GGGGGGGGGGGGG........",
    "...BBBBBBBBBBBBB........",
    "....BBBBBBBBB...........",
    ".....BBBBBB.............",
    "......A.A...............",
    ".....A...A..............",
    "....A.....A.............",
    "...A.......A............",
    "..A.........A...........",
]

LIGHTHOUSE = [
    ".....GGGGG......",
    "....GTTTTTG.....",
    "....GGGGGGG.....",
    ".....AAAAA......",
    "....WWWWWWW.....",
    "....WRRRRRW.....",
    "....WRRRRRW.....",
    "....WWWWWWW.....",
    "....WRRRRRW.....",
    "....WRRRRRW.....",
    "....WWWWWWW.....",
    "....WRRRRRW.....",
    "....WWWWWWW.....",
    "...WWWWWWWWW....",
    "...WRRRRRRRW....",
    "...WWWWWWWWW....",
    "..WWWWWWWWWWW...",
    "..WRRRRRRRRRW...",
    "..WWWWWWWWWWW...",
    ".WWWWWWWWWWWWW..",
    ".WRRRRRRRRRRRW..",
    ".WWWWWWWWWWWWW..",
    "WWWWWWWWWWWWWWW.",
    "WRRRRRRRRRRRRRW.",
    "WWWWWWWWWWWWWWW.",
]

PALM = [
    "........E.EE..........",
    ".....EEEEEEEEEE.......",
    "....EEEEEEEEEEEE......",
    "...EEEEEEEEEEEEEE.....",
    "....EEEEEEEEEEEE......",
    "......EEEEEEEE........",
    ".........EE...........",
    ".........bb...........",
    "..........bb..........",
    "..........bb..........",
    "...........bb.........",
    "...........bb.........",
    "............bb........",
    "............bb........",
    ".............bb.......",
    ".............bb.......",
    "..............bb......",
    "..............bb......",
    "...............bb.....",
    "...............bb.....",
    "................bb....",
    "................bb....",
    ".................bb...",
]

BOAT = [
    "..........RR...........",
    "..........b............",
    "..........bb...........",
    "..........bbb..........",
    "..........bbbb.........",
    "..........bbbbb........",
    "..........bbbbbb.......",
    "..........bWWWWWWW.....",
    "..........bWWWWWWWW....",
    "..........bWWWWWWWWW...",
    "..........bWWWWWWWWWW..",
    "..........bWWWWWWWWWWW.",
    "..........bWWWWWWWWWWW.",
    "..........bWWWWWWWWWWW.",
    ".RRRRRRRRRRRRRRRRRRRRR.",
    "RRRRRRRRRRRRRRRRRRRRRRR",
    "GGGGGGGGGGGGGGGGGGGGGGG",
]

CRAB = [
    ".....R.........R......",
    "....RRR.......RRR.....",
    "....RRR.......RRR.....",
    "...RRRR.......RRRR....",
    "...RRRRR.....RRRRR....",
    "....RRRRRRRRRRRRR.....",
    "..RRWWRRRRRRRRWWRRR...",
    ".RRRRRRRRRRRRRRRRRRR..",
    ".RRRRRRRRRRRRRRRRRRR..",
    "..RRRRRRRRRRRRRRRRR...",
    "..R.RRRRRRRRRRRRR.R...",
    "..R..RRR..RRR..RRR.R..",
    ".....RR.....RR....R...",
]

GULL = [
    "...WW..........WW...",
    "..WWWW........WWWW..",
    ".WWWWWW......WWWWWW.",
    "..WWWWWW....WWWWWW..",
    "...WWWWWWWWWWWWWW...",
    ".....WWWWWWWWWW.....",
    ".........WW.........",
    ".........WW.........",
]


def build_satellite():
    W, H = 25, 15
    g = Grid(W, H)
    cx = 12
    # dish
    g.rect(cx - 1, 1, cx + 1, 1, 'A')
    g.rect(cx - 2, 2, cx + 2, 2, 'A')
    g.px(cx - 2, 3, 'A')
    g.px(cx + 2, 3, 'A')
    g.px(cx, 3, 'A')
    g.px(cx, 4, 'a')
    # body
    g.rect(8, 5, 16, 10, 'B')
    g.rect(9, 6, 15, 9, 'N')
    g.rect(10, 7, 14, 8, 'T')
    # solar panels
    g.rect(1, 6, 6, 9, 'P')
    g.rect(18, 6, 23, 9, 'P')
    for x in range(1, 7):
        for y in range(6, 10):
            if (x + y) % 2 == 0:
                g.px(x, y, 'p')
    for x in range(18, 24):
        for y in range(6, 10):
            if (x + y) % 2 == 0:
                g.px(x, y, 'p')
    # thruster + glow
    g.rect(11, 11, 13, 12, 'a')
    g.px(12, 13, 'G')
    return g


def build_planet():
    W, H = 26, 20
    cx, cy = 13, 10
    g = Grid(W, H)
    # ring: upper arc sits behind the planet, lower arc is redrawn on top
    for x in range(W):
        dx = (x - cx) / 11.6
        if abs(dx) <= 1:
            dy = 2.9 * math.sqrt(1 - dx * dx)
            g.px(x, round(cy - dy), 'G')
            g.px(x, round(cy + dy), 'G')
    g.disc(cx, cy, 8.2, 'P')
    for (x, y), ch in list(g.g.items()):
        if ch == 'P' and (x - cx) + (y - cy) > 6:
            g.px(x, y, 'p')
    g.disc(10, 7, 1.4, 'p')
    g.disc(16, 11, 1.8, 'p')
    for x in range(W):
        dx = (x - cx) / 11.6
        if abs(dx) <= .92:
            dy = 2.9 * math.sqrt(1 - dx * dx)
            g.px(x, round(cy + dy), 'G')
            if abs(dx) < .7:
                g.px(x, round(cy + dy) + 1, 'G')
    g.disc(22, 4, 1.6, 'W')
    return g


def build_comet():
    W, H = 27, 14
    g = Grid(W, H)
    for i in range(18):
        x = 9 + i
        t = max(1, 5 - i // 4)
        col = 'G' if i < 5 else ('Q' if i < 11 else 'q')
        y0 = 7 - t // 2
        g.rect(x, y0, x, y0 + t - 1, col)
    g.disc(5, 7, 1.6, 'W')
    for dx, dy in ((0, -1), (0, -2), (0, -3), (0, 1), (0, 2), (0, 3),
                   (-1, 0), (-2, 0), (-3, 0), (1, 0), (2, 0), (3, 0)):
        g.px(5 + dx, 7 + dy, 'G')
    g.px(5, 7, 'G')
    return g


def build_chip():
    W = H = 22
    g = Grid(W, H)
    for y in (6, 7, 10, 11, 14, 15):
        g.rect(1, y, 3, y, 'A')
        g.rect(18, y, 20, y, 'A')
    for x in (6, 7, 10, 11, 14, 15):
        g.rect(x, 1, x, 3, 'A')
        g.rect(x, 18, x, 20, 'A')
    g.rect(4, 4, 17, 17, 'B')
    g.rect(4, 4, 17, 4, 'b')
    g.disc(6, 6, 1.3, 'a')
    g.rect(8, 8, 13, 13, 'N')
    g.rect(9, 10, 12, 10, 'T')
    g.rect(10, 9, 10, 12, 'T')
    g.rect(12, 11, 12, 12, 'T')
    for (x, y) in ((8, 8), (13, 8), (8, 13), (13, 13)):
        g.px(x, y, 'G')
    return g


def build_scope():
    W, H = 24, 20
    g = Grid(W, H)
    g.rect(1, 2, 22, 17, 'B')
    g.rect(1, 2, 22, 2, 'b')
    g.rect(2, 4, 15, 15, 'a')
    g.rect(3, 5, 14, 14, 'N')
    for x in range(3, 15):
        y = 9.5 - 3.4 * math.sin((x - 3) / 11.0 * 2 * math.pi)
        g.px(x, round(y), 'T')
    for (x, y) in ((5, 6), (12, 13), (6, 12)):
        g.px(x, y, 't')
    g.disc(19, 7, 2.3, 'G')
    g.disc(19, 13, 2.3, 'g')
    g.px(20, 3, 'T')
    g.rect(2, 18, 6, 18, 'a')
    g.rect(17, 18, 21, 18, 'a')
    return g


def build_stars():
    W, H = 22, 20
    g = Grid(W, H)

    def star(cx, cy, r, col, core):
        for i in range(1, r + 1):
            g.px(cx - i, cy, col)
            g.px(cx + i, cy, col)
            g.px(cx, cy - i, col)
            g.px(cx, cy + i, col)
        g.px(cx, cy, core)
        g.px(cx + 1, cy + 1, col)
        g.px(cx - 1, cy - 1, col)

    star(11, 9, 4, 'W', 'G')
    star(4, 4, 2, 'T', 'T')
    star(17, 5, 2, 'G', 'G')
    for (x, y, c) in ((6, 16, 'T'), (16, 15, 'W'), (20, 11, 'G'), (2, 12, 't')):
        g.px(x, y, c)
    return g


def build_antenna():
    W, H = 21, 26
    g = Grid(W, H)
    cx = 10
    # mast
    g.rect(cx, 4, cx, 23, 'A')
    # crossbars
    g.rect(cx - 5, 8, cx + 5, 8, 'A')
    g.rect(cx - 4, 13, cx + 4, 13, 'A')
    g.rect(cx - 3, 18, cx + 3, 18, 'A')
    # diagonal braces
    for i, (y0, y1) in enumerate(((8, 13), (13, 18), (18, 23))):
        g.px(cx - 5 + i, y0 + 2, 'a')
        g.px(cx - 4 + i, y0 + 3, 'a')
        g.px(cx + 5 - i, y0 + 2, 'a')
        g.px(cx + 4 - i, y0 + 3, 'a')
    # beacon
    g.disc(cx, 2, 1.8, 'R')
    # feet
    g.rect(cx - 6, 24, cx + 6, 24, 'a')
    return g


def build_cassette():
    W, H = 22, 14
    g = Grid(W, H)
    g.rect(0, 0, 21, 12, 'C')
    g.rect(0, 0, 21, 0, 'c')
    g.rect(0, 12, 21, 12, 'c')
    # label
    g.rect(2, 2, 19, 4, 'W')
    g.rect(3, 3, 9, 3, 'g')
    g.rect(3, 4, 7, 4, 'g')
    # window + reels
    g.rect(3, 6, 18, 10, 'N')
    g.disc(7, 8, 2.4, 'K')
    g.disc(7, 8, 1.0, 'G')
    g.disc(15, 8, 2.4, 'K')
    g.disc(15, 8, 1.0, 'G')
    g.px(1, 6, 'a')
    g.px(20, 6, 'a')
    return g


def build_signal():
    W, H = 22, 16
    g = Grid(W, H)
    # broadcast tower base + arcs radiating up-right
    g.rect(3, 12, 5, 15, 'a')
    g.rect(4, 8, 4, 11, 'A')
    g.px(4, 7, 'A')
    g.disc(4, 5, 1.4, 'G')
    for r, col in ((3.5, 'T'), (6.5, 't'), (9.5, 'T'), (12.5, 't')):
        for ang in range(-42, 43, 4):
            x = 4 + r * math.cos(math.radians(ang))
            y = 5 - r * math.sin(math.radians(ang))
            g.px(round(x), round(y), col)
    return g


def build_headphones():
    W, H = 18, 16
    g = Grid(W, H)
    for ang in range(15, 166, 3):
        x = 8.5 + 7.6 * math.cos(math.radians(ang))
        y = 11 - 7.6 * math.sin(math.radians(ang))
        g.px(round(x), round(y), 'H')
        g.px(round(x), round(y) - 1, 'h')
    g.rect(0, 7, 3, 14, 'B')
    g.rect(14, 7, 17, 14, 'B')
    g.rect(1, 8, 2, 13, 'G')
    g.rect(15, 8, 16, 13, 'G')
    return g


def build_mic():
    W, H = 13, 24
    g = Grid(W, H)
    # head
    g.disc(6, 5.5, 4.4, 'A')
    g.rect(2, 4, 10, 7, 'A')
    for x in range(2, 11):
        for y in range(2, 9):
            if (x + y) % 2 == 0:
                g.px(x, y, 'a')
    g.rect(3, 9, 9, 10, 'a')
    # stem
    g.rect(5, 10, 7, 20, 'B')
    g.rect(5, 10, 5, 20, 'b')
    # base
    g.rect(2, 21, 10, 22, 'B')
    g.rect(1, 23, 11, 23, 'b')
    return g


def build_ticket():
    W, H = 24, 13
    g = Grid(W, H)
    g.rect(0, 1, 23, 11, 'W')
    g.rect(0, 1, 23, 1, 'w')
    g.rect(0, 11, 23, 11, 'w')
    # perforation
    for y in range(2, 11):
        if y % 2 == 0:
            g.px(17, y, 'w')
    # star row
    for cx in (4, 8, 12):
        for i in range(1, 3):
            g.px(cx - i, 5, 'G')
            g.px(cx + i, 5, 'G')
            g.px(cx, 5 - i, 'G')
            g.px(cx, 5 + i, 'G')
        g.px(cx, 5, 'G')
    g.rect(3, 8, 13, 8, 'r')
    g.rect(19, 4, 21, 4, 'R')
    g.rect(19, 7, 21, 7, 'R')
    return g


def build_pick():
    W, H = 16, 20
    g = Grid(W, H)
    for y in range(H):
        t = y / (H - 1.0)
        hw = 6.6 * (1 - t * t * .92)
        for x in range(W):
            if abs(x - 7.5) <= hw:
                col = 'R'
                if abs(x - 7.5) > hw - 1.4:
                    col = 'r'
                if y > 14:
                    col = 'W' if abs(x - 7.5) < hw - .5 else col
                g.px(x, y, col)
    g.rect(4, 7, 11, 7, 'G')
    g.rect(5, 9, 10, 9, 'G')
    return g


LIGHTER = [
    "......Q......",
    ".....QGQ.....",
    ".....QGQ.....",
    "......Q......",
    ".....AAA.....",
    ".....AAA.....",
    "....AAAAA....",
    "....AAAAA....",
    "...ABBBBBA...",
    "...ABBBBBA...",
    "...ABGGGBA...",
    "...ABGGGBA...",
    "...ABBBBBA...",
    "...ABRRRBA...",
    "...ABRRRBA...",
    "...ABBBBBA...",
    "...ABBBBBA...",
    "....AAAAA....",
]


# ------------------------------------------------------------------
# sunset set: the shore at golden hour - palm, boat, lighthouse,
# gull, fire, umbrella, crab, shell
# ------------------------------------------------------------------

def build_fire():
    W, H = 20, 20
    g = Grid(W, H)
    g.rect(2, 15, 17, 17, 'b')
    g.rect(5, 13, 14, 15, 'b')
    g.rect(2, 15, 17, 15, 'a')
    for y in range(3, 14):
        hw = max(1, int((y - 2) * .62))
        g.rect(10 - hw, y, 10 + hw, y, 'Q')
    for y in range(6, 14):
        hw = int((y - 5) * .45)
        if hw >= 1:
            g.rect(10 - hw, y, 10 + hw, y, 'G')
    g.rect(10, 12, 10, 13, 'K')
    for (x, y, c) in ((10, 1, 'G'), (13, 3, 'G'), (7, 4, 'Q'), (16, 8, 'G'), (4, 9, 'Q')):
        g.px(x, y, c)
    return g


def build_umbrella():
    W, H = 26, 22
    cx = 12
    g = Grid(W, H)
    for x in range(W):
        dx = x - cx
        if abs(dx) <= 12:
            dy = math.sqrt(max(0.0, 144 - dx * dx)) * .8
            ytop = round(12 - dy)
            for y in range(ytop, 12):
                col = 'R' if ((x + 2) // 3) % 2 == 0 else 'W'
                g.px(x, y, col)
    for x in range(W):
        if abs(x - cx) <= 12 and x % 4 != 3:
            g.px(x, 12, 'W' if ((x + 2) // 3) % 2 == 0 else 'R')
    g.px(cx, 0, 'G')
    g.px(cx + 1, 0, 'G')
    g.rect(cx, 1, cx, 21, 'a')
    g.rect(cx - 2, 21, cx + 3, 21, 'a')
    return g


def build_shell():
    W, H = 20, 18
    cx, cy = 10, 17
    g = Grid(W, H)
    for y in range(H):
        for x in range(W):
            d = math.hypot(x - cx, y - cy)
            if d <= 9.2 and y <= cy:
                ang = math.degrees(math.atan2(cy - y, x - cx))
                wedge = int(ang // 22.5) % 2
                col = 'W' if wedge == 0 else 'w'
                if d > 8.1:
                    col = 'q'
                g.px(x, y, col)
    for ang in (22.5, 67.5, 112.5, 157.5):
        for d in range(3, 9):
            x = cx + d * math.cos(math.radians(ang))
            y = cy - d * math.sin(math.radians(ang))
            g.px(round(x), round(y), 'w')
    g.rect(cx - 1, cy, cx + 1, cy, 'q')
    return g


def build_surfboard():
    W, H = 12, 26
    g = Grid(W, H)
    cx = 5.5
    for y in range(H):
        t = y / (H - 1.0)
        hw = 4.4 * math.sin(math.pi * (0.08 + t * 0.84))
        for x in range(W):
            if abs(x - cx) <= hw:
                col = 'W'
                if abs(x - cx) > hw - 1.2:
                    col = 'q'
                g.px(x, y, col)
    for y in range(4, H - 4):
        g.px(5, y, 'R')
    g.rect(3, 10, 7, 10, 'R')
    return g


def build_beachball():
    W = H = 20
    cx, cy = 9.5, 9.5
    g = Grid(W, H)
    g.disc(cx, cy, 9.0, 'W')
    for y in range(H):
        for x in range(W):
            d = math.hypot(x - cx, y - cy)
            if d <= 9.0:
                ang = (math.degrees(math.atan2(y - cy, x - cx)) + 360) % 360
                seg = int(ang // 45) % 3
                if seg == 0:
                    g.px(x, y, 'R')
                elif seg == 1:
                    g.px(x, y, 'Q')
    g.disc(cx - 2, cy - 2, 1.4, 'G')
    return g


def build_bucket():
    W, H = 18, 18
    g = Grid(W, H)
    g.rect(2, 5, 15, 16, 'R')
    g.rect(2, 5, 15, 5, 'r')
    g.rect(2, 16, 15, 16, 'r')
    for x in range(3, 15, 3):
        g.rect(x, 8, x, 14, 'r')
    for ang in range(0, 181, 6):
        x = 8.5 + 6.8 * math.cos(math.radians(ang))
        y = 6 - 5.4 * math.sin(math.radians(ang))
        g.px(round(x), round(y), 'A')
    g.px(1, 4, 'A')
    g.px(16, 4, 'A')
    return g


def build_starfish():
    W = H = 21
    cx, cy = 10, 10.5
    g = Grid(W, H)
    for ang in range(0, 360, 2):
        a = math.radians(ang)
        r = 9.2 if (ang % 72) < 36 else 4.2
        x = cx + r * math.cos(a)
        y = cy + r * math.sin(a)
        g.px(round(x), round(y), 'Q')
    g.disc(cx, cy, 3.4, 'Q')
    for ang in range(36, 360, 72):
        a = math.radians(ang)
        x = cx + 5.4 * math.cos(a)
        y = cy + 5.4 * math.sin(a)
        g.disc(x, y, 1.2, 'q')
    g.disc(cx, cy, 1.2, 'G')
    return g


# ------------------------------------------------------------------
# wide-screen extras: four more props per theme for the outer slots
# ------------------------------------------------------------------

UFO = [
    "........TT........",
    "......TTTTTT......",
    ".....TTTTTTTT.....",
    "....TTTTTTTTTT....",
    "..TTTTTTTTTTTTTT..",
    ".TTTTTTTTTTTTTTTT.",
    "..AAAAAAAAAAAAAA..",
    "...AAAATTTTAAAA...",
    "....AAATTTTAAA....",
    ".....AAAAAAA......",
    ".......T..T.......",
]

MOON = [
    ".....SSS.....",
    "...SSSS......",
    "..SSSS.......",
    ".SSSS........",
    ".SSS.........",
    "SSS..........",
    "SSS..........",
    "SSS..........",
    ".SSS.........",
    ".SSSS........",
    "..SSSS.......",
    "...SSSS......",
    ".....SSS.....",
]

FLOPPY = [
    "...AAAAAAAA....",
    "..ABBBBBBBBA...",
    "..ABssssssBA...",
    "..ABssssssBA...",
    "..ABBBBBBBBA...",
    "..AAAAAAAAAA...",
    "..AWWWWWWWWA...",
    "..AWWWWWWWWA...",
    "..AWWWWWWWWA...",
    "..AWWWWWWWWA...",
    "..AWWWWWWWWA...",
    "..AAAAAAAAAA...",
]

GAMEPAD = [
    "...AAAAAAAAAAAA...",
    "..ABBBBBBBBBBBBA..",
    ".ABBBBBBBBBBBBBBA.",
    ".AB.A..BB..A..BBA.",
    ".AB.A..BB..A..BBA.",
    ".AB.A..BB..A..BBA.",
    ".ABBBBBBBBBBBBBBA.",
    "..ABBBBBBBBBBBBA..",
    "...AAAAAAAAAAAA...",
]

SUN = [
    "......G......",
    "..G...G...G..",
    "...G.GGG.G...",
    "....GGGGG....",
    ".GGGGGGGGGGG.",
    "....GGGGG....",
    "...G.GGG.G...",
    "..G...G...G..",
    "......G......",
]

DRINK = [
    ".....W......",
    ".....W......",
    "..WWWWWWWW..",
    "..WQQQQQQW..",
    "..WQQQQQQW..",
    "..WQQQQQQW..",
    "...WQQQQW...",
    "...WQQQQW...",
    "....WQQW....",
    "....WQQW....",
    ".....WW.....",
]

FLIPFLOP = [
    "...EEEEEE...",
    "..EEEEEEEE..",
    ".EEEEEEEEEE.",
    ".EEE.EE.EEE.",
    ".EE..EE..EE.",
    ".EE..EE..EE.",
    ".EEE.EE.EEE.",
    ".EEEEEEEEEE.",
    "..EEEEEEEE..",
    "...EEEEEE...",
]

ICECREAM = [
    "..WWWWWW..",
    ".WWWWWWWW.",
    "WWWWWWWWWW",
    ".QQQQQQQQ.",
    "..QQQQQQ..",
    "...QQQQ...",
    "....QQ....",
    "....QQ....",
    ".....Q....",
]

BOOTS = [
    ".BBBB...BBBB.",
    ".BBBB...BBBB.",
    ".BBBB...BBBB.",
    ".BBBB...BBBB.",
    ".BBBB...BBBB.",
    ".BBBBB.BBBBB.",
    "BBBBBBBBBBBBB",
    "BBBBBB.BBBBBB",
    "RRRRRR.RRRRRR",
    "RRRRRR.RRRRRR",
]

STAR = [
    "......G......",
    "......G......",
    ".....GGG.....",
    "GGGGGGGGGGGGG",
    ".GGGGGGGGGGG.",
    "..GGGGGGGGG..",
    "...GGG.GGG...",
    "..GGG...GGG..",
    ".GG.......GG.",
]

SPEAKER = [
    "..BBBBBBBBBB..",
    ".BBBBBBBBBBBB.",
    ".BBAAAAAAAAAB.",
    ".BAAAKKKKKKAAB.",
    ".BAKK.....KKAB.",
    ".BAK.......KAB.",
    ".BAKK.....KKAB.",
    ".BAAAKKKKKKAAB.",
    ".BBAAAAAAAAAB.",
    ".BBBBBBBBBBBB.",
    "..BBBBBBBBBB..",
]

WRISTBAND = [
    "..GGGGGGGGGG..",
    ".G..........G.",
    "GG..........GG",
    "G.RRRRRRRRRR.G",
    "G.RWWWWWWWWR.G",
    "G.RRRRRRRRRR.G",
    "GG..........GG",
    ".G..........G.",
    "..GGGGGGGGGG..",
]

ROBOT = [
    "....TT....",
    "..AAAAAA..",
    ".AAAAAAAA.",
    ".AKKAAKKA.",
    ".AAAAAAAA.",
    "..TTTTTT..",
    ".TTTTTTTT.",
    ".TAATTAAT.",
    ".TTTTTTTT.",
    "..T....T..",
    "..A....A..",
    "..AA..AA..",
]

CRT = [
    "..AAAAAAAAAA..",
    "..ABBBBBBBBA..",
    "..ABTTTTTTBA..",
    "..ABTTTTTTBA..",
    "..ABTTTTTTBA..",
    "..ABBBBBBBBA..",
    "..AAAAAAAAAA..",
    "...A......A...",
    "..AAAA..AAAA..",
    "..A..A..A..A..",
]

COCONUT = [
    "......W.....",
    "......W.....",
    "...bbbbbb...",
    "..bbbbbbbb..",
    ".bbbbbbbbbb.",
    ".bbbbbbbbbb.",
    "..bbbbbbbb..",
    "...bbbbbb...",
]

SUNHAT = [
    "....WWWW....",
    "...WWWWWW...",
    "..WWWWWWWW..",
    "..RRRRRRRR..",
    ".WWWWWWWWWW.",
    "WWWWWWWWWWWW",
    ".wwwwwwwwww.",
]

POSTER = [
    "RRRRRRRRRRRRRR",
    "RWWWWWWWWWWWWR",
    "RWWWWGGWWWWWWR",
    "RWWWGGGGWWWWWR",
    "RWWGGGGGGWWWWR",
    "RWWWWGGWWWWWWR",
    "RWWWWGGWWWWWWR",
    "RWWWWGGWWWWWWR",
    "RWWWWWWWWWWWWR",
    "RWWWWWWWWWWWWR",
    "RWWWWWWWWWWWWR",
    "RWWWWWWWWWWWWR",
    "RRRRRRRRRRRRRR",
]

BADGE = [
    "....LL.....",
    "..LLLLLL...",
    "..WWWWWW...",
    ".WWWWWWWW..",
    ".WGGGGGGW..",
    ".WGGGGGGW..",
    ".WWWWWWWW..",
    "..WWWWWW...",
]


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
    'mic': outline(build_mic()),
    'ticket': outline(build_ticket()),
    'pick': outline(build_pick()),
    'lighter': outline(from_ascii(LIGHTER)),
    # night set
    'rocket': outline(from_ascii(ROCKET)),
    'satellite': outline(build_satellite()),
    'planet': outline(build_planet()),
    'telescope': outline(from_ascii(TELESCOPE)),
    'comet': outline(build_comet()),
    'chip': outline(build_chip()),
    'scope': outline(build_scope()),
    'stars': outline(build_stars()),
    'antenna': outline(build_antenna()),
    'cassette': outline(build_cassette()),
    'signal': outline(build_signal()),
    'headphones': outline(build_headphones()),
    # sunset set
    'palm': outline(from_ascii(PALM)),
    'boat': outline(from_ascii(BOAT)),
    'lighthouse': outline(from_ascii(LIGHTHOUSE)),
    'gull': outline(from_ascii(GULL)),
    'fire': outline(build_fire()),
    'umbrella': outline(build_umbrella()),
    'crab': outline(from_ascii(CRAB)),
    'shell': outline(build_shell()),
    'surfboard': outline(build_surfboard()),
    'beachball': outline(build_beachball()),
    'bucket': outline(build_bucket()),
    'starfish': outline(build_starfish()),
    # wide-screen extra set: four more props per theme for the outer slots
    # (13-16) that fill the pockets a 1920 window leaves around the copy
    # and the deck
    'ufo': outline(from_ascii(UFO)),
    'moon': outline(from_ascii(MOON)),
    'floppy': outline(from_ascii(FLOPPY)),
    'gamepad': outline(from_ascii(GAMEPAD)),
    'sun': outline(from_ascii(SUN)),
    'drink': outline(from_ascii(DRINK)),
    'flipflop': outline(from_ascii(FLIPFLOP)),
    'icecream': outline(from_ascii(ICECREAM)),
    'boots': outline(from_ascii(BOOTS)),
    'star': outline(from_ascii(STAR)),
    'speaker': outline(from_ascii(SPEAKER)),
    'wristband': outline(from_ascii(WRISTBAND)),
    # two more per theme: fill the pockets above the deck and under the
    # status banner on very wide screens
    'robot': outline(from_ascii(ROBOT)),
    'crt': outline(from_ascii(CRT)),
    'coconut': outline(from_ascii(COCONUT)),
    'sunhat': outline(from_ascii(SUNHAT)),
    'poster': outline(from_ascii(POSTER)),
    'badge': outline(from_ascii(BADGE)),
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
