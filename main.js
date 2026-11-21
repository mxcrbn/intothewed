(() => {
  "use strict";

  // Drawing size in its own pixels. Every position below is in these pixels.
  const W = 1536, H = 1024;

  // ===== Tuning =====================================================================

  const SWAY = {
    ground: 760,     // y where trunks are anchored: no movement below
    amp: 13,         // max horizontal sway at the very top of the trees
    rampIn: 2.5,     // seconds to ease the wind in after the page opens
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

  const DEER = {
    firstAt: 22,          // seconds after opening
    every: 60,            // then once a minute
    height: 70,
    enter: { x: 1590, y: 760 },  // comes out of the woods on the right…
    stop:  { x: 1292, y: 773 },  // …stops beside the house and looks around…
    leave: { x: 1318, y: 702 },  // …then wanders off into the forest
    walkSpeed: 46,        // px / s
    idleFor: 6.5,         // seconds looking around
    leaveFor: 6,          // seconds walking away
    // outline of the big right trunk: the deer passes behind it
    trunk: [[1336, 600], [1362, 600], [1384, 640], [1408, 612], [1414, 760], [1444, 795],
            [1360, 795], [1366, 700]],
  };

  // The three children play in front of the fence. Even visits come in from the left,
  // odd visits from the right (mirrored). Steps: run to x | play a clip | idle | face.
  const KIDS = {
    firstAt: 5,
    every: 75,
    exitLeft: -90, exitRight: 1626,
    cast: [
      { id: "teenager", y: 993, height: 96, speed: 68, delay: 0, steps: [
        { run: 470 }, { idle: 1 }, { clip: "wave" }, { idle: 2.5 }, { clip: "play", dur: 5 },
        { idle: 1.5 }, { clip: "hop" }, { idle: 5 }, { clip: "wave" }, { idle: 2 }, { run: "exit" },
      ] },
      { id: "girl", y: 1003, height: 50, speed: 82, delay: 0.9, steps: [
        { run: 610 }, { clip: "hop" }, { clip: "play", dur: 3 }, { run: 705 }, { clip: "hop" },
        { face: "left" }, { clip: "wave" }, { run: 560 }, { idle: 1 }, { clip: "hop" },
        { clip: "play", dur: 3 }, { idle: 2.5 }, { run: "exit" },
      ] },
      { id: "boy", y: 998, height: 65, speed: 88, delay: 1.8, steps: [
        { run: 765 }, { idle: 1 }, { clip: "play", dur: 3 }, { run: 885 }, { clip: "hop" },
        { run: 720 }, { clip: "wave" }, { idle: 3 }, { clip: "hop" }, { idle: 2.5 }, { run: "exit" },
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
  SPRITES.teenager = { src: "assets/sprites/teenager.webp", nominalHeight: 281, anchor: [256, 440], clips: CHILD_CLIPS };
  SPRITES.girl     = { src: "assets/sprites/girl.webp",     nominalHeight: 283, anchor: [256, 440], clips: CHILD_CLIPS };
  SPRITES.boy      = { src: "assets/sprites/boy.webp",      nominalHeight: 288, anchor: [256, 440], clips: CHILD_CLIPS };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Wind: identical formula in JS (owl on its branch) and GLSL (trees) ==========
  function sway(x, y, t, k) {
    const h = Math.min(Math.max((SWAY.ground - y) / SWAY.ground, 0), 1);
    const a = Math.pow(h, 1.7) * k;
    const dx = SWAY.amp * a * (0.65 * Math.sin(t * 0.75 + x * 0.0035) + 0.35 * Math.sin(t * 1.25 + x * 0.0091 + 1.7))
             + 2.2 * a * a * Math.sin(t * 2.4 + x * 0.02 + y * 0.013);
    const dy = 2.0 * a * a * Math.sin(t * 0.8 + x * 0.006 + 0.5);
    return [dx, dy];
  }

  const VERT = `
    attribute vec2 aPos;
    uniform vec4 uView;          // offsetX, offsetY, scale, unused  (CSS px)
    uniform vec2 uViewport;      // CSS px
    varying vec2 vPx;            // drawing px
    void main() {
      vec2 screen = (aPos * 0.5 + 0.5) * uViewport;
      screen.y = uViewport.y - screen.y;
      vPx = (screen - uView.xy) / uView.z;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

  const FRAG = `
    precision highp float;
    uniform sampler2D uImg;
    uniform sampler2D uMask;
    uniform float uTime;
    uniform float uK;            // wind strength 0..1
    uniform float uGround;
    uniform float uAmp;
    varying vec2 vPx;
    const vec2 SIZE = vec2(${W}.0, ${H}.0);
    const vec3 PAPER = vec3(254.0 / 255.0);

    vec2 sway(vec2 p) {
      float h = clamp((uGround - p.y) / uGround, 0.0, 1.0);
      float a = pow(h, 1.7) * uK;
      float t = uTime;
      float dx = uAmp * a * (0.65 * sin(t * 0.75 + p.x * 0.0035) + 0.35 * sin(t * 1.25 + p.x * 0.0091 + 1.7))
               + 2.2 * a * a * sin(t * 2.4 + p.x * 0.02 + p.y * 0.013);
      float dy = 2.0 * a * a * sin(t * 0.8 + p.x * 0.006 + 0.5);
      return vec2(dx, dy);
    }

    vec3 sampleImg(vec2 px) {
      if (px.x < 0.0 || px.y < 0.0 || px.x > SIZE.x || px.y > SIZE.y) return PAPER;
      return texture2D(uImg, px / SIZE).rgb;
    }
    float sampleMask(vec2 px) {
      return texture2D(uMask, clamp(px / SIZE, 0.0, 1.0)).r;
    }

    void main() {
      vec2 p = vPx;
      // static layer: house, fence, ground (never moves)
      float m = sampleMask(p);
      vec3 stat = mix(PAPER, sampleImg(p), m);
      // moving layer: the trees, displaced by the wind
      vec2 q = p - sway(p);
      float m2 = sampleMask(q);
      vec3 trees = mix(sampleImg(q), PAPER, m2);
      // ink on paper: the darkest line wins
      gl_FragColor = vec4(min(stat, trees), 1.0);
    }`;

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
    const keepOwlRange = vw / 1110;            // x 260 → 1370 must stay on screen
    const s = Math.max(contain, Math.min(cover, keepOwlRange));
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

  // ===== WebGL (trees) ================================================================
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return; // static fallback image stays visible

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ["uImg", "uMask", "uTime", "uK", "uGround", "uAmp", "uView", "uViewport"].forEach(n => U[n] = gl.getUniformLocation(prog, n));

  function texture(unit, img) {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
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
  function drawSprite(id, clipName, seconds, x, y, height, flip = false, alpha = 1) {
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
    life.scale(flip ? -s : s, s);
    life.drawImage(img, (index % 4) * cell, Math.floor(index / 4) * cell, cell, cell, -anchor[0], -anchor[1], 512, 512);
    life.restore();
  }

  // ===== Owl ==========================================================================
  const owl = { perch: 0, state: "perched", since: 0, nextFlightAt: OWL.firstFlightAt };

  function feetOn(i, t, k) {
    const p = OWL.perches[i];
    const [dx, dy] = sway(p.x, p.y, t, k);
    return { x: p.x + dx, y: p.y + dy };
  }

  function drawOwl(t, k) {
    const h = OWL.height;
    const bodyLift = (326 - 270) * h / SPRITES.owl.nominalHeight; // foot anchor → body anchor
    const here = feetOn(owl.perch, t, k);
    const there = feetOn(1 - owl.perch, t, k);
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
      drawSprite("deer", "walk", c, x, y, sizeAt(y), true);
    } else if (c < deerWalkIn + DEER.idleFor) {
      drawSprite("deer", "idle", c - deerWalkIn, DEER.stop.x, DEER.stop.y, DEER.height, true);
    } else {
      const l = c - deerWalkIn - DEER.idleFor, u = l / DEER.leaveFor;
      const x = lerp(DEER.stop.x, DEER.leave.x, u), y = lerp(DEER.stop.y, DEER.leave.y, u);
      drawSprite("deer", "walkAway", l, x, y, sizeAt(y) * lerp(1, 0.75, u), false, 1 - smooth(0.45, 1, u));
    }
    // the deer walks behind the big trunk: cut the trunk's shape out of it
    life.save();
    life.globalCompositeOperation = "destination-out";
    life.beginPath();
    DEER.trunk.forEach(([x, y], i) => i ? life.lineTo(x, y) : life.moveTo(x, y));
    life.closePath();
    life.fill();
    life.restore();
  }

  // ===== Children =====================================================================
  function buildTimeline(kid, mirror) {
    const m = x => (mirror ? W - x : x);
    const segs = [];
    let t = 0, x = mirror ? KIDS.exitRight : KIDS.exitLeft, flip = mirror;
    for (const st of kid.steps) {
      if (st.face) { flip = mirror ? st.face === "right" : st.face === "left"; continue; }
      if (st.run !== undefined) {
        const to = st.run === "exit" ? (mirror ? KIDS.exitLeft : KIDS.exitRight) : m(st.run);
        const d = Math.abs(to - x) / kid.speed;
        flip = to < x;
        segs.push({ t0: t, t1: t + d, clip: "run", x0: x, x1: to, flip });
        x = to; t += d;
        continue;
      }
      const clip = st.clip || "idle";
      const d = st.dur || st.idle || clipLength(CHILD_CLIPS[clip]);
      segs.push({ t0: t, t1: t + d, clip, x0: x, x1: x, flip });
      t += d;
    }
    return { segs, end: t };
  }
  KIDS.cast.forEach(k => { k.timelines = [buildTimeline(k, false), buildTimeline(k, true)]; });
  const kidsInDepthOrder = [...KIDS.cast].sort((a, b) => a.y - b.y);

  function drawKids(t) {
    if (t < KIDS.firstAt) return;
    const visit = Math.floor((t - KIDS.firstAt) / KIDS.every);
    const c = (t - KIDS.firstAt) % KIDS.every;
    for (const kid of kidsInDepthOrder) {
      const tl = kid.timelines[visit % 2];
      const l = c - kid.delay;
      if (l < 0 || l >= tl.end) continue;
      const seg = tl.segs.find(s => l < s.t1) || tl.segs[tl.segs.length - 1];
      const u = (l - seg.t0) / Math.max(seg.t1 - seg.t0, 1e-6);
      const x = lerp(seg.x0, seg.x1, u);
      const clipTime = seg.clip === "run" ? l : l - seg.t0; // keep the stride continuous
      drawSprite(kid.id, seg.clip, clipTime, x, kid.y, kid.height, seg.flip);
    }
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
    const k = reduceMotion ? 0 : smooth(0.3, SWAY.rampIn, clock);

    // trees
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, clock);
    gl.uniform1f(U.uK, k);
    gl.uniform4f(U.uView, view.x, view.y, view.s, 0);
    gl.uniform2f(U.uViewport, view.vw, view.vh);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // characters, in the drawing's coordinates
    life.setTransform(1, 0, 0, 1, 0, 0);
    life.clearRect(0, 0, lifeCanvas.width, lifeCanvas.height);
    life.setTransform(view.dpr * view.s, 0, 0, view.dpr * view.s, view.dpr * view.x, view.dpr * view.y);
    life.imageSmoothingQuality = "high";
    if (!reduceMotion) drawDeer(clock);   // first: the trunk cut-out must not touch the others
    drawOwl(clock, k);
    if (!reduceMotion) drawKids(clock);
    if (skip > 0) {   // debug readout when ?t= is used
      life.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      life.font = "20px monospace"; life.fillStyle = "#c00";
      life.fillText("t=" + clock.toFixed(2), 12, 28);
    }

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  const sprites = Object.entries(SPRITES).map(([id, sp]) => load(sp.src).then(img => { SPRITES[id].img = img; }));
  Promise.all([load("assets/scene.webp"), load("assets/mask.png"), ...sprites]).then(([img, mask]) => {
    texture(0, img);
    texture(1, mask);
    gl.uniform1i(U.uImg, 0);
    gl.uniform1i(U.uMask, 1);
    gl.uniform1f(U.uGround, SWAY.ground);
    gl.uniform1f(U.uAmp, SWAY.amp);

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
