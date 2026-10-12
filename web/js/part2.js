'use strict';
// ---------- PARTE 2: O Coracao do Vazio (fases 5 e 6, chefes, historia, vitoria e creditos) ----------
PLANET_PALS.ash = ['#e6ecff', '#6a7aa8', '#1c2440', true];
PLANET_PALS.void = ['#e8d0ff', '#8a3ad8', '#1a0630', false];

STAGES.push({
  id: 4, name: 'Cemitério das Estrelas', desc: 'Restos de estrelas que já brilharam. Algo escuro se move entre os destroços.',
  music: 's5', bossMusic: 'b5', duration: 100, boss: 'echo', bossName: 'Eco do Olienzinho', tint: '#7fa8ff',
  pal: {
    top: '#0f1a3c', bot: '#02040e', star: '#cfe0ff', dust: '#8fb0e0', shaft: '120,170,255', rock0: '#44557f', rock1: '#0c1228', rim: 'rgba(150,190,255,.5)', rocks: 15,
    nebA: [[220, 180, 400, '#3a5ad6', .2], [1050, 330, 420, '#2a8aa8', .16], [640, 600, 340, '#6a3ac8', .14]],
    nebB: [[880, 120, 300, '#8fb0e0', .1], [220, 480, 320, '#c040ff', .08]],
    planets: [PLANET_PALS.ash, PLANET_PALS.teal, PLANET_PALS.violet],
  },
  phases: [
    { until: 32, every: .85, pool: { zig: 2, kami: 2, shooter: 2, shield: 1 } },
    { until: 66, every: .75, pool: { kami: 3, shooter: 2, shield: 2, healer: 1, mine: 1 } },
    { until: 100, every: .65, pool: { kami: 3, shooter: 2, tank: 2, healer: 1, shield: 2, bit: 2 } },
  ],
  events: [{ at: 22, name: 'rain' }, { at: 44, name: 'mines' }, { at: 66, name: 'storm' }, { at: 82, name: 'giant' }],
});
STAGES.push({
  id: 5, name: 'Coração do Vazio', desc: 'O primeiro silêncio. Aqui a escuridão aprendeu a falar.',
  music: 's6', bossMusic: 'b6', duration: 110, boss: 'void', bossName: 'O Vazio', tint: '#c04aff',
  pal: {
    top: '#1c0636', bot: '#000000', star: '#e0c8ff', dust: '#a070ff', shaft: '154,99,255', rock0: '#3a1a60', rock1: '#08020f', rim: 'rgba(190,120,255,.5)', rocks: 10,
    nebA: [[200, 200, 420, '#7a2ad6', .24], [1050, 300, 440, '#c0309a', .18], [640, 600, 360, '#3a1a9a', .2]],
    nebB: [[860, 140, 320, '#c04aff', .12], [240, 460, 340, '#5a2ad6', .12]],
    planets: [PLANET_PALS.void, PLANET_PALS.violet],
  },
  phases: [
    { until: 34, every: .8, pool: { kami: 3, shooter: 2, shield: 2, zig: 2 } },
    { until: 72, every: .7, pool: { kami: 3, shooter: 2, shield: 2, healer: 1, tank: 1, bit: 2 } },
    { until: 110, every: .62, pool: { kami: 3, shooter: 2, shield: 2, healer: 1, tank: 2, bit: 2, mine: 1 } },
  ],
  events: [{ at: 20, name: 'storm' }, { at: 42, name: 'worm' }, { at: 64, name: 'mines' }, { at: 86, name: 'flare' }],
});
CAPTAINS.push('Guardião Caído', 'Sombra Errante');

// ---------- personagem: o Eco ----------
CHARS.X = { name: 'ECO', c: '#c040ff', bg0: '#3a1070', bg1: '#08020f' };
Portraits.face_X = function (mood, t, talk) {
  ctx.save(); ctx.scale(-1, 1); this.face_O(mood === 'happy' ? 'n' : mood, t, talk); ctx.restore();
  ctx.fillStyle = 'rgba(40,0,70,.55)'; ctx.fillRect(-100, -100, 200, 200);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff4ad0'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const y = -90 + ((t * 40 + i * 47) % 180); ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(-90, y); ctx.lineTo(90, y); ctx.stroke(); }
  ctx.restore();
};

// ---------- chefes ----------
function bossLaser(b, a, warn, dur, c) {
  const len = 1500;
  G.hazards.push({ cx: b.x + Math.cos(a) * len / 2, cy: b.y + Math.sin(a) * len / 2, w: len, h: 64, rot: a, warn, dur, t: 0, c, kind: 'laser', hit: false, fired: false });
  b.chargeT = warn; b.chargeMax = warn;
}

class EchoBoss extends Boss {
  constructor() {
    super('Eco do Olienzinho', 640); this.dieSfx = 'echoDie'; this.noBooms = true; this.dyLen = 3.1; this.col = '#c040ff'; this.dark = '#1a0a38'; this.rad = 80; this.dive = null; this.chargeT = 0; this.chargeMax = 1;
  }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 76 + r; }
  move(dt) {
    this.chargeT = Math.max(0, this.chargeT - dt);
    const d = this.dive;
    if (d) {
      d.t += dt;
      if (d.k === 'warn') { this.x += (d.tx - this.x) * Math.min(1, 6 * dt); if (d.t > .7) { d.k = 'go'; d.t = 0; Snd.play('mine'); } }
      else if (d.k === 'go') {
        this.y += 1150 * dt;
        if (this.y > H - 70 || d.t > .9) { d.k = 'back'; d.t = 0; shockwave(this.x, this.y, 240, this.col); shake(10); Snd.play('explode', { size: 1 }); }
        const p = G.player; if (!p.dead && Math.hypot(p.x - this.x, p.y - this.y) < 92) hurtPlayer(1);
      } else { this.y += (this.baseY - this.y) * Math.min(1, 3.5 * dt); if (d.t > .9) this.dive = null; }
      return;
    }
    const tx = clamp(W - G.player.x, 120, W - 120);
    this.x += (tx - this.x) * Math.min(1, (1.3 + this.phase * .5) * dt); this.y = this.baseY + Math.sin(this.t * 1.6) * 16;
  }
  ai(dt) {
    const ph = this.phase;
    if (this.dive) return;
    if (this.tick('mirror', dt, ph === 0 ? .6 : .46)) { for (const dx of (ph === 2 ? [-38, 0, 38] : [-24, 24])) ebullet(this.x + dx, this.y + 50, Math.PI / 2, 330, { r: 6 }); }
    if (this.tick('fan', dt, 2.5)) { fanAimed(this.x, this.y + 30, ph === 0 ? 5 : 7, ph === 0 ? .7 : 1.1, 240); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); }
    if (ph >= 1 && this.tick('cannon', dt, 3.4)) { ebullet(this.x, this.y + 40, aimAt(this.x, this.y), 210, { r: 16 }); shockwave(this.x, this.y + 40, 90, this.col); }
    if (ph >= 1 && this.tick('dive', dt, ph === 1 ? 7 : 5)) { const tx = clamp(G.player.x, 100, W - 100); this.dive = { k: 'warn', t: 0, tx }; Events.hazardRect(tx, H / 2, 90, H, .7, .25, '#c040ff', 'bolt'); }
    if (ph === 2 && this.tick('laser', dt, 5)) { const a = aimAt(this.x, this.y); bossLaser(this, a, 1.1, .8, '#c040ff'); bossLaser(this, a + .5, 1.1, .8, '#c040ff'); bossLaser(this, a - .5, 1.1, .8, '#c040ff'); }
    if (this.tick('bits', dt, 7)) for (let i = 0; i < 2; i++) spawnEnemy('bit', this.x + (i ? 60 : -60), this.y + 60, { bx: this.x + (i ? 60 : -60) });
  }
  dyingFx(dt) {
    this.gl = Math.min(1, this.dyingT / 2.6);
    if (Math.random() < dt * 9) G.glitchT = .1;
    if (Math.random() < dt * 12) shedDebris(this.x + rand(-60, 60), this.y + rand(-70, 70), 2, ['#c040ff', '#ff4ad0', '#2ad4ff'], 320, 9);
    if (Math.random() < dt * 20) sparks(this.x + rand(-70, 70), this.y + rand(-80, 80), '#ff4ad0', 4, 280);
    if (Math.random() < dt * 5) shockwave(this.x + rand(-40, 40), this.y + rand(-40, 40), 120, '#c040ff');
  }
  finalFx() {
    for (let i = 0; i < 4; i++) shockwave(this.x, this.y, 260 + i * 160, i % 2 ? '#ffe9a8' : '#2ad4ff');
    for (let i = 0; i < 70; i++) G.parts.push({ x: this.x + rand(-60, 60), y: this.y + rand(-60, 60), vx: rand(-140, 140), vy: -rand(80, 300), life: 1.8, max: 1.8, r: rand(2, 5), c: Math.random() < .5 ? '#ffe9a8' : '#ffffff', drag: .6 });
    G.glitchT = .4;
  }
  draw() {
    if (this.state !== 'dying') return this.drawShip();
    const alpha = clamp(1 - (this.dyingT - 2.3) / .8, 0, 1), gl = this.gl || 0; if (alpha <= 0) return;
    const n = 8, sh = 230 / n;
    for (let k = 0; k < n; k++) {
      ctx.save(); ctx.beginPath(); ctx.rect(this.x - 160, this.y - 115 + k * sh, 320, sh + 1); ctx.clip();
      ctx.translate((Math.random() - .5) * gl * 110 * (k % 2 ? 1 : -1), 0); ctx.globalAlpha = alpha * (Math.random() < gl * .25 ? .3 : 1); this.drawShip(); ctx.restore();
    }
  }
  drawShip() {
    const t = this.t, hit = this.flash > 0, chg = this.chargeT > 0 ? 1 - this.chargeT / this.chargeMax : 0;
    ctx.save(); ctx.translate(this.x, this.y);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 260, '#c040ff', .3 + Math.sin(t * 5) * .06); drawGlow(0, 20, 150, '#ff4ad0', .18 + chg * .3); ctx.restore(); ctx.globalAlpha = 1;
    const pal = { g0: hit ? '#fff' : '#7a5aa8', g1: '#2a1550', g2: '#0a0420', fin: '#3a1a6a', nozzle: '#150a30', stripe: '#ff4ad0', glow: '#c040ff' };
    // fantasmas do efeito de glitch (aberracao cromatica)
    for (const [c, ox] of [['#ff2a6a', -1], ['#2ad4ff', 1]]) {
      const off = Math.sin(t * 17 + ox) * 4 + (Math.random() < .08 ? ox * 12 : 0);
      ctx.save(); ctx.globalAlpha = .22; ctx.translate(ox * 6 + off, 0); ctx.rotate(Math.PI); Art.ship(0, 0, { pal: { ...pal, g0: c, g1: c, g2: '#200' }, vx: 0, t, lookx: 0, looky: 1, blinkT: 0, scale: 1.5 }); ctx.restore();
    }
    ctx.save(); ctx.rotate(Math.PI); Art.ship(0, 0, { pal, vx: Math.sin(t * 1.2) * 60, t, lookx: 0, looky: 1, blinkT: (t % 3.5) < .15 ? .15 : 0, scale: 1.5, boost: .8 }); ctx.restore();
    // rachaduras de luz roxa
    ctx.strokeStyle = 'rgba(255,74,208,.8)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + 1; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * 34 + Math.sin(t * 2 + i) * 3, Math.sin(a) * 60); ctx.stroke(); }
    if (Math.random() < .25) { ctx.fillStyle = 'rgba(255,74,208,.6)'; ctx.fillRect(rand(-60, 60), rand(-70, 70), rand(20, 70), 4); }
    if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 70, 30 + chg * 60, '#ff4ad0', chg * .6); ctx.restore(); }
    this.flashOverlay(80, 100);
    ctx.restore();
  }
}

class VoidBoss extends Boss {
  constructor() {
    super('O Vazio', 1000); this.introSfx = 'voidRoar'; this.dieSfx = 'voidDie'; this.noBooms = true; this.dyLen = 5.6; this.col = '#9a63ff'; this.dark = '#02000a'; this.rad = 130; this.dark_ = 0; this.dk = 0; this.chargeT = 0; this.chargeMax = 1; this.spin = 0; this.sweep = 0;
  }
  get darkAmt() { return this.dk; }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 118 + r; }
  move(dt) {
    this.chargeT = Math.max(0, this.chargeT - dt);
    const s = .35 + this.phase * .12; this.x = W / 2 + Math.sin(this.t * s) * 300; this.y = this.baseY + 20 + Math.sin(this.t * s * 1.7) * 26;
    this.dk += ((this.phase >= 1 && this.state === 'fight' ? 1 : 0) - this.dk) * Math.min(1, 1.2 * dt);
  }
  onPhase() { super.onPhase(); shedDebris(this.x, this.y, 14, ['#02000a', '#9a63ff', '#c04aff'], 420, 13); }
  ai(dt) {
    const ph = this.phase;
    if (this.tick('cols', dt, ph === 0 ? 4.2 : ph === 1 ? 3.4 : 2.8)) { // tentaculos batem de cima
      const n = ph === 0 ? 3 : ph === 1 ? 4 : 5, px = G.player.x;
      for (let i = 0; i < n; i++) { const x = i === 0 ? px : rand(90, W - 90); Events.hazardRect(clamp(x, 90, W - 90), H / 2, 100, H, .9 + i * .12, .3, '#9a63ff', 'bolt'); }
    }
    if (this.tick('fan', dt, ph === 0 ? 2.2 : 1.8)) { fanAimed(this.x, this.y + 30, 5 + ph * 2, .9 + ph * .2, 230); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); }
    if (this.tick('ring', dt, ph === 0 ? 3.4 : 2.4)) { ring(this.x, this.y, 14 + ph * 4, 175, this.t); Snd.play('enemyShoot'); shockwave(this.x, this.y, 200, '#9a63ff'); }
    if (ph >= 1 && this.tick('laser', dt, ph === 1 ? 5.2 : 4)) {
      this.sweep += 1; const base = Math.PI / 2 + (this.sweep % 2 ? .6 : -.6);
      bossLaser(this, base, 1.1, .9, '#c04aff'); if (ph === 2) { bossLaser(this, base + .7, 1.1, .9, '#c04aff'); bossLaser(this, base - .7, 1.1, .9, '#c04aff'); }
    }
    if (ph >= 1 && this.tick('spiral', dt, ph === 1 ? .24 : .17)) { this.spin += .4; for (let k = 0; k < (ph === 2 ? 3 : 2); k++) ebullet(this.x, this.y, this.spin + k * TAU / (ph === 2 ? 3 : 2), 200, { r: 6 }); }
    if (this.tick('kami', dt, 7)) for (let i = 0; i < 2; i++) spawnEnemy('kami', this.x + (i ? 80 : -80), this.y + 60);
    if (Math.random() < dt * 18) { const a = rand(0, TAU); G.parts.push({ x: this.x + Math.cos(a) * 150, y: this.y + Math.sin(a) * 150, vx: -Math.cos(a) * 60, vy: -Math.sin(a) * 60, life: .7, max: .7, r: 3, c: '#c04aff', drag: .4 }); }
  }
  dyingFx(dt) {
    const d = this.dyingT; this.collapse = clamp(d / 4.2, 0, 1); this.dk += (0 - this.dk) * Math.min(1, 2.5 * dt);
    if (d < 4.2) {
      if (Math.random() < dt * 70) { const a = rand(0, TAU), r = rand(260, 600); G.parts.push({ x: this.x + Math.cos(a) * r, y: this.y + Math.sin(a) * r, vx: -Math.cos(a) * r * 1.15, vy: -Math.sin(a) * r * 1.15, life: .85, max: .85, r: rand(2, 5), c: Math.random() < .5 ? '#e8d0ff' : '#ffe9a8', drag: 0 }); }
      if (Math.random() < dt * 3) shake(6 + this.collapse * 10);
    } else if (!this.nova) {
      this.nova = true; flashScreen(1); shake(34);
      for (let i = 0; i < 8; i++) shockwave(this.x, this.y, 300 + i * 150, i % 2 ? '#ffe9a8' : '#c04aff');
      burst(this.x, this.y, ['#ffffff', '#ffe9a8', '#e8d0ff', '#c04aff'], 180, 950, 9);
      for (let i = 0; i < 40; i++) G.parts.push({ x: this.x + rand(-80, 80), y: this.y + rand(-80, 80), vx: rand(-200, 200), vy: rand(-200, 200), life: 2.4, max: 2.4, r: rand(2, 5), c: '#ffe9a8', drag: .8 });
    }
  }
  finalFx() { G.hitstop = 0; for (let i = 0; i < 40; i++) dropPickup('coin', this.x + rand(-160, 160), this.y + rand(-100, 100), 4); }
  draw() {
    const t = this.t, ph = this.phase, hit = this.flash > 0, chg = this.chargeT > 0 ? 1 - this.chargeT / this.chargeMax : 0, cl = this.collapse || 0;
    ctx.save(); ctx.translate(this.x, this.y);
    if (this.nova) { // a luz volta: clarao que se dissolve
      const k = clamp((this.dyingT - 4.2) / 1.4, 0, 1);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 300 + k * 700, '#ffffff', (1 - k) * .9); drawGlow(0, 0, 200 + k * 400, '#ffe9a8', (1 - k) * .7); ctx.restore(); return;
    }
    if (cl > 0) { const sc = 1 - cl * .5; ctx.scale(sc, sc); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 260 + cl * 520, '#ffffff', cl * .6); drawGlow(0, 0, 160 + cl * 260, '#ffe9a8', cl * .5); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 380, '#7a2ad6', .3 + Math.sin(t * 2) * .05); drawGlow(0, 0, 200, '#c04aff', .22 + ph * .06); ctx.restore(); ctx.globalAlpha = 1;
    // tentaculos
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + t * .12, pts = [];
      for (let k = 0; k <= 14; k++) { const ang = a + Math.sin(t * 1.3 + i + k * .35) * .3 * (k / 14) + k * .04 * (i % 2 ? 1 : -1), r = 100 + k * (20 + ph * 2); pts.push([Math.cos(ang) * r, Math.sin(ang) * r * .9]); }
      for (const [col, w0] of [['rgba(154,99,255,.9)', 7], ['#02000a', 0]]) {
        for (let k = 0; k < 14; k++) { ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, (22 - k * 1.4) + w0 - (w0 ? 0 : 5)); ctx.beginPath(); ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); ctx.stroke(); }
      }
    }
    // raios da corona
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#e8d0ff'; ctx.lineWidth = 2;
    for (let i = 0; i < 36; i++) { const a = i / 36 * TAU + t * .08, r0 = 124, r1 = 150 + (i % 3) * 22 + Math.sin(t * 2 + i) * 6; ctx.globalAlpha = .25 + (i % 2) * .15; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
    // disco
    ctx.fillStyle = hit ? '#3a2060' : '#02000a'; ctx.beginPath(); ctx.arc(0, 0, 116, 0, TAU); ctx.fill();
    const g = ctx.createLinearGradient(-116, -116, 116, 116); g.addColorStop(0, '#ffe9a8'); g.addColorStop(.5, '#c04aff'); g.addColorStop(1, '#5a2ad6');
    ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 118, 0, TAU); ctx.stroke(); ctx.globalAlpha = .4; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 130, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    // olho: abre mais a cada fase
    const open = [.25, .6, 1][ph] * (1 - ((t % 5) < .14 ? .8 : 0)) * (1 - cl * .9), dx = clamp((G.player.x - this.x) / 400, -1, 1) * 22, dy = clamp((G.player.y - this.y) / 500, -.3, 1) * 14;
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 78, 58 * open + 3, 0, 0, TAU); ctx.clip();
    ctx.fillStyle = rdl(dx, dy, 4, 60, [[0, '#ffe9a8'], [.4, '#c04aff'], [1, '#3a0a70']]); ctx.fillRect(-90, -70, 180, 140);
    ctx.fillStyle = '#02000a'; ctx.beginPath(); ctx.ellipse(dx, dy, 9 + chg * 10, 50, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#c04aff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 78, 58 * open + 3, 0, 0, TAU); ctx.stroke();
    if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(dx, dy, 30 + chg * 70, '#ffffff', chg * .5); drawGlow(dx, dy, 60 + chg * 90, '#c04aff', chg * .5); ctx.restore(); }
    this.flashOverlay(118);
    ctx.restore();
  }
}
BOSS_CLASSES.echo = EchoBoss; BOSS_CLASSES.void = VoidBoss;

// escuridao do chefe final: so se ve em volta da nave; os tiros inimigos continuam visiveis
function drawDark() {
  const b = G.boss, p = G.player; if (!b || !p || !(b.dk > .01)) return;
  const g = ctx.createRadialGradient(p.x, p.y, 120, p.x, p.y, 380); g.addColorStop(0, 'rgba(0,0,12,0)'); g.addColorStop(1, 'rgba(0,0,12,' + (.86 * b.dk) + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  Events.drawHazards(); for (const q of G.eb) Art.ebullet(q);
}

// ---------- historia da Parte 2 ----------
STORY.stages.push({
  intro: [
    { music: 'sad' },
    { title: 'ATO II', sub: 'O CORAÇÃO DO VAZIO' },
    { title: 'SETOR 5', sub: 'CEMITÉRIO DAS ESTRELAS' },
    { who: 'N', text: 'Com os quatro guardiões de volta, o céu respirou fundo. Mas o Vazio não esperou: a única rota até o seu coração passava pelo cemitério das estrelas.' },
    { who: 'B', text: 'Varredura: milhares de restos estelares. Zero brilho ativo. Zero ruído. Isso é... assustadoramente educado.' },
    { who: 'O', mood: 'sad', text: 'Cada pedrinha dessas já foi uma estrela acesa. Alguém cantava para elas.' },
    { who: 'B', mood: 'worry', text: 'Olienzinho... algo se move atrás dos destroços. E a assinatura de energia dele é idêntica à sua.' },
    { who: 'O', mood: 'shock', text: 'À minha?!' },
    { mission: { n: 5, title: 'Atravessar o Cemitério', goal: 'Sobreviva aos restos famintos e derrote o Eco do Olienzinho.', boss: 'Eco do Olienzinho' } },
  ],
  pre: [
    { music: 'tension' },
    { who: 'N', scene: 'boss', text: 'Entre dois cascos partidos, um foguete escuro girou devagar. Era igual ao Olienzinho. Só que sem nenhuma luz.' },
    { who: 'X', scene: 'boss', mood: 'n', text: 'Você veio acender estrelas. Eu sou o que sobra quando elas apagam.' },
    { who: 'O', scene: 'boss', mood: 'shock', text: 'Você é... eu?' },
    { who: 'X', scene: 'boss', mood: 'angry', text: 'Sou o seu medo de falhar, com formato de foguete. O Vazio só me deu uma voz.' },
    { who: 'B', scene: 'boss', mood: 'worry', text: 'Cuidado! Ele aprendeu todos os seus golpes!' },
    { who: 'O', scene: 'boss', mood: 'determined', text: 'Então vou mostrar que o medo não precisa ser o último a falar.' },
  ],
  victory: 'Eu tenho medo, sim. Mas é com ele do meu lado que eu continuo voando!',
  after: [
    { music: 'sad' },
    { who: 'X', scene: 'freed', mood: 'sad', text: 'Você continuou. Mesmo comigo na sua frente. Por quê?' },
    { music: 'hope' },
    { who: 'O', scene: 'lit', mood: 'happy', text: 'Porque eu não preciso vencer o meu medo. Só preciso levá-lo junto, sem deixar que ele pilote.' },
    { who: 'X', scene: 'freedKeep', mood: 'free', text: '...Então eu posso ficar? Não como sombra. Como lembrete.' },
    { who: 'X', scene: 'fragment', frag: '#c040ff', mood: 'free', text: 'Leve o que restou de mim. Quando você duvidar, ele vai brilhar mais forte.' },
    { music: 'mystery' },
    { who: 'B', mood: 'worry', text: 'Olienzinho... a energia do Vazio está concentrada logo à frente. Meu núcleo está sendo puxado para lá.' },
    { who: 'O', mood: 'determined', text: 'Então é lá que a gente termina isso. Juntos.' },
  ],
});
STORY.stages.push({
  intro: [
    { music: 'mystery' },
    { title: 'SETOR 6', sub: 'CORAÇÃO DO VAZIO' },
    { who: 'N', scene: 'void', text: 'No fim de tudo, onde o céu já não tinha nome, pulsava um coração escuro: o primeiro silêncio, ainda esperando.' },
    { who: 'B', scene: 'void', mood: 'worry', text: 'Pressão energética absurda. Todos os fragmentos estão vibrando. Inclusive eu.' },
    { who: 'O', scene: 'void', mood: 'determined', text: 'Os guardiões acenderam o caminho até aqui. Agora é a nossa vez.' },
    { mission: { n: 6, title: 'Acender o Vazio', goal: 'Resista à escuridão e derrote O Vazio.', boss: 'O Vazio' } },
  ],
  pre: [
    { music: 'tension' },
    { who: 'V', scene: 'void', text: 'Você chegou. Ninguém jamais chegou tão longe sem desistir.' },
    { who: 'O', scene: 'void', mood: 'determined', text: 'Eu não desisto, lembra? Sou o foguete que não apaga.' },
    { who: 'V', scene: 'void', text: 'Eu era o silêncio antes da primeira estrela. Fiquei aqui sozinho, e ninguém nunca me perguntou se eu tinha medo.' },
    { who: 'O', scene: 'void', mood: 'shock', text: '...Você tinha?' },
    { who: 'V', scene: 'void', mood: 'angry', text: 'TENHO! Por isso apago tudo. Se nada brilha, nada pode me abandonar de novo!' },
    { who: 'B', scene: 'void', mood: 'worry', text: 'Olienzinho... ele não quer destruir o céu. Ele só não quer ficar sozinho.' },
    { music: 'heroic' },
    { who: 'O', scene: 'void', mood: 'determined', text: 'Então a gente vai mostrar que dá para ter luz sem perder ninguém. Prepare-se, Orbi!' },
  ],
  victory: 'Você não está sozinho. Nunca mais vai estar!',
  after: [
    { music: 'sad' },
    { who: 'V', scene: 'voidBreak', fx: 'voidMelt', mood: 'sad', text: 'Eu... não queria apagar ninguém. Só queria que alguém ficasse.' },
    { who: 'O', scene: 'lit', mood: 'sad', text: 'Eu fico. A gente fica. Mas a luz precisa voltar para o céu.' },
    { music: 'tension' },
    { who: 'B', scene: 'heart', mood: 'worry', text: 'Olienzinho... o Coração de Luz está incompleto. Eu sou a última peça. Eu preciso entrar nele.' },
    { who: 'O', scene: 'heart', mood: 'shock', text: 'Não! Tem que existir outro jeito! Você é o meu parceiro!' },
    { who: 'B', scene: 'heart', mood: 'happy', text: 'E é por isso que eu vou. Não vou deixar de existir. Vou virar a luz de todas as estrelas.' },
    { music: 'sad' },
    { who: 'O', scene: 'heart', fx: 'orbiAscend', mood: 'sad', text: 'Orbi...' },
    { who: 'B', scene: 'heart', fx: 'orbiAscend', mood: 'happy', text: 'Sempre que você olhar para cima e uma estrela piscar, vai ser eu dizendo: "Ainda estou aqui".' },
    { who: 'N', scene: 'heart', fx: 'orbiAscend', text: 'O pequeno orbe azul subiu até o Coração partido, e todas as estrelas se acenderam ao mesmo tempo.' },
  ],
});
STORY.defeat.boss.push(
  ['Todo foguete cai. Eu só cheguei antes.', 'Está vendo? Você é só um eco meu.', 'Se eu sou o seu medo... você já perdeu.'],
  STORY.defeat.void);
STORY.finale = [
  { music: 'triumph' },
  { who: 'N', scene: 'lit', text: 'O Vazio não desapareceu. Aprendeu a descansar entre as estrelas, e deixou de ser um buraco para ser o espaço onde elas cabem.' },
  { who: 'L', scene: 'lumi', mood: 'happy', text: 'Meu pequeno broto... você superou até a sua professora.' },
  { who: 'O', scene: 'lumi', mood: 'happy', text: 'Mestra Lumi! O Orbi... ele...' },
  { who: 'L', scene: 'lumi', mood: 'free', text: 'Está em cada brilho, em cada noite limpa. Quem ama de verdade nunca se apaga.' },
  { music: 'hope' },
  { who: 'O', mood: 'happy', text: 'Obrigado, Orbi. Eu vou acender cada uma delas por você.' },
  { who: 'N', fx: 'dawn', text: 'E assim, o menor foguete da galáxia voltou para casa, com um olho só... e o céu inteiro de olhos abertos.' },
  { title: 'FIM DA PARTE 2', sub: 'O CORAÇÃO DO VAZIO' },
  { who: 'B', mood: 'happy', text: '(Ainda estou aqui, Olienzinho.)' },
];

// ---------- tela de vitoria e creditos ----------
const CREDITS = [
  ['h', 'OLIENZINHO'], ['s', 'GUARDIÃO DAS ESTRELAS'], ['', ''],
  ['r', 'Uma produção'], ['h2', 'OLIEN DIGITAL'], ['', ''],
  ['r', 'Ideia e direção'], ['h2', 'Olien Digital'], ['', ''],
  ['r', 'Programação, arte, animação e roteiro'], ['h2', 'Equipe Olien Digital'], ['', ''],
  ['r', 'Música e efeitos sonoros'], ['h2', 'Sintetizados em tempo real, sem arquivos de áudio'], ['', ''],
  ['r', 'Personagens'], ['h2', 'Olienzinho'], ['h2', 'Orbi'], ['h2', 'Mestra Lumi'], ['h2', 'Colmeia, Pétreo, Vigia e Solaris'], ['h2', 'O Eco'], ['h2', 'O Vazio'], ['', ''],
  ['r', 'Agradecimento especial'], ['h2', 'A você, que acendeu as estrelas'], ['', ''], ['', ''],
  ['s', 'Ainda estou aqui.'], ['', ''], ['', ''],
];
Screens.victory = function () {
  const t = World.t - (G.victT ?? (G.victT = World.t)), d = Save.data;
  ctx.fillStyle = 'rgba(3,1,11,.55)'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(W / 2, 200, 420, '#ffd36a', .22 + Math.sin(t * 2) * .04); ctx.restore();
  const e = easeOut(clamp(t / .9, 0, 1));
  ctx.globalAlpha = e; ctx.save(); ctx.shadowColor = '#ffb340'; ctx.shadowBlur = 40; txt('VOCÊ SALVOU AS ESTRELAS', W / 2, 90 - (1 - e) * 30, 66, '#ffe9a8', 'center', 900); ctx.restore();
  txt('Olienzinho, Guardião das Estrelas', W / 2, 176, 24, '#cdb8ff', 'center', 700); ctx.globalAlpha = 1;
  Art.ship(W / 2 - 70, 330 + Math.sin(t * 1.6) * 8, { vx: 0, t, scale: 1.4, boost: .7, lookx: .3, looky: -.3, blinkT: Screens.blinkAt(t), mood: 'happy' });
  Art.orbi(W / 2 + 70, 322 + Math.sin(t * 1.6 + 1) * 8, { vx: 0, t, scale: 1.5, lookx: -.3, looky: -.3, blinkT: 0 });
  const grades = Object.values(d.grades || {}), rows = [['Fases concluídas', Object.keys(d.cleared || {}).filter(k => d.cleared[k]).length + ' / ' + STAGES.length], ['Notas S', String(grades.filter(g => g >= 3).length)], ['Fragmentos de Luz', Extras.fragCount() + ' / 6'], ['Conquistas', ACH.filter(a => d.ach[a.id]).length + ' / ' + ACH.length]];
  UI.panel(400, 440, 480, 150, { r: 18 });
  rows.forEach(([a, b], i) => { txt(a, 430, 454 + i * 34, 19, '#cdb8ff', 'left', 700); txt(b, 850, 453 + i * 34, 22, '#fff', 'right'); });
  if (UI.button('cred', 330, 620, 300, 56, 'CRÉDITOS', { size: 24, color: '#9a63ff' })) { G.credT = 0; G.state = 'credits'; }
  if (UI.button('map', 650, 620, 300, 56, 'VOLTAR AO MAPA', { size: 22 })) { G.victT = undefined; Game.goSelect(); }
};
Screens.credits = function () {
  G.credT = (G.credT || 0) + 1 / 60; const t = G.credT;
  ctx.fillStyle = 'rgba(3,1,11,.5)'; ctx.fillRect(0, 0, W, H);
  if (G.credT < 1.5) Snd.musicPlay('credits', 0);
  let y = H + 40 - t * 52;
  for (const [k, s] of CREDITS) {
    if (k === 'h') txt(s, W / 2, y, 72, '#fff', 'center', 900);
    else if (k === 's') txt(s, W / 2, y, 28, '#ffb340', 'center', 800);
    else if (k === 'r') txt(s, W / 2, y, 17, '#8f84c4', 'center', 800);
    else if (k === 'h2') txt(s, W / 2, y, 28, '#e2d4ff', 'center', 800);
    y += k === 'h' ? 90 : k === 's' ? 56 : k === 'r' ? 34 : k === 'h2' ? 44 : 26;
  }
  if (y < -20 || Input.pressed('escape')) { G.victT = undefined; Game.goTitle(); }
  txt('ESC  sair', W - 30, H - 30, 14, '#8f84c4', 'right', 700);
};
