'use strict';
// ---------- 51: mapa estelar animado, moldura de cabine no HUD, fundos animados nos menus e brilho do falante nas conversas ----------
const Visual51 = {};
const hh51 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const hx51 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';

// ---------- mapa de fases: pulsos na rota, luas nos setores vencidos, nevoa nos bloqueados e o Vazio avancando ----------
{
  const sel = Screens.select;
  Screens.select = function () {
    const r = sel.call(this); if (QL() < 1) return r; const t = World.t, nS = STAGES.length, unl = Save.data.unlocked || 1, pos = i => [nS > 6 ? 96 + i * (1088 / (nS - 1)) : 150 + i * 196, 408 + (i % 2 ? 36 : -18)];
    ctx.save();
    // o Vazio cresce a direita conforme faltam setores
    const rest = clamp(1 - (unl - 1) / nS, 0, 1), vk = .25 + rest * .6; const g = ctx.createLinearGradient(W, 0, W - 420 * vk, 0); g.addColorStop(0, 'rgba(28,4,60,' + (.6 * vk) + ')'); g.addColorStop(1, 'rgba(28,4,60,0)'); ctx.fillStyle = g; ctx.fillRect(W - 440, 0, 440, H);
    ctx.strokeStyle = 'rgba(100,40,180,' + (.5 * vk) + ')'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) { const y0 = 140 + i * 110; ctx.beginPath(); ctx.moveTo(W + 10, y0); for (let k = 1; k <= 7; k++) ctx.lineTo(W + 10 - k * 28 * vk, y0 + Math.sin(t * 1.3 + k * .7 + i) * 18 * (k / 7)); ctx.stroke(); }
    // pulsos de luz viajando pela rota ate o setor liberado
    ctx.globalCompositeOperation = 'lighter'; const upto = clamp(unl - 1, 0, nS - 1);
    for (let p = 0; p < 3; p++) { const f = ((t * .12 + p / 3) % 1) * upto, i = Math.min(upto - 1, Math.floor(f)), u = f - Math.floor(f); if (i < 0) continue; const [x0, y0] = pos(i), [x1, y1] = pos(i + 1); drawGlow(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 18, '#ffe9a8', .9); }
    for (let i = 0; i < nS; i++) {
      const [x, y0] = pos(i), sel2 = i === G.sel, y = y0 + (sel2 ? Math.sin(t * 3) * 5 : 0), R = sel2 ? 50 : 38;
      if (Save.data.cleared[i]) { const a = t * (.8 + i * .07) + i; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * (R + 14), y + Math.sin(a) * (R + 14) * .45, 5, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x + Math.cos(a) * (R + 14), y + Math.sin(a) * (R + 14) * .45, 14, '#ffe9a8', .8); }
      else if (i >= unl) { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(8,0,24,.4)'; ctx.beginPath(); ctx.arc(x, y, R + 6, 0, TAU); ctx.fill(); }
      else if (i === unl - 1 || i === unl) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,233,168,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R + 10 + Math.sin(t * 4) * 3, 0, TAU); ctx.stroke(); }
    }
    ctx.restore(); return r;
  };
}

// ---------- fundos animados nos menus ----------
{
  const wd = World.draw;
  World.draw = function (cx) {
    wd.call(this, cx); const s = G.state; if (QL() < 1 || ['play', 'pause', 'levelup', 'clear', 'over', 'celebrate', 'photo', 'cine', 'story', 'title'].includes(s)) return; const t = performance.now() / 1000;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (s === 'hangar') { ctx.strokeStyle = 'rgba(127,224,255,.07)'; ctx.lineWidth = 1; for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } const sy = ((t * 70) % (H + 200)) - 100; const g = ctx.createLinearGradient(0, sy - 60, 0, sy + 4); g.addColorStop(0, 'rgba(127,224,255,0)'); g.addColorStop(1, 'rgba(127,224,255,.16)'); ctx.fillStyle = g; ctx.fillRect(0, sy - 60, W, 64); }
    else if (s === 'settings' || s === 'access' || s === 'stats' || s === 'custom') { for (const [cx2, cy2, R, sp] of [[90, 640, 120, .12], [W - 100, 90, 150, -.09], [W - 40, 640, 70, .2]]) { ctx.save(); ctx.translate(cx2, cy2); ctx.rotate(t * sp); ctx.strokeStyle = 'rgba(190,160,255,.12)'; ctx.lineWidth = 6; ctx.beginPath(); for (let i = 0; i < 12; i++) { const a0 = i / 12 * TAU, a1 = (i + .5) / 12 * TAU; ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R); ctx.lineTo(Math.cos(a0) * (R + 16), Math.sin(a0) * (R + 16)); ctx.lineTo(Math.cos(a1) * (R + 16), Math.sin(a1) * (R + 16)); ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R); } ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, R * .45, 0, TAU); ctx.stroke(); ctx.restore(); } }
    else if (s === 'achievements' || s === 'records' || s === 'gallery') { for (let i = 0; i < 26; i++) { const x = hh51(i) * W, y = H - ((t * (16 + hh51(i + 3) * 24) + hh51(i + 8) * H) % H); ctx.globalAlpha = .35 + .35 * Math.sin(t * 2 + i); drawGlow(x + Math.sin(t + i) * 12, y, 7 + hh51(i + 2) * 6, '#ffd36a', .6); } }
    else { const pts = []; for (let i = 0; i < 16; i++) pts.push([(hh51(i) * W + Math.sin(t * .2 + i) * 40 + W) % W, (hh51(i + 20) * H + Math.cos(t * .17 + i) * 30 + H) % H]); ctx.strokeStyle = 'rgba(190,170,255,.13)'; ctx.lineWidth = 1.2; for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d < 240) { ctx.globalAlpha = (1 - d / 240); ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke(); } } ctx.globalAlpha = .6; for (const [x, y] of pts) drawGlow(x, y, 6, '#d8c8ff', .7); }
    ctx.restore();
  };
}

// ---------- brilho de quem fala atras do retrato e moldura de balao ----------
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const r = sb.call(this); const S = G.story, pg = S && this.curPage(S); if (QL() < 1 || !pg || pg.video || !pg.who || typeof CHARS === 'undefined' || !CHARS[pg.who]) return r;
    const c = hx51(CHARS[pg.who].c) ? CHARS[pg.who].c : '#b98cff', t = World.t; ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(150, 548, 210 + Math.sin(t * 2) * 10, c, .28); ctx.restore(); return r;
  };
}
