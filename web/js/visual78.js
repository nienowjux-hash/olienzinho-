'use strict';
// ---------- 78: tela mais limpa e com mais espaco: naves, inimigos e tiros do jogador menores, sem numeros de dano comuns, ondas de choque menores ----------
const Visual78 = { ST: [1, .9, .8, .7] };
Visual78.k = () => { const s = Save.data.settings || {}; return Visual78.ST[s.sprK ?? 2] || .8; };
Visual78.clean = () => (Save.data.settings || {}).clean !== false;

{
  const sc = (obj, fn, px, py) => {
    const f = obj[fn];
    obj[fn] = function (a, b, c) {
      const k = Visual78.k(); if (k >= .99 || G.state !== 'play') return f.apply(this, arguments);
      const x = px(a, b), y = py(a, b); if (typeof x !== 'number') return f.apply(this, arguments);
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); try { return f.apply(this, arguments); } finally { ctx.restore(); }
    };
  };
  sc(Art, 'enemy', e => e.x, e => e.y);
  sc(Art, 'pbullet', b => b.x, b => b.y);
  sc(Art, 'pickup', p => p.x, p => p.y);
  const ship = Art.ship;
  Art.ship = function (x, y, o) {
    const k = Visual78.k(); if (k >= .99 || G.state !== 'play' || !G.player || o.orbi || Math.abs(x - G.player.x) > 3 || o.scale > 1.3) return ship.apply(this, arguments);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); try { return ship.apply(this, arguments); } finally { ctx.restore(); }
  };
}

// numeros de dano comuns somem (criticos, combo e textos continuam); ondas de choque ficam menores e em menor numero
{
  const up = Game.updatePlay;
  Game.updatePlay = function () {
    const r = up.apply(this, arguments); if (!Visual78.clean()) return r;
    if (G.pops.length) G.pops = G.pops.filter(o => !(/^[\d.]+$/.test(o.text) && o.size <= 16));
    for (const q of G.rings) if (q.r <= 8 && !q.cl) { q.cl = 1; q.max = Math.min(q.max, 190); }
    if (G.rings.length > 7) G.rings.splice(0, G.rings.length - 7);
    return r;
  };
}

// opcao na tela de teclas e acessibilidade: tamanho dos objetos e tela limpa
{
  const ac = Screens.access;
  Screens.access = function () {
    const r = ac.apply(this, arguments), s = Save.data.settings;
    if (UI.button('sprk', 820, 424, 230, 38, 'OBJETOS: ' + Math.round(Visual78.k() * 100) + '%', { size: 14, color: (s.sprK ?? 2) !== 0 ? '#9a63ff' : undefined })) { s.sprK = ((s.sprK ?? 2) + 1) % Visual78.ST.length; Save.save(); }
    if (UI.button('clean', 660, 368, 330, 38, 'TELA LIMPA: ' + (Visual78.clean() ? 'SIM' : 'NÃO'), { size: 14, color: Visual78.clean() ? '#9a63ff' : undefined })) { s.clean = !Visual78.clean(); Save.save(); }
    return r;
  };
}
