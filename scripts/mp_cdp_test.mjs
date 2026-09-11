// Driver CDP para caça a bugs runtime do Marca-Página (usa Chrome headless + DevTools Protocol)
import { spawn } from 'node:child_process';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'http://localhost:5174/';
const PORT = 9222;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORT}`, '--user-data-dir=' + process.env.TEMP + '\\mp_chrome_profile',
  APP,
], { stdio: 'ignore' });

const results = [];
const consoleMsgs = [];
let id = 0;
const pending = new Map();

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => resolve(ws);
    ws.onerror = (e) => reject(new Error('ws error'));
  });
}

let ws;
async function send(method, params = {}) {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((resolve) => pending.set(msgId, resolve));
}

function setupListeners() {
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id) {
      const p = pending.get(msg.id);
      if (p) { pending.delete(msg.id); p(msg); }
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      const args = (msg.params.args || []).map((a) => a.value !== undefined ? a.value : a.description || '').join(' ');
      consoleMsgs.push({ type: msg.params.type, text: args });
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      consoleMsgs.push({ type: 'exception', text: `EXCEPTION: ${d.text} ${d.exception?.description || ''}` });
    }
  };
}

async function evalJs(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.error) return { error: r.error };
  if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.text };
  return { value: r.result.result.value };
}

async function clickNav(label) {
  const r = await evalJs(`(() => {
    const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const el = all.find((b) => b.textContent.trim().startsWith(${JSON.stringify(label)}));
    if (el) { el.click(); return 'clicked'; }
    return 'not found';
  })()`);
  return r;
}

async function main() {
  await sleep(2500);
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) { console.log('Nenhum target page'); process.exit(1); }
  ws = await connect(page.webSocketDebuggerUrl);
  setupListeners();
  await send('Runtime.enable');
  await send('Page.enable');

  // espera o app montar
  await sleep(6000);

  const boot = await evalJs(`(() => {
    const hasRoot = !!document.querySelector('#root > div');
    const navItems = Array.from(document.querySelectorAll('nav span, header span, aside span')).map(s => s.textContent.trim()).filter(Boolean).slice(0, 30);
    return { hasRoot, bodyText: document.body.innerText.slice(0, 300), navItems };
  })()`);
  results.push(['BOOT', JSON.stringify(boot).slice(0, 400)]);

  // Navegar pelas abas
  const tabs = ['Buscar', 'Minha Estante', 'Estatísticas', 'Configurações', 'Descoberta'];
  for (const t of tabs) {
    const c = await clickNav(t);
    await sleep(2500);
    const state = await evalJs(`(() => {
      const main = document.querySelector('main') || document.body;
      const txt = (main.innerText || '').trim();
      return { clicked: ${JSON.stringify(c.value)} , text: txt.slice(0, 450) };
    })()`);
    results.push(['TAB ' + t, JSON.stringify(state.value).slice(0, 600)]);
  }
}

main()
  .then(async () => {
    console.log('==================== RESULTADOS ====================');
    for (const [k, v] of results) console.log(`\n--- ${k} ---\n${v}`);
    console.log('\n==================== CONSOLE ====================');
    for (const m of consoleMsgs) {
      if (['error', 'warning', 'exception'].includes(m.type)) console.log(`[${m.type}] ${m.text}`);
    }
    chrome.kill();
    process.exit(0);
  })
  .catch((e) => { console.error('FALHA:', e); chrome.kill(); process.exit(1); });