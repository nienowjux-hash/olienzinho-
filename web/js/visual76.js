'use strict';
// ---------- 76: sombra e fumaca nos inimigos, rastro dos tiros, cartas que entram em cena, brilho nos botoes, caminho do mapa, explosoes em camadas,
// brilho ao coletar, vinheta de vida baixa, contagem na tela de resultado, camadas de profundidade no fundo ----------
const Visual76 = { lv: -9, ls: '' };
const ok76 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

// ---------- 1. inimigos: sombra no fundo e fumaca ao morrer ----------
{
  const en = Art.enemy;
  Art.enemy = function (e) {
    if (QL() >= 1 && !e.dead && G.enemies.length <= 30) { ctx.save(); ctx.fillStyle = 'rgba(2,0,14,.32)'; ctx.beginPath(); ctx.ellipse(e.x + 10, e.y + 16, (e.rad || 22) * .9, (e.rad || 22) * .5, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    return en.call(this, e);
  };
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.dead && e.counted; const r = ke.apply(this, arguments);
    if (!was && QL() >= 1) { const big = e.type === 'tank' || e.type === 'captain'; burst(e.x, e.y, ['#2a1a4a', '#4a2a7a', '#6a4a9a'], big ? 10 : 4, 110, big ? 12 : 8);
      if (big && G.timers) G.timers.push({ t: .18, fn: () => { shockwave(e.x, e.y, 200, '#ffe9a8'); burst(e.x, e.y, ['#ffb340', '#ff7a4a'], 14, 220, 5); } }); }
    return r;
  };
}

// ---------- 2. tiros do jogador: rastro de luz na cor da arma ----------
{
  const pb = Art.pbullet;
  Art.pbullet = function (b) {
    if (QL() >= 1 && G.pb.length <= 140 && b.vx !== undefined && b.kind !== 'cannon' && b.kind !== 'bomb') {
      const sp = Math.hypot(b.vx, b.vy) || 1, L = Math.min(46, sp * .06), c = ok76(b.c) ? b.c : '#b98cff';
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(b.x, b.y, b.x - b.vx / sp * L, b.y - b.vy / sp * L); g.addColorStop(0, c); g.addColorStop(1, c + '00'); ctx.strokeStyle = g; ctx.globalAlpha = .55; ctx.lineWidth = (b.r || 5) * 1.3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx / sp * L, b.y - b.vy / sp * L); ctx.stroke(); ctx.restore();
    }
    return pb.call(this, b);
  };
}

// ---------- 3. cartas de nivel: a tela sobe e aparece ----------
{
  const lu = Screens.levelup;
  Screens.levelup = function () {
    if (Visual76.ls !== 'levelup') Visual76.lv = World.t; Visual76.ls = 'levelup';
    const u = clamp((World.t - Visual76.lv) / .35, 0, 1), e = 1 - Math.pow(1 - u, 3);
    ctx.save(); ctx.globalAlpha = e; ctx.translate(0, (1 - e) * 36); const r = lu.apply(this, arguments); ctx.restore(); return r;
  };
  const rs = () => { if (G.state !== 'levelup') Visual76.ls = G.state; };
  const up = Game.updatePlay; Game.updatePlay = function () { rs(); return up.apply(this, arguments); };
}

// ---------- 4. botao em foco: contorno que pulsa ----------
{
  const bt = UI.button;
  UI.button = function (id, x, y, w, h) {
    const r = bt.apply(this, arguments);
    if (QL() >= 1 && this.focusId === id) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .25 + .2 * Math.sin(World.t * 6); ctx.strokeStyle = '#d8c8ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x - 3, y - 3, w + 6, h + 6, 18); ctx.stroke(); ctx.restore(); }
    return r;
  };
}

// ---------- 5. mapa: caminho luminoso entre os setores, com pontos andando ----------
{
  const sel = Screens.select;
  Screens.select = function () {
    const r = sel.call(this); if (QL() < 1) return r; const nS = STAGES.length, cl = Save.data.cleared || {}, t = World.t, pos = i => [nS > 6 ? 96 + i * (1088 / (nS - 1)) : 150 + i * (196), 408 + (i % 2 ? 36 : -18)];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nS - 1; i++) { const [x0, y0] = pos(i), [x1, y1] = pos(i + 1), on = !!cl[i]; ctx.strokeStyle = on ? 'rgba(255,214,120,.55)' : 'rgba(150,130,220,.25)'; ctx.lineWidth = on ? 3 : 2; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 20; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
      if (on) { const k = (t * .35 + i * .3) % 1; drawGlow(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, 12, '#ffe9a8', .8); } }
    ctx.restore(); return r;
  };
}

// ---------- 6. morte do chefe: ondas e brasas em camadas (sem camera lenta) ----------
{
  const d = Boss.prototype.die;
  Boss.prototype.die = function () {
    const r = d.apply(this, arguments); if (QL() < 1 || !G.timers) return r; const b = this;
    [.25, .55, .9, 1.3].forEach((dl, i) => G.timers.push({ t: dl, fn: () => { shockwave(b.x + rand(-60, 60), b.y + rand(-40, 40), 220 + i * 70, i % 2 ? '#ffe9a8' : (ok76(b.col) ? b.col : '#ffb340')); burst(b.x + rand(-80, 80), b.y + rand(-50, 50), ['#ffffff', '#ffb340', '#ff7a4a', '#2a1a4a'], 22, 340, 6); shake(5); } }));
    return r;
  };
}

// ---------- 7. coleta: anel e faiscas no ponto onde o item e pego ----------
{
  const upk = updatePickup;
  updatePickup = function (k, dt) {
    const was = k.dead, r = upk.apply(this, arguments);
    if (!was && k.dead && QL() >= 1 && G.player && Math.hypot(G.player.x - k.x, G.player.y - k.y) < 40) { const c = k.type === 'coin' ? '#ffcf6b' : k.type === 'heart' ? '#ff9ac0' : '#7fe0ff'; sparks(G.player.x, G.player.y, c, 5, 170); if (k.type !== 'xp') shockwave(G.player.x, G.player.y, 60, c); }
    return r;
  };
}

// ---------- 8. vida baixa: bordas vermelhas que pulsam ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const p = G.player; if (!p || p.dead || G.state !== 'play' || QL() < 1 || p.hp > 1 || p.maxHp < 3) return; const k = .5 + .5 * Math.sin(World.t * 5);
    ctx.save(); const g = ctx.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, H * .9); g.addColorStop(0, 'rgba(255,40,70,0)'); g.addColorStop(1, 'rgba(255,40,70,' + (.14 + .14 * k) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  };
}

// ---------- 9. resultado: a pontuacao sobe contando e a nota S solta brilhos ----------
{
  const cl = Screens.clear;
  Screens.clear = function () {
    const r = G.result; if (!r || QL() < 1) return cl.apply(this, arguments); const t = World.t - (G.clearAt ?? World.t), real = r.score; r.score = Math.round(real * clamp(t / 1.1, 0, 1));
    let out; try { out = cl.apply(this, arguments); } finally { r.score = real; }
    if (r.grade === 'S' && t > 1.3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + World.t * .6, rr = 120 + 30 * Math.sin(World.t * 3 + i); drawGlow(850 + Math.cos(a) * rr, 340 + Math.sin(a) * rr, 14, '#ffd36a', .7); } ctx.restore(); }
    return out;
  };
}

// ---------- 10. fundo com mais profundidade: brumas lentas atras e riscos rapidos na frente ----------
{
  const wd = World.draw;
  World.draw = function (cx) {
    wd.call(this, cx); if (QL() < 1 || !World.pal || (G.state !== 'play' && G.state !== 'select')) return; const t = World.t, nb = World.pal.nebA && World.pal.nebA[0] && World.pal.nebA[0][3], c = ok76(nb) ? nb : '#6a4ad8';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = .07; drawGlow(W * (.2 + i * .3) + Math.sin(t * .1 + i * 2) * 90, H * (.35 + .15 * Math.sin(i + t * .07)), 420, c, 1); }
    ctx.globalAlpha = .18; ctx.strokeStyle = '#cdb8ff'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 14; i++) { const sp = 700 + (i % 4) * 260, x = (i * 97.3) % W, y = ((i * 163.7 + t * sp * (1 + World.boost * .5)) % (H + 200)) - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 30 + (i % 3) * 14); ctx.stroke(); }
    ctx.restore();
  };
}
