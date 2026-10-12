'use strict';
// ---------- 64: orcamento de brilhos grandes (o que mais pesa na GPU) e corte de brilhos invisiveis ----------
// Os brilhos grandes (nevoa, luz de chefe, planetas) cobrem muita tela com blend aditivo. Cada um custa preenchimento de pixels,
// entao a soma deles por quadro e limitada: se passar do orcamento, todos encolhem na mesma proporcao.
const Visual64 = { tot: 0, f: 1, B: W * H * 0.9, big: 0, fg: 0 };
{
  const dg = drawGlow;
  drawGlow = function (x, y, r, color, a = 1) {
    if (a * GLOW < .02 || r < 1) return;
    if (Visual64.fg > 0 && r < 90 && VGL.glow(x, y, r, color, a)) return;
    if (r >= 90) { Visual64.tot += Math.PI * r * r; r *= Visual64.f; if (x + r < 0 || x - r > W || y + r < 0 || y - r > H) return; }
    return dg(x, y, r, color, a);
  };

  hookRender(rn => function () {
    rn(); const t = Visual64.tot; Visual64.tot = 0;
    const want = t > Visual64.B ? clamp(Math.sqrt(Visual64.B / t), .4, 1) : 1;
    Visual64.f += (want - Visual64.f) * .15;
  });
}

// marca as funcoes de desenho cujos brilhos pequenos podem ir para a camada WebGL
{
  const fgWrap = (obj, name) => { const f = obj && obj[name]; if (typeof f !== 'function') return; obj[name] = function (...a) { Visual64.fg++; try { return f.apply(this, a); } finally { Visual64.fg--; } }; };
  fgWrap(Art, 'pbullet'); fgWrap(Art, 'ebullet'); fgWrap(Visual13, 'draw'); fgWrap(Visual6, 'drawP2');
}
