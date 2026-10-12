'use strict';
// ---------- PARTE 3: O Outro Lado (setores 7 a 9) ----------
PLANET_PALS.gold = ['#fff6d8', '#ffd36a', '#7a5a20', true];
PLANET_PALS.sea = ['#d6f6ff', '#2a9ad8', '#0a2a5a', false];
PLANET_PALS.glass = ['#ffffff', '#c8b8ff', '#4a3a8a', true];

STAGES.push({
  id: 6, name: 'Cidade de Luz Flutuante', desc: 'Torres de luz pura boiando no vazio. Tudo aqui brilha demais para ser seguro.',
  music: 's7', bossMusic: 'b7', duration: 110, boss: 'herald', bossName: 'Arauto Luminoso', tint: '#ffd36a',
  pal: { top: '#2e2458', bot: '#0b0824', star: '#fff6d8', dust: '#ffe9a8', shaft: '255,220,140', rock0: '#8a7aa8', rock1: '#1c1440', rim: 'rgba(255,230,160,.5)', rocks: 8,
    nebA: [[200, 180, 400, '#ffb340', .18], [1050, 320, 420, '#ff7ac8', .16], [640, 600, 340, '#7a6aff', .14]], nebB: [[880, 120, 300, '#ffe9a8', .12], [220, 480, 320, '#9fe8ff', .1]], planets: [PLANET_PALS.gold, PLANET_PALS.sand, PLANET_PALS.glass] },
  phases: [{ until: 36, every: .78, pool: { kami: 3, shooter: 2, shield: 2, teleporter: 1 } }, { until: 76, every: .68, pool: { kami: 3, shield: 2, healer: 1, tank: 1, teleporter: 2, turret: 1 } }, { until: 110, every: .6, pool: { kami: 3, shield: 2, tank: 2, generator: 1, teleporter: 2, turret: 1, bit: 2 } }],
  events: [{ at: 22, name: 'flare' }, { at: 46, name: 'giant' }, { at: 70, name: 'flare' }, { at: 90, name: 'rain' }],
});
STAGES.push({
  id: 7, name: 'Oceano de Estrelas', desc: 'Ondas de luz líquida. Algo imenso se move lá embaixo.',
  music: 's8', bossMusic: 'b8', duration: 115, boss: 'leviathan', bossName: 'Leviatã Estelar', tint: '#33c4ff',
  pal: { top: '#07305a', bot: '#020a1c', star: '#d6f6ff', dust: '#7fd8ff', shaft: '90,200,255', rock0: '#2a6a9a', rock1: '#08203a', rim: 'rgba(130,220,255,.5)', rocks: 12,
    nebA: [[200, 200, 420, '#2a9ad8', .22], [1050, 300, 440, '#33e0c4', .16], [640, 600, 360, '#3a5aff', .18]], nebB: [[860, 140, 320, '#9fe8ff', .12], [240, 470, 340, '#2ad4a0', .1]], planets: [PLANET_PALS.sea, PLANET_PALS.teal, PLANET_PALS.ash] },
  phases: [{ until: 38, every: .76, pool: { ghost: 3, splitter: 2, bit: 3, shooter: 1 } }, { until: 80, every: .66, pool: { ghost: 2, splitter: 3, bit: 3, healer: 1, turret: 2, kami: 2 } }, { until: 115, every: .58, pool: { ghost: 2, splitter: 3, bit: 3, turret: 2, generator: 1, kami: 2, tank: 1 } }],
  events: [{ at: 24, name: 'rain' }, { at: 50, name: 'worm' }, { at: 74, name: 'storm' }, { at: 96, name: 'worm' }],
});
STAGES.push({
  id: 8, name: 'Espelho do Céu', desc: 'O céu inteiro refletido ao contrário. Aqui, cada luz tem uma sombra.',
  music: 's9', bossMusic: 'b9', duration: 120, boss: 'mirror', bossName: 'Reflexo do Vazio', tint: '#e8d0ff',
  pal: { top: '#2a1a5a', bot: '#050118', star: '#ffffff', dust: '#d8c0ff', shaft: '216,192,255', rock0: '#6a5a9a', rock1: '#10062a', rim: 'rgba(230,210,255,.55)', rocks: 10,
    nebA: [[200, 200, 420, '#c04aff', .22], [1050, 300, 440, '#ffffff', .1], [640, 600, 360, '#6a3aff', .2]], nebB: [[860, 140, 320, '#ffffff', .1], [240, 470, 340, '#c04aff', .12]], planets: [PLANET_PALS.glass, PLANET_PALS.void, PLANET_PALS.violet] },
  phases: [{ until: 40, every: .74, pool: { teleporter: 3, ghost: 2, shield: 2, kami: 2, turret: 1 } }, { until: 84, every: .64, pool: { teleporter: 3, ghost: 2, splitter: 2, generator: 1, turret: 2, tank: 1, kami: 2 } }, { until: 120, every: .56, pool: { teleporter: 3, ghost: 2, splitter: 2, generator: 2, turret: 2, tank: 2, kami: 3 } }],
  events: [{ at: 24, name: 'storm' }, { at: 48, name: 'mines' }, { at: 72, name: 'flare' }, { at: 96, name: 'storm' }],
});
CAPTAINS.push('Sentinela Radiante', 'Guarda das Marés', 'Sombra Espelhada');

// ---------- retratos ----------
CHARS.H = { name: 'ARAUTO', c: '#ffd36a', bg0: '#8a6a20', bg1: '#2a1a08' };
CHARS.Y = { name: 'LEVIATÃ', c: '#33c4ff', bg0: '#0a4a7a', bg1: '#021020' };
CHARS.R = { name: 'REFLEXO', c: '#e8d0ff', bg0: '#5a3a9a', bg1: '#0a0420' };
Portraits.face_H = function (mood, t, talk) {
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.3 + k * .1) * (k % 2 ? -1 : 1)); ctx.strokeStyle = `rgba(255,220,140,${.35 - k * .08})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, -6, 80 + k * 14, 26 + k * 8, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 130, '#ffd36a', .8); ctx.restore(); ctx.globalAlpha = 1;
  ctx.fillStyle = rdl(-20, -24, 6, 70, [[0, '#ffffff'], [.5, '#fff0b8'], [1, '#e8b840']]); ctx.beginPath(); ctx.arc(0, 0, 66, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#6a4a10'; ctx.lineWidth = 6; ctx.lineCap = 'round'; const ang = mood === 'angry' ? .35 : 0;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 40, -6 - s * s * 4); ctx.quadraticCurveTo(s * 26, 6 + Math.sin(t * 2) * 1.5, s * 12, -6 + ang * 14 * s); ctx.stroke(); }
  ctx.beginPath(); if (talk) ctx.ellipse(0, 34, 12, 5 + Math.abs(Math.sin(t * 14)) * 5, 0, 0, TAU); else ctx.arc(0, 28, 14, .2, Math.PI - .2); ctx.stroke();
};
Portraits.face_Y = function (mood, t, talk) {
  ctx.translate(0, Math.sin(t * 2) * 3); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 120, '#33c4ff', .6); ctx.restore(); ctx.globalAlpha = 1;
  ctx.fillStyle = rdl(-20, -30, 6, 100, [[0, '#7fe0ff'], [.5, '#1a7ac0'], [1, '#04203a']]); ctx.beginPath(); ctx.ellipse(0, 0, 94, 66, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.ellipse(10, -8, 40, 34 * (talk ? 1 : 1), 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#04203a'; ctx.beginPath(); ctx.ellipse(16 + Math.sin(t) * 5, -8, 15, 26, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(20, -18, 6, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#33e0c4'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-60 + i * 8, 20 + Math.sin(t * 3 + i) * 3, 3, 0, TAU); ctx.stroke(); }
};
Portraits.face_R = function (mood, t, talk) { // esfera de vidro rachada com um olho e dois foguetes refletidos
  const bob = Math.sin(t * 1.6) * 3; ctx.translate(0, bob);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 120, '#c8a0ff', .5); ctx.restore(); ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(-24, -30, 6, 0, 0, 78); g.addColorStop(0, '#ffffff'); g.addColorStop(.35, '#cdb8ff'); g.addColorStop(.8, '#6a3ad8'); g.addColorStop(1, '#2a1070');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 74, 0, TAU); ctx.fill(); ctx.strokeStyle = '#f2e8ff'; ctx.lineWidth = 4; ctx.stroke();
  // foguete refletido (um em pe, um de cabeca para baixo)
  for (const s of [1, -1]) { ctx.save(); ctx.translate(s * 2, s * 24); ctx.scale(1, s); ctx.globalAlpha = .45; ctx.fillStyle = '#2a1060'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(14, -6, 10, 20); ctx.lineTo(-10, 20); ctx.quadraticCurveTo(-14, -6, 0, -30); ctx.fill(); ctx.fillStyle = '#e8d8ff'; ctx.beginPath(); ctx.arc(0, -4, 5, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.globalAlpha = 1;
  // rachaduras
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; for (const pts of [[[-60, -38], [-30, -14], [-12, -34], [14, -10]], [[60, 30], [34, 14], [40, -10], [16, -22]], [[-46, 42], [-22, 24], [-10, 40]]]) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
  // olho
  const open = (talk ? 1 + Math.abs(Math.sin(t * 12)) * .15 : 1) * (mood === 'angry' ? .8 : 1), lx = Math.sin(t * .8) * 8;
  ctx.fillStyle = '#12062e'; ctx.beginPath(); ctx.ellipse(0, -2, 52, 22 * open, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e8d0ff'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#c04aff'; ctx.beginPath(); ctx.arc(lx, -2, 15, 0, TAU); ctx.fill(); ctx.fillStyle = '#12062e'; ctx.beginPath(); ctx.arc(lx, -2, 7, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx - 5, -8, 4, 0, TAU); ctx.fill();
  // brilho de vidro que corre
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 74, 0, TAU); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const sw = ((t * .35) % 1.6 - .3) * 220 - 110; ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(sw, -90); ctx.lineTo(sw + 22, -90); ctx.lineTo(sw - 34, 90); ctx.lineTo(sw - 56, 90); ctx.fill(); ctx.restore();
};

// ---------- chefes ----------
class Herald extends Boss {
  constructor() { super('Arauto Luminoso', 650); this.col = '#ffd36a'; this.dark = '#6a4a10'; this.rad = 110; this.spin = 0; this.chargeT = 0; this.chargeMax = 1; }
  hitTest(x, y, r) { return Math.hypot(x - this.x, y - this.y) < 100 + r; }
  move(dt) { this.chargeT = Math.max(0, this.chargeT - dt); const s = .42 + this.phase * .1; this.x = W / 2 + Math.sin(this.t * s) * 330; this.y = this.baseY + 20 + Math.sin(this.t * s * 1.9) * 22; }
  ai(dt) {
    const ph = this.phase;
    if (this.tick('lances', dt, ph === 0 ? 3.2 : ph === 1 ? 2.6 : 2.1)) { const px = G.player.x, n = 3 + ph; for (let i = 0; i < n; i++) Events.hazardRect(clamp(i === 0 ? px : rand(80, W - 80), 70, W - 70), H / 2, 76, H, .95 + i * .1, .3, '#ffe9a8', 'bolt'); }
    if (this.tick('fan', dt, ph === 0 ? 2.2 : 1.7)) { fanAimed(this.x, this.y + 20, 5 + ph * 2, .9 + ph * .2, 220); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); }
    if (ph >= 1 && this.tick('ring', dt, 2.5)) { ring(this.x, this.y, 18 + ph * 4, 170, this.t); shockwave(this.x, this.y, 200, '#ffe9a8'); Snd.play('enemyShoot'); }
    if (ph >= 1 && this.tick('laser', dt, ph === 1 ? 5 : 4)) { const a = aimAt(this.x, this.y); bossLaser(this, a, 1.1, .8, '#ffe9a8'); if (ph === 2) { bossLaser(this, a + .55, 1.1, .8, '#ffe9a8'); bossLaser(this, a - .55, 1.1, .8, '#ffe9a8'); } }
    if (ph === 2 && this.tick('spiral', dt, .16)) { this.spin += .4; for (let k = 0; k < 2; k++) ebullet(this.x, this.y, this.spin + k * Math.PI, 200, { r: 6 }); }
  }
  draw() {
    const t = this.t, ph = this.phase, hit = this.flash > 0, chg = this.chargeT > 0 ? 1 - this.chargeT / this.chargeMax : 0;
    ctx.save(); ctx.translate(this.x, this.y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 340, '#ffd36a', .3 + Math.sin(t * 3) * .05); ctx.globalCompositeOperation = 'source-over';
    for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.4 + k * .15) * (k % 2 ? -1 : 1)); ctx.strokeStyle = k % 2 ? '#fff0c0' : '#ffd36a'; ctx.lineWidth = 3 + k; ctx.globalAlpha = .8; ctx.setLineDash([26, 14]); ctx.beginPath(); ctx.ellipse(0, 0, 150 + k * 26, 52 + k * 16, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { ctx.save(); ctx.scale(s, 1); ctx.rotate(.3 + i * .22 + Math.sin(t * 2 + i * .4) * .06); const g = ctx.createLinearGradient(0, 0, 0, -190 + i * 8); g.addColorStop(0, hit ? '#fff' : '#fff6d8'); g.addColorStop(1, 'rgba(255,211,106,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(30, 0); ctx.quadraticCurveTo(46, -120 + i * 6, 12, -190 + i * 8); ctx.quadraticCurveTo(26, -90, 14, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
    const g = ctx.createRadialGradient(-20, -26, 6, 0, 0, 96); g.addColorStop(0, hit ? '#fff' : '#ffffff'); g.addColorStop(.5, '#fff0b8'); g.addColorStop(1, '#e8b840'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 90, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6a4a10'; ctx.lineWidth = 7; ctx.lineCap = 'round'; const open = ph >= 1 ? .3 : 0;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 50, -6); ctx.quadraticCurveTo(s * 32, 8 - open * 30, s * 14, -6); ctx.stroke(); if (open) { ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 32, -4, 24, '#ffffff', .8 * open * 3); ctx.globalCompositeOperation = 'source-over'; } }
    ctx.beginPath(); ctx.arc(0, 34, 18, .3, Math.PI - .3); ctx.stroke();
    if (chg > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 20, 40 + chg * 80, '#ffffff', chg * .7); }
    this.flashOverlay(92); ctx.restore();
  }
}
class Leviathan extends Boss {
  constructor() { super('Leviatã Estelar', 700); this.col = '#33c4ff'; this.dark = '#04203a'; this.rad = 90; this.dive = null; this.N = 18; }
  pathAt(t) { return [W / 2 + Math.sin(t * .5) * 440, 170 + Math.sin(t * 1.1) * 56 + Math.cos(t * .37) * 20]; }
  seg(i) { const [x, y] = this.pathAt(this.t - i * .16); return [x, y + (this.dive ? this.dive.off * Math.max(0, 1 - i * .08) : 0)]; }
  hitTest(x, y, r) { for (let i = 0; i < this.N; i += 1) { const [sx, sy] = this.seg(i), rr = (i === 0 ? 56 : 40 - i * .8); if (Math.hypot(x - sx, y - sy) < rr + r) return true; } return false; }
  move(dt) {
    const d = this.dive;
    if (d) { d.t += dt; if (d.k === 'warn') { if (d.t > .8) { d.k = 'go'; d.t = 0; } } else if (d.k === 'go') { d.off = lerp(0, d.depth, easeOut(Math.min(1, d.t / .4))); if (d.t > .7) { d.k = 'back'; d.t = 0; shockwave(this.x, this.y + d.off, 260, '#33c4ff'); shake(10); } const p = G.player; if (!p.dead && Math.hypot(p.x - this.x, p.y - (this.y + d.off)) < 70) hurtPlayer(1); } else { d.off = lerp(d.off, 0, Math.min(1, 4 * dt)); if (d.t > .9) this.dive = null; } }
    const [x, y] = this.pathAt(this.t); this.x = x; this.y = y;
  }
  ai(dt) {
    const ph = this.phase;
    if (this.dive) return;
    if (this.tick('spit', dt, ph === 0 ? 2 : 1.6)) { fanAimed(this.x, this.y + 20, 5 + ph, .8, 230); Snd.play('enemyShoot', { pan: Snd.panX(this.x) }); }
    if (this.tick('wave', dt, ph === 0 ? 1.1 : .8)) for (let k = 0; k < 4; k++) { const [sx, sy] = this.seg(2 + ((Math.random() * (this.N - 3)) | 0)); ebullet(sx, sy, Math.PI / 2, 210 + ph * 20, { r: 6 }); }
    if (ph >= 1 && this.tick('dive', dt, ph === 1 ? 8 : 6)) { const dp = clamp(G.player.y - this.y, 200, 480); this.dive = { k: 'warn', t: 0, off: 0, depth: dp }; Events.hazardRect(this.x, (this.y + dp) / 2 + 20, 110, dp + 120, .8, .5, '#33c4ff', 'bolt'); }
    if (ph === 2 && this.tick('ring', dt, 2.8)) { for (let i = 0; i < 6; i++) { const [sx, sy] = this.seg(i * 3); ring(sx, sy, 8, 150, this.t + i); } }
  }
  draw() {
    const t = this.t, hit = this.flash > 0; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = this.N - 1; i >= 0; i--) { const [x, y] = this.seg(i), r = i === 0 ? 56 : 42 - i * 1.1; drawGlow(x, y, r * 2.2, '#33c4ff', .22); }
    ctx.globalCompositeOperation = 'source-over';
    for (let i = this.N - 1; i >= 1; i--) {
      const [x, y] = this.seg(i), [px, py] = this.seg(i - 1), r = 42 - i * 1.1, a = Math.atan2(py - y, px - x);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = lin(0, -r, 0, r, [[0, hit ? '#fff' : '#3ab0e8'], [1, '#04203a']]); ctx.strokeStyle = '#7fe8ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.15, r, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7fe8ff'; ctx.beginPath(); ctx.moveTo(-4, -r); ctx.lineTo(-r * .9, -r * 1.7); ctx.lineTo(r * .3, -r); ctx.fill(); ctx.beginPath(); ctx.moveTo(-4, r); ctx.lineTo(-r * .9, r * 1.7); ctx.lineTo(r * .3, r); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#9fffe8'; for (let k = 0; k < 3; k++) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 3 + i + k); ctx.beginPath(); ctx.arc(-r * .3 + k * r * .3, r * .1, 3, 0, TAU); ctx.fill(); } ctx.restore();
    }
    const [hx, hy] = this.seg(0), [qx, qy] = this.seg(1), ha = Math.atan2(hy - qy, hx - qx) || 0;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(ha); ctx.fillStyle = hit ? '#fff' : '#2a8ac8'; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(8, 0, 66, 50, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#04203a'; ctx.beginPath(); ctx.moveTo(30, -8); ctx.lineTo(72, -20); ctx.lineTo(72, 20); ctx.lineTo(30, 8); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#e8fbff'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(40 + k * 8, -9); ctx.lineTo(44 + k * 8, 0); ctx.lineTo(48 + k * 8, -9); ctx.fill(); }
    ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(-6, -22, 17, 0, TAU); ctx.fill(); ctx.fillStyle = '#04203a'; ctx.beginPath(); ctx.ellipse(-4 + Math.sin(t) * 2, -22, 7, 12, 0, 0, TAU); ctx.fill(); ctx.restore();
    this.flashOverlay(0.01); ctx.restore();
  }
}
class Mirror extends Boss {
  constructor() { super('Reflexo do Vazio', 760); this.col = '#e8d0ff'; this.dark = '#10062a'; this.rad = 120; this.real = 0; this.swapT = 6; this._hit = null; this.chargeT = 0; this.chargeMax = 1; }
  pos(s) { const d = 190 + 110 * Math.sin(this.t * .55); return [W / 2 + (s ? 1 : -1) * d, this.baseY + 24 + Math.sin(this.t * .9 + s) * 20]; }
  hitTest(x, y, r) { for (const s of [0, 1]) { const [bx, by] = this.pos(s); if (Math.hypot(x - bx, y - by) < 96 + r) { this._hit = s === this.real ? 'real' : 'decoy'; return true; } } return false; }
  damage(n, c) { if (this._hit === 'decoy') { n *= .25; this._sf = World.t; } super.damage(n, c); }
  move(dt) { this.chargeT = Math.max(0, this.chargeT - dt); this.swapT -= dt; if (this.swapT <= 0 && this.state === 'fight') { this.swapT = 6.5 - this.phase; this.real = 1 - this.real; shockwave(...this.pos(this.real), 240, '#ffffff'); popup(W / 2, 230, 'O REFLEXO TROCOU!', '#e8d0ff', 26); Snd.play('shield'); } this.x = W / 2; this.y = this.baseY + 20; }
  ai(dt) {
    const ph = this.phase;
    for (const s of [0, 1]) {
      const [bx, by] = this.pos(s), k = 'f' + s;
      if (this.tick(k, dt, ph === 0 ? 2.1 : 1.7)) { fanAimed(bx, by + 20, 4 + ph * 2, .8, 225); }
    }
    if (this.tick('cross', dt, ph === 0 ? 4.6 : 3.6)) { for (const s of [0, 1]) { const [bx, by] = this.pos(s); bossLaser({ x: bx, y: by, chargeT: 0, chargeMax: 1 }, Math.PI / 2 + (s ? -1 : 1) * (.35 + ph * .12), 1.1, .7, '#e8d0ff'); } }
    if (ph >= 1 && this.tick('mirror', dt, 2.6)) { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + this.t; const [bx, by] = this.pos(0), [cx, cy] = this.pos(1); ebullet(bx, by, a, 170, { r: 6 }); ebullet(cx, cy, Math.PI - a, 170, { r: 6 }); } }
    if (ph === 2 && this.tick('drop', dt, 1.1)) { const x = rand(80, W - 80); Events.hazardRect(x, H / 2, 70, H, .9, .3, '#e8d0ff', 'bolt'); Events.hazardRect(W - x, H / 2, 70, H, .9, .3, '#e8d0ff', 'bolt'); }
  }
  draw() {
    const t = this.t, hit = this.flash > 0;
    for (const s of [0, 1]) {
      const [bx, by] = this.pos(s), real = s === this.real; ctx.save(); ctx.translate(bx, by); const flip = s ? -1 : 1; ctx.scale(flip, 1);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, real ? 280 : 200, real ? '#ffffff' : '#7a3aff', real ? .45 : .22); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = real ? 1 : .6;
      ctx.lineCap = 'round'; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + t * .15, pts = []; for (let k = 0; k <= 9; k++) { const ang = a + Math.sin(t * 1.2 + i + k * .4) * .26 * (k / 9) + k * .04, r = 82 + k * 17; pts.push([Math.cos(ang) * r, Math.sin(ang) * r * .9]); } for (let k = 0; k < 9; k++) { ctx.strokeStyle = real ? 'rgba(255,255,255,.85)' : 'rgba(154,99,255,.7)'; ctx.lineWidth = 14 - k * 1.2; ctx.beginPath(); ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); ctx.stroke(); } }
      ctx.fillStyle = hit && real ? '#fff' : real ? '#f4eaff' : '#1a0a40'; ctx.beginPath(); ctx.arc(0, 0, 90, 0, TAU); ctx.fill(); ctx.strokeStyle = real ? '#c04aff' : '#e8d0ff'; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = real ? '#2a0a5a' : '#f2e8ff'; ctx.beginPath(); ctx.ellipse(0, -2, 52, 22 + Math.sin(t * 1.3) * 3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = real ? '#c04aff' : '#7a3aff'; ctx.beginPath(); ctx.arc(Math.sin(t) * 14, -2, 12, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }
}
BOSS_CLASSES.herald = Herald; BOSS_CLASSES.leviathan = Leviathan; BOSS_CLASSES.mirror = Mirror;

// ---------- tabelas dos outros sistemas ----------
Object.assign(FURY, {
  'Arauto Luminoso': [[['H', 'A luz não pode ter sombras. Eu vou apagar cada uma delas!'], ['O', 'Sem sombra não existe luz, Arauto!']], [['H', 'PERFEIÇÃO! Tudo será branco, limpo e silencioso!'], ['O', 'Isso não é luz... é vazio de novo!']]],
  'Leviatã Estelar': [[['Y', 'Eu engulo cada brilho para que ninguém o roube de mim.'], ['O', 'Ninguém quer roubar. Estamos aqui para acender!']], [['Y', 'MAIS LUZ! SEMPRE MAIS! A FOME NUNCA ACABA!'], ['B', 'Olienzinho, ele só está com fome de verdade!']]],
  'Reflexo do Vazio': [[['R', 'Eu sou o que você seria se tivesse desistido.'], ['O', 'Mas eu não desisti. E você pode escolher também!']], [['R', 'Dois lados, uma só escuridão. Qual de nós é real?'], ['B', 'O que tem o coração acelerado, Olienzinho!']]],
  'Nave-Mãe Dourada': [[['C', 'Meus filhos brilham agora. E ninguém vai apagá-los!'], ['O', 'Eu sei que sim, Colmeia!']], [['C', 'DOURADOS, ACORDEM! O ENXAME ETERNO!'], ['O', 'Eu respeito a sua força!']]],
  'Gigante Cristalino': [[['P', 'Virei cristal. Agora nenhum golpe me parte!'], ['O', 'Tudo parte, se for no ponto certo!']], [['P', 'Cristal, vidro, pedra... EU CONTINUO EM PÉ!'], ['O', 'Eu sei. Essa é a sua luz!']]],
  'Olho Eclipsado': [[['E', 'Eu enxergo o escuro dentro do escuro.'], ['O', 'Então enxergue a gente chegando!']], [['E', 'ECLIPSE TOTAL! Nenhuma luz sobrevive!'], ['O', 'A minha sobrevive!']]],
});
Object.assign(EPITHET, { 'Arauto Luminoso': 'A Luz Sem Sombra', 'Leviatã Estelar': 'A Fome do Oceano', 'Reflexo do Vazio': 'O Lado Contrário', 'Nave-Mãe Dourada': 'A Colmeia Eterna', 'Gigante Cristalino': 'A Montanha de Vidro', 'Olho Eclipsado': 'O Vigia do Escuro' });
BEST.push(
  ['boss:Arauto Luminoso', 'Arauto Luminoso', 'A luz perfeita que quer apagar todas as sombras. Chefe do Setor 7.', 'Quebre a perfeição: mire no ponto fraco.'],
  ['boss:Leviatã Estelar', 'Leviatã Estelar', 'Serpente do oceano de luz. Chefe do Setor 8.', 'Acerte a cabeça e fuja do mergulho.'],
  ['boss:Reflexo do Vazio', 'Reflexo do Vazio', 'Dois corpos, um só chefe. Chefe do Setor 9.', 'Só o corpo brilhante sofre dano de verdade.'],
);

// ---------- historia da Parte 3 ----------
STORY.stages.push(
  {
    intro: [
      { music: 'mystery' }, { title: 'ATO III', sub: 'O OUTRO LADO' }, { title: 'SETOR 7', sub: 'CIDADE DE LUZ FLUTUANTE' },
      { who: 'N', text: 'Com o Orbi brilhando em cada estrela, o céu estava em paz. Até que, numa noite limpa, uma porta de luz se abriu no horizonte.' },
      { who: 'B', mood: 'happy', text: 'Olienzinho! Eu... eu posso falar de novo! A nova luz me deixou voltar por um instante!' },
      { who: 'O', mood: 'happy', text: 'Orbi! Eu sabia que você estava aí!' },
      { who: 'B', mood: 'worry', text: 'Mas essa porta não é natural. Do outro lado existe um céu que nunca foi aceso... e alguém que não gosta de sombras.' },
      { who: 'O', mood: 'determined', text: 'Então vamos conhecer esse alguém.' },
      { mission: { n: 7, title: 'Atravessar a Porta', goal: 'Cruze a Cidade de Luz e enfrente o Arauto Luminoso.', boss: 'Arauto Luminoso' } },
    ],
    pre: [
      { music: 'tension' }, { who: 'H', scene: 'boss', text: 'Bem-vindo, pequeno. Esta é a cidade onde a luz é perfeita, sem falhas, sem sombras, sem dor.' },
      { who: 'O', scene: 'boss', mood: 'determined', text: 'Sem sombras também não existem estrelas, Arauto. Elas precisam do escuro para brilhar.' },
      { who: 'H', scene: 'boss', mood: 'angry', text: 'ESCURO É FRAQUEZA! Eu vou purificar o seu céu inteiro!' },
    ],
    victory: 'Uma luz que não deixa espaço para ninguém não é luz. É solidão!',
    after: [
      { music: 'sad' }, { who: 'H', scene: 'freed', mood: 'sad', text: 'Eu só queria que ninguém sofresse mais... Por isso apaguei tudo que doía.' },
      { music: 'hope' }, { who: 'O', scene: 'lit', mood: 'happy', text: 'Sofrer faz parte. Mas dividir a luz faz doer menos.' },
      { who: 'H', scene: 'freedKeep', mood: 'free', text: '...Entendi. Leve o que sobrou de mim. Abrirá o caminho para o oceano.' },
    ],
  },
  {
    intro: [
      { music: 'hope' }, { title: 'SETOR 8', sub: 'OCEANO DE ESTRELAS' },
      { who: 'N', text: 'A cidade ficou para trás, e diante da nave se estendia um mar de luz líquida, onde cada onda era feita de estrelas.' },
      { who: 'B', text: 'Olienzinho, sinto algo imenso nadando sob a superfície. Ele devora luz, mas... não parece mau.' },
      { who: 'O', mood: 'worry', text: 'Então o que ele é?' },
      { who: 'B', mood: 'worry', text: 'Alguém que nunca teve o suficiente.' },
      { mission: { n: 8, title: 'Cruzar o Oceano', goal: 'Sobreviva às marés e enfrente o Leviatã Estelar.', boss: 'Leviatã Estelar' } },
    ],
    pre: [
      { music: 'tension' }, { who: 'Y', scene: 'boss', text: 'Mais luz... eu sinto a sua luz, pequeno. Ela é quente. Deixe-me guardá-la comigo.' },
      { who: 'O', scene: 'boss', mood: 'determined', text: 'Eu empresto um pouco. Mas não posso deixar você devorar todas as outras.' },
      { who: 'Y', scene: 'boss', mood: 'angry', text: 'A FOME... NÃO... PASSA!' },
    ],
    victory: 'Você não precisa devorar a luz! Ela cresce quando é dividida!',
    after: [
      { music: 'sad' }, { who: 'Y', scene: 'freed', mood: 'sad', text: 'Eu vivi tanto tempo no escuro do fundo... Tinha tanto medo de ficar sem brilho.' },
      { music: 'hope' }, { who: 'B', mood: 'happy', text: 'Eu também tinha medo, amigo. E aí eu virei estrela. Agora eu brilho para você também.' },
      { who: 'Y', scene: 'freedKeep', mood: 'free', text: '...Obrigado. Sigam em frente. O espelho está logo ali, e ele é o mais difícil de todos.' },
    ],
  },
  {
    intro: [
      { music: 'mystery' }, { title: 'SETOR 9', sub: 'ESPELHO DO CÉU' },
      { who: 'N', text: 'No fim do oceano, o céu se dobrava sobre si mesmo: cada estrela tinha uma gêmea escura, cada nave uma sombra do outro lado.' },
      { who: 'O', mood: 'shock', text: 'É o meu céu... só que ao contrário.' },
      { who: 'B', mood: 'worry', text: 'É o reflexo do que existiria se o Vazio tivesse vencido. E ele já nos viu chegando.' },
      { mission: { n: 9, title: 'Atravessar o Espelho', goal: 'Encontre qual dos dois reflexos é real e derrote o Reflexo do Vazio.', boss: 'Reflexo do Vazio' } },
    ],
    pre: [
      { music: 'tension' }, { who: 'R', scene: 'bMirror', text: 'Dois de mim. Dois de você. Escolha qual lado é o verdadeiro, pequeno foguete.' },
      { who: 'O', scene: 'bMirror', mood: 'determined', text: 'O verdadeiro é aquele que continua brilhando mesmo quando tem medo.' },
      { who: 'R', scene: 'bMirror', mood: 'angry', text: 'ENTÃO BRILHE... SE PUDER!' },
    ],
    victory: 'Meu céu não é perfeito. Mas é meu, e eu cuido dele!',
    after: [
      { music: 'sad' }, { who: 'R', scene: 'voidBreak', mood: 'sad', text: 'Então... as duas faces podiam ser a mesma. Nunca tinha pensado assim.' },
      { music: 'hope' }, { who: 'O', scene: 'lit', mood: 'happy', text: 'Luz e sombra: cada uma só faz sentido com a outra.' },
      { who: 'R', scene: 'freedKeep', mood: 'free', text: 'Leve a minha luz, Olienzinho. E lembre-se: eu estarei no outro lado, sempre te guardando.' },
    ],
  },
);
STORY.defeat.boss.push(
  ['A luz perfeita não admite erros. Você é um erro, pequeno.', 'Volte quando for brilhante o bastante.'],
  ['Mais uma luz para a minha fome.', 'Afunde... e brilhe dentro de mim.'],
  ['Qual de nós é o real? Você acabou de perder a aposta.', 'Do outro lado, você caiu. Que pena.'],
);
STORY.finale3 = [
  { music: 'triumph' },
  { who: 'N', scene: 'lit', text: 'O Arauto, o Leviatã e o Reflexo, cada um com o seu jeito de ter medo, agora faziam parte do céu.' },
  { who: 'B', mood: 'happy', text: 'Olienzinho, olhe! A porta se fechou, mas deixou uma trilha de estrelas novas.' },
  { who: 'O', mood: 'happy', text: 'Orbi, você voltou de verdade?' },
  { who: 'B', mood: 'happy', text: 'Voltei para ficar. Agora eu moro em todas as estrelas e também no seu lado.' },
  { music: 'hope' },
  { who: 'L', scene: 'lumi', mood: 'happy', text: 'Meu pequeno broto... você cuidou do céu inteiro. Agora o céu cuida de você.' },
  { who: 'N', fx: 'dawn', text: 'E assim, o menor foguete da galáxia aprendeu que a maior luz do universo é a que se divide.' },
  { title: 'FIM DA PARTE 3', sub: 'O OUTRO LADO' },
];
{
  const ACH_NEW = [
    { id: 'part3', name: 'Do Outro Lado', desc: 'Zere a Parte 3.', ok: () => !!Save.data.won3 },
  ]; ACH.push(...ACH_NEW);
}

// ---------- fundos e cenas dos novos setores ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); const st = G.stage ? G.stage.id : 0; if (st < 6 || QL() < 1) return;
    const t = World.t; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (st === 6) {
      for (let i = 0; i < 7; i++) { const x = (hsh(i + 400) * W + t * (4 + i)) % (W + 120) - 60, h = 260 + hsh(i + 410) * 260, g = ctx.createLinearGradient(0, H, 0, H - h); g.addColorStop(0, 'rgba(255,220,140,.16)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - 14, H - h, 28, h); drawGlow(x, H - h, 40, '#ffe9a8', .25); }
      for (let i = 0; i < 24; i++) { const x = hsh(i) * W + Math.sin(t * .4 + i) * 20, y = H - ((t * (10 + hsh(i + 3) * 24) + hsh(i + 7) * H) % H); ctx.globalAlpha = .25 + .3 * hsh(i + 9); ctx.fillStyle = '#fff0c0'; ctx.beginPath(); ctx.arc(x, y, 1.5 + hsh(i + 5) * 2, 0, TAU); ctx.fill(); }
    } else if (st === 7) {
      ctx.lineWidth = 3; for (let k = 0; k < 5; k++) { ctx.beginPath(); for (let x = 0; x <= W; x += 24) { const y = H * (.2 + k * .18) + Math.sin(x * .012 + t * (.8 + k * .2) + k) * 26; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = k % 2 ? '#33e0c4' : '#33c4ff'; ctx.globalAlpha = .14; ctx.stroke(); }
      for (let i = 0; i < 26; i++) { const x = hsh(i + 50) * W + Math.sin(t + i) * 14, y = H - ((t * (30 + hsh(i + 60) * 40) + hsh(i + 70) * H) % H); ctx.globalAlpha = .3; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 3 + hsh(i + 80) * 6, 0, TAU); ctx.stroke(); }
    } else {
      for (let i = 0; i < 40; i++) { const x = hsh(i + 90) * W, y = hsh(i + 91) * H * .5, a = .25 + .35 * Math.sin(t * 2 + i); ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#c04aff'; ctx.beginPath(); ctx.arc(x, H - y, 1.6, 0, TAU); ctx.fill(); }
      const sh = (Math.sin(t * .6) * .5 + .5); ctx.globalAlpha = .1 + sh * .1; ctx.fillStyle = '#e8d0ff'; ctx.fillRect(0, H / 2 - 1, W, 2); ctx.globalAlpha = .05; for (let i = 0; i < 5; i++) ctx.fillRect(((t * 60 + i * 260) % (W + 200)) - 100, 0, 3, H);
    }
    ctx.restore();
  };
}
for (let i = 6; i < 9; i++) SCENES.push(['Setor ' + (i + 1) + ': chegada', 'intro' + i, () => STORY.stages[i].intro], ['Setor ' + (i + 1) + ': o chefe', 'pre' + i, () => STORY.stages[i].pre], ['Setor ' + (i + 1) + ': depois', 'after' + i, () => STORY.stages[i].after]);
SCENES.push(['Fim da Parte 3', 'finale3', () => STORY.finale3]);
