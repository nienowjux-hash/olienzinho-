'use strict';
// ---------- 53: legenda das falas de furia dos chefes (aparece durante o jogo, sem pausar) ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const c = G.furyCap; if (!c || G.state !== 'play') return; c.t += 1 / 60;
    const ln = c.lines[c.i]; if (!ln) { G.furyCap = null; return; } if (c.t > 3.4) { c.i++; c.t = 0; return; }
    const ch = CHARS[ln[0]] || { name: '', c: '#fff' }, a = clamp(c.t / .25, 0, 1) * clamp((3.4 - c.t) / .4, 0, 1), w = 760, h = 74, x = W / 2 - w / 2, y = H - 200;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 16); ctx.fillStyle = 'rgba(12,4,34,.82)'; ctx.strokeStyle = ch.c; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.stroke();
    Portraits.draw(ln[0], x + 42, y + h / 2, 56, { mood: ln[0] === 'O' ? 'determined' : ln[0] === 'B' ? 'worry' : 'angry', talk: c.t < 1.8, t: World.t });
    txt(ch.name, x + 88, y + 8, 14, ch.c, 'left', 900); UI.wrap(ln[1], x + 88, y + 28, w - 110, 20, 16, '#fff'); ctx.restore();
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { G.furyCap = null; return ss.call(this, i, o); };
}
