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
  // Add ?fast to the URL to run 10x speed when testing.
  const SPEED = /[?&]fast/.test(location.search) ? 10 : 1;
  const STORE = 'puppy-playtime-v1';

  // ---------- Settings ----------
  function loadSettings() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { /* first run */ }
    return {
      readySecs: [3, 5, 10].includes(s.readySecs) ? s.readySecs : 5,
      sound: s.sound !== false,
      rounds: DEFAULT_ROUNDS.map((names, r) => names.map((n, e) => {
        const saved = s.rounds && s.rounds[r] && s.rounds[r][e];
        return typeof saved === 'string' && saved.trim() ? saved.trim() : n;
      })),
    };
  }
  const settings = loadSettings();
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(settings)); } catch (e) { /* storage unavailable */ }
  }
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

  // ---------- Sound ----------
  let ac = null, master = null;
  function audio() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      const comp = ac.createDynamicsCompressor();
      master = ac.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, start, dur, gain, type) {
    const ctx = audio();
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    const t = ctx.currentTime + start;
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  // A soft bell: fundamental plus a couple of quiet overtones.
  function bell(f, start, dur, gain) {
    tone(f, start, dur, gain);
    tone(f * 2, start, dur * 0.6, gain * 0.3);
    tone(f * 3, start, dur * 0.3, gain * 0.1);
  }
  const SOUNDS = {
    tick: () => bell(880, 0, 0.12, 0.15),
    go: () => { bell(660, 0, 0.15, 0.25); bell(990, 0.12, 0.35, 0.3); },
    done: () => { bell(784, 0, 0.35, 0.3); bell(988, 0.12, 0.35, 0.3); bell(1175, 0.24, 0.6, 0.3); },
    setDone: () => {
      [523, 659, 784].forEach((f, i) => bell(f, i * 0.12, 0.4, 0.3));
      bell(1047, 0.36, 0.9, 0.32);
    },
    finale: () => {
      [523, 659, 784, 1047].forEach((f, i) => bell(f, i * 0.12, 0.3, 0.28));
      bell(784, 0.6, 0.25, 0.28);
      bell(1047, 0.75, 1.1, 0.34);
    },
  };
  function sfx(name) { if (settings.sound) try { SOUNDS[name](); } catch (e) { /* no audio */ } }
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
          <li>${badge(e)}<span class="name">${esc(n)}</span><span class="tag">${CATS[e].label}</span></li>`).join('')}
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
    if (settings.sound) sfx('done');
  });
  $('#startBtn').addEventListener('click', startWorkout);

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
    const cb = modalOnClose;
    modalOnClose = null;
    if (cb) cb();
  }
  const modalOpen = () => !$('#modal').classList.contains('hidden');
  $('#modal').addEventListener('click', (ev) => { if (ev.target.id === 'modal') closeModal(); });

  function openEdit(r) {
    openModal(`
      <h2>Round ${r + 1} exercises</h2>
      ${settings.rounds[r].map((n, e) => `
        <label class="field">
          <span>${badge(e, 'sm')}${CATS[e].label}</span>
          <input type="text" value="${esc(n)}" data-e="${e}" maxlength="30" autocomplete="off">
        </label>`).join('')}
      <button class="linkbtn" id="resetRound">Reset to defaults</button>
      <div class="btns">
        <button class="big alt" id="cancelEdit">Cancel</button>
        <button class="big" id="saveEdit">Save</button>
      </div>`);
    $('#cancelEdit').onclick = closeModal;
    $('#resetRound').onclick = () => {
      document.querySelectorAll('#sheet input').forEach((inp) => { inp.value = DEFAULT_ROUNDS[r][+inp.dataset.e]; });
    };
    $('#saveEdit').onclick = () => {
      document.querySelectorAll('#sheet input').forEach((inp) => {
        const e = +inp.dataset.e;
        settings.rounds[r][e] = inp.value.trim() || DEFAULT_ROUNDS[r][e];
      });
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
      if (st.type === 'ready') {
        const c = Math.ceil(rem);
        if (c >= 1 && c <= 3 && c !== lastBeep) { lastBeep = c; sfx('tick'); }
      }
      if (rem > 0) break;
      advance(true);
    }
    render();
  }

  function advance(natural) {
    const st = cur(), next = steps[idx + 1];
    if (st.type === 'work') {
      if (next.type === 'done' || (next.type === 'break' && next.kind === 'round')) { sfx('finale'); buzz(800); }
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
    if (act === 'pause') togglePause();
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
      `<span class="pill">${badge(e)}${esc(n)}</span>`).join('')}</div>`;
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
      ex.textContent = nameOf(st);
      if (st.type === 'work') {
        const p = Math.min(1, (st.dur - rem) / st.dur);
        const [a0, a1] = ANG[active];
        const prog = $('#prog');
        if (prog) prog.setAttribute('d', arc(a0, a0 + (a1 - a0) * p));
      }
    } else if (st.type === 'break') {
      phase.dataset.label = '';
      phase.textContent = st.kind === 'set' ? 'Break' : `Round ${st.r} done!`;
      count.textContent = mmss((Date.now() - stepStart) / 1000);
      ex.textContent = st.kind === 'set' ? `Set ${st.s} done 🎉` : 'Good dog! 🐶';
    } else {
      phase.dataset.label = '';
      phase.textContent = 'All done!';
      count.textContent = '🏆';
      ex.textContent = mmss((finishedAt - startedAt) / 1000);
    }
  }

  function renderUpNext(st) {
    const el = $('#upnext');
    if (st.type === 'ready' || st.type === 'work') {
      let next = null;
      // Skip past this exercise's own work step when we're still getting ready for it.
      for (let j = idx + (st.type === 'ready' ? 2 : 1); j < steps.length; j++) {
        if (steps[j].type !== 'ready') { next = steps[j]; break; }
      }
      if (next.type === 'work') el.innerHTML = `<span class="label">Up next:</span> <b>${esc(nameOf(next))}</b>`;
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
