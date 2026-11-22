"""Draw the little pencil doodles used in place of emojis in the RSVP form (a heart and a hugging
smiley): each stroke is a base shape with a gentle, seeded wobble, drawn as a smooth curve; strokes
overshoot and some get a faint second pass. Prints them as JSON; run from the repo root with
python3 tools/make_doodles.py, and copy the paths into components/invitation/Doodle.tsx."""
import json, math, random

def wobble(seed, amp, n_waves=3):
    r = random.Random(seed)
    waves = [(r.uniform(1.2, 3.5), r.uniform(0, 6.3), r.uniform(.5, 1)) for _ in range(n_waves)]
    total = sum(w[2] for w in waves)
    return lambda u: amp * sum(a * math.sin(f * u * 2 * math.pi + p) for f, p, a in waves) / total

def path(pts):
    # Catmull-Rom through the points, as cubic Béziers
    f = lambda v: f"{v:.1f}".rstrip("0").rstrip(".") if abs(v) >= .05 else "0"
    d = f"M{f(pts[0][0])} {f(pts[0][1])}"
    for i in range(len(pts) - 1):
        p0 = pts[max(i - 1, 0)]; p1 = pts[i]; p2 = pts[i + 1]; p3 = pts[min(i + 2, len(pts) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}"
    return d

def stroke(fn, t0, t1, n, seed, amp, offset=0.0):
    wx, wy = wobble(seed, amp), wobble(seed + 99, amp)
    pts = []
    for i in range(n + 1):
        u = i / n
        x, y, nx, ny = fn(t0 + (t1 - t0) * u)
        pts.append((x + wx(u) + nx * offset, y + wy(u) + ny * offset))
    return path(pts)

def rot(x, y, deg, cx=12, cy=12):
    a = math.radians(deg); dx, dy = x - cx, y - cy
    return cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)

# --- heart: the classic curve, the left lobe a little fuller, tilted a touch
def heart(t):
    x = 16 * math.sin(t) ** 3
    y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
    if x < 0: x *= 1.08
    X, Y = 12 + .48 * x, 12 + .5 * (y - 2.6)
    X, Y = rot(X, Y, -6)
    nx, ny = X - 12, Y - 11; m = math.hypot(nx, ny) or 1
    return X, Y, nx / m, ny / m

# --- face: a slightly oval, uneven circle
def face(t):
    r = 7.3 + .25 * math.sin(2 * t + .7)
    return 12 + r * 1.03 * math.cos(t), 11.3 + r * .97 * math.sin(t), math.cos(t), math.sin(t)

def arc(cx, cy, w, h, tilt=0):
    return lambda s: (*rot(cx + s * w, cy - h * (1 - s * s), tilt, cx, cy), 0, 0)

def mitten(cx, cy, rx, ry, tilt):
    def f(t):
        x, y = cx + rx * math.cos(t), cy + ry * math.sin(t)
        if math.sin(t) > 0: y += .9 * math.sin(t)      # the hand runs on a little at the bottom
        return (*rot(x, y, tilt, cx, cy), 0, 0)
    return f

pi = math.pi
out = {
  "heart": [
    [stroke(heart, pi - .16, 3 * pi + .34, 46, 3, .45), .86, 1.1],
    [stroke(heart, pi + .55, pi + 1.95, 16, 8, .22, .45), .3, .8],
    [stroke(heart, 2 * pi + .7, 2 * pi + 1.6, 10, 12, .2, .4), .25, .75],
  ],
  "hug": [
    [stroke(face, math.radians(-112), math.radians(-112 + 376), 40, 21, .4), .86, 1.1],
    [stroke(face, math.radians(195), math.radians(275), 12, 25, .2, .45), .3, .8],
    [stroke(arc(9.3, 10.2, 1.15, .95, -4), -1, 1, 6, 31, .08), .85, 1.05],
    [stroke(arc(14.7, 10, 1.1, .9, 5), -1, 1, 6, 33, .08), .85, 1.05],
    [stroke(arc(12.1, 12.3, 3.1, -2.1, -3), -1.02, 1.04, 10, 37, .12), .86, 1.1],
    # two open hands held up in front of the cheeks (they hide the face's outline behind them),
    # each with a hint of fingers, and the arms running down out of the picture
    [stroke(mitten(6.5, 15.2, 2.35, 2.45, 24), pi * .9, pi * 2.12, 14, 41, .14), .85, 1.05, "var(--paper)"],
    [stroke(mitten(17.5, 15.1, 2.3, 2.45, -22), pi * .88, pi * 2.1, 14, 43, .14), .85, 1.05, "var(--paper)"],
    [stroke(lambda s: (5.1 + .4 * s, 17.4 + 3 * s, 0, 0), 0, 1, 3, 51, .1), .8, 1],
    [stroke(lambda s: (18.9 - .4 * s, 17.3 + 3 * s, 0, 0), 0, 1, 3, 53, .1), .8, 1],
    [stroke(lambda s: (5.6 + .6 * s, 13.6 + 1.3 * s, 0, 0), 0, 1, 3, 47, .05), .55, .8],
    [stroke(lambda s: (6.9 + .5 * s, 13.1 + 1.4 * s, 0, 0), 0, 1, 3, 48, .05), .55, .8],
    [stroke(lambda s: (18.4 - .6 * s, 13.5 + 1.3 * s, 0, 0), 0, 1, 3, 49, .05), .55, .8],
    [stroke(lambda s: (17.1 - .5 * s, 13 + 1.4 * s, 0, 0), 0, 1, 3, 50, .05), .55, .8],
  ],
}
print(json.dumps(out))
