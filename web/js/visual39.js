'use strict';
// ---------- 39: chefes com movimento secundario e dano visivel, especiais de tela cheia por arma, nave expressiva,
// numeros de dano com estilo, brilho (bloom) opcional, enquadramento automatico (F8) e cartao de inicio de fase ----------
const Visual39 = { photo: false, sp: null, card: null, shards: [] };
const hx39 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';
const sr = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- chefes: movimento secundario (mola) e rachaduras ----------
{
  const bd = Visual3.bossDraw;
  Visual3.bossDraw = function (b) {
    if (QL() < 1 || !b) return bd.call(this, b);
    const S = b._sp = b._sp || { px: b.x, py: b.y, sx: 1, sy: 1, rot: 0, vx: 0, vy: 0 };
    const vx = (b.x - S.px) * 60, vy = (b.y - S.py) * 60; S.px = b.x; S.py = b.y; S.vx += (vx - S.vx) * .2; S.vy += (vy - S.vy) * .2;
    const tx = 1 + clamp(Math.abs(S.vx) * .00018 - Math.abs(S.vy) * .00008, -.04, .09), ty = 1 + clamp(Math.abs(S.vy) * .00018 - Math.abs(S.vx) * .00008, -.04, .09), tr = clamp(S.vx * .00012, -.07, .07);
    S.sx += (tx - S.sx) * .18; S.sy += (ty - S.sy) * .18; S.rot += (tr - S.rot) * .15;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(S.rot); ctx.scale(S.sx, S.sy); ctx.translate(-b.x, -b.y);
    bd.call(this, b); ctx.restore();
    // rachaduras conforme a vida cai
    const r = clamp(b.ratio ?? 1, 0, 1); if (r < .85 && b.state !== 'intro' && b.state !== 'dying') {
      const n = Math.floor((1 - r) * 11), rad = (b.rad || 100) * .8, seed = (b.name || 'b').length * 7.3;
      ctx.save(); ctx.translate(b.x, b.y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < n; i++) {
        let a = sr(seed + i) * TAU, d = rad * (.1 + sr(seed + i * 3) * .25), x = Math.cos(a) * d, y = Math.sin(a) * d; const pts = [[x, y]];
        for (let k = 0; k < 4; k++) { a += (sr(seed + i * 11 + k) - .5) * 1.4; d = rad * (.12 + sr(seed + i * 5 + k) * .18); x += Math.cos(a) * d; y += Math.sin(a) * d; pts.push([x, y]); }
        ctx.beginPath(); pts.forEach(([px, py], j) => j ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
        ctx.strokeStyle = 'rgba(10,0,20,.7)'; ctx.lineWidth = 2.6; ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = hx39(b.col) ? b.col + 'aa' : 'rgba(255,170,80,.6)'; ctx.lineWidth = 1.1; ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();
    }
  };
}
// fumaca, faiscas e pecas soltas ao perder vida (chefes e inimigos grandes)
Visual39.damageFx = function (dt) {
  if (QL() < 1 || G.state !== 'play') return; Visual39.dt = (Visual39.dt || 0) - dt;
  const b = G.boss; if (b && b.state !== 'intro' && b.state !== 'dying') {
    const r = clamp(b.ratio ?? 1, 0, 1); b._thr = b._thr || {};
    for (const th of [.75, .5, .25]) if (r < th && !b._thr[th]) { b._thr[th] = 1; shedDebris(b.x, b.y, 10, [hx39(b.col) ? b.col : '#ffb340', '#3a2a5a', '#ffe9a8'], 360, 12); shockwave(b.x, b.y, (b.rad || 100) * 1.6, hx39(b.col) ? b.col : '#ffb340'); shake(8); }
    if (Visual39.dt <= 0) { Visual39.dt = r < .25 ? .06 : r < .5 ? .12 : r < .75 ? .3 : 9;
      if (r < .75) { const a = rand(0, TAU), d = rand(.1, .7) * (b.rad || 100); G.parts.push({ x: b.x + Math.cos(a) * d, y: b.y + Math.sin(a) * d, vx: rand(-20, 20), vy: rand(-70, -20), life: 1, max: 1, r: rand(10, 18), c: '#4a3a5a', k: 'smoke', drag: 1.2 }); }
      if (r < .5) { const a = rand(0, TAU), d = rand(.2, .8) * (b.rad || 100); sparks(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, '#ffcf6b', 3, 220); }
      if (r < .25) { const a = rand(0, TAU), d = rand(.2, .7) * (b.rad || 100); G.parts.push({ x: b.x + Math.cos(a) * d, y: b.y + Math.sin(a) * d, vx: rand(-30, 30), vy: rand(-90, -40), life: .6, max: .6, r: rand(6, 11), c: '#ff6a1a', drag: 1 }); } }
  }
  for (const e of G.enemies) if (!e.dead && e.maxHp >= 14 && e.hp < e.maxHp * .5 && Math.random() < dt * 5) G.parts.push({ x: e.x + rand(-e.rad, e.rad) * .6, y: e.y + rand(-e.rad, e.rad) * .6, vx: rand(-15, 15), vy: rand(-50, -20), life: .8, max: .8, r: rand(6, 10), c: '#4a3a5a', k: 'smoke', drag: 1.2 });
};

// ---------- nave: fumaca com pouca vida, rastro de velocidade e brilho das skins ----------
Visual39.shipFx = function (dt) {
  const p = G.player; if (!p || p.dead || G.state !== 'play' || QL() < 1) return; Visual39.st = (Visual39.st || 0) - dt;
  if (p.hp <= Math.max(1, p.maxHp * .34) && Visual39.st <= 0) { Visual39.st = .09; G.parts.push({ x: p.x + rand(-10, 10), y: p.y + rand(-6, 14), vx: rand(-15, 15), vy: rand(30, 80), life: .9, max: .9, r: rand(7, 12), c: '#3a3048', k: 'smoke', drag: 1 }); if (Math.random() < .35) sparks(p.x + rand(-12, 12), p.y, '#ffcf6b', 2, 200); }
  const sk = skinOf(Save.data.loadout.skin); if (sk && sk.id !== SKINS[0].id && Visual39.st <= 0.05 && Math.random() < dt * 9 && sk.pal && hx39(sk.pal.glow)) G.parts.push({ x: p.x + rand(-18, 18), y: p.y + rand(-14, 20), vx: rand(-20, 20), vy: rand(10, 50), life: .8, max: .8, r: rand(2, 4), c: sk.pal.glow, drag: 1 });
};
{
  const vd = Visual13.draw;
  Visual13.draw = function () {
    vd.call(this); const p = G.player; if (!p || p.dead || QL() < 1 || G.state !== 'play') return;
    const sp = Math.hypot(p.vx || 0, p.vy || 0); if (sp > 160) { const k = clamp((sp - 160) / 380, 0, 1), a = Math.atan2(p.vy || 0, p.vx || 0) + Math.PI; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * .35; const g = ctx.createLinearGradient(p.x, p.y, p.x + Math.cos(a) * 90, p.y + Math.sin(a) * 90); g.addColorStop(0, '#c8a0ff'); g.addColorStop(1, 'rgba(200,160,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(a) * 90, p.y + Math.sin(a) * 90); ctx.stroke(); ctx.restore(); }
  };
}

// ---------- especiais com animacao de tela cheia ----------
{
  const us = useSpecial;
  useSpecial = function () { const p = G.player, cd = p ? p.specCd : 1; us(); if (p && cd <= 0 && p.specCd > 0 && QL() >= 1) { const w = WEAPONS[p.weapon] || {}; Visual39.sp = { t: 0, c: hx39(w.c) ? w.c : '#b98cff', k: p.weapon, x: p.x, y: p.y }; G.zoom = Math.max(G.zoom || 0, .035); } };
}
Visual39.spDraw = function () {
  const S = Visual39.sp; if (!S) return; S.t += 1 / 60; const T = .75, k = S.t / T; if (k >= 1) { Visual39.sp = null; return; }
  const a = 1 - k, c = S.c, id = String(S.k || '');
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a * .22; ctx.fillStyle = c; ctx.fillRect(0, 0, W, H);
  const rays = (n, len, w) => { for (let i = 0; i < n; i++) { const an = i / n * TAU + S.t * .4, r0 = 40 + k * 120; ctx.globalAlpha = a * .5; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(S.x + Math.cos(an) * r0, S.y + Math.sin(an) * r0); ctx.lineTo(S.x + Math.cos(an) * (r0 + len * k + 80), S.y + Math.sin(an) * (r0 + len * k + 80)); ctx.stroke(); } };
  if (id === 'violet') { for (let i = 0; i < 26; i++) { const x = sr(i) * W, y = ((k * 1.4 + sr(i + 9)) % 1) * H; ctx.globalAlpha = a * .8; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y - 70); ctx.stroke(); drawGlow(x, y, 16, c, a); } }
  else if (id === 'fan') rays(18, 700, 8);
  else if (id === 'laser') { ctx.globalAlpha = a; for (let i = 0; i < 3; i++) { ctx.fillStyle = i ? c : '#fff'; ctx.fillRect(S.x - 40 + i * 12, 0, 80 - i * 24, S.y); } ctx.globalAlpha = a * .5; ctx.fillStyle = '#fff'; ctx.fillRect(0, S.y - 8 - k * 40, W, 16); }
  else if (id === 'cannon') { for (let i = 0; i < 3; i++) { ctx.globalAlpha = a * (1 - i * .25); ctx.strokeStyle = i ? c : '#fff'; ctx.lineWidth = 16 - i * 4; ctx.beginPath(); ctx.arc(S.x, S.y, k * (500 + i * 220), 0, TAU); ctx.stroke(); } }
  else if (id === 'boomerang') { for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + k * 6; ctx.globalAlpha = a * .8; ctx.strokeStyle = c; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(S.x, S.y, 120 + k * 380, an, an + .9); ctx.stroke(); } }
  else if (id === 'chain') { for (let i = 0; i < 5; i++) { let x = sr(i * 3) * W, y = 0; ctx.globalAlpha = a; ctx.strokeStyle = i % 2 ? '#fff' : c; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); while (y < H) { x += (sr(S.t * 9 + y + i) - .5) * 120; y += 70; ctx.lineTo(x, y); } ctx.stroke(); } }
  else if (id === 'flame') { ctx.globalAlpha = a * .7; const g = ctx.createLinearGradient(0, H, 0, H - H * k * 1.4); g.addColorStop(0, '#ff6a1a'); g.addColorStop(.6, '#ffb340'); g.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, H - H * k * 1.4, W, H * k * 1.4 + 2); }
  else rays(14, 600, 6);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a * .5; const g2 = ctx.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 800); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,.65)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); ctx.restore();
};

// ---------- numeros de dano com estilo ----------
Visual39.drawPop = function (o) {
  const big = o.size >= 22, age = 1 - clamp(o.life, 0, 1), pop = big ? 1 + Math.max(0, .5 - age * 3.4) : 1, a = clamp(o.life, 0, 1);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(o.x, o.y); ctx.scale(pop, pop); ctx.lineJoin = 'round'; ctx.font = `900 ${o.size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  if (/^[\d.,]+$/.test(o.text)) { ctx.lineWidth = big ? 5 : 3; ctx.strokeStyle = 'rgba(20,6,40,.85)'; ctx.strokeText(o.text, 0, 0); if (big) { ctx.shadowColor = o.c; ctx.shadowBlur = 16; } }
  ctx.fillStyle = o.c; ctx.fillText(o.text, 0, 0); ctx.restore();
};

// ---------- bloom opcional ----------
setTimeout(() => {
  const small = document.createElement('canvas'); small.width = 480; small.height = 270; const sc = small.getContext('2d');
  const rd = render;
  render = function () {
    rd();
    const s = Save.data.settings; if (!s || !s.bloom || QL() < 2 || !['play', 'pause', 'levelup'].includes(G.state)) return;
    sc.filter = 'blur(3px) brightness(.7) contrast(1.6)'; sc.drawImage(cv, 0, 0, 480, 270); sc.filter = 'none';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .2; ctx.imageSmoothingEnabled = true; ctx.drawImage(small, 0, 0, cv.width, cv.height); ctx.restore();
  };
}, 0);

// ---------- enquadramento automatico (F8) e cartao de inicio de fase ----------
addEventListener('keydown', e => { if (e.key === 'F8') { e.preventDefault(); Visual39.photo = !Visual39.photo; Visual7.msg = Visual39.photo ? 'ENQUADRAMENTO AUTOMÁTICO (F8 sai)' : 'ENQUADRAMENTO DESLIGADO'; Visual7.shotT = 2.2; } });
{
  const ss = Game.startStage;
  Game.startStage = function (i, o) { const r = ss.call(this, i, o); Visual39.card = (G.rush || G.exp || G.practice || G.training || G.endless || G.secret || G.adv || G.weekly) ? null : { t0: World.t, n: i + 1, name: STAGES[i] ? STAGES[i].name : '', c: STAGES[i] && hx39(STAGES[i].tint) ? STAGES[i].tint : '#ffb340' }; return r; };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const C = Visual39.card; if (!C || G.state !== 'play') return; const t = World.t - C.t0; if (t > 2.8 || t < 0) { if (t > 2.8) Visual39.card = null; return; }
    const a = clamp(t / .4, 0, 1) * clamp((2.8 - t) / .6, 0, 1), sl = (1 - clamp(t / .6, 0, 1)); ctx.save(); ctx.globalAlpha = a;
    ctx.translate(-sl * 220, 0); ctx.font = `900 190px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = C.c; ctx.globalAlpha = a * .45; ctx.strokeText(String(C.n).padStart(2, '0'), 60, 250);
    ctx.globalAlpha = a; ctx.shadowColor = C.c; ctx.shadowBlur = 20; txt('FASE ' + C.n, 78, 330, 22, C.c, 'left', 900); txt(C.name.toUpperCase(), 78, 358, 40, '#ffffff', 'left', 900);
    ctx.shadowBlur = 0; ctx.fillStyle = C.c; ctx.fillRect(78, 410, 300 * clamp(t / .9, 0, 1), 3); ctx.restore();
  };
}

// ---------- ligacao ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    up.call(this, dt); if (G.state !== 'play') return; Visual39.damageFx(dt); Visual39.shipFx(dt);
    if (Visual39.photo) { G.hideHud = true; const t = G.boss || G.player; if (t) { G.zoomCx = t.x; G.zoomCy = t.y; G.zoom = Math.max(G.zoom || 0, .14); } } else if (G.hideHud && Visual39.hadPhoto) G.hideHud = false; Visual39.hadPhoto = Visual39.photo;
  };
  const ov = Visual.overlay; Visual.overlay = function () { ov.call(this); Visual39.spDraw(); };
}
