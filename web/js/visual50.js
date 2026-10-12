'use strict';
// ---------- 50: Eco corrompido, Orbi e guardioes com a arte nova, poses e alertas nos inimigos, explosoes em quadros com "smear",
// fundos com vida propria, clima por setor e cor do chefe na cena ----------
const Visual50 = { bursts: [] };
const h50 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';
const g50 = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
const rg50 = (x, y, r0, r1, st) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
const ol50 = (w = 3, a = .8) => { ctx.strokeStyle = 'rgba(14,4,28,' + a + ')'; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
const hh50 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ================= ECO DO OLIENZINHO: reflexo corrompido, fatiado em pixels que se desfazem =================
EchoBoss.prototype.drawShip = function () {
  const t = this.t, hit = this.flash > 0, chg = this.chargeT > 0 ? 1 - this.chargeT / this.chargeMax : 0, p = G.player;
  ctx.save(); ctx.translate(this.x, this.y);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 270, '#c040ff', .3 + Math.sin(t * 5) * .06); drawGlow(0, 20, 150, '#ff4ad0', .18 + chg * .3); ctx.restore(); ctx.globalAlpha = 1;
  const pal = { g0: hit ? '#fff' : '#8a62b8', g1: '#2a1550', g2: '#0a0420', fin: '#3a1a6a', nozzle: '#150a30', stripe: '#ff4ad0', glow: '#c040ff' };
  // fantasmas cromaticos (vermelho e ciano)
  for (const [c, ox] of [['#ff2a6a', -1], ['#2ad4ff', 1]]) { const off = Math.sin(t * 17 + ox) * 4 + (Math.random() < .08 ? ox * 12 : 0); ctx.save(); ctx.globalAlpha = .22; ctx.translate(ox * 6 + off, 0); ctx.rotate(Math.PI); Art.ship(0, 0, { pal: { ...pal, g0: c, g1: c, g2: '#200' }, vx: 0, t, lookx: 0, looky: 1, blinkT: 0, scale: 1.5, noWings: true }); ctx.restore(); }
  // corpo fatiado: faixas horizontais deslocadas (glitch de ordenacao de pixels)
  const N = 10, top = -120, hgt = 240, sh = hgt / N, tk = Math.floor(t * 9);
  for (let k = 0; k < N; k++) {
    const jump = hh50(k * 7 + tk) > .86 ? (hh50(k + tk * 3) - .5) * 60 : Math.sin(t * 2 + k * .7) * 2.2;
    ctx.save(); ctx.beginPath(); ctx.rect(-150, top + k * sh, 300, sh + .5); ctx.clip(); ctx.translate(jump, 0); ctx.rotate(Math.PI); Art.ship(0, 0, { pal, vx: Math.sin(t * 1.2) * 60, t, lookx: 0, looky: 1, blinkT: (t % 3.5) < .15 ? .15 : 0, scale: 1.5, boost: .8, noWings: true }); ctx.restore();
  }
  // olho corrompido: X luminoso e pupila tremendo
  const ey = 38, dx = p ? clamp((p.x - this.x) / 400, -1, 1) * 5 : 0;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff4ad0'; ctx.lineWidth = 3; ctx.lineCap = 'round'; const jt = Math.random() < .2 ? rand(-3, 3) : 0; ctx.beginPath(); ctx.moveTo(-17 + jt, ey - 17); ctx.lineTo(17 + jt, ey + 17); ctx.moveTo(17 - jt, ey - 17); ctx.lineTo(-17 - jt, ey + 17); ctx.stroke(); drawGlow(dx, ey, 26, '#ff4ad0', .55); ctx.restore();
  // rachaduras de luz
  ctx.strokeStyle = 'rgba(255,74,208,.8)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) { const a = i * 1.3 + 1; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * 34 + Math.sin(t * 2 + i) * 3, Math.sin(a) * 60); ctx.stroke(); }
  // pixels que se soltam do casco e sobem (dissolucao)
  for (let i = 0; i < 22; i++) { const life = (t * .55 + hh50(i)) % 1, a = hh50(i + 40) * TAU, R = 40 + hh50(i + 80) * 50, x = Math.cos(a) * R * .75 + Math.sin(t + i) * 6, y = Math.sin(a) * R - life * 80, sz = 3 + hh50(i + 12) * 7; ctx.globalAlpha = (1 - life) * .85; ctx.fillStyle = i % 3 ? '#ff4ad0' : i % 3 === 1 ? '#2ad4ff' : '#c040ff'; ctx.fillRect(Math.round(x / 4) * 4, Math.round(y / 4) * 4, sz, sz); }
  ctx.globalAlpha = 1;
  // linhas de varredura e falhas largas
  ctx.save(); ctx.beginPath(); ctx.rect(-120, -130, 240, 260); ctx.clip(); ctx.fillStyle = 'rgba(10,0,30,.22)'; for (let y = -130; y < 130; y += 6) ctx.fillRect(-120, y + (tk % 3), 240, 2); ctx.restore();
  if (Math.random() < .28) { ctx.fillStyle = 'rgba(255,74,208,.6)'; ctx.fillRect(rand(-70, 70), rand(-80, 80), rand(30, 80), 4); }
  if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 70, 30 + chg * 60, '#ff4ad0', chg * .6); ctx.restore(); }
  this.flashOverlay(80, 100); ctx.restore();
};

// ================= ORBI: esfera de vidro com circuitos, olho expressivo, aneis com luzes e antena =================
Art.orbi = function (x, y, o) {
  const U = 112 * (o.scale || 1), r = U * .36, t = o.t || 0, mood = o.mood;
  ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * .18); ctx.scale(o.sx || 1, o.sy || 1);
  if (o.inv > 0 && Math.floor(o.inv * 14) % 2 === 0) ctx.globalAlpha = .4;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 3.4, '#4cc8ff', .38);
  const fl = r * (.95 + Math.random() * .5), fg = ctx.createLinearGradient(0, r * .6, 0, r * .6 + fl); fg.addColorStop(0, '#ffffff'); fg.addColorStop(.4, '#7fe0ff'); fg.addColorStop(1, 'rgba(60,120,255,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-r * .34, r * .62); ctx.lineTo(0, r * .62 + fl); ctx.lineTo(r * .34, r * .62); ctx.fill(); ctx.restore();
  const ring = front => { ctx.save(); ctx.rotate(-.35 + Math.sin(t * .8) * .06); const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : TAU; ctx.strokeStyle = 'rgba(8,30,60,.8)'; ctx.lineWidth = r * .2; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.45, r * .42, 0, a0, a1); ctx.stroke(); ctx.strokeStyle = g50(-r * 1.4, 0, r * 1.4, 0, [[0, '#ffffff'], [.5, '#9fe8ff'], [1, '#3a8ad8']]); ctx.lineWidth = r * .13; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.45, r * .42, 0, a0, a1); ctx.stroke(); for (let i = 0; i < 6; i++) { const a = a0 + (i + .5) / 6 * (a1 - a0) + t * 0; ctx.fillStyle = Math.floor(t * 3 + i) % 3 === 0 ? '#ffffff' : '#2a78c8'; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.45, Math.sin(a) * r * .42, r * .045, 0, TAU); ctx.fill(); } ctx.restore(); };
  ring(false);
  // antena com bolinha
  ctx.strokeStyle = '#cfeeff'; ctx.lineWidth = r * .07; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -r * .95); ctx.lineTo(Math.sin(t * 2) * r * .06, -r * 1.35); ctx.stroke(); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(Math.sin(t * 2) * r * .06, -r * 1.4, r * .09, 0, TAU); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -r * 1.4, r * .4, '#ffe9a8', .8); ctx.restore();
  // esfera de vidro
  ctx.fillStyle = rg50(-r * .35, -r * .45, r * .08, r * 1.05, [[0, '#ffffff'], [.4, '#8fe4ff'], [1, '#1b6aa8']]); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ol50(r * .09, .75);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r * .97, 0, TAU); ctx.clip(); ctx.strokeStyle = 'rgba(20,70,130,.35)'; ctx.lineWidth = r * .03; ctx.beginPath(); ctx.moveTo(-r, r * .4); ctx.lineTo(-r * .4, r * .4); ctx.lineTo(-r * .2, r * .62); ctx.lineTo(r * .5, r * .62); ctx.moveTo(r, r * .2); ctx.lineTo(r * .55, r * .2); ctx.lineTo(r * .4, r * .38); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .55, r * .36, r * .15, -.6, 0, TAU); ctx.fill(); ctx.restore();
  // olho com palpebras e brilho
  const lx = (o.lookx || 0) * r * .12, ly = (o.looky || 0) * r * .08; let eh = o.blinkT > 0 ? .15 : 1; if (mood === 'hurt') eh = .55;
  ctx.fillStyle = '#0a2448'; ctx.beginPath(); ctx.ellipse(lx, -r * .08 + ly, r * .64, r * .38 * eh, 0, 0, TAU); ctx.fill(); ol50(r * .05, .8);
  if (mood === 'happy') { ctx.strokeStyle = '#bff0ff'; ctx.lineWidth = r * .1; ctx.beginPath(); ctx.arc(lx, -r * .02 + ly, r * .3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  else { ctx.fillStyle = rg50(lx, -r * .08 + ly, 1, r * .26, [[0, '#ffffff'], [.5, '#8fe8ff'], [1, '#3a9ad8']]); ctx.beginPath(); ctx.ellipse(lx, -r * .08 + ly, r * .27, r * .27 * eh, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx + r * .1, -r * .17 + ly, r * .08, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,150,190,.5)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * .55, r * .22, r * .12, r * .07, 0, 0, TAU); ctx.fill(); }
  ring(true);
  if (o.shield) { ctx.globalAlpha = .55 + .2 * Math.sin(t * 6); ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 1.9, 0, TAU); ctx.stroke(); }
  ctx.restore();
};

// ================= GUARDIOES: Colmeia, Petreo, Vigia e Solaris com contorno, olhos reais e brilho =================
Art.guardian = function (x, y, o) {
  const U = 112 * (o.scale || 1), r = U * .36, t = o.t || 0, g = o.guard.slice(2), c = GUARDS[g].c;
  ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * .18); ctx.scale(o.sx || 1, o.sy || 1); if (o.inv > 0 && Math.floor(o.inv * 14) % 2 === 0) ctx.globalAlpha = .4;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 3, c, .35);
  const fl = r * (.85 + Math.random() * .5), fg = ctx.createLinearGradient(0, r * .7, 0, r * .7 + fl); fg.addColorStop(0, '#fff3c8'); fg.addColorStop(.5, c); fg.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-r * .3, r * .7); ctx.lineTo(0, r * .7 + fl); ctx.lineTo(r * .3, r * .7); ctx.fill(); ctx.restore();
  const eye = (ex, ey, er, col) => { const lx = (o.lookx || 0) * er * .3, ly = (o.looky || 0) * er * .25, h = o.blinkT > 0 ? .15 : 1; ctx.fillStyle = '#fdfbff'; ctx.beginPath(); ctx.ellipse(ex, ey, er, er * 1.1 * h, 0, 0, TAU); ctx.fill(); ol50(Math.max(1.5, er * .14), .7); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(ex + lx, ey + ly, er * .62, er * .62 * h, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#10062a'; ctx.beginPath(); ctx.ellipse(ex + lx * 1.3, ey + ly * 1.3, er * .3, er * .3 * h, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + lx - er * .22, ey + ly - er * .26, er * .15, 0, TAU); ctx.fill(); };
  if (g === 'C') {
    for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (.7 + Math.sin(t * 40) * .25)); ctx.fillStyle = 'rgba(235,248,255,.6)'; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(s * r * .95, -r * .3, r * .75, r * .3, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.fillStyle = g50(-r, 0, r, 0, [[0, '#ffe9a0'], [.5, '#ffb340'], [1, '#c87a10']]); ctx.beginPath(); ctx.ellipse(0, 0, r * .9, r * 1.05, 0, 0, TAU); ctx.fill(); ol50(r * .09);
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, r * .9, r * 1.05, 0, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(58,32,8,.8)'; for (const yy of [.15, .5, .82]) ctx.fillRect(-r, r * yy, r * 2, r * .16); ctx.restore();
    ctx.strokeStyle = '#3a2008'; ctx.lineWidth = r * .06; ctx.beginPath(); ctx.moveTo(-r * .3, -r * .95); ctx.quadraticCurveTo(-r * .6, -r * 1.35, -r * .8, -r * 1.2); ctx.moveTo(r * .3, -r * .95); ctx.quadraticCurveTo(r * .6, -r * 1.35, r * .8, -r * 1.2); ctx.stroke(); eye(0, -r * .35, r * .36, '#7a3a08');
  } else if (g === 'P') {
    ctx.fillStyle = g50(-r, -r, r, r, [[0, '#e8d0e0'], [.5, '#a888a6'], [1, '#4a2a48']]); ctx.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, q = r * (1 + ((k * 5) % 3) * .08); ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q * 1.05); } ctx.closePath(); ctx.fill(); ol50(r * .1);
    ctx.strokeStyle = 'rgba(40,16,40,.45)'; ctx.lineWidth = r * .04; ctx.beginPath(); ctx.moveTo(-r * .6, -r * .5); ctx.lineTo(-r * .2, -r * .1); ctx.lineTo(-r * .4, r * .5); ctx.moveTo(r * .5, -r * .6); ctx.lineTo(r * .2, -r * .1); ctx.stroke();
    ctx.fillStyle = '#3a2038'; ctx.beginPath(); ctx.roundRect(-r * .7, -r * .42, r * 1.4, r * .26, 4); ctx.fill(); eye(-r * .32, -r * .12, r * .26, '#c06020'); eye(r * .32, -r * .12, r * .26, '#c06020'); ctx.strokeStyle = '#2a1830'; ctx.lineWidth = r * .07; ctx.beginPath(); ctx.moveTo(-r * .25, r * .42); ctx.lineTo(r * .25, r * .42); ctx.stroke();
  } else if (g === 'E') {
    ctx.fillStyle = g50(0, -r, 0, r, [[0, '#ffffff'], [1, '#ffc4e6']]); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ol50(r * .09); ctx.strokeStyle = '#a8369a'; ctx.lineWidth = r * .05; ctx.stroke();
    eye(0, 0, r * .66, '#ff3d9a'); ctx.strokeStyle = 'rgba(255,122,200,.85)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1); ctx.lineTo(Math.cos(a) * r * (1.38 + Math.sin(t * 5 + k) * .06), Math.sin(a) * r * (1.38 + Math.sin(t * 5 + k) * .06)); ctx.stroke(); }
  } else {
    ctx.save(); ctx.rotate(t * .8); ctx.fillStyle = '#ffb340'; for (let k = 0; k < 10; k++) { ctx.rotate(TAU / 10); ctx.beginPath(); ctx.moveTo(r * .8, -r * .2); ctx.lineTo(r * 1.45 + Math.sin(t * 6 + k) * r * .12, 0); ctx.lineTo(r * .8, r * .2); ctx.fill(); ol50(r * .04, .6); } ctx.restore();
    ctx.fillStyle = rg50(-r * .3, -r * .35, 2, r * 1.05, [[0, '#fff6d0'], [.45, '#ffc040'], [1, '#e8620f']]); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ol50(r * .09, .7); eye(0, -r * .05, r * .4, '#9a3a0a');
  }
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = Math.max(2, r * .08); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, r * .86, Math.PI * 1.08, Math.PI * 1.7); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = t * 1.7 + i * TAU / 3; drawGlow(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.2, r * .2, c, .6); }
  ctx.restore();
};

// ================= INIMIGOS: pose de ataque, entrada com faisca e alerta de pouca vida =================
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    const r = ae.call(this, e); if (!e || e.dead || QL() < 1 || typeof e.x !== 'number' || ['dummy', 'rod', 'boulder', 'bit', 'swarmer'].includes(e.type)) return r;
    const R = e.rad || 24, t = World.t + (e.ph || 0), col = h50(e.glow) ? e.glow : '#ffb340';
    ctx.save(); ctx.translate(e.x, e.y);
    // entrada: anel que se fecha e faiscas
    if (e.age < .5) { const k = e.age / .5; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = col; ctx.globalAlpha = (1 - k) * .8; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * (2.6 - 1.4 * k), 0, TAU); ctx.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + e.ph; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(a) * R * (2.2 - k * 1.2), Math.sin(a) * R * (2.2 - k * 1.2), 2.2, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
    // pose de ataque: linhas convergindo para o corpo
    if (e.shootT !== undefined && e.shootT < .5 && e.mode === 'hover' && ['shooter', 'tank', 'captain', 'shield', 'healer', 'turret', 'sniper'].includes(e.type)) { const k = 1 - e.shootT / .5; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff7a5a'; ctx.globalAlpha = k * .7; ctx.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t; const r0 = R * (2.8 - 1.5 * k), r1 = r0 + R * .5; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); } ctx.globalAlpha = 1; }
    // alerta de vulnerabilidade: pouca vida pulsa em vermelho; escudo caido racha
    const hr = e.maxHp ? e.hp / e.maxHp : 1; if (hr < .3 && e.maxHp >= 10) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff3a4a'; ctx.globalAlpha = .35 + .35 * Math.sin(t * 10); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * 1.2, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    if (e.type === 'shield' && e.maxShield && e.shield <= 0) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(127,224,255,.7)'; ctx.lineWidth = 2; ctx.globalAlpha = .5 + .4 * Math.sin(t * 14); ctx.beginPath(); ctx.moveTo(-R * .5, -R * 1.5); ctx.lineTo(-R * .1, -R * 1.3); ctx.lineTo(-R * .35, -R * 1.1); ctx.moveTo(R * .4, -R * 1.45); ctx.lineTo(R * .15, -R * 1.2); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.restore(); return r;
  };
}

// ================= EXPLOSOES EM QUADROS COM SMEAR =================
Visual50.burst = function (x, y, c, size) { if (QL() < 1 || Visual50.bursts.length > 14) return; Visual50.bursts.push({ x, y, c: h50(c) ? c : '#ffb340', s: size, t: 0, rot: rand(0, TAU) }); };
{
  const ke = killEnemy;
  killEnemy = function (e, by) { const was = e && !e.dead, x = e && e.x, y = e && e.y, R = e && e.rad || 24, c = e && e.glow; const res = ke(e, by); if (was && e.dead) Visual50.burst(x, y, c, R); return res; };
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () { const b = G.boss; if (b) for (let i = 0; i < 5; i++) { const x = b.x + rand(-b.rad, b.rad) * .8, y = b.y + rand(-b.rad, b.rad) * .6, c = h50(b.col) ? b.col : '#ffb340'; G.timers.push({ t: i * .12, fn: () => Visual50.burst(x, y, c, 70 + rand(0, 40)) }); } return bd.call(this); };
  const vd = Visual13.draw;
  Visual13.draw = function () {
    vd.call(this); const B = Visual50.bursts; if (!B.length || G.state === 'pause') return;
    ctx.save(); for (const b of B) {
      b.t += 1 / 60; const T = .34, k = b.t / T; if (k >= 1) continue; const R = b.s * (1 + easeOut(k) * 2.2), sq = k < .25 ? 1 + (1 - k * 4) * .5 : 1;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot); ctx.scale(sq, 1 / sq); ctx.globalAlpha = 1 - k * k;
      // estrela de impacto (formato de quadrinho) preenchida e com contorno
      const n = 10, pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rr = i % 2 ? R * .55 : R * (1 + (hh50(i + Math.floor(b.x)) - .5) * .35); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
      ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath(); ctx.fillStyle = k < .4 ? '#ffffff' : b.c; ctx.fill(); ol50(4, .85 * (1 - k));
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = k < .5 ? b.c : 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(0, 0, R * .5 * (1 - k * .6), 0, TAU); ctx.fill();
      // linhas de "smear" radiais
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + hh50(i) * .3, r0 = R * (.6 + k), r1 = R * (1.15 + k * 1.1); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
      ctx.restore();
    } ctx.restore(); Visual50.bursts = B.filter(b => b.t < .34);
  };
}

// ================= FUNDOS COM VIDA PROPRIA =================
Visual50.anim = [
  t => { for (let i = 0; i < 14; i++) { const x = 60 + hh50(i) * (W - 120), y = H - ((t * (14 + hh50(i + 3) * 18) + hh50(i + 9) * H) % H); ctx.globalAlpha = .5 + .4 * Math.sin(t * 3 + i); drawGlow(x + Math.sin(t + i) * 10, y, 8, '#c8a0ff', .5); } },
  t => { for (let i = 0; i < 5; i++) { const k = ((t * .6 + i * .37) % 1); ctx.globalAlpha = (1 - k); drawGlow(W - 470 + k * 60 + hh50(i) * 20, H * .2 + k * 130, 5 + (1 - k) * 4, '#ffb340', .9); } },
  t => { ctx.strokeStyle = 'rgba(190,170,255,.28)'; ctx.lineWidth = 1.6; for (let i = 0; i < 40; i++) { const x = hh50(i) * W, y = ((t * 520 + hh50(i + 5) * H) % (H + 80)) - 40; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 26); ctx.stroke(); } },
  t => { for (let k = 0; k < 2; k++) { const ph = (t * .25 + k * .5) % 1, a = -Math.PI / 2 + (k ? .5 : -.5), R = 180 + ph * 380; ctx.globalAlpha = (1 - ph) * .55; drawGlow(W / 2 + Math.cos(a) * R * .6, -140 + Math.sin(a) * R + 200, 30 + ph * 30, '#ffd36a', .8); } },
  t => { for (let i = 0; i < 7; i++) { const a = t * .3 + i * .9, x = W / 2 + Math.cos(a) * (200 + i * 60), y = 200 + Math.sin(a * 1.3) * 120 + i * 30; ctx.globalAlpha = .45 + .3 * Math.sin(t * 2 + i); drawGlow(x, y, 16, '#9fd8ff', .7); } },
  t => { ctx.strokeStyle = 'rgba(80,20,140,.5)'; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) { const sd = i % 2 ? 1 : -1, x0 = sd < 0 ? -10 : W + 10, y0 = 80 + i * 130; ctx.beginPath(); ctx.moveTo(x0, y0); for (let k = 1; k <= 6; k++) ctx.lineTo(x0 - sd * k * 22, y0 + Math.sin(t * 1.4 + k * .8 + i) * 24 * (k / 6)); ctx.stroke(); } },
  t => { for (let i = 0; i < 3; i++) { const x = ((t * (30 + i * 16) + i * 500) % (W + 300)) - 150, y = 120 + i * 90; ctx.globalAlpha = .75; ctx.fillStyle = '#2a1a48'; ctx.beginPath(); ctx.ellipse(x, y, 34, 9, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(x + 12, y - 2, 2.4, 0, TAU); ctx.fill(); drawGlow(x - 34, y, 10, '#ffd36a', .7); } },
  t => { for (let i = 0; i < 12; i++) { const d = i % 2 ? 1 : -1, x = ((t * (40 + (i % 4) * 18) * d + hh50(i) * W * 2) % (W + 200) + (W + 200)) % (W + 200) - 100, y = 330 + hh50(i + 5) * 260; ctx.globalAlpha = .3; ctx.fillStyle = '#8ad8ff'; ctx.beginPath(); ctx.ellipse(x, y + Math.sin(t * 2 + i) * 4, 12, 4.4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - d * 11, y); ctx.lineTo(x - d * 19, y - 5); ctx.lineTo(x - d * 19, y + 5); ctx.fill(); } },
  t => { for (let i = 0; i < 6; i++) { const ph = (t * .5 + hh50(i) * 3) % 3; if (ph > .3) continue; ctx.globalAlpha = (.3 - ph) * 3 * .6; ctx.fillStyle = '#ffffff'; const x = hh50(i + 9) * W, y = hh50(i + 3) * H; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 20); ctx.lineTo(x - 4, y); ctx.fill(); } },
  t => { for (let i = 0; i < 26; i++) { const k = (t * (.1 + hh50(i) * .1) + hh50(i + 7)) % 1, x = W / 2 + (hh50(i + 2) - .5) * 200 * (1 + k), y = 360 - k * 340; ctx.globalAlpha = (1 - k) * .8; drawGlow(x, y, 6 + hh50(i) * 5, '#ffe9a8', .8); } },
];
{
  const bi = Visual.biome;
  Visual.biome = function () { bi.call(this); if (QL() < 2 || !G.stage || G.state === 'pause') return; const f = Visual50.anim[G.stage.id]; if (f) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; try { f(World.t); } catch (e) { } ctx.restore(); } };
}

// ================= COR DO CHEFE NA CENA E PEQUENO CLIMA POR SETOR =================
{
  const ov = Visual.overlay;
  Visual.overlay = function () {
    ov.call(this); const b = G.boss; if (!b || b.state !== 'fight' || QL() < 1 || G.state !== 'play' || !h50(b.col)) return;
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .05 + (b.phase || 0) * .03; ctx.fillStyle = b.col; ctx.fillRect(0, 0, W, H); ctx.restore();
  };
}
