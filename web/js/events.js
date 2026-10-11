'use strict';
// ---------- eventos de fase: cada bioma tem os seus ----------
const EVENT_INFO = {
  giant: ['PLANETA GIGANTE', 'Passando bem perto!', '#b98cff', 16],
  rain: ['ALERTA!', 'Chuva de asteroides', '#ff8a5f', 11],
  mines: ['CAMPO MINADO', 'Mantenha distância das minas', '#ff6a6a', 12],
  storm: ['TEMPESTADE IÔNICA', 'Fique de olho nos avisos no chão', '#ff7ac8', 16],
  flare: ['ERUPÇÃO SOLAR', 'Chamas varrendo a tela', '#ffb340', 15],
  worm: ['BURACO DE MINHOCA', 'Hiperespaço! Horda a caminho', '#7fe0ff', 8],
};

const Events = {
  cur: null, queue: [], banner: null, flash: 0, bolts: [], last: '',

  reset(stage) { this.cur = null; this.banner = null; this.flash = 0; this.bolts = []; this.queue = stage ? stage.events.map(e => ({ ...e })) : []; World.boost = 0; },
  cancel() { this.cur = null; this.queue = []; World.boost = 0; },
  get active() { return this.cur ? this.cur.name : null; },

  start(name) {
    const info = EVENT_INFO[name];
    this.cur = { name, t: 0, dur: info[3], a: 0, b: 0 };
    this.banner = { t: 0, title: info[0], sub: info[1], c: info[2] };
    const c = this.cur;
    if (name === 'giant') c.p = { x: rand(W * .3, W * .7), y: -420, r: 320, a: 1, pal: pick(World.pal.planets), tilt: rand(-.4, .2), par: .12, ph: rand(0, 6) };
    if (name === 'worm') { c.lines = Array.from({ length: 80 }, () => ({ a: rand(0, TAU), r: rand(10, 600), v: rand(.6, 1.4), c: Math.random() < .5 ? '#b98cff' : '#7fe0ff' })); Snd.play('warp'); }
    if (name === 'rain') { Snd.play('bossWarn'); }
    if (name === 'storm') Snd.play('rumble', { dur: 2.5 });
    if (name === 'flare') Snd.play('rumble', { dur: 2.5 });
    if (name === 'mines') Snd.play('uiDeny');
  },

  end() {
    const c = this.cur;
    if (c.name === 'worm') {
      this.flash = .9; flashScreen(.3); shake(14); shockwave(W / 2, H * .38, 800, '#7fe0ff');
      for (let i = 0; i < 12; i++) dropPickup('coin', rand(100, W - 100), rand(60, 300), 2);
      Snd.play('stageClear');
    }
    if (c.name === 'giant') dropPickup('heart', c.p.x > W / 2 ? 200 : W - 200, 40, 1);
    this.last = c.name; this.cur = null;
  },

  spawnMeteor() {
    const r = rand(18, 34);
    const pts = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * TAU, k = rand(.72, 1.12); return [Math.cos(a) * r * k, Math.sin(a) * r * k]; });
    spawnEnemy('rock', rand(40, W - 40), -50, { rad: r + 4, vx: rand(-110, 110), vy: rand(260, 460), rot: rand(0, 6), vr: rand(-2, 2), pts, hp: Math.ceil((r > 27 ? 3 : 2) * (1 + G.stage.id * .3)) });
  },

  hazardRect(cx, cy, w, h, warn, dur, c, kind) {
    G.hazards.push({ cx, cy, w, h, warn, dur, t: 0, c, kind, hit: false, fired: false });
  },

  update(dt) {
    if (this.banner) { this.banner.t += dt; if (this.banner.t > 3.2) this.banner = null; }
    this.flash = Math.max(0, this.flash - dt * 1.6);
    for (const b of this.bolts) b.life -= dt * 3;
    this.bolts = this.bolts.filter(b => b.life > 0);

    if (!this.cur) {
      World.boost += (0 - World.boost) * Math.min(1, 3 * dt);
      if (this.queue.length && G.t >= this.queue[0].at && !G.boss && !G.bossPending) this.start(this.queue.shift().name);
      return;
    }
    const c = this.cur; c.t += dt;
    const st = G.stage.id;
    switch (c.name) {
      case 'giant':
        c.p.y += 105 * dt;
        if (c.p.y - c.p.r * 1.4 > H) this.end();
        break;
      case 'rain':
        World.boost = .45;
        if (c.t > 2.4 && c.t < c.dur - 1) { c.a -= dt; if (c.a <= 0) { this.spawnMeteor(); c.a = rand(.1, .2) / (1 + st * .1); } }
        if (c.t >= c.dur) this.end();
        break;
      case 'mines':
        c.a -= dt;
        if (c.t > 1.5 && c.t < c.dur - 2 && c.a <= 0) {
          c.a = 2.2; const n = randi(3, 5);
          for (let i = 0; i < n; i++) spawnEnemy('mine', 140 + (W - 280) * (i + Math.random() * .6) / n, -30 - i * 40);
        }
        if (c.t >= c.dur) this.end();
        break;
      case 'storm':
        World.boost = .55;
        c.a -= dt;
        if (c.t > 1.5 && c.t < c.dur - 1.2 && c.a <= 0) {
          c.a = rand(.55, 1.1);
          const x = Math.random() < .6 ? clamp(G.player.x + rand(-70, 70), 80, W - 80) : rand(80, W - 80);
          this.hazardRect(x, H / 2, 110, H, .95, .3, '#ff7ac8', 'bolt');
        }
        c.b -= dt; if (c.b <= 0) { c.b = rand(.8, 2); this.bolts.push(this.makeBolt(rand(60, W - 60))); }
        if (c.t >= c.dur) this.end();
        break;
      case 'flare':
        World.boost = .3;
        c.a -= dt;
        if (c.t > 1.5 && c.t < c.dur - 2 && c.a <= 0) {
          c.a = rand(1.6, 2.4);
          const y = Math.random() < .6 ? clamp(G.player.y + rand(-60, 60), 80, H - 80) : rand(80, H - 80);
          this.hazardRect(W / 2, y, W + 40, 96, 1.25, .7, '#ffb340', 'beam');
        }
        if (c.t >= c.dur) this.end();
        break;
      case 'worm':
        if (c.t < c.dur - .8) World.warp = Math.max(World.warp, 3.5);
        for (const l of c.lines) { l.r = l.r * (1 + 2.2 * dt * l.v) + 60 * dt; if (l.r > 1000) { l.r = rand(5, 40); l.a = rand(0, TAU); } }
        c.a -= dt;
        if (c.t > 1.2 && c.t < c.dur - .8 && c.a <= 0) {
          c.a = .45;
          const n = randi(4, 7), x0 = rand(160, W - 160), tp = pick(['bit', 'drone', 'zig']);
          for (let i = 0; i < n; i++) spawnEnemy(tp, clamp(x0 + (i - (n - 1) / 2) * 70, 40, W - 40), -30 - Math.abs(i - (n - 1) / 2) * 40);
        }
        if (c.t >= c.dur) this.end();
        break;
    }
  },

  makeBolt(x) {
    const segs = []; let bx = x, y = -10; const endY = rand(H * .5, H * .95);
    while (y < endY) { segs.push([bx, y]); bx += rand(-38, 38); y += rand(28, 52); }
    const branches = [];
    for (let i = 0; i < 2; i++) {
      const s = segs[randi(2, Math.max(2, segs.length - 2))]; if (!s) continue;
      const br = []; let xx = s[0], yy = s[1];
      for (let k = 0; k < 4; k++) { br.push([xx, yy]); xx += rand(-50, 50); yy += rand(20, 40); }
      branches.push(br);
    }
    return { segs, branches, life: 1 };
  },

  // hazards compartilhados (eventos e chefes)
  updateHazards(dt) {
    const p = G.player;
    for (const h of G.hazards) {
      h.t += dt;
      if (!h.fired && h.t >= h.warn) {
        h.fired = true;
        if (h.kind === 'bolt') { this.bolts.push(this.makeBolt(h.cx)); this.flash = Math.max(this.flash, .35); shake(9); Snd.play('lightning'); }
        if (h.kind === 'beam') { shake(8); Snd.play('beam', { dur: h.dur }); }
        if (h.kind === 'laser') { shake(6); Snd.play('beam', { dur: h.dur }); }
      }
      if (!h.started) { h.started = true; if (h.kind === 'beam' || h.kind === 'laser') Snd.play('charge', { dur: h.warn }); }
      const active = h.t >= h.warn && h.t < h.warn + h.dur;
      if (active && !h.hit && p.inv <= 0 && !p.dead) {
        let hx = false;
        if (h.rot) { // retangulo girado (laser do chefe)
          const dx = p.x - h.cx, dy = p.y - h.cy, ca = Math.cos(-h.rot), sa = Math.sin(-h.rot);
          const lx = dx * ca - dy * sa, ly = dx * sa + dy * ca;
          hx = Math.abs(lx) < h.w / 2 + 12 && Math.abs(ly) < h.h / 2 + 12;
        } else hx = Math.abs(p.x - h.cx) < h.w / 2 + 12 && Math.abs(p.y - h.cy) < h.h / 2 + 12;
        if (hx) { h.hit = true; hurtPlayer(1); }
      }
    }
    G.hazards = G.hazards.filter(h => h.t < h.warn + h.dur + .35);
  },

  drawHazards() {
    for (const h of G.hazards) {
      ctx.save(); ctx.translate(h.cx, h.cy); if (h.rot) ctx.rotate(h.rot);
      const x = -h.w / 2, y = -h.h / 2;
      if (h.t < h.warn) {
        const k = h.t / h.warn, blink = .35 + .35 * Math.sin(h.t * (14 + k * 20));
        ctx.globalAlpha = blink * (.4 + k * .6); ctx.fillStyle = h.c; ctx.fillRect(x, y, h.w, h.h);
        ctx.globalAlpha = .9; ctx.strokeStyle = h.c; ctx.lineWidth = 3; ctx.setLineDash([16, 12]); ctx.strokeRect(x, y, h.w, h.h); ctx.setLineDash([]);
        ctx.globalAlpha = .9; ctx.fillStyle = '#fff'; ctx.font = `900 ${h.kind === 'bolt' ? 34 : 30}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('!', h.kind === 'bolt' ? 0 : -h.w / 2 + 60, h.kind === 'bolt' ? -h.h / 2 + 80 : 0);
      } else if (h.t < h.warn + h.dur) {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1;
        const g = h.w > h.h ? ctx.createLinearGradient(0, y, 0, y + h.h) : ctx.createLinearGradient(x, 0, x + h.w, 0);
        g.addColorStop(0, h.c + '00'); g.addColorStop(.5, '#ffffff'); g.addColorStop(1, h.c + '00');
        ctx.fillStyle = g; ctx.fillRect(x, y, h.w, h.h);
        ctx.globalAlpha = .5; ctx.fillStyle = h.c; ctx.fillRect(x, y, h.w, h.h);
      } else {
        const k = 1 - (h.t - h.warn - h.dur) / .35;
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, k) * .4; ctx.fillStyle = h.c; ctx.fillRect(x, y, h.w, h.h);
      }
      ctx.restore();
    }
  },

  // ---- desenho ----
  drawBack(cx) {
    if (this.cur && this.cur.name === 'giant') World.drawPlanet(this.cur.p, cx);
  },

  drawFront() {
    const c = this.cur;
    if (!c && !this.bolts.length) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (c && c.name === 'storm') { ctx.globalAlpha = .07 + .03 * Math.sin(World.t * 3); ctx.fillStyle = '#ff3d9a'; ctx.fillRect(0, 0, W, H); }
    if (c && c.name === 'flare') { ctx.globalAlpha = .06 + .03 * Math.sin(World.t * 2); ctx.fillStyle = '#ff7a1a'; ctx.fillRect(0, 0, W, H); }
    for (const b of this.bolts) {
      const path = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.globalAlpha = .25 * b.life; ctx.strokeStyle = '#c9a0ff'; ctx.lineWidth = 14; path(b.segs); b.branches.forEach(path);
      ctx.globalAlpha = b.life; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; path(b.segs); ctx.lineWidth = 1.5; b.branches.forEach(path);
    }
    if (c && c.name === 'worm') {
      const cx = W / 2, cy = H * .38, fade = Math.max(0, Math.min(1, c.t / .8, (c.dur - c.t) / .8)), t = World.t;
      drawGlow(cx, cy, 300 + Math.sin(t * 4) * 20, '#7fe0ff', .35 * fade); drawGlow(cx, cy, 160, '#ffffff', .4 * fade);
      ctx.lineCap = 'round';
      for (const l of c.lines) {
        const len = l.r * .4 + 12, co = Math.cos(l.a), si = Math.sin(l.a);
        ctx.globalAlpha = Math.min(1, l.r / 160) * .8 * fade; ctx.strokeStyle = l.c; ctx.lineWidth = 1 + l.r / 260;
        ctx.beginPath(); ctx.moveTo(cx + co * l.r, cy + si * l.r * .75); ctx.lineTo(cx + co * (l.r + len), cy + si * (l.r + len) * .75); ctx.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const k = ((t * .6 + i / 4) % 1), rr = 40 + k * 420;
        ctx.globalAlpha = (1 - k) * .5 * fade; ctx.strokeStyle = '#b98cff'; ctx.lineWidth = 2 + k * 6;
        ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * .75, 0, 0, 7); ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawOverlay() {
    ctx.save();
    const c = this.cur;
    if (c && c.name === 'rain' && c.t < 2.6) {
      const a = (.5 + .5 * Math.sin(c.t * 9)) * .38;
      const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .9);
      g.addColorStop(0, 'rgba(255,60,60,0)'); g.addColorStop(1, `rgba(255,60,60,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (this.flash > 0) { ctx.globalAlpha = Math.min(1, this.flash * .6); ctx.fillStyle = '#e9e0ff'; ctx.fillRect(0, 0, W, H); }
    if (this.banner) {
      const b = this.banner, a = Math.max(0, Math.min(1, b.t / .4, (3.2 - b.t) / .6)), slide = (1 - Math.min(1, b.t / .4)) * -30;
      ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.shadowColor = b.c; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; ctx.font = `900 46px ${FONT}`; ctx.fillText(b.title, W / 2, 100 + slide);
      ctx.shadowBlur = 0; ctx.fillStyle = b.c; ctx.font = `700 22px ${FONT}`; ctx.fillText(b.sub, W / 2, 156 + slide);
    }
    ctx.restore();
  },
};
