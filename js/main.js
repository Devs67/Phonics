// ── Letter data ──────────────────────────────────────────────
// group: 0-5, used for the pastel color band (mirrors the reference checklist layout)
const LETTERS = [
  { ch:'a', sound:'a',    symbol:'/a/',  example:'apple'    },
  { ch:'b', sound:'buh',  symbol:'/b/',  example:'ball'     },
  { ch:'c', sound:'kuh',  symbol:'/k/',  example:'cat'      },
  { ch:'d', sound:'duh',  symbol:'/d/',  example:'dog'      },
  { ch:'e', sound:'eh',   symbol:'/e/',  example:'egg'      },
  { ch:'f', sound:'ffff', symbol:'/f/',  example:'fish'     },
  { ch:'g', sound:'guh',  symbol:'/g/',  example:'goat'     },
  { ch:'h', sound:'huh',  symbol:'/h/',  example:'hat'      },
  { ch:'i', sound:'ih',   symbol:'/i/',  example:'igloo'    },
  { ch:'j', sound:'juh',  symbol:'/j/',  example:'jam'      },
  { ch:'k', sound:'kuh',  symbol:'/k/',  example:'kite'     },
  { ch:'l', sound:'lll',  symbol:'/l/',  example:'leaf'     },
  { ch:'m', sound:'mmm',  symbol:'/m/',  example:'moon'     },
  { ch:'n', sound:'nnn',  symbol:'/n/',  example:'nest'     },
  { ch:'o', sound:'oh',   symbol:'/o/',  example:'octopus'  },
  { ch:'p', sound:'puh',  symbol:'/p/',  example:'pig'      },
  { ch:'q', sound:'kwuh', symbol:'/kw/', example:'queen'    },
  { ch:'r', sound:'rrr',  symbol:'/r/',  example:'rabbit'   },
  { ch:'s', sound:'sss',  symbol:'/s/',  example:'sun'      },
  { ch:'t', sound:'tuh',  symbol:'/t/',  example:'top'      },
  { ch:'u', sound:'uh',   symbol:'/u/',  example:'umbrella' },
  { ch:'v', sound:'vvv',  symbol:'/v/',  example:'van'      },
  { ch:'w', sound:'wuh',  symbol:'/w/',  example:'web'      },
  { ch:'x', sound:'ks',   symbol:'/ks/', example:'box'      },
  { ch:'y', sound:'yuh',  symbol:'/y/',  example:'yo-yo'    },
  { ch:'z', sound:'zzz',  symbol:'/z/',  example:'zebra'    },
].map((l, i) => ({ ...l, group: i % 6 }));

const PROGRESS_KEY = 'phonicsProgress';

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (raw && raw.sound && raw.name) return raw;
  } catch (e) {}
  return { sound: {}, name: {} };
}
function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
let progress = loadProgress();

// ── Speech ───────────────────────────────────────────────────
const synth = window.speechSynthesis || null;
let voices = [];
let chosenVoice = null;

function pickVoice() {
  if (!synth) return;
  voices = synth.getVoices();
  chosenVoice =
    voices.find(v => /en/i.test(v.lang) && /female|child|samantha|zira|victoria/i.test(v.name)) ||
    voices.find(v => /en/i.test(v.lang)) ||
    voices[0] || null;
}
if (synth) {
  pickVoice();
  synth.addEventListener('voiceschanged', pickVoice);
}

function speak(text) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.75;
  u.pitch = 1.15;
  if (chosenVoice) u.voice = chosenVoice;
  synth.speak(u);
}

// ── Mode toggle ──────────────────────────────────────────────
let mode = 'sound'; // 'sound' | 'name'
const modeButtons = document.querySelectorAll('.mode-btn');
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    mode = btn.dataset.mode;
    modeButtons.forEach(b => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('.tile').forEach(t => t.classList.remove('is-active'));
    updateStage(null);
  });
});

// ── Stage panel ──────────────────────────────────────────────
const stage       = document.getElementById('stage');
const stageLetter = document.getElementById('stageLetter');
const stageWord    = document.getElementById('stageWord');
const stageReplay  = document.getElementById('stageReplay');
let currentLetter = null;

function updateStage(letter) {
  currentLetter = letter;
  if (!letter) {
    stage.classList.remove('has-letter');
    stageLetter.textContent = '?';
    stageWord.textContent = 'Tap a tile to begin';
    return;
  }
  stage.classList.add('has-letter');
  stage.style.setProperty('--tile-bg', `var(--g${letter.group}-bg)`);
  stage.style.setProperty('--tile-ink', `var(--g${letter.group}-ink)`);
  stageLetter.textContent = letter.ch;
  stageWord.textContent = mode === 'sound'
    ? `${letter.symbol} — like in “${letter.example}”`
    : `Letter “${letter.ch.toUpperCase()}”`;
}

function playLetter(letter, tileEl) {
  updateStage(letter);
  speak(mode === 'sound' ? letter.sound : letter.ch.toUpperCase());

  progress[mode][letter.ch] = true;
  saveProgress(progress);

  document.querySelectorAll('.tile').forEach(t => t.classList.remove('is-active'));
  tileEl.classList.remove('pop');
  void tileEl.offsetWidth;
  tileEl.classList.add('pop', 'is-active');
  updateBadges(tileEl, letter);
  updateProgressBar();
  checkCompletion();
}

stageReplay.addEventListener('click', () => {
  if (currentLetter) speak(mode === 'sound' ? currentLetter.sound : currentLetter.ch.toUpperCase());
});

// ── Build tile grid ──────────────────────────────────────────
const grid = document.getElementById('tileGrid');

function updateBadges(tileEl, letter) {
  const nBadge = tileEl.querySelector('.badge-name');
  const sBadge = tileEl.querySelector('.badge-sound');
  nBadge.classList.toggle('is-done', !!progress.name[letter.ch]);
  sBadge.classList.toggle('is-done', !!progress.sound[letter.ch]);
}

LETTERS.forEach(letter => {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = `tile g${letter.group}`;
  tile.setAttribute('aria-label', `Letter ${letter.ch}, tap to hear its ${mode}`);
  tile.innerHTML = `
    <span class="tile-letter">${letter.ch}</span>
    <span class="tile-symbol">${letter.symbol}</span>
    <span class="tile-badges">
      <span class="badge badge-name" title="Letter name practiced">N</span>
      <span class="badge badge-sound" title="Letter sound practiced">S</span>
    </span>
  `;
  updateBadges(tile, letter);

  let touched = false;
  tile.addEventListener('touchstart', () => { touched = true; playLetter(letter, tile); }, { passive:true });
  tile.addEventListener('click', () => { if (touched) { touched = false; return; } playLetter(letter, tile); });

  grid.appendChild(tile);
});

// ── Progress bar ─────────────────────────────────────────────
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

function updateProgressBar() {
  const done = LETTERS.filter(l => progress[mode][l.ch]).length;
  progressFill.style.width = `${(done / LETTERS.length) * 100}%`;
  progressText.textContent = `${done} / ${LETTERS.length} ${mode === 'sound' ? 'sounds' : 'names'} practiced`;
}
updateProgressBar();

const celebration = document.getElementById('celebration');
function checkCompletion() {
  const done = LETTERS.every(l => progress[mode][l.ch]);
  if (done) {
    celebration.classList.add('is-visible');
    setTimeout(() => celebration.classList.remove('is-visible'), 2600);
  }
}

// ── Reset ────────────────────────────────────────────────────
document.getElementById('resetProgress').addEventListener('click', () => {
  if (!confirm('Reset all progress for both names and sounds?')) return;
  progress = { sound: {}, name: {} };
  saveProgress(progress);
  document.querySelectorAll('.tile').forEach((tileEl, i) => updateBadges(tileEl, LETTERS[i]));
  updateProgressBar();
  updateStage(null);
});

updateStage(null);
