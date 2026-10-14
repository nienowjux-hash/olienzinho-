'use strict';
// ---------- 84: cutscenes mais fluidas: videos pre-carregados e so comecam quando ha dados, cenas pesadas aquecidas antes,
// resolucao interna limitada nas cenas (nao precisam de 4K) e medidor de quadros lentos nas cutscenes (aparece no F3) ----------
const Visual84 = { cap: 1, saved: null, n: 0, bad: 0, worst: 0, last: 0, warm: null };

// ---------- 1. videos: baixa tudo da cena assim que ela comeca e so toca com dados suficientes ----------
{
  const sg = Game.startStory;
  Game.startStory = function (pages) { try { (pages || []).forEach(p => { if (p && p.video) Visual18.get(p.video); }); } catch (e) { } const r = sg.apply(this, arguments); setTimeout(() => { try { Visual84.warmScenes(); } catch (e) { } }, 30); return r; };
  const vp = Visual18.page;
  Visual18.page = function (S, pg) {
    if (!S.vOn && Save.data.settings.cine !== false) {
      const v = Visual18.get(pg.video), now = World.t; if (S.vWt === undefined || S.vWt === null) S.vWt = now;
      if (!v.bad && v.readyState < 3 && now - S.vWt < 4) {
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        ctx.save(); ctx.strokeStyle = '#8b4dff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(W / 2, H / 2 - 30, 22, now * 6, now * 6 + 4.2); ctx.stroke(); ctx.restore();
        txt('carregando...', W / 2, H / 2 + 20, 20, '#8a7fb0', 'center', 700);
        if (Input.pressed('escape') || (Input.mouse.click && now - S.vWt > .8)) { S.vWt = null; Visual18.next(S); }
        return;
      }
      S.vWt = null;
    }
    return vp.call(this, S, pg);
  };
  // na tela de fase completa, ja baixa o video da proxima
  hookRender(rn => { let last = ''; return function () { rn(); const s = G.state; if (s !== last) { last = s; if (s === 'clear' || s === 'select') { try { const n = (G.stageIdx || 0) + 1; if (n >= 1 && n <= 9) Visual18.get('v_i' + n); } catch (e) { } } } }; });
}

// ---------- 2. aquece as cenas que montam um chefe, para o primeiro quadro nao engasgar ----------
Visual84.warmScenes = function () {
  const S = G.story; if (!S || !S.pages) return; if (S.pages.some(p => p && (p.scene === 'boss' || p.scene === 'freed' || p.scene === 'freedKeep'))) {
    try { const b = Screens.bossObjFor(S); if (b) { ctx.save(); ctx.globalAlpha = 0; b.t = 0; b.x = W / 2; b.y = 250; b.state = 'fight'; b.draw(); ctx.restore(); } } catch (e) { }
  }
};

// ---------- 3. nas cenas, a resolucao interna e limitada a 2560 de largura ----------
{
  hookRender(rn => function () {
    const s = G.state, cine = s === 'story' || s === 'cine';
    if (cine && Visual84.saved === null) { const want = Math.min(1, 2560 / Math.max(1, cv.width / (window.DYN || 1))); if (want < .98) { Visual84.saved = window.DYN || 1; window.DYN = Visual84.saved * want; try { resize(); } catch (e) { } } else Visual84.saved = 0; }
    else if (!cine && Visual84.saved !== null) { if (Visual84.saved > 0) { window.DYN = Visual84.saved; try { resize(); } catch (e) { } } Visual84.saved = null; }
    const now = performance.now(), d = now - Visual84.last; Visual84.last = now; rn();
    if (cine && d > 0 && d < 1000) { Visual84.n++; if (d > 34) Visual84.bad++; if (d > Visual84.worst) Visual84.worst = d; } else if (!cine && Visual84.n > 30) { const L = Save.data.perfLog = Save.data.perfLog || {}; L.story = { frames: Visual84.n, slow: Visual84.bad, worstMs: Math.round(Visual84.worst) }; Visual84.n = 0; Visual84.bad = 0; Visual84.worst = 0; }
    if (typeof Visual75 !== 'undefined' && Visual75.dbg && cine) { ctx.setTransform(K, 0, 0, K, 0, 0); txt('Cena: ' + Visual84.bad + ' quadros lentos, pior ' + Math.round(Visual84.worst) + ' ms, ' + cv.width + 'x' + cv.height, W - 280, 330, 14, '#c8f6ff', 'left', 800); }
  });
}
