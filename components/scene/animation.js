// The animated invitation: wind in the trees, the owl, the deer, the children and Nóri & Max,
// drawn on two canvases inside `root` (see Scene.tsx). Returns a function that stops it.
export function startScene(root) {

  // Drawing size in its own pixels. Every position below is in these pixels.
  const W = 1536, H = 1024;

  // ===== Tuning =====================================================================

  // Wind in the canopy: 97 small leaf/twig fragments cut from the drawing (assets/trees/), each
  // rotating around its attachment point. House, trunks, fence stay still. The motion is the
  // asset pack's "motion v3": a clear sway with gusts, never swinging a piece past ~38°.
  // ?wind=0.6 for calmer, ?windSpeed=0.8 for slower.
  const query = new URLSearchParams(location.search);
  const WIND = {
    base: "/assets/trees/",
    intensity: Number(query.get("wind")) || 1,
    speed: Number(query.get("windSpeed")) || 1,
    rampIn: 2.5,       // seconds to ease the wind in after the page opens
  };

  const OWL = {
    bodyLift: 14,         // perched feet → body centre in flight (the owl is 30 px tall)
    firstFlightAt: 12,    // seconds after opening
    restBetween: 28,      // seconds perched before flying back
    flightTime: 5.5,      // seconds in the air
    perches: [            // where the feet sit on each branch
      { x: 315, y: 301 }, // left tree (as on the invite)
      { x: 1289, y: 280 }, // big right tree
    ],
  };

  // The deer comes out of the woods on the left, passing behind the two big trunks, walks out
  // to the middle of the left garden and looks around, then turns back and wanders off into
  // the forest, between the trunks.
  // Legs: walk to [x, y] (+size: it ends the leg at this size) | idle s | turn s (it turns round on the
  //       spot, through a view from the front) | away to [x, y] (walking off, fading).
  const DEER = {
    firstAt: 22,          // seconds after opening
    every: 60,            // then once a minute
    walkSpeed: 50,        // px / s
    start: [-90, 745],
    legs: [
      { walk: [140, 780] },        // out of the woods, behind the far-left trunk
      { walk: [402, 802] },        // in front of the second trunk, into the left garden: it stops right under the
                                   // first window, clear of the thin trunk in front of the wall (x ≈ 460), and
                                   // far enough forward that the house's base line passes behind its neck
                                   // (10 px further back, the line ran exactly along its back)
      { idle: 6.5 },               // looks around, and once at us
      { turn: 0.6 },               // turns round, head towards us
      { walk: [240, 748], size: 0.88 },   // back towards the trees: further from us, so a little smaller
                                   // (the frames that follow, seen from behind, are drawn at 72 px for 82)
      { away: [172, 690], dur: 6 } // and wanders off into the forest
    ],
    // outlines of the two big left trunks, with the y of their roots: the deer is hidden by a
    // trunk only while its feet are further back (higher up) than that trunk's roots
    trunks: [
      { roots: 790, shape: [[150, 480], [192, 480], [162, 600], [140, 700], [118, 790], [70, 790], [100, 700], [127, 600]] },
      { roots: 778, shape: [[240, 480], [258, 480], [238, 600], [232, 700], [240, 760], [262, 774], [182, 780], [205, 700], [222, 600]] },
    ],
  };

  // The children hide behind the big tree on the right. The girl leans out on one side, the
  // boy on the other; the girl bolts and the boy chases her across the front lawn. They turn
  // back to the tree. A few seconds into the chase Nayan strolls out and leans back against the
  // trunk, hands in pockets, one knee bent. When the kids have run off behind the house he stands
  // up and jogs after them.
  // Steps: to [x, y] (+speed, +clip: run by default, +face: keep facing that way) | clip (+dur) |
  //        idle s | until s (wait for a cue) | face.
  // Everyone is drawn at the size of their frames (1:1 with the drawing).
  // a wide loop: out along the front of the lawn, round, and back higher up the lawn, so they
  // never run into each other (the boy is ~1 s behind her on the same loop)
  // (turning right of the gate pillar, x 995–1065, which stands in front of the lawn)
  const CHASE = [[1290, 800], [1185, 806], [1125, 796], [1102, 774], [1128, 751], [1205, 743], [1300, 756]];
  const BOY_PEEK_X = 1432;
  const KIDS = {
    firstAt: 5,
    every: 75,
    // the big right trunk (kids behind it are hidden) and the house (kids behind it vanish)
    // (traced on the trunk's drawn outline, so a child beside it is cut exactly at the line)
    trunk: [[1359, 600], [1398, 600], [1397, 650], [1403, 670], [1410, 700], [1418, 720],
            [1426, 740], [1437, 760], [1444, 780], [1450, 795], [1362, 795], [1362, 762],
            [1366, 752], [1368, 740], [1369, 700], [1368, 650], [1366, 630]],
    house: { baseY: 730, outline: [[316, 731], [316, 585], [290, 585], [476, 494], [700, 494],
             [820, 442], [940, 494], [1202, 494], [1258, 585], [1228, 585], [1228, 731]] },
    cast: [
      // she waits right behind the trunk, out of sight; leans out on the left for one long peek, and
      // ducks back out of sight before she bolts
      { id: "girl", speed: 105, start: [1394, 786], steps: [
        { face: "left" }, { idle: 1.0 }, { to: [1372, 786], clip: "peek", speed: 55, face: "left" },
        { clip: "peekLong" }, { to: [1394, 786], clip: "peek", speed: 55, face: "left" }, { until: 6.2 },
        // she leaves the loop before its last stretch and curls round to the front of the lawn, so her
        // brother, a second behind on the same loop, passes well behind her (they used to cross)
        ...CHASE.slice(0, -1).map(p => ({ to: p })), { to: [1262, 770] }, { to: [1215, 802] }, { until: 13.6 }, { face: "right" },
        { until: 14.8 }, { clip: "hop" }, { clip: "wave" }, { until: 20.4 },
        // follows her brother round the corner of the house
        { to: [1288, 750] }, { to: [1240, 728] }, { to: [1150, 724] },
      ] },
      // he does the same on the right, a beat after her, leaning far enough out for his whole head
      // to clear the trunk
      { id: "boy", speed: 105, start: [1408, 787], steps: [
        { idle: 1.8 }, { to: [BOY_PEEK_X, 787], clip: "peek", speed: 55, face: "right" },
        { clip: "peekLong" }, { to: [1408, 787], clip: "peek", speed: 55, face: "right" }, { until: 7.2 },
        // (she arrives first and stops further left and further forward, so he never runs across her)
        ...CHASE.map(p => ({ to: p })), { to: [1265, 778] }, { until: 13.6 }, { face: "right" },
        { until: 14.6 }, { clip: "wave" }, { until: 19.6 },
        // off behind the house: round its corner on the level, just behind its base line (y 731), so
        // he slips behind the wall with his feet on the ground (not climbing the picture beside it)
        { to: [1298, 748] }, { to: [1240, 728] }, { to: [1150, 722] },
      ] },
      { id: "nayan", speed: 90, start: [1392, 788], steps: [
        // ~3 s into the chase he strolls out (one step every two frames: 15 px a frame, so his feet
        // don't slide), faces us for a moment, and settles back against the trunk, chilling
        { until: 9.0 }, { to: [1344, 790], clip: "walk", speed: 45 }, { face: "right" }, { idle: 0.35 },
        { clip: "lean", dur: 10.8 },               // until the kids have gone behind the house
        // then he pushes off the tree, waves to us, and jogs off after them, round the corner of the house
        { face: "left" }, { clip: "pushOff", dur: 0.35 }, { face: "right" }, { clip: "wave" }, { idle: 0.25 },
        { to: [1296, 752], speed: 70 }, { to: [1240, 727], speed: 70 }, { to: [1140, 722], speed: 70 },
      ] },
    ],
  };

  // Nóri & Max: after the deer has gone, the front doors
  // open and they step out onto the steps. A half-second pause, then they wave hello, look
  // at each other, kiss, go back in and close the doors. Timing follows the first couple kit's
  // couple-door.js. Max is 104 px tall (the doorway opening is 113 px).
  const COUPLE = {
    firstAt: 52,          // just after the deer has gone back into the forest
    every: 60,            // then once a minute, right after each deer visit
    opening: { x: 784, y: 619, w: 58, h: 113 },   // the real doorway in the drawing
    doorX: 813, doorY: 733, stepX: 815, stepY: 760,
    length: 11.9,         // seconds, from the doors starting to open to shut again
    cueAt: 9.0,           // the first kiss is over: show the scroll arrow in full (class "cue" on the scene)
  };
  // The scroll arrow is there, faintly, from a few seconds in (class "hint"), so nobody has to wait
  // for the kiss to find the invitation card; after the kiss it comes up in full.
  const ARROW = { hintAt: 4 };

  // Characters: the asset pack in assets/characters/ (see tools/import_assets.py). Every frame
  // is a 128 × 128 cell at the drawing's own scale, used exactly as delivered: never resized.
  // Sheets hold 3 × 2 cells; frame i is in sheet floor(i / 6), cell i % 6. Clips come from the
  // pack's animations.json, with these changes:
  const CAST = "/assets/characters/";
  const peekLong = { frames: [16, 16, 17, 17, 17, 17, 16], fps: 2 };   // one long peek, 3.5 s
  const CLIP_CHANGES = {
    // (the pack's first landing frame, 13, is drawn about a third smaller than its neighbours and made
    // the owl shrink for a blink: it lands on the half-folded frame, held a little, then settles)
    owl: { land: { frames: [14, 14, 15], fps: 6.6667 } },
    deer: { idle: { frames: [0, 0, 1, 0, 0, 2, 2, 2, 0, 3, 0, 0, 0], fps: 2 } },   // one look at us (frame 2)
    // the pack's hop lift is in the old 512 px units: these are the same moves at 1:1
    girl: { hop: { frames: [12, 13, 14, 15], fps: 7, offsetY: [0, -2, -5, -1] }, peekLong },
    boy:  { hop: { frames: [12, 13, 14, 15], fps: 7, offsetY: [0, -2, -6, -1] }, peekLong },
    nayan: {
      run: { frames: [4, 5, 6, 7, 8, 9, 10, 11], fps: 6.5, loop: true },   // an easy jog (70 px/s)
      walk: { frames: [14, 15], fps: 3, loop: true },      // a stroll: a 30 px step every two frames (45 px/s)
      pushOff: { frames: [12], fps: 1, loop: true },       // weight forward, coming off the trunk
    },
  };
  const SPRITES = {};      // name → { sheets: [img], anchor, clips }, filled at load
  let CELL = 128, COLS = 3, PER_SHEET = 6;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Wind (from the kit's forest-wind.js) =======================================
  function hash1(n, seed = 1) {
    let x = (n ^ Math.imul(seed, 0x9e3779b9)) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967295 * 2 - 1;
  }
  function smoothNoise(t, seed = 1) {
    const k = Math.floor(t), f = t - k, u = f * f * f * (f * (f * 6 - 15) + 10);
    return hash1(k, seed) * (1 - u) + hash1(k + 1, seed) * u;
  }
  // Rotation (radians) of one fragment: a travelling swell, slow gusts and the piece's own
  // flutter, softly limited to ±0.66 rad (from the asset pack's tree-wind.js).
  function breezeAngle(piece, time, intensity) {
    if (!intensity) return 0;
    time *= WIND.speed;
    const t = time * 1.15 - piece.lag * 0.55;
    const swell = 0.55 * Math.sin(t * 0.92 + 0.85 * smoothNoise(t / 8.5, 17))
                + 0.26 * Math.sin(t * 1.51 + 0.6 * smoothNoise(t / 13.7, 41))
                + 0.19 * smoothNoise(t / 2.8, 59);
    const local = 0.20 * smoothNoise(time / 1.35 + piece.phase, 103)
                + 0.10 * Math.sin(time * 2.3 + piece.phase + 0.4 * smoothNoise(time / 3.1 + piece.phase, 211));
    return 0.66 * Math.tanh(12.6 * piece.amplitude * piece.depth * intensity * (swell + local) / 0.66);
  }

  // ===== DOM ==========================================================================
  const scene = root;
  const canvas = root.querySelector("#trees");
  const lifeCanvas = root.querySelector("#life");
  const life = lifeCanvas.getContext("2d");
  const fallback = root.querySelector("#fallback");

  // ===== Layout: fill the screen like the invite, keep both owl branches and the
  // children (bottom of the drawing) visible ===========================================
  const view = { x: 0, y: 0, s: 1, vw: 1, vh: 1, dpr: 1 };
  function layout() {
    // the scene's own box: the whole window, or (phones held upright) a band at the top
    const vw = scene.clientWidth || window.innerWidth, vh = scene.clientHeight || window.innerHeight;
    const cover = Math.max(vw / W, vh / H);
    const contain = Math.min(vw / W, vh / H);
    const keepRange = vw / 1350;               // x 100 → 1450 (deer, owl, right tree) stays on screen
    // very wide screens (phones held sideways, ultrawide monitors): filling the width would crop the
    // owl's branches and its flight off the top, so the drawing stops growing once y 190 → 1015 fills
    // the height; the paper shows on both sides (the drawing fades to white at its edges)
    const keepSky = vh / (1015 - 190);
    const s = Math.max(contain, Math.min(cover, keepRange, keepSky));
    let x, y;
    if (W * s <= vw) x = (vw - W * s) / 2;
    else x = Math.min(0, Math.max(vw - W * s, vw / 2 - 775 * s));    // centred on the door
    if (H * s <= vh) y = (vh - H * s) / 2;
    else y = Math.min(0, Math.max(vh - H * s, vh - 1015 * s));       // crop the sky, keep the kids
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    Object.assign(view, { x, y, s, vw, vh, dpr });
    // where the drawing ends on screen: the scroll arrow sits just below it on tall screens
    scene.style.setProperty("--art-bottom", Math.round(y + H * s) + "px");
    // Debug helper for tuning: ?focus=1300,700,4 zooms on a point of the drawing.
    const focus = query.get("focus");
    if (focus) {
      const [fx, fy, fs] = focus.split(",").map(Number);
      Object.assign(view, { s: fs, x: vw / 2 - fx * fs, y: vh / 2 - fy * fs });
    }

    Object.assign(fallback.style, {
      left: "0", top: "0", width: W + "px", height: H + "px", objectFit: "fill",
      transformOrigin: "0 0", transform: `translate(${x}px, ${y}px) scale(${s})`,
    });
    for (const c of [canvas, lifeCanvas]) {
      c.width = Math.round(vw * dpr);
      c.height = Math.round(vh * dpr);
    }
  }

  // ===== Trees canvas (2D) ==========================================================
  const trees = canvas.getContext("2d");
  const forest = {};   // rig, background, atlas

  function drawForest(t, strength) {
    trees.setTransform(1, 0, 0, 1, 0, 0);
    trees.fillStyle = "#fefefe";
    trees.fillRect(0, 0, canvas.width, canvas.height);
    trees.setTransform(view.dpr * view.s, 0, 0, view.dpr * view.s, view.dpr * view.x, view.dpr * view.y);
    trees.imageSmoothingQuality = "high";
    trees.drawImage(forest.background, 0, 0, W, H);
    for (const p of forest.rig.pieces) {
      const [px, py] = p.pivot, [x, y, w, h] = p.source, [ax, ay] = p.atlas;
      trees.save();
      trees.translate(px, py);
      trees.rotate(breezeAngle(p, t, strength));
      trees.drawImage(forest.atlas, ax, ay, w, h, x - px, y - py, w, h);
      trees.restore();
    }
  }

  const load = src => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

  // ===== Sprites ======================================================================
  const clamp01 = u => Math.min(Math.max(u, 0), 1);
  const smooth = (a, b, u) => { const x = clamp01((u - a) / (b - a)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, u) => a + (b - a) * u;
  const cubic = (p0, p1, p2, p3, u) => {
    const v = 1 - u;
    return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3;
  };
  const clipLength = c => c.frames.length / c.fps;

  // Draw one frame (global index) of a character at 1:1, its anchor at (x, y) in the drawing.
  // Positions snap to whole drawing pixels, so the frame's pixels sit on the drawing's pixels and
  // are scaled exactly like the house and the trees.
  // (size: only the deer uses it, as it turns round and as it walks away from us; [width, height])
  function drawFrame(sp, index, x, y, anchor, flip = false, alpha = 1, size = null) {
    const img = sp.sheets[Math.floor(index / PER_SHEET)], c = index % PER_SHEET;
    life.save();
    life.globalAlpha = alpha;
    life.translate(Math.round(x), Math.round(y));
    if (size) life.scale(size[0], size[1]);
    if (flip) life.scale(-1, 1);
    life.drawImage(img, (c % COLS) * CELL, Math.floor(c / COLS) * CELL, CELL, CELL, -anchor[0], -anchor[1], CELL, CELL);
    life.restore();
  }
  // Draw the frame of a clip at `seconds` into it.
  function drawSprite(id, clipName, seconds, x, y, flip = false, alpha = 1, size = null) {
    const sp = SPRITES[id], clip = sp.clips[clipName];
    const n = Math.max(0, Math.floor(seconds * clip.fps));
    const step = clip.loop ? n % clip.frames.length : Math.min(n, clip.frames.length - 1);
    drawFrame(sp, clip.frames[step], x, y + (clip.offsetY ? clip.offsetY[step] : 0), clip.anchor || sp.anchor, flip, alpha, size);
  }

  // ===== Owl ==========================================================================
  const owl = { perch: 0, state: "perched", since: 0, nextFlightAt: OWL.firstFlightAt };

  // the owl's two branches are part of the still background
  function feetOn(i) {
    return OWL.perches[i];
  }

  // Blinks while perched: 0.15 s, at uneven intervals of 3 to 7 s, sometimes twice in a row.
  const OWL_BLINKS = [2.6, 4.1, 0.4, 5.3, 3.2, 6.7, 3.9, 0.35, 4.8];   // seconds between blinks, repeating
  const OWL_BLINKS_TOTAL = OWL_BLINKS.reduce((a, b) => a + b, 0);
  function owlBlinks(seconds) {
    let u = seconds % OWL_BLINKS_TOTAL;
    for (const gap of OWL_BLINKS) {
      if (u < gap) return gap - u < 0.15;
      u -= gap;
    }
    return false;
  }

  function drawOwl(t) {
    const bodyLift = OWL.bodyLift;
    const here = feetOn(owl.perch);
    const there = feetOn(1 - owl.perch);
    const dir = Math.sign(OWL.perches[1 - owl.perch].x - OWL.perches[owl.perch].x);
    const faceLeft = dir < 0;
    const local = t - owl.since;

    if (owl.state === "perched") {
      // look towards the other tree; a quick blink now and then, never on a beat
      drawFrame(SPRITES.owl, owlBlinks(local) ? 1 : 0, here.x, here.y, SPRITES.owl.anchor, faceLeft);
      if (!reduceMotion && t >= owl.nextFlightAt) { owl.state = "takeoff"; owl.since = t; }
      return;
    }
    if (owl.state === "takeoff") {
      drawSprite("owl", "takeoff", local, here.x, here.y, faceLeft);
      if (local >= clipLength(SPRITES.owl.clips.takeoff)) { owl.state = "fly"; owl.since = t; }
      return;
    }
    if (owl.state === "fly") {
      const u = clamp01(local / OWL.flightTime);
      const ax = here.x, ay = here.y - bodyLift, bx = there.x, by = there.y - bodyLift;
      const span = bx - ax;
      // up off the branch, a long gentle swoop above the roof line, flare up to land
      const c1x = ax + span * 0.2, c1y = Math.min(ay, by) - 50;
      const c2x = ax + span * 0.72, c2y = Math.max(ay, by) + 80;
      // a soft start and stop (the steeper cubic ease kept it flapping over each branch for a second)
      const e = smooth(0, 1, u);
      const x = cubic(ax, c1x, c2x, bx, e), y = cubic(ay, c1y, c2y, by, e);
      const gliding = u > 0.4 && u < 0.62;
      drawSprite("owl", gliding ? "glide" : "fly", local, x, y, faceLeft);
      if (u >= 1) { owl.state = "land"; owl.since = t; owl.perch = 1 - owl.perch; }
      return;
    }
    // land: it turns as it flares onto the branch, so it settles already looking back at the tree it
    // came from (the flying frames are seen from the front, so the turn doesn't show; landing facing
    // the other way, it used to flip round in a single frame a moment later)
    drawSprite("owl", "land", local, here.x, here.y, faceLeft);
    if (local >= clipLength(SPRITES.owl.clips.land)) {
      owl.state = "perched"; owl.since = t; owl.nextFlightAt = t + OWL.restBetween;
    }
  }

  // ===== Deer =========================================================================
  // turn the legs into timed segments
  const deerSegs = (() => {
    const segs = [];
    let t = 0, [x, y] = DEER.start, flip = false;
    for (const leg of DEER.legs) {
      if (leg.idle) { segs.push({ t0: t, t1: t + leg.idle, clip: "idle", x0: x, y0: y, x1: x, y1: y, flip }); t += leg.idle; continue; }
      if (leg.turn) { segs.push({ t0: t, t1: t + leg.turn, turn: true, x0: x, y0: y, x1: x, y1: y, flip }); t += leg.turn; flip = !flip; continue; }
      const [tx, ty] = leg.walk || leg.away;
      const d = leg.dur || Math.hypot(tx - x, ty - y) / DEER.walkSpeed;
      if (leg.walk) flip = tx < x;
      segs.push({ t0: t, t1: t + d, clip: leg.walk ? "walk" : "walkAway", away: !!leg.away, size: leg.size || 1, x0: x, y0: y, x1: tx, y1: ty, flip });
      x = tx; y = ty; t += d;
    }
    return segs;
  })();
  const deerTotal = deerSegs[deerSegs.length - 1].t1;

  function drawDeer(t) {
    if (t < DEER.firstAt) return;
    const c = (t - DEER.firstAt) % DEER.every;
    if (c > deerTotal) return;
    const seg = deerSegs.find(s => c < s.t1) || deerSegs[deerSegs.length - 1];
    const u = clamp01((c - seg.t0) / Math.max(seg.t1 - seg.t0, 1e-6));
    const x = lerp(seg.x0, seg.x1, u), y = lerp(seg.y0, seg.y1, u);
    if (seg.turn) {
      // turning round on the spot: the head comes to face us while the body, swinging towards us, is
      // seen shorter and shorter, then lengthens again the other way
      const w = Math.max(0.5, Math.abs(Math.cos(Math.PI * smooth(0, 1, u))));
      drawFrame(SPRITES.deer, 2, x, y, SPRITES.deer.anchor, u < 0.5 ? seg.flip : !seg.flip, 1, [w, 1]);
    } else if (seg.away) {
      // the walking-away frames are drawn smaller (it is further away); it fades into the trees
      drawSprite("deer", "walkAway", c - seg.t0, x, y, seg.flip, 1 - smooth(0.45, 1, u));
    } else {
      const size = lerp(1, seg.size || 1, u);
      drawSprite("deer", seg.clip, seg.clip === "walk" ? c : c - seg.t0, x, y, seg.flip, 1, size === 1 ? null : [size, size]);
    }
    // the deer walks behind the big trunks: cut their shapes out of it (only those in front)
    cutOut(DEER.trunks.filter(tr => y < tr.roots).map(tr => tr.shape));
  }

  // Erase shapes from the characters canvas, so what was drawn there is hidden behind them.
  function cutOut(shapes) {
    life.save();
    life.globalCompositeOperation = "destination-out";
    life.beginPath();
    for (const shape of shapes) {
      shape.forEach(([x, y], i) => i ? life.lineTo(x, y) : life.moveTo(x, y));
      life.closePath();
    }
    life.fill();
    life.restore();
  }

  // ===== Children =====================================================================
  function buildTimeline(kid) {
    const segs = [];
    let t = 0, [x, y] = kid.start, flip = false;
    const stay = (clip, d) => {
      if (d > 0) segs.push({ t0: t, t1: t + d, clip, x0: x, y0: y, x1: x, y1: y, flip });
      t += Math.max(d, 0);
    };
    for (const st of kid.steps) {
      if (st.face && !st.to) { flip = st.face === "left"; continue; }
      if (st.to) {
        const [tx, ty] = st.to;
        const d = Math.hypot(tx - x, ty - y) / (st.speed || kid.speed);
        if (st.face) flip = st.face === "left";       // (moving without turning: leaning out, ducking back)
        else if (tx !== x) flip = tx < x;
        segs.push({ t0: t, t1: t + d, clip: st.clip || "run", moving: true, x0: x, y0: y, x1: tx, y1: ty, flip });
        x = tx; y = ty; t += d;
      } else if (st.until !== undefined) stay("idle", st.until - t);
      else if (st.idle) stay("idle", st.idle);
      else stay(st.clip, st.dur || clipLength(SPRITES[kid.id].clips[st.clip]));
    }
    return { segs, end: t };
  }
  // (timelines are built once the clips are loaded: clip lengths come from animations.json)

  function drawKids(t) {
    if (t < KIDS.firstAt) return;
    const c = (t - KIDS.firstAt) % KIDS.every;
    const now = [];
    for (const kid of KIDS.cast) {
      const tl = kid.timeline;
      if (c >= tl.end) continue;
      const seg = tl.segs.find(s => c < s.t1) || tl.segs[tl.segs.length - 1];
      const u = clamp01((c - seg.t0) / Math.max(seg.t1 - seg.t0, 1e-6));
      const y = lerp(seg.y0, seg.y1, u);
      const clipTime = seg.moving ? c : c - seg.t0; // keep the stride continuous
      now.push({ kid, x: lerp(seg.x0, seg.x1, u), y, seg, clipTime });
    }
    if (!now.length) return;
    now.sort((a, b) => a.y - b.y);   // further back = drawn first (behind)
    const draw = k => drawSprite(k.kid.id, k.seg.clip, k.clipTime, k.x, k.y, k.seg.flip);
    // behind the house first, then hide the house's shape from them; then the rest
    now.filter(k => k.y < KIDS.house.baseY).forEach(draw);
    cutOut([KIDS.house.outline]);
    now.filter(k => k.y >= KIDS.house.baseY && k.seg.clip !== "lean").forEach(draw);
    // everyone in this scene stands behind the big right trunk…
    cutOut([KIDS.trunk]);
    // …except Nayan leaning against it, who is in front of its edge
    now.filter(k => k.seg.clip === "lean").forEach(draw);
  }

  // ===== Nóri & Max ==================================================================
  const doorLeaves = {};
  // Where we are in the sequence (t = seconds since COUPLE.firstAt; the doors start to move at 1 s).
  // Poses, by what each frame of the couple sheets actually shows (the pack's names drift from
  // frame 11 on): 0 neutral, 3 holding the doors open, 4/5 walking out, 6 glance, 7 turning to each
  // other, 8 embrace, 9 lean in, 10 kiss, 11 smiling at each other, 12 turning back (three-quarter
  // back view), 13/15 walking in (back view), 14 pulling the doors shut (back view, arms out),
  // 16 raising hands, 17/18 wave. Each pose is held at least ~0.3 s, so nothing flickers.
  const COUPLE_POSES = [            // [until t, pose] while standing on the step
    [3.9, 0],                                         // half a second's pause, smiling at us
    [4.1, 16], [4.4, 17], [4.7, 18], [5.0, 17], [5.3, 18], [5.5, 16], [5.8, 0],   // wave hello
    [6.4, 6],                                         // look at each other
    [6.8, 7], [7.3, 8], [7.7, 9], [9.0, 10],          // turn, embrace, lean in, kiss (held)
    [9.6, 11], [10.0, 12],                            // smile at each other, turn back to the door
  ];
  function coupleAt(t) {
    const C = COUPLE, e = u => smooth(0, 1, u);
    let pose = 0, open = 1, inside = false, x = C.stepX, y = C.stepY;
    const walk = (a, b) => (Math.floor(t / 0.25) % 2 ? b : a);   // alternate two steps, 4 per second
    if (t < 1.8) {                    // they push both doors open from inside
      const u = e((t - 1) / 0.8);
      pose = 3; open = u; inside = true; x = C.doorX; y = C.doorY;
    } else if (t < 2.2) {             // standing in the open doorway
      pose = 3; inside = true; x = C.doorX; y = C.doorY;
    } else if (t < 3.4) {             // walk out onto the step
      const u = e((t - 2.2) / 1.2);
      pose = walk(4, 5); inside = u < 0.4;
      x = lerp(C.doorX, C.stepX, u); y = lerp(C.doorY, C.stepY, u);
    } else if (t < 10.0) {            // on the step
      pose = COUPLE_POSES.find(([end]) => t < end)[1];
    } else if (t < 11.0) {            // walk back in
      const u = e((t - 10.0) / 1.0);
      pose = walk(13, 15); inside = u > 0.6;
      x = lerp(C.stepX, C.doorX, u); y = lerp(C.stepY, C.doorY, u);
    } else {                          // pull the doors shut
      pose = 14; inside = true; x = C.doorX; y = C.doorY; open = 1 - e((t - 11.0) / 0.9);
    }
    return { pose, open, visible: true, inside, x, y };
  }
  // one door leaf swinging inwards, as thin vertical strips (the kit's doorStrips)
  function drawLeaf(side, openness) {
    const o = COUPLE.opening, img = doorLeaves[side];
    const theta = openness * 1.34, w = o.w / 2, projected = w * Math.cos(theta), depth = 9 * Math.sin(theta);
    const n = 29;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, d = side === "left" ? u : 1 - u;
      const x = side === "left" ? o.x + projected * i / n : o.x + o.w - projected + projected * i / n;
      life.drawImage(img, i * 29 / n, 0, 29 / n, 113, x, o.y + depth * d, projected / n + 0.1, o.h - 2 * depth * d);
    }
  }
  function drawCouple(t) {
    if (t < COUPLE.firstAt) return;
    const c = (t - COUPLE.firstAt) % COUPLE.every;
    if (c < 1) return;                 // doors still shut: the background shows them
    if (c >= COUPLE.length) return;  // doors shut again: the background shows them
    const s = coupleAt(c), o = COUPLE.opening;
    const pair = () => drawFrame(SPRITES.couple, s.pose, s.x, s.y, SPRITES.couple.anchor);
    // the doorway: paper white behind, the couple inside it, then the two leaves
    life.fillStyle = "#fefefe";
    life.fillRect(o.x, o.y, o.w, o.h);
    if (s.visible && s.inside) {
      // inside, the doorway hides them at the top and sides; below, it stays open down to their feet,
      // so their legs aren't cut at the threshold while they step over it
      life.save(); life.beginPath(); life.rect(o.x, o.y, o.w, Math.max(o.h, s.y - o.y) + 1); life.clip(); pair(); life.restore();
    }
    if (s.open > 1e-6) { drawLeaf("left", s.open); drawLeaf("right", s.open); }
    else { life.drawImage(doorLeaves.left, o.x, o.y, 29, o.h); life.drawImage(doorLeaves.right, o.x + 29, o.y, 29, o.h); }
    if (s.visible && !s.inside) pair();
  }

  // ===== Main loop ====================================================================
  let last = 0, clock = 0, running = true;

  // Debug helper for tuning: ?t=40 starts the scene 40 s in.
  const skip = Number(query.get("t"));
  if (skip > 0) { clock = skip; owl.nextFlightAt = Math.max(OWL.firstFlightAt, skip + 1); }
  if (skip > 0) scene.classList.add("nofade");
  // ?fly=0.5 puts the owl halfway through its flight (with ?t=)
  const flyAt = Number(query.get("fly"));
  if (skip > 0 && flyAt > 0) { owl.state = "fly"; owl.since = skip - flyAt * OWL.flightTime; }

  let cueShown = false, hintShown = false;
  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.1); // pause-safe clock
    last = now;
    clock += dt;
    // a faint arrow from the start, so the card can always be found…
    if (!hintShown && (reduceMotion || clock >= ARROW.hintAt)) {
      hintShown = true;
      scene.classList.add("hint");
    }
    // …and after the first kiss (or straight away without motion), invite people to scroll down
    if (!cueShown && (reduceMotion || clock >= COUPLE.firstAt + COUPLE.cueAt)) {
      cueShown = true;
      scene.classList.add("cue");
    }
    // while the invitation card covers the drawing, keep time but skip the drawing work
    if (document.documentElement.dataset.stage === "card") {
      if (!reduceMotion) requestAnimationFrame(frame);
      return;
    }
    const strength = reduceMotion ? 0 : WIND.intensity * smooth(0.3, WIND.rampIn, clock);
    drawForest(clock, strength);

    // characters, in the drawing's coordinates
    life.setTransform(1, 0, 0, 1, 0, 0);
    life.clearRect(0, 0, lifeCanvas.width, lifeCanvas.height);
    life.setTransform(view.dpr * view.s, 0, 0, view.dpr * view.s, view.dpr * view.x, view.dpr * view.y);
    life.imageSmoothingQuality = "high";
    // Each cut-out (hiding someone behind a trunk or the house) erases everything drawn before
    // it, so: the children first (house + right trunk), then the deer (left trunks only: never
    // near the children), then the couple and the owl, which nothing hides.
    if (!reduceMotion) { drawKids(clock); drawDeer(clock); drawCouple(clock); }
    drawOwl(clock);
    if (skip > 0) {   // debug readout when ?t= is used
      life.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      life.font = "20px monospace"; life.fillStyle = "#c00";
      life.fillText("t=" + clock.toFixed(2), 12, 28);
    }

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  // place the still drawing exactly where the canvases will draw it, straight away: it shows while
  // the assets load, and the animated scene then fades in over it without a shift
  layout();

  const castReady = fetch(CAST + "animations.json").then(r => r.json()).then(spec => {
    [CELL, COLS] = [spec.cellSize[0], spec.grid.columns];
    PER_SHEET = spec.grid.columns * spec.grid.rows;
    const all = spec.characters || spec.assets;
    return Promise.all(Object.entries(all).map(([name, a]) =>
      Promise.all(a.sheets.map(sh => load(CAST + sh.split("/").pop()))).then(sheets => {
        SPRITES[name] = { sheets, anchor: a.anchor, clips: { ...(a.clips || a.animations), ...CLIP_CHANGES[name] } };
      })));
  });
  const forestReady = fetch(WIND.base + "wind-rig.json").then(r => r.json()).then(rig =>
    Promise.all([load(WIND.base + "background.png"), load(WIND.base + rig.atlas)]).then(([bg, atlas]) => {
      Object.assign(forest, { rig, background: bg, atlas });
    }));
  const leaves = ["left", "right"].map(side =>
    load(`/assets/doors/${side}.png`).then(img => { doorLeaves[side] = img; }));
  let disposed = false;
  const onResize = () => { layout(); if (reduceMotion) frame(performance.now()); };
  const onVisibility = () => {
    if (document.hidden) { running = false; }
    else if (!running && !disposed) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  };
  Promise.all([forestReady, castReady, ...leaves]).then(() => {
    if (disposed) return;
    KIDS.cast.forEach(k => { k.timeline = buildTimeline(k); });
    layout();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    last = performance.now();
    frame(last);
    requestAnimationFrame(() => scene.classList.add("ready"));
  }).catch(() => { /* keep the static fallback */ });

  return () => {
    disposed = true;
    running = false;
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    scene.classList.remove("ready", "nofade", "hint", "cue");
  };
}
