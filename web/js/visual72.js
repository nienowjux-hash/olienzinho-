'use strict';
// ---------- 72: contraste dos textos, botoes com icone e clique vivo, cenas novas de dialogo (alvorada, cidade, mar), marcos de progresso,
// galeria nos creditos e aviso de qualidade automatica ----------
const Visual72 = { pop: {}, lvlSeen: 0, toastT: -9, toastTxt: '' };
const ok72 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

// ---------- 4. textos cinza em fundo roxo ficam mais claros ----------
{
  const t0 = txt, MAP = { '#8a7fb0': '#b6addf', '#7a70a0': '#aaa0d4', '#8f84c4': '#b2a8e0', '#8a7fa8': '#b0a6d6', '#6a5fa0': '#a096d0' };
  txt = function (s, x, y, size, color, align, weight, base) { const c2 = MAP[color]; return t0(s, x, y, size, c2 || color, align, weight, base); };
}

// ---------- 5 e 6. botoes: icone ao lado do texto, onda ao clicar e luz que acompanha o mouse ----------
{
  const IC = {
    'JOGAR': (c) => { ctx.beginPath(); ctx.moveTo(-5, -7); ctx.lineTo(7, 0); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill(); },
    'CONTINUAR': (c) => IC.JOGAR(c), 'PRÓXIMA FASE': (c) => { ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(0, 0); ctx.lineTo(-6, 6); ctx.moveTo(0, -6); ctx.lineTo(6, 0); ctx.lineTo(0, 6); ctx.stroke(); },
    'VOLTAR': () => { ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-6, 0); ctx.moveTo(-1, -5); ctx.lineTo(-6, 0); ctx.lineTo(-1, 5); ctx.stroke(); },
    'LOJA': () => { ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(6, -2); ctx.lineTo(5, 7); ctx.lineTo(-5, 7); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -3, 3.5, Math.PI, 0); ctx.stroke(); },
    'MAPA': () => { ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, -.4, 0, TAU); ctx.stroke(); },
    'CARTAS': () => { ctx.beginPath(); ctx.roundRect(-5, -7, 10, 14, 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(1.5, 0); ctx.lineTo(0, 3); ctx.lineTo(-1.5, 0); ctx.closePath(); ctx.fill(); },
    'HANGAR': () => { ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(5, -1, 4, 6); ctx.lineTo(-4, 6); ctx.quadraticCurveTo(-5, -1, 0, -7); ctx.stroke(); },
    'OPÇÕES': () => { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 4.5 : 7; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.stroke(); },
    'CODEX': () => { ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(-4, -6, -7, -4); ctx.lineTo(-7, 6); ctx.quadraticCurveTo(-4, 4, 0, 6); ctx.quadraticCurveTo(4, 4, 7, 6); ctx.lineTo(7, -4); ctx.quadraticCurveTo(4, -6, 0, -5); ctx.stroke(); },
    'TENTAR DE NOVO': () => { ctx.beginPath(); ctx.arc(0, 0, 6, .6, TAU - .3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(5, -7); ctx.lineTo(7, -2); ctx.lineTo(2, -3); ctx.closePath(); ctx.fill(); },
    'SAIR PARA O MAPA': () => { ctx.beginPath(); ctx.rect(-5, -6, 8, 12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, 0); ctx.moveTo(5, -3); ctx.lineTo(8, 0); ctx.lineTo(5, 3); ctx.stroke(); },
    'EQUIPAR': () => { ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-2, 5); ctx.lineTo(6, -5); ctx.stroke(); },
    'ESTANTE': () => { ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.quadraticCurveTo(6, 3, 0, 4); ctx.quadraticCurveTo(-6, 3, -6, -6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, 7); ctx.moveTo(-4, 7); ctx.lineTo(4, 7); ctx.stroke(); },
  };
  IC.CONTINUAR = IC.JOGAR;
  const bt = UI.button;
  UI.button = function (id, x, y, w, h, label, o = {}) {
    const r = bt.call(this, id, x, y, w, h, label, o); if (QL() < 1) return r; const dis = o && o.disabled;
    if (r) Visual72.pop[id] = World.t;
    const pa = World.t - (Visual72.pop[id] ?? -9);
    if (pa < .35) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - pa / .35) * .8; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - pa * 60, y - pa * 30, w + pa * 120, h + pa * 60, Math.min(24, h / 2 + pa * 40)); ctx.stroke(); ctx.restore(); }
    if (!dis && UI.focus(id) && !(typeof Visual67 !== 'undefined' && Visual67.pad()) && w >= 100) { const mx = clamp(Input.mouse.x, x, x + w); ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(18, h / 2)); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; drawGlow(mx, y + h / 2, h * 1.6, '#ffffff', .22); ctx.restore(); }
    const f = IC[label]; if (f && !dis && (o.size || 26) <= 30) { ctx.save(); ctx.font = `900 ${o.size || 26}px ${FONT}`; const tw = ctx.measureText(label).width; if (w >= tw + 70) { ctx.translate(x + w / 2 - tw / 2 - 20, y + h / 2 - (o.sub ? 10 : 0)); ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = .9; f(); } ctx.restore(); }
    return r;
  };
}

// ---------- 7. cenas novas nos dialogos: alvorada, cidade de luz e mar de estrelas ----------
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const r = sb.call(this); const S = G.story, pg = S && this.curPage(S); if (QL() < 1 || !pg || pg.video || typeof C4 === 'undefined') return r; const sc = pg.scene; if (sc !== 'dawn' && sc !== 'city' && sc !== 'sea') return r; const t = World.t;
    ctx.save(); ctx.globalAlpha = Math.min(1, S.t / .4);
    C4.world({ x: Math.sin(t * .12) * 40, y: 0, z: 1.04 }, () => {
      if (sc === 'dawn') { C4.sky(t, '#2a1a68', '#8a4a98', '#ffb890', { stars: 90, neb: ['#ffd36a', '#ff9ab0', '#8a6aff'], nebA: .28, seed: 3 }); C4.planet(W * .18, H * .3, 70, '#7ab0ff', '#1a2a68', true, .3); C4.planet(W * .86, H * .26, 50, '#ffb86a', '#5a2a1a', false, .22); C4.rays(W * .6, H * .62, t, 18, 700, '#ffe9a8', .28, .06); C4.ridge(.5, H * .9, 60, '#2a1050', 2); }
      else if (sc === 'city') { C4.sky(t, '#1a0e48', '#4a2a88', '#d89a78', { stars: 80, neb: ['#ffd36a', '#ff9ab0', '#8a8aff'], nebA: .22, seed: 5 }); C4.ridge(.4, H * .88, 80, '#2a1050', 1); C4.ridge(.7, H * .95, 60, '#14082e', 4); for (let k = 0; k < 28; k++) { const x = k * 50 + 10; C4.layer(.55, () => { ctx.fillStyle = 'rgba(255,214,120,.85)'; ctx.fillRect(x, H * .9 - 30 - ((k * 37) % 90), 4, 5); }); } }
      else { C4.sky(t, '#041a3a', '#0a4a78', '#1a8ab8', { stars: 70, neb: ['#33c4ff', '#6adad8', '#6a8aff'], nebA: .24, seed: 8 }); ctx.save(); ctx.strokeStyle = 'rgba(190,240,255,.28)'; ctx.lineWidth = 2; for (let k = 0; k < 8; k++) { ctx.beginPath(); for (let x = -40; x <= W + 40; x += 30) { const y = H * .62 + k * 24 + Math.sin(x * .02 + t * 1.4 + k) * 9; x > -40 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } ctx.restore(); C4.planet(W * .8, H * .24, 70, '#33c4ff', '#082a58', true, .25); }
    });
    C4.dust(t, 20, sc === 'sea' ? '#bfefff' : '#ffe9c0', .5); ctx.restore(); return r;
  };
}

// ---------- 8. marcos de progresso no mapa ----------
{
  const sel = Screens.select;
  Screens.select = function () {
    const r = sel.call(this); if (QL() < 1) return r; const cl = Object.values(Save.data.cleared || {}).filter(Boolean).length, ach = Object.keys(Save.data.ach || {}).filter(k => Save.data.ach[k]).length, fr = Object.values(Save.data.frags || {}).filter(Boolean).length;
    const rows = [['SETORES', cl, STAGES.length, '#ffb340'], ['CONQUISTAS', ach, (typeof ACH !== 'undefined' ? ACH.length : 32), '#7fe0a0'], ['FRAGMENTOS', fr, 6, '#ff7ac8']], x = W - 330, y = 54; ctx.save();
    ctx.fillStyle = 'rgba(10,4,32,.55)'; ctx.strokeStyle = 'rgba(190,160,255,.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x - 12, y - 8, 320, 92, 14); ctx.fill(); ctx.stroke();
    rows.forEach(([lab, n, m, c], i) => { const yy = y + i * 28; txt(lab, x, yy, 12, '#b6addf', 'left', 800); txt(n + '/' + m, x + 296, yy, 12, c, 'right', 900); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x, yy + 15, 296, 5); ctx.fillStyle = c; ctx.fillRect(x, yy + 15, 296 * clamp(n / Math.max(1, m), 0, 1), 5); });
    ctx.restore(); return r;
  };
}

// ---------- 9. creditos: galeria dos chefes derrotados e da nave com a skin equipada ----------
{
  const cr = Screens.credits;
  Screens.credits = function () {
    const r = cr.apply(this, arguments); if (QL() < 1) return r; const t = World.t, i = Math.floor(t / 3.2) % STAGES.length, u = (t % 3.2) / 3.2, a = Math.min(1, u * 6) * Math.min(1, (1 - u) * 6);
    try { if (!Visual72.gh || Visual72.ghI !== i) { Visual72.gh = new BOSS_CLASSES[STAGES[i].boss](); Visual72.ghI = i; } const gh = Visual72.gh; gh.t = t; gh.x = 0; gh.y = 0; gh.phase = 0; gh.flash = 0; gh.state = 'fight'; gh.dive = null; gh.clones = gh.clones || []; ctx.save(); ctx.globalAlpha = a * .85; ctx.translate(150, H * .5); const sc = clamp(95 / (gh.rad || 110), .25, .6); ctx.scale(sc, sc); gh.draw(); ctx.restore(); ctx.save(); ctx.globalAlpha = a; txt(STAGES[i].bossName || '', 150, H * .5 + 150, 15, '#ffe9a8', 'center', 800); ctx.restore(); } catch (e) { }
    const sk = (typeof skinOf === 'function') ? skinOf((Save.data.loadout || {}).skin) : null; if (sk) { ctx.save(); ctx.globalAlpha = .9; Art.ship(W - 150, H * .5 + Math.sin(t * 1.6) * 8, { pal: sk.pal, t, scale: 1.1, vx: 0, lookx: .3, looky: -.3, blinkT: 0, inv: 0, boost: .5 }); txt('Sua nave', W - 150, H * .5 + 150, 15, '#ffe9a8', 'center', 800); ctx.restore(); }
    return r;
  };
}

// ---------- 10. aviso quando a qualidade automatica muda ----------
{
  hookRender(rn => function () {
    rn(); if (typeof Visual65 === 'undefined') return; if (Visual65.level !== Visual72.lvlSeen) { Visual72.toastTxt = Visual65.level > Visual72.lvlSeen ? 'Qualidade automática: efeitos reduzidos para manter a fluidez' : 'Qualidade automática: efeitos restaurados'; Visual72.toastT = World.t; Visual72.lvlSeen = Visual65.level; }
    const a = 1 - (World.t - Visual72.toastT) / 3; if (a <= 0 || G.state !== 'play') return; ctx.setTransform(K, 0, 0, K, 0, 0); ctx.save(); ctx.globalAlpha = Math.min(1, a * 3); ctx.font = `800 14px ${FONT}`; const w = ctx.measureText(Visual72.toastTxt).width + 40; ctx.fillStyle = 'rgba(10,4,32,.82)'; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, H - 150, w, 34, 17); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffe9a8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(Visual72.toastTxt, W / 2, H - 133); ctx.restore();
  });
}
