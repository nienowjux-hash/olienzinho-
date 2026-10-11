'use strict';
// ---------- Orbi jogavel, modos extras (infinito, desafio diario, treino) ----------
WEAPONS.orbi = {
  name: 'Orbes Gêmeos', desc: 'Orbes teleguiados que explodem em área.', c: '#7fe0ff', price: 0, delay: 1.25,
  special: 'gravity', specName: 'Poço Gravitacional', specDesc: 'Puxa inimigos, absorve tiros e implode no final.',
  fire(p) {
    const n = p.shots + 1;
    for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; mkBullet(p, p.x + k * 22, p.y - 22, -Math.PI / 2 + k * .6, 520, 1.15, { kind: 'missile', orb: true, speed: 780, target: null, life: 2.2, pierce: 0, r: 9 }); }
    muzzle(p, '#7fe0ff', 22); Snd.play('shoot', { lv: 0, wpn: 'fan', pan: Snd.panX(p.x) * .5 });
  },
};
SPECIALS.gravity = function (p) { G.well = { x: p.x, y: Math.max(160, p.y - 260), t: 0, dur: 2.8, R: 190, tk: 0 }; Snd.play('beam', { dur: 2.4 }); };

function wellTick(dt) {
  const w = G.well, p = G.player, dmg = p.dmg * 1.6 * (p.specPow || 1); w.t += dt; w.tk -= dt;
  const hit = w.tk <= 0; if (hit) w.tk = .25;
  for (const e of G.enemies) {
    if (e.dead) continue; const d = Math.hypot(w.x - e.x, w.y - e.y);
    if (d < w.R * 2.4 && e.type !== 'captain' && e.type !== 'tank' && e.type !== 'dummy') { const k = 320 * dt / (d || 1); e.x += (w.x - e.x) * k; e.y += (w.y - e.y) * k; if (e.bx !== undefined) e.bx += (w.x - e.bx) * k * .5; }
    if (hit && d < w.R + e.rad) damageEnemy(e, dmg, false, true);
  }
  for (const q of G.eb) if (!q.dead && Math.hypot(q.x - w.x, q.y - w.y) < w.R * 1.4) { q.dead = true; G.parts.push({ x: q.x, y: q.y, vx: (w.x - q.x) * 3, vy: (w.y - q.y) * 3, life: .25, max: .25, r: 5, c: '#7fe0ff', drag: 1 }); }
  const bo = G.boss; if (hit && bo && bo.targetable() && Math.hypot(bo.x - w.x, bo.y - w.y) < w.R + 130) bo.damage(dmg * .8);
  if (Math.random() < .6) G.parts.push({ x: w.x + rand(-w.R, w.R), y: w.y + rand(-w.R, w.R), vx: 0, vy: 0, life: .4, max: .4, r: 3, c: '#9ad8ff', drag: 1 });
  if (w.t >= w.dur) {
    shockwave(w.x, w.y, w.R * 2.4, '#7fe0ff'); shockwave(w.x, w.y, w.R * 1.4, '#ffffff'); burst(w.x, w.y, ['#7fe0ff', '#ffffff', '#b98cff'], 50, 520, 6); Snd.play('explode', { size: 1.6 }); shake(14); flashScreen(.3);
    for (const e of G.enemies) if (!e.dead && Math.hypot(w.x - e.x, w.y - e.y) < w.R * 2 + e.rad) damageEnemy(e, dmg * 5, false, true);
    if (bo && bo.targetable() && Math.hypot(bo.x - w.x, bo.y - w.y) < w.R * 2 + 130) bo.damage(Math.min(dmg * 6, bo.maxHp * .05));
    G.well = null;
  }
}
function drawWell() {
  const w = G.well; if (!w) return; const t = World.t, k = Math.min(1, w.t / .3) * (w.t > w.dur - .3 ? (w.dur - w.t) / .3 : 1);
  ctx.save(); ctx.translate(w.x, w.y);
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, w.R * 1.8, '#4cc8ff', .35 * k); ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, w.R * .7); g.addColorStop(0, 'rgba(0,0,10,.95)'); g.addColorStop(1, 'rgba(10,20,60,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w.R * .7 * k, 0, TAU); ctx.fill();
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { ctx.strokeStyle = i % 2 ? '#bff0ff' : '#4cc8ff'; ctx.globalAlpha = .7 * k; ctx.lineWidth = 3; ctx.beginPath(); const a0 = t * 3 + i * Math.PI / 2; for (let a = 0; a < 3.2; a += .1) { const rr = w.R * (1.15 - a * .3) * k; ctx.lineTo(Math.cos(a0 - a) * rr, Math.sin(a0 - a) * rr); } ctx.stroke(); }
  ctx.restore();
}
Art.orbi = function (x, y, o) {
  const U = 112 * (o.scale || 1), r = U * .36, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * .18); ctx.scale(o.sx || 1, o.sy || 1);
  if (o.inv > 0 && Math.floor(o.inv * 14) % 2 === 0) ctx.globalAlpha = .4;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 3.2, '#4cc8ff', .38);
  const fl = r * (.9 + Math.random() * .5), fg = ctx.createLinearGradient(0, r * .6, 0, r * .6 + fl); fg.addColorStop(0, '#e8fbff'); fg.addColorStop(.5, '#4cc8ff'); fg.addColorStop(1, 'rgba(60,120,255,0)');
  ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-r * .32, r * .6); ctx.lineTo(0, r * .6 + fl); ctx.lineTo(r * .32, r * .6); ctx.fill(); ctx.restore();
  const ring = front => { ctx.save(); ctx.rotate(-.35 + Math.sin(t * .8) * .06); ctx.strokeStyle = '#cfeeff'; ctx.lineWidth = r * .12; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.45, r * .42, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); ctx.stroke(); ctx.restore(); };
  ring(false);
  const g = ctx.createRadialGradient(-r * .35, -r * .45, r * .08, 0, 0, r * 1.05); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#7fe0ff'); g.addColorStop(1, '#1b6aa8');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  const lx = (o.lookx || 0) * r * .12, ly = (o.looky || 0) * r * .08, eh = o.blinkT > 0 ? .15 : 1;
  ctx.fillStyle = '#0e2a52'; ctx.beginPath(); ctx.ellipse(lx, -r * .08 + ly, r * .62, r * .36 * eh, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#bff0ff'; ctx.beginPath(); ctx.ellipse(lx, -r * .08 + ly, r * .22, r * .22 * eh, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx + r * .08, -r * .16 + ly, r * .07, 0, TAU); ctx.fill();
  ring(true);
  ctx.restore();
};

// ======================= MODOS EXTRAS =======================
const DAILY_MODS = [
  { id: 'fast', name: 'Inimigos Velozes', desc: 'Inimigos 25% mais rápidos.' },
  { id: 'glass', name: 'Casco de Vidro', desc: 'Só 3 de vida, mas +50% de dano.' },
  { id: 'rich', name: 'Chuva de Estrelas', desc: 'Estrelas em dobro.' },
  { id: 'bullet', name: 'Mar de Tiros', desc: 'Tiros inimigos 20% mais rápidos.' },
];
Extras.dayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
Extras.seedOf = k => { let h = 2166136261; for (const ch of k) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
Extras.rngOf = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
Extras.todayMod = () => DAILY_MODS[Extras.seedOf(Extras.dayKey()) % DAILY_MODS.length];
Extras.dailyBest = () => { const d = Save.data.daily; return d && d.date === Extras.dayKey() ? d.best : 0; };

Game.startDaily = function () {
  this.startEndless(); G.daily = true; G.rngD = Extras.rngOf(Extras.seedOf(Extras.dayKey())); G.dmod = Extras.todayMod().id;
  recalcStats(G.player); G.player.hp = G.player.maxHp;
  Events.banner = { t: 0, title: 'DESAFIO DO DIA', sub: Extras.todayMod().name.toUpperCase(), c: '#ffb340' };
};
Game.addDaily = function () {
  const d = Save.data, k = Extras.dayKey(); d.daily = { date: k, best: Math.max(d.daily && d.daily.date === k ? d.daily.best : 0, G.score), played: true };
  d.bestWave = Math.max(d.bestWave || 0, G.wave); Save.save(); Ach.check();
};
{
  const ed = Game.endlessDirector;
  Game.endlessDirector = function (dt) {
    if (!G.daily) return ed.call(this, dt);
    const m = Math.random; Math.random = G.rngD; try { ed.call(this, dt); } finally { Math.random = m; }
  };
}

Game.startTraining = function () {
  this.startStage(0, { skipStory: true }); G.training = true; Extras.tut = null; G.xpNeed = 1e9; G.state = 'play'; Events.banner = null; Snd.musicPlay('menu', 1);
  if (Save.data.loadout.char === 'orbi' && Save.data.cleared[3]) G.player.weapon = 'orbi';
  recalcStats(G.player); G.trainSkin = null; G.trainN = 0; spawnEnemy('dummy', W / 2, -50, { hp: 1e6, maxHp: 1e6 });
};
const TRAIN_TYPES = ['drone', 'zig', 'kami', 'shooter', 'shield', 'healer', 'mine', 'tank', 'bit'];
Extras.trainUpdate = function (dt) {
  const p = G.player;
  p.hp = p.maxHp; p.specCd = Math.max(0, p.specCd - dt * 3); p.dashCd = Math.max(0, p.dashCd - dt * 2); p.pulseT = Math.max(0, p.pulseT - dt * 2);
  const setW = id => { p.weapon = id; p.fireT = 0; G.mega = null; G.well = null; recalcStats(p); Snd.play('uiSelect'); };
  WEAPON_ORDER.forEach((id, i) => { if (Input.pressed(String(i + 1))) setW(id); });
  if (Input.pressed('6') && Save.data.cleared[3]) setW('orbi');
  if (Input.pressed('5')) { G.trainSkin = ((G.trainSkin ?? -1) + 1) % SKINS.length; Snd.play('uiSelect'); }
  if (Input.pressed('n')) { const ty = TRAIN_TYPES[G.trainN++ % TRAIN_TYPES.length], n = ty === 'tank' || ty === 'healer' ? 1 : 3; for (let i = 0; i < n; i++) spawnEnemy(ty, rand(150, W - 150), -30 - i * 50); }
  if (Input.pressed('b')) spawnEnemy('captain', rand(300, W - 300), -80);
  if (Input.pressed('d') && !G.enemies.some(e => e.type === 'dummy')) spawnEnemy('dummy', W / 2, -50, { hp: 1e6, maxHp: 1e6 });
  if (Input.pressed('c')) for (const e of G.enemies) if (e.type !== 'dummy') e.dead = true;
};
Extras.trainDraw = function () {
  if (!G.training || G.state !== 'play') return;
  const lines = ['1-4  armas', '5  skin', Save.data.cleared[3] ? '6  Orbi' : null, 'N  inimigos', 'B  minichefe', 'D  alvo', 'C  limpar', 'ESC  sair'].filter(Boolean);
  ctx.save(); ctx.globalAlpha = .85; ctx.fillStyle = 'rgba(14,5,40,.7)'; ctx.beginPath(); ctx.roundRect(W - 188, 100, 168, 44 + lines.length * 22, 14); ctx.fill();
  txt('MODO TREINO', W - 104, 108, 15, '#ffb340', 'center', 900);
  lines.forEach((l, i) => txt(l, W - 172, 138 + i * 22, 15, '#e2d4ff', 'left', 700)); ctx.restore();
};
Extras.dummyDraw = function () {
  for (const e of G.enemies) if (e.type === 'dummy') {
    const h = e.hist || [], now = G.t; let s = 0; for (const [tt, d] of h) if (now - tt < 3) s += d;
    while (h.length && now - h[0][0] > 3) h.shift();
    txt('DPS  ' + Math.round(s * 10 / 3), e.x, e.y - e.rad - 34, 22, '#ffe9a8', 'center', 900);
  }
};

// ======================= TELA DE MODOS =======================
Screens.modes = function () {
  const day = Extras.todayMod();
  txt('MODOS EXTRAS', W / 2, 40, 48, '#fff', 'center');
  const cards = [
    { id: 'inf', name: 'MODO INFINITO', c: '#ffb340', lines: ['Ondas sem fim, cada vez mais difíceis.', 'Um chefe a cada 5 ondas.', 'Entre no ranking!'], foot: 'Melhor onda: ' + (Save.data.bestWave || 0), go: () => Game.startEndless() },
    { id: 'day', name: 'DESAFIO DO DIA', c: '#7fe0ff', lines: ['A mesma sequência de inimigos para todo mundo, hoje.', 'Hoje: ' + day.name, day.desc], foot: 'Seu melhor hoje: ' + Extras.dailyBest() + ' pts', go: () => Game.startDaily() },
    { id: 'tr', name: 'TREINO', c: '#7fe0a0', lines: ['Teste armas, skins e inimigos sem risco.', 'Vida infinita e recarga rápida.', 'Nada é salvo.'], foot: 'sem pressão :)', go: () => Game.startTraining() },
  ];
  cards.forEach((cd, i) => {
    const x = 70 + i * 390, y = 130, w = 360, h = 400, id = 'm_' + cd.id, f = UI.focus(id);
    if (UI.hit(id, x, y, w, h)) { cd.go(); return; }
    ctx.save(); if (f) { ctx.shadowColor = cd.c; ctx.shadowBlur = 30; }
    UI.panel(x, y, w, h, { fill: f ? 'rgba(50,28,120,.85)' : 'rgba(20,8,55,.75)', stroke: f ? cd.c : 'rgba(190,160,255,.3)', r: 24 }); ctx.restore();
    ctx.save(); ctx.translate(x + w / 2, y + 100); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 90, cd.c, .5 + (f ? .2 : 0)); ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = cd.c; ctx.lineWidth = 7; ctx.lineCap = 'round';
    if (cd.id === 'inf') { ctx.beginPath(); for (let a = 0; a <= TAU + .1; a += .1) { const px = Math.cos(a) * 46, py = Math.sin(2 * a) * 22; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
    else if (cd.id === 'day') { ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, 0); ctx.lineTo(16, 10); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, 0, 38, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 20, 0, TAU); ctx.stroke(); ctx.fillStyle = cd.c; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); }
    ctx.restore();
    txt(cd.name, x + w / 2, y + 180, 28, '#fff', 'center', 900);
    cd.lines.forEach((l, k) => UI.wrap(l, x + 30, y + 226 + k * 46, w - 60, 21, 16, k === 1 && cd.id === 'day' ? cd.c : '#cdb8ff'));
    txt(cd.foot, x + w / 2, y + h - 36, 17, cd.c, 'center', 800);
  });
  if (UI.button('back', W / 2 - 160, 580, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goTitle(); }
};

// ======================= HANGAR DO ORBI =======================
Screens.hangarOrbi = function () {
  const t = World.t;
  txt('HANGAR', W / 2, 26, 42, '#fff', 'center'); txt(Screens.stars(), W - 40, 36, 30, '#ffcf6b', 'right');
  UI.panel(70, 118, 580, 416, { r: 22 });
  txt('ORBI', 100, 136, 38, '#7fe0ff', 'left', 900); txt('o parceiro de bordo, agora no comando', 100, 184, 17, '#cdb8ff', 'left', 700);
  const rows = [['Orbes Gêmeos', 'Dispara orbes teleguiados que explodem em área.'], ['Poço Gravitacional (Q)', 'Puxa inimigos, absorve tiros e implode no final.'], ['Salto Rápido (Shift)', 'A esquiva recarrega 20% mais rápido.'], ['Ímã Poderoso', 'Atrai estrelas de bem mais longe.'], ['Casco Leve', 'Tem 1 de vida a menos que o Olienzinho.']];
  rows.forEach(([a, b], i) => { const y = 226 + i * 56; ctx.fillStyle = i < 2 ? '#7fe0ff' : i < 4 ? '#7fe0a0' : '#ff9ac0'; ctx.beginPath(); ctx.arc(110, y + 12, 6, 0, TAU); ctx.fill(); txt(a, 130, y, 21, '#fff', 'left', 800); UI.wrap(b, 130, y + 26, 490, 20, 15, '#cdb8ff'); });
  UI.panel(700, 92, 520, 430, { r: 24 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(960, 300, 230, '#4cc8ff', .4); ctx.restore();
  Art.orbi(960, 300 + Math.sin(t * 1.6) * 8, { vx: Math.sin(t * .8) * 80, t, scale: 1.9, lookx: clamp((Input.mouse.x - 960) / 400, -1, 1), looky: clamp((Input.mouse.y - 300) / 400, -1, 1), blinkT: Screens.blinkAt(t) });
  txt('ORBI', 960, 440, 30, '#fff', 'center'); txt('liberado por zerar a Parte 1', 960, 482, 16, '#7fe0a0', 'center', 800);
  if (UI.button('back', W / 2 - 160, 600, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goSelect(); }
};
