'use strict';
// ---------- modo Expedicao: rota estilo roguelite, sem checkpoints (morreu, acabou) ----------
const Visual32 = { run: null };
const XN = {
  battle: { n: 'BATALHA', c: '#7fb0ff', i: '⚔' }, elite: { n: 'ELITE', c: '#ff8a5f', i: '☠' }, shop: { n: 'LOJA', c: '#ffd36a', i: '★' },
  event: { n: 'EVENTO', c: '#c8a0ff', i: '?' }, boss: { n: 'CHEFE', c: '#ff4a6e', i: '♛' },
};
const XPLAN = [['battle', 'battle'], ['battle', 'event'], ['elite', 'shop'], ['boss'], ['battle', 'elite'], ['event', 'shop'], ['battle', 'elite'], ['boss']];
const XEV = [
  { t: 'Sinal de socorro', d: 'Uma nave pede ajuda no meio do caminho.', a: ['Ajudar (-1 de vida, +1 melhoria)', r => { r.hp = Math.max(1, (r.hp ?? 6 + r.hpB) - 1); Visual32.giveUp(); return 'A tripulação agradeceu e deixou um presente.'; }], b: ['Seguir viagem', () => 'Você segue em frente.'] },
  { t: 'Fonte de luz', d: 'Uma fonte de luz pura brilha entre as estrelas.', a: ['Beber (cura total)', r => { r.hp = 99; return 'Você se sente renovado.'; }], b: ['Colher (+45 de ouro)', r => { r.gold += 45; return 'Você guardou a luz para vender.'; }] },
  { t: 'Altar sombrio', d: 'Um altar oferece poder em troca de vida.', a: ['Oferecer (-1 vida máxima, +2 melhorias)', r => { r.hpB -= 1; r.hp = Math.min(r.hp, 99); Visual32.giveUp(); Visual32.giveUp(); return 'O altar brilhou. Você está mais forte e mais frágil.'; }], b: ['Recusar', () => 'O altar se apaga.'] },
  { t: 'Mercador perdido', d: 'Um mercador oferece uma troca.', a: ['Trocar 30 de ouro por +1 vida máxima', r => { if (r.gold < 30) return 'Você não tem ouro suficiente.'; r.gold -= 30; r.hpB += 1; return 'Negócio fechado!'; }], b: ['Recusar', () => 'Você se despede.'] },
];
Visual32.giveUp = function () {
  const r = Visual32.run; const av = RUN_UPGRADES.filter(u => !['heal', 'hp'].includes(u.id) && (r.up[u.id] || 0) < u.max && (!u.cond)); if (!av.length) return null;
  const u = pick(av); r.up[u.id] = (r.up[u.id] || 0) + 1; r.log.push(u.name); return u;
};
Visual32.plan = function () { return XPLAN.map((opts, i) => opts.map(t => ({ type: t, stage: t === 'boss' ? (i === 3 ? 3 : pick([6, 7, 8, 9])) : Math.min(9, i + (t === 'elite' ? 1 : 0)) }))); };
Visual32.start = function () {
  if (Game._nsPrev === undefined) Game._nsPrev = Game.noStory; Game.noStory = true;
  Visual32.run = { i: 0, hp: null, up: {}, score: 0, gold: 30, hpB: 0, relic: null, cleared: 0, plan: Visual32.plan(), log: [], t0: performance.now(), relOpts: RELICS.slice().sort(() => Math.random() - .5).slice(0, 3), msg: '' };
  const d = Save.data; d.exp = d.exp || { runs: 0, best: 0, wins: 0 }; d.exp.runs++; Save.save(); G.state = 'expmap';
};
Visual32.enter = function (node) {
  const r = Visual32.run; r.cur = node;
  if (node.type === 'shop') { r.shop = Visual32.mkShop(); G.state = 'expshop'; return; }
  if (node.type === 'event') { r.ev = pick(XEV); r.evDone = ''; G.state = 'expevent'; return; }
  Game.startStage(node.stage, { skipStory: true }); G.exp = r; G.score = r.score; G.upCounts = r.up; G.relic = r.relic;
  if (r.relic) Visual5.applyRelic(r.relic); recalcStats(G.player); G.player.hp = Math.min(G.player.maxHp, r.hp ?? G.player.maxHp);
  const dur = G.stage.duration; G.miniDone = true;
  if (node.type === 'battle') G.t = dur * .25; else if (node.type === 'elite') { G.t = dur * .42; G.miniDone = false; } else { G.t = dur - .1; }
  Events.banner = { t: 0, title: XN[node.type].n, sub: 'Etapa ' + (r.i + 1) + ' de ' + XPLAN.length, c: XN[node.type].c }; G.state = 'play';
};
Visual32.mkShop = function () {
  const r = Visual32.run, pool = [
    { n: 'Reparo', d: 'Cura 3 de vida.', p: 25, f: () => { r.hp = (r.hp ?? 6 + r.hpB) + 3; } },
    { n: 'Casco Reforçado', d: '+1 de vida máxima.', p: 60, f: () => { r.hpB++; } },
    { n: 'Melhoria', d: 'Uma melhoria aleatória.', p: 40, f: () => { Visual32.giveUp(); } },
    { n: 'Melhoria Dupla', d: 'Duas melhorias aleatórias.', p: 70, f: () => { Visual32.giveUp(); Visual32.giveUp(); } },
    { n: 'Relíquia', d: 'Troca a sua relíquia por outra.', p: 85, f: () => { const o = RELICS.filter(x => x.id !== r.relic); r.relic = pick(o).id; } },
  ];
  return pool.sort(() => Math.random() - .5).slice(0, 4).map(x => ({ ...x, sold: false }));
};
Visual32.nodeDone = function (boss) {
  const r = Visual32.run, p = G.player; r.score = G.score; r.hp = Math.min(p.maxHp, p.hp + (boss ? 2 : 1)); r.up = G.upCounts; r.cleared++; r.i++;
  r.gold += boss ? 60 : r.cur.type === 'elite' ? 45 : 25; Snd.play('stinger'); popup(W / 2, 240, 'ETAPA CONCLUÍDA!', '#7fe0a0', 34);
  if (r.i >= XPLAN.length) G.timers.push({ t: 2.2, fn: () => Visual32.finish(true) }); else if (boss) G.timers.push({ t: 2.6, fn: () => { G.state = 'expmap'; } }); else G.state = 'expmap';
};
Visual32.finish = function (win) {
  const r = Visual32.run; if (!r || r.done) return; r.done = true; r.win = !!win; const d = Save.data; d.exp = d.exp || { runs: 0, best: 0, wins: 0 };
  r.stars = r.cleared * 20 + (win ? 250 : 0) + Math.floor(r.score / 4000); d.coins += r.stars; d.exp.best = Math.max(d.exp.best, r.cleared); if (win) d.exp.wins++; Save.save(); Ach.check(); G.state = 'expend';
};
{
  const rs = recalcStats; recalcStats = function (p) { rs(p); if (G.exp && p === G.player) p.maxHp = Math.max(1, p.maxHp + G.exp.hpB); };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    if (G.exp && G.state === 'play' && G.player && !G.player.dead && G.stage && G.exp.cur && G.exp.cur.type !== 'boss') {
      const dur = G.stage.duration, el = G.exp.cur.type === 'elite'; if (G.t >= dur * (el ? .78 : .62) && (!el || !G.enemies.some(e => e.type === 'captain' && !e.dead) || G.t >= dur * .84)) { Visual32.nodeDone(false); return; }
    }
    return up.call(this, dt);
  };
  const bd = Game.bossDefeated; Game.bossDefeated = function () { if (!G.exp) return bd.call(this); G.bossDone = true; G.player.mood = 'happy'; G.player.moodT = 3; for (const k of G.pickups) k.mag = true; flashScreen(.5); Visual32.nodeDone(true); };
  const go = Game.gameOver; Game.gameOver = function () { if (!G.exp) return go.call(this); this.endRunSave(0, false); Visual32.finish(false); };
  const gt = Game.goTitle; Game.goTitle = function () { G.exp = null; Visual32.run = null; return gt.call(this); };
}

// ---------- telas ----------
const xHeader = r => {
  const hp = r.hp ?? 99; txt('EXPEDIÇÃO', 40, 22, 38, '#fff', 'left'); txt('★ ' + r.gold + ' de ouro   •   Etapas: ' + r.cleared + ' / ' + XPLAN.length, 40, 70, 18, '#ffd36a', 'left', 800);
  txt(r.relic ? 'Relíquia: ' + RELICS.find(x => x.id === r.relic).name : 'Sem relíquia', W - 40, 30, 18, '#c8a0ff', 'right', 800); txt('Melhorias: ' + Object.values(r.up).reduce((a, b) => a + b, 0) + (r.hpB ? '   Vida extra: ' + (r.hpB > 0 ? '+' : '') + r.hpB : ''), W - 40, 60, 16, '#8a7fb0', 'right', 800);
};
Screens.expmap = function () {
  const r = Visual32.run; if (!r) { G.state = 'modes'; return; }
  xHeader(r);
  if (!r.relic && r.i === 0 && !r.picked) {
    txt('ESCOLHA UMA RELÍQUIA PARA A EXPEDIÇÃO', W / 2, 150, 28, '#fff', 'center'); txt('Se perder todas as vidas, a expedição termina.', W / 2, 192, 17, '#ffb340', 'center', 800);
    r.relOpts.forEach((o, i) => { const x = 110 + i * 370; UI.panel(x, 250, 340, 220, { r: 22 }); txt(o.name, x + 170, 272, 24, '#ffe9a8', 'center', 300); txt(o.desc, x + 170, 322, 16, '#cdb8ff', 'center', 290); if (UI.button('xr' + i, x + 50, 400, 240, 46, 'ESCOLHER', { size: 18, color: '#9a63ff' })) { r.relic = o.id; r.picked = true; Snd.play('levelUp'); } });
    if (UI.button('back', W / 2 - 150, 620, 300, 46, 'SAIR', { size: 20 }) || Input.pressed('escape')) { Visual32.run = null; G.state = 'modes'; }
    Screens.thinFrame(); return;
  }
  const hpMax = 6 + r.hpB; txt('Vida: ' + '♥'.repeat(Math.max(0, Math.min(r.hp ?? hpMax, 12))), 40, 98, 20, '#ff6a8a', 'left', 800);
  const x0 = 100, dx = 150; ctx.save(); ctx.strokeStyle = 'rgba(190,160,255,.25)'; ctx.lineWidth = 3;
  r.plan.forEach((opts, i) => opts.forEach((o, j) => { const y = opts.length === 1 ? 360 : 290 + j * 140; o.x = x0 + i * dx; o.y = y; if (i > 0) r.plan[i - 1].forEach(q => { ctx.beginPath(); ctx.moveTo(q.x + 34, q.y); ctx.lineTo(o.x - 34, y); ctx.stroke(); }); })); ctx.restore();
  let pickN = null;
  r.plan.forEach((opts, i) => opts.forEach((o, j) => {
    const N = XN[o.type], cur = i === r.i, done = i < r.i; if (cur && UI.hit('xn' + i + j, o.x - 40, o.y - 40, 80, 80)) pickN = o;
    ctx.save(); ctx.globalAlpha = done ? .35 : cur ? 1 : .6; if (cur) { ctx.globalCompositeOperation = 'lighter'; drawGlow(o.x, o.y, 70 + Math.sin(World.t * 4) * 6, N.c, .5); ctx.globalCompositeOperation = 'source-over'; }
    UI.panel(o.x - 40, o.y - 40, 80, 80, { r: 22, fill: cur ? 'rgba(50,28,120,.95)' : 'rgba(20,8,55,.8)', stroke: N.c }); txt(N.i, o.x, o.y - 20, 40, N.c, 'center', 900); txt(N.n, o.x, o.y + 54, 13, '#fff', 'center', 900); if (o.type !== 'shop' && o.type !== 'event') txt('Fase ' + (o.stage + 1), o.x, o.y + 70, 12, '#8a7fb0', 'center', 700); ctx.restore();
  }));
  if (pickN) { Snd.play('uiSelect'); Visual32.enter(pickN); return; }
  txt('Escolha o próximo destino (clique no caminho brilhante).', W / 2, 560, 18, '#ffb340', 'center', 800);
  if (UI.button('back', 40, 640, 220, 42, 'ABANDONAR', { size: 16 })) Visual32.finish(false);
  Screens.thinFrame();
};
Screens.expshop = function () {
  const r = Visual32.run; if (!r) { G.state = 'modes'; return; } xHeader(r); txt('LOJA DO VIAJANTE', W / 2, 120, 36, '#ffd36a', 'center');
  r.shop.forEach((s, i) => { const x = 100 + i * 280, can = !s.sold && r.gold >= s.p; UI.panel(x, 200, 260, 250, { r: 20 }); txt(s.n, x + 130, 216, 20, '#ffe9a8', 'center', 240); txt(s.d, x + 130, 270, 15, '#cdb8ff', 'center', 220);
    if (UI.button('xs' + i, x + 20, 380, 220, 48, s.sold ? 'COMPRADO' : '★ ' + s.p, { size: 18, color: can ? '#9a63ff' : undefined, disabled: !can })) { r.gold -= s.p; s.sold = true; s.f(); Snd.play('levelUp'); } });
  if (UI.button('xleave', W / 2 - 150, 560, 300, 54, 'SEGUIR VIAGEM', { size: 22, color: '#7fe0a0' })) { r.i++; G.state = 'expmap'; }
  Screens.thinFrame();
};
Screens.expevent = function () {
  const r = Visual32.run; if (!r) { G.state = 'modes'; return; } xHeader(r); const e = r.ev;
  txt(e.t.toUpperCase(), W / 2, 150, 38, '#c8a0ff', 'center'); txt(e.d, W / 2, 210, 20, '#e2d4ff', 'center', 900);
  if (!r.evDone) { [e.a, e.b].forEach((o, i) => { if (UI.button('xe' + i, W / 2 - 300, 290 + i * 80, 600, 56, o[0], { size: 18 })) { r.evDone = o[1](r) || ''; Snd.play('uiSelect'); } }); }
  else { txt(r.evDone, W / 2, 330, 22, '#ffe9a8', 'center', 900); if (UI.button('xec', W / 2 - 150, 440, 300, 54, 'CONTINUAR', { size: 22, color: '#7fe0a0' })) { r.i++; G.state = 'expmap'; } }
  Screens.thinFrame();
};
Screens.expend = function () {
  const r = Visual32.run; if (!r) { G.state = 'modes'; return; } const t = World.t;
  txt(r.win ? 'EXPEDIÇÃO CONCLUÍDA!' : 'FIM DA EXPEDIÇÃO', W / 2, 90, 56, r.win ? '#ffe9a8' : '#ff8a8a', 'center'); txt(r.win ? 'Você atravessou toda a rota. Que jornada!' : 'Sem checkpoints: a rota termina aqui.', W / 2, 168, 20, '#cdb8ff', 'center', 900);
  UI.panel(380, 220, 520, 260, { r: 24 }); [['Etapas vencidas', r.cleared + ' / ' + XPLAN.length], ['Pontos', String(r.score)], ['Melhorias', Object.values(r.up).reduce((a, b) => a + b, 0)], ['Estrelas ganhas', '★ ' + r.stars]].forEach(([a, b], i) => { txt(a, 410, 250 + i * 52, 20, '#cdb8ff', 'left', 700); txt(b, 870, 250 + i * 52, 24, i === 3 ? '#ffd36a' : '#fff', 'right', 800); });
  if (UI.button('xnew', W / 2 - 160, 520, 320, 54, 'NOVA EXPEDIÇÃO', { size: 22, color: '#9a63ff' })) { Visual32.run = null; Visual32.start(); }
  if (UI.button('back', W / 2 - 160, 590, 320, 46, 'VOLTAR AO MENU', { size: 20 })) { Visual32.run = null; G.exp = null; Game.goTitle(); }
  Screens.thinFrame();
};
ACH.push({ id: 'exped', name: 'Desbravador', desc: 'Conclua uma Expedição.', ok: () => !!(Save.data.exp && Save.data.exp.wins) });
