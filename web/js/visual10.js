'use strict';
// ---------- inimigos novos das fases 4 a 6: fantasma, divisor, teleportador, torreta e gerador ----------
ENEMY_DEF.ghost = { hp: 5, rad: 26, spd: 80, xp: 3, score: 40, coin: .3, glow: '#9fd0ff' };
ENEMY_DEF.splitter = { hp: 10, rad: 34, spd: 60, xp: 5, score: 60, coin: .4, glow: '#7fffa0' };
ENEMY_DEF.teleporter = { hp: 6, rad: 26, spd: 0, xp: 4, score: 50, coin: .35, glow: '#c040ff' };
ENEMY_DEF.turret = { hp: 14, rad: 30, spd: 0, xp: 6, score: 80, coin: .5, glow: '#ff5a3c' };
ENEMY_DEF.generator = { hp: 18, rad: 36, spd: 55, xp: 8, score: 100, coin: .6, glow: '#ffd36a' };
SRC_NAME.ghost = 'Fantasma'; SRC_NAME.splitter = 'Divisor'; SRC_NAME.teleporter = 'Teleportador'; SRC_NAME.turret = 'Torreta'; SRC_NAME.generator = 'Gerador';
SRC_TIP.ghost = 'O fantasma fica intangível por instantes: espere ele voltar ao normal para atirar.'; SRC_TIP.splitter = 'O Divisor se parte em bits: afaste-se antes de derrotá-lo.';
SRC_TIP.teleporter = 'O Teleportador some e reaparece atirando em leque: saia da linha de tiro quando ele piscar.'; SRC_TIP.turret = 'A torreta carrega um laser: a linha vermelha mostra por onde ele vai.'; SRC_TIP.generator = 'O Gerador invoca bits sem parar: derrote-o primeiro.';

{
  const ue = updateEnemy;
  updateEnemy = function (e, dt) {
    const t = e.type;
    if (t === 'ghost') {
      e.y += e.spd * dt; e.x = e.bx + Math.sin(e.age * 1.4 + e.ph) * 120; e.phased = (e.age % 3.2) > 2.1;
      e.shootT -= dt; if (e.shootT <= 0 && !e.phased) { e.shootT = 2.2; fanAimed(e.x, e.y, 1, 0, 230); }
    } else if (t === 'splitter') {
      e.y += e.spd * dt; e.x = e.bx + Math.sin(e.age * .9 + e.ph) * 70; e.shootT -= dt; if (e.shootT <= 0) { e.shootT = 2.3; fanAimed(e.x, e.y, 2, .5, 210); }
    } else if (t === 'teleporter') {
      if (e.y < 0) e.y += 220 * dt;
      e.tpT = (e.tpT ?? 1.4) - dt; e.warn = e.tpT < .6;
      if (e.tpT <= 0) { shockwave(e.x, e.y, 80, '#c040ff'); e.x = rand(90, W - 90); e.y = rand(90, 320); e.tpT = 2.6; shockwave(e.x, e.y, 110, '#c040ff'); burst(e.x, e.y, ['#c040ff', '#ffffff'], 12, 240, 4); fanAimed(e.x, e.y, 5, .85, 240); Snd.play('enemyShoot', { pan: Snd.panX(e.x) }); }
    } else if (t === 'turret') {
      e.sy = e.sy ?? e.y; if (e.y < 70) e.y += 160 * dt;
      e.shootT -= dt; if (e.shootT <= 0) { e.shootT = 2.4; fanAimed(e.x, e.y, 3, .6, 230); }
      e.lasT = (e.lasT ?? 3) - dt; if (e.lasT <= 0 && e.age < 13) { e.lasT = 5.5; bossLaser(e, aimAt(e.x, e.y), 1.0, .6, '#ff5a3c'); }
      e.chargeT = Math.max(0, (e.chargeT || 0) - dt);
      if (e.age > 15) { e.y -= 200 * dt; if (e.y < -60) { e.dead = true; e.counted = true; } }
    } else if (t === 'generator') {
      e.y = Math.min(160, e.y + e.spd * dt * 3); if (e.y >= 160) e.x = e.bx + Math.sin(e.age * .6 + e.ph) * 160;
      e.genT = (e.genT ?? 2) - dt; if (e.genT <= 0 && e.y >= 140) { e.genT = 3.6; for (const s of [-1, 1]) spawnEnemy('bit', e.x + s * 34, e.y + 24, { bx: e.x + s * 34, noElite: true }); shockwave(e.x, e.y, 90, '#ffd36a'); }
    }
    ue(e, dt);
  };
  const de = damageEnemy;
  damageEnemy = function (e, dmg, crit, chained) { if (e.type === 'ghost' && e.phased) { sparks(e.x, e.y, '#9fd0ff', 2, 140); return; } return de(e, dmg, crit, chained); };
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.counted; ke(e, by); if (was || !e.counted) return;
    if (e.type === 'splitter') { for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + .4; spawnEnemy('bit', e.x + Math.cos(a) * 30, e.y + Math.sin(a) * 20, { bx: e.x + Math.cos(a) * 30, noElite: true }); } shockwave(e.x, e.y, 120, '#7fffa0'); }
  };
  const sw = Game.spawnWave;
  Game.spawnWave = function (pool) {
    const st = G.stage ? G.stage.id : 0;
    if (st >= 4 && !(G.sp && G.sp.on) && G.enemies.length < 12 && Math.random() < .28) {
      const types = st === 4 ? ['ghost', 'ghost', 'ghost', 'splitter', 'splitter', 'splitter', 'teleporter', 'teleporter'] : ['teleporter', 'teleporter', 'teleporter', 'turret', 'turret', 'generator', 'generator', 'ghost', 'ghost', 'splitter', 'splitter'], ty = pick(types), x = rand(110, W - 110);
      if (ty === 'turret') { const left = Math.random() < .5; spawnEnemy('turret', left ? 56 : W - 56, -30, { bx: left ? 56 : W - 56 }); }
      else if (ty === 'ghost') { for (let i = 0; i < 2; i++) spawnEnemy('ghost', x, -30 - i * 70, { bx: x }); }
      else spawnEnemy(ty, x, -40, { bx: x });
      return;
    }
    sw.call(this, pool);
  };
  TRAIN_TYPES.push('ghost', 'splitter', 'teleporter', 'turret', 'generator');
}
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    const t = World.t + e.ph, r = e.rad, hit = e.hit > 0;
    if (!['ghost', 'splitter', 'teleporter', 'turret', 'generator'].includes(e.type)) return ae.call(this, e);
    ctx.save(); ctx.translate(e.x, e.y); const sc = easeBack(e.age / .35); ctx.scale(sc, sc);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 2.2, e.glow, .3); ctx.globalCompositeOperation = 'source-over';
    if (typeof Visual44 !== 'undefined' && Visual44.bodies[e.type]) { Visual44.bodies[e.type](e, r, t, hit); ctx.restore(); return; }
    if (e.type === 'ghost') {
      ctx.globalAlpha = e.phased ? .28 + Math.sin(t * 20) * .1 : .92;
      const g = ctx.createLinearGradient(0, -r, 0, r * 1.4); g.addColorStop(0, hit ? '#fff' : '#e8f4ff'); g.addColorStop(1, 'rgba(120,170,230,.6)'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, -2, r, Math.PI, 0); ctx.lineTo(r, r * 1.1); for (let i = 4; i >= 0; i--) ctx.lineTo(-r + i * r * .5, r * 1.1 + (i % 2 ? 9 : -2) + Math.sin(t * 6 + i) * 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1a2a5a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * .38, -4, r * .18, r * .26, 0, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(0, r * .38, r * .14, r * .2, 0, 0, TAU); ctx.fill();
    } else if (e.type === 'splitter') {
      const pu = 1 + Math.sin(t * 5) * .06; ctx.scale(pu, pu); ctx.fillStyle = hit ? '#fff' : 'rgba(120,255,160,.55)'; ctx.strokeStyle = '#2fb865'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#145a30'; ctx.beginPath(); ctx.arc(Math.sin(t) * 4, Math.cos(t * .8) * 3, r * .36, 0, TAU); ctx.fill();
      ctx.fillStyle = '#bfffd0'; for (let i = 0; i < 3; i++) { const a = t * .8 + i * 2.1; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .62, Math.sin(a) * r * .62, 4, 0, TAU); ctx.fill(); }
    } else if (e.type === 'teleporter') {
      ctx.rotate(t * 1.6); ctx.fillStyle = hit ? '#fff' : '#3a1070'; ctx.strokeStyle = '#c040ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -r * 1.3); ctx.lineTo(r, 0); ctx.lineTo(0, r * 1.3); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.rotate(-t * 3.2); ctx.strokeStyle = '#e8d0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * .6, 0, TAU); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
      if (e.warn) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = .5 + .5 * Math.sin(World.t * 40); ctx.beginPath(); ctx.arc(0, 0, r * 1.8, 0, TAU); ctx.stroke(); }
    } else if (e.type === 'turret') {
      const a = e.age < 15 ? aimAt(e.x, e.y) : Math.PI / 2; ctx.fillStyle = '#2a1030'; ctx.strokeStyle = '#ff5a3c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.rotate(a); ctx.fillStyle = hit ? '#fff' : '#5a1a2a'; ctx.beginPath(); ctx.roundRect(0, -8, r * 1.5, 16, 5); ctx.fill(); ctx.stroke();
      ctx.rotate(-a); ctx.globalCompositeOperation = 'lighter'; const ch = e.chargeT > 0 ? 1 - e.chargeT / (e.chargeMax || 1) : 0; drawGlow(0, 0, 26 + ch * 30, '#ff5a3c', .5 + ch * .5);
    } else {
      ctx.fillStyle = hit ? '#fff' : '#6a4a10'; ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.rotate(t * 1.2); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.rotate(TAU / 6); ctx.beginPath(); ctx.moveTo(r * .45, 0); ctx.lineTo(r * .7, 0); ctx.stroke(); } ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 24 + Math.sin(t * 6) * 4, '#ffd36a', .8);
    }
    ctx.restore();
  };
}
