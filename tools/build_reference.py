"""Build the Coursework 1 part in CadQuery from the same design data as the
Fusion script, export STEP/STL and check every requirement of the brief.

    python tools/build_reference.py

Writes model/Coursework1_Part.step, model/Coursework1_Part.stl and
docs/requirements_check.json, and prints the check table.
"""

import importlib.util
import json
import math
import os
import sys

import cadquery as cq
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from shapely.geometry import LineString, Point, Polygon, box

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(ROOT, 'fusion', 'Coursework1_Part', 'Coursework1_Part.py')


def load_design():
    spec = importlib.util.spec_from_file_location('cw_design', SCRIPT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


D = load_design()
TIP = (D.BLIND_D / 2.0) / math.tan(math.radians(D.DRILL_POINT_ANGLE / 2.0))


# ------------------------------------------------------------------ model
def _loop(segs, z):
    wp = cq.Workplane('XY', origin=(0, 0, z)).moveTo(*segs[0][1])
    for s in segs:
        wp = wp.lineTo(*s[2]) if s[0] == 'line' else wp.threePointArc(s[2], s[3])
    return wp.close()


def build_part():
    part = cq.Workplane('XY').box(D.STOCK[0], D.STOCK[1], D.PLATE_T, centered=False)
    part = part.union(_loop(D.island_segments(), D.PLATE_T).extrude(D.ISLAND_H))

    tri = D.chamfer_triangle_yz()
    wedge = cq.Workplane('YZ', origin=(-10, 0, 0)).polyline(tri).close().extrude(D.STOCK[0] + 20)
    part = part.cut(wedge)

    solid = part.val()
    for x, y in D.BLIND_HOLES:
        z0 = D.PART_H - D.BLIND_DEPTH
        cyl = cq.Solid.makeCylinder(D.BLIND_D / 2, D.BLIND_DEPTH + 1, cq.Vector(x, y, z0))
        cone = cq.Solid.makeCone(D.BLIND_D / 2, 0, TIP, cq.Vector(x, y, z0), cq.Vector(0, 0, -1))
        solid = solid.cut(cyl).cut(cone)
    for x, y in D.THRU_HOLES:
        solid = solid.cut(cq.Solid.makeCylinder(D.THRU_D / 2, D.PLATE_T + 2, cq.Vector(x, y, -1)))
    part = cq.Workplane('XY').add(solid)

    part = part.cut(_loop(D.pocket_segments(), D.PLATE_T - D.POCKET_DEPTH).extrude(D.POCKET_DEPTH + 1))
    part = part.cut(_loop(D.recess_segments(), D.PLATE_T - D.RECESS_DEPTH).extrude(D.RECESS_DEPTH + 1))
    return part.val()


# ----------------------------------------------------------------- checks
def _dir(p0, p1):
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    n = math.hypot(dx, dy)
    return dx / n, dy / n


def _kind(seg):
    if seg[0] == 'arc':
        return 'arc'
    dx, dy = _dir(seg[1], seg[2])
    if abs(dy) < 1e-9:
        return 'line X'
    if abs(dx) < 1e-9:
        return 'line Y'
    return 'line oblique'


def _arc_tangent_at(seg, at_start):
    (cx, cy), _ = D.arc_center(seg[1], seg[2], seg[3])
    p = seg[1] if at_start else seg[3]
    pts = D.arc_points(seg[1], seg[2], seg[3], 8)
    q = pts[1] if at_start else pts[-2]
    rx, ry = p[0] - cx, p[1] - cy
    tx, ty = -ry, rx
    n = math.hypot(tx, ty)
    tx, ty = tx / n, ty / n
    # orient along travel direction
    if (q[0] - p[0]) * tx + (q[1] - p[1]) * ty < 0:
        tx, ty = -tx, -ty
    return (tx, ty) if at_start else (-tx, -ty)


def arcs_tangent_to_oblique(segs):
    n = len(segs)
    count = 0
    for i, s in enumerate(segs):
        if s[0] != 'arc':
            continue
        for j, at_start in (((i - 1) % n, True), ((i + 1) % n, False)):
            if _kind(segs[j]) != 'line oblique':
                continue
            line_dir = _dir(segs[j][1], segs[j][2])
            t = _arc_tangent_at(s, at_start)
            if abs(abs(t[0] * line_dir[0] + t[1] * line_dir[1]) - 1.0) < 1e-6:
                count += 1
                break
    return count


def concave_arcs(segs):
    """Arcs that bend clockwise in a CCW loop: inside corners of the material
    (island) or of the void (pocket/recess are voids, so convex there)."""
    out = []
    for s in segs:
        if s[0] != 'arc':
            continue
        p0, pm, p1 = s[1], s[2], s[3]
        cross = (pm[0] - p0[0]) * (p1[1] - p0[1]) - (pm[1] - p0[1]) * (p1[0] - p0[0])
        out.append((D.arc_center(p0, pm, p1)[1], cross > 0))   # True = turns right (CW)
    return out


def exact_size(solid):
    b = Bnd_Box()
    BRepBndLib.AddOptimal_s(solid.wrapped, b, False, False)
    x0, y0, z0, x1, y1, z1 = b.Get()
    return x1 - x0, y1 - y0, z1 - z0


def faces_at(solid, z, tol=1e-4):
    res = []
    for f in solid.Faces():
        if f.geomType() != 'PLANE':
            continue
        bb = f.BoundingBox()
        if abs(bb.zmin - z) < tol and abs(bb.zmax - z) < tol:
            res.append(f)
    return res


def run_checks(solid):
    checks = []

    def add(group, req, value, ok):
        checks.append({'group': group, 'requirement': req, 'value': value, 'ok': bool(ok)})

    sx, sy, sz = exact_size(solid)
    add('Dimensions', 'Length X = 85 mm, width Y = 75 mm (stock size)',
        '%.2f x %.2f mm' % (sx, sy), abs(sx - 85) < 1e-6 and abs(sy - 75) < 1e-6)
    add('Dimensions', 'Part height = 30 - 1.25 = 28.75 mm', '%.2f mm' % sz, abs(sz - 28.75) < 1e-6)

    # island
    segs = D.island_segments()
    kinds = [_kind(s) for s in segs]
    arcs = [D.arc_center(s[1], s[2], s[3])[1] for s in segs if s[0] == 'arc']
    add('Island', 'At least 11 segments', '%d segments' % len(segs), len(segs) >= 11)
    add('Island', 'At least 5 arcs, radius 2-15 mm',
        '%d arcs, R%g-R%g' % (len(arcs), min(arcs), max(arcs)),
        len(arcs) >= 5 and min(arcs) >= 2 - 1e-9 and max(arcs) <= 15 + 1e-9)
    add('Island', 'Straight segments parallel to X and to Y',
        '%d along X, %d along Y' % (kinds.count('line X'), kinds.count('line Y')),
        kinds.count('line X') > 0 and kinds.count('line Y') > 0)
    add('Island', 'Oblique segments', '%d oblique (45 deg)' % kinds.count('line oblique'),
        kinds.count('line oblique') > 0)
    nt = arcs_tangent_to_oblique(segs)
    add('Island', 'Two arcs tangent to oblique segments', '%d arcs tangent' % nt, nt >= 2)
    add('Island', 'Island height 12-15 mm', '%g mm' % D.ISLAND_H, 12 <= D.ISLAND_H <= 15)

    footprint = D.polygon_area(D.loop_polygon(segs, 96))
    chamfer_strip = abs(D.ISLAND_PTS[D.CHAMFER_EDGE[0]][0] - D.ISLAND_PTS[D.CHAMFER_EDGE[1]][0]) * D.chamfer_run()
    top_faces = faces_at(solid, D.PART_H)
    top_area = sum(f.Area() for f in top_faces)
    add('Island', 'Area (excluding chamfer) 900-1500 mm2',
        'outline %.0f, top face %.0f (without chamfer strip %.0f), top face incl. holes %.0f mm2'
        % (footprint, footprint - chamfer_strip, chamfer_strip, top_area),
        all(900 <= a <= 1500 for a in (footprint, footprint - chamfer_strip, top_area)))

    # chamfer
    g, h = D.ISLAND_PTS[D.CHAMFER_EDGE[0]], D.ISLAND_PTS[D.CHAMFER_EDGE[1]]
    i_seg = [k for k, s in enumerate(segs) if s[0] == 'line'
             and math.dist(s[1], g[:2]) < 1e-9 and math.dist(s[2], h[:2]) < 1e-9][0]
    before, after = segs[i_seg - 1], segs[(i_seg + 1) % len(segs)]
    perp = (before[0] == 'line' and after[0] == 'line'
            and abs(sum(a * b for a, b in zip(_dir(before[1], before[2]), _dir(segs[i_seg][1], segs[i_seg][2])))) < 1e-9
            and abs(sum(a * b for a, b in zip(_dir(after[1], after[2]), _dir(segs[i_seg][1], segs[i_seg][2])))) < 1e-9)
    add('Chamfer', 'On a straight segment between two perpendicular straight segments',
        'edge G-H (%g mm), neighbours F-G and H-I' % math.dist(g[:2], h[:2]), perp)
    cf = [f for f in solid.Faces() if f.geomType() == 'PLANE'
          and abs(f.normalAt().z - math.cos(math.radians(D.CHAMFER_ANGLE))) < 1e-6]
    cbb = cf[0].BoundingBox() if cf else None
    ang = math.degrees(math.acos(cf[0].normalAt().z)) if cf else float('nan')
    add('Chamfer', 'Depth 4-9 mm, angle to XY 50-80 deg',
        'depth %.2f mm, angle %.1f deg, width %.2f mm' % (cbb.zlen, ang, cbb.ylen) if cf else 'not found',
        bool(cf) and 4 <= cbb.zlen + 1e-9 <= 9 and 50 <= ang <= 80)

    # pocket
    xs = [p[0] for p in D.POCKET_PTS]
    ys = [p[1] for p in D.POCKET_PTS]
    L, W = max(xs) - min(xs), max(ys) - min(ys)
    floor = faces_at(solid, D.PLATE_T - D.POCKET_DEPTH)
    add('Pocket', 'Depth 11-14 mm (IT7)', '%g mm, floor at Z=%.2f (%d face)' % (D.POCKET_DEPTH, D.PLATE_T - D.POCKET_DEPTH, len(floor)),
        11 <= D.POCKET_DEPTH <= 14 and len(floor) == 1)
    add('Pocket', 'Long side 22-27 mm, short side 10-17 mm (IT8)', '%g x %g mm, corners R%g' % (L, W, D.POCKET_PTS[0][2]),
        22 <= L <= 27 and 10 <= W <= 17)

    # side recess
    rsegs = D.recess_segments()
    part_box = box(0, 0, D.STOCK[0], D.STOCK[1])
    rpoly = Polygon(D.loop_polygon(rsegs, 96)).intersection(part_box)
    inner = [s for s in rsegs if not (s[0] == 'line' and (min(s[1][1], s[2][1]) < 0 and max(s[1][1], s[2][1]) <= 0
                                                          or min(s[1][1], s[2][1]) >= D.STOCK[1]))]
    r_arcs = [D.arc_center(s[1], s[2], s[3])[1] for s in rsegs if s[0] == 'arc']
    r_floor = faces_at(solid, D.PLATE_T - D.RECESS_DEPTH)
    r_floor_area = sum(f.Area() for f in r_floor)
    opens = [round(v, 3) for v in sorted({round(p[1], 3) for p in rpoly.exterior.coords if p[1] in (0.0, D.STOCK[1])})]
    add('Side recess', 'Depth 7-13 mm', '%g mm' % D.RECESS_DEPTH, 7 <= D.RECESS_DEPTH <= 13)
    add('Side recess', 'Open on two lateral faces', 'front face Y=0 and back face Y=75', opens == [0.0, 75.0])
    add('Side recess', 'Profile >= 6 segments, >= 3 arcs R2-R5',
        '%d wall segments + 2 open edges, %d arcs R%g' % (len(inner), len(r_arcs), min(r_arcs)),
        len(inner) >= 6 and len(r_arcs) >= 3 and all(2 <= r <= 5 for r in r_arcs))
    add('Side recess', 'Area >= 400 mm2', 'outline %.0f mm2, floor face %.0f mm2' % (rpoly.area, r_floor_area),
        rpoly.area >= 400 and r_floor_area >= 400)

    # holes
    limit = 0.55 * D.PART_H
    add('Blind holes', '3 holes, max D7, depth <= 55% of drilling plane to base',
        '3x D%g, depth %g + point %.2f = %.2f mm <= %.2f mm' % (D.BLIND_D, D.BLIND_DEPTH, TIP, D.BLIND_DEPTH + TIP, limit),
        len(D.BLIND_HOLES) == 3 and D.BLIND_D <= 7 and D.BLIND_DEPTH + TIP <= limit)
    thru_ok = all(not solid.isInside(cq.Vector(x, y, z)) for x, y in D.THRU_HOLES for z in (0.2, D.PLATE_T / 2))
    add('Through holes', '3 holes, max D8, through the part', '3x D%g, length %.2f mm' % (D.THRU_D, D.PLATE_T),
        len(D.THRU_HOLES) == 3 and D.THRU_D <= 8 and thru_ok)
    add('Process', 'Smallest drill D5', 'drills D%g and D%g' % (D.BLIND_D, D.THRU_D), min(D.BLIND_D, D.THRU_D) >= 5)

    # tool access: inside radii >= 2 mm (end mill D4)
    inside = []
    inside += [r for r, cw in concave_arcs(segs) if cw]                  # island: CW arc = inside corner
    inside += [r for r, cw in concave_arcs(D.pocket_segments()) if not cw]  # void: CCW arc = inside corner
    inside += [r for r, cw in concave_arcs(rsegs) if not cw]
    add('Process', 'Inside radii >= 2 mm (end mill >= D4)', 'smallest inside radius R%g' % min(inside), min(inside) >= 2)
    add('Process', 'Recess channel wide enough for end mill', 'channel %g mm' % (D.RECESS_PTS[0][0] - D.RECESS_PTS[2][0]),
        D.RECESS_PTS[0][0] - D.RECESS_PTS[2][0] >= 4)

    down = []
    for f in solid.Faces():
        n = f.normalAt()
        if n.z < -1e-6 and abs(f.BoundingBox().zmax) > 1e-6:
            down.append(f)
    add('Process', 'Single clamping: no face points downward except the base', '%d undercut faces' % len(down), not down)

    # wall thickness between features (2D)
    island_poly = Polygon(D.loop_polygon(segs, 96))
    pocket_poly = Polygon(D.loop_polygon(D.pocket_segments(), 96))
    edges = part_box.exterior
    gaps = {}
    for k, (x, y) in enumerate(D.THRU_HOLES, 1):
        c = Point(x, y).buffer(D.THRU_D / 2, 64)
        gaps['through hole %d - part edge' % k] = c.distance(LineString(edges.coords))
        gaps['through hole %d - island' % k] = c.distance(island_poly)
        gaps['through hole %d - pocket' % k] = c.distance(pocket_poly)
        gaps['through hole %d - recess' % k] = c.distance(rpoly)
    for k, (x, y) in enumerate(D.BLIND_HOLES, 1):
        c = Point(x, y).buffer(D.BLIND_D / 2, 64)
        gaps['blind hole %d - island edge' % k] = c.distance(LineString(island_poly.exterior.coords))
    gaps['pocket - island'] = pocket_poly.distance(island_poly)
    gaps['pocket - part edge'] = pocket_poly.distance(LineString(edges.coords))
    gaps['island - recess'] = island_poly.distance(rpoly)
    worst = min(gaps, key=gaps.get)
    add('Process', 'Walls between features >= 3 mm', 'thinnest: %s %.2f mm' % (worst, gaps[worst]), gaps[worst] >= 3)

    return checks, {
        'volume_mm3': solid.Volume(),
        'island_footprint_mm2': footprint,
        'island_top_face_mm2': top_area,
        'chamfer_strip_mm2': chamfer_strip,
        'recess_area_mm2': rpoly.area,
        'pocket_area_mm2': pocket_poly.area,
        'drill_point_mm': TIP,
        'blind_depth_limit_mm': limit,
        'gaps_mm': gaps,
    }


def main():
    solid = build_part()
    if not solid.isValid():
        sys.exit('model is not a valid solid')
    os.makedirs(os.path.join(ROOT, 'model'), exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'docs'), exist_ok=True)
    cq.exporters.export(solid, os.path.join(ROOT, 'model', 'Coursework1_Part.step'))
    cq.exporters.export(solid, os.path.join(ROOT, 'model', 'Coursework1_Part.stl'), tolerance=0.01, angularTolerance=0.1)

    checks, data = run_checks(solid)
    with open(os.path.join(ROOT, 'docs', 'requirements_check.json'), 'w') as fh:
        json.dump({'checks': checks, 'data': data}, fh, indent=2)

    for c in checks:
        print('%-4s %-14s %-62s %s' % ('OK' if c['ok'] else 'FAIL', c['group'], c['requirement'], c['value']))
    print('\nvolume %.0f mm3' % data['volume_mm3'])
    if not all(c['ok'] for c in checks):
        sys.exit(1)


if __name__ == '__main__':
    main()
