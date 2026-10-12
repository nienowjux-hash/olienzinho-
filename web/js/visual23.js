'use strict';
// ---------- polimento 23: chefes das fases 1 a 4 com golpes novos, numeros de dano nos inimigos, barra do chefe com emblema,
// 3 inimigos novos para as Partes 1 e 2, paradas no Infinito e musica que acelera a cada furia ----------
const extend = (Cls, fnAI, fnDraw) => {
  const a = Cls.prototype.ai, d = Cls.prototype.draw;
  Cls.prototype.ai = function (dt) { a.call(this, dt); if (this.state === 'fight' && !(this.stun > 0) && !G.player.dead) fnAI.call(this, dt); };
  Cls.prototype.draw = function () { d.call(this); if (this.state !== 'dying' && fnDraw && QL() >= 1) { ctx.save(); ctx.translate(this.x, this.y); try { fnDraw.call(this); } catch (e) { } ctx.restore(); } };
};
const slots = (n, k) => { const a = Array.from({ length: n }, (_, i) => i); a.sort(() => Math.random() - .5); return a.slice(0, k); };

// ---- Nave-Mae: bombardeio em tapete e escolta ----
extend(MotherShip, function (dt) {
  const ph = this.phase;
  if (this.tick('carpet', dt, ph === 0 ? 8 : ph === 1 ? 6.5 : 5.2)) { popup(W / 2, 240, 'BOMBARDEIO!', '#ffb340', 26); Snd.play('bossWarn'); for (const i of slots(7, 3 + ph)) { const x = 100 + i * 180; Events.hazardRect(x, H / 2, 74, H, 1.1, .35, '#ffb340', 'bolt'); P3.at(1.1, () => { for (let k = 0; k < 3; k++) ebullet(x + rand(-20, 20), -10 - k * 40, Math.PI / 2, 260, { r: 9 }); }); } }
  if (this.tick('escort', dt, 12) && G.enemies.filter(e => !e.dead && e.type === 'drone').length < 4) for (const s of [-1, 1]) spawnEnemy('drone', clamp(this.x + s * 150, 60, W - 60), this.y + 40, { bx: this.x + s * 150, noElite: true });
}, function () {
  const t = this.t; ctx.globalCompositeOperation = 'lighter';
  for (let i = -4; i <= 4; i++) { const on = Math.sin(t * 6 + i * .9) > 0; ctx.globalAlpha = on ? .9 : .25; drawGlow(i * 34, 56, 9, i % 2 ? '#ff4a3c' : '#ffd36a', 1); }
  if (this.phase >= 1) { const a = t * 5; ctx.globalAlpha = .6; drawGlow(Math.cos(a) * 20, -62 + Math.sin(a) * 6, 26, '#ff3a2a', .9); }
});

// ---- Gigante de Rocha: avalanche e rachaduras de lava ----
extend(RockGolem, function (dt) {
  const ph = this.phase;
  if (this.tick('avalanche', dt, ph === 0 ? 8.5 : ph === 1 ? 6.8 : 5.6)) { popup(W / 2, 240, 'AVALANCHE!', '#ff9a3c', 26); Snd.play('rumble', { dur: 1 }); shake(6); for (const i of slots(9, 4 + ph)) { const x = 90 + i * 140; Events.hazardRect(x, H / 2, 56, H, 1.0, .2, '#ff9a3c', 'bolt'); P3.at(1.0, () => ebullet(x, -20, Math.PI / 2, 330, { r: 15 })); } }
  if (ph >= 1 && this.tick('quake2', dt, 9)) { popup(W / 2, 240, 'TREMOR!', '#ff9a3c', 24); for (const y of [H - 120, H - 230]) Events.hazardRect(W / 2, y, W + 40, 50, 1.2, .5, '#ff9a3c', 'beam'); shake(10); }
}, function () {
  const hp = 1 - this.ratio, t = this.t; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff7a1a'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.globalAlpha = (.25 + hp * .6) * (.8 + .2 * Math.sin(t * 4));
  for (let i = 0; i < 6; i++) { const a = i * 1.1 + .4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 14); ctx.lineTo(Math.cos(a) * 46 + Math.sin(t + i) * 3, Math.sin(a) * 52); ctx.lineTo(Math.cos(a + .2) * 78, Math.sin(a + .2) * 84); ctx.stroke(); }
  if (Math.random() < .4) G.parts.push({ x: this.x + rand(-90, 90), y: this.y + rand(-30, 40), vx: rand(-20, 20), vy: rand(30, 90), life: .8, max: .8, r: rand(2, 4), c: '#c8a070', drag: 1 });
});

// ---- Olho da Tempestade: raios encadeados e chuva ----
extend(StormEye, function (dt) {
  const ph = this.phase, p = G.player;
  if (this.tick('chain', dt, ph === 0 ? 7.5 : ph === 1 ? 6 : 4.8)) { popup(W / 2, 240, 'RAIOS!', '#ff7ac8', 26); Snd.play('bossWarn'); const n = 5 + ph, dir = p.x > W / 2 ? 1 : -1; for (let i = 0; i < n; i++) { const x = clamp(dir > 0 ? 120 + i * (W - 240) / (n - 1) : W - 120 - i * (W - 240) / (n - 1), 70, W - 70); P3.at(i * .32, () => Events.hazardRect(x, H / 2, 66, H, .75, .22, '#ff7ac8', 'bolt')); } }
  if (ph >= 1 && this.tick('rain', dt, ph === 1 ? .2 : .13)) ebullet(rand(40, W - 40), -10, Math.PI / 2, 330, { r: 4 });
}, function () {
  const t = this.t; for (let i = 0; i < 2; i++) { if (Math.random() < .5) { const a = rand(0, TAU); zap(Math.cos(a) * 20, Math.sin(a) * 20, Math.cos(a) * rand(110, 150), Math.sin(a) * rand(100, 140), 6, 12, '#ffd0f0', 2); } }
});

// ---- Sol-Guardiao: protuberancias e raios cruzados ----
extend(SunGuardian, function (dt) {
  const ph = this.phase;
  if (this.tick('flare', dt, ph === 0 ? 7 : ph === 1 ? 5.6 : 4.6)) { popup(W / 2, 240, 'PROTUBERÂNCIA!', '#ff7a1f', 26); ring(this.x, this.y, 22, 125, this.t, { r: 7 }); P3.at(.5, () => ring(this.x, this.y, 22, 125, this.t + .14, { r: 7 })); shockwave(this.x, this.y, 220, '#ffb340'); }
  if (ph >= 1 && this.tick('cross', dt, ph === 1 ? 9 : 7)) { popup(W / 2, 240, 'ECLIPSE!', '#ffb340', 26); const a = aimAt(this.x, this.y); for (let k = 0; k < (ph === 2 ? 4 : 2); k++) bossLaser(this, a + k * Math.PI / 2, 1.2, .8, '#ffb340'); }
}, function () {
  const t = this.t; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ff9a2a'; ctx.globalAlpha = .45; ctx.save(); ctx.rotate(t * .5);
  for (let i = 0; i < 14; i++) { ctx.rotate(TAU / 14); ctx.beginPath(); ctx.moveTo(110, -10); ctx.lineTo(150 + Math.sin(t * 5 + i * 2) * 18, 0); ctx.lineTo(110, 10); ctx.fill(); } ctx.restore();
});

// ---------- numeros de dano nos inimigos comuns ----------
{
  const de = damageEnemy;
  damageEnemy = function (e, dmg, crit, chained) {
    const r = de(e, dmg, crit, chained);
    if (e.type !== 'dummy' && e.type !== 'rod' && dmg > 0 && G.state === 'play') { e._dn = (e._dn || 0) + dmg; if (crit) e._dc = true; if (e._dt === undefined) e._dt = .32; }
    return r;
  };
  const showDn = e => { if (!(e._dn > .1)) return; if (G.pops.length < 36) { const w = G.player && WEAPONS[G.player.weapon], c = e._dc ? '#ffe9a8' : (w ? w.c : '#ffffff'); popup(e.x + rand(-12, 12), e.y - e.rad - 8, String(Math.round(e._dn * 10) / 10), c, e._dc ? 22 : 16); } e._dn = 0; e._dc = false; e._dt = undefined; };
  const ke = killEnemy; killEnemy = function (e, by) { showDn(e); return ke(e, by); };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { up.call(this, dt); if (G.state === 'play' && QL() >= 1) for (const e of G.enemies) if (e._dt !== undefined) { e._dt -= dt; if (e._dt <= 0) showDn(e); } };
}

// ---------- barra do chefe com emblema e moldura na cor dele ----------
{
  const bb = Visual4.bossBar;
  Visual4.bossBar = function (b) {
    bb.call(this, b); const x = W / 2 - 330, y = 78, c = b.col && b.col[0] === '#' ? b.col : '#ffb340', t = World.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c; ctx.globalAlpha = .55 + .15 * Math.sin(t * 4); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 8, y - 6, 676, 30, 12); ctx.stroke(); drawGlow(x - 44, y + 9, 40, c, .5);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(8,2,24,.9)'; ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x - 44, y + 9, 19, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2 + (b.phase || 0) * .2, r = i % 2 ? 6 : 12; ctx.lineTo(x - 44 + Math.cos(a) * r, y + 9 + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
  };
}

// ---------- musica acelera a cada furia ----------
{ const op = Boss.prototype.onPhase; Boss.prototype.onPhase = function () { op.call(this); try { Snd.setTempo(1 + .05 * this.phase); } catch (e) { } }; }

// ---------- Infinito: a cada chefe, uma parada para escolher melhorias ----------
{
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () { const was = G.endless && !G.rush && !G.practice && !G.secret; const r = bd.call(this); if (was && G.pendingLevels !== undefined) { G.pendingLevels += 2; G.timers.push({ t: 1.2, fn: () => popup(W / 2, 260, 'PARADA: ESCOLHA 2 MELHORIAS', '#7fe0a0', 26) }); } return r; };
}

// ---------- 3 inimigos novos para as fases 2 a 6 ----------
Object.assign(ENEMY_DEF, { sniper: { hp: 8, rad: 24, spd: 0, xp: 4, score: 45, coin: .4, glow: '#ff3a3a' }, swarmer: { hp: 2, rad: 14, spd: 190, xp: 1, score: 8, coin: .05, glow: '#ffe04a' }, bomber: { hp: 14, rad: 32, spd: 150, xp: 5, score: 60, coin: .5, glow: '#ffa03a' } });
Object.assign(SRC_NAME, { sniper: 'Franco-atirador', swarmer: 'Enxame', bomber: 'Bombardeiro' });
Object.assign(SRC_TIP, { sniper: 'O Franco-atirador mostra uma linha vermelha: saia dela antes do disparo rápido.', swarmer: 'O Enxame persegue de leve pelos lados: mantenha-se em movimento.', bomber: 'O Bombardeiro solta bombas que explodem em anéis: afaste-se delas.' });
TRAIN_TYPES.push('sniper', 'swarmer', 'bomber');
{
  const ue = updateEnemy;
  updateEnemy = function (e, dt) {
    const p = G.player;
    if (e.type === 'sniper') {
      e.tm = (e.tm || 0) + dt; if (e.y < e.stopY) e.y += 200 * dt;
      else { e.cycle = (e.cycle || 0) + dt; if (e.cycle < 1.3) { e.aim = aimAt(e.x, e.y); e.lock = e.cycle > .85; } else if (!e.fired) { e.fired = true; ebullet(e.x + Math.cos(e.aim) * 26, e.y + Math.sin(e.aim) * 26, e.aim, 640, { r: 5 }); Snd.play('enemyShoot', { pan: Snd.panX(e.x) }); } if (e.cycle > 2.8) { e.cycle = 0; e.fired = false; e.shots = (e.shots || 0) + 1; } }
      if ((e.shots || 0) >= 3) { e.y -= 220 * dt; if (e.y < -50) { e.dead = true; e.counted = true; } }
    } else if (e.type === 'swarmer') {
      e.y += e.spd * dt; e.x += clamp((p.x - e.x) * .6, -140, 140) * dt + Math.sin(e.age * 5 + e.ph) * 40 * dt;
    } else if (e.type === 'bomber') {
      if (e.dir === undefined) { e.dir = e.x < W / 2 ? 1 : -1; e.by = e.y; }
      e.x += e.dir * e.spd * dt; e.y = e.by + Math.sin(e.age * 2) * 14; e.bT = (e.bT ?? .5) - dt; if (e.bT <= 0) { e.bT = .75; ebullet(e.x, e.y + 22, Math.PI / 2, 90, { r: 9, fuse: 1.3, sty: 'orb' }); }
    }
    return ue(e, dt);
  };
  const ae = Art.enemy;
  Art.enemy = function (e) {
    if (e.type !== 'sniper' && e.type !== 'swarmer' && e.type !== 'bomber') return ae.call(this, e);
    const t = World.t + e.ph, r = e.rad, hit = e.hit > 0; ctx.save(); ctx.translate(e.x, e.y); const sc = easeBack(e.age / .35); ctx.scale(sc, sc);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 2.2, e.glow, .3); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    if (e.type === 'sniper') {
      if (e.aim !== undefined && e.cycle > .1 && e.cycle < 1.3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff3a3a'; ctx.globalAlpha = e.lock ? .5 + .5 * Math.sin(World.t * 50) : .3; ctx.lineWidth = e.lock ? 3 : 1.5; ctx.setLineDash(e.lock ? [] : [10, 8]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(e.aim) * 1300, Math.sin(e.aim) * 1300); ctx.stroke(); ctx.restore(); }
      const a = e.aim ?? Math.PI / 2; ctx.fillStyle = hit ? '#fff' : '#3a2a40'; ctx.strokeStyle = '#ff3a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.rotate(a); ctx.fillStyle = hit ? '#fff' : '#5a4a60'; ctx.beginPath(); ctx.roundRect(r * .3, -5, r * 1.9, 10, 4); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#ff3a3a'; ctx.beginPath(); ctx.arc(0, 0, 6 + (e.lock ? 2 : 0), 0, TAU); ctx.fill();
    } else if (e.type === 'swarmer') {
      ctx.rotate(Math.atan2(1, Math.sin(e.age * 5) * .3) - Math.PI / 2); ctx.fillStyle = hit ? '#fff' : '#ffe04a'; ctx.strokeStyle = '#7a5a0a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, r * 1.1); ctx.lineTo(r * .8, -r * .7); ctx.lineTo(0, -r * .3); ctx.lineTo(-r * .8, -r * .7); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      ctx.scale(e.dir || 1, 1); ctx.fillStyle = hit ? '#fff' : '#8a5a2a'; ctx.strokeStyle = '#3a200a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r * .6, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = hit ? '#fff' : '#c8782a'; ctx.beginPath(); ctx.moveTo(-r * .2, -r * .1); ctx.lineTo(-r * .9, -r * 1.1); ctx.lineTo(r * .3, -r * .15); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r * .2, r * .1); ctx.lineTo(-r * .9, r * 1.1); ctx.lineTo(r * .3, r * .15); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(r * .85, -r * .08, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a1a0a'; ctx.beginPath(); ctx.roundRect(-r * .35, r * .32, r * .7, 8, 3); ctx.fill();
    }
    ctx.restore();
  };
  const sw = Game.spawnWave;
  Game.spawnWave = function (pool) {
    const st = G.stage ? G.stage.id : 0;
    if (st >= 1 && st < 6 && !G.endless && !(G.sp && G.sp.on) && G.enemies.length < 12 && Math.random() < .17) {
      const ty = pick(st >= 3 ? ['sniper', 'swarmer', 'swarmer', 'bomber'] : ['swarmer', 'swarmer', 'sniper', 'bomber']), x = rand(110, W - 110);
      if (ty === 'sniper') { const l = Math.random() < .5; spawnEnemy(ty, l ? 60 : W - 60, -30, { stopY: rand(110, 190) }); }
      else if (ty === 'swarmer') { for (let i = 0; i < 5; i++) { const xx = clamp(x + (i - 2) * 40, 40, W - 40); spawnEnemy(ty, xx, -20 - Math.abs(i - 2) * 30, { bx: xx }); } }
      else { const l = Math.random() < .5; spawnEnemy(ty, l ? -50 : W + 50, rand(110, 200), {}); }
      return;
    }
    return sw.call(this, pool);
  };
}
