'use strict';
// ---------- acabamento grafico 36: mortes por tipo de inimigo, luz dos tiros, cometas e tempestades, poeira em primeiro plano,
// camera lenta na morte de chefe, aberracao nas pancadas, coracao que quebra, rastro reativo ao combo e iris ao entrar na fase ----------
const Visual36 = { comets: [], dust: [], ct: 8, st: 6, bolt: null, flash: 0, slow: 0 };
const hexOk = c => typeof c === 'string' && c.length === 7 && c[0] === '#';

// ---------- mortes diferentes por tipo ----------
{
  const ke = killEnemy;
  killEnemy = function (e, byPlayer) {
    const was = !e.dead, x = e.x, y = e.y, r = e.rad || 24, type = e.type, col = hexOk(e.glow) ? e.glow : '#ff8a1f';
    const res = ke(e, byPlayer);
    if (was && e.dead && QL() >= 1) try {
      switch (type) {
        case 'drone': case 'bit': shedDebris(x, y, 6, ['#ffd37a', '#ff9a2a', '#b8520a'], 300, 8); burst(x, y, ['#fff1a8', '#ffb340'], 8, 220, 4); break;
        case 'zig': for (let i = 0; i < 7; i++) { const a = rand(0, TAU); G.parts.push({ x, y, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, life: .5, max: .5, r: rand(3, 6), c: i % 2 ? '#9fe8ff' : '#2b7bff', drag: 2 }); } sparks(x, y, '#9fe8ff', 12, 380); shockwave(x, y, r * 2.2, '#2b7bff'); break;
        case 'kami': burst(x, y, ['#ff4a6e', '#ffb340', '#fff1a8'], 22, 360, 7); shockwave(x, y, r * 3, '#ff4a6e'); shake(6); break;
        case 'shooter': sparks(x, y, '#ff4aa0', 14, 320); shedDebris(x, y, 5, ['#ff4aa0', '#4a1040'], 260, 9); shockwave(x, y, r * 2, '#ff4aa0'); break;
        case 'tank': shedDebris(x, y, 12, ['#ff8a1f', '#5a2a08', '#c8a070'], 360, 13); burst(x, y, ['#ffb340', '#fff1a8'], 24, 420, 8); shockwave(x, y, r * 3.5, '#ff8a1f'); shake(10); break;
        case 'mine': shockwave(x, y, r * 4, '#ff4a4a'); shockwave(x, y, r * 2.6, '#ffb340'); burst(x, y, ['#ff4a4a', '#ffd36a'], 16, 330, 6); break;
        case 'shield': for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; G.parts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, life: .6, max: .6, r: 5, c: '#7fe0ff', drag: 1.6 }); } shockwave(x, y, r * 2.4, '#7fe0ff'); break;
        case 'captain': shedDebris(x, y, 14, [col, '#2a1040', '#ffd36a'], 420, 14); burst(x, y, [col, '#fff1a8'], 30, 460, 9); shockwave(x, y, r * 4, col); shake(14); break;
        default: if (r > 30) shockwave(x, y, r * 2.5, col);
      }
    } catch (err) { }
    return res;
  };
}

// ---------- luz dos tiros nos inimigos e no cenario ----------
{
  const vd = Visual13.draw;
  Visual13.draw = function () {
    vd.call(this);
    if (QL() < 2 || G.state !== 'play') return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    let n = 0; for (const b of G.pb) { if (b.dead || n++ > 36) continue; const c = hexOk(b.c) ? b.c : '#b98cff'; drawGlow(b.x, b.y, 54 + (b.r || 5) * 3, c, .09); }
    for (const e of G.enemies) if (!e.dead && e.hit > 0) drawGlow(e.x, e.y, (e.rad || 24) * 2.4, '#ffffff', Math.min(.35, e.hit * 2));
    ctx.restore();
  };
}

// ---------- cometas, tempestades e poeira em primeiro plano ----------
Visual36.update = function (dt) {
  if (G.state !== 'play' || !G.stage) return;
  Visual36.ct -= dt; if (Visual36.ct <= 0) { Visual36.ct = rand(10, 19); const l = Math.random() < .5, sp = rand(520, 820); Visual36.comets.push({ x: l ? -120 : W + 120, y: rand(40, 340), vx: (l ? 1 : -1) * sp, vy: rand(110, 260), t: 0, c: pick(['#9fe8ff', '#ffe9a8', '#ffb3e6']) }); }
  for (const c of Visual36.comets) { c.x += c.vx * dt; c.y += c.vy * dt; c.t += dt; } Visual36.comets = Visual36.comets.filter(c => c.x > -300 && c.x < W + 300 && c.y < H + 100);
  if ([2, 5, 8].includes(G.stage.id)) { Visual36.st -= dt; if (Visual36.st <= 0) { Visual36.st = rand(6, 13); Visual36.flash = .22; let x = rand(100, W - 100), y = -10; const pts = [[x, y]]; while (y < rand(250, 480)) { x += rand(-50, 50); y += rand(30, 70); pts.push([x, y]); } Visual36.bolt = pts; } }
  Visual36.flash = Math.max(0, Visual36.flash - dt);
  if (!Visual36.dust.length) for (let i = 0; i < 16; i++) Visual36.dust.push({ x: rand(0, W), y: rand(0, H), v: rand(520, 900), l: rand(30, 70), a: rand(.06, .16) });
  for (const d of Visual36.dust) { d.y += d.v * dt * (1 + (G.boss ? .2 : 0)); if (d.y > H + 80) { d.y = -80; d.x = rand(0, W); } }
};
{
  const up = Game.updatePlay; Game.updatePlay = function (dt) { up.call(this, dt); Visual36.update(dt); };
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (QL() < 1) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const c of Visual36.comets) { const L = 260, a = Math.atan2(c.vy, c.vx), g = ctx.createLinearGradient(c.x, c.y, c.x - Math.cos(a) * L, c.y - Math.sin(a) * L); g.addColorStop(0, c.c); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.globalAlpha = .75; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x - Math.cos(a) * L, c.y - Math.sin(a) * L); ctx.stroke(); ctx.globalAlpha = 1; drawGlow(c.x, c.y, 46, c.c, .7); drawGlow(c.x, c.y, 16, '#ffffff', .9); }
    if (Visual36.flash > 0) { ctx.globalAlpha = Visual36.flash * 1.6; ctx.fillStyle = '#c8d8ff'; ctx.fillRect(0, 0, W, H); if (Visual36.bolt) { ctx.globalAlpha = Math.min(1, Visual36.flash * 5); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.shadowColor = '#9fb8ff'; ctx.shadowBlur = 24; ctx.beginPath(); Visual36.bolt.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); } }
    ctx.restore();
  };
  const fg = Visual12.fg;
  Visual12.fg = function () {
    fg.call(this); if (QL() < 2 || G.state !== 'play') return;
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; for (const d of Visual36.dust) { ctx.globalAlpha = d.a; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y - d.l); ctx.stroke(); } ctx.restore();
  };
}

// ---------- camera lenta na morte de chefe e aberracao nas pancadas ----------
{
  const gu = Game.update;
  Game.update = function (dt) { if (Visual36.slow > 0) { Visual36.slow -= dt; dt *= .35; } return gu.call(this, dt); };
  const bd = Game.bossDefeated; Game.bossDefeated = function () { Visual36.slow = .5; G.zoom = Math.max(G.zoom || 0, .05); return bd.call(this); };
  const ov = Visual.overlay;
  Visual.overlay = function () {
    ov.call(this);
    if (QL() >= 2 && G.state === 'play' && ((G.hurtFlash || 0) > .25 || (G.flash || 0) > .55)) {
      const k = Math.max(G.hurtFlash || 0, (G.flash || 0) - .3), o = 6 * k * (cv.width / W); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.min(.35, k * .4); ctx.globalCompositeOperation = 'screen'; ctx.drawImage(cv, o, 0); ctx.drawImage(cv, -o, 0); ctx.restore();
    }
  };
}

// ---------- coracao que quebra ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const p = G.player; if (!p) return;
    if (Visual36.hp !== undefined && p.hp < Visual36.hp && p.maxHp) { const hsp = Math.min(38, 520 / Math.max(1, p.maxHp)); for (let i = p.hp; i < Visual36.hp; i++) for (let k = 0; k < 8; k++) { const a = rand(0, TAU); (Visual36.shards = Visual36.shards || []).push({ x: 24 + i * hsp + 15, y: 66, vx: Math.cos(a) * rand(60, 180), vy: Math.sin(a) * rand(60, 180) - 60, t: 0 }); } }
    Visual36.hp = p.hp;
    if (Visual36.shards && Visual36.shards.length) { ctx.save(); ctx.fillStyle = '#ff5f8f'; for (const s of Visual36.shards) { s.t += 1 / 60; s.vy += 500 / 60; s.x += s.vx / 60; s.y += s.vy / 60; ctx.globalAlpha = Math.max(0, 1 - s.t / .7); ctx.fillRect(s.x - 3, s.y - 3, 6, 6); } ctx.restore(); Visual36.shards = Visual36.shards.filter(s => s.t < .7); }
  };
}

// ---------- rastro reativo ao combo ----------
{
  const tf = Visual29.trailFx;
  Visual29.trailFx = function (id, x, y, t, P, rate) { const c = G.combo || 0; tf.call(this, id, x, y, t, P, Math.min(1, rate * (1 + c / 30))); if (c >= 20) tf.call(this, id, x, y, t, P, rate); if (c >= 45) tf.call(this, id, x, y, t, P, rate); };
}

// ---------- iris ao entrar na fase ----------
setTimeout(() => {
  const rd = render;
  render = function () {
    rd();
    if (Trans.t < .55 && G.state === 'play' && QL() >= 1) { const k = clamp(Trans.t / .55, 0, 1), R = Math.hypot(W, H) * .5 * (k * k * (3 - 2 * k)); ctx.save(); ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); ctx.fillStyle = '#05010f'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, H / 2, R, 0, TAU, true); ctx.fill('evenodd'); ctx.restore(); }
  };
}, 0);
