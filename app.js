const $ = id => document.getElementById(id);
const drop = $('drop');
const isMobile = /Android|iPhone|iPad|iPod|HarmonyOS/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
const enc = encodeURIComponent;

const SAFE_SCHEMES = /^(https?|tel|mailto|sms|smsto|geo|weixin|alipays?|taobao|tmall|openapp\.jdmobile|snssdk\d+|bilibili|sinaweibo|mqq\w*|dingtalk|xhsdiscover|zhihu|orpheus|lark|imeituan|pinduoduo|kwai|whatsapp|tg|line|kakaotalk|fb|instagram|twitter|spotify|zoomus|market|itms-apps|steam):/i;
const SHORT = ['t.cn', 'url.cn', 'dwz.cn', 'b23.tv', 'v.douyin.com', 'xhslink.com', 'tb.cn', 'm.tb.cn', '3.cn', 'suo.im', 'bit.ly', 't.co', 'tinyurl.com', 'v.kuaishou.com', '163cn.tv', 'goo.gl', 'is.gd', 'ow.ly', 'rebrand.ly', 'cutt.ly', 'shorturl.at', 'amzn.to', 'a.co', 'lnkd.in', 'pin.it', 'redd.it', 'youtu.be', 's.team', 'apple.co', 'db.tt', '1drv.ms', 'shp.ee', 'abnb.me', 'flic.kr', 'nico.ms', 'g.co'];

const BY_HOST = new Map();
const BY_WILD = [];
for (const a of APPS) for (const h of a.hosts) {
  if (h.endsWith('.*')) BY_WILD.push([h.slice(0, -2), a]);
  else BY_HOST.set(h, a);
}

function matchApp(url) {
  let host;
  try { host = new URL(url).hostname.toLowerCase().replace(/\.$/, ''); } catch { return null; }
  const parts = host.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    const hit = BY_HOST.get(parts.slice(i).join('.'));
    if (hit) return hit;
  }
  for (const [label, a] of BY_WILD) {
    const i = parts.indexOf(label);
    if (i >= 0 && i >= parts.length - 3 && i < parts.length - 1) return a;
  }
  return null;
}

function parseWifi(s) {
  const get = k => (s.match(new RegExp('[:;]' + k + ':((?:\\\\.|[^;])*)')) || [])[1]?.replace(/\\(.)/g, '$1') || '';
  return { ssid: get('S'), pass: get('P'), type: get('T') || '无' };
}

function analyze(text) {
  const t = text.trim();
  if (/^WIFI:/i.test(t)) {
    const w = parseWifi(t);
    return { show: `名称 ${w.ssid}\n密码 ${w.pass || '无'}\n加密 ${w.type}`, copy: w.pass || w.ssid,
      app: { name: 'Wi-Fi：' + w.ssid, icon: 'W', color: '#34c759', tip: '复制密码后，去系统设置里连接' } };
  }
  if (/^BEGIN:VCARD/i.test(t)) {
    const fn = (t.match(/\nFN[^:]*:(.*)/i) || [])[1] || '联系人';
    return { show: t, copy: t, app: { name: fn.trim(), icon: '名', color: '#8e8e93', tip: '名片，复制后可存进通讯录' } };
  }
  if (/^tel:/i.test(t)) return { show: t.slice(4), copy: t.slice(4), open: t, app: { name: '电话', color: '#34c759', tip: t.slice(4) } };
  if (/^mailto:/i.test(t)) return { show: t.slice(7), copy: t.slice(7), open: t, app: { name: '邮件', color: '#1a73e8', tip: t.slice(7).split('?')[0] } };
  if (/^smsto?:/i.test(t)) {
    const [, num, body = ''] = t.split(':');
    return { show: num + (body ? '\n' + body : ''), copy: body || num, open: `sms:${num}${body ? '?body=' + enc(body) : ''}`, app: { name: '短信', color: '#34c759', tip: num } };
  }
  if (/^geo:/i.test(t)) return { show: t.slice(4), copy: t.slice(4), open: t, app: { name: '地图位置', color: '#30b0c7', tip: '用地图 App 打开' } };

  let url = t;
  if (!/^https?:/i.test(t) && /^(www\.)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i.test(t)) url = 'https://' + t;

  if (/^https?:\/\//i.test(url)) {
    const app = matchApp(url);
    if (app) {
      const scheme = app.scheme && isMobile ? app.scheme(url) : null;
      return { show: url, copy: url, open: scheme || url, browser: scheme ? url : null, openText: `用${app.name}打开`,
        app: { ...app, tip: app.tip || (app.scheme && !isMobile ? hostOf(url) + ' · 手机上可直接跳进 App' : hostOf(url)) } };
    }
    return { show: url, copy: url, open: url, app: { name: '网页', icon: '↗', color: '#5f6368', tip: '没认出是哪个 App，用浏览器打开' } };
  }

  if (SAFE_SCHEMES.test(t)) return { show: t, copy: t, open: t, app: { name: 'App 专用链接', icon: '⌁', color: '#5f6368', tip: '需要在装了对应 App 的手机上打开' } };
  return { show: t, copy: t, app: { name: '一段文字', icon: '文', color: '#5f6368', tip: '不是链接，可以直接复制' } };
}

function hostOf(s) {
  try { return /^https?:/i.test(s) ? new URL(s).hostname : ''; } catch { return ''; }
}

function safety(url, host) {
  if (!host) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(':')) return ['warn', 'IP 地址'];
  if (SHORT.includes(host)) return ['warn', '短链接'];
  if (/^http:/i.test(url)) return ['warn', '未加密'];
  return ['ok', 'HTTPS'];
}

function tone(hex) {
  const n = parseInt(hex.slice(1), 16);
  const l = (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
  return l < 0.42 || l > 0.86 ? 'var(--ink)' : hex;
}

function glyph(name) {
  const m = name.match(/[一-鿿]|[A-Za-z0-9]/);
  return m ? m[0].toUpperCase() : name[0];
}

function render(text) {
  const r = analyze(text);
  $('content').textContent = r.show;
  $('appIcon').textContent = r.app.icon || glyph(r.app.name);
  $('appIcon').style.color = tone(r.app.color);
  $('appName').textContent = r.app.name;
  $('appTip').textContent = r.app.tip || '';

  const sf = safety(r.copy, hostOf(r.copy));
  $('safety').hidden = !sf;
  if (sf) { $('safety').textContent = sf[1]; $('safety').className = 'tag ' + sf[0]; }

  const open = r.open && SAFE_SCHEMES.test(r.open) ? r.open : null;
  $('openBtn').hidden = !open;
  if (open) {
    $('openBtn').href = open;
    label($('openBtn'), r.openText || '打开');
  }
  $('browserBtn').hidden = !r.browser;
  if (r.browser) $('browserBtn').href = r.browser;

  $('copyBtn').onclick = () => copy(r.copy);
  $('empty').hidden = true;
  $('result').hidden = false;
  window.glassRefresh?.();
}

async function copy(s) {
  try {
    await navigator.clipboard.writeText(s);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: s });
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  const btn = $('copyBtn');
  btn.classList.add('copied');
  label(btn, '已复制');
  buzz(10);
  clearTimeout(copy.t);
  copy.t = setTimeout(() => { btn.classList.remove('copied'); label(btn, '复制'); }, 1400);
}

function msg(s, err) {
  $('msg').textContent = s;
  $('msg').className = 'msg' + (err ? ' err' : s ? ' ok' : '');
}

function state(name) {
  drop.classList.remove('done', 'fail');
  if (name) drop.classList.add(name);
}

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

async function decode(img) {
  if ('BarcodeDetector' in window) {
    try {
      const codes = await new BarcodeDetector({ formats: ['qr_code'] }).detect(img);
      if (codes.length) return codes[0].rawValue;
    } catch {}
  }
  const w0 = img.naturalWidth, h0 = img.naturalHeight;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const tried = new Set();
  for (const max of [1000, 1600, 600, 2400, 400]) {
    const s = Math.min(1, max / Math.max(w0, h0));
    const w = Math.round(w0 * s), h = Math.round(h0 * s);
    if (tried.has(w)) continue;
    tried.add(w);
    canvas.width = w; canvas.height = h;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const res = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' });
    if (res && res.data) return res.data;
  }
  return null;
}

async function handle(blob) {
  if (!blob || !blob.type.startsWith('image/')) return msg('这不是图片，换一张试试', true);
  let img;
  try { img = await loadImage(blob); } catch { state('fail'); return msg('图片打不开，换一张试试', true); }
  msg('');
  state();
  $('result').hidden = true;
  $('empty').hidden = false;
  $('preview').src = img.src;
  $('preview').hidden = false;
  $('hint').hidden = true;
  const text = await decode(img);
  if (!text) {
    state('fail');
    buzz([20, 60, 20]);
    return msg('没找到二维码，换张清楚点的', true);
  }
  state('done');
  buzz(12);
  render(text);
}

const buzz = p => { try { navigator.vibrate?.(p); } catch {} };

$('count').textContent = `认得 ${APPS.length} 个应用`;

document.addEventListener('paste', e => {
  const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
  if (item) { e.preventDefault(); handle(item.getAsFile()); }
  else msg('剪贴板里没有图片', true);
});

$('pasteBtn').onclick = async () => {
  try {
    for (const item of await navigator.clipboard.read()) {
      const type = item.types.find(t => t.startsWith('image/'));
      if (type) return handle(await item.getType(type));
    }
    msg('剪贴板里没有图片', true);
  } catch {
    msg(isMobile ? '浏览器不让读剪贴板，请点「选择图片」' : '浏览器不让读剪贴板，直接按 Ctrl+V 吧', true);
  }
};

$('pickBtn').onclick = () => $('file').click();
$('file').onchange = e => { handle(e.target.files[0]); e.target.value = ''; };

drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', e => { if (!drop.contains(e.relatedTarget)) drop.classList.remove('over'); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('result').hidden) reset();
});

function reset() {
  state();
  msg('');
  $('result').hidden = true;
  $('empty').hidden = false;
  $('preview').hidden = true;
  $('hint').hidden = false;
}
drop.addEventListener('drop', e => {
  e.preventDefault();
  drop.classList.remove('over');
  handle(e.dataTransfer.files[0]);
});
