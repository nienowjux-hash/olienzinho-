'use strict';
// ---------- polimento grafico: inimigos, tiros, nave, chefes, fundos por fase, eventos e cenas ----------
const Visual = {};
const hsh = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ===== inimigos: matiz por fase, propulsores e pose de ataque =====
{
  const base = Art.enemy;
  const HUE = [0, -17, 29, -31, 90, 129];
  Art.enemy = function (e) {
    const st = G.stage ? G.stage.id : 0, hue = HUE[st] || 0, r = e.rad, t = World.t;
    // propulsor atras (so quem se move)
    if (['drone', 'zig', 'kami', 'bit', 'shield', 'healer'].includes(e.type) && e.mode !== 'lock') {
      const fl = r * (.55 + Math.random() * .5) * (e.mode === 'hover' ? .6 : 1);
      ctx.save(); ctx.translate(e.x, e.y - r * .9); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, 0, 0, -fl); g.addColorStop(0, e.glow || '#ff8a1f'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = .75; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-r * .22, 0); ctx.lineTo(0, -fl); ctx.lineTo(r * .22, 0); ctx.fill(); ctx.restore();
    }
    // pose de ataque: o inimigo cresce um pouquinho e um anel fecha antes do tiro
    const chg = ['shooter', 'shield', 'tank', 'captain', 'healer'].includes(e.type) && e.mode === 'hover' && e.shootT < .45 ? 1 - e.shootT / .45 : 0;
    if (chg > 0) {
      ctx.save(); ctx.translate(e.x, e.y); ctx.globalCompositeOperation = 'lighter';
      const c = e.type === 'healer' ? '#7fffa0' : '#ff6a4a';
      ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.globalAlpha = chg * .8; ctx.beginPath(); ctx.arc(0, 0, r * (2.3 - 1.2 * chg), 0, TAU); ctx.stroke();
      drawGlow(0, 0, r * (1.4 + chg), c, chg * .5); ctx.restore();
    }
    if (e.type === 'kami' && e.mode === 'lock') { // mira do kamikaze
      const a = aimAt(e.x, e.y); ctx.save(); ctx.strokeStyle = 'rgba(255,74,110,.5)'; ctx.lineWidth = 2; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 60;
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(a) * 520, e.y + Math.sin(a) * 520); ctx.stroke(); ctx.restore();
    }
    ctx.save();
    if (chg > 0) { ctx.translate(e.x, e.y); ctx.scale(1 + chg * .08, 1 + chg * .08); ctx.translate(-e.x, -e.y); }
    if (hue && e.type !== 'dummy' && QL() >= 2) ctx.filter = 'hue-rotate(' + hue + 'deg)';
    base.call(this, e);
    ctx.restore();
  };
}

// ===== tiros inimigos: lanca, miçanga e orbe =====
Art.ebullet = function (b) {
  const sp = Math.hypot(b.vx, b.vy), sty = b.sty || (b.r >= 12 ? 'orb' : sp >= 240 && !b.acc ? 'lance' : 'bead'), t = World.t, R = b.r * 1.55;
  ctx.save(); ctx.globalAlpha = 1; ctx.translate(b.x, b.y);
  if (sty === 'lance') {
    ctx.rotate(Math.atan2(b.vy, b.vx));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 0, -R * 5.5, 0); g.addColorStop(0, b.c); g.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.globalAlpha = .6; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -R * .5); ctx.lineTo(-R * 5.5, 0); ctx.lineTo(0, R * .5); ctx.fill(); ctx.restore();
    ctx.fillStyle = 'rgba(14,4,36,.85)'; ctx.beginPath(); ctx.moveTo(R * 1.9, 0); ctx.lineTo(0, -R * .95); ctx.lineTo(-R * 1.1, 0); ctx.lineTo(0, R * .95); ctx.closePath(); ctx.fill();
    ctx.fillStyle = b.c; ctx.beginPath(); ctx.moveTo(R * 1.6, 0); ctx.lineTo(0, -R * .72); ctx.lineTo(-R * .9, 0); ctx.lineTo(0, R * .72); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffe9b0'; ctx.beginPath(); ctx.moveTo(R * 1.1, 0); ctx.lineTo(0, -R * .3); ctx.lineTo(-R * .5, 0); ctx.lineTo(0, R * .3); ctx.closePath(); ctx.fill();
  } else if (sty === 'orb') {
    const pul = 1 + Math.sin(t * 10 + b.x * .03) * .1;
    ctx.fillStyle = 'rgba(14,4,36,.85)'; ctx.beginPath(); ctx.arc(0, 0, R * pul + 4, 0, 7); ctx.fill();
    ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(0, 0, R * pul, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(0, 0, R * .6, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, R * .28, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,200,.8)'; ctx.lineWidth = 2; ctx.rotate(t * 4); for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(R * 1.1, 0); ctx.lineTo(R * 1.5, 0); ctx.stroke(); }
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = b.c; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(0, 0, R * 1.8 + Math.sin(t * 8) * 3, 0, 7); ctx.stroke(); drawGlow(0, 0, R * 3, b.c, .5);
  } else {
    const pul = 1 + Math.sin(t * 18 + b.x * .05) * .08;
    ctx.fillStyle = 'rgba(14,4,36,.85)'; ctx.beginPath(); ctx.arc(0, 0, R * pul + 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(0, 0, R * pul, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(0, 0, R * .62, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-R * .12, -R * .12, R * .3, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = b.c; ctx.globalAlpha = .28; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, R * 1.9, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; drawGlow(0, 0, R * 2.4, b.c, .45);
  }
  if (Save.data.settings.outline || Save.data.settings.contrast) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, R * 1.3, 0, 7); ctx.stroke(); }
  ctx.restore();
};

// ===== nave, dano e camera =====
Visual.update = function (dt) {
  const p = G.player; if (!p || p.dead) return;
  if (p.hp <= Math.max(2, p.maxHp * .4) && G.state === 'play') { // nave machucada solta fumaca e fagulhas
    if (Math.random() < dt * 9) G.parts.push({ k: 'smoke', x: p.x + rand(-8, 8), y: p.y + rand(0, 14), vx: rand(-20, 20), vy: rand(40, 90), life: .8, max: .8, r: rand(6, 11), c: '#2a1450', drag: 1 });
    if (Math.random() < dt * 3) sparks(p.x + rand(-12, 12), p.y + rand(-10, 16), '#ffb340', 4, 200);
  }
};
{
  const hp0 = hurtPlayer;
  hurtPlayer = function (d) {
    const p = G.player, before = p ? p.hp : 0; hp0(d);
    if (p && p.hp < before) { shedDebris(p.x, p.y, 6, ['#9a63ff', '#e2d4ff', '#ffb340'], 320, 7); G.zoom = Math.max(G.zoom || 0, .022); }
  };
}
{
  const bd = Boss.prototype.damage;
  Boss.prototype.damage = function (n, crit) { // pedacos do chefe saltam conforme ele apanha
    bd.call(this, n, crit);
    if (this.state !== 'fight') return;
    this._ch = this._ch ?? this.maxHp;
    if (this._ch - this.hp > this.maxHp * .06) { this._ch = this.hp; const rr = (this.rad || 100) * .6; shedDebris(this.x + rand(-rr, rr), this.y + rand(-30, 30), 3, [this.dark || '#3a2060', this.col, '#ffe9a8'], 300, 12); sparks(this.x + rand(-rr, rr), this.y + rand(-30, 30), '#ffe9a8', 8, 300); }
  };
}
Visual.bossAura = function (b) {
  G.lastBoss = { x: b.x, y: b.y, col: b.col };
  if (b.state === 'dying') return;
  const t = World.t, ph = b.phase || 0, R = (b.rad || 120);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  drawGlow(b.x, b.y, R * 2.6, b.col || '#ff8a5f', .09 + ph * .045 + Math.sin(t * 3) * .02);
  if (ph > 0) drawGlow(b.x, b.y, R * 2, '#ff3a2a', .05 * ph + Math.sin(t * 6) * .015);
  for (let i = 0; i < ph + 1; i++) { const a = t * (1.2 + i * .4) + i * 2.1; drawGlow(b.x + Math.cos(a) * R * 1.15, b.y + Math.sin(a) * R * .7, 22, b.col || '#ff8a5f', .5); }
  ctx.restore();
};

// ===== fundos vivos por fase =====
Visual.biome = function () {
  if (QL() < 1 || Save.data.settings.contrast) return;
  const st = G.stage ? G.stage.id : 0, t = World.t;
  ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter';
  if (st === 0) { // esporos de luz
    for (let i = 0; i < 34; i++) { const x = hsh(i) * W + Math.sin(t * .3 + i) * 30, y = (hsh(i + 99) * H + t * (8 + hsh(i + 5) * 16)) % H, r = 1.5 + hsh(i + 7) * 3;
      ctx.globalAlpha = (.25 + .3 * Math.sin(t * 1.5 + i)) * (.5 + hsh(i + 3) * .5); ctx.fillStyle = i % 3 ? '#cdb8ff' : '#9fe8ff'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 3; i++) drawGlow(W * (.2 + i * .3) + Math.sin(t * .2 + i) * 60, H * (.3 + .25 * Math.sin(t * .13 + i * 2)), 150, '#7a3dff', .08);
  } else if (st === 1) { // rochas distantes e clarões ao longe
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 6; i++) { const sp = 12 + hsh(i) * 22, y = ((t * sp + i * 190) % (H + 300)) - 150, x = hsh(i + 20) * W, s = 60 + hsh(i + 9) * 90;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * .05 * (i % 2 ? 1 : -1) + i); ctx.globalAlpha = .38; ctx.fillStyle = '#12061a'; ctx.strokeStyle = 'rgba(255,170,100,.4)'; ctx.lineWidth = 3;
      ctx.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, rr = s * (.7 + hsh(i * 7 + k) * .5); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.globalCompositeOperation = 'lighter'; const fb = Math.floor(t / 4.5), ft = t % 4.5;
    if (ft < .5) drawGlow(hsh(fb) * W, hsh(fb + 40) * H * .6, 90 * (1 - ft * 1.2), '#ffb340', .5 * (1 - ft * 2));
  } else if (st === 2) { // nuvens, chuva fina e veias de raio
    for (let i = 0; i < 5; i++) drawGlow(((t * (8 + i * 3) + i * 300) % (W + 600)) - 300, H * (.15 + i * .18), 260, i % 2 ? '#ff3d9a' : '#7a3dff', .07);
    ctx.strokeStyle = 'rgba(190,220,255,.5)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 34; i++) { const x = (hsh(i) * (W + 300) + t * 40) % (W + 300) - 150, y = (hsh(i + 50) * H + t * 700) % (H + 80) - 40; ctx.globalAlpha = .1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y + 26); ctx.stroke(); }
    const lk = Math.floor(t * 1.4); if (hsh(lk) > .9) { ctx.globalAlpha = (1 - (t * 1.4 - lk)) * .4; ctx.strokeStyle = '#d8e8ff'; ctx.lineWidth = 2; ctx.beginPath(); let x = hsh(lk + 3) * W, y = 0; ctx.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (hsh(lk * 9 + k) - .5) * 70; y += 40 + hsh(lk + k) * 40; ctx.lineTo(x, y); } ctx.stroke(); }
  } else if (st === 3) { // sol enorme, calor e brasas
    drawGlow(90, -40, 560, '#ff9a30', .28 + Math.sin(t * 1.2) * .03); drawGlow(90, -40, 300, '#ffe9a8', .22);
    ctx.strokeStyle = '#ffcf8a'; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * .5 + Math.sin(t * .3 + i) * .04; ctx.globalAlpha = .08; ctx.beginPath(); ctx.moveTo(90 + Math.cos(a) * 160, -40 + Math.sin(a) * 160); ctx.lineTo(90 + Math.cos(a) * 900, -40 + Math.sin(a) * 900); ctx.stroke(); }
    for (let i = 0; i < 4; i++) { const y = H * (.2 + i * .2) + Math.sin(t * .8 + i) * 18; ctx.globalAlpha = .04; ctx.fillStyle = '#ff8a30'; ctx.fillRect(0, y, W, 28); }
    for (let i = 0; i < 26; i++) { const x = hsh(i) * W + Math.sin(t + i) * 24, y = H - ((t * (30 + hsh(i + 8) * 50) + hsh(i + 4) * H) % H); ctx.globalAlpha = .2 + hsh(i + 2) * .3; ctx.fillStyle = i % 2 ? '#ff7a20' : '#ffd36a'; ctx.beginPath(); ctx.arc(x, y, 1.5 + hsh(i + 6) * 2, 0, TAU); ctx.fill(); }
  } else if (st === 4) { // cascos a deriva e luzes fantasma
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4; i++) { const sp = 10 + hsh(i) * 14, y = ((t * sp + i * 260) % (H + 400)) - 200, x = (hsh(i + 30) * .8 + .1) * W, s = 90 + hsh(i + 5) * 60;
      ctx.save(); ctx.translate(x, y); ctx.rotate(.4 + i * 1.3 + Math.sin(t * .1 + i) * .1); ctx.globalAlpha = .42; ctx.fillStyle = '#0a1024'; ctx.strokeStyle = 'rgba(150,190,255,.45)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(-s * .4, -s * .28); ctx.lineTo(s * .7, -s * .18); ctx.lineTo(s, 0); ctx.lineTo(s * .7, s * .2); ctx.lineTo(-s * .5, s * .3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = .5; ctx.fillStyle = '#9fd0ff'; for (let k = 0; k < 4; k++) if (hsh(i * 5 + k + Math.floor(t * .5)) > .45) ctx.fillRect(-s * .3 + k * s * .22, -s * .06, 5, 4); ctx.restore(); }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) drawGlow(hsh(i) * W + Math.sin(t * .4 + i * 1.7) * 60, (hsh(i + 60) * H + t * 6) % H, 26, '#9fd0ff', .14 + .1 * Math.sin(t * 2 + i));
  } else if (st === 5) { // tentaculos nas bordas e rachaduras de luz
    ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { const left = i % 2 === 0, y0 = H * (.1 + .16 * i); ctx.beginPath();
      for (let k = 0; k <= 12; k++) { const f = k / 12, x = (left ? 0 : W) + (left ? 1 : -1) * f * (180 + hsh(i) * 120), y = y0 + Math.sin(t * .8 + i + f * 4) * 34 * f + f * f * 90; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.strokeStyle = 'rgba(154,99,255,.35)'; ctx.lineWidth = 14; ctx.stroke(); ctx.strokeStyle = 'rgba(2,0,10,.8)'; ctx.lineWidth = 9; ctx.stroke(); }
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#c04aff'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) { const pu = .5 + .5 * Math.sin(t * 1.3 + i * 1.9); ctx.globalAlpha = .08 + pu * .12; ctx.beginPath(); let x = hsh(i + 70) * W, y = hsh(i + 80) * H; ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (hsh(i * 11 + k) - .5) * 60; y += (hsh(i * 13 + k) - .5) * 60; ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.save(); ctx.translate(W / 2, H * .45); ctx.rotate(t * .06); ctx.globalAlpha = .06; ctx.strokeStyle = '#e8d0ff'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, 160 + i * 70, i, i + 1.2); ctx.stroke(); } ctx.restore();
  }
  ctx.restore();
};

// ===== aviso dramatico antes dos eventos =====
{
  const EVC = { rain: '#9ad8ff', mines: '#ff6a4a', storm: '#ff7ac8', flare: '#ffb340', worm: '#7fe0ff', giant: '#c04aff' };
  const es = Events.start;
  Events.start = function (name) { G.evWarn = 1.6; G.evCol = EVC[name] || '#ffb340'; return es.call(this, name); };
}
Visual.overlay = function () {
  if (!(G.evWarn > 0) || G.state !== 'play') return;
  G.evWarn -= 1 / 60; const k = clamp(G.evWarn / 1.6, 0, 1), env = Math.sin((1 - k) * Math.PI), t = World.t;
  ctx.save(); ctx.fillStyle = 'rgba(3,1,11,' + (.3 * env) + ')'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = G.evCol;
  for (let i = 0; i < 40; i++) { const a = hsh(i) * TAU + t * .6, r = 80 + k * (300 + hsh(i + 1) * 500); ctx.globalAlpha = env * .5; ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r * .6, 2.2, 0, TAU); ctx.fill(); }
  const g = ctx.createLinearGradient(0, 0, 0, 60); g.addColorStop(0, G.evCol); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = env * .35; ctx.fillStyle = g; ctx.fillRect(0, 0, W, 60); ctx.translate(0, H); ctx.scale(1, -1); ctx.fillRect(0, 0, W, 60);
  ctx.restore();
};

// ===== menus: moldura fina cinematografica =====
Screens.thinFrame = function () {
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, H * .95); v.addColorStop(0, 'rgba(3,1,11,0)'); v.addColorStop(1, 'rgba(3,1,11,.5)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, 16); ctx.fillRect(0, H - 16, W, 16);
  ctx.fillStyle = 'rgba(255,179,64,.75)'; ctx.fillRect(0, 16, W, 1.5); ctx.fillRect(0, H - 17.5, W, 1.5);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(W / 2, 46, 280, '#8b4dff', .1); ctx.restore();
};
for (const n of ['hangar', 'achievements', 'modes', 'rank']) { const f = Screens[n]; Screens[n] = function () { f.call(this); this.thinFrame(); }; }

// ===== cenas da historia: zoom lento e particulas de luz =====
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const S = G.story, key = S && S.pages[S.i] ? (S.pages[S.i].scene || 'x') : 'x';
    if (Visual.kbKey !== key) { Visual.kbKey = key; Visual.kbT = 0; } Visual.kbT = (Visual.kbT || 0) + 1 / 60;
    const z = 1 + .05 * Math.min(1, Visual.kbT / 16);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2 + Math.sin(World.t * .15) * 5, -H / 2); sb.call(this); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 28; i++) { const x = hsh(i + 200) * W + Math.sin(World.t * .3 + i) * 24, y = H - ((World.t * (10 + hsh(i + 210) * 24) + hsh(i + 220) * H) % H); ctx.globalAlpha = .12 + .2 * hsh(i + 230) * (.5 + .5 * Math.sin(World.t * 2 + i)); ctx.fillStyle = '#e2d4ff'; ctx.beginPath(); ctx.arc(x, y, 1.2 + hsh(i + 240) * 2, 0, TAU); ctx.fill(); }
    const g = ctx.createLinearGradient(W, 0, W * .5, H * .6); g.addColorStop(0, 'rgba(255,200,140,.08)'); g.addColorStop(1, 'rgba(255,200,140,0)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };
}
