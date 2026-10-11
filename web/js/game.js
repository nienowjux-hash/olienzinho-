'use strict';
// ---------- estado global e logica de jogo ----------
const SHIP_S = .62;
const G = {
  state: 'title', t: 0, stage: null, stageIdx: 0, sel: 0,
  player: null, enemies: [], pb: [], eb: [], pickups: [], parts: [], rings: [], pops: [], hazards: [], boss: null, pulse: null,
  score: 0, kills: 0, runCoins: 0, level: 1, xp: 0, xpNeed: 7, pendingLevels: 0, upCounts: {}, options: [],
  shake: 0, flash: 0, hurtFlash: 0, combo: 0, comboT: 0, chain: 0, chainT: 0, cchain: 0, cchainT: 0,
  spawnT: 1, bossDone: false, bossPending: false, bossPendingT: 0, clearT: 0, overT: 0, result: null, intro: 0, bossShown: 0,
};

function txt(s, x, y, size, color = '#e2d4ff', align = 'left', weight = 900, base = 'top') {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = color; ctx.fillText(s, x, y);
}

function newPlayer() {
  const p = {
    x: W / 2, y: H - 130, vx: 0, vy: 0, hp: 5, maxHp: 5, inv: 0, fireT: 0, pulseT: 0, t: 0, blink: 3, blinkT: 0, lookx: 0, looky: 0,
    orbAng: 0, orbPos: [], missT: 2, shieldReady: false, shieldT: 0, dead: false,
  };
  return p;
}

function recalcStats(p) {
  const s = Save.data.shop, u = G.upCounts, L = id => s[id] || 0, U = id => u[id] || 0;
  p.maxHp = 5 + L('hp') + U('hp');
  p.dmg = (1 + .12 * L('dmg')) * (1 + .2 * U('dmg'));
  p.fireDelay = .2 * Math.pow(.9, U('rate')) / (1 + .06 * L('rate'));
  p.shots = 1 + U('multi');
  p.speed = 470 * (1 + .05 * L('speed')) * (1 + .1 * U('speed'));
  p.pierce = U('pierce');
  p.magnet = 95 + 30 * L('magnet') + 60 * U('magnet');
  p.crit = .05 + .08 * U('crit'); p.critMul = 2;
  p.pulseCd = Math.max(6, 22 - 2 * L('pulse')) * Math.pow(.85, U('pulse'));
  p.coinMul = (1 + .12 * L('luck')) * (1 + .2 * U('lucky'));
  p.xpMul = (1 + .1 * L('xp')) * (1 + .15 * U('xp'));
  p.missiles = U('missile'); p.orbitals = U('orbit');
  p.shieldCd = [0, 20, 15, 10][U('shield')] || 10;
}

const Game = {
  slowmo: 0,

  startStage(idx) {
    G.stageIdx = idx; G.stage = STAGES[idx];
    G.t = 0; G.enemies = []; G.pb = []; G.eb = []; G.pickups = []; G.parts = []; G.rings = []; G.pops = []; G.hazards = []; G.boss = null; G.pulse = null;
    G.score = 0; G.kills = 0; G.runCoins = 0; G.level = 1; G.xp = 0; G.xpNeed = 7; G.pendingLevels = 0; G.upCounts = {}; G.options = [];
    G.shake = 0; G.flash = 0; G.hurtFlash = 0; G.combo = 0; G.comboT = 0; G.chain = 0; G.chainT = 0; G.cchain = 0; G.cchainT = 0;
    G.spawnT = 1.5; G.bossDone = false; G.bossPending = false; G.bossPendingT = 0; G.clearT = 0; G.overT = 0; G.result = null; G.intro = 0;
    this.slowmo = 0;
    World.setStage(G.stage.pal); Events.reset(G.stage);
    G.player = newPlayer(); recalcStats(G.player); G.player.hp = G.player.maxHp;
    Events.banner = { t: 0, title: G.stage.name.toUpperCase(), sub: 'FASE ' + (idx + 1), c: G.stage.tint };
    G.state = 'play';
    Snd.musicPlay(G.stage.music, 1);
    Save.data.runs++; Save.save();
  },

  // ---------- menu / navegacao ----------
  goTitle() { G.state = 'title'; World.setStage(STAGES[0].pal); Snd.musicPlay('menu', 0); },
  goSelect() { G.state = 'select'; World.setStage(STAGES[G.sel].pal); Snd.musicPlay('menu', 0); },

  endRunSave(bonus = 0, cleared = false) {
    const d = Save.data;
    d.coins += G.runCoins + bonus;
    const prev = d.best[G.stageIdx] || 0; if (G.score > prev) d.best[G.stageIdx] = G.score;
    if (cleared) d.unlocked = Math.max(d.unlocked, Math.min(STAGES.length, G.stageIdx + 2));
    Save.save();
  },

  quitRun() { this.endRunSave(0, false); this.goSelect(); },

  playerDied() {
    const p = G.player; p.dead = true;
    burst(p.x, p.y, ['#e2d4ff', '#b98cff', '#ff7ac8', '#ffffff'], 60, 480, 7);
    for (let i = 0; i < 3; i++) shockwave(p.x, p.y, 200 + i * 140, '#b98cff');
    Snd.play('explode', { size: 2 }); shake(22); flashScreen(.6);
    G.eb.forEach(b => { b.dead = true; });
    G.overT = 2.2; Snd.musicStop();
  },

  bossDefeated() {
    G.bossDone = true; G.clearT = 2.8;
    for (const k of G.pickups) k.mag = true;
    Events.banner = { t: 0, title: 'CHEFE DERROTADO!', sub: G.stage.bossName, c: '#ffe9a8' };
  },

  stageClear() {
    const bonus = 80 + G.stageIdx * 50;
    this.endRunSave(bonus, true);
    G.result = { bonus, coins: G.runCoins, score: G.score, kills: G.kills, level: G.level, best: Save.data.best[G.stageIdx], newStage: G.stageIdx + 1 < STAGES.length };
    G.state = 'clear';
    Snd.musicPlay('menu', 0); Snd.play('stageClear');
  },

  gameOver() {
    this.endRunSave(0, false);
    G.result = { coins: G.runCoins, score: G.score, kills: G.kills, level: G.level };
    G.state = 'over'; Snd.play('gameOver');
  },

  openLevelUp() {
    G.pendingLevels--;
    const p = G.player;
    Snd.play('levelUp'); shockwave(p.x, p.y, 380, '#b98cff'); burst(p.x, p.y, ['#b98cff', '#ffb340', '#ffffff'], 50, 440, 6); flashScreen(.2);
    const avail = RUN_UPGRADES.filter(u => (G.upCounts[u.id] || 0) < u.max && (!u.cond || u.cond()));
    const picks = [];
    while (picks.length < 3 && avail.length) {
      const tot = avail.reduce((a, u) => a + RARITY[u.r].w, 0); let r = Math.random() * tot, i = 0;
      for (; i < avail.length; i++) { r -= RARITY[avail[i].r].w; if (r <= 0) break; }
      picks.push(avail.splice(Math.min(i, avail.length - 1), 1)[0]);
    }
    G.options = picks; G.state = 'levelup';
  },

  chooseUpgrade(i) {
    const u = G.options[i]; if (!u) return;
    const p = G.player; G.upCounts[u.id] = (G.upCounts[u.id] || 0) + 1;
    recalcStats(p);
    if (u.id === 'hp') p.hp = Math.min(p.maxHp, p.hp + 1);
    if (u.id === 'heal') p.hp = Math.min(p.maxHp, p.hp + 2);
    if (u.id === 'shield' && G.upCounts.shield === 1) p.shieldReady = true;
    Snd.play('upgrade');
    G.state = 'play';
    if (G.pendingLevels > 0) this.openLevelUp();
  },

  // ---------- diretor de ondas ----------
  wpick(pool) { const e = Object.entries(pool), tot = e.reduce((a, [, w]) => a + w, 0); let r = Math.random() * tot; for (const [k, w] of e) { r -= w; if (r <= 0) return k; } return e[0][0]; },

  spawnWave(pool) {
    if (G.enemies.length > 26) return;
    const type = this.wpick(pool), m = 70;
    const rx = () => rand(m, W - m);
    switch (type) {
      case 'drone': {
        const r = Math.random();
        if (r < .4) { const n = randi(3, 5), x0 = rx(); for (let i = 0; i < n; i++) spawnEnemy('drone', clamp(x0 + (i - (n - 1) / 2) * 90, m, W - m), -30); }
        else if (r < .65) { const n = randi(3, 5), x0 = rx(); for (let i = 0; i < n; i++) spawnEnemy('drone', clamp(x0 + (i - (n - 1) / 2) * 80, m, W - m), -30 - Math.abs(i - (n - 1) / 2) * 55); }
        else spawnEnemy('drone', rx(), -30);
        break;
      }
      case 'zig': { const n = randi(1, 3); for (let i = 0; i < n; i++) spawnEnemy('zig', rx(), -30 - i * 70); break; }
      case 'kami': { const n = randi(1, 3); for (let i = 0; i < n; i++) spawnEnemy('kami', rx(), -30 - i * 50); break; }
      case 'shooter': { const n = randi(1, 2); for (let i = 0; i < n; i++) spawnEnemy('shooter', rx(), -30 - i * 60); break; }
      case 'tank': spawnEnemy('tank', rand(250, W - 250), -60); break;
      case 'mine': { const n = randi(1, 3); for (let i = 0; i < n; i++) spawnEnemy('mine', rx(), -30 - i * 60); break; }
      case 'bit': { const n = randi(6, 10), x0 = rx(); for (let i = 0; i < n; i++) spawnEnemy('bit', clamp(x0 + (i % 2 ? 30 : -30), m, W - m), -30 - i * 38); break; }
    }
  },

  director(dt) {
    const st = G.stage;
    if (G.bossDone) return;
    if (G.boss || G.bossPending) {
      if (G.bossPending) {
        G.bossPendingT -= dt;
        if (G.bossPendingT <= 0) { G.bossPending = false; G.boss = new BOSS_CLASSES[st.boss](); Snd.musicPlay(st.music, 2); G.bossShown = 0; }
      }
      return;
    }
    if (G.t >= st.duration) {
      G.bossPending = true; G.bossPendingT = 3.2;
      Events.cancel(); World.boost = .6;
      Events.banner = { t: 0, title: 'CHEFE APROXIMANDO', sub: st.bossName, c: '#ff8a5f' };
      Snd.play('bossWarn');
      return;
    }
    const ph = st.phases.find(p => G.t < p.until) || st.phases[st.phases.length - 1];
    const ev = Events.active;
    const slow = ev === 'rain' || ev === 'storm' || ev === 'flare' ? 1.7 : ev === 'worm' ? 3 : ev === 'mines' ? 1.4 : 1;
    G.spawnT -= dt;
    if (G.spawnT <= 0) { G.spawnT = ph.every * rand(.8, 1.2) * slow; this.spawnWave(ph.pool); }
  },

  // ---------- update ----------
  update(dt) {
    World.t += 0; // (World.update ja avanca t)
    switch (G.state) {
      case 'play': this.updatePlay(dt); break;
      case 'levelup': case 'pause': World.update(dt * .15, 0); break;
      default: World.update(dt, 0); break;
    }
  },

  updatePlay(rdt) {
    let dt = rdt;
    if (this.slowmo) dt *= .45;
    const p = G.player;
    G.t += dt; G.intro += dt;
    World.update(dt, p.vy);
    Events.update(dt); Events.updateHazards(dt);
    this.director(dt);
    if (!p.dead) this.updatePlayer(dt); else { G.overT -= rdt; if (G.overT <= 0) { this.gameOver(); return; } }

    for (const e of G.enemies) updateEnemy(e, dt);
    updatePlayerWeapons(dt);
    if (G.boss) G.boss.update(dt);

    for (const b of G.eb) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.acc) { const s = Math.hypot(b.vx, b.vy) + b.acc * dt, a = Math.atan2(b.vy, b.vx); b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s; }
      if (b.life <= 0 || b.x < -60 || b.x > W + 60 || b.y < -60 || b.y > H + 60) b.dead = true;
      else if (!p.dead && Math.hypot(b.x - p.x, b.y - p.y - 6) < b.r + 10) { b.dead = true; hurtPlayer(1); }
    }
    for (const k of G.pickups) updatePickup(k, dt);

    // fx
    for (const q of G.parts) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; const d = Math.max(0, 1 - q.drag * dt); q.vx *= d; q.vy *= d; }
    for (const r of G.rings) { r.r += (r.max - r.r) * Math.min(1, 7 * dt) + 20 * dt; r.life -= dt * 2.2; }
    for (const o of G.pops) { o.y -= 50 * dt; o.life -= dt * 1.2; }
    G.enemies = G.enemies.filter(e => !e.dead); G.pb = G.pb.filter(b => !b.dead); G.eb = G.eb.filter(b => !b.dead);
    G.pickups = G.pickups.filter(k => !k.dead); G.parts = G.parts.filter(q => q.life > 0); G.rings = G.rings.filter(r => r.life > 0); G.pops = G.pops.filter(o => o.life > 0);
    G.shake = Math.max(0, G.shake - 40 * dt); G.flash = Math.max(0, G.flash - dt * 1.4); G.hurtFlash = Math.max(0, G.hurtFlash - dt);
    G.comboT -= dt; if (G.comboT <= 0) G.combo = 0; G.chainT -= dt; G.cchainT -= dt;

    // fim de fase
    if (G.clearT > 0) { G.clearT -= rdt; if (G.clearT <= 0) { this.stageClear(); return; } }
    if (G.pendingLevels > 0 && !p.dead && G.state === 'play' && !G.boss?.dyingT) this.openLevelUp();
    if (Input.pressed('escape') || Input.pressed('p')) { G.state = 'pause'; Snd.play('uiBack'); }
  },

  updatePlayer(dt) {
    const p = G.player; p.t += dt;
    let ax = 0, ay = 0;
    if (Input.down('a') || Input.down('arrowleft')) ax -= 1; if (Input.down('d') || Input.down('arrowright')) ax += 1;
    if (Input.down('w') || Input.down('arrowup')) ay -= 1; if (Input.down('s') || Input.down('arrowdown')) ay += 1;
    const useMouse = !(ax || ay) && performance.now() - Input.mouse.moved < 1800;
    if (ax || ay) { const m = Math.hypot(ax, ay); p.vx += (ax / m * p.speed - p.vx) * Math.min(1, 10 * dt); p.vy += (ay / m * p.speed - p.vy) * Math.min(1, 10 * dt); }
    else if (useMouse) { const tx = Input.mouse.x, ty = Input.mouse.y; p.vx += (clamp((tx - p.x) * 9, -p.speed * 1.3, p.speed * 1.3) - p.vx) * Math.min(1, 12 * dt); p.vy += (clamp((ty - p.y) * 9, -p.speed * 1.3, p.speed * 1.3) - p.vy) * Math.min(1, 12 * dt); }
    else { p.vx *= 1 - Math.min(1, 6 * dt); p.vy *= 1 - Math.min(1, 6 * dt); }
    p.x = clamp(p.x + p.vx * dt, 50, W - 50); p.y = clamp(p.y + p.vy * dt, 90, H - 70);

    // olhar
    let tx = p.vx / 500, ty = p.vy / 500; const tg = nearestTarget(p.x, p.y);
    if (tg) { const d = Math.hypot(tg.x - p.x, tg.y - p.y) || 1; tx = (tg.x - p.x) / d; ty = (tg.y - p.y) / d; }
    p.lookx += (tx - p.lookx) * Math.min(1, 8 * dt); p.looky += (ty - p.looky) * Math.min(1, 8 * dt);
    p.blink -= dt; if (p.blink <= 0) { p.blinkT = .16; p.blink = rand(2, 5); } if (p.blinkT > 0) p.blinkT -= dt;
    p.inv = Math.max(0, p.inv - dt);

    // tiro e chama
    p.fireT -= dt; if (p.fireT <= 0) { playerShoot(); p.fireT = p.fireDelay; }
    for (let i = 0; i < 2; i++) G.parts.push({ x: p.x + rand(-4, 4), y: p.y + 27, vx: rand(-30, 30), vy: rand(150, 280), life: rand(.25, .5), max: .5, r: rand(3, 7), c: Math.random() < .5 ? '#ffb340' : '#ffe9a8', drag: 1 });

    // pulso e escudo
    const wasCd = p.pulseT > 0; p.pulseT = Math.max(0, p.pulseT - dt);
    if (wasCd && p.pulseT <= 0) Snd.play('specialReady');
    if (Input.pressed(' ') || Input.pressed('shift') || Input.pressed('e')) usePulse();
    if ((G.upCounts.shield || 0) > 0 && !p.shieldReady) { p.shieldT -= dt; if (p.shieldT <= 0) { p.shieldReady = true; Snd.play('shield'); } }
  },

  // ---------- desenho ----------
  drawPlay() {
    const p = G.player, cx = p ? p.x - W / 2 : 0;
    ctx.save();
    if (G.shake > 0) ctx.translate(rand(-1, 1) * G.shake, rand(-1, 1) * G.shake);
    World.draw(cx);
    Events.drawHazards();
    for (const k of G.pickups) Art.pickup(k);
    if (G.boss) G.boss.draw();
    for (const e of G.enemies) Art.enemy(e);
    for (const b of G.pb) Art.pbullet(b);
    for (const b of G.eb) Art.ebullet(b);
    if (p && !p.dead) {
      Art.ship(p.x, p.y, { vx: p.vx, t: p.t, lookx: p.lookx, looky: p.looky, blinkT: p.blinkT, inv: p.inv, shield: p.shieldReady, scale: SHIP_S });
      for (const o of p.orbPos) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(o[0], o[1], 26, '#ffb340', .9); ctx.restore();
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(o[0], o[1], 7, 0, 7); ctx.fill();
        ctx.fillStyle = '#ff8a1f'; ctx.beginPath(); ctx.arc(o[0], o[1], 4, 0, 7); ctx.fill();
      }
    }
    for (const q of G.parts) if (q.k === 'smoke') {
      const k = clamp(q.life / q.max, 0, 1);
      ctx.globalAlpha = k * .4; ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1.6 - k * .6), 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const q of G.parts) {
      if (q.k === 'smoke') continue;
      const k = clamp(q.life / q.max, 0, 1);
      if (q.k === 'spark') { ctx.globalAlpha = k; ctx.strokeStyle = q.c; ctx.lineWidth = q.r; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * .04, q.y - q.vy * .04); ctx.stroke(); }
      else if (q.k === 'flash') drawGlow(q.x, q.y, q.r * (1.3 - k * .3), q.c, k);
      else drawGlow(q.x, q.y, q.r * 2.4, q.c, k);
    }
    for (const r of G.rings) { ctx.globalAlpha = r.life * .8; ctx.strokeStyle = r.c; ctx.lineWidth = 4 * r.life + 1; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 7); ctx.stroke(); }
    if (G.pulse) {
      const u = G.pulse, k = 1 - u.r / 1000;
      ctx.globalAlpha = Math.max(0, k) * .9; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 16 * k + 3; ctx.beginPath(); ctx.arc(u.x, u.y, u.r, 0, 7); ctx.stroke();
      ctx.globalAlpha = Math.max(0, k) * .4; ctx.strokeStyle = '#b98cff'; ctx.lineWidth = 50 * k + 4; ctx.beginPath(); ctx.arc(u.x, u.y, u.r * .94, 0, 7); ctx.stroke();
    }
    ctx.restore();
    for (const o of G.pops) { ctx.globalAlpha = clamp(o.life, 0, 1); txt(o.text, o.x, o.y, o.size, o.c, 'center'); }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (G.hurtFlash > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .85);
      g.addColorStop(0, 'rgba(255,40,90,0)'); g.addColorStop(1, `rgba(255,40,90,${G.hurtFlash * 1.2})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    Events.drawOverlay();
    if (G.flash > 0) { ctx.globalAlpha = Math.min(.7, G.flash * .35); ctx.fillStyle = '#e9e0ff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    this.drawHud();
  },

  drawHud() {
    const p = G.player, st = G.stage;
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // xp
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, 0, W, 8);
    ctx.fillStyle = '#8b4dff'; ctx.fillRect(0, 0, W * clamp(G.xp / G.xpNeed, 0, 1), 8);
    // esquerda
    txt('NÍVEL ' + G.level, 24, 22, 26);
    for (let i = 0; i < p.maxHp; i++) { ctx.fillStyle = i < p.hp ? '#ff5f8f' : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.roundRect(24 + i * 38, 60, 30, 12, 6); ctx.fill(); }
    if (p.shieldReady) { ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(24 + p.maxHp * 38 + 10, 66, 9, 0, 7); ctx.stroke(); }
    // direita
    txt(G.score + ' pts', W - 24, 22, 26, '#e2d4ff', 'right');
    txt('★ ' + G.runCoins, W - 24, 56, 22, '#ffcf6b', 'right');
    if (G.combo >= 3) txt('COMBO x' + G.combo, W - 24, 84, 20, '#ffe9a8', 'right');
    // progresso / chefe
    if (G.boss && G.boss.state !== 'intro') {
      const b = G.boss, w = 560, x = W / 2 - w / 2, y = 52;
      txt(b.name.toUpperCase(), W / 2, 22, 22, '#ffe9a8', 'center');
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.roundRect(x - 3, y - 3, w + 6, 20, 10); ctx.fill();
      const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#ff5a3c'); g.addColorStop(1, '#ffb340');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, Math.max(8, w * b.ratio), 14, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; for (const f of [.33, .66]) { ctx.beginPath(); ctx.moveTo(x + w * f, y); ctx.lineTo(x + w * f, y + 14); ctx.stroke(); }
    } else if (!G.boss && !G.bossDone) {
      const w = 420, x = W / 2 - w / 2, y = 30, k = clamp(G.t / st.duration, 0, 1);
      txt(G.bossPending ? 'CHEFE CHEGANDO!' : st.name.toUpperCase(), W / 2, 8, 15, '#e2d4ff', 'center', 800);
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.roundRect(x, y, w, 8, 4); ctx.fill();
      ctx.fillStyle = st.tint; ctx.beginPath(); ctx.roundRect(x, y, Math.max(6, w * k), 8, 4); ctx.fill();
      ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.arc(x + w, y + 4, 9, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + w - 3, y + 2, 2, 0, 7); ctx.arc(x + w + 3, y + 2, 2, 0, 7); ctx.fill();
    }
    // pulso
    const rdy = p.pulseT <= 0, k = rdy ? 1 : 1 - p.pulseT / p.pulseCd, cx = 60, cy = H - 60;
    ctx.fillStyle = 'rgba(20,8,50,.6)'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, 7); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = rdy ? '#ffe9a8' : '#8b4dff'; ctx.beginPath(); ctx.arc(cx, cy, 26, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
    if (rdy) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, cy, 44, '#ffb340', .5 + Math.sin(World.t * 6) * .2); ctx.restore(); ctx.globalAlpha = 1; }
    txt('PULSO', cx + 44, cy - 20, 15, '#e2d4ff', 'left', 800); txt('ESPAÇO', cx + 44, cy, 15, rdy ? '#ffe9a8' : '#8a7fb0', 'left', 800);
    // tutorial
    if (Save.data.runs <= 1 && G.t < 8) { ctx.globalAlpha = Math.min(1, (8 - G.t) / 1.5); txt('Mova com WASD, setas ou mouse  •  O tiro é automático  •  ESPAÇO usa o Pulso Olien', W / 2, H - 56, 20, '#e2d4ff', 'center', 700); ctx.globalAlpha = 1; }
  },
};
