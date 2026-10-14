'use strict';
// ---------- 89: especial discreto e limpo ----------
// Antes o especial cobria a tela: faixa de cinema com o nome (2 s), tela inteira colorida com raios gigantes, zoom, clarao, tremor forte e ondas enormes.
// Agora so aparece o nome pequeno perto da nave, um anel fino ao redor dela e ondas menores. O ataque em si (os tiros) nao muda.
const Visual89 = { sp: null, until: 0 };
{
  const us = useSpecial;
  useSpecial = function () {
    const p = G.player, cd = p ? p.specCd : 1, z0 = G.zoom || 0, r0 = G.rings.length;
    us();
    if (!p || !(cd <= 0 && p.specCd > 0)) return;
    G.cutin = null; Visual39.sp = null; G.zoom = Math.min(G.zoom || 0, z0);
    G.flash = Math.min(G.flash || 0, .04); G.shake = Math.min(G.shake || 0, 3);
    for (let i = r0; i < G.rings.length; i++) { const q = G.rings[i]; q.max = Math.min(q.max, 170); q.cl89 = 1; }
    const w = WEAPONS[p.weapon] || {}; const c = /^#[0-9a-f]{6}$/i.test(w.c) ? w.c : '#b98cff';
    Visual89.sp = { t: 0, x: p.x, y: p.y, c }; Visual89.until = performance.now() + 450;
    popup(p.x, p.y - 80, (w.specName || 'ESPECIAL').toUpperCase(), c, 17);
  };
  // ondas dos golpes que disparam logo depois (golpe de fusao etc.) tambem ficam menores
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); if (performance.now() < Visual89.until) { for (const q of G.rings) if (!q.cl89) { q.cl89 = 1; q.max = Math.min(q.max, 170); } if ((G.flash || 0) > .06) G.flash = .06; if ((G.shake || 0) > 4) G.shake = 4; } return r;
  };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const S = Visual89.sp; if (!S || G.state !== 'play') return; S.t += 1 / 60; const k = S.t / .4; if (k >= 1) { Visual89.sp = null; return; }
    const p = G.player; if (p) { S.x = p.x; S.y = p.y; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = S.c; ctx.lineWidth = 3; ctx.globalAlpha = (1 - k) * .75; ctx.beginPath(); ctx.arc(S.x, S.y, 36 + k * 110, 0, TAU); ctx.stroke(); ctx.restore();
  };
}
