'use strict';
/* flappy-bird-bd UI + game loop. Bengali strings are \uXXXX escapes (pure-ASCII source). */
(function () {
  var P = window.FlappyPhysics;
  var BN_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
  var I18N = {
    en: {
      title: 'Flappy Bird BD', tagline: 'Tap, click or press Space to flap. Dodge the pipes!',
      play: 'Play', pause: 'Pause', resume: 'Resume', again: 'Play again',
      over: 'Game over', score: 'Score', best: 'Best', difficulty: 'Difficulty',
      easy: 'Easy', normal: 'Normal', hard: 'Hard', sound: 'Sound', on: 'On', off: 'Off',
      games: 'Games', ready: 'Press Play or Space to start.',
      how: 'How to play', newBest: 'New best!',
      h1: 'Space, click or tap = flap. Each pipe you pass = 1 point.',
      h2: 'Speed rises as your score grows. Pause with P or the Pause button.',
      h3: 'Your best score is saved on this device only.',
      langBtn: 'Bangla', footer: 'Offline arcade toy. No accounts, no network calls.'
    },
    bn: {
      title: '\u09ab\u09cd\u09b2\u09cd\u09af\u09be\u09aa\u09bf \u09ac\u09be\u09b0\u09cd\u09a1 \u09ac\u09bf\u09a1\u09bf',
      tagline: '\u0989\u09a1\u09bc\u09a4\u09c7 \u09b8\u09cd\u09aa\u09c7\u09b8 / \u0995\u09cd\u09b2\u09bf\u0995 / \u099f\u09cd\u09af\u09be\u09aa \u0995\u09b0\u09c1\u09a8\u0964 \u09aa\u09be\u0987\u09aa \u098f\u09a1\u09bc\u09bf\u09af\u09bc\u09c7 \u099a\u09b2\u09c1\u09a8\u0964',
      play: '\u0996\u09c7\u09b2\u09c1\u09a8', pause: '\u09ac\u09bf\u09b0\u09a4\u09bf', resume: '\u099a\u09be\u09b2\u09bf\u09af\u09bc\u09c7 \u09af\u09be\u09a8', again: '\u0986\u09ac\u09be\u09b0 \u0996\u09c7\u09b2\u09c1\u09a8',
      over: '\u0996\u09c7\u09b2\u09be \u09b6\u09c7\u09b7', score: '\u09b8\u09cd\u0995\u09cb\u09b0', best: '\u09b8\u09c7\u09b0\u09be', difficulty: '\u0995\u09a0\u09bf\u09a8\u09a4\u09be',
      easy: '\u09b8\u09b9\u099c', normal: '\u09b8\u09cd\u09ac\u09be\u09ad\u09be\u09ac\u09bf\u0995', hard: '\u0995\u09a0\u09bf\u09a8', sound: '\u09b6\u09ac\u09cd\u09a6', on: '\u099a\u09be\u09b2\u09c1', off: '\u09ac\u09a8\u09cd\u09a7',
      games: '\u0997\u09c7\u09ae', ready: '\u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09a4\u09c7 \u0996\u09c7\u09b2\u09c1\u09a8 \u09ac\u09be \u09b8\u09cd\u09aa\u09c7\u09b8 \u099a\u09be\u09aa\u09c1\u09a8\u0964',
      how: '\u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u0996\u09c7\u09b2\u09ac\u09c7\u09a8', newBest: '\u09a8\u09a4\u09c1\u09a8 \u09b8\u09c7\u09b0\u09be!',
      h1: '\u09b8\u09cd\u09aa\u09c7\u09b8, \u0995\u09cd\u09b2\u09bf\u0995 \u09ac\u09be \u099f\u09cd\u09af\u09be\u09aa = \u0989\u09a1\u09bc\u09be\u0964 \u09aa\u09cd\u09b0\u09a4\u09bf \u09aa\u09be\u0987\u09aa \u09aa\u09be\u09b0 \u09b9\u09b2\u09c7 = \u09e7 \u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f\u0964',
      h2: '\u09b8\u09cd\u0995\u09cb\u09b0 \u09ac\u09be\u09a1\u09bc\u09b2\u09c7 \u0997\u09a4\u09bf \u09ac\u09be\u09a1\u09bc\u09c7\u0964 P \u09ac\u09be \u09ac\u09bf\u09b0\u09a4\u09bf \u09ac\u09cb\u09a4\u09be\u09ae \u09a6\u09bf\u09af\u09bc\u09c7 \u09a5\u09be\u09ae\u09be\u09a8\u0964',
      h3: '\u0986\u09aa\u09a8\u09be\u09b0 \u09b8\u09c7\u09b0\u09be \u09b8\u09cd\u0995\u09cb\u09b0 \u09b6\u09c1\u09a7\u09c1 \u098f\u0987 \u09a1\u09bf\u09ad\u09be\u0987\u09b8\u09c7 \u09b8\u09c7\u09ad \u09b9\u09af\u09bc\u0964',
      langBtn: 'English', footer: '\u0985\u09ab\u09b2\u09be\u0987\u09a8 \u0986\u09b0\u0995\u09c7\u09a1 \u0997\u09c7\u09ae\u0964 \u0995\u09cb\u09a8\u09cb \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f \u09ac\u09be \u09a8\u09c7\u099f\u0993\u09af\u09bc\u09be\u09b0\u09cd\u0995 \u0995\u09b2 \u09a8\u09c7\u0987\u0964'
    }
  };
  var KEY = 'flappy-bird-bd-v1';
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); return s; } catch (e) { return {}; }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var saved = load();
  var lang = saved.lang === 'bn' ? 'bn' : 'en';
  var stats = { best: saved.best || 0, games: saved.games || 0 };
  var soundOn = saved.soundOn !== false;
  var difficulty = saved.difficulty || 'normal';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var state = 'ready';
  var bird = P.newBird();
  var pipes = [];
  var score = 0, frame = 0, spawnTimer = 0, lastScore = 0, isNewBest = false;
  var audioCtx = null;

  function t(key) { return I18N[lang][key]; }
  function fmt(n) {
    var s = String(n);
    if (lang === 'bn') { s = s.replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; }); }
    return s;
  }
  function persist() { save({ lang: lang, best: stats.best, games: stats.games, soundOn: soundOn, difficulty: difficulty }); }
  function beep(freq, dur) {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.15, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  }
  function reset() {
    bird = P.newBird(); pipes = []; score = 0; frame = 0; spawnTimer = 0; isNewBest = false;
  }
  function start() {
    if (state === 'playing') return;
    if (state === 'over' || state === 'ready') { reset(); stats.games++; persist(); }
    state = 'playing';
    renderUI();
  }
  function gameOver() {
    state = 'over'; lastScore = score;
    if (score > stats.best) { stats.best = score; isNewBest = true; }
    persist(); beep(150, 0.3); renderUI();
  }
  function step() {
    if (state !== 'playing') return;
    frame++;
    P.stepBird(bird);
    var speed = P.speedFor(difficulty, score);
    spawnTimer++;
    if (spawnTimer >= 95) {
      spawnTimer = 0;
      var gap = P.gapFor(difficulty);
      var maxTop = P.H - P.GROUND_H - gap - 40;
      var topH = 40 + Math.floor(Math.random() * Math.max(1, maxTop - 40));
      pipes.push(P.newPipe(gap, topH));
    }
    for (var i = 0; i < pipes.length; i++) {
      P.movePipe(pipes[i], speed);
      if (P.passedPipe(bird, pipes[i])) { pipes[i].scored = true; score++; beep(900, 0.08); }
    }
    pipes = pipes.filter(function (p) { return p.x + P.PIPE_W > -10; });
    if (P.collides(bird, pipes)) { gameOver(); return; }
    renderUI();
  }
  function draw() {
    ctx.clearRect(0, 0, P.W, P.H);
    ctx.fillStyle = '#7ec8f7'; ctx.fillRect(0, 0, P.W, P.H - P.GROUND_H);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(70, 80, 22, 0, Math.PI * 2); ctx.arc(95, 70, 26, 0, Math.PI * 2); ctx.arc(120, 80, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3fae4a';
    pipes.forEach(function (p) {
      ctx.fillRect(p.x, 0, P.PIPE_W, p.topH);
      ctx.fillRect(p.x - 3, p.topH - 22, P.PIPE_W + 6, 22);
      var botY = p.topH + p.gap;
      ctx.fillRect(p.x, botY, P.PIPE_W, (P.H - P.GROUND_H) - botY);
      ctx.fillRect(p.x - 3, botY, P.PIPE_W + 6, 22);
    });
    ctx.fillStyle = '#e8c85a'; ctx.fillRect(0, P.H - P.GROUND_H, P.W, P.GROUND_H);
    ctx.fillStyle = '#c9a227'; ctx.fillRect(0, P.H - P.GROUND_H, P.W, 6);
    var angle = Math.max(-0.4, Math.min(1.2, bird.vy * 0.09));
    ctx.save(); ctx.translate(bird.x, bird.y); ctx.rotate(angle);
    ctx.fillStyle = '#ffd93d'; ctx.beginPath(); ctx.arc(0, 0, bird.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.ellipse(-4, 2, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(5, -4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(6, -4, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff6b35'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(20, 3); ctx.lineTo(12, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#111'; ctx.font = 'bold 44px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(fmt(score), P.W / 2, 60);
  }
  function renderUI() {
    document.getElementById('title').textContent = t('title');
    document.getElementById('tagline').textContent = t('tagline');
    document.getElementById('langBtn').textContent = t('langBtn');
    document.getElementById('diffLabel').textContent = t('difficulty');
    document.getElementById('soundLabel').textContent = t('sound');
    document.getElementById('soundBtn').textContent = soundOn ? t('on') : t('off');
    document.getElementById('scoreLabel').textContent = t('score');
    document.getElementById('scoreVal').textContent = fmt(score);
    document.getElementById('bestLabel').textContent = t('best');
    document.getElementById('bestVal').textContent = fmt(stats.best);
    document.getElementById('gamesLabel').textContent = t('games');
    document.getElementById('gamesVal').textContent = fmt(stats.games);
    document.getElementById('howTitle').textContent = t('how');
    document.getElementById('how1').textContent = t('h1');
    document.getElementById('how2').textContent = t('h2');
    document.getElementById('how3').textContent = t('h3');
    document.getElementById('footer').textContent = t('footer');
    var diffSel = document.getElementById('diffSel');
    diffSel.options[0].textContent = t('easy');
    diffSel.options[1].textContent = t('normal');
    diffSel.options[2].textContent = t('hard');
    diffSel.value = difficulty;
    var overlay = document.getElementById('overlay');
    var overlayTitle = document.getElementById('overlayTitle');
    var overlayMsg = document.getElementById('overlayMsg');
    var mainBtn = document.getElementById('mainBtn');
    var pauseBtn = document.getElementById('pauseBtn');
    if (state === 'ready') {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = t('title');
      overlayMsg.textContent = t('ready');
      mainBtn.textContent = t('play'); mainBtn.classList.remove('hidden');
      pauseBtn.classList.add('hidden');
    } else if (state === 'paused') {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = t('pause');
      overlayMsg.textContent = t('score') + ': ' + fmt(score);
      mainBtn.textContent = t('resume'); mainBtn.classList.remove('hidden');
      pauseBtn.classList.add('hidden');
    } else if (state === 'over') {
      overlay.classList.remove('hidden');
      overlayTitle.textContent = t('over');
      overlayMsg.textContent = t('score') + ': ' + fmt(lastScore) + '  |  ' + t('best') + ': ' + fmt(stats.best) + (isNewBest ? '  |  ' + t('newBest') : '');
      mainBtn.textContent = t('again'); mainBtn.classList.remove('hidden');
      pauseBtn.classList.add('hidden');
    } else {
      overlay.classList.add('hidden');
      mainBtn.classList.add('hidden');
      pauseBtn.classList.remove('hidden');
      pauseBtn.textContent = t('pause');
    }
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }
  function flapAction() {
    if (state === 'ready') { start(); }
    if (state === 'playing') { P.flap(bird); beep(600, 0.07); }
  }
  document.getElementById('mainBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'paused') { state = 'playing'; renderUI(); }
    else start();
  });
  document.getElementById('pauseBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    if (state === 'playing') { state = 'paused'; renderUI(); }
  });
  document.getElementById('langBtn').addEventListener('click', function () {
    lang = lang === 'en' ? 'bn' : 'en'; persist(); renderUI();
  });
  document.getElementById('soundBtn').addEventListener('click', function () {
    soundOn = !soundOn; persist(); renderUI();
  });
  document.getElementById('diffSel').addEventListener('change', function (e) {
    difficulty = e.target.value; persist();
    if (state === 'ready' || state === 'over') { reset(); renderUI(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); flapAction(); }
    if (e.code === 'KeyP' && state === 'playing') { state = 'paused'; renderUI(); }
    else if (e.code === 'KeyP' && state === 'paused') { state = 'playing'; renderUI(); }
  });
  canvas.addEventListener('pointerdown', function () { flapAction(); });
  function loop() { step(); draw(); requestAnimationFrame(loop); }
  renderUI(); draw();
  requestAnimationFrame(loop);
  window.__flappy = {
    getState: function () { return state; },
    getScore: function () { return score; },
    getBirdY: function () { return bird.y; },
    start: start,
    flapOnce: flapAction,
    stepOnce: step,
    pauseToggle: function () {
      if (state === 'playing') { state = 'paused'; renderUI(); }
      else if (state === 'paused') { state = 'playing'; renderUI(); }
    },
    setDifficulty: function (d) { difficulty = d; persist(); renderUI(); },
    getDifficulty: function () { return difficulty; },
    setLang: function (l) { lang = l; persist(); renderUI(); },
    getLang: function () { return lang; },
    toBn: fmt,
    getStats: function () { return { best: stats.best, games: stats.games }; }
  };
})();
