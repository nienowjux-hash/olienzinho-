'use strict';
// ---------- polimento: mortes dos chefes antigos, tela de game over e animacoes de menu ----------

// ===== mortes dos chefes antigos =====
Object.assign(MotherShip.prototype, {
  dieSfx: 'hiveDie', dyLen: 3.6,
  dyingFx(dt) {
    if (Math.random() < dt * 16) { const a = rand(0, TAU), s = rand(160, 420); G.parts.push({ x: this.x + rand(-120, 120), y: this.y + rand(-40, 40), vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.3, max: 1.3, r: rand(3, 6), c: Math.random() < .5 ? '#ffb340' : '#ffe9a8', drag: .5 }); }
    if (Math.random() < dt * 4) shockwave(this.x + rand(-100, 100), this.y + rand(-30, 40), 150, '#ffb340');
    if (Math.random() < dt * 6) shedDebris(this.x + rand(-140, 140), this.y + rand(-30, 40), 2, ['#7a2a0a', '#ffb340'], 260, 12);
  },
  finalFx() {
    for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, s = rand(300, 700); G.parts.push({ x: this.x, y: this.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.6, max: 1.6, r: rand(4, 8), c: i % 2 ? '#ffb340' : '#ffffff', drag: .8 }); }
    for (let i = 0; i < 3; i++) shockwave(this.x, this.y, 500 + i * 200, '#ffcf6b');
  },
});
Object.assign(RockGolem.prototype, {
  dieSfx: 'rockDie', dyLen: 3.8,
  dyingFx(dt) {
    if (Math.random() < dt * 9) shedDebris(this.x + rand(-130, 130), this.y + rand(-90, 90), 2, ['#5a3a58', '#c8a0b8', '#3a2a40'], 220, 20);
    if (Math.random() < dt * 22) G.parts.push({ k: 'smoke', x: this.x + rand(-130, 130), y: this.y + rand(-80, 80), vx: rand(-40, 40), vy: rand(-30, 30), life: 1.2, max: 1.2, r: rand(14, 26), c: '#8a6a80', drag: 1 });
    if (Math.random() < dt * 7) { const a = rand(0, TAU); G.parts.push({ x: this.x, y: this.y, vx: Math.cos(a) * 20, vy: Math.sin(a) * 20, life: .5, max: .5, r: 30, c: '#ffcf9a', drag: 1, k: 'flash' }); }
    if (Math.random() < dt * 3) shake(10);
  },
  finalFx() {
    shedDebris(this.x, this.y, 36, ['#5a3a58', '#c8a0b8', '#3a2a40', '#ffcf9a'], 640, 22);
    for (let i = 0; i < 4; i++) shockwave(this.x, this.y, 380 + i * 150, '#c8a0b8');
    for (let i = 0; i < 24; i++) G.parts.push({ k: 'smoke', x: this.x + rand(-100, 100), y: this.y + rand(-80, 80), vx: rand(-160, 160), vy: rand(-160, 160), life: 1.6, max: 1.6, r: rand(18, 34), c: '#8a6a80', drag: 1.2 });
  },
});
Object.assign(StormEye.prototype, {
  dieSfx: 'stormDie', dyLen: 3.6,
  dyingFx(dt) {
    if (Math.random() < dt * 7) { Events.bolts.push(Events.makeBolt(rand(60, W - 60))); Events.flash = Math.max(Events.flash, .6); shake(10); }
    if (Math.random() < dt * 24) sparks(this.x + rand(-110, 110), this.y + rand(-110, 110), '#9fe8ff', 4, 300);
    if (Math.random() < dt * 5) shockwave(this.x, this.y, 260, '#ff7ac8');
  },
  finalFx() {
    for (let i = 0; i < 7; i++) Events.bolts.push(Events.makeBolt(80 + i * 180)); Events.flash = 1;
    for (let i = 0; i < 80; i++) G.parts.push({ x: this.x + rand(-100, 100), y: this.y + rand(-100, 100), vx: rand(-300, 300), vy: rand(-300, 100), life: 1.5, max: 1.5, r: rand(2, 4), c: Math.random() < .5 ? '#9fe8ff' : '#ff7ac8', drag: .8 });
  },
});
Object.assign(SunGuardian.prototype, {
  dieSfx: 'sunDie', dyLen: 3.8,
  dyingFx(dt) {
    if (Math.random() < dt * 5) shockwave(this.x, this.y, 150 + this.dyingT * 140, Math.random() < .5 ? '#ff8a1f' : '#ffd36a');
    if (Math.random() < dt * 40) { const a = rand(0, TAU), s = rand(120, 360); G.parts.push({ x: this.x + Math.cos(a) * 80, y: this.y + Math.sin(a) * 80, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 1.2, max: 1.2, r: rand(3, 7), c: Math.random() < .5 ? '#ff6a1a' : '#ffe9a8', drag: .6 }); }
    if (Math.random() < dt * 3) shake(9);
  },
  finalFx() {
    for (let i = 0; i < 7; i++) shockwave(this.x, this.y, 300 + i * 150, i % 2 ? '#ffd36a' : '#ff5a3c');
    for (let i = 0; i < 160; i++) { const a = rand(0, TAU), s = rand(100, 800); G.parts.push({ x: this.x, y: this.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(1.2, 2.4), max: 2.4, r: rand(2, 6), c: Math.random() < .5 ? '#ffb340' : '#ff5a3c', drag: .7 }); }
  },
});

// ===== tela de game over cinematografica =====
Screens.over = function () {
  const r = G.result, t = World.t - (G.overAt ?? (G.overAt = World.t)), end = !!(G.endless || G.rush || G.secret || G.practice);
  if (!G.overQuote) G.overQuote = pick(STORY.defeat.orbi);
  ctx.fillStyle = 'rgba(8,2,22,' + clamp(t / 1.2, 0, .82) + ')'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(W / 2, 170, 420, end ? '#ffb340' : '#ff5a9a', clamp(t / 1.5, 0, .22) + Math.sin(t * 1.5) * .02); ctx.restore();
  // brasas que sobem
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 28; i++) { const y = H - ((t * (30 + (i * 13) % 50) + i * 97) % (H + 40)), x = (i * 211) % W + Math.sin(t + i) * 20; ctx.globalAlpha = .1 + ((i * 7) % 10) / 60; ctx.fillStyle = i % 3 ? '#ff9ac0' : '#ffcf6b'; ctx.beginPath(); ctx.arc(x, y, 1.5 + i % 3, 0, TAU); ctx.fill(); }
  ctx.restore();
  // titulo: surge com um tremor e vai se acomodando
  const title = end ? (G.rush ? 'CHEFES EM SEQUÊNCIA' : G.secret ? 'DESAFIO SECRETO' : G.practice ? 'TREINO DE CHEFE' : G.weekly ? 'ARENA SEMANAL' : G.daily ? 'DESAFIO ENCERRADO' : 'FIM DA LINHA') : 'NAVE DESTRUÍDA', tc = end ? '#ffb340' : '#ff7ac8';
  const e = easeOut(clamp((t - .2) / .9, 0, 1)), shk = Math.max(0, .7 - t) * 14;
  ctx.save(); ctx.translate(W / 2 + rand(-1, 1) * shk, 120 + rand(-1, 1) * shk); ctx.scale(1.25 - .25 * e, 1.25 - .25 * e); ctx.globalAlpha = e;
  ctx.shadowColor = tc; ctx.shadowBlur = 40; txt(title, 0, -40, title.length > 14 ? 66 : 80, tc, 'center', 900); ctx.restore(); ctx.globalAlpha = 1;
  const sub = end ? (G.rush ? 'Você chegou até o chefe ' + (G.rushI + 1) + ' de 6.' : (G.secret || G.practice) ? 'Tente de novo: você chegou na fase ' + r.wave + ' de 3.' : G.weekly ? 'Melhor da semana: ' + Visual14.weeklyBest() + ' pts' : G.daily ? 'Seu melhor de hoje: ' + Extras.dailyBest() + ' pts' : G.rankPos > 0 && G.rankPos <= 10 ? 'Você entrou no ranking: ' + G.rankPos + 'º lugar!' : 'O Vazio venceu desta vez.') : '"' + G.overQuote + '"';
  ctx.globalAlpha = clamp((t - .9) / .6, 0, 1); txt(sub, W / 2, 196, 22, '#cdb8ff', 'center', 700); txt(end ? '' : '— Orbi', W / 2, 226, 15, '#7fe0ff', 'center', 800); ctx.globalAlpha = 1;
  // placar com entradas escalonadas
  const rows = end ? [[G.rush ? 'Chefes derrotados' : (G.secret || G.practice) ? 'Fase de fúria' : 'Onda alcançada', String(r.wave)], ['Pontuação', r.score + ' pts'], ['Inimigos derrotados', String(r.kills)], ['Estrelas guardadas', '★ ' + r.coins]] : [['Pontuação', r.score + ' pts'], ['Inimigos derrotados', String(r.kills)], ['Nível alcançado', String(r.level)], ['Estrelas guardadas', '★ ' + r.coins]];
  const px = 400, py = 280; UI.panel(px, py, 480, 70 + rows.length * 44, { r: 22 });
  rows.forEach(([a, b], i) => { const k = easeOut(clamp((t - 1.3 - i * .15) / .4, 0, 1)); ctx.globalAlpha = k; txt(a, px + 36 - (1 - k) * 40, py + 28 + i * 44, 21, '#cdb8ff', 'left', 700); txt(b, px + 444, py + 26 + i * 44, 25, i === rows.length - 1 ? '#ffcf6b' : '#fff', 'right'); });
  ctx.globalAlpha = 1;
  Visual8.recapDraw(t, r);
  // menu em texto
  const my = 590; let x = 90;
  const again = end ? () => { if (G.secret) Visual14.startSecret(G.secret.i); else if (G.practice) Visual14.startPractice(G.practice.idx, G.practice.ph); else if (G.weekly) Visual14.startWeekly(); else if (G.rush) Visual5.startRush(); else if (G.daily) Game.startDaily(); else Game.startEndless(); } : () => Game.enter(G.stageIdx, { skipStory: true });
  if (this.menuItem('retry', 'TENTAR DE NOVO', x, my - 6, 40, '')) again(); x += this.menuW('TENTAR DE NOVO', 40) + 56;
  const items = end ? [['rk', 'RANKING', () => { G.state = 'rank'; }], ['menu', 'MENU', () => Game.goTitle()]] : [['shop', 'LOJA', () => { G.shopBack = 'over'; G.state = 'shop'; }], ['map', 'MAPA', () => Game.goSelect()]];
  for (const [id, lb, fn] of items) { if (this.menuItem(id, lb, x, my + 4, 26, '')) fn(); x += this.menuW(lb, 26) + 44; }
  this.bars();
};

// ===== animacao de entrada dos menus =====
Screens.enterK = function (i, d = .45) { return clamp(easeBack((World.t - UI.enterAt - i * .07) / d), 0, 1.2); };
