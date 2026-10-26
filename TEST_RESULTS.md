# TEST_RESULTS — flappy-bird-bd (run #145, 2026-10-26 14:00 slot)

## Unit tests — 33/33 passed (`node tests/tests.js`)

- Bird: new bird y=220/vy=0; one step vy=0.45, y=220.45; flap vy=-7.5; step-after-flap vy=-7.05, y=213.4; fall capped at 12.
- Difficulty: base speeds easy 2.2 / normal 2.8 / hard 3.4; +10 pts -> 2.9; ramp capped +1.0 (100 pts -> 3.8, stays 3.8 at 200 pts); gaps 170/150/130; unknown difficulty falls back to normal.
- Pipes: new pipe x=400; moves left by speed; passed only once pipe right edge < bird x (20+68=88 > 80 not yet passed); scored pipes never re-count.
- Collision: ceiling/ground bounds; top-pipe, bottom-pipe, and gap-centre cases; lip-touching collides (distance < r) while 14px below the lip clears (distance == r is not < r).
- Flight: flapping every 32 frames hovers (per-cycle displacement -2.4px; y=131.8 after 600 frames, in bounds); unflapped bird hits ground at frame 31.
- Repair note: the first version of the hover test flapped every 12 frames and failed (y=-2525) — that cadence climbs steeply, it is not a hover. The test was corrected to the mathematically verified 32-frame cadence; no app code changed.

## Smoke tests — 20/20 passed (`node tests/smoke.js`, raw CDP, /opt/meta-chromium/chrome)

- Title, 400x520 canvas, initial `ready` state, ready overlay, Play button.
- Unflapped game ends in `over` on its own; overlay title `Game over`; button `Play again`.
- Play-again -> `playing`; pauseToggle -> `paused` with Pause overlay; resume button -> `playing`; stepOnce moves bird (y 296.95 -> 314.5).
- Difficulty switches to hard and the select reflects it; sound button toggles On -> Off.
- BN toggle changes the title from English; `toBn('123')` renders Bengali digits; document lang becomes `bn`.
- 390px viewport: no horizontal overflow. Zero console/page errors.

## Source hygiene

- `index.html`, `css/`, `js/`, `tests/` are pure ASCII (Bengali rendered via \uXXXX escapes in JS); verified with `grep -P '[^\x00-\x7F]'` (zero matches).
- Zero network requests by design (no CDN, no fonts, no audio files).
