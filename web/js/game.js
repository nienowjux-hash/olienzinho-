'use strict';
// ---------- estado global e logica de jogo ----------
const SHIP_S = .62;
const G = {
  finisher: null, cut: null, story: null,
  state: 'title', t: 0, stage: null, stageIdx: 0, sel: 0,
  player: null, enemies: [], pb: [], eb: [], pickups: [], parts: [], rings: [], pops: [], hazards: [], boss: null, pulse: null,
  score: 0, kills: 0, runCoins: 0, level: 1, xp: 0, xpNeed: 7, pendingLevels: 0, upCounts: {}, options: [],
  shake: 0, flash: 0, hurtFlash: 0, combo: 0, comboT: 0, chain: 0, chainT: 0, cchain: 0, cchainT: 0,
  spawnT: 1, bossDone: false, bossPending: false, bossPendingT: 0, clearT: 0, overT: 0, result: null, intro: 0, bossShown: 0,
};

function txt(s, x, y, size, color = '#e2d4ff', align = 'left', weight = 900, base = 'top') {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = color; ctx.fillText(s, x, y);
}

const EPITHET = { 'Nave-Mãe Zangão': 'A Mãe do Enxame', 'Gigante de Rocha': 'O Guardião da Montanha', 'Olho da Tempestade': 'O Vigia que Nunca Pisca', 'Sol-Guardião': 'A Chama que Cuida', 'Eco do Olienzinho': 'O Medo com Formato de Foguete', 'O Vazio': 'O Primeiro Silêncio' };

function newPlayer() {
  const p = {
    x: W / 2, y: H - 130, vx: 0, vy: 0, hp: 5, maxHp: 5, inv: 0, fireT: 0, pulseT: 0, t: 0, blink: 3, blinkT: 0, lookx: 0, looky: 0,
    orbAng: 0, orbPos: [], missT: 2, shieldReady: false, shieldT: 0, dead: false, mood: null, moodT: 0, recoil: 0,
    weapon: 'violet', dashT: 0, dashCd: 0, dashDir: [0, -1], specCd: 6, ghosts: [], beams: [], beamT: 0,
  };
  return p;
}

function recalcStats(p) {
  const s = Save.data.shop, u = G.upCounts, L = id => s[id] || 0, U = id => u[id] || 0;
  p.maxHp = Math.max(2, 5 + L('hp') + U('hp') + dif().php);
  p.dmg = (1 + .12 * L('dmg')) * (1 + .2 * U('dmg')) * (1 + .02 * Extras.fragCount());
  p.fireDelay = .2 * Math.pow(.9, U('rate')) / (1 + .06 * L('rate'));
  p.shots = 1 + U('multi') + (p.buffs && p.buffs.double > 0 ? 1 : 0) + Visual5.wShots(p);
  p.speed = 470 * (1 + .05 * L('speed')) * (1 + .1 * U('speed'));
  p.pierce = U('pierce');
  p.magnet = 95 + 30 * L('magnet') + 60 * U('magnet');
  p.crit = .05 + .08 * U('crit'); p.critMul = 2;
  p.pulseCd = Math.max(6, 22 - 2 * L('pulse')) * Math.pow(.85, U('pulse'));
  p.coinMul = (1 + .12 * L('luck')) * (1 + .2 * U('lucky'));
  p.xpMul = (1 + .1 * L('xp')) * (1 + .15 * U('xp'));
  p.missiles = U('missile'); p.orbitals = U('orbit'); p.ricochet = U('ricochet'); p.chainL = U('chain');
  p.shieldCd = [0, 20, 15, 10][U('shield')] || 10;
  p.dashCdMax = 1.6 * Math.pow(.8, U('dash')); p.specCdMax = 16 * Math.pow(.8, U('spec')); p.specPow = 1 + .25 * U('spec');
  if (p.weapon === 'orbi') { p.maxHp = Math.max(2, p.maxHp - 2); p.magnet += 40; p.dashCdMax *= .9; p.specCdMax *= 1.35; p.dmg *= .85; }
  if (G.dmod === 'glass') { p.maxHp = 3; p.dmg *= 1.5; }
  { const lv = Visual5.wl(p.weapon); p.dmg *= 1 + .12 * (lv - 1); p.specCdMax *= Math.pow(.93, lv - 1); if (lv >= 5) p.crit += .1; }
  Visual5.relicStats(p);
}

const Game = {
  slowmo: 0,

  startStage(idx, opts = {}) {
    G.stageIdx = idx; G.stage = STAGES[idx];
    G.t = 0; G.enemies = []; G.pb = []; G.eb = []; G.pickups = []; G.parts = []; G.rings = []; G.pops = []; G.hazards = []; G.boss = null; G.pulse = null;
    G.score = 0; G.kills = 0; G.runCoins = 0; G.level = 1; G.xp = 0; G.xpNeed = 7; G.pendingLevels = 0; G.upCounts = {}; G.options = [];
    G.scoreShown = 0; G.scorePrev = 0; G.scorePop = 0; G.hpPrev = undefined; G.hpPulse = 0; G.xpPrev = 0; G.xpFlash = 0; G.lvPop = 0; G.hudT = undefined;
    G.shake = 0; G.flash = 0; G.hurtFlash = 0; G.combo = 0; G.comboT = 0; G.chain = 0; G.chainT = 0; G.cchain = 0; G.cchainT = 0;
    G.spawnT = 1.5; G.bossDone = false; G.bossPending = false; G.bossPendingT = 0; G.clearT = 0; G.overT = 0; G.result = null; G.intro = 0;
    this.slowmo = 0;
    World.setStage(G.stage.pal); Events.reset(G.stage);
    G.player = newPlayer();
    { const ld = Save.data.loadout; G.player.weapon = Save.data.owned.weapons[ld.weapon] ? ld.weapon : 'violet'; if (ld.char === 'orbi' && Save.data.cleared[3]) G.player.weapon = 'orbi'; }
    G.stats = { hits: 0, bossHit: 0, maxCombo: 0, minis: 0 }; G.timers = []; G.hitstop = 0; G.mega = null; G.miniDone = false; G.endless = false; G.daily = false; G.training = false; G.dmod = null; G.well = null; G.relic = null; G.grazeN = 0; G.rush = false; G.sanct = false; G.fragSpawned = false; G.encSpawned = false; Extras.reset(); Extras.tutStart();
    recalcStats(G.player); G.player.hp = G.player.maxHp;
    Events.banner = { t: 0, title: G.stage.name.toUpperCase(), sub: 'FASE ' + (idx + 1), c: G.stage.tint };
    G.finisher = null; G.cut = null; G.story = null;
    Save.data.runs++; Save.save();
    G.retry = !!opts.skipStory; G.preDone = false;
    const begin = () => Visual5.pickRelic(() => { G.state = 'play'; Snd.musicPlay(G.stage.music, 1); });
    const intro = () => this.maybeStory('intro' + idx, STORY.stages[idx].intro, begin);
    if (idx === 0 && !Save.data.seenPrologue && !this.noStory) { Save.data.seenPrologue = true; Save.save(); this.startStory(STORY.prologue, intro); }
    else intro();
  },

  // ---------- historia ----------
  startStory(pages, done, opts = {}) {
    G.story = { pages, i: 0, t: 0, last: undefined, lastShown: 0, doneAt: null, prevWho: null, sw: 0, done };
    G.state = 'story';
    if (opts.music !== null) Snd.musicPlay(opts.music || 'menu', 0);
  },
  // em tentativas repetidas, cenas ja vistas sao puladas
  maybeStory(key, pages, done, opts) {
    const seen = Save.data.seen && Save.data.seen[key];
    if (this.noStory || !pages || !pages.length || (G.retry && seen)) { done(); return; }
    this.startStory(pages, () => { Save.data.seen = Save.data.seen || {}; Save.data.seen[key] = true; Save.save(); done(); }, opts);
  },
  endStory() { const d = G.story && G.story.done; G.story = null; if (d) d(); },

  // ---------- menu / navegacao ----------
  goTitle() { G.state = 'title'; World.setStage(STAGES[0].pal); Snd.musicPlay('menu', 0); },
  goSelect() { G.state = 'select'; World.setStage(STAGES[G.sel].pal); Snd.musicPlay('menu', 0); },

  endRunSave(bonus = 0, cleared = false) {
    const d = Save.data;
    d.coins += G.runCoins + bonus;
    if (G.training) return;
    if (G.rush || G.sanct) { d.coins += G.runCoins; Save.save(); return; }
    if (G.endless) { if (G.daily) { this.addDaily(); G.rankPos = 0; } else G.rankPos = this.addRank(); Save.save(); return; }
    const prev = d.best[G.stageIdx] || 0; if (G.score > prev) d.best[G.stageIdx] = G.score;
    if (cleared) { d.unlocked = Math.max(d.unlocked, Math.min(STAGES.length, G.stageIdx + 2)); d.cleared[G.stageIdx] = true; }
    Save.save();
  },

  quitRun() { this.endRunSave(0, false); if (G.endless || G.training) this.goTitle(); else this.goSelect(); },

  // ---------- modo infinito ----------
  startEndless() {
    this.startStage(0, { skipStory: true });
    Extras.tut = null; G.endless = true; G.wave = 1; G.waveT = 0; G.waveMini = false; G.biome = 0;
    G.stage = { ...STAGES[0], duration: 1e9, events: [] }; Events.reset(null);
    Events.banner = { t: 0, title: 'MODO INFINITO', sub: 'ONDA 1', c: '#ffb340' };
    Visual5.pickRelic(() => { G.state = 'play'; Snd.musicPlay(G.stage.music, 1); });
  },
  setBiome(b) {
    G.biome = b; G.stageIdx = b; G.stage = { ...STAGES[b], duration: 1e9, events: [] };
    World.setStage(G.stage.pal); Snd.musicPlay(G.stage.music, 1);
  },
  nextWave() {
    G.wave++; G.waveT = 0; G.waveMini = false; G.bossPending = false;
    Save.data.bestWave = Math.max(Save.data.bestWave || 0, G.wave);
    const b = Math.floor((G.wave - 1) / 5) % STAGES.length; if (b !== G.biome) this.setBiome(b);
    Events.banner = { t: 0, title: 'ONDA ' + G.wave, sub: STAGES[G.biome].name, c: STAGES[G.biome].tint };
  },
  addRank() {
    const d = Save.data; d.rank = d.rank || [];
    const ent = { score: G.score, wave: G.wave, kills: G.kills, d: new Date().toLocaleDateString('pt-BR') };
    d.rank.push(ent); d.rank.sort((a, b) => b.score - a.score); d.rank = d.rank.slice(0, 10);
    d.bestWave = Math.max(d.bestWave || 0, G.wave);
    return d.rank.indexOf(ent) + 1;
  },
  endlessDirector(dt) {
    const st = G.stage;
    if (G.boss) return;
    if (G.bossPending) {
      G.bossPendingT -= dt;
      if (G.bossPendingT <= 0) {
        G.bossPending = false; G.boss = new BOSS_CLASSES[st.boss](); const k = 1 + (G.wave / 5 - 1) * .3; G.boss.maxHp = G.boss.hp = Math.round(G.boss.maxHp * k);
        Snd.play('impact'); Snd.musicPlay(st.bossMusic, 2); G.bossShown = 0;
      }
      return;
    }
    G.waveT += dt;
    if (G.waveT >= 28) {
      if (G.wave % 5 === 0) { // chefe no fim de cada 5 ondas
        G.bossPending = true; G.bossPendingT = 3.2; World.boost = .6; Snd.musicStop();
        Events.banner = { t: 0, title: 'CHEFE APROXIMANDO', sub: st.bossName, c: '#ff8a5f' }; Snd.play('bossWarn'); return;
      }
      this.nextWave(); return;
    }
    if (!G.waveMini && G.wave % 5 === 3 && G.waveT > 10) {
      G.waveMini = true; spawnEnemy('captain', rand(300, W - 300), -80);
      Events.banner = { t: 0, title: 'MINICHEFE', sub: CAPTAINS[G.biome % CAPTAINS.length], c: '#ff8a5f' }; Snd.play('bossWarn');
    }
    const w = G.wave, pool = { drone: 3, zig: 2 };
    if (w >= 2) { pool.kami = 2; pool.shooter = 1; }
    if (w >= 3) { pool.mine = 1; pool.bit = 1; pool.shield = 1; }
    if (w >= 4) pool.healer = 1;
    if (w >= 5) pool.tank = 1;
    G.spawnT -= dt;
    if (G.spawnT <= 0) { G.spawnT = Math.max(.4, 1.1 - w * .045) * 1.4 * rand(.85, 1.2); this.spawnWave(pool); }
  },

  playerDied() {
    const p = G.player; p.dead = true;
    burst(p.x, p.y, ['#e2d4ff', '#b98cff', '#ff7ac8', '#ffffff'], 60, 480, 7);
    for (let i = 0; i < 3; i++) shockwave(p.x, p.y, 200 + i * 140, '#b98cff');
    Snd.play('explode', { size: 2 }); shake(22); flashScreen(.6);
    G.eb.forEach(b => { b.dead = true; });
    G.overT = 2.2; Snd.musicStop();
  },

  bossDefeated() {
    if (G.endless) { // no infinito o jogo segue
      G.player.mood = 'happy'; G.player.moodT = 3; G.finisher = null; G.cut = null; Game.slowmo = 0; for (const k of G.pickups) k.mag = true;
      G.player.hp = Math.min(G.player.maxHp, G.player.hp + 2); Snd.play('stinger'); flashScreen(.4);
      this.nextWave(); Snd.musicPlay(G.stage.music, 1); return;
    }
    G.player.mood = 'happy'; G.player.moodT = 9;
    G.bossDone = true; G.clearT = 0; G.finisher = null;
    for (const k of G.pickups) k.mag = true;
    // cena: Olienzinho no holofote com a fala de impacto
    G.cut = { t: 0, text: STORY.stages[G.stageIdx].victory, last: 0 };
    Snd.play('stinger'); Snd.musicPlay('triumph', 1);
  },

  stageClear() {
    const par = G.stage.duration * 20 * (1 + G.stageIdx * .3), ratio = G.score / par, st = G.stats;
    let gi = ratio >= .9 ? 3 : ratio >= .65 ? 2 : ratio >= .4 ? 1 : 0;
    if (st.hits === 0) gi = Math.min(3, gi + 1);
    const grade = 'CBAS'[gi], bonus = Math.round((80 + G.stageIdx * 50) * [1, 1.2, 1.5, 2][gi]);
    const prevG = Save.data.grades[G.stageIdx]; if (prevG === undefined || gi > prevG) Save.data.grades[G.stageIdx] = gi;
    this.endRunSave(bonus, true);
    G.result = { bonus, grade, gi, hits: st.hits, maxCombo: st.maxCombo, time: G.t, coins: G.runCoins, score: G.score, kills: G.kills, level: G.level, best: Save.data.best[G.stageIdx], newStage: G.stageIdx + 1 < STAGES.length };
    const toClear = () => Visual4.celebrate();
    if (G.stageIdx === 3) this.maybeStory('epi', STORY.epilogue, toClear);
    else if (G.stageIdx === 5) { Save.data.won = true; Save.save(); Ach.check(); this.maybeStory('finale', STORY.finale, toClear); }
    else toClear();
  },

  gameOver() {
    this.endRunSave(0, false);
    G.result = { coins: G.runCoins, score: G.score, kills: G.kills, level: G.level };
    const toOver = () => { G.state = 'over'; G.overAt = undefined; G.overQuote = null; Snd.play('gameOver'); };
    if (G.endless) G.result.wave = G.wave;
    if (G.rush) G.result.wave = G.rushI;
    if (this.noStory || G.endless) { toOver(); return; }
    // o vilao (o chefe da fase ou o Vazio) fala com o jogador
    const D = STORY.defeat, inBoss = !!G.boss, bc = ['C', 'P', 'E', 'S', 'X', 'V'][G.stageIdx];
    const pages = [{ music: 'sad' },
      inBoss ? { who: bc, scene: 'boss', mood: 'angry', text: pick(D.boss[G.stageIdx]) } : { who: 'V', scene: 'void', mood: 'angry', text: pick(D.void) }];
    if (Math.random() < .5) pages.push({ who: 'B', mood: 'worry', text: pick(D.orbi) });
    pages.push({ who: 'O', mood: 'sad', text: pick(D.reply) });
    this.startStory(pages, toOver, { music: null });
  },

  openLevelUp() {
    G.pendingLevels--;
    const p = G.player;
    Snd.play('levelUp'); p.mood = 'happy'; p.moodT = 1.4; G.lvPop = 1; shockwave(p.x, p.y, 380, '#b98cff'); burst(p.x, p.y, ['#b98cff', '#ffb340', '#ffffff'], 50, 440, 6); flashScreen(.2);
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
    if (G.enemies.length > 13 + (G.endless ? Math.min(6, (G.wave / 2) | 0) : 0)) return;
    const type = this.wpick(pool), m = 70;
    const rx = () => rand(m, W - m);
    switch (type) {
      case 'drone': {
        const r = Math.random();
        if (r < .35) { const n = randi(2, 3), x0 = rx(); for (let i = 0; i < n; i++) spawnEnemy('drone', clamp(x0 + (i - (n - 1) / 2) * 110, m, W - m), -30); }
        else if (r < .55) { const x0 = rx(); for (let i = 0; i < 3; i++) spawnEnemy('drone', clamp(x0 + (i - 1) * 100, m, W - m), -30 - Math.abs(i - 1) * 60); }
        else spawnEnemy('drone', rx(), -30);
        break;
      }
      case 'zig': { const n = randi(1, 2); for (let i = 0; i < n; i++) spawnEnemy('zig', rx(), -30 - i * 70); break; }
      case 'kami': { const n = randi(1, 2); for (let i = 0; i < n; i++) spawnEnemy('kami', rx(), -30 - i * 50); break; }
      case 'shooter': { const n = 1; for (let i = 0; i < n; i++) spawnEnemy('shooter', rx(), -30 - i * 60); break; }
      case 'tank': spawnEnemy('tank', rand(250, W - 250), -60); break;
      case 'shield': spawnEnemy('shield', rx(), -30); break;
      case 'healer': { const x0 = rx(); spawnEnemy('healer', x0, -30); spawnEnemy('drone', clamp(x0 - 90, m, W - m), -50); spawnEnemy('drone', clamp(x0 + 90, m, W - m), -50); break; }
      case 'mine': { const n = randi(1, 2); for (let i = 0; i < n; i++) spawnEnemy('mine', rx(), -30 - i * 60); break; }
      case 'bit': { const n = randi(5, 7), x0 = rx(); for (let i = 0; i < n; i++) spawnEnemy('bit', clamp(x0 + (i % 2 ? 30 : -30), m, W - m), -30 - i * 38); break; }
    }
  },

  director(dt) {
    if (G.training) return;
    if (G.sanct) { Visual5.sanctDir(dt); return; }
    if (G.endless) { this.endlessDirector(dt); return; }
    const st = G.stage;
    if (G.bossDone) return;
    if (G.boss || G.bossPending) {
      if (G.bossPending) {
        G.bossPendingT -= dt;
        if (G.bossPendingT <= 0 && !G.preDone) {
          G.preDone = true;
          const spawn = () => { G.state = 'play'; G.bossPending = false; G.boss = new BOSS_CLASSES[st.boss](); Snd.play('impact'); Snd.musicPlay(st.bossMusic, 2); G.bossShown = 0; };
          this.maybeStory('pre' + G.stageIdx, STORY.stages[G.stageIdx].pre, spawn, { music: null });
        }
      }
      return;
    }
    if (!G.miniDone && G.t >= st.duration * .5) {
      G.miniDone = true; spawnEnemy('captain', rand(300, W - 300), -80);
      Events.banner = { t: 0, title: 'MINICHEFE', sub: CAPTAINS[G.stageIdx % CAPTAINS.length], c: '#ff8a5f' }; Snd.play('bossWarn');
    }
    if (G.t >= st.duration) {
      G.bossPending = true; G.bossPendingT = 3.2;
      Events.cancel(); World.boost = .6; Snd.musicStop();
      Events.banner = { t: 0, title: 'CHEFE APROXIMANDO', sub: st.bossName, c: '#ff8a5f' };
      Snd.play('bossWarn');
      return;
    }
    const ph0 = st.phases.find(p => G.t < p.until) || st.phases[st.phases.length - 1], fr = G.t / st.duration;
    const ph = { every: ph0.every, pool: { ...ph0.pool } };
    if (fr > .55) { ph.pool.shield = G.stageIdx >= 1 ? 1 : .5; if (G.stageIdx >= 2) ph.pool.healer = 1; }
    const ev = Events.active;
    const slow = ev === 'rain' || ev === 'storm' || ev === 'flare' ? 1.7 : ev === 'worm' ? 3 : ev === 'mines' ? 1.4 : 1;
    G.spawnT -= dt;
    if (G.spawnT <= 0) { G.spawnT = ph.every * 1.4 * rand(.85, 1.2) * slow; this.spawnWave(ph.pool); }
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
    if (Extras.tut && Extras.tut.wait) { Extras.tutWait(); return; }
    if (G.furyCut) { Visual3.furyUpdate(rdt); return; }
    if (G.hitstop > 0) { G.hitstop -= rdt; return; }
    let dt = rdt;
    if (this.slowmo) dt *= .45;
    const p = G.player;
    G.t += dt; G.intro += dt;
    World.update(dt, p.vy);
    Events.update(dt); Events.updateHazards(dt); Extras.update(dt); Visual.update(dt); Visual2.update(dt); Visual5.update(dt); Extras.tutUpdate(dt); if (G.training) Extras.trainUpdate(dt);
    Snd.setLayers(p.dead ? 0 : G.combo >= 25 ? 2 : G.combo >= 10 ? 1 : 0, !p.dead && p.hp <= Math.max(1, p.maxHp * .25) ? 1 : 0);
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
      else if (!p.dead && !b.grazed && Math.hypot(b.x - p.x, b.y - p.y - 6) < b.r + 30) Visual5.graze(b);
    }
    for (const k of G.pickups) updatePickup(k, dt);
    for (const tm of G.timers) { tm.t -= dt; if (tm.t <= 0) { tm.fn(); tm.dead = true; } }
    G.timers = G.timers.filter(tm => !tm.dead);

    // fx
    for (const q of G.parts) { q.life -= dt; if (q.k === 'debris') { q.rot += q.vr * dt; q.vy += 380 * dt; } q.x += q.vx * dt; q.y += q.vy * dt; const d = Math.max(0, 1 - q.drag * dt); q.vx *= d; q.vy *= d; }
    for (const r of G.rings) { r.r += (r.max - r.r) * Math.min(1, 7 * dt) + 20 * dt; r.life -= dt * 2.2; }
    for (const o of G.pops) { o.y -= 50 * dt; o.life -= dt * 1.2; }
    G.enemies = G.enemies.filter(e => !e.dead); G.pb = G.pb.filter(b => !b.dead); G.eb = G.eb.filter(b => !b.dead);
    G.pickups = G.pickups.filter(k => !k.dead); G.parts = G.parts.filter(q => q.life > 0); G.rings = G.rings.filter(r => r.life > 0); G.pops = G.pops.filter(o => o.life > 0);
    G.shake = Math.max(0, G.shake - 40 * dt); G.flash = Math.max(0, G.flash - dt * 1.4); G.hurtFlash = Math.max(0, G.hurtFlash - dt);
    G.comboT -= dt; if (G.comboT <= 0) G.combo = 0; G.chainT -= dt; G.cchainT -= dt;

    // fim de fase
    if (G.cut) {
      const c = G.cut; c.t += rdt;
      if (Math.random() < .6) G.parts.push({ x: rand(0, W), y: -10, vx: 0, vy: rand(120, 260), life: 4, max: 4, r: rand(3, 6), c: Math.random() < .5 ? '#ffe9a8' : '#b98cff', drag: 0 });
      const sp = 38, len = c.text.length, typed = Math.floor(Math.max(0, c.t - .9) * sp), full = .9 + len / sp;
      if (typed > c.last && c.text[Math.min(len, typed) - 1] !== ' ' && typed % 2 === 0) Snd.play('blip', { who: 'O' });
      c.last = typed;
      const adv = (Input.pressed(' ') || Input.pressed('enter') || Input.mouse.click) && c.t > 1;
      if (adv && typed < len) c.t = full + .01;
      else if (adv && c.t > full + .6) { G.cut = null; this.maybeStory('after' + G.stageIdx, STORY.stages[G.stageIdx].after, () => this.stageClear()); return; }
    }
    if (G.clearT > 0) { G.clearT -= rdt; if (G.clearT <= 0) { this.stageClear(); return; } }
    if (G.pendingLevels > 0 && !p.dead && G.state === 'play' && !G.bossDone && !(G.boss && G.boss.state === 'dying')) this.openLevelUp();
    if ((Input.pressed('escape') || Input.pressed('p')) && !G.cut) { G.state = 'pause'; G.pausedThisFrame = true; Snd.play('uiBack'); }
  },

  updatePlayer(dt) {
    const p = G.player; p.t += dt;
    if (G.finisher && !G.boss) G.finisher = null; // rede de seguranca: nunca deixa a nave presa
    if (G.cut && !G.bossDone) G.cut = null;
    if (G.finisher || G.cut) { // nas cenas o Olienzinho vai para o centro e fica invulneravel
      p.inv = 9; p.vx = p.vy = 0; p.recoil = 0; p.mood = G.cut ? 'happy' : p.mood;
      p.x += (W / 2 - p.x) * Math.min(1, 3 * dt); p.y += (H * .72 - p.y) * Math.min(1, 3 * dt);
      p.blink -= dt; if (p.blink <= 0) { p.blinkT = .16; p.blink = rand(2, 5); } if (p.blinkT > 0) p.blinkT -= dt;
      return;
    }
    let ax = 0, ay = 0;
    if (Input.down('a') || Input.down('arrowleft')) ax -= 1; if (Input.down('d') || Input.down('arrowright')) ax += 1;
    if (Input.down('w') || Input.down('arrowup')) ay -= 1; if (Input.down('s') || Input.down('arrowdown')) ay += 1;
    if (Input.pressed('shift')) tryDash(ax, ay);
    p.dashCd = Math.max(0, p.dashCd - dt); p.specCd = Math.max(0, p.specCd - dt);
    p.ghosts = p.ghosts.filter(g => (g.t -= dt) > 0);
    const useMouse = !(ax || ay) && performance.now() - Input.mouse.moved < 1800;
    if (p.dashT > 0) {
      p.dashT -= dt; const [ddx, ddy] = p.dashDir; p.vx = ddx * 500; p.vy = ddy * 500;
      p.x = clamp(p.x + ddx * 1500 * dt, 50, W - 50); p.y = clamp(p.y + ddy * 1500 * dt, 90, H - 70);
      p.ghosts.push({ x: p.x, y: p.y, t: .28, vx: p.vx });
    } else if (ax || ay) { const m = Math.hypot(ax, ay); p.vx += (ax / m * p.speed - p.vx) * Math.min(1, 10 * dt); p.vy += (ay / m * p.speed - p.vy) * Math.min(1, 10 * dt); }
    else if (useMouse) { const tx = Input.mouse.x, ty = Input.mouse.y; p.vx += (clamp((tx - p.x) * 9, -p.speed * 1.3, p.speed * 1.3) - p.vx) * Math.min(1, 12 * dt); p.vy += (clamp((ty - p.y) * 9, -p.speed * 1.3, p.speed * 1.3) - p.vy) * Math.min(1, 12 * dt); }
    else { p.vx *= 1 - Math.min(1, 6 * dt); p.vy *= 1 - Math.min(1, 6 * dt); }
    if (p.dashT <= 0) { p.x = clamp(p.x + p.vx * dt, 50, W - 50); p.y = clamp(p.y + p.vy * dt, 90, H - 70); }

    // olhar
    let tx = p.vx / 500, ty = p.vy / 500; const tg = nearestTarget(p.x, p.y);
    if (tg) { const d = Math.hypot(tg.x - p.x, tg.y - p.y) || 1; tx = (tg.x - p.x) / d; ty = (tg.y - p.y) / d; }
    p.lookx += (tx - p.lookx) * Math.min(1, 8 * dt); p.looky += (ty - p.looky) * Math.min(1, 8 * dt);
    p.blink -= dt; if (p.blink <= 0) { p.blinkT = .16; p.blink = rand(2, 5); } if (p.blinkT > 0) p.blinkT -= dt;
    p.inv = Math.max(0, p.inv - dt); p.od = (G.upCounts.overdrive || 0) > 0 && p.hp <= 2;

    // tiro e chama
    p.recoil = Math.max(0, p.recoil - dt * 9); if (p.moodT > 0) { p.moodT -= dt; if (p.moodT <= 0) p.mood = null; }
    p.fireT -= dt; if (p.fireT <= 0) { playerShoot(); p.fireT = p.fireDelay * WEAPONS[p.weapon].delay / (p.od ? 1.8 : 1) / (p.buffs && p.buffs.rapid > 0 ? 1.6 : 1); }
    for (let i = 0; i < 2; i++) G.parts.push({ x: p.x + rand(-4, 4), y: p.y + 27, vx: rand(-30, 30), vy: rand(150, 280), life: rand(.25, .5), max: .5, r: rand(3, 7), c: Math.random() < .5 ? '#ffb340' : '#ffe9a8', drag: 1 });

    // pulso e escudo
    const wasCd = p.pulseT > 0; p.pulseT = Math.max(0, p.pulseT - dt);
    if (wasCd && p.pulseT <= 0) Snd.play('specialReady');
    if (Input.pressed(' ')) usePulse();
    if (Input.pressed('q') || Input.pressed('e')) useSpecial();
    { const was = p.specCd > 0; if (was && p.specCd <= 0) Snd.play('specialReady'); }
    if ((G.upCounts.shield || 0) > 0 && !p.shieldReady) { p.shieldT -= dt; if (p.shieldT <= 0) { p.shieldReady = true; Snd.play('shield'); } }
  },

  // ---------- desenho ----------
  drawPlay() {
    const p = G.player, cx = p ? p.x - W / 2 : 0;
    ctx.save();
    if (G.shake > 0) ctx.translate(rand(-1, 1) * G.shake * .55, rand(-1, 1) * G.shake * .55);
    if (!G.furyCut) G.zoom = (G.zoom || 0) * .92; if (G.zoom <= .002) G.zoomCx = null; if (G.zoom > .001) { const zx = G.zoomCx ?? W / 2, zy = G.zoomCy ?? H / 2; ctx.translate(zx, zy); ctx.scale(1 + G.zoom, 1 + G.zoom); ctx.translate(-zx, -zy); }
    World.draw(cx); Visual.biome(); Visual4.fog(); Visual2.lights();
    Events.drawHazards();
    for (const k of G.pickups) Art.pickup(k);
    if (G.boss) { const b = G.boss, br = 1 + Math.sin(b.t * 2) * .012; ctx.save(); ctx.translate(b.shx || 0, b.shy || 0); ctx.translate(b.x, b.y); ctx.scale(br, br); ctx.translate(-b.x, -b.y); Visual3.bossDraw(b); ctx.restore(); Visual.bossAura(b); }
    for (const e of G.enemies) Art.enemy(e);
    Extras.drawWorld(); drawWell(); Extras.dummyDraw();
    for (const e of G.enemies) {
      if (e.healFx > 0 && e.healTo && !e.healTo.dead) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7fffa0'; ctx.globalAlpha = e.healFx * 2; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.healTo.x, e.healTo.y); ctx.stroke(); ctx.restore(); }
      if (e.mini && e.mode !== 'enter') { const bw = 120, bx = e.x - bw / 2, by = e.y - e.rad - 26; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, bw + 4, 12, 6); ctx.fill(); ctx.fillStyle = e.glow; ctx.beginPath(); ctx.roundRect(bx, by, Math.max(6, bw * clamp(e.hp / e.maxHp, 0, 1)), 8, 4); ctx.fill(); txt(e.name, e.x, by - 20, 15, '#ffe9a8', 'center', 800); }
    }
    for (const b of G.pb) Art.pbullet(b);
    this.drawBeams();
    for (const b of G.eb) Art.ebullet(b);
    if (p && !p.dead && !G.cut) {
      const sp = Math.hypot(p.vx, p.vy) / 500, bob = Math.sin(p.t * 3) * 2.5 * (1 - Math.min(1, sp));
      const pal = G.training && G.trainSkin != null ? SKINS[G.trainSkin].pal : skinOf(Save.data.loadout.skin).pal, ob = p.weapon === 'orbi';
      for (const g of p.ghosts) { ctx.globalAlpha = g.t / .28 * .45; Art.ship(g.x, g.y, { vx: g.vx, t: p.t, lookx: 0, looky: -1, blinkT: 0, inv: 0, scale: SHIP_S, pal, orbi: ob }); }
      ctx.globalAlpha = 1;
      Art.ship(p.x, p.y + bob, { pal, orbi: ob, vx: p.vx, t: p.t, lookx: p.lookx, looky: p.looky, blinkT: p.blinkT, inv: p.inv, shield: p.shieldReady, scale: SHIP_S, mood: p.mood,
        sx: (1 + p.recoil * .05 - Math.abs(p.vx) / 500 * .14) * (p.dashT > 0 ? .78 : 1), sy: (1 - p.recoil * .08 + Math.abs(p.vy) / 500 * .04) * (p.dashT > 0 ? 1.3 : 1) });
      Visual2.shipFx(p);
      for (const o of p.orbPos) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(o[0], o[1], 26, '#ffb340', .9); ctx.restore();
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(o[0], o[1], 7, 0, 7); ctx.fill();
        ctx.fillStyle = '#ff8a1f'; ctx.beginPath(); ctx.arc(o[0], o[1], 4, 0, 7); ctx.fill();
      }
    }
    drawDark(); Visual.overlay(); Visual2.flares();
    this.drawFinisherBeam();
    for (const q of G.parts) if (q.k === 'smoke') {
      const k = clamp(q.life / q.max, 0, 1);
      ctx.globalAlpha = k * .4; ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1.6 - k * .6), 0, 7); ctx.fill();
    }
    for (const q of G.parts) if (q.k === 'debris') {
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.globalAlpha = clamp(q.life / q.max * 1.6, 0, 1);
      ctx.fillStyle = q.c; ctx.strokeStyle = q.rim || 'rgba(255,200,120,.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, k = q.r * (.7 + (i % 2) * .5); ctx.lineTo(Math.cos(a) * k, Math.sin(a) * k); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const q of G.parts) {
      if (q.k === 'smoke' || q.k === 'debris') continue;
      const k = clamp(q.life / q.max, 0, 1);
      if (q.k === 'bolt') { ctx.globalAlpha = k; ctx.strokeStyle = q.c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(q.x, q.y); const n = 5; for (let i = 1; i < n; i++) { const f = i / n; ctx.lineTo(q.x + (q.x2 - q.x) * f + rand(-12, 12), q.y + (q.y2 - q.y) * f + rand(-12, 12)); } ctx.lineTo(q.x2, q.y2); ctx.stroke(); }
      else if (q.k === 'spark') { ctx.globalAlpha = k; ctx.strokeStyle = q.c; ctx.lineWidth = q.r; ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * .04, q.y - q.vy * .04); ctx.stroke(); }
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
    Visual5.hud(); Visual3.furyDraw(); Visual4.cutinDraw(); Visual4.faceDraw(); Visual4.introDraw();
    if (G.hurtFlash > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .85);
      g.addColorStop(0, 'rgba(255,40,90,0)'); g.addColorStop(1, `rgba(255,40,90,${G.hurtFlash * 1.2})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (p && !p.dead && p.hp <= Math.max(1, p.maxHp * .25) && G.state === 'play') {
      const a = (.5 + .5 * Math.sin(World.t * 7)) * .22, g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .9);
      g.addColorStop(0, 'rgba(255,40,70,0)'); g.addColorStop(1, `rgba(255,40,70,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    Events.drawOverlay();
    if (G.flash > 0) { ctx.globalAlpha = Math.min(.7, G.flash * .35); ctx.fillStyle = '#e9e0ff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    if (!G.cut) { this.drawHud(); Extras.tutDraw(); Extras.trainDraw(); }
    this.drawCinematic();
    this.drawCut();
  },

  // feixes do Laser Prisma e do Raio Total
  drawBeams() {
    const p = G.player; if (!p || p.dead) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const lk = G.laserK = lerp(G.laserK || 0, p.beamT > 0 && p.beams ? 1 : 0, .3);
    if (lk > .02 && p.beams) for (const bx of p.beams) {
      const t = World.t, botY = p.y - 36, flick = 1 + Math.sin(t * 70 + bx) * .08;
      ctx.fillStyle = lin(bx - 36, 0, bx + 36, 0, [[0, 'rgba(80,190,255,0)'], [.5, 'rgba(80,190,255,' + .22 * lk + ')'], [1, 'rgba(80,190,255,0)']]); ctx.fillRect(bx - 36, 0, 72, botY);
      const w = 11 * lk * flick;
      ctx.fillStyle = lin(bx - w, 0, bx + w, 0, [[0, 'rgba(127,224,255,0)'], [.35, 'rgba(160,236,255,.85)'], [.5, 'rgba(255,255,255,1)'], [.65, 'rgba(160,236,255,.85)'], [1, 'rgba(127,224,255,0)']]); ctx.fillRect(bx - w, 0, w * 2, botY);
      ctx.fillStyle = 'rgba(255,255,255,' + lk + ')'; ctx.fillRect(bx - 2.2 * lk, 0, 4.4 * lk, botY);
      for (let i = 0; i < 6; i++) { // pulsos de energia subindo
        const yy = botY - ((t * 1000 + i * botY / 6) % botY), g = ctx.createLinearGradient(0, yy, 0, yy + 70);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,' + .7 * lk + ')'); ctx.fillStyle = g; ctx.fillRect(bx - w * .55, yy, w * 1.1, 70);
      }
      drawGlow(bx, botY, 56 * lk * flick, '#7fe0ff', .95); drawGlow(bx, botY, 24 * lk, '#ffffff', .95);
      ctx.save(); ctx.translate(bx, botY); ctx.rotate(t * 6); ctx.strokeStyle = 'rgba(255,255,255,' + .7 * lk + ')'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(26 * lk, 0); ctx.stroke(); } ctx.restore();
      for (const e of G.enemies) if (!e.dead && e.y < botY && Math.abs(e.x - bx) < e.rad + 12) { drawGlow(bx, e.y + e.rad * .6, 50, '#ffffff', .75 * lk); drawGlow(bx, e.y + e.rad * .6, 90, '#7fe0ff', .45 * lk); }
      const bo = G.boss; if (bo && bo.targetable()) for (let yy = botY; yy > 20; yy -= 30) if (bo.hitTest(bx, yy, 12)) { drawGlow(bx, yy, 70, '#ffffff', .8 * lk); drawGlow(bx, yy, 130, '#7fe0ff', .5 * lk); break; }
    }
    if (G.mega) {
      const m = G.mega, k = Math.min(1, m.t / .18) * Math.min(1, (m.dur - m.t) / .3), w = (82 + Math.sin(World.t * 40) * 10) * k;
      ctx.fillStyle = lin(p.x - w, 0, p.x + w, 0, [[0, 'rgba(127,224,255,0)'], [.25, 'rgba(255,122,200,.55)'], [.5, 'rgba(255,255,255,1)'], [.75, 'rgba(255,211,106,.55)'], [1, 'rgba(127,224,255,0)']]);
      ctx.fillRect(p.x - w, 0, w * 2, p.y - 20); drawGlow(p.x, p.y - 30, 170 * k, '#ffffff', .9);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // raio gigante do Olienzinho no chefe que esta morrendo
  drawFinisherBeam() {
    const b = G.boss, p = G.player;
    if (!G.finisher || !b || b.state !== 'dying' || !p || p.dead) return;
    const k = b.dyingT; if (k > 1.9) return;
    const a = k < .3 ? k / .3 : k > 1.5 ? 1 - (k - 1.5) / .4 : 1;
    const x0 = p.x, y0 = p.y - 34, x1 = b.x, y1 = b.y;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(x0, y0, 50 + a * 90, '#ffe9a8', a); drawGlow(x0, y0, 30 + a * 50, '#ffffff', a * .8);
    if (k > .25) {
      const ang = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0), w = 30 + Math.sin(k * 40) * 9;
      ctx.translate(x0, y0); ctx.rotate(ang); ctx.globalAlpha = a;
      ctx.fillStyle = lin(0, -w * 1.5, 0, w * 1.5, [[0, 'rgba(185,140,255,0)'], [.3, 'rgba(255,233,168,.7)'], [.5, '#ffffff'], [.7, 'rgba(255,233,168,.7)'], [1, 'rgba(185,140,255,0)']]);
      ctx.fillRect(0, -w * 1.5, len, w * 3);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, -w * .25, len, w * .5);
      ctx.rotate(-ang); ctx.translate(-x0, -y0);
      drawGlow(x1, y1, 140 + Math.sin(k * 30) * 20, '#ffffff', a * .8);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // cena depois do chefe: Olienzinho em destaque com a fala de impacto
  drawCut() {
    const c = G.cut; if (!c) return;
    const k = easeOut(c.t / .6), h = 70 * k, t = World.t, len = c.text.length, full = .9 + len / 38;
    ctx.globalAlpha = .5 * k; ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const a = (i - 3) * .12 + Math.sin(t * .5 + i) * .03;
      ctx.save(); ctx.translate(W / 2, -40); ctx.rotate(a); ctx.globalAlpha = k;
      ctx.fillStyle = lin(0, 0, 0, H, [[0, 'rgba(255,233,168,.26)'], [1, 'rgba(255,233,168,0)']]);
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(74, H + 60); ctx.lineTo(-74, H + 60); ctx.fill(); ctx.restore();
    }
    drawGlow(W / 2, 470, 320, '#ffb340', .55 * k); drawGlow(W / 2, 470, 200, '#b98cff', .5 * k);
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h);
    Art.ship(W / 2, 480 + Math.sin(t * 2.2) * 8, { vx: 0, t, lookx: 0, looky: -.15, blinkT: (t % 4) < .16 ? .16 - (t % 4) : 0, scale: SHIP_S * 2.4 * easeBack(c.t / .7), mood: 'happy', boost: .4 });
    // balao de fala
    const bt = clamp((c.t - .5) / .35, 0, 1);
    if (bt > 0) {
      const bw = 860, bh = 130, bx = W / 2 - bw / 2, by = 150, sc = easeBack(bt);
      ctx.save(); ctx.translate(W / 2, by + bh); ctx.scale(sc, sc); ctx.translate(-W / 2, -(by + bh));
      ctx.fillStyle = '#fff6ff'; ctx.strokeStyle = '#b98cff'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 26); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 - 26, by + bh - 2); ctx.lineTo(W / 2, by + bh + 44); ctx.lineTo(W / 2 + 26, by + bh - 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff6ff'; ctx.fillRect(W / 2 - 24, by + bh - 6, 48, 8);
      ctx.fillStyle = '#b98cff'; ctx.beginPath(); ctx.roundRect(bx + 24, by - 20, 190, 36, 18); ctx.fill();
      txt('OLIENZINHO', bx + 119, by - 2, 20, '#12041f', 'center', 900, 'middle');
      const lines = Screens.wrapLines(c.text, bw - 80, 34, 800), shown = Math.floor(Math.max(0, c.t - .9) * 38);
      Screens.typed(lines, shown, W / 2, by + 28, 44, 34, '#2a1478', 'center', 800);
      ctx.restore();
    }
    if (c.t > full + .6) { ctx.globalAlpha = .5 + .4 * Math.sin(t * 5); txt('clique ou ENTER para continuar', W / 2, H - h - 34, 16, '#cdb8ff', 'center', 700); ctx.globalAlpha = 1; }
  },

  // faixas de cinema e cartao de nome na chegada do chefe
  drawCinematic() {
    let k = 0, name = null, it = 0;
    if (G.bossPending) k = easeOut((3.2 - G.bossPendingT) / .6);
    else if (G.boss && G.boss.state === 'intro') { it = G.boss.introT || 0; k = 1 - easeOut((it - 2.4) / .6); name = G.boss.name; }
    if (k <= 0) return;
    const h = 64 * k;
    ctx.globalAlpha = 1; ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h);
    if (name && it > .4 && it < 2.8) {
      const a = clamp((it - .4) / .4, 0, 1) * clamp((2.8 - it) / .3, 0, 1), sc = .88 + .12 * easeBack((it - .4) / .5);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, H * .7); ctx.scale(sc, sc);
      const bc = G.boss.col || '#ff8a5f', ep = EPITHET[name] || '', sz = Math.min(62, 980 / (name.length * .66));
      ctx.fillStyle = bc; ctx.fillRect(-120 * a, -70, 240 * a, 3);
      txt('C H E F E', 0, -62, 20, bc, 'center', 900);
      ctx.shadowColor = bc; ctx.shadowBlur = 34; txt(name.toUpperCase(), 0, -30, sz, '#ffffff', 'center', 900); ctx.shadowBlur = 0;
      txt(ep, 0, -30 + sz + 6, 22, '#e2d4ff', 'center', 700); ctx.fillRect(-120 * a, -30 + sz + 40, 240 * a, 3); ctx.restore();
    }
  },

  drawHud() {
    const p = G.player, st = G.stage;
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const nowS = performance.now() / 1000, dtH = Math.min(.05, nowS - (G.hudT ?? nowS)); G.hudT = nowS;
    // xp (com brilho quando ganha)
    if (G.xp > G.xpPrev) G.xpFlash = 1; G.xpPrev = G.xp; G.xpFlash = Math.max(0, G.xpFlash - dtH * 3);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, 0, W, 8);
    const xw = W * clamp(G.xp / G.xpNeed, 0, 1);
    ctx.fillStyle = '#8b4dff'; ctx.fillRect(0, 0, xw, 8);
    if (G.xpFlash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = G.xpFlash * .8; ctx.fillStyle = '#e2d4ff'; ctx.fillRect(0, 0, xw, 8); drawGlow(xw, 4, 30, '#b98cff', G.xpFlash); ctx.restore(); ctx.globalAlpha = 1; }
    // esquerda: nivel e vida
    G.lvPop = Math.max(0, G.lvPop - dtH * 2.5);
    ctx.save(); ctx.translate(24, 35); ctx.scale(1 + G.lvPop * .35, 1 + G.lvPop * .35); txt('NÍVEL ' + G.level, 0, -13, 26); ctx.restore();
    if (G.hpPrev === undefined) G.hpPrev = p.hp;
    if (p.hp !== G.hpPrev) { G.hpPulse = 1; G.hpIdx = Math.min(p.hp, G.hpPrev); G.hpPrev = p.hp; }
    G.hpPulse = Math.max(0, G.hpPulse - dtH * 3);
    const low = p.hp <= Math.max(1, p.maxHp * .25);
    for (let i = 0; i < p.maxHp; i++) {
      const sc = i === G.hpIdx ? 1 + G.hpPulse * .6 : 1, cxh = 24 + i * 38 + 15;
      ctx.save(); ctx.translate(cxh, 66); ctx.scale(sc, sc * (low && i < p.hp ? 1 + Math.sin(World.t * 9) * .12 : 1));
      ctx.fillStyle = i < p.hp ? (low ? '#ff3b5f' : '#ff5f8f') : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.roundRect(-15, -6, 30, 12, 6); ctx.fill(); ctx.restore();
    }
    if (p.shieldReady) { ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(24 + p.maxHp * 38 + 10, 66, 9, 0, 7); ctx.stroke(); }
    // direita
    G.scoreShown += (G.score - G.scoreShown) * Math.min(1, 10 * dtH); if (Math.abs(G.score - G.scoreShown) < 1) G.scoreShown = G.score;
    if (G.score !== G.scorePrev) { G.scorePop = 1; G.scorePrev = G.score; } G.scorePop = Math.max(0, G.scorePop - dtH * 4);
    ctx.save(); ctx.translate(W - 24, 35); ctx.scale(1 + G.scorePop * .22, 1 + G.scorePop * .22); txt(Math.round(G.scoreShown) + ' pts', 0, -13, 26, G.scorePop > 0 ? '#ffffff' : '#e2d4ff', 'right'); ctx.restore();
    txt('★ ' + G.runCoins, W - 24, 56, 22, '#ffcf6b', 'right');
    if (G.combo >= 3) {
      if (G.combo !== G.comboLast) { G.comboLast = G.combo; G.comboAt = World.t; }
      const pop = 1 + .4 * Math.max(0, 1 - (World.t - (G.comboAt || 0)) * 5), cc = G.combo >= 50 ? '#ff7ac8' : G.combo >= 25 ? '#ffb340' : G.combo >= 10 ? '#ffe9a8' : '#e2d4ff';
      ctx.save(); ctx.translate(W - 24, 84); ctx.scale(pop, pop); ctx.shadowColor = cc; ctx.shadowBlur = G.combo >= 10 ? 14 : 0; txt('COMBO ' + G.combo, 0, 0, 22, cc, 'right'); ctx.restore();
      txt('x' + (1 + Math.min(G.combo, 60) * .03).toFixed(1) + ' pontos', W - 24, 110, 14, '#cdb8ff', 'right', 700);
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(W - 24 - 120, 130, 120, 4); ctx.fillStyle = cc; ctx.fillRect(W - 24 - 120 * clamp(G.comboT / 2.2, 0, 1), 130, 120 * clamp(G.comboT / 2.2, 0, 1), 4);
    }
    // progresso / chefe
    if (G.boss && G.boss.state !== 'intro') {
      Visual4.bossBar(G.boss);
    } else if (G.training) {
      txt('MODO TREINO', W / 2, 8, 15, '#7fe0a0', 'center', 800);
    } else if (G.endless && !G.boss) {
      const w = 420, x = W / 2 - w / 2, y = 30, k = clamp(G.waveT / 28, 0, 1);
      txt(G.bossPending ? 'CHEFE CHEGANDO!' : 'ONDA ' + G.wave + (G.wave % 5 === 0 ? '  •  CHEFE NO FIM' : ''), W / 2, 8, 15, '#e2d4ff', 'center', 800);
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.roundRect(x, y, w, 8, 4); ctx.fill();
      ctx.fillStyle = '#ffb340'; ctx.beginPath(); ctx.roundRect(x, y, Math.max(6, w * k), 8, 4); ctx.fill();
    } else if (!G.boss && !G.bossDone) {
      const w = 420, x = W / 2 - w / 2, y = 30, k = clamp(G.t / st.duration, 0, 1);
      txt(G.bossPending ? 'CHEFE CHEGANDO!' : st.name.toUpperCase(), W / 2, 8, 15, '#e2d4ff', 'center', 800);
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.roundRect(x, y, w, 8, 4); ctx.fill();
      ctx.fillStyle = st.tint; ctx.beginPath(); ctx.roundRect(x, y, Math.max(6, w * k), 8, 4); ctx.fill();
      ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.arc(x + w, y + 4, 9, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + w - 3, y + 2, 2, 0, 7); ctx.arc(x + w + 3, y + 2, 2, 0, 7); ctx.fill();
    }
    // habilidades: pulso (Espaço), esquiva (Shift) e especial da arma (Q)
    const wp = WEAPONS[p.weapon];
    [['PULSO', 'ESPAÇO', p.pulseT, p.pulseCd, '#ffb340'], ['ESQUIVA', 'SHIFT', p.dashCd, p.dashCdMax, '#7fe0ff'], [wp.specName.toUpperCase(), 'Q', p.specCd, p.specCdMax, wp.c]].forEach(([name, key, cd, mx, col], i) => {
      const cx = 56 + i * 112, cy = H - 66, rdy = cd <= 0, k = rdy ? 1 : 1 - cd / mx;
      G.abPrev = G.abPrev || []; G.abPop = G.abPop || []; if (rdy && G.abPrev[i] === false) G.abPop[i] = World.t; G.abPrev[i] = rdy;
      { const pp = G.abPop[i] !== undefined ? World.t - G.abPop[i] : 9; if (pp < .6) { ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 1 - pp / .6; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, 28 + pp * 55, 0, TAU); ctx.stroke(); ctx.restore(); } }
      ctx.fillStyle = 'rgba(20,8,50,.65)'; ctx.beginPath(); ctx.arc(cx, cy, 28, 0, 7); ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = rdy ? col : '#6a5aa8'; ctx.beginPath(); ctx.arc(cx, cy, 24, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
      if (rdy) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, cy, 42, col, .45 + Math.sin(World.t * 6 + i) * .15); ctx.restore(); ctx.globalAlpha = 1; }
      txt(key === 'ESPAÇO' ? 'ESP' : key, cx, cy, key === 'ESPAÇO' ? 15 : 18, rdy ? '#ffffff' : '#8a7fb0', 'center', 900, 'middle');
      txt(name, cx, cy + 36, 12, rdy ? '#e2d4ff' : '#8a7fb0', 'center', 800);
    });
    // tutorial
    if (Save.data.runs <= 1 && G.t < 8) { ctx.globalAlpha = Math.min(1, (8 - G.t) / 1.5); txt('Mova com WASD, setas ou mouse  •  O tiro é automático  •  ESPAÇO pulso  •  SHIFT esquiva  •  Q especial', W / 2, H - 56, 20, '#e2d4ff', 'center', 700); ctx.globalAlpha = 1; }
  },
};
