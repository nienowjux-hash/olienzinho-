'use strict';
// ---------- 55: menos ruido visual e mais ritmo: opcao "Efeitos", tiros inimigos sempre legiveis e respiros entre as ondas ----------
const Visual55 = { glowK: 1, busy: 0, breath: 0 };
Visual55.lvl = () => (Save.data.settings && Save.data.settings.fx !== undefined ? Save.data.settings.fx : 1);   // 0 limpo, 1 equilibrado, 2 intenso
Visual55.K = () => [.3, .55, 1][Visual55.lvl()];

// ---------- efeitos pequenos encolhem; os grandes (chefes, elites) ficam inteiros ----------
{
  const bu = burst; burst = function (x, y, colors, n, sp, size) { return bu(x, y, colors, n <= 30 ? Math.max(2, Math.round(n * Visual55.K())) : n, sp, size); };
  const sp_ = sparks; sparks = function (x, y, c, n, sp) { return sp_(x, y, c, n <= 20 ? Math.max(1, Math.round(n * Visual55.K())) : n, sp); };
  const sd = shedDebris; shedDebris = function (x, y, n, cols, sp, size) { return sd(x, y, n <= 8 ? Math.max(1, Math.round(n * Visual55.K())) : n, cols, sp, size); };
  const vm = VGL.mult; VGL.mult = () => vm() * [.3, .65, 1][Visual55.lvl()];
  const im = Visual16.impact; Visual16.impact = function (x, y, crit) { const l = Visual55.lvl(); if (l < 2 && !crit && Math.random() < (l === 0 ? .55 : .3)) return; return im.call(this, x, y, crit); };
  const vb = Visual50.burst; Visual50.burst = function (x, y, c, size) { const l = Visual55.lvl(); if ((l === 0 && size < 40) || (l === 1 && size < 28)) return; return vb.call(this, x, y, c, size); };
}

// ---------- brilhos de fundo recuam quando ha muito tiro inimigo na tela ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    up.call(this, dt); const n = G.eb ? G.eb.length : 0, busy = clamp((n - 22) / 40, 0, 1); Visual55.busy += (busy - Visual55.busy) * Math.min(1, 4 * dt);
    Visual55.glowK = [.62, .86, 1][Visual55.lvl()] * (1 - Visual55.busy * .3);
  };
  // os tiros inimigos passam a ser desenhados POR ULTIMO (em vez de duas vezes): mesma legibilidade, sem custo extra
  const eb0 = Art.ebullet; Visual55.skipEb = false; Art.ebullet = function (b) { if (Visual55.skipEb) return; return eb0.call(this, b); };
  const dp = Game.drawPlay;
  Game.drawPlay = function () {
    Visual55.ovDone = false; Visual55.skipEb = Visual55.lvl() < 2 && G.state === 'play' && !G.furyCut;
    try { dp.call(this); } finally { if (Visual55.skipEb && !Visual55.ovDone) { Visual55.skipEb = false; for (const q of G.eb) if (!q.dead) eb0.call(Art, q); } Visual55.skipEb = false; }
  };
  const ov = Visual.overlay;
  Visual.overlay = function () { ov.call(this); Visual55.ovDone = true; if (Visual55.skipEb) { Visual55.skipEb = false; for (const q of G.eb) if (!q.dead) eb0.call(Art, q); } };
}

// ---------- respiros: de tempos em tempos a pressao cai por alguns segundos e depois volta mais forte ----------
{
  const gd = Game.director;
  Game.director = function (dt) {
    const st = G.stage; if (!st || G.endless || G.training || G.practice || G.boss || G.bossPending || G.secret || G.adv || G.weekly || G.rush || G.t < 18 || st.duration - G.t < 14) { Visual55.breath = 0; return gd.call(this, dt); }
    const ph = G.t % 30, inB = ph > 24 && ph < 28; Visual55.breath = inB ? 1 : 0;
    return gd.call(this, inB ? dt * .25 : (ph >= 28 && ph < 30 ? dt * 1.35 : dt));
  };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); if (!Visual55.breath || G.state !== 'play' || Visual55.lvl() === 2 && false) return; const ph = G.t % 30, a = clamp((ph - 24) / .4, 0, 1) * clamp((28 - ph) / .6, 0, 1); ctx.save(); ctx.globalAlpha = a * .55; txt('respire...', W / 2, H - 150, 20, '#cdb8ff', 'center', 800); ctx.restore();
  };
}
