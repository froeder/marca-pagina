import { spawn } from 'node:child_process';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'http://localhost:5174/';
const PORT = 9225;
const PROF = process.env.TEMP.replaceAll('\\', '/') + '/mp_chrome_profile5';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROF}`, '--window-size=1440,900', APP], { stdio: 'ignore' });
const results = [];
const consoleMsgs = [];
let bookApiCalls = 0;
let id = 0;
const pending = new Map();
let ws;
function connect(u) { return new Promise((res, rej) => { const w = new WebSocket(u); w.onopen = () => res(w); w.onerror = () => rej(new Error('ws')); }); }
async function send(method, params = {}) { const mid = ++id; ws.send(JSON.stringify({ id: mid, method, params })); return new Promise((res) => pending.set(mid, res)); }
function setup() {
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id) { const p = pending.get(m.id); if (p) { pending.delete(m.id); p(m); } return; }
    if (m.method === 'Network.requestWillBeSent') {
      const u = m.params.request.url;
      if (u.includes('www.googleapis.com/books')) bookApiCalls++;
    } else if (m.method === 'Runtime.consoleAPICalled') {
      consoleMsgs.push({ type: m.params.type, text: (m.params.args || []).map(a => a.value !== undefined ? a.value : a.description || '').join(' ') });
    } else if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      consoleMsgs.push({ type: 'exception', text: 'UNCAUGHT: ' + (d.exception?.description || d.text) });
    }
  };
}
async function ev(expression) { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.error || r.result?.exceptionDetails) return { err: true }; return { value: r.result.result.value }; }
async function reload() { await send('Page.reload', { ignoreCache: true }); await sleep(7000); }
async function tabClick(label) { return ev(`(() => { const el = Array.from(document.querySelectorAll('button, a')).find(b => (b.textContent||'').trim().startsWith(${JSON.stringify(label)})); if (el) { el.click(); return 'ok'; } return 'nf'; })()`); }
async function setInput(sel, val) { return ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return 'no'; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(val)}); el.dispatchEvent(new Event('input', { bubbles: true })); return 'ok'; })()`); }
async function mainText() { const r = await ev(`(() => (document.querySelector('main') || document.body).innerText)()`); return r.value || ''; }
async function rootInfo() { const r = await ev(`(() => { const root = document.querySelector('#root'); return { html: root.innerHTML.length, hasApp: root.querySelector('main') !== null }; })()`); return r.value; }

async function main() {
  await sleep(2500);
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  ws = await connect(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  setup();
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');
  await sleep(5000);

  // TEST E: livro malformado (sem authors/categories/title) -> busca em Minha Estante
  await ev(`(() => localStorage.setItem('marca_pagina_saved_books', '[{"id":"m1","title":null,"status":"lido"}]'))()`);
  await reload();
  await tabClick('Minha Estante');
  await sleep(1500);
  const e1 = await rootInfo();
  results.push(['E1 ESTANTE COM LIVRO MALFORMADO (sem busca)', JSON.stringify(e1)]);
  await setInput('main input', 'm1');
  await sleep(1200);
  const e2 = await rootInfo();
  const e2txt = await mainText();
  results.push(['E2 APOS DIGITAR BUSCA (crash esperado?)', JSON.stringify(e2)]);
  results.push(['E2 texto', e2txt.slice(0, 300)]);

  // restaura demo
  await ev(`(() => localStorage.clear())()`);
  await reload();

  // TEST F: contagem de chamadas à API ao trocar categoria na Discover
  await tabClick('Descoberta');
  await sleep(5000);
  const base = bookApiCalls;
  results.push(['F0 cargas apos abrir Discover', String(bookApiCalls)]);
  await ev(`(() => { const chips = Array.from(document.querySelectorAll('button')).filter(b => b.querySelector('.lucide-trending-up') || /Classics|Ficção/.test(b.textContent || '')); const c = chips.find(x => (x.textContent||'').includes('Classics')) || chips[0]; if (c) c.click(); return !!c; })()`);
  await sleep(6000);
  const after = bookApiCalls;
  results.push(['F1 chamadas apos 1 clique em categoria', String(base) + ' -> ' + String(after) + ' (diff ' + String(after - base) + ')']);
}

main()
  .then(async () => {
    console.log('==================== RESULTADOS ====================');
    for (const [k, v] of results) console.log(`\n--- ${k} ---\n${v}`);
    console.log('\n==== EXCEPTIONS/ERROS ====');
    const uniq = new Map();
    for (const m of consoleMsgs) { if (['error', 'warning', 'exception'].includes(m.type)) { const k = `${m.type}|${m.text}`; uniq.set(k, (uniq.get(k) || 0) + 1); } }
    for (const [k, n] of uniq) console.log(`[${n}x] ${k.slice(0, 300)}`);
    chrome.kill();
    process.exit(0);
  })
  .catch((e) => { console.error('FALHA:', e); chrome.kill(); process.exit(1); });