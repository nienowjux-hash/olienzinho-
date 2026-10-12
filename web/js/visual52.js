'use strict';
// ---------- 52: "game feel" (tremor por arma, hit-stop), fitas de luz nos tiros, poses nas conversas, campo de teste no Hangar,
// avisos de entrada, combo em marcos, profundidade, resumo da fase, temas por modo, brilhos suaves e letreiros animados ----------
const Visual52 = { combo: 0, mk: null, trail: [], arena: null };
const hh52 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const hx52 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';

// ---------- formas diferentes de casco por skin ----------
for (const [id, o] of Object.entries({ rose: { fs: 1.38 }, cyan: { bw: .92, nose: 1.25 }, solar: { fs: 1.2, nose: 1.1 }, shadow: { bw: 1.1, fs: .9 }, gold: { bw: 1.06, fs: 1.18, nose: 1.1 } })) { const sk = SKINS.find(s => s.id === id); if (sk) Object.assign(sk.pal, o); }

// ---------- tremor com estilo por arma + hit-stop em critico ----------
Visual52.shakeStyle = () => { const w = G.player && G.player.weapon; return w === 'cannon' ? 'heavy' : w === 'chain' ? 'jitter' : w === 'flame' ? 'rumble' : w === 'laser' ? 'hum' : 'norm'; };
Visual52.shakeOff = function () {
  const a = G.shake * .55, st = Visual52.shakeStyle(), t = performance.now() / 1000;
  if (st === 'heavy') return [rand(-.25, .25) * a, Math.sin(t * 40) * a * 1.15];
  if (st === 'jitter') return [rand(-1.3, 1.3) * a, rand(-1.3, 1.3) * a * .7];
  if (st === 'rumble') return [Math.sin(t * 55) * a * .8, Math.cos(t * 47) * a * .8];
  if (st === 'hum') return [Math.sin(t * 80) * a * .5, rand(-.4, .4) * a];
  return [rand(-1, 1) * a, rand(-1, 1) * a];
};
{
  const ke = killEnemy;
  killEnemy = function (e, by) { const crit = e && e._dc; const r = ke(e, by); return r; };
}

// ---------- fitas de luz continuas atras dos tiros ----------
{
  const ap = Art.pbullet;
  Art.pbullet = function (b) {
    if (QL() >= 2 && !b.bee && !b.rock && b.kind !== 'flame') {
      const H = b._h = b._h || []; if (!H.length || Math.hypot(H[0][0] - b.x, H[0][1] - b.y) > 2) { H.unshift([b.x, b.y]); if (H.length > 9) H.pop(); }
      if (H.length > 2) { const c = hx52(b.c) ? b.c : '#b98cff'; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; for (let i = 1; i < H.length; i++) { const k = 1 - i / H.length; ctx.strokeStyle = c; ctx.globalAlpha = k * .5; ctx.lineWidth = Math.max(1.5, (b.kind === 'cannon' ? 14 : 6) * k); ctx.beginPath(); ctx.moveTo(H[i - 1][0], H[i - 1][1]); ctx.lineTo(H[i][0], H[i][1]); ctx.stroke(); } ctx.restore(); }
    }
    return ap.call(this, b);
  };
}
// esquiva: fantasmas ligados por uma fita da cor da skin
{
  const vd = Visual13.draw;
  Visual13.draw = function () {
    vd.call(this); const p = G.player; if (!p || QL() < 1 || G.state !== 'play') return;
    if (p.ghosts && p.ghosts.length > 1) { const sk = skinOf(Save.data.loadout.skin), c = sk && hx52(sk.pal.glow) ? sk.pal.glow : '#8b4dff'; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.strokeStyle = c; for (let i = 1; i < p.ghosts.length; i++) { const a = p.ghosts[i - 1], b = p.ghosts[i]; ctx.globalAlpha = Math.min(a.t, b.t) / .28 * .45; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } ctx.restore(); }
    // avisos de entrada: setas nas bordas para quem vem de fora da tela
    for (const e of G.enemies) { if (e.dead || e.y > 4 || e.age > 1.6) continue; const x = clamp(e.x, 24, W - 24); ctx.save(); ctx.globalAlpha = .55 + .35 * Math.sin(World.t * 12); ctx.fillStyle = e.type === 'kami' || e.type === 'hunter' ? '#ff4a5a' : '#ffcf6b'; ctx.beginPath(); ctx.moveTo(x - 11, 8); ctx.lineTo(x + 11, 8); ctx.lineTo(x, 26); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(14,4,28,.8)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
  };
}

// ---------- poses nas conversas: entrada deslizando, pulinho de alegria, tremor de susto e raiva ----------
{
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o) {
    if (G.state !== 'story' || !G.story || QL() < 1 || size < 150) return pd.call(this, who, x, y, size, o);
    const S = Visual52.sp = Visual52.sp && Visual52.sp.who === who ? Visual52.sp : { who, t0: World.t }, k = clamp((World.t - S.t0) / .38, 0, 1), mood = o && o.mood, t = World.t;
    ctx.save(); ctx.translate((1 - easeOut(k)) * -90, 0);
    if (k < 1) { const sc = 1 + Math.sin(k * Math.PI) * .06; ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y); }
    if (mood === 'happy') ctx.translate(0, -Math.abs(Math.sin(t * 5)) * 5); else if (mood === 'shock') ctx.translate(rand(-2.2, 2.2), rand(-1.5, 1.5)); else if (mood === 'angry') ctx.translate(Math.sin(t * 38) * 1.6, 0); else if (mood === 'sad') ctx.translate(0, 3);
    pd.call(this, who, x, y, size, o); ctx.restore();
  };
}

// ---------- combo em marcos ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    up.call(this, dt); const c = G.combo || 0; for (const m of [10, 25, 50, 100]) if (Visual52.combo < m && c >= m && G.state === 'play') { Visual52.mk = { t: 0, text: 'COMBO ' + m + '!', c: m >= 50 ? '#ff7ac8' : m >= 25 ? '#ffb340' : '#ffe9a8' }; shockwave(G.player.x, G.player.y, 260, Visual52.mk.c); } Visual52.combo = c;
  };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const m = Visual52.mk; if (!m) return; m.t += 1 / 60; if (m.t > 1.2) { Visual52.mk = null; return; }
    const k = m.t / 1.2, s = 1 + Math.max(0, 1 - m.t * 5) * .6, a = k < .2 ? 1 : 1 - (k - .2) / .8; ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, H * .3 - k * 30); ctx.scale(s, s); ctx.font = `900 64px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(14,4,28,.85)'; ctx.strokeText(m.text, 0, 0); ctx.shadowColor = m.c; ctx.shadowBlur = 24; ctx.fillStyle = m.c; ctx.fillText(m.text, 0, 0); ctx.restore();
  };
}

// ---------- profundidade: sombra de contato da nave/chefe e nevoas rapidas em primeiro plano ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (QL() < 2 || G.state === 'photo') return; const p = G.player; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.2)';
    if (p && !p.dead) { ctx.beginPath(); ctx.ellipse(p.x + 22, p.y + 66, 30, 9, 0, 0, TAU); ctx.fill(); }
    const b = G.boss; if (b && b.state !== 'intro' && !/Leviathan/.test(b.constructor.name)) { ctx.beginPath(); ctx.ellipse(b.x + 26, b.y + (b.rad || 100) * 1.05, (b.rad || 100) * 1.05, (b.rad || 100) * .22, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  };
  const fg = Visual12.fg;
  Visual12.fg = function () {
    fg.call(this); if (QL() < 2 || G.state !== 'play' || !G.stage) return; const c = hx52(G.stage.tint) ? G.stage.tint : '#b98cff', t = World.t; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const y = ((t * (90 + i * 50) + i * 420) % (H + 700)) - 350, x = W * (.2 + i * .3) + Math.sin(t * .3 + i) * 80; drawGlow(x, y, 320 + i * 40, c, .22); }
    ctx.restore();
  };
}

// ---------- vitoria: placas de conquistas da fase ----------
{
  const cl = Screens.clear;
  Screens.clear = function () {
    cl.call(this); if (QL() < 1 || !G.stats) return; const st = G.stats, b = [];
    if (st.hits === 0) b.push(['SEM DANO', '#7fe0a0']); if (st.maxCombo >= 25) b.push(['COMBO ' + st.maxCombo, '#ffb340']); if (st.minis >= 1) b.push([st.minis + ' MINICHEFE' + (st.minis > 1 ? 'S' : ''), '#ff8a5f']); if (G.bossDone && st.bossHit === 0) b.push(['CHEFE INTOCADO', '#ff7ac8']);
    const t = World.t; b.forEach(([lab, c], i) => { const x = 40, y = 190 + i * 54, k = easeOut(clamp((t - (G.clearAt || 0) - .6 - i * .25) / .4, 0, 1)); ctx.save(); ctx.globalAlpha = k; ctx.translate(-(1 - k) * 80, 0); UI.panel(x, y, 232, 42, { r: 21, fill: 'rgba(14,6,40,.82)', stroke: c }); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 22, y + 21, 7, 0, TAU); ctx.fill(); txt(lab, x + 40, y + 11, 17, '#fff', 'left', 900); ctx.restore(); });
  };
}

// ---------- tema visual por modo: moldura colorida e etiqueta ----------
{
  const ov = Visual.overlay;
  Visual.overlay = function () {
    ov.call(this); if (QL() < 1 || G.state !== 'play') return; let c = null, lab = '';
    if (G.exp) { c = '#ff8a5f'; lab = 'EXPEDIÇÃO'; } else if (G.tower) { c = '#ff4a6e'; lab = 'TORRE'; } else if (G.daily) { c = '#7fe0ff'; lab = 'DESAFIO DO DIA'; } else if (G.weekly) { c = '#9fe8ff'; lab = 'ARENA SEMANAL'; } else if (G.rush) { c = '#ff8a5f'; lab = 'CHEFES EM SEQUÊNCIA'; } else if (G.endless) { c = '#ffb340'; lab = 'INFINITO'; }
    if (!c) return; ctx.save(); ctx.strokeStyle = c; ctx.globalAlpha = .22 + .06 * Math.sin(World.t * 2); ctx.lineWidth = 6; ctx.strokeRect(3, 3, W - 6, H - 6); ctx.globalAlpha = .75; ctx.font = `900 12px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = c; ctx.fillText(lab, W / 2, 4); ctx.restore();
  };
}

// ---------- brilhos suaves (acessibilidade) ----------
{
  const dg = drawGlow;
  drawGlow = function (x, y, r, color, a = 1) { return dg(x, y, r, color, (Save.data.settings && Save.data.settings.softGlow ? a * .5 : a) * (typeof Visual55 !== 'undefined' ? Visual55.glowK : 1)); };
}

// ---------- letreiros dos banners com letras caindo ----------
{
  const od = Events.drawOverlay;
  Events.drawOverlay = function () {
    const b = this.banner; if (!b || QL() < 1) return od.call(this);
    this.banner = null; try { od.call(this); } finally { this.banner = b; }
    const a = Math.max(0, Math.min(1, b.t / .4, (3.2 - b.t) / .6)); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'top'; ctx.font = `900 46px ${FONT}`; const tw = ctx.measureText(b.title).width; let x = W / 2 - tw / 2;
    for (let i = 0; i < b.title.length; i++) { const ch = b.title[i], w = ctx.measureText(ch).width, k = clamp((b.t - i * .035) / .3, 0, 1), y = 100 - (1 - easeOut(k)) * 60; ctx.globalAlpha = a * k; ctx.shadowColor = b.c; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(ch, x, y); x += w; }
    ctx.shadowBlur = 0; ctx.globalAlpha = a * clamp((b.t - .4) / .4, 0, 1); ctx.fillStyle = b.c; ctx.font = `700 22px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(b.sub, W / 2, 156); ctx.restore();
  };
}

// ---------- campo de teste no Hangar (aba TESTE): nave com skin, rastro, aura e asas disparando a arma equipada ----------
Visual52.arenaInit = function () { Visual52.arena = { t: 0, bl: [], zaps: [], parts: [], tg: [{ x: 180, y: 120, f: 0, d: [] }, { x: 410, y: 90, f: 0, d: [] }, { x: 640, y: 130, f: 0, d: [] }], fire: 0, boomT: [] }; };
Visual34.teste = function () {
  const A = Visual52.arena || (Visual52.arenaInit(), Visual52.arena), ld = Save.data.loadout, t = World.t, dt = 1 / 60; A.t += dt;
  const ax = 70, ay = 140, aw = 800, ah = 470; UI.panel(ax, ay, aw, ah, { r: 22, fill: 'rgba(6,2,22,.85)' });
  ctx.save(); ctx.beginPath(); ctx.roundRect(ax + 4, ay + 4, aw - 8, ah - 8, 20); ctx.clip(); ctx.translate(ax, ay);
  // estrelas e grade
  ctx.strokeStyle = 'rgba(127,224,255,.06)'; for (let x = 0; x <= aw; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ah); ctx.stroke(); } for (let y = 0; y <= ah; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(aw, y); ctx.stroke(); }
  const shipX = aw / 2 + Math.sin(A.t * .9) * 260, shipY = ah - 90 + Math.sin(A.t * 1.7) * 14, vx = Math.cos(A.t * .9) * 234, w = ld.weapon, W_ = WEAPONS[w] || WEAPONS.violet, col = hx52(W_.c) ? W_.c : '#b98cff', cos = Save.data.cosm && Save.data.cosm.eq || {};
  // disparos simulados
  A.fire -= dt; if (A.fire <= 0) { A.fire = Math.max(.12, (W_.delay || 1) * .18);
    const mk = (o) => A.bl.push(Object.assign({ x: shipX, y: shipY - 40, vx: 0, vy: -640, w, c: col, life: 2, age: 0 }, o)), parts = w.startsWith('fz_') ? (W_.fz || [w]) : [w];
    for (const id of parts) { if (id === 'fan') for (let i = -2; i <= 2; i++) mk({ w: 'fan', vx: i * 120, vy: -560, c: '#ffb340' }); else if (id === 'cannon') mk({ w: 'cannon', kind: 'cannon', r: 18, vy: -330, c: '#ff7a4a' }); else if (id === 'boomerang') mk({ w: 'boomerang', kind: 'boom', r: 20, vy: -420, c: '#ffe9a8', boom: true }); else if (id === 'flame') for (let i = 0; i < 3; i++) mk({ w: 'flame', kind: 'flame', vx: rand(-60, 60), vy: -480, life: .5, l0: .5, c: '#ff8a30' }); else if (id === 'chain') { const tg = A.tg[Math.floor(Math.random() * 3)]; A.zaps.push({ a: [shipX, shipY - 40], b: [tg.x, tg.y], t: .22 }); tg.f = .2; } else if (id === 'laser') { A.laser = .14; } else for (let i = -1; i <= 1; i++) mk({ vx: i * 40, vy: -700 }); } }
  for (const b of A.bl) { b.age += dt; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; if (b.boom) { b.vy += 1100 * dt; if (b.vy > 420) b.life = 0; } if (b.kind === 'flame') b.life -= 0; for (const tg of A.tg) if (Math.hypot(b.x - tg.x, b.y - tg.y) < 44 && !b.dead) { b.dead = true; tg.f = .18; A.parts.push({ x: b.x, y: b.y, vx: rand(-90, 90), vy: rand(-90, 20), life: .4, c: col, r: 3 }); tg.d.push({ y: tg.y - 40, t: .7, v: (3 + Math.random() * 8).toFixed(1) }); } if (b.y < -20) b.life = 0; }
  A.bl = A.bl.filter(b => b.life > 0 && !b.dead); A.zaps = A.zaps.filter(z => (z.t -= dt) > 0); A.parts = A.parts.filter(p => (p.life -= dt) > 0);
  // alvos
  for (const tg of A.tg) { tg.f = Math.max(0, tg.f - dt); ctx.save(); ctx.translate(tg.x, tg.y); ctx.fillStyle = tg.f > 0 ? '#fff' : '#3a2a58'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ff7a5a'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = tg.f > 0 ? '#ff7a5a' : '#6a4a98'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore(); for (const d of tg.d) { d.t -= dt; ctx.globalAlpha = clamp(d.t * 2, 0, 1); txt(d.v, tg.x, d.y - (.7 - d.t) * 50, 16, '#ffe9a8', 'center', 900); ctx.globalAlpha = 1; } tg.d = tg.d.filter(d => d.t > 0); }
  // laser, raios e tiros
  if (A.laser > 0) { A.laser -= dt; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col; ctx.globalAlpha = .6; ctx.fillRect(shipX - 7, 0, 14, shipY - 40); ctx.fillStyle = '#fff'; ctx.globalAlpha = .9; ctx.fillRect(shipX - 2.5, 0, 5, shipY - 40); ctx.restore(); for (const tg of A.tg) if (Math.abs(tg.x - shipX) < 40) tg.f = .1; }
  for (const z of A.zaps) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 3; ctx.globalAlpha = z.t / .22; ctx.beginPath(); ctx.moveTo(z.a[0], z.a[1]); for (let i = 1; i < 6; i++) ctx.lineTo(z.a[0] + (z.b[0] - z.a[0]) * i / 6 + rand(-12, 12), z.a[1] + (z.b[1] - z.a[1]) * i / 6 + rand(-12, 12)); ctx.lineTo(z.b[0], z.b[1]); ctx.stroke(); ctx.restore(); }
  for (const b of A.bl) Art.pbullet(b); for (const p of A.parts) { ctx.fillStyle = p.c; ctx.globalAlpha = p.life * 2; ctx.fillRect(p.x, p.y, p.r, p.r); p.x += p.vx * dt; p.y += p.vy * dt; ctx.globalAlpha = 1; }
  // nave com tudo o que esta equipado
  Visual52.tp = Visual52.tp || []; if (cos.trail && cos.trail !== 'none') Visual29.trailFx(cos.trail, shipX, shipY, t, Visual52.tp, .7); for (const q of Visual52.tp) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; } Visual52.tp = Visual52.tp.filter(q => q.life > 0).slice(-90);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const q of Visual52.tp) drawGlow(q.x, q.y, q.r * 3, hx52(q.c) ? q.c : '#ffffff', clamp(q.life / q.max, 0, 1) * .8); ctx.restore();
  if (cos.aura && cos.aura !== 'none') Visual29.auraFx(cos.aura, shipX, shipY, t);
  Art.ship(shipX, shipY, { pal: skinOf(ld.skin).pal, vx, t, scale: 1.05, boost: .7, lookx: 0, looky: -.5, blinkT: Screens.blinkAt(t), inv: 0 });
  ctx.restore();
  // painel lateral com o que esta equipado
  const px = 890, pw = 320; UI.panel(px, ay, pw, ah, { r: 22 }); txt('EM USO', px + pw / 2, ay + 14, 16, '#ffb340', 'center', 900);
  const lines = [['Arma', W_.name], ['Skin', skinOf(ld.skin).name], ['Rastro', (COSM.trail.items.find(i => i[0] === (cos.trail || 'none')) || [0, 'Padrão'])[1]], ['Aura', (COSM.aura.items.find(i => i[0] === (cos.aura || 'none')) || [0, 'Nenhuma'])[1]], ['Asas', (COSM.wing.items.find(i => i[0] === (cos.wing || 'none')) || [0, 'Sem asas'])[1]]];
  lines.forEach(([k, v], i) => { const y = ay + 56 + i * 56; txt(k, px + 24, y, 14, '#8a7fb0', 'left', 800); txt(String(v).slice(0, 22), px + 24, y + 20, 20, '#fff', 'left', 900); });
  UI.wrap('O campo mostra a sua nave disparando a arma equipada, com rastro, aura e asas.', px + 24, ay + 330, pw - 48, 19, 14, '#cdb8ff');
  if (UI.button('tgcos', px + 24, ay + 400, pw - 48, 44, 'MUDAR COSMÉTICOS', { size: 16 })) { Snd.play('uiSelect'); G.state = 'cosmetics'; }
};
