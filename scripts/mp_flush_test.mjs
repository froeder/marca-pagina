import { spawn } from 'node:child_process';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'http://localhost:5174/';
const PORT = 9223;
const PROF = process.env.TEMP.replaceAll('\\', '/') + '/mp_chrome_profile2';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROF}`, '--window-size=1440,900', APP], { stdio: 'ignore' });
const results = [];
const consoleMsgs = [];
let id = 0;
const pending = new Map();
let ws;
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const w = new WebSocket(wsUrl);
    w.onopen = () => resolve(w);
    w.onerror = () => reject(new Error('ws error'));
  });
}
async function send(method, params = {}) {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((resolve) => pending.set(msgId, resolve));
}
function setupListeners() {
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id) { const p = pending.get(msg.id); if (p) { pending.delete(msg.id); p(msg); } return; }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = (msg.params.args || []).map((a) => (a.value !== undefined ? a.value : a.description || '')).join(' ');
      consoleMsgs.push({ type: msg.params.type, text: args });
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      consoleMsgs.push({ type: 'exception', text: `UNCAUGHT: ${d.text} ${d.exception?.description || ''}` });
    }
  };
}
async function ev(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.error || r.result?.exceptionDetails) return { err: true, det: r.error || r.result.exceptionDetails };
  return { value: r.result.result.value };
}
async function reload() { await send('Page.reload', { ignoreCache: true }); await sleep(7000); }
async function tabClick(label) {
  return ev(`(() => { const el = Array.from(document.querySelectorAll('button, a')).find(b => (b.textContent||'').trim().startsWith(${JSON.stringify(label)})); if (el) { el.click(); return 'ok'; } return 'not-found'; })()`);
}
async function clickButtonContaining(text) {
  return ev(`(() => { const el = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').trim().startsWith(${JSON.stringify(text)})); if (el) { el.click(); return 'ok'; } return 'not-found'; })()`);
}
async function setInput(selector, value) {
  return ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return 'no-input'; const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); return 'set'; })()`);
}
async function mainText() { const r = await ev(`(() => (document.querySelector('main') || document.body).innerText)()`); return r.value || ''; }
async function localStorageBooks() {
  const r = await ev(`(() => { try { return JSON.parse(localStorage.getItem('marca_pagina_saved_books') || '[]'); } catch (e) { return 'PARSE_ERROR: ' + e.message; } })()`);
  return r.value;
}
async function doSearch(term) {
  await tabClick('Buscar');
  await sleep(800);
  await setInput('main input', term);
  await sleep(500);
  await clickButtonContaining('Buscar');
  await sleep(5000);
  return (await mainText()).slice(0, 1200);
}
async function addReviewAndLossTest() {
  const t = await doSearch('O Cortiço');
  results.push(['D1 SEARCH', t.slice(0, 600)]);
  const cards = await ev(`(() => document.querySelectorAll('div.group.bg-white').length)()`);
  results.push(['D1 cards', String(cards.value)]);
  await ev(`(() => { const c = document.querySelectorAll('div.group.bg-white')[0]; const b = Array.from(c.querySelectorAll('button')).find(x => (x.textContent||'').includes('Lido')); if (b) b.click(); return 'ok'; })()`);
  await sleep(1200);
  let books = await localStorageBooks();
  const added = Array.isArray(books) ? books[books.length - 1] : books;
  results.push(['D2 APOS ADICIONAR (status lido)', JSON.stringify(added).slice(0, 400)]);
  await ev(`(() => { const c = document.querySelectorAll('div.group.bg-white')[0]; const cover = c.querySelector('div[class*="cursor-pointer"]'); if (cover) cover.click(); })()`);
  await sleep(800);
  await ev(`(() => { const stars = Array.from(document.querySelectorAll('button')).filter(x => x.querySelector('.lucide-star')); if (stars[3]) stars[3].click(); return stars.length; })()`);
  await ev(`(() => { const ta = document.querySelector('textarea'); const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set; setter.call(ta, 'Nota de teste CDP'); ta.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await sleep(300);
  await clickButtonContaining('Salvar Anotações');
  await sleep(1200);
  books = await localStorageBooks();
  const reviewed = Array.isArray(books) ? books[books.length - 1] : books;
  results.push(['D3 APOS SALVAR NOTA', JSON.stringify(reviewed).slice(0, 400)]);
  await ev(`(() => { const b = document.querySelector('button[aria-label="Fechar"]'); if (b) b.click(); })()`);
  await sleep(600);
  await ev(`(() => { const c = document.querySelectorAll('div.group.bg-white')[0]; const b = Array.from(c.querySelectorAll('button')).find(x => (x.textContent||'').includes('Lendo')); if (b) b.click(); return 'ok'; })()`);
  await sleep(1200);
  books = await localStorageBooks();
  const after = Array.isArray(books) ? books[books.length - 1] : books;
  results.push(['D4 APOS MARCAR "Lendo" (bug esperado: perde nota/rating/data)', JSON.stringify(after).slice(0, 400)]);
  await ev(`(() => { const c = document.querySelectorAll('div.group.bg-white')[0]; const cover = c.querySelector('div[class*="cursor-pointer"]'); if (cover) cover.click(); })()`);
  await sleep(800);
  const ui = await ev(`(() => { const stars = Array.from(document.querySelectorAll('button')).filter(x => x.querySelector('.lucide-star')); let lit = 0; stars.forEach(s => { if (s.querySelector('svg').className.baseVal.includes('fill-amber')) lit++; }); const ta = document.querySelector('textarea'); return { starsLit: lit, notes: ta ? ta.value : 'no-textarea' }; })()`);
  results.push(['D5 UI DO MODAL APOS PERDA', JSON.stringify(ui.value)]);
}

async function main() {
  await sleep(2500);
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const page = targets.find((t) => t.type === 'page');
  ws = await connect(page.webSocketDebuggerUrl);
  setupListeners();
  await send('Runtime.enable');
  await send('Page.enable');
  await sleep(5000);

  results.push(['A0 ANTES', String((await ev(`(() => document.querySelector('#root').innerHTML.length)()`)).value)]);
  await ev(`(() => localStorage.setItem('marca_pagina_saved_books', 'garbage{invalid json'))()`);
  await reload();
  const a = await ev(`(() => { const root = document.querySelector('#root'); return { html: root.innerHTML.length, text: root.innerText.slice(0, 200) }; })()`);
  results.push(['A1 STORAGE CORROMPIDO', JSON.stringify(a.value)]);
  await ev(`(() => localStorage.clear())()`);
  await reload();

  await ev(`(() => { localStorage.setItem('marca_pagina_saved_books', '[]'); })()`);
  await reload();
  await tabClick('Estatísticas');
  await sleep(1500);
  const b1 = await mainText();
  results.push(['B1 STATS VAZIO', b1.slice(0, 1000)]);
  const b1nan = await ev(`(() => document.body.innerText.includes('NaN'))()`);
  results.push(['B1 contem NaN?', String(b1nan.value)]);
  await tabClick('Descoberta');
  await sleep(4000);
  const b2 = await mainText();
  results.push(['B2 DISCOVER VAZIO', b2.slice(0, 1000)]);
  await ev(`(() => localStorage.clear())()`);
  await reload();

  const c = await doSearch('zzzzqxxwqzxqwzxqqq');
  results.push(['C1 BUSCA SEM RESULTADO', c.slice(0, 800)]);

  await addReviewAndLossTest();
  await ev(`(() => localStorage.clear())()`).catch(() => {});
}

main()
  .then(async () => {
    console.log('==================== RESULTADOS ====================');
    for (const [k, v] of results) console.log(`\n--- ${k} ---\n${v}`);
    console.log('\n==================== CONSOLE (erros/avisos unicos) ====================');
    const uniq = new Map();
    for (const m of consoleMsgs) {
      if (['error', 'warning', 'exception'].includes(m.type)) {
        const key = `${m.type}|${m.text}`;
        uniq.set(key, (uniq.get(key) || 0) + 1);
      }
    }
    for (const [k, n] of uniq) console.log(`[${n}x] ${k.slice(0, 300)}`);
    chrome.kill();
    process.exit(0);
  })
  .catch((e) => { console.error('FALHA:', e); chrome.kill(); process.exit(1); });