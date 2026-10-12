'use strict';
// ---------- 56: enfeites desenhados uma vez e reaproveitados (cache), explosoes em quadros pre-renderizados, camadas de fundo com profundidade,
// materiais por setor nos inimigos, projeteis proprios por chefe, brilho em paineis e titulos, retratos que "assentem" e palavra falada em destaque ----------
const Visual56 = { cache: new Map(), layers: {} };
const hh56 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const hx56 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';
const rgb56 = c => hx56(c) ? [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] : [180, 140, 255];

// ---------- cache: desenha uma vez num canvas e reutiliza ----------
Visual56.sprite = function (key, w, h, fn) {
  let s = Visual56.cache.get(key); if (s) return s;
  const q = Math.max(1, K), c = document.createElement('canvas'); c.width = Math.ceil(w * q); c.height = Math.ceil(h * q); const g = c.getContext('2d'); g.scale(q, q); fn(g, w, h);
  s = { c, w, h }; Visual56.cache.set(key, s); if (Visual56.cache.size > 80) Visual56.cache.delete(Visual56.cache.keys().next().value); return s;
};
Visual56.drawSprite = (s, x, y, a = 1) => { ctx.globalAlpha = a; ctx.drawImage(s.c, x, y, s.w, s.h); ctx.globalAlpha = 1; };
addEventListener('resize', () => { Visual56.cache.clear(); Visual56.layers = {}; Visual56.sheets = null; });

// ---------- cantoneiras e moldura de cabine do HUD, em cache ----------
Visual56.corners = function (c, n) {
  return Visual56.sprite('cor' + c + n, W, H, (g) => {
    g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 3; g.lineCap = 'round';
    for (const [x, y, sx, sy] of [[14, 14, 1, 1], [W - 14, 14, -1, 1], [14, H - 14, 1, -1], [W - 14, H - 14, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * 46); g.lineTo(x, y); g.lineTo(x + sx * 46, y); g.stroke(); for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x + sx * (14 + i * 11), y + sy * (14 + i * 11), 2.6, 0, TAU); g.fill(); } }
  });
};
Visual56.hudFrame = function (wl, comboH, ab, edge) {
  return Visual56.sprite('hud' + wl + '_' + comboH + '_' + ab + edge, W, H, (g) => {
    g.beginPath(); g.moveTo(8, 6); g.lineTo(8 + wl, 6); g.lineTo(8 + wl - 26, 92); g.lineTo(8, 92); g.closePath(); g.fillStyle = 'rgba(10,3,30,.5)'; g.fill(); g.strokeStyle = 'rgba(200,170,255,.45)'; g.lineWidth = 2; g.stroke(); g.fillStyle = edge; g.globalAlpha = .7; g.fillRect(8, 6, 4, 86); g.globalAlpha = 1;
    const wr = 330; g.beginPath(); g.moveTo(W - 8, 6); g.lineTo(W - 8 - wr, 6); g.lineTo(W - 8 - wr + 22, 6 + comboH); g.lineTo(W - 8, 6 + comboH); g.closePath(); g.fillStyle = 'rgba(10,3,30,.46)'; g.fill(); g.strokeStyle = 'rgba(200,170,255,.4)'; g.stroke(); g.fillStyle = edge; g.globalAlpha = .7; g.fillRect(W - 12, 6, 4, comboH); g.globalAlpha = 1;
    g.beginPath(); g.roundRect(8, H - 72, 18 + ab * 70, 64, 16); g.fillStyle = 'rgba(10,3,30,.42)'; g.fill(); g.strokeStyle = 'rgba(200,170,255,.38)'; g.stroke();
  });
};
{
  const dh = Game.drawHud;
  Game.drawHud = function () {
    const p = G.player; if (p && QL() >= 1) { const mh = p.maxHp > 5 ? 0 : p.maxHp, hsp = Math.min(38, 520 / Math.max(1, p.maxHp)), wl = p.maxHp > 5 ? 250 : Math.round(clamp(30 + mh * hsp + 34, 250, 590)), ab = 3 + (typeof Visual13 !== 'undefined' && Visual13.secHud ? Visual13.secHud(p).length : 0); const edge = hx56(G.stage && G.stage.tint) ? G.stage.tint : '#b98cff'; ctx.save(); Visual56.drawSprite(Visual56.hudFrame(wl, G.combo >= 3 ? 130 : 72, ab, edge), 0, 0); ctx.restore(); }
    return dh.call(this);
  };
}

// ---------- explosoes pre-renderizadas em quadros (fogo aditivo + fumaca) ----------
Visual56.makeSheets = function () {
  const N = 14, S = 96, mk = (draw) => { const c = document.createElement('canvas'); c.width = N * S; c.height = S; const g = c.getContext('2d'); for (let f = 0; f < N; f++) { g.save(); g.translate(f * S + S / 2, S / 2); draw(g, f / (N - 1)); g.restore(); } return c; };
  const fire = mk((g, k) => { const R = 18 + k * 30, a = 1 - k * k; const gr = g.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, `rgba(255,255,240,${a})`); gr.addColorStop(.35, `rgba(255,210,90,${a * .9})`); gr.addColorStop(.7, `rgba(255,110,30,${a * .6})`); gr.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
    for (let i = 0; i < 9; i++) { const an = hh56(i) * TAU, d = (6 + hh56(i + 4) * 22) * (.3 + k), r = (6 + hh56(i + 8) * 10) * (1 - k * .5) + 4; const bg = g.createRadialGradient(Math.cos(an) * d, Math.sin(an) * d, 0, Math.cos(an) * d, Math.sin(an) * d, r); bg.addColorStop(0, `rgba(255,${180 + hh56(i) * 60 | 0},80,${a * .8})`); bg.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = bg; g.beginPath(); g.arc(Math.cos(an) * d, Math.sin(an) * d, r, 0, TAU); g.fill(); }
    g.strokeStyle = `rgba(255,255,255,${a * .8})`; g.lineWidth = 2; g.lineCap = 'round'; for (let i = 0; i < 10; i++) { const an = i / 10 * TAU + .2, r0 = 12 + k * 22, r1 = r0 + 10 + k * 8; g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); g.stroke(); } });
  const smoke = mk((g, k) => { const a = Math.sin(Math.min(1, k * 1.15) * Math.PI) * .55; for (let i = 0; i < 8; i++) { const an = hh56(i + 20) * TAU, d = 8 + k * (14 + hh56(i + 24) * 20), r = 10 + k * 12 + hh56(i + 30) * 6; const gr = g.createRadialGradient(Math.cos(an) * d, Math.sin(an) * d - k * 8, 0, Math.cos(an) * d, Math.sin(an) * d - k * 8, r); gr.addColorStop(0, `rgba(70,50,60,${a})`); gr.addColorStop(1, 'rgba(40,30,40,0)'); g.fillStyle = gr; g.beginPath(); g.arc(Math.cos(an) * d, Math.sin(an) * d - k * 8, r, 0, TAU); g.fill(); } });
  Visual56.sheets = { fire, smoke, N, S };
};
Visual56.boom = function (x, y, R, c) { if (QL() < 1) return; Visual56.booms = Visual56.booms || []; if (Visual56.booms.length < 10) Visual56.booms.push({ x, y, R: Math.max(30, R * 2.4), t: 0 }); };
{
  const vd = Visual13.draw;
  Visual13.draw = function () {
    vd.call(this); const B = Visual56.booms; if (!B || !B.length || G.state === 'pause') return; if (!Visual56.sheets) Visual56.makeSheets(); const sh = Visual56.sheets;
    ctx.save(); for (const b of B) { b.t += 1 / 60; const k = b.t / .55; if (k >= 1) continue; const f = Math.min(sh.N - 1, Math.floor(k * sh.N)); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(sh.smoke, f * sh.S, 0, sh.S, sh.S, b.x - b.R, b.y - b.R, b.R * 2, b.R * 2); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(sh.fire, f * sh.S, 0, sh.S, sh.S, b.x - b.R, b.y - b.R, b.R * 2, b.R * 2); }
    ctx.restore(); Visual56.booms = B.filter(b => b.t < .55);
  };
  const ke = killEnemy;
  killEnemy = function (e, by) { const was = e && !e.dead, x = e && e.x, y = e && e.y, R = e && e.rad || 24; const r = ke(e, by); if (was && e.dead && R >= 26 && (typeof Visual55 === 'undefined' || Visual55.lvl() >= 1)) Visual56.boom(x, y, R); return r; };
  const bd = Game.bossDefeated; Game.bossDefeated = function () { const b = G.boss; if (b) for (let i = 0; i < 6; i++) { const x = b.x + rand(-b.rad, b.rad) * .9, y = b.y + rand(-b.rad, b.rad) * .7; G.timers.push({ t: i * .1, fn: () => Visual56.boom(x, y, 60 + rand(0, 30)) }); } return bd.call(this); };
}

// ---------- camadas de fundo pre-renderizadas: longe, meio e perto, com velocidades diferentes ----------
Visual56.layer = function (st, i) {
  const key = st.id + ':' + i, L = Visual56.layers; if (L[key]) return L[key]; const pal = st.pal || {}, TH = 1440, c = document.createElement('canvas'); c.width = W; c.height = TH; const g = c.getContext('2d'); const seed = st.id * 17 + i * 5;
  const cols = [].concat((pal.nebA || []).map(n => n[3]), (pal.nebB || []).map(n => n[3]), [st.tint]).filter(hx56);
  if (i === 0) { for (let k = 0; k < 9; k++) { const x = hh56(seed + k) * W, y = hh56(seed + k + 40) * TH, r = 160 + hh56(seed + k + 80) * 220, col = cols[k % cols.length] || '#7a5aff'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col + '30'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } }
  else if (i === 1) { const c0 = rgb56(pal.rock1 || '#120a30'); for (let k = 0; k < 8; k++) { const x = hh56(seed + k) * W, y = hh56(seed + k + 50) * TH, r = 30 + hh56(seed + k + 90) * 70; g.fillStyle = `rgba(${c0[0]},${c0[1]},${c0[2]},.65)`; g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2; g.beginPath(); for (let a = 0; a < 9; a++) { const an = a / 9 * TAU, rr = r * (.7 + hh56(seed + k * 7 + a) * .5); g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * .85); } g.closePath(); g.fill(); g.stroke(); } }
  else { for (let k = 0; k < 5; k++) { const x = hh56(seed + k + 7) * W, y = hh56(seed + k + 60) * TH, r = 120 + hh56(seed + k + 99) * 160, col = cols[(k + 1) % cols.length] || '#b98cff'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col + '40'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } }
  return L[key] = c;
};
Visual56.drawLayer = function (i, speed, alpha) { const st = G.stage; if (!st) return; const c = Visual56.layer(st, i), off = (World.t * speed) % c.height; ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = i === 1 ? 'source-over' : 'lighter'; ctx.drawImage(c, 0, off - c.height); ctx.drawImage(c, 0, off); ctx.restore(); };
{
  const bi = Visual.biome;
  Visual.biome = function () { bi.call(this); if (QL() < 2 || !G.stage || G.state === 'photo') return; Visual56.drawLayer(0, 16, .9); Visual56.drawLayer(1, 52, .75); };
  const fg = Visual12.fg;
  Visual12.fg = function () { fg.call(this); if (QL() >= 2 && G.state === 'play' && G.stage) Visual56.drawLayer(2, 130, .55); };
  const ov = Visual.overlay;
  Visual.overlay = function () { ov.call(this); if (QL() >= 1 && G.state === 'play' && G.stage) { const c = hx56(G.stage.tint) ? G.stage.tint : '#b98cff'; ctx.save(); Visual56.drawSprite(Visual56.corners(c, (G.stage.id % 3) + 1), 0, 0, .32); ctx.restore(); } };
}

// ---------- materiais por setor nos inimigos comuns ----------
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    const r = ae.call(this, e); if (QL() < 2 || !e || e.dead || !G.stage || (e.rad || 0) > 44 || ['dummy', 'rod', 'boulder', 'bit', 'swarmer'].includes(e.type) || typeof e.x !== 'number') return r;
    const R = (e.rad || 24) * .86, t = World.t + (e.ph || 0), id = G.stage.id; ctx.save(); ctx.translate(e.x, e.y); ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
    if (id === 1) { ctx.fillStyle = 'rgba(60,36,20,.45)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc((hh56(i + e.ph) - .5) * R * 1.4, (hh56(i + 9) - .5) * R * 1.4, 1.5 + hh56(i + 3) * 2.6, 0, TAU); ctx.fill(); } }
    else if (id === 2) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(200,220,255,' + (.35 + .4 * Math.sin(t * 14)) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-R * .7, -R * .3); ctx.lineTo(-R * .2, -R * .05); ctx.lineTo(-R * .4, R * .25); ctx.lineTo(R * .3, R * .1); ctx.lineTo(R * .6, R * .5); ctx.stroke(); }
    else if (id === 3) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,140,40,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-R * .6, -R * .5); ctx.lineTo(-R * .1, -R * .1); ctx.lineTo(-R * .3, R * .4); ctx.moveTo(R * .5, -R * .4); ctx.lineTo(R * .2, R * .1); ctx.stroke(); }
    else if (id === 4) { ctx.strokeStyle = 'rgba(230,240,255,.35)'; ctx.lineWidth = 1.6; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(0, R * .5, R * (.35 + k * .25), Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); } }
    else if (id === 5) { const g = ctx.createLinearGradient(0, -R * .2, 0, R); g.addColorStop(0, 'rgba(20,0,40,0)'); g.addColorStop(1, 'rgba(20,0,50,.55)'); ctx.fillStyle = g; ctx.fillRect(-R, -R, R * 2, R * 2); }
    else if (id === 6) { ctx.strokeStyle = 'rgba(255,225,150,.75)'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(0, 0, R * .93, 0, TAU); ctx.stroke(); ctx.fillStyle = '#ffe9a8'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(Math.cos(k * 1.57 + .8) * R * .93, Math.sin(k * 1.57 + .8) * R * .93, 2.4, 0, TAU); ctx.fill(); } }
    else if (id === 7) { ctx.strokeStyle = 'rgba(190,240,255,.55)'; ctx.lineWidth = 1.3; for (let k = 0; k < 3; k++) { const yy = R * .8 - ((t * 18 + k * 12) % (R * 1.6)); ctx.beginPath(); ctx.arc(Math.sin(k * 2 + t) * R * .4, yy, 2 + k * .8, 0, TAU); ctx.stroke(); } }
    else if (id === 8) { const sw = ((t * .6) % 1.6 - .3) * R * 2.6 - R; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.save(); ctx.translate(sw, 0); ctx.rotate(.5); ctx.fillRect(-4, -R * 1.5, 8, R * 3); ctx.restore(); }
    else if (id === 9) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,240,190,.35)'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { const a = t * .8 + k * 1.57; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke(); } }
    else { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,' + (.35 + .35 * Math.sin(t * 4)) + ')'; ctx.beginPath(); ctx.arc(-R * .35, -R * .4, 1.8, 0, TAU); ctx.fill(); }
    ctx.restore(); return r;
  };
}

// ---------- projeteis proprios de cada chefe ----------
{
  const eb = ebullet;
  ebullet = function (x, y, ang, spd, o = {}) {
    const n = G.eb.length; const r = eb(x, y, ang, spd, o); const b0 = G.boss;
    if (b0 && b0.state === 'fight' && !o.sty) for (let i = n; i < G.eb.length; i++) { const q = G.eb[i]; if (q.sty || q.rock) continue; const nm = b0.constructor.name; if (Math.hypot(q.x - b0.x, q.y - b0.y) < 280 || /Leviathan|Mirror/.test(nm)) q.bo = nm; }
    return r;
  };
  const ae = Art.ebullet;
  Art.ebullet = function (b) {
    if (!b.bo || QL() < 1) return ae.call(this, b); const R = (b.r || 7) * 1.5, a = Math.atan2(b.vy, b.vx), t = World.t, nm = b.bo; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a + Math.PI / 2); let glow = '#ff6a6a';
    const out = () => { ctx.strokeStyle = 'rgba(14,4,28,.85)'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke(); };
    if (/MotherShip/.test(nm)) { glow = '#ffb340'; ctx.fillStyle = '#ffc850'; ctx.beginPath(); for (let k = 0; k < 6; k++) ctx.lineTo(Math.cos(k / 6 * TAU) * R, Math.sin(k / 6 * TAU) * R); ctx.closePath(); ctx.fill(); out(); ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(0, 0, R * .4, 0, TAU); ctx.fill(); }
    else if (/RockGolem/.test(nm)) { glow = '#ff9a3c'; ctx.fillStyle = '#8a6a88'; ctx.beginPath(); for (let k = 0; k < 7; k++) { const an = k / 7 * TAU + t, rr = R * (.8 + hh56(k) * .35); ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } ctx.closePath(); ctx.fill(); out(); ctx.fillStyle = '#ffb060'; ctx.beginPath(); ctx.arc(-R * .2, -R * .2, R * .22, 0, TAU); ctx.fill(); }
    else if (/StormEye/.test(nm)) { glow = '#9fe8ff'; ctx.fillStyle = '#ffffff'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4 + t * 4, rr = k % 2 ? R * .45 : R * 1.15; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } ctx.closePath(); ctx.fill(); out(); ctx.fillStyle = '#ff7ac8'; ctx.beginPath(); ctx.arc(0, 0, R * .35, 0, TAU); ctx.fill(); }
    else if (/SunGuardian/.test(nm)) { glow = '#ff7a1a'; ctx.fillStyle = '#ff8a1f'; ctx.beginPath(); ctx.moveTo(0, -R * 1.5); ctx.quadraticCurveTo(R * 1.1, -R * .1, 0, R * .9); ctx.quadraticCurveTo(-R * 1.1, -R * .1, 0, -R * 1.5); ctx.fill(); out(); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.ellipse(0, -R * .1, R * .45, R * .65, 0, 0, TAU); ctx.fill(); }
    else if (/Echo/.test(nm)) { glow = '#ff4ad0'; ctx.fillStyle = Math.floor(t * 8 + b.x) % 2 ? '#ff4ad0' : '#2ad4ff'; const s = R * 1.5; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.strokeRect(-s / 2, -s / 2, s, s); ctx.fillStyle = '#10062a'; ctx.fillRect(-s * .18, -s * .18, s * .36, s * .36); }
    else if (/VoidBoss/.test(nm)) { glow = '#9a63ff'; ctx.fillStyle = '#1a0a38'; ctx.beginPath(); ctx.moveTo(0, -R * 1.9); ctx.lineTo(R * .8, R * .7); ctx.lineTo(0, R * .2); ctx.lineTo(-R * .8, R * .7); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#c04aff'; ctx.lineWidth = 2.2; ctx.stroke(); }
    else if (/Herald/.test(nm)) { glow = '#ffd36a'; ctx.fillStyle = '#fff3c0'; ctx.beginPath(); ctx.moveTo(0, -R * 2); ctx.lineTo(R * .7, 0); ctx.lineTo(0, R * 1.1); ctx.lineTo(-R * .7, 0); ctx.closePath(); ctx.fill(); out(); ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.moveTo(0, -R * 1.2); ctx.lineTo(R * .3, 0); ctx.lineTo(0, R * .6); ctx.lineTo(-R * .3, 0); ctx.closePath(); ctx.fill(); }
    else if (/Leviathan/.test(nm)) { glow = '#33c4ff'; ctx.fillStyle = '#7fe0ff'; ctx.beginPath(); ctx.moveTo(0, -R * 1.5); ctx.quadraticCurveTo(R * 1.1, R * .4, 0, R * 1.1); ctx.quadraticCurveTo(-R * 1.1, R * .4, 0, -R * 1.5); ctx.fill(); out(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-R * .3, 0, R * .18, R * .38, 0, 0, TAU); ctx.fill(); }
    else if (/Mirror/.test(nm)) { glow = '#e8d0ff'; ctx.fillStyle = 'rgba(235,225,255,.92)'; ctx.beginPath(); ctx.moveTo(0, -R * 1.5); ctx.lineTo(R * .95, R * .8); ctx.lineTo(-R * .8, R * .9); ctx.closePath(); ctx.fill(); out(); ctx.strokeStyle = '#a060ff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -R * 1.5); ctx.lineTo(R * .1, R * .5); ctx.stroke(); }
    else if (/Heart/.test(nm)) { glow = '#ffe9a8'; ctx.fillStyle = '#fff0c8'; ctx.beginPath(); ctx.moveTo(0, R * .9); ctx.bezierCurveTo(-R * 1.4, -R * .1, -R * .9, -R * 1.1, 0, -R * .4); ctx.bezierCurveTo(R * .9, -R * 1.1, R * 1.4, -R * .1, 0, R * .9); ctx.fill(); out(); }
    else { ctx.restore(); return ae.call(this, b); }
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.2, glow, .55); ctx.restore();
  };
}

// ---------- brilho passeando nas bordas dos paineis grandes e nos titulos ----------
{
  const pn = UI.panel;
  UI.panel = function (x, y, w, h, o = {}) {
    pn.call(this, x, y, w, h, o); if (QL() < 2 || w < 320 || h < 120) return; const per = 2 * (w + h), u = ((World.t * .09 + hh56(Math.floor(x + y)) ) % 1);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(210,190,255,.55)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.setLineDash([90, per - 90]); ctx.lineDashOffset = -u * per; ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(o.r || 22, h / 2)); ctx.stroke(); ctx.restore();
  };
  const t0 = txt;
  txt = function (s, x, y, size, color = '#e2d4ff', align = 'left', weight = 900, base = 'top') {
    t0(s, x, y, size, color, align, weight, base);
    if (size >= 38 && (color === '#fff' || color === '#ffffff') && base === 'top' && QL() >= 2) { ctx.save(); ctx.font = `400 ${size}px "Lilita One", ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'top'; const tw = ctx.measureText(s).width, x0 = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x, sw = ((World.t * .45) % 2.2 - .6) * tw + x0, g = ctx.createLinearGradient(sw - 50, 0, sw + 50, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillText(s, x, y); ctx.restore(); }
  };
}

// ---------- retratos assentem ao falar; palavra falada em destaque ----------
{
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o) {
    if (G.state === 'story' && o && o.talk && QL() >= 1 && size >= 150) { const t = World.t; ctx.save(); ctx.translate(x, y + 60); ctx.rotate(Math.sin(t * 9) * .022); ctx.scale(1 + Math.max(0, Math.sin(t * 9)) * .012, 1); ctx.translate(-x, -(y + 60)); pd.call(this, who, x, y, size, o); ctx.restore(); return; }
    return pd.call(this, who, x, y, size, o);
  };
  const ty = Screens.typed;
  Screens.typed = function (lines, shown, x, y, lh, size, color, align = 'left', weight = 700) {
    ty.call(this, lines, shown, x, y, lh, size, color, align, weight); if (QL() < 1 || !lines || !lines.length) return;
    let left = shown, yy = y; const total = lines.reduce((a, l) => a + l.length + 1, 0); if (shown >= total - 1) return;
    for (const ln of lines) { if (left <= 0) break; if (left <= ln.length) { const seg = ln.slice(0, left), m = /(\S+)$/.exec(seg); if (m) { ctx.font = `${weight} ${size}px ${FONT}`; const pre = seg.slice(0, seg.length - m[1].length), x0 = align === 'center' ? x - ctx.measureText(ln).width / 2 : x; ctx.save(); ctx.shadowColor = '#ffd36a'; ctx.shadowBlur = 12; txt(m[1], x0 + ctx.measureText(pre).width, yy, size, '#ffe9a8', 'left', weight); ctx.restore(); } break; } left -= ln.length + 1; yy += lh; }
  };
}
