'use strict';
// ---------- 69: linha do tempo da derrota, cartas na vitoria, silhuetas de inimigos por setor, emblema do setor, titulo com progresso, interface grande ----------
const Visual69 = { hist: [] };
const ok69 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

// ---------- 2. historico dos ultimos golpes (linha do tempo na tela de derrota) ----------
{
  const hp = hurtPlayer;
  hurtPlayer = function (d) {
    const p = G.player, b0 = p ? p.hp : 0, r = hp(d);
    if (p && p.hp < b0) { Visual69.hist.push({ t: World.t, d: b0 - p.hp, who: Visual68.killer || 'Golpe' }); if (Visual69.hist.length > 12) Visual69.hist.shift(); }
    return r;
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { Visual69.hist.length = 0; return ss.call(this, i, o); };
  const ov = Screens.over;
  Screens.over = function () {
    const r = ov.call(this); if (QL() < 1 || !Visual69.hist.length) return r;
    const end = Visual69.hist[Visual69.hist.length - 1].t, H10 = Visual69.hist.filter(h => end - h.t <= 10); if (!H10.length) return r;
    const x0 = 910, y0 = 572, w = 330; ctx.save();
    txt('ÚLTIMOS 10 SEGUNDOS', x0 + 4, y0 - 18, 12, '#8a7fb0', 'left', 800);
    ctx.fillStyle = 'rgba(14,6,40,.85)'; ctx.strokeStyle = 'rgba(190,160,255,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x0, y0, w, 18, 9); ctx.fill(); ctx.stroke();
    H10.forEach(h => { const k = 1 - (end - h.t) / 10, x = x0 + 8 + k * (w - 16); ctx.fillStyle = h === H10[H10.length - 1] ? '#ff4a6e' : '#ff9a6a'; ctx.beginPath(); ctx.arc(x, y0 + 9, 4 + h.d * 1.5, 0, TAU); ctx.fill(); });
    H10.slice(-3).reverse().forEach((h, i) => txt('-' + h.d + ' vida  •  ' + h.who + '  •  ' + (end - h.t < .1 ? 'fim' : (end - h.t).toFixed(1) + 's antes'), x0 + w / 2, y0 + 28 + i * 20, 13, i ? '#cdb8ff' : '#ffd0da', 'center', 700));
    ctx.restore(); return r;
  };
}

// ---------- 3 e 5. vitoria: cartas usadas + emblema do setor com brilho na cor da fase ----------
{
  const cl = Screens.clear;
  Screens.clear = function () {
    const r = cl.call(this); if (QL() < 1 || !G.stage) return r; const c = ok69(G.stage.tint) ? G.stage.tint : '#ffb340', t = World.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(W / 2, 330, 520, c, .1 + .03 * Math.sin(t * 2)); ctx.restore();
    // emblema do setor (canto superior esquerdo)
    ctx.save(); ctx.translate(96, 98); const g = ctx.createRadialGradient(-18, -18, 6, 0, 0, 52); g.addColorStop(0, '#ffffff'); g.addColorStop(.4, c); g.addColorStop(1, '#1a0840'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e2d4ff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.rotate(-.35); ctx.strokeStyle = 'rgba(226,212,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 70, 18, 0, 0, TAU); ctx.stroke(); ctx.restore();
    txt('FASE ' + (G.stageIdx + 1), 96, 156, 14, c, 'center', 900);
    // cartas usadas
    const L = typeof Visual59 !== 'undefined' ? Visual59.list() : []; if (L.length) { const n = Math.min(8, L.length), x0 = 1070, y0 = 230; txt('CARTAS USADAS', x0 + 100, y0 - 26, 12, '#8a7fb0', 'center', 800);
      L.slice(0, n).forEach(({ id, n: cc, u }, i) => { const x = x0 + (i % 3) * 66 + 33, yy = y0 + ((i / 3) | 0) * 66, col = ok69((RARITY[u.r] || {}).c) ? RARITY[u.r].c : '#b98cff'; ctx.save(); ctx.fillStyle = 'rgba(14,6,40,.85)'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 28, yy, 56, 56, 12); ctx.fill(); ctx.stroke(); try { Visual2.upIcon(id, x, yy + 28, 14, col, false); } catch (e) { } if (cc > 1) txt('x' + cc, x + 24, yy + 38, 12, col, 'right', 900); ctx.restore(); }); }
    return r;
  };
}

// ---------- 4. silhuetas dos inimigos comuns mudam por setor ----------
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    ae.call(this, e); if (QL() < 1 || !G.stage || e.mini || e.type === 'dummy' || e.type === 'captain' || (e.rad || 0) > 46) return;
    const v = (G.stage.id || 0) % 5, R = e.rad || 24, c = ok69(G.stage.tint) ? G.stage.tint : (ok69(e.glow) ? e.glow : '#ffb340'), t = World.t;
    ctx.save(); ctx.translate(e.x, e.y); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.globalAlpha = .85;
    if (v === 0) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * R * .3, -R * .8); ctx.quadraticCurveTo(s * R * .7, -R * 1.5, s * R * (.9 + Math.sin(t * 4 + s) * .1), -R * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(s * R * .9, -R * 1.5, 2.4, 0, TAU); ctx.fill(); } }
    else if (v === 1) { for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * R * .4 - 3, -R * .8); ctx.lineTo(i * R * .4, -R * (1.3 + (i === 0 ? .25 : 0))); ctx.lineTo(i * R * .4 + 3, -R * .8); ctx.fill(); } }
    else if (v === 2) { ctx.rotate(t * 1.2 + e.ph); ctx.globalAlpha = .55; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.35, R * .45, 0, 0, TAU); ctx.stroke(); }
    else if (v === 3) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * R * .35, -R * .85); ctx.quadraticCurveTo(s * R * 1.05, -R * 1.05, s * R * .8, -R * 1.65); ctx.stroke(); } }
    else { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * R * .9, -R * .2); ctx.lineTo(s * R * 1.5, R * .15 + Math.sin(t * 6 + s) * 3); ctx.lineTo(s * R * .9, R * .5); ctx.closePath(); ctx.fill(); } }
    ctx.restore();
  };
}

// ---------- 7. titulo: constelacao do progresso (um ponto por setor vencido) e halo dourado se zerou o jogo ----------
{
  const ti = Screens.title;
  Screens.title = function () {
    const r = ti.call(this); if (QL() < 1) return r; const t = World.t, cl = Save.data.cleared || [], n = STAGES.length;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const x = 760 + i * 46, y = 610 - Math.sin(i / (n - 1) * Math.PI) * 54 + Math.sin(t * 1.4 + i) * 2, on = !!cl[i], c = ok69(STAGES[i].tint) ? STAGES[i].tint : '#ffffff'; if (i) { ctx.globalAlpha = on && cl[i - 1] ? .5 : .12; ctx.strokeStyle = '#e2d4ff'; ctx.lineWidth = 1.5; const px = 760 + (i - 1) * 46, py = 610 - Math.sin((i - 1) / (n - 1) * Math.PI) * 54; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); } ctx.globalAlpha = on ? .95 : .25; drawGlow(x, y, on ? 16 : 7, c, on ? .9 : .5); }
    if (Save.data.trueEnd || Save.data.trueend) { ctx.globalAlpha = .25 + .1 * Math.sin(t * 2); drawGlow(660, 235, 340, '#ffd36a', .6); }
    ctx.restore(); return r;
  };
}

// ---------- 8. interface grande: textos do jogo 20% maiores (opcao em Acessibilidade) ----------
{
  const t0 = txt;
  txt = function (s, x, y, size, color, align, weight, base) { if (Save.data.settings && Save.data.settings.big && size <= 24 && size >= 11) size = Math.round(size * 1.2); return t0(s, x, y, size, color, align, weight, base); };
}
