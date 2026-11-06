(() => {
  const M = 44;
  const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uCanvas, uHalf, uOff, uScale, uPull, uPage, uView, uLight;
uniform float uRadius, uPullR, uPress, uDark, uPanel;
uniform vec3 uBase, uBlobA, uBlobB, uBlobC;
uniform vec4 uTint;

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float shape(vec2 p) {
  vec2 q = (p - uOff) / uScale;
  float d = sdBox(q, uHalf, uRadius) * min(uScale.x, uScale.y);
  float c = length(p - uOff - uPull) - uPullR;
  return smin(d, c, uHalf.y * 0.75);
}
float blob(vec2 g, vec2 c, vec2 r) {
  vec2 d = (g - c) / r;
  return exp(-dot(d, d) * 1.8);
}
vec3 bg(vec2 p) {
  if (uPanel > 0.5) return uBase;
  vec2 g = (uPage + p) / uView;
  vec3 col = uBase;
  col = mix(col, uBlobA, blob(g, vec2(0.12, 0.18), vec2(0.38, 0.34)) * 0.85);
  col = mix(col, uBlobB, blob(g, vec2(0.88, 0.82), vec2(0.30, 0.30)) * 0.85);
  col = mix(col, uBlobC, blob(g, vec2(0.70, 0.12), vec2(0.26, 0.28)) * 0.85);
  return col;
}
void main() {
  vec2 p = (vUv - 0.5) * uCanvas;
  p.y = -p.y;
  float d = shape(p);
  float a = 1.0 - smoothstep(-0.7, 0.7, d);

  float sh = shape(p - vec2(0.0, 8.0 - uPress * 4.0));
  float shadow = (1.0 - smoothstep(-8.0, 22.0, sh)) * mix(0.16, 0.5, uDark) * (1.0 - uPress * 0.45);

  float e = 0.75;
  vec2 grad = vec2(shape(p + vec2(e, 0.0)) - shape(p - vec2(e, 0.0)), shape(p + vec2(0.0, e)) - shape(p - vec2(0.0, e))) / (2.0 * e);
  float bevel = min(uHalf.y * 0.85, 18.0);
  float t = clamp(-d / bevel, 0.0, 1.0);
  float edge = (1.0 - t) * (1.0 - t);
  vec2 bend = grad * edge;

  float k = 26.0;
  vec3 col;
  col.r = bg(p - bend * k * 0.82).r;
  col.g = bg(p - bend * k * 1.0).g;
  col.b = bg(p - bend * k * 1.22).b;

  col = mix(col, uTint.rgb, uTint.a);
  col += mix(0.03, 0.035, uDark) * (1.0 - t * 0.5);
  col -= mix(0.05, 0.0, uDark) * edge;

  float wR = 1.0 - smoothstep(0.0, 1.6, abs(d + 1.0));
  float wG = 1.0 - smoothstep(0.0, 1.6, abs(d + 1.9));
  float wB = 1.0 - smoothstep(0.0, 1.6, abs(d + 2.8));
  float lit = clamp(dot(grad, normalize(vec2(-0.55, -0.83))), 0.0, 1.0);
  float back = clamp(dot(grad, normalize(vec2(0.55, 0.83))), 0.0, 1.0);
  vec3 fringe = vec3(wR, wG, wB);
  float fa = (wR + wG + wB) / 3.0;
  float fs = 0.3 + 0.55 * lit + 0.35 * back;
  col += (fringe - fa) * fs * mix(1.1, 0.8, uDark);
  col += fa * fs * mix(0.25, 0.6, uDark);

  float spec = pow(lit, 5.0) * smoothstep(0.0, 0.5, edge) * 0.55;
  col += spec;
  col += pow(back, 3.0) * edge * 0.18;
  col -= (1.0 - smoothstep(0.0, 6.0, -d)) * 0.03 * (1.0 - lit);

  vec2 lp = p - uLight;
  col += exp(-dot(lp, lp) / 3200.0) * 0.16 * uPress * (1.0 - uDark * 0.4);

  col = clamp(col, 0.0, 1.0);
  vec4 glass = vec4(col * a, a);
  gl_FragColor = glass + vec4(0.0, 0.0, 0.0, shadow) * (1.0 - a);
}`;
  const VERT = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';

  const probe = document.createElement('canvas').getContext('webgl');
  if (!probe) { document.documentElement.classList.add('no-gl'); return; }
  document.documentElement.classList.add('gl');

  const hex = s => {
    s = s.trim();
    if (s.startsWith('#')) {
      const n = parseInt(s.slice(1), 16);
      return [(n >> 16) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    }
    const m = s.match(/[\d.]+/g) || [0, 0, 0];
    return m.slice(0, 3).map(v => v / 255);
  };
  let theme = {};
  const readTheme = () => {
    const cs = getComputedStyle(document.documentElement);
    const v = n => hex(cs.getPropertyValue(n));
    theme = { base: v('--base'), a: v('--blob-a'), b: v('--blob-b'), c: v('--blob-c'), accent: v('--accent'),
      dark: matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'light' || document.documentElement.dataset.theme === 'dark' ? 1 : 0 };
  };
  readTheme();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rubber = v => v / (1 + Math.abs(v));
  const all = [];
  let raf = 0, last = 0;

  function make(el) {
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = el.textContent;
    el.textContent = '';
    const cv = document.createElement('canvas');
    cv.className = 'glass';
    cv.setAttribute('aria-hidden', 'true');
    el.append(cv, lbl);

    const gl = cv.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    for (const n of ['uCanvas', 'uHalf', 'uOff', 'uScale', 'uPull', 'uPage', 'uView', 'uLight', 'uRadius', 'uPullR', 'uPress', 'uDark', 'uPanel', 'uBase', 'uBlobA', 'uBlobB', 'uBlobC', 'uTint']) U[n] = gl.getUniformLocation(prog, n);

    const g = {
      el, cv, gl, lbl, w: 0, h: 0, dirty: true, id: null, ox: 0, oy: 0, px: 0, py: 0,
      panel: !!el.closest('.panel'), primary: el.classList.contains('primary'),
      cur: { x: 0, y: 0, sx: 1, sy: 1, qx: 0, qy: 0, pr: 0 },
      vel: { x: 0, y: 0, sx: 0, sy: 0, qx: 0, qy: 0, pr: 0 },
      goal: { x: 0, y: 0, sx: 1, sy: 1, qx: 0, qy: 0, pr: 0 },
    };

    g.size = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 3);
      g.w = w; g.h = h; g.dpr = dpr;
      cv.width = Math.round((w + M * 2) * dpr);
      cv.height = Math.round((h + M * 2) * dpr);
      g.place();
      g.dirty = true;
      kick();
    };
    g.place = () => { const r = el.getBoundingClientRect(); g.rect = { left: r.left - g.cur.x, top: r.top - g.cur.y, width: g.w, height: g.h }; };

    g.draw = () => {
      if (!g.w) return;
      const r = g.rect;
      const c = g.cur;
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.uCanvas, g.w + M * 2, g.h + M * 2);
      gl.uniform2f(U.uHalf, g.w / 2, g.h / 2);
      gl.uniform1f(U.uRadius, g.h / 2);
      gl.uniform2f(U.uOff, c.x, c.y);
      gl.uniform2f(U.uScale, c.sx, c.sy);
      const pl = Math.hypot(c.qx, c.qy);
      gl.uniform2f(U.uPull, c.qx, c.qy);
      gl.uniform1f(U.uPullR, g.h * 0.36 * Math.min(1, pl / 14) * (1 - Math.min(0.35, pl / 160)));
      gl.uniform1f(U.uPress, c.pr);
      gl.uniform2f(U.uLight, g.px - (r.left + r.width / 2), g.py - (r.top + r.height / 2));
      gl.uniform2f(U.uPage, r.left - M, r.top - M);
      gl.uniform2f(U.uView, innerWidth, innerHeight);
      gl.uniform1f(U.uDark, theme.dark);
      gl.uniform1f(U.uPanel, g.panel ? 1 : 0);
      gl.uniform3fv(U.uBase, theme.base);
      gl.uniform3fv(U.uBlobA, theme.a);
      gl.uniform3fv(U.uBlobB, theme.b);
      gl.uniform3fv(U.uBlobC, theme.c);
      if (g.primary) gl.uniform4f(U.uTint, theme.accent[0], theme.accent[1], theme.accent[2], 0.78);
      else gl.uniform4f(U.uTint, 1, 1, 1, theme.dark ? 0.04 : 0.12);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      lbl.style.transform = `translate3d(${(c.x + c.qx * 0.18).toFixed(2)}px, ${(c.y + c.qy * 0.18).toFixed(2)}px, 0)`;
    };

    g.aim = () => {
      const ax = rubber((g.px - g.ox) / 70), ay = rubber((g.py - g.oy) / 46);
      g.goal.qx = ax * 46;
      g.goal.qy = ay * 30;
      g.goal.x = ax * 5;
      g.goal.y = ay * 3;
      g.goal.sx = 0.97 + Math.abs(ax) * 0.03 - Math.abs(ay) * 0.02;
      g.goal.sy = 0.93 + Math.abs(ay) * 0.05 - Math.abs(ax) * 0.03;
      g.goal.pr = 1;
    };

    el.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      g.id = e.pointerId;
      g.place();
      try { el.setPointerCapture(g.id); } catch {}
      g.px = g.ox = e.clientX; g.py = g.oy = e.clientY;
      g.aim();
      el.classList.add('pressed');
      try { navigator.vibrate?.(6); } catch {}
      kick();
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerId !== g.id) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      const ev = evs.length ? evs[evs.length - 1] : e;
      g.px = ev.clientX; g.py = ev.clientY;
      g.aim();
      kick();
    }, { passive: true });
    const end = e => {
      if (e.pointerId !== g.id) return;
      g.id = null;
      el.classList.remove('pressed');
      Object.assign(g.goal, { x: 0, y: 0, sx: 1, sy: 1, qx: 0, qy: 0, pr: 0 });
      kick();
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('lostpointercapture', end);

    new ResizeObserver(g.size).observe(el);
    all.push(g);
  }

  function step(g, dt) {
    const held = g.id !== null;
    const k = held ? 420 : 170, c = held ? 30 : 15;
    const n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
    for (let i = 0; i < n; i++) {
      for (const key in g.cur) {
        if (reduce) { g.cur[key] = g.goal[key]; continue; }
        g.vel[key] += (k * (g.goal[key] - g.cur[key]) - c * g.vel[key]) * h;
        g.cur[key] += g.vel[key] * h;
      }
    }
    let moving = false;
    for (const key in g.cur) {
      const eps = key === 'qx' || key === 'qy' || key === 'x' || key === 'y' ? 0.02 : 0.0004;
      if (Math.abs(g.goal[key] - g.cur[key]) > eps || Math.abs(g.vel[key]) > eps * 4) { moving = true; break; }
    }
    if (!moving) { Object.assign(g.cur, g.goal); for (const key in g.vel) g.vel[key] = 0; }
    return moving || held;
  }

  function frame(t) {
    const dt = last ? Math.min(0.034, (t - last) / 1000) : 1 / 120;
    last = t;
    let again = false;
    for (const g of all) {
      if (!g.w) continue;
      const live = step(g, dt);
      if (live || g.dirty || g.wasLive) { g.draw(); g.dirty = false; }
      g.wasLive = live;
      again = again || live;
    }
    if (again) raf = requestAnimationFrame(frame);
    else { raf = 0; last = 0; }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  const redraw = () => { readTheme(); all.forEach(g => { if (g.w) g.place(); g.dirty = true; }); kick(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  addEventListener('resize', redraw);

  document.querySelectorAll('.btn').forEach(make);
  window.glassRefresh = redraw;
})();

function label(el, text) {
  (el.querySelector('.lbl') || el).textContent = text;
}
