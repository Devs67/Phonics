# Letter Sounds — Phonics Tiles

A simple, touch-friendly phonics practice page for young learners. Tap a big colorful tile and it speaks the letter's sound (or name) out loud using the browser's built-in text-to-speech — no audio files, no build step, no dependencies.

## Files

```
index.html      → the page
css/style.css   → all styling
js/main.js      → letter data, speech, progress tracking
```

## Features

- 26 big tiles, color-grouped like a classic phonics wall chart
- Sounds / Names toggle
- Speaks aloud via the Web Speech API (`speechSynthesis`)
- Per-letter progress badges + a progress bar, saved in `localStorage`
- Small celebration when all 26 are practiced
- Fully responsive, works on tablets/phones

## Running it

No build step — just open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Deploying

Push this repo and enable GitHub Pages (Settings → Pages → deploy from `main` / root). The page will be live at `https://<username>.github.io/<repo>/`.
