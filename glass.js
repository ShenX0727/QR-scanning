(() => {
  const M = 44;
  const N = 3;
  const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uCanvas, uPage, uView, uLight;
uniform vec4 uBox[${N}];
uniform vec4 uXf[${N}];
uniform float uPrim[${N}];
uniform float uK, uPress, uDark, uPanel;
uniform vec3 uBase, uBlobA, uBlobB, uBlobC, uTint;

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float field(vec2 p, out float prim) {
  float d = 1e5, ws = 0.0, ps = 0.0;
  for (int i = 0; i < ${N}; i++) {
    if (uBox[i].z < 0.5) continue;
    vec2 q = (p - uBox[i].xy - uXf[i].xy) / uXf[i].zw;
    float di = sdBox(q, uBox[i].zw, uBox[i].w) * min(uXf[i].z, uXf[i].w);
    float w = 1.0 / (1.0 + exp(clamp(di / 6.0, -20.0, 20.0)));
    ws += w;
    ps += w * uPrim[i];
    d = d > 1e4 ? di : smin(d, di, uK);
  }
  prim = ps / max(ws, 1e-5);
  return d;
}
float shape(vec2 p) { float x; return field(p, x); }
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
  float prim;
  float d = field(p, prim);
  float a = 1.0 - smoothstep(-0.6, 0.6, d);

  float sh = shape(p - vec2(0.0, 6.0 - uPress * 3.0));
  float shadow = (1.0 - smoothstep(-10.0, 24.0, sh)) * mix(0.09, 0.38, uDark) * (1.0 - uPress * 0.4);

  float e = 0.75;
  vec2 grad = vec2(shape(p + vec2(e, 0.0)) - shape(p - vec2(e, 0.0)), shape(p + vec2(0.0, e)) - shape(p - vec2(0.0, e))) / (2.0 * e);
  float glen = length(grad);
  grad = glen > 1e-4 ? grad / glen : vec2(0.0);
  float t = clamp(-d / 16.0, 0.0, 1.0);
  float edge = (1.0 - t) * (1.0 - t);
  vec2 bend = grad * edge * 18.0;

  vec3 col;
  col.r = bg(p - bend * 0.97).r;
  col.g = bg(p - bend).g;
  col.b = bg(p - bend * 1.03).b;

  vec3 clear = mix(col, vec3(1.0), mix(0.24, 0.07, uDark));
  vec3 tinted = mix(col, uTint, 0.9) + (0.5 - p.y / 120.0) * 0.06;
  col = mix(clear, tinted, smoothstep(0.0, 1.0, prim));

  float lit = clamp(dot(grad, normalize(vec2(-0.5, -0.86))), 0.0, 1.0);
  float back = clamp(dot(grad, normalize(vec2(0.5, 0.86))), 0.0, 1.0);
  float rim = 1.0 - smoothstep(0.0, 1.3, abs(d + 0.9));
  float rimI = 0.18 + 0.82 * pow(max(lit, back * 0.75), 1.4);
  col = mix(col, vec3(1.0), rim * rimI * mix(0.75, 0.55, uDark));
  col += edge * mix(0.035, 0.03, uDark);
  col += pow(lit, 4.0) * smoothstep(0.15, 0.9, edge) * 0.18;

  vec2 lp = p - uLight;
  col += exp(-dot(lp, lp) / 2600.0) * 0.1 * uPress;

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
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const v = n => hex(cs.getPropertyValue(n));
    const dark = root.dataset.theme === 'dark' || (root.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    theme = { base: v('--base'), a: v('--blob-a'), b: v('--blob-b'), c: v('--blob-c'), dark: dark ? 1 : 0 };
  };
  readTheme();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = p => { try { navigator.vibrate?.(p); } catch {} };
  const groups = [];
  let raf = 0, last = 0;

  function xf(b) {
    const c = b.cur;
    const ex = 1 + 0.32 * Math.abs(c.vx), ey = 1 + 0.5 * Math.abs(c.vy);
    const sx = ex / Math.sqrt(ey) * (1 - 0.03 * c.pr), sy = ey / Math.sqrt(ex) * (1 - 0.07 * c.pr);
    const ox = Math.sign(c.vx) * Math.max(0, sx - 1) * b.w / 2 * 0.85 + c.vx * 6;
    const oy = Math.sign(c.vy) * Math.max(0, sy - 1) * b.h / 2 * 0.85 + c.vy * 5;
    return { sx, sy, ox, oy };
  }

  function makeGroup(host) {
    const cv = document.createElement('canvas');
    cv.className = 'glass';
    cv.setAttribute('aria-hidden', 'true');
    host.prepend(cv);
    host.classList.add('glass-group');
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
    for (const n of ['uCanvas', 'uPage', 'uView', 'uLight', 'uBox', 'uXf', 'uPrim', 'uK', 'uPress', 'uDark', 'uPanel', 'uBase', 'uBlobA', 'uBlobB', 'uBlobC', 'uTint']) U[n] = gl.getUniformLocation(prog, n);

    const G = { host, cv, gl, U, btns: [], w: 0, h: 0, rect: null, dirty: true, panel: !!host.closest('.panel'),
      k: { cur: 2, vel: 0, goal: 2 }, snapped: false, light: [0, 0] };

    G.layout = () => {
      const r = host.getBoundingClientRect();
      G.w = host.offsetWidth; G.h = host.offsetHeight;
      if (!G.w || !G.h) return;
      G.rect = { left: r.left, top: r.top };
      const dpr = Math.min(devicePixelRatio || 1, 3);
      const W = Math.round((G.w + M * 2) * dpr), H = Math.round((G.h + M * 2) * dpr);
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      for (const b of G.btns) {
        b.w = b.el.offsetWidth; b.h = b.el.offsetHeight;
        b.active = b.w > 0 && b.h > 0 && !b.el.hidden;
        b.cx = b.el.offsetLeft + b.w / 2 - G.w / 2;
        b.cy = b.el.offsetTop + b.h / 2 - G.h / 2;
      }
      G.dirty = true;
      kick();
    };

    G.draw = () => {
      if (!G.w) return;
      const box = new Float32Array(N * 4), tr = new Float32Array(N * 4), prim = new Float32Array(N);
      let press = 0;
      G.btns.slice(0, N).forEach((b, i) => {
        const t = xf(b);
        b.t = t;
        if (b.active) {
          box.set([b.cx, b.cy, b.w / 2, b.h / 2], i * 4);
          tr.set([t.ox, t.oy, t.sx, t.sy], i * 4);
        } else tr.set([0, 0, 1, 1], i * 4);
        prim[i] = b.primary ? 1 : 0;
        press = Math.max(press, b.cur.pr);
        b.lbl.style.transform = `translate3d(${(t.ox * 0.7).toFixed(2)}px, ${(t.oy * 0.7).toFixed(2)}px, 0)`;
      });
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.uCanvas, G.w + M * 2, G.h + M * 2);
      gl.uniform2f(U.uPage, G.rect.left - M, G.rect.top - M);
      gl.uniform2f(U.uView, innerWidth, innerHeight);
      gl.uniform2f(U.uLight, G.light[0], G.light[1]);
      gl.uniform4fv(U.uBox, box);
      gl.uniform4fv(U.uXf, tr);
      gl.uniform1fv(U.uPrim, prim);
      gl.uniform1f(U.uK, G.k.cur);
      gl.uniform1f(U.uPress, press);
      gl.uniform1f(U.uDark, theme.dark);
      gl.uniform1f(U.uPanel, G.panel ? 1 : 0);
      gl.uniform3fv(U.uBase, theme.base);
      gl.uniform3fv(U.uBlobA, theme.a);
      gl.uniform3fv(U.uBlobB, theme.b);
      gl.uniform3fv(U.uBlobC, theme.c);
      gl.uniform3fv(U.uTint, theme.dark ? [0.2, 0.55, 1] : [0.1, 0.5, 1]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    host.querySelectorAll('.btn').forEach(el => G.btns.push(makeBtn(el, G)));
    const ro = new ResizeObserver(G.layout);
    ro.observe(host);
    G.btns.forEach(b => ro.observe(b.el));
    new MutationObserver(G.layout).observe(host, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
    groups.push(G);
  }

  function makeBtn(el, G) {
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    lbl.textContent = el.textContent;
    el.textContent = '';
    el.append(lbl);
    const b = {
      el, lbl, G, w: 0, h: 0, cx: 0, cy: 0, active: false, primary: el.classList.contains('primary'),
      id: null, ox: 0, oy: 0, px: 0, py: 0, aimX: 0, aimY: 0, cancel: false,
      cur: { vx: 0, vy: 0, pr: 0 }, vel: { vx: 0, vy: 0, pr: 0 }, goal: { vx: 0, vy: 0, pr: 0 },
    };
    const aim = () => {
      const mx = (b.px - b.ox) / 90, my = (b.py - b.oy) / 60;
      const m = Math.hypot(mx, my), r = m / (1 + m);
      b.aimX = m ? mx / m * r : 0;
      b.aimY = m ? my / m * r : 0;
      G.light = [b.px - G.rect.left - G.w / 2, b.py - G.rect.top - G.h / 2];
    };
    const inside = (x, y) => {
      const r = el.getBoundingClientRect(), pad = 12;
      return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;
    };
    el.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      b.id = e.pointerId;
      b.cancel = false;
      G.layout();
      try { el.setPointerCapture(b.id); } catch {}
      b.px = b.ox = e.clientX; b.py = b.oy = e.clientY;
      aim();
      el.classList.add('pressed');
      buzz(6);
      kick();
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerId !== b.id) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      const ev = evs.length ? evs[evs.length - 1] : e;
      b.px = ev.clientX; b.py = ev.clientY;
      aim();
      kick();
    }, { passive: true });
    const end = e => {
      if (e.pointerId !== b.id) return;
      b.id = null;
      if (e.type === 'pointerup' && !inside(e.clientX, e.clientY)) b.cancel = true;
      el.classList.remove('pressed');
      b.aimX = b.aimY = 0;
      kick();
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('lostpointercapture', end);
    el.addEventListener('click', e => {
      if (!b.cancel) return;
      b.cancel = false;
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
    return b;
  }

  function attract(G) {
    const held = G.btns.find(b => b.id !== null && b.active);
    for (const b of G.btns) { b.goal.vx = b.aimX; b.goal.vy = b.aimY; b.goal.pr = b.id !== null ? 1 : 0; }
    let best = 0;
    if (held) {
      const th = xf(held);
      for (const o of G.btns) {
        if (o === held || !o.active) continue;
        const to = xf(o);
        const dx = (o.cx + to.ox) - (held.cx + th.ox), dy = (o.cy + to.oy) - (held.cy + th.oy);
        const gx = Math.abs(dx) - (held.w / 2 * th.sx + o.w / 2 * to.sx);
        const gy = Math.abs(dy) - (held.h / 2 * th.sy + o.h / 2 * to.sy);
        const gap = Math.max(gx, gy);
        const rest = Math.max(Math.abs(o.cx - held.cx) - (held.w + o.w) / 2, Math.abs(o.cy - held.cy) - (held.h + o.h) / 2);
        const start = rest - 3, full = -4;
        let f = Math.min(1, Math.max(0, (start - gap) / (start - full)));
        f = f * f * (3 - 2 * f);
        if (f <= 0) continue;
        const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
        o.goal.vx = -ux * 0.55 * f;
        o.goal.vy = -uy * 0.55 * f;
        held.goal.vx += ux * 0.3 * f;
        held.goal.vy += uy * 0.3 * f;
        best = Math.max(best, f);
      }
      const m = Math.hypot(held.goal.vx, held.goal.vy);
      if (m > 0.92) { held.goal.vx *= 0.92 / m; held.goal.vy *= 0.92 / m; }
    }
    G.k.goal = 2 + 18 * best;
    const snapped = best > 0.7;
    if (snapped && !G.snapped) buzz(10);
    G.snapped = snapped;
  }

  function spring(o, key, goal, k, c, h) {
    o.vel[key] += (k * (goal - o.cur[key]) - c * o.vel[key]) * h;
    o.cur[key] += o.vel[key] * h;
  }

  function step(G, dt) {
    attract(G);
    const n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
    let live = false;
    for (const b of G.btns) {
      const held = b.id !== null;
      const k = held ? 380 : 230, c = held ? 30 : 14;
      for (let i = 0; i < n; i++) for (const key in b.cur) {
        if (reduce) b.cur[key] = b.goal[key];
        else spring(b, key, b.goal[key], k, c, h);
      }
      let moving = held;
      for (const key in b.cur) if (Math.abs(b.goal[key] - b.cur[key]) > 6e-4 || Math.abs(b.vel[key]) > 2e-3) moving = true;
      if (!moving) { Object.assign(b.cur, b.goal); b.vel.vx = b.vel.vy = b.vel.pr = 0; }
      live = live || moving;
    }
    const K = G.k;
    for (let i = 0; i < n; i++) {
      K.vel += (300 * (K.goal - K.cur) - 26 * K.vel) * h;
      K.cur += K.vel * h;
    }
    if (Math.abs(K.goal - K.cur) > 0.02 || Math.abs(K.vel) > 0.05) live = true;
    else { K.cur = K.goal; K.vel = 0; }
    K.cur = Math.max(0.5, K.cur);
    return live;
  }

  function frame(t) {
    const dt = last ? Math.min(0.034, (t - last) / 1000) : 1 / 120;
    last = t;
    let again = false;
    for (const G of groups) {
      if (!G.w) continue;
      const live = step(G, dt);
      if (live || G.dirty || G.wasLive) { G.draw(); G.dirty = false; }
      G.wasLive = live;
      again = again || live;
    }
    if (again) raf = requestAnimationFrame(frame);
    else { raf = 0; last = 0; }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }

  const redraw = () => { readTheme(); groups.forEach(G => G.layout()); kick(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  addEventListener('resize', redraw);

  document.querySelectorAll('.actions').forEach(makeGroup);
  window.glassRefresh = redraw;
})();

function label(el, text) {
  (el.querySelector('.lbl') || el).textContent = text;
}
