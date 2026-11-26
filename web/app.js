'use strict';
(function () {
  const $ = (s) => document.querySelector(s);

  // ---------- Workout shape ----------
  // A workout is 3 rounds. Each round has its own trio of exercises
  // (abs, arms/chest, legs/cardio) and runs 3 sets. Every exercise lasts
  // 30s in set 1, 45s in set 2 and 60s in set 3.
  const SET_SECONDS = [30, 45, 60];
  // Icons are drawn in a 24x24 box.
  const CATS = [
    { key: 'abs', label: 'Abs', color: '#E76F51',
      icon: 'M12 1.5c1.3 3.6 5.5 5.9 5.5 11a5.5 5.5 0 0 1-11 0c0-2.3 1-4 2.3-5.2 0 2.2 1 3.4 2.3 3.6-.2-3.4-.6-6.2.9-9.4z' },
    { key: 'arms', label: 'Arms & chest', color: '#E0A93B',
      icon: 'M1.5 9.5h2v5h-2zM4.5 6.5h3.5v11H4.5zM16 6.5h3.5v11H16zM20.5 9.5h2v5h-2zM8 10.8h8v2.4H8z' },
    { key: 'legs', label: 'Legs & cardio', color: '#2A9D8F',
      icon: 'M13.5 1.5 4 13.5h6.5L9 22.5l10-12.5h-6.6z' },
  ];
  const PAW = '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="15.5" rx="5" ry="4.2"/><ellipse cx="5.2" cy="10.2" rx="2.2" ry="2.7"/><ellipse cx="9.3" cy="6" rx="2.2" ry="2.8"/><ellipse cx="14.7" cy="6" rx="2.2" ry="2.8"/><ellipse cx="18.8" cy="10.2" rx="2.2" ry="2.7"/></svg>';
  const badge = (e, cls) => `<span class="badge ${cls || ''}" style="background:${CATS[e].color}"><svg viewBox="0 0 24 24"><path d="${CATS[e].icon}"/></svg></span>`;
  const DEFAULT_ROUNDS = [
    ['Sit-ups', 'Push-ups', 'Squats'],
    ['Bicycle crunches', 'Tricep dips', 'Lunges'],
    ['Plank', 'Diamond push-ups', 'Jumping jacks'],
  ];
  // ---------- Exercise library ----------
  // sides:  split the interval in half with a "switch sides" cue.
  // weight: 'optional' or 'required' shows a dumbbell; omitted means mat only.
  const LIBRARY = [
    [ // Abs
      { name: 'Sit-ups', weight: 'optional', tip: 'Hold the weight at your chest' },
      { name: 'Crunches', weight: 'optional', tip: 'Lift with your abs, not your neck' },
      { name: 'Bicycle crunches', tip: 'Slow and controlled, elbow to opposite knee' },
      { name: 'Reverse crunches', tip: 'Curl your hips off the mat' },
      { name: 'Leg raises', weight: 'optional', tip: 'Keep your lower back pressed down' },
      { name: 'Flutter kicks', tip: 'Small, fast kicks; low back down' },
      { name: 'Dead bugs', weight: 'optional', tip: 'Opposite arm and leg, move slowly' },
      { name: 'Hollow hold', tip: 'Arms overhead, shoulders off the mat' },
      { name: 'V-ups', tip: 'Reach for your toes' },
      { name: 'Plank', tip: 'Straight line from head to heels' },
      { name: 'Side plank', sides: true, tip: 'Hips high' },
      { name: 'Plank hip dips', tip: 'Rock your hips side to side' },
      { name: 'Mountain climbers', tip: 'Drive your knees to your chest' },
      { name: 'Russian twists', weight: 'required', tip: 'Lean back, rotate side to side' },
    ],
    [ // Arms & chest
      { name: 'Push-ups', tip: 'Straight body, chest to the floor' },
      { name: 'Knee push-ups', tip: 'Straight line from knees to head' },
      { name: 'Wide push-ups', tip: 'Hands wider than your shoulders' },
      { name: 'Diamond push-ups', tip: 'Thumbs and index fingers touching' },
      { name: 'Pike push-ups', tip: 'Hips high, lower your head toward the mat' },
      { name: 'Tricep dips', tip: 'Use a couch or chair edge if you have one' },
      { name: 'Plank shoulder taps', tip: 'Keep your hips still' },
      { name: 'Plank up-downs', tip: 'Elbows to hands, one arm at a time' },
      { name: 'Inchworms', tip: 'Walk your hands out to a plank and back' },
      { name: 'Bicep curls', weight: 'required', tip: 'Elbows tucked at your sides' },
      { name: 'Overhead tricep extensions', weight: 'required', tip: 'Elbows point at the ceiling' },
      { name: 'Floor chest press', weight: 'required', tip: 'Lie on your back, press straight up' },
      { name: 'Bent-over rows', weight: 'required', tip: 'Flat back, pull both weights to your hips' },
      { name: 'Lateral raises', weight: 'required', tip: 'Lift to shoulder height, slow on the way down' },
    ],
    [ // Legs & cardio
      { name: 'Squats', weight: 'optional', tip: 'Sit back, chest up' },
      { name: 'Lunges', weight: 'optional', tip: 'Alternate legs, back knee toward the floor' },
      { name: 'Jumping jacks', tip: 'Land softly' },
      { name: 'High knees', tip: 'Knees to hip height, stay on your toes' },
      { name: 'Butt kicks', tip: 'Heels to glutes, quick feet' },
      { name: 'Burpees', tip: 'Chest to the floor, jump at the top' },
      { name: 'Jump squats', tip: 'Squat down, explode up, land soft' },
      { name: 'Skaters', tip: 'Leap side to side, land on one foot' },
      { name: 'Glute bridges', weight: 'optional', tip: 'Squeeze at the top; weight on your hips' },
      { name: 'Single-leg glute bridges', sides: true, tip: 'Keep your hips level' },
      { name: 'Side lunges', weight: 'optional', tip: 'Alternate sides, keep the other leg straight' },
      { name: 'Romanian deadlifts', weight: 'required', tip: 'Hinge at the hips, flat back, weights close' },
      { name: 'Calf raises', weight: 'optional', tip: 'Rise slowly, pause at the top' },
      { name: 'Fire hydrants', sides: true, tip: 'On all fours, lift your knee out to the side' },
      { name: 'Around the world', tip: 'Squat, step, squat. Lap the room!' },
    ],
  ];
  const findEx = (e, name) => LIBRARY[e].find((x) => x.name === name);
  const DUMBBELL = '<svg class="wt" viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 9.5h2v5h-2zM4.5 6.5h3.5v11H4.5zM16 6.5h3.5v11H16zM20.5 9.5h2v5h-2zM8 10.8h8v2.4H8z"/></svg>';
  // Little dumbbell after a name. Optional weights are drawn faded.
  const wtIcon = (ex) => ex && ex.weight ? `<span class="wtag ${ex.weight}" title="${ex.weight === 'required' ? 'Weights' : 'Weights optional'}">${DUMBBELL}</span>` : '';
  const shuffled = (a) => {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
  };
  // A fresh random workout: 3 different exercises per category, so nothing repeats.
  // Prefers exercises that aren't in the current workout, so each shuffle feels new.
  function randomRounds(current) {
    const out = [[], [], []];
    for (let e = 0; e < 3; e++) {
      const used = new Set(current ? current.map((r) => r[e]) : []);
      const all = shuffled(LIBRARY[e].map((x) => x.name));
      const pick = all.filter((n) => !used.has(n)).concat(all.filter((n) => used.has(n))).slice(0, 3);
      pick.forEach((n, r) => { out[r][e] = n; });
    }
    return out;
  }
  // Add ?fast to the URL to run 10x speed when testing.
  const SPEED = /[?&]fast/.test(location.search) ? 10 : 1;
  const STORE = 'puppy-playtime-v1';

  // ---------- Settings ----------
  function loadSettings() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { /* first run */ }
    // Keep saved exercises that are in the library and not already used; refill the rest.
    const rounds = [[], [], []];
    for (let e = 0; e < 3; e++) {
      const used = new Set();
      for (let r = 0; r < 3; r++) {
        const saved = s.rounds && s.rounds[r] && s.rounds[r][e];
        const n = findEx(e, saved) && !used.has(saved) ? saved : null;
        rounds[r][e] = n;
        if (n) used.add(n);
      }
      for (let r = 0; r < 3; r++) {
        if (rounds[r][e]) continue;
        const d = DEFAULT_ROUNDS[r][e];
        rounds[r][e] = !used.has(d) ? d : LIBRARY[e].map((x) => x.name).find((n) => !used.has(n));
        used.add(rounds[r][e]);
      }
    }
    return {
      readySecs: [3, 5, 10].includes(s.readySecs) ? s.readySecs : 5,
      sound: s.sound !== false,
      rounds,
    };
  }
  const settings = loadSettings();
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(settings)); } catch (e) { /* storage unavailable */ }
  }
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

  // ---------- Sound ----------
  // Everything is synthesized with Web Audio: no files, no music. The palette
  // is a small "studio" of three voices that share one soft room reverb:
  //   marimba - warm wooden mallet, used for countdowns and small cues
  //   chime   - glassy bell with inharmonic overtones, used for milestones
  //   pad     - slow, quiet chord bloom underneath the bigger celebrations
  let ac = null, master = null, verbIn = null;
  function impulse(ctx, sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function audio() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 4;
      const soften = ac.createBiquadFilter();
      soften.type = 'lowpass';
      soften.frequency.value = 7500;
      master = ac.createGain();
      master.gain.value = 0.85;
      master.connect(soften).connect(comp).connect(ac.destination);
      // Gentle room so cues feel like they happen in a space, not a beeper.
      const verb = ac.createConvolver();
      verb.buffer = impulse(ac, 2.2, 3.2);
      const wet = ac.createGain();
      wet.gain.value = 0.28;
      verbIn = ac.createGain();
      verbIn.connect(verb).connect(wet).connect(soften);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  // One enveloped oscillator. opts: type, attack, send (reverb amount), glide (start pitch ratio).
  function partial(freq, start, dur, gain, opts) {
    const ctx = audio();
    if (!ctx) return;
    const o = opts || {};
    const osc = ctx.createOscillator(), g = ctx.createGain();
    const t = ctx.currentTime + 0.01 + start;
    const atk = o.attack || 0.004;
    osc.type = o.type || 'sine';
    if (o.glide) {
      osc.frequency.setValueAtTime(freq * o.glide, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
    } else osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + atk + dur);
    osc.connect(g);
    g.connect(master);
    if (o.send) {
      const s = ctx.createGain();
      s.gain.value = o.send;
      g.connect(s).connect(verbIn);
    }
    osc.start(t);
    osc.stop(t + atk + dur + 0.05);
  }
  // A short filtered noise burst: the "knock" of a mallet, or a soft air swish.
  function noise(start, dur, gain, freq, q, sweepTo) {
    const ctx = audio();
    if (!ctx) return;
    const len = Math.ceil(ctx.sampleRate * (dur + 0.05));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    const t = ctx.currentTime + 0.01 + start;
    src.buffer = buf;
    f.type = 'bandpass';
    f.Q.value = q || 1;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const atk = sweepTo ? dur * 0.6 : 0.002;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    const s = ctx.createGain();
    s.gain.value = 0.3;
    g.connect(s).connect(verbIn);
    src.start(t);
    src.stop(t + dur + 0.05);
  }
  // Marimba: fundamental, the bar's characteristic ~4x overtone, and a mallet knock.
  function marimba(f, start, gain, dur) {
    const d = dur || 0.45;
    partial(f, start, d, gain, { send: 0.25 });
    partial(f * 3.93, start, d * 0.12, gain * 0.28, { send: 0.15 });
    partial(f * 10.1, start, 0.02, gain * 0.06);
    noise(start, 0.02, gain * 0.35, f * 4, 2);
  }
  // Wood block: hollow, very short, clock-like.
  function wood(f, start, gain) {
    partial(f, start, 0.07, gain, { glide: 1.35, send: 0.12 });
    partial(f * 2.6, start, 0.03, gain * 0.3);
    noise(start, 0.015, gain * 0.4, 2400, 3);
  }
  // Chime: inharmonic bell partials, each pair slightly detuned so it shimmers.
  const CHIME = [[1, 1, 1], [2.76, 0.36, 0.55], [5.4, 0.16, 0.3], [8.93, 0.07, 0.16]];
  function chime(f, start, gain, dur) {
    const d = dur || 1.4;
    CHIME.forEach(([r, a, l]) => {
      partial(f * r, start, d * l, gain * a * 0.6, { send: 0.55 });
      partial(f * r * 1.0025, start, d * l, gain * a * 0.4, { send: 0.55 });
    });
  }
  // Pad: a slow, quiet triangle-wave chord that blooms underneath a celebration.
  function pad(freqs, start, dur, gain) {
    freqs.forEach((f) => {
      partial(f, start, dur, gain, { type: 'triangle', attack: dur * 0.35, send: 0.8 });
      partial(f * 1.004, start, dur, gain * 0.6, { type: 'triangle', attack: dur * 0.35, send: 0.8 });
    });
  }
  // Pitches (C major / pentatonic so everything agrees with everything else).
  const N = { C3: 131, G3: 196, C4: 262, E4: 330, G4: 392, A4: 440, C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, C6: 1047, D6: 1175, E6: 1319, G6: 1568 };
  // 3-2-1 before an exercise climbs toward the "go" note, so you can feel it landing.
  const COUNT = { 3: N.C5, 2: N.D5, 1: N.E5 };
  const SOUNDS = {
    // Get-ready countdown: rising marimba.
    count: (c) => marimba(COUNT[c] || N.C5, 0, 0.8),
    // Exercise starts: bright mallet on the resolving note, a lifted chime, and a soft swish.
    go: () => {
      noise(0, 0.22, 0.05, 600, 0.8, 4000);
      marimba(N.G5, 0.02, 0.7, 0.6);
      chime(N.G6 / 2, 0.06, 0.3, 1.1);
    },
    // Last seconds of an exercise: quiet wood-block "clock" (distinct from get-ready).
    workTick: () => wood(N.A4 * 2, 0, 0.45),
    // Halfway through a longer exercise: a single, barely-there chime.
    halfway: () => chime(N.E6, 0, 0.2, 0.9),
    // Switch sides: a clear back-and-forth "ding-dong-ding" so you notice mid-exercise.
    switchSides: () => {
      marimba(N.E5, 0, 0.6, 0.3);
      marimba(N.C5, 0.13, 0.6, 0.3);
      marimba(N.E5, 0.26, 0.6, 0.5);
      chime(N.E6, 0.26, 0.15, 1);
    },
    // Exercise done: an easy two-note "exhale" down to rest.
    done: () => {
      marimba(N.G5, 0, 0.32, 0.5);
      marimba(N.C5, 0.14, 0.34, 0.9);
      chime(N.C6, 0.16, 0.08, 1.2);
    },
    // Set done: a chime arpeggio over a gentle chord.
    setDone: () => {
      pad([N.C4, N.G4, N.E5], 0, 2.2, 0.05);
      [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => chime(f, i * 0.11, 0.22, 1.6));
    },
    // Round done: fuller chord bloom, a low bell, and a cascading chime run.
    roundDone: () => {
      chime(N.C3 * 2, 0, 0.2, 2.6);
      pad([N.C3, N.G3, N.E4, N.C5], 0, 3, 0.05);
      [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => chime(f, 0.12 + i * 0.1, 0.2, 1.8));
    },
    // Workout complete: the round chord, then a little sparkle that rings out.
    complete: () => {
      SOUNDS.roundDone();
      [N.G5, N.C6, N.E6, N.G6].forEach((f, i) => marimba(f, 0.75 + i * 0.07, 0.16, 0.4));
      chime(N.C6, 1.1, 0.24, 2.8);
      chime(N.G5, 1.1, 0.14, 2.8);
    },
    // Pause / resume: two tiny notes, down or up.
    pause: () => { marimba(N.E5, 0, 0.18, 0.25); marimba(N.C5, 0.08, 0.18, 0.4); },
    resume: () => { marimba(N.C5, 0, 0.18, 0.25); marimba(N.E5, 0.08, 0.18, 0.4); },
  };
  let quiet = false;
  function sfx(name, arg) { if (settings.sound && !quiet) try { SOUNDS[name](arg); } catch (e) { /* no audio */ } }
  function buzz(ms) {
    try {
      if (window.Android && window.Android.vibrate) window.Android.vibrate(ms);
      else if (navigator.vibrate) navigator.vibrate(ms);
    } catch (e) { /* no vibration */ }
  }

  // ---------- Screen wake (browser only; the Android app keeps the screen on itself) ----------
  let wake = null;
  async function requestWake() {
    try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) { /* not allowed */ }
  }
  function releaseWake() { try { wake && wake.release(); } catch (e) { /* already released */ } wake = null; }

  // ---------- Home screen ----------
  function totalMinutes() {
    const perRound = SET_SECONDS.reduce((a, s) => a + 3 * s, 0) + 9 * settings.readySecs;
    return Math.round((perRound * 3) / 60);
  }
  function renderHome() {
    $('#rounds').innerHTML = settings.rounds.map((names, r) => `
      <section class="card round">
        <div class="round-head">
          <span class="num">${PAW}</span>
          <h2>Round ${r + 1}</h2>
          <button class="edit" data-round="${r}">✎ Edit</button>
        </div>
        <ul>${names.map((n, e) => `
          <li>${badge(e)}<span class="name">${esc(n)}${wtIcon(findEx(e, n))}${findEx(e, n).sides ? '<span class="sides" title="Switch sides halfway">⇄</span>' : ''}</span><span class="tag">${CATS[e].label}</span></li>`).join('')}
        </ul>
      </section>`).join('');
    document.querySelectorAll('#readySeg button').forEach((b) => b.classList.toggle('on', +b.dataset.v === settings.readySecs));
    const sb = $('#soundBtn');
    sb.textContent = settings.sound ? 'On' : 'Off';
    sb.classList.toggle('on', settings.sound);
    $('#estimate').textContent = `About ${totalMinutes()} minutes, plus your breaks`;
  }

  $('#rounds').addEventListener('click', (ev) => {
    const b = ev.target.closest('.edit');
    if (b) openEdit(+b.dataset.round);
  });
  $('#readySeg').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    settings.readySecs = +b.dataset.v;
    save(); renderHome();
  });
  $('#soundBtn').addEventListener('click', () => {
    settings.sound = !settings.sound;
    save(); renderHome();
    if (settings.sound) sfx('go');
  });
  $('#startBtn').addEventListener('click', startWorkout);
  $('#shuffleBtn').addEventListener('click', () => {
    settings.rounds = randomRounds(settings.rounds);
    save(); renderHome();
    const box = $('#rounds');
    box.classList.remove('shuffled'); void box.offsetWidth; box.classList.add('shuffled');
  });

  // ---------- Modal sheet ----------
  let modalOnClose = null;
  function openModal(html, onClose) {
    $('#sheet').innerHTML = html;
    $('#modal').classList.remove('hidden');
    modalOnClose = onClose || null;
  }
  function closeModal() {
    $('#modal').classList.add('hidden');
    $('#sheet').innerHTML = '';
    $('#sheet').onchange = $('#sheet').onclick = null;
    const cb = modalOnClose;
    modalOnClose = null;
    if (cb) cb();
  }
  const modalOpen = () => !$('#modal').classList.contains('hidden');
  $('#modal').addEventListener('click', (ev) => { if (ev.target.id === 'modal') closeModal(); });

  // One pulldown per category. Exercises already used in another round are
  // disabled (labelled with that round) so the workout never repeats one.
  function openEdit(r) {
    const draft = settings.rounds[r].slice();
    const options = (e) => LIBRARY[e].map((x) => {
      const other = settings.rounds.findIndex((names, rr) => rr !== r && names[e] === x.name);
      const extra = (x.weight === 'required' ? ' · weights' : x.weight ? ' · weights optional' : '') + (x.sides ? ' · both sides' : '');
      return `<option value="${esc(x.name)}" ${x.name === draft[e] ? 'selected' : ''} ${other >= 0 ? 'disabled' : ''}>${esc(x.name)}${extra}${other >= 0 ? ` (Round ${other + 1})` : ''}</option>`;
    }).join('');
    const tipFor = (e) => {
      const x = findEx(e, draft[e]);
      return `${wtIcon(x)}${esc(x.tip || '')}`;
    };
    openModal(`
      <h2>Round ${r + 1} exercises</h2>
      ${draft.map((n, e) => `
        <label class="field">
          <span>${badge(e, 'sm')}${CATS[e].label}</span>
          <div class="pick">
            <select data-e="${e}">${options(e)}</select>
            <button type="button" class="dice" data-e="${e}" aria-label="Pick a random ${CATS[e].label} exercise">🎲</button>
          </div>
          <small class="hint" data-e="${e}">${tipFor(e)}</small>
        </label>`).join('')}
      <div class="btns">
        <button class="big alt" id="cancelEdit">Cancel</button>
        <button class="big" id="saveEdit">Save</button>
      </div>`);
    const sync = (e) => {
      $(`#sheet select[data-e="${e}"]`).value = draft[e];
      $(`#sheet .hint[data-e="${e}"]`).innerHTML = tipFor(e);
    };
    $('#sheet').onchange = (ev) => {
      const sel = ev.target.closest('select');
      if (sel) { draft[+sel.dataset.e] = sel.value; sync(+sel.dataset.e); }
    };
    $('#sheet').onclick = (ev) => {
      const b = ev.target.closest('.dice');
      if (!b) return;
      ev.preventDefault();
      const e = +b.dataset.e;
      const taken = new Set(settings.rounds.map((names) => names[e]));
      const free = LIBRARY[e].map((x) => x.name).filter((n) => !taken.has(n) && n !== draft[e]);
      if (free.length) { draft[e] = shuffled(free)[0]; sync(e); }
    };
    $('#cancelEdit').onclick = closeModal;
    $('#saveEdit').onclick = () => {
      settings.rounds[r] = draft;
      save(); renderHome(); closeModal();
    };
  }

  // ---------- Workout engine ----------
  // The workout is a flat list of steps:
  //   ready (get into position, timed) -> work (exercise, timed) -> ... -> break (waits for a tap) ... -> done
  function buildSteps() {
    const steps = [];
    for (let r = 0; r < 3; r++) {
      if (r > 0) steps.push({ type: 'break', kind: 'round', r, s: 0 });
      for (let s = 0; s < 3; s++) {
        if (s > 0) steps.push({ type: 'break', kind: 'set', r, s });
        for (let e = 0; e < 3; e++) {
          steps.push({ type: 'ready', r, s, e, dur: settings.readySecs });
          steps.push({ type: 'work', r, s, e, dur: SET_SECONDS[s] });
        }
      }
    }
    steps.push({ type: 'done', r: 2 });
    return steps;
  }

  let steps = [], idx = 0, stepStart = 0, pausedAt = null, playing = false;
  let startedAt = 0, finishedAt = 0, lastBeep = null, timer = 0, raf = 0, shownKey = '';
  const cur = () => steps[idx];
  // Seconds into the current step (scaled by SPEED for timed steps).
  const elapsed = () => ((pausedAt !== null ? pausedAt : Date.now()) - stepStart) / 1000 * SPEED;
  const nameOf = (st) => settings.rounds[st.r][st.e];
  const exOf = (st) => findEx(st.e, nameOf(st));

  function startWorkout() {
    audio(); // unlock audio on this tap
    steps = buildSteps();
    idx = 0; pausedAt = null; lastBeep = null; shownKey = '';
    stepStart = startedAt = Date.now();
    playing = true;
    show('play');
    requestWake();
    clearInterval(timer);
    timer = setInterval(tick, 100);
    loop();
  }
  function stopWorkout() {
    playing = false;
    clearInterval(timer);
    cancelAnimationFrame(raf);
    releaseWake();
    document.body.dataset.phase = 'home';
    show('home');
  }
  function show(id) {
    $('#home').classList.toggle('hidden', id !== 'home');
    $('#play').classList.toggle('hidden', id !== 'play');
    window.scrollTo(0, 0);
  }
  function loop() {
    tick();
    if (playing) raf = requestAnimationFrame(loop);
  }

  function tick() {
    if (!playing) return;
    // Loop so that we catch up correctly if the app was in the background.
    for (let guard = 0; guard < 100; guard++) {
      const st = cur();
      if ((st.type !== 'ready' && st.type !== 'work') || pausedAt !== null) break;
      const rem = st.dur - elapsed();
      const c = Math.ceil(rem);
      if (st.type === 'ready') {
        if (c >= 1 && c <= 3 && c !== lastBeep) { lastBeep = c; sfx('count', c); }
      } else {
        // Work: halfway is a "switch sides" cue for one-sided exercises, otherwise a faint
        // chime on longer sets. Then a quiet clock for the last 3s.
        if (lastBeep === null && rem <= st.dur / 2 && rem > 3) {
          if (exOf(st).sides) { lastBeep = 'half'; sfx('switchSides'); buzz(300); }
          else if (st.dur >= 45) { lastBeep = 'half'; sfx('halfway'); }
        }
        if (c >= 1 && c <= 3 && c !== lastBeep) { lastBeep = c; sfx('workTick'); }
      }
      if (rem > 0) break;
      // If we're catching up after being in the background, don't stack a pile of stale cues.
      quiet = rem < -1;
      advance(true);
      quiet = false;
    }
    render();
  }

  function advance(natural) {
    const st = cur(), next = steps[idx + 1];
    if (st.type === 'work') {
      if (next.type === 'done') { sfx('complete'); buzz(800); }
      else if (next.type === 'break' && next.kind === 'round') { sfx('roundDone'); buzz(800); }
      else if (next.type === 'break') { sfx('setDone'); buzz(600); }
      else { sfx('done'); buzz(400); }
    } else if (st.type === 'ready') {
      sfx('go'); buzz(150);
    }
    idx++;
    lastBeep = null;
    if (natural && (next.type === 'ready' || next.type === 'work')) {
      stepStart += st.dur * 1000 / SPEED; // keep exact timing even if a tick was late
    } else {
      stepStart = Date.now();
      if (pausedAt !== null) pausedAt = stepStart;
    }
    if (next.type === 'done') { finishedAt = Date.now(); confetti(); }
    if (next.type === 'break' && next.kind === 'round') confetti();
  }

  function togglePause() {
    if (pausedAt === null) pausedAt = Date.now();
    else { stepStart += Date.now() - pausedAt; pausedAt = null; }
    render();
  }
  function continueFromBreak() {
    audio();
    sfx('resume');
    idx++;
    stepStart = Date.now();
    pausedAt = null;
    lastBeep = null;
    render();
  }

  function confirmEnd() {
    const st = cur();
    if (st.type === 'done') { stopWorkout(); return; }
    const wasRunning = (st.type === 'ready' || st.type === 'work') && pausedAt === null;
    if (wasRunning) togglePause();
    openModal(`
      <h2>End this playtime?</h2>
      <p>Your progress in this workout won't be saved.</p>
      <div class="btns">
        <button class="big alt" id="endNo">Keep going</button>
        <button class="big" id="endYes">End it</button>
      </div>`, () => { if (wasRunning && playing && pausedAt !== null) togglePause(); });
    $('#endNo').onclick = closeModal;
    $('#endYes').onclick = () => { modalOnClose = null; closeModal(); stopWorkout(); };
  }
  $('#endBtn').addEventListener('click', confirmEnd);

  $('#controls').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'pause') { sfx(pausedAt === null ? 'pause' : 'resume'); togglePause(); }
    else if (act === 'skip') { advance(false); render(); }
    else if (act === 'continue') continueFromBreak();
    else if (act === 'home') stopWorkout();
  });
  // Tapping the circle also pauses / resumes.
  $('#pieWrap').addEventListener('click', () => {
    const st = cur();
    if (st && (st.type === 'ready' || st.type === 'work')) togglePause();
  });

  // ---------- Pie ----------
  // 9 slices per round, sized by duration, grouped 3+3+3 with wider gaps between sets.
  const CX = 200, R_OUT = 162, R_IN = 102;
  const ANG = (() => {
    const groupGap = 10, sliceGap = 4;
    const avail = 360 - 3 * groupGap - 6 * sliceGap;
    const total = 3 * SET_SECONDS.reduce((a, b) => a + b, 0);
    const out = [];
    let a = groupGap / 2;
    for (let s = 0; s < 3; s++) {
      for (let e = 0; e < 3; e++) {
        const span = avail * SET_SECONDS[s] / total;
        out.push([a, a + span]);
        a += span + (e < 2 ? sliceGap : groupGap);
      }
    }
    return out;
  })();
  const pt = (deg, rad) => {
    const a = deg * Math.PI / 180;
    return `${(CX + rad * Math.sin(a)).toFixed(2)} ${(CX - rad * Math.cos(a)).toFixed(2)}`;
  };
  function arc(a0, a1) {
    if (a1 - a0 < 0.2) return '';
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${pt(a0, R_OUT)} A${R_OUT} ${R_OUT} 0 ${large} 1 ${pt(a1, R_OUT)} L${pt(a1, R_IN)} A${R_IN} ${R_IN} 0 ${large} 0 ${pt(a0, R_IN)} Z`;
  }
  function pieSVG(doneCount, active, type) {
    const rMid = (R_OUT + R_IN) / 2;
    let out = '<svg viewBox="0 0 400 400" aria-hidden="true">';
    out += `<circle class="track" cx="${CX}" cy="${CX}" r="${rMid}" stroke-width="${R_OUT - R_IN + 16}"/>`;
    let icons = '';
    ANG.forEach(([a0, a1], k) => {
      const e = k % 3, c = CATS[e].color;
      const cls = k < doneCount ? 'done' : k === active ? (type === 'ready' ? 'next' : 'now') : 'todo';
      out += `<path class="slice ${cls}" d="${arc(a0, a1)}" fill="${c}" stroke="${c}"/>`;
      if (k === active && type === 'work') out += `<path id="prog" class="slice prog" d="" fill="${c}" stroke="${c}"/>`;
      const [x, y] = pt((a0 + a1) / 2, rMid).split(' ').map(Number);
      icons += `<path class="sicon ${cls === 'todo' ? 'todo' : ''}" transform="translate(${x - 11} ${y - 11}) scale(.92)" d="${CATS[e].icon}"/>`;
    });
    out += icons;
    // "30s / each" labels outside each set's group of three slices
    SET_SECONDS.forEach((sec, s) => {
      const mid = (ANG[s * 3][0] + ANG[s * 3 + 2][1]) / 2;
      const [x, y] = pt(mid, 188).split(' ').map(Number);
      out += `<text class="lbl" x="${x}" y="${y - 6}" text-anchor="middle" dominant-baseline="middle">${sec}s</text>`;
      out += `<text class="lbl2" x="${x}" y="${y + 9}" text-anchor="middle" dominant-baseline="middle">EACH</text>`;
    });
    return out + '</svg>';
  }

  // ---------- Render ----------
  function pills(r) {
    return `<div class="list">${settings.rounds[r].map((n, e) =>
      `<span class="pill">${badge(e)}${esc(n)}${wtIcon(findEx(e, n))}</span>`).join('')}</div>`;
  }

  function render() {
    if (!playing) return;
    const st = cur();
    const timed = st.type === 'ready' || st.type === 'work';
    const paused = timed && pausedAt !== null;

    // Which round the pie shows and how much of it is finished
    let pr, doneCount, active = -1, roundsDone;
    if (timed) { pr = st.r; doneCount = st.s * 3 + st.e; active = doneCount; roundsDone = st.r; }
    else if (st.type === 'break' && st.kind === 'set') { pr = st.r; doneCount = st.s * 3; roundsDone = st.r; }
    else if (st.type === 'break') { pr = st.r - 1; doneCount = 9; roundsDone = st.r; }
    else { pr = 2; doneCount = 9; roundsDone = 3; }

    const key = `${idx}|${paused}`;
    if (key !== shownKey) {
      shownKey = key;
      document.body.dataset.phase = st.type === 'work' ? CATS[st.e].key : st.type;
      $('#play').classList.toggle('paused', paused);
      $('#roundDots').innerHTML = [0, 1, 2].map((i) =>
        `<span class="rdot ${i < roundsDone ? 'full' : ''} ${i === roundsDone ? 'cur' : ''}">${PAW}</span>`).join('');
      $('#roundLabel').textContent = st.type === 'done' ? 'All 3 rounds!'
        : st.type === 'break' && st.kind === 'round' ? `Round ${st.r} done` : `Round ${pr + 1} of 3`;
      $('#chip').textContent = timed ? `Set ${st.s + 1} of 3 · ${SET_SECONDS[st.s]}s per exercise`
        : st.type === 'break' && st.kind === 'set' ? `Next: set ${st.s + 1} · ${SET_SECONDS[st.s]}s per exercise` : '';
      $('#pie').innerHTML = pieSVG(doneCount, active, st.type);
      renderUpNext(st);
      renderControls(st, paused);
    }

    // Per-frame bits
    const phase = $('#phase'), count = $('#count'), ex = $('#exName');
    count.classList.toggle('small', !timed);
    if (timed) {
      const rem = Math.max(0, st.dur - elapsed());
      const label = paused ? 'Paused' : st.type === 'ready' ? 'Get ready' : CATS[st.e].label;
      if (phase.dataset.label !== label + st.e) {
        phase.dataset.label = label + st.e;
        phase.innerHTML = `${badge(st.e)}<span>${label}</span>`;
      }
      count.textContent = Math.ceil(rem);
      const x = exOf(st);
      if (ex.dataset.name !== x.name) { ex.dataset.name = x.name; ex.innerHTML = `${esc(x.name)}${wtIcon(x)}`; }
      // Tip line: form cue, plus weight / side reminders.
      let tip = esc(x.tip || ''), hot = false;
      if (st.type === 'ready' && x.weight === 'required') tip = `<b>Grab your weights</b> · ${tip}`;
      if (x.sides) {
        const into = st.dur - rem;
        if (st.type === 'ready') tip = `<b>Both sides</b>, switch halfway · ${tip}`;
        else if (into < st.dur / 2) tip = `<b>First side</b> · ${tip}`;
        else if (into < st.dur / 2 + 3) { tip = '⇄ Switch sides!'; hot = true; }
        else tip = `<b>Second side</b> · ${tip}`;
      }
      setTip(tip, hot);
      if (st.type === 'work') {
        const p = Math.min(1, (st.dur - rem) / st.dur);
        const [a0, a1] = ANG[active];
        const prog = $('#prog');
        if (prog) prog.setAttribute('d', arc(a0, a0 + (a1 - a0) * p));
      }
    } else if (st.type === 'break') {
      setTip('', false);
      ex.dataset.name = '';
      phase.dataset.label = '';
      phase.textContent = st.kind === 'set' ? 'Break' : `Round ${st.r} done!`;
      count.textContent = mmss((Date.now() - stepStart) / 1000);
      ex.textContent = st.kind === 'set' ? `Set ${st.s} done 🎉` : 'Good dog! 🐶';
    } else {
      setTip('', false);
      ex.dataset.name = '';
      phase.dataset.label = '';
      phase.textContent = 'All done!';
      count.textContent = '🏆';
      ex.textContent = mmss((finishedAt - startedAt) / 1000);
    }
  }

  function setTip(html, hot) {
    const el = $('#tip');
    if (el.dataset.html === html) return;
    el.dataset.html = html;
    el.innerHTML = html;
    el.classList.toggle('hot', hot);
  }

  function renderUpNext(st) {
    const el = $('#upnext');
    if (st.type === 'ready' || st.type === 'work') {
      let next = null;
      // Skip past this exercise's own work step when we're still getting ready for it.
      for (let j = idx + (st.type === 'ready' ? 2 : 1); j < steps.length; j++) {
        if (steps[j].type !== 'ready') { next = steps[j]; break; }
      }
      if (next.type === 'work') el.innerHTML = `<span class="label">Up next:</span> <b>${esc(nameOf(next))}</b>${wtIcon(exOf(next))}`;
      else if (next.type === 'done') el.innerHTML = '<b>Last one, finish strong! 💪</b>';
      else el.innerHTML = `<span class="label">Up next:</span> <b>${next.kind === 'round' ? 'a longer break' : 'a short break'}</b>`;
    } else if (st.type === 'break' && st.kind === 'set') {
      el.innerHTML = `<span class="label">Same three, ${SET_SECONDS[st.s]} seconds each</span>${pills(st.r)}`;
    } else if (st.type === 'break') {
      el.innerHTML = `<span class="label">Round ${st.r + 1}: new exercises</span>${pills(st.r)}`;
    } else {
      el.innerHTML = '<b>Sophie is so proud of you! 🐾</b>';
    }
  }

  function renderControls(st, paused) {
    const el = $('#controls');
    if (st.type === 'ready' || st.type === 'work') {
      el.innerHTML = `
        <button class="big ${paused ? '' : 'alt'}" data-act="pause">${paused ? '▶ Resume' : '❚❚ Pause'}</button>
        <button class="skip" data-act="skip" aria-label="Skip">Skip ⏭</button>`;
    } else if (st.type === 'break') {
      el.innerHTML = st.kind === 'set'
        ? `<button class="big" data-act="continue">Start set ${st.s + 1}<small>${SET_SECONDS[st.s]} seconds per exercise</small></button>`
        : `<button class="big" data-act="continue">Start round ${st.r + 1}<small>${esc(settings.rounds[st.r].join(' · '))}</small></button>`;
    } else {
      el.innerHTML = '<button class="big" data-act="home">Back home 🏠</button>';
    }
  }

  function confetti() {
    const box = $('#confetti');
    const colors = CATS.map((c) => c.color).concat('#264653', '#F4A261');
    for (let i = 0; i < 70; i++) {
      const d = document.createElement('span');
      const c = colors[i % colors.length];
      d.style.left = `${Math.random() * 100}%`;
      if (i % 4 === 0) { // every fourth piece is a little paw print
        d.className = 'cf paw';
        d.innerHTML = PAW.replace('<svg ', `<svg fill="${c}" `);
      } else {
        d.className = 'cf';
        d.style.background = c;
      }
      d.style.animationDuration = `${2 + Math.random() * 2.5}s`;
      d.style.animationDelay = `${Math.random() * 0.6}s`;
      box.appendChild(d);
    }
    setTimeout(() => { box.innerHTML = ''; }, 5500);
  }

  // ---------- Android back button / visibility ----------
  // Called by the Android wrapper. Returns true when the app handled it.
  window.onAndroidBack = function () {
    if (modalOpen()) { closeModal(); return true; }
    if (playing) { confirmEnd(); return true; }
    return false;
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && playing) { requestWake(); tick(); }
  });

  renderHome();
})();
