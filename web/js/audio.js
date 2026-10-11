'use strict';
// ---------- audio: efeitos e musica 100% sintetizados (Web Audio) ----------
const Snd = (() => {
  let ac = null, comp, master, sfxBus, musBus, revIn, delIn, noiseBuf, analyser;
  const vol = { sfx: .8, music: .55 };
  const SFX_TRIM = .62, MUS_TRIM = .72; // margem interna para nada estourar
  const lastPlay = {};
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);

  function makeImpulse(sec, decay) {
    const len = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -22; comp.knee.value = 24; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .22;
    master = ac.createGain(); master.gain.value = .85;
    // tira a aspereza dos agudos
    const shelf = ac.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 5200; shelf.gain.value = -5;
    const tone = ac.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 9500; tone.Q.value = .5;
    analyser = ac.createAnalyser(); analyser.fftSize = 32768;
    comp.connect(shelf); shelf.connect(tone); tone.connect(master); master.connect(analyser); master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = vol.sfx * SFX_TRIM; sfxBus.connect(comp);
    musBus = ac.createGain(); musBus.gain.value = vol.music * MUS_TRIM; musBus.connect(comp);
    // reverb
    const conv = ac.createConvolver(); conv.buffer = makeImpulse(2.6, 2.4);
    revIn = ac.createGain(); const revOut = ac.createGain(); revOut.gain.value = .5;
    revIn.connect(conv); conv.connect(revOut); revOut.connect(comp);
    // delay (musica)
    const dl = ac.createDelay(1); dl.delayTime.value = .36;
    const fb = ac.createGain(); fb.gain.value = .36;
    const dlp = ac.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2600;
    delIn = ac.createGain();
    delIn.connect(dl); dl.connect(dlp); dlp.connect(fb); fb.connect(dl);
    const dOut = ac.createGain(); dOut.gain.value = .5; dlp.connect(dOut); dOut.connect(comp); dOut.connect(revIn);
    // ruido branco
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    if (pending) musicPlay(pending.key, pending.inten);
  }

  const now = () => ac.currentTime;

  function route(g, o) {
    const bus = o.bus || sfxBus;
    let out = g;
    if (o.pan) { const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, o.pan)); g.connect(p); out = p; }
    out.connect(bus);
    if (o.rev) { const s = ac.createGain(); s.gain.value = o.rev; g.connect(s); s.connect(revIn); }
    if (o.del) { const s = ac.createGain(); s.gain.value = o.del; g.connect(s); s.connect(delIn); }
  }

  // oscilador com envelope, filtro opcional e varredura de frequencia
  function voice(type, f0, f1, t, dur, peak, o = {}) {
    const osc = ac.createOscillator();
    osc.type = type; osc.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    if (o.detune) osc.detune.value = o.detune;
    let node = osc;
    if (o.lp) {
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = o.q || 1;
      f.frequency.setValueAtTime(o.lp, t);
      if (o.lp1) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.lp1), t + dur);
      node.connect(f); node = f;
    }
    const g = ac.createGain(), a = o.a ?? .004;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t + a);
    if (o.hold) g.gain.setValueAtTime(Math.max(.0002, peak), t + o.hold);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    node.connect(g); route(g, o);
    osc.start(t); osc.stop(t + dur + .05);
    return osc;
  }

  function noiseV(t, dur, peak, o = {}) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = o.type || 'lowpass'; f.Q.value = o.q || .8;
    f.frequency.setValueAtTime(o.f0 || 2000, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(40, o.f1), t + dur);
    const g = ac.createGain(), a = o.a ?? .003;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); route(g, o);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + .05);
  }

  function duck(amount, sec) {
    if (!ac) return;
    const t = now(), base = vol.music * MUS_TRIM;
    musBus.gain.cancelScheduledValues(t);
    musBus.gain.setValueAtTime(musBus.gain.value, t);
    musBus.gain.linearRampToValueAtTime(base * (1 - amount), t + .03);
    musBus.gain.linearRampToValueAtTime(base, t + sec);
  }

  // ---------- efeitos ----------
  const SFX = {
    shoot(o) {
      const t = now(), f = (1300 + (o.lv || 0) * 140) * rnd(.94, 1.06), p = o.pan;
      voice('sawtooth', f * .85, f * .2, t, .12, .07, { lp: 3000, lp1: 700, q: 2, rev: .12, pan: p });
      voice('triangle', f * .5, f * .12, t, .09, .05, { lp: 2200, pan: p });
      noiseV(t, .025, .015, { type: 'bandpass', f0: 2500, pan: p });
    },
    enemyShoot(o) {
      const t = now(), p = o.pan;
      voice('sine', 620 * rnd(.95, 1.05), 240, t, .14, .07, { pan: p, rev: .15 });
      voice('triangle', 1240, 480, t, .07, .03, { pan: p });
    },
    hit(o) {
      const t = now();
      noiseV(t, .04, .03, { type: 'bandpass', f0: 2200, pan: o.pan });
      voice('triangle', 800 * rnd(.9, 1.1), 320, t, .06, .035, { pan: o.pan });
    },
    bossHit(o) {
      const t = now();
      voice('square', 200 * rnd(.9, 1.1), 90, t, .09, .06, { lp: 1800, pan: o.pan });
      noiseV(t, .05, .06, { type: 'bandpass', f0: 1800, pan: o.pan });
    },
    explode(o) {
      const t = now(), s = o.size ?? 1, d = .35 + s * .5, p = o.pan, pk = .26 + s * .11;
      noiseV(t, d, pk, { type: 'lowpass', f0: 3200, f1: 120, q: 1.2, a: .004, pan: p, rev: .25 + s * .15 });
      voice('sine', 150, 28, t, .3 + s * .25, pk * 1.1, { pan: p });
      voice('sawtooth', 180, 50, t, .2 + s * .15, pk * .35, { lp: 900, lp1: 120, pan: p });
      for (let i = 0; i < 3 + s * 3; i++) noiseV(t + rnd(.03, d * .8), rnd(.02, .06), pk * .2, { type: 'bandpass', f0: rnd(1200, 3000), pan: p });
    },
    playerHit() {
      const t = now();
      voice('sawtooth', 260, 48, t, .45, .2, { lp: 1200, lp1: 160, q: 2, rev: .2 });
      voice('sine', 120, 30, t, .4, .35);
      noiseV(t, .25, .17, { type: 'bandpass', f0: 1200, f1: 200, q: 1.5 });
      duck(.55, .5);
    },
    coin(o) {
      const t = now(), c = Math.min(o.combo || 0, 10), f = 1318.5 * Math.pow(2, c / 24);
      voice('triangle', f, f, t, .12, .09, { rev: .2, pan: o.pan });
      voice('triangle', f * 1.498, f * 1.498, t + .065, .22, .09, { rev: .3, pan: o.pan });
      voice('sine', f * 2.76, f * 2.76, t + .065, .15, .03, { pan: o.pan });
    },
    xp(o) {
      const t = now(), f = 640 + Math.min(o.combo || 0, 14) * 38;
      voice('sine', f, f * 1.5, t, .07, .06, { pan: o.pan });
    },
    heart() {
      const t = now();
      voice('triangle', 523, 523, t, .15, .12, { rev: .3 });
      voice('triangle', 784, 784, t + .1, .3, .12, { rev: .4 });
      voice('sine', 1047, 1047, t + .2, .4, .08, { rev: .4 });
    },
    levelUp() {
      const t = now(), notes = [72, 76, 79, 84, 88, 91];
      notes.forEach((m, i) => {
        voice('triangle', mtof(m), mtof(m), t + i * .065, .4, .14, { rev: .4, del: .15 });
        voice('sine', mtof(m + 12), mtof(m + 12), t + i * .065, .5, .05, { rev: .5 });
      });
      // voz do Olienzinho: piado ascendente com vibrato
      const o = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(1500, t + .2); o.frequency.exponentialRampToValueAtTime(980, t + .36);
      lfo.frequency.value = 22; lg.gain.value = 60; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + .4);
      o.connect(g); route(g, { rev: .3 }); o.start(t); lfo.start(t); o.stop(t + .45); lfo.stop(t + .45);
      noiseV(t, .6, .13, { type: 'bandpass', f0: 300, f1: 5000, q: 1.5, a: .05, rev: .3 });
      voice('sine', 90, 45, t, .5, .3);
    },
    upgrade() {
      const t = now();
      voice('square', mtof(76), mtof(76), t, .08, .07, { lp: 3000 });
      voice('square', mtof(83), mtof(83), t + .07, .08, .07, { lp: 3000 });
      voice('triangle', mtof(88), mtof(88), t + .14, .3, .1, { rev: .4 });
    },
    special() {
      const t = now();
      voice('sine', 110, 26, t, .9, .6);
      noiseV(t, .9, .35, { type: 'lowpass', f0: 400, f1: 6000, a: .25, rev: .4 });
      noiseV(t + .2, .7, .3, { type: 'lowpass', f0: 5000, f1: 150, rev: .5 });
      for (let i = 0; i < 5; i++) voice('sawtooth', mtof(60 + i * 7), mtof(72 + i * 7), t + i * .04, .6, .05, { lp: 2500, rev: .5 });
      duck(.5, 1);
    },
    specialReady() {
      const t = now();
      voice('triangle', mtof(84), mtof(84), t, .12, .08, { rev: .3 });
      voice('triangle', mtof(91), mtof(91), t + .09, .25, .08, { rev: .4 });
    },
    bossWarn() {
      const t = now();
      for (let i = 0; i < 6; i++) {
        const f = i % 2 ? 330 : 440;
        voice('sawtooth', f, f, t + i * .42, .4, .14, { lp: 1100, q: 1.2, a: .03, rev: .2 });
        voice('triangle', f / 2, f / 2, t + i * .42, .4, .1, { lp: 600, a: .03 });
      }
      voice('sine', 55, 48, t, 2.6, .35, { a: .4 });
      duck(.6, 2.6);
    },
    bossDie() {
      const t = now();
      [0, .22, .5, .8, 1.15, 1.6].forEach((d, i) => setTimeout(() => SFX.explode({ size: i > 3 ? 2 : 1.4, pan: rnd(-.5, .5) }), d * 1000));
      noiseV(t, 2.2, .3, { type: 'bandpass', f0: 200, f1: 7000, q: 2, a: 1.6, rev: .5 });
      voice('sine', 70, 20, t + 1.6, 1.8, .7);
      [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => voice('triangle', mtof(m), mtof(m), t + 2.3 + i * .09, .9, .12, { rev: .6, del: .3 }));
      duck(.8, 3);
    },
    stageClear() {
      const t = now();
      const seq = [[60, 0], [64, .12], [67, .24], [72, .36], [76, .55], [79, .7], [84, .9]];
      seq.forEach(([m, d]) => {
        voice('triangle', mtof(m), mtof(m), t + d, .6, .13, { rev: .5, del: .2 });
        voice('square', mtof(m), mtof(m), t + d, .5, .04, { lp: 2400 });
      });
      [60, 64, 67, 72].forEach(m => voice('sawtooth', mtof(m - 12), mtof(m - 12), t + 1.05, 2.4, .06, { lp: 900, a: .15, rev: .5 }));
    },
    gameOver() {
      const t = now();
      [69, 65, 62, 57].forEach((m, i) => {
        voice('triangle', mtof(m), mtof(m) * .98, t + i * .32, .8, .14, { rev: .6 });
        voice('sawtooth', mtof(m - 12), mtof(m - 12), t + i * .32, .8, .05, { lp: 700, rev: .4 });
      });
      duck(.8, 2);
    },
    uiMove() { const t = now(); voice('triangle', 880, 880, t, .05, .05); },
    uiSelect() { const t = now(); voice('square', mtof(79), mtof(79), t, .06, .06, { lp: 3500 }); voice('triangle', mtof(86), mtof(86), t + .05, .15, .08, { rev: .3 }); },
    uiBack() { const t = now(); voice('triangle', 660, 440, t, .12, .07); },
    uiDeny() { const t = now(); voice('square', 160, 120, t, .14, .07, { lp: 900 }); },
    buy() {
      const t = now();
      [76, 83, 88, 95].forEach((m, i) => voice('triangle', mtof(m), mtof(m), t + i * .06, .3, .1, { rev: .4 }));
      voice('sine', 1568, 1568, t + .25, .3, .05, { rev: .5 });
    },
    warp() {
      const t = now();
      noiseV(t, 1.6, .22, { type: 'bandpass', f0: 200, f1: 7000, q: 2, a: .8, rev: .4 });
      voice('sawtooth', 90, 900, t, 1.6, .1, { lp: 1500, a: .6 });
    },
    lightning() {
      const t = now();
      noiseV(t, .3, .36, { type: 'bandpass', f0: 1800, f1: 700, a: .002, rev: .4 });
      noiseV(t + .02, 1.3, .3, { type: 'lowpass', f0: 280, f1: 60, a: .02, rev: .5 });
      voice('sawtooth', 2000, 120, t, .18, .09, { lp: 3500, lp1: 400 });
      duck(.3, .5);
    },
    charge(o) {
      const t = now(), d = o.dur || 1;
      voice('sawtooth', 120, 900, t, d, .12, { lp: 700, lp1: 3500, a: d * .8, rev: .3 });
      voice('sine', 300, 1800, t, d, .1, { a: d * .8 });
    },
    beam(o) {
      const t = now(), d = o.dur || 1;
      voice('sawtooth', 70, 74, t, d, .22, { lp: 500, lp1: 1800, a: .08, hold: d * .8, rev: .2 });
      voice('square', 140, 150, t, d, .08, { lp: 1200, a: .08, hold: d * .8 });
      noiseV(t, d, .12, { type: 'bandpass', f0: 1500, f1: 1500, a: .08 });
    },
    mine() {
      const t = now();
      voice('square', 880, 880, t, .05, .05, { lp: 4000 });
    },
    shield() {
      const t = now();
      voice('sine', 1200, 300, t, .4, .2, { rev: .5 });
      voice('triangle', 2400, 600, t, .3, .1, { rev: .5 });
      noiseV(t, .3, .12, { type: 'highpass', f0: 4000 });
    },
    rumble(o) { noiseV(now(), o.dur || 1.5, .3, { type: 'lowpass', f0: 160, f1: 50, a: .3 }); },
  };

  const GAP = { shoot: .04, hit: .035, bossHit: .06, xp: .03, enemyShoot: .06, explode: .02, coin: .03 };
  function play(name, o = {}) {
    if (!ac || vol.sfx <= 0) return;
    const f = SFX[name]; if (!f) return;
    const t = performance.now() / 1000;
    if (GAP[name] && t - (lastPlay[name] || 0) < GAP[name]) return;
    lastPlay[name] = t;
    try {
      if (name === 'bossDie') { f(o); return; }
      if (o.delay) { setTimeout(() => f(Object.assign({}, o, { delay: 0 })), o.delay * 1000); return; }
      f(o);
    } catch (e) { /* audio nunca deve derrubar o jogo */ }
  }
  // pan por posicao x do evento (0..W)
  const panX = x => ((x / 1280) * 2 - 1) * .7;

  // ---------- musica procedural ----------
  const MINOR = [0, 2, 3, 5, 7, 8, 10], PHRY = [0, 1, 3, 5, 7, 8, 10], DOR = [0, 2, 3, 5, 7, 9, 10], HARM = [0, 2, 3, 5, 7, 8, 11];
  const THEMES = {
    menu: { root: 45, scale: MINOR, bpm: 82, prog: [0, 5, 3, 4], arp: 'triangle', padLP: 700 },
    s1: { root: 45, scale: MINOR, bpm: 100, prog: [0, 5, 3, 6], arp: 'triangle', padLP: 900 },
    s2: { root: 38, scale: PHRY, bpm: 108, prog: [0, 1, 0, 6], arp: 'square', padLP: 700 },
    s3: { root: 42, scale: DOR, bpm: 118, prog: [0, 3, 6, 4], arp: 'sawtooth', padLP: 1100 },
    s4: { root: 40, scale: HARM, bpm: 126, prog: [0, 5, 2, 4], arp: 'sawtooth', padLP: 1400 },
  };
  const ARP = [
    [0, -1, 1, -1, 2, -1, 1, -1, 0, -1, 1, -1, 2, -1, 3, -1],
    [0, -1, -1, 1, -1, 2, -1, -1, 3, -1, 2, -1, 1, -1, -1, 0],
    [0, 1, 2, 1, 0, 1, 2, 3, 0, 1, 2, 1, 3, 2, 1, 2],
  ];
  let pending = null;
  const mus = { on: false, key: null, th: null, inten: 0, step: 0, next: 0, timer: null, gain: null };

  function degNote(th, deg) {
    const n = th.scale.length;
    return th.root + th.scale[((deg % n) + n) % n] + 12 * Math.floor(deg / n);
  }
  function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function stepDur() { return 60 / (mus.th.bpm * (mus.inten === 2 ? 1.16 : 1)) / 4; }

  function kick(t, v) { voice('sine', 160, 42, t, .16, v, { bus: musBus }); noiseV(t, .02, v * .2, { type: 'lowpass', f0: 1500, bus: musBus }); }
  function snare(t, v) { noiseV(t, .16, v, { type: 'bandpass', f0: 1900, q: .9, bus: musBus, rev: .15 }); voice('triangle', 200, 120, t, .09, v * .6, { bus: musBus }); }
  function hat(t, v, open) { noiseV(t, open ? .14 : .035, v, { type: 'highpass', f0: 6500, bus: musBus }); }

  function scheduleStep(step, t) {
    const th = mus.th, inten = mus.inten, bar = Math.floor(step / 16), s = step % 16;
    const prog = th.prog, deg = prog[bar % prog.length], sd = stepDur();
    const root = degNote(th, deg);
    const tones = [deg, deg + 2, deg + 4, deg + 7].map(d => degNote(th, d));

    if (s === 0) { // pad do compasso
      [0, 1, 2].forEach(i => {
        const f = mtof(tones[i] + 12);
        [-7, 7].forEach(dt => voice('sawtooth', f, f, t, sd * 16 + .5, .022, { bus: musBus, lp: th.padLP, detune: dt, a: .9, hold: sd * 14, rev: .5 }));
      });
    }
    // baixo
    const bassOn = inten === 2 ? (s % 2 === 0) : (s % 4 === 0 || (s === 10 && bar % 2) || (s === 14 && inten >= 1));
    if (bassOn) {
      const m = (s === 10 || s === 14) ? tones[2] - 12 : root - 12 + ((inten === 2 && s % 4 === 2) ? 12 : 0);
      voice(inten === 2 ? 'sawtooth' : 'triangle', mtof(m), mtof(m), t, sd * 1.8, inten === 0 ? .08 : .13, { bus: musBus, lp: 380, q: 1.2 });
    }
    // arpejo
    const pat = ARP[inten === 2 ? 2 : (bar % 2 ? 1 : 0)];
    const ai = pat[s];
    if (ai >= 0 && (inten >= 1 || s % 4 === 0 || s % 8 === 6)) {
      const m = tones[ai] + 12 * (inten === 2 ? 2 : 1) + (s >= 8 && inten === 0 ? 0 : 0);
      voice(th.arp, mtof(m), mtof(m), t, sd * 2.2, inten === 0 ? .03 : .045, { bus: musBus, lp: 2600, lp1: 800, q: 1, del: .45, rev: .25 });
    }
    // melodia
    if (inten >= 1 && (inten === 2 || bar % 2 === 0)) {
      const rng = seeded(th.bpm * 977 + (bar % 8) * 7919 + th.root);
      const slots = [0, 3, 6, 10, 12];
      slots.forEach(sl => {
        const r = rng(), dg = deg + [0, 2, 4, 5, 7, 9][Math.floor(r * 6)];
        if (s === sl && (rng() > .25)) {
          const m = degNote(th, dg) + 24;
          voice('square', mtof(m), mtof(m), t, sd * 3.5, .026, { bus: musBus, lp: 2000, del: .5, rev: .45, a: .01 });
          voice('sine', mtof(m), mtof(m), t, sd * 3.5, .045, { bus: musBus, del: .5, rev: .45, a: .01 });
        }
      });
    }
    // bateria
    if (inten >= 1) {
      if (inten === 2 ? (s % 4 === 0 || s === 10) : (s % 8 === 0 || s === 10 && bar % 2)) kick(t, inten === 2 ? .4 : .3);
      if (s === 4 || s === 12) snare(t, inten === 2 ? .15 : .11);
      if (inten === 2 ? true : s % 2 === 0) hat(t, s % 4 === 2 ? .04 : .025, s === 14);
    }
  }

  function tick() {
    if (!mus.on || !ac) return;
    let guard = 0;
    while (mus.next < now() + .2 && guard++ < 16) {
      scheduleStep(mus.step, mus.next);
      mus.next += stepDur();
      mus.step++;
    }
  }

  function musicPlay(key, inten = 1) {
    if (!ac) { pending = { key, inten }; return; }
    pending = null;
    if (mus.on && mus.key === key) { mus.inten = inten; return; }
    musicStop(true);
    mus.key = key; mus.th = THEMES[key] || THEMES.s1; mus.inten = inten;
    mus.step = 0; mus.next = now() + .08; mus.on = true;
    const t = now();
    musBus.gain.cancelScheduledValues(t);
    musBus.gain.setValueAtTime(.0001, t);
    musBus.gain.linearRampToValueAtTime(vol.music * MUS_TRIM, t + 1.2);
    clearInterval(mus.timer);
    mus.timer = setInterval(tick, 40);
  }
  function setIntensity(i) { mus.inten = i; }
  function musicStop(fast) {
    if (!mus.on) return;
    mus.on = false; clearInterval(mus.timer);
    if (!ac) return;
    const t = now();
    musBus.gain.cancelScheduledValues(t);
    musBus.gain.setValueAtTime(musBus.gain.value, t);
    musBus.gain.linearRampToValueAtTime(.0001, t + (fast ? .25 : 1.2));
  }

  function setVolumes(s, m) {
    vol.sfx = s; vol.music = m;
    if (!ac) return;
    sfxBus.gain.value = s * SFX_TRIM;
    if (mus.on) musBus.gain.value = m * MUS_TRIM;
  }
  function peak() {
    if (!analyser) return -1;
    const b = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(b);
    let p = 0; for (const v of b) p = Math.max(p, Math.abs(v)); return p;
  }

  return { init, play, panX, musicPlay, musicStop, setIntensity, setVolumes, peak, duck, get ready() { return !!ac; }, get state() { return ac && ac.state; } };
})();
