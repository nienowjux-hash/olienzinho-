'use strict';
// ---------- gameplay 3: resumo da morte, elites, momentos especiais, mecanicas de chefe, rotas, estilos de nave, missoes e modo assistido ----------
const Visual8 = {};

// ===== fonte de dano (para o resumo da morte) =====
const SRC_NAME = { drone: 'Zangão', zig: 'Zigue-zague', kami: 'Kamikaze', shooter: 'Atirador', tank: 'Tanque', mine: 'Mina', bit: 'Bit', shield: 'Escudeiro', healer: 'Curandeiro', captain: 'Minichefe', crystal: 'Cristal do Vazio', rock: 'Meteoro', boulder: 'Pedra do Gigante' };
const SRC_TIP = {
  drone: 'Os Zangões vêm em linha: sobrevoe entre os grupos.', zig: 'O Zigue-zague muda de direção: não fique parado debaixo dele.', kami: 'O Kamikaze trava a mira antes de mergulhar: esquive (Shift) quando a linha tracejada aparecer.',
  shooter: 'Atiradores miram em você: mova-se de lado, não para trás.', tank: 'Tanques soltam anéis de tiros: procure a brecha entre os anéis.', mine: 'Minas explodem em anel: afaste-se quando começarem a piscar.',
  bit: 'Bits vêm em enxame: um pulso (Espaço) limpa tudo.', shield: 'Escudeiros bloqueiam tiros de baixo: atire de lado ou use o laser.', healer: 'Derrote os curandeiros primeiro.', captain: 'Minichefes ficam mais agressivos abaixo de 50% de vida.',
  crystal: 'Os cristais atiram de longe: quebre-os para vencer o escudo do Vazio.', rock: 'Meteoros vão direto para baixo: dê um passo para o lado.', boulder: 'As pedras do Gigante machucam, mas se você atirar nelas elas voam contra ele!',
  hazard: 'As marcações com "!" avisam onde vai atingir: saia da área antes de acender.', boss: 'Em chefes, mire no ponto fraco dourado e use o especial nas fúrias.',
};
function srcInfo(raw) {
  let r = String(raw || 'outro'), kind = 'Tiro de '; if (r === 'bullet:undefined' || r === 'bullet:null') return { name: 'Tiros inimigos', tip: 'Fique de olho na tela inteira, não só na nave.' };
  if (r.startsWith('bullet:')) { r = r.slice(7); kind = 'Tiros de '; } else if (r.startsWith('contact:')) { r = r.slice(8); kind = 'Batida de '; }
  if (r === 'hazard') return { name: 'Raios e lasers do cenário', tip: SRC_TIP.hazard };
  if (r.startsWith('boss:')) return { name: kind.replace('Tiro ', 'Tiros ') + r.slice(5), tip: SRC_TIP.boss };
  return { name: kind + (SRC_NAME[r] || r), tip: SRC_TIP[r] || 'Fique de olho na tela inteira, não só na nave.' };
}
{
  const ue = updateEnemy;
  updateEnemy = function (e, dt) {
    G.__src = e.type; ue(e, dt);
    if (e.elite && !e.dead) {
      if (e.elite === 'frenzy' && e.mode === 'hover') e.shootT -= dt * .9;
      if (e.elite === 'summoner' && e.mode !== 'enter') { e.sumT = (e.sumT ?? 3) - dt; if (e.sumT <= 0) { e.sumT = 4.5; for (const s of [-1, 1]) spawnEnemy('bit', e.x + s * 30, e.y + 20, { bx: e.x + s * 30 }); } }
    }
    // pedras do Gigante (podem ser atiradas de volta) e para-raios
    if (e.type === 'boulder' && !e.dead) {
      const bs = G.boss;
      if (e.launched && bs && bs.targetable()) {
        const a = Math.atan2(bs.y - e.y, bs.x - e.x); e.x += Math.cos(a) * 950 * dt; e.y += Math.sin(a) * 950 * dt; e.rot = (e.rot || 0) + dt * 12;
        if (Math.hypot(bs.x - e.x, bs.y - e.y) < (bs.rad || 120) * .8) { bs.damage(bs.maxHp * .045); burst(e.x, e.y, ['#c8a0b8', '#ffe9a8', '#ffffff'], 40, 460, 7); shockwave(e.x, e.y, 200, '#c8a0b8'); shake(12); Snd.play('explode', { size: 1.3 }); popup(e.x, e.y - 50, 'ARREMESSO!', '#ffe9a8', 28); e.dead = true; e.counted = true; }
      } else { e.y += 46 * dt; e.x += (e.vx || 0) * dt; e.rot = (e.rot || 0) + dt * .6; }
    }
    G.__src = null;
  };
  const bu = Boss.prototype.update; Boss.prototype.update = function (dt) { G.__src = 'boss:' + this.name; bu.call(this, dt); G.__src = null; };
  const uh = Events.updateHazards; Events.updateHazards = function (dt) { G.__src = 'hazard'; uh.call(this, dt); G.__src = null; };
  const hp0 = hurtPlayer;
  hurtPlayer = function (d) {
    const p = G.player, b = p ? p.hp : 0; let src = G.hitSrc || (G.__src === 'hazard' ? 'hazard' : G.__src ? (String(G.__src).startsWith('boss:') ? G.__src : 'contact:' + G.__src) : 'outro');
    hp0(d); if (p && p.hp < b) { const lab = srcInfo(src); G.hitLog = G.hitLog || {}; const e = G.hitLog[lab.name] = G.hitLog[lab.name] || { n: 0, tip: lab.tip }; e.n++; G.lastHit = lab.name; G.lastHitT = G.t; }
    G.hitSrc = null;
  };
}
Visual8.recap = function () {
  const log = G.hitLog || {}, top = Object.keys(log).map(k => ({ name: k, n: log[k].n, tip: log[k].tip })).sort((a, b) => b.n - a.n).slice(0, 3);
  const last = G.lastHit ? { name: G.lastHit, tip: (log[G.lastHit] || {}).tip } : null;
  return { top, last, t: G.t, stage: G.stage ? G.stage.name : '' };
};
Visual8.recapDraw = function (t, r) {
  const rc = r && r.recap; if (!rc || !rc.last) return;
  const x = 910, y = 270, w = 330, k = easeOut(clamp((t - 1.6) / .5, 0, 1)); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * 40, 0);
  UI.panel(x, y, w, 250, { r: 20 }); txt('O QUE TE ACERTOU', x + 24, y + 18, 14, '#ffb340', 'left', 900);
  txt('Último golpe:', x + 24, y + 46, 13, '#8a7fb0', 'left', 700); UI.wrap(rc.last.name, x + 24, y + 64, w - 48, 24, 19, '#fff');
  rc.top.forEach((e, i) => { txt(e.n + '×  ' + e.name, x + 24, y + 112 + i * 22, 14, i ? '#cdb8ff' : '#ffcf6b', 'left', 700); });
  if (rc.last.tip) { ctx.fillStyle = 'rgba(255,179,64,.1)'; ctx.beginPath(); ctx.roundRect(x + 14, y + 178, w - 28, 62, 12); ctx.fill(); UI.wrap('Dica: ' + rc.last.tip, x + 24, y + 184, w - 48, 17, 13, '#ffe9a8'); }
  ctx.restore();
};

// ===== inimigos de elite =====
const AFFIX = { fast: ['VELOZ', '#ff5a3c'], armor: ['BLINDADO', '#9fd0ff'], volatile: ['VOLÁTIL', '#ffb340'], summoner: ['INVOCADOR', '#7fffa0'], frenzy: ['FRENÉTICO', '#ff7ac8'] };
ACH.push({ id: 'elite25', name: 'Caçador de Elites', desc: 'Derrote 25 inimigos de elite.', ok: () => (Save.data.stats.elites || 0) >= 25 });
{
  const se = spawnEnemy;
  spawnEnemy = function (type, x, y, o = {}) {
    const e = se(type, x, y, o);
    if (G.route === 'danger' || (G.stage && G.stage.id >= 6 && !o.noElite)) { e.hp = Math.ceil(e.hp * 1.25); e.maxHp = e.hp; }
    if (!['drone', 'zig', 'kami', 'shooter', 'shield', 'healer', 'tank'].includes(type) || G.state !== 'play' || G.training || G.rush || o.noElite) return e;
    const ch = (G.weekly && G.wrule === 2 ? .5 : 0) + (G.endless ? Math.min(.25, .05 + (G.wave || 1) * .012) : .04 + (G.stage ? G.stage.id : 0) * .012 + (G.t / (G.stage ? G.stage.duration : 100)) * .04);
    if (Math.random() >= ch) return e;
    const af = pick(Object.keys(AFFIX)); e.elite = af;
    if (af === 'fast') { e.spd *= 1.45; e.hp = Math.ceil(e.hp * .85); }
    else if (af === 'armor') { e.hp = Math.ceil(e.hp * 1.8); e.shield = e.maxShield = Math.ceil(e.hp * .7); }
    e.maxHp = e.hp; e.xp *= 2; e.score *= 3; e.coin = Math.min(1, e.coin * 3 + .3);
    return e;
  };
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.counted; ke(e, by); if (was || !e.counted) return;
    if (by) { Visual8.mission('kill'); Visual8.mission('combo', G.combo, true); }
    if (G.route === 'danger' && by && Math.random() < .35) dropPickup('coin', e.x, e.y, 2);
    if (by && Save.data.loadout.style === 3 && G.kills % 25 === 0 && G.player.hp < G.player.maxHp) { G.player.hp++; popup(G.player.x, G.player.y - 50, '+1', '#7fe0a0', 24); }
    if (!e.elite) return;
    Save.data.stats.elites = (Save.data.stats.elites || 0) + 1; Visual8.mission('elite'); Ach.check();
    if (e.elite === 'volatile') { ring(e.x, e.y, 12, 210, rand(0, 6)); shockwave(e.x, e.y, 170, '#ffb340'); }
    if (by) { for (let i = 0; i < 3; i++) dropPickup('coin', e.x + rand(-20, 20), e.y + rand(-10, 10), 2); if (Math.random() < .4) dropPickup('cap', e.x, e.y, pick(['rapid', 'double', 'magnet', 'aegis', 'bomb'])); popup(e.x, e.y - 40, 'ELITE!', AFFIX[e.elite][1], 24); }
  };
  const de = damageEnemy;
  damageEnemy = function (e, dmg, crit, chained) {
    if (e.type === 'boulder') { if (!e.launched && G.boss) { e.launched = true; sparks(e.x, e.y, '#ffe9a8', 10, 300); Snd.play('impact'); } e.hp = e.maxHp; return; }
    if (e.type === 'rod') { e.hp = e.maxHp; sparks(e.x, e.y - 40, '#9fe8ff', 3, 200); return; }
    return de(e, dmg, crit, chained);
  };
}
ENEMY_DEF.boulder = { hp: 6, rad: 34, spd: 0, xp: 0, score: 0, coin: 0, glow: '#c8a0b8' };
ENEMY_DEF.rod = { hp: 1e6, rad: 30, spd: 0, xp: 0, score: 0, coin: 0, glow: '#9fe8ff' };
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    const t = World.t;
    if (e.type === 'boulder') {
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.rot || 0); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 70, e.launched ? '#ffe9a8' : '#ff9a4a', .45);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#3a2438'; ctx.strokeStyle = e.launched ? '#ffe9a8' : '#c8a0b8'; ctx.lineWidth = 3; ctx.beginPath();
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, q = e.rad * (.8 + ((k * 7) % 5) * .08); ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ff9a4a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(2, 0); ctx.lineTo(-6, 14); ctx.stroke(); ctx.restore();
      if (!e.launched) { ctx.save(); ctx.globalAlpha = .6 + .4 * Math.sin(t * 8); txt('ATIRE!', e.x, e.y - e.rad - 26 + Math.sin(t * 6) * 3, 15, '#ffe9a8', 'center', 900); ctx.restore(); }
      return;
    }
    if (e.type === 'rod') {
      ctx.save(); ctx.translate(e.x, e.y); ctx.fillStyle = '#2a2050'; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-9, 60); ctx.lineTo(-4, -60); ctx.lineTo(4, -60); ctx.lineTo(9, 60); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-14 + k * 0, -30 + k * 22); ctx.lineTo(14, -30 + k * 22); ctx.stroke(); }
      ctx.globalCompositeOperation = 'lighter'; const pu = .6 + .4 * Math.sin(t * 5 + e.x); drawGlow(0, -64, 40 * pu, '#9fe8ff', .8); drawGlow(0, -64, 16, '#ffffff', .9); ctx.restore();
      ctx.save(); ctx.globalAlpha = .6; txt('PARA-RAIOS', e.x, e.y + 70, 12, '#9fe8ff', 'center', 900); ctx.restore(); return;
    }
    if (e.elite) { // aura de elite
      const [nm, c] = AFFIX[e.elite], r = e.rad;
      ctx.save(); ctx.translate(e.x, e.y); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.globalAlpha = .55 + .25 * Math.sin(t * 6);
      ctx.beginPath(); ctx.arc(0, 0, r * 1.5 + Math.sin(t * 4) * 2, 0, TAU); ctx.stroke(); drawGlow(0, 0, r * 2.4, c, .35);
      ctx.rotate(t); for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(r * 1.5, 0, 3.5, 0, TAU); ctx.fill(); } ctx.restore();
      ae.call(this, e);
      ctx.save(); ctx.globalAlpha = .9; txt(nm, e.x, e.y - e.rad - 22, 11, c, 'center', 900); ctx.restore();
      if (e.shield > 0) { ctx.save(); ctx.translate(e.x, e.y); ctx.strokeStyle = '#9fd0ff'; ctx.globalAlpha = .6; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, e.rad * 1.2, .15, Math.PI - .15); ctx.stroke(); ctx.restore(); }
      return;
    }
    return ae.call(this, e);
  };
}

// ===== momentos especiais dentro das fases =====
const SPN = { asteroids: ['CAMPO DE ASTEROIDES', 'ATRAVESSE A CHUVA DE ROCHAS', '#ffb340', 9], lasergrid: ['CORREDOR DE LASERS', 'ENCONTRE A BRECHA', '#ff7ac8', 11], swarm: ['ENXAME!', 'ELES VÊM DOS DOIS LADOS', '#7fe0ff', 9] };
Visual8.spStart = function () {
  const sp = G.sp, st = G.stage ? G.stage.id : 0, type = G.endless ? pick(['asteroids', 'lasergrid', 'swarm', 'chase']) : st === 1 ? 'asteroids' : st === 2 ? 'swarm' : pick(['asteroids', 'lasergrid', 'swarm', 'chase']), d = SPN[type];
  sp.on = true; sp.t = 0; sp.type = type; sp.dur = d[3]; sp.hits0 = G.stats.hits; sp.n = 0; Events.banner = { t: 0, title: d[0], sub: d[1], c: d[2] }; Snd.play('bossWarn');
};
Visual8.spRun = function (dt) {
  const sp = G.sp; sp.t += dt; const every = { asteroids: .62, lasergrid: 3.4, swarm: .55 }[sp.type];
  if (sp.t >= sp.n * every + 1.2) {
    sp.n++;
    if (sp.type === 'asteroids') { Events.spawnMeteor(); if (sp.t > 6 && Math.random() < .4) Events.spawnMeteor(); }
    else if (sp.type === 'lasergrid') { const gap = rand(240, W - 240), gw = 165, l = gap - gw, r = W - (gap + gw); if (l > 20) Events.hazardRect(l / 2, H / 2, l, H, 1.5, .7, '#ff7ac8', 'beam'); if (r > 20) Events.hazardRect(W - r / 2, H / 2, r, H, 1.5, .7, '#ff7ac8', 'beam'); }
    else { const x0 = sp.n % 2 ? rand(120, 420) : rand(W - 420, W - 120); for (let i = 0; i < 6; i++) spawnEnemy('bit', clamp(x0 + (i % 2 ? 24 : -24), 60, W - 60), -30 - i * 36, { bx: x0, noElite: true }); if (sp.n === 6) spawnEnemy('shooter', W / 2, -40, { noElite: true }); }
  }
  if (sp.t >= sp.dur + 1.2) {
    sp.on = false; const clean = G.stats.hits === sp.hits0;
    if (clean) { popup(W / 2, 220, 'SEM DANO! BÔNUS', '#ffe9a8', 36); dropPickup('cap', W / 2, 40, pick(['rapid', 'double', 'magnet', 'aegis'])); for (let i = 0; i < 4; i++) dropPickup('coin', W / 2 + rand(-80, 80), 40, 2); Snd.play('stamp'); }
  }
};
{
  const sw = Game.spawnWave; Game.spawnWave = function (pool) { if (G.sp && G.sp.on) return; if (G.route === 'calm' && Math.random() < .25) return; sw.call(this, pool); };
}

// ===== mecanicas dos chefes =====
Visual8.bossMech = function (dt) {
  const b = G.boss; if (!b || b.state !== 'fight') { G.eclipse = null; return; }
  if ((b.baseName || b.name) === 'Gigante de Rocha') { G.boulderT = (G.boulderT ?? 5) - dt; if (G.boulderT <= 0) { G.boulderT = 10 - b.phase * 2; const left = Math.random() < .5; spawnEnemy('boulder', left ? 70 : W - 70, 190, { vx: left ? 22 : -22, mode: 'hover', noElite: true }); popup(left ? 100 : W - 100, 240, 'ATIRE NA PEDRA!', '#ffe9a8', 22); } }
  if ((b.baseName || b.name) === 'Olho da Tempestade') {
    if (!G.rods || !G.rods.length || G.rods.every(r => r.dead)) { G.rods = [170, W - 170].map(x => spawnEnemy('rod', x, H - 200, { mode: 'hover', noElite: true })); }
    for (const h of G.hazards) if (h.rod && !h._r && h.t >= h.warn) { h._r = true; b.damage(b.maxHp * .014); sparks(h.rod.x, h.rod.y - 60, '#9fe8ff', 18, 420); popup(h.rod.x, h.rod.y - 90, 'DESCARGA!', '#9fe8ff', 24); }
  } else G.rods = null;
  if ((b.baseName || b.name) === 'Sol-Guardião' && b.phase >= 1) {
    G.ecT = (G.ecT ?? 7) - dt;
    if (G.ecT <= 0 && !G.eclipse) {
      G.ecT = 16 - b.phase * 3; const x = rand(240, W - 240); G.eclipse = { x, t: 0, dur: 3.4 };
      if (x - 120 > 30) Events.hazardRect((x - 120) / 2, H / 2, x - 120, H, 1.2, 1.6, '#ff5a3c', 'beam'); if (W - x - 120 > 30) Events.hazardRect(W - (W - x - 120) / 2, H / 2, W - x - 120, H, 1.2, 1.6, '#ff5a3c', 'beam');
      popup(W / 2, 230, 'ECLIPSE! ABRIGUE-SE NA SOMBRA', '#ffcf6b', 30); Snd.play('bossWarn');
    }
  }
  if (G.eclipse) { G.eclipse.t += dt; if (G.eclipse.t > G.eclipse.dur) G.eclipse = null; }
};
{
  const hr = Events.hazardRect;
  Events.hazardRect = function (cx, cy, w, h, warn, dur, c, kind) {
    let rod = null;
    if (kind === 'bolt' && G.boss && (G.boss.baseName || G.boss.name) === 'Olho da Tempestade' && G.rods) { const rs = G.rods.filter(r => !r.dead); if (rs.length && Math.random() < .65) { rod = pick(rs); cx = rod.x; } }
    hr.call(this, cx, cy, w, h, warn, dur, c, kind); if (rod) G.hazards[G.hazards.length - 1].rod = rod;
  };
  const ba = Visual.bossAura;
  Visual.bossAura = function (b) {
    ba.call(this, b); const ec = G.eclipse; if (!ec || (b.baseName || b.name) !== 'Sol-Guardião') return;
    const k = Math.min(1, ec.t / .5) * Math.min(1, (ec.dur - ec.t) / .5);
    ctx.save(); const g = ctx.createLinearGradient(ec.x - 130, 0, ec.x + 130, 0); g.addColorStop(0, 'rgba(0,0,12,0)'); g.addColorStop(.25, 'rgba(0,0,12,' + .42 * k + ')'); g.addColorStop(.75, 'rgba(0,0,12,' + .42 * k + ')'); g.addColorStop(1, 'rgba(0,0,12,0)');
    ctx.fillStyle = g; ctx.fillRect(ec.x - 130, 0, 260, H);
    ctx.fillStyle = '#04000c'; ctx.beginPath(); ctx.arc(ec.x, 70, 92 * k, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffcf6b'; ctx.lineWidth = 4; ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(ec.x, 70, 94 * k, 0, TAU); ctx.stroke(); drawGlow(ec.x, 70, 170, '#ff9a30', .3 * k);
    ctx.restore(); ctx.save(); ctx.globalAlpha = k * .8; txt('SOMBRA SEGURA', ec.x, H - 130, 14, '#cdb8ff', 'center', 900); ctx.restore();
  };
}

// ===== rotas entre fases =====
const ROUTES = [
  { id: 'danger', name: 'ROTA PERIGOSA', c: '#ff5a3c', icon: 'dmg', desc: 'Inimigos 25% mais fortes, mas soltam mais estrelas.' },
  { id: 'calm', name: 'ROTA CALMA', c: '#7fe0a0', icon: 'heal', desc: '25% menos inimigos e +1 de vida máxima nesta fase.' },
  { id: 'mystery', name: 'ROTA MISTERIOSA', c: '#c04aff', icon: 'spec', desc: 'Você ganha um nível e duas cápsulas logo no começo.' },
];
Visual8.pickRoute = function (next) {
  if (Game.noStory || G.training || Extras.tut || G.rush || G.stageIdx < 1 || Visual5.rushRelic !== undefined) { next(); return; }
  G.routeNext = next; G.routeAt = undefined; G.state = 'route';
};
{ const pr = Visual5.pickRelic; Visual5.pickRelic = function (next) { pr.call(this, () => Visual8.pickRoute(next)); }; }
Visual8.applyRoute = function (id) {
  G.route = id; const p = G.player;
  if (id === 'calm') { recalcStats(p); p.hp = p.maxHp; }
  if (id === 'mystery') { G.pendingLevels++; G.timers.push({ t: 1.5, fn: () => { dropPickup('cap', W / 2 - 80, 120, 'rapid'); dropPickup('cap', W / 2 + 80, 120, 'double'); } }); }
};
Screens.route = function () {
  if (G.routeAt === undefined) G.routeAt = World.t; const t = World.t - G.routeAt;
  this.dim(.78); txt('ESCOLHA O CAMINHO', W / 2, 90, 54, '#fff', 'center'); txt('Vale só para a fase que vem agora.', W / 2, 160, 20, '#ffb340', 'center', 800);
  const cw = 330, ch = 320, gap = 36, x0 = W / 2 - (cw * 3 + gap * 2) / 2, y0 = 220;
  ROUTES.forEach((r, i) => {
    const x = x0 + i * (cw + gap), id = 'rt' + i, f = UI.focus(id), ek = clamp(easeBack((t - i * .1) / .45), 0, 1.15);
    if (t > .5 && (UI.hit(id, x, y0, cw, ch) || Input.pressed(String(i + 1)))) { Visual8.applyRoute(r.id); const nx = G.routeNext; G.routeNext = null; Snd.play('levelUp'); G.state = 'play'; nx(); return; }
    ctx.save(); ctx.translate(0, (1 - clamp(ek, 0, 1)) * 60); ctx.globalAlpha = clamp(ek, 0, 1); if (f) { ctx.shadowColor = r.c; ctx.shadowBlur = 34; }
    const g = ctx.createLinearGradient(0, y0, 0, y0 + ch); g.addColorStop(0, f ? '#3a2a8a' : '#271668'); g.addColorStop(1, '#14083a'); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y0, cw, ch, 22); ctx.fill();
    ctx.strokeStyle = f ? '#fff' : r.c; ctx.lineWidth = f ? 4 : 2; ctx.stroke(); ctx.shadowBlur = 0; txt(String(i + 1), x + 18, y0 + 22, 20, '#8a7fb0');
    Visual2.upIcon(r.icon, x + cw / 2, y0 + 96, 34, r.c, f); txt(r.name, x + cw / 2, y0 + 160, 26, '#fff', 'center'); UI.wrap(r.desc, x + cw / 2, y0 + 208, cw - 50, 26, 19, '#cdb8ff', 'center'); ctx.restore();
  });
  txt('Clique, aperte 1 / 2 / 3 ou use as setas + Enter', W / 2, 590, 17, '#8a7fb0', 'center', 700);
};

// ===== estilos de nave =====
const STYLES = [
  { name: 'PADRÃO', desc: 'Equilibrado.' },
  { name: 'TANQUE', desc: '+2 de vida, -12% de velocidade, -8% de dano.' },
  { name: 'ATIRADOR', desc: '+25% de dano e +8% de crítico, mas -1 de vida.' },
  { name: 'SUPORTE', desc: 'Começa com escudo, cura a cada 25 kills, esquiva mais rápida e ímã maior.' },
];
Visual8.styleStats = function (p) {
  if (p.isP2) return; const st = Save.data.loadout.style || 0;
  if (st === 1) { p.maxHp += 2; p.speed *= .88; p.dmg *= .92; }
  else if (st === 2) { p.dmg *= 1.25; p.crit += .08; p.maxHp = Math.max(2, p.maxHp - 1); }
  else if (st === 3) { p.dashCdMax *= .7; p.magnet += 60; }
  if (G.route === 'calm') p.maxHp += 1;
  if (Save.data.settings.assist) p.maxHp += 2;
};
Visual8.onStart = function () {
  const st = Save.data.loadout.style || 0, p = G.player;
  if (st === 3) { G.upCounts.shield = Math.max(1, G.upCounts.shield || 0); recalcStats(p); p.shieldReady = true; }
  G.hitLog = {}; G.lastHit = null; G.route = null; G.sp = { on: false, queue: [.2, .45, .7].map(f => ({ f, done: false })), t: 0 }; G.boulderT = undefined; G.rods = null; G.eclipse = null; G.ecT = undefined;
};
{
  const ha = Screens.hangar;
  Screens.hangar = function () {
    ha.call(this); const ld = Save.data.loadout, st = ld.style || 0;
    if (UI.button('style', 1000, 36, 240, 40, 'ESTILO: ' + STYLES[st].name, { size: 15, color: st ? '#9a63ff' : undefined })) { ld.style = (st + 1) % STYLES.length; Save.save(); Snd.play('uiSelect'); }
    txt(STYLES[st].desc, 1240, 82, 13, '#cdb8ff', 'right', 700);
  };
}

// ===== missoes diarias =====
const MIS_POOL = [
  { id: 'kill', t: 'Derrote {n} inimigos', n: [120, 200, 320], r: 60 }, { id: 'boss', t: 'Derrote {n} chefe(s)', n: [1, 2, 3], r: 90 },
  { id: 'combo', t: 'Alcance combo {n}', n: [20, 30, 45], r: 60, max: true }, { id: 'special', t: 'Use o especial {n} vezes', n: [8, 12, 20], r: 50 },
  { id: 'graze', t: 'Roce em {n} tiros', n: [30, 60, 100], r: 50 }, { id: 'elite', t: 'Derrote {n} elites', n: [3, 5, 8], r: 80 },
  { id: 'wave', t: 'Chegue à onda {n} no Infinito', n: [4, 6, 8], r: 80, max: true }, { id: 'weak', t: 'Acerte {n} pontos fracos', n: [15, 30, 50], r: 60 },
];
Visual8.missionsEnsure = function () {
  const k = Extras.dayKey(), d = Save.data; if (d.missions && d.missions.date === k) return d.missions;
  const rng = Extras.rngOf(Extras.seedOf('m' + k)), pool = MIS_POOL.slice(); const list = [];
  for (let i = 0; i < 3; i++) { const m = pool.splice(Math.floor(rng() * pool.length), 1)[0], tier = i; list.push({ id: m.id, goal: m.n[tier], text: m.t.replace('{n}', m.n[tier]), reward: m.r, max: !!m.max, prog: 0, done: false }); }
  d.missions = { date: k, list }; Save.save(); return d.missions;
};
Visual8.mission = function (ev, amount = 1, isMax) {
  const ms = Visual8.missionsEnsure(); let any = false;
  for (const m of ms.list) if (m.id === ev && !m.done) {
    m.prog = isMax ? Math.max(m.prog, amount) : m.prog + amount; any = true;
    if (m.prog >= m.goal) { m.done = true; m.prog = m.goal; Save.data.coins += m.reward; Visual7.shotT = 3; Visual7.msg = 'MISSÃO CUMPRIDA: ' + m.text + '  +★' + m.reward; Snd.play('stamp'); }
  }
  if (any && Math.random() < .08) Save.save();
};
{
  const bd = Game.bossDefeated; Game.bossDefeated = function () { Visual8.mission('boss'); return bd.call(this); };
  const us = useSpecial; useSpecial = function () { const p = G.player, cd = p ? p.specCd : 1; us(); if (p && cd <= 0 && p.specCd > 0) Visual8.mission('special'); };
  const gz = Visual5.graze; Visual5.graze = function (b) { gz(b); Visual8.mission('graze'); };
  const wm = Visual5.weakMul; Visual5.weakMul = function (b, x, y, r) { const m = wm(b, x, y, r); if (m > 1) Visual8.mission('weak'); return m; };
  const nw = Game.nextWave; Game.nextWave = function () { nw.call(this); Visual8.mission('wave', G.wave, true); };
}
Screens.missions = function () {
  const ms = Visual8.missionsEnsure(); this.dim(.7);
  txt('MISSÕES DO DIA', W / 2, 60, 52, '#fff', 'center'); txt('Novas missões todo dia. As recompensas são pequenas, mas ajudam.', W / 2, 128, 18, '#ffb340', 'center', 700);
  ms.list.forEach((m, i) => {
    const y = 190 + i * 118, k = Screens.enterK(i, .5); ctx.save(); ctx.globalAlpha = clamp(k, 0, 1); ctx.translate((1 - clamp(k, 0, 1)) * -80, 0);
    UI.panel(240, y, 800, 98, { r: 20, fill: m.done ? 'rgba(40,90,60,.8)' : 'rgba(20,8,55,.75)', stroke: m.done ? '#7fe0a0' : 'rgba(190,160,255,.3)' });
    txt(m.text, 276, y + 18, 26, '#fff', 'left', 800); txt('★ ' + m.reward, 1004, y + 20, 26, m.done ? '#7fe0a0' : '#ffcf6b', 'right');
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.roundRect(276, y + 64, 540, 12, 6); ctx.fill(); ctx.fillStyle = m.done ? '#7fe0a0' : '#9a63ff'; ctx.beginPath(); ctx.roundRect(276, y + 64, Math.max(10, 540 * m.prog / m.goal), 12, 6); ctx.fill();
    txt(m.done ? 'CUMPRIDA' : m.prog + ' / ' + m.goal, 1004, y + 62, 18, m.done ? '#7fe0a0' : '#cdb8ff', 'right', 800); ctx.restore();
  });
  if (UI.button('back', W / 2 - 160, 580, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goTitle(); }
  Screens.thinFrame();
};

// ===== modo assistido =====
Visual8.update = function (dt) {
  Visual8.bossMech(dt);
  const sp = G.sp; if (sp && !G.boss && !G.bossPending && !G.bossDone && G.state === 'play' && !G.training && !G.rush) {
    if (sp.on) Visual8.spRun(dt);
    else if (G.endless) { if (G.wave >= 2 && G.wave % 2 === 0 && G.waveT > 10 && sp.wave !== G.wave) { sp.wave = G.wave; Visual8.spStart(); } }
    else { for (const q of sp.queue) if (!q.done && G.t >= q.f * G.stage.duration) { q.done = true; Visual8.spStart(); break; } }
  }
  const p = G.player;
  if (Save.data.settings.assist && p && !p.dead && G.state === 'play') {
    p.assistCd = Math.max(0, (p.assistCd || 0) - dt);
    if (p.assistCd <= 0) for (const b of G.eb) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < 85) { b.dead = true; p.assistCd = .5; shockwave(b.x, b.y, 60, '#7fe0ff'); sparks(b.x, b.y, '#7fe0ff', 6, 200); break; }
  }
};
