'use strict';
// ---------- 65: governador de desempenho ----------
// Mede o tempo real entre quadros durante a partida. Se o jogo cair abaixo de ~50 quadros por segundo, desce degraus de qualidade
// (efeitos -> brilhos grandes limitados -> resolucao interna menor) ate voltar a ficar fluido. Nada sobe no meio da fase (evita ficar oscilando);
// ao comecar a proxima fase o governador tenta um degrau a menos.
const Visual65 = { level: 0, win: [], last: 0, cool: 480, log: [], bad: 0 };
Visual65.MAX = 4;
Visual65.apply = function () {
  const L = Visual65.level, B = Visual64;
  B.B = L >= 2 ? W * H * 1.1 : 1e12;
  const want = Visual65.noRes ? 1 : L >= 4 ? .62 : L >= 3 ? .8 : 1;
  if ((window.DYN || 1) !== want) { window.DYN = want; try { resize(); } catch (e) { } }
};
{
  const lv = Visual55.lvl;
  Visual55.lvl = () => { const b = lv(), L = Visual65.level; return L >= 2 ? 0 : L >= 1 ? Math.min(b, 1) : b; };
  hookRender(rn => function () {
    const now = performance.now(), d = now - Visual65.last; Visual65.last = now; rn();
    if (G.state !== 'play' || d > 120 || d <= 0 || (Save.data.settings && Save.data.settings.gov === false)) { Visual65.win.length = 0; return; }
    if (Visual65.cool > 0) { Visual65.cool--; return; }
    const W_ = Visual65.win; W_.push(d); if (W_.length < 70) return;
    const avg = W_.reduce((a, b) => a + b, 0) / W_.length; W_.length = 0;
    if (Visual65.chk) { const c = Visual65.chk; Visual65.chk = null; if (avg > c * .92 && (window.DYN || 1) < 1) { Visual65.noRes = true; Visual65.apply(); return; } } // baixar a resolucao nao ajudou: volta e para de tentar
    const lim = [19.5, 19.5, 22, 26][Math.min(3, Visual65.level)];
    if (avg > lim && Visual65.level < Visual65.MAX) { if (++Visual65.bad >= 2) { Visual65.bad = 0; Visual65.level++; Visual65.cool = 150; if (Visual65.level >= 3 && !Visual65.noRes) Visual65.chk = avg; Visual65.log.push([Math.round(avg), Visual65.level]); Visual65.apply(); } } else Visual65.bad = 0;
  });
  const ss = Game.startStage; Game.startStage = function (i, o) { if (Visual65.level > 0) { Visual65.level--; Visual65.apply(); } Visual65.win.length = 0; Visual65.bad = 0; Visual65.cool = 480; return ss.call(this, i, o); };
}

