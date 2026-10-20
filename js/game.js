/* Who's on the Line? (مع من أتحدث؟) — game logic. No server, no AI: runs on GitHub Pages. */
(function () {
  'use strict';

  // ---------------- Config ----------------
  const SHIFT_SECONDS = 300;
  const MAX_Q = 6;
  const CHANCES = 3;
  const CHIPS_SHOWN = 3;
  const ROLES = ['scammer', 'attacker', 'stealer', 'legal'];
  const STORE = 'wotl_scores_v1';
  const PREFS = 'wotl_prefs_v1';

  // ---------------- State ----------------
  const S = {
    ui: 'en', vis: 'en', sound: true, music: true, office: true, voices: true,
    screen: 'title', prev: null,
    player: { name: '', job: '' },
    timeLeft: SHIFT_SECONDS, running: false, chances: CHANCES, score: 0,
    history: [], enc: null, n: 0, used: [], lastRoles: [], endReason: '', modal: null
  };
  try { Object.assign(S, JSON.parse(localStorage.getItem(PREFS) || '{}')); } catch (e) { /* ignore */ }
  const savePrefs = () => { try { localStorage.setItem(PREFS, JSON.stringify({ ui: S.ui, vis: S.vis, sound: S.sound, music: S.music, office: S.office, voices: S.voices })); } catch (e) { /* ignore */ } };
  const AUDIO = window.AUDIO;
  AUDIO.set(S);

  const stage = document.getElementById('stage');
  const T = () => window.STRINGS[S.ui];
  const L = (pair) => Array.isArray(pair) ? (S.vis === 'ar' ? pair[1] : pair[0]) : pair; // visitor language
  const U = (pair) => Array.isArray(pair) ? (S.ui === 'ar' ? pair[1] : pair[0]) : pair;  // interface language
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (s) => String(s).replace(/\[\[|\]\]/g, '');
  const pad2 = (n) => (n < 10 ? '0' : '') + n;
  const fmtTime = (s) => Math.floor(Math.max(0, s) / 60) + ':' + pad2(Math.max(0, s) % 60);
  const encId = (n) => 'A-' + pad2(n);
  const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const roleName = (r) => T().roleNames[r];
  const visCls = () => (S.vis === 'ar' ? ' vis-ar' : '');

  // ---------------- Scaling ----------------
  function fit() {
    const s = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    const x = (window.innerWidth - 1600 * s) / 2, y = (window.innerHeight - 900 * s) / 2;
    stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }
  window.addEventListener('resize', fit);

  // ---------------- Sound (Web Audio, no files) ----------------
  // One AudioContext shared with the music / office ambience in audio.js
  const ac = () => AUDIO.ctx();
  function tone(freq, dur, type, vol, delay) {
    if (!S.sound) return; const a = ac(); if (!a) return;
    const t0 = a.currentTime + (delay || 0);
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  // Visitors you can hear: in person and on the phone (chats and emails stay silent)
  function say(text, e) {
    if (e.channel === 'person' || e.channel === 'phone') AUDIO.speak(text, S.vis, e.who);
  }
  function noise(dur, vol) {
    if (!S.sound) return; const a = ac(); if (!a) return;
    const b = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = vol || 0.6;
    s.buffer = b; s.connect(f).connect(g).connect(a.destination); s.start();
  }
  const SFX = {
    bell: () => { tone(1318, 1.2, 'sine', 0.25); tone(1976, 0.8, 'sine', 0.12, 0.01); },
    stamp: () => { noise(0.18, 0.9); tone(90, 0.15, 'sine', 0.4); },
    pop: () => tone(660, 0.08, 'triangle', 0.12),
    send: () => tone(880, 0.06, 'triangle', 0.1),
    ok: () => { tone(523, 0.14, 'triangle', 0.2); tone(659, 0.14, 'triangle', 0.2, 0.12); tone(784, 0.3, 'triangle', 0.22, 0.24); },
    bad: () => { tone(196, 0.25, 'sawtooth', 0.12); tone(147, 0.4, 'sawtooth', 0.12, 0.2); },
    click: () => tone(400, 0.04, 'square', 0.05),
    ring: () => { for (let i = 0; i < 6; i++) { tone(440, 0.05, 'square', 0.06, i * 0.1); tone(480, 0.05, 'square', 0.06, i * 0.1 + 0.05); } }
  };
  let ringTimer = null;
  function startRing() { stopRing(); SFX.ring(); ringTimer = setInterval(SFX.ring, 1800); }
  function stopRing() { if (ringTimer) clearInterval(ringTimer); ringTimer = null; }

  // ---------------- Timer ----------------
  setInterval(function () {
    if (!S.running) return;
    const playing = (S.screen === 'counter' || S.screen === 'remote') && S.enc && !S.enc.typing && !S.modal;
    if (!playing) return;
    S.timeLeft -= 1;
    const c = document.getElementById('clock');
    if (c) {
      c.querySelector('.time').textContent = fmtTime(S.timeLeft);
      c.style.background = clockBg();
      c.classList.toggle('low', S.timeLeft <= 30);
    }
    if (S.timeLeft <= 0) endShift('time');
  }, 1000);

  // ---------------- Scene pieces ----------------
  const BUNT = ['#c8102e', '#f4f1ea', '#00843d'];
  function bunting(dim) {
    let h = '<div class="topshade"></div><div class="string"></div><div class="bunting"' + (dim ? ' style="opacity:.55"' : '') + '>';
    for (let i = 0; i < 24; i++) h += '<span style="background:' + BUNT[i % 3] + ';transform:rotate(' + (-4.5 + (9 * i) / 23).toFixed(1) + 'deg)"></span>';
    return h + '</div>';
  }
  const logo = (big) => '<div class="logo-plate' + (big ? ' big' : '') + '"><img src="assets/ahlibank-logo.png" alt="ahlibank"></div>';
  const led = (text, cls) => '<div class="led ' + (cls || '') + '">' + esc(text) + '</div>';
  function windowFrame(inner, cls) {
    return '<div class="window ' + (cls || '') + '"><span class="screw tl"></span><span class="screw tr"></span><span class="screw bl"></span><span class="screw br"></span><div class="glass">' + inner + '</div></div>';
  }
  function lobby(opts) {
    opts = opts || {};
    let h = '<div class="floor"></div><span class="lamp" style="left:120px"></span><span class="lamp" style="left:330px"></span><span class="lamp" style="left:540px"></span>';
    if (opts.wide) h += '<span class="lamp" style="left:750px"></span>';
    h += '<div class="banner">' + esc(T().happyYD) + '</div><div class="rings"><span></span><span></span></div>';
    if (!opts.noProps) {
      h += '<div class="plant"><div class="leaves"><span style="left:8px;top:20px;width:40px;height:90px;background:#2f7a52;transform:rotate(-25deg)"></span><span style="left:40px;top:10px;width:40px;height:100px;background:#3d9466;transform:rotate(20deg)"></span><span style="left:24px;top:0;width:36px;height:110px;background:#2a6b48"></span></div><div class="pot"></div></div>';
      h += '<div class="atm"></div>';
    }
    if (opts.sticker) h += '<div class="sticker">' + T().idSticker + '</div><div class="grille"></div>';
    h += '<div class="reflect"></div>';
    return h;
  }
  function clockBg() {
    const pct = Math.max(0, Math.min(100, (S.timeLeft / SHIFT_SECONDS) * 100));
    return 'conic-gradient(rgba(201,163,28,.65) 0 ' + pct.toFixed(1) + '%, transparent 0), #f6edc8';
  }
  function leftWall(hideMemo) {
    let h = '<div class="clock' + (S.timeLeft <= 30 ? ' low' : '') + '" id="clock" style="background:' + clockBg() + '"><span class="tick t1"></span><span class="tick t2"></span><span class="tick t3"></span><span class="tick t4"></span><span class="time">' + fmtTime(S.timeLeft) + '</span><span class="lbl">' + esc(T().shiftLeft) + '</span></div>';
    h += '<div class="badge26"><b>26 OCT</b><span>' + esc(T().youthDay) + '</span></div>';
    if (!hideMemo) {
      h += '<div class="memo"><span class="tape"></span><h4>' + esc(T().memoTitle) + '</h4>';
      T().memo.forEach(function (m) { h += '<span class="row"><span class="box"></span>' + esc(m) + '</span>'; });
      h += '</div>';
    }
    return h;
  }
  function chancesHtml(cracking) {
    let h = '<div class="chances"><span class="lbl">' + esc(T().chances) + '</span><div class="list">';
    for (let i = 0; i < CHANCES; i++) {
      const lost = i >= S.chances;
      h += '<div class="ring2' + (lost ? ' lost' : '') + (cracking && i === S.chances ? ' cracking' : '') + '"><span></span><span></span></div>';
    }
    return h + '</div></div>';
  }
  function receiptHtml(highlightLast) {
    let lines = '';
    S.history.forEach(function (h, i) {
      const hl = highlightLast && i === S.history.length - 1 ? ' hl' : '';
      if (h.correct) lines += '<span class="line' + hl + '"><span>' + h.id + ' ' + ROLE_EN[h.role] + '</span><span>+' + h.pts + '</span></span>';
      else if (h.guess) {
        lines += '<span class="line' + hl + '"><span>' + h.id + ' ' + ROLE_EN[h.guess] + '?</span><span class="neg">-1 ◎</span></span>';
        lines += '<span class="line sub"><span>&nbsp;&nbsp;(was ' + ROLE_EN[h.role] + ')</span><span></span></span>';
      }
    });
    if (S.enc && !S.enc.done) lines += '<span class="line"><span>' + encId(S.n) + ' ......</span><span>?</span></span>';
    const op = (S.player.name || 'GUEST').trim().split(/\s+/)[0].toUpperCase().slice(0, 10);
    return '<div class="printer-slot"></div><div class="receipt"><span class="c">AHLIBANK · COUNTER 03</span><span class="c">OPERATOR: ' + esc(op) + '</span><span class="dash">- - - - - - - - - - - -</span><div class="lines">' + lines + '</div><span class="dash">- - - - - - - - - - - -</span><span class="score-l">SCORE</span><span class="score">' + S.score + '</span></div>';
  }
  function rightWall(opts) {
    opts = opts || {};
    return '<button class="pausebtn" data-act="pause" aria-label="Pause"><i class="ph-fill ph-pause"></i></button>' + chancesHtml(opts.cracking) + receiptHtml(opts.highlight);
  }
  const desk = () => '<div class="brass"></div><div class="desk"></div><div class="tea"><div class="cup"></div><div class="saucer"></div></div>';
  const vignette = () => '<div class="vignette"></div>';
  // Back / home buttons (arrow flips for Arabic)
  function navBtn(actName, label, style, icon) {
    const ic = icon || (S.ui === 'ar' ? 'arrow-right' : 'arrow-left');
    return '<button class="btn-blue navbtn" data-act="' + actName + '" style="' + (style || '') + '"><i class="ph-bold ph-' + ic + '"></i>' + esc(label) + '</button>';
  }
  // Music / office sounds / visitor voices / effects switches
  const AUDIO_KEYS = [['music', 'music-notes'], ['office', 'buildings'], ['voices', 'user-sound'], ['sound', 'speaker-high']];
  function audioToggles() {
    const t = T();
    return AUDIO_KEYS.map(function (k) {
      const label = k[0] === 'sound' ? t.effects : t[k[0]];
      return '<button class="atog' + (S[k[0]] ? ' on' : '') + '" data-act="audio" data-k="' + k[0] + '" aria-pressed="' + !!S[k[0]] + '"><i class="ph-duotone ph-' + (S[k[0]] ? k[1] : 'speaker-slash') + '"></i><span>' + esc(label) + '</span></button>';
    }).join('');
  }

  function stampsHtml(usedRole) {
    let h = '';
    if (usedRole) {
      h += '<span class="used-lbl">' + esc(T().stampUsed) + '</span><div class="stamps">';
      ROLES.forEach(function (r) {
        if (r === usedRole) h += '<div class="stamp-slot">' + esc(T().onGlass) + '</div>';
        else h += '<div class="stamp" style="opacity:.55;pointer-events:none"><span class="knob"></span><span class="neck"></span><div class="rubber ink-' + r + '"><b>' + ROLE_EN[r] + '</b><small>' + ROLE_AR[r] + '</small></div></div>';
      });
      return h + '</div>';
    }
    h += '<span class="stamp-label">' + esc(T().stampYour) + '</span><div class="stamps">';
    ROLES.forEach(function (r) {
      h += '<button class="stamp" data-act="stamp" data-role="' + r + '" aria-label="' + ROLE_EN[r] + '"><span class="knob"></span><span class="neck"></span><div class="rubber ink-' + r + '"><b>' + ROLE_EN[r] + '</b><small>' + ROLE_AR[r] + '</small></div></button>';
    });
    return h + '</div>';
  }

  // Turn "text with [[flags]]" into tappable word spans
  function tappable(text, mi) {
    const parts = String(text).split(/(\[\[[^\]]+\]\])/);
    let out = '', k = 0;
    parts.forEach(function (p) {
      if (!p) return;
      if (p.indexOf('[[') === 0) {
        const key = mi + ':' + (k++);
        const on = S.enc && S.enc.flags[key] ? ' flagged' : '';
        out += '<span class="w' + on + '" data-act="flag" data-k="' + key + '" data-real="1">' + esc(p.slice(2, -2)) + '</span>';
      } else {
        p.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { out += w; return; }
          const key = mi + ':' + (k++);
          const on = S.enc && S.enc.flags[key] ? ' flagged' : '';
          out += '<span class="w' + on + '" data-act="flag" data-k="' + key + '" data-real="0">' + esc(w) + '</span>';
        });
      }
    });
    return out;
  }

  // ---------------- Encounter selection ----------------
  function poolFor(job) {
    const all = window.ENCOUNTERS;
    const fit = job === 'any' ? all : all.filter(function (e) { return e.jobs.indexOf(job) >= 0; });
    return fit.length >= 6 ? fit : all;
  }
  function pickEncounter() {
    let pool = poolFor(S.player.job).filter(function (e) { return S.used.indexOf(e.id) < 0; });
    if (!pool.length) pool = window.ENCOUNTERS.filter(function (e) { return S.used.indexOf(e.id) < 0; });
    if (!pool.length) { S.used = S.used.slice(-2); pool = window.ENCOUNTERS.filter(function (e) { return S.used.indexOf(e.id) < 0; }); }
    let roles = ROLES.filter(function (r) { return pool.some(function (e) { return e.role === r; }); });
    const last2 = S.lastRoles.slice(-2);
    if (last2.length === 2 && last2[0] === last2[1]) {
      const alt = roles.filter(function (r) { return r !== last2[0]; });
      if (alt.length) roles = alt;
    }
    // Make sure every player meets at least one genuine customer in the first four
    if (S.n === 3 && S.lastRoles.indexOf('legal') < 0 && roles.indexOf('legal') >= 0) roles = ['legal'];
    const role = rnd(roles);
    const e = rnd(pool.filter(function (x) { return x.role === role; }));
    S.used.push(e.id); S.lastRoles.push(e.role);
    return e;
  }
  function nextEncounter() {
    if (S.chances <= 0 || S.timeLeft <= 0) { endShift(S.chances <= 0 ? 'chances' : 'time'); return; }
    const e = pickEncounter();
    S.n += 1;
    S.enc = {
      e: e, msgs: [], used: [], q: 0, verified: false, flags: {}, rows: e.card.rows.slice(), typing: false,
      offset: 0, entered: false, done: false
    };
    S.enc.msgs.push({ from: 'them', text: L(e.open) });
    if (e.channel === 'phone') { S.screen = 'incoming'; render(); startRing(); }
    else if (e.channel === 'person') {
      S.screen = 'counter'; render(); SFX.bell();
      const E = S.enc;
      setTimeout(function () { if (S.enc === E && S.screen === 'counter' && !E.q) say(L(e.open), e); }, 900);
    }
    else { S.screen = 'remote'; render(); SFX.pop(); }
  }

  // ---------------- Actions ----------------
  function ask(aid) {
    const E = S.enc; if (!E || E.typing || E.done || E.q >= MAX_Q || E.used.indexOf(aid) >= 0) return;
    const A = window.ACTIONS[aid]; const reply = E.e.acts[aid];
    E.used.push(aid); E.q += 1; if (A.verify) E.verified = true;
    E.msgs.push({ from: 'me', text: L(A.say) });
    E.typing = true; E.offset = 0; SFX.send(); render();
    const r = Array.isArray(reply) ? { say: reply } : reply;
    const delay = Math.min(1700, 650 + strip(L(r.say)).length * 10);
    setTimeout(function () {
      if (S.enc !== E) return;
      E.msgs.push({ from: 'them', text: L(r.say) });
      if (r.reveal) r.reveal.forEach(function (row) { E.rows.push(row.concat(row.length < 3 ? [0] : []).concat(['new'])); });
      E.typing = false; SFX.pop(); render();
      say(L(r.say), E.e);
    }, delay);
  }
  function toggleFlag(el) {
    const E = S.enc; if (!E || E.done) return;
    const k = el.getAttribute('data-k');
    if (E.flags[k]) delete E.flags[k]; else E.flags[k] = el.getAttribute('data-real') === '1' ? 'real' : 'other';
    el.classList.toggle('flagged', !!E.flags[k]);
    SFX.click();
    const c = document.getElementById('flagcount'); if (c) c.textContent = Object.keys(E.flags).length;
  }
  function stamp(role, btn) {
    const E = S.enc; if (!E || E.typing || E.done) return;
    if (btn) btn.classList.add('press');
    SFX.stamp();
    setTimeout(function () { resolve(role); }, 160);
  }
  function resolve(guess) {
    const E = S.enc; if (E.done) return; E.done = true;
    AUDIO.stopSpeech();
    const correct = guess === E.e.role;
    const realHit = Object.keys(E.flags).filter(function (k) { return E.flags[k] === 'real'; }).length;
    const bd = [];
    let pts = 0;
    if (correct) {
      pts = 100; bd.push(['correct', 100]);
      if (E.q <= 3) { pts += 50; bd.push(['speed', 50]); }
      if (E.verified) { pts += 20; bd.push(['papers', 20]); }
      const fp = Math.min(3, realHit) * 10; if (fp) { pts += fp; bd.push(['flagsPts', fp]); }
      S.score += pts;
    } else {
      S.chances -= 1;
    }
    S.history.push({ id: encId(S.n), e: E.e, role: E.e.role, guess: guess, correct: correct, pts: pts, bd: bd, msgs: E.msgs.slice(), realHit: realHit, q: E.q });
    S.screen = 'verdict'; render(true);
    stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
    setTimeout(function () { correct ? SFX.ok() : SFX.bad(); }, 250);
  }
  function endShift(reason) {
    stopRing(); AUDIO.stopSpeech();
    if (S.screen === 'over') return;
    S.running = false; S.endReason = reason || '';
    if (S.enc && !S.enc.done) {
      S.enc.done = true;
      S.history.push({ id: encId(S.n), e: S.enc.e, role: S.enc.e.role, guess: null, correct: false, pts: 0, bd: [], msgs: S.enc.msgs.slice(), unresolved: true });
    }
    S.bonus = S.chances * 50;
    S.total = S.score + S.bonus;
    saveScore();
    S.modal = null;
    S.screen = 'over'; render();
  }

  // ---------------- Leaderboard store (this device) ----------------
  function loadScores() { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; } }
  function saveScore() {
    const list = loadScores();
    const right = S.history.filter(function (h) { return h.correct; }).length;
    S.savedAt = Date.now();
    list.push({ name: S.player.name || 'Guest', job: S.player.job, score: S.total, right: right, seen: S.history.length, date: todayKey(), t: S.savedAt });
    try { localStorage.setItem(STORE, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }
  function todayScores() {
    return loadScores().filter(function (s) { return s.date === todayKey(); }).sort(function (a, b) { return b.score - a.score || a.t - b.t; });
  }
  function rankToday() {
    const list = todayScores();
    const i = list.findIndex(function (s) { return s.t === S.savedAt; });
    return i >= 0 ? i + 1 : list.length;
  }
  function exportCsv() {
    const rows = [['date', 'time', 'name', 'job', 'score', 'right', 'visitors']];
    loadScores().forEach(function (s) { rows.push([s.date, new Date(s.t).toLocaleTimeString(), s.name, window.STRINGS.en.jobs[s.job] || s.job, s.score, s.right, s.seen]); });
    const csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'whos-on-the-line-scores-' + todayKey() + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
  }

  // ---------------- Screens ----------------
  function scrTitle() {
    const t = T();
    let q = '<div class="queue">' + ['dish', 'polo', 'abaya', 'shayla'].map(function (b) { return '<div>' + window.drawSilhouette(b) + '</div>'; }).join('') + '</div>';
    let inner = lobby({ noProps: true }) + q + '<div class="tt">' + esc(t.gameTitle) + '</div><div class="tt-ar">' + esc(window.STRINGS.en.gameTitleAr) + '</div><div class="tt-sub">' + esc(t.tagline) + '</div>';
    let h = bunting() + logo(true) + led(t.counterOpen) + '<div class="title-glass">' + windowFrame(inner, 'wide') + '</div>';
    h += '<div class="round-badge"><b>26 OCT</b><span>Youth Day</span><small>' + esc(window.STRINGS.en.youthDayAr) + '</small></div>';
    h += desk();
    h += '<div class="howto"><span class="tape"></span><h4>' + esc(t.howTitle) + '</h4><p>' + esc(t.howBody) + '</p></div>';
    h += '<div class="bell-wrap"><div class="bell" data-act="start" role="button" aria-label="' + esc(t.ringStart) + '"><span class="knob"></span><span class="dome"></span><span class="base"></span></div><button class="btn-gold bell-label" data-act="start">' + esc(t.ringStart) + '</button></div>';
    const top = todayScores().slice(0, 5);
    h += '<div class="top-receipt" data-act="board" role="button"><div style="text-align:center">TOP DETECTIVES<br>TODAY</div><div style="text-align:center;color:#999">- - - - - - - - -</div>';
    if (!top.length) h += '<div style="font-family:var(--hand);font-size:21px;margin-top:10px">' + esc(t.noScores) + '</div>';
    top.forEach(function (s, i) { h += '<div class="line"><span>' + (i + 1) + ' ' + esc(shortName(s.name)) + '</span><span>' + s.score + '</span></div>'; });
    h += '</div>';
    h += '<div class="soundboard"><h4>' + esc(t.audioTitle) + '</h4>' + audioToggles() + '</div>';
    h += '<div class="langplate"><button data-act="lang" data-v="en" class="' + (S.ui === 'en' ? 'on' : '') + '">EN</button><button data-act="lang" data-v="ar" class="' + (S.ui === 'ar' ? 'on' : '') + '">عربي</button></div>';
    return h + vignette();
  }
  function shortName(n) {
    const p = String(n).trim().split(/\s+/);
    return (p.length > 1 ? p[0] + ' ' + p[p.length - 1].charAt(0) + '.' : p[0]).toUpperCase().slice(0, 11);
  }

  function scrClockIn() {
    const t = T();
    let h = bunting(true) + logo() + windowFrame(lobby({}), '') + desk() + '<div class="dim"></div>';
    h += '<div class="clipboard"><div class="clip"></div><div class="sheet">';
    h += '<h2><span style="color:var(--navy);font-size:52px">' + esc(t.signIn) + '</span><span>' + esc(t.signInAr) + '</span></h2>';
    h += '<div class="meta">' + esc(t.signMeta) + '</div>';
    h += '<div class="namefield"><span>' + esc(t.name) + '</span><input id="nameInput" maxlength="24" autocomplete="off" placeholder="' + esc(t.namePh) + '" value="' + esc(S.player.name) + '"></div>';
    h += '<div class="post-l">' + esc(t.post) + '</div><div class="jobs">';
    window.JOB_ORDER.forEach(function (j) {
      const on = S.player.job === j;
      h += '<button class="job' + (on ? ' on' : '') + '" data-act="job" data-v="' + j + '"><span class="cb">' + (on ? '✓' : '') + '</span><span>' + esc(t.jobs[j]) + '</span></button>';
    });
    h += '</div><div class="langs"><span>' + esc(t.visitorsSpeak) + '</span>';
    h += '<label data-act="vis" data-v="en"><span class="cb">' + (S.vis === 'en' ? '✓' : '') + '</span>English</label>';
    h += '<label data-act="vis" data-v="ar"><span class="cb">' + (S.vis === 'ar' ? '✓' : '') + '</span><span style="font-family:Tajawal,sans-serif">عربي</span></label></div>';
    h += '<div class="fine">' + esc(t.fictional) + '</div></div></div>';
    const now = new Date();
    const hh = now.getHours() % 12, mm = now.getMinutes();
    h += '<div class="clockpanel"><div class="analog"><span class="h" style="transform:rotate(' + (hh * 30 + mm / 2) + 'deg)"></span><span class="m" style="transform:rotate(' + (mm * 6) + 'deg)"></span><span class="dot"></span></div>';
    h += '<div class="punchcard" id="punch">ahlibank<br><span id="punchName">' + esc((S.player.name || '').slice(0, 10)) + '</span><br>26 OCT<br>' + t.in + ': ' + pad2(now.getHours()) + ':' + pad2(mm) + '</div><div class="slot-bar"></div>';
    h += '<div class="tc-tag">' + esc(t.timeClock) + '</div><div class="tc-sub">' + esc(t.punch) + '</div></div>';
    const ready = S.player.name.trim() && S.player.job;
    h += '<button class="btn-gold clockin-btn" id="clockinBtn" data-act="clockin"' + (ready ? '' : ' disabled') + '>' + esc(t.clockIn) + '</button>';
    h += '<div class="need" id="need"' + (ready ? ' style="visibility:hidden"' : '') + '>' + esc(t.needName) + '</div>';
    h += navBtn('back', t.back, 'left:36px;top:140px;z-index:11');
    return h + vignette();
  }

  function scrBriefing() {
    const t = T();
    const bases = { scammer: 'dish', attacker: 'polo', stealer: 'abaya', legal: 'shayla' };
    let h = '<div class="cork"></div>' + bunting() + logo();
    h += '<div class="brief-title"><b>' + esc(t.briefTitle) + '</b><span>' + esc(t.briefTitleAr) + '</span></div><div class="polaroids">';
    ROLES.forEach(function (r) {
      h += '<div class="pol"><span class="pin"></span><div class="photo"><div class="sil">' + window.drawSilhouette(bases[r]) + '</div><span class="q">?</span></div>';
      h += '<div class="rn"><b class="c-' + r + '">' + esc(S.ui === 'ar' ? window.STRINGS.ar.roleNames[r] : ROLE_EN[r]) + '</b><span class="c-' + r + '">' + esc(S.ui === 'ar' ? ROLE_EN[r] : ROLE_AR[r]) + '</span></div>';
      h += '<p><b>' + esc(t.wants) + '</b> ' + esc(t.roleWants[r]) + '</p><p><b>' + esc(t.watch) + '</b> ' + esc(t.roleWatch[r]) + '</p></div>';
    });
    h += '</div><div class="rules-card"><span class="pin blue" style="left:50%"></span><div><b>1</b>' + esc(t.r1) + '</div><div><b>2</b>' + esc(t.r2) + '</div><div><b>3</b>' + esc(t.r3) + '</div><div><b>4</b>' + esc(t.r4) + '</div><div class="warn">' + esc(t.rWarn) + '</div></div>';
    h += '<div class="points-note"><span class="pin green"></span><h4>' + esc(t.points) + '</h4>' + esc(t.pts1) + '<br>' + esc(t.pts2) + '<br>' + esc(t.pts3) + '<br>' + esc(t.pts4) + '</div>';
    h += '<button class="btn-gold open-btn" data-act="open">' + esc(t.openCounter) + '</button>';
    h += navBtn('back', t.back, 'left:1250px;top:812px');
    return h;
  }

  function subtag(e) {
    return esc(U(window.CHANNELS[e.channel])) + ' · ' + esc(T().claims) + ' ' + esc(U(e.claim));
  }

  function scrIncoming() {
    const t = T(), e = S.enc.e;
    let inner = lobby({ sticker: true }) + '<div class="back-card"><b>' + esc(t.backMoment) + '</b><span>' + esc(t.onCall) + '</span></div>';
    let h = bunting() + logo() + leftWall() + led(t.ringing, 'green') + windowFrame(inner) + rightWall() + desk();
    h += '<div class="ringring">' + esc(t.ringRing) + '</div><span class="waves l"></span><span class="waves l2"></span><span class="waves r"></span><span class="waves r2"></span>';
    h += '<div class="phone"><div class="handset"></div><div class="body"><div class="lcd">INCOMING ·<br>LINE 2<br>' + esc(strip(L(e.line || ['+968 9••• ••••', '']))).split(' · ')[0] + '<br>' + esc((window.PLACES[e.place] || ['', ''])[0].toUpperCase()) + '</div><div class="keys">';
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].forEach(function (k) { h += '<span>' + k + '</span>'; });
    h += '</div></div></div>';
    h += '<div class="callcard"><h3>' + esc(t.customerN) + ' ' + S.n + '</h3><div class="m">' + esc(U(window.CHANNELS.phone)) + ' · ' + esc(U(window.PLACES[e.place])) + '</div><div class="s">' + esc(t.cantSee) + '</div><button class="btn-gold" data-act="answer">' + esc(t.answer) + '</button></div>';
    return h + vignette();
  }

  function evidenceCard(rows, title, stampWord, stampCls) {
    let h = '<div class="evidence"><h5>' + esc(U(title)).toUpperCase() + '</h5>';
    rows.forEach(function (r) {
      h += '<div class="r' + (r[2] ? ' bad' : '') + '"' + (r[3] === 'new' ? ' style="animation:slideUp .3s"' : '') + '><em>' + esc(U(r[0])) + ':</em> <b>' + esc(U(r[1])) + '</b></div>';
    });
    if (stampWord) h += '<span class="refused ' + (stampCls || '') + '">' + stampWord + '</span>';
    return h + '</div>';
  }

  function chipsHtml(isRemote) {
    const E = S.enc, t = T();
    if (E.q >= MAX_Q) return '<span class="make-call">' + esc(t.makeCall) + '</span>';
    const left = Object.keys(E.e.acts).filter(function (a) { return E.used.indexOf(a) < 0 && window.ACTIONS[a]; });
    if (!left.length) return '<span class="make-call">' + esc(t.makeCall) + '</span>';
    const n = isRemote ? 2 : CHIPS_SHOWN;
    const start = left.length > n ? (E.offset % left.length) : 0;
    const shown = [];
    for (let i = 0; i < Math.min(n, left.length); i++) shown.push(left[(start + i) % left.length]);
    let h = '';
    shown.forEach(function (a) {
      const A = window.ACTIONS[a];
      h += '<button class="chip" data-act="ask" data-a="' + a + '"' + (E.typing ? ' disabled' : '') + '><i class="ph-duotone ph-' + A.icon + '"></i>' + esc(U(A.chip)) + '</button>';
    });
    if (left.length > n) h += '<button class="chip more-q" data-act="moreq"' + (E.typing ? ' disabled' : '') + '><i class="ph-duotone ph-arrows-clockwise"></i>' + esc(t.otherQ) + '</button>';
    return h;
  }
  function pipsHtml() {
    let h = '<div class="pips">' + esc(T().questions);
    for (let i = 0; i < MAX_Q; i++) h += '<span class="' + (i < S.enc.q ? 'on' : '') + '"></span>';
    return h + '</div>';
  }

  function scrCounter() {
    const t = T(), E = S.enc, e = E.e;
    const firstView = !E.entered; E.entered = true;
    let who = '<div class="who" style="' + (firstView ? '' : 'animation:none') + '">' + window.drawCharacter(e.who) + '</div>';
    let inner = lobby({ sticker: true }) + who;
    if (E.q === 0 && e.arrive) inner += '<div class="scene-line' + visCls() + '">' + esc(L(e.arrive)) + '</div>';
    let h = bunting() + logo() + leftWall() + led(t.nowServing + ' ' + encId(S.n)) + windowFrame(inner) + rightWall() + desk();
    h += '<span class="desk-label" style="left:52px;top:614px">' + esc(t.evidence) + '</span>' + evidenceCard(E.rows, e.card.title);
    // Dialogue box
    const lastThem = E.msgs.map(function (m, i) { return [m, i]; }).filter(function (x) { return x[0].from === 'them'; }).pop();
    const lastMe = E.msgs.filter(function (m) { return m.from === 'me'; }).pop();
    h += '<div class="dialog"><div class="tags"><span class="nametag">' + esc(U(e.who.name)).toUpperCase() + ', ' + e.who.age + '</span><span class="subtag"><i class="ph-duotone ph-door-open"></i>' + subtag(e) + '</span></div>' + pipsHtml();
    if (lastMe) h += '<div class="you">' + esc(t.youAsked) + ' “' + esc(lastMe.text) + '”</div>';
    if (E.typing) h += '<p class="line"><span class="typing-dots"><span></span><span></span><span></span></span></p>';
    else h += '<p class="line' + visCls() + (strip(lastThem[0].text).length > 110 ? ' small' : '') + '">“' + tappable(lastThem[0].text, lastThem[1]) + '”</p>';
    h += '<span class="more">▼</span><span class="hint"><i class="ph-duotone ph-hand-pointing"></i>' + esc(t.flagHint) + ' · <span id="flagcount">' + Object.keys(E.flags).length + '</span> ' + esc(t.flagged) + '</span>';
    h += '<div class="chips">' + chipsHtml(false) + '</div></div>';
    h += stampsHtml();
    return h + vignette();
  }

  function recordPanel(rows, title, e) {
    let h = '<div class="record"><h5>' + esc(U(title)).toUpperCase() + '</h5>';
    rows.forEach(function (r) {
      h += '<div class="f' + (r[2] ? ' bad' : '') + '"' + (r[3] === 'new' ? ' style="animation:slideUp .3s"' : '') + '><em>' + esc(U(r[0])) + '</em><b>' + esc(U(r[1])) + '</b></div>';
    });
    return h + '</div>';
  }
  function scrRemote() {
    const t = T(), E = S.enc, e = E.e;
    E.entered = true;
    const ch = e.channel;
    let h = bunting() + logo() + leftWall() + led(ch === 'phone' ? t.connected : t.nowServing + ' ' + encId(S.n), ch === 'phone' ? 'green' : '') + windowFrame(lobby({})) + rightWall() + desk();
    h += '<div class="monitor"><span class="sticky">' + esc(t.otpNote) + '</span><span class="mlogo"><img src="assets/ahlibank-logo.png" alt=""></span><div class="mscreen"><div class="mchat">';
    const icons = { whatsapp: 'whatsapp-logo', email: 'envelope-simple', phone: 'phone-call', internal: 'chats-circle' };
    let av;
    if (ch === 'phone') av = '<div class="avatar unknown"><i class="ph-fill ph-phone"></i></div>';
    else if (ch === 'email') av = '<div class="avatar unknown" style="font-family:var(--disp);padding-top:6px">' + esc(U(e.who.name).charAt(0)) + '</div>';
    else av = '<div class="avatar"><div class="inner">' + window.drawCharacter(e.who) + '</div></div>';
    const subl = E.typing ? t.typing : strip(U(e.line || ['', '']));
    h += '<div class="mhead ch-' + ch + '">' + av + '<div class="nm"><b>' + esc(U(e.who.name)) + (ch === 'email' ? '' : ', ' + e.who.age) + '</b><span>' + esc(U(window.CHANNELS[ch])) + ' · ' + esc(subl) + '</span></div><i class="ph-duotone ph-' + icons[ch] + ' ico"></i></div>';
    h += '<div class="mbody" id="mbody">';
    h += '<div class="bubble sys">' + esc(T().claims) + ' ' + esc(U(e.claim)) + ' · ' + esc(T().flagHint) + '</div>';
    E.msgs.forEach(function (m, i) {
      if (m.from === 'me') h += '<div class="bubble me' + visCls() + '">' + esc(m.text) + '</div>';
      else h += '<div class="bubble' + visCls() + (ch === 'email' && i === 0 ? ' email-subj' : '') + '">' + tappable(m.text, i) + '</div>';
    });
    if (E.typing) h += '<div class="bubble"><span class="typing-dots"><span style="background:#4a5b75"></span><span style="background:#4a5b75"></span><span style="background:#4a5b75"></span></span></div>';
    h += '</div><div class="mfoot">' + chipsHtml(true) + '<span class="left">' + (MAX_Q - E.q) + ' ' + esc(t.leftOf) + ' · <span id="flagcount">' + Object.keys(E.flags).length + '</span> ⚑</span></div></div>';
    h += recordPanel(E.rows, e.card.title, e) + '</div></div>';
    h += '<div class="mstand"></div><div class="mfoot-base"></div><div class="keyboard">' + new Array(45).fill('<span></span>').join('') + '</div>';
    h += stampsHtml();
    return h + vignette();
  }

  function scrVerdict() {
    const t = T(), H = S.history[S.history.length - 1], e = H.e;
    const busted = H.correct && e.role !== 'legal';
    const notesPos = [
      { l: 430, tp: 150, r: -4 }, { l: 1040, tp: 210, r: 5 }, { l: 1030, tp: 392, r: -3 }
    ];
    let inner = lobby({}) + '<div class="who" style="animation:none">' + window.drawCharacter(e.who, { busted: busted, mood: e.role === 'legal' ? 'happy' : '' }) + '</div>';
    const g = H.guess;
    inner += '<div class="big-stamp b-' + g + (H.correct ? '' : ' crossed') + '"><b>' + ROLE_EN[g] + '</b><small>' + ROLE_AR[g] + '</small></div>';
    let h = bunting() + logo();
    h += led((H.correct ? t.caseClosed : t.wrongLed) + ' · ' + H.id, H.correct ? 'green' : 'red');
    h += windowFrame(inner) + rightWall({ highlight: true, cracking: !H.correct }) + desk();
    // notes
    const green = e.role === 'legal';
    e.flags.forEach(function (f, i) {
      const p = notesPos[i];
      h += '<div class="note' + (green ? ' green' : '') + '" style="left:' + p.l + 'px;top:' + p.tp + 'px;--r:' + p.r + 'deg;animation-delay:' + (0.35 + i * 0.18) + 's"><b>' + (i + 1) + '.</b>' + esc(U(f)) + '</div>';
    });
    // points
    h += '<div class="points-pop">';
    if (H.correct) {
      h += '<div class="n">+' + H.pts + '</div><div class="bd">';
      H.bd.forEach(function (b) { h += '<span>' + esc(t[b[0]]) + ' +' + b[1] + '</span>'; });
      if (H.q > 3) h += '<span class="z">' + esc(t.speed) + ' +0</span>';
      h += '</div>';
    } else {
      h += '<div class="n bad">0</div><div class="lost-chance">' + esc(t.lostChance) + '</div><div class="bd"><span>' + esc(t.youSaid) + ': <b class="c-' + g + '" style="font-weight:400">' + esc(roleName(g)) + '</b></span><span>' + (S.ui === 'ar' ? esc(t.truth) + ' ' + esc(U(e.who.name)) : esc(U(e.who.name)) + ' ' + esc(t.was)) + ': <b class="c-' + e.role + '" style="font-weight:400">' + esc(roleName(e.role)) + '</b></span></div>';
    }
    h += '</div>';
    // evidence stamped
    if (e.channel === 'person') {
      const word = H.correct ? (green ? t.approved : t.refused) : '';
      h += evidenceCard(e.card.rows, e.card.title, word, green ? 'approved' : '');
    }
    // dialogue
    const tagCls = H.correct ? 'ok' : 'bad';
    const tag = H.correct ? (green ? t.wellServed : t.caught) : t.wrongCall;
    const nm = esc(U(e.who.name));
    let line;
    const roleSpan = '<span class="c-' + e.role + '" style="filter:brightness(1.35)">' + esc(roleName(e.role)) + '</span>';
    if (S.ui === 'ar') line = esc(t.truth) + ' ' + nm + ': ' + roleSpan + '. ' + esc(U(e.sum));
    else line = nm + ' ' + (green ? 'was a <span class="c-legal" style="filter:brightness(1.35)">genuine customer</span>.' : 'was ' + (e.role === 'attacker' ? 'an ' : 'a ') + roleSpan + '.') + ' ' + esc(U(e.sum));
    h += '<div class="dialog"><div class="tags"><span class="nametag ' + tagCls + '">' + esc(tag) + '</span></div>';
    h += '<p class="line small' + (S.ui === 'ar' ? ' vis-ar' : '') + '" style="top:30px">' + line + '</p>';
    h += '<div class="exitline' + (S.ui === 'ar' ? ' vis-ar' : '') + '">' + nm + ': “' + esc(U(e.exit)) + '” ' + (e.exitNote ? '<em>' + esc(U(e.exitNote)) + '</em>' : '') + '</div>';
    const over = S.chances <= 0 || S.timeLeft <= 0;
    h += '<div class="verdict-actions"><button class="btn-blue" data-act="replay">' + esc(t.replay) + '</button><button class="btn-gold" data-act="next">' + (over ? esc(t.seeResults) : esc(t.callNext) + ' ' + encId(S.n + 1)) + '</button></div></div>';
    h += stampsHtml(g);
    return h + vignette();
  }

  function scrOver() {
    const t = T();
    let lines = '';
    S.history.forEach(function (H) {
      if (H.unresolved) lines += '<div class="line" style="color:#888"><span>' + H.id + ' ' + ROLE_EN[H.role] + ' …</span><span>0</span></div>';
      else if (H.correct) lines += '<div class="line"><span>' + H.id + ' ' + ROLE_EN[H.role] + '</span><span>+' + H.pts + '</span></div>';
      else lines += '<div class="line bad"><span>' + H.id + ' ' + ROLE_EN[H.role] + ' ✗</span><span>0</span></div>';
    });
    const rank = rankToday();
    const op = (S.player.name || 'GUEST').trim().split(/\s+/)[0].toUpperCase().slice(0, 12);
    const d = new Date();
    let h = bunting(true) + logo() + led(S.endReason === 'time' ? t.timeUp + ' · ' + t.shiftOver : t.shiftOver, 'red') + desk();
    h += '<div class="final-receipt"><div class="c">AHLIBANK · COUNTER 03</div><div class="c">OPERATOR: ' + esc(op) + '</div><div class="c">' + pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear() + ' · YOUTH DAY</div><div class="dash">- - - - - - - - - - - - - -</div><div class="lines">' + lines + '</div><div class="dash">- - - - - - - - - - - - - -</div>';
    h += '<div class="line"><span>' + t.chancesLeft + ' ' + S.chances + '</span><span>+' + S.bonus + '</span></div><div class="dash">- - - - - - - - - - - - - -</div>';
    h += '<div class="tot">' + t.total + '</div><div class="big">' + S.total + '</div><div class="rank">' + t.rank + ' #' + rank + ' ' + t.today + '</div><div class="barcode"></div></div>';
    const right = S.history.filter(function (x) { return x.correct; }).length;
    h += '<div class="folder-tab">' + esc(t.caseFiles) + ' · 26</div><div class="folder"><div class="head"><b>' + esc(right >= Math.ceil(S.history.length / 2) ? t.wellDone : t.goodTry) + ', ' + esc((S.player.name || '').split(' ')[0]) + '!</b><span>' + right + ' / ' + S.history.length + ' ' + esc(t.readRight) + '</span></div><div class="cases">';
    S.history.forEach(function (H) {
      const e = H.e;
      h += '<div class="case"><div class="av"><div class="inner">' + window.drawCharacter(e.who) + '</div></div>';
      h += '<div class="who"><b>' + esc(U(e.who.name)) + ', ' + e.who.age + '</b><em>' + esc(t.claimed) + ' ' + esc(U(e.claim)) + '</em><div>' + esc(U(e.key)) + '</div></div>';
      h += '<span class="tstamp b-' + e.role + '">' + ROLE_EN[e.role] + '</span>';
      if (H.unresolved) h += '<div class="res"><b class="no">…</b><div>' + esc(t.unresolved) + '</div></div>';
      else h += '<div class="res"><b class="' + (H.correct ? 'ok' : 'no') + '">' + (H.correct ? '✓ +' + H.pts : '✗ 0') + '</b><div>' + esc(t.youSaid) + ' ' + esc(roleName(H.guess)) + '</div></div>';
      h += '</div>';
    });
    h += '</div><div class="acts"><button class="btn-blue" data-act="gohome"><i class="ph-duotone ph-house"></i> ' + esc(t.home) + '</button><button class="btn-blue" data-act="board">' + esc(t.board) + '</button><button class="btn-blue" data-act="nextplayer">' + esc(t.nextPlayer) + '</button><button class="btn-gold" data-act="again">' + esc(t.playAgain) + '</button></div></div>';
    return h + vignette();
  }

  function scrBoard() {
    const t = T(), list = todayScores();
    let h = bunting() + logo(true) + led(t.live + ' · ' + list.length + ' ' + t.players, 'green');
    h += '<div class="prize-note">' + esc(t.prize) + '</div>';
    h += '<div class="honour"><h2>' + esc(t.bestToday) + '<span>' + esc(t.bestTodayAr) + '</span></h2>';
    if (!list.length) h += '<div class="empty-board">' + esc(t.noScores) + '</div>';
    else {
      h += '<div class="podium">';
      [1, 0, 2].forEach(function (i) {
        const s = list[i];
        const cls = 'pod p' + (i + 1) + (s ? '' : ' empty');
        const ini = s ? s.name.trim().split(/\s+/).map(function (p) { return p.charAt(0); }).slice(0, 2).join('').toUpperCase() : '';
        h += '<div class="' + cls + '"><div class="frame">' + esc(ini) + '<span class="medal">' + (i + 1) + '</span></div>';
        h += '<div class="nm">' + (s ? esc(s.name) : '&nbsp;') + '</div><div class="jb">' + (s ? esc(t.jobs[s.job] || '') : '&nbsp;') + '</div><div class="sc">' + (s ? s.score : '') + '</div></div>';
      });
      h += '</div><div class="plates">';
      list.slice(3, 9).forEach(function (s, i) { h += '<div class="plate"><span>' + (i + 4) + '</span><span>' + esc(s.name) + '</span><span class="s">' + s.score + '</span></div>'; });
      h += '</div>';
    }
    h += '</div>';
    // best by role
    const best = {};
    list.forEach(function (s) { if (!best[s.job]) best[s.job] = s; });
    const keys = window.JOB_ORDER.filter(function (j) { return best[j]; }).slice(0, 7);
    h += '<div class="role-note"><h4>' + esc(t.bestByRole) + '</h4>';
    if (!keys.length) h += '—';
    keys.forEach(function (j) { h += '<div>' + esc(t.jobs[j]) + ' · ' + esc(shortName(best[j].name)) + '</div>'; });
    h += '</div>';
    if (!kiosk) h += '<div class="lb-actions"><button class="btn-blue" data-act="csv"><i class="ph-duotone ph-download-simple"></i> ' + esc(t.exportCsv) + '</button><button class="btn-blue" data-act="reset" style="background:#7a2a2a;box-shadow:0 5px 0 #4a1515">' + esc(t.resetToday) + '</button></div><button class="btn-gold lb-back" data-act="home">' + esc(t.back) + '</button>';
    return h + vignette();
  }

  function scrPause() {
    const t = T();
    const base = ({ remote: scrRemote, incoming: scrIncoming, verdict: scrVerdict, counter: scrCounter }[S.prev] || scrCounter)();
    let h = base + '<div class="dim" style="z-index:12"></div><div class="break-sign" style="z-index:13"><div class="cords"></div><div class="board"><b>' + esc(t.onBreak) + '</b><span>' + esc(t.onBreakAr) + '</span></div><div class="planks">';
    h += '<button class="plank resume" data-act="resume"><i class="ph-fill ph-play"></i>' + esc(t.resume) + '</button>';
    h += '<button class="plank" data-act="howto"><i class="ph-duotone ph-question"></i>' + esc(t.howToPlay) + '</button>';
    h += '<div class="plank audio-row">' + audioToggles() + '</div>';
    h += '<button class="plank" data-act="langtoggle"><i class="ph-duotone ph-translate"></i>' + esc(t.language) + ': ' + (S.ui === 'ar' ? 'عربي' : 'English') + '</button>';
    h += '<button class="plank" data-act="quit"><i class="ph-duotone ph-house"></i>' + esc(t.mainMenu) + '</button>';
    h += '<button class="plank danger" data-act="end"><i class="ph-duotone ph-door-open"></i>' + esc(t.endEarly) + '</button></div></div>';
    return h;
  }

  function modalHtml() {
    const t = T();
    if (S.modal === 'howto') {
      return '<div class="modal" data-act="closemodal"><div class="card' + (S.ui === 'ar' ? ' rtl' : '') + '" data-stop="1"><button class="close" data-act="closemodal">✕</button><h3>' + esc(t.howToPlay) + '</h3><p>' + esc(t.howBody) + '</p><ol><li>' + esc(t.r1) + '</li><li>' + esc(t.r2) + '</li><li>' + esc(t.r3) + '</li><li>' + esc(t.r4) + '</li></ol><p>' + esc(t.pts1) + ' · ' + esc(t.pts2) + ' · ' + esc(t.pts3) + ' · ' + esc(t.pts4) + '</p><p><i>' + esc(t.rWarn) + '</i></p></div></div>';
    }
    if (S.modal === 'replay') {
      const H = S.history[S.history.length - 1];
      let b = '';
      H.msgs.forEach(function (m) { b += '<div class="bubble ' + (m.from === 'me' ? 'me' : '') + visCls() + '">' + esc(strip(m.text)) + '</div>'; });
      return '<div class="modal" data-act="closemodal"><div class="card" data-stop="1" style="background:#ece5dd"><button class="close" data-act="closemodal">✕</button><h3' + (S.ui === 'ar' ? ' class="rtl"' : '') + '>' + esc(t.transcript) + ' · ' + esc(U(H.e.who.name)) + '</h3><div class="transcript">' + b + '</div></div></div>';
    }
    if (S.modal && S.modal.confirm) {
      return '<div class="modal"><div class="card' + (S.ui === 'ar' ? ' rtl' : '') + '" style="width:640px;text-align:center"><p style="font-size:30px">' + esc(S.modal.confirm) + '</p><div style="display:flex;gap:20px;justify-content:center;margin-top:20px"><button class="btn-blue" data-act="closemodal">✕</button><button class="btn-gold" data-act="confirmyes">OK</button></div></div></div>';
    }
    return '';
  }

  // ---------------- Render ----------------
  function render() {
    const fn = {
      title: scrTitle, clockin: scrClockIn, briefing: scrBriefing, incoming: scrIncoming, counter: scrCounter,
      remote: scrRemote, verdict: scrVerdict, pause: scrPause, over: scrOver, board: scrBoard
    }[S.screen] || scrTitle;
    document.documentElement.lang = S.ui;
    stage.className = S.ui === 'ar' ? 'ar-ui' : '';
    stage.innerHTML = fn() + modalHtml();
    AUDIO.scene(S.screen);
    if (S.screen !== 'title' || S.modal) guardHistory();
    const mb = document.getElementById('mbody'); if (mb) mb.scrollTop = mb.scrollHeight;
    const ni = document.getElementById('nameInput');
    if (ni) {
      ni.addEventListener('input', function () {
        S.player.name = ni.value;
        const pn = document.getElementById('punchName'); if (pn) pn.textContent = ni.value.slice(0, 10);
        updateClockInBtn();
      });
      ni.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); act('clockin'); } });
      if (!S.player.name) setTimeout(function () { ni.focus(); }, 50);
    }
  }
  function updateClockInBtn() {
    const ready = S.player.name.trim() && S.player.job;
    const b = document.getElementById('clockinBtn'); if (b) b.disabled = !ready;
    const n = document.getElementById('need'); if (n) n.style.visibility = ready ? 'hidden' : 'visible';
  }

  function startShift() {
    S.timeLeft = SHIFT_SECONDS; S.chances = CHANCES; S.score = 0; S.history = []; S.enc = null; S.n = 0;
    S.used = []; S.lastRoles = []; S.running = true; S.endReason = ''; S.modal = null;
    nextEncounter();
  }

  let pendingConfirm = null;
  function act(a, el) {
    switch (a) {
      case 'start': SFX.bell(); S.screen = 'clockin'; render(); break;
      case 'lang': S.ui = el.getAttribute('data-v'); S.vis = S.ui; savePrefs(); render(); break;
      case 'board': S.prevBoard = S.screen; S.screen = 'board'; render(); break;
      case 'home': S.screen = S.prevBoard === 'over' ? 'over' : 'title'; render(); break;
      case 'job': S.player.job = el.getAttribute('data-v'); SFX.click(); render(); break;
      case 'vis': S.vis = el.getAttribute('data-v'); savePrefs(); SFX.click(); render(); break;
      case 'clockin':
        if (!S.player.name.trim() || !S.player.job) return;
        SFX.stamp(); S.player.name = S.player.name.trim(); S.screen = 'briefing'; render(); break;
      case 'open': SFX.bell(); startShift(); break;
      case 'answer': stopRing(); SFX.click(); S.screen = 'remote'; render(); say(L(S.enc.e.open), S.enc.e); break;
      case 'ask': ask(el.getAttribute('data-a')); break;
      case 'moreq': S.enc.offset += (S.screen === 'remote' ? 2 : CHIPS_SHOWN); SFX.click(); render(); break;
      case 'flag': toggleFlag(el); break;
      case 'stamp': stamp(el.getAttribute('data-role'), el); break;
      case 'next': S.modal = null; nextEncounter(); break;
      case 'replay': S.modal = 'replay'; render(); break;
      case 'pause': stopRing(); AUDIO.stopSpeech(); S.prev = S.screen; S.screen = 'pause'; render(); break;
      case 'resume': S.screen = S.prev; render(); if (S.screen === 'incoming') startRing(); break;
      case 'howto': S.modal = 'howto'; render(); break;
      case 'audio': {
        const k = el.getAttribute('data-k');
        S[k] = !S[k]; savePrefs(); AUDIO.set(S); render(); SFX.click(); break;
      }
      case 'back': goBack(); break;
      case 'gohome': goHome(); break;
      case 'quit': pendingConfirm = goHome; S.modal = { confirm: T().sureQuit }; render(); break;
      case 'langtoggle': S.ui = S.ui === 'ar' ? 'en' : 'ar'; savePrefs(); render(); break;
      case 'end': pendingConfirm = function () { endShift('early'); }; S.modal = { confirm: T().sureEnd }; render(); break;
      case 'closemodal': S.modal = null; pendingConfirm = null; render(); break;
      case 'confirmyes': { const f = pendingConfirm; pendingConfirm = null; S.modal = null; if (f) f(); else render(); break; }
      case 'again': S.screen = 'briefing'; render(); break;
      case 'nextplayer': S.player = { name: '', job: '' }; S.screen = 'clockin'; render(); break;
      case 'csv': exportCsv(); break;
      case 'reset':
        pendingConfirm = function () {
          const keep = loadScores().filter(function (s) { return s.date !== todayKey(); });
          try { localStorage.setItem(STORE, JSON.stringify(keep)); } catch (e) { /* ignore */ }
          render();
        };
        S.modal = { confirm: T().sureReset }; render(); break;
    }
  }

  // Leave whatever is happening and return to the welcome page (the current game is not saved)
  function goHome() {
    stopRing(); AUDIO.stopSpeech();
    S.running = false; S.enc = null; S.modal = null; pendingConfirm = null;
    S.screen = kiosk ? 'board' : 'title'; render();
  }
  // One step back from the current screen. Used by the Back buttons, Esc and the browser's back button.
  function goBack() {
    if (S.modal) { act('closemodal'); return; }
    switch (S.screen) {
      case 'clockin': S.screen = 'title'; render(); break;
      case 'briefing': S.screen = 'clockin'; render(); break;
      case 'board': if (!kiosk) act('home'); break;
      case 'over': goHome(); break;
      case 'counter': case 'remote': case 'incoming': case 'verdict': act('pause'); break;
      case 'pause': act('resume'); break;
    }
  }
  // Keep a history entry so the browser / phone back button steps back inside the game
  // instead of leaving the page. On the welcome page, back leaves as normal.
  let guarded = false;
  function guardHistory() {
    if (guarded || kiosk) return;
    try { history.pushState({ wotl: 1 }, ''); guarded = true; } catch (e) { /* ignore */ }
  }
  window.addEventListener('popstate', function () {
    guarded = false;
    if (S.screen !== 'title' || S.modal) goBack();
  });

  stage.addEventListener('click', function (ev) {
    ac();
    let el = ev.target.closest('[data-act]');
    if (!el || !stage.contains(el)) return;
    const a = el.getAttribute('data-act');
    if (a === 'closemodal' && el.classList.contains('modal') && ev.target.closest('[data-stop]')) return;
    act(a, el);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { goBack(); return; }
    if ((S.screen === 'counter' || S.screen === 'remote') && !S.modal && ev.key === 'p') act('pause');
  });
  // keep the big-screen leaderboard live when scores change in another tab
  window.addEventListener('storage', function (ev) { if (ev.key === STORE && (S.screen === 'board' || S.screen === 'title')) render(); });

  // ---------------- Boot ----------------
  const params = new URLSearchParams(location.search);
  const kiosk = params.has('board'); // ?board = leaderboard-only screen for the booth TV
  if (kiosk) { S.screen = 'board'; setInterval(function () { if (S.screen === 'board') render(); }, 10000); }
  if (params.get('lang') === 'ar' || params.get('lang') === 'en') { S.ui = params.get('lang'); S.vis = S.ui; }
  fit(); render();
  // fonts may arrive after first paint
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { render(); });

  // Exposed for testing
  window.__wotl = { S: S, act: act, render: render };
})();
