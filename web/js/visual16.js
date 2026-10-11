'use strict';
// ---------- polimento 16: impactos por arma, mortes proprias, fundos vivos, minichefes da Parte 3, troca de piloto,
// dificuldade Pesadelo, eventos que mudam a regra, dicas de primeira vez e recordes por fase ----------
const Visual16 = { fxT: 0, tipQ: null, swapCd: 0 };

// ---------- dicas de primeira vez ----------
Visual16.tip = function (key, title, text) {
  const d = Save.data; d.tips = d.tips || {}; if (d.tips[key]) return; d.tips[key] = 1; Save.save();
  Visual16.tipQ = { t: 0, title, text };
};
Visual16.hud = function () {
  const q = Visual16.tipQ; if (!q) return; q.t += 1 / 60; if (q.t > 6) { Visual16.tipQ = null; return; }
  const k = Math.min(1, q.t / .3) * Math.min(1, (6 - q.t) / .4), w = 640, x = W / 2 - w / 2, y = 128 - (1 - k) * 30;
  ctx.save(); ctx.globalAlpha = k; UI.panel(x, y, w, 76, { r: 16, fill: 'rgba(20,8,55,.88)', stroke: '#ffd36a' });
  txt('DICA: ' + q.title, W / 2, y + 8, 18, '#ffd36a', 'center', 600); UI.wrap(q.text, W / 2, y + 36, w - 40, 18, 15, '#e8dcff', 'center'); ctx.restore();
};
{ const h = Visual15.hudDraw; Visual15.hudDraw = function () { h.call(this); Visual16.hud(); }; }

// ---------- impacto por arma ----------
Visual16.impact = function (x, y, crit) {
  const p = G.player, w = p ? p.weapon : 'violet', P = G.parts;
  const dots = (n, cols, sp, life = .4, r = 3) => { for (let i = 0; i < n; i++) { const a = rand(0, TAU), s = rand(.3, 1) * sp; P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.5, 1) * life, max: life, r: rand(r * .6, r * 1.4), c: pick(cols), drag: 3 }); } };
  if (w === 'g_C') { dots(6, ['#ffd36a', '#ffb340', '#fff6d0'], 200, .35, 3); }
  else if (w === 'g_P') { shedDebris(x, y, 3, ['#c8a0b8', '#5a3a58', '#8a6a88'], 220, 7); }
  else if (w === 'g_S' || w === 'flame') { for (let i = 0; i < 5; i++) P.push({ x: x + rand(-8, 8), y, vx: rand(-60, 60), vy: rand(-170, -40), life: rand(.3, .6), max: .6, r: rand(2, 5), c: pick(['#ffb340', '#ff6a1a', '#ffe9a8']), drag: 1.2 }); }
  else if (w === 'g_E') { shockwave(x, y, 46, '#ff7ac8'); dots(3, ['#ffffff', '#ff7ac8'], 150, .3, 2.5); }
  else if (w === 'laser') { for (let i = 0; i < 4; i++) P.push({ x, y, vx: rand(-260, 260), vy: rand(-60, 60), life: .22, max: .22, r: 2, c: pick(['#7fe0ff', '#ffffff']), drag: 4 }); }
  else if (w === 'chain') { sparks(x, y, '#ffe9a8', 4, 260); }
  else if (w === 'boomerang') { dots(4, ['#ffe9a8', '#ffffff'], 190, .3, 2.5); }
  else if (w === 'fan') { dots(4, ['#ffb340', '#ff7a4a'], 200, .3, 2.5); }
  else { dots(4, ['#b98cff', '#e2d4ff', '#ffffff'], 170, .3, 2.5); }
  if (crit) shockwave(x, y, 54, '#ffe9a8');
};
{
  const de = damageEnemy;
  damageEnemy = function (e, dmg, crit, chained) {
    if (!chained && Visual16.fxT <= 0 && e.type !== 'dummy' && G.state === 'play' && QL() >= 1) { Visual16.fxT = .035; Visual16.impact(e.x + rand(-6, 6), e.y + rand(0, e.rad * .5), crit); }
    return de(e, dmg, crit, chained);
  };
  const bd = Boss.prototype.damage;
  Boss.prototype.damage = function (n, crit) { if (this.targetable() && Visual16.fxT <= 0 && QL() >= 1 && G.player) { Visual16.fxT = .05; Visual16.impact(G.player.x + rand(-30, 30), this.y + rand(40, 100), crit); } return bd.call(this, n, crit); };
}

// ---------- mortes proprias dos inimigos da Parte 3 ----------
{
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.counted; ke(e, by); if (was || !e.counted) return; const x = e.x, y = e.y;
    switch (e.type) {
      case 'jelly': burst(x, y, ['#bfefff', '#7fe8ff', '#ffffff'], 18, 260, 6); for (let i = 0; i < 8; i++) G.parts.push({ x: x + rand(-20, 20), y: y + rand(-10, 10), vx: rand(-40, 40), vy: rand(-90, -20), life: rand(.8, 1.4), max: 1.4, r: rand(4, 9), c: 'rgba(150,235,255,.7)', drag: .8 }); shockwave(x, y, 130, '#7fe8ff'); break;
      case 'eel': burst(x, y, ['#35f0c0', '#9fffe8', '#ffffff'], 22, 300, 6); shockwave(x, y, 110, '#35f0c0'); break;
      case 'prism': shedDebris(x, y, 10, ['#ffd36a', '#fff6d8', '#ff9a2a'], 380, 11); break;
      case 'lantern': burst(x, y, ['#ffb340', '#ffe9a8', '#ffffff'], 20, 300, 5); for (let i = 0; i < 6; i++) G.parts.push({ x, y, vx: rand(-80, 80), vy: rand(-200, -60), life: rand(.5, 1), max: 1, r: rand(2, 4), c: '#ff9a2a', drag: 1 }); break;
      case 'lancer': shedDebris(x, y, 6, ['#fff0b0', '#d8a838'], 420, 9); shockwave(x, y, 100, '#fff0b0'); break;
      case 'shade': burst(x, y, ['#b070ff', '#1a0a40', '#ffffff'], 22, 300, 6); shockwave(x, y, 120, '#b070ff'); break;
      case 'facet': shedDebris(x, y, 8, ['#e8d0ff', '#c8a8ff', '#ffffff'], 360, 8); break;
      case 'warden': shedDebris(x, y, 16, ['#ffffff', '#c8d8ff', '#8a9aff', '#c080ff'], 460, 12); shockwave(x, y, 160, '#ffffff'); shake(6); break;
    }
  };
}

// ---------- fundos vivos da Parte 3 ----------
const fishSil = (x, y, s, dir, t) => { ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.beginPath(); ctx.moveTo(60, 0); ctx.quadraticCurveTo(10, -26, -40, -4); ctx.lineTo(-62, -22 + Math.sin(t * 3) * 6); ctx.lineTo(-56, 0); ctx.lineTo(-62, 22 - Math.sin(t * 3) * 6); ctx.lineTo(-40, 4); ctx.quadraticCurveTo(10, 26, 60, 0); ctx.fill(); ctx.restore(); };
Visual16.ambient = function () {
  const st = G.stage ? G.stage.id : 0; if (st < 6 || QL() < 2 || Save.data.settings.contrast) return; const t = World.t; ctx.save();
  if (st === 6) { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const x = ((i * 233 + t * (12 + i * 3)) % (W + 200)) - 100, y = 90 + (i * 97) % 520 + Math.sin(t * .4 + i) * 20; ctx.save(); ctx.translate(x, y); ctx.rotate(t * .15 + i); ctx.globalAlpha = .09; ctx.fillStyle = ['#ffd36a', '#ff9a8a', '#9fe8ff', '#c8a8ff'][i % 4]; ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(24, -6); ctx.lineTo(10, 40); ctx.lineTo(-18, 30); ctx.lineTo(-26, -8); ctx.closePath(); ctx.fill(); ctx.restore(); } }
  else if (st === 7) { ctx.fillStyle = '#021428'; ctx.globalAlpha = .22; for (let i = 0; i < 5; i++) { const dir = i % 2 ? 1 : -1, x = dir > 0 ? ((t * (24 + i * 7) + i * 300) % (W + 400)) - 200 : W + 200 - ((t * (24 + i * 7) + i * 300) % (W + 400)), y = 140 + i * 110 + Math.sin(t * .5 + i) * 18; fishSil(x, y, .5 + (i % 3) * .35, dir, t + i); } ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .05; ctx.fillStyle = '#9fefff'; for (let i = 0; i < 4; i++) { const x = 150 + i * 330 + Math.sin(t * .3 + i) * 40; ctx.beginPath(); ctx.moveTo(x - 20, 0); ctx.lineTo(x + 20, 0); ctx.lineTo(x + 120, H); ctx.lineTo(x - 80, H); ctx.closePath(); ctx.fill(); } }
  else { const p = G.player; if (p && !p.dead) { ctx.globalAlpha = .18; ctx.translate(W - p.x, H - p.y + 40); ctx.fillStyle = '#e8d0ff'; ctx.shadowColor = '#c080ff'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(34, -30); ctx.lineTo(0, -12); ctx.lineTo(-34, -30); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, -8, 14, 0, TAU); ctx.fill(); } }
  ctx.restore();
};
{ const f = Visual12.fg; Visual12.fg = function () { f.call(this); try { Visual16.ambient(); } catch (e) { } Visual16.dark(); }; }

// ---------- chefes antigos: pedacos soltos e zoom na furia ----------
{
  const op = Boss.prototype.onPhase;
  Boss.prototype.onPhase = function () { op.call(this); shedDebris(this.x, this.y, 22 + this.phase * 8, [this.col, this.dark || '#2a1a4a', '#ffffff'], 520, 14); G.zoom = Math.max(G.zoom || 0, .05); shake(14); };
}

// ---------- minichefes da Parte 3 ----------
{
  const se = spawnEnemy;
  spawnEnemy = function (type, x, y, o = {}) {
    const e = se(type, x, y, o); const st = G.stage ? G.stage.id : 0;
    if (type === 'captain' && st >= 6) { e.name = CAPTAINS[4 + st - 6]; e.hp = e.maxHp = Math.ceil(e.hp * 1.5); }
    const tips = { prism: ['Prisma', 'Gira soltando espirais de luz. Contorne os braços sem parar de se mover.'], lantern: ['Lanterna', 'Os orbes dourados explodem em anéis depois de um instante. Afaste-se.'], lancer: ['Lanceiro', 'A linha pontilhada mostra por onde vai a rajada. Saia dela.'], jelly: ['Água-viva', 'Solta anéis de bolhas lentas. Passe pelos vãos.'], eel: ['Enguia', 'Atravessa a tela atirando para baixo. Fique fora do caminho dela.'], urchin: ['Ouriço', 'Explode em espinhos ao morrer. Derrote de longe.'], shade: ['Sombra', 'Fica no lado oposto ao seu e atira reto. Evite a linha roxa.'], facet: ['Faceta', 'Os estilhaços quicam nas paredes e voltam.'], warden: ['Guardião', 'Com o escudo branco ele reflete tiros. Ataque quando o olho abrir.'] };
    if (tips[type] && !o.noElite) Visual16.tip('en_' + type, tips[type][0], tips[type][1]);
    return e;
  };
  const ue = updateEnemy;
  updateEnemy = function (e, dt) {
    const st = G.stage ? G.stage.id : 0;
    if (e.type === 'captain' && st >= 6 && e.mode === 'hover' && !e.dead) {
      const hurt = e.hp < e.maxHp * .5 ? .75 : 1, p = G.player; e.mt = e.mt || {};
      const tk = (k, every) => { e.mt[k] = (e.mt[k] ?? every * .7) - dt; if (e.mt[k] <= 0) { e.mt[k] = every * hurt; return true; } return false; };
      if (st === 6) {
        if (tk('halo', 3.6)) { const cx = p.x, cy = p.y, n = 20, gap = Math.floor(rand(0, n)); for (let i = 0; i < n; i++) { if (((i - gap + n) % n) < 3) continue; const a = i / n * TAU; ebullet(cx + Math.cos(a) * 300, cy + Math.sin(a) * 300, a + Math.PI, 125, { r: 6, life: 5 }); } shockwave(cx, cy, 120, '#ffe9a8'); }
        if (tk('bolt', 6)) Events.hazardRect(clamp(p.x, 70, W - 70), H / 2, 70, H, 1, .3, '#ffe9a8', 'bolt');
      } else if (st === 7) {
        if (tk('tide', 3)) { const gx = rand(120, W - 120); for (let i = 0; i < 12; i++) { const x = 40 + i * 108; if (Math.abs(x - gx) < 100) continue; ebullet(x, e.y + 30, Math.PI / 2, 140, { r: 7 }); } }
        if (tk('sum', 8) && G.enemies.filter(q => !q.dead && q.type === 'jelly').length < 2) spawnEnemy('jelly', clamp(e.x + rand(-120, 120), 80, W - 80), e.y, { bx: e.x, noElite: true });
      } else {
        if (tk('echo', 5.5)) { const past = []; for (let i = 0; i < 4; i++) { const tt = World.t - 1.8 + i * .45, s = P3.hist.find(h => h[0] >= tt); if (s) past.push(s[1]); } past.forEach((x, i) => P3.at(.3 + i * .35, () => Events.hazardRect(x, H / 2, 56, H, .8, .25, '#e8d0ff', 'bolt'))); }
        if (tk('sum', 9) && G.enemies.filter(q => !q.dead && q.type === 'shade').length < 1) spawnEnemy('shade', W - p.x, -40, { sy: 110, noElite: true });
      }
    }
    return ue(e, dt);
  };
}

// ---------- troca de piloto (Tab) ----------
Visual16.update = function (dt) {
  Visual16.fxT = Math.max(0, Visual16.fxT - dt); Visual16.swapCd = Math.max(0, Visual16.swapCd - dt);
  const p = G.player; if (!p || p.dead || G.state !== 'play' || G.cut || G.finisher) return;
  if (Input.pressed('tab') && !G.p2) {
    const base = Save.data.loadout.weapon, list = [base, ...['C', 'P', 'E', 'S'].filter(g => GUARDS[g].ok()).map(g => 'g_' + g)].filter((w, i, a) => WEAPONS[w] && a.indexOf(w) === i);
    if (list.length < 2) { Visual16.tip('swap0', 'Pilotos', 'Vença chefes para libertar guardiões. Depois use TAB para trocar de piloto durante a fase.'); return; }
    if (Visual16.swapCd > 0) { popup(p.x, p.y - 60, 'aguarde ' + Visual16.swapCd.toFixed(1) + 's', '#cdb8ff', 18); return; }
    const nx = list[(list.indexOf(p.weapon) + 1) % list.length]; Visual16.swapCd = 6; const hp = p.hp;
    p.weapon = nx; recalcStats(p); p.hp = Math.min(hp, p.maxHp); p.inv = Math.max(p.inv, .6); p.fireT = .1;
    const nm = nx.startsWith('g_') ? GUARDS[nx.slice(2)].name : WEAPONS[nx].name, col = WEAPONS[nx].c;
    shockwave(p.x, p.y, 200, col); burst(p.x, p.y, [col, '#ffffff'], 24, 360, 5); popup(p.x, p.y - 70, nm, col, 28); Snd.play('uiBack'); flashScreen(.12);
  }
};

// ---------- dificuldade Pesadelo ----------
DIFF.push({ name: 'PESADELO', desc: 'Inimigos bem mais fortes, tiros rápidos e leques de tiros maiores. -2 de vida. Muito mais pontos e estrelas.', hp: 1.7, bul: 1.22, php: -2, score: 2, coin: 1.7 });
{
  const fa = fanAimed;
  fanAimed = function (x, y, n, spread, spd, o) { if ((Save.data.settings.diff ?? 1) === 3 && n >= 1 && n < 12) { n += n > 1 ? 2 : 1; if (n > 2) spread *= 1.2; } return fa(x, y, n, spread, spd, o); };
}

// ---------- eventos que mudam a regra ----------
Object.assign(CEV, { blackout: ['APAGÃO', 'SÓ SE VÊ PERTO DA NAVE', '#8a7fb0', 9], gravflip: ['GRAVIDADE INVERTIDA', 'VOCÊ É PUXADO PARA CIMA E PARA BAIXO', '#c8a0ff', 8], mirrorshots: ['TIROS ESPELHADOS', 'CADA TIRO GANHA UM GÊMEO DO OUTRO LADO', '#e8d0ff', 8] });
{
  const add = (i, at, name) => { const ev = STAGES[i].events; ev.push({ at, name }); ev.sort((a, b) => a.at - b.at); };
  add(6, 34, 'blackout'); add(7, 86, 'mirrorshots'); add(8, 84, 'gravflip'); add(5, 50, 'blackout'); add(4, 40, 'gravflip'); add(8, 36, 'mirrorshots');
  const es = Events.start; Events.start = function (name) {
    es.call(this, name);
    if (name === 'blackout') Visual16.tip('ev_blackout', 'Apagão', 'Só dá para ver ao redor da nave. Os tiros inimigos continuam visíveis.');
    if (name === 'gravflip') Visual16.tip('ev_gravflip', 'Gravidade invertida', 'A nave é puxada para cima e para baixo. Use o movimento vertical para compensar.');
    if (name === 'mirrorshots') Visual16.tip('ev_mirror', 'Tiros espelhados', 'Cada tiro inimigo ganha um gêmeo no lado oposto da tela.');
  };
  const e1 = ebullet; ebullet = function (x, y, ang, spd, o = {}) { e1(x, y, ang, spd, o); const c = G.cev; if (c && c.name === 'mirrorshots' && !o.mir && G.eb.length < 280 && Math.abs(x - W / 2) > 40) e1(W - x, y, Math.PI - ang, spd, Object.assign({}, o, { mir: true })); };
  const upl = Game.updatePlayer;
  Game.updatePlayer = function (dt) {
    upl.call(this, dt); const c = G.cev, p = G.player; if (!c || c.name !== 'gravflip' || p.dead || G.finisher || G.cut) return;
    const dir = Math.floor(c.t / 2) % 2 ? -1 : 1; p.y = clamp(p.y + dir * 190 * dt, 90, H - 70);
    if (Math.random() < .5) G.parts.push({ x: rand(0, W), y: dir > 0 ? -5 : H + 5, vx: 0, vy: dir * rand(400, 700), life: .8, max: .8, r: 2, c: '#c8a0ff', drag: 0 });
  };
}
Visual16.dark = function () {
  const c = G.cev, p = G.player; if (!c || c.name !== 'blackout' || !p || G.state !== 'play') return;
  const k = Math.sin(clamp(c.t / c.dur, 0, 1) * Math.PI), a = Math.min(1, k * 2.4);
  const g = ctx.createRadialGradient(p.x, p.y, 110, p.x, p.y, 340); g.addColorStop(0, 'rgba(0,0,12,0)'); g.addColorStop(1, 'rgba(0,0,12,' + .9 * a + ')');
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); Events.drawHazards(); for (const q of G.eb) Art.ebullet(q);
};

// ---------- recordes por fase ----------
{
  const sc = Game.stageClear;
  Game.stageClear = function () {
    try { if (!G.rush && !G.endless && !G.practice && !G.secret && !G.adv && !G.weekly && !G.training) { const d = Save.data; d.rec = d.rec || {}; const k = G.stageIdx, r = d.rec[k]; if (!r || G.score > r.score) d.rec[k] = { score: G.score, w: G.player ? G.player.weapon : 'violet', t: Math.round(G.t), hits: G.stats ? G.stats.hits : 0, d: Save.data.settings.diff ?? 1 }; } } catch (e) { }
    return sc.call(this);
  };
}
Screens.records = function () {
  txt('RECORDES', W / 2, 26, 44, '#fff', 'center'); txt('Sua melhor pontuação em cada fase, com o piloto que você usou.', W / 2, 84, 17, '#ffd36a', 'center', 800);
  const rec = Save.data.rec || {}; UI.panel(150, 118, 980, 460, { r: 22 });
  STAGES.forEach((s, i) => {
    const y = 134 + i * 48, r = rec[i], gi = Save.data.grades[i]; const col = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.09)'; ctx.fillStyle = col; ctx.fillRect(166, y - 2, 948, 42);
    txt((i + 1) + '. ' + s.name, 184, y + 4, 19, r ? '#fff' : '#8a7fb0', 'left', 420);
    if (r) {
      const w = WEAPONS[r.w], nm = w ? w.name : r.w; txt(String(r.score).padStart(7, ' ') + ' pts', 660, y + 4, 20, '#ffe9a8', 'right', 200); txt(nm, 700, y + 6, 17, w ? w.c : '#cdb8ff', 'left', 200); txt(['CALMO', 'NORMAL', 'DIFÍCIL', 'PESADELO'][r.d] || '', 900, y + 7, 14, '#cdb8ff', 'left', 120);
      if (gi !== undefined) txt('CBAS'[gi], 1090, y, 26, ['#cdb8ff', '#7fe0ff', '#ffd36a', '#ff8a5f'][gi], 'right', 40);
    } else txt('ainda não concluída', 660, y + 6, 16, '#6a5f90', 'left', 300);
  });
  if (UI.button('back', W / 2 - 160, 606, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};

{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { up.call(this, dt); if (G.player && G.state === 'play') Visual16.update(dt); };
}
