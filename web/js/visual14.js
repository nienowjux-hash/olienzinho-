'use strict';
// ---------- modos novos: segredos, aventuras, arena semanal, pratica de chefes, ponto de controle do infinito ----------
const Visual14 = {};
const noStoryOn = () => { if (Game._nsPrev === undefined) Game._nsPrev = Game.noStory; Game.noStory = true; };

// ===== chefes secretos =====
const SECRETS = [
  { id: 'gold', name: 'Nave-Mãe Dourada', stage: 0, req: 'Ache os 6 fragmentos de luz', ok: () => Extras.fragCount() >= 6, filter: 'hue-rotate(38deg) saturate(1.5) brightness(1.2)', skin: 'aurora' },
  { id: 'crystal', name: 'Gigante Cristalino', stage: 1, req: 'Termine uma fase sem tomar nenhum dano', ok: () => (Save.data.stats.perfect || 0) > 0, filter: 'hue-rotate(160deg) saturate(1.3) brightness(1.3)', skin: 'prisma' },
  { id: 'eclipse', name: 'Olho Eclipsado', stage: 2, req: 'Derrote 25 inimigos de elite', ok: () => (Save.data.stats.elites || 0) >= 25, filter: 'hue-rotate(-110deg) saturate(.6) brightness(.7) contrast(1.3)', skin: 'eclipse' },
];
SKINS.push(
  { id: 'aurora', name: 'Aurora', how: 'Derrote a Nave-Mãe Dourada', pal: { g0: '#e8ffd8', g1: '#7fe8a0', g2: '#1a8a5a', fin: '#2ab070', nozzle: '#0a5a3a', stripe: '#f4fff0', glow: '#5af0a0' }, ok: () => !!(Save.data.secrets && Save.data.secrets.gold) },
  { id: 'prisma', name: 'Prisma', how: 'Derrote o Gigante Cristalino', pal: { g0: '#ffffff', g1: '#c8e8ff', g2: '#6a8aff', fin: '#8a6aff', nozzle: '#3a3aaa', stripe: '#ffffff', glow: '#a8c8ff' }, ok: () => !!(Save.data.secrets && Save.data.secrets.crystal) },
  { id: 'eclipse', name: 'Eclipse', how: 'Derrote o Olho Eclipsado', pal: { g0: '#4a4a6a', g1: '#2a2a4a', g2: '#0a0a1a', fin: '#1a1a3a', nozzle: '#05050f', stripe: '#ffcf6b', glow: '#ffb340' }, ok: () => !!(Save.data.secrets && Save.data.secrets.eclipse) },
);
{
  const bu = Boss.prototype.update;
  Boss.prototype.update = function (dt) {
    if (G.secret && !this._sec) { this._sec = true; this.baseName = this.name; this.name = G.secret.name; this.maxHp = Math.round(this.maxHp * 1.8); this.hp = this.maxHp; }
    bu.call(this, dt);
  };
  const tk = Boss.prototype.tick; Boss.prototype.tick = function (k, dt, every) { return tk.call(this, k, dt, G.secret ? every / 1.25 : every); };
  const sc = Game.stageClear; Game.stageClear = function () { if (G.stats && G.stats.hits === 0 && !G.rush) Save.data.stats.perfect = (Save.data.stats.perfect || 0) + 1; return sc.call(this); };
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () {
    if (G.practice) { G.bossDone = true; for (const k of G.pickups) k.mag = true; G.timers.push({ t: 2.4, fn: () => { G.bonusEnd = { title: 'CHEFE DERROTADO', sub: 'Treino concluído. Nada foi salvo.', rows: [['Tempo de luta', Math.round(G.t - (G.practice.t0 || 0)) + 's'], ['Golpes sofridos', String(G.stats.hits)]], again: () => Visual14.startPractice(G.practice.idx, G.practice.ph), best: '' }; G.state = 'bonusEnd'; G.bonusAt = undefined; Snd.musicPlay('triumph', 1); } }); return; }
    if (G.secret) {
      const s = G.secret, d = Save.data; d.secrets = d.secrets || {}; const first = !d.secrets[s.id]; d.secrets[s.id] = true; G.bossDone = true; for (const k of G.pickups) k.mag = true; const reward = first ? 100 : 0; d.coins += reward; Save.save(); Ach.check();
      G.timers.push({ t: 2.4, fn: () => { G.bonusEnd = { title: 'CHEFE SECRETO DERROTADO', sub: first ? 'Skin nova desbloqueada: ' + SKINS.find(k => k.id === s.skin).name + '!' : 'Você já tinha vencido este desafio.', rows: [['Chefe', s.name], ['Golpes sofridos', String(G.stats.hits)], ['Recompensa (1ª vez)', '★ ' + reward]], again: () => Visual14.startSecret(SECRETS.indexOf(s)), best: '' }; G.state = 'bonusEnd'; G.bonusAt = undefined; Snd.play('stageClear'); Snd.musicPlay('triumph', 1); } }); return;
    }
    return bd.call(this);
  };
  const b3 = Visual3.bossDraw; Visual3.bossDraw = function (b) { b3.call(this, b); };
}
ACH.push({ id: 'secret3', name: 'Caçador de Segredos', desc: 'Derrote os 3 chefes secretos.', ok: () => SECRETS.every(s => Save.data.secrets && Save.data.secrets[s.id]) });
Visual14.startSecret = function (i) {
  noStoryOn(); const s = SECRETS[i]; Game.startStage(s.stage, { skipStory: true }); G.secret = s; G.secret.i = i; G.t = G.stage.duration - .1; G.miniDone = true; G.state = 'play'; Events.banner = null; recalcStats(G.player); G.player.hp = G.player.maxHp;
};
Screens.secrets = function () {
  txt('DESAFIOS SECRETOS', W / 2, 36, 46, '#fff', 'center'); txt('Chefes mais fortes e mais rápidos. Cada um libera uma skin.', W / 2, 100, 18, '#ffb340', 'center', 700);
  SECRETS.forEach((s, i) => {
    const x = 90 + i * 380, y = 160, w = 340, h = 380, ok = s.ok(), done = Save.data.secrets && Save.data.secrets[s.id], id = 'sc' + i, f = UI.focus(id), k = Screens.enterK(i, .5);
    if (UI.hit(id, x, y, w, h, { disabled: !ok })) { Visual14.startSecret(i); return; }
    ctx.save(); ctx.globalAlpha = clamp(k, 0, 1) * (ok ? 1 : .6); ctx.translate(0, (1 - clamp(k, 0, 1)) * 60 - (f && ok ? 8 : 0));
    UI.panel(x, y, w, h, { r: 24, fill: f && ok ? 'rgba(50,28,120,.85)' : 'rgba(20,8,55,.75)', stroke: done ? '#7fe0a0' : f && ok ? '#ffb340' : 'rgba(190,160,255,.3)' });
    ctx.save(); ctx.translate(x + w / 2, y + 100); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 90, ok ? '#ffd36a' : '#5a4a80', .5); ctx.globalCompositeOperation = 'source-over';
    if (!ok) { Screens.lock(0, 0, 1.4); } else { ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.stroke(); ctx.fillStyle = '#ffd36a'; ctx.beginPath(); for (let q = 0; q < 10; q++) { const r = q % 2 ? 12 : 26, a = q * TAU / 10 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
    ctx.restore(); txt(ok ? s.name : '???', x + w / 2, y + 170, 26, '#fff', 'center'); UI.wrap(ok ? 'Versão dourada e mais furiosa do chefe do setor ' + (s.stage + 1) + '.' : 'Condição: ' + s.req, x + w / 2, y + 220, w - 50, 24, 17, ok ? '#cdb8ff' : '#ffcf6b', 'center');
    txt(done ? 'DERROTADO ✓' : ok ? 'ENFRENTAR' : '🔒', x + w / 2, y + h - 52, 20, done ? '#7fe0a0' : ok ? '#ffb340' : '#8a7fb0', 'center', 900); ctx.restore();
  });
  if (UI.button('back', W / 2 - 160, 590, 320, 54, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};

// ===== aventuras dos viajantes =====
const ADVS = [
  { id: 'resgate', name: 'O Resgate do Filhote', who: 'Zanguinho', c: '#ffb340', stage: 0, dur: 55, goal: 8, unit: 'filhotes resgatados', reward: 80,
    intro: [{ music: 'tension' }, { who: 'Z', mood: 'sad', text: 'Bzzz! Meus amiguinhos se perderam no enxame! Você me ajuda a encontrar todos?' }, { who: 'O', mood: 'determined', text: 'Claro! Vou pegar cada um deles.' }], out: [{ who: 'Z', mood: 'happy', text: 'Eles estão todos aqui! Obrigado, obrigado, obrigado!' }] },
  { id: 'minerio', name: 'O Tesouro do Mineiro', who: 'Mineiro Teo', c: '#ffcf6b', stage: 1, dur: 50, goal: 14, unit: 'minérios quebrados', reward: 100,
    intro: [{ music: 'mystery' }, { who: 'Z', mood: 'happy', text: 'Hoje o cinturão está cheio de minério dourado! Quebre o máximo que puder, foguetinho!' }, { who: 'O', mood: 'happy', text: 'Pode deixar, Teo!' }], out: [{ who: 'Z', mood: 'happy', text: 'Ha! Que pontaria! Esse minério vale uma fortuna.' }] },
  { id: 'raio', name: 'A Luz do Raiozinho', who: 'Raiozinho', c: '#7fc4ff', stage: 2, dur: 50, goal: 6, unit: 'orbes recolhidos', reward: 120,
    intro: [{ music: 'tension' }, { who: 'Z', mood: 'sad', text: 'Meus raios se espalharam pela tempestade... Pega as orbes antes que eles se apaguem?' }, { who: 'O', mood: 'determined', text: 'Eu pego todas. Fica tranquilo.' }], out: [{ who: 'Z', mood: 'happy', text: 'Minha luz está inteira de novo. Valeu, Olienzinho!' }] },
];
Visual14.startAdv = function (i) {
  const a = ADVS[i]; CHARS.Z.name = a.who.toUpperCase(); CHARS.Z.c = a.c; G.encNow = { c: a.c };
  Game.startStory(a.intro, () => Visual14.advBegin(i), { music: null });
};
Visual14.advBegin = function (i) {
  const a = ADVS[i]; noStoryOn(); Game.startStage(a.stage, { skipStory: true }); G.adv = { i, t: 0, got: 0, n: 0 }; G.stage = { ...STAGES[a.stage], name: a.name, duration: a.dur, events: [] }; Events.reset(null);
  G.state = 'play'; G.player.maxHp += 1; G.player.hp = G.player.maxHp; Events.banner = { t: 0, title: a.name.toUpperCase(), sub: 'META: ' + a.goal + ' ' + a.unit.toUpperCase(), c: a.c }; Snd.musicPlay(G.stage.music, 1);
};
Visual14.advGet = function () { const A = G.adv; if (!A) return; A.got++; Snd.play('levelUp'); popup(G.player.x, G.player.y - 60, A.got + ' / ' + ADVS[A.i].goal, ADVS[A.i].c, 26); };
Visual14.advDir = function (dt) {
  const A = G.adv, a = ADVS[A.i]; A.t += dt; G.t = A.t;
  A.ambient = (A.ambient ?? 1.5) - dt; if (A.ambient <= 0 && A.i !== 1) { A.ambient = a.id === 'raio' ? 1.3 : 1.1; Game.spawnWave({ drone: 3, zig: 2, shooter: a.id === 'raio' ? 0 : 1 }); }
  A.spawn = (A.spawn ?? 1) - dt;
  if (A.spawn <= 0) {
    if (a.id === 'resgate') { A.spawn = 55 / (a.goal + 3); dropPickup('kid', rand(120, W - 120), -30, 1); const k = G.pickups[G.pickups.length - 1]; k.vx = rand(-30, 30); k.vy = 70; }
    else if (a.id === 'minerio') { A.spawn = .8; const r = rand(20, 30), pts = Array.from({ length: 9 }, (_, i) => { const q = i / 9 * TAU, kk = rand(.75, 1.1); return [Math.cos(q) * r * kk, Math.sin(q) * r * kk]; }); spawnEnemy('rock', rand(60, W - 60), -40, { ore: true, rad: r + 4, vx: rand(-60, 60), vy: rand(110, 170), rot: 0, vr: rand(-2, 2), pts, hp: 3, noElite: true }); if (Math.random() < .35) Events.spawnMeteor(); }
    else { A.spawn = 55 / (a.goal + 2); dropPickup('orb2', rand(120, W - 120), -30, 1); const k = G.pickups[G.pickups.length - 1]; k.vx = rand(-30, 30); k.vy = 80; if (Math.random() < .8) Events.hazardRect(rand(100, W - 100), H / 2, 90, H, 1, .3, '#7fc4ff', 'bolt'); }
  }
  if (A.got >= a.goal || A.t >= a.dur) {
    const ok = A.got >= a.goal, d = Save.data; d.adv = d.adv || {}; const first = ok && !d.adv[a.id]; if (ok) d.adv[a.id] = true; const reward = first ? a.reward : 0; d.coins += reward; Save.save(); Ach.check();
    const pages = ok ? a.out : [{ who: 'Z', mood: 'sad', text: 'Quase! Mas eu sei que da próxima vez você consegue.' }];
    G.adv = null; G.eb.forEach(b => { b.dead = true; });
    Game.startStory(pages, () => { G.bonusEnd = { title: ok ? 'AVENTURA COMPLETA!' : 'QUASE LÁ!', sub: a.name, rows: [[a.unit.charAt(0).toUpperCase() + a.unit.slice(1), A.got + ' / ' + a.goal], ['Recompensa (1ª vez)', '★ ' + reward]], again: () => Visual14.startAdv(A.i), best: '' }; G.state = 'bonusEnd'; G.bonusAt = undefined; Snd.play('stageClear'); }, { music: 'hope' });
  }
};
{
  const gd = Game.director; Game.director = function (dt) { if (G.adv) { Visual14.advDir(dt); return; } return gd.call(this, dt); };
  const up = updatePickup; updatePickup = function (k, dt) { const was = k.dead; up(k, dt); if (!was && k.dead && (k.type === 'kid' || k.type === 'orb2')) { const p = G.player; if (Math.hypot(p.x - k.x, p.y - k.y) < 50 || (G.p2 && Math.hypot(G.p2.x - k.x, G.p2.y - k.y) < 50)) Visual14.advGet(); } };
  const ke = killEnemy; killEnemy = function (e, by) { const w = e.counted; ke(e, by); if (!w && e.counted && by && e.ore) Visual14.advGet(); };
  const ap = Art.pickup;
  Art.pickup = function (k) {
    if (k.type === 'kid') { const t = World.t + k.age; ctx.save(); ctx.translate(k.x, k.y + Math.sin(t * 5) * 3); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 40, '#ffb340', .7); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ffb340'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-5, -3, 4.5, 0, TAU); ctx.arc(5, -3, 4.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#3a2008'; ctx.beginPath(); ctx.arc(-5, -3, 2, 0, TAU); ctx.arc(5, -3, 2, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 14, -8, 8, 4 + Math.sin(t * 30) * 2, s * .5, 0, TAU); ctx.fill(); } ctx.restore(); return; }
    if (k.type === 'orb2') { const t = World.t + k.age; ctx.save(); ctx.translate(k.x, k.y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 44, '#7fc4ff', .8); drawGlow(0, 0, 18, '#ffffff', .9); ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 12 + Math.sin(t * 6) * 2, 0, TAU); ctx.stroke(); ctx.restore(); return; }
    return ap.call(this, k);
  };
  const ae = Art.enemy; Art.enemy = function (e) { ae.call(this, e); if (e.ore) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(e.x, e.y, e.rad * 2.2, '#ffd36a', .55); ctx.restore(); } };
}

// ===== arena semanal =====
const WEEK_RULES = [
  { name: 'SÓ O LEQUE', desc: 'Todos jogam com o Leque Solar.' }, { name: 'RECUPERAÇÃO', desc: 'Só 3 de vida, mas ela volta sozinha de tempos em tempos.' },
  { name: 'ELITES SEMPRE', desc: 'Metade dos inimigos é de elite.' }, { name: 'CHUVA DE CÁPSULAS', desc: 'Cápsulas caem o tempo todo.' }, { name: 'VIDRO FATAL', desc: '1 de vida, mas +80% de dano.' },
];
Visual14.weekKey = () => { const d = new Date(), j = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + 'w' + Math.ceil(((d - j) / 86400000 + j.getDay() + 1) / 7); };
Visual14.weekRule = () => Extras.seedOf('w' + Visual14.weekKey()) % WEEK_RULES.length;
Visual14.startWeekly = function () {
  Game.startEndless(); G.weekly = true; G.wrule = Visual14.weekRule(); const p = G.player;
  if (G.wrule === 0) p.weapon = 'fan'; recalcStats(p); p.hp = p.maxHp; Events.banner = { t: 0, title: 'ARENA SEMANAL', sub: WEEK_RULES[G.wrule].name, c: '#7fe0ff' };
};
Visual14.weeklyBest = () => { const w = Save.data.weekly; return w && w.key === Visual14.weekKey() ? w.best : 0; };
{
  const er = Game.endRunSave;
  Game.endRunSave = function (b, c) {
    if (G.practice || G.secret || G.adv) { return; }
    if (G.weekly) { const d = Save.data, k = Visual14.weekKey(); d.weekly = { key: k, best: Math.max(d.weekly && d.weekly.key === k ? d.weekly.best : 0, G.score), wave: Math.max(d.weekly && d.weekly.key === k ? d.weekly.wave || 0 : 0, G.wave) }; d.coins += G.runCoins; d.bestWave = Math.max(d.bestWave || 0, G.wave); Save.save(); G.rankPos = 0; return; }
    return er.call(this, b, c);
  };
  const ss = Visual8.styleStats; Visual8.styleStats = function (p) { ss.call(this, p); if (G.weekly && !p.isP2) { if (G.wrule === 1) p.maxHp = 3; if (G.wrule === 4) { p.maxHp = 1; p.dmg *= 1.8; } } };
  const vu = Visual8.update; Visual8.update = function (dt) { vu.call(this, dt); const p = G.player; if (G.weekly && G.wrule === 1 && p && !p.dead && G.state === 'play') { p.regT = (p.regT ?? 22) - dt; if (p.regT <= 0) { p.regT = 22; if (p.hp < p.maxHp) { p.hp++; popup(p.x, p.y - 50, '+1', '#7fe0a0', 24); } } } };
}

// ===== pratica de chefes =====
const PBOSS = [['Nave-Mãe Zangão', 0], ['Gigante de Rocha', 1], ['Olho da Tempestade', 2], ['Sol-Guardião', 3], ['Eco do Olienzinho', 4], ['O Vazio', 5], ['Arauto Luminoso', 6], ['Leviatã Estelar', 7], ['Reflexo do Vazio', 8]];
Visual14.startPractice = function (idx, ph) {
  noStoryOn(); Game.startStage(idx, { skipStory: true }); G.practice = { idx, ph, t0: 0 }; G.t = G.stage.duration - .1; G.miniDone = true; G.state = 'play'; Events.banner = null; G.player.maxHp += 3; G.player.hp = G.player.maxHp;
};
Screens.practice = function () {
  txt('PRÁTICA DE CHEFES', W / 2, 30, 44, '#fff', 'center'); txt('Escolha o chefe e em qual fase de fúria começar. Nada é salvo.', W / 2, 88, 17, '#ffb340', 'center', 700);
  PBOSS.forEach(([name, idx], i) => {
    const y = 118 + i * 47, seen = !!(Save.data.codex && Save.data.codex['boss:' + name]), k = Screens.enterK(i * .6, .4);
    ctx.save(); ctx.globalAlpha = clamp(k, 0, 1); UI.panel(160, y, 960, 42, { r: 14, fill: 'rgba(20,8,55,.7)' }); txt(seen ? name : '???', 186, y + 8, 22, seen ? '#fff' : '#5a4a80', 'left', 800); txt('Setor ' + (idx + 1), 520, y + 13, 14, '#8a7fb0', 'left', 700);
    ['FASE 1', 'FÚRIA 1', 'FÚRIA 2'].forEach((n, ph) => { if (UI.button('pr' + i + ph, 660 + ph * 150, y + 3, 140, 36, n, { size: 14, disabled: !seen })) Visual14.startPractice(idx, ph); }); ctx.restore();
  });
  if (UI.button('back', W / 2 - 160, 604, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};
{
  const vu = Visual8.update; Visual8.update = function (dt) {
    vu.call(this, dt); const b = G.boss;
    if (G.practice && b && b.state === 'fight' && !G.practice.set) { G.practice.set = true; G.practice.t0 = G.t; const ph = G.practice.ph; b.phase = ph; b.hp = b.maxHp * [1, .62, .3][ph]; if (ph >= 1) { b.stun = 0; } }
  };
}

// ===== ponto de controle do modo infinito =====
{
  const nw = Game.nextWave;
  Game.nextWave = function () {
    nw.call(this);
    if (G.endless && !G.daily && !G.weekly && G.wave % 5 === 1 && G.wave > 5) { Save.data.endlessCp = { wave: G.wave, score: G.score, up: Object.assign({}, G.upCounts), level: G.level, relic: G.relic }; Save.save(); popup(W / 2, 260, 'PONTO DE CONTROLE SALVO', '#7fe0a0', 30); }
  };
}
Visual14.resumeEndless = function () {
  const cp = Save.data.endlessCp; if (!cp) return; Save.data.endlessCp = null; Save.save();
  Game._skipRelic = true; Game.startEndless(); Game._skipRelic = false; G.state = 'play';
  G.wave = cp.wave; G.waveT = 0; G.score = cp.score; G.upCounts = cp.up; G.level = cp.level; G.relic = cp.relic; const b = Math.floor((cp.wave - 1) / 5) % STAGES.length; if (b !== G.biome) Game.setBiome(b);
  recalcStats(G.player); G.player.hp = G.player.maxHp; Events.banner = { t: 0, title: 'ONDA ' + cp.wave, sub: 'DE VOLTA AO PONTO DE CONTROLE', c: '#7fe0a0' };
};

// ===== tela de modos em grade =====
Screens.modes = function () {
  const day = Extras.todayMod(), cp = Save.data.endlessCp, wr = WEEK_RULES[Visual14.weekRule()];
  txt('MODOS EXTRAS', W / 2, 24, 44, '#fff', 'center');
  const cards0 = [
    { id: 'inf', name: 'INFINITO', c: '#ffb340', l: 'Ondas sem fim e um chefe a cada 5.', foot: 'Melhor onda: ' + (Save.data.bestWave || 0), go: () => Game.startEndless() },
    cp ? { id: 'cp', name: 'CONTINUAR INFINITO', c: '#7fe0a0', l: 'Volte ao ponto de controle salvo (uma vez).', foot: 'Onda ' + cp.wave + ' • ' + cp.score + ' pts', go: () => Visual14.resumeEndless() } : null,
    { id: 'day', name: 'DESAFIO DO DIA', c: '#7fe0ff', l: day.name + ': ' + day.desc, foot: 'Seu melhor: ' + Extras.dailyBest(), go: () => Game.startDaily() },
    { id: 'week', name: 'ARENA SEMANAL', c: '#9fe8ff', l: wr.name + ': ' + wr.desc, foot: 'Melhor da semana: ' + Visual14.weeklyBest(), go: () => Visual14.startWeekly() },
    { id: 'rush', name: 'CHEFES EM SEQUÊNCIA', c: '#ff8a5f', l: 'Os 6 primeiros chefes seguidos.', foot: Save.data.rush && Save.data.rush.best ? 'Melhor: ' + Math.floor(Save.data.rush.best / 60) + ':' + String(Math.floor(Save.data.rush.best % 60)).padStart(2, '0') : 'Ainda não zerado', go: () => Visual5.startRush() },
    { id: 'sec', name: 'DESAFIOS SECRETOS', c: '#ffd36a', l: 'Chefes dourados que só aparecem com condições.', foot: (Save.data.secrets ? Object.keys(Save.data.secrets).length : 0) + ' / 3 vencidos', go: () => { G.state = 'secrets'; } },
    { id: 'adv', name: 'AVENTURAS', c: '#ffcf6b', l: 'Pequenas missões dos viajantes que você conheceu.', foot: (Save.data.adv ? Object.keys(Save.data.adv).length : 0) + ' / 3 concluídas', go: () => { G.state = 'adventures'; } },
    { id: 'prc', name: 'PRÁTICA DE CHEFES', c: '#c04aff', l: 'Treine qualquer chefe já visto, em qualquer fúria.', foot: 'Nada é salvo', go: () => { G.state = 'practice'; } },
    Save.data.won4 ? { id: 'epi', name: 'EPÍLOGO', c: '#c8a0ff', l: 'Enfrente o seu reflexo: ele ataca conforme a sua arma.', foot: Save.data.epiDone ? 'Concluído ✓' : 'Recompensa: ★ 300', go: () => Visual16.startEpi() } : null,
    { id: 'orb', name: 'ORBI', c: '#7fe0ff', l: 'Melhore as habilidades do Orbi com estrelas.', foot: 'Nível ' + ['shot', 'grav', 'shield'].reduce((n, k) => n + Visual16.orbiLv(k), 0) + ' / 13', go: () => { G.state = 'orbi'; } },
    { id: 'rec', name: 'RECORDES', c: '#ffd36a', l: 'Sua melhor pontuação em cada fase e o piloto usado.', foot: Object.keys(Save.data.rec || {}).length + ' / ' + STAGES.length + ' fases', go: () => { G.state = 'records'; } },
    Save.data.cleared[9] ? { id: 'tour', name: 'TORNEIO FINAL', c: '#ff8a5f', l: 'Os chefes das fases 7 a 10 em sequência, em ordem aleatória.', foot: Save.data.tour && Save.data.tour.best ? 'Melhor: ' + Math.floor(Save.data.tour.best / 60) + ':' + String(Math.floor(Save.data.tour.best % 60)).padStart(2, '0') : 'Recompensa: ★ 150', go: () => Visual5.startRush([6, 7, 8].sort(() => Math.random() - .5).concat([9])) } : null,
    Save.data.cleared[9] ? { id: 'pil', name: 'PILOTOS', c: '#ffb340', l: 'Evolua cada guardião com estrelas.', foot: 'Colmeia, Pétreo, Vigia, Solaris', go: () => { G.state = 'pilots'; } } : null,
    { id: 'gal', name: 'GALERIA', c: '#c8a0ff', l: 'Reveja os vídeos da história.', foot: Object.keys(Save.data.vseen || {}).length + ' / 7 vistos', go: () => { G.state = 'gallery'; } },
    { id: 'tr', name: 'TREINO', c: '#7fe0a0', l: 'Arena livre: armas, skins e inimigos.', foot: 'sem pressão :)', go: () => Game.startTraining() },
  ].filter(Boolean);
  const MP = Math.ceil(cards0.length / 12); G.mpage = Math.min(G.mpage || 0, MP - 1); const cards = cards0.slice(G.mpage * 12, G.mpage * 12 + 12);
  const cw = 198, gap = 10, per = 6;
  cards.forEach((cd, i) => {
    const col = i % per, row = (i / per) | 0, n = row === 0 ? Math.min(per, cards.length) : cards.length - per, x0 = W / 2 - (cw * Math.max(n, 1) + gap * (Math.max(n, 1) - 1)) / 2, x = x0 + col * (cw + gap), y = 90 + row * 250, h = 232, id = 'm_' + cd.id, f = UI.focus(id);
    if (UI.hit(id, x, y, cw, h)) { cd.go(); return; }
    const ek = Screens.enterK(i, .5); ctx.save(); ctx.translate(0, (1 - ek) * 60 - (f ? 8 : 0)); ctx.globalAlpha = clamp(ek, 0, 1);
    ctx.save(); if (f) { ctx.shadowColor = cd.c; ctx.shadowBlur = 28; } UI.panel(x, y, cw, h, { fill: f ? 'rgba(50,28,120,.85)' : 'rgba(20,8,55,.75)', stroke: f ? cd.c : 'rgba(190,160,255,.3)', r: 20 }); ctx.restore();
    ctx.save(); ctx.translate(x + cw / 2, y + 54); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 54, cd.c, .5 + (f ? .2 : 0)); ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = cd.c; ctx.fillStyle = cd.c; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); if (cd.id === 'inf') { for (let a = 0; a <= TAU + .1; a += .1) { const px = Math.cos(a) * 28, py = Math.sin(2 * a) * 13; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
    else if (cd.id === 'sec' || cd.id === 'adv') { for (let q = 0; q < 10; q++) { const r = q % 2 ? 9 : 22, a = q * TAU / 10 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
    else if (cd.id === 'rush') { for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(-18 + k * 18, 0, 9, 0, TAU); ctx.stroke(); } }
    else { ctx.arc(0, 0, 22, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, TAU); ctx.fill(); }
    ctx.restore(); UI.wrap(cd.name, x + cw / 2, y + 100, cw - 24, 22, 17, '#fff', 'center'); UI.wrap(cd.l, x + cw / 2, y + 148, cw - 28, 18, 13, '#cdb8ff', 'center'); UI.wrap(cd.foot, x + cw / 2, y + h - 36, cw - 20, 16, 12, cd.c, 'center'); ctx.restore();
  });
  if (MP > 1) { txt('PÁGINA ' + (G.mpage + 1) + '/' + MP, W - 130, 566, 15, '#cdb8ff', 'center', 800); if (UI.button('mpL', W - 210, 586, 70, 40, '◀', { size: 18 })) G.mpage = (G.mpage + MP - 1) % MP; if (UI.button('mpR', W - 130, 586, 70, 40, '▶', { size: 18 })) G.mpage = (G.mpage + 1) % MP; }
  if (UI.button('back', W / 2 - 160, 600, 320, 48, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goTitle(); }
  Screens.thinFrame();
};
Screens.adventures = function () {
  txt('AVENTURAS', W / 2, 36, 46, '#fff', 'center'); txt('Missões curtas com os viajantes que você encontrou no caminho.', W / 2, 100, 18, '#ffb340', 'center', 700);
  ADVS.forEach((a, i) => {
    const x = 90 + i * 380, y = 160, w = 340, h = 380, id = 'ad' + i, f = UI.focus(id), done = Save.data.adv && Save.data.adv[a.id], k = Screens.enterK(i, .5);
    if (UI.hit(id, x, y, w, h)) { Visual14.startAdv(i); return; }
    ctx.save(); ctx.globalAlpha = clamp(k, 0, 1); ctx.translate(0, (1 - clamp(k, 0, 1)) * 60 - (f ? 8 : 0)); UI.panel(x, y, w, h, { r: 24, fill: f ? 'rgba(50,28,120,.85)' : 'rgba(20,8,55,.75)', stroke: done ? '#7fe0a0' : f ? a.c : 'rgba(190,160,255,.3)' });
    ctx.save(); ctx.translate(x + w / 2, y + 90); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 90, a.c, .5); ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(-8, -10, 2, 0, 0, 34); g.addColorStop(0, '#fff'); g.addColorStop(1, a.c); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a1050'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 11, -4, 5, 0, TAU); ctx.fill(); } ctx.strokeStyle = '#2a1050'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 8, 11, .2, Math.PI - .2); ctx.stroke(); ctx.restore();
    txt(a.name, x + w / 2, y + 160, 24, '#fff', 'center'); txt('com ' + a.who, x + w / 2, y + 196, 17, a.c, 'center', 800); UI.wrap('Meta: ' + a.goal + ' ' + a.unit + ' em ' + a.dur + ' segundos.', x + w / 2, y + 240, w - 50, 24, 17, '#cdb8ff', 'center');
    txt(done ? 'CONCLUÍDA ✓' : 'JOGAR', x + w / 2, y + h - 52, 20, done ? '#7fe0a0' : '#ffb340', 'center', 900); ctx.restore();
  });
  if (UI.button('back', W / 2 - 160, 590, 320, 54, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};
{ const bd2 = BEST; BEST.push(['boss:Nave-Mãe Dourada', 'Nave-Mãe Dourada', 'Versão dourada, mais rápida e mais furiosa. Chefe secreto.', 'Igual à Nave-Mãe, só que mais rápida.'], ['boss:Gigante Cristalino', 'Gigante Cristalino', 'Montanha de vidro que não perdoa. Chefe secreto.', 'As pedras ainda funcionam contra ele.'], ['boss:Olho Eclipsado', 'Olho Eclipsado', 'O Vigia mergulhado no escuro. Chefe secreto.', 'Use os para-raios e fuja dos lasers.']); }
