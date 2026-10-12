'use strict';
// ---------- 59: cartas de nivel escolhidas sozinhas (sem pausar a partida) e lista das cartas da run ----------
const Visual59 = { names: {}, feed: [], open: false };
const rc59 = u => { const r = RARITY[u && u.r]; return r && /^#[0-9a-f]{6}$/i.test(r.c) ? r.c : '#b98cff'; };

{
  const ol = Game.openLevelUp;
  Game.openLevelUp = function () {
    ol.call(this);
    if (G.state !== 'levelup' || !G.options || !G.options.length) return;
    const u = G.options[(Math.random() * G.options.length) | 0], i = G.options.indexOf(u), p = G.player;
    Visual59.names[u.id] = { name: u.name, r: u.r, desc: u.desc };
    Game.chooseUpgrade(i); G.state = 'play';
    const c = rc59(u); popup(p.x, p.y - 90, u.name, c, 24); Visual59.feed.push({ t: 0, name: u.name, c, rar: RARITY[u.r] ? RARITY[u.r].name : '' }); if (Visual59.feed.length > 4) Visual59.feed.shift();
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { Visual59.feed.length = 0; Visual59.open = false; return ss.call(this, i, o); };

  // avisos discretos no canto: ultima carta ganha
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const F = Visual59.feed; if (!F.length || G.state !== 'play') return;
    for (let n = F.length - 1; n >= 0; n--) if ((F[n].t += 1 / 60) > 3.2) F.splice(n, 1);
    F.forEach((f, i) => {
      const k = easeOut(clamp(f.t / .3, 0, 1)) * clamp((3.2 - f.t) / .4, 0, 1), y = 196 + i * 40;
      ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * 40, 0); ctx.fillStyle = 'rgba(12,4,34,.72)'; ctx.strokeStyle = f.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(W - 266, y, 250, 32, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = f.c; ctx.fillRect(W - 260, y + 6, 5, 20); txt(f.rar, W - 246, y + 3, 10, f.c, 'left', 900); txt(f.name, W - 246, y + 14, 15, '#fff', 'left', 800); ctx.restore();
    });
  };
}

// ---------- lista das cartas da partida (pausa, vitoria e derrota) ----------
Visual59.list = function () {
  const out = []; for (const id in G.upCounts) { const n = G.upCounts[id]; if (!n) continue; const u = RUN_UPGRADES.find(q => q.id === id) || Visual59.names[id]; if (u) out.push({ id, n, u }); }
  const w = { epico: 0, raro: 1, comum: 2 }; out.sort((a, b) => (w[a.u.r] ?? 3) - (w[b.u.r] ?? 3) || b.n - a.n); return out;
};
Visual59.panel = function () {
  Screens.dim(.82); txt('CARTAS DESTA PARTIDA', W / 2, 40, 48, '#fff', 'center', 900);
  const L = Visual59.list(); if (!L.length) txt('Nenhuma carta ainda. Suba de nível para ganhar cartas!', W / 2, 330, 24, '#cdb8ff', 'center', 700);
  const cols = 4, cw = 280, ch = 96, gx = 18, gy = 14, x0 = W / 2 - (cols * cw + (cols - 1) * gx) / 2;
  L.slice(0, 20).forEach(({ id, n, u }, i) => {
    const x = x0 + (i % cols) * (cw + gx), y = 110 + ((i / cols) | 0) * (ch + gy), c = rc59(u);
    ctx.save(); ctx.fillStyle = 'rgba(20,8,58,.92)'; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 16); ctx.fill(); ctx.stroke(); ctx.fillStyle = c; ctx.fillRect(x + 8, y + 12, 5, ch - 24); ctx.restore();
    try { Visual2.upIcon(id, x + 46, y + ch / 2, 20, c, false); } catch (e) { }
    txt(u.name, x + 80, y + 12, 18, '#fff', 'left', 900); UI.wrap(u.desc || '', x + 80, y + 36, cw - 92, 17, 13, '#cdb8ff'); if ((u.max || 1) > 1 || n > 1) txt('x' + n, x + cw - 14, y + 10, 16, c, 'right', 900);
  });
  if (L.length > 20) txt('... e mais ' + (L.length - 20), W / 2, 640, 16, '#8a7fb0', 'center', 700);
  if (UI.button('cardsclose', W / 2 - 130, 660, 260, 46, 'VOLTAR', { size: 20 }) || Input.pressed('escape')) { Visual59.open = false; Snd.play('uiBack'); }
};
for (const [name, bx, by] of [['clear', 960, 570], ['over', W - 190, 20], ['pause', W - 190, 20]]) {
  const f = Screens[name];
  Screens[name] = function () {
    if (Visual59.open) { if (name === 'pause') G.pausedThisFrame = true; return Visual59.panel(); }
    const r = f.call(this);
    if (G.upCounts && Object.keys(G.upCounts).length && UI.button('cards_' + name, bx, by, 170, 44, 'CARTAS', { size: 18 })) { Visual59.open = true; Snd.play('uiSelect'); }
    return r;
  };
}
