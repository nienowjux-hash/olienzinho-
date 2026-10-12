'use strict';
// ---------- videos curtos entre as fases (v_i1..v_i9) e o do final verdadeiro (v_true) ----------
const INTER_CAP = [
  null,
  'A nebulosa ficou para trás. Adiante, um campo de rochas gigantes.',
  'O céu escurece. Raios dançam entre as nuvens de energia.',
  'O calor aumenta. Uma estrela viva espera logo à frente.',
  'Silêncio. Estrelas apagadas flutuam como lembranças.',
  'O Vazio está perto. O Coração de Luz pulsa fraco ao longe.',
  'Do outro lado, uma cidade feita de luz acena em silêncio.',
  'Um oceano de estrelas se estende até onde a vista alcança.',
  'O céu virou um espelho, e ele mostra o que você não queria ver.',
  'O último céu. Tudo o que importa está logo ali.',
];
const hexC = c => (typeof c === 'string' && c[0] === '#' && c.length === 7) ? c : '#ffb340';
for (let i = 1; i < 10; i++) {
  Cine.clips['v_i' + i] = {
    dur: 5, pal: () => STAGES[i].pal,
    f(t) {
      const st = STAGES[i], c = hexC(st.tint);
      try { World.draw(t * 40); } catch (e) { ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, H); }
      ctx.save(); ctx.fillStyle = 'rgba(4,0,16,.45)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      // caminho curvo e destino que cresce
      const P = k => { const a = 1 - k; return [a * a * 140 + 2 * a * k * 500 + k * k * (W - 200), a * a * (H - 160) + 2 * a * k * (H * .15) + k * k * 250]; };
      ctx.save(); ctx.setLineDash([4, 14]); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(226,212,255,.35)'; ctx.lineWidth = 4; ctx.beginPath(); for (let k = 0; k <= 1.001; k += .02) { const [x, y] = P(k); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
      const [dx, dy] = P(1), grow = .5 + .5 * eio(clamp((t - .3) / 3.5, 0, 1)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(dx, dy, 190 * grow, c, .5); drawGlow(dx, dy, 70 * grow, '#ffffff', .5); ctx.restore();
      ctx.save(); ctx.fillStyle = c; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(dx, dy, 46 * grow, 0, TAU); ctx.fill(); ctx.restore();
      // nave voando
      const k = eio(clamp((t - .4) / 3.6, 0, 1)), [sx, sy] = P(k), [nx, ny] = P(Math.min(1, k + .02)), ang = Math.atan2(ny - sy, nx - sx);
      for (let q = 1; q < 14; q++) { const [tx, ty] = P(Math.max(0, k - q * .012)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(tx, ty, 26 - q * 1.4, '#c8a0ff', .5 - q * .035); ctx.restore(); }
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang + Math.PI / 2); Art.ship(0, 0, { pal: SKIN_DEFAULT, t, scale: 1.1, vx: 0, lookx: 0, looky: -1, blinkT: 0, inv: 0, boost: .9, noWings: true }); ctx.restore();
      const ta = clamp((t - .5) / .6, 0, 1) * clamp((4.5 - t) / .5, 0, 1); ctx.save(); ctx.globalAlpha = ta; txt('FASE ' + (i + 1), 120, 120, 26, c, 'left', 900); ctx.shadowColor = c; ctx.shadowBlur = 20; txt(st.name.toUpperCase(), 120, 154, 58, '#ffffff', 'left', 900); ctx.restore();
      const vg = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 900); vg.addColorStop(0, 'rgba(4,0,16,0)'); vg.addColorStop(1, 'rgba(4,0,16,.7)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      Cine.cap(INTER_CAP[i], t, .8, 4.6); Cine.fade(clamp((t - 4.5) / .5, 0, 1)); Cine.fade(1 - clamp(t / .5, 0, 1));
    },
  };
}
Cine.clips.v_true = {
  dur: 9, pal: () => STAGES[9].pal,
  f(t) {
    try { World.draw(t * 30); } catch (e) { ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, H); }
    ctx.save(); ctx.fillStyle = 'rgba(4,0,16,' + (.6 - clamp((t - 3) / 4, 0, 1) * .45) + ')'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const cx = W / 2, cy = H * .46, k = eio(clamp((t - 2.5) / 3.5, 0, 1));
    // seis fragmentos convergem
    for (let f = 0; f < 6; f++) { const a = f / 6 * TAU + t * .5, r = 420 * (1 - eio(clamp((t - .3 - f * .12) / 2.6, 0, 1))) + 20, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * .7; ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 46, '#ffd36a', .8); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff2c0'; ctx.translate(x, y); ctx.rotate(t); ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(8, 0); ctx.lineTo(0, 16); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
    // coracao de luz desabrochando
    ctx.save(); ctx.translate(cx, cy); const s = k * (1 + .04 * Math.sin(t * 5)); ctx.scale(s * 6.5, s * 6.5); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 80, '#ffd36a', .55 * k); ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(-6, -8, 4, 0, 0, 34); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#ffe9a8'); g.addColorStop(1, '#ff9a4a'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 22); ctx.bezierCurveTo(-34, -2, -22, -26, 0, -10); ctx.bezierCurveTo(22, -26, 34, -2, 0, 22); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = 'lighter'; for (let r = 0; r < 16; r++) { ctx.save(); ctx.rotate(r / 16 * TAU + t * .2); const gg = ctx.createLinearGradient(0, 0, 0, -820); gg.addColorStop(0, 'rgba(255,225,150,.5)'); gg.addColorStop(1, 'rgba(255,225,150,0)'); ctx.fillStyle = gg; ctx.globalAlpha = .45 * k; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.lineTo(50, -820); ctx.lineTo(-50, -820); ctx.fill(); ctx.restore(); } ctx.restore();
    // estrelas acendendo no ceu
    for (let q = 0; q < 60; q++) { const on = clamp((t - 4.5 - q * .05) / .6, 0, 1); if (on > 0) Cine.star(sr(q) * W, 90 + sr(q + 50) * (H - 180), 4 + sr(q + 9) * 8, t + q, '#fff1c0', on * .9); }
    ctx.save(); Art.ship(cx, H * .8 + Math.sin(t * 2) * 5, { pal: SKIN_DEFAULT, t, scale: 1.3, vx: 0, lookx: 0, looky: -1, blinkT: 0, inv: 0, mood: 'happy', noWings: true }); ctx.restore();
    Cine.cap('Seis fragmentos. Seis luzes.', t, .6, 3.2); Cine.cap('O Coração de Luz bateu de novo.', t, 3.4, 6.2); Cine.cap('E todas as estrelas acenderam.', t, 6.4, 8.6);
    Cine.fade(clamp((t - 8.4) / .6, 0, 1)); Cine.fade(1 - clamp(t / .6, 0, 1));
  },
};
{
  const mb = Game.maybeStory;
  Game.maybeStory = function (key, pages, done, opts) {
    const m = /^intro(\d+)$/.exec(key);
    if (m && +m[1] >= 1 && +m[1] <= 9 && pages && pages.length && !this.noStory && Save.data.settings.cine !== false && !(Save.data.seen && Save.data.seen[key])) pages = [{ video: 'v_i' + m[1] }, ...pages];
    return mb.call(this, key, pages, done, opts);
  };
  const F = STORY.finale4, ix = F.findIndex(p => typeof p.req === 'function'); if (ix >= 0) F.splice(ix, 0, { req: () => Extras.fragCount() >= 6, video: 'v_true' });
  const ss = Game.startStage; Game.startStage = function (i, o) { try { if (i >= 1) Visual18.get('v_i' + i); } catch (e) { } return ss.call(this, i, o); };
}
for (let i = 1; i < 10; i++) Visual20.CLIPS.push(['v_i' + i, 'Rumo a: ' + STAGES[i].name, 'Entre as fases ' + i + ' e ' + (i + 1)]);
Visual20.CLIPS.push(['v_true', 'Todas as Luzes', 'Final verdadeiro']);
