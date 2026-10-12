'use strict';
// ---------- 44: arte nova dos inimigos (desenhados do zero, mesma linguagem visual: luz e sombra em 3 tons, brilho de borda, olhos expressivos) ----------
// Cada corpo e desenhado no centro (0,0) depois que o jogo ja aplicou posicao, "pop" de entrada e brilho. Os avisos de ataque (carregar, mirar, fechar) foram mantidos.
const Visual44 = { bodies: {}, base: ['drone', 'zig', 'kami', 'shield', 'healer', 'captain', 'shooter', 'tank', 'mine', 'bit'] };
const V44 = Visual44;
V44.lg = (x0, y0, x1, y1, st) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
V44.rg = (x, y, r0, r1, st) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of st) g.addColorStop(o, c); return g; };
V44.look = e => { const p = G.player; if (!p) return [0, 1]; const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
// olho com esclera, iris que segue o jogador, brilho e piscada
V44.eye = function (x, y, r, e, iris, hit) {
  const [lx, ly] = V44.look(e), tt = World.t + (e.ph || 0), bl = Math.pow(Math.max(0, Math.sin(tt * .9 + (e.ph || 0))), 40), open = 1 - bl * .9;
  ctx.save(); ctx.translate(x, y); ctx.scale(1, open); ctx.fillStyle = hit ? '#fff' : '#fdfbff'; ctx.strokeStyle = 'rgba(20,6,40,.65)'; ctx.lineWidth = Math.max(1.5, r * .16); ctx.beginPath(); ctx.ellipse(0, 0, r, r * 1.12, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = hit ? '#ff3a3a' : iris; ctx.beginPath(); ctx.arc(lx * r * .32, ly * r * .34, r * .62, 0, TAU); ctx.fill(); ctx.fillStyle = '#0a0414'; ctx.beginPath(); ctx.arc(lx * r * .42, ly * r * .44, r * .3, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(lx * r * .32 - r * .2, ly * r * .34 - r * .22, r * .16, 0, TAU); ctx.fill(); ctx.restore();
};
V44.rim = (r, a0 = Math.PI * 1.1, a1 = Math.PI * 1.75) => { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = Math.max(2, r * .09); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, r * .86, a0, a1); ctx.stroke(); ctx.restore(); };
V44.ol = (w = 3) => { ctx.strokeStyle = 'rgba(18,5,34,.7)'; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.stroke(); };
V44.glowAt = (x, y, r, c, a) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, r, c, a); ctx.restore(); };
V44.poly = (pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
const B = V44.bodies, T = () => World.t;

// ----- base -----
B.drone = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.rotate(Math.sin(t * 3) * .12);
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * r * .5, -r * .25); ctx.rotate(sd * (.55 + Math.sin(t * 32) * .35)); ctx.fillStyle = 'rgba(235,248,255,.5)'; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(sd * r * .5, 0, r * .85, r * .34, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sd * r * 1.2, 0); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#ffe9a0'], [.5, '#ff9a2a'], [1, '#9a4208']]); ctx.beginPath(); ctx.ellipse(0, r * .05, r * .82, r * 1.02, 0, 0, TAU); ctx.fill(); V44.ol();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, r * .05, r * .82, r * 1.02, 0, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(58,18,4,.5)'; for (const y of [.12, .45, .78]) { ctx.beginPath(); ctx.ellipse(0, r * y, r, r * .12, 0, 0, TAU); ctx.fill(); } ctx.restore();
  ctx.fillStyle = hit ? '#fff' : '#2a1040'; ctx.beginPath(); ctx.moveTo(-r * .16, r * .95); ctx.lineTo(0, r * 1.5); ctx.lineTo(r * .16, r * .95); ctx.fill();
  ctx.fillStyle = '#1a0a30'; ctx.beginPath(); ctx.ellipse(0, -r * .4, r * .58, r * .36, 0, 0, TAU); ctx.fill(); V44.eye(0, -r * .4, r * .22, e, '#ff9a2a', hit);
  ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * r * .22, -r * .85); ctx.quadraticCurveTo(sd * r * .55, -r * 1.25, sd * r * .75, -r * 1.12 + Math.sin(t * 4) * 2); ctx.stroke(); V44.glowAt(sd * r * .75, -r * 1.12, 9, '#ffd36a', .9); }
  V44.rim(r);
};
B.zig = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.rotate(Math.sin(t * 5) * .28);
  for (const sd of [-1, 1]) { ctx.fillStyle = hit ? '#fff' : V44.lg(0, 0, sd * r * 1.3, r, [[0, '#4a8cff'], [1, '#0e2a7a']]); V44.poly([[sd * r * .3, -r * .3], [sd * r * 1.3, r * .7], [sd * r * .85, r * .85], [sd * r * .3, r * .35]]); ctx.fill(); V44.ol(2.4); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r * 1.4, 0, r, [[0, '#e8fbff'], [.5, '#5aa8ff'], [1, '#1a3aa0']]); V44.poly([[0, -r * 1.45], [r * .5, -r * .2], [r * .38, r * .95], [0, r * .6], [-r * .38, r * .95], [-r * .5, -r * .2]]); ctx.fill(); V44.ol();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -r * 1.4); ctx.lineTo(0, r * .55); ctx.stroke();
  ctx.fillStyle = '#0c1a46'; ctx.beginPath(); ctx.ellipse(0, -r * .35, r * .3, r * .38, 0, 0, TAU); ctx.fill(); V44.eye(0, -r * .35, r * .17, e, '#33e0ff', hit);
  for (const sd of [-1, 1]) V44.glowAt(sd * r * .22, r * .95, 12 + Math.sin(t * 30) * 3, '#7fe0ff', .9);
};
B.kami = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.save(); ctx.rotate(t * 1.2); ctx.fillStyle = hit ? '#fff' : '#ff4a6e'; for (let i = 0; i < 10; i++) { ctx.save(); ctx.rotate(i * TAU / 10); ctx.beginPath(); ctx.moveTo(-r * .26, -r * .8); ctx.lineTo(0, -r * (1.42 + (i % 2) * .14)); ctx.lineTo(r * .26, -r * .8); ctx.fill(); V44.ol(2); ctx.restore(); } ctx.restore();
  ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .3, -r * .3, 2, r, [[0, '#ffb0bc'], [.5, '#e8244f'], [1, '#4a0818']]); ctx.beginPath(); ctx.arc(0, 0, r * .92, 0, TAU); ctx.fill(); V44.ol(3.2);
  ctx.strokeStyle = 'rgba(255,200,90,' + (.5 + .4 * Math.sin(t * 9)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * .5, r * .1); ctx.lineTo(-r * .2, r * .4); ctx.lineTo(0, r * .2); ctx.lineTo(r * .3, r * .55); ctx.stroke();
  ctx.fillStyle = '#1a0510'; ctx.beginPath(); ctx.ellipse(0, -r * .08, r * .62, r * .3, 0, 0, TAU); ctx.fill(); for (const sd of [-1, 1]) { ctx.fillStyle = '#ffe04a'; ctx.beginPath(); ctx.ellipse(sd * r * .27, -r * .06, r * .13, r * .17, sd * .3, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#1a0510'; ctx.lineWidth = r * .16; ctx.lineCap = 'round'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * r * .62, -r * .42); ctx.lineTo(sd * r * .08, -r * .2); ctx.stroke(); }
  ctx.strokeStyle = '#6a3a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -r * .92); ctx.quadraticCurveTo(r * .3, -r * 1.25, r * .1, -r * 1.5); ctx.stroke(); V44.glowAt(r * .1, -r * 1.5, 12 + Math.random() * 6, '#ffd36a', 1);
  V44.rim(r);
};
B.shooter = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#ffa0d6'], [.5, '#d81b7a'], [1, '#4a0a30']]); V44.poly(Array.from({ length: 6 }, (_, i) => [Math.cos(i / 6 * TAU + .5236) * r * 1.02, Math.sin(i / 6 * TAU + .5236) * r * 1.02])); ctx.fill(); V44.ol(3.2);
  ctx.fillStyle = 'rgba(30,6,30,.55)'; V44.poly(Array.from({ length: 6 }, (_, i) => [Math.cos(i / 6 * TAU + .5236) * r * .66, Math.sin(i / 6 * TAU + .5236) * r * .66])); ctx.fill();
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.fillStyle = 'rgba(255,120,200,' + (.45 + .35 * Math.sin(t * 6 + k)) + ')'; ctx.fillRect(sd * r * .78 - 3, -r * .3 + k * r * .3, 6, r * .16); }
  ctx.fillStyle = '#14041c'; ctx.beginPath(); ctx.ellipse(0, -r * .05, r * .5, r * .42, 0, 0, TAU); ctx.fill(); V44.eye(0, -r * .05, r * .3, e, '#ff4aa0', hit);
  ctx.strokeStyle = '#ffb3dc'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -r * .98); ctx.lineTo(0, -r * 1.3); ctx.stroke(); V44.glowAt(0, -r * 1.3, 8, '#ff4aa0', .9); V44.rim(r);
};
B.tank = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r, 0, r, [[0, '#c8946a'], [.5, '#8a5a30'], [1, '#3a200e']]); V44.poly([[-r * .8, -r * .75], [r * .8, -r * .75], [r * 1.05, r * .2], [r * .85, r * .8], [-r * .85, r * .8], [-r * 1.05, r * .2]]); ctx.fill(); V44.ol(3.5);
  for (const sd of [-1, 1]) { ctx.fillStyle = hit ? '#fff' : '#2a1608'; ctx.beginPath(); ctx.roundRect(sd * r * 1.0 - 8, -r * .6, 16, r * 1.4, 7); ctx.fill(); V44.ol(2); }
  ctx.fillStyle = 'rgba(255,230,180,.3)'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * r * .3, -r * .62, 2.4, 0, TAU); ctx.fill(); }
  ctx.fillStyle = hit ? '#fff' : '#4a2c14'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.roundRect(sd * r * .38 - 6, r * .55, 12, r * .5, 4); ctx.fill(); V44.ol(2); V44.glowAt(sd * r * .38, r * 1.05, 9, '#ff8a1f', .55 + .3 * Math.sin(t * 6)); }
  ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .15, -r * .2, 2, r * .6, [[0, '#a8683a'], [1, '#4a2810']]); ctx.beginPath(); ctx.arc(0, -r * .05, r * .52, 0, TAU); ctx.fill(); V44.ol(3); ctx.fillStyle = '#1a0a04'; ctx.beginPath(); ctx.ellipse(0, -r * .05, r * .34, r * .22, 0, 0, TAU); ctx.fill(); V44.eye(0, -r * .05, r * .15, e, '#ff4a2a', hit);
};
B.mine = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .3, -r * .3, 2, r, [[0, '#8a8aa8'], [.55, '#2a2a44'], [1, '#08080e']]); ctx.beginPath(); ctx.arc(0, 0, r * .95, 0, TAU); ctx.fill(); V44.ol(3);
  ctx.strokeStyle = 'rgba(180,180,220,.28)'; ctx.lineWidth = 1.4; for (const k of [-.5, 0, .5]) { ctx.beginPath(); ctx.ellipse(0, 0, r * .95, r * .95 * Math.abs(k || .001) * 1.6, 0, 0, TAU); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, -r * .95); ctx.lineTo(0, r * .95); ctx.stroke();
  const pu = .5 + .5 * Math.sin(t * (e.fuse > 0 ? 24 : 5)); V44.glowAt(0, 0, r * (.9 + pu * .5), '#ff3a3a', .6 + pu * .35); ctx.fillStyle = hit ? '#fff' : '#ff6a5a'; ctx.beginPath(); ctx.arc(0, 0, r * .26, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r * .06, -r * .08, r * .08, 0, TAU); ctx.fill();
};
B.bit = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.rotate(t * 2); ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#e8ffff'], [.5, '#33e0ff'], [1, '#0a4a8a']]); V44.poly([[0, -r * 1.2], [r * .9, 0], [0, r * 1.2], [-r * .9, 0]]); ctx.fill(); V44.ol(2.4);
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0, -r * 1.2); ctx.lineTo(0, r * 1.2); ctx.moveTo(-r * .9, 0); ctx.lineTo(r * .9, 0); ctx.stroke(); V44.glowAt(0, 0, r * 1.1, '#9fe8ff', .7);
};
B.shield = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .3, -r * .3, 2, r, [[0, '#d8f6ff'], [.5, '#3a8cff'], [1, '#0e2a6a']]); ctx.beginPath(); ctx.arc(0, 0, r * .86, 0, TAU); ctx.fill(); V44.ol(3);
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .5, Math.sin(a) * r * .5); ctx.lineTo(Math.cos(a) * r * .84, Math.sin(a) * r * .84); ctx.stroke(); }
  ctx.fillStyle = '#0a1a46'; ctx.beginPath(); ctx.ellipse(0, -r * .05, r * .48, r * .4, 0, 0, TAU); ctx.fill(); V44.eye(0, -r * .05, r * .28, e, '#33e0ff', hit); V44.rim(r);
  if (e.shield > 0) { const k = e.shield / (e.maxShield || 1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const a0 = .2 + i * (Math.PI - .4) / 7; ctx.strokeStyle = '#7fe0ff'; ctx.globalAlpha = (.35 + k * .55 + Math.sin(t * 8 + i) * .1); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, r * 1.5, a0, a0 + (Math.PI - .4) / 7 - .06); ctx.stroke(); } ctx.globalAlpha = .18 * k; ctx.fillStyle = '#7fe0ff'; ctx.beginPath(); ctx.arc(0, 0, r * 1.5, .2, Math.PI - .2); ctx.lineTo(0, 0); ctx.fill(); ctx.restore(); }
};
B.healer = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7fffa0'; ctx.globalAlpha = .4 + Math.sin(t * 3) * .2; ctx.lineWidth = 3; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(0, 0, r * 1.5 + Math.sin(t * 2) * 3, 0, TAU); ctx.stroke(); ctx.restore();
  ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .3, -r * .35, 2, r, [[0, '#f4fff6'], [.5, '#7fe8a8'], [1, '#1a8a4a']]); ctx.beginPath(); ctx.arc(0, 0, r * .95, 0, TAU); ctx.fill(); V44.ol(3);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1f9a58'; ctx.lineWidth = 2.4; const cr = r * .26; ctx.beginPath(); ctx.roundRect(-cr * .38, -r * .86, cr * .76, cr * 1.9, 3); ctx.roundRect(-cr, -r * .86 + cr * .56, cr * 2, cr * .76, 3); ctx.fill(); ctx.stroke();
  V44.eye(-r * .3, r * .18, r * .2, e, '#1f9a58', hit); V44.eye(r * .3, r * .18, r * .2, e, '#1f9a58', hit); V44.rim(r);
  for (let i = 0; i < 2; i++) { const a = t * 1.6 + i * Math.PI; V44.glowAt(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5, 10, '#aaffcc', .9); }
};
B.captain = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0), c = (typeof e.glow === 'string' && e.glow[0] === '#' && e.glow.length === 7) ? e.glow : '#ff5a3c'; ctx.rotate(Math.sin(t * 1.2) * .03);
  for (const sd of [-1, 1]) { ctx.fillStyle = hit ? '#fff' : V44.lg(sd * r * .5, 0, sd * r * 1.2, 0, [[0, '#3a1858'], [1, '#14062a']]); ctx.beginPath(); ctx.roundRect(sd * r * .86 - r * .26, -r * .45, r * .52, r * 1.05, 10); ctx.fill(); V44.ol(2.6); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sd * r * .86, -r * .3, r * .15, 0, TAU); ctx.fill(); V44.glowAt(sd * r * .86, r * .62, 14, c, .9); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r, 0, r, [[0, '#4a2470'], [.55, '#241040'], [1, '#0e0420']]); ctx.beginPath(); ctx.roundRect(-r * .72, -r * .55, r * 1.44, r * 1.3, 18); ctx.fill(); V44.ol(3.6);
  ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-r * .5, r * .2); ctx.lineTo(0, r * .52); ctx.lineTo(r * .5, r * .2); ctx.stroke(); V44.glowAt(0, r * .42, 18, c, .5);
  ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .15, -r * .75, 2, r * .7, [[0, '#6a3a9a'], [1, '#1a0a30']]); ctx.beginPath(); ctx.arc(0, -r * .5, r * .56, Math.PI, 0); ctx.lineTo(r * .56, -r * .3); ctx.lineTo(-r * .56, -r * .3); ctx.closePath(); ctx.fill(); V44.ol(3);
  ctx.fillStyle = c; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * r * .22 - r * .1, -r * .98); ctx.lineTo(i * r * .22, -r * (1.3 - Math.abs(i) * .1)); ctx.lineTo(i * r * .22 + r * .1, -r * .98); ctx.fill(); }
  ctx.fillStyle = '#0a0414'; ctx.beginPath(); ctx.ellipse(0, -r * .5, r * .42, r * .2, 0, 0, TAU); ctx.fill(); V44.eye(0, -r * .5, r * .2, e, c, hit); ctx.strokeStyle = '#0a0414'; ctx.lineWidth = r * .09; ctx.lineCap = 'round'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * r * .46, -r * .74); ctx.lineTo(sd * r * .08, -r * .62); ctx.stroke(); }
};

// ----- visual10 / visual23 / visual5 / visual31 -----
B.crystal = (e, r, _t, hit) => {
  const t = T(); ctx.rotate(t * 1.2);
  for (let i = 0; i < 3; i++) { const a = t * 1.8 + i * TAU / 3; ctx.save(); ctx.translate(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5); ctx.rotate(a); ctx.fillStyle = hit ? '#fff' : '#d8b8ff'; V44.poly([[0, -7], [4, 0], [0, 7], [-4, 0]]); ctx.fill(); V44.glowAt(0, 0, 12, '#c04aff', .6); ctx.restore(); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#ffffff'], [.45, '#d8b0ff'], [1, '#5a1aa8']]); V44.poly([[0, -r * 1.4], [r * .85, -r * .2], [r * .55, r * 1.1], [-r * .55, r * 1.1], [-r * .85, -r * .2]]); ctx.fill(); ctx.strokeStyle = '#7a2ad6'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -r * 1.4); ctx.lineTo(0, r * .2); ctx.lineTo(r * .55, r * 1.1); ctx.moveTo(0, r * .2); ctx.lineTo(-r * .55, r * 1.1); ctx.moveTo(-r * .85, -r * .2); ctx.lineTo(0, r * .2); ctx.lineTo(r * .85, -r * .2); ctx.stroke();
  V44.glowAt(0, r * .1, r * .9 + Math.sin(t * 5) * 4, '#ffffff', .55); ctx.rotate(-t * 1.2);
  if (e.maxHp && e.hp < e.maxHp) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(-22, -r - 18, 44, 5); ctx.fillStyle = '#c04aff'; ctx.fillRect(-22, -r - 18, 44 * e.hp / e.maxHp, 5); }
};
B.ghost = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.globalAlpha = e.phased ? .28 + Math.sin(t * 20) * .1 : .92; ctx.translate(0, Math.sin(t * 2) * 3);
  for (let i = -1; i <= 1; i++) { ctx.fillStyle = 'rgba(160,200,255,.18)'; ctx.beginPath(); ctx.ellipse(i * r * .5, r * 1.5 + Math.sin(t * 4 + i) * 4, r * .22, r * .5, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r, 0, r * 1.3, [[0, '#f4faff'], [.6, '#a8c8f4'], [1, 'rgba(110,160,230,.55)']]); ctx.beginPath(); ctx.arc(0, -2, r, Math.PI, 0); ctx.lineTo(r, r * 1.05); for (let i = 4; i >= 0; i--) ctx.lineTo(-r + i * r * .5, r * 1.1 + (i % 2 ? 11 : -1) + Math.sin(t * 6 + i) * 3); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(60,100,170,.55)'; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.fillStyle = 'rgba(120,160,230,.5)'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * r * 1.02, r * .3, r * .2, r * .34, sd * .4, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#0e1a46'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * r * .36, -r * .08, r * .2, r * .3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#9fe8ff'; ctx.beginPath(); ctx.arc(sd * r * .36, -r * .14, r * .08, 0, TAU); ctx.fill(); ctx.fillStyle = '#0e1a46'; }
  ctx.beginPath(); ctx.ellipse(0, r * .42, r * .13, r * .2 + Math.sin(t * 5) * 2, 0, 0, TAU); ctx.fill();
};
B.splitter = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0), pu = 1 + Math.sin(t * 5) * .06, sp = Math.sin(t * 3) * r * .08; ctx.scale(pu, pu);
  for (const sd of [-1, 1]) { ctx.fillStyle = hit ? '#fff' : V44.rg(sd * r * .45 - r * .2, -r * .3, 2, r * .95, [[0, 'rgba(210,255,225,.9)'], [.6, 'rgba(90,230,140,.65)'], [1, 'rgba(30,150,80,.75)']]); ctx.beginPath(); ctx.ellipse(sd * (r * .36 + sp), 0, r * .74, r * .94, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#2fb865'; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -r * .85); ctx.lineTo(0, r * .85); ctx.stroke(); V44.glowAt(0, 0, r * .8, '#bfffd0', .35 + Math.sin(t * 6) * .12);
  for (const sd of [-1, 1]) { ctx.fillStyle = '#145a30'; ctx.beginPath(); ctx.arc(sd * r * .45 + Math.sin(t) * 3, Math.cos(t * .8) * 3, r * .26, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sd * r * .45 - 3, -4, r * .08, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(210,255,225,.85)'; for (let i = 0; i < 3; i++) { const a = t * .8 + i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .85, Math.sin(a) * r * .7, 3.2, 0, TAU); ctx.fill(); }
};
B.teleporter = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.save(); ctx.rotate(t * 1.4); ctx.strokeStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#e8b0ff'], [1, '#5a1a9a']]); ctx.lineWidth = r * .3; ctx.beginPath(); ctx.arc(0, 0, r * .92, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgba(20,4,40,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 1.07, 0, TAU); ctx.arc(0, 0, r * .77, 0, TAU); ctx.stroke(); ctx.fillStyle = '#ffe9ff'; for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * TAU / 8); ctx.fillRect(-2, -r * 1.02, 4, 9); ctx.restore(); } ctx.restore();
  ctx.fillStyle = hit ? '#fff' : V44.rg(0, 0, 1, r * .75, [[0, '#ffffff'], [.4, '#c070ff'], [1, '#2a0a50']]); ctx.beginPath(); ctx.arc(0, 0, r * .72, 0, TAU); ctx.fill();
  ctx.save(); ctx.rotate(-t * 3); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { ctx.rotate(TAU / 3); ctx.beginPath(); ctx.arc(0, 0, r * (.2 + k * .0), 0, 1.9); ctx.arc(0, 0, r * .46, .4, 1.8); ctx.stroke(); } ctx.restore();
  V44.glowAt(0, 0, r * .7, '#ffffff', .6);
  if (e.warn) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = .5 + .5 * Math.sin(World.t * 40); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 1.8, 0, TAU); ctx.stroke(); ctx.restore(); }
};
B.turret = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0), a = e.age < 15 ? aimAt(e.x, e.y) : Math.PI / 2;
  ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#6a3a52'], [1, '#1a0a1c']]); V44.poly(Array.from({ length: 8 }, (_, i) => [Math.cos(i / 8 * TAU + .39) * r * 1.05, Math.sin(i / 8 * TAU + .39) * r * 1.05])); ctx.fill(); ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,220,200,.35)'; for (let i = 0; i < 8; i++) { const b = i / 8 * TAU + .39; ctx.beginPath(); ctx.arc(Math.cos(b) * r * .86, Math.sin(b) * r * .86, 2.2, 0, TAU); ctx.fill(); }
  ctx.save(); ctx.rotate(a); ctx.fillStyle = hit ? '#fff' : V44.lg(0, -9, 0, 9, [[0, '#9a5a6a'], [1, '#3a1420']]); ctx.beginPath(); ctx.roundRect(r * .2, -9, r * 1.35, 18, 6); ctx.fill(); V44.ol(2.4); ctx.fillStyle = '#1a0610'; ctx.fillRect(r * 1.3, -11, 10, 22); ctx.restore();
  ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .15, -r * .2, 1, r * .6, [[0, '#8a4a5a'], [1, '#2a0e18']]); ctx.beginPath(); ctx.arc(0, 0, r * .52, 0, TAU); ctx.fill(); V44.ol(2.4); V44.eye(0, 0, r * .22, e, '#ff3a2a', hit);
  const ch = e.chargeT > 0 ? 1 - e.chargeT / (e.chargeMax || 1) : 0; V44.glowAt(0, 0, 26 + ch * 30, '#ff5a3c', .45 + ch * .5);
};
B.generator = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#a8782a'], [.5, '#5a3c10'], [1, '#241606']]); V44.poly(Array.from({ length: 6 }, (_, i) => [Math.cos(i / 6 * TAU) * r * 1.02, Math.sin(i / 6 * TAU) * r * 1.02])); ctx.fill(); ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); ctx.rotate(t * 1.2); ctx.strokeStyle = 'rgba(255,233,168,.8)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.rotate(TAU / 6); ctx.beginPath(); ctx.moveTo(r * .52, 0); ctx.lineTo(r * .86, 0); ctx.stroke(); } ctx.restore();
  ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .1, -r * .1, 1, r * .5, [[0, 'rgba(255,255,230,.95)'], [1, 'rgba(255,170,60,.6)']]); ctx.beginPath(); ctx.arc(0, 0, r * .46, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { const a = t * 3 + k * 2.1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * .4, Math.sin(a) * r * .4); ctx.lineTo(Math.cos(a + .4) * r * .46, Math.sin(a + .4) * r * .46); ctx.stroke(); } ctx.restore(); V44.glowAt(0, 0, 24 + Math.sin(t * 6) * 5, '#ffd36a', .85);
};
B.sniper = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0);
  if (e.aim !== undefined && e.cycle > .1 && e.cycle < 1.3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff3a3a'; ctx.globalAlpha = e.lock ? .5 + .5 * Math.sin(World.t * 50) : .3; ctx.lineWidth = e.lock ? 3 : 1.5; ctx.setLineDash(e.lock ? [] : [10, 8]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(e.aim) * 1300, Math.sin(e.aim) * 1300); ctx.stroke(); ctx.restore(); }
  const a = e.aim ?? Math.PI / 2;
  ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .3, -r * .3, 2, r, [[0, '#7a6a88'], [.6, '#2e2038'], [1, '#0e0814']]); ctx.beginPath(); ctx.arc(0, 0, r * .92, 0, TAU); ctx.fill(); V44.ol(3);
  ctx.save(); ctx.rotate(a); ctx.fillStyle = hit ? '#fff' : V44.lg(0, -6, 0, 6, [[0, '#8a7a98'], [1, '#2a1c34']]); ctx.beginPath(); ctx.roundRect(r * .25, -5, r * 1.95, 10, 4); ctx.fill(); V44.ol(2); ctx.fillStyle = '#ff3a3a'; ctx.fillRect(r * 2.1, -6, 5, 12); ctx.restore();
  for (const sd of [-1, 1]) { ctx.fillStyle = hit ? '#fff' : '#3a2a48'; V44.poly([[sd * r * .7, -r * .3], [sd * r * 1.2, -r * .9], [sd * r * .9, r * .2]]); ctx.fill(); V44.ol(2); }
  ctx.fillStyle = '#0a0410'; ctx.beginPath(); ctx.arc(0, 0, r * .42, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff3a3a'; ctx.beginPath(); ctx.arc(0, 0, 5.5 + (e.lock ? 2.5 : 0) + Math.sin(t * 6) * .8, 0, TAU); ctx.fill(); V44.glowAt(0, 0, 18, '#ff3a3a', .8); V44.rim(r);
};
B.swarmer = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.rotate(Math.atan2(1, Math.sin(e.age * 5) * .3) - Math.PI / 2);
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * r * .3, 0); ctx.rotate(sd * (.7 + Math.sin(t * 40) * .4)); ctx.fillStyle = 'rgba(255,255,220,.55)'; ctx.beginPath(); ctx.ellipse(sd * r * .5, -r * .2, r * .6, r * .24, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r, 0, r, [[0, '#fff08a'], [1, '#e8a808']]); ctx.beginPath(); ctx.ellipse(0, 0, r * .6, r * 1.05, 0, 0, TAU); ctx.fill(); V44.ol(2); ctx.fillStyle = 'rgba(70,40,4,.7)'; ctx.fillRect(-r * .6, -r * .1, r * 1.2, r * .2); ctx.fillStyle = '#2a1a04'; ctx.beginPath(); ctx.moveTo(-r * .12, r * .95); ctx.lineTo(0, r * 1.5); ctx.lineTo(r * .12, r * .95); ctx.fill();
  ctx.fillStyle = '#1a0a04'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * r * .24, -r * .55, r * .17, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sd * r * .24 - 1, -r * .6, 1.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#1a0a04'; }
};
B.bomber = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.scale(e.dir || 1, 1);
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(-r * .1, sd * r * .2); ctx.rotate(sd * (.18 + Math.sin(t * 8) * .08)); ctx.fillStyle = hit ? '#fff' : V44.lg(0, 0, -r * .9, sd * r, [[0, '#e8923a'], [1, '#6a3a10']]); V44.poly([[0, 0], [-r * .9, sd * r * 1.05], [r * .3, sd * r * .15]]); ctx.fill(); V44.ol(2.4); ctx.restore(); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r * .6, 0, r * .6, [[0, '#c8883a'], [.5, '#8a5a2a'], [1, '#3a200a']]); ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r * .62, 0, 0, TAU); ctx.fill(); V44.ol(3.2);
  ctx.fillStyle = '#1a0e04'; ctx.beginPath(); ctx.roundRect(-r * .45, r * .3, r * .9, 10, 4); ctx.fill(); ctx.fillStyle = '#ff6a2a'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-r * .25 + i * r * .25, r * .36, 2.6, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#0e0604'; ctx.beginPath(); ctx.ellipse(r * .7, -r * .1, r * .3, r * .26, 0, 0, TAU); ctx.fill(); V44.eye(r * .72, -r * .1, r * .16, e, '#ffd36a', hit); ctx.strokeStyle = '#1a0a04'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(r * .52, r * .12); ctx.quadraticCurveTo(r * .75, r * .26, r * .98, r * .1); ctx.stroke();
};
B.hunter = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.rotate(0); ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r * 1.2, 0, r, [[0, '#ff6a6a'], [.5, '#a01430'], [1, '#2a0510']]); V44.poly([[0, -r * 1.4], [r * .8, r * .1], [r * 1.1, r * .9], [r * .4, r * .5], [0, r * .95], [-r * .4, r * .5], [-r * 1.1, r * .9], [-r * .8, r * .1]]); ctx.fill(); ctx.strokeStyle = '#ff3a3a'; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = '#0e0208'; ctx.beginPath(); ctx.ellipse(0, -r * .15, r * .4, r * .3, 0, 0, TAU); ctx.fill(); V44.eye(0, -r * .15, r * .2, e, '#ff2a2a', hit);
  ctx.fillStyle = '#fff'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * r * .12, r * .2); ctx.lineTo(sd * r * .22, r * .55); ctx.lineTo(sd * r * .02, r * .24); ctx.fill(); }
  V44.glowAt(0, r * 1, 14 + Math.sin(t * 30) * 3, '#ff6a2a', .8);
};

// ----- tipos da Parte 3 -----
B.prism = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.rotate(t * .6); const ch = e.charge ? 1 : 0, burst = e.burst > 0, cols = ['#ff6a6a', '#ffd36a', '#7fff9a', '#6ac8ff'];
  ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#fffbe8'], [.5, '#ffd36a'], [1, '#8a5a10']]); V44.poly([[0, -r * 1.35], [r * .95, 0], [0, r * 1.35], [-r * .95, 0]]); ctx.fill(); ctx.strokeStyle = '#6a4a10'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { ctx.fillStyle = cols[i]; ctx.globalAlpha = .4 + (burst ? .35 : 0); ctx.beginPath(); ctx.moveTo(0, 0); const a = i * Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 1.2); ctx.lineTo(Math.cos(a + 1.57) * r, Math.sin(a + 1.57) * r * 1.2); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(0, -r * 1.35); ctx.lineTo(0, r * 1.35); ctx.moveTo(-r * .95, 0); ctx.lineTo(r * .95, 0); ctx.stroke(); ctx.rotate(-t * .6); V44.glowAt(0, 0, 18 + ch * 40, '#ffffff', .55 + ch * .45); V44.eye(0, 0, r * .2, e, '#6ac8ff', hit);
};
B.lantern = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.strokeStyle = '#6a3a10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -r * 1.35); ctx.lineTo(0, -r * 1.75); ctx.stroke(); ctx.fillStyle = '#3a1a08'; ctx.fillRect(-r * .35, -r * 1.35, r * .7, 9);
  ctx.fillStyle = hit ? '#fff' : V44.rg(0, 0, 2, r * 1.1, [[0, '#fff2b0'], [.5, '#ffb040'], [1, '#c8540a']]); ctx.beginPath(); ctx.ellipse(0, 0, r * .88, r * 1.08, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#7a3a0a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(122,58,10,.7)'; ctx.lineWidth = 2; for (const k of [-.55, -.28, 0, .28, .55]) { ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(r * .88 * k) + 1, r * 1.08, 0, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = '#7a3a0a'; ctx.fillRect(-r * .5, r * .98, r, 8); ctx.strokeStyle = '#d83a2a'; ctx.lineWidth = 3; for (const k of [-.3, 0, .3]) { ctx.beginPath(); ctx.moveTo(k * r, r * 1.05); ctx.quadraticCurveTo(k * r + Math.sin(t * 3 + k * 5) * 5, r * 1.4, k * r + Math.sin(t * 3 + k * 5) * 8, r * 1.7); ctx.stroke(); }
  V44.glowAt(0, 0, r * (.8 + Math.sin(t * 8) * .1), '#fff2b0', .55); ctx.fillStyle = '#4a1a04'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * r * .3, -r * .15, 3.4, 5, 0, 0, TAU); ctx.fill(); } ctx.beginPath(); ctx.arc(0, r * .15, r * .18, .2, Math.PI - .2); ctx.strokeStyle = '#4a1a04'; ctx.lineWidth = 2.4; ctx.stroke();
};
B.lancer = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0), a = e.mode === 'fire' || e.mode === 'aim' ? (e.aim ?? Math.PI / 2) : Math.PI / 2;
  if (e.mode === 'aim' && e.tm > .5 && e.tm < 1.8) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (e.tm > 1.1 ? .55 + .45 * Math.sin(World.t * 50) : .3); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = e.tm > 1.1 ? 3 : 1.5; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 1100, Math.sin(a) * 1100); ctx.stroke(); ctx.restore(); }
  ctx.rotate(a - Math.PI / 2);
  for (const sd of [-1, 1]) { ctx.fillStyle = hit ? '#fff' : V44.lg(0, 0, sd * r, -r, [[0, '#f0d890'], [1, '#8a6a20']]); V44.poly([[sd * r * .3, -r * .1], [sd * r * 1.15, -r * 1.0], [sd * r * .5, -r * .65]]); ctx.fill(); V44.ol(2.2); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(-r * .5, 0, r * .5, 0, [[0, '#fff'], [.5, '#e8c860'], [1, '#8a6a20']]); V44.poly([[0, r * 1.75], [r * .42, r * .1], [r * .5, -r * .6], [0, -r * .35], [-r * .5, -r * .6], [-r * .42, r * .1]]); ctx.fill(); V44.ol(3);
  V44.glowAt(0, r * 1.7, 14 + Math.sin(t * 10) * 3, '#ffe9a8', .9); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, r * 1.6); ctx.lineTo(0, -r * .2); ctx.stroke();
  ctx.fillStyle = '#4a3408'; ctx.beginPath(); ctx.ellipse(0, r * .2, r * .2, r * .28, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(0, r * .15, r * .09, 0, TAU); ctx.fill();
};
B.jelly = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0), pu = 1 + (e.pulse > 0 ? Math.sin(e.pulse / .45 * Math.PI) * .22 : 0), w = Math.sin(t * 3);
  ctx.lineCap = 'round'; for (let i = -3; i <= 3; i++) { ctx.strokeStyle = i % 2 ? 'rgba(150,235,255,.75)' : 'rgba(210,150,255,.6)'; ctx.lineWidth = i % 2 ? 4 : 3; ctx.beginPath(); ctx.moveTo(i * r * .22, r * .3); for (let k = 1; k <= 6; k++) ctx.lineTo(i * r * .22 + Math.sin(t * 3 + i + k * .9) * 5 * k * .4, r * .3 + k * r * .28); ctx.stroke(); V44.glowAt(i * r * .22 + Math.sin(t * 3 + i + 5.4) * 12, r * .3 + 6 * r * .28, 9, i % 2 ? '#9fe8ff' : '#e0a0ff', .7); }
  ctx.save(); ctx.scale(pu, 2 - pu); ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r, 0, r * .4, [[0, 'rgba(220,252,255,.95)'], [.6, 'rgba(100,190,240,.75)'], [1, 'rgba(70,120,220,.7)']]); ctx.strokeStyle = '#bfefff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.quadraticCurveTo(r * .6, r * .5 + w * 2, 0, r * .35); ctx.quadraticCurveTo(-r * .6, r * .5 - w * 2, -r, 0); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-r * .36, -r * .42, r * .28, r * .13, -.5, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(190,120,255,.45)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-r * .45 + i * r * .3, -r * .1 + (i % 2) * 8, 4, 0, TAU); ctx.fill(); }
  V44.eye(-r * .26, -r * .08, r * .13, e, '#0a3a6a', hit); V44.eye(r * .26, -r * .08, r * .13, e, '#0a3a6a', hit);
};
B.urchin = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0), low = e.hp < e.maxHp * .35 ? 1.35 : 1; ctx.save(); ctx.rotate(e.rot || 0); ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, L = r * (1.45 + (i % 2) * .4) * low * (1 + Math.sin(t * 4 + i) * .04); ctx.strokeStyle = hit ? '#fff' : (i % 2 ? '#9fc0ff' : '#6a8aff'); ctx.lineWidth = i % 2 ? 4 : 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke(); if (low > 1) V44.glowAt(Math.cos(a) * L, Math.sin(a) * L, 7, '#ff6a8a', .7); }
  ctx.fillStyle = hit ? '#fff' : V44.rg(-r * .3, -r * .3, 2, r, [[0, '#9ab0ff'], [.55, '#3a4ad0'], [1, '#0a1250']]); ctx.beginPath(); ctx.arc(0, 0, r * .92, 0, TAU); ctx.fill(); V44.ol(3); ctx.restore();
  ctx.fillStyle = '#0a1450'; ctx.beginPath(); ctx.ellipse(0, -r * .08, r * .56, r * .3, 0, 0, TAU); ctx.fill(); V44.eye(-r * .26, -r * .08, r * .17, e, low > 1 ? '#ff3a5a' : '#6ac8ff', hit); V44.eye(r * .26, -r * .08, r * .17, e, low > 1 ? '#ff3a5a' : '#6ac8ff', hit);
};
B.shade = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0);
  if (e.chg) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .4 + .5 * Math.sin(World.t * 45); ctx.strokeStyle = '#d8a8ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, H); ctx.stroke(); ctx.restore(); }
  ctx.globalAlpha = .86; for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(80,30,150,' + (.3 - i * .06) + ')'; ctx.beginPath(); ctx.ellipse(Math.sin(t * 3 + i) * 5, -r * 1.2 - i * r * .35, r * (.5 - i * .08), r * .3, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r * 1.2, 0, r, [[0, '#4a2a90'], [.6, '#1a0a40'], [1, '#08041a']]); ctx.beginPath(); ctx.moveTo(0, r * 1.25); ctx.quadraticCurveTo(r * .9, r * .6, r * 1.1, -r * .9); ctx.quadraticCurveTo(r * .7, -r * 1.25, 0, -r * 1.3); ctx.quadraticCurveTo(-r * .7, -r * 1.25, -r * 1.1, -r * .9); ctx.quadraticCurveTo(-r * .9, r * .6, 0, r * 1.25); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#d8a8ff'; ctx.lineWidth = 2.6; ctx.stroke();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = '#1a0a40'; ctx.beginPath(); ctx.moveTo(-r + i * r * .5, r * .6); ctx.lineTo(-r + i * r * .5 + r * .25, r * 1.4 + Math.sin(t * 5 + i) * 6); ctx.lineTo(-r + i * r * .5 + r * .5, r * .6); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.fillStyle = '#0a0414'; ctx.beginPath(); ctx.ellipse(0, -r * .35, r * .55, r * .45, 0, 0, TAU); ctx.fill(); for (const sd of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(sd * r * .22, -r * .35, r * .1, r * .17, 0, 0, TAU); ctx.fill(); V44.glowAt(sd * r * .22, -r * .35, 12, '#d8a8ff', .8); }
};
B.facet = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0); ctx.rotate(e.rot || 0);
  for (const [dx, dy, s, a] of [[-r * .95, r * .5, .45, -.5], [r * .95, r * .6, .38, .6]]) { ctx.save(); ctx.translate(dx, dy); ctx.rotate(a); ctx.fillStyle = hit ? '#fff' : V44.lg(0, -r * s, 0, r * s, [[0, '#e8d8ff'], [1, '#6a4aba']]); V44.poly([[0, -r * s * 1.4], [r * s * .6, 0], [0, r * s * 1.1], [-r * s * .6, 0]]); ctx.fill(); V44.ol(2); ctx.restore(); }
  ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#ffffff'], [.45, '#c8a8ff'], [1, '#4a2a8a']]); V44.poly([[0, -r * 1.4], [r * .88, -r * .1], [r * .5, r * 1.1], [-r * .55, r * .98], [-r * .92, -r * .2]]); ctx.fill(); ctx.strokeStyle = '#f0e0ff'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -r * 1.4); ctx.lineTo(r * .1, r * .1); ctx.lineTo(r * .5, r * 1.1); ctx.moveTo(r * .1, r * .1); ctx.lineTo(-r * .92, -r * .2); ctx.moveTo(r * .1, r * .1); ctx.lineTo(r * .88, -r * .1); ctx.stroke();
  ctx.rotate(-(e.rot || 0)); const sp = (Math.sin(t * 4) + 1) / 2; V44.glowAt(-r * .3, -r * .5, 10 + sp * 6, '#ffffff', .6 * sp); V44.eye(0, -r * .1, r * .17, e, '#9a63ff', hit);
};
B.warden = (e, r, _t, hit) => {
  const t = T() + (e.ph || 0), cl = e.closed;
  ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#4a2a9a'], [1, '#12062e']]); V44.poly(Array.from({ length: 6 }, (_, i) => [Math.cos(i / 6 * TAU + .5236) * r * 1.08, Math.sin(i / 6 * TAU + .5236) * r * 1.22])); ctx.fill(); ctx.strokeStyle = cl ? '#ffffff' : '#c080ff'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = 'rgba(200,170,255,.4)'; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5236; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .9, Math.sin(a) * r * 1.05, 3, 0, TAU); ctx.fill(); }
  if (cl) { ctx.fillStyle = hit ? '#fff' : V44.lg(-r, -r, r, r, [[0, '#ffffff'], [.4, '#c8d8ff'], [.6, '#ffffff'], [1, '#8a9aff']]); V44.poly(Array.from({ length: 6 }, (_, i) => [Math.cos(i / 6 * TAU + .5236) * r * .86, Math.sin(i / 6 * TAU + .5236) * r * 1.0])); ctx.fill(); const gl = ((World.t * 1.5) % 1) * r * 2.4 - r * 1.2; ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(gl, -r, 8, r * 2); ctx.restore(); V44.glowAt(0, 0, r * 1.2, '#c8d8ff', .35); }
  else { ctx.fillStyle = '#0a0418'; ctx.beginPath(); ctx.ellipse(0, 0, r * .72, r * .52, 0, 0, TAU); ctx.fill(); V44.eye(0, 0, r * .36, e, hit ? '#ff3a3a' : '#c040ff', hit); V44.glowAt(0, 0, r * 1.1, '#c040ff', .3); }
};
