(() => {
  "use strict";

  // Drawing size in its own pixels
  const W = 1536, H = 1024;

  // ---- Tuning ---------------------------------------------------------------
  const SWAY = {
    ground: 760,     // y (drawing px) where trunks are anchored: no movement below
    amp: 13,         // max horizontal sway at the very top of the trees (drawing px)
    rampIn: 2.5,     // seconds to ease the wind in after the page opens
  };
  const OWL = {
    firstFlightAt: 12,  // seconds after the scene appears
    restBetween: 28,    // seconds perched before flying back
    flightTime: 6.5,    // seconds in the air
    // perched sprite top-left (drawing px) on each branch, and the feet point used for sway
    perches: [
      { sprite: { x: 300, y: 264 }, feet: { x: 314, y: 298 } },    // left tree (as on the invite)
      { sprite: { x: 1277, y: 243 }, feet: { x: 1291, y: 277 } },  // right big tree
    ],
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Wind: identical formula in JS (owl) and GLSL (trees) ------------------
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

  // ---- DOM ---------------------------------------------------------------------
  const scene = document.getElementById("scene");
  const canvas = document.getElementById("trees");
  const stage = document.getElementById("stage");
  const fallback = document.getElementById("fallback");
  const owlPerched = document.getElementById("owl-perched");
  const owlFlying = document.getElementById("owl-flying");
  const wingNear = document.getElementById("wing-near");
  const wingFar = document.getElementById("wing-far");

  // ---- Layout: fill the screen like the invite, but keep both owl branches visible
  const view = { x: 0, y: 0, s: 1, vw: 1, vh: 1 };
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const cover = Math.max(vw / W, vh / H);
    const contain = Math.min(vw / W, vh / H);
    const keepOwlRange = vw / 1110;            // x 260 → 1370 must stay on screen
    const s = Math.max(contain, Math.min(cover, keepOwlRange));
    const focus = { x: 775, y: 560 };          // roughly the front door
    const place = (v, size, f) => {
      const span = size * s;
      if (span <= v) return (v - span) / 2;
      return Math.min(0, Math.max(v - span, v / 2 - f * s));
    };
    Object.assign(view, { x: place(vw, W, focus.x), y: place(vh, H, focus.y), s, vw, vh });

    const t = `translate(${view.x}px, ${view.y}px) scale(${s})`;
    stage.style.transform = t;
    Object.assign(fallback.style, {
      left: "0", top: "0", width: W + "px", height: H + "px", objectFit: "fill",
      transformOrigin: "0 0", transform: t,
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
  }

  // ---- WebGL ------------------------------------------------------------------
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

  // ---- Owl --------------------------------------------------------------------
  const owl = {
    perch: 0,          // index of the current branch
    state: "perched",  // perched | flying
    nextFlightAt: OWL.firstFlightAt,
    flightStart: 0,
  };

  function perchedPos(i, t, k) {
    const p = OWL.perches[i];
    const [dx, dy] = sway(p.feet.x, p.feet.y, t, k);
    return { x: p.sprite.x + dx, y: p.sprite.y + dy, fx: p.feet.x + dx, fy: p.feet.y + dy };
  }

  const ease = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const smooth = (a, b, u) => { const x = Math.min(Math.max((u - a) / (b - a), 0), 1); return x * x * (3 - 2 * x); };
  function cubic(p0, p1, p2, p3, u) {
    const v = 1 - u;
    return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3;
  }

  function setWing(el, scaleY) {
    // hinge at the shoulder (-1, -3)
    el.setAttribute("transform", `translate(-1 -3) scale(1 ${scaleY.toFixed(3)}) translate(1 3)`);
  }

  function updateOwl(t, k) {
    if (owl.state === "perched") {
      const p = perchedPos(owl.perch, t, k);
      // little crouch just before taking off
      const crouch = reduceMotion ? 0 : smooth(owl.nextFlightAt - 0.45, owl.nextFlightAt, t);
      owlPerched.style.transform = `translate(${p.x}px, ${p.y}px) scaleY(${1 - 0.08 * crouch})`;
      owlPerched.style.opacity = 1;
      owlFlying.style.opacity = 0;
      if (!reduceMotion && t >= owl.nextFlightAt) {
        owl.state = "flying";
        owl.flightStart = t;
      }
      return;
    }

    // flying
    const u = Math.min((t - owl.flightStart) / OWL.flightTime, 1);
    const from = perchedPos(owl.perch, t, k);
    const to = perchedPos(1 - owl.perch, t, k);
    const dir = Math.sign(to.fx - from.fx) || 1;
    // body centre sits ~14px above the feet
    const ax = from.fx, ay = from.fy - 14;
    const bx = to.fx, by = to.fy - 14;
    const span = bx - ax;
    // up off the branch, a long gentle swoop over the roof line, flare up to land
    const c1x = ax + span * 0.2, c1y = Math.min(ay, by) - 45;
    const c2x = ax + span * 0.72, c2y = Math.max(ay, by) + 85;
    const e = ease(u);
    const x = cubic(ax, c1x, c2x, bx, e);
    const y0 = cubic(ay, c1y, c2y, by, e);

    // wing beats: strong at take-off and landing, a glide in the middle
    const beat = (t - owl.flightStart) * 2 * Math.PI * 3.2;
    const flapAmt = 1 - 0.85 * smooth(0.3, 0.42, u) * (1 - smooth(0.62, 0.74, u));
    const w = Math.cos(beat);
    const wing = 0.15 * (1 - flapAmt) + w * flapAmt;   // 1 = wings up, -1 = wings down
    const bob = -1.6 * Math.sin(beat) * flapAmt;

    // heading tilt from the path tangent
    const e2 = ease(Math.min(u + 0.01, 1));
    const tx = cubic(ax, c1x, c2x, bx, e2) - x;
    const ty = cubic(ay, c1y, c2y, by, e2) - y0;
    const tilt = Math.max(-14, Math.min(14, Math.atan2(ty, Math.abs(tx) + 1e-6) * 180 / Math.PI * 0.6));

    setWing(wingNear, wing);
    setWing(wingFar, wing * 0.9 + 0.05);
    owlFlying.style.transform =
      `translate(${x - 22}px, ${y0 + bob - 22}px) scale(${dir}, 1) rotate(${tilt * dir}deg)`;

    // quick cross-fade between the drawn perched owl and the flying one
    const fadeIn = smooth(0, 0.025, u), fadeOut = 1 - smooth(0.975, 1, u);
    owlFlying.style.opacity = Math.min(fadeIn, fadeOut);
    const p = u < 0.5 ? from : to;
    owlPerched.style.transform = `translate(${p.x}px, ${p.y}px)`;
    owlPerched.style.opacity = u < 0.5 ? 1 - fadeIn : 1 - fadeOut;

    if (u >= 1) {
      owl.perch = 1 - owl.perch;
      owl.state = "perched";
      owl.nextFlightAt = t + OWL.restBetween;
    }
  }

  // ---- Main loop --------------------------------------------------------------
  let last = 0, clock = 0, running = true;

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.1); // pause-safe clock
    last = now;
    clock += dt;
    const k = reduceMotion ? 0 : smooth(0.3, SWAY.rampIn, clock);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, clock);
    gl.uniform1f(U.uK, k);
    gl.uniform4f(U.uView, view.x, view.y, view.s, 0);
    gl.uniform2f(U.uViewport, view.vw, view.vh);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    updateOwl(clock, k);
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  Promise.all([load("assets/scene.webp"), load("assets/mask.png")]).then(([img, mask]) => {
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
