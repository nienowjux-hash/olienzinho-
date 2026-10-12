'use strict';
// ---------- 73: aviso dos remixes do Jogo Novo+, entrada de cada chefe, tiros simples quando ha muitos (com area segura), barra do chefe mais rica,
// cenario que balanca com os golpes, marcas no mapa, icones das conquistas e botao do modo foto ----------
const Visual73 = { warn: null, lod: 0 };
const ok73 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

// ---------- 1 e 3. remix do Jogo Novo+: 0,9 s de aviso (nome, cor propria e marca onde cai) antes de disparar ----------
{
  const NM = ['HALO', 'MARÉ', 'ECO', 'CHUVA'];
  Visual73.remix = function (i, fn) { Visual73.warn = { t: World.t, i, n: NM[i] || 'REMIX' }; if (G.timers) G.timers.push({ t: .9, fn }); else fn(); };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const w = Visual73.warn, p = G.player; if (!w || G.state !== 'play' || !p) return; const u = (World.t - w.t) / .9; if (u > 1.05) { Visual73.warn = null; return; } const k = clamp(u, 0, 1), t = World.t;
    ctx.save();
    const g = ctx.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, H * .95); g.addColorStop(0, 'rgba(90,232,255,0)'); g.addColorStop(1, 'rgba(90,232,255,' + (.22 * Math.sin(k * Math.PI)) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(90,232,255,.85)'; ctx.fillStyle = 'rgba(90,232,255,.9)'; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 80;
    if (w.i === 0) { ctx.beginPath(); ctx.arc(p.x, p.y, 340 * (1 - k * .15), 0, TAU); ctx.stroke(); }
    else if (w.i === 1) { ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(W, 60); ctx.stroke(); ctx.setLineDash([]); for (let x = 40; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x - 8, 90); ctx.lineTo(x, 106); ctx.lineTo(x + 8, 90); ctx.stroke(); } }
    else if (w.i === 2) { for (let x = 140; x < W; x += 200) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } }
    else { ctx.setLineDash([]); for (let x = 60; x < W; x += 70) { ctx.beginPath(); ctx.moveTo(x - 7, 30); ctx.lineTo(x, 44); ctx.lineTo(x + 7, 30); ctx.stroke(); } }
    ctx.setLineDash([]); ctx.globalAlpha = Math.min(1, u * 5); ctx.font = `900 30px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const tw = ctx.measureText('REMIX: ' + w.n).width + 60; ctx.fillStyle = 'rgba(8,3,28,.85)'; ctx.strokeStyle = '#5ae8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(W / 2 - tw / 2, 160, tw, 48, 24); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#c8f6ff'; ctx.fillText('REMIX: ' + w.n, W / 2, 185);
    ctx.fillStyle = '#5ae8ff'; ctx.fillRect(W / 2 - tw / 2 + 14, 202, (tw - 28) * (1 - k), 3); ctx.restore();
  };
}

// ---------- 2. entrada do chefe: coluna de luz, abalo e entulho conforme o tipo ----------
{
  const CL = { MotherShip, RockGolem, StormEye, SunGuardian, EchoBoss, VoidBoss, Herald, Leviathan, Mirror, Heart };
  for (const name in CL) {
    const d = CL[name].prototype.draw;
    CL[name].prototype.draw = function () {
      d.call(this); if (QL() < 1 || this.state !== 'intro' || G.state !== 'play') return; const c = ok73(this.col) ? this.col : '#ffb340', k = clamp(1 - Math.abs(this.y - (this.baseY || 150)) / 400, 0, 1), t = World.t;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (name === 'StormEye') { ctx.strokeStyle = '#e8f6ff'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { let x = this.x + (i - 1) * 60, y = 0; ctx.beginPath(); ctx.moveTo(x, y); while (y < this.y) { y += 40; x += rand(-24, 24); ctx.lineTo(x, y); } ctx.stroke(); } }
      else { const g = ctx.createLinearGradient(0, 0, 0, this.y + 60); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, c); ctx.globalAlpha = .35 * (1 - k * .5); ctx.fillStyle = g; ctx.fillRect(this.x - 70, 0, 140, this.y + 60); }
      if (name === 'RockGolem' && Math.random() < .6) G.parts.push({ k: 'debris', x: this.x + rand(-90, 90), y: this.y - 80, vx: rand(-40, 40), vy: rand(60, 200), life: .9, max: .9, r: rand(5, 11), c: '#6a4a30', rot: rand(0, TAU), vr: rand(-4, 4), drag: .1 });
      ctx.globalAlpha = .6; drawGlow(this.x, this.y, 240 + 80 * Math.sin(t * 8), c, .5);
      ctx.restore();
    };
  }
}

// ---------- 4. muitos tiros inimigos: desenho simples + circulo de area segura ao redor da nave ----------
{
  const eb = Art.ebullet;
  Art.ebullet = function (b) {
    if (Visual73.lod > 0 && QL() >= 1 && (b.r || 6) < 9 && !b.dead) { const R = (b.r || 6) * 1.4; ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(12,3,32,.9)'; ctx.beginPath(); ctx.arc(b.x, b.y, R + 2.5, 0, TAU); ctx.fill(); ctx.fillStyle = ok73(b.c) ? b.c : '#ff6a8a'; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x - R * .2, b.y - R * .2, R * .35, 0, TAU); ctx.fill(); ctx.restore(); return; }
    return eb.call(this, b);
  };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { const r = up.call(this, dt); Visual73.lod = G.eb.length > 70 ? 1 : (G.eb.length < 45 ? 0 : Visual73.lod); return r; };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () { hd.call(this); const p = G.player; if (!p || p.dead || G.state !== 'play' || !Visual73.lod || QL() < 1) return; ctx.save(); ctx.strokeStyle = 'rgba(127,255,190,.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -World.t * 40; ctx.beginPath(); ctx.arc(p.x, p.y, 42 + Math.sin(World.t * 4) * 3, 0, TAU); ctx.stroke(); ctx.restore(); };
}

// ---------- 5. barra do chefe: nome da furia e brilho quando leva dano ----------
{
  const bb = Visual4.bossBar;
  Visual4.bossBar = function (b) {
    const r = bb.apply(this, arguments); if (QL() < 1) return r; const w = 660, x = W / 2 - w / 2, y = 78, h = 18, ph = b.phase || 0;
    if (ph > 0) { ctx.save(); const lab = ph === 1 ? 'FÚRIA' : 'FÚRIA TOTAL', c = ph === 1 ? '#ff9a3c' : '#ff4a5a'; ctx.font = `900 11px ${FONT}`; const tw = ctx.measureText(lab).width + 18; ctx.fillStyle = 'rgba(8,3,28,.85)'; ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x + w - tw, y + h + 8, tw, 18, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, x + w - tw / 2, y + h + 17.5); ctx.restore(); }
    if (b.flash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const ex = x + w * clamp(b.ratio, 0, 1); drawGlow(ex, y + h / 2, 34, '#ffffff', .9); ctx.restore(); }
    return r;
  };
}

// ---------- 6. o fundo balanca com os golpes fortes ----------
{
  const wd = World.draw;
  World.draw = function (cx) {
    if (G.state === 'play' && G.shake > 3 && QL() >= 1) { const k = clamp(G.shake / 14, 0, 1) * 6; ctx.save(); ctx.translate(rand(-k, k), rand(-k, k)); wd.call(this, cx); ctx.restore(); return; }
    return wd.call(this, cx);
  };
}

// ---------- 7. mapa: coroa de chefe derrotado em cada setor vencido ----------
{
  const sel = Screens.select;
  Screens.select = function () {
    const r = sel.call(this); if (QL() < 1) return r; const nS = STAGES.length, cl = Save.data.cleared || {}, gr = Save.data.grades || {}, t = World.t, pos = i => [nS > 6 ? 96 + i * (1088 / (nS - 1)) : 150 + i * 196, 408 + (i % 2 ? 36 : -18)];
    for (let i = 0; i < nS; i++) { if (!cl[i]) continue; const [x, y0] = pos(i), s = i === G.sel, R = s ? (nS > 6 ? 50 : 56) : (nS > 6 ? 38 : 44), y = y0 + (s ? Math.sin(t * 3) * 5 : 0), g = gr[i] || 0, c = ['#c8b8e8', '#7fc4ff', '#7fe0a0', '#ffd36a'][g] || '#ffd36a'; ctx.save(); ctx.translate(x + R * .78, y - R * .78); ctx.fillStyle = 'rgba(10,4,32,.9)'; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(-6, -4); ctx.lineTo(-3, -1); ctx.lineTo(0, -6); ctx.lineTo(3, -1); ctx.lineTo(6, -4); ctx.lineTo(6, 3); ctx.closePath(); ctx.fill(); ctx.restore(); }
    return r;
  };
}

// ---------- 9. icones das conquistas com o mesmo brilho dos icones das cartas ----------
{
  const ai = Visual37.achIcon;
  Visual37.achIcon = function (id, x, y, s, col, t, has) { if (QL() >= 1 && ok73(col) && has) { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 8; const r = ai.call(this, id, x, y, s, col, t, has); ctx.restore(); return r; } return ai.call(this, id, x, y, s, col, t, has); };
}

// ---------- 10. botao do modo foto na pausa ----------
{
  const ps = Screens.pause;
  Screens.pause = function () {
    const r = ps.apply(this, arguments); if (UI.button('photoBtn', 60, 552, 380, 44, 'MODO FOTO  (F10)', { size: 17 })) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10' })); return r;
  };
}
