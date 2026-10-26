'use strict';
// flappy-bird-bd unit tests (node, no deps). Run: node tests/tests.js
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync(__dirname + '/../js/physics.js', 'utf8');
const sandbox = { module: { exports: {} } };
sandbox.window = undefined;
vm.runInNewContext(src, sandbox);
const P = sandbox.module.exports;
let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  ok:', label); }
  else { fail++; console.error('FAIL:', label, extra !== undefined ? '(' + extra + ')' : ''); }
}
function close(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }

// Bird physics
let b = P.newBird();
ok(b.y === 220 && b.vy === 0, 'new bird at y=220, vy=0');
P.stepBird(b);
ok(close(b.vy, 0.45) && close(b.y, 220.45), 'one step: vy=0.45, y=220.45');
P.flap(b);
ok(b.vy === -7.5, 'flap sets vy=-7.5');
P.stepBird(b);
ok(close(b.vy, -7.05) && close(b.y, 213.4), 'step after flap: vy=-7.05, y=213.4');
let faller = { x: 80, y: 100, vy: 11.9, r: 14 };
P.stepBird(faller);
ok(faller.vy === 12, 'fall speed capped at 12');
ok(P.MAX_FALL === 12 && P.GRAVITY === 0.45 && P.FLAP_VY === -7.5, 'constants intact');

// Difficulty / speed ramp
ok(P.speedFor('easy', 0) === 2.2, 'easy base speed 2.2');
ok(P.speedFor('normal', 0) === 2.8, 'normal base speed 2.8');
ok(P.speedFor('hard', 0) === 3.4, 'hard base speed 3.4');
ok(close(P.speedFor('normal', 10), 2.9), 'normal +10 pts -> 2.9');
ok(close(P.speedFor('normal', 100), 3.8), 'speed ramp capped at +1.0 (100 pts -> 3.8)');
ok(P.speedFor('normal', 200) === 3.8, 'speed ramp stays capped beyond 100 pts');
ok(P.gapFor('easy') === 170 && P.gapFor('normal') === 150 && P.gapFor('hard') === 130, 'gaps easy/normal/hard = 170/150/130');
ok(P.speedFor('bogus', 0) === 2.8, 'unknown difficulty falls back to normal speed');

// Pipes
let pipe = P.newPipe(150, 100);
ok(pipe.x === 400 && pipe.topH === 100 && pipe.gap === 150 && pipe.scored === false, 'new pipe at x=400');
P.movePipe(pipe, 2.8);
ok(close(pipe.x, 397.2), 'pipe moves left by speed');
ok(P.passedPipe({ x: 80 }, { x: 5, scored: false }) === true, 'pipe fully left of bird counts as passed');
ok(P.passedPipe({ x: 80 }, { x: 20, scored: false }) === false, 'pipe overlapping bird x does not count yet (20+68=88 > 80)');
ok(P.passedPipe({ x: 80 }, { x: 5, scored: true }) === false, 'already-scored pipe never re-counts');

// Collision: ground / ceiling
ok(P.hitsBounds({ x: 80, y: 10, r: 14 }) === true, 'bird near ceiling (y-r <= 0) collides');
ok(P.hitsBounds({ x: 80, y: 450, r: 14 }) === true, 'bird at ground line (y+r >= 460) collides');
ok(P.hitsBounds({ x: 80, y: 220, r: 14 }) === false, 'mid-air bird does not hit bounds');
ok(P.collides({ x: 80, y: 220, r: 14 }, []) === false, 'mid-air, no pipes: no collision');
// Collision: pipe body. Pipe x=70..138, topH=100, gap=150 -> bottom starts 250.
ok(P.hitsPipe({ x: 80, y: 50, r: 14 }, { x: 70, topH: 100, gap: 150 }) === true, 'bird inside top pipe collides');
ok(P.hitsPipe({ x: 80, y: 300, r: 14 }, { x: 70, topH: 100, gap: 150 }) === true, 'bird inside bottom pipe collides');
ok(P.hitsPipe({ x: 80, y: 175, r: 14 }, { x: 70, topH: 100, gap: 150 }) === false, 'bird centred in gap does not collide');
ok(P.hitsPipe({ x: 80, y: 175, r: 14 }, { x: 200, topH: 100, gap: 150 }) === false, 'distant pipe does not collide');
ok(P.collides({ x: 80, y: 50, r: 14 }, [{ x: 70, topH: 100, gap: 150 }]) === true, 'collides() aggregates pipe hit');
ok(P.collides({ x: 80, y: 175, r: 14 }, [{ x: 70, topH: 100, gap: 150 }]) === false, 'collides() false in gap');
// Gap edge: bird centre exactly at gap edge still counts via circle radius - verify boundary behaviour is consistent
ok(P.hitsPipe({ x: 80, y: 100, r: 14 }, { x: 70, topH: 100, gap: 150 }) === true, 'bird touching top-pipe lip collides (circle reaches rect)');
ok(P.hitsPipe({ x: 80, y: 114, r: 14 }, { x: 70, topH: 100, gap: 150 }) === false, 'bird 14px below lip clears top pipe (touching distance == r is not < r)');
// Full flight: flap every 32 frames roughly hovers (per-cycle displacement -2.4px:
// sum of vy over 32 steps = -7.5*32 + 0.45*(1+..+32) = -240 + 237.6). Flapping every
// 12 frames climbs steeply and is NOT a hover cadence (verified: y=-2525 over 600f).
let flyer = P.newBird();
for (let f = 0; f < 600; f++) { if (f % 32 === 0) P.flap(flyer); P.stepBird(flyer); }
ok(flyer.y > 0 && flyer.y < 460, 'flapping every 32 frames keeps bird airborne over 600 frames (y=' + flyer.y.toFixed(1) + ')');
// No flap: bird hits ground within 60 frames
let doomed = P.newBird();
let hitAt = -1;
for (let f = 0; f < 60; f++) { P.stepBird(doomed); if (P.hitsBounds(doomed)) { hitAt = f; break; } }
ok(hitAt > 0 && hitAt < 60, 'unflapped bird hits ground within 60 frames (frame ' + hitAt + ')');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
