"""A3 reference drawing (first-angle projection, scale 1:1) of the Coursework 1
part, generated from the reference model with hidden-line removal.

    python tools/make_drawing.py

Writes docs/Coursework1_reference_drawing.pdf and a PNG preview. The drawing
shows which views, dimensions, fits and geometric tolerances to place in the
Fusion drawing; it is not a substitute for the drawing made in the CAD tool.
"""

import math
import os
import sys

import cadquery as cq
import matplotlib
import numpy as np

matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Arc, Circle, PathPatch, Polygon, Rectangle  # noqa: E402
from matplotlib.path import Path  # noqa: E402
from OCP.BRepLib import BRepLib  # noqa: E402
from OCP.gp import gp_Ax2, gp_Dir, gp_Pnt  # noqa: E402
from OCP.HLRAlgo import HLRAlgo_Projector  # noqa: E402
from OCP.HLRBRep import HLRBRep_Algo, HLRBRep_HLRToShape  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_reference as br  # noqa: E402

D = br.D
ROOT = br.ROOT
PT = 72 / 25.4                     # points per mm
THICK, THIN = 0.5 * PT, 0.25 * PT
FS = 10                            # dimension text, about 3.5 mm
FONT = 'DejaVu Sans'
INK = '#111111'


# ------------------------------------------------------------ projection
def hlr(shape, n, vx, smooth=False):
    algo = HLRBRep_Algo()
    algo.Add(shape.wrapped)
    algo.Projector(HLRAlgo_Projector(gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(*n), gp_Dir(*vx))))
    algo.Update()
    algo.Hide()
    h = HLRBRep_HLRToShape(algo)
    comps = [h.VCompound(), h.OutLineVCompound()] + ([h.Rg1LineVCompound()] if smooth else [])
    polylines = []
    for comp in comps:
        if comp.IsNull():
            continue
        BRepLib.BuildCurves3d_s(comp, 1e-6)
        for e in cq.Shape.cast(comp).Edges():
            n_pts = 2 if e.geomType() == 'LINE' else max(8, int(e.Length() * 3))
            polylines.append([(p.x, p.y) for p in e.positions(np.linspace(0, 1, n_pts))])
    return polylines


def section_faces(solid, origin, normal):
    plane = cq.Face.makePlane(400, 400, cq.Vector(*origin), cq.Vector(*normal))
    return solid.intersect(plane).Faces()


def wire_pts(wire, proj):
    pts = []
    for p in wire.positions(np.linspace(0, 1, 1200)):
        pts.append(proj((p.x, p.y, p.z)))
    return pts


class View:
    def __init__(self, sheet, origin, u0, v0, scale=1.0):
        self.s, self.o, self.u0, self.v0, self.k = sheet, origin, u0, v0, scale

    def p(self, u, v):
        return self.o[0] + (u - self.u0) * self.k, self.o[1] + (v - self.v0) * self.k

    def draw(self, polylines, lw=THICK):
        for pl in polylines:
            xs, ys = zip(*[self.p(u, v) for u, v in pl])
            self.s.ax.plot(xs, ys, color=INK, lw=lw, solid_capstyle='round', solid_joinstyle='round')

    def hatch(self, faces, proj):
        for f in faces:
            verts, codes = [], []
            for w in [f.outerWire()] + f.innerWires():
                pts = [self.p(*proj(q)) for q in [(p.x, p.y, p.z) for p in w.positions(np.linspace(0, 1, 1200))]]
                verts += pts + [pts[0]]
                codes += [Path.MOVETO] + [Path.LINETO] * (len(pts) - 1) + [Path.CLOSEPOLY]
            self.s.ax.add_patch(PathPatch(Path(verts, codes), facecolor='none', edgecolor=INK,
                                          hatch='////', lw=0, zorder=0))


# ------------------------------------------------------------- the sheet
class Sheet:
    def __init__(self):
        plt.rcParams['hatch.linewidth'] = THIN
        plt.rcParams['font.family'] = FONT
        self.fig = plt.figure(figsize=(420 / 25.4, 297 / 25.4))
        self.ax = self.fig.add_axes([0, 0, 1, 1])
        self.ax.set_xlim(0, 420)
        self.ax.set_ylim(0, 297)
        self.ax.set_aspect('equal')
        self.ax.axis('off')

    def line(self, a, b, lw=THIN, ls='-', z=2):
        self.ax.plot([a[0], b[0]], [a[1], b[1]], color=INK, lw=lw, ls=ls, zorder=z,
                     solid_capstyle='butt', dash_capstyle='butt')

    def center(self, a, b):
        self.ax.plot([a[0], b[0]], [a[1], b[1]], color=INK, lw=THIN, dashes=(8, 1.5, 1, 1.5), zorder=2)

    def text(self, x, y, s, size=FS, ha='center', va='bottom', rot=0, box=False, weight='normal'):
        t = self.ax.text(x, y, s, fontsize=size, ha=ha, va=va, rotation=rot, color=INK, weight=weight,
                         rotation_mode='anchor', zorder=5)
        if box:
            t.set_bbox(dict(boxstyle='square,pad=0.15', fc='white', ec=INK, lw=THIN))
        return t

    def arrow(self, tip, toward):
        """Filled arrow head at tip, pointing from 'toward' to tip."""
        dx, dy = tip[0] - toward[0], tip[1] - toward[1]
        n = math.hypot(dx, dy)
        dx, dy = dx / n, dy / n
        L, W = 3.0, 0.5
        bx, by = tip[0] - dx * L, tip[1] - dy * L
        self.ax.add_patch(Polygon([tip, (bx - dy * W, by + dx * W), (bx + dy * W, by - dx * W)],
                                  closed=True, fc=INK, ec=INK, lw=0.2, zorder=4))

    def dim(self, a, b, offset, text, ted=False, horizontal=None, text_shift=0.0, outside=False):
        """Linear dimension between feature points a and b (sheet mm).

        horizontal=True measures along x, False along y. offset is the
        position of the dimension line (y for horizontal, x for vertical)."""
        if horizontal:
            p1, p2 = (a[0], offset), (b[0], offset)
            for f, p in ((a, p1), (b, p2)):
                sgn = 1 if offset > f[1] else -1
                self.line((f[0], f[1] + sgn * 1.0), (p[0], p[1] + sgn * 2.0))
        else:
            p1, p2 = (offset, a[1]), (offset, b[1])
            for f, p in ((a, p1), (b, p2)):
                sgn = 1 if offset > f[0] else -1
                self.line((f[0] + sgn * 1.0, f[1]), (p[0] + sgn * 2.0, p[1]))
        length = math.dist(p1, p2)
        if outside or length < 9:
            u = ((p2[0] - p1[0]) / length, (p2[1] - p1[1]) / length)
            self.line((p1[0] - u[0] * 6, p1[1] - u[1] * 6), (p2[0] + u[0] * 6, p2[1] + u[1] * 6))
            self.arrow(p1, (p1[0] - u[0], p1[1] - u[1]))
            self.arrow(p2, (p2[0] + u[0], p2[1] + u[1]))
        else:
            self.line(p1, p2)
            self.arrow(p1, p2)
            self.arrow(p2, p1)
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        if horizontal:
            self.text(mx + text_shift, my + 0.9, text, box=ted)
        else:
            self.text(mx - 0.9, my + text_shift, text, rot=90, box=ted)

    def leader(self, pts, text=None, ha='left', arrow=True, va='center'):
        for a, b in zip(pts[:-1], pts[1:]):
            self.line(a, b)
        if arrow:
            self.arrow(pts[0], pts[1])
        if text:
            end = pts[-1]
            dx = 1.0 if ha == 'left' else -1.0
            self.text(end[0] + dx, end[1], text, ha=ha, va=va)

    def fcf(self, x, y, symbol, tol, datums=(), h=5.5):
        """Feature control frame with its lower-left corner at (x, y). Returns its width."""
        cells = [6.0, 3.5 + 2.0 * len(tol)] + [6.0] * len(datums)
        cx = x
        for w in cells:
            self.ax.add_patch(Rectangle((cx, y), w, h, fc='white', ec=INK, lw=THIN, zorder=3))
            cx += w
        self.symbol(symbol, x + 3.0, y + h / 2)
        self.text(x + cells[0] + cells[1] / 2, y + h / 2, tol, va='center', size=FS - 1)
        cx = x + cells[0] + cells[1]
        for dname in datums:
            self.text(cx + 3.0, y + h / 2, dname, va='center', size=FS - 1)
            cx += 6.0
        return sum(cells)

    def symbol(self, kind, cx, cy):
        s = 2.0
        if kind == 'flatness':
            self.ax.add_patch(Polygon([(cx - s, cy - 1.0), (cx + s - 0.8, cy - 1.0), (cx + s, cy + 1.0),
                                       (cx - s + 0.8, cy + 1.0)], closed=True, fc='none', ec=INK, lw=THIN, zorder=4))
        elif kind == 'parallelism':
            for off in (-0.8, 0.8):
                self.line((cx + off - 0.8, cy - 1.8), (cx + off + 0.8, cy + 1.8), z=4)
        elif kind == 'position':
            self.ax.add_patch(Circle((cx, cy), 1.3, fc='none', ec=INK, lw=THIN, zorder=4))
            self.line((cx - 2.2, cy), (cx + 2.2, cy), z=4)
            self.line((cx, cy - 2.2), (cx, cy + 2.2), z=4)

    def datum(self, foot, name, direction):
        """Datum feature symbol: filled triangle on the feature at 'foot', box in 'direction'."""
        dx, dy = direction
        tri_w = 1.8
        base = (foot[0] + dx * 2.6, foot[1] + dy * 2.6)
        self.ax.add_patch(Polygon([(foot[0] - dy * tri_w, foot[1] + dx * tri_w),
                                   (foot[0] + dy * tri_w, foot[1] - dx * tri_w), base],
                                  closed=True, fc=INK, ec=INK, lw=0.2, zorder=4))
        box_c = (foot[0] + dx * 9, foot[1] + dy * 9)
        self.line(base, (box_c[0] - dx * 3, box_c[1] - dy * 3))
        self.ax.add_patch(Rectangle((box_c[0] - 3, box_c[1] - 3), 6, 6, fc='white', ec=INK, lw=THIN, zorder=3))
        self.text(box_c[0], box_c[1], name, va='center', size=FS)

    def cutting_plane(self, a, b, name, view_dir):
        """Section line from a to b with thick ends and arrows in view_dir."""
        self.ax.plot([a[0], b[0]], [a[1], b[1]], color=INK, lw=THIN, dashes=(8, 1.5, 1, 1.5), zorder=2)
        L = math.dist(a, b)
        u = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
        for end, sgn in ((a, 1), (b, -1)):
            stub = (end[0] + u[0] * 6 * sgn, end[1] + u[1] * 6 * sgn)
            self.line(end, stub, lw=THICK * 1.4)
            tail = end
            tip = (end[0] + view_dir[0] * 7, end[1] + view_dir[1] * 7)
            self.line(tail, tip, lw=THIN)
            self.arrow(tip, tail)
            self.text(tip[0] + view_dir[0] * 2.5 - u[0] * 2.5 * sgn, tip[1] + view_dir[1] * 2.5 - u[1] * 2.5 * sgn,
                      name, va='center', size=FS + 2, weight='bold')

    def save(self, pdf, png):
        self.fig.savefig(pdf)
        self.fig.savefig(png, dpi=110)
        print('wrote', pdf)


# --------------------------------------------------------------- content
def frame_and_title(s):
    s.ax.add_patch(Rectangle((20, 10), 390, 277, fc='none', ec=INK, lw=THICK * 1.4))
    x0, y0, w, h = 230, 10, 180, 42
    s.ax.add_patch(Rectangle((x0, y0), w, h, fc='white', ec=INK, lw=THICK, zorder=3))
    for yy in (y0 + 14, y0 + 28):
        s.line((x0, yy), (x0 + w, yy), lw=THIN, z=4)
    for xx in (x0 + 45, x0 + 90, x0 + 135):
        s.line((xx, y0), (xx, y0 + 28), lw=THIN, z=4)
    s.text(x0 + 3, y0 + 35, 'DESIGN OF A PART FOR MANUFACTURING ON A MILLING MACHINE', ha='left', va='center',
           size=FS, weight='bold')
    s.text(x0 + 3, y0 + 30.5, 'Computer Aided Manufacturing Workshop: Coursework 1 (DES)', ha='left', va='center', size=FS - 2)
    cells = [('Drawn', 'J. van den Ouden'), ('Date', '2026-10-01'), ('Scale', '1:1'), ('Sheet', 'A3  1/1'),
             ('Standards', 'ISO 129-1, ISO 1101'), ('Tolerances', 'ISO 286, ISO 2768-mK'),
             ('Stock', '85 x 75 x 30'), ('Projection', '')]
    for k, (lab, val) in enumerate(cells):
        col, row = k % 4, k // 4
        cx, cy = x0 + col * 45, y0 + 14 - row * 14
        s.text(cx + 1.5, cy + 10.5, lab, ha='left', va='center', size=6.5)
        s.text(cx + 22.5, cy + 5, val, va='center', size=FS - 2)
    # first-angle projection symbol (truncated cone, small end left; circles right)
    px, py = x0 + 135 + 9, y0 + 4.5
    s.ax.add_patch(Polygon([(px, py + 1.6), (px + 9, py), (px + 9, py + 7.2), (px, py + 5.6)], closed=True,
                           fc='none', ec=INK, lw=THIN, zorder=4))
    s.ax.add_patch(Circle((px + 18, py + 3.6), 3.6, fc='none', ec=INK, lw=THIN, zorder=4))
    s.ax.add_patch(Circle((px + 18, py + 3.6), 2.0, fc='none', ec=INK, lw=THIN, zorder=4))
    s.center((px - 1.5, py + 3.6), (px + 23, py + 3.6))


def top_view(s, solid):
    v = View(s, (60, 72), 0, 0)
    v.draw(hlr(solid, (0, 0, 1), (1, 0, 0)))
    oy = 72
    P = v.p
    # centre lines
    for (x, y), d in [(h, D.THRU_D) for h in D.THRU_HOLES] + [(h, D.BLIND_D) for h in D.BLIND_HOLES]:
        r = d / 2 + 2.5
        s.center(P(x - r, y), P(x + r, y))
        s.center(P(x, y - r), P(x, y + r))
    s.center(P(D.ISLAND_PTS[10][0] - 2, 42), P(D.ISLAND_PTS[10][0] + 7.5, 42))
    s.center(P(19, 42 - 7.5), P(19, 42 + 7.5))

    # datums B (left face) and C (front face)
    s.datum(P(0, 52), 'B', (-1, 0))
    s.datum(P(75, 0), 'C', (0, -1))

    # through holes: TED from B and C
    s.dim(P(0, 0), P(10, 38), oy - 12, '10', ted=True, horizontal=True)
    s.dim(P(10, 38), P(50, 12), oy - 12, '40', ted=True, horizontal=True)
    s.dim(P(0, 0), P(85, 0), oy - 24, '85', horizontal=True)
    s.dim(P(0, 0), P(50, 12), 46, '12', ted=True, horizontal=False)
    s.dim(P(50, 12), P(10, 38), 46, '26', ted=True, horizontal=False)
    s.dim(P(10, 38), P(10, 66), 46, '28', ted=True, horizontal=False)
    s.dim(P(0, 0), P(0, 75), 35, '75', horizontal=False)

    # side recess
    top = oy + D.STOCK[1]
    s.dim(P(0, 75), P(59, 24), top + 12, '59', horizontal=True)
    s.dim(P(59, 24), P(70, 75), top + 12, '11', horizontal=True)
    s.dim(P(70, 75), P(78, 75), top + 12, '8', horizontal=True)
    s.dim(P(85, 0), P(59, 6), 162, '6', horizontal=False, outside=True)
    s.dim(P(59, 6), P(59, 24), 162, '18', horizontal=False)
    a = P(66 + 4 * math.cos(math.radians(-45)), 28 + 4 * math.sin(math.radians(-45)))
    s.leader([a, (158, a[1] + 12), (163, a[1] + 12)], '4x R4')

    # pocket length (depth in A-A, width in B-B)
    s.dim(P(10, 15), P(35, 15), P(0, 15)[1], '25 H8', horizontal=True, text_shift=-2)

    # pocket corner radius
    a = P(13 + 3 * math.cos(math.radians(225)), 9 + 3 * math.sin(math.radians(225)))
    s.leader([a, (58, oy - 6), (55, oy - 6)], '4x R3', ha='right')

    # hole callouts
    a = P(10 - 4 * math.cos(math.radians(45)), 66 + 4 * math.sin(math.radians(45)))
    tx, ty = 61.0, top + 14
    s.leader([a, (tx, ty), (tx - 3, ty)])
    s.text(tx - 4, ty + 0.6, '3x Ø8 THRU', ha='right', va='bottom')
    w = 6.0 + 3.5 + 2.0 * 4 + 18.0
    s.fcf(tx - 4 - w, ty - 6.5, 'position', 'Ø0.1', ('A', 'B', 'C'))

    a = P(47 + 3 * math.cos(math.radians(30)), 42 + 3 * math.sin(math.radians(30)))
    s.leader([a, (150, oy + 58), (155, oy + 58)], '3x Ø6 ↧10\n118° drill point', va='center')

    # point labels for the coordinate table
    labels = 'ABCDEFGHIJKL'
    for (x, y, _), name in zip(D.ISLAND_PTS, labels):
        cx, cy = 38.5, 46.5
        dx, dy = x - cx, y - cy
        n = math.hypot(dx, dy)
        s.ax.plot(*P(x, y), 'o', ms=1.6, color=INK, zorder=5)
        lx, ly = P(x + dx / n * 3.2, y + dy / n * 3.2)
        s.text(lx, ly, name, va='center', size=FS - 2.5)
    s.ax.plot(*P(19, 42), 'o', ms=1.6, color=INK, zorder=5)
    s.text(*P(16.5, 42), 'M', va='center', size=FS - 2.5)
    for k, (x, y) in enumerate(D.BLIND_HOLES, 1):
        s.text(*P(x + 4.2, y - 3.4), str(k), va='center', size=FS - 2.5)
    s.text(*P(14.5, 3.4), 'P', va='center', size=FS - 2.5)
    s.ax.plot(*P(10, 6), 'o', ms=1.6, color=INK, zorder=5)

    # cutting planes
    s.cutting_plane(P(-4, 12), P(89, 12), 'A', (0, 1))
    s.cutting_plane(P(33, -4), P(33, 79), 'B', (1, 0))


def section_aa(s, solid):
    y = 12.0
    keep = solid.intersect(cq.Solid.makeBox(100, 80, 40, cq.Vector(-5, y, -5)))
    v = View(s, (60, 205), 0, 0)
    v.draw(hlr(keep, (0, -1, 0), (1, 0, 0)))
    v.hatch(section_faces(solid, (0, y, 0), (0, 1, 0)), lambda q: (q[0], q[2]))
    P = v.p
    s.text(*P(42.5, 46), 'SECTION A-A', size=FS + 2, weight='bold')
    s.center(P(50, -3), P(50, D.PLATE_T + 3))

    s.datum(P(30, 0), 'A', (0, -1))
    s.dim(P(0, 0), P(0, D.PLATE_T), -8 + 60, '(15.75)', horizontal=False)
    s.dim(P(0, 0), P(19, D.PART_H), -16 + 60, '28.75', horizontal=False)
    # pocket width and depth inside the pocket
    fl = D.PLATE_T - D.POCKET_DEPTH
    s.line(P(35, D.PLATE_T), P(21, D.PLATE_T))
    s.dim(P(22.5, fl), P(22.5, D.PLATE_T), P(24, 0)[0], '12 H7', horizontal=False)
    # recess depth inside the recess
    rf = D.PLATE_T - D.RECESS_DEPTH
    s.line(P(78, D.PLATE_T), P(73, D.PLATE_T))
    s.dim(P(74, rf), P(74, D.PLATE_T), P(74, 0)[0], '8', horizontal=False, outside=True)
    # parallelism of the pocket floor to A
    a = P(12, fl)
    s.leader([a, (a[0], a[1] + 30), (a[0] - 6, a[1] + 30)])
    s.fcf(a[0] - 6 - 25.5, a[1] + 27.25, 'parallelism', '0.03', ('A',))


def section_bb(s, solid):
    x = 33.0
    keep = solid.intersect(cq.Solid.makeBox(60, 90, 40, cq.Vector(x, -5, -5)))
    v = View(s, (215, 205), -D.STOCK[1], 0)
    v.draw(hlr(keep, (-1, 0, 0), (0, -1, 0)))
    v.hatch(section_faces(solid, (x, 0, 0), (1, 0, 0)), lambda q: (-q[1], q[2]))
    P = v.p
    s.text(*P(-37.5, 46), 'SECTION B-B', size=FS + 2, weight='bold')
    hy = D.BLIND_HOLES[2][1]
    s.center(P(-hy, D.PART_H - D.BLIND_DEPTH - 4), P(-hy, D.PART_H + 3))

    y_edge = D.ISLAND_PTS[D.CHAMFER_EDGE[0]][1]
    top_v = P(-(y_edge - D.chamfer_run()), D.PART_H)
    low_v = P(-y_edge, D.PART_H - D.CHAMFER_DEPTH)
    s.dim(low_v, top_v, P(-86, 0)[0], '6', horizontal=False, outside=True)
    s.dim(P(-y_edge, D.PLATE_T), P(-y_edge, D.PART_H), P(-96, 0)[0], '13', horizontal=False)
    # 60 deg between chamfer and the (extended) top face
    s.line(top_v, (top_v[0] - 13, top_v[1]))
    s.ax.add_patch(Arc(top_v, 20, 20, theta1=180, theta2=180 + D.CHAMFER_ANGLE, color=INK, lw=THIN, zorder=3))
    a1 = (top_v[0] - 10, top_v[1])
    a2 = (top_v[0] + 10 * math.cos(math.radians(180 + D.CHAMFER_ANGLE)),
          top_v[1] + 10 * math.sin(math.radians(180 + D.CHAMFER_ANGLE)))
    s.arrow(a1, (a1[0], a1[1] - 1))
    s.arrow(a2, (a2[0] - 0.9, a2[1] + 0.5))
    s.text(top_v[0] - 11, top_v[1] - 4.5, '60°', ha='right', va='center')
    # pocket width inside the pocket
    fl = D.PLATE_T - D.POCKET_DEPTH
    s.dim(P(-20, fl), P(-6, fl), P(0, fl + 7.5)[1], '14 H8', horizontal=True)
    # flatness of the island top
    a = P(-36, D.PART_H)
    s.leader([a, (a[0], a[1] + 8), (a[0] + 6, a[1] + 8)])
    s.fcf(a[0] + 6, a[1] + 5.25, 'flatness', '0.02')


def iso_view(s, solid):
    n = np.array([0.9, -1.25, 1.05])
    n /= np.linalg.norm(n)
    vx = np.cross([0, 0, 1.0], n)
    vx /= np.linalg.norm(vx)
    lines = hlr(solid, tuple(n), tuple(vx))
    us = [u for pl in lines for u, _ in pl]
    vs = [v for pl in lines for _, v in pl]
    k = 0.8
    v = View(s, (305, 200), min(us), min(vs), k)
    v.draw(lines, lw=THIN * 1.6)
    s.text(305 + (max(us) - min(us)) * k / 2, 191, 'ISOMETRIC VIEW (scale 1:1.25)', size=FS - 1)


def tables(s):
    rows = [('A', 19, 27, 'R4'), ('B', 43, 27, 'R8'), ('C', 58, 42, 'R6'), ('D', 58, 50, 'R5'),
            ('E', 50, 58, 'R5'), ('F', 42, 58, 'R3'), ('G', 42, 66, '-'), ('H', 28, 66, '-'),
            ('I', 28, 58, 'R3'), ('J', 19, 58, 'R3'), ('K', 19, 47, '-'), ('L', 19, 37, '-'),
            ('M', 19, 42, 'R5 notch'), ('1', 28, 35, 'Ø6 blind'), ('2', 47, 42, 'Ø6 blind'),
            ('3', 33, 50, 'Ø6 blind'), ('P', 10, 6, 'pocket corner')]
    x0, ytop, rh = 192, 174, 4.6
    widths = [10, 10, 10, 22]
    s.text(x0, ytop + 2.5, 'COORDINATES (datum B = X0, datum C = Y0)', ha='left', size=FS - 2, weight='bold')
    head = ('Point', 'X', 'Y', 'R / Ø')
    for r, row in enumerate([head] + rows):
        y = ytop - (r + 1) * rh
        cx = x0
        for w, val in zip(widths, row):
            s.ax.add_patch(Rectangle((cx, y), w, rh, fc='#eeeeee' if r == 0 else 'white', ec=INK, lw=THIN, zorder=3))
            s.text(cx + w / 2, y + rh / 2, str(val), va='center', size=FS - 2.5, weight='bold' if r == 0 else 'normal')
            cx += w

    nx, ny = 262, 170
    notes = [
        'NOTES',
        '1. Dimensions in mm. Part machined in one clamping from 85 x 75 x 30 stock;',
        '    top face milled 1.25 mm. Datum A = base, B = left face, C = front face.',
        '2. General tolerances ISO 2768-mK. Fits per UNE-EN ISO 286-1/-2:',
        '    25 H8 = 25 +0.033/0     14 H8 = 14 +0.027/0     12 H7 = 12 +0.018/0',
        '3. Geometric tolerances per UNE-EN ISO 1101:2017. Boxed dimensions are TED.',
        '4. Island points A-L: theoretical corners; arcs tangent, radius per table.',
        '    Concave R5 notch centred on M. Chamfer on edge G-H: 6 deep, 60° to XY.',
        '5. Holes drilled with 118° point drills. Blind hole depth = cylindrical part.',
        '6. Side recess open on front and back faces, depth 8, corners R4.',
        '7. Blind holes 1-3 and pocket corner P located per coordinate table.',
    ]
    for k, t in enumerate(notes):
        s.text(nx, ny - k * 5.2, t, ha='left', va='center', size=FS - 2.5, weight='bold' if k == 0 else 'normal')


def main():
    solid = br.build_part()
    s = Sheet()
    frame_and_title(s)
    top_view(s, solid)
    section_aa(s, solid)
    section_bb(s, solid)
    iso_view(s, solid)
    tables(s)
    out = os.path.join(ROOT, 'docs')
    s.save(os.path.join(out, 'Coursework1_reference_drawing.pdf'),
           os.path.join(out, 'img', 'reference_drawing.png'))


if __name__ == '__main__':
    main()
