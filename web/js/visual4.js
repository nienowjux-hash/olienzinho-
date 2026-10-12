'use strict';
// ---------- polimento grafico 3: cut-in de especial, entrada/fim de fase, barra de chefe, expressoes, explosoes, planetas, loja, titulo, desempenho ----------
const Visual4 = {};

// efeitos continuam a andar mesmo quando o jogo esta parado (cutscenes)
Visual4.fxStep = function (dt) {
  for (const q of G.parts) { q.life -= dt; if (q.k === 'debris') { q.rot += q.vr * dt; q.vy += 380 * dt; } q.x += q.vx * dt; q.y += q.vy * dt; const d = Math.max(0, 1 - q.drag * dt); q.vx *= d; q.vy *= d; }
  for (const r of G.rings) { r.r += (r.max - r.r) * Math.min(1, 7 * dt) + 20 * dt; r.life -= dt * 2.2; }
  for (const o of G.pops) { o.y -= 50 * dt; o.life -= dt * 1.2; }
  G.parts = G.parts.filter(q => q.life > 0); G.rings = G.rings.filter(r => r.life > 0); G.pops = G.pops.filter(o => o.life > 0);
};

// ===== 1. corte de golpe especial =====
Visual4.cutin = function (wid) {
  const w = WEAPONS[wid]; G.cutin = { t: 0, dur: 2.0, name: w.specName.toUpperCase(), col: w.c, who: wid === 'orbi' ? 'B' : 'O' };
  const p = G.player; if (p) { p.mood = 'determined'; p.moodT = 1.2; }
};
Visual4.cutinDraw = function () {
  const c = G.cutin; if (!c) return; if (G.state === 'play') c.t += 1 / 60; if (c.t > c.dur) { G.cutin = null; return; }
  const inK = easeOut(clamp(c.t / .4, 0, 1)), outK = easeOut(clamp((c.t - (c.dur - .4)) / .4, 0, 1)), a = inK * (1 - outK), t = World.t;
  ctx.save(); ctx.globalAlpha = a;
  const y0 = 232, h = 150, sl = 70, off = (1 - inK) * -W + outK * W;
  ctx.translate(off, 0);
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(8,2,26,.0)'); g.addColorStop(.15, 'rgba(8,2,26,.82)'); g.addColorStop(.85, 'rgba(8,2,26,.82)'); g.addColorStop(1, 'rgba(8,2,26,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-40, y0 + sl * .3); ctx.lineTo(W + 40, y0 - sl * .3); ctx.lineTo(W + 40, y0 + h - sl * .3); ctx.lineTo(-40, y0 + h + sl * .3); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c.col; ctx.lineWidth = 4; ctx.globalAlpha = a * .9;
  ctx.beginPath(); ctx.moveTo(-40, y0 + sl * .3); ctx.lineTo(W + 40, y0 - sl * .3); ctx.moveTo(-40, y0 + h + sl * .3); ctx.lineTo(W + 40, y0 + h - sl * .3); ctx.stroke();
  ctx.lineWidth = 2; ctx.globalAlpha = a * .4; for (let i = 0; i < 16; i++) { const yy = y0 + 8 + (i * 37) % (h - 10), xx = ((t * 1500 + i * 211) % (W + 400)) - 200; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + 160, yy); ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  Portraits.draw(c.who, 180 + Math.min(1, c.t / 1.8) * 50, y0 + h / 2, 190, { mood: 'determined', t });
  ctx.save(); ctx.translate(W - 70, y0 + 36); ctx.transform(1, 0, -.18, 1, 0, 0); ctx.shadowColor = c.col; ctx.shadowBlur = 30;
  txt(c.name, 0, 0, c.name.length > 14 ? 54 : 64, '#ffffff', 'right', 900); ctx.restore();
  txt(c.who === 'B' ? 'ORBI' : 'OLIENZINHO', W - 70, y0 + 104, 20, c.col, 'right', 900);
  ctx.restore();
};
{
  const us = useSpecial;
  useSpecial = function () { const p = G.player, cd = p ? p.specCd : 1; us(); if (p && cd <= 0 && p.specCd > 0) Visual4.cutin(p.weapon); };
}

// ===== 2. entrada na fase: a nave sobe voando =====
{
  const up = Game.updatePlayer;
  Game.updatePlayer = function (dt) {
    up.call(this, dt); const p = G.player; if (!p || p.dead || G.cut || G.finisher) return;
    if (G.t < 1.15 && !G.furyCut) {
      const k = easeOut(clamp(G.t / 1.15, 0, 1)); p.y = lerp(H + 110, H - 130, k); p.vy = 0; p.inv = Math.max(p.inv, .5);
      for (let i = 0; i < 3; i++) G.parts.push({ x: p.x + rand(-8, 8), y: p.y + 30, vx: rand(-60, 60), vy: rand(180, 420), life: rand(.3, .6), max: .6, r: rand(4, 9), c: Math.random() < .5 ? '#ffb340' : '#ffe9a8', drag: 1.5 });
      if (G.t < .03) { Snd.play('dash'); shockwave(p.x, H - 70, 200, '#ffb340'); }
    }
    // expressoes durante a partida
    if (p.dashT > 0) { p.mood = 'shock'; p.moodT = .3; }
    else if (!p.mood && p.hp <= Math.max(1, p.maxHp * .25)) { p.mood = 'worry'; p.moodT = .25; }
    else if (!p.mood && G.combo >= 25) { p.mood = 'determined'; p.moodT = .25; }
  };
}
Visual4.introDraw = function () {
  if (!(G.t < 1.8) || G.state !== 'play' || G.endless || G.training) return;
  const k = G.t / 1.8, x = lerp(-300, W + 300, easeOut(k)), a = Math.sin(k * Math.PI);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(x - 260, 0, x + 260, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,' + .35 * a + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 260, 0, 520, H); ctx.restore();
};

// ===== 3. fim de fase com comemoracao =====
Visual4.celebrate = function () {
  G.state = 'celebrate'; G.celT = 0; Snd.play('stageClear'); Snd.musicPlay('triumph', 1);
  const p = G.player; p.mood = 'happy'; p.moodT = 99; p.inv = 99; G.eb = []; G.hazards = []; G.celFire = 0;
};
Screens.celebrate = function () {
  const dt = 1 / 60; G.celT += dt; const t = G.celT, p = G.player, cx = W / 2, cy = H * .56;
  Visual4.fxStep(dt); World.boost = Math.max(World.boost, .5);
  if (t < 2.6) { const u = easeOut(t / 2.6), a = Math.PI / 2 + u * TAU * 1.0; p.x = cx + Math.cos(a) * 150 * (1 - u * .15); p.y = cy + Math.sin(a) * 120 - u * 20; p.vx = -Math.sin(a) * 420; G.parts.push({ x: p.x, y: p.y + 24, vx: rand(-30, 30), vy: rand(30, 90), life: .6, max: .6, r: rand(4, 8), c: Math.random() < .5 ? '#ffe9a8' : '#b98cff', drag: 1 }); }
  else { p.x += (cx - p.x) * .08; p.y += (cy - 20 + Math.sin(t * 3) * 8 - p.y) * .08; p.vx *= .9; }
  for (let i = 0; i < 2; i++) G.parts.push({ x: rand(0, W), y: -10, vx: rand(-20, 20), vy: rand(180, 340), life: 3, max: 3, r: rand(2, 5), c: ['#ffe9a8', '#ffffff', '#ff9ac0', '#9fe8ff'][i + (t * 10 | 0) % 3], drag: 0 });
  while (G.celFire < 7 && t > .6 + G.celFire * .8) { G.celFire++; const fx = rand(160, W - 160), fy = rand(120, 300); burst(fx, fy, ['#ffe9a8', '#ff9ac0', '#9fe8ff', '#ffffff'], 40, 420, 5); shockwave(fx, fy, 160, '#ffe9a8'); Snd.play('explode', { size: .6 }); }
  // legenda
  const e = easeOut(clamp((t - .2) / .6, 0, 1)), out = clamp((6.6 - t) / .5, 0, 1);
  const bh = 64 * easeOut(clamp(t / .5, 0, 1)); ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  ctx.save(); ctx.globalAlpha = e * out; ctx.translate(W / 2, 150); ctx.scale(1.2 - .2 * e, 1.2 - .2 * e); ctx.shadowColor = G.stage.tint; ctx.shadowBlur = 40;
  txt('SETOR LIMPO!', 0, -44, 84, '#ffe9a8', 'center', 900); ctx.restore();
  ctx.globalAlpha = e * out; txt(G.stage.name, W / 2, 190, 26, '#fff', 'center', 800); ctx.globalAlpha = 1;
  if (t > 2.4) { ctx.globalAlpha = .5 + .3 * Math.sin(World.t * 5); txt('ENTER para continuar', W / 2, H - bh - 30, 16, '#cdb8ff', 'center', 700); ctx.globalAlpha = 1; }
  if (t > 7 || (t > 2.4 && (Input.pressed('enter') || Input.mouse.click))) { G.clearAt = World.t; G.stamped = false; G.state = 'clear'; Snd.musicPlay('menu', 0); }
};

// ===== 4. rosto do Olienzinho reagindo a golpe forte =====
{
  const hp1 = hurtPlayer;
  hurtPlayer = function (d) { const p = G.player, b = p ? p.hp : 0; hp1(d); if (p && p.hp < b && (d >= 2 || p.hp <= Math.max(2, p.maxHp * .4))) { G.hurtFaceAt = World.t; G.hurtFaceLow = p.hp <= Math.max(1, p.maxHp * .25); } };
}
Visual4.faceDraw = function () {
  if (G.hurtFaceAt === undefined || G.state !== 'play') return; const k = (World.t - G.hurtFaceAt) / 1.1; if (k > 1 || k < 0) return;
  const a = clamp((1 - k) * 2, 0, 1), s = 108, x = W - 84, y = H - 190, who = G.player && G.player.weapon === 'orbi' ? 'B' : 'O';
  ctx.save(); ctx.globalAlpha = a; ctx.translate((1 - easeOut(clamp(k * 6, 0, 1))) * 80, 0);
  ctx.shadowColor = '#ff2a5a'; ctx.shadowBlur = 24; Portraits.draw(who, x, y, s, { mood: G.hurtFaceLow ? 'sad' : 'shock', t: World.t });
  ctx.strokeStyle = 'rgba(255,60,100,.9)'; ctx.lineWidth = 3; ctx.shadowBlur = 0; ctx.beginPath(); ctx.roundRect(x - s / 2 - 4, y - s / 2 - 4, s + 8, s + 8, 18); ctx.stroke(); ctx.restore();
};

// ===== 5. barra de vida do chefe =====
Visual4.bossBar = function (b) {
  const w = 660, x = W / 2 - w / 2, y = 78, h = 18, r = b.ratio, t = World.t, ph = b.phase || 0;
  b.gh = b.gh === undefined ? r : (b.gh > r ? lerp(b.gh, r, .05) : r);
  ctx.save(); ctx.shadowColor = b.col || '#ffb340'; ctx.shadowBlur = 14; txt(b.name.toUpperCase(), W / 2, 22, 28, '#ffe9a8', 'center', 900); ctx.restore(); const ep = EPITHET[b.name]; if (ep) txt(ep, W / 2, 54, 13, '#cdb8ff', 'center', 700);
  ctx.save();
  ctx.fillStyle = 'rgba(8,2,24,.82)'; ctx.strokeStyle = '#d9a84a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(x - 8, y - 6, w + 16, h + 12, 12); ctx.fill(); ctx.stroke();
  const clipR = () => { ctx.beginPath(); ctx.roundRect(x, y, w, h, 7); };
  ctx.save(); clipR(); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(x, y, w * b.gh, h);
  const cols = [['#ffb340', '#ff7a3c'], ['#ff7a3c', '#ff3a2a'], ['#ff3a2a', '#c2185b']][ph], g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]);
  ctx.fillStyle = g; ctx.fillRect(x, y, Math.max(6, w * r), h);
  const sx = x + ((t * 220) % (w + 120)) - 60; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sg = ctx.createLinearGradient(sx - 40, 0, sx + 40, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(x, y, w * r, h); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x, y, w * r, 4);
  if (b.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,' + Math.min(.6, b.flash * 9) + ')'; ctx.fillRect(x, y, w * r, h); }
  if (r < .34) { ctx.strokeStyle = 'rgba(20,0,10,.6)'; ctx.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const cx = x + w * r * (.1 + i * .16); ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + 5, y + 6); ctx.lineTo(cx - 3, y + 11); ctx.lineTo(cx + 3, y + h); ctx.stroke(); } }
  ctx.restore();
  ctx.fillStyle = '#d9a84a'; for (const f of [1 / 3, 2 / 3]) { const mx = x + w * f; ctx.fillRect(mx - 1.5, y - 3, 3, h + 6); ctx.beginPath(); ctx.moveTo(mx, y - 8); ctx.lineTo(mx + 5, y - 3); ctx.lineTo(mx, y + 2); ctx.lineTo(mx - 5, y - 3); ctx.fill(); }
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(W / 2 + sd * (w / 2 + 8), y + h / 2 - 11); ctx.lineTo(W / 2 + sd * (w / 2 + 22), y + h / 2); ctx.lineTo(W / 2 + sd * (w / 2 + 8), y + h / 2 + 11); ctx.closePath(); ctx.fill(); }
  for (let i = 0; i < 3; i++) { const lit = i >= ph; ctx.fillStyle = lit ? '#ffe9a8' : '#3a2a40'; ctx.beginPath(); ctx.arc(x + w - 14 - i * 16, y + h + 14, 4.5, 0, TAU); ctx.fill(); }
  ctx.restore();
};

// ===== 6. expressoes na nave (olho) =====

// ===== 7. explosoes com personalidade =====
{
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.counted; ke(e, by); if (was || !e.counted || QL() < 1) return;
    const P = G.parts, c = e.glow || '#ffb340', x = e.x, y = e.y;
    switch (e.type) {
      case 'drone': for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; P.push({ x, y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, life: .5, max: .5, r: 4, c: i % 2 ? c : '#ffe9a8', drag: 3 }); } break;
      case 'zig': sparks(x, y, '#bff0ff', 14, 460); shedDebris(x, y, 4, ['#bff0ff', '#2b7bff'], 340, 8); break;
      case 'kami': sparks(x, y, '#ff4a6e', 22, 640); P.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .2, max: .2, r: 110, c: '#ff4a6e', drag: 1 }); break;
      case 'shooter': case 'shield': sparks(x, y, c, 12, 360); shedDebris(x, y, 5, ['#4a1060', c, '#e2d4ff'], 320, 9); if (e.type === 'shield') shockwave(x, y, 140, '#7fe0ff'); break;
      case 'healer': for (let i = 0; i < 16; i++) P.push({ x: x + rand(-20, 20), y: y + rand(-10, 10), vx: rand(-40, 40), vy: -rand(60, 200), life: .9, max: .9, r: rand(2, 4), c: '#7fffa0', drag: .8 }); break;
      case 'bit': P.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .12, max: .12, r: 40, c: '#7fe0ff', drag: 1 }); break;
      case 'tank': case 'captain':
        P.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .45, max: .45, r: 190, c: '#ff9a30', drag: 1 });
        for (let i = 0; i < 10; i++) P.push({ k: 'smoke', x: x + rand(-30, 30), y: y + rand(-30, 30), vx: rand(-90, 90), vy: rand(-90, 40), life: 1.1, max: 1.1, r: rand(14, 26), c: '#4a2a3a', drag: 1.5 });
        for (const d of [.18, .36]) G.timers.push({ t: d, fn: () => { const bx = x + rand(-40, 40), by2 = y + rand(-40, 40); burst(bx, by2, [c, '#ffe9a8', '#ffffff'], 18, 300, 6); shockwave(bx, by2, 110, c); Snd.play('explode', { size: .7, pan: Snd.panX(bx) }); } });
        break;
    }
  };
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () {
    const b = G.lastBoss; bd.call(this);
    if (b) for (let i = 0; i < 7; i++) G.timers.push({ t: .25 + i * .22, fn: () => { const bx = b.x + rand(-140, 140), by2 = b.y + rand(-90, 90); burst(bx, by2, [b.col, '#ffe9a8', '#ffffff'], 26, 420, 7); shockwave(bx, by2, 160, b.col); G.parts.push({ k: 'smoke', x: bx, y: by2, vx: rand(-30, 30), vy: rand(-60, -20), life: 1.4, max: 1.4, r: 30, c: '#3a2060', drag: 1 }); Snd.play('explode', { size: 1.1, pan: Snd.panX(bx) }); } });
  };
}

// ===== 8. planetas com atmosfera e sombra; neblina baixa =====
World.planetSprite = function (pal, R) {
  const key = pal.join('|') + '|' + Math.round(R / 3); this._ps = this._ps || {}; if (this._ps[key]) return this._ps[key];
  const [c0, c1, c2] = pal, S = Math.ceil(R * 2.5), cv2 = document.createElement('canvas'); cv2.width = cv2.height = S; const c = cv2.getContext('2d'); c.translate(S / 2, S / 2);
  const g = c.createRadialGradient(-R * .35, -R * .35, R * .05, 0, 0, R * 1.05); g.addColorStop(0, c0); g.addColorStop(.45, c1); g.addColorStop(1, c2); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip();
  c.globalAlpha = .18; c.fillStyle = c0; for (let i = -2; i <= 2; i++) c.fillRect(-R, i * R * .34, R * 2, R * .09);
  c.globalAlpha = 1; const sh = c.createRadialGradient(R * .55, R * .55, R * .2, R * .35, R * .35, R * 1.3); sh.addColorStop(0, 'rgba(0,0,12,0)'); sh.addColorStop(1, 'rgba(0,0,12,.65)'); c.fillStyle = sh; c.fillRect(-R, -R, R * 2, R * 2);
  if (pal[1].length && (R * 7 | 0) % 2) { c.fillStyle = '#ffe9a8'; for (let i = 0; i < 16; i++) { const a = .2 + (Math.sin(i * 12.9 + R) * .5 + .5) * 1.3, rr = R * (.35 + (Math.sin(i * 7.7) * .5 + .5) * .55); c.globalAlpha = .5; c.fillRect(Math.cos(a) * rr * .85 + R * .1, Math.sin(a) * rr * .85 + R * .1, 2, 2); } }
  c.restore(); c.globalAlpha = 1; c.lineCap = 'round'; c.strokeStyle = c0; c.globalAlpha = .45; c.lineWidth = R * .05; c.beginPath(); c.arc(0, 0, R * 1.01, Math.PI * .8, Math.PI * 1.55); c.stroke();
  c.globalAlpha = .18; c.lineWidth = R * .16; c.beginPath(); c.arc(0, 0, R * 1.03, Math.PI * .85, Math.PI * 1.5); c.stroke();
  return this._ps[key] = cv2;
};
World.drawPlanet = function (p, cx) {
  const [c0, c1, c2, hasRing] = p.pal; ctx.save(); ctx.translate(p.x - cx * p.par, p.y); ctx.rotate(p.tilt + Math.sin(this.t * .15 + p.ph) * .04); ctx.globalAlpha = p.a;
  const R = p.r, rx = R * 1.72, ry = R * .47;
  const ring = front => { ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); ctx.lineWidth = Math.max(2, R * .045); ctx.lineCap = 'round'; ctx.strokeStyle = front ? '#e2d4ff' : 'rgba(226,212,255,.55)'; ctx.stroke(); };
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 1.9, c1, .35); ctx.restore();
  if (hasRing) ring(false);
  const S = Math.ceil(R * 2.5); ctx.drawImage(this.planetSprite(p.pal, R), -S / 2, -S / 2);
  if (hasRing) { ring(true); ctx.save(); ctx.beginPath(); ctx.rect(-rx - 4, -ry - 4, rx * 2 + 8, ry + 4); ctx.arc(0, 0, R, 0, TAU); ctx.restore(); }
  ctx.restore();
};
{ // gradientes de fundo e de pedras reaproveitados (desempenho)
  const ss = World.setStage;
  World.setStage = function (pal) { ss.call(this, pal); const c = document.createElement('canvas'); c.width = 8; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, pal.top); g.addColorStop(1, pal.bot); x.fillStyle = g; x.fillRect(0, 0, 8, 256); this.bgC = c; this._ps = {}; };
  const dr = World.drawRock;
  World.drawRock = function (k, cx) {
    ctx.save(); ctx.translate(k.x - cx * k.par, k.y); ctx.rotate(k.rot); ctx.globalAlpha = k.a;
    if (!k.g) { k.g = ctx.createLinearGradient(-k.r, -k.r, k.r, k.r); k.g.addColorStop(0, this.pal.rock0); k.g.addColorStop(1, this.pal.rock1); }
    ctx.beginPath(); k.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = k.g; ctx.fill(); ctx.lineWidth = Math.max(1, k.r * .06); ctx.strokeStyle = this.pal.rim; ctx.stroke(); ctx.restore();
  };
}
Visual4.fog = function () {
  if (QL() < 2 || !World.pal) return; const t = World.t, c = World.pal.dust;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) { const x = ((t * (7 + i * 3) + i * 420) % (W + 900)) - 450, y = H * (.18 + i * .22) + Math.sin(t * .2 + i) * 20; ctx.save(); ctx.translate(x, y); ctx.scale(3.4, .62); drawGlow(0, 0, 170, c, .07); ctx.restore(); }
  ctx.restore();
};

// ===== 9/10. titulo: camera que avanca e nave que passa voando =====
{
  const tb = Screens.titleBackdrop;
  Screens.titleBackdrop = function () {
    if (World.t - (Visual4.titleSeen ?? -9) > .5) Visual4.titleAt = World.t; Visual4.titleSeen = World.t;
    const tt = World.t - Visual4.titleAt, z = 1 + .2 * (1 - easeOut(clamp(tt / 4.5, 0, 1)));
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); tb.call(this); ctx.restore();
    const u = (tt - 1.6) / 2.4;
    if (u > 0 && u < 1) {
      const pos = v => [-80 + v * (W + 160), H * .86 - v * H * .72 + Math.sin(v * 3.2) * 36];
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let k = 0; k < 14; k++) { const a = pos(Math.max(0, u - k * .012)), b = pos(Math.max(0, u - (k + 1) * .012)); ctx.globalAlpha = (1 - k / 14) * .7; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 9 * (1 - k / 14); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      ctx.restore();
      const [px, py] = pos(u), [qx, qy] = pos(u + .01); ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(qy - py, qx - px) + Math.PI / 2); Art.ship(0, 0, { vx: 0, t: World.t, scale: .38, boost: 1, lookx: 0, looky: -1, blinkT: 0 }); ctx.restore();
    }
  };
}
