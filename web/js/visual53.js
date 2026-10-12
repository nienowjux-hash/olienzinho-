'use strict';
// ---------- 53: legenda das falas de furia dos chefes (aparece durante o jogo, sem pausar) ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const c = G.furyCap; if (!c || G.state !== 'play') return; c.t += 1 / 60;
    const ln = c.lines[c.i]; if (!ln) { G.furyCap = null; return; } if (c.t > 3.4) { c.i++; c.t = 0; return; }
    const ch = CHARS[ln[0]] || { name: '', c: '#fff' }, a = clamp(c.t / .25, 0, 1) * clamp((3.4 - c.t) / .4, 0, 1), w = 560, h = 56, x = W / 2 - w / 2, y = 112;
    const sp = Visual56.sprite('fcap' + ln[0] + ln[1], w, h, (g, sw, sh) => {
      g.fillStyle = 'rgba(12,4,34,.7)'; g.strokeStyle = ch.c; g.lineWidth = 2; g.beginPath(); g.roundRect(1, 1, sw - 2, sh - 2, 14); g.fill(); g.stroke();
    });
    ctx.save(); ctx.globalAlpha = a * .8; ctx.translate(0, (1 - a) * -10); ctx.drawImage(sp.c, x, y, w, h);
    ctx.globalAlpha = a * .85; Portraits.draw(ln[0], x + 30, y + h / 2, 40, { mood: ln[0] === 'O' ? 'determined' : ln[0] === 'B' ? 'worry' : 'angry', talk: c.t < 1.8, t: World.t });
    ctx.globalAlpha = a; txt(ch.name, x + 62, y + 6, 12, ch.c, 'left', 900); UI.wrap(ln[1], x + 62, y + 22, w - 76, 16, 13, '#fff'); ctx.restore();
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { G.furyCap = null; return ss.call(this, i, o); };
}
