/* Who's on the Line? — background music, office ambience and visitor voices.
 *
 * Everything is generated live with the Web Audio API and the browser's built-in
 * speech voices, so there are no sound files to download or license.
 *   - Music:   a gentle looping tune in the Hijaz scale with a soft darbuka beat
 *   - Office:  room tone, distant chatter, phones, typing, the queue "ding-dong", printer, footsteps
 *   - Voices:  in-person visitors and phone callers read their lines aloud (if the device has a voice)
 */
(function () {
  'use strict';

  let C = null;            // AudioContext
  let master, musicBus, officeBus;
  const on = { music: true, office: true, voices: true };
  const level = { music: 0, office: 0 }; // scene levels (0..1)
  let duckMusic = false;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function ctx() {
    if (!C) {
      try { C = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { C = null; return null; }
      build();
    }
    if (C.state === 'suspended') C.resume();
    return C;
  }

  function build() {
    master = C.createGain(); master.gain.value = 0.9;
    const comp = C.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4;
    master.connect(comp).connect(C.destination);
    musicBus = C.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    officeBus = C.createGain(); officeBus.gain.value = 0; officeBus.connect(master);
    buildRoom();
    buildChatter();
    setInterval(tick, 200);
    applyLevels();
  }

  function applyLevels() {
    if (!C) return;
    const t = C.currentTime;
    const m = on.music ? level.music * 0.7 * (duckMusic ? 0.55 : 1) : 0;
    const o = on.office ? level.office * 1.6 : 0;
    musicBus.gain.setTargetAtTime(m, t, 0.6);
    officeBus.gain.setTargetAtTime(o, t, 0.6);
  }

  // ---------------- Shared helpers ----------------
  let noiseBuf = null;
  function noise() {
    if (!noiseBuf) {
      noiseBuf = C.createBuffer(1, C.sampleRate * 2, C.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = C.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    return s;
  }
  function pan(node, p) {
    if (!C.createStereoPanner) return node;
    const sp = C.createStereoPanner(); sp.pan.value = p; node.connect(sp); return sp;
  }
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  // ---------------- Office: room tone + air conditioning ----------------
  function buildRoom() {
    // brown noise for the low "room" rumble
    const len = C.sampleRate * 6, b = C.createBuffer(1, len, C.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const s = C.createBufferSource(); s.buffer = b; s.loop = true;
    const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
    const g = C.createGain(); g.gain.value = 0.22;
    s.connect(lp).connect(g).connect(officeBus); s.start();
    // air-conditioning hiss
    const n = noise(), bp = C.createBiquadFilter(), g2 = C.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.4; g2.gain.value = 0.012;
    n.connect(bp).connect(g2).connect(officeBus); n.start();
  }

  // ---------------- Office: distant chatter (synthetic murmur) ----------------
  const VOWELS = [[730, 1090], [530, 1840], [270, 2290], [570, 840], [300, 870], [660, 1700], [490, 1350]];
  const talkers = [];
  let chatterOut;
  function buildChatter() {
    chatterOut = C.createBiquadFilter(); chatterOut.type = 'lowpass'; chatterOut.frequency.value = 1300;
    // a little room echo so the voices sit "across the hall"
    const dl = C.createDelay(1), fb = C.createGain(), wet = C.createGain();
    dl.delayTime.value = 0.13; fb.gain.value = 0.35; wet.gain.value = 0.5;
    chatterOut.connect(officeBus); chatterOut.connect(dl); dl.connect(fb).connect(dl); dl.connect(wet).connect(officeBus);
    [[105, -0.6], [125, 0.5], [140, -0.2], [205, 0.3], [230, -0.45], [118, 0.7]].forEach(function (v) {
      const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = v[0];
      const f1 = C.createBiquadFilter(), f2 = C.createBiquadFilter(), g = C.createGain(), sum = C.createGain();
      f1.type = f2.type = 'bandpass'; f1.Q.value = 7; f2.Q.value = 9;
      g.gain.value = 0.0001; sum.gain.value = 1;
      o.connect(f1); o.connect(f2); f1.connect(sum); f2.connect(sum);
      sum.connect(g); pan(g, v[1]).connect(chatterOut);
      o.start();
      talkers.push({ o: o, f1: f1, f2: f2, g: g, base: v[0], next: C.currentTime + rand(0, 3), vol: rand(0.05, 0.09) });
    });
  }
  function scheduleTalker(T, until) {
    while (T.next < until) {
      // one phrase: a run of syllables with a falling pitch, then a pause
      const n = Math.floor(rand(4, 16));
      let t = T.next, f0 = T.base * rand(1.05, 1.25);
      for (let i = 0; i < n; i++) {
        const dur = rand(0.11, 0.27), vw = pick(VOWELS);
        T.o.frequency.setTargetAtTime(f0 * rand(0.92, 1.08), t, 0.03);
        T.f1.frequency.setTargetAtTime(vw[0], t, 0.025);
        T.f2.frequency.setTargetAtTime(vw[1], t, 0.025);
        const pk = T.vol * rand(0.5, 1);
        T.g.gain.setTargetAtTime(pk, t, 0.02);
        T.g.gain.setTargetAtTime(0.0001, t + dur * 0.75, 0.03);
        t += dur + (Math.random() < 0.15 ? rand(0.08, 0.2) : 0.01);
        f0 *= 0.985;
      }
      T.next = t + rand(0.6, 3.5);
    }
  }

  // ---------------- Office: occasional sounds ----------------
  let nextEvent = 0;
  const EVENTS = {
    phone: function (t) { // a desk phone ringing somewhere else
      const p = rand(-0.8, 0.8), g = C.createGain(), lp = C.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1800; g.gain.value = 0;
      [440, 480].forEach(function (f) { const o = C.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(lp); o.start(t); o.stop(t + 4.2); });
      lp.connect(g); pan(g, p).connect(officeBus);
      const rings = Math.random() < 0.5 ? 1 : 2;
      for (let r = 0; r < rings; r++) {
        for (let k = 0; k < 20; k++) { const s = t + r * 3 + k * 0.05; g.gain.setValueAtTime(k % 2 ? 0 : 0.012, s); }
        g.gain.setValueAtTime(0, t + r * 3 + 1);
      }
    },
    typing: function (t) {
      const p = rand(-0.9, 0.9), n = Math.floor(rand(14, 40));
      for (let i = 0; i < n; i++) {
        const s = noise(), hp = C.createBiquadFilter(), g = C.createGain();
        hp.type = 'bandpass'; hp.frequency.value = rand(2500, 4500); hp.Q.value = 1.5;
        s.connect(hp).connect(g); pan(g, p).connect(officeBus);
        env(g, t, 0.002, rand(0.05, 0.1), 0.03); s.start(t); s.stop(t + 0.06);
        t += Math.random() < 0.1 ? rand(0.3, 0.6) : rand(0.07, 0.17);
      }
    },
    ding: function (t) { // queue system: "next customer, please"
      [[784, 0], [659, 0.45]].forEach(function (n) {
        [1, 2.76].forEach(function (h, j) {
          const o = C.createOscillator(), g = C.createGain();
          o.type = 'sine'; o.frequency.value = n[0] * h;
          o.connect(g).connect(officeBus); env(g, t + n[1], 0.01, j ? 0.012 : 0.05, 1.4);
          o.start(t + n[1]); o.stop(t + n[1] + 1.5);
        });
      });
    },
    printer: function (t) {
      const o = C.createOscillator(), s = noise(), bp = C.createBiquadFilter(), g = C.createGain(), lfo = C.createOscillator(), lg = C.createGain();
      o.type = 'sawtooth'; o.frequency.value = 62; bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 2;
      o.connect(bp); s.connect(bp); bp.connect(g); pan(g, rand(-0.7, 0.7)).connect(officeBus);
      lfo.frequency.value = 7; lg.gain.value = 0.006; lfo.connect(lg).connect(g.gain);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.012, t + 0.2); g.gain.setValueAtTime(0.012, t + 2.6); g.gain.linearRampToValueAtTime(0.0001, t + 2.9);
      [o, s, lfo].forEach(function (x) { x.start(t); x.stop(t + 3); });
    },
    steps: function (t) {
      const p0 = rand(-0.9, 0.9), dir = p0 > 0 ? -1 : 1, n = Math.floor(rand(5, 10));
      for (let i = 0; i < n; i++) {
        const o = C.createOscillator(), g = C.createGain();
        o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.08);
        o.connect(g); pan(g, Math.max(-1, Math.min(1, p0 + dir * i * 0.15))).connect(officeBus);
        env(g, t, 0.005, 0.07, 0.1); o.start(t); o.stop(t + 0.15);
        t += rand(0.48, 0.56);
      }
    },
    paper: function (t) {
      const s = noise(), bp = C.createBiquadFilter(), g = C.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 0.8;
      s.connect(bp).connect(g); pan(g, rand(-0.6, 0.6)).connect(officeBus);
      g.gain.setValueAtTime(0.0001, t);
      for (let k = 0; k < 10; k++) g.gain.setValueAtTime(rand(0.005, 0.03), t + k * 0.04);
      g.gain.setValueAtTime(0.0001, t + 0.42);
      s.start(t); s.stop(t + 0.45);
    },
    cup: function (t) { // spoon on a tea glass
      [2650, 3980, 5200].forEach(function (f, i) {
        const o = C.createOscillator(), g = C.createGain(); o.frequency.value = f;
        o.connect(g); pan(g, rand(-0.5, 0.5)).connect(officeBus); env(g, t, 0.002, 0.012 / (i + 1), 0.5);
        o.start(t); o.stop(t + 0.6);
      });
    }
  };
  const EVENT_BAG = ['phone', 'typing', 'typing', 'ding', 'printer', 'steps', 'paper', 'cup', 'typing', 'steps'];

  // ---------------- Music ----------------
  // D Hijaz: D Eb F# G A Bb C. Chords: D | Gm | Cm | D  (4 bars, looped with a 16-bar melody)
  const BPM = 92, E8 = 60 / BPM / 2;
  const D4 = 293.66;
  const hz = (semi) => D4 * Math.pow(2, semi / 12);
  const SCALE = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16];
  const CHORDS = [[0, 4, 7], [5, 8, 12], [-2, 1, 5], [0, 4, 7]];
  const BASS = [-24, -19, -26, -24];
  // dum / tak pattern of the maqsum rhythm (8 eighths per bar)
  const DRUM = ['D', 'T', '', 'T', 'D', '', 'T', ''];
  let melody = null, musicStep = 0, musicNext = 0;

  function makeMelody() {
    // seeded so the tune is the same every time the page loads
    let seed = 7;
    const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const out = [];
    let idx = 4;
    for (let bar = 0; bar < 16; bar++) {
      const ch = CHORDS[bar % 4];
      for (let e = 0; e < 8; e++) {
        const strong = e % 4 === 0;
        if (!strong && r() < 0.38) { out.push(null); continue; }
        if (strong) { // land on a chord tone
          const target = ch[Math.floor(r() * ch.length)];
          let best = 0, bd = 99;
          SCALE.forEach(function (s, i) { const d = Math.abs(((s - target) % 12 + 12) % 12); if (d < bd) { bd = d; best = i; } });
          idx = Math.abs(best - idx) > 3 ? best : (r() < 0.5 ? best : idx);
        } else {
          idx += r() < 0.5 ? -1 : 1;
          idx = Math.max(0, Math.min(SCALE.length - 1, idx));
        }
        // the last bar of each 4 resolves home
        if (bar % 4 === 3 && e >= 6) { out.push(e === 6 ? 0 : null); continue; }
        out.push(SCALE[idx]);
      }
    }
    return out;
  }

  function pluck(t, semi, vol) { // oud-like pluck
    const o = C.createOscillator(), o2 = C.createOscillator(), lp = C.createBiquadFilter(), g = C.createGain();
    o.type = 'sawtooth'; o2.type = 'triangle';
    o.frequency.value = hz(semi); o2.frequency.value = hz(semi) * 1.003;
    lp.type = 'lowpass'; lp.Q.value = 2;
    lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(500, t + 0.35);
    o.connect(lp); o2.connect(lp); lp.connect(g).connect(musicBus);
    env(g, t, 0.004, vol, 0.7);
    o.start(t); o2.start(t); o.stop(t + 0.8); o2.stop(t + 0.8);
  }
  function bass(t, semi, dur) {
    const o = C.createOscillator(), g = C.createGain();
    o.type = 'triangle'; o.frequency.value = hz(semi);
    o.connect(g).connect(musicBus); env(g, t, 0.01, 0.22, dur);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function pad(t, chord, dur) {
    const lp = C.createBiquadFilter(), g = C.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    lp.connect(g).connect(musicBus);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045, t + 0.6); g.gain.setValueAtTime(0.045, t + dur - 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    chord.forEach(function (s) {
      [-4, 4].forEach(function (cents) {
        const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(s - 12); o.detune.value = cents;
        o.connect(lp); o.start(t); o.stop(t + dur + 0.05);
      });
    });
  }
  function drum(t, kind) {
    if (kind === 'D') {
      const o = C.createOscillator(), g = C.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(58, t + 0.18);
      o.connect(g).connect(musicBus); env(g, t, 0.004, 0.32, 0.28); o.start(t); o.stop(t + 0.35);
    } else {
      const s = noise(), bp = C.createBiquadFilter(), g = C.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 1.2;
      s.connect(bp).connect(g).connect(musicBus); env(g, t, 0.002, 0.12, 0.06); s.start(t); s.stop(t + 0.1);
    }
  }
  function scheduleMusic(until) {
    if (!melody) { melody = makeMelody(); musicNext = C.currentTime + 0.1; }
    while (musicNext < until) {
      const t = musicNext, bar = Math.floor(musicStep / 8), e = musicStep % 8;
      if (e === 0) { pad(t, CHORDS[bar % 4], E8 * 8); bass(t, BASS[bar % 4], E8 * 2.5); }
      if (e === 4) bass(t, BASS[bar % 4] + (bar % 2 ? 7 : 0), E8 * 2);
      if (DRUM[e]) drum(t, DRUM[e]);
      const note = melody[musicStep % melody.length];
      // the melody sits out every other 16 bars so the loop breathes
      if (note !== null && Math.floor(musicStep / 128) % 2 === 0) pluck(t, note, 0.11);
      musicStep += 1; musicNext += E8;
    }
  }

  // ---------------- Scheduler ----------------
  function tick() {
    if (!C || C.state !== 'running') return;
    const now = C.currentTime, ahead = now + 1.2;
    if (musicNext < now) { musicNext = now + 0.05; } // catch up after a pause in the tab
    if (on.music && level.music > 0) scheduleMusic(ahead); else musicNext = 0;
    if (on.office && level.office > 0) {
      talkers.forEach(function (T) { if (T.next < now) T.next = now; scheduleTalker(T, ahead); });
      if (now >= nextEvent) {
        if (nextEvent) EVENTS[pick(EVENT_BAG)](now + 0.1);
        nextEvent = now + rand(4, 10);
      }
    }
  }

  // ---------------- Visitor voices (speech synthesis) ----------------
  const synth = window.speechSynthesis;
  let voices = [];
  function loadVoices() { if (synth) voices = synth.getVoices() || []; }
  if (synth) { loadVoices(); if ('onvoiceschanged' in synth) synth.onvoiceschanged = loadVoices; }
  const FEMALE = /female|woman|zira|samantha|hazel|susan|salma|hoda|laila|layla|zariyah|aria|jenny|libby|sonia|karen|moira|tessa|fiona|victoria|amina|fatima|mariam|sana|maryam|aysha|aisha|fatma|zeina/i;
  const MALE = /\bmale\b|\bman\b|david|mark|george|daniel|naayf|hamed|guy|ryan|alex|fred|rishi|tarik|maged|majed|shakir|hamdan|omar|fahed|abdullah/i;
  function pickVoice(lang, female) {
    if (!voices.length) loadVoices();
    let list = voices.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(lang) === 0; });
    if (!list.length) return null;
    const gendered = list.filter(function (v) { return (female ? FEMALE : MALE).test(v.name) && !(female ? MALE : FEMALE).test(v.name); });
    if (gendered.length) list = gendered;
    // prefer natural / online voices, then Gulf Arabic or British English
    const pref = list.find(function (v) { return /natural|online|neural/i.test(v.name); }) ||
      list.find(function (v) { return /ar-(om|ae|sa|qa|kw|bh)|en-gb/i.test(v.lang); });
    return pref || list[0];
  }
  function speak(text, lang, who) {
    if (!on.voices || !synth || !text) return;
    const female = who && (who.base === 'abaya' || who.base === 'shayla');
    const voice = pickVoice(lang, female);
    if (!voice) return; // no voice for this language on this device: stay silent
    stopSpeech();
    const u = new SpeechSynthesisUtterance(String(text).replace(/\[\[|\]\]/g, '').replace(/[“”]/g, ''));
    u.voice = voice; u.lang = voice.lang;
    u.rate = lang === 'ar' ? 0.95 : 1.02;
    u.pitch = female ? 1.12 : 0.88;
    if (who && who.age) u.pitch += (30 - who.age) * 0.006;
    u.volume = 1;
    u.onstart = function () { duckMusic = true; applyLevels(); };
    u.onend = u.onerror = function () { duckMusic = false; applyLevels(); };
    setTimeout(function () { synth.speak(u); }, 60); // Chrome drops speak() right after cancel()
  }
  function stopSpeech() {
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
    if (duckMusic) { duckMusic = false; applyLevels(); }
  }

  // ---------------- Scenes ----------------
  const SCENES = {
    title:    { music: 1,    office: 0.45 },
    clockin:  { music: 1,    office: 0.45 },
    briefing: { music: 0.9,  office: 0.45 },
    board:    { music: 1,    office: 0.3 },
    over:     { music: 1,    office: 0.35 },
    incoming: { music: 0.4,  office: 1 },
    counter:  { music: 0.4,  office: 1 },
    remote:   { music: 0.4,  office: 1 },
    verdict:  { music: 0.55, office: 0.9 },
    pause:    { music: 0.6,  office: 0.25 }
  };

  window.AUDIO = {
    ctx: ctx,
    scene: function (name) {
      const s = SCENES[name] || SCENES.title;
      level.music = s.music; level.office = s.office;
      applyLevels();
    },
    set: function (prefs) {
      ['music', 'office', 'voices'].forEach(function (k) { if (k in prefs) on[k] = !!prefs[k]; });
      if (!on.voices) stopSpeech();
      applyLevels();
    },
    hasVoice: function (lang) { return !!(synth && pickVoice(lang, false)); },
    speak: speak,
    stopSpeech: stopSpeech
  };
})();
