'use strict';
/* flappy-bird-bd physics: pure, deterministic, no DOM. One step = one 60fps frame. */
(function (root) {
  var W = 400, H = 520, GROUND_H = 60;
  var BIRD_X = 80, BIRD_R = 14;
  var GRAVITY = 0.45, FLAP_VY = -7.5, MAX_FALL = 12;
  var PIPE_W = 68;
  var DIFF = {
    easy:   { speed: 2.2, gap: 170, label: 'Easy' },
    normal: { speed: 2.8, gap: 150, label: 'Normal' },
    hard:   { speed: 3.4, gap: 130, label: 'Hard' }
  };
  function speedFor(diff, score) {
    var base = DIFF[diff] ? DIFF[diff].speed : DIFF.normal.speed;
    return base + Math.min(1.0, Math.floor(score / 10) * 0.1);
  }
  function gapFor(diff) {
    return DIFF[diff] ? DIFF[diff].gap : DIFF.normal.gap;
  }
  function newBird() { return { x: BIRD_X, y: 220, vy: 0, r: BIRD_R }; }
  function stepBird(bird) {
    bird.vy = Math.min(MAX_FALL, bird.vy + GRAVITY);
    bird.y += bird.vy;
    return bird;
  }
  function flap(bird) { bird.vy = FLAP_VY; return bird; }
  function newPipe(gap, topH) {
    return { x: W, topH: topH, gap: gap, scored: false };
  }
  function movePipe(pipe, speed) { pipe.x -= speed; return pipe; }
  function circleHitsRect(cx, cy, r, rx, ry, rw, rh) {
    var nx = Math.max(rx, Math.min(cx, rx + rw));
    var ny = Math.max(ry, Math.min(cy, ry + rh));
    var dx = cx - nx, dy = cy - ny;
    return dx * dx + dy * dy < r * r;
  }
  function hitsPipe(bird, pipe) {
    var top = { x: pipe.x, y: 0, w: PIPE_W, h: pipe.topH };
    var botY = pipe.topH + pipe.gap;
    var bot = { x: pipe.x, y: botY, w: PIPE_W, h: (H - GROUND_H) - botY };
    return circleHitsRect(bird.x, bird.y, bird.r, top.x, top.y, top.w, top.h) ||
      circleHitsRect(bird.x, bird.y, bird.r, bot.x, bot.y, bot.w, bot.h);
  }
  function hitsBounds(bird) {
    return bird.y - bird.r <= 0 || bird.y + bird.r >= H - GROUND_H;
  }
  function collides(bird, pipes) {
    if (hitsBounds(bird)) return true;
    for (var i = 0; i < pipes.length; i++) {
      if (hitsPipe(bird, pipes[i])) return true;
    }
    return false;
  }
  function passedPipe(bird, pipe) {
    return !pipe.scored && pipe.x + PIPE_W < bird.x;
  }
  var api = {
    W: W, H: H, GROUND_H: GROUND_H, BIRD_X: BIRD_X, BIRD_R: BIRD_R,
    GRAVITY: GRAVITY, FLAP_VY: FLAP_VY, MAX_FALL: MAX_FALL, PIPE_W: PIPE_W,
    DIFF: DIFF, speedFor: speedFor, gapFor: gapFor,
    newBird: newBird, stepBird: stepBird, flap: flap,
    newPipe: newPipe, movePipe: movePipe,
    circleHitsRect: circleHitsRect, hitsPipe: hitsPipe, hitsBounds: hitsBounds,
    collides: collides, passedPipe: passedPipe
  };
  root.FlappyPhysics = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
