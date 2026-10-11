'use strict';
// ---------- polimento grafico 5: volume nos inimigos, entradas dos chefes, cenas animadas, tunel de dobra, pausa cinematografica ----------
const Visual9 = { fxKey: null, fxT: 0 };

// ===== volume e luz colorida nos inimigos =====
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    ae.call(this, e);
    if (QL() < 1 || ['dummy', 'rod', 'boulder'].includes(e.type)) return;
    const r = e.rad, p = G.player, wc = (p && WEAPONS[p.weapon] && WEAPONS[p.weapon].c) || '#fff';
    ctx.save(); ctx.translate(e.x, e.y); ctx.beginPath(); ctx.arc(0, 0, r * .96, 0, TAU); ctx.clip();
    const hl = ctx.createRadialGradient(-r * .38, -r * .42, 1, -r * .38, -r * .42, r * .9); hl.addColorStop(0, 'rgba(255,255,255,.34)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hl; ctx.fillRect(-r, -r, r * 2, r * 2);
    const sh = ctx.createRadialGradient(r * .45, r * .5, r * .1, r * .3, r * .35, r * 1.1); sh.addColorStop(0, 'rgba(0,0,20,0)'); sh.addColorStop(1, 'rgba(0,0,20,.35)');
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = sh; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
    ctx.save(); ctx.translate(e.x, e.y); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * .94, Math.PI * .85, Math.PI * 1.55); ctx.stroke();
    if (e.hit > 0) drawGlow(0, 0, r * 1.7, wc, Math.min(1, e.hit * 10) * .75);
    ctx.restore();
  };
}

// ===== entrada propria de cada chefe =====
{
  const bdw = Visual3.bossDraw;
  Visual3.bossDraw = function (b) {
    if (b.state === 'intro') {
      const k = clamp((b.introT || 0) / 3, 0, 1); ctx.globalAlpha = clamp(k * 2.2, 0, 1);
      if (b.name === 'Sol-Guardião') { const s = .25 + .75 * easeOut(k); ctx.translate(b.x, b.y); ctx.scale(s, s); ctx.translate(-b.x, -b.y); }
      if (b.name === 'Eco do Olienzinho' && Math.random() < .35) ctx.globalAlpha *= .3;
    }
    bdw.call(this, b);
  };
  const ba = Visual.bossAura;
  Visual.bossAura = function (b) {
    ba.call(this, b); if (b.state !== 'intro' || QL() < 1) return;
    const t = b.introT || 0, k = clamp(t / 3, 0, 1), env = Math.sin(k * Math.PI), n = b.name;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (n === 'Nave-Mãe Zangão') { // portal laranja se abrindo no ceu
      for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(W / 2, 20); ctx.rotate(t * (1 + i * .3) * (i % 2 ? -1 : 1)); ctx.strokeStyle = i % 2 ? '#ffb340' : '#ff7a2a'; ctx.lineWidth = 4; ctx.globalAlpha = env * .8; ctx.setLineDash([30, 16]); ctx.beginPath(); ctx.ellipse(0, 0, (120 + i * 46) * easeOut(k), (36 + i * 14) * easeOut(k), 0, 0, TAU); ctx.stroke(); ctx.restore(); }
      drawGlow(W / 2, 30, 300 * env, '#ff7a2a', .6); if (Math.random() < .5) G.parts.push({ x: W / 2 + rand(-160, 160), y: 30, vx: rand(-30, 30), vy: rand(120, 300), life: .8, max: .8, r: rand(2, 5), c: '#ffb340', drag: .5 });
    } else if (n === 'Gigante de Rocha') { // pedaços se juntando
      for (let i = 0; i < 18; i++) { const a = hsh(i) * TAU, d = (1 - easeOut(k)) * (500 + hsh(i + 5) * 300), x = b.x + Math.cos(a) * d, y = b.y + Math.sin(a) * d * .7, s = 12 + hsh(i + 2) * 22; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = clamp(k * 3, 0, 1); ctx.fillStyle = '#3a2a40'; ctx.strokeStyle = '#c8a0b8'; ctx.lineWidth = 2; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.beginPath(); for (let q = 0; q < 6; q++) { const aa = q / 6 * TAU; ctx.lineTo(Math.cos(aa) * s * (.7 + hsh(i * 3 + q) * .5), Math.sin(aa) * s * (.7 + hsh(i * 3 + q) * .5)); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      if (Math.random() < .4) shake(5);
    } else if (n === 'Olho da Tempestade') { // fenda no ceu
      const w = 8 + 90 * env; const g = ctx.createLinearGradient(b.x - w, 0, b.x + w, 0); g.addColorStop(0, 'rgba(255,122,200,0)'); g.addColorStop(.5, 'rgba(255,255,255,' + env + ')'); g.addColorStop(1, 'rgba(255,122,200,0)'); ctx.fillStyle = g; ctx.fillRect(b.x - w, 0, w * 2, b.y + 40);
      if (Math.random() < .5) zap(b.x, 0, b.x + rand(-160, 160), b.y, 8, 22, '#9fe8ff', 2);
    } else if (n === 'Sol-Guardião') { // explosao de luz
      drawGlow(b.x, b.y, 150 + 500 * env, '#ffd36a', .5); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + t, l = 200 + 500 * env; ctx.globalAlpha = env * .4; ctx.strokeStyle = '#ffcf8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x + Math.cos(a) * 60, b.y + Math.sin(a) * 60); ctx.lineTo(b.x + Math.cos(a) * l, b.y + Math.sin(a) * l); ctx.stroke(); }
    } else if (n === 'Eco do Olienzinho') { // falha de imagem
      G.glitchT = Math.max(G.glitchT || 0, .08 * env + .02); for (let i = 0; i < 6; i++) { ctx.globalAlpha = env * .5; ctx.fillStyle = i % 2 ? '#ff2a6a' : '#2ad4ff'; ctx.fillRect(b.x - 200 + rand(-30, 30), b.y - 100 + rand(0, 200), rand(80, 360), rand(2, 10)); }
    } else if (n === 'O Vazio') { // escuridao avanca das bordas
      ctx.globalCompositeOperation = 'source-over'; const g = ctx.createRadialGradient(W / 2, H / 2, H * .2, W / 2, H / 2, H * .9); g.addColorStop(0, 'rgba(0,0,10,0)'); g.addColorStop(1, 'rgba(0,0,10,' + .75 * env + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(154,99,255,.6)'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 8; i++) { const left = i % 2 === 0, y0 = H * (.1 + i * .11); ctx.beginPath(); for (let q = 0; q <= 10; q++) { const f = q / 10 * easeOut(k), x = (left ? 0 : W) + (left ? 1 : -1) * f * (b.x ? Math.abs(b.x - (left ? 0 : W)) : 600), y = y0 + (b.y - y0) * f + Math.sin(t * 3 + i + f * 5) * 20; q ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    }
    ctx.restore();
  };
}

// ===== cenas animadas nos momentos-chave =====
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    sb.call(this); const S = G.story, pg = S && S.pages[S.i], fx = pg && pg.fx;
    if (fx !== Visual9.fxKey) { Visual9.fxKey = fx || null; Visual9.fxT = 0; } if (!fx) return; Visual9.fxT += 1 / 60;
    const t = Visual9.fxT; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (fx === 'orbiAscend') {
      const k = clamp(t / 6, 0, 1), pt = u => { const x = lerp(220, W / 2, u) + Math.sin(u * 3) * 60 * (1 - u), y = lerp(H - 90, 130, easeOut(u)); return [x, y]; };
      for (let i = 0; i < 28; i++) { const [x, y] = pt(Math.max(0, k - i * .012)); ctx.globalAlpha = (1 - i / 28) * .6; drawGlow(x, y, 26 * (1 - i / 40), '#7fe0ff', .9); }
      const [ox, oy] = pt(k); ctx.globalAlpha = 1; drawGlow(ox, oy, 70, '#bff0ff', .9); ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(ox, oy, 15, 0, TAU); ctx.fill();
      for (let i = 0; i < 80; i++) { const ti = 6 + hsh(i) * 3.5, a = clamp((t - ti) / .5, 0, 1); if (a <= 0) continue; const x = hsh(i + 100) * W, y = hsh(i + 200) * H * .85, r = 6 + hsh(i + 300) * 14; ctx.globalAlpha = a * (.5 + .5 * Math.sin(t * 3 + i)); drawGlow(x, y, r * 3, i % 3 ? '#ffe9a8' : '#bff0ff', .8); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke(); }
      if (t > 6) { ctx.globalAlpha = Math.min(.35, (t - 6) * .12); ctx.fillStyle = '#fff4d0'; ctx.fillRect(0, 0, W, H); }
    } else if (fx === 'voidMelt') {
      const k = clamp(t / 6, 0, 1); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(2,0,10,' + (.85 * (1 - k)) + ')'; ctx.beginPath(); ctx.arc(W / 2, H * .45, 150 * (1 - k * .9), 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 90; i++) { const a = hsh(i) * TAU, r0 = hsh(i + 7) * 150 * (1 - k * .5), life = ((t * .4 + hsh(i + 20)) % 1), x = W / 2 + Math.cos(a) * r0 + Math.sin(life * 6 + i) * 20, y = H * .45 + Math.sin(a) * r0 * .7 - life * 360; ctx.globalAlpha = (1 - life) * .8 * Math.min(1, t / 1.5); ctx.fillStyle = life < .4 ? '#9a63ff' : '#ffe9a8'; ctx.beginPath(); ctx.arc(x, y, 2 + hsh(i + 3) * 3, 0, TAU); ctx.fill(); }
      drawGlow(W / 2, H * .45, 260 * k, '#ffe9a8', .35 * k);
    } else if (fx === 'dawn') {
      const k = clamp(t / 7, 0, 1); drawGlow(W / 2, H + 40, 900 * easeOut(k), '#ffcf6b', .55); drawGlow(W / 2, H, 420 * easeOut(k), '#ffffff', .4);
      ctx.save(); ctx.translate(W / 2, H + 30); ctx.rotate(t * .06); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 6; for (let i = 0; i < 16; i++) { ctx.rotate(TAU / 16); ctx.globalAlpha = .08 * easeOut(k); ctx.beginPath(); ctx.moveTo(100, 0); ctx.lineTo(1400, 0); ctx.stroke(); } ctx.restore();
    }
    ctx.restore();
  };
}

// ===== tunel de dobra na tela de carregamento =====
{
  const ld = Screens.loading;
  Screens.loading = function () {
    const L = G.load; if (L && QL() >= 1) {
      const t = L.t, s = STAGES[L.idx], cx = W / 2, cy = H / 2; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let i = 0; i < 140; i++) { const a = hsh(i) * TAU, sp = .35 + hsh(i + 3) * .7, ph = (t * sp + hsh(i + 9)) % 1, r = ph * ph * 1100, len = Math.min(r, 20 + ph * ph * 220 * (1 + t * .8)); ctx.globalAlpha = Math.min(1, ph * 1.6) * .6; ctx.strokeStyle = i % 4 ? '#ffffff' : s.tint; ctx.lineWidth = .8 + ph * 2.4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - len), cy + Math.sin(a) * (r - len) * .62); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .62); ctx.stroke(); }
      drawGlow(cx, cy, 240, s.tint, .35 + .1 * Math.sin(t * 6)); ctx.restore();
    }
    ld.call(this);
    if (L && L.t > L.dur - .35) { ctx.save(); ctx.globalAlpha = clamp((L.t - (L.dur - .35)) / .35, 0, 1); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  };
}

// ===== pausa e opcoes no estilo do menu =====
Screens.pause = function () {
  this.dim(.62); const t = World.t, X0 = 120;
  ctx.fillStyle = '#ffb340'; ctx.fillRect(X0 + 4, 150, 64, 4); txt('JOGO', X0 + 4, 164, 18, '#cdb8ff', 'left', 900);
  ctx.save(); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 36; txt('PAUSADO', X0, 186, 84, '#fff', 'left', 900); ctx.restore();
  let y = 330;
  if (this.menuItem('resume', 'CONTINUAR', X0, y, 46, '') || ((Input.pressed('escape') || Input.pressed('p')) && !G.pausedThisFrame)) { G.state = 'play'; Snd.play('uiSelect'); }
  if (this.menuItem('opt', 'OPÇÕES', X0, y + 78, 32, '')) { G.setBack = 'pause'; G.state = 'settings'; }
  if (this.menuItem('quit', 'SAIR PARA O MAPA', X0, y + 130, 32, '')) Game.quitRun();
  txt('as estrelas coletadas ficam com você', X0 + 4, y + 184, 15, '#8f84c4', 'left', 700);
  if (G.relic) { const r = RELICS.find(q => q.id === G.relic); if (r) { txt('RELÍQUIA', 820, 330, 14, '#ffb340', 'left', 900); Visual2.upIcon(r.icon, 860, 400, 28, '#ffb340', false); txt(r.name, 906, 380, 26, '#fff', 'left', 800); txt(r.desc, 906, 416, 15, '#cdb8ff', 'left', 700); } }
  if (G.route) { const R = ROUTES.find(q => q.id === G.route); if (R) txt(R.name, 820, 470, 18, R.c, 'left', 900); }
  this.bars();
};
{ const st = Screens.settings; Screens.settings = function () { st.call(this); this.thinFrame(); }; }
