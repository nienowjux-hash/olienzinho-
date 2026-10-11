'use strict';
// ---------- chefes ----------
class Boss {
  constructor(name, hp) {
    this.name = name; this.maxHp = hp; this.hp = hp;
    this.x = W / 2; this.y = -260; this.t = 0; this.state = 'intro';
    this.phase = 0; this.stun = 0; this.flash = 0; this.orbCd = 0; this.dyingT = 0; this.boomT = 0;
    this.baseY = 150; this.cd = {};
  }
  targetable() { return this.state === 'fight'; }
  get ratio() { return this.hp / this.maxHp; }
  tick(k, dt, every) { // temporizador simples; devolve true quando dispara
    this.cd[k] = (this.cd[k] ?? every * .6) - dt;
    if (this.cd[k] <= 0) { this.cd[k] = every; return true; }
    return false;
  }
  damage(n, crit) {
    if (!this.targetable()) return;
    this.hp -= n; this.flash = .06; Snd.play('bossHit', { pan: Snd.panX(this.x) });
    if (crit) popup(this.x + rand(-40, 40), this.y - 60, Math.round(n * 10) / 10 + '!', '#ffe9a8', 22);
    if (this.hp <= 0) { this.hp = 0; this.die(); return; }
    const np = this.ratio > .66 ? 0 : this.ratio > .33 ? 1 : 2;
    if (np > this.phase) { this.phase = np; this.onPhase(); }
  }
  onPhase() {
    this.stun = 1.4; G.eb.forEach(b => { b.dead = true; });
    G.hazards = [];
    shockwave(this.x, this.y, 520, this.col); shake(16); flashScreen(.35);
    Snd.play('rumble', { dur: 1.2 }); Snd.play('bossWarn');
    popup(this.x, this.y + 130, this.phase === 1 ? 'ENFURECIDO!' : 'FÚRIA TOTAL!', '#ff8a5f', 34);
    burst(this.x, this.y, [this.col, '#ffffff', '#ffb340'], 50, 480, 7);
  }
  die() {
    this.state = 'dying'; this.dyingT = 0;
    G.eb.forEach(b => { b.dead = true; }); G.hazards = [];
    G.enemies.forEach(e => { if (!e.dead) killEnemy(e, true); });
    Snd.play('bossDie'); Snd.musicStop();
    Game.slowmo = 1;
  }
  update(dt) {
    this.t += dt; this.flash = Math.max(0, this.flash - dt); this.orbCd = Math.max(0, this.orbCd - dt);
    if (this.state === 'intro') {
      // desce suavemente ate exatamente onde a luta comeca (sem pulo lateral)
      this.introT = (this.introT || 0) + dt;
      const k = Math.min(1, this.introT / 3), keep = this.t;
      this.t = 0; this.move(0); const fx = this.x, fy = this.y; this.t = keep;
      this.x = fx; this.y = lerp(-300, fy, easeOut(k));
      if (k < 1 && Math.random() < dt * 14) G.parts.push({ x: this.x + rand(-100, 100), y: this.y + 40, vx: rand(-20, 20), vy: rand(60, 140), life: .5, max: .5, r: rand(4, 8), c: this.col, drag: 1 });
      if (k >= 1) { this.t = 0; this.state = 'fight'; shake(10); Snd.play('rumble', { dur: 1 }); }
      return;
    }
    if (this.state === 'dying') {
      this.dyingT += dt; this.boomT -= dt;
      if (this.boomT <= 0) {
        this.boomT = .1;
        const a = rand(0, TAU), d = rand(0, this.rad || 100);
        burst(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, [this.col, '#ffe9a8', '#ffffff'], 14, 320, 6);
        shockwave(this.x + Math.cos(a) * d, this.y + Math.sin(a) * d, 90, this.col);
        shake(8);
        if (Math.random() < .5) Snd.play('explode', { size: 1.1, pan: Snd.panX(this.x + Math.cos(a) * d) });
      }
      if (this.dyingT > 3.2) {
        flashScreen(1); shake(24);
        burst(this.x, this.y, [this.col, '#ffe9a8', '#ffffff', '#b98cff'], 120, 700, 8);
        for (let i = 0; i < 4; i++) shockwave(this.x, this.y, 400 + i * 220, i % 2 ? '#ffe9a8' : this.col);
        for (let i = 0; i < 26; i++) dropPickup('coin', this.x + rand(-80, 80), this.y + rand(-60, 60), 3);
        for (let i = 0; i < 10; i++) dropPickup('xp', this.x + rand(-80, 80), this.y + rand(-60, 60), 4);
        dropPickup('heart', this.x, this.y, 1);
        G.boss = null; Game.slowmo = 0;
        Game.bossDefeated();
      }
      return;
    }
    if (this.stun > 0) { this.stun -= dt; this.move(dt); return; }
    this.move(dt); this.ai(dt);
  }
  move() {}
  ai() {}
  hitTest() { return false; }
  smoke(dt) {
    if (this.ratio < .4 && Math.random() < dt * 25) G.parts.push({ x: this.x + rand(-80, 80), y: this.y + rand(-30, 50), vx: rand(-20, 20), vy: rand(-60, -20), life: .8, max: .8, r: rand(6, 12), c: Math.random() < .5 ? '#ff6a1a' : '#ffb340', drag: 1 });
  }
  glowFlash() { return this.flash > 0 ? 1 : 0; }
}

// ---------- 1. Nave-Mae Zangao ----------
class MotherShip extends Boss {
  constructor() { super('Nave-Mãe Zangão', 280); this.col = '#ffb340'; this.rad = 190; this.bay = 0; this.spin = 0; this.muzzle = 0; }
  hitTest(x, y, r) { const dx = (x - this.x) / (190 + r), dy = (y - this.y + 15) / (80 + r); return dx * dx + dy * dy <= 1; }
  move(dt) { this.x = W / 2 + Math.sin(this.t * (.55 + this.phase * .2)) * 330; this.y = this.baseY + Math.sin(this.t * 1.1) * 12; }
  ai(dt) {
    this.bay = Math.max(0, this.bay - dt); this.muzzle = Math.max(0, this.muzzle - dt);
    const ph = this.phase;
    if (this.tick('fan', dt, ph === 2 ? 1.1 : ph === 1 ? 1.4 : 1.7)) {
      for (const s of [-1, 1]) fanAimed(this.x + s * 140, this.y + 30, ph === 2 ? 7 : 5, ph === 2 ? 1.2 : .9, 250);
      this.muzzle = .12; Snd.play('enemyShoot', { pan: Snd.panX(this.x) });
    }
    if (ph >= 1 && this.tick('spiral', dt, .09)) {
      this.spin += .38; ebullet(this.x, this.y + 20, this.spin, 215, { r: 6 }); if (ph === 2) ebullet(this.x, this.y + 20, this.spin + Math.PI, 215, { r: 6 });
    }
    if (ph === 2 && this.tick('ring', dt, 2.4)) { ring(this.x, this.y + 20, 18, 190, rand(0, 6)); Snd.play('enemyShoot'); }
    if (this.tick('sum', dt, ph === 0 ? 6 : 5.5)) {
      this.bay = 1;
      const n = ph === 0 ? 3 : 4;
      for (let i = 0; i < n; i++) spawnEnemy(ph === 0 ? 'drone' : 'zig', this.x + (i - (n - 1) / 2) * 60, this.y + 60, { mode: 'enter', bx: this.x + (i - (n - 1) / 2) * 60 });
    }
    this.smoke(dt);
  }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y);
    const hit = this.flash > 0, t = this.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 20, 260, '#ff8a1f', .35);
    for (const s of [-1, 1]) drawGlow(s * 120, 70, 50 + Math.sin(t * 20) * 6, '#ffb340', .7); ctx.restore(); ctx.globalAlpha = 1;
    // casco
    const g = ctx.createLinearGradient(0, -60, 0, 70);
    g.addColorStop(0, hit ? '#fff' : '#ffd37a'); g.addColorStop(.6, hit ? '#ffe' : '#ff8a1f'); g.addColorStop(1, hit ? '#fdd' : '#a23a0a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 10, 190, 62, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(80,20,0,.4)'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = 'rgba(80,20,0,.25)'; ctx.lineWidth = 3;
    for (const x of [-120, -60, 0, 60, 120]) { ctx.beginPath(); ctx.moveTo(x, -45 + Math.abs(x) * .08); ctx.lineTo(x * 1.12, 60 - Math.abs(x) * .08); ctx.stroke(); }
    // luzes
    for (let i = -4; i <= 4; i++) { ctx.fillStyle = (Math.floor(t * 4) + i) % 3 === 0 ? '#fff6c8' : '#6a2a08'; ctx.beginPath(); ctx.arc(i * 40, 22, 5, 0, 7); ctx.fill(); }
    // cupula
    const dg = ctx.createRadialGradient(-20, -45, 8, 0, -30, 80);
    dg.addColorStop(0, 'rgba(255,255,255,.9)'); dg.addColorStop(.5, 'rgba(255,200,120,.65)'); dg.addColorStop(1, 'rgba(160,60,10,.8)');
    ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(0, -22, 92, 66, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,40,0,.5)'; ctx.lineWidth = 3; ctx.stroke();
    // olho
    const dx = clamp((G.player.x - this.x) / 300, -1, 1), dy = clamp((G.player.y - this.y) / 400, -.3, 1);
    ctx.fillStyle = '#2a0f5e'; ctx.beginPath(); ctx.arc(0, -18, 34, 0, 7); ctx.fill();
    ctx.fillStyle = this.phase === 2 ? '#ff4a4a' : '#ffe9a8'; ctx.beginPath(); ctx.arc(dx * 11, -18 + dy * 10, 16, 0, 7); ctx.fill();
    ctx.fillStyle = '#2a0f5e'; ctx.beginPath(); ctx.arc(dx * 14, -18 + dy * 12, 7, 0, 7); ctx.fill();
    // antena
    ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -86); ctx.lineTo(0, -118); ctx.stroke();
    ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(0, -122, 8 + Math.sin(t * 6) * 2, 0, 7); ctx.fill();
    // canhoes
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#7a2a0a'; ctx.beginPath(); ctx.roundRect(s * 140 - 18, 20, 36, 46, 8); ctx.fill();
      ctx.fillStyle = this.muzzle > 0 ? '#fff' : '#ffb340'; ctx.beginPath(); ctx.arc(s * 140, 66, 11, 0, 7); ctx.fill();
    }
    // baia
    ctx.fillStyle = '#1a0a30'; const bo = this.bay > 0 ? 34 : 4; ctx.beginPath(); ctx.roundRect(-46, 56, 92, bo, 6); ctx.fill();
    ctx.restore();
  }
}

// ---------- 2. Gigante de Rocha ----------
class RockGolem extends Boss {
  constructor() { super('Gigante de Rocha', 400); this.col = '#ff9a3c'; this.rad = 130; this.rocks = Array.from({ length: 6 }, (_, i) => ({ a: i / 6 * TAU, r: 190 + (i % 2) * 30, s: rand(.7, 1.1) })); this.slam = [0, 0]; this.spin = 0; }
  fist(i) { const s = i ? 1 : -1; return [this.x + s * (230 + Math.sin(this.t * 1.5 + i) * 18), this.y + 70 + Math.sin(this.t * 2 + i * 2) * 14 + this.slam[i] * 90]; }
  hitTest(x, y, r) {
    if (Math.hypot(x - this.x, y - this.y) < 118 + r) return true;
    for (let i = 0; i < 2; i++) { const [fx, fy] = this.fist(i); if (Math.hypot(x - fx, y - fy) < 62 + r) return true; }
    return false;
  }
  move(dt) { this.x = W / 2 + Math.sin(this.t * (.45 + this.phase * .15)) * 260; this.y = this.baseY + 15 + Math.sin(this.t * .9) * 10; }
  ai(dt) {
    const ph = this.phase;
    this.slam = this.slam.map(v => Math.max(0, v - dt * 2.5));
    if (this.tick('rocks', dt, ph === 0 ? 1.3 : ph === 1 ? .9 : .6)) {
      const r = rand(18, 30), pts = Array.from({ length: 9 }, (_, i) => { const a = i / 9 * TAU, k = rand(.72, 1.12); return [Math.cos(a) * r * k, Math.sin(a) * r * k]; });
      spawnEnemy('rock', rand(60, W - 60), -40, { rad: r + 4, vx: rand(-60, 60), vy: rand(240, 380), rot: 0, vr: rand(-2, 2), pts, hp: 2 });
    }
    if (this.tick('slam', dt, ph === 0 ? 4.2 : ph === 1 ? 3.4 : 2.8)) {
      const n = ph === 2 ? 3 : ph === 1 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const px = i === 0 ? G.player.x : rand(80, W - 80);
        Events.hazardRect(clamp(px, 80, W - 80), H / 2, 150, H, .9, .35, '#ff9a3c', 'bolt');
      }
      this.slam[Math.random() < .5 ? 0 : 1] = 1;
    }
    if (this.tick('core', dt, 2)) { fanAimed(this.x, this.y + 10, ph === 0 ? 3 : 5, ph === 0 ? .5 : .9, 240); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); }
    if (ph >= 1 && this.tick('ring', dt, ph === 2 ? 2.2 : 3)) { ring(this.x, this.y + 10, ph === 2 ? 18 : 14, 180, rand(0, 6)); Snd.play('enemyShoot'); }
    if (ph === 2 && this.tick('spiral', dt, .12)) { this.spin += .45; ebullet(this.x, this.y + 10, this.spin, 200, { r: 6 }); }
  }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y);
    const hit = this.flash > 0, t = this.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 10, 250, '#ff7a1a', .3 + Math.sin(t * 3) * .05); ctx.restore(); ctx.globalAlpha = 1;
    // rochas em orbita
    for (const r of this.rocks) {
      const a = r.a + t * .8 * r.s, rx = Math.cos(a) * r.r, ry = Math.sin(a) * r.r * .55 + 10;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a * 2);
      ctx.fillStyle = hit ? '#fff' : '#6a4a7a'; ctx.strokeStyle = '#ff9a3c'; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i < 7; i++) { const aa = i / 7 * TAU, k = 14 + (i % 3) * 5; ctx.lineTo(Math.cos(aa) * k, Math.sin(aa) * k); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    // tronco
    const poly = (cx, cy, rr, n, jit, seed) => { ctx.beginPath(); for (let i = 0; i < n; i++) { const a = i / n * TAU, k = rr * (1 + Math.sin(i * 2.7 + seed) * jit); ctx.lineTo(cx + Math.cos(a) * k, cy + Math.sin(a) * k); } ctx.closePath(); };
    const g = ctx.createLinearGradient(0, -110, 0, 110); g.addColorStop(0, hit ? '#fff' : '#a07a98'); g.addColorStop(1, hit ? '#ddd' : '#2a1030');
    ctx.fillStyle = g; poly(0, 10, 112, 11, .08, 1); ctx.fill(); ctx.strokeStyle = '#ff9a3c'; ctx.lineWidth = 4; ctx.stroke();
    // rachaduras
    ctx.strokeStyle = `rgba(255,150,60,${.6 + Math.sin(t * 4) * .3})`; ctx.lineWidth = 3;
    for (const [a, b, c, d] of [[-60, -30, -20, 10], [60, -40, 30, 0], [-40, 50, -10, 20], [50, 50, 20, 30]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo((a + c) / 2 + 8, (b + d) / 2 - 5); ctx.lineTo(c, d); ctx.stroke(); }
    // cabeca
    ctx.fillStyle = hit ? '#fff' : '#7a5a8a'; poly(0, -92, 44, 8, .1, 3); ctx.fill(); ctx.strokeStyle = '#ff9a3c'; ctx.stroke();
    ctx.fillStyle = this.phase === 2 ? '#ff4a4a' : '#ffe9a8'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 16, -96, 7, 0, 7); ctx.fill(); }
    // nucleo
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 10, 80 + Math.sin(t * 5) * 8, '#ff7a1a', .9); ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff2c0'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(24, 10); ctx.lineTo(0, 50); ctx.lineTo(-24, 10); ctx.closePath(); ctx.fill();
    ctx.restore();
    // punhos
    for (let i = 0; i < 2; i++) {
      const [fx, fy] = this.fist(i);
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(Math.sin(t * 2 + i) * .15);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 90, '#ff7a1a', .3 + this.slam[i] * .6); ctx.restore(); ctx.globalAlpha = 1;
      const fg = ctx.createLinearGradient(0, -60, 0, 60); fg.addColorStop(0, hit ? '#fff' : '#9a7a98'); fg.addColorStop(1, '#2a1030');
      ctx.fillStyle = fg; ctx.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = 58 * (1 + Math.sin(k * 2.3 + i) * .1); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ff9a3c'; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,170,80,.7)'; ctx.lineWidth = 3; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * 18, 20); ctx.lineTo(k * 18, 44); ctx.stroke(); }
      ctx.restore();
    }
  }
}

// ---------- 3. Olho da Tempestade ----------
class StormEye extends Boss {
  constructor() { super('Olho da Tempestade', 560); this.col = '#ff7ac8'; this.rad = 110; this.arcs = []; this.arcT = 0; this.spin = 0; this.lasers = 0; }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 108 + r; }
  move(dt) { const s = .5 + this.phase * .15; this.x = W / 2 + Math.sin(this.t * s) * 340; this.y = this.baseY + 10 + Math.sin(this.t * s * 2) * 30; }
  laserAt(a, warn, dur) {
    const len = 1500;
    G.hazards.push({ cx: this.x + Math.cos(a) * len / 2, cy: this.y + Math.sin(a) * len / 2, w: len, h: 64, rot: a, warn, dur, t: 0, c: '#ff7ac8', kind: 'laser', hit: false, fired: false });
  }
  ai(dt) {
    const ph = this.phase;
    if (this.tick('bolt', dt, ph === 0 ? 1.4 : ph === 1 ? 1.1 : .8)) {
      const px = Math.random() < .7 ? G.player.x + rand(-60, 60) : rand(80, W - 80);
      Events.hazardRect(clamp(px, 80, W - 80), H / 2, 110, H, .85, .3, '#ff7ac8', 'bolt');
      if (ph === 2 && Math.random() < .6) Events.hazardRect(rand(80, W - 80), H / 2, 110, H, 1, .3, '#ff7ac8', 'bolt');
    }
    if (this.tick('fan', dt, ph === 0 ? 2 : 1.6)) { fanAimed(this.x, this.y + 20, ph === 0 ? 3 : 5, ph === 0 ? .5 : .8, 250); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); }
    if (ph >= 1 && this.tick('laser', dt, ph === 1 ? 5 : 4)) {
      const a = aimAt(this.x, this.y);
      this.laserAt(a, 1.1, .8);
      if (ph === 2) { this.laserAt(a + .5, 1.1, .8); this.laserAt(a - .5, 1.1, .8); }
    }
    if (ph >= 1 && this.tick('ring', dt, 2.4)) { ring(this.x, this.y, 16, 190, this.t); Snd.play('enemyShoot'); }
    if (ph === 2 && this.tick('spiral', dt, .1)) { this.spin += .4; ebullet(this.x, this.y, this.spin, 210, { r: 6 }); ebullet(this.x, this.y, this.spin + Math.PI, 210, { r: 6 }); }
    if (this.tick('kami', dt, 7)) for (let i = 0; i < 2; i++) spawnEnemy('bit', this.x + (i ? 60 : -60), this.y + 60, { bx: this.x + (i ? 60 : -60) });
  }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y);
    const hit = this.flash > 0, t = this.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 300, '#ff3d9a', .35 + Math.sin(t * 4) * .08); drawGlow(0, 0, 180, '#33c4ff', .2); ctx.restore(); ctx.globalAlpha = 1;
    // arcos eletricos
    this.arcT -= 1 / 60;
    if (this.arcT <= 0) {
      this.arcT = .07; this.arcs = [];
      for (let i = 0; i < 6; i++) {
        const a0 = rand(0, TAU), pts = []; let r = 112;
        for (let k = 0; k < 7; k++) { pts.push([Math.cos(a0 + k * .09) * r + rand(-8, 8), Math.sin(a0 + k * .09) * r + rand(-8, 8)]); r += rand(4, 12); }
        this.arcs.push(pts);
      }
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    for (const pts of this.arcs) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
    // placas
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + t * .6;
      ctx.save(); ctx.rotate(a); ctx.translate(0, -118); ctx.fillStyle = hit ? '#fff' : '#3a1a6a'; ctx.strokeStyle = '#ff7ac8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-26, 10); ctx.lineTo(-16, -18); ctx.lineTo(16, -18); ctx.lineTo(26, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    // esclera
    const sg = ctx.createRadialGradient(-20, -25, 10, 0, 0, 112);
    sg.addColorStop(0, hit ? '#fff' : '#fff0fa'); sg.addColorStop(.7, hit ? '#fff' : '#ffc4e6'); sg.addColorStop(1, hit ? '#fdd' : '#b0409a');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, 104, 0, 7); ctx.fill(); ctx.strokeStyle = '#4a1060'; ctx.lineWidth = 5; ctx.stroke();
    // iris
    const dx = clamp((G.player.x - this.x) / 400, -1, 1) * 28, dy = clamp((G.player.y - this.y) / 500, -.4, 1) * 24;
    ctx.save(); ctx.translate(dx, dy);
    const ig = ctx.createRadialGradient(0, 0, 8, 0, 0, 58);
    ig.addColorStop(0, '#33c4ff'); ig.addColorStop(.55, this.phase === 2 ? '#ff3d6a' : '#ff7ac8'); ig.addColorStop(1, '#5a1060');
    ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); ctx.lineTo(Math.cos(a) * 54, Math.sin(a) * 54); ctx.stroke(); }
    ctx.fillStyle = '#12041f'; ctx.beginPath(); ctx.ellipse(0, 0, 11 + Math.sin(t * 3) * 2, 40, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(-16, -20, 7, 0, 7); ctx.fill();
    ctx.restore();
    ctx.restore();
  }
}

// ---------- 4. Sol-Guardiao ----------
class SunGuardian extends Boss {
  constructor() { super('Sol-Guardião', 760); this.col = '#ff7a1f'; this.rad = 130; this.spin = 0; this.charge = 0; }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 122 + r; }
  move(dt) { const s = .45 + this.phase * .12; this.x = W / 2 + Math.sin(this.t * s) * 300; this.y = this.baseY + 20 + Math.sin(this.t * .8) * 14; }
  ai(dt) {
    const ph = this.phase;
    if (this.charge > 0) {
      this.charge -= dt;
      if (this.charge <= 0) { // supernova: anel com brechas
        const n = 36, gap = Math.floor(rand(0, n));
        for (let i = 0; i < n; i++) if (Math.abs(((i - gap + n) % n)) > 2 && Math.abs(((i - gap + n) % n)) < n - 2) ebullet(this.x, this.y, i / n * TAU, 230, { r: 8 });
        shockwave(this.x, this.y, 300, '#ffb340'); shake(12); Snd.play('explode', { size: 1.5 });
      }
      return;
    }
    if (this.tick('beam', dt, ph === 0 ? 2.6 : ph === 1 ? 2.2 : 1.8)) {
      const y = Math.random() < .65 ? clamp(G.player.y + rand(-50, 50), 90, H - 90) : rand(90, H - 90);
      Events.hazardRect(W / 2, y, W + 40, 90, 1.1, .6, '#ffb340', 'beam');
    }
    if (this.tick('fan', dt, ph === 0 ? 1.9 : 1.5)) { fanAimed(this.x, this.y + 20, ph === 0 ? 5 : 7, 1, 240); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); }
    if (ph >= 1 && this.tick('spiral', dt, .1)) {
      this.spin += .33; for (let k = 0; k < 3; k++) ebullet(this.x, this.y, this.spin + k * TAU / 3, 210, { r: 6 });
    }
    if (ph >= 1 && this.tick('kami', dt, 6.5)) for (let i = 0; i < 3; i++) spawnEnemy('kami', this.x + (i - 1) * 70, this.y + 80, { mode: 'enter', bx: this.x + (i - 1) * 70 });
    if (ph === 2 && this.tick('nova', dt, 7)) { this.charge = 1.8; Snd.play('charge', { dur: 1.8 }); }
  }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y);
    const hit = this.flash > 0, t = this.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, 330 + (this.charge > 0 ? (1.8 - this.charge) * 120 : 0), '#ff6a1a', .26); drawGlow(0, 0, 190, '#ffd36a', .14); ctx.restore(); ctx.globalAlpha = 1;
    // chamas
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const a = i / 18 * TAU + t * .5, l = 150 + Math.sin(t * 4 + i * 1.7) * 22 + Math.sin(t * 9 + i) * 8;
      const g = ctx.createLinearGradient(Math.cos(a) * 100, Math.sin(a) * 100, Math.cos(a) * l, Math.sin(a) * l);
      g.addColorStop(0, 'rgba(255,200,80,.9)'); g.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(Math.cos(a - .13) * 100, Math.sin(a - .13) * 100); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.lineTo(Math.cos(a + .13) * 100, Math.sin(a + .13) * 100); ctx.closePath(); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
    // aneis de armadura
    ctx.lineWidth = 7; ctx.strokeStyle = hit ? '#fff' : '#d9a04a';
    for (let i = 0; i < 2; i++) { ctx.save(); ctx.rotate(t * (i ? -.6 : .8)); ctx.beginPath(); ctx.ellipse(0, 0, 150, 40 + i * 12, i ? 1 : 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    // esfera
    const sg = ctx.createRadialGradient(-30, -35, 10, 0, 0, 122);
    sg.addColorStop(0, hit ? '#fff' : '#ffe9a8'); sg.addColorStop(.45, hit ? '#ffe' : '#ff9a2a'); sg.addColorStop(1, hit ? '#fdd' : '#c4261a');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, 0, 118, 0, 7); ctx.fill();
    // mascara
    ctx.fillStyle = '#3a0f20'; ctx.beginPath(); ctx.moveTo(-70, -20); ctx.lineTo(0, -34); ctx.lineTo(70, -20); ctx.lineTo(54, 26); ctx.lineTo(0, 40); ctx.lineTo(-54, 26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d9a04a'; ctx.lineWidth = 4; ctx.stroke();
    const ex = clamp((G.player.x - this.x) / 300, -1, 1) * 5, ey = clamp((G.player.y - this.y) / 400, -.3, 1) * 4;
    for (const s of [-1, 1]) {
      ctx.fillStyle = this.phase === 2 ? '#ff4a4a' : '#ffe9a8'; ctx.beginPath(); ctx.ellipse(s * 28 + ex, -2 + ey, 13, 9, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#3a0f20'; ctx.beginPath(); ctx.arc(s * 28 + ex * 1.6, -2 + ey * 1.4, 4, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
}

const BOSS_CLASSES = { mother: MotherShip, golem: RockGolem, eye: StormEye, sun: SunGuardian };
