"""Rebuilds the TALIA logo as clean vector SVG, from the sign on the shop and the Instagram profile picture.

The original is TAL1A in a heavy geometric sans (the I is drawn as a 1) over PASIÓN X LA BICI in small, widely
spaced capitals. Both lines are converted to outlines, so the files need no font installed.

Usage: python build_logo.py MONTSERRAT_BLACK.ttf MONTSERRAT_SEMIBOLD.ttf OUT_DIR
  Montserrat (SIL Open Font License) is the closest free match. Needs fontTools.
"""
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

heavy_path, semi_path, out_dir = sys.argv[1:4]
INK, WHITE = "#0b0b0b", "#ffffff"
fmt = lambda v: f"{v:.2f}".rstrip("0").rstrip(".")


class Face:
    def __init__(self, path):
        font = TTFont(path)
        self.glyphs, self.cmap, self.metrics = font.getGlyphSet(), font.getBestCmap(), font["hmtx"].metrics
        self.em, self.cap = font["head"].unitsPerEm, font["OS/2"].sCapHeight / font["head"].unitsPerEm


heavy, semi = Face(heavy_path), Face(semi_path)


def ink_bounds(face, char):
    pen = BoundsPen(face.glyphs)
    face.glyphs[face.cmap[ord(char)]].draw(pen)
    return pen.bounds


def word(face, text, width, x, baseline, track_em):
    """Sets `text` so its ink spans exactly `width` from `x`. Returns (path, cap height)."""
    glyphs, cmap, metrics, em = face.glyphs, face.cmap, face.metrics, face.em
    adv = sum(metrics[cmap[ord(c)]][0] for c in text) / em
    lead = ink_bounds(face, text[0])[0] / em
    trail = (metrics[cmap[ord(text[-1])]][0] - ink_bounds(face, text[-1])[2]) / em
    size = width / (adv - lead - trail + track_em * (len(text) - 1))
    pen, scale = SVGPathPen(glyphs, ntos=fmt), size / em
    cx = x - lead * size
    for c in text:
        name = cmap[ord(c)]
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, cx, baseline)))
        cx += metrics[name][0] * scale + track_em * size
    return pen.getCommands(), face.cap * size


def svg(w, h, body, bg=None):
    rect = f'<rect width="{fmt(w)}" height="{fmt(h)}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(w)} {fmt(h)}" width="{fmt(w)}" '
            f'height="{fmt(h)}" role="img" aria-label="TALIA Pasión x la Bici">{rect}{body}</svg>\n')


def write(name, text):
    with open(f"{out_dir}/{name}", "w", encoding="utf-8") as f:
        f.write(text)
    print(name)


# Stacked logo, as on the sign: the tagline spans the width of the word, a little inset.
W, PAD = 600, 0
title, cap = word(heavy, "TAL1A", W, 0, 0, -0.01)
tag_w = W * 0.86
tag, tag_cap = word(semi, "PASIÓN X LA BICI", tag_w, (W - tag_w) / 2, 0, 0.32)
gap = cap * 0.2
H = cap + gap + tag_cap


def stacked(fill):
    return (f'<g fill="{fill}"><path transform="translate(0 {fmt(cap)})" d="{title}"/>'
            f'<path transform="translate(0 {fmt(H)})" d="{tag}"/></g>')


write("logo-blanco.svg", svg(W, H, stacked(WHITE)))
write("logo-negro.svg", svg(W, H, stacked(INK)))

# Just the word, for the header.
write("talia-blanco.svg", svg(W, cap, f'<path fill="{WHITE}" transform="translate(0 {fmt(cap)})" d="{title}"/>'))
write("talia-negro.svg", svg(W, cap, f'<path fill="{INK}" transform="translate(0 {fmt(cap)})" d="{title}"/>'))

# Favicon: the 1 of the logo, white on black.
one, one_cap = word(heavy, "1", 26, 0, 0, 0)
write("favicon.svg", svg(64, 64, f'<path fill="{WHITE}" transform="translate(19 {fmt(32 + one_cap / 2)})" d="{one}"/>', INK))

# Round profile-style badge, like the Instagram picture.
R = 300
bw = 360
btitle, bcap = word(heavy, "TAL1A", bw, R - bw / 2, 0, -0.01)
btw = bw * 0.86
btag, btcap = word(semi, "PASIÓN X LA BICI", btw, R - btw / 2, 0, 0.32)
bh = bcap + bcap * 0.2 + btcap
top = R - bh / 2
write("badge.svg", svg(2 * R, 2 * R,
      f'<circle cx="{R}" cy="{R}" r="{R}" fill="{INK}"/><g fill="{WHITE}">'
      f'<path transform="translate(0 {fmt(top + bcap)})" d="{btitle}"/>'
      f'<path transform="translate(0 {fmt(top + bh)})" d="{btag}"/></g>'))
