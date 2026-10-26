# Flappy Bird BD

An offline, bilingual (English / বাংলা) Flappy-style arcade game. Tap, click, or press Space to flap a bird through pipes, score a point per pipe, and chase your best score — all in the browser, with no accounts and no network calls.

## Features

1. **Flap gameplay** — Canvas bird with gravity physics, pipe obstacles, ground/ceiling collision, and a game-over state when the bird crashes.
2. **Scoring & best score** — 1 point per pipe passed; best score and games played persist in `localStorage` on the device only.
3. **Three difficulties** — Easy (gap 170, speed 2.2), Normal (gap 150, speed 2.8), Hard (gap 130, speed 3.4). Speed also ramps +0.1 per 10 points, capped at +1.0.
4. **Pause / resume / restart** — Pause button, `P` key, and play-again flow; the game also ends on its own if you stop flapping.
5. **Bilingual UI** — English / বাংলা toggle (persisted), with Bengali digits when বাংলা is active.
6. **Sound effects** — Small Web Audio beeps for flaps, points, and crashes, with a mute toggle. No audio files.
7. **Mobile friendly** — 390px layout with no horizontal overflow; touch, mouse, and keyboard controls.

## Controls

| Action | Input |
|---|---|
| Flap / start | Space, ArrowUp, W, mouse click on the canvas, or touch |
| Pause / resume | `P` or the Pause button |
| Difficulty | Difficulty dropdown (applies on the next game) |
| Sound | Sound On/Off button |

## Stack

Vanilla HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies, no network requests. The physics (`js/physics.js`) is a pure, deterministic module with no DOM access, so it is unit-tested directly in Node.

## Run locally

Open `index.html` in any modern browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Testing

```sh
node tests/tests.js   # 33 physics unit tests
node tests/smoke.js   # 20 headless-Chrome (CDP) checks: states, controls, i18n, 390px
```

See `TEST_RESULTS.md` for the exact verified numbers.

## Project structure

```
index.html          Page shell (English defaults; JS fills in the active language)
css/style.css       Layout, overlay, responsive rules
js/physics.js       Pure game physics: bird, pipes, collision, speed ramp
js/app.js           Canvas rendering, game loop, UI, i18n, persistence, sound
tests/tests.js      Node unit tests for physics
tests/smoke.js      Headless-Chrome smoke tests via raw CDP
```

## Limitations

- Scores live only in this browser's `localStorage`; clearing site data erases them.
- This is a fan-style arcade toy built from scratch (original art drawn on canvas). It is not affiliated with any commercial Flappy game.
- Pipe gaps are randomized; difficulty, not luck, is the intended challenge — speeds and gaps are documented above and unit-tested.

## Status

Working MVP, fully tested (see TEST_RESULTS.md). Single-page static site, ready for GitHub Pages.
