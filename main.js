(() => {
  "use strict";

  // Drawing size in its own pixels. Every position below is in these pixels.
  const W = 1536, H = 1024;

  // ===== Tuning =====================================================================

  // Wind in the canopy: the illustrator's "forest wind" kit (assets/forest-wind/). 97 small
  // leaf/twig fragments cut from the drawing, each rotating around its attachment point,
  // with staggered timing and slowly changing gusts. House, trunks, fence stay still.
  const WIND = {
    base: "assets/forest-wind/",
    // The kit's default (1) only moves each piece 1–2 screen pixels: invisible. These values
    // make the canopy sway noticeably while staying calm. ?wind=2 / ?windSpeed=1 to try others.
    intensity: Number(new URLSearchParams(location.search).get("wind")) || 7,
    speed: Number(new URLSearchParams(location.search).get("windSpeed")) || 2.2, // ×kit tempo
    rampIn: 2.5,       // seconds to ease the wind in after the page opens
  };

  const OWL = {
    height: 30,           // on-screen height of the owl
    firstFlightAt: 12,    // seconds after opening
    restBetween: 28,      // seconds perched before flying back
    flightTime: 5.5,      // seconds in the air
    perches: [            // where the feet sit on each branch
      { x: 315, y: 301 }, // left tree (as on the invite)
      { x: 1289, y: 280 }, // big right tree
    ],
  };

  // The deer comes out of the woods on the left, passing behind the two big trunks, stops
  // between them to look around, then wanders back into the forest.
  const DEER = {
    firstAt: 22,          // seconds after opening
    every: 60,            // then once a minute
    height: 90,
    enter: { x: -90, y: 745 },   // comes out of the woods on the left…
    stop:  { x: 165, y: 752 },   // …stops between the big trunks and looks around…
    leave: { x: 172, y: 690 },   // …then wanders off into the forest, between the trunks
    walkSpeed: 46,        // px / s
    idleFor: 6.5,         // seconds looking around
    leaveFor: 6,          // seconds walking away
    // outlines of the two big left trunks: the deer passes behind them
    trunks: [
      [[150, 480], [192, 480], [162, 600], [140, 700], [118, 790], [70, 790], [100, 700], [127, 600]],
      [[240, 480], [258, 480], [238, 600], [232, 700], [240, 760], [262, 774], [182, 780], [205, 700], [222, 600]],
    ],
  };

  // The children hide behind the big tree on the right. The girl leans out on one side, the
  // boy on the other; the girl bolts and the boy chases her across the front lawn. They turn
  // back to the tree. A few seconds into the chase the teenager strolls out, waves once and leans back against the trunk,
  // hands in pockets, one knee bent. When the kids run off behind the house he pushes off the
  // tree and runs after them.
  // Steps: to [x, y] (+speed) (run) | clip (+dur) | idle s | until s (wait for a cue) | face |
  //        peek angle (+dur, +clip: lean the figure around its feet, radians, negative = left).
  // Sizes follow the house (a teenager by the front door is a bit shorter than the door) and
  // shrink with depth.
  const CHASE = [[1290, 795], [1150, 800], [1060, 770], [1170, 752], [1300, 762]];
  const KIDS = {
    firstAt: 5,
    every: 75,
    depth: { y: 995, perPx: 0.0012 },   // size = height × (1 − (995 − y) × 0.0012)
    // the big right trunk (kids behind it are hidden) and the house (kids behind it vanish)
    trunk: [[1352, 600], [1382, 600], [1394, 680], [1412, 700], [1430, 760], [1450, 795],
            [1356, 795], [1364, 700]],
    house: { baseY: 730, outline: [[316, 731], [316, 585], [290, 585], [476, 494], [700, 494],
             [820, 442], [940, 494], [1202, 494], [1258, 585], [1228, 585], [1228, 731]] },
    cast: [
      { id: "girl", height: 75, speed: 105, start: [1378, 786], steps: [
        { face: "left" }, { idle: 1.0 }, { peek: -0.6, dur: 2.4 }, { idle: 1.3 },
        { peek: -0.6, dur: 1.0 }, { until: 6.2 },
        ...CHASE.map(p => ({ to: p })), { to: [1262, 776] }, { until: 13.6 }, { face: "right" },
        { until: 14.8 }, { clip: "hop" }, { clip: "wave" }, { until: 19.8 },
        { to: [1250, 724] }, { to: [1110, 706] },
      ] },
      { id: "boy", height: 100, speed: 105, start: [1404, 787], steps: [
        { idle: 2.0 }, { peek: 0.42, dur: 2.4 }, { idle: 1.1 }, { peek: 0.42, dur: 0.7 },
        { until: 6.9 },
        ...CHASE.map(p => ({ to: p })), { to: [1215, 782] }, { until: 13.6 }, { face: "right" },
        { until: 14.6 }, { clip: "wave" }, { until: 19.6 },
        { to: [1240, 726] }, { to: [1130, 708] },
      ] },
      { id: "teenager", height: 145, speed: 80, start: [1392, 788], steps: [
        { until: 9.0 }, { to: [1338, 787] }, { face: "left" }, { clip: "wave" },   // ~3 s into the chase
        // back against the left side of the trunk, chilling
        { to: [1350, 790], speed: 40 }, { face: "left" },
        { peek: 0.09, clip: "lean", dur: 7.9 },   // until the kids run off (~19.9 s)
        // the kids are off: run after them
        { to: [1262, 728], speed: 150 }, { to: [1150, 710], speed: 150 },
      ] },
    ],
  };

  // Sprite sheets (4x4 frames) prepared by tools/prepare_sprites.py from the animation kit.
  // Anchors and clips come from the kit's animations.json, in its 512px frame units.
  const SPRITES = {
    owl: { src: "assets/sprites/owl.webp", nominalHeight: 136, anchor: [256, 326], clips: {
      perched: { frames: [0, 0, 0, 1, 0], fps: 2, loop: true },
      takeoff: { frames: [2, 3], fps: 9 },
      fly:     { frames: [4, 5, 6, 7, 8, 9, 10, 11], fps: 10, loop: true, anchor: [256, 270] },
      glide:   { frames: [12], fps: 2, loop: true, anchor: [256, 270] },
      land:    { frames: [13, 14, 15], fps: 7 },
    } },
    deer: { src: "assets/sprites/deer.webp", nominalHeight: 237, anchor: [256, 440], clips: {
      idle:     { frames: [0, 0, 1, 0, 2, 3], fps: 2, loop: true },
      walk:     { frames: [4, 5, 6, 7, 8, 9, 10, 11], fps: 8, loop: true },
      walkAway: { frames: [12, 13, 14, 15], fps: 6, loop: true },
    } },
  };
  const CHILD_CLIPS = {
    idle: { frames: [0], fps: 1, loop: true },
    wave: { frames: [0, 1, 1, 2, 1, 0], fps: 3 },
    play: { frames: [0, 2, 3, 2, 0], fps: 3, loop: true },
    run:  { frames: [4, 5, 6, 7, 8, 9, 10, 11], fps: 9, loop: true },
    hop:  { frames: [12, 13, 14, 15, 0], fps: 7, offsetY: [0, -9, -23, -4, 0] },
  };
  SPRITES.teenager = { src: "assets/sprites/teenager.webp", nominalHeight: 281, anchor: [256, 440], clips: {
    ...CHILD_CLIPS,
    wave: { frames: [0, 1, 1, 1, 1, 0], fps: 3 },           // one wave
    lean: { frames: [2], fps: 1, loop: true },               // hands in pockets, one knee bent
  } };
  SPRITES.girl     = { src: "assets/sprites/girl.webp",     nominalHeight: 283, anchor: [256, 440], clips: CHILD_CLIPS };
  SPRITES.boy      = { src: "assets/sprites/boy.webp",      nominalHeight: 288, anchor: [256, 440], clips: CHILD_CLIPS };

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
  // Rotation (radians) of one fragment: a shared gust travelling through the canopy
  // plus the fragment's own delayed flutter.
  function breezeAngle(piece, time, intensity) {
    if (!intensity) return 0;
    time *= WIND.speed;
    const t = time - piece.lag;
    const common = 0.62 * smoothNoise(t / 8.1, 17) + 0.25 * smoothNoise(t / 23.7, 41) + 0.13 * smoothNoise(t / 4.3, 59);
    const local = tt => 0.24 * smoothNoise(tt / (2.8 + piece.depth) + piece.phase, 103) + 0.09 * smoothNoise(tt / 1.17 + piece.phase * 0.71, 211);
    const flutter = 0.45 * local(time) + 0.30 * local(time - 0.16) + 0.25 * local(time - 0.37);
    return piece.amplitude * piece.depth * intensity * (common + flutter);
  }

  // ===== DOM ==========================================================================
  const scene = document.getElementById("scene");
  const canvas = document.getElementById("trees");
  const lifeCanvas = document.getElementById("life");
  const life = lifeCanvas.getContext("2d");
  const fallback = document.getElementById("fallback");

  // ===== Layout: fill the screen like the invite, keep both owl branches and the
  // children (bottom of the drawing) visible ===========================================
  const view = { x: 0, y: 0, s: 1, vw: 1, vh: 1, dpr: 1 };
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const cover = Math.max(vw / W, vh / H);
    const contain = Math.min(vw / W, vh / H);
    const keepRange = vw / 1350;               // x 100 → 1450 (deer, owl, right tree) stays on screen
    const s = Math.max(contain, Math.min(cover, keepRange));
    let x, y;
    if (W * s <= vw) x = (vw - W * s) / 2;
    else x = Math.min(0, Math.max(vw - W * s, vw / 2 - 775 * s));    // centred on the door
    if (H * s <= vh) y = (vh - H * s) / 2;
    else y = Math.min(0, Math.max(vh - H * s, vh - 1015 * s));       // crop the sky, keep the kids
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    Object.assign(view, { x, y, s, vw, vh, dpr });
    // Debug helper for tuning: ?focus=1300,700,4 zooms on a point of the drawing.
    const focus = new URLSearchParams(location.search).get("focus");
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
    // fragments contain white paper: multiply so only their ink shows
    trees.globalCompositeOperation = "multiply";
    for (const p of forest.rig.pieces) {
      const [px, py] = p.pivot, [x, y, w, h] = p.source, [ax, ay] = p.atlas;
      trees.save();
      trees.translate(px, py);
      trees.rotate(breezeAngle(p, t, strength));
      trees.drawImage(forest.atlas, ax, ay, w, h, x - px, y - py, w, h);
      trees.restore();
    }
    trees.globalCompositeOperation = "source-over";
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
  const ease = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const cubic = (p0, p1, p2, p3, u) => {
    const v = 1 - u;
    return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3;
  };
  const clipLength = c => c.frames.length / c.fps;

  // Draw one frame of a clip. (x, y) is the clip's anchor in the drawing, height its display height.
  function drawSprite(id, clipName, seconds, x, y, height, flip = false, alpha = 1, tilt = 0) {
    const sp = SPRITES[id], clip = sp.clips[clipName], img = sp.img;
    const n = Math.max(0, Math.floor(seconds * clip.fps));
    const step = clip.loop ? n % clip.frames.length : Math.min(n, clip.frames.length - 1);
    const index = clip.frames[step];
    const anchor = clip.anchor || sp.anchor;
    const s = height / sp.nominalHeight;                 // drawing px per kit px
    const cell = img.naturalWidth / 4;                   // sheet cell size (kit frame = 512)
    life.save();
    life.globalAlpha = alpha;
    life.translate(x, y + (clip.offsetY ? clip.offsetY[step] : 0) * s);
    if (tilt) life.rotate(tilt);
    life.scale(flip ? -s : s, s);
    life.drawImage(img, (index % 4) * cell, Math.floor(index / 4) * cell, cell, cell, -anchor[0], -anchor[1], 512, 512);
    life.restore();
  }

  // ===== Owl ==========================================================================
  const owl = { perch: 0, state: "perched", since: 0, nextFlightAt: OWL.firstFlightAt };

  // the owl's two branches are part of the still background
  function feetOn(i) {
    return OWL.perches[i];
  }

  function drawOwl(t) {
    const h = OWL.height;
    const bodyLift = (326 - 270) * h / SPRITES.owl.nominalHeight; // foot anchor → body anchor
    const here = feetOn(owl.perch);
    const there = feetOn(1 - owl.perch);
    const dir = Math.sign(OWL.perches[1 - owl.perch].x - OWL.perches[owl.perch].x);
    const faceLeft = dir < 0;
    const local = t - owl.since;

    if (owl.state === "perched") {
      // look towards the other tree
      drawSprite("owl", "perched", local, here.x, here.y, h, faceLeft);
      if (!reduceMotion && t >= owl.nextFlightAt) { owl.state = "takeoff"; owl.since = t; }
      return;
    }
    if (owl.state === "takeoff") {
      drawSprite("owl", "takeoff", local, here.x, here.y, h, faceLeft);
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
      const e = ease(u);
      const x = cubic(ax, c1x, c2x, bx, e), y = cubic(ay, c1y, c2y, by, e);
      const gliding = u > 0.4 && u < 0.62;
      drawSprite("owl", gliding ? "glide" : "fly", local, x, y, h, faceLeft);
      if (u >= 1) { owl.state = "land"; owl.since = t; owl.perch = 1 - owl.perch; }
      return;
    }
    // land: just arrived, still facing the way it flew
    const arrivedFromLeft = owl.perch === 1;
    drawSprite("owl", "land", local, here.x, here.y, h, !arrivedFromLeft);
    if (local >= clipLength(SPRITES.owl.clips.land)) {
      owl.state = "perched"; owl.since = t; owl.nextFlightAt = t + OWL.restBetween;
    }
  }

  // ===== Deer =========================================================================
  const deerWalkIn = Math.hypot(DEER.enter.x - DEER.stop.x, DEER.enter.y - DEER.stop.y) / DEER.walkSpeed;
  const deerTotal = deerWalkIn + DEER.idleFor + DEER.leaveFor;

  function drawDeer(t) {
    if (t < DEER.firstAt) return;
    const c = (t - DEER.firstAt) % DEER.every;
    if (c > deerTotal) return;
    const sizeAt = y => DEER.height - (DEER.stop.y - y) * 0.4;   // smaller further back
    if (c < deerWalkIn) {
      const u = c / deerWalkIn;
      const x = lerp(DEER.enter.x, DEER.stop.x, u), y = lerp(DEER.enter.y, DEER.stop.y, u);
      drawSprite("deer", "walk", c, x, y, sizeAt(y));
    } else if (c < deerWalkIn + DEER.idleFor) {
      drawSprite("deer", "idle", c - deerWalkIn, DEER.stop.x, DEER.stop.y, DEER.height);
    } else {
      const l = c - deerWalkIn - DEER.idleFor, u = l / DEER.leaveFor;
      const x = lerp(DEER.stop.x, DEER.leave.x, u), y = lerp(DEER.stop.y, DEER.leave.y, u);
      drawSprite("deer", "walkAway", l, x, y, sizeAt(y) * lerp(1, 0.75, u), false, 1 - smooth(0.45, 1, u));
    }
    // the deer walks behind the big trunks: cut their shapes out of it
    cutOut(DEER.trunks);
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
    const stay = (clip, d, tilt = 0) => {
      if (d > 0) segs.push({ t0: t, t1: t + d, clip, x0: x, y0: y, x1: x, y1: y, flip, tilt });
      t += Math.max(d, 0);
    };
    for (const st of kid.steps) {
      if (st.face) { flip = st.face === "left"; continue; }
      if (st.to) {
        const [tx, ty] = st.to;
        const d = Math.hypot(tx - x, ty - y) / (st.speed || kid.speed);
        if (tx !== x) flip = tx < x;
        segs.push({ t0: t, t1: t + d, clip: "run", x0: x, y0: y, x1: tx, y1: ty, flip });
        x = tx; y = ty; t += d;
      } else if (st.peek) stay(st.clip || "idle", st.dur, st.peek);
      else if (st.until !== undefined) stay("idle", st.until - t);
      else if (st.idle) stay("idle", st.idle);
      else stay(st.clip, st.dur || clipLength(SPRITES[kid.id].clips[st.clip]));
    }
    return { segs, end: t };
  }
  KIDS.cast.forEach(k => { k.timeline = buildTimeline(k); });

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
      const size = kid.height * (1 - (KIDS.depth.y - y) * KIDS.depth.perPx);
      const clipTime = seg.clip === "run" ? c : c - seg.t0; // keep the stride continuous
      // lean out from behind the trunk and back
      const tilt = seg.tilt ? seg.tilt * smooth(0, 0.22, u) * (1 - smooth(0.78, 1, u)) : 0;
      now.push({ kid, x: lerp(seg.x0, seg.x1, u), y, size, seg, clipTime, tilt });
    }
    if (!now.length) return;
    now.sort((a, b) => a.y - b.y);   // further back = drawn first (behind)
    const draw = k => drawSprite(k.kid.id, k.seg.clip, k.clipTime, k.x, k.y, k.size, k.seg.flip, 1, k.tilt);
    // behind the house first, then hide the house's shape from them; then the rest
    now.filter(k => k.y < KIDS.house.baseY).forEach(draw);
    cutOut([KIDS.house.outline]);
    now.filter(k => k.y >= KIDS.house.baseY && k.seg.clip !== "lean").forEach(draw);
    // everyone in this scene stands behind the big right trunk…
    cutOut([KIDS.trunk]);
    // …except the teenager leaning against it, who is in front of its edge
    now.filter(k => k.seg.clip === "lean").forEach(draw);
  }

  // ===== Main loop ====================================================================
  let last = 0, clock = 0, running = true;

  // Debug helper for tuning: ?t=40 starts the scene 40 s in.
  const skip = Number(new URLSearchParams(location.search).get("t"));
  if (skip > 0) { clock = skip; owl.nextFlightAt = Math.max(OWL.firstFlightAt, skip + 1); }
  // ?fly=0.5 puts the owl halfway through its flight (with ?t=)
  const flyAt = Number(new URLSearchParams(location.search).get("fly"));
  if (skip > 0 && flyAt > 0) { owl.state = "fly"; owl.since = skip - flyAt * OWL.flightTime; }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.1); // pause-safe clock
    last = now;
    clock += dt;
    const strength = reduceMotion ? 0 : WIND.intensity * smooth(0.3, WIND.rampIn, clock);
    drawForest(clock, strength);

    // characters, in the drawing's coordinates
    life.setTransform(1, 0, 0, 1, 0, 0);
    life.clearRect(0, 0, lifeCanvas.width, lifeCanvas.height);
    life.setTransform(view.dpr * view.s, 0, 0, view.dpr * view.s, view.dpr * view.x, view.dpr * view.y);
    life.imageSmoothingQuality = "high";
    // deer and children first: their trunk/house cut-outs must not touch the owl
    if (!reduceMotion) { drawDeer(clock); drawKids(clock); }
    drawOwl(clock);
    if (skip > 0) {   // debug readout when ?t= is used
      life.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      life.font = "20px monospace"; life.fillStyle = "#c00";
      life.fillText("t=" + clock.toFixed(2), 12, 28);
    }

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  const sprites = Object.entries(SPRITES).map(([id, sp]) => load(sp.src).then(img => { SPRITES[id].img = img; }));
  const forestReady = fetch(WIND.base + "wind-rig.json").then(r => r.json()).then(rig =>
    Promise.all([load(WIND.base + rig.background), load(WIND.base + rig.atlas)]).then(([bg, atlas]) => {
      Object.assign(forest, { rig, background: bg, atlas });
    }));
  Promise.all([forestReady, ...sprites]).then(() => {
    layout();
    window.addEventListener("resize", () => { layout(); if (reduceMotion) frame(performance.now()); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    });

    last = performance.now();
    frame(last);
    requestAnimationFrame(() => scene.classList.add("ready"));
  }).catch(() => { /* keep the static fallback */ });
})();
