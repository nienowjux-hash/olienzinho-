'use strict';
// ---------- 46: Arauto, Leviata e Reflexo redesenhados do zero + acabamento (sombra de contato e contorno) em todos os chefes ----------
const V46 = {};
const g46 = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
const r46 = (x, y, r0, r1, st) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
const pl46 = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };

// ---------- Arauto Luminoso: maquina-anjo com asas em laminas, aureola e olho que abre ----------
Herald.prototype.draw = function () {
  const t = this.t, ph = this.phase, hit = this.flash > 0, chg = this.chargeT > 0 ? 1 - this.chargeT / this.chargeMax : 0, p = G.player, lk = p ? clamp((p.x - this.x) / 300, -1, 1) : 0, lky = p ? clamp((p.y - this.y) / 400, -.3, 1) : .5;
  ctx.save(); ctx.translate(this.x, this.y);
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 360, '#ffd36a', .3 + Math.sin(t * 3) * .05); drawGlow(0, 0, 150, '#ffffff', .25); ctx.globalCompositeOperation = 'source-over';
  // aureola de segmentos (gira) e arcos
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.4 + k * .15) * (k % 2 ? -1 : 1)); ctx.strokeStyle = k % 2 ? '#fff0c0' : '#ffd36a'; ctx.lineWidth = 4 + k; ctx.globalAlpha = .85; ctx.setLineDash([30, 16]); ctx.beginPath(); ctx.ellipse(0, 0, 150 + k * 26, 52 + k * 16, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  // asas em laminas (3 camadas por lado)
  for (const s of [-1, 1]) for (let layer = 0; layer < 3; layer++) for (let i = 0; i < 6; i++) {
    ctx.save(); ctx.scale(s, 1); const fl = Math.sin(t * 1.6 + i * .35 + layer) * .05 + (ph >= 1 ? Math.sin(t * 4) * .03 : 0); ctx.rotate(.22 + i * .2 + layer * .05 + fl); const L = 210 - layer * 28 + i * (layer ? 3 : 8), W0 = 17 - layer * 3;
    ctx.fillStyle = hit ? '#fff' : g46(30, 0, 30, -L, [[0, layer ? '#ffe9a8' : '#ffffff'], [.6, layer === 1 ? '#ffd36a' : '#fff0c0'], [1, 'rgba(255,200,90,0)']]); ctx.beginPath(); ctx.moveTo(30, 0); ctx.quadraticCurveTo(30 + W0, -L * .45, 30 + W0 * .35, -L); ctx.quadraticCurveTo(30 - W0 * .9, -L * .45, 30, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(122,82,16,.5)'; ctx.lineWidth = 1.8; ctx.stroke(); ctx.restore();
  }
  // coroa de raios
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,240,180,.55)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * .2, l1 = 100, l2 = 150 + Math.sin(t * 3 + i) * 12; ctx.beginPath(); ctx.moveTo(Math.cos(a) * l1, Math.sin(a) * l1); ctx.lineTo(Math.cos(a) * l2, Math.sin(a) * l2); ctx.stroke(); } ctx.restore();
  // corpo: esfera dourada com placa facial
  ctx.fillStyle = hit ? '#fff' : r46(-26, -32, 6, 100, [[0, '#ffffff'], [.4, '#fff0b8'], [.8, '#e8b840'], [1, '#8a5a10']]); ctx.beginPath(); ctx.arc(0, 0, 90, 0, TAU); ctx.fill(); ctx.strokeStyle = '#6a4a10'; ctx.lineWidth = 6; ctx.stroke();
  ctx.strokeStyle = 'rgba(120,80,16,.45)'; ctx.lineWidth = 2.4; for (const a of [-.9, -.3, .3, .9]) { ctx.beginPath(); ctx.ellipse(0, 0, 90, 90 * Math.abs(Math.sin(a)) + 4, a > 0 ? .3 : -.3, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = hit ? '#fff' : g46(0, -60, 0, 50, [[0, '#fffbe8'], [1, '#e0b048']]); pl46([[-58, -36], [58, -36], [46, 38], [0, 62], [-46, 38]]); ctx.fill(); ctx.strokeStyle = '#6a4a10'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  // olho central (fechado na fase 1, abre nas fases seguintes e segue o jogador)
  const open = ph >= 1 ? .55 + .2 * Math.sin(t * 2) : .08;
  ctx.fillStyle = '#2a1404'; ctx.beginPath(); ctx.ellipse(0, -2, 36, 26 * open + 3, 0, 0, TAU); ctx.fill(); if (open > .2) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -2, 32, 22 * open, 0, 0, TAU); ctx.fill(); ctx.fillStyle = ph >= 2 ? '#ff4a2a' : '#ffb320'; ctx.beginPath(); ctx.arc(lk * 12, -2 + lky * 5, 13 * open + 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#1a0a02'; ctx.beginPath(); ctx.arc(lk * 14, -2 + lky * 6, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lk * 12 - 5, -8, 3.4, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -2, 50, '#ffffff', .7 * open); ctx.globalCompositeOperation = 'source-over'; }
  ctx.strokeStyle = '#6a4a10'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-22, 36); ctx.quadraticCurveTo(0, 46 + (ph >= 1 ? 6 : 0), 22, 36); ctx.stroke();
  // prismas orbitando
  for (let i = 0; i < 4; i++) { const a = t * 1.1 + i * TAU / 4; ctx.save(); ctx.translate(Math.cos(a) * 124, Math.sin(a) * 52); ctx.rotate(t * 2 + i); ctx.fillStyle = ['#ff8a8a', '#ffe08a', '#9fffb0', '#9fd8ff'][i]; pl46([[0, -10], [7, 0], [0, 10], [-7, 0]]); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 18, '#fff3c0', .5); ctx.restore(); }
  if (chg > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 20, 40 + chg * 80, '#ffffff', chg * .8); }
  this.flashOverlay(92); ctx.restore();
};

// ---------- Leviata: serpente blindada com placas, nadadeiras, cabeca de dragao marinho ----------
Leviathan.prototype.draw = function () {
  const t = this.t, hit = this.flash > 0, p = G.player;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = this.N - 1; i >= 0; i--) { const [x, y] = this.seg(i), r = i === 0 ? 56 : 42 - i * 1.1; drawGlow(x, y, r * 2.3, '#33c4ff', .2); }
  ctx.globalCompositeOperation = 'source-over'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // nadadeiras dorsais e ventrais
  for (let i = this.N - 1; i >= 1; i--) {
    const [x, y] = this.seg(i), [px, py] = this.seg(i - 1), r = 42 - i * 1.1, a = Math.atan2(py - y, px - x), sw = Math.sin(t * 4 + i * .5) * .25;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); for (const sd of [-1, 1]) { ctx.save(); ctx.rotate(sd * sw * .4); ctx.fillStyle = hit ? '#fff' : g46(0, 0, -r * 1.3, sd * r * 2, [[0, '#2a9ad8'], [1, 'rgba(60,200,255,.2)']]); ctx.beginPath(); ctx.moveTo(r * .5, sd * r * .9); ctx.quadraticCurveTo(-r * .4, sd * r * 2.1, -r * 1.2, sd * r * (1.5 + sw)); ctx.quadraticCurveTo(-r * .2, sd * r * 1.2, -r * .6, sd * r * .9); ctx.fill(); ctx.strokeStyle = 'rgba(160,240,255,.7)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); } ctx.restore();
  }
  // placas do corpo
  for (let i = this.N - 1; i >= 1; i--) {
    const [x, y] = this.seg(i), [px, py] = this.seg(i - 1), r = 42 - i * 1.1, a = Math.atan2(py - y, px - x);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = hit ? '#fff' : g46(0, -r, 0, r, [[0, i % 2 ? '#52c8f4' : '#3ab0e8'], [.55, '#1a6aa8'], [1, '#e0fbff']]); ctx.beginPath(); ctx.ellipse(0, 0, r * 1.15, r, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(2,24,48,.8)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(190,250,255,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-r * .1, 0, r * .62, -1.2, 1.2); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-r * .2, -r * .5, r * .4, r * .13, -.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7fe8ff'; ctx.beginPath(); ctx.moveTo(-4, -r); ctx.lineTo(-r * .9, -r * 1.75); ctx.lineTo(r * .3, -r); ctx.fill(); ctx.strokeStyle = '#04203a'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 3 + i + k); ctx.fillStyle = '#9fffe8'; ctx.beginPath(); ctx.arc(-r * .3 + k * r * .3, r * .22, 3.2, 0, TAU); ctx.fill(); } ctx.restore();
  }
  // cabeca: crista, mandibula aberta com dentes, olho que segue o jogador
  const [hx, hy] = this.seg(0), [qx, qy] = this.seg(1), ha = Math.atan2(hy - qy, hx - qx) || 0;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(ha);
  const jaw = .22 + Math.sin(t * 2.4) * .1 + (this.dive ? .25 : 0);
  ctx.save(); ctx.rotate(jaw); ctx.fillStyle = hit ? '#fff' : g46(0, 0, 80, 0, [[0, '#0e4a7a'], [1, '#04203a']]); pl46([[10, 8], [92, 16], [86, 36], [20, 44]]); ctx.fill(); ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#f2fdff'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(30 + k * 12, 14 + k * .6); ctx.lineTo(36 + k * 12, 0); ctx.lineTo(42 + k * 12, 14 + k * .6); ctx.fill(); } ctx.restore();
  ctx.fillStyle = hit ? '#fff' : g46(0, -50, 0, 50, [[0, '#56c8f4'], [.5, '#2a8ac8'], [1, '#0e4a7a']]); ctx.beginPath(); ctx.ellipse(10, -4, 70, 48, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 3.4; ctx.stroke();
  ctx.fillStyle = '#04203a'; pl46([[-30, -36], [-70, -64], [-50, -30]]); ctx.fill(); ctx.strokeStyle = '#7fe8ff'; ctx.stroke(); pl46([[-6, -44], [-30, -86], [14, -46]]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#04203a'; pl46([[40, -26], [96, -20], [96, 10], [40, 6]]); ctx.fill(); ctx.fillStyle = '#f2fdff'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(48 + k * 10, -2); ctx.lineTo(53 + k * 10, 10); ctx.lineTo(58 + k * 10, -2); ctx.fill(); }
  const lx = p ? clamp(Math.cos(Math.atan2(p.y - hy, p.x - hx) - ha), -1, 1) : 0, ly = p ? clamp(Math.sin(Math.atan2(p.y - hy, p.x - hx) - ha), -1, 1) : 0;
  ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(-4, -24, 18, 0, TAU); ctx.fill(); ctx.strokeStyle = '#04203a'; ctx.lineWidth = 2.6; ctx.stroke(); ctx.fillStyle = hit ? '#ff3a3a' : '#ff8a2a'; ctx.beginPath(); ctx.arc(-4 + lx * 6, -24 + ly * 6, 10, 0, TAU); ctx.fill(); ctx.fillStyle = '#04203a'; ctx.beginPath(); ctx.ellipse(-4 + lx * 7, -24 + ly * 7, 3.6, 8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-8, -29, 3.4, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(-4, -24, 40, '#33c4ff', .45); ctx.restore();
  this.flashOverlay(0.01); ctx.restore();
};

// ---------- Reflexo: esfera de vidro rachada que reflete a nave; o corpo verdadeiro brilha e o falso e escuro ----------
Mirror.prototype.draw = function () {
  const t = this.t, hit = this.flash > 0, p = G.player;
  for (const s of [0, 1]) {
    const [bx, by] = this.pos(s), real = s === this.real, flip = s ? -1 : 1; ctx.save(); ctx.translate(bx, by); ctx.scale(flip, 1);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, real ? 300 : 210, real ? '#ffffff' : '#7a3aff', real ? .45 : .24); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = real ? 1 : .68;
    // cacos de vidro girando
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + t * (.25 + (i % 3) * .05) * (real ? 1 : -1), R = 118 + (i % 3) * 22 + Math.sin(t * 1.4 + i) * 6; ctx.save(); ctx.translate(Math.cos(a) * R, Math.sin(a) * R * .85); ctx.rotate(a * 2 + t); ctx.fillStyle = real ? 'rgba(235,225,255,.78)' : 'rgba(40,16,90,.8)'; ctx.strokeStyle = real ? '#ffffff' : '#c8a8ff'; ctx.lineWidth = 2; pl46([[0, -17 - (i % 2) * 6], [11, 8], [-9, 12]]); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; pl46([[0, -17], [4, 0], [-3, 2]]); ctx.fill(); ctx.restore(); }
    // esfera
    ctx.fillStyle = hit && real ? '#fff' : real ? r46(-28, -34, 6, 98, [[0, '#ffffff'], [.5, '#e8d8ff'], [1, '#8a5ad8']]) : r46(-28, -34, 6, 98, [[0, '#4a2a9a'], [.6, '#1a0a40'], [1, '#07031a']]); ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); ctx.fill(); ctx.strokeStyle = real ? '#c04aff' : '#e8d0ff'; ctx.lineWidth = 5; ctx.stroke();
    // reflexo da nave dentro do vidro
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 88, 0, TAU); ctx.clip(); ctx.globalAlpha *= real ? .5 : .35; ctx.translate(0, 34); ctx.scale(1, -1); if (p) Art.ship(clamp((p.x - bx) * .12, -40, 40), 10, { pal: SKIN_DEFAULT, vx: 0, t, scale: .7, lookx: 0, looky: 0, blinkT: 0, inv: 0, noWings: true }); ctx.restore();
    // rachaduras
    ctx.strokeStyle = real ? 'rgba(90,40,170,.55)' : 'rgba(210,190,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-60, -40); ctx.lineTo(-20, -8); ctx.lineTo(-30, 30); ctx.moveTo(-20, -8); ctx.lineTo(30, -22); ctx.lineTo(62, 4); ctx.moveTo(30, -22); ctx.lineTo(44, -62); ctx.stroke();
    // olho
    ctx.fillStyle = real ? '#2a0a5a' : '#f2e8ff'; ctx.beginPath(); ctx.ellipse(0, -2, 54, 23 + Math.sin(t * 1.3) * 3, 0, 0, TAU); ctx.fill(); const lx = p ? clamp((p.x - bx) / 260, -1, 1) * flip : 0;
    ctx.fillStyle = real ? '#d070ff' : '#7a3aff'; ctx.beginPath(); ctx.arc(lx * 20, -2, 14, 0, TAU); ctx.fill(); ctx.fillStyle = real ? '#10062a' : '#ffffff'; ctx.beginPath(); ctx.arc(lx * 22, -2, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx * 20 - 4, -7, 3.2, 0, TAU); ctx.fill();
    if (real) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .6 + .3 * Math.sin(t * 4); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 100 + Math.sin(t * 3) * 3, 0, TAU); ctx.stroke(); }
    if (this.chargeT > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 60 + (1 - this.chargeT / this.chargeMax) * 80, '#ffffff', .6); }
    ctx.restore();
  }
};

// ---------- sombra de contato e contorno suave em todos os chefes ----------
{
  const bd = Visual3.bossDraw;
  Visual3.bossDraw = function (b) {
    if (!b || QL() < 2 || b.state === 'intro') return bd.call(this, b);
    ctx.save(); const rad = b.rad || 100; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(b.x + 14, b.y + rad * .95, rad * 1.05, rad * .24, 0, 0, TAU); ctx.fill(); ctx.restore();
    return bd.call(this, b);   // sem shadowBlur: custava ate 60 fps nos chefes com muitas formas
  };
}
