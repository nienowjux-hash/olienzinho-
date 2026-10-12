'use strict';
// ---------- gameplay 2: graze, capsulas, pontos fracos, cristais do Vazio, evolucao de armas, reliquias, chefes em sequencia, santuario ----------
const Visual5 = {};
const wlv = id => ((Save.data.wlevel = Save.data.wlevel || {})[id]) || 1;
Visual5.wl = wlv;
Visual5.wCost = lv => [0, 400, 800, 1500, 3000][lv] || 3000;
Visual5.wShots = p => { const lv = wlv(p.weapon); return lv >= 5 ? 2 : lv >= 3 ? 1 : 0; };

// ===== conquistas novas =====
ACH.push(
  { id: 'graze', name: 'Equilibrista', desc: 'Roce em 300 tiros inimigos.', ok: () => (Save.data.stats.grazes || 0) >= 300 },
  { id: 'weak', name: 'Cirurgião', desc: 'Acerte 50 pontos fracos de chefes.', ok: () => (Save.data.stats.weaks || 0) >= 50 },
  { id: 'wlv5', name: 'Mestre das Armas', desc: 'Leve uma arma ao nível 5.', ok: () => Object.values(Save.data.wlevel || {}).some(v => v >= 5) },
  { id: 'relic4', name: 'Colecionador de Relíquias', desc: 'Jogue com 4 relíquias diferentes.', ok: () => Object.keys(Save.data.relicsUsed || {}).length >= 4 },
  { id: 'rush', name: 'Domador de Chefes', desc: 'Zere os Chefes em Sequência.', ok: () => !!(Save.data.rush && Save.data.rush.best) },
  { id: 'rush_perfect', name: 'Perfeição Absoluta', desc: 'Zere os Chefes em Sequência sem tomar dano.', ok: () => !!(Save.data.rush && Save.data.rush.perfect) },
);

// ===== graze =====
Visual5.graze = function (b) {
  b.grazed = true; const p = G.player; G.grazeN = (G.grazeN || 0) + 1; G.grazeAt = World.t; Save.data.stats.grazes = (Save.data.stats.grazes || 0) + 1;
  G.score += 8; p.specCd = Math.max(0, p.specCd - .3); sparks(b.x, b.y, '#ffe9a8', 3, 170); Snd.play('graze');
};

// ===== capsulas temporarias =====
const CAPS = {
  rapid: { name: 'CADÊNCIA TURBO', c: '#ffb340', dur: 10 }, double: { name: 'TIRO DUPLO', c: '#9fe8ff', dur: 12 },
  magnet: { name: 'ÍMÃ GIGANTE', c: '#ffe9a8', dur: 10 }, aegis: { name: 'ESCUDO DE LUZ', c: '#7fe0ff', dur: 6 }, bomb: { name: 'BOMBA DE LUZ', c: '#ff7a4a', dur: 0 },
};
Visual5.takeCap = function (sub) {
  const p = G.player, c = CAPS[sub] || CAPS.rapid; p.buffs = p.buffs || {};
  Snd.play('levelUp'); popup(p.x, p.y - 70, c.name, c.c, 24); shockwave(p.x, p.y, 220, c.c);
  if (sub === 'bomb') {
    for (const q of G.eb) q.dead = true; shockwave(p.x, p.y, 700, '#ff7a4a'); flashScreen(.5); shake(16);
    for (const e of G.enemies) if (!e.dead && e.type !== 'dummy') damageEnemy(e, p.dmg * 7, false, true);
    const bo = G.boss; if (bo && bo.targetable()) bo.damage(Math.min(p.dmg * 10, bo.maxHp * .03));
  } else { p.buffs[sub] = c.dur; if (sub === 'double') recalcStats(p); }
};
Visual5.update = function (dt) {
  const p = G.player; if (!p || p.dead) return; const b = p.buffs;
  if (b) {
    for (const k of Object.keys(b)) if (b[k] > 0) { b[k] -= dt; if (b[k] <= 0 && k === 'double') recalcStats(p); }
    if (b.aegis > 0) p.inv = Math.max(p.inv, .15);
  }
  const bo = G.boss; if (bo && bo.exposed > 0) bo.exposed -= dt;
};
{
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.counted; ke(e, by); if (was || !e.counted) return;
    if (e.type === 'crystal' && e.boss && e.boss.shieldN > 0) {
      const bs = e.boss; bs.shieldN--;
      if (bs.shieldN <= 0 && bs.state === 'fight') { bs.exposed = 6; bs.stun = Math.max(bs.stun, .8); for (let i = 0; i < 4; i++) shockwave(bs.x, bs.y, 260 + i * 130, i % 2 ? '#ffffff' : '#c04aff'); flashScreen(.6); shake(20); Snd.play('impact'); popup(bs.x, bs.y + 150, 'ESCUDO QUEBRADO!', '#ffe9a8', 36); burst(bs.x, bs.y, ['#ffffff', '#c04aff', '#ffe9a8'], 70, 600, 7); }
      return;
    }
    if (!by || G.sanct || G.training || e.type === 'crystal') return;
    const big = e.type === 'tank' || e.type === 'captain';
    if (Math.random() < (big ? .3 : .035) + (G.weekly && G.wrule === 3 ? .22 : 0)) { const subs = ['rapid', 'double', 'magnet', 'aegis', 'bomb', 'rapid', 'double']; dropPickup('cap', e.x, e.y, pick(subs)); }
  };
}
{
  const ap = Art.pickup;
  Art.pickup = function (k) {
    if (k.type !== 'cap') return ap.call(this, k);
    const c = (CAPS[k.val] || CAPS.rapid).c, t = World.t + k.age;
    ctx.save(); ctx.translate(k.x, k.y + Math.sin(t * 4) * 3); const sc = easeBack(k.age / .3); ctx.scale(sc, sc);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 40, c, .8); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.rotate(Math.sin(t * 2) * .2); ctx.fillStyle = 'rgba(14,4,40,.9)'; ctx.strokeStyle = c; ctx.lineWidth = 3;
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    if (k.val === 'rapid') { ctx.beginPath(); ctx.moveTo(3, -9); ctx.lineTo(-4, 1); ctx.lineTo(3, 1); ctx.lineTo(-3, 10); ctx.stroke(); }
    else if (k.val === 'double') { for (const x of [-4.5, 4.5]) { ctx.beginPath(); ctx.roundRect(x - 2, -9, 4, 16, 2); ctx.fill(); } }
    else if (k.val === 'magnet') { ctx.beginPath(); ctx.arc(0, -1, 7, Math.PI, 0); ctx.lineTo(7, 8); ctx.moveTo(-7, -1); ctx.lineTo(-7, 8); ctx.stroke(); }
    else if (k.val === 'aegis') { ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(8, -5); ctx.lineTo(6, 4); ctx.lineTo(0, 10); ctx.lineTo(-6, 4); ctx.lineTo(-8, -5); ctx.closePath(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, 2, 7, 0, TAU); ctx.fill(); ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(3, -4); ctx.lineTo(6, -9); ctx.stroke(); }
    ctx.restore();
  };
}

// ===== pontos fracos dos chefes =====
Visual5.weak = function (b) { const R = b.rad || 110, a = b.t * .9; return { x: b.x + Math.cos(a) * R * .4, y: b.y + Math.sin(a * 1.3) * R * .18 + (b.name === 'Nave-Mãe Zangão' ? 28 : 0), r: Math.max(34, R * .26) }; };
Visual5.weakMul = function (b, x, y, br) {
  if (b.state !== 'fight') return 1; const w = Visual5.weak(b);
  if (Math.hypot(x - w.x, y - w.y) < w.r + (br || 6)) { b._wh = World.t; Save.data.stats.weaks = (Save.data.stats.weaks || 0) + 1; if (Math.random() < .35) { sparks(x, y, '#ffd36a', 5, 260); } return 2.2; }
  return 1;
};
{
  const ba = Visual.bossAura;
  Visual.bossAura = function (b) {
    ba.call(this, b); const t = World.t;
    if (b.state === 'fight') {
      const w = Visual5.weak(b), hit = t - (b._wh || -9) < .16;
      ctx.save(); ctx.translate(w.x, w.y); ctx.globalCompositeOperation = 'lighter'; const k = 1 + Math.sin(t * 6) * .08;
      ctx.strokeStyle = hit ? '#ffffff' : '#ffd36a'; ctx.lineWidth = hit ? 4 : 2.5; ctx.globalAlpha = hit ? 1 : .8;
      ctx.beginPath(); ctx.arc(0, 0, w.r * k, 0, TAU); ctx.stroke(); ctx.rotate(t * 1.4); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(w.r * k - 6, 0); ctx.lineTo(w.r * k + 10, 0); ctx.stroke(); }
      drawGlow(0, 0, w.r * 1.5, '#ffd36a', hit ? .6 : .18);
      ctx.restore();
      if (b.t < 7) { ctx.globalAlpha = clamp((7 - b.t) / 1.5, 0, 1); txt('PONTO FRACO', w.x, w.y - w.r - 22, 14, '#ffd36a', 'center', 900); ctx.globalAlpha = 1; }
    }
    if (b.shieldN > 0 && b.state === 'fight') { // escudo de cristais
      const R = (b.rad || 120) * 1.35; ctx.save(); ctx.translate(b.x, b.y); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#c04aff'; ctx.lineWidth = 3; ctx.globalAlpha = .5 + Math.sin(t * 5) * .15; ctx.rotate(t * .3);
      ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * TAU; ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); } ctx.stroke(); drawGlow(0, 0, R * 1.4, '#9a63ff', .25); ctx.restore();
    }
  };
}
{ // vazio: cristais protetores
  const op = VoidBoss.prototype.onPhase;
  VoidBoss.prototype.onPhase = function () {
    op.call(this); const n = 2 + this.phase; this.shieldN = n;
    for (let i = 0; i < n; i++) spawnEnemy('crystal', this.x, this.y, { boss: this, ang: i / n * TAU, mode: 'hover', hp: 12 + this.phase * 6, maxHp: 12 + this.phase * 6 });
    G.timers.push({ t: 2.2, fn: () => popup(W / 2, 200, 'QUEBRE OS CRISTAIS!', '#c04aff', 34) });
  };
  const bd = Boss.prototype.damage;
  Boss.prototype.damage = function (n, c) {
    if (this.shieldN > 0) { n *= .08; this._sf = World.t; }
    else if (this.exposed > 0) n *= 1.5;
    bd.call(this, n, c);
  };
}
ENEMY_DEF.crystal = { hp: 12, rad: 30, spd: 0, xp: 5, score: 80, coin: .8, glow: '#e8d0ff' };
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    if (e.type !== 'crystal') return ae.call(this, e);
    const t = World.t, r = e.rad, hit = e.hit > 0;
    ctx.save(); ctx.translate(e.x, e.y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 2.4, '#c04aff', .5); ctx.globalCompositeOperation = 'source-over';
    ctx.rotate(t * 1.3); ctx.fillStyle = hit ? '#ffffff' : '#e8d0ff'; ctx.strokeStyle = '#7a2ad6'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -r * 1.3); ctx.lineTo(r * .8, 0); ctx.lineTo(0, r * 1.3); ctx.lineTo(-r * .8, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(154,99,255,.7)'; ctx.beginPath(); ctx.moveTo(0, -r * 1.3); ctx.lineTo(r * .8, 0); ctx.lineTo(0, r * .2); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (e.maxHp && e.hp < e.maxHp) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - 22, e.y - r - 16, 44, 5); ctx.fillStyle = '#c04aff'; ctx.fillRect(e.x - 22, e.y - r - 16, 44 * e.hp / e.maxHp, 5); }
  };
}

// ===== relíquias =====
const RELICS = [
  { id: 'heartc', name: 'Coração de Cristal', icon: 'hp', desc: '+2 de vida máxima, mas -20% de dano.' },
  { id: 'lens', name: 'Lente do Caçador', icon: 'crit', desc: '+15% de crítico e críticos mais fortes.' },
  { id: 'spark', name: 'Faísca Eterna', icon: 'spec', desc: 'O especial recarrega 35% mais rápido.' },
  { id: 'magnet', name: 'Ímã de Estrela', icon: 'magnet', desc: 'Atrai de mais longe e +30% de estrelas.' },
  { id: 'sun', name: 'Escudo Solar', icon: 'shield', desc: 'Começa com um escudo que recarrega sozinho.' },
  { id: 'fuse', name: 'Pavio Curto', icon: 'rate', desc: '+40% de velocidade de tiro, mas -1 de vida.' },
  { id: 'trace', name: 'Rastro Longo', icon: 'combochg', desc: 'O combo dura muito mais tempo.' },
  { id: 'vamp', name: 'Sede de Luz', icon: 'vamp', desc: 'Derrotar inimigos cura você de vez em quando.' },
];
Visual5.relicStats = function (p) {
  switch (G.relic) {
    case 'heartc': p.maxHp += 2; p.dmg *= .8; break;
    case 'lens': p.crit += .15; p.critMul = 2.5; break;
    case 'spark': p.specCdMax *= .65; break;
    case 'magnet': p.magnet += 120; p.coinMul *= 1.3; break;
    case 'fuse': p.fireDelay /= 1.4; p.maxHp = Math.max(2, p.maxHp - 1); break;
  }
};
Visual5.pickRelic = function (next) {
  if (Game.noStory || G.training || Extras.tut || Game._skipRelic) { next(); return; }
  if (Visual5.rushRelic !== undefined) { G.relic = Visual5.rushRelic; next(); return; }
  const pool = RELICS.filter(r => !r.ng || Save.data.ngpOn).sort(() => Math.random() - .5).slice(0, 3);
  G.relicOpts = pool; G.relicNext = next; G.state = 'relic'; G.relicAt = undefined;
};
Visual5.applyRelic = function (id) {
  G.relic = id; Save.data.relicsUsed = Save.data.relicsUsed || {}; Save.data.relicsUsed[id] = true; Save.save();
  const p = G.player; if (id === 'sun') { G.upCounts.shield = Math.max(1, G.upCounts.shield || 0); p.shieldReady = true; }
  if (id === 'vamp') G.upCounts.vamp = Math.max(1, G.upCounts.vamp || 0);
  recalcStats(p); p.hp = p.maxHp; Ach.check();
};
Screens.relic = function () {
  const opts = G.relicOpts; if (!opts) { G.state = 'play'; return; }
  if (G.relicAt === undefined) G.relicAt = World.t; const t = World.t - G.relicAt;
  this.dim(.78); txt('ESCOLHA UMA RELÍQUIA', W / 2, 90, 54, '#fff', 'center'); txt('Ela vale só para esta jornada.', W / 2, 160, 20, '#ffb340', 'center', 800);
  const cw = 330, ch = 330, gap = 36, x0 = W / 2 - (cw * 3 + gap * 2) / 2, y0 = 220;
  opts.forEach((r, i) => {
    const x = x0 + i * (cw + gap), id = 'rl' + i, f = UI.focus(id), ek = clamp(easeBack((t - i * .1) / .45), 0, 1.15);
    if (t > .5 && (UI.hit(id, x, y0, cw, ch) || Input.pressed(String(i + 1)))) { Visual5.applyRelic(r.id); const nx = G.relicNext; G.relicOpts = null; G.relicNext = null; Snd.play('levelUp'); nx(); return; }
    ctx.save(); ctx.translate(0, (1 - clamp(ek, 0, 1)) * 60); ctx.globalAlpha = clamp(ek, 0, 1);
    if (f) { ctx.shadowColor = '#ffb340'; ctx.shadowBlur = 34; }
    const g = ctx.createLinearGradient(0, y0, 0, y0 + ch); g.addColorStop(0, f ? '#4b2bd6' : '#2f1782'); g.addColorStop(1, '#14083a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y0, cw, ch, 22); ctx.fill(); ctx.strokeStyle = f ? '#fff' : '#ffb340'; ctx.lineWidth = f ? 4 : 2; ctx.stroke(); ctx.shadowBlur = 0;
    txt('RELÍQUIA', x + cw / 2, y0 + 22, 14, '#ffb340', 'center', 900); txt(String(i + 1), x + 18, y0 + 22, 20, '#8a7fb0');
    Visual2.upIcon(r.icon, x + cw / 2, y0 + 108, 34, '#ffb340', f);
    txt(r.name, x + cw / 2, y0 + 170, 26, '#fff', 'center'); UI.wrap(r.desc, x + cw / 2, y0 + 218, cw - 50, 26, 19, '#cdb8ff', 'center');
    ctx.restore();
  });
  txt('Clique, aperte 1 / 2 / 3 ou use as setas + Enter', W / 2, 600, 17, '#8a7fb0', 'center', 700);
};
Visual5.hud = function () {
  if (G.state !== 'play') return; const p = G.player; if (!p) return;
  if (G.relic) { const r = RELICS.find(q => q.id === G.relic); if (r) { ctx.save(); ctx.globalAlpha = .9; Visual2.upIcon(r.icon, 40, 112, 11, '#ffb340', false); ctx.restore(); txt(r.name, 58, 104, 13, '#ffcf6b', 'left', 800); } }
  if (G.grazeAt !== undefined && World.t - G.grazeAt < 2) { ctx.globalAlpha = clamp(2 - (World.t - G.grazeAt), 0, 1); txt('RASPÃO x' + G.grazeN, W - 24, 144, 15, '#ffe9a8', 'right', 800); ctx.globalAlpha = 1; }
  let i = 0; for (const k of Object.keys(p.buffs || {})) if (p.buffs[k] > 0) { const c = CAPS[k]; txt(c.name, 24, 140 + i * 22, 13, c.c, 'left', 800); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(24, 156 + i * 22, 110, 3); ctx.fillStyle = c.c; ctx.fillRect(24, 156 + i * 22, 110 * clamp(p.buffs[k] / c.dur, 0, 1), 3); i++; }
  if (G.rush) txt('CHEFE ' + (G.rushI + 1) + ' / ' + (Visual5.tourList ? Visual5.tourList.length : 6), W - 24, 164, 15, '#ff8a5f', 'right', 900);
};

// ===== chefes em sequencia =====
Visual5.startRush = function (tour) {
  Visual5.tourList = tour || null;
  if (Game._nsPrev === undefined) Game._nsPrev = Game.noStory; Game.noStory = true;
  Visual5.rush = { score: 0, up: {}, hp: null, hits: 0, t0: performance.now() }; Visual5.rushRelic = undefined; Visual5.rushStep(0);
};
Visual5.rushStep = function (i) {
  const r = Visual5.rush; Game.startStage(Visual5.tourList ? Visual5.tourList[i] : i, { skipStory: true }); G.rush = true; G.rushI = i; G.score = r.score; G.upCounts = r.up;
  recalcStats(G.player); G.player.hp = r.hp ?? G.player.maxHp; G.t = G.stage.duration - .1; G.miniDone = true; Events.banner = null; G.state = 'play';
};
{
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () {
    if (!G.rush) return bd.call(this);
    const r = Visual5.rush; r.score = G.score; r.hits += G.stats.hits; r.hp = Math.min(G.player.maxHp, G.player.hp + 2);
    G.bossDone = true; G.player.mood = 'happy'; G.player.moodT = 3; for (const k of G.pickups) k.mag = true; flashScreen(.5); Snd.play('stinger');
    const last = G.rushI >= (Visual5.tourList ? Visual5.tourList.length - 1 : 5);
    if (last) G.timers.push({ t: 2.2, fn: () => Visual5.rushEnd() });
    else { popup(W / 2, 240, 'PRÓXIMO CHEFE...', '#ffb340', 34); G.timers.push({ t: 2.8, fn: () => Visual5.rushStep(G.rushI + 1) }); }
  };
}
Visual5.rushEnd = function () {
  const r = Visual5.rush, secs = (performance.now() - r.t0) / 1000, perfect = r.hits === 0, d = Save.data, RK = Visual5.tourList ? 'tour' : 'rush'; d[RK] = d[RK] || {};
  const firstClear = !d[RK].best, firstPerfect = perfect && !d[RK].perfect, nb = firstClear || secs < d[RK].best; if (nb) d[RK].best = secs; if (perfect) d[RK].perfect = true;
  const reward = (firstClear ? 150 : 0) + (firstPerfect ? 250 : 0); d.coins += reward + G.runCoins; // recompensa so na primeira vez: nada de farmar estrelas Save.save(); Ach.check();
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  G.bonusEnd = { title: Visual5.tourList ? 'TORNEIO FINAL CONCLUÍDO!' : 'CHEFES DERROTADOS!', sub: perfect ? 'SEM TOMAR DANO. Perfeito!' : (Visual5.tourList ? 'Os guardiões do Outro Lado caíram.' : 'Os seis guardiões caíram.'), rows: [['Tempo', fmt(secs)], ['Pontuação', r.score + ' pts'], ['Golpes sofridos', String(r.hits)], ['Recompensa (1ª vez)', '★ ' + reward]], again: () => Visual5.startRush(Visual5.tourList ? [6, 7, 8].sort(() => Math.random() - .5).concat([9]) : null), best: nb ? 'NOVO RECORDE DE TEMPO!' : 'Recorde: ' + fmt(d[RK].best) };
  G.state = 'bonusEnd'; G.bonusAt = undefined; Snd.play('stageClear'); Snd.musicPlay('triumph', 1);
};
Screens.bonusEnd = function () {
  const b = G.bonusEnd; if (!b) { Game.goTitle(); return; }
  if (G.bonusAt === undefined) G.bonusAt = World.t; const t = World.t - G.bonusAt;
  ctx.fillStyle = 'rgba(8,2,22,' + clamp(t / .8, 0, .82) + ')'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(W / 2, 170, 420, '#ffd36a', clamp(t / 1.2, 0, .25)); ctx.restore();
  const e = easeOut(clamp((t - .15) / .8, 0, 1)); ctx.save(); ctx.translate(W / 2, 112); ctx.scale(1.2 - .2 * e, 1.2 - .2 * e); ctx.globalAlpha = e; ctx.shadowColor = '#ffb340'; ctx.shadowBlur = 40; txt(b.title, 0, -40, 64, '#ffe9a8', 'center', 900); ctx.restore(); ctx.globalAlpha = 1;
  ctx.globalAlpha = clamp((t - .8) / .5, 0, 1); txt(b.sub, W / 2, 196, 22, '#cdb8ff', 'center', 700); if (b.best) txt(b.best, W / 2, 228, 16, '#ffb340', 'center', 800); ctx.globalAlpha = 1;
  const px = 400, py = 270; UI.panel(px, py, 480, 60 + b.rows.length * 44, { r: 22 });
  b.rows.forEach(([a, v], i) => { const k = easeOut(clamp((t - 1.1 - i * .15) / .4, 0, 1)); ctx.globalAlpha = k; txt(a, px + 36 - (1 - k) * 40, py + 24 + i * 44, 21, '#cdb8ff', 'left', 700); txt(v, px + 444, py + 22 + i * 44, 25, i === b.rows.length - 1 ? '#ffcf6b' : '#fff', 'right'); }); ctx.globalAlpha = 1;
  let x = 90; if (this.menuItem('again', 'JOGAR DE NOVO', x, 584, 38, '')) { b.again(); return; } x += this.menuW('JOGAR DE NOVO', 38) + 56;
  if (this.menuItem('menu', 'MENU', x, 594, 26, '')) { G.bonusEnd = null; Game.goTitle(); }
  this.bars();
};
{
  const gt = Game.goTitle;
  Game.goTitle = function () { G.rush = false; G.sanct = false; if (Game._nsPrev !== undefined) { Game.noStory = Game._nsPrev; Game._nsPrev = undefined; } return gt.call(this); };
}

// ===== tela de modos (5 cartoes) =====
Screens.modes = function () {
  const day = Extras.todayMod();
  txt('MODOS EXTRAS', W / 2, 36, 46, '#fff', 'center');
  const cards = [
    { id: 'inf', name: 'MODO INFINITO', c: '#ffb340', lines: ['Ondas sem fim, cada vez mais difíceis.', 'Um chefe a cada 5 ondas.'], foot: 'Melhor onda: ' + (Save.data.bestWave || 0), go: () => Game.startEndless() },
    { id: 'day', name: 'DESAFIO DO DIA', c: '#7fe0ff', lines: ['Mesma sequência de inimigos para todos, hoje.', day.name + ': ' + day.desc], foot: 'Seu melhor: ' + Extras.dailyBest(), go: () => Game.startDaily() },
    { id: 'rush', name: 'CHEFES EM SEQUÊNCIA', c: '#ff8a5f', lines: ['Os 6 chefes, um atrás do outro.', 'Pouca cura entre as lutas. Dá para zerar sem dano?'], foot: Save.data.rush && Save.data.rush.best ? 'Melhor tempo: ' + Math.floor(Save.data.rush.best / 60) + ':' + String(Math.floor(Save.data.rush.best % 60)).padStart(2, '0') : 'Ainda não zerado', go: () => Visual5.startRush() },
    { id: 'tr', name: 'TREINO', c: '#7fe0a0', lines: ['Teste armas, skins e inimigos sem risco.', 'Nada é salvo.'], foot: 'sem pressão :)', go: () => Game.startTraining() },
  ];
  const cw = 290, gap = 18, x0 = W / 2 - (cw * 4 + gap * 3) / 2;
  cards.forEach((cd, i) => {
    const x = x0 + i * (cw + gap), y = 120, h = 430, id = 'm_' + cd.id, f = UI.focus(id);
    if (UI.hit(id, x, y, cw, h, {})) { cd.go(); return; }
    const ek = Screens.enterK(i, .5); ctx.save(); ctx.translate(0, (1 - ek) * 70 - (f ? 8 : 0)); ctx.globalAlpha = clamp(ek, 0, 1);
    ctx.save(); if (f) { ctx.shadowColor = cd.c; ctx.shadowBlur = 30; }
    UI.panel(x, y, cw, h, { fill: f ? 'rgba(50,28,120,.85)' : 'rgba(20,8,55,.75)', stroke: f ? cd.c : 'rgba(190,160,255,.3)', r: 22 }); ctx.restore();
    ctx.save(); ctx.translate(x + cw / 2, y + 82); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 80, cd.c, .5 + (f ? .2 : 0)); ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = cd.c; ctx.fillStyle = cd.c; ctx.lineWidth = 6; ctx.lineCap = 'round';
    if (cd.id === 'inf') { ctx.beginPath(); for (let a = 0; a <= TAU + .1; a += .1) { const px = Math.cos(a) * 40, py = Math.sin(2 * a) * 19; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
    else if (cd.id === 'day') { ctx.beginPath(); ctx.arc(0, 0, 33, 0, TAU); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -19); ctx.lineTo(0, 0); ctx.lineTo(14, 9); ctx.stroke(); }
    else if (cd.id === 'rush') { for (let k = 0; k < 3; k++) { ctx.globalAlpha *= .8; ctx.beginPath(); ctx.arc(-26 + k * 26, 0, 14, 0, TAU); ctx.stroke(); } }
    else { ctx.beginPath(); ctx.arc(0, 0, 33, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill(); }
    ctx.restore();
    UI.wrap(cd.name, x + cw / 2, y + 150, cw - 30, 26, 21, '#fff', 'center');
    cd.lines.forEach((l, k) => UI.wrap(l, x + cw / 2, y + 232 + k * 74, cw - 36, 22, 15, '#cdb8ff', 'center'));
    UI.wrap(cd.foot, x + cw / 2, y + h - 54, cw - 30, 20, 14, cd.c, 'center');
    ctx.restore();
  });
  if (UI.button('back', W / 2 - 160, 590, 320, 54, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goTitle(); }
  Screens.thinFrame();
};
