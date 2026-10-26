// flappy-bird-bd headless-Chrome smoke test via raw CDP (Node 24 global WebSocket).
// No npm dependencies. Run: node tests/smoke.js
'use strict';
const { spawn } = require('child_process');
const FILE = 'file:///home/hatch/workspace/muse-project-factory/builds/flappy-bird-bd/index.html';
const CHROME = '/opt/meta-chromium/chrome';
const PORT = 9225;
let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  ok:', label); }
  else { fail++; console.error('FAIL:', label, extra !== undefined ? '(' + extra + ')' : ''); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = [];
    this.ready = new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) rej(new Error(JSON.stringify(msg.error))); else res(msg.result);
      } else if (msg.method) { for (const h of this.handlers) h(msg); }
    };
  }
  send(method, params) {
    const id = this.nextId++;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  on(fn) { this.handlers.push(fn); }
  async evalExpr(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
  close() { try { this.ws.close(); } catch (e) {} }
}
async function waitForDebugger() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch('http://127.0.0.1:' + PORT + '/json/version'); if (r.ok) return; } catch (e) {}
    await sleep(200);
  }
  throw new Error('chrome debugger port did not come up');
}
(async () => {
  const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + PORT, '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
  const errors = [];
  try {
    await waitForDebugger();
    const tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/new?file://', { method: 'PUT' })).json();
    const cdp = new CDP(tabs.webSocketDebuggerUrl);
    await cdp.ready;
    cdp.on(m => {
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(JSON.stringify(m.params.args));
      if (m.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(m.params.exceptionDetails));
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text);
    });
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Page.enable');
    await cdp.send('Page.navigate', { url: FILE });
    await sleep(1500);
    ok(await cdp.evalExpr(`document.title.includes('Flappy Bird BD')`), 'page title');
    ok(await cdp.evalExpr(`document.getElementById('game').width === 400 && document.getElementById('game').height === 520`), 'canvas is 400x520');
    ok(await cdp.evalExpr(`window.__flappy && window.__flappy.getState() === 'ready'`), 'initial state is ready');
    ok(await cdp.evalExpr(`!document.getElementById('overlay').classList.contains('hidden')`), 'ready overlay visible');
    ok(await cdp.evalExpr(`document.getElementById('mainBtn').textContent === 'Play'`), 'main button says Play');
    // Start, do not flap: bird must fall and the game must end by itself.
    await cdp.evalExpr(`document.getElementById('mainBtn').click();`);
    await sleep(1500);
    ok(await cdp.evalExpr(`window.__flappy.getState() === 'over'`), 'unflapped game ends in game-over on its own');
    ok(await cdp.evalExpr(`document.getElementById('overlayTitle').textContent === 'Game over'`), 'game-over overlay title');
    ok(await cdp.evalExpr(`document.getElementById('mainBtn').textContent === 'Play again'`), 'game-over button says Play again');
    // Play again -> playing -> pause -> resume -> step moves the bird.
    await cdp.evalExpr(`document.getElementById('mainBtn').click();`);
    await sleep(200);
    ok(await cdp.evalExpr(`window.__flappy.getState() === 'playing'`), 'play-again starts playing state');
    await cdp.evalExpr(`window.__flappy.pauseToggle();`);
    ok(await cdp.evalExpr(`window.__flappy.getState() === 'paused'`), 'pauseToggle pauses');
    ok(await cdp.evalExpr(`document.getElementById('overlayTitle').textContent === 'Pause'`), 'pause overlay title');
    await cdp.evalExpr(`document.getElementById('mainBtn').click();`);
    await sleep(100);
    ok(await cdp.evalExpr(`window.__flappy.getState() === 'playing'`), 'resume button resumes playing');
    const y1 = await cdp.evalExpr(`window.__flappy.getBirdY()`);
    await cdp.evalExpr(`window.__flappy.stepOnce();`);
    const y2 = await cdp.evalExpr(`window.__flappy.getBirdY()`);
    ok(typeof y1 === 'number' && typeof y2 === 'number' && y2 !== y1, 'stepOnce moves the bird (y ' + y1 + ' -> ' + y2 + ')');
    // Difficulty + sound controls
    await cdp.evalExpr(`window.__flappy.setDifficulty('hard');`);
    ok(await cdp.evalExpr(`window.__flappy.getDifficulty() === 'hard' && document.getElementById('diffSel').value === 'hard'`), 'difficulty switches to hard and select reflects it');
    const soundBefore = await cdp.evalExpr(`document.getElementById('soundBtn').textContent`);
    await cdp.evalExpr(`document.getElementById('soundBtn').click();`);
    const soundAfter = await cdp.evalExpr(`document.getElementById('soundBtn').textContent`);
    ok(soundBefore !== soundAfter, 'sound button toggles label (' + soundBefore + ' -> ' + soundAfter + ')');
    // Bengali toggle + digits
    await cdp.evalExpr(`window.__flappy.setLang('bn');`);
    await sleep(200);
    ok(await cdp.evalExpr(`document.getElementById('title').textContent !== 'Flappy Bird BD'`), 'BN toggle changes the title from English');
    ok(await cdp.evalExpr(`window.__flappy.toBn('123') === '\u09e7\u09e8\u09e9'`), 'Bengali digits render 123 as ১২৩');
    ok(await cdp.evalExpr(`document.documentElement.lang === 'bn'`), 'document lang switches to bn');
    // 390px mobile: no horizontal overflow
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(500);
    ok(await cdp.evalExpr(`document.documentElement.scrollWidth <= 390`), '390px viewport: no horizontal overflow');
    ok(errors.length === 0, 'zero console/page errors', errors.slice(0, 3).join(' | '));
    cdp.close();
  } finally {
    chrome.kill('SIGKILL');
  }
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e.message); process.exit(1); });
