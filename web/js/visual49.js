'use strict';
// ---------- 49: O Vazio e o Coracao do Outro Lado redesenhados do zero (a cena de colapso/nova e os tres atos foram mantidos) ----------
const u49 = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
const v49 = (x, y, r0, r1, st) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
const ink49 = (w = 4, a = .85) => { ctx.strokeStyle = 'rgba(8,0,18,' + a + ')'; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };

// ================= O VAZIO: olho-buraco-negro com disco de acrecao, tentaculos com ventosas e coroa de espinhos =================
VoidBoss.prototype.draw = function () {
  const t = this.t, ph = this.phase, hit = this.flash > 0, chg = this.chargeT > 0 ? 1 - this.chargeT / this.chargeMax : 0, cl = this.collapse || 0, p = G.player;
  ctx.save(); ctx.translate(this.x, this.y);
  if (this.nova) { const k = clamp((this.dyingT - 4.2) / 1.4, 0, 1); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 300 + k * 700, '#ffffff', (1 - k) * .9); drawGlow(0, 0, 200 + k * 400, '#ffe9a8', (1 - k) * .7); ctx.restore(); return; }
  if (cl > 0) { const sc = 1 - cl * .5; ctx.scale(sc, sc); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 260 + cl * 520, '#ffffff', cl * .6); drawGlow(0, 0, 160 + cl * 260, '#ffe9a8', cl * .5); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 400, '#7a2ad6', .3 + Math.sin(t * 2) * .05); drawGlow(0, 0, 210, '#c04aff', .22 + ph * .06); ctx.restore(); ctx.globalAlpha = 1;
  // disco de acrecao inclinado (atras)
  ctx.save(); ctx.rotate(-.18); for (let k = 0; k < 4; k++) { const R = 150 + k * 22, ry = 38 + k * 8; ctx.strokeStyle = ['rgba(255,233,168,.55)', 'rgba(255,150,230,.45)', 'rgba(170,100,255,.45)', 'rgba(110,60,220,.4)'][k]; ctx.lineWidth = 7 - k; ctx.setLineDash([46 - k * 6, 14 + k * 4]); ctx.lineDashOffset = -t * (60 + k * 24); ctx.beginPath(); ctx.ellipse(0, 0, R, ry, 0, Math.PI, TAU); ctx.stroke(); } ctx.setLineDash([]); ctx.restore();
  // tentaculos conicos com contorno, veia luminosa e ventosas
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + t * .12, pts = []; for (let k = 0; k <= 14; k++) { const ang = a + Math.sin(t * 1.3 + i + k * .35) * .3 * (k / 14) + k * .04 * (i % 2 ? 1 : -1), r = 100 + k * (20 + ph * 2); pts.push([Math.cos(ang) * r, Math.sin(ang) * r * .9]); }
    ctx.strokeStyle = 'rgba(6,0,14,.95)'; for (let k = 0; k < 14; k += 2) { const w = Math.max(3, 24 - (k + 1) * 1.5); ctx.lineWidth = w * 1.1 + 6; ctx.beginPath(); ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); ctx.lineTo(pts[k + 2][0], pts[k + 2][1]); ctx.stroke(); }
    for (let k = 0; k < 14; k += 2) { const w = Math.max(2, 24 - (k + 1) * 1.5); ctx.strokeStyle = (k >> 1) % 2 ? '#20104a' : '#2a1560'; ctx.lineWidth = w * 1.1; ctx.beginPath(); ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); ctx.lineTo(pts[k + 2][0], pts[k + 2][1]); ctx.stroke(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = hit ? '#ffffff' : 'rgba(192,74,255,.8)'; ctx.lineWidth = 2.4; ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); for (let k = 2; k < 14; k += 3) { ctx.fillStyle = 'rgba(232,208,255,.7)'; ctx.beginPath(); ctx.arc(pts[k][0], pts[k][1], Math.max(1.6, 4 - k * .2), 0, TAU); ctx.fill(); } const e = pts[14]; drawGlow(e[0], e[1], 16, '#c04aff', .8); ctx.restore();
  }
  // coroa de espinhos girando
  ctx.save(); ctx.rotate(t * .1); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, r0 = 120, r1 = 152 + (i % 3) * 20 + Math.sin(t * 2 + i) * 5; ctx.fillStyle = hit ? '#fff' : '#12082c'; ctx.beginPath(); ctx.moveTo(Math.cos(a - .1) * r0, Math.sin(a - .1) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a + .1) * r0, Math.sin(a + .1) * r0); ctx.closePath(); ctx.fill(); ink49(2.6, .9); ctx.strokeStyle = 'rgba(192,74,255,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(Math.cos(a - .1) * r0, Math.sin(a - .1) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); } ctx.restore();
  // corpo: disco negro com anel de luz e rachaduras
  ctx.fillStyle = hit ? '#4a2a80' : v49(-30, -34, 6, 122, [[0, '#2a1458'], [.5, '#0a0420'], [1, '#02000a']]); ctx.beginPath(); ctx.arc(0, 0, 118, 0, TAU); ctx.fill();
  ctx.strokeStyle = u49(-118, -118, 118, 118, [[0, '#ffe9a8'], [.5, '#c04aff'], [1, '#5a2ad6']]); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 118, 0, TAU); ctx.stroke(); ink49(2, .6);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(192,74,255,.55)'; ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + .4, r0 = 84, r1 = 116; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a + .1) * (r0 + r1) / 2, Math.sin(a + .1) * (r0 + r1) / 2); ctx.lineTo(Math.cos(a - .05) * r1, Math.sin(a - .05) * r1); ctx.stroke(); } ctx.restore();
  // olhos menores (surgem nas fases seguintes e seguem a nave)
  const lk = p ? Math.atan2(p.y - this.y, p.x - this.x) : Math.PI / 2;
  if (ph >= 1) for (const [ex, ey, er] of (ph >= 2 ? [[-82, -40, 15], [82, -40, 15], [-62, 52, 12], [62, 52, 12]] : [[-82, -40, 15], [82, -40, 15]])) { ctx.fillStyle = '#f0e0ff'; ctx.beginPath(); ctx.ellipse(ex, ey, er, er * 1.1, 0, 0, TAU); ctx.fill(); ink49(2.2); ctx.fillStyle = '#c04aff'; ctx.beginPath(); ctx.arc(ex + Math.cos(lk) * er * .4, ey + Math.sin(lk) * er * .4, er * .55, 0, TAU); ctx.fill(); ctx.fillStyle = '#02000a'; ctx.beginPath(); ctx.ellipse(ex + Math.cos(lk) * er * .5, ey + Math.sin(lk) * er * .5, er * .2, er * .45, 0, 0, TAU); ctx.fill(); }
  // olho principal em forma de gema: abre mais a cada fase
  const open = [.25, .6, 1][ph] * (1 - ((t % 5) < .14 ? .8 : 0)) * (1 - cl * .9), dx = p ? clamp((p.x - this.x) / 400, -1, 1) * 22 : 0, dy = p ? clamp((p.y - this.y) / 500, -.3, 1) * 14 : 0, H2 = 58 * open + 3;
  const eyePath = () => { ctx.beginPath(); ctx.moveTo(-84, 0); ctx.quadraticCurveTo(-40, -H2 * 1.1, 0, -H2); ctx.quadraticCurveTo(40, -H2 * 1.1, 84, 0); ctx.quadraticCurveTo(40, H2 * 1.1, 0, H2); ctx.quadraticCurveTo(-40, H2 * 1.1, -84, 0); ctx.closePath(); };
  ctx.save(); eyePath(); ctx.clip(); ctx.fillStyle = v49(dx, dy, 4, 64, [[0, '#fff3c0'], [.35, '#c04aff'], [1, '#3a0a70']]); ctx.fillRect(-90, -70, 180, 140);
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.6; for (let k = 0; k < 24; k++) { const a = k / 24 * TAU + t * .1; ctx.beginPath(); ctx.moveTo(dx + Math.cos(a) * 14, dy + Math.sin(a) * 14); ctx.lineTo(dx + Math.cos(a) * 60, dy + Math.sin(a) * 60); ctx.stroke(); }
  ctx.fillStyle = '#02000a'; ctx.beginPath(); ctx.ellipse(dx, dy, 9 + chg * 10, 52, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(dx - 16, dy - 18, 6, 0, TAU); ctx.fill(); ctx.restore();
  eyePath(); ink49(5, .9); ctx.strokeStyle = '#d890ff'; ctx.lineWidth = 2.4; ctx.stroke();
  if (chg > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(dx, dy, 30 + chg * 70, '#ffffff', chg * .5); drawGlow(dx, dy, 60 + chg * 90, '#c04aff', chg * .5); ctx.restore(); }
  this.flashOverlay(118); ctx.restore();
};

// ================= CORACAO DO OUTRO LADO: coracao de cristal em gaiola de ouro, com veias, valvulas e um olho; cada ato muda o enfeite =================
Heart.prototype.draw = function () {
  const t = this.t, act = this.phase, hit = this.flash > 0, c = ACT_COL[act], beat = this.beatAt ? Math.max(0, 1 - (t - this.beatAt) * 3) : 0, s = 92 * (1 + beat * .08 + Math.max(0, Math.sin(t * (3 + act))) ** 3 * .04), p = G.player;
  ctx.save(); ctx.translate(this.x, this.y);
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 310, c, .18 + beat * .2); drawGlow(0, 0, 150, '#ffffff', .08); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // enfeite do ato: asas de luz (1), ondas e bolhas (2), cacos de espelho (3)
  if (act === 0) for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { ctx.save(); ctx.scale(sd, 1); ctx.rotate(.5 + i * .22 + Math.sin(t * 1.6 + i) * .05); const L = 210 - i * 14; ctx.fillStyle = u49(30, 0, 30, -L, [[0, 'rgba(255,255,255,.95)'], [1, 'rgba(255,211,106,0)']]); ctx.beginPath(); ctx.moveTo(34, 0); ctx.quadraticCurveTo(54, -L * .45, 40, -L); ctx.quadraticCurveTo(22, -L * .45, 34, 0); ctx.fill(); ctx.restore(); }
  else if (act === 1) { ctx.save(); ctx.strokeStyle = 'rgba(150,235,255,.55)'; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { ctx.beginPath(); for (let x = -230; x <= 230; x += 12) { const y = 70 + k * 22 + Math.sin(x * .03 + t * 2 + k) * 8; x === -230 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); } ctx.fillStyle = 'rgba(190,245,255,.55)'; for (let i = 0; i < 10; i++) { const k = (t * .3 + i / 10) % 1; ctx.beginPath(); ctx.arc(Math.sin(i * 7) * 160, 120 - k * 260, 4 + (i % 3) * 2, 0, TAU); ctx.fill(); } ctx.restore(); }
  else for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + t * .25, R = 160 + (i % 3) * 22 + Math.sin(t + i) * 6; ctx.save(); ctx.translate(Math.cos(a) * R, Math.sin(a) * R * .72); ctx.rotate(a * 2 + t); ctx.fillStyle = 'rgba(235,225,255,.8)'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(10, 8); ctx.lineTo(-8, 12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // fragmentos dos tres atos orbitando
  for (let k = 0; k <= act; k++) for (let i = 0; i < 6; i++) { const a = t * (.5 + k * .15) * (k % 2 ? -1 : 1) + i / 6 * TAU, d = 150 + k * 32 + Math.sin(t * 2 + i) * 8; ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d * .62); ctx.rotate(a * 2); ctx.fillStyle = ACT_COL[k]; ctx.globalAlpha = .92; if (k === 0) { ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(8, 0); ctx.lineTo(0, 13); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill(); ink49(2, .7); } else if (k === 1) { ctx.strokeStyle = ACT_COL[1]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(150,235,255,.3)'; ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-3, 9); ctx.lineTo(-10, -2); ctx.lineTo(-2, -9); ctx.closePath(); ctx.fill(); ink49(2, .7); } ctx.restore(); }
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.3 + k * .12) * (k % 2 ? -1 : 1)); ctx.strokeStyle = ACT_COL[k]; ctx.globalAlpha = .6; ctx.lineWidth = 3 + k; ctx.setLineDash([24, 14]); ctx.beginPath(); ctx.ellipse(0, 0, 120 + k * 22, 78 + k * 12, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
  ctx.globalAlpha = 1; ctx.setLineDash([]);
  // gaiola de ouro: costelas curvas atras
  ctx.save(); ctx.strokeStyle = 'rgba(8,0,18,.85)'; ctx.lineWidth = 12; for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sd * s * .3, -s * .55); ctx.quadraticCurveTo(sd * (s * 1.5 + i * 12), -s * .3 + i * 14, sd * (s * .9 + i * 8), s * (.55 + i * .15)); ctx.stroke(); } ctx.strokeStyle = u49(-s, 0, s, 0, [[0, '#ffe9a8'], [.5, '#d9a04a'], [1, '#8a5a10']]); ctx.lineWidth = 7; for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sd * s * .3, -s * .55); ctx.quadraticCurveTo(sd * (s * 1.5 + i * 12), -s * .3 + i * 14, sd * (s * .9 + i * 8), s * (.55 + i * .15)); ctx.stroke(); } ctx.restore();
  // coracao de cristal
  const path = () => { ctx.beginPath(); ctx.moveTo(0, s * .95); ctx.bezierCurveTo(-s * 1.55, s * .1, -s * 1.15, -s * 1.05, 0, -s * .45); ctx.bezierCurveTo(s * 1.15, -s * 1.05, s * 1.55, s * .1, 0, s * .95); ctx.closePath(); };
  ctx.fillStyle = hit ? '#fff' : v49(-s * .3, -s * .4, 6, s * 1.55, [[0, '#ffffff'], [.3, '#fff0d0'], [.65, c], [1, '#6a2a7a']]); path(); ctx.fill(); ink49(8, .9); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.save(); path(); ctx.clip();
  // facetas de cristal
  ctx.strokeStyle = 'rgba(80,30,110,.5)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-s * 1.2, -s * .1); ctx.lineTo(-s * .3, -s * .55); ctx.lineTo(0, s * .05); ctx.lineTo(s * .3, -s * .55); ctx.lineTo(s * 1.2, -s * .1); ctx.moveTo(0, s * .05); ctx.lineTo(-s * .5, s * .5); ctx.lineTo(0, s * .95); ctx.moveTo(0, s * .05); ctx.lineTo(s * .5, s * .5); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.moveTo(-s * 1.1, -s * .15); ctx.lineTo(-s * .3, -s * .5); ctx.lineTo(-s * .1, -s * .1); ctx.closePath(); ctx.fill();
  // veias que pulsam
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c; ctx.lineWidth = 2.6; ctx.globalAlpha = .5 + beat * .5; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * s * .15, -s * .4); ctx.quadraticCurveTo(sd * s * .9, -s * .5, sd * s * 1.0, s * .05); ctx.moveTo(sd * s * .1, s * .5); ctx.quadraticCurveTo(sd * s * .6, s * .4, sd * s * .8, -s * .05); ctx.stroke(); } ctx.restore();
  ctx.restore();
  // olho no centro: palpebras em forma de valvula, iris por ato, segue a nave
  const lx = p ? clamp((p.x - this.x) / 300, -1, 1) * 11 : 0, ly = p ? clamp((p.y - this.y) / 400, -.3, 1) * 7 : 0, ey = s * .08;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-s * .42, ey); ctx.quadraticCurveTo(0, ey - s * .34, s * .42, ey); ctx.quadraticCurveTo(0, ey + s * .34, -s * .42, ey); ctx.closePath(); ctx.fill(); ink49(5, .85);
  ctx.save(); ctx.clip(); ctx.fillStyle = v49(lx, ey + ly, 2, s * .2, [[0, '#fff'], [.4, act === 0 ? '#e8a020' : act === 1 ? '#1a8ad8' : '#9a4aff'], [1, '#2a1050']]); ctx.beginPath(); ctx.arc(lx, ey + ly, s * .18, 0, TAU); ctx.fill(); ctx.fillStyle = '#10062a'; ctx.beginPath(); ctx.ellipse(lx, ey + ly, s * .05, s * .13, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(lx - s * .07, ey + ly - s * .07, s * .04, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#d9a04a'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * s * .36, ey - s * .08); ctx.lineTo(sd * s * .58, ey - s * .22); ctx.lineTo(sd * s * .5, ey + s * .02); ctx.closePath(); ctx.fill(); ink49(2.4, .8); }
  // coroa de pontas de luz no topo
  ctx.fillStyle = hit ? '#fff' : u49(0, -s * 1.4, 0, -s * .5, [[0, '#ffffff'], [1, c]]); for (let i = -2; i <= 2; i++) { const bx = i * s * .24, by = -s * (.62 - Math.abs(i) * .06); ctx.beginPath(); ctx.moveTo(bx - 8, by); ctx.lineTo(bx, by - 26 - (2 - Math.abs(i)) * 10 - Math.sin(t * 3 + i) * 3); ctx.lineTo(bx + 8, by); ctx.closePath(); ctx.fill(); ink49(2.4, .8); }
  if (this.chargeT > 0) { const ch = 1 - this.chargeT / this.chargeMax; ctx.globalCompositeOperation = 'lighter'; drawGlow(0, s * .1, 50 + ch * 90, '#ffffff', ch * .7); }
  this.flashOverlay(s * 1.3, s); ctx.restore();
};
