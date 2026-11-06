const $ = id => document.getElementById(id);
const drop = $('drop');
const isMobile = /Android|iPhone|iPad|iPod|HarmonyOS/i.test(navigator.userAgent);
const enc = encodeURIComponent;

const APPS = [
  { name: '微信', color: '#07c160', hosts: ['weixin.qq.com', 'wx.qq.com', 'u.wechat.com', 'wx.tenpay.com', 'work.weixin.qq.com', 'mp.weixin.qq.com'],
    scheme: () => 'weixin://', tip: '微信链接通常需在微信内打开，可复制后发给自己，或用微信扫一扫' },
  { name: '支付宝', color: '#1677ff', hosts: ['alipay.com', 'alipay.cn'],
    scheme: u => 'alipays://platformapi/startapp?saId=10000007&qrcode=' + enc(u) },
  { name: '淘宝', color: '#ff5000', hosts: ['taobao.com', 'tb.cn', 'tmall.com'],
    scheme: u => 'taobao://' + u.replace(/^https?:\/\//, '') },
  { name: '京东', color: '#e1251b', hosts: ['jd.com', '3.cn'],
    scheme: u => 'openapp.jdmobile://virtual?params=' + enc(JSON.stringify({ category: 'jump', des: 'm', url: u })) },
  { name: '拼多多', color: '#e02e24', hosts: ['yangkeduo.com', 'pinduoduo.com'] },
  { name: '抖音', color: '#161823', hosts: ['douyin.com', 'iesdouyin.com'] },
  { name: '快手', color: '#ff4906', hosts: ['kuaishou.com', 'chenzhongtech.com'] },
  { name: '哔哩哔哩', color: '#fb7299', hosts: ['bilibili.com', 'b23.tv'] },
  { name: '小红书', color: '#ff2442', hosts: ['xiaohongshu.com', 'xhslink.com'] },
  { name: '微博', color: '#e6162d', hosts: ['weibo.com', 'weibo.cn'],
    scheme: u => 'sinaweibo://browser?url=' + enc(u) },
  { name: 'QQ', color: '#12b7f5', hosts: ['qm.qq.com', 'im.qq.com', 'ti.qq.com'] },
  { name: '钉钉', color: '#3296fa', hosts: ['dingtalk.com'],
    scheme: u => 'dingtalk://dingtalkclient/page/link?url=' + enc(u) },
  { name: '飞书', color: '#3370ff', hosts: ['feishu.cn', 'larksuite.com'] },
  { name: '美团', color: '#ffc300', hosts: ['meituan.com', 'dianping.com'] },
  { name: '知乎', color: '#1772f6', hosts: ['zhihu.com'] },
  { name: '网易云音乐', color: '#e60026', hosts: ['music.163.com', '163cn.tv'] },
  { name: 'GitHub', color: '#24292f', hosts: ['github.com'] },
  { name: 'YouTube', color: '#ff0000', hosts: ['youtube.com', 'youtu.be'] },
];

const SAFE_SCHEMES = /^(https?|tel|mailto|sms|smsto|geo|weixin|alipays?|taobao|tmall|openapp\.jdmobile|snssdk\d+|bilibili|sinaweibo|mqq\w*|dingtalk|xhsdiscover|zhihu|orpheus|lark|imeituan|pinduoduo|kwai):/i;

function matchApp(url) {
  let host;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return null; }
  return APPS.find(a => a.hosts.some(h => host === h || host.endsWith('.' + h))) || null;
}

function parseWifi(s) {
  const get = k => (s.match(new RegExp('[:;]' + k + ':((?:\\\\.|[^;])*)')) || [])[1]?.replace(/\\(.)/g, '$1') || '';
  return { ssid: get('S'), pass: get('P'), type: get('T') || '无' };
}

function analyze(text) {
  const t = text.trim();
  if (/^WIFI:/i.test(t)) {
    const w = parseWifi(t);
    return { kind: 'Wi-Fi', show: `名称：${w.ssid}\n密码：${w.pass || '（无）'}\n加密：${w.type}`, copy: w.pass || w.ssid,
      app: { name: '连接 Wi-Fi', color: '#34c759', tip: '已可复制密码，到系统设置里连接即可' } };
  }
  if (/^BEGIN:VCARD/i.test(t)) return { kind: '名片', show: t, copy: t, app: { name: '通讯录', color: '#8e8e93', tip: '复制后可粘贴到通讯录' } };
  if (/^tel:/i.test(t)) return { kind: '电话', show: t.slice(4), copy: t.slice(4), open: t, app: { name: '电话', color: '#34c759' } };
  if (/^mailto:/i.test(t)) return { kind: '邮箱', show: t.slice(7), copy: t.slice(7), open: t, app: { name: '邮件', color: '#1a73e8' } };
  if (/^smsto?:/i.test(t)) {
    const [, num, body = ''] = t.split(':');
    return { kind: '短信', show: num + (body ? '\n' + body : ''), copy: body || num, open: `sms:${num}${body ? '?body=' + enc(body) : ''}`, app: { name: '短信', color: '#34c759' } };
  }

  let url = t;
  if (/^(www\.)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(t) && !/^https?:/i.test(t)) url = 'https://' + t;

  if (/^https?:\/\//i.test(url)) {
    const app = matchApp(url);
    if (app) {
      const scheme = app.scheme && isMobile ? app.scheme(url) : null;
      return { kind: '链接', show: url, copy: url, open: scheme || url, browser: scheme ? url : null,
        app: { ...app, tip: app.tip || (isMobile ? `推荐用${app.name}打开` : `推荐用${app.name}打开，在手机上可直接唤起 App`) } };
    }
    return { kind: '链接', show: url, copy: url, open: url, app: { name: '浏览器', color: '#5f6368', tip: '普通网页，直接在浏览器打开即可' } };
  }

  if (SAFE_SCHEMES.test(t)) return { kind: 'App 链接', show: t, copy: t, open: t, app: { name: '对应 App', color: '#5f6368', tip: '这是 App 专用链接，需在手机上打开' } };
  return { kind: '文本', show: t, copy: t, app: null };
}

function render(text) {
  const r = analyze(text);
  $('kind').textContent = r.kind;
  $('content').textContent = r.show;
  let host = '';
  try { host = /^https?:/i.test(r.copy) ? new URL(r.copy).hostname : ''; } catch {}
  $('host').textContent = host;
  const sf = safety(r.copy, host);
  $('safety').hidden = !sf;
  if (sf) { $('safety').textContent = sf[1]; $('safety').className = 'safety ' + sf[0]; }
  $('readout').textContent = '已识别 · ' + r.kind;

  $('app').hidden = !r.app;
  if (r.app) {
    $('appIcon').textContent = r.app.name[0];
    $('appIcon').style.color = tone(r.app.color);
    $('appName').textContent = r.app.name;
    $('appTip').textContent = r.app.tip || '';
  }

  const open = r.open && SAFE_SCHEMES.test(r.open) ? r.open : null;
  $('openBtn').hidden = !open;
  if (open) {
    $('openBtn').href = open;
    $('openBtn').textContent = r.app && r.app.name !== '浏览器' && r.app.name !== '对应 App' ? `用${r.app.name}打开` : '打开';
  }
  $('browserBtn').hidden = !r.browser;
  if (r.browser) $('browserBtn').href = r.browser;

  $('copyBtn').onclick = () => copy(r.copy);
  $('result').hidden = false;
  $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function copy(s) {
  try {
    await navigator.clipboard.writeText(s);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: s });
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  msg('已复制');
}

const SHORT = ['t.cn', 'url.cn', 'dwz.cn', 'b23.tv', 'v.douyin.com', 'xhslink.com', 'tb.cn', 'm.tb.cn', '3.cn', 'suo.im', 'bit.ly', 't.co', 'tinyurl.com', 'v.kuaishou.com', '163cn.tv'];

function safety(url, host) {
  if (!host) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(':')) return ['warn', 'IP 地址，谨慎打开'];
  if (SHORT.includes(host)) return ['warn', '短链接，会跳转'];
  if (/^http:/i.test(url)) return ['warn', '未加密'];
  return ['ok', 'HTTPS'];
}

function tone(hex) {
  const n = parseInt(hex.slice(1), 16);
  const l = (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
  return l < 0.42 ? 'var(--ink)' : hex;
}

function msg(s, err) {
  $('msg').textContent = s;
  $('msg').className = 'msg' + (err ? ' err' : s ? ' ok' : '');
}

function state(name) {
  drop.classList.remove('busy', 'done', 'fail');
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
  if (!blob || !blob.type.startsWith('image/')) return msg('这不是图片，请换一张含二维码的图片', true);
  try {
    show(await loadImage(blob));
  } catch {
    state('fail');
    msg('图片读取失败，请换一张试试', true);
  }
}

async function show(img) {
  msg('');
  state('busy');
  $('result').hidden = true;
  $('preview').src = img.src;
  $('preview').hidden = false;
  $('hint').hidden = true;
  $('readout').textContent = '识别中…';
  const text = await decode(img);
  if (!text) {
    state('fail');
    $('readout').textContent = '未找到二维码';
    return msg('没找到二维码，换一张更清晰、二维码更完整的图片试试', true);
  }
  state('done');
  render(text);
}

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
    msg('浏览器没有允许读取剪贴板，请直接按 Ctrl+V 粘贴', true);
  }
};

$('sampleBtn').onclick = () => show($('sample'));
$('pickBtn').onclick = () => $('file').click();
$('file').onchange = e => { handle(e.target.files[0]); e.target.value = ''; };

drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', e => {
  e.preventDefault();
  drop.classList.remove('over');
  handle(e.dataTransfer.files[0]);
});

$('appList').append(...APPS.filter(a => !['GitHub', 'YouTube', '网易云音乐'].includes(a.name)).map(a => {
  const li = document.createElement('li');
  li.title = a.name;
  li.innerHTML = '<span></span>';
  li.firstChild.textContent = a.name === '哔哩哔哩' ? 'B' : a.name[0];
  li.style.setProperty('--c', tone(a.color));
  return li;
}));
