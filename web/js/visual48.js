'use strict';
// ---------- 48: Nave-Mae, Gigante de Rocha, Olho da Tempestade e Sol-Guardiao redesenhados (mesmos ataques e avisos, arte nova) ----------
const q48 = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
const r48 = (x, y, r0, r1, st) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
const ink48 = (w = 4) => { ctx.strokeStyle = 'rgba(14,4,26,.82)'; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.stroke(); };
const hexCache48 = {};
const hexGrid48 = (x0, y0, x1, y1, s, col) => { // a grade nao muda: desenhada uma vez num sprite
  const q = Math.max(1, K), key = [x0, y0, x1, y1, s, col, Math.round(q * 10)].join('|'); let c = hexCache48[key];
  if (!c) { const w = x1 - x0 + 2 * s, hh = y1 - y0 + 2 * s; c = document.createElement('canvas'); c.width = Math.ceil(w * q); c.height = Math.ceil(hh * q); const g = c.getContext('2d'); g.scale(q, q); g.translate(s - x0, s - y0); g.strokeStyle = col; g.lineWidth = 1.4; const h = s * .866; for (let r = 0, y = y0; y < y1 + h; y += h, r++) for (let x = x0 + (r % 2) * s * .75; x < x1 + s; x += s * 1.5) { g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; g.lineTo(x + Math.cos(a) * s * .5, y + Math.sin(a) * s * .5); } g.closePath(); g.stroke(); } hexCache48[key] = c; }
  ctx.drawImage(c, x0 - s, y0 - s, x1 - x0 + 2 * s, y1 - y0 + 2 * s);
};

// ================= NAVE-MAE ZANGAO: rainha-abelha com casco de favo =================
MotherShip.prototype.draw = function () {
  const t = this.t, ph = this.phase, hit = this.flash > 0, fanW = this.warn('fan'), wild = ph === 2, p = G.player;
  ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.tilt);
  // brilho, feixe de captura e propulsores
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 24, 300, wild ? '#ff5a2a' : '#ff8a1f', .34 + .06 * Math.sin(t * 3));
  if (this.bayO > .02) { ctx.globalAlpha = this.bayO * .5; ctx.fillStyle = q48(0, 62, 0, 400, [[0, 'rgba(255,230,160,.7)'], [1, 'rgba(255,160,60,0)']]); ctx.beginPath(); ctx.moveTo(-42, 62); ctx.lineTo(42, 62); ctx.lineTo(120, 400); ctx.lineTo(-120, 400); ctx.closePath(); ctx.fill(); for (let i = 0; i < 6; i++) { const k = (t * .9 + i / 6) % 1; drawGlow(Math.sin(i * 4 + t) * 30 * (1 + k), 70 + k * 260, 10, '#ffe9a8', this.bayO * (1 - k)); } }
  for (const s of [-1, 1]) { const fl = 26 + Math.sin(t * 40 + s) * 6 + Math.random() * 8; ctx.globalAlpha = .9; ctx.fillStyle = q48(0, 62, 0, 62 + fl, [[0, '#fff1c1'], [.4, '#ffb340'], [1, 'rgba(255,90,20,0)']]); ctx.beginPath(); ctx.moveTo(s * 112 - 12, 62); ctx.lineTo(s * 112, 62 + fl); ctx.lineTo(s * 112 + 12, 62); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha = 1;
  // abdomen/ferrao de tras (por baixo do casco)
  ctx.fillStyle = hit ? '#fff' : q48(0, 20, 0, 90, [[0, '#7a3208'], [1, '#2a0e04']]); ctx.beginPath(); ctx.ellipse(0, 40, 120, 40, 0, 0, TAU); ctx.fill(); ink48(4); ctx.fillStyle = '#1a0804'; ctx.beginPath(); ctx.moveTo(-14, 70); ctx.lineTo(0, 100 + Math.sin(t * 3) * 3); ctx.lineTo(14, 70); ctx.fill();
  // asas-placas em favo (somem na fase 2 revelando turbinas)
  for (const s of [-1, 1]) {
    if (!this.platesOff) {
      ctx.save(); ctx.fillStyle = hit ? '#fff' : q48(s * 100, -30, s * 210, 60, [[0, '#ffc850'], [.5, '#e8821a'], [1, '#7a2e06']]); ctx.beginPath(); ctx.moveTo(s * 116, -34); ctx.quadraticCurveTo(s * 212, -46, s * 214, 12); ctx.quadraticCurveTo(s * 206, 56, s * 120, 54); ctx.closePath(); ctx.fill(); ink48(4.5);
      ctx.save(); ctx.clip(); hexGrid48(s > 0 ? 116 : -216, -50, s > 0 ? 216 : -116, 60, 22, 'rgba(80,28,4,.55)'); ctx.restore();
      ctx.strokeStyle = 'rgba(255,248,214,.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s * 124, -30); ctx.quadraticCurveTo(s * 200, -42, s * 208, 6); ctx.stroke();
      ctx.fillStyle = '#4a1604'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(s * (140 + i * 22), 8 + i * 12, 3.6, 0, TAU); ctx.fill(); } ctx.restore();
    } else {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 158, 12, 60, wild ? '#ff3a2a' : '#ffb340', .9); ctx.restore(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#1a0a04'; ctx.beginPath(); ctx.arc(s * 158, 12, 28, 0, TAU); ctx.fill(); ink48(3);
      ctx.save(); ctx.translate(s * 158, 12); ctx.rotate(t * 6 * s); for (let i = 0; i < 6; i++) { ctx.rotate(TAU / 6); ctx.fillStyle = i % 2 ? '#ffb340' : '#ff7a1a'; ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(25, -7); ctx.lineTo(25, 7); ctx.fill(); } ctx.restore();
    }
  }
  // casco principal: duas camadas, listras de abelha e favo
  const hull = (rx, ry) => { ctx.beginPath(); ctx.ellipse(0, 10, rx, ry, 0, 0, TAU); };
  ctx.fillStyle = hit ? '#fff' : q48(0, -50, 0, 70, [[0, '#ffeab0'], [.4, '#ffa830'], [1, '#8a3408']]); hull(152, 58); ctx.fill(); ink48(5);
  ctx.save(); hull(150, 56); ctx.clip(); hexGrid48(-160, -50, 160, 70, 20, 'rgba(110,40,6,.28)');
  ctx.fillStyle = 'rgba(40,14,2,.55)'; for (const y of [24, 42]) { ctx.beginPath(); ctx.ellipse(0, y, 156, 11, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = q48(-150, 0, 150, 0, [[0, 'rgba(255,255,255,.28)'], [.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.25)']]); ctx.fillRect(-160, -50, 320, 130); ctx.restore();
  ctx.strokeStyle = 'rgba(255,248,214,.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 10, 148, 54, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  for (let i = -4; i <= 4; i++) { const on = (Math.floor(t * 7) + i + 40) % 4 === 0; ctx.fillStyle = on ? (wild ? '#ff6a4a' : '#fff6c8') : '#6a2a08'; ctx.beginPath(); ctx.arc(i * 32, 32 + Math.abs(i) * .9, 4.8, 0, TAU); ctx.fill(); if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(i * 32, 32, 18, wild ? '#ff5a3a' : '#ffe9a8', .9); ctx.restore(); ctx.globalAlpha = 1; } }
  if (ph >= 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,${wild ? 80 : 150},40,${.55 + Math.sin(t * 6) * .25})`; ctx.lineWidth = 2.6; for (const [a, b, c, d] of [[-40, -30, -70, 10], [30, -40, 60, 0], [-20, 30, -50, 52], [70, 20, 100, 44]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo((a + c) / 2 + 8, (b + d) / 2 - 6); ctx.lineTo(c, d); ctx.stroke(); } ctx.restore(); }
  // canhoes (carregam e recuam)
  for (const s of [-1, 1]) {
    const rec = this.muzzle > 0 ? this.muzzle / .14 * 10 : 0; ctx.fillStyle = '#6a2208'; ctx.beginPath(); ctx.roundRect(s * 122 - 17, 30, 34, 28, 8); ctx.fill(); ink48(3);
    ctx.fillStyle = q48(s * 122 - 10, 0, s * 122 + 10, 0, [[0, '#4a1604'], [.5, '#b84a10'], [1, '#4a1604']]); ctx.beginPath(); ctx.roundRect(s * 122 - 10, 50, 20, 36 - rec, 4); ctx.fill(); ink48(2.6);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const mz = this.muzzle > 0 ? 1 : 0; drawGlow(s * 122, 88 - rec, 10 + fanW * 26 + mz * 28, mz ? '#ffffff' : '#ffb340', .4 + fanW * .6 + mz * .6); ctx.restore(); ctx.globalAlpha = 1;
  }
  // baia com portas
  const bw = 40; ctx.fillStyle = '#0e0408'; ctx.beginPath(); ctx.roundRect(-bw, 56, bw * 2, 22, 6); ctx.fill();
  if (this.bayO > .02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = q48(0, 56, 0, 78, [[0, 'rgba(255,230,160,.9)'], [1, 'rgba(255,140,40,.2)']]); ctx.globalAlpha = this.bayO; ctx.beginPath(); ctx.roundRect(-bw + 4, 58, bw * 2 - 8, 16, 4); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
  ctx.fillStyle = '#d06a14'; const dOff = this.bayO * (bw - 4); ctx.fillRect(-bw, 56, bw - dOff, 22); ctx.fillRect(dOff, 56, bw - dOff, 22); ctx.strokeStyle = 'rgba(14,4,26,.7)'; ctx.lineWidth = 2; ctx.strokeRect(-bw, 56, bw - dOff, 22); ctx.strokeRect(dOff, 56, bw - dOff, 22);
  // cupula de vidro com a rainha (olho)
  ctx.fillStyle = r48(-24, -52, 6, 96, [[0, 'rgba(255,255,255,.95)'], [.45, 'rgba(255,215,150,.62)'], [1, 'rgba(150,50,10,.88)']]); ctx.beginPath(); ctx.ellipse(0, -18, 96, 66, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ink48(4);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -18, 92, 62, 0, Math.PI, 0); ctx.closePath(); ctx.clip();
  ctx.fillStyle = '#fbf0da'; ctx.beginPath(); ctx.arc(0, -22, 42, 0, TAU); ctx.fill();
  const px = p ? clamp((p.x - this.x) / 280, -1, 1) : 0, py = p ? clamp((p.y - this.y) / 380, -.4, 1) : 0, irisC = wild ? '#ff3a2a' : ph === 1 ? '#ff8a1f' : '#ffd23a';
  ctx.fillStyle = r48(px * 12, -22 + py * 10, 3, 21, [[0, '#fff'], [.3, irisC], [1, wild ? '#7a0a0a' : '#b0560a']]); ctx.beginPath(); ctx.arc(px * 12, -22 + py * 10, 21, 0, TAU); ctx.fill();
  const dil = 7 + fanW * 4 + (this.bay > 0 ? 3 : 0); ctx.fillStyle = '#1a0a30'; ctx.beginPath(); ctx.ellipse(px * 14, -22 + py * 12, dil, dil * 1.35, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(px * 12 - 6, -22 + py * 10 - 7, 4.4, 0, TAU); ctx.fill();
  const bl = (t % 4.2) < .14 ? 1 - Math.abs((t % 4.2) / .07 - 1) : 0, lid = 14 + ph * 9 + bl * 46 + (hit ? 16 : 0), brow = ph * 8;
  ctx.fillStyle = q48(0, -64, 0, -64 + lid, [[0, '#ffa23a'], [1, '#c85a10']]); for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 48, -66); ctx.lineTo(0, -66); ctx.lineTo(0, -64 + lid + brow); ctx.lineTo(s * 48, -64 + lid - brow * .3); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(0, -18, 78, 50, 0, Math.PI * 1.12, Math.PI * 1.34); ctx.stroke();
  // antenas de abelha nas laterais da cupula + antena central com ondas
  ctx.strokeStyle = '#7a2e06'; ctx.lineWidth = 5; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 40, -70); ctx.quadraticCurveTo(s * 70, -112, s * 96 + Math.sin(t * 2 + s) * 4, -112); ctx.stroke(); ctx.fillStyle = wild ? '#ff6a4a' : '#ffd36a'; ctx.beginPath(); ctx.arc(s * 98 + Math.sin(t * 2 + s) * 4, -112, 8, 0, TAU); ctx.fill(); ink48(2.4); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 98, -112, 22, wild ? '#ff4a3a' : '#ffe9a8', .8); ctx.restore(); }
  ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -82); ctx.lineTo(0, -118); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -124, 30, wild ? '#ff4a3a' : '#ffe9a8', .9); for (let i = 0; i < 2; i++) { const k = (t * .8 + i * .5) % 1; ctx.globalAlpha = (1 - k) * .6; ctx.strokeStyle = wild ? '#ff6a4a' : '#ffe9a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -124, 10 + k * 46, 0, TAU); ctx.stroke(); } ctx.restore(); ctx.globalAlpha = 1;
  ctx.fillStyle = wild ? '#ff6a4a' : '#ffe9a8'; ctx.beginPath(); ctx.arc(0, -124, 8 + Math.sin(t * 6) * 2.5, 0, TAU); ctx.fill();
  this.flashOverlay(150, 62); ctx.restore();
};

// ================= GIGANTE DE ROCHA: colosso de basalto com runas e cristais =================
RockGolem.prototype.draw = function () {
  const t = this.t, ph = this.phase, hit = this.flash > 0, p = G.player, lava = ph === 0 ? '#ff7a1a' : ph === 1 ? '#ff9a2a' : '#ffd36a', chg = this.warn('core');
  const stone = (a, b) => hit ? '#fff' : q48(-40, -60, 40, 60, [[0, a], [1, b]]);
  ctx.save(); ctx.translate(this.x, this.y);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 10, 290, '#ff6a1a', .3 + ph * .08 + Math.sin(t * 3) * .04); ctx.restore(); ctx.globalAlpha = 1;
  const orbit = r => { const a = r.a + t * .8 * r.s, rx = Math.cos(a) * r.r, ry = Math.sin(a) * r.r * .55 + 10; return [rx, ry, Math.sin(a) > 0]; };
  for (const r of this.rocks) { const [rx, ry, front] = orbit(r); if (front) continue; ctx.save(); ctx.translate(rx, ry); ctx.rotate(t * r.s); ctx.fillStyle = '#4a3448'; poly(0, 0, r.sz, 7, .22, r.a); ctx.fill(); ink48(3); ctx.strokeStyle = 'rgba(255,154,60,.55)'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore(); }
  // bracos: pedregulhos presos por feixes de energia
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1, [fx, fy] = this.fist(i), ex = fx - this.x, ey = fy - this.y, sx = s * 96, sy = -12, cx2 = sx + (ex - sx) * .35 + s * 28, cy2 = sy + (ey - sy) * .9 - 20;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = lava; ctx.globalAlpha = .45; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx2, cy2, ex, ey); ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1;
    for (let k = 0; k < 6; k++) { const u = k / 6, x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx2 + u * u * ex, y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy2 + u * u * ey; ctx.save(); ctx.translate(x, y); ctx.rotate(t * .4 + k); ctx.fillStyle = stone('#9a7a98', '#2a1230'); poly(0, 0, 30 - k * 2, 8, .14, k * 1.7); ctx.fill(); ink48(3.2); ctx.strokeStyle = 'rgba(255,200,120,.35)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, (30 - k * 2) * .6, -2.4, -.8); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 16, lava, .4); ctx.restore(); }
  }
  // tronco: colunas de basalto em camadas
  const br = Math.sin(t * 1.6) * 3;
  ctx.fillStyle = q48(0, -120, 0, 130, [[0, '#4a3048'], [1, '#14081c']]); poly(0, 10, 128, 12, .08, 1); ctx.fill(); ink48(5.5); ctx.strokeStyle = lava; ctx.lineWidth = 2.4; ctx.stroke();
  for (let k = 0; k < 3; k++) { ctx.fillStyle = hit ? '#fff' : q48(0, -100, 0, 100, [[0, ['#c0a0be', '#a888a6', '#8a6a88'][k]], [1, ['#3a2038', '#2a1430', '#1c0c24'][k]]]); poly(Math.sin(t * 1.1 + k) * 3, 10 + br * (k - 1) * .6, 106 - k * 14, 10, .11, k * 3 + 2); ctx.fill(); ink48(3.4); ctx.strokeStyle = 'rgba(255,170,90,.4)'; ctx.lineWidth = 1.8; ctx.stroke(); }
  // colunas hexagonais verticais (textura de basalto)
  ctx.save(); ctx.beginPath(); ctx.arc(0, 10, 100, 0, TAU); ctx.clip(); ctx.strokeStyle = 'rgba(20,6,26,.35)'; ctx.lineWidth = 2; for (let x = -90; x <= 90; x += 24) { ctx.beginPath(); ctx.moveTo(x, -90); ctx.lineTo(x + 4, 110); ctx.stroke(); } ctx.restore();
  ctx.fillStyle = '#10040e'; poly(0, 14, 50, 9, .07, 5); ctx.fill(); ink48(3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .3, e = 100 + Math.sin(k * 3) * 10; ctx.strokeStyle = lava; ctx.globalAlpha = .25; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 40, 14 + Math.sin(a) * 40); ctx.lineTo(Math.cos(a) * e, 14 + Math.sin(a) * e * .95); ctx.stroke(); ctx.globalAlpha = .9; ctx.lineWidth = 2.5; ctx.setLineDash([12, 20]); ctx.lineDashOffset = -t * 70; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 40, 14 + Math.sin(a) * 40); ctx.lineTo(Math.cos(a) * e, 14 + Math.sin(a) * e * .95); ctx.stroke(); ctx.setLineDash([]); }
  drawGlow(0, 14, 90 + Math.sin(t * 5) * 10 + chg * 40, lava, .9 + chg * .3); ctx.restore(); ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(0, 14); ctx.rotate(Math.sin(t * 2) * .12); const cs = 1 + Math.sin(t * 5) * .08 + chg * .3; ctx.fillStyle = hit ? '#fff' : q48(0, -34, 0, 40, [[0, '#ffffff'], [.5, '#ffe9a8'], [1, '#ff9a3c']]); ctx.beginPath(); ctx.moveTo(0, -36 * cs); ctx.lineTo(25 * cs, 0); ctx.lineTo(0, 42 * cs); ctx.lineTo(-25 * cs, 0); ctx.closePath(); ctx.fill(); ink48(2.6); ctx.restore();
  // ombreiras com cristais
  for (const s of [-1, 1]) { if (this.shedHelm && s > 0) continue; ctx.save(); ctx.translate(s * 100, -44); ctx.fillStyle = stone('#b090ae', '#2a1230'); poly(0, 0, 46, 9, .12, s + 4); ctx.fill(); ink48(4); ctx.strokeStyle = lava; ctx.lineWidth = 1.8; ctx.stroke();
    for (let k = -1; k <= 1; k++) { ctx.fillStyle = hit ? '#fff' : q48(0, -60, 0, -30, [[0, '#ffe9c0'], [1, lava]]); ctx.beginPath(); ctx.moveTo(k * 16 - 8, -30); ctx.lineTo(k * 16 + k * 3, -60 - (1 - Math.abs(k)) * 14); ctx.lineTo(k * 16 + 8, -30); ctx.closePath(); ctx.fill(); ink48(2.4); } ctx.restore(); }
  // cabeca: mascara entalhada com sobrancelha pesada, olhos que seguem, mandibula
  ctx.save(); ctx.translate(0, -100); ctx.fillStyle = stone('#b8a0b8', '#2c1630'); poly(0, 0, 46, 9, .1, 3); ctx.fill(); ink48(5); ctx.strokeStyle = lava; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.fillStyle = '#5a4058'; ctx.beginPath(); ctx.moveTo(-42, -10); ctx.lineTo(0, -22); ctx.lineTo(42, -10); ctx.lineTo(34, 2); ctx.lineTo(0, -8); ctx.lineTo(-34, 2); ctx.closePath(); ctx.fill(); ink48(3);
  ctx.fillStyle = '#10040e'; ctx.beginPath(); ctx.moveTo(-34, -4); ctx.lineTo(0, 2); ctx.lineTo(34, -4); ctx.lineTo(26, 12); ctx.lineTo(0, 14); ctx.lineTo(-26, 12); ctx.closePath(); ctx.fill();
  const eye = ph === 2 ? '#ff3a2a' : ph === 1 ? '#ff8a1f' : '#ffe9a8', ex = p ? clamp((p.x - this.x) / 300, -1, 1) * 4 : 0, ey = p ? clamp((p.y - this.y) / 400, -.3, 1) * 3 : 0;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) drawGlow(s * 15 + ex, 4 + ey, 22, eye, .9); ctx.restore(); ctx.globalAlpha = 1;
  ctx.fillStyle = eye; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 15 + ex, 4 + ey, 9.5, 5 + chg * 3, s * .25, 0, TAU); ctx.fill(); ctx.fillStyle = '#10040e'; ctx.beginPath(); ctx.ellipse(s * 15 + ex * 1.5, 4 + ey * 1.4, 2.6, 4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = eye; }
  ctx.fillStyle = '#10040e'; ctx.beginPath(); ctx.roundRect(-20, 20, 40, 8 + chg * 12, 3); ctx.fill();
  if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 26, 20 + chg * 26, '#ffe9a8', chg); ctx.restore(); ctx.globalAlpha = 1; }
  ctx.fillStyle = '#d8c4d4'; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 7.5 - 3, 20); ctx.lineTo(k * 7.5, 27); ctx.lineTo(k * 7.5 + 3, 20); ctx.fill(); }
  if (!this.shedHelm) for (const k of [-1, 0, 1]) { ctx.fillStyle = hit ? '#fff' : q48(0, -80, 0, -40, [[0, '#ffe9c0'], [1, lava]]); ctx.beginPath(); ctx.moveTo(k * 14 - 8, -42); ctx.lineTo(k * 14, -66 - (1 - Math.abs(k)) * 16); ctx.lineTo(k * 14 + 8, -42); ctx.closePath(); ctx.fill(); ink48(2.4); }
  ctx.restore();
  for (const r of this.rocks) { const [rx, ry, front] = orbit(r); if (!front) continue; ctx.save(); ctx.translate(rx, ry); ctx.rotate(t * r.s); ctx.fillStyle = hit ? '#fff' : q48(-10, -10, 10, 10, [[0, '#9a8098'], [1, '#4a3048']]); poly(0, 0, r.sz * 1.15, 7, .22, r.a); ctx.fill(); ink48(3); ctx.strokeStyle = 'rgba(255,154,60,.8)'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore(); }
  ctx.restore();
  // punhos
  for (let i = 0; i < 2; i++) {
    const [fx, fy] = this.fist(i), u = this.slamT[i], dropping = u > 0 && u <= .35, charging = u > .35;
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(Math.sin(t * 2 + i) * .15 + (dropping ? (i ? -.3 : .3) : 0));
    if (dropping) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = lava; ctx.globalAlpha = .6; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const k of [-30, 0, 30]) { ctx.beginPath(); ctx.moveTo(k, -90); ctx.lineTo(k, -20); ctx.stroke(); } ctx.restore(); ctx.globalAlpha = 1; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 100, lava, .25 + (charging ? .5 : 0) + (dropping ? .6 : 0)); ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = stone('#b898b6', '#2a1230'); poly(0, 0, 62, 10, .1, i * 2 + 1); ctx.fill(); ink48(5); ctx.strokeStyle = lava; ctx.lineWidth = 2; ctx.stroke();
    for (let k = -1; k <= 1; k++) { ctx.fillStyle = hit ? '#fff' : '#6a4a68'; ctx.beginPath(); ctx.roundRect(k * 20 - 8, 18, 16, 26, 7); ctx.fill(); ink48(2.4); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = lava; ctx.lineWidth = 3; ctx.globalAlpha = .7 + Math.sin(t * 6 + i) * .2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-30, -20); ctx.lineTo(-8, -6); ctx.lineTo(-18, 10); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  ctx.save(); ctx.translate(this.x, this.y); this.flashOverlay(120); ctx.restore();
};

// ================= OLHO DA TEMPESTADE: olho cibernetico com iris de laminas e capacitores =================
StormEye.prototype.draw = function () {
  const t = this.t, ph = this.phase, hit = this.flash > 0, p = G.player, chg = this.chargeT > 0 ? 1 - this.chargeT / this.chargeMax : 0;
  ctx.save(); ctx.translate(this.x, this.y);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 340, '#ff3d9a', .3 + Math.sin(t * 4) * .06); drawGlow(0, 0, 200, '#33c4ff', .22); const cols = ['#7a3dff', '#ff3d9a', '#33c4ff']; for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.35 + k * .12) * (k % 2 ? -1 : 1) + k * 2); drawGlow(150, 0, 130, cols[k], .34); drawGlow(-150, 0, 130, cols[k], .34); drawGlow(0, 150, 100, cols[k], .2); ctx.restore(); } ctx.restore(); ctx.globalAlpha = 1;
  // anel de metal segmentado com runas
  ctx.strokeStyle = '#1e0c3e'; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(0, 0, 116, 0, TAU); ctx.stroke(); ctx.strokeStyle = q48(-120, -120, 120, 120, [[0, '#7a52c8'], [1, '#2a1260']]); ctx.lineWidth = 20; ctx.beginPath(); ctx.arc(0, 0, 116, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(14,4,26,.8)'; ctx.lineWidth = 2.4; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 106, Math.sin(a) * 106); ctx.lineTo(Math.cos(a) * 126, Math.sin(a) * 126); ctx.stroke(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#9fe8ff'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .2; ctx.globalAlpha = .5 + .5 * Math.sin(t * 3 + i); ctx.beginPath(); ctx.arc(Math.cos(a) * 116, Math.sin(a) * 116, 3.4, 0, TAU); ctx.fill(); } ctx.restore();
  // capacitores girando com bobina
  const plates = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t * .6; plates.push([Math.cos(a) * 140, Math.sin(a) * 140]); ctx.save(); ctx.rotate(a); ctx.translate(0, -140); ctx.fillStyle = hit ? '#fff' : q48(0, -24, 0, 22, [[0, '#6a3ab8'], [1, '#1a0840']]); ctx.beginPath(); ctx.moveTo(-26, 14); ctx.lineTo(-18, -22); ctx.lineTo(18, -22); ctx.lineTo(26, 14); ctx.closePath(); ctx.fill(); ink48(3.4); ctx.strokeStyle = '#ff7ac8'; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = 'rgba(159,232,255,.7)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-12, -10 + k * 7); ctx.lineTo(12, -10 + k * 7); ctx.stroke(); } ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -2, 22, '#9fe8ff', .5 + Math.sin(t * 5 + i) * .3); ctx.restore(); ctx.globalAlpha = 1; ctx.restore(); }
  for (let k = 0; k < 1 + ph; k++) { const i = Math.floor(rand(0, 8)), j = (i + 1) % 8; if (Math.random() < .55) zap(plates[i][0], plates[i][1], plates[j][0], plates[j][1], 6, 9, '#9fe8ff', 2); }
  // globo ocular
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 104, 0, TAU); ctx.clip();
  ctx.fillStyle = r48(-24, -30, 10, 114, [[0, hit ? '#fff' : '#fff8fc'], [.6, hit ? '#fff' : '#ffc8e8'], [1, hit ? '#fdd' : '#a8369a']]); ctx.fillRect(-110, -110, 220, 220);
  ctx.strokeStyle = ph === 2 ? 'rgba(255,40,70,.85)' : 'rgba(220,60,120,.5)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + .4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 104, Math.sin(a) * 104); ctx.quadraticCurveTo(Math.cos(a + .4) * 74, Math.sin(a + .4) * 74, Math.cos(a + .15) * 48, Math.sin(a + .15) * 48); ctx.stroke(); }
  const dx = p ? clamp((p.x - this.x) / 400, -1, 1) * 28 : 0, dy = p ? clamp((p.y - this.y) / 500, -.4, 1) * 24 : 0;
  ctx.save(); ctx.translate(dx, dy);
  ctx.fillStyle = r48(0, 0, 6, 62, [[0, '#33c4ff'], [.5, ph === 2 ? '#ff3d6a' : '#ff7ac8'], [1, '#5a1060']]); ctx.beginPath(); ctx.arc(0, 0, 62, 0, TAU); ctx.fill(); ink48(3.4);
  // laminas de abertura da iris (como lente de camera)
  const ap = 30 + Math.sin(t * 3) * 3 + chg * 18; ctx.fillStyle = hit ? '#fff' : 'rgba(40,10,70,.55)'; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.6; for (let k = 0; k < 8; k++) { ctx.save(); ctx.rotate(k / 8 * TAU + t * .12); ctx.beginPath(); ctx.moveTo(ap, -6); ctx.lineTo(60, -22); ctx.lineTo(60, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; for (const r of [28, 44, 58]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
  const pw = 10 + Math.sin(t * 3) * 2 + chg * 16; ctx.fillStyle = '#12041f'; ctx.beginPath(); ctx.ellipse(0, 0, pw, 42 - chg * 6, 0, 0, TAU); ctx.fill();
  if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 24 + chg * 44, '#9fe8ff', chg * .7); drawGlow(0, 0, 14 + chg * 22, '#ffffff', chg * .5); ctx.restore(); ctx.globalAlpha = 1; }
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(-18, -22, 7.5, 0, TAU); ctx.fill(); ctx.restore();
  // palpebras metalicas com cilios de espinho: piscam, fecham ao levar dano, arregalam na furia
  const bl = (t % 4.4) < .18 ? 1 - Math.abs((t % 4.4) / .09 - 1) : 0; let lid = Math.max(bl, hit ? .55 : 0); if (ph === 2) lid *= .6;
  const ly = -104 + lid * 104, lb = 104 - lid * 104;
  ctx.fillStyle = q48(0, -110, 0, ly + 20, [[0, '#2a0f55'], [1, '#6a34b8']]); ctx.beginPath(); ctx.moveTo(-112, -112); ctx.lineTo(112, -112); ctx.lineTo(112, ly); ctx.quadraticCurveTo(0, ly + 34 + ph * 6, -112, ly); ctx.closePath(); ctx.fill();
  ctx.fillStyle = q48(0, 110, 0, lb - 20, [[0, '#2a0f55'], [1, '#6a34b8']]); ctx.beginPath(); ctx.moveTo(-112, 112); ctx.lineTo(112, 112); ctx.lineTo(112, lb); ctx.quadraticCurveTo(0, lb - 30, -112, lb); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#2a0a50'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 104, 0, TAU); ctx.stroke();
  if (Math.random() < .8) for (let i = 0; i < 2 + ph; i++) { const a = rand(0, TAU), b = a + rand(-.5, .5); zap(Math.cos(a) * 112, Math.sin(a) * 112, Math.cos(b) * rand(150, 190), Math.sin(b) * rand(150, 190), 6, 10, '#9fe8ff', 2); }
  if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(dx, dy + 30, 14 + chg * 34, '#ffffff', chg * .5); drawGlow(dx, dy + 30, 30 + chg * 60, '#ff7ac8', chg * .55); ctx.restore(); ctx.globalAlpha = 1; }
  this.flashOverlay(106); ctx.restore();
};

// ================= SOL-GUARDIAO: deus-sol com mascara de ouro, gemas e coroa de raios =================
SunGuardian.prototype.draw = function () {
  const t = this.t, ph = this.phase, hit = this.flash > 0, p = G.player, novaP = this.charge > 0 ? 1 - this.charge / 1.8 : 0, beamW = this.warn('beam', 1.1), sc = this.charge > 0 ? 1 - novaP * .1 : 1;
  ctx.save(); ctx.translate(this.x, this.y); ctx.scale(sc, sc);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 360 + novaP * 140, '#ff6a1a', .28 + novaP * .2); drawGlow(0, 0, 210, '#ffd36a', .16 + novaP * .3);
  for (let i = 0; i < 3; i++) { const k = (t * .4 + i / 3) % 1; ctx.globalAlpha = (1 - k) * .3; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 130 + k * 150, 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = .22; ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 2; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU + t * .15, l1 = 140, l2 = 230 + (i % 3) * 40 + Math.sin(t * 3 + i) * 12; ctx.beginPath(); ctx.moveTo(Math.cos(a) * l1, Math.sin(a) * l1); ctx.lineTo(Math.cos(a) * l2, Math.sin(a) * l2); ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha = 1;
  // corona de chamas (duas camadas)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let layer = 0; layer < 2; layer++) { const n = layer ? 28 : 18; for (let i = 0; i < n; i++) { const a = i / n * TAU + t * (layer ? -.35 : .5), l = (layer ? 128 : 160) + Math.sin(t * 4 + i * 1.7 + layer) * 24 + Math.sin(t * 9 + i) * 8 + (this.charge > 0 ? novaP * 40 : 0), w = layer ? .09 : .13; const g = ctx.createLinearGradient(Math.cos(a) * 100, Math.sin(a) * 100, Math.cos(a) * l, Math.sin(a) * l); g.addColorStop(0, layer ? 'rgba(255,240,170,.9)' : 'rgba(255,190,70,.9)'); g.addColorStop(1, 'rgba(255,60,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(Math.cos(a - w) * 100, Math.sin(a - w) * 100); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.lineTo(Math.cos(a + w) * 100, Math.sin(a + w) * 100); ctx.closePath(); ctx.fill(); } }
  ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { const a = t * .3 + k * 2.1, rr = 118, h = 40 + Math.sin(t * 2 + k) * 12; ctx.strokeStyle = 'rgba(255,170,60,.7)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, h, a + Math.PI * .6, a + Math.PI * 1.4); ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha = 1;
  // aneis de armadura: ouro com gemas (soltam-se na fase 3)
  if (!this.ringsOff) for (let i = 0; i < 2; i++) { ctx.save(); ctx.rotate(t * (i ? -.6 : .8)); ctx.scale(1, .28 + i * .1); ctx.strokeStyle = 'rgba(14,4,26,.85)'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 152, 0, TAU); ctx.stroke(); ctx.strokeStyle = hit ? '#fff' : q48(-150, 0, 150, 0, [[0, '#ffe9a8'], [.5, '#d9a04a'], [1, '#8a5a10']]); ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 152, 0, TAU); ctx.stroke(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.fillStyle = '#ff3a2a'; ctx.beginPath(); ctx.arc(Math.cos(a) * 152, Math.sin(a) * 152, 8, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(Math.cos(a) * 152 - 2, Math.sin(a) * 152 - 3, 2.6, 0, TAU); ctx.fill(); } ctx.restore(); }
  // esfera solar
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 118, 0, TAU); ctx.clip();
  ctx.fillStyle = r48(-30, -35, 10, 126, [[0, hit ? '#fff' : '#fff6d0'], [.35, hit ? '#fff4e0' : '#ffc848'], [.8, hit ? '#fdd' : '#ff7a1f'], [1, hit ? '#fcc' : '#b81a10']]); ctx.fillRect(-124, -124, 248, 248);
  for (const sp of this.spots) { const a = sp.a + t * .25 * sp.s, x = Math.cos(a) * sp.r, y = Math.sin(a) * sp.r * .9; ctx.fillStyle = 'rgba(190,50,10,.35)'; ctx.beginPath(); ctx.arc(x, y, sp.sz, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,240,170,.35)'; ctx.beginPath(); ctx.arc(x + 6, y - 6, sp.sz * .55, 0, TAU); ctx.fill(); }
  if (ph === 2) { ctx.fillStyle = r48(0, 0, 10, 120, [[0, 'rgba(255,255,255,.7)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(-124, -124, 248, 248); }
  ctx.restore(); ctx.strokeStyle = 'rgba(120,20,6,.7)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 118, 0, TAU); ctx.stroke();
  // canhoes laterais
  for (const s of [-1, 1]) { ctx.fillStyle = q48(s * 138, -20, s * 178, 40, [[0, '#f0c068'], [1, '#6a3a0a']]); ctx.beginPath(); ctx.roundRect(s * 150 - 19, 4, 38, 56, 10); ctx.fill(); ink48(3.4); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 1.8; ctx.stroke(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 150, 60, 12 + this.muzzle / .14 * 30, this.muzzle > 0 ? '#ffffff' : '#ffb340', .8); ctx.restore(); ctx.globalAlpha = 1; }
  // mascara de ouro com coroa de espinhos e gemas
  ctx.fillStyle = hit ? '#fff' : q48(0, -100, 0, 50, [[0, '#ffe9a8'], [.5, '#d9a04a'], [1, '#6a3a0a']]);
  for (const k of [-2, -1, 0, 1, 2]) { ctx.beginPath(); ctx.moveTo(k * 32 - 13, -52); ctx.lineTo(k * 36, -90 - (2 - Math.abs(k)) * 14 - (k === 0 ? 8 : 0)); ctx.lineTo(k * 32 + 13, -52); ctx.closePath(); ctx.fill(); ink48(3); }
  ctx.fillStyle = '#3a0f20'; ctx.beginPath(); ctx.moveTo(-76, -22); ctx.lineTo(0, -40); ctx.lineTo(76, -22); ctx.lineTo(60, 28); ctx.lineTo(0, 46); ctx.lineTo(-60, 28); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#e8b858'; ctx.lineWidth = 6; ctx.stroke(); ink48(2);
  ctx.fillStyle = hit ? '#fff' : '#d9a04a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 10, -36); ctx.lineTo(s * 64, -22 + ph * 4); ctx.lineTo(s * 62, -10 + ph * 4); ctx.lineTo(s * 10, -22); ctx.closePath(); ctx.fill(); ink48(2.4); }
  ctx.fillStyle = '#ff3a2a'; ctx.beginPath(); ctx.arc(0, -52, 7, 0, TAU); ctx.fill(); ink48(2.4); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -52, 22, '#ff6a4a', .8); ctx.restore();
  const ex = p ? clamp((p.x - this.x) / 300, -1, 1) * 5 : 0, ey = p ? clamp((p.y - this.y) / 400, -.3, 1) * 4 : 0, eyeC = ph === 2 ? '#ff4a2a' : '#ffe9a8', big = 1 + beamW * .5 + novaP * .6;
  for (const s of [-1, 1]) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * 30 + ex, ey, 28 * big, eyeC, .8 + beamW * .4); ctx.restore(); ctx.globalAlpha = 1; ctx.fillStyle = eyeC; ctx.beginPath(); ctx.ellipse(s * 30 + ex, ey, 15 * big, 8.5 * big, s * .15, 0, TAU); ctx.fill(); ctx.fillStyle = '#3a0f20'; ctx.beginPath(); ctx.ellipse(s * 30 + ex * 1.7, ey * 1.4, 3.4, 6, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#d9a04a'; ctx.beginPath(); ctx.moveTo(-14, 24); ctx.lineTo(0, 38); ctx.lineTo(14, 24); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill(); ink48(2);
  this.flashOverlay(122); ctx.restore();
};
