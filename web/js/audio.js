'use strict';
// ---------- audio: efeitos e musica 100% sintetizados (Web Audio) ----------
const Snd = (() => {
  let ac = null, comp, master, sfxBus, musMaster, musBus, cineBus, revIn, delIn, noiseBuf, analyser;
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
    musMaster = ac.createGain(); musMaster.gain.value = vol.music * MUS_TRIM; musMaster.connect(comp);
    newTrackBus();
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

  // cada trilha tem o seu proprio canal: ao trocar, a antiga some devagar enquanto a nova entra (crossfade)
  function newTrackBus() {
    musBus = ac.createGain(); musBus.gain.value = 1; musBus.connect(musMaster);
    cineBus = ac.createGain(); cineBus.gain.value = 1.9; cineBus.connect(musBus);
  }
  function duck(amount, sec) {
    if (!ac) return;
    const t = now(), base = vol.music * MUS_TRIM;
    musMaster.gain.cancelScheduledValues(t);
    musMaster.gain.setValueAtTime(musMaster.gain.value, t);
    musMaster.gain.linearRampToValueAtTime(base * (1 - amount), t + .03);
    musMaster.gain.linearRampToValueAtTime(base, t + sec);
  }

  // ---------- efeitos ----------
  const SFX = {
    laser(o) { const t = now(); voice('sine', 520, 500, t, .12, .03, { pan: o.pan }); noiseV(t, .1, .02, { type: 'bandpass', f0: 3000, pan: o.pan }); },
    cannon(o) {
      const t = now(), p = o.pan;
      voice('sine', 130, 40, t, .32, .34, { pan: p }); voice('sawtooth', 200, 60, t, .16, .08, { lp: 600, pan: p });
      noiseV(t, .22, .16, { type: 'lowpass', f0: 1800, f1: 200, pan: p, rev: .2 });
    },
    dash() { const t = now(); noiseV(t, .2, .12, { type: 'bandpass', f0: 700, f1: 4200, q: 1.2, a: .02 }); voice('sine', 300, 900, t, .16, .06, { rev: .2 }); },
    specialFire(o) {
      const t = now();
      voice('sine', 110, 30, t, .5, .32); noiseV(t, .5, .2, { type: 'lowpass', f0: 400, f1: 5000, a: .1, rev: .3 });
      if (o.w === 'violet') [76, 83, 88, 95].forEach((m, i) => voice('triangle', mtof(m), mtof(m), t + i * .05, .4, .08, { rev: .5, del: .2 }));
      if (o.w === 'fan') voice('sawtooth', 220, 880, t, .35, .06, { lp: 1800, rev: .3 });
    },
    stamp() { const t = now(); voice('sine', 150, 45, t, .4, .45); noiseV(t, .2, .2, { type: 'lowpass', f0: 1600, f1: 200 }); voice('triangle', mtof(88), mtof(88), t + .06, .5, .1, { rev: .5 }); },
    shoot(o) {
      if (o.wpn === 'fan') { const t = now(), p = o.pan; noiseV(t, .12, .1, { type: 'bandpass', f0: 1800, f1: 600, pan: p }); voice('sine', 700, 280, t, .1, .07, { pan: p }); return; }
      // "plim" curto e macio, em vez de laser serrilhado
      const t = now(), f = (980 + (o.lv || 0) * 90) * rnd(.97, 1.03), p = o.pan;
      voice('sine', f * 1.15, f * .55, t, .09, .11, { pan: p, rev: .1, a: .003 });
      voice('triangle', f * 2.3, f * 1.2, t, .06, .02, { pan: p, a: .003 });
    },
    blip(o) {
      // "voz" de cada personagem ao digitar o texto
      const t = now(), w = o.who;
      if (w === 'O') { const f = rnd(780, 1150); voice('triangle', f, f * 1.22, t, .07, .05, { a: .003, rev: .15 }); }
      else if (w === 'B') { const f = rnd(430, 640); voice('square', f, f * .96, t, .055, .024, { lp: 2200, a: .003, rev: .1 }); }
      else if (w === 'L') { const f = rnd(900, 1300); voice('sine', f, f, t, .12, .04, { a: .004, rev: .5 }); voice('sine', f * 1.5, f * 1.5, t, .1, .02, { rev: .5 }); }
      else if (w === 'V') { const f = rnd(70, 95); voice('sawtooth', f, f * .9, t, .14, .05, { lp: 500, a: .01, rev: .5 }); voice('sine', f * 1.51, f * 1.5, t, .1, .02, { rev: .4 }); }
      else if (w === 'C') { const f = rnd(420, 560); voice('triangle', f, f * 1.08, t, .08, .045, { a: .006, rev: .25 }); }
      else if (w === 'P') { const f = rnd(110, 150); voice('square', f, f * .95, t, .1, .04, { lp: 700, a: .006, rev: .2 }); }
      else if (w === 'E') { const f = rnd(560, 760); voice('sine', f, f * 1.05, t, .11, .04, { a: .008, rev: .45 }); }
      else if (w === 'S') { const f = rnd(210, 290); voice('sawtooth', f, f * 1.02, t, .1, .035, { lp: 1000, a: .008, rev: .3 }); }
      else { const f = rnd(190, 250); voice('sine', f, f, t, .1, .03, { a: .01, rev: .3 }); }
    },
    stinger() {
      // acorde heroico quando o chefe cai
      const t = now();
      [62, 66, 69, 74].forEach((m, i) => {
        voice('sawtooth', mtof(m), mtof(m), t + i * .02, 1.4, .05, { lp: 700, lp1: 2600, a: .05, rev: .5 });
        voice('triangle', mtof(m + 12), mtof(m + 12), t + i * .02, 1.6, .04, { a: .04, rev: .5 });
      });
      voice('sine', 100, 40, t, .6, .45);
      noiseV(t, 1.6, .06, { type: 'highpass', f0: 5000, a: .6, rev: .4 });
      [74, 78, 81, 86, 90].forEach((m, i) => voice('sine', mtof(m), mtof(m), t + .5 + i * .09, .7, .07, { rev: .6, del: .3 }));
    },
    missile(o) {
      const t = now(), p = o.pan;
      noiseV(t, .35, .12, { type: 'bandpass', f0: 500, f1: 3200, q: 1.2, a: .03, pan: p, rev: .2 });
      voice('sine', 160, 70, t, .22, .2, { pan: p });
      voice('triangle', 420, 900, t, .25, .04, { pan: p, a: .05, rev: .3 });
    },
    impact() {
      const t = now();
      voice('sine', 90, 26, t, 1.3, .5);
      noiseV(t, 1.5, .14, { type: 'lowpass', f0: 3000, f1: 120, a: .01, rev: .5 });
      noiseV(t, 1.4, .06, { type: 'highpass', f0: 5000, f1: 3000, a: .02, rev: .5 });
      duck(.5, 1.5);
    },
    enemyShoot(o) {
      const t = now(), p = o.pan;
      voice('sine', 620 * rnd(.95, 1.05), 240, t, .14, .07, { pan: p, rev: .15 });
      voice('triangle', 1240, 480, t, .07, .03, { pan: p });
    },
    hit(o) {
      const t = now(), w = o.wpn;
      if (w === 'fan') { voice('square', 320 * rnd(.9, 1.1), 120, t, .05, .05, { lp: 2200, pan: o.pan }); noiseV(t, .04, .05, { type: 'bandpass', f0: 2400, pan: o.pan }); }
      else if (w === 'laser') voice('sawtooth', 1500 * rnd(.9, 1.1), 900, t, .04, .035, { lp: 5000, pan: o.pan, a: .002 });
      else if (w === 'cannon') { voice('sine', 190 * rnd(.9, 1.1), 55, t, .14, .13, { pan: o.pan }); noiseV(t, .1, .1, { type: 'lowpass', f0: 900, f1: 120, pan: o.pan }); }
      else if (w === 'orbi') voice('sine', 940 * rnd(.95, 1.05), 520, t, .09, .06, { pan: o.pan, a: .004, rev: .3 });
      else voice('sine', 620 * rnd(.92, 1.08), 300, t, .05, .065, { pan: o.pan, a: .002 });
    },
    bossHit(o) {
      const t = now();
      voice('square', 200 * rnd(.9, 1.1), 90, t, .09, .06, { lp: 1800, pan: o.pan });
      noiseV(t, .05, .06, { type: 'bandpass', f0: 1800, pan: o.pan });
    },
    explode(o) {
      // "pof" redondo: baque grave + sopro filtrado + estalo leve (sem serrilhado nem chiado)
      const t = now(), sz = o.size ?? 1, d = .22 + sz * .26, p = o.pan, pk = .2 + sz * .09;
      voice('sine', 135 - sz * 10, 40, t, .2 + sz * .18, pk * 1.25, { pan: p, a: .004 });
      noiseV(t, d, pk * .85, { type: 'lowpass', f0: 2100, f1: 170, q: .6, a: .006, pan: p, rev: .1 + sz * .12 });
      noiseV(t, .08, pk * .45, { type: 'bandpass', f0: 1300, f1: 500, q: .7, a: .002, pan: p });
      if (sz >= 1.2) voice('sine', 70, 30, t + .03, .5 + sz * .2, pk * .8, { pan: p });
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
    hiveDie() {
      const t = now();
      for (let i = 0; i < 8; i++) { voice('sawtooth', 190 + i * 9, 70, t, 2.4, .05, { lp: 900, rev: .3, detune: i * 6 }); }
      for (let i = 0; i < 18; i++) { const d = i * .12; noiseV(t + d, .09, .1, { type: 'bandpass', f0: 600 + rnd(0, 2500), q: 2 }); voice('triangle', 500 + rnd(0, 500), 120, t + d, .12, .05); }
      voice('sine', 80, 24, t + 2.2, 1.6, .6); noiseV(t + 2.2, 1.6, .35, { type: 'lowpass', f0: 1500, f1: 80, a: .01, rev: .5 });
      [64, 67, 72, 76, 79].forEach((m, i) => voice('triangle', mtof(m), mtof(m), t + 2.9 + i * .1, 1.5, .09, { rev: .7, del: .3 }));
      duck(.7, 3.2);
    },
    rockDie() {
      const t = now();
      noiseV(t, 3.4, .4, { type: 'lowpass', f0: 260, f1: 40, a: .1, rev: .5 }); voice('sine', 52, 22, t, 3.4, .6);
      for (let i = 0; i < 14; i++) { const d = rnd(0, 3); noiseV(t + d, .16, .22, { type: 'bandpass', f0: 180 + rnd(0, 500), q: 1.2, rev: .3 }); voice('triangle', 120 + rnd(0, 120), 40, t + d, .2, .12); }
      voice('sine', 90, 20, t + 3.2, 1.8, .9); noiseV(t + 3.2, 2.2, .5, { type: 'lowpass', f0: 1200, f1: 50, a: .01, rev: .6 });
      duck(.8, 4);
    },
    stormDie() {
      const t = now();
      for (let i = 0; i < 12; i++) { const d = i * .26 + rnd(0, .1); noiseV(t + d, .5, .3, { type: 'highpass', f0: 2500, f1: 300, a: .005, rev: .5 }); voice('sine', 70, 28, t + d + .05, .6, .35); }
      voice('sawtooth', 120, 600, t, 3, .06, { lp: 2400, rev: .5 });
      noiseV(t + 3.1, 2.6, .5, { type: 'lowpass', f0: 3000, f1: 60, a: .01, rev: .6 }); voice('sine', 100, 22, t + 3.1, 2, .85);
      [72, 76, 79, 84, 88].forEach((m, i) => voice('triangle', mtof(m), mtof(m), t + 3.6 + i * .09, 1.6, .09, { rev: .7, del: .3 }));
      duck(.8, 4);
    },
    sunDie() {
      const t = now();
      voice('sawtooth', 70, 420, t, 3.2, .1, { lp: 1600, a: 1.8, rev: .5 }); voice('sawtooth', 73, 440, t, 3.2, .08, { lp: 1600, a: 1.8 });
      noiseV(t, 3.4, .3, { type: 'bandpass', f0: 200, f1: 6000, q: 1.5, a: 2.8, rev: .5 });
      for (let i = 0; i < 6; i++) voice('sine', 120, 40, t + i * .5, .5, .3);
      voice('sine', 110, 20, t + 3.4, 2.6, .95); noiseV(t + 3.4, 3, .55, { type: 'lowpass', f0: 2600, f1: 60, a: .01, rev: .6 });
      [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => voice('triangle', mtof(m), mtof(m), t + 3.8 + i * .11, 3, .11, { rev: .8, del: .35, a: .2 }));
      duck(.9, 5);
    },
    graze(o) { const t = now(); voice('sine', 1700 * rnd(.95, 1.1), 2600, t, .05, .035, { a: .002 }); },
    bossIntro() {
      const t = now();
      noiseV(t, 1.8, .3, { type: 'bandpass', f0: 200, f1: 5200, q: 2, a: 1.5, rev: .4 });
      voice('sine', 110, 26, t + 1.6, 1.2, .75); noiseV(t + 1.6, 1.2, .3, { type: 'lowpass', f0: 900, f1: 60, a: .01, rev: .5 });
    },
    voidRoar() {
      const t = now();
      voice('sawtooth', 58, 36, t, 2.8, .2, { lp: 520, a: .5, rev: .7 }); voice('sawtooth', 61, 38, t, 2.8, .14, { lp: 520, a: .5, rev: .7 });
      noiseV(t, 2.8, .26, { type: 'lowpass', f0: 700, f1: 70, a: .6, rev: .7 });
      voice('sine', 46, 28, t + .3, 2.4, .55);
      [40, 47, 52, 55].forEach(m => voice('sawtooth', mtof(m), mtof(m) * .5, t + .6, 2.2, .04, { lp: 600, a: .8, rev: .8 }));
      duck(.5, 2.8);
    },
    echoDie() {
      const t = now();
      for (let i = 0; i < 16; i++) { const d = i * .1 * (1 - i * .025); voice('square', 200 + rnd(0, 1200), 80 + rnd(0, 300), t + d, .06, .08, { lp: 3000 }); noiseV(t + d, .05, .07, { type: 'bandpass', f0: 1500 + rnd(0, 4000), q: 3 }); }
      voice('sawtooth', 880, 55, t + .1, 2, .15, { lp: 1800, rev: .4 }); voice('sawtooth', 884, 58, t + .1, 2, .11, { lp: 1800 });
      noiseV(t + 1.7, .9, .26, { type: 'lowpass', f0: 3000, f1: 100, a: .05, rev: .4 });
      voice('sine', 90, 24, t + 1.9, 1.2, .6);
      [69, 73, 76, 81, 85].forEach((m, i) => voice('triangle', mtof(m), mtof(m), t + 2.4 + i * .1, 1.8, .1, { rev: .7, del: .3 }));
      duck(.6, 3.2);
    },
    voidDie() {
      const t = now();
      voice('sine', 62, 18, t, 3.6, .7);
      noiseV(t, 3.8, .35, { type: 'lowpass', f0: 420, f1: 40, a: .2, rev: .6 });
      [40, 47, 52, 55, 59].forEach(m => voice('sawtooth', mtof(m), mtof(m) * .5, t + .2, 3.4, .05, { lp: 700, a: 1.3, rev: .8 }));
      noiseV(t + .5, 3.4, .3, { type: 'bandpass', f0: 300, f1: 9000, q: 3, a: 3, rev: .5 });
      voice('sine', 100, 22, t + 4.2, 2.6, .95); noiseV(t + 4.2, 2.8, .5, { type: 'lowpass', f0: 2000, f1: 60, a: .01, rev: .6 });
      [60, 64, 67, 72, 76, 79].forEach((m, i) => voice('triangle', mtof(m), mtof(m), t + 4.5 + i * .13, 3.2, .12, { rev: .8, del: .35, a: .3 }));
      [84, 88, 91, 96, 100].forEach((m, i) => voice('sine', mtof(m), mtof(m), t + 5.1 + i * .2, 1.6, .07, { rev: .8, del: .3 }));
      duck(.9, 6);
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

  const GAP = { graze: .07, blip: .028, shoot: .04, hit: .035, bossHit: .06, xp: .03, enemyShoot: .06, explode: .02, coin: .03 };
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

  // ---------- musica epica: cordas, metais, taiko; um tema por fase + um tema de chefe por fase ----------
  const MIN = [0, 2, 3, 5, 7, 8, 10], MAJ = [0, 2, 4, 5, 7, 9, 11], PHR = [0, 1, 3, 5, 7, 8, 10];
  // chords = grau (escala menor natural) por compasso; mel = [passo 0-15, grau, duracao em passos]
  const T = (root, bpm, chords, mel, extra) => Object.assign({ root, scale: MIN, bpm, chords, mel }, extra);
  const THEMES = {
    // 1. Nebulosa Violeta: re menor, heroico e celestial
    s1: T(62, 122, [0, 5, 2, 6, 0, 5, 6, 4], [
      [[0, 4, 4], [4, 7, 4], [8, 9, 8]],
      [[0, 9, 4], [4, 7, 4], [8, 5, 8]],
      [[0, 4, 4], [4, 6, 4], [8, 9, 8]],
      [[0, 10, 4], [4, 8, 4], [8, 6, 8]],
      [[0, 7, 2], [2, 9, 2], [4, 11, 4], [8, 9, 4], [12, 7, 4]],
      [[0, 9, 2], [2, 10, 2], [4, 9, 4], [8, 7, 4], [12, 5, 4]],
      [[0, 6, 2], [2, 8, 2], [4, 10, 4], [8, 12, 4], [12, 10, 4]],
      [[0, 11, 8], [8, 9, 4], [12, 8, 4]]],
      { kick: '1000001010000010', snare: '0000100000001000', flair: 'bells' }),
    // 2. Cinturao de Asteroides: do menor, marcha pesada
    s2: T(60, 112, [0, 0, 5, 4, 0, 3, 6, 4], [
      [[0, 4, 3], [3, 4, 1], [4, 7, 4], [8, 4, 8]],
      [[0, 2, 3], [3, 2, 1], [4, 4, 4], [8, 2, 8]],
      [[0, 5, 3], [3, 5, 1], [4, 7, 4], [8, 9, 8]],
      [[0, 4, 3], [3, 4, 1], [4, 6, 4], [8, 8, 8]],
      [[0, 7, 3], [3, 7, 1], [4, 9, 4], [8, 11, 4], [12, 9, 4]],
      [[0, 10, 3], [3, 10, 1], [4, 9, 4], [8, 7, 8]],
      [[0, 6, 3], [3, 6, 1], [4, 8, 4], [8, 10, 4], [12, 8, 4]],
      [[0, 11, 4], [4, 8, 4], [8, 4, 8]]],
      { kick: '1000100010001010', snare: '0000100000001000', flair: 'anvil' }),
    // 3. Tempestade Ionica: la menor, eletrica e veloz
    s3: T(57, 132, [0, 5, 2, 6, 0, 3, 6, 4], [
      [[0, 11, 2], [2, 9, 2], [4, 7, 2], [6, 9, 2], [8, 11, 4], [12, 9, 4]],
      [[0, 12, 2], [2, 9, 2], [4, 7, 2], [6, 9, 2], [8, 12, 4], [12, 9, 4]],
      [[0, 13, 2], [2, 11, 2], [4, 9, 2], [6, 11, 2], [8, 13, 4], [12, 11, 4]],
      [[0, 10, 2], [2, 8, 2], [4, 13, 2], [6, 10, 2], [8, 8, 8]],
      [[0, 7, 2], [2, 9, 2], [4, 11, 2], [6, 14, 2], [8, 11, 4], [12, 9, 4]],
      [[0, 10, 2], [2, 12, 2], [4, 14, 2], [6, 12, 2], [8, 10, 8]],
      [[0, 13, 2], [2, 10, 2], [4, 8, 2], [6, 10, 2], [8, 13, 4], [12, 10, 4]],
      [[0, 11, 4], [4, 13, 4], [8, 11, 8]]],
      { kick: '1001001010010010', snare: '0000100000001000', flair: 'thunder', shaker: true }),
    // 4. Zona Solar: mi menor, fanfarra heroica
    s4: T(64, 138, [0, 5, 2, 6, 0, 5, 6, 6], [
      [[0, 4, 4], [4, 7, 4], [8, 9, 8]],
      [[0, 9, 4], [4, 7, 4], [8, 5, 8]],
      [[0, 4, 4], [4, 6, 4], [8, 9, 8]],
      [[0, 8, 4], [4, 10, 4], [8, 8, 4], [12, 6, 4]],
      [[0, 7, 2], [2, 9, 2], [4, 11, 4], [8, 9, 4], [12, 7, 4]],
      [[0, 9, 2], [2, 10, 2], [4, 9, 4], [8, 7, 4], [12, 5, 4]],
      [[0, 8, 2], [2, 10, 2], [4, 12, 4], [8, 10, 4], [12, 8, 4]],
      [[0, 10, 8], [8, 8, 4], [12, 6, 4]]],
      { kick: '1010001010100010', snare: '0000100000001000', flair: 'fanfare' }),
    // ---- temas de chefe: mais rapidos, riffs insistentes, percussao pesada ----
    b1: T(50, 150, [0, 0, 5, 6, 0, 0, 3, 4], [
      [[0, 7, 2], [2, 7, 2], [4, 9, 2], [6, 7, 2], [8, 11, 2], [10, 10, 2], [12, 9, 2], [14, 8, 2]],
      [[0, 7, 2], [2, 7, 2], [4, 9, 2], [6, 7, 2], [8, 14, 4], [12, 11, 4]],
      [[0, 12, 2], [2, 12, 2], [4, 14, 2], [6, 12, 2], [8, 16, 2], [10, 15, 2], [12, 14, 2], [14, 13, 2]],
      [[0, 13, 2], [2, 13, 2], [4, 15, 2], [6, 13, 2], [8, 17, 4], [12, 15, 4]],
      [[0, 7, 2], [2, 7, 2], [4, 9, 2], [6, 7, 2], [8, 11, 2], [10, 10, 2], [12, 9, 2], [14, 8, 2]],
      [[0, 7, 2], [2, 7, 2], [4, 9, 2], [6, 7, 2], [8, 14, 4], [12, 11, 4]],
      [[0, 10, 2], [2, 10, 2], [4, 12, 2], [6, 10, 2], [8, 14, 2], [10, 13, 2], [12, 12, 2], [14, 11, 2]],
      [[0, 11, 4], [4, 13, 4], [8, 15, 4], [12, 15, 4]]],
      { kick: '1000101010001011', snare: '0000100000001000', flair: 'bells' }),
    b2: T(48, 134, [0, 0, 5, 4, 0, 0, 6, 4], [
      [[0, 7, 3], [4, 7, 3], [8, 9, 2], [10, 7, 2], [12, 11, 4]],
      [[0, 7, 3], [4, 7, 3], [8, 9, 2], [10, 11, 2], [12, 14, 4]],
      [[0, 12, 3], [4, 12, 3], [8, 14, 2], [10, 12, 2], [12, 16, 4]],
      [[0, 11, 3], [4, 11, 3], [8, 13, 2], [10, 11, 2], [12, 15, 4]],
      [[0, 14, 3], [4, 14, 3], [8, 16, 2], [10, 14, 2], [12, 18, 4]],
      [[0, 14, 3], [4, 14, 3], [8, 16, 2], [10, 18, 2], [12, 19, 4]],
      [[0, 13, 2], [2, 15, 2], [4, 17, 4], [8, 15, 2], [10, 13, 2], [12, 15, 4]],
      [[0, 18, 8], [8, 15, 4], [12, 11, 4]]],
      { kick: '1000100010101010', snare: '0000100000001000', flair: 'anvil' }),
    b3: T(45, 158, [0, 0, 5, 6, 0, 3, 4, 4], [
      [[0, 7, 1], [1, 7, 1], [2, 9, 1], [3, 7, 1], [4, 11, 2], [6, 9, 2], [8, 7, 1], [9, 7, 1], [10, 9, 1], [11, 7, 1], [12, 12, 2], [14, 11, 2]],
      [[0, 7, 1], [1, 7, 1], [2, 9, 1], [3, 7, 1], [4, 11, 2], [6, 14, 2], [8, 11, 4], [12, 9, 4]],
      [[0, 9, 1], [1, 9, 1], [2, 12, 1], [3, 9, 1], [4, 14, 2], [6, 12, 2], [8, 9, 4], [12, 12, 4]],
      [[0, 10, 1], [1, 10, 1], [2, 13, 1], [3, 10, 1], [4, 8, 2], [6, 10, 2], [8, 13, 4], [12, 10, 4]],
      [[0, 7, 1], [1, 7, 1], [2, 9, 1], [3, 7, 1], [4, 11, 2], [6, 9, 2], [8, 7, 1], [9, 7, 1], [10, 9, 1], [11, 7, 1], [12, 12, 2], [14, 11, 2]],
      [[0, 10, 1], [1, 10, 1], [2, 12, 1], [3, 10, 1], [4, 14, 2], [6, 12, 2], [8, 10, 4], [12, 12, 4]],
      [[0, 11, 2], [2, 13, 2], [4, 11, 2], [6, 8, 2], [8, 11, 4], [12, 13, 4]],
      [[0, 13, 4], [4, 11, 4], [8, 8, 4], [12, 11, 4]]],
      { kick: '1001001010010010', snare: '0000100000001000', flair: 'thunder', shaker: true }),
    b4: T(52, 148, [0, 5, 6, 0, 0, 5, 6, 4], [
      [[0, 7, 2], [2, 7, 2], [4, 9, 2], [6, 7, 2], [8, 11, 4], [12, 9, 4]],
      [[0, 9, 2], [2, 7, 2], [4, 5, 4], [8, 7, 4], [12, 9, 4]],
      [[0, 8, 2], [2, 10, 2], [4, 12, 4], [8, 10, 4], [12, 8, 4]],
      [[0, 7, 8], [8, 9, 4], [12, 7, 4]],
      [[0, 11, 2], [2, 11, 2], [4, 12, 2], [6, 11, 2], [8, 9, 4], [12, 11, 4]],
      [[0, 9, 2], [2, 11, 2], [4, 12, 4], [8, 11, 4], [12, 9, 4]],
      [[0, 8, 2], [2, 10, 2], [4, 12, 2], [6, 10, 2], [8, 8, 8]],
      [[0, 11, 4], [4, 8, 4], [8, 6, 4], [12, 8, 4]]],
      { kick: '1010001010100011', snare: '0000100000001000', flair: 'fanfare' }),
  };
  THEMES.menu = Object.assign({}, THEMES.s1, { bpm: 84 });
  // ---- trilhas da historia: esperanca, tristeza, tensao, misterio, heroismo e triunfo ----
  Object.assign(THEMES, {
    hope: T(60, 70, [0, 4, 5, 3, 0, 4, 3, 4], [
      [[0, 7, 8], [8, 9, 8]], [[0, 8, 8], [8, 6, 8]], [[0, 7, 6], [6, 9, 4], [10, 11, 6]], [[0, 10, 8], [8, 9, 8]],
      [[0, 9, 8], [8, 11, 8]], [[0, 12, 8], [8, 11, 8]], [[0, 10, 6], [6, 9, 4], [10, 8, 6]], [[0, 6, 8], [8, 8, 8]]], { scale: MAJ, cine: 'hope' }),
    sad: T(57, 56, [0, 5, 3, 4, 0, 5, 3, 4], [
      [[0, 11, 8], [8, 9, 8]], [[0, 9, 8], [8, 7, 8]], [[0, 10, 8], [8, 7, 8]], [[0, 11, 6], [6, 9, 4], [10, 8, 6]],
      [[0, 7, 16]], [[0, 12, 8], [8, 9, 8]], [[0, 10, 8], [8, 7, 8]], [[0, 8, 12], [12, 9, 4]]], { cine: 'sad' }),
    tension: T(50, 92, [0, 0, 1, 0, 0, 0, 5, 1], [
      [[0, 7, 3], [4, 7, 2], [6, 8, 2], [8, 7, 8]], [[0, 7, 3], [4, 7, 2], [6, 9, 2], [8, 8, 8]], [[0, 8, 3], [4, 8, 2], [6, 9, 2], [8, 8, 8]], [[0, 7, 12], [12, 6, 4]],
      [[0, 7, 3], [4, 7, 2], [6, 8, 2], [8, 7, 8]], [[0, 7, 3], [4, 7, 2], [6, 9, 2], [8, 8, 8]], [[0, 12, 3], [4, 12, 2], [6, 11, 2], [8, 12, 8]], [[0, 8, 6], [6, 7, 2], [8, 8, 4], [12, 7, 4]]], { scale: PHR, cine: 'tension' }),
    mystery: T(45, 54, [0, 1, 0, 1, 5, 1, 0, 1], [
      [[0, 14, 4], [8, 15, 4]], [[0, 17, 4], [8, 16, 4]], [[0, 15, 6], [8, 14, 8]], [[4, 19, 4], [12, 18, 4]],
      [[0, 14, 4], [8, 15, 4]], [[0, 17, 4], [8, 16, 4]], [[0, 15, 6], [8, 14, 8]], [[4, 19, 6], [12, 18, 4]]], { scale: PHR, cine: 'mystery' }),
    heroic: T(62, 116, [0, 4, 5, 3, 0, 4, 3, 4], [
      [[0, 7, 4], [4, 9, 4], [8, 11, 8]], [[0, 11, 4], [4, 9, 4], [8, 8, 8]], [[0, 9, 4], [4, 10, 4], [8, 9, 8]], [[0, 10, 4], [4, 12, 4], [8, 14, 8]],
      [[0, 14, 2], [2, 13, 2], [4, 11, 4], [8, 9, 4], [12, 7, 4]], [[0, 8, 4], [4, 11, 4], [8, 13, 8]], [[0, 10, 4], [4, 12, 4], [8, 10, 4], [12, 8, 4]], [[0, 11, 8], [8, 13, 4], [12, 11, 4]]],
      { scale: MAJ, kick: '1000100010001010', snare: '0000100000001000', flair: 'fanfare' }),
  });
  THEMES.triumph = Object.assign({}, THEMES.heroic, { bpm: 100, root: 64, flair: 'bells' });
  THEMES.defeat = Object.assign({}, THEMES.sad, { bpm: 50 });
  // ---- Parte 2 ----
  Object.assign(THEMES, {
    s5: T(57, 98, [0, 5, 3, 4, 0, 5, 6, 4], [
      [[0, 7, 4], [4, 9, 2], [6, 8, 2], [8, 7, 8]], [[0, 5, 4], [4, 7, 2], [6, 6, 2], [8, 5, 8]],
      [[0, 6, 4], [4, 8, 2], [6, 7, 2], [8, 6, 8]], [[0, 7, 8], [8, 9, 4], [12, 8, 4]],
      [[0, 7, 4], [4, 9, 2], [6, 11, 2], [8, 10, 8]], [[0, 9, 4], [4, 8, 2], [6, 7, 2], [8, 5, 8]],
      [[0, 6, 4], [4, 7, 4], [8, 8, 4], [12, 9, 4]], [[0, 7, 16]]],
      { kick: '1000000010000010', snare: '0000100000001000', flair: 'bells' }),
    s6: T(52, 106, [0, 0, 5, 4, 0, 0, 6, 4], [
      [[0, 7, 2], [2, 7, 2], [4, 9, 2], [6, 7, 2], [8, 8, 4], [12, 7, 4]], [[0, 7, 2], [2, 7, 2], [4, 9, 2], [6, 11, 2], [8, 10, 4], [12, 9, 4]],
      [[0, 5, 2], [2, 5, 2], [4, 7, 2], [6, 5, 2], [8, 6, 4], [12, 5, 4]], [[0, 4, 4], [4, 5, 4], [8, 6, 4], [12, 7, 4]],
      [[0, 7, 2], [2, 9, 2], [4, 11, 2], [6, 9, 2], [8, 7, 8]], [[0, 11, 2], [2, 10, 2], [4, 9, 4], [8, 8, 4], [12, 7, 4]],
      [[0, 6, 2], [2, 8, 2], [4, 10, 4], [8, 9, 4], [12, 8, 4]], [[0, 7, 8], [8, 5, 8]]],
      { kick: '1000100010001000', snare: '0000100000001000', flair: 'thunder', shaker: true }),
    b5: T(50, 154, [0, 0, 6, 5, 0, 0, 4, 3], [
      [[0, 7, 1], [1, 7, 1], [2, 10, 1], [3, 7, 1], [4, 12, 2], [6, 10, 2], [8, 9, 4], [12, 7, 4]],
      [[0, 7, 1], [1, 7, 1], [2, 10, 1], [3, 7, 1], [4, 12, 2], [6, 14, 2], [8, 12, 4], [12, 10, 4]],
      [[0, 9, 1], [1, 9, 1], [2, 12, 1], [3, 9, 1], [4, 14, 2], [6, 12, 2], [8, 10, 4], [12, 9, 4]],
      [[0, 8, 1], [1, 8, 1], [2, 11, 1], [3, 8, 1], [4, 13, 2], [6, 11, 2], [8, 8, 4], [12, 11, 4]],
      [[0, 7, 1], [1, 7, 1], [2, 10, 1], [3, 7, 1], [4, 12, 2], [6, 10, 2], [8, 9, 4], [12, 7, 4]],
      [[0, 14, 2], [2, 12, 2], [4, 10, 2], [6, 12, 2], [8, 14, 4], [12, 16, 4]],
      [[0, 11, 2], [2, 13, 2], [4, 11, 2], [6, 9, 2], [8, 11, 8]], [[0, 12, 4], [4, 10, 4], [8, 9, 4], [12, 7, 4]]],
      { kick: '1001001010010010', snare: '0000100000001000', flair: 'anvil', shaker: true }),
    b6: T(48, 166, [0, 0, 5, 6, 0, 0, 1, 6], [
      [[0, 7, 2], [2, 7, 2], [4, 10, 2], [6, 7, 2], [8, 12, 4], [12, 11, 4]], [[0, 7, 2], [2, 7, 2], [4, 10, 2], [6, 12, 2], [8, 14, 4], [12, 12, 4]],
      [[0, 12, 2], [2, 12, 2], [4, 14, 2], [6, 12, 2], [8, 16, 4], [12, 14, 4]], [[0, 13, 2], [2, 13, 2], [4, 11, 2], [6, 13, 2], [8, 15, 4], [12, 13, 4]],
      [[0, 14, 1], [1, 14, 1], [2, 16, 1], [3, 14, 1], [4, 17, 2], [6, 16, 2], [8, 14, 4], [12, 12, 4]],
      [[0, 14, 1], [1, 14, 1], [2, 16, 1], [3, 14, 1], [4, 19, 2], [6, 17, 2], [8, 16, 4], [12, 14, 4]],
      [[0, 8, 2], [2, 10, 2], [4, 12, 2], [6, 14, 2], [8, 16, 8]], [[0, 18, 4], [4, 16, 4], [8, 14, 4], [12, 12, 4]]],
      { kick: '1010001010100010', snare: '0000100000001000', flair: 'fanfare', shaker: true }),
  });
  THEMES.credits = Object.assign({}, THEMES.hope, { bpm: 64 });
  const mus = { on: false, key: null, th: null, inten: 0, step: 0, next: 0, timer: null, lay: { combo: 0, danger: 0 } };
  let pending = null;

  const noteOf = (th, d) => { const n = th.scale.length; return th.root + th.scale[((d % n) + n) % n] + 12 * Math.floor(d / n); };
  const stepDur = () => 60 / mus.th.bpm / 4;

  function taiko(t, v) {
    voice('sine', 100, 42, t, .4, v, { bus: musBus });
    voice('triangle', 190, 70, t, .12, v * .35, { bus: musBus });
    noiseV(t, .09, v * .4, { type: 'lowpass', f0: 520, bus: musBus });
  }
  function snare(t, v) {
    noiseV(t, .17, v, { type: 'bandpass', f0: 2000, q: .7, bus: musBus, rev: .28 });
    voice('triangle', 180, 110, t, .1, v * .6, { bus: musBus });
  }
  function pluck(m, t, dur, v, o = {}) {
    const f = mtof(m);
    voice('sine', f, f, t, dur, v, Object.assign({ bus: musBus, a: .006, del: .3, rev: .35 }, o));
    voice('sine', f * 2, f * 2, t, dur * .6, v * .35, Object.assign({ bus: musBus, a: .006, rev: .35 }, o));
  }

  // trilhas cinematograficas da historia (sem bateria constante): piano, cordas, drones, sinos
  function scheduleCine(step, t) {
    const th = mus.th, kind = th.cine, bar = Math.floor(step / 16) % 8, s = step % 16, sd = stepDur();
    const deg = th.chords[bar], chord = [deg, deg + 2, deg + 4].map(d => noteOf(th, d));
    const piano = (m, dur, v) => {
      const f = mtof(m);
      voice('triangle', f, f, t, dur, v, { bus: cineBus, a: .004, rev: .5, del: .12 });
      voice('sine', f * 2, f * 2, t, dur * .6, v * .3, { bus: cineBus, a: .004, rev: .5 });
      voice('sine', f, f, t, dur * 1.6, v * .5, { bus: cineBus, a: .01, rev: .6 });
    };
    const pad = (v, lp, a) => { if (s === 0) chord.forEach(m => [-6, 6].forEach(dt => voice('sawtooth', mtof(m - 12), mtof(m - 12), t, sd * 16 + .6, v, { bus: cineBus, lp, detune: dt, a, hold: sd * 14, rev: .6 }))); };
    const mel = th.mel[bar];
    if (kind === 'hope') {
      pad(.013, 1400, .6);
      if (s === 0) voice('sine', mtof(chord[0] - 24), mtof(chord[0] - 24), t, sd * 14, .1, { bus: cineBus, a: .1 });
      if (s % 2 === 0) piano(chord[[0, 1, 2, 1][(s / 2) % 4]] + 12, sd * 3, .02);
      for (const [ms, d, len] of mel) if (ms === s) { const f = mtof(noteOf(th, d)), dur = len * sd * 1.2; piano(noteOf(th, d), dur, .07); voice('sawtooth', f, f, t, dur, .02, { bus: cineBus, lp: 1500, a: .15, rev: .5 }); }
      if (bar % 4 === 0 && s === 0) pluck(chord[2] + 24, t, 1.2, .02);
    } else if (kind === 'sad') {
      pad(.011, 900, .9);
      if (s === 0) { voice('sawtooth', mtof(chord[0] - 24), mtof(chord[0] - 24), t, sd * 15, .07, { bus: cineBus, lp: 360, a: .2 }); voice('sine', mtof(chord[0] - 24), mtof(chord[0] - 24), t, sd * 15, .08, { bus: cineBus, a: .2 }); }
      if (s % 4 === 0) piano(chord[[0, 1, 2, 1][s / 4]], sd * 5, .02);
      for (const [ms, d, len] of mel) if (ms === s) { const dur = len * sd * 1.5 + .4; piano(noteOf(th, d), dur, .06); voice('sawtooth', mtof(noteOf(th, d) - 12), mtof(noteOf(th, d) - 12), t, dur, .025, { bus: cineBus, lp: 900, a: .12, rev: .5 }); }
    } else if (kind === 'tension') {
      pad(.012, 700, .5);
      if (s === 0) voice('sawtooth', mtof(chord[0] - 24), mtof(chord[0] - 24), t, sd * 16, .06, { bus: cineBus, lp: 260, a: .3 });
      if (s === 0) taiko(t, .28); if (s === 3) taiko(t, .2);
      voice('sawtooth', mtof(chord[0]), mtof(chord[0]), t, sd * 1.1, s % 4 === 0 ? .018 : .01, { bus: cineBus, lp: 1400, a: .004, rev: .2 });
      if (bar % 4 === 3 && s === 0) noiseV(t, sd * 16, .05, { type: 'bandpass', f0: 300, f1: 4000, q: 1.2, a: sd * 13, bus: cineBus, rev: .4 });
      if (s === 12) snare(t, .05);
      for (const [ms, d, len] of mel) if (ms === s) { const f = mtof(noteOf(th, d)), dur = len * sd * .8 + .1; voice('sawtooth', f, f, t, dur, .05, { bus: cineBus, lp: 700, lp1: 2400, a: .025, rev: .35 }); voice('sawtooth', f / 2, f / 2, t, dur, .03, { bus: cineBus, lp: 600, a: .03, rev: .3 }); }
    } else if (kind === 'mystery') {
      if (s === 0) { for (const dt of [-9, 9]) voice('sawtooth', mtof(chord[0] - 24), mtof(chord[0] - 24), t, sd * 16 + .5, .05, { bus: cineBus, lp: 220, detune: dt, a: 1 }); voice('sine', mtof(chord[2] - 12), mtof(chord[2] - 12), t, sd * 16, .02, { bus: cineBus, a: 1.2, rev: .7 }); }
      if (s === 0 && bar % 2 === 0) noiseV(t, sd * 14, .04, { type: 'bandpass', f0: 1500, f1: 3000, q: 2, a: sd * 7, bus: cineBus, rev: .7 });
      if (s === 0 && bar % 4 === 0) taiko(t, .3);
      for (const [ms, d, len] of mel) if (ms === s) { const f = mtof(noteOf(th, d)); voice('sine', f, f, t, len * sd + 1.8, .05, { bus: cineBus, a: .01, rev: .8, del: .4 }); voice('sine', f * 1.0595, f * 1.0595, t, len * sd + 1.2, .02, { bus: cineBus, a: .02, rev: .8 }); voice('sine', f * 2.01, f * 2.01, t, len * sd + .8, .015, { bus: cineBus, rev: .8 }); }
    }
  }

  function scheduleStep(step, t) {
    if (mus.th.cine) return scheduleCine(step, t);
    const th = mus.th, inten = mus.inten, boss = inten === 2, bar = Math.floor(step / 16) % 8, s = step % 16, sd = stepDur();
    const deg = th.chords[bar];
    const chord = [deg, deg + 2, deg + 4].map(d => noteOf(th, d));

    // cordas: acorde aberto, entrando devagar
    if (s === 0) {
      [chord[0] - 12, chord[1] - 12, chord[2] - 12, chord[0]].forEach(m => {
        const f = mtof(m);
        [-8, 8].forEach(dt => voice('sawtooth', f, f, t, sd * 16 + .5, inten === 0 ? .01 : .013, { bus: musBus, lp: 1500, detune: dt, a: .45, hold: sd * 14, rev: .55 }));
      });
    }
    // ostinato de cordas (corrida)
    if (inten >= 1) {
      const div = boss ? 1 : 2;
      if (s % div === 0) {
        const m = chord[[0, 1, 2, 1][(s / div) % 4]] + 12;
        voice('sawtooth', mtof(m), mtof(m), t, sd * div * 1.15, (s % 4 === 0 ? .02 : .013) * (boss ? 1.15 : 1), { bus: musBus, lp: 2300, lp1: 900, a: .004, rev: .2 });
      }
    }
    // baixo profundo
    const bass = (m, dur, v) => {
      voice('sawtooth', mtof(m - 24), mtof(m - 24), t, dur, v, { bus: musBus, lp: 400, q: 1 });
      voice('sine', mtof(m - 24), mtof(m - 24), t, dur, v * .9, { bus: musBus });
    };
    if (inten === 0) { if (s === 0) bass(chord[0], sd * 14, .09); }
    else if (!boss) { if (s === 0) bass(chord[0], sd * 7, .13); if (s === 8) bass(chord[0], sd * 6, .11); if (s === 12 && bar % 2) bass(chord[2], sd * 3, .08); }
    else if (s % 2 === 0) bass(chord[0], sd * 1.8, .12);

    // melodia nos metais (filtro abre durante a nota)
    for (const [ms, d, len] of th.mel[bar]) {
      if (ms !== s) continue;
      const f = mtof(noteOf(th, d)), dur = len * sd * .95 + .1, v = inten === 0 ? .05 : (boss ? .07 : .062);
      voice('sawtooth', f, f, t, dur, v * .75, { bus: musBus, lp: 800, lp1: 2700, a: .035, rev: .35, del: .2 });
      voice('sawtooth', f, f, t, dur, v * .5, { bus: musBus, lp: 800, lp1: 2700, a: .035, rev: .35, detune: 7 });
      voice('triangle', f, f, t, dur, v * .6, { bus: musBus, a: .03, rev: .3 });
      if (boss) voice('sawtooth', f / 2, f / 2, t, dur, .03, { bus: musBus, lp: 1200, a: .03, rev: .3 });
    }

    // percussao
    if (inten >= 1) {
      if (th.kick[s] === '1') taiko(t, boss ? .5 : .4);
      if (th.snare[s] === '1') snare(t, boss ? .1 : .075);
      if (boss && bar === 7 && s >= 8) snare(t, .04 + (s - 8) * .008);          // rufar antes de repetir
      if (s === 0 && bar % 4 === 0) noiseV(t, 1.5, boss ? .06 : .045, { type: 'highpass', f0: 5500, a: .9, bus: musBus, rev: .4 });
      if (th.shaker && s % 2 === 0) noiseV(t, .04, .014, { type: 'bandpass', f0: 6500, q: 1, bus: musBus });
    } else if (s === 0 && bar % 2 === 0) taiko(t, .2);

    // cor de cada bioma
    if (inten >= 1) {
      if (th.flair === 'bells' && s % 4 === 2) pluck(chord[(s / 4 | 0) % 3] + 24, t, sd * 4, .012);
      if (th.flair === 'anvil' && (s === 4 || s === 12)) { voice('square', 1560, 1500, t, .06, .02, { bus: musBus, lp: 5000 }); noiseV(t, .05, .02, { type: 'bandpass', f0: 4200, bus: musBus }); }
      if (th.flair === 'thunder' && s === 0 && bar % 4 === 0) noiseV(t, 1.8, .15, { type: 'lowpass', f0: 260, f1: 60, a: .06, bus: musBus, rev: .4 });
      if (th.flair === 'fanfare' && (s === 0 || s === 10)) chord.forEach(m => voice('sawtooth', mtof(m), mtof(m), t, sd * 2.4, .02, { bus: musBus, lp: 1800, a: .02, rev: .3 }));
    } else if (inten === 0 && s % 8 === 4) pluck(chord[(s / 8 | 0) % 3] + 24, t, sd * 6, .012);

    // camadas dinamicas: combo alto deixa a musica mais cheia; vida baixa traz tensao
    const L = mus.lay;
    if (inten >= 1 && L.combo >= 1) {
      if (s % 2 === 0) pluck(chord[(s / 2 | 0) % 3] + 24 + (s % 4 === 0 ? 0 : 12), t, sd * 2, .017);
      if (L.combo >= 2) {
        if (s % 4 === 2) noiseV(t, .05, .022, { type: 'bandpass', f0: 7000, q: 1, bus: musBus });
        if (s % 8 === 4) snare(t, .05);
        if (s % 8 === 0) voice('sawtooth', mtof(chord[2] + 12), mtof(chord[2] + 12), t, sd * 6, .018, { bus: musBus, lp: 2200, a: .02, rev: .3 });
      }
    }
    if (inten >= 1 && L.danger) {
      if (s === 0 || s === 6) voice('sine', 64, 38, t, .28, .2, { bus: musBus });
      if (s === 1 || s === 7) voice('sine', 58, 36, t, .22, .1, { bus: musBus });
      if (s === 0) voice('sawtooth', mtof(chord[0] - 12 + 6), mtof(chord[0] - 12 + 6), t, sd * 16, .013, { bus: musBus, lp: 600, a: .3 });
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
    const t = now(), xf = mus.on; // havia musica tocando? entao e uma troca suave
    if (xf) {
      const old = musBus, oldCine = cineBus;
      old.gain.cancelScheduledValues(t); old.gain.setValueAtTime(old.gain.value, t); old.gain.setTargetAtTime(.0001, t, .5);
      setTimeout(() => { try { old.disconnect(); oldCine.disconnect(); } catch (e) { } }, 4500);
    }
    mus.on = false; clearInterval(mus.timer);
    newTrackBus();
    mus.key = key; mus.th = THEMES[key] || THEMES.s1; mus.inten = inten; mus.lay = { combo: 0, danger: 0 };
    mus.step = 0; mus.next = now() + .08; mus.on = true;
    musBus.gain.setValueAtTime(.0001, t);
    musBus.gain.setValueAtTime(.0001, t + (xf ? .35 : 0));
    musBus.gain.linearRampToValueAtTime(1, t + (xf ? .35 : 0) + (xf ? 2 : 1.2));
    musMaster.gain.cancelScheduledValues(t); musMaster.gain.setValueAtTime(vol.music * MUS_TRIM, t);
    clearInterval(mus.timer);
    mus.timer = setInterval(tick, 40);
  }
  function setIntensity(i) { mus.inten = i; }
  function setLayers(c, d) { mus.lay.combo = c; mus.lay.danger = d; }
  function musicStop(fast) {
    pending = null;
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
    if (musMaster) musMaster.gain.value = m * MUS_TRIM;
  }
  function peak() {
    if (!analyser) return -1;
    const b = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(b);
    let p = 0; for (const v of b) p = Math.max(p, Math.abs(v)); return p;
  }

  return { get track() { return mus.on ? mus.key : null; }, init, play, panX, musicPlay, musicStop, setIntensity, setLayers, setVolumes, peak, duck, get ready() { return !!ac; }, get state() { return ac && ac.state; } };
})();
