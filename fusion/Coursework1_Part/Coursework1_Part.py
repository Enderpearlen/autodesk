"""Coursework 1: design of a part for manufacturing on a milling machine.

Computer Aided Manufacturing Workshop, ETSIDI-UPM.

Autodesk Fusion script. It opens a new design and builds the complete solid
model with a named timeline:

    Base plate -> Island -> Island chamfer -> Blind holes -> Through holes
    -> Rectangular pocket -> Side recess -> Stock (hidden, for CAM)

Run it from Utilities > Add-Ins > Scripts and Add-Ins > "+" > "Script or
add-in from device", select this folder, then Run.

All design values are in millimetres in the DESIGN section. The geometry
functions below it are plain Python, so tools/build_reference.py imports this
file to build the same part in CadQuery and to check every requirement.
"""

import math
import traceback

try:
    import adsk.core
    import adsk.fusion
except ImportError:  # imported outside Fusion by the reference tools
    adsk = None


# ----------------------------------------------------------------- DESIGN (mm)
# X = length, Y = width, Z = height. Origin at the front-left-bottom corner.
STOCK = (85.0, 75.0, 30.0)
FACING = 1.25                      # removed from the top of the stock
PART_H = STOCK[2] - FACING         # 28.75, top of the island
ISLAND_H = 13.0
PLATE_T = PART_H - ISLAND_H        # 15.75, plate surface around the island

# Island outline, counter-clockwise: (x, y, fillet radius), 0 = sharp corner.
ISLAND_PTS = [
    (19.0, 27.0, 4.0),   # A
    (43.0, 27.0, 8.0),   # B  start of oblique B-C (45 deg)
    (58.0, 42.0, 6.0),   # C
    (58.0, 50.0, 5.0),   # D  start of oblique D-E (45 deg)
    (50.0, 58.0, 5.0),   # E
    (42.0, 58.0, 3.0),   # F  inside corner
    (42.0, 66.0, 0.0),   # G  edge G-H carries the chamfer
    (28.0, 66.0, 0.0),   # H
    (28.0, 58.0, 3.0),   # I  inside corner
    (19.0, 58.0, 3.0),   # J
    (19.0, 47.0, 0.0),   # K  notch start
    (19.0, 37.0, 0.0),   # L  notch end
]
# Edge index -> point the arc passes through (edge K-L is an R5 notch).
ISLAND_ARC_EDGES = {10: (24.0, 42.0)}
CHAMFER_EDGE = (6, 7)              # G-H, at y = 66, both neighbours along Y
CHAMFER_DEPTH = 6.0                # measured along Z
CHAMFER_ANGLE = 60.0               # degrees between chamfer face and XY

POCKET_PTS = [(10.0, 6.0, 3.0), (35.0, 6.0, 3.0), (35.0, 20.0, 3.0), (10.0, 20.0, 3.0)]
POCKET_DEPTH = 12.0

# Side recess: open on the front (y = 0) and back (y = 75) faces. The sketch
# runs 2 mm past both faces so the cut leaves no slivers.
RECESS_PTS = [
    (78.0, -2.0, 0.0),
    (78.0, 77.0, 0.0),
    (70.0, 77.0, 0.0),
    (70.0, 24.0, 4.0),
    (59.0, 24.0, 4.0),
    (59.0, 6.0, 4.0),
    (70.0, 6.0, 4.0),
    (70.0, -2.0, 0.0),
]
RECESS_DEPTH = 8.0

BLIND_HOLES = [(28.0, 35.0), (47.0, 42.0), (33.0, 50.0)]   # on the island top
BLIND_D = 6.0
BLIND_DEPTH = 10.0                 # cylindrical depth, drill point comes on top
THRU_HOLES = [(50.0, 12.0), (10.0, 66.0), (10.0, 38.0)]    # on the plate
THRU_D = 8.0
DRILL_POINT_ANGLE = 118.0


# ----------------------------------------------------------- 2D GEOMETRY (mm)
def _unit(x, y):
    length = math.hypot(x, y)
    return x / length, y / length


def outline_segments(pts, arc_edges=None):
    """Closed loop of ('line', p0, p1) and ('arc', p0, pmid, p1) segments.

    pts holds (x, y, r) corners; r > 0 rounds that corner with a tangent arc.
    arc_edges maps an edge index i (edge i -> i+1) to a point on an arc edge.
    """
    arc_edges = arc_edges or {}
    n = len(pts)
    corners = []
    for i, (x, y, r) in enumerate(pts):
        if r <= 0:
            corners.append(((x, y), (x, y), None))
            continue
        if i in arc_edges or (i - 1) % n in arc_edges:
            raise ValueError('corner %d: fillet next to an arc edge' % i)
        ax, ay = pts[i - 1][:2]
        bx, by = pts[(i + 1) % n][:2]
        u1 = _unit(x - ax, y - ay)
        u2 = _unit(bx - x, by - y)
        cross = u1[0] * u2[1] - u1[1] * u2[0]
        dot = u1[0] * u2[0] + u1[1] * u2[1]
        t = r * math.tan(math.atan2(abs(cross), dot) / 2.0)
        t1 = (x - u1[0] * t, y - u1[1] * t)
        t2 = (x + u2[0] * t, y + u2[1] * t)
        nx, ny = (-u1[1], u1[0]) if cross > 0 else (u1[1], -u1[0])
        c = (t1[0] + nx * r, t1[1] + ny * r)
        m = _unit(x - c[0], y - c[1])
        corners.append((t1, t2, ('arc', t1, (c[0] + m[0] * r, c[1] + m[1] * r), t2)))
    segs = []
    for i in range(n):
        if corners[i][2]:
            segs.append(corners[i][2])
        p0, p1 = corners[i][1], corners[(i + 1) % n][0]
        if i in arc_edges:
            segs.append(('arc', p0, arc_edges[i], p1))
        else:
            segs.append(('line', p0, p1))
    return segs


def arc_center(p0, pm, p1):
    """Centre and radius of the circle through three points."""
    ax, ay = p0
    bx, by = pm
    cx, cy = p1
    d = 2.0 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay)
          + (cx * cx + cy * cy) * (ay - by)) / d
    uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx)
          + (cx * cx + cy * cy) * (bx - ax)) / d
    return (ux, uy), math.hypot(ax - ux, ay - uy)


def arc_points(p0, pm, p1, n=48):
    """Points along the arc p0 -> pm -> p1, end points included."""
    (cx, cy), r = arc_center(p0, pm, p1)
    a0 = math.atan2(p0[1] - cy, p0[0] - cx)
    am = math.atan2(pm[1] - cy, pm[0] - cx)
    a1 = math.atan2(p1[1] - cy, p1[0] - cx)
    sweep = (a1 - a0) % (2 * math.pi)
    if (am - a0) % (2 * math.pi) > sweep:   # mid point not on the CCW sweep
        sweep -= 2 * math.pi
    return [(cx + r * math.cos(a0 + sweep * k / n), cy + r * math.sin(a0 + sweep * k / n))
            for k in range(n + 1)]


def loop_polygon(segs, n=48):
    """Segments as a closed polyline (list of points, first point not repeated)."""
    pts = []
    for s in segs:
        pts.extend([s[1]] if s[0] == 'line' else arc_points(s[1], s[2], s[3], n)[:-1])
    return pts


def polygon_area(pts):
    return 0.5 * sum(pts[i - 1][0] * p[1] - p[0] * pts[i - 1][1] for i, p in enumerate(pts))


def island_segments():
    return outline_segments(ISLAND_PTS, ISLAND_ARC_EDGES)


def pocket_segments():
    return outline_segments(POCKET_PTS)


def recess_segments():
    return outline_segments(RECESS_PTS)


def chamfer_run():
    """Horizontal width of the chamfer face."""
    return CHAMFER_DEPTH / math.tan(math.radians(CHAMFER_ANGLE))


def chamfer_triangle_yz():
    """Cutting triangle (y, z) for the chamfer on edge G-H, extended 1 mm past
    the top face and past the vertical face so the cut is clean."""
    y_edge = ISLAND_PTS[CHAMFER_EDGE[0]][1]
    run = chamfer_run()
    ext = 1.0 / math.tan(math.radians(CHAMFER_ANGLE))
    return [
        (y_edge - run - ext, PART_H + 1.0),           # chamfer line, above top face
        (y_edge + ext, PART_H - CHAMFER_DEPTH - 1.0),  # chamfer line, outside the island
        (y_edge + ext, PART_H + 1.0),
    ]


# ------------------------------------------------------------- FUSION BUILD
CM = 0.1   # Fusion API lengths are in centimetres


def _p3(x, y, z):
    return adsk.core.Point3D.create(x * CM, y * CM, z * CM)


def _vi(text):
    return adsk.core.ValueInput.createByString(text)


def _near_end(curve, target):
    s, e = curve.startSketchPoint, curve.endSketchPoint
    return s if s.geometry.distanceTo(target) <= e.geometry.distanceTo(target) else e


def _draw_loop(sketch, segs, z):
    """Draw a closed loop of segments on a sketch whose plane lies at model height z."""
    lines = sketch.sketchCurves.sketchLines
    arcs = sketch.sketchCurves.sketchArcs

    def sp(xy):
        return sketch.modelToSketchSpace(_p3(xy[0], xy[1], z))

    first = prev = None
    for k, seg in enumerate(segs):
        start = prev if prev is not None else sp(seg[1])
        end = first if (k == len(segs) - 1 and first is not None) else sp(seg[-1])
        if seg[0] == 'line':
            curve = lines.addByTwoPoints(start, end)
        else:
            curve = arcs.addByThreePoints(start, sp(seg[2]), end)
        if first is None:
            first = _near_end(curve, sp(seg[1]))
        prev = _near_end(curve, sp(seg[-1]))


def _profile(sketch, expected_mm2):
    """Profile whose area is closest to the expected area."""
    best, best_err = None, None
    for prof in sketch.profiles:
        area = prof.areaProperties(adsk.fusion.CalculationAccuracy.MediumCalculationAccuracy).area * 100.0
        err = abs(area - expected_mm2)
        if best is None or err < best_err:
            best, best_err = prof, err
    if best is None:
        raise RuntimeError('sketch "%s" has no closed profile' % sketch.name)
    if best_err > 0.02 * expected_mm2:
        raise RuntimeError('sketch "%s": no profile close to %.1f mm2' % (sketch.name, expected_mm2))
    return best


def _volume_mm3(body):
    return body.physicalProperties.volume * 1000.0


def _face_at(root, x, y, z):
    hits = root.findBRepUsingPoint(_p3(x, y, z), adsk.fusion.BRepEntityTypes.BRepFaceEntityType, -1, True)
    if hits is None or hits.count == 0:
        raise RuntimeError('no face found at (%.2f, %.2f, %.2f) mm' % (x, y, z))
    return hits.item(0)


def _holes(root, body, name, centers, z, dia, depth, warnings):
    """Simple drilled holes on the face at height z. depth None = through all."""
    face = _face_at(root, centers[0][0], centers[0][1], z)
    sk = root.sketches.add(face)
    sk.name = name + ' centres'
    pts = adsk.core.ObjectCollection.create()
    for x, y in centers:
        pts.add(sk.sketchPoints.add(sk.modelToSketchSpace(_p3(x, y, z))))

    holes = root.features.holeFeatures
    expected = len(centers) * math.pi * (dia / 2.0) ** 2 * (depth if depth else z)
    extents = ['distance'] if depth else ['all+', 'all-', 'distance']
    for extent in extents:
        before = _volume_mm3(body)
        try:
            hin = holes.createSimpleInput(_vi('%g mm' % dia))
            hin.setPositionBySketchPoints(pts)
            hin.tipAngle = _vi('%g deg' % DRILL_POINT_ANGLE)
            if extent == 'all+':
                hin.setAllExtent(adsk.fusion.ExtentDirections.PositiveExtentDirection)
            elif extent == 'all-':
                hin.setAllExtent(adsk.fusion.ExtentDirections.NegativeExtentDirection)
            else:
                hin.setDistanceExtent(_vi('%g mm' % (depth if depth else z)))
            feat = holes.add(hin)
        except Exception:
            continue
        if before - _volume_mm3(body) > 0.9 * expected:
            feat.name = name
            if not depth and extent == 'distance':
                warnings.append('%s: made as a %g mm deep hole instead of "through all".' % (name, z))
            return feat
        feat.deleteMe()
    raise RuntimeError('%s: the hole command did not remove material' % name)


def build(app):
    warnings = []
    doc = app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
    try:
        doc.name = 'Coursework1_Part'
    except Exception:
        pass   # an unsaved document may refuse a new name; it is set on save
    design = adsk.fusion.Design.cast(app.activeProduct)
    design.designType = adsk.fusion.DesignTypes.ParametricDesignType
    design.fusionUnitsManager.distanceDisplayUnits = adsk.fusion.DistanceUnits.MillimeterDistanceUnits
    root = design.rootComponent
    sketches = root.sketches
    extrudes = root.features.extrudeFeatures
    new_body = adsk.fusion.FeatureOperations.NewBodyFeatureOperation
    join = adsk.fusion.FeatureOperations.JoinFeatureOperation
    cut = adsk.fusion.FeatureOperations.CutFeatureOperation
    step = 'start'

    try:
        step = 'Base plate'
        sk = sketches.add(root.xYConstructionPlane)
        sk.name = 'Base plate outline'
        sk.sketchCurves.sketchLines.addTwoPointRectangle(_p3(0, 0, 0), _p3(STOCK[0], STOCK[1], 0))
        feat = extrudes.addSimple(_profile(sk, STOCK[0] * STOCK[1]), _vi('%g mm' % PLATE_T), new_body)
        feat.name = 'Base plate'
        body = feat.bodies.item(0)
        body.name = 'Part'

        step = 'Plate top plane'
        pin = root.constructionPlanes.createInput()
        pin.setByOffset(root.xYConstructionPlane, _vi('%g mm' % PLATE_T))
        plate_plane = root.constructionPlanes.add(pin)
        plate_plane.name = 'Plate top Z=%g' % PLATE_T

        step = 'Island'
        segs = island_segments()
        sk = sketches.add(plate_plane)
        sk.name = 'Island outline'
        _draw_loop(sk, segs, PLATE_T)
        prof = _profile(sk, polygon_area(loop_polygon(segs)))
        feat = extrudes.addSimple(prof, _vi('%g mm' % ISLAND_H), join)
        feat.name = 'Island'

        step = 'Island chamfer'
        tri = chamfer_triangle_yz()
        sk = sketches.add(root.yZConstructionPlane)
        sk.name = 'Island chamfer section'
        lines = sk.sketchCurves.sketchLines
        p = [sk.modelToSketchSpace(_p3(0, y, z)) for y, z in tri]
        l1 = lines.addByTwoPoints(p[0], p[1])
        l2 = lines.addByTwoPoints(l1.endSketchPoint, p[2])
        lines.addByTwoPoints(l2.endSketchPoint, l1.startSketchPoint)
        tri_area = abs(polygon_area(tri))
        ein = extrudes.createInput(_profile(sk, tri_area), cut)
        ein.setSymmetricExtent(_vi('%g mm' % (4 * STOCK[0])), True)
        feat = extrudes.add(ein)
        feat.name = 'Island chamfer %gx%g deg' % (CHAMFER_DEPTH, CHAMFER_ANGLE)

        step = 'Blind holes'
        _holes(root, body, 'Blind holes 3x D%g depth %g' % (BLIND_D, BLIND_DEPTH),
               BLIND_HOLES, PART_H, BLIND_D, BLIND_DEPTH, warnings)

        step = 'Through holes'
        _holes(root, body, 'Through holes 3x D%g' % THRU_D,
               THRU_HOLES, PLATE_T, THRU_D, None, warnings)

        step = 'Rectangular pocket'
        segs = pocket_segments()
        sk = sketches.add(plate_plane)
        sk.name = 'Pocket outline'
        _draw_loop(sk, segs, PLATE_T)
        feat = extrudes.addSimple(_profile(sk, polygon_area(loop_polygon(segs))),
                                  _vi('-%g mm' % POCKET_DEPTH), cut)
        feat.name = 'Rectangular pocket depth %g' % POCKET_DEPTH

        step = 'Side recess'
        segs = recess_segments()
        sk = sketches.add(plate_plane)
        sk.name = 'Side recess outline'
        _draw_loop(sk, segs, PLATE_T)
        feat = extrudes.addSimple(_profile(sk, polygon_area(loop_polygon(segs))),
                                  _vi('-%g mm' % RECESS_DEPTH), cut)
        feat.name = 'Side recess depth %g' % RECESS_DEPTH

        step = 'Stock'
        sk = sketches.add(root.xYConstructionPlane)
        sk.name = 'Stock outline'
        sk.sketchCurves.sketchLines.addTwoPointRectangle(_p3(0, 0, 0), _p3(STOCK[0], STOCK[1], 0))
        feat = extrudes.addSimple(_profile(sk, STOCK[0] * STOCK[1]), _vi('%g mm' % STOCK[2]), new_body)
        feat.name = 'Stock %gx%gx%g (for CAM)' % STOCK
        stock = feat.bodies.item(0)
        stock.name = 'Stock'
        stock.isLightBulbOn = False
    except Exception:
        raise RuntimeError('Step "%s" failed:\n%s' % (step, traceback.format_exc()))

    app.activeViewport.fit()
    return body, warnings


def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        body, warnings = build(app)
        msg = ('Coursework 1 part created.\n\nBody "Part": %.0f mm3, height %.2f mm.\n'
               'The hidden body "Stock" is the 85 x 75 x 30 mm raw block for CAM.'
               % (_volume_mm3(body), PART_H))
        if warnings:
            msg += '\n\nNotes:\n- ' + '\n- '.join(warnings)
        ui.messageBox(msg, 'Coursework 1')
    except Exception:
        if ui:
            ui.messageBox('Coursework 1 script stopped.\n\n%s' % traceback.format_exc(), 'Coursework 1')
