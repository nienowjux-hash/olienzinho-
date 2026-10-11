'use strict';
// ---------- helpers de efeito ----------
function burst(x, y, colors, n, sp = 260, size = 5) {
  const P = G.parts;
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = rand(.25, 1) * sp;
    P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.4, .9), max: .9, r: rand(.5, 1) * size, c: colors[i % colors.length], drag: 2.6 });
  }
  // faiscas em risco, clarao central e fumaca
  const ns = Math.ceil(n * .7);
  for (let i = 0; i < ns; i++) {
    const a = rand(0, TAU), s = rand(.5, 1.5) * sp * 1.4;
    P.push({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.25, .6), max: .6, r: rand(1.4, 3), c: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#ffe9a8' : colors[0], drag: 2.4 });
  }
  P.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .17, max: .17, r: size * (5 + n * .1), c: '#ffffff', drag: 1 });
  P.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .28, max: .28, r: size * (7 + n * .14), c: colors[0], drag: 1 });
  if (n >= 18) for (let i = 0; i < 5; i++) {
    const a = rand(0, TAU), s = rand(20, 90);
    P.push({ k: 'smoke', x: x + Math.cos(a) * 8, y: y + Math.sin(a) * 8, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: rand(.7, 1.3), max: 1.3, r: size * rand(2.4, 3.6), c: '#2a1450', drag: 1.2 });
  }
  if (P.length > 1100) P.splice(0, P.length - 1100);
}
function sparks(x, y, c, n, sp = 220) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = rand(.4, 1) * sp;
    G.parts.push({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.15, .35), max: .35, r: rand(1.2, 2.2), c: i % 2 ? '#ffffff' : c, drag: 3 });
  }
}
const shockwave = (x, y, max, c) => G.rings.push({ x, y, r: 6, max, c, life: 1 });
const popup = (x, y, text, c = '#ffe9a8', size = 24) => G.pops.push({ x, y, text, c, size, life: 1 });
const shake = a => { G.shake = Math.max(G.shake, a); };
const flashScreen = a => { G.flash = Math.max(G.flash, a); };
const bulletColor = () => '#ff4a2e';

function ebullet(x, y, ang, spd, o = {}) {
  G.eb.push(Object.assign({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 7, c: bulletColor(), life: 9, acc: 0 }, o));
}
function aimAt(x, y) { return Math.atan2(G.player.y - y, G.player.x - x); }
function fanAimed(x, y, n, spread, spd, o) {
  const a0 = aimAt(x, y);
  for (let i = 0; i < n; i++) ebullet(x, y, a0 + (n === 1 ? 0 : (i / (n - 1) - .5) * spread), spd, o);
}
function ring(x, y, n, spd, off = 0, o) {
  for (let i = 0; i < n; i++) ebullet(x, y, off + i / n * TAU, spd, o);
}

// ---------- inimigos ----------
const ENEMY_DEF = {
  drone: { hp: 2, rad: 24, spd: 105, xp: 1, score: 10, coin: .14, glow: '#ff8a1f' },
  zig: { hp: 3, rad: 22, spd: 150, xp: 1, score: 15, coin: .16, glow: '#2b7bff' },
  kami: { hp: 3, rad: 24, spd: 130, xp: 2, score: 20, coin: .18, glow: '#ff4a6e' },
  shooter: { hp: 6, rad: 28, spd: 70, xp: 3, score: 30, coin: .3, glow: '#ff4aa0' },
  tank: { hp: 22, rad: 44, spd: 48, xp: 8, score: 100, coin: .9, glow: '#ff8a1f' },
  mine: { hp: 4, rad: 24, spd: 60, xp: 2, score: 20, coin: .2, glow: '#ff4a4a' },
  bit: { hp: 1, rad: 14, spd: 210, xp: 1, score: 8, coin: .05, glow: '#7fe0ff' },
  rock: { hp: 2, rad: 28, spd: 0, xp: 1, score: 5, coin: .1, glow: '#ff6a1a' },
};

function spawnEnemy(type, x, y, o = {}) {
  const d = ENEMY_DEF[type], st = G.stage.id;
  const mul = 1 + st * .45 + (G.t / G.stage.duration) * .35;
  const e = {
    type, x, y, bx: x, rad: d.rad, hp: Math.max(1, Math.ceil(d.hp * mul)), spd: d.spd * (1 + st * .06),
    xp: d.xp, score: d.score, coin: d.coin, glow: d.glow, age: 0, ph: rand(0, TAU), hit: 0,
    amp: rand(30, 110), fr: rand(1, 2), mode: 'enter', stopY: rand(130, 230), t1: rand(.5, 1.2), tx: x,
    vx: 0, vy: 0, shootT: rand(.8, 1.6), fuse: 0, life: 0, dead: false, orbCd: 0, aim: Math.PI / 2,
  };
  e.maxHp = e.hp;
  Object.assign(e, o);
  G.enemies.push(e);
  return e;
}

function updateEnemy(e, dt) {
  e.age += dt; e.hit = Math.max(0, e.hit - dt); e.orbCd = Math.max(0, e.orbCd - dt);
  const p = G.player;
  e.look = clamp((p.x - e.x) / 160, -1, 1) * e.rad * .12;
  switch (e.type) {
    case 'drone':
    case 'bit':
      e.y += e.spd * dt; e.x = e.bx + Math.sin(e.age * (e.type === 'bit' ? 3 : e.fr) + e.ph) * (e.type === 'bit' ? e.amp * .6 : e.amp);
      break;
    case 'zig':
      e.y += e.spd * .75 * dt; e.t1 -= dt;
      if (e.t1 <= 0) { e.tx = rand(60, W - 60); e.t1 = rand(.7, 1.2); }
      e.x += (e.tx - e.x) * Math.min(1, 3 * dt);
      break;
    case 'kami':
      if (e.mode === 'enter') { e.y += e.spd * 1.6 * dt; if (e.y >= e.stopY) { e.mode = 'lock'; e.t1 = .55; e.x += 0; } }
      else if (e.mode === 'lock') {
        e.t1 -= dt; e.ph += dt * 30;
        if (e.t1 <= 0) { const a = aimAt(e.x, e.y); e.vx = Math.cos(a) * 60; e.vy = Math.sin(a) * 60; e.dir = a; e.mode = 'dash'; Snd.play('mine'); }
      } else {
        const sp = Math.min(520, Math.hypot(e.vx, e.vy) + 900 * dt);
        e.vx = Math.cos(e.dir) * sp; e.vy = Math.sin(e.dir) * sp; e.x += e.vx * dt; e.y += e.vy * dt;
      }
      break;
    case 'shooter':
    case 'tank': {
      const tk = e.type === 'tank';
      if (e.mode === 'enter') { e.y += e.spd * (tk ? 1 : 1.8) * dt; if (e.y >= e.stopY) { e.mode = 'hover'; e.vx = (Math.random() < .5 ? -1 : 1) * (tk ? 35 : 60); e.life = 0; } }
      else if (e.mode === 'hover') {
        e.x += e.vx * dt; if (e.x < 80 || e.x > W - 80) e.vx *= -1;
        e.life += dt; e.aim = aimAt(e.x, e.y);
        e.shootT -= dt;
        if (e.shootT <= 0) {
          if (tk) { fanAimed(e.x, e.y, 3, .7, 220); Snd.play('enemyShoot', { pan: Snd.panX(e.x) }); e.shootT = 2.3; e.ringT = (e.ringT || 0) + 1; if (e.ringT % 3 === 0) ring(e.x, e.y, 12, 170, e.age); }
          else { fanAimed(e.x, e.y, e.life > 6 ? 3 : 1, .45, 270); Snd.play('enemyShoot', { pan: Snd.panX(e.x) }); e.shootT = 1.6; }
        }
        if (e.life > (tk ? 18 : 11)) e.mode = 'leave';
      } else { e.y += 140 * dt; }
      break;
    }
    case 'rock':
      e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.vr * dt;
      if (Math.random() < .5) G.parts.push({ x: e.x + rand(-6, 6), y: e.y - e.rad * .6, vx: rand(-30, 30), vy: rand(-120, -40), life: .35, max: .35, r: rand(3, 6), c: '#ff8a1f', drag: 2 });
      break;
    case 'mine':
      e.y += e.spd * dt; e.x = e.bx + Math.sin(e.age * 1.5 + e.ph) * 25;
      if (!e.fuse && Math.hypot(p.x - e.x, p.y - e.y) < 190) { e.fuse = 1; Snd.play('mine'); }
      if (e.fuse > 0) {
        const f0 = e.fuse; e.fuse -= dt * .85;
        if (Math.floor(f0 * 8) !== Math.floor(e.fuse * 8)) Snd.play('mine');
        if (e.fuse <= 0) { mineBlast(e); e.dead = true; }
      }
      break;
  }
  if (e.y > H + 90 || e.y < -250 || e.x < -150 || e.x > W + 150) e.dead = true;
  // contato com o jogador
  if (!e.dead && Math.hypot(p.x - e.x, p.y - e.y) < e.rad + 12) {
    hurtPlayer(e.type === 'kami' ? 2 : 1);
    if (e.type !== 'tank') { killEnemy(e, false); }
  }
}

function mineBlast(e) {
  ring(e.x, e.y, 10, 190, rand(0, 6));
  burst(e.x, e.y, ['#ff4a4a', '#ffb340', '#ffffff'], 24, 300, 6);
  shockwave(e.x, e.y, 130, '#ff6a3c'); Snd.play('explode', { size: 1, pan: Snd.panX(e.x) }); shake(5);
}

function killEnemy(e, byPlayer) {
  if (e.dead && e.counted) return;
  e.dead = true; e.counted = true;
  const big = e.type === 'tank';
  burst(e.x, e.y, [e.glow, '#ffe9a8', '#ffffff', '#b98cff'], big ? 40 : 26, big ? 380 : 300, 6);
  shockwave(e.x, e.y, big ? 150 : 90, e.glow);
  Snd.play('explode', { size: big ? 1.6 : .8, pan: Snd.panX(e.x) });
  shake(big ? 9 : 4);
  if (e.type === 'mine' && byPlayer) mineBlast(e);
  if (!byPlayer) return;
  G.kills++; G.score += e.score;
  G.combo = G.comboT > 0 ? G.combo + 1 : 1; G.comboT = 2.2;
  const xpv = e.xp;
  for (let i = 0; i < Math.min(3, xpv); i++) dropPickup('xp', e.x + rand(-14, 14), e.y + rand(-10, 10), Math.ceil(xpv / Math.min(3, xpv)));
  const pl = G.player;
  if (Math.random() < e.coin * pl.coinMul) dropPickup('coin', e.x, e.y, big ? 6 : 1 + (Math.random() < .15 ? 1 : 0));
  if (big) { for (let i = 0; i < 3; i++) dropPickup('coin', e.x + rand(-30, 30), e.y + rand(-20, 20), 2); }
  if ((big && Math.random() < .35) || (!big && Math.random() < .012)) dropPickup('heart', e.x, e.y, 1);
}

function damageEnemy(e, dmg, crit) {
  e.hp -= dmg; e.hit = .08;
  Snd.play('hit', { pan: Snd.panX(e.x) });
  sparks(e.x + rand(-8, 8), e.y + e.rad * .4, crit ? '#ffe9a8' : '#e2d4ff', crit ? 8 : 4);
  if (crit) popup(e.x, e.y - e.rad, Math.round(dmg * 10) / 10 + '!', '#ffe9a8', 22);
  if (e.hp <= 0) killEnemy(e, true);
}

// ---------- itens ----------
function dropPickup(type, x, y, val = 1) {
  G.pickups.push({ type, x, y, val, vx: rand(-60, 60), vy: rand(-90, -20), age: 0, mag: false });
}
function updatePickup(k, dt) {
  const p = G.player;
  k.age += dt;
  const d = Math.hypot(p.x - k.x, p.y - k.y);
  if (d < p.magnet || k.mag) {
    k.mag = true;
    const sp = 380 + (1 - Math.min(1, d / 400)) * 700;
    k.x += (p.x - k.x) / (d || 1) * sp * dt; k.y += (p.y - k.y) / (d || 1) * sp * dt;
    if (Math.random() < .6) G.parts.push({ x: k.x, y: k.y, vx: 0, vy: 0, life: .22, max: .22, r: 4, c: k.type === 'coin' ? '#ffcf6b' : k.type === 'heart' ? '#ff9ac0' : '#7fe0ff', drag: 1 });
  } else {
    k.x += k.vx * dt; k.y += k.vy * dt; k.vx *= 1 - 2 * dt; k.vy += (70 - k.vy) * Math.min(1, 1.5 * dt);
  }
  if (d < 24) {
    k.dead = true;
    if (k.type === 'xp') { G.chain = G.chainT > 0 ? G.chain + 1 : 0; G.chainT = .5; Snd.play('xp', { combo: G.chain, pan: Snd.panX(k.x) }); addXp(k.val * p.xpMul); }
    else if (k.type === 'coin') { G.cchain = G.cchainT > 0 ? G.cchain + 1 : 0; G.cchainT = .7; Snd.play('coin', { combo: G.cchain, pan: Snd.panX(k.x) }); G.runCoins += k.val; popup(k.x, k.y - 14, '+' + k.val, '#ffcf6b', 18); }
    else if (k.type === 'heart') { Snd.play('heart'); p.mood = 'happy'; p.moodT = .9; if (p.hp < p.maxHp) { p.hp++; popup(p.x, p.y - 60, '+1 vida', '#ff9ac0'); } else { G.runCoins += 3; popup(p.x, p.y - 60, '+3', '#ffcf6b'); } }
  }
  if (k.y > H + 40) k.dead = true;
}

// ---------- jogador ----------
function hurtPlayer(dmg = 1) {
  const p = G.player;
  if (p.inv > 0 || G.state !== 'play' || p.dead) return;
  if (p.shieldReady) {
    p.shieldReady = false; p.shieldT = p.shieldCd; p.inv = 1;
    Snd.play('shield'); shockwave(p.x, p.y, 160, '#7fe0ff'); burst(p.x, p.y, ['#7fe0ff', '#ffffff'], 20, 300, 5); shake(5);
    return;
  }
  p.hp -= dmg; p.inv = 1.4; G.hurtFlash = .35; p.mood = 'hurt'; p.moodT = .7;
  Snd.play('playerHit'); shake(14); flashScreen(.3);
  burst(p.x, p.y, ['#e2d4ff', '#ff7ac8'], 22, 320, 6); shockwave(p.x, p.y, 180, '#ff7ac8');
  G.combo = 0; G.comboT = 0;
  if (p.hp <= 0) { p.hp = 0; Game.playerDied(); }
}

function addXp(v) {
  G.xp += v;
  while (G.xp >= G.xpNeed) {
    G.xp -= G.xpNeed; G.level++; G.xpNeed = 4 + G.level * 3; G.pendingLevels++;
  }
}

function playerShoot() {
  const p = G.player, n = p.shots; p.recoil = 1;
  for (let i = 0; i < n; i++) {
    const k = i - (n - 1) / 2, ang = -Math.PI / 2 + k * .09;
    const crit = Math.random() < p.crit;
    G.pb.push({
      x: p.x + k * 14, y: p.y - 36, vx: Math.cos(ang) * 920, vy: Math.sin(ang) * 920,
      dmg: p.dmg * (crit ? p.critMul : 1), crit, pierce: p.pierce, hits: [], c: crit ? '#ffe9a8' : '#b98cff',
    });
  }
  G.parts.push({ k: 'flash', x: p.x, y: p.y - 34, vx: 0, vy: 0, life: .07, max: .07, r: 18, c: '#e2d4ff', drag: 1 });
  Snd.play('shoot', { lv: n - 1, pan: Snd.panX(p.x) * .5 });
}

function nearestTarget(x, y, skip) {
  let best = 1e9, t = null;
  for (const e of G.enemies) { if (e.dead || (skip && skip.includes(e))) continue; const d = Math.hypot(e.x - x, e.y - y); if (d < best) { best = d; t = e; } }
  if (G.boss && G.boss.targetable()) { const b = G.boss, d = Math.hypot(b.x - x, b.y - y) - 80; if (d < best) { best = d; t = b; } }
  return t;
}

function fireMissile() {
  const p = G.player, taken = [];
  for (let i = 0; i < p.missiles; i++) {
    const a = -Math.PI / 2 + (i - (p.missiles - 1) / 2) * 1.1 + rand(-.1, .1);
    const tg = nearestTarget(p.x, p.y, taken); if (tg) taken.push(tg);
    G.pb.push({ kind: 'missile', x: p.x + (i - (p.missiles - 1) / 2) * 16, y: p.y - 24, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, dmg: p.dmg * 4, pierce: 0, hits: [], life: 3.2, speed: 640, target: tg });
  }
  Snd.play('missile', { pan: Snd.panX(p.x) * .5 });
}

function missileBoom(x, y, dmg, except) {
  burst(x, y, ['#ffb340', '#ff6a1a', '#ffffff'], 22, 300, 6); shockwave(x, y, 120, '#ffb340'); shockwave(x, y, 70, '#ffffff');
  Snd.play('explode', { size: .9, pan: Snd.panX(x) });
  for (const e of G.enemies) if (!e.dead && e !== except && Math.hypot(e.x - x, e.y - y) < 110 + e.rad) damageEnemy(e, dmg * .6, false);
  if (G.boss && G.boss !== except && G.boss.targetable() && G.boss.hitTest(x, y, 90)) G.boss.damage(dmg * .6);
}

// aplicado a cada frame: balas do jogador, drones orbitais, pulso
function updatePlayerWeapons(dt) {
  const p = G.player;
  for (const b of G.pb) {
    if (b.kind === 'missile') {
      b.life -= dt;
      const t = (b.target && !b.target.dead && (!b.target.targetable || b.target.targetable())) ? b.target : nearestTarget(b.x, b.y);
      if (t) {
        const want = Math.atan2(t.y - b.y, t.x - b.x), cur = Math.atan2(b.vy, b.vx);
        let d = want - cur; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
        const na = cur + clamp(d, -7.5 * dt, 7.5 * dt), sp = Math.min(b.speed, Math.hypot(b.vx, b.vy) + 1100 * dt);
        b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
      }
      if (b.life <= 0) b.dead = true;
      G.parts.push({ x: b.x - b.vx * .012, y: b.y - b.vy * .012, vx: rand(-20, 20), vy: rand(-20, 20), life: .35, max: .35, r: rand(4, 7), c: Math.random() < .5 ? '#ffb340' : '#ff6a1a', drag: 2 });
      if (Math.random() < .5) G.parts.push({ k: 'smoke', x: b.x - b.vx * .02, y: b.y - b.vy * .02, vx: rand(-15, 15), vy: rand(-15, 15), life: .5, max: .5, r: rand(3, 5), c: '#3a2060', drag: 1 });
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.y < -60 || b.y > H + 60 || b.x < -60 || b.x > W + 60) { b.dead = true; continue; }
    for (const e of G.enemies) {
      if (e.dead || b.hits.includes(e)) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.rad + 10) {
        if (b.kind === 'missile') { damageEnemy(e, b.dmg, false); missileBoom(b.x, b.y, b.dmg, e); b.dead = true; break; }
        damageEnemy(e, b.dmg, b.crit);
        b.hits.push(e);
        if (b.pierce > 0) b.pierce--; else { b.dead = true; break; }
      }
    }
    const bo = G.boss;
    if (!b.dead && bo && bo.targetable() && !b.hits.includes(bo) && bo.hitTest(b.x, b.y, 8)) {
      if (b.kind === 'missile') { bo.damage(b.dmg); missileBoom(b.x, b.y, b.dmg, bo); b.dead = true; }
      else { bo.damage(b.dmg, b.crit); b.hits.push(bo); burst(b.x, b.y, ['#e2d4ff', '#ffe9a8'], 3, 160, 3); if (b.pierce > 0) b.pierce--; else b.dead = true; }
    }
  }
  // drones orbitais
  p.orbAng += dt * 3;
  for (let i = 0; i < p.orbitals; i++) {
    const a = p.orbAng + i / p.orbitals * TAU, ox = p.x + Math.cos(a) * 66, oy = p.y + Math.sin(a) * 66 * .85;
    for (const e of G.enemies) if (!e.dead && e.orbCd <= 0 && Math.hypot(e.x - ox, e.y - oy) < e.rad + 14) { e.orbCd = .25; damageEnemy(e, p.dmg * 1.5, false); }
    for (const b of G.eb) if (!b.dead && Math.hypot(b.x - ox, b.y - oy) < b.r + 14) { b.dead = true; burst(b.x, b.y, [b.c], 4, 120, 3); }
    const bo = G.boss;
    if (bo && bo.targetable() && bo.orbCd <= 0 && bo.hitTest(ox, oy, 14)) { bo.orbCd = .3; bo.damage(p.dmg * 1.2); }
    p.orbPos[i] = [ox, oy];
  }
  p.orbPos.length = p.orbitals;
  // missis
  if (p.missiles > 0) { p.missT -= dt; if (p.missT <= 0 && (G.enemies.length || (G.boss && G.boss.targetable()))) { fireMissile(); p.missT = Math.max(.9, 2.1 - p.missiles * .25); } }
  // pulso
  if (G.pulse) {
    const pu = G.pulse; pu.r += 1400 * dt;
    for (const e of G.enemies) if (!e.dead && e.pulseId !== pu.id && Math.hypot(e.x - pu.x, e.y - pu.y) < pu.r + e.rad) { e.pulseId = pu.id; damageEnemy(e, 10 + G.level * 2, false); }
    for (const b of G.eb) if (!b.dead && Math.hypot(b.x - pu.x, b.y - pu.y) < pu.r) { b.dead = true; G.parts.push({ x: b.x, y: b.y, vx: 0, vy: 0, life: .25, max: .25, r: 7, c: '#ffffff', drag: 1 }); }
    const bo = G.boss;
    if (bo && bo.targetable() && !pu.hitBoss && Math.hypot(bo.x - pu.x, bo.y - pu.y) < pu.r + 60) { pu.hitBoss = true; bo.damage(Math.min(bo.maxHp * .07, 30 + G.level * 6)); }
    if (pu.r > 1000) G.pulse = null;
  }
}

function usePulse() {
  const p = G.player;
  if (p.pulseT > 0 || G.pulse) return;
  p.pulseT = p.pulseCd; G.pulseId = (G.pulseId || 0) + 1;
  G.pulse = { x: p.x, y: p.y, r: 20, id: G.pulseId, hitBoss: false };
  Snd.play('special'); shake(12); flashScreen(.35);
  p.inv = Math.max(p.inv, .6);
}
