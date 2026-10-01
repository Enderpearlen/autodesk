"""Shaded preview renders of the reference model (z-buffer rasteriser, no GPU).

    python tools/render.py

Writes docs/img/iso_front.png and docs/img/iso_back.png.
"""

import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_reference as br  # noqa: E402

ROOT = br.ROOT
BASE = np.array([176, 186, 204], float)     # light steel blue
BG = (255, 255, 255)
EDGE = (40, 44, 52)


def _basis(view):
    d = np.asarray(view, float)
    d /= np.linalg.norm(d)
    right = np.cross(d, [0, 0, 1.0])
    if np.linalg.norm(right) < 1e-9:      # looking straight down: X to the right
        right = np.array([1.0, 0, 0])
    right /= np.linalg.norm(right)
    up = np.cross(right, d)
    return d, right, up


def render(solid, view, path, size=(1600, 1150), ss=2, margin=60):
    d, right, up = _basis(view)
    verts, tris = solid.tessellate(0.01, 0.15)
    V = np.array([[v.x, v.y, v.z] for v in verts])
    T = np.array(tris)

    u, v, z = V @ right, V @ up, V @ d
    W, H = size[0] * ss, size[1] * ss
    scale = min((W - 2 * margin * ss) / np.ptp(u), (H - 2 * margin * ss) / np.ptp(v))
    px = (u - u.min()) * scale + (W - np.ptp(u) * scale) / 2
    py = H - ((v - v.min()) * scale + (H - np.ptp(v) * scale) / 2)

    zbuf = np.full((H, W), np.inf)
    img = np.empty((H, W, 3))
    img[:] = BG

    light1 = np.array([-0.35, -0.55, 0.9])
    light1 /= np.linalg.norm(light1)
    for a, b, c in T:
        n = np.cross(V[b] - V[a], V[c] - V[a])
        nn = np.linalg.norm(n)
        if nn < 1e-12:
            continue
        n /= nn
        if n @ d > 0:
            n = -n
        shade = 0.42 + 0.48 * max(0.0, n @ light1) + 0.18 * max(0.0, -n @ d)
        col = np.clip(BASE * shade, 0, 255)

        xs, ys, zs = px[[a, b, c]], py[[a, b, c]], z[[a, b, c]]
        x0, x1 = int(max(0, np.floor(xs.min()))), int(min(W - 1, np.ceil(xs.max())))
        y0, y1 = int(max(0, np.floor(ys.min()))), int(min(H - 1, np.ceil(ys.max())))
        if x1 < x0 or y1 < y0:
            continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        den = (ys[1] - ys[2]) * (xs[0] - xs[2]) + (xs[2] - xs[1]) * (ys[0] - ys[2])
        if abs(den) < 1e-12:
            continue
        w0 = ((ys[1] - ys[2]) * (gx - xs[2]) + (xs[2] - xs[1]) * (gy - ys[2])) / den
        w1 = ((ys[2] - ys[0]) * (gx - xs[2]) + (xs[0] - xs[2]) * (gy - ys[2])) / den
        w2 = 1 - w0 - w1
        inside = (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6)
        depth = w0 * zs[0] + w1 * zs[1] + w2 * zs[2]
        sub = zbuf[y0:y1 + 1, x0:x1 + 1]
        upd = inside & (depth < sub)
        sub[upd] = depth[upd]
        img[y0:y1 + 1, x0:x1 + 1][upd] = col

    out = Image.fromarray(img.astype(np.uint8))
    draw = ImageDraw.Draw(out)
    tol = 0.08
    for edge in solid.Edges():
        n = max(8, int(edge.Length() * 3))
        P = np.array([[p.x, p.y, p.z] for p in edge.positions(np.linspace(0, 1, n))])
        eu = (P @ right - u.min()) * scale + (W - np.ptp(u) * scale) / 2
        ev = H - ((P @ up - v.min()) * scale + (H - np.ptp(v) * scale) / 2)
        ez = P @ d
        vis = []
        for x, y, zz in zip(eu, ev, ez):
            ix, iy = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
            win = zbuf[max(0, iy - 1):iy + 2, max(0, ix - 1):ix + 2]
            vis.append(zz <= win.max() + tol and zz <= win.min() + 0.6)
        for k in range(n - 1):
            if vis[k] and vis[k + 1]:
                draw.line([(eu[k], ev[k]), (eu[k + 1], ev[k + 1])], fill=EDGE, width=2 * ss // 2 + 1)

    out = out.resize(size, Image.LANCZOS)
    out.save(path)
    print('wrote', path)


def main():
    solid = br.build_part()
    os.makedirs(os.path.join(ROOT, 'docs', 'img'), exist_ok=True)
    render(solid, (-0.9, 1.25, -1.05), os.path.join(ROOT, 'docs', 'img', 'iso_front.png'))
    render(solid, (0.85, -1.2, -1.0), os.path.join(ROOT, 'docs', 'img', 'iso_back.png'))
    render(solid, (0.0, 0.0, -1.0), os.path.join(ROOT, 'docs', 'img', 'top.png'), size=(1200, 1060))


if __name__ == '__main__':
    main()
