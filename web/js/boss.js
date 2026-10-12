'use strict';
// ---------- ferramentas de desenho dos chefes ----------
const lin = (x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
const rdl = (x, y, r0, r1, stops, cx = x, cy = y) => { const g = ctx.createRadialGradient(x, y, r0, cx, cy, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
function poly(cx, cy, r, n, jit, seed, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = rot + i / n * TAU, k = r * (1 + Math.sin(i * 2.7 + seed) * jit); ctx.lineTo(cx + Math.cos(a) * k, cy + Math.sin(a) * k); }
  ctx.closePath();
}
// raio / arco eletrico entre dois pontos
function zap(x1, y1, x2, y2, seg, amp, c, w = 2) {
  const pts = [[x1, y1]];
  for (let i = 1; i < seg; i++) { const k = i / seg; pts.push([lerp(x1, x2, k) + rand(-amp, amp), lerp(y1, y2, k) + rand(-amp, amp)]); }
  pts.push([x2, y2]);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = c; ctx.globalAlpha = .28; ctx.lineWidth = w * 4; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = .95; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  ctx.restore();
}
// estilhacos de armadura voando
function shedDebris(x, y, n, cols, sp = 320, size = 11) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = rand(.3, 1) * sp;
    G.parts.push({ k: 'debris', x: x + rand(-14, 14), y: y + rand(-14, 14), vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, rot: rand(0, 6), vr: rand(-9, 9), life: rand(1.2, 2), max: 2, r: rand(.6, 1.2) * size, c: pick(cols), drag: .25 });
  }
}

// ---------- base ----------
class Boss {
  constructor(name, hp) {
    this.name = name; this.maxHp = hp; this.hp = hp;
    this.x = W / 2; this.y = -260; this.t = 0; this.state = 'intro';
    this.phase = 0; this.stun = 0; this.flash = 0; this.orbCd = 0; this.dyingT = 0; this.boomT = 0;
    this.baseY = 150; this.cd = {}; this.shx = 0; this.shy = 0; this.lastX = this.x;
  }
  targetable() { return this.state === 'fight'; }
  get ratio() { return this.hp / this.maxHp; }
  tick(k, dt, every) { // temporizador; devolve true quando dispara
    this.cd[k] = (this.cd[k] ?? every * .6) - dt;
    if (this.cd[k] <= 0) { this.cd[k] = every; return true; }
    return false;
  }
  // 0..1: quanto falta para o ataque k (para animar o "carregando")
  warn(k, win = .45) { const v = this.cd[k]; return v === undefined ? 0 : clamp(1 - v / win, 0, 1); }
  damage(n, crit) {
    if (!this.targetable()) return;
    this.hp -= n; this.flash = .06; Snd.play('bossHit', { pan: Snd.panX(this.x) });
    if (crit) popup(this.x + rand(-40, 40), this.y - 60, Math.round(n * 10) / 10 + '!', '#ffe9a8', 22);
    if (Math.random() < .5) sparks(this.x + rand(-60, 60), this.y + rand(-40, 40), '#ffe9a8', 3, 200);
    if (this.hp <= 0) { this.hp = 0; this.die(); return; }
    const np = this.ratio > .66 ? 0 : this.ratio > .33 ? 1 : 2;
    if (np > this.phase) { this.phase = np; this.onPhase(); }
  }
  onPhase() {
    this.stun = 1.4; G.hitstop = .12; G.eb.forEach(b => { b.dead = true; });
    G.hazards = [];
    shockwave(this.x, this.y, 520, this.col); shockwave(this.x, this.y, 340, '#ffffff'); shake(16); flashScreen(.35);
    Snd.play('rumble', { dur: 1.2 }); Snd.play('bossWarn');
    popup(this.x, this.y + 130, this.phase === 1 ? 'ENFURECIDO!' : 'FÚRIA TOTAL!', '#ff8a5f', 34);
    burst(this.x, this.y, [this.col, '#ffffff', '#ffb340'], 50, 480, 7);
  }
  die() {
    this.state = 'dying'; this.dyingT = 0;
    G.eb.forEach(b => { b.dead = true; }); G.hazards = [];
    G.pendingLevels = 0; if (G.stageIdx === 9) G.hitstop = .22; // camera lenta e pausa so no chefe final; o que faltava de XP nao vale mais
    G.finisher = { t: 0 }; Snd.play('special'); // golpe final do Olienzinho
    G.enemies.forEach(e => { if (!e.dead) killEnemy(e, true); });
    Snd.play(this.dieSfx || 'bossDie'); Snd.musicStop();
    if (G.stageIdx === 9) Game.slowmo = 1;
  }
  update(dt) {
    this.t += dt; this.flash = Math.max(0, this.flash - dt); this.orbCd = Math.max(0, this.orbCd - dt);
    if (this.state === 'intro') {
      // desce suavemente ate exatamente onde a luta comeca (sem pulo lateral)
      if (!this.introSnd) { this.introSnd = true; Snd.play(this.introSfx || 'bossIntro'); }
      this.introT = (this.introT || 0) + dt;
      const k = Math.min(1, this.introT / 3), keep = this.t;
      this.t = 0; this.move(0); const fx = this.x, fy = this.y; this.t = keep;
      this.x = fx; this.y = lerp(-300, fy, easeOut(k)); this.lastX = this.x;
      if (k < 1 && Math.random() < dt * 14) G.parts.push({ x: this.x + rand(-100, 100), y: this.y + 40, vx: rand(-20, 20), vy: rand(60, 140), life: .5, max: .5, r: rand(4, 8), c: this.col, drag: 1 });
      if (k >= 1) { this.t = 0; this.state = 'fight'; shake(10); shockwave(this.x, this.y, 420, this.col); Snd.play('rumble', { dur: 1 }); }
      return;
    }
    if (this.state === 'dying') {
      this.dyingT += dt; this.boomT -= dt;
      const sh = Math.min(10, this.dyingT * 5); this.shx = rand(-sh, sh); this.shy = rand(-sh, sh);
      if (this.dyingFx) this.dyingFx(dt);
      if (this.boomT <= 0 && !this.noBooms) {
        this.boomT = .09;
        const a = rand(0, TAU), d = rand(0, this.rad || 100), ex = this.x + Math.cos(a) * d, ey = this.y + Math.sin(a) * d;
        burst(ex, ey, [this.col, '#ffe9a8', '#ffffff'], 14, 320, 6);
        shockwave(ex, ey, 90, this.col);
        shedDebris(ex, ey, 2, [this.dark || '#3a2060', this.col], 260, 12);
        shake(8);
        if (Math.random() < .5) Snd.play('explode', { size: 1.1, pan: Snd.panX(ex) });
      }
      if (this.dyingT > (this.dyLen || 3.2)) {
        flashScreen(1); shake(24); Snd.play(this.name === 'O Vazio' ? 'voidBoom' : 'bossBoom', { size: { 'Coração do Outro Lado': 1, 'Eco do Olienzinho': .85, 'Reflexo do Olienzinho': .85 }[this.name] || .75 }); if (this.finalFx) this.finalFx();
        burst(this.x, this.y, [this.col, '#ffe9a8', '#ffffff', '#b98cff'], 120, 700, 8);
        shedDebris(this.x, this.y, 26, [this.dark || '#3a2060', this.col, '#ffe9a8'], 520, 16);
        for (let i = 0; i < 4; i++) shockwave(this.x, this.y, 400 + i * 220, i % 2 ? '#ffe9a8' : this.col);
        for (let i = 0; i < 26; i++) dropPickup('coin', this.x + rand(-80, 80), this.y + rand(-60, 60), 3);
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
    if (this.ratio < .5 && Math.random() < dt * 25) G.parts.push({ x: this.x + rand(-80, 80), y: this.y + rand(-30, 50), vx: rand(-20, 20), vy: rand(-60, -20), life: .8, max: .8, r: rand(6, 12), c: Math.random() < .5 ? '#ff6a1a' : '#ffb340', drag: 1 });
    if (this.ratio < .5 && Math.random() < dt * 14) G.parts.push({ k: 'smoke', x: this.x + rand(-80, 80), y: this.y + rand(-20, 40), vx: rand(-15, 15), vy: rand(-50, -20), life: 1, max: 1, r: rand(8, 14), c: '#2a1450', drag: .8 });
    if (this.ratio < .33 && Math.random() < dt * 6) sparks(this.x + rand(-90, 90), this.y + rand(-40, 50), '#ffe9a8', 4, 240);
  }
  flashOverlay(r, ry = r) { // clarao branco por cima ao levar tiro
    if (this.flash <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(.55, this.flash * 9);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, 0, r, ry, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
}

// ======================= 1. Nave-Mae Zangao =======================
class MotherShip extends Boss {
  constructor() {
    super('Nave-Mãe Zangão', 280); this.col = '#ffb340'; this.dark = '#7a2a0a'; this.rad = 190;
    this.bay = 0; this.bayO = 0; this.spin = 0; this.muzzle = 0; this.tilt = 0; this.platesOff = false;
  }
  hitTest(x, y, r) { const dx = (x - this.x) / (190 + r), dy = (y - this.y + 15) / (80 + r); return dx * dx + dy * dy <= 1; }
  move(dt) {
    this.x = W / 2 + Math.sin(this.t * (.55 + this.phase * .2)) * 330; this.y = this.baseY + Math.sin(this.t * 1.1) * 12;
    if (dt > 0) {
      const vx = (this.x - this.lastX) / dt; this.lastX = this.x;
      this.tilt += (clamp(vx / 700, -1, 1) * .09 + Math.sin(this.t * 1.3) * .015 - this.tilt) * Math.min(1, 6 * dt);
      this.bay = Math.max(0, this.bay - dt); this.muzzle = Math.max(0, this.muzzle - dt);
      this.bayO += ((this.bay > 0 ? 1 : 0) - this.bayO) * Math.min(1, 7 * dt);
    }
  }
  onPhase() {
    super.onPhase();
    if (this.phase === 1) { this.platesOff = true; for (const s of [-1, 1]) shedDebris(this.x + s * 150, this.y + 20, 9, ['#c85a10', '#ff9a2e', '#7a2a0a'], 360, 14); }
    if (this.phase === 2) shedDebris(this.x, this.y - 40, 12, ['#fff0c9', '#ffd37a'], 380, 12);
  }
  ai(dt) {
    const ph = this.phase;
    if (this.tick('fan', dt, ph === 2 ? 1.1 : ph === 1 ? 1.4 : 1.7)) {
      for (const s of [-1, 1]) fanAimed(this.x + s * 140, this.y + 30, ph === 2 ? 7 : 5, ph === 2 ? 1.2 : .9, 250);
      this.muzzle = .14; Snd.play('enemyShoot', { pan: Snd.panX(this.x) });
      for (const s of [-1, 1]) { G.parts.push({ k: 'flash', x: this.x + s * 140, y: this.y + 66, vx: 0, vy: 0, life: .12, max: .12, r: 38, c: '#ffe9a8', drag: 1 }); sparks(this.x + s * 140, this.y + 70, '#ffd37a', 6, 260); }
    }
    if (ph >= 1 && this.tick('spiral', dt, .13)) {
      this.spin += .42; ebullet(this.x, this.y + 20, this.spin, 215, { r: 6 }); if (ph === 2) ebullet(this.x, this.y + 20, this.spin + Math.PI, 215, { r: 6 });
    }
    if (ph === 2 && this.tick('ring', dt, 2.8)) { ring(this.x, this.y + 20, 14, 180, rand(0, 6)); Snd.play('enemyShoot'); shockwave(this.x, this.y + 20, 160, '#ffb340'); }
    if (this.tick('sum', dt, ph === 0 ? 6 : 5.5)) {
      this.bay = 1.1; Snd.play('mine');
      const n = ph === 0 ? 2 : 3;
      for (let i = 0; i < n; i++) spawnEnemy(ph === 0 ? 'drone' : 'zig', this.x + (i - (n - 1) / 2) * 60, this.y + 60, { mode: 'enter', bx: this.x + (i - (n - 1) / 2) * 60 });
    }
    this.smoke(dt);
  }
  draw() {
    const t = this.t, ph = this.phase, hit = this.flash > 0;
    const fanW = this.warn('fan'), wild = ph === 2;
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.tilt);

    // brilho, feixe de captura e propulsores
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 24, 290, wild ? '#ff5a2a' : '#ff8a1f', .34 + .06 * Math.sin(t * 3));
    if (this.bayO > .02) {
      ctx.globalAlpha = this.bayO * .5; ctx.fillStyle = lin(0, 62, 0, 400, [[0, 'rgba(255,230,160,.7)'], [1, 'rgba(255,160,60,0)']]);
      ctx.beginPath(); ctx.moveTo(-42, 62); ctx.lineTo(42, 62); ctx.lineTo(120, 400); ctx.lineTo(-120, 400); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 6; i++) { const k = (t * .9 + i / 6) % 1; drawGlow(Math.sin(i * 4 + t) * 30 * (1 + k), 70 + k * 260, 10, '#ffe9a8', this.bayO * (1 - k)); }
    }
    for (const s of [-1, 1]) {
      const fl = 26 + Math.sin(t * 40 + s) * 6 + Math.random() * 8;
      ctx.globalAlpha = .9; ctx.fillStyle = lin(0, 62, 0, 62 + fl, [[0, '#fff1c1'], [.4, '#ffb340'], [1, 'rgba(255,90,20,0)']]);
      ctx.beginPath(); ctx.moveTo(s * 112 - 12, 62); ctx.lineTo(s * 112, 62 + fl); ctx.lineTo(s * 112 + 12, 62); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;

    // sombra inferior (da volume)
    ctx.fillStyle = lin(0, 30, 0, 78, [[0, '#3a1204'], [1, '#150602']]); ctx.beginPath(); ctx.ellipse(0, 22, 178, 58, 0, 0, TAU); ctx.fill();

    // placas laterais (somem na fase 2, revelando o nucleo)
    for (const s of [-1, 1]) {
      if (!this.platesOff) {
        ctx.fillStyle = lin(s * 100, -30, s * 190, 50, [[0, hit ? '#fff' : '#ffb340'], [1, hit ? '#fdd' : '#8a3208']]);
        ctx.beginPath(); ctx.moveTo(s * 120, -30); ctx.lineTo(s * 196, 8); ctx.lineTo(s * 190, 46); ctx.lineTo(s * 122, 52); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,200,.6)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#5a1e04'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(s * (140 + i * 18), 4 + i * 12, 3.5, 0, 7); ctx.fill(); }
      } else {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 158, 12, 56, wild ? '#ff3a2a' : '#ffb340', .9); ctx.restore(); ctx.globalAlpha = 1;
        ctx.fillStyle = '#1a0a04'; ctx.beginPath(); ctx.arc(s * 158, 12, 26, 0, 7); ctx.fill();
        ctx.save(); ctx.translate(s * 158, 12); ctx.rotate(t * 6 * s);
        for (let i = 0; i < 6; i++) { ctx.rotate(TAU / 6); ctx.fillStyle = i % 2 ? '#ffb340' : '#ff7a1a'; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(24, -6); ctx.lineTo(24, 6); ctx.fill(); }
        ctx.restore();
      }
    }

    // casco principal
    ctx.fillStyle = lin(0, -58, 0, 76, [[0, hit ? '#fff' : '#ffe3a0'], [.45, hit ? '#fff4e0' : '#ff9a2e'], [1, hit ? '#fdd' : '#8a3208']]);
    ctx.beginPath(); ctx.ellipse(0, 10, 150, 56, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,248,214,.75)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 10, 150, 56, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.strokeStyle = 'rgba(90,30,4,.45)'; ctx.lineWidth = 2.5;
    for (const x of [-100, -50, 0, 50, 100]) { ctx.beginPath(); ctx.moveTo(x * .9, -42); ctx.quadraticCurveTo(x * 1.12, 12, x * 1.05, 62); ctx.stroke(); }
    ctx.fillStyle = '#7a2a0a'; for (let i = 0; i < 16; i++) { const a = .12 + i / 15 * (Math.PI - .24); ctx.beginPath(); ctx.arc(Math.cos(a + Math.PI) * 138, 10 + Math.sin(a) * 40 + 4, 2.6, 0, 7); ctx.fill(); }
    // luzes correndo no cinturao
    for (let i = -4; i <= 4; i++) {
      const on = (Math.floor(t * 7) + i + 40) % 4 === 0;
      ctx.fillStyle = on ? (wild ? '#ff6a4a' : '#fff6c8') : '#6a2a08'; ctx.beginPath(); ctx.arc(i * 32, 30 + Math.abs(i) * .9, 4.5, 0, 7); ctx.fill();
      if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(i * 32, 30, 18, wild ? '#ff5a3a' : '#ffe9a8', .9); ctx.restore(); ctx.globalAlpha = 1; }
    }
    // rachaduras (fases 2 e 3)
    if (ph >= 1) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,${wild ? 80 : 150},40,${.55 + Math.sin(t * 6) * .25})`; ctx.lineWidth = 2.5;
      for (const [a, b, c, d] of [[-40, -30, -70, 10], [30, -40, 60, 0], [-20, 30, -50, 52], [70, 20, 100, 44]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo((a + c) / 2 + 8, (b + d) / 2 - 6); ctx.lineTo(c, d); ctx.stroke(); }
      ctx.restore();
    }

    // canhoes (carregam e recuam)
    for (const s of [-1, 1]) {
      const rec = this.muzzle > 0 ? this.muzzle / .14 * 10 : 0;
      ctx.fillStyle = '#6a2208'; ctx.beginPath(); ctx.roundRect(s * 122 - 16, 30, 32, 28, 8); ctx.fill();
      ctx.fillStyle = lin(s * 122 - 9, 0, s * 122 + 9, 0, [[0, '#4a1604'], [.5, '#a03a0c'], [1, '#4a1604']]);
      ctx.beginPath(); ctx.roundRect(s * 122 - 9, 50, 18, 34 - rec, 4); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const ch = fanW, mz = this.muzzle > 0 ? 1 : 0;
      drawGlow(s * 122, 86 - rec, 10 + ch * 26 + mz * 28, mz ? '#ffffff' : '#ffb340', .4 + ch * .6 + mz * .6);
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // baia inferior com portas
    const bw = 40;
    ctx.fillStyle = '#0e0408'; ctx.beginPath(); ctx.roundRect(-bw, 56, bw * 2, 22, 6); ctx.fill();
    if (this.bayO > .02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lin(0, 56, 0, 78, [[0, 'rgba(255,230,160,.9)'], [1, 'rgba(255,140,40,.2)']]); ctx.globalAlpha = this.bayO; ctx.beginPath(); ctx.roundRect(-bw + 4, 58, bw * 2 - 8, 16, 4); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
    ctx.fillStyle = '#c85a10'; const dOff = this.bayO * (bw - 4);
    ctx.fillRect(-bw, 56, bw - dOff, 22); ctx.fillRect(dOff, 56, bw - dOff, 22);

    // cupula de vidro
    ctx.fillStyle = rdl(-24, -52, 6, 96, [[0, 'rgba(255,255,255,.95)'], [.45, 'rgba(255,205,140,.65)'], [1, 'rgba(150,50,10,.85)']], 0, -26);
    ctx.beginPath(); ctx.ellipse(0, -18, 96, 66, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,40,0,.55)'; ctx.lineWidth = 3.5; ctx.stroke();
    // piloto (olho gigante com palpebras)
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -18, 92, 62, 0, Math.PI, 0); ctx.closePath(); ctx.clip();
    ctx.fillStyle = '#f7ead2'; ctx.beginPath(); ctx.arc(0, -22, 40, 0, 7); ctx.fill();
    const px = clamp((G.player.x - this.x) / 280, -1, 1), py = clamp((G.player.y - this.y) / 380, -.4, 1);
    const irisC = wild ? '#ff3a2a' : ph === 1 ? '#ff8a1f' : '#ffd23a';
    ctx.fillStyle = rdl(px * 12, -22 + py * 10, 3, 20, [[0, '#fff'], [.3, irisC], [1, wild ? '#7a0a0a' : '#b0560a']]); ctx.beginPath(); ctx.arc(px * 12, -22 + py * 10, 20, 0, 7); ctx.fill();
    const dil = 7 + fanW * 4 + (this.bay > 0 ? 3 : 0);
    ctx.fillStyle = '#1a0a30'; ctx.beginPath(); ctx.ellipse(px * 14, -22 + py * 12, dil, dil * 1.35, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(px * 12 - 6, -22 + py * 10 - 7, 4, 0, 7); ctx.fill();
    const bl = (t % 4.2) < .14 ? 1 - Math.abs((t % 4.2) / .07 - 1) : 0, lid = 14 + ph * 9 + bl * 46 + (hit ? 16 : 0), brow = ph * 8;
    ctx.fillStyle = lin(0, -64, 0, -64 + lid, [[0, '#ff9a2e'], [1, '#c85a10']]);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 46, -66); ctx.lineTo(0, -66); ctx.lineTo(0, -64 + lid + brow); ctx.lineTo(s * 46, -64 + lid - brow * .3); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // reflexo no vidro
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(0, -18, 78, 50, 0, Math.PI * 1.12, Math.PI * 1.34); ctx.stroke();

    // antena com ondas de radio
    ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -82); ctx.lineTo(0, -116); ctx.stroke();
    const pulse = 8 + Math.sin(t * 6) * 2.5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -122, 30, wild ? '#ff4a3a' : '#ffe9a8', .9);
    for (let i = 0; i < 2; i++) { const k = (t * .8 + i * .5) % 1; ctx.globalAlpha = (1 - k) * .6; ctx.strokeStyle = wild ? '#ff6a4a' : '#ffe9a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -122, 10 + k * 46, 0, 7); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = wild ? '#ff6a4a' : '#ffe9a8'; ctx.beginPath(); ctx.arc(0, -122, pulse, 0, 7); ctx.fill();

    this.flashOverlay(150, 62);
    ctx.restore();
  }
}

// ======================= 2. Gigante de Rocha =======================
class RockGolem extends Boss {
  constructor() {
    super('Gigante de Rocha', 400); this.col = '#ff9a3c'; this.dark = '#3a2038'; this.rad = 130;
    this.rocks = Array.from({ length: 6 }, (_, i) => ({ a: i / 6 * TAU, r: 190 + (i % 2) * 30, s: rand(.7, 1.1), sz: rand(13, 20) }));
    this.slamT = [0, 0]; this.fo = [0, 0]; this.spin = 0; this.shedHelm = false;
  }
  fist(i) { const s = i ? 1 : -1; return [this.x + s * (232 + Math.sin(this.t * 1.5 + i) * 16), this.y + 66 + Math.sin(this.t * 2 + i * 2) * 12 + this.fo[i]]; }
  hitTest(x, y, r) {
    if (Math.hypot(x - this.x, y - this.y) < 118 + r) return true;
    for (let i = 0; i < 2; i++) { const [fx, fy] = this.fist(i); if (Math.hypot(x - fx, y - fy) < 62 + r) return true; }
    return false;
  }
  move(dt) {
    this.x = W / 2 + Math.sin(this.t * (.45 + this.phase * .15)) * 260; this.y = this.baseY + 15 + Math.sin(this.t * .9) * 10;
    if (dt <= 0) return;
    for (let i = 0; i < 2; i++) {
      const old = this.slamT[i]; this.slamT[i] = Math.max(0, old - dt); const u = this.slamT[i];
      if (u > .35) this.fo[i] = -78 * easeOut((1.25 - u) / .8);
      else if (u > 0) this.fo[i] = lerp(-78, 72, 1 - u / .35);
      else this.fo[i] *= 1 - Math.min(1, 4 * dt);
      if (old > .35 && u <= .35) { // impacto do soco
        const [fx, fy] = this.fist(i);
        burst(fx, fy + 40, ['#ff9a3c', '#ffe9a8', '#7a5a78'], 30, 420, 7); shedDebris(fx, fy + 40, 8, ['#7a5a78', '#3a2038'], 380, 12);
        shockwave(fx, fy + 50, 220, '#ff9a3c'); shake(11); Snd.play('explode', { size: 1.3, pan: Snd.panX(fx) });
      }
    }
  }
  onPhase() {
    super.onPhase();
    if (this.phase === 2) { this.shedHelm = true; shedDebris(this.x, this.y - 100, 14, ['#7a5a78', '#ffb36a'], 420, 14); }
    else shedDebris(this.x + 100, this.y - 40, 8, ['#7a5a78', '#3a2038'], 340, 14);
  }
  ai(dt) {
    const ph = this.phase;
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
      this.slamT[Math.random() < .5 ? 0 : 1] = 1.25; Snd.play('charge', { dur: .9 });
    }
    if (this.tick('core', dt, 2)) { fanAimed(this.x, this.y + 14, ph === 0 ? 3 : 5, ph === 0 ? .5 : .9, 240); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); G.parts.push({ k: 'flash', x: this.x, y: this.y + 14, vx: 0, vy: 0, life: .14, max: .14, r: 60, c: '#ffe9a8', drag: 1 }); }
    if (ph >= 1 && this.tick('ring', dt, ph === 2 ? 2.2 : 3)) { ring(this.x, this.y + 14, ph === 2 ? 18 : 14, 180, rand(0, 6)); Snd.play('enemyShoot'); shockwave(this.x, this.y + 14, 170, '#ff7a1a'); }
    if (ph === 2 && this.tick('spiral', dt, .16)) { this.spin += .5; ebullet(this.x, this.y + 14, this.spin, 200, { r: 6 }); }
    if (Math.random() < dt * 9) G.parts.push({ k: 'smoke', x: this.x + rand(-100, 100), y: this.y + rand(40, 110), vx: rand(-10, 10), vy: rand(20, 60), life: 1.2, max: 1.2, r: rand(6, 11), c: '#5a3a58', drag: .6 });
  }
  draw() {
    const t = this.t, ph = this.phase, hit = this.flash > 0;
    const lava = ph === 0 ? '#ff7a1a' : ph === 1 ? '#ff9a2a' : '#ffd36a';
    const chg = this.warn('core');
    ctx.save(); ctx.translate(this.x, this.y);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 10, 280, '#ff6a1a', .3 + ph * .08 + Math.sin(t * 3) * .04); ctx.restore(); ctx.globalAlpha = 1;

    // rochas em orbita (atras)
    const orbit = r => { const a = r.a + t * .8 * r.s, rx = Math.cos(a) * r.r, ry = Math.sin(a) * r.r * .55 + 10; return [rx, ry, Math.sin(a) > 0]; };
    for (const r of this.rocks) {
      const [rx, ry, front] = orbit(r); if (front) continue;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(t * r.s); ctx.fillStyle = '#5a4058'; ctx.strokeStyle = 'rgba(255,154,60,.55)'; ctx.lineWidth = 2;
      poly(0, 0, r.sz, 7, .22, r.a); ctx.fill(); ctx.stroke(); ctx.restore();
    }

    // bracos feitos de pedras encadeadas, do ombro ate o punho
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1, [fx, fy] = this.fist(i), ex = fx - this.x, ey = fy - this.y, sx = s * 96, sy = -12;
      const cx2 = sx + (ex - sx) * .35 + s * 28, cy2 = sy + (ey - sy) * .9 - 20;
      for (let k = 0; k < 6; k++) {
        const u = k / 6, x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx2 + u * u * ex, y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy2 + u * u * ey;
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * .4 + k);
        ctx.fillStyle = lin(-22, -22, 22, 22, [[0, hit ? '#fff' : '#8a6a88'], [1, '#2a1230']]); ctx.strokeStyle = 'rgba(255,154,60,.6)'; ctx.lineWidth = 2.5;
        poly(0, 0, 30 - k * 2, 8, .14, k * 1.7); ctx.fill(); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 16, lava, .35); ctx.restore();
      }
    }

    // tronco em camadas (respira)
    const br = Math.sin(t * 1.6) * 3;
    ctx.fillStyle = lin(0, -120, 0, 130, [[0, '#4a3048'], [1, '#14081c']]); poly(0, 10, 128, 12, .08, 1); ctx.fill();
    ctx.strokeStyle = lava; ctx.lineWidth = 4; ctx.stroke();
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = lin(0, -100, 0, 100, [[0, hit ? '#fff' : ['#b090ae', '#9a7a98', '#80607e'][k]], [1, ['#3a2038', '#2a1430', '#1c0c24'][k]]]);
      poly(Math.sin(t * 1.1 + k) * 3, 10 + br * (k - 1) * .6, 106 - k * 14, 10, .11, k * 3 + 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,154,60,.45)'; ctx.lineWidth = 2.5; ctx.stroke();
    }
    // cavidade e veias de energia
    ctx.fillStyle = '#10040e'; poly(0, 14, 50, 9, .07, 5); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * TAU + .3, e = 100 + Math.sin(k * 3) * 10;
      ctx.strokeStyle = lava; ctx.globalAlpha = .25; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 40, 14 + Math.sin(a) * 40); ctx.lineTo(Math.cos(a) * e, 14 + Math.sin(a) * e * .95); ctx.stroke();
      ctx.globalAlpha = .9; ctx.lineWidth = 2.5; ctx.setLineDash([12, 20]); ctx.lineDashOffset = -t * 70; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 40, 14 + Math.sin(a) * 40); ctx.lineTo(Math.cos(a) * e, 14 + Math.sin(a) * e * .95); ctx.stroke(); ctx.setLineDash([]);
    }
    drawGlow(0, 14, 90 + Math.sin(t * 5) * 10 + chg * 40, lava, .9 + chg * .3);
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(0, 14); ctx.rotate(Math.sin(t * 2) * .12); const cs = 1 + Math.sin(t * 5) * .08 + chg * .3;
    ctx.fillStyle = hit ? '#fff' : '#fff2c0'; ctx.beginPath(); ctx.moveTo(0, -34 * cs); ctx.lineTo(24 * cs, 0); ctx.lineTo(0, 40 * cs); ctx.lineTo(-24 * cs, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ff9a3c'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();

    // ombreiras com espinhos
    for (const s of [-1, 1]) {
      if (this.shedHelm && s > 0) continue;
      ctx.save(); ctx.translate(s * 100, -44);
      ctx.fillStyle = lin(0, -40, 0, 40, [[0, hit ? '#fff' : '#9a7a98'], [1, '#2a1230']]); poly(0, 0, 44, 9, .12, s + 4); ctx.fill(); ctx.strokeStyle = lava; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#5a4058'; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * 16 - 7, -32); ctx.lineTo(k * 16, -56 - Math.abs(k) * -6); ctx.lineTo(k * 16 + 7, -32); ctx.fill(); }
      ctx.restore();
    }

    // cabeca: sobrancelha, olhos, mandibula (abre ao atirar)
    ctx.save(); ctx.translate(0, -100);
    ctx.fillStyle = lin(0, -44, 0, 44, [[0, hit ? '#fff' : '#a08aa0'], [1, '#2c1630']]); poly(0, 0, 44, 9, .1, 3); ctx.fill(); ctx.strokeStyle = lava; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#10040e'; ctx.beginPath(); ctx.moveTo(-34, -8); ctx.lineTo(0, -2); ctx.lineTo(34, -8); ctx.lineTo(26, 8); ctx.lineTo(0, 10); ctx.lineTo(-26, 8); ctx.closePath(); ctx.fill();
    const eye = ph === 2 ? '#ff3a2a' : ph === 1 ? '#ff8a1f' : '#ffe9a8';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) drawGlow(s * 15, 0, 20, eye, .9); ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = eye; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 15, 0, 9, 4.5 + chg * 3, s * .25, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#10040e'; ctx.beginPath(); ctx.roundRect(-18, 18, 36, 8 + chg * 12, 3); ctx.fill();
    if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 24, 20 + chg * 26, '#ffe9a8', chg); ctx.restore(); ctx.globalAlpha = 1; }
    ctx.fillStyle = '#c8b0c0'; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 7 - 3, 18); ctx.lineTo(k * 7, 25); ctx.lineTo(k * 7 + 3, 18); ctx.fill(); }
    if (!this.shedHelm) { ctx.fillStyle = '#5a4058'; ctx.strokeStyle = lava; ctx.lineWidth = 2; for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(k * 14 - 8, -40); ctx.lineTo(k * 14, -64 - (1 - Math.abs(k)) * 14); ctx.lineTo(k * 14 + 8, -40); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
    ctx.restore();

    // rochas em orbita (na frente)
    for (const r of this.rocks) {
      const [rx, ry, front] = orbit(r); if (!front) continue;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(t * r.s); ctx.fillStyle = hit ? '#fff' : '#7a6078'; ctx.strokeStyle = 'rgba(255,154,60,.8)'; ctx.lineWidth = 2;
      poly(0, 0, r.sz * 1.15, 7, .22, r.a); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.restore();

    // punhos
    for (let i = 0; i < 2; i++) {
      const [fx, fy] = this.fist(i), u = this.slamT[i], dropping = u > 0 && u <= .35, charging = u > .35;
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(Math.sin(t * 2 + i) * .15 + (dropping ? (i ? -.3 : .3) : 0));
      if (dropping) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = lava; ctx.globalAlpha = .6; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const k of [-30, 0, 30]) { ctx.beginPath(); ctx.moveTo(k, -90); ctx.lineTo(k, -20); ctx.stroke(); } ctx.restore(); ctx.globalAlpha = 1; }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 100, lava, .25 + (charging ? .5 : 0) + (dropping ? .6 : 0)); ctx.restore(); ctx.globalAlpha = 1;
      ctx.fillStyle = lin(0, -62, 0, 62, [[0, hit ? '#fff' : '#a88aa6'], [1, '#2a1230']]);
      poly(0, 0, 60, 10, .1, i * 2 + 1); ctx.fill(); ctx.strokeStyle = lava; ctx.lineWidth = 4; ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = lava; ctx.lineWidth = 3; ctx.globalAlpha = .7 + Math.sin(t * 6 + i) * .2; ctx.lineCap = 'round';
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * 20, 14); ctx.lineTo(k * 20 + 3, 40); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-8, -6); ctx.lineTo(-18, 10); ctx.stroke(); ctx.restore();
      ctx.restore();
    }
    ctx.save(); ctx.translate(this.x, this.y); this.flashOverlay(120); ctx.restore();
  }
}

// ======================= 3. Olho da Tempestade =======================
class StormEye extends Boss {
  constructor() {
    super('Olho da Tempestade', 560); this.col = '#ff7ac8'; this.dark = '#3a1a6a'; this.rad = 110;
    this.spin = 0; this.chargeT = 0; this.chargeMax = 1; this.look = [0, 0];
  }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 108 + r; }
  move(dt) {
    const s = .5 + this.phase * .15; this.x = W / 2 + Math.sin(this.t * s) * 340; this.y = this.baseY + 10 + Math.sin(this.t * s * 2) * 30;
    if (dt > 0) this.chargeT = Math.max(0, this.chargeT - dt);
  }
  onPhase() { super.onPhase(); shedDebris(this.x, this.y, 12, ['#3a1a6a', '#ff7ac8', '#9fe8ff'], 400, 13); }
  laserAt(a, warn, dur) {
    const len = 1500;
    G.hazards.push({ cx: this.x + Math.cos(a) * len / 2, cy: this.y + Math.sin(a) * len / 2, w: len, h: 64, rot: a, warn, dur, t: 0, c: '#ff7ac8', kind: 'laser', hit: false, fired: false });
    this.chargeT = warn; this.chargeMax = warn;
  }
  ai(dt) {
    const ph = this.phase;
    if (this.tick('bolt', dt, ph === 0 ? 1.4 : ph === 1 ? 1.1 : .8)) {
      const px = Math.random() < .7 ? G.player.x + rand(-60, 60) : rand(80, W - 80);
      Events.hazardRect(clamp(px, 80, W - 80), H / 2, 110, H, .85, .3, '#ff7ac8', 'bolt');
      if (ph === 2 && Math.random() < .6) Events.hazardRect(rand(80, W - 80), H / 2, 110, H, 1, .3, '#ff7ac8', 'bolt');
    }
    if (this.tick('fan', dt, ph === 0 ? 2 : 1.6)) { fanAimed(this.x, this.y + 20, ph === 0 ? 3 : 5, ph === 0 ? .5 : .8, 250); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); G.parts.push({ k: 'flash', x: this.x, y: this.y + 20, vx: 0, vy: 0, life: .12, max: .12, r: 50, c: '#9fe8ff', drag: 1 }); }
    if (ph >= 1 && this.tick('laser', dt, ph === 1 ? 5 : 4)) {
      const a = aimAt(this.x, this.y);
      this.laserAt(a, 1.1, .8);
      if (ph === 2) { this.laserAt(a + .5, 1.1, .8); this.laserAt(a - .5, 1.1, .8); }
    }
    if (ph >= 1 && this.tick('ring', dt, 2.4)) { ring(this.x, this.y, 16, 190, this.t); Snd.play('enemyShoot'); shockwave(this.x, this.y, 180, '#9fe8ff'); }
    if (ph === 2 && this.tick('spiral', dt, .14)) { this.spin += .45; ebullet(this.x, this.y, this.spin, 210, { r: 6 }); ebullet(this.x, this.y, this.spin + Math.PI, 210, { r: 6 }); }
    if (this.tick('kami', dt, 7)) for (let i = 0; i < 2; i++) spawnEnemy('bit', this.x + (i ? 60 : -60), this.y + 60, { bx: this.x + (i ? 60 : -60) });
    if (Math.random() < dt * 20) { const a = rand(0, TAU); G.parts.push({ x: this.x + Math.cos(a) * 130, y: this.y + Math.sin(a) * 130, vx: Math.cos(a) * 40, vy: 160, life: .5, max: .5, r: 3, c: '#9fe8ff', drag: .5 }); }
  }
  draw() {
    const t = this.t, ph = this.phase, hit = this.flash > 0;
    const chg = this.chargeT > 0 ? 1 - this.chargeT / this.chargeMax : 0;
    ctx.save(); ctx.translate(this.x, this.y);

    // nuvem de tempestade girando atras
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, 330, '#ff3d9a', .3 + Math.sin(t * 4) * .06); drawGlow(0, 0, 200, '#33c4ff', .22);
    const cols = ['#7a3dff', '#ff3d9a', '#33c4ff'];
    for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.35 + k * .12) * (k % 2 ? -1 : 1) + k * 2); drawGlow(150, 0, 130, cols[k], .34); drawGlow(-150, 0, 130, cols[k], .34); drawGlow(0, 150, 100, cols[k], .2); ctx.restore(); }
    ctx.restore(); ctx.globalAlpha = 1;

    // anel de metal com parafusos
    ctx.strokeStyle = '#2a1050'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(0, 0, 116, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,122,200,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 126, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 106, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#9fe8ff'; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.beginPath(); ctx.arc(Math.cos(a) * 116, Math.sin(a) * 116, 2.6, 0, 7); ctx.fill(); }

    // placas giratorias com borda de energia e arcos entre elas
    const plates = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + t * .6; plates.push([Math.cos(a) * 138, Math.sin(a) * 138]);
      ctx.save(); ctx.rotate(a); ctx.translate(0, -138);
      ctx.fillStyle = lin(0, -22, 0, 20, [[0, hit ? '#fff' : '#5a2aa0'], [1, '#1a0840']]); ctx.strokeStyle = '#ff7ac8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-28, 12); ctx.lineTo(-18, -20); ctx.lineTo(18, -20); ctx.lineTo(28, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -2, 20, '#9fe8ff', .5 + Math.sin(t * 5 + i) * .3); ctx.restore(); ctx.globalAlpha = 1;
      ctx.restore();
    }
    const arcN = 1 + ph;
    for (let k = 0; k < arcN; k++) { const i = Math.floor(rand(0, 8)), j = (i + 1) % 8; if (Math.random() < .55) zap(plates[i][0], plates[i][1], plates[j][0], plates[j][1], 6, 9, '#9fe8ff', 2); }

    // globo ocular com veias
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 104, 0, TAU); ctx.clip();
    ctx.fillStyle = rdl(-24, -30, 10, 112, [[0, hit ? '#fff' : '#fff6fb'], [.65, hit ? '#fff' : '#ffc4e6'], [1, hit ? '#fdd' : '#a8369a']]); ctx.fillRect(-110, -110, 220, 220);
    ctx.strokeStyle = ph === 2 ? 'rgba(255,40,70,.8)' : 'rgba(220,60,120,.5)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (let k = 0; k < 11; k++) { const a = k / 11 * TAU + .4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 104, Math.sin(a) * 104); ctx.quadraticCurveTo(Math.cos(a + .4) * 72, Math.sin(a + .4) * 72, Math.cos(a + .15) * 46, Math.sin(a + .15) * 46); ctx.stroke(); }
    // iris
    const dx = clamp((G.player.x - this.x) / 400, -1, 1) * 28, dy = clamp((G.player.y - this.y) / 500, -.4, 1) * 24;
    ctx.save(); ctx.translate(dx, dy);
    ctx.fillStyle = rdl(0, 0, 6, 60, [[0, '#33c4ff'], [.5, ph === 2 ? '#ff3d6a' : '#ff7ac8'], [1, '#5a1060']]); ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.fill();
    ctx.lineWidth = 1.6; for (let k = 0; k < 28; k++) { const a = k / 28 * TAU + t * .15; ctx.strokeStyle = k % 2 ? 'rgba(255,255,255,.4)' : 'rgba(40,10,70,.4)'; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.lineTo(Math.cos(a) * 58, Math.sin(a) * 58); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; for (const r of [28, 42, 54]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
    const pw = 10 + Math.sin(t * 3) * 2 + chg * 16;
    ctx.fillStyle = '#12041f'; ctx.beginPath(); ctx.ellipse(0, 0, pw, 42 - chg * 6, 0, 0, 7); ctx.fill();
    if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 24 + chg * 44, '#9fe8ff', chg * .7); drawGlow(0, 0, 14 + chg * 22, '#ffffff', chg * .5); ctx.restore(); ctx.globalAlpha = 1; }
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(-18, -22, 7, 0, 7); ctx.fill();
    ctx.restore();
    // palpebras: piscam, fecham ao levar dano, arregalam na furia
    const bl = (t % 4.4) < .18 ? 1 - Math.abs((t % 4.4) / .09 - 1) : 0;
    let lid = Math.max(bl, hit ? .55 : 0); if (ph === 2) lid *= .6;
    const ly = -104 + lid * 104, lb = 104 - lid * 104;
    ctx.fillStyle = lin(0, -110, 0, ly + 20, [[0, '#2a0f55'], [1, '#5a2aa0']]);
    ctx.beginPath(); ctx.moveTo(-112, -112); ctx.lineTo(112, -112); ctx.lineTo(112, ly); ctx.quadraticCurveTo(0, ly + 34 + ph * 6, -112, ly); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lin(0, 110, 0, lb - 20, [[0, '#2a0f55'], [1, '#5a2aa0']]);
    ctx.beginPath(); ctx.moveTo(-112, 112); ctx.lineTo(112, 112); ctx.lineTo(112, lb); ctx.quadraticCurveTo(0, lb - 30, -112, lb); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#4a1060'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 104, 0, TAU); ctx.stroke();

    // corona de raios ao redor
    if (Math.random() < .8) { for (let i = 0; i < 2 + ph; i++) { const a = rand(0, TAU), b = a + rand(-.5, .5); zap(Math.cos(a) * 112, Math.sin(a) * 112, Math.cos(b) * rand(150, 190), Math.sin(b) * rand(150, 190), 6, 10, '#9fe8ff', 2); } }
    // orbe carregando o laser
    if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(dx, dy + 30, 14 + chg * 34, '#ffffff', chg * .5); drawGlow(dx, dy + 30, 30 + chg * 60, '#ff7ac8', chg * .55); ctx.restore(); ctx.globalAlpha = 1; }
    this.flashOverlay(106);
    ctx.restore();
  }
}

// ======================= 4. Sol-Guardiao =======================
class SunGuardian extends Boss {
  constructor() {
    super('Sol-Guardião', 760); this.col = '#ff7a1f'; this.dark = '#6a1a0a'; this.rad = 130;
    this.spin = 0; this.charge = 0; this.muzzle = 0; this.ringsOff = false;
    this.spots = Array.from({ length: 9 }, () => ({ a: rand(0, TAU), r: rand(20, 90), s: rand(.6, 1.2), sz: rand(18, 40) }));
  }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 122 + r; }
  move(dt) {
    const s = .45 + this.phase * .12; this.x = W / 2 + Math.sin(this.t * s) * 300; this.y = this.baseY + 20 + Math.sin(this.t * .8) * 14;
    if (dt > 0) this.muzzle = Math.max(0, this.muzzle - dt);
  }
  onPhase() {
    super.onPhase();
    if (this.phase === 1) { shedDebris(this.x - 140, this.y, 8, ['#d9a04a', '#ffd36a'], 380, 14); }
    if (this.phase === 2) { this.ringsOff = true; shedDebris(this.x, this.y, 16, ['#d9a04a', '#ffd36a', '#ff7a1f'], 460, 15); }
  }
  ai(dt) {
    const ph = this.phase;
    if (this.charge > 0) {
      this.charge -= dt;
      const pr = 1 - this.charge / 1.8;
      for (let i = 0; i < 4; i++) { const a = rand(0, TAU), d = 260 - pr * 60; G.parts.push({ x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d, vx: -Math.cos(a) * 340, vy: -Math.sin(a) * 340, life: .6, max: .6, r: 4, c: i % 2 ? '#ffd36a' : '#ff5a2a', drag: 0 }); }
      if (this.charge <= 0) { // supernova: anel com brechas
        const n = 36, gap = Math.floor(rand(0, n));
        for (let i = 0; i < n; i++) if (Math.abs(((i - gap + n) % n)) > 2 && Math.abs(((i - gap + n) % n)) < n - 2) ebullet(this.x, this.y, i / n * TAU, 230, { r: 8 });
        shockwave(this.x, this.y, 320, '#ffb340'); shockwave(this.x, this.y, 200, '#ffffff'); shake(12); flashScreen(.4); Snd.play('explode', { size: 1.5 });
        burst(this.x, this.y, ['#ffd36a', '#ff7a1f', '#ffffff'], 40, 500, 7);
      }
      return;
    }
    if (this.tick('beam', dt, ph === 0 ? 2.6 : ph === 1 ? 2.2 : 1.8)) {
      const y = Math.random() < .65 ? clamp(G.player.y + rand(-50, 50), 90, H - 90) : rand(90, H - 90);
      Events.hazardRect(W / 2, y, W + 40, 90, 1.1, .6, '#ffb340', 'beam');
    }
    if (this.tick('fan', dt, ph === 0 ? 1.9 : 1.5)) {
      fanAimed(this.x, this.y + 20, ph === 0 ? 5 : 7, 1, 240); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); this.muzzle = .14;
      for (const s of [-1, 1]) G.parts.push({ k: 'flash', x: this.x + s * 150, y: this.y + 30, vx: 0, vy: 0, life: .12, max: .12, r: 40, c: '#ffe9a8', drag: 1 });
    }
    if (ph >= 1 && this.tick('spiral', dt, .14)) {
      this.spin += .38; for (let k = 0; k < 3; k++) ebullet(this.x, this.y, this.spin + k * TAU / 3, 210, { r: 6 });
    }
    if (ph >= 1 && this.tick('kami', dt, 6.5)) for (let i = 0; i < 3; i++) spawnEnemy('kami', this.x + (i - 1) * 70, this.y + 80, { mode: 'enter', bx: this.x + (i - 1) * 70 });
    if (ph === 2 && this.tick('nova', dt, 7)) { this.charge = 1.8; Snd.play('charge', { dur: 1.8 }); }
  }
  draw() {
    const t = this.t, ph = this.phase, hit = this.flash > 0;
    const novaP = this.charge > 0 ? 1 - this.charge / 1.8 : 0, beamW = this.warn('beam', 1.1);
    const sc = this.charge > 0 ? 1 - novaP * .1 : 1;
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(sc, sc);

    // halo, ondas de calor e raios de sol atras
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, 350 + novaP * 140, '#ff6a1a', .28 + novaP * .2); drawGlow(0, 0, 210, '#ffd36a', .16 + novaP * .3);
    for (let i = 0; i < 3; i++) { const k = (t * .4 + i / 3) % 1; ctx.globalAlpha = (1 - k) * .3; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 130 + k * 150, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = .22; ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 2;
    for (let i = 0; i < 36; i++) { const a = i / 36 * TAU + t * .15, l1 = 140, l2 = 230 + (i % 3) * 40 + Math.sin(t * 3 + i) * 12; ctx.beginPath(); ctx.moveTo(Math.cos(a) * l1, Math.sin(a) * l1); ctx.lineTo(Math.cos(a) * l2, Math.sin(a) * l2); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;

    // corona de chamas (duas camadas) e protuberancias
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let layer = 0; layer < 2; layer++) {
      const n = layer ? 28 : 18;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + t * (layer ? -.35 : .5), l = (layer ? 128 : 160) + Math.sin(t * 4 + i * 1.7 + layer) * 24 + Math.sin(t * 9 + i) * 8 + (this.charge > 0 ? novaP * 40 : 0), w = layer ? .09 : .13;
        const g = ctx.createLinearGradient(Math.cos(a) * 100, Math.sin(a) * 100, Math.cos(a) * l, Math.sin(a) * l);
        g.addColorStop(0, layer ? 'rgba(255,240,170,.9)' : 'rgba(255,190,70,.9)'); g.addColorStop(1, 'rgba(255,60,20,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(Math.cos(a - w) * 100, Math.sin(a - w) * 100); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.lineTo(Math.cos(a + w) * 100, Math.sin(a + w) * 100); ctx.closePath(); ctx.fill();
      }
    }
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { const a = t * .3 + k * 2.1, rr = 118, h = 40 + Math.sin(t * 2 + k) * 12; ctx.strokeStyle = 'rgba(255,170,60,.7)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, h, a + Math.PI * .6, a + Math.PI * 1.4); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;

    // aneis de armadura dourados (soltam-se na fase 3)
    if (!this.ringsOff) for (let i = 0; i < 2; i++) {
      ctx.save(); ctx.rotate(t * (i ? -.6 : .8)); ctx.scale(1, .28 + i * .1);
      ctx.strokeStyle = hit ? '#fff' : '#d9a04a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 152, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 156, 0, TAU); ctx.stroke();
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.fillStyle = '#ff3a2a'; ctx.beginPath(); ctx.arc(Math.cos(a) * 152, Math.sin(a) * 152, 7, 0, 7); ctx.fill(); }
      ctx.restore();
    }

    // esfera solar com granulacao
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 118, 0, TAU); ctx.clip();
    ctx.fillStyle = rdl(-30, -35, 10, 124, [[0, hit ? '#fff' : '#fff2c0'], [.35, hit ? '#fff4e0' : '#ffc040'], [.8, hit ? '#fdd' : '#ff7a1f'], [1, hit ? '#fcc' : '#b81a10']]); ctx.fillRect(-124, -124, 248, 248);
    for (const sp of this.spots) { const a = sp.a + t * .25 * sp.s, x = Math.cos(a) * sp.r, y = Math.sin(a) * sp.r * .9; ctx.fillStyle = 'rgba(190,50,10,.35)'; ctx.beginPath(); ctx.arc(x, y, sp.sz, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,240,170,.35)'; ctx.beginPath(); ctx.arc(x + 6, y - 6, sp.sz * .5, 0, 7); ctx.fill(); }
    if (ph === 2) { ctx.fillStyle = rdl(0, 0, 10, 120, [[0, 'rgba(255,255,255,.7)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(-124, -124, 248, 248); }
    ctx.restore();

    // canhoes laterais
    for (const s of [-1, 1]) {
      ctx.fillStyle = lin(s * 138, -20, s * 178, 40, [[0, '#d9a04a'], [1, '#6a3a0a']]); ctx.beginPath(); ctx.roundRect(s * 150 - 18, 4, 36, 54, 10); ctx.fill(); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 150, 58, 12 + this.muzzle / .14 * 30, this.muzzle > 0 ? '#ffffff' : '#ffb340', .8); ctx.restore(); ctx.globalAlpha = 1;
    }

    // mascara dourada com coroa de espinhos
    ctx.fillStyle = lin(0, -90, 0, 50, [[0, '#d9a04a'], [1, '#6a3a0a']]);
    for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(k * 40 - 14, -52); ctx.lineTo(k * 44, -92 - (1 - Math.abs(k)) * 18); ctx.lineTo(k * 40 + 14, -52); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#3a0f20'; ctx.beginPath(); ctx.moveTo(-74, -22); ctx.lineTo(0, -38); ctx.lineTo(74, -22); ctx.lineTo(58, 28); ctx.lineTo(0, 44); ctx.lineTo(-58, 28); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d9a04a'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#d9a04a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 10, -34); ctx.lineTo(s * 62, -22 + ph * 4); ctx.lineTo(s * 60, -12 + ph * 4); ctx.lineTo(s * 10, -22); ctx.closePath(); ctx.fill(); }
    const ex = clamp((G.player.x - this.x) / 300, -1, 1) * 5, ey = clamp((G.player.y - this.y) / 400, -.3, 1) * 4;
    const eyeC = ph === 2 ? '#ff4a2a' : '#ffe9a8', big = 1 + beamW * .5 + novaP * .6;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 30 + ex, ey, 26 * big, eyeC, .8 + beamW * .4); ctx.restore(); ctx.globalAlpha = 1;
      ctx.fillStyle = eyeC; ctx.beginPath(); ctx.ellipse(s * 30 + ex, ey, 14 * big, 8 * big, s * .15, 0, 7); ctx.fill();
      ctx.fillStyle = '#3a0f20'; ctx.beginPath(); ctx.arc(s * 30 + ex * 1.7, ey * 1.4, 4, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#d9a04a'; ctx.beginPath(); ctx.moveTo(-14, 22); ctx.lineTo(0, 36); ctx.lineTo(14, 22); ctx.lineTo(0, 28); ctx.closePath(); ctx.fill();
    this.flashOverlay(122);
    ctx.restore();
  }
}

const BOSS_CLASSES = { mother: MotherShip, golem: RockGolem, eye: StormEye, sun: SunGuardian };
