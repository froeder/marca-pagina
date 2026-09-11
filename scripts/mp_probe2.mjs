import { spawn } from 'node:child_process';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'http://localhost:5174/';
const PORT = 9224;
const PROF = process.env.TEMP.replaceAll('\\', '/') + '/mp_chrome_profile4';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROF}`, '--window-size=1440,900', APP], { stdio: 'ignore' });
const results = [];
const consoleMsgs = [];
let id = 0;
const pending = new Map();
let ws;
function connect(u) { return new Promise((res, rej) => { const w = new WebSocket(u); w.onopen = () => res(w); w.onerror = () => rej(new Error('ws')); }); }
async function send(method, params = {}) { const mid = ++id; ws.send(JSON.stringify({ id: mid, method, params })); return new Promise((res) => pending.set(mid, res)); }
function setup() { ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id) { const p = pending.get(m.id); if (p) { pending.delete(m.id); p(m); } return; } if (m.method === 'Runtime.consoleAPICalled') { consoleMsgs.push({ type: m.params.type, text: (m.params.args || []).map(a => a.value !== undefined ? a.value : a.description || '').join(' ') }); } else if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; consoleMsgs.push({ type: 'exception', text: 'UNCAUGHT: ' + (d.exception?.description || d.text) }); } }; }
async function ev(expression) { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.error || r.result?.exceptionDetails) return { err: true }; return { value: r.result.result.value }; }
async function reload() { await send('Page.reload', { ignoreCache: true }); await sleep(7000); }
async function tabClick(label) { return ev(`(() => { const el = Array.from(document.querySelectorAll('button, a')).find(b => (b.textContent||'').trim().startsWith(${JSON.stringify(label)})); if (el) { el.click(); return 'ok'; } return 'nf'; })()`); }
async function clickContaining(text) { return ev(`(() => { const el = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').trim().startsWith(${JSON.stringify(text)})); if (el) { el.click(); return 'ok'; } return 'nf'; })()`); }
async function setInput(sel, val) { return ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return 'no'; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(val)}); el.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`); }
async function mainText() { const r = await ev(`(() => (document.querySelector('main') || document.body).innerText)()`); return r.value || ''; }
async function booksJson() { const r = await ev(`(() => localStorage.getItem('marca_pagina_saved_books'))()`); return r.value; }
async function main() {
  await sleep(2500);
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  ws = await connect(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  setup();
  await send('Runtime.enable');
  await send('Page.enable');
  await sleep(5000);

  await tabClick('Descoberta');
  await sleep(6000);
  const rec = await ev(`(() => document.querySelectorAll('div.group.bg-white').length)()`);
  results.push(['DISCOVER recommends', String(rec.value) + ' cards']);
  results.push(['DISCOVER texto', (await mainText()).slice(0, 400)]);

  await tabClick('Buscar');
  await sleep(800);
  await setInput('main input', 'Quincas Borba');
  await sleep(500);
  await clickContaining('Buscar');
  await sleep(5000);
  results.push(['SEARCH', (await mainText()).slice(0, 300)]);
  results.push(['BD0 ANTES', String(await booksJson()).slice(0, 200)]);

  await ev(`(() => { const c = document.querySelectorAll('main div.group.bg-white')[0]; const b = Array.from(c.querySelectorAll('button')).find(x => (x.textContent||'').includes('Lido')); if (b) b.click(); return !!b; })()`);
  await sleep(1200);
  const b1 = JSON.parse(await booksJson())[0];
  results.push(['BD1 APOS ADD LIDO', JSON.stringify({ status: b1.status, userRating: b1.userRating, userNotes: b1.userNotes, dateFinished: b1.dateFinished })]);

  await ev(`(() => { const c = document.querySelectorAll('main div.group.bg-white')[0]; const cover = c.querySelector('div[class*="cursor-pointer"]'); if (cover) cover.click(); })()`);
  await sleep(800);
  await ev(`(() => { const stars = Array.from(document.querySelectorAll('button')).filter(x => x.querySelector('.lucide-star')); if (stars[3]) stars[3].click(); })()`);
  await ev(`(() => { const ta = document.querySelector('textarea'); const s = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set; if (ta) { s.call(ta, 'Minha anotação importante'); ta.dispatchEvent(new Event('input', { bubbles: true })); } })()`);
  await sleep(300);
  await clickContaining('Salvar Anotações');
  await sleep(1200);
  const b2 = JSON.parse(await booksJson())[0];
  results.push(['BD2 APOS SALVAR NOTA', JSON.stringify({ userRating: b2.userRating, userNotes: b2.userNotes })]);

  await ev(`(() => { const b = document.querySelector('button[aria-label="Fechar"]'); if (b) b.click(); })()`);
  await sleep(600);
  await ev(`(() => { const c = document.querySelectorAll('main div.group.bg-white')[0]; const b = Array.from(c.querySelectorAll('button')).find(x => (x.textContent||'').includes('Lendo')); if (b) b.click(); return !!b; })()`);
  await sleep(1200);
  const b3 = JSON.parse(await booksJson())[0];
  results.push(['BD3 APOS MARCAR LENDO', JSON.stringify({ status: b3.status, userRating: b3.userRating, userNotes: b3.userNotes, dateFinished: b3.dateFinished })]);
}

main()
  .then(async () => {
    console.log('==================== RESULTADOS ====================');
    for (const [k, v] of results) console.log(`\n--- ${k} ---\n${v}`);
    console.log('\n==== CONSOLE ====');
    const uniq = new Map();
    for (const m of consoleMsgs) { if (['error', 'warning', 'exception'].includes(m.type)) { const k = `${m.type}|${m.text}`; uniq.set(k, (uniq.get(k) || 0) + 1); } }
    for (const [k, n] of uniq) console.log(`[${n}x] ${k.slice(0, 300)}`);
    chrome.kill();
    process.exit(0);
  })
  .catch((e) => { console.error('FALHA:', e); chrome.kill(); process.exit(1); });
