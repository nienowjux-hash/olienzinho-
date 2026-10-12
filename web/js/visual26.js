'use strict';
// ---------- tela de titulo nova (o Coracao de Luz) e tela de preparo da jornada (dificuldade e Jogo Novo+) ----------
Screens.titleBackdrop = function () {
  const t = World.t, tt = t - (G.titleStart ?? t), dt = Math.min(.05, t - (this.tl ?? t)); this.tl = t;
  const mx = (Input.mouse.x - W / 2) / W, my = (Input.mouse.y - H / 2) / H, ql = QL();
  ctx.save(); const z = 1.05 - easeOut(tt / 7) * .04; ctx.translate(W / 2 - mx * 12, H / 2 - my * 8); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = lin(0, 0, 0, H, [[0, '#070226'], [.45, '#1c0b52'], [.8, '#3a1470'], [1, '#5a1f78']]); ctx.fillRect(-60, -60, W + 120, H + 120);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(1010 - mx * 30, 330 - my * 20, 760, '#ffb340', .34); drawGlow(280, 640, 640, '#ff4ad0', .2); drawGlow(150, 120, 560, '#33c4ff', .17); drawGlow(1100, 700, 520, '#7a3aff', .22);
  ctx.globalAlpha = .3; ctx.drawImage(World.nebA, -60 - mx * 20, 0, W + 120, H); ctx.globalAlpha = 1;
  // faixas de aurora
  if (ql >= 1) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-60, 0); for (let x = -60; x <= W + 60; x += 40) ctx.lineTo(x, 90 + k * 55 + Math.sin(x * .006 + t * .35 + k * 2) * 40 - my * 10); ctx.lineTo(W + 60, 0); ctx.closePath(); const g = ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.7, ['rgba(80,240,200,.10)', 'rgba(255,120,220,.09)', 'rgba(120,160,255,.10)'][k]); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fill(); }
  ctx.lineCap = 'round'; ctx.strokeStyle = '#f2ecff';
  for (const s of World.stars) { const x = s.x - mx * 90 * s.par * 10; ctx.globalAlpha = (.3 + s.l * .3) * (.6 + .4 * Math.sin(t * 2 + s.ph)); ctx.lineWidth = s.r * 1.3; ctx.beginPath(); ctx.moveTo(x, s.y); ctx.lineTo(x + .1, s.y); ctx.stroke(); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // planetas ao longe
  for (const [px, py, r, c1, c2, ring] of [[1180, 600, 86, '#ff9a6a', '#7a2a5a', true], [250, 230, 48, '#7fd8ff', '#1a3a8a', false]]) {
    const x = px - mx * 40, y = py - my * 24; ctx.save(); ctx.translate(x, y);
    if (ring) { ctx.strokeStyle = 'rgba(255,220,200,.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.7, r * .45, -.3, Math.PI, TAU); ctx.stroke(); }
    ctx.fillStyle = rdl(-r * .4, -r * .4, r * .1, r * 1.1, [[0, c1], [1, c2]]); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(8,0,30,.45)'; ctx.beginPath(); ctx.arc(r * .35, r * .3, r * 1.02, 0, TAU); ctx.globalCompositeOperation = 'source-atop'; ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    if (ring) { ctx.strokeStyle = 'rgba(255,220,200,.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.7, r * .45, -.3, 0, Math.PI); ctx.stroke(); }
    ctx.restore();
  }
  // o Coracao de Luz
  const cx = 1010 - mx * 34, cy = 330 - my * 22, beat = Math.max(0, Math.sin(t * 2.2)) ** 3, s = 150 * (1 + beat * .05), ha = clamp((tt - .3) / 1.6, 0, 1);
  ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = ha;
  ctx.globalCompositeOperation = 'lighter'; ctx.save(); ctx.rotate(t * .06); for (let i = 0; i < 28; i++) { ctx.rotate(TAU / 28); ctx.fillStyle = 'rgba(255,225,160,' + (.05 + .04 * Math.sin(t * 1.5 + i)) + ')'; ctx.beginPath(); ctx.moveTo(s * .9, -10); ctx.lineTo(s * 4.2, 0); ctx.lineTo(s * .9, 10); ctx.fill(); } ctx.restore();
  drawGlow(0, 0, 520, '#ffd36a', .45 + beat * .2); drawGlow(0, 0, 260, '#ffffff', .35);
  for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(t * (.18 + k * .07) * (k % 2 ? -1 : 1)); ctx.strokeStyle = ['#ffd36a', '#ff9ad8', '#9fe8ff'][k]; ctx.globalAlpha = ha * .55; ctx.lineWidth = 3; ctx.setLineDash([20, 14 + k * 6]); ctx.beginPath(); ctx.ellipse(0, 0, s * (1.35 + k * .22), s * (1.0 + k * .15), .3, 0, TAU); ctx.stroke(); ctx.restore(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = ha;
  ctx.fillStyle = rdl(-s * .35, -s * .45, 6, s * 1.5, [[0, '#ffffff'], [.35, '#fff0c8'], [.7, '#ffb36a'], [1, '#d8508a']]); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(0, s * .95); ctx.bezierCurveTo(-s * 1.55, s * .1, -s * 1.15, -s * 1.05, 0, -s * .48); ctx.bezierCurveTo(s * 1.15, -s * 1.05, s * 1.55, s * .1, 0, s * .95); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.clip(); ctx.globalAlpha = ha * .5; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-s * .5, -s * .35, s * .32, s * .16, -.6, 0, TAU); ctx.fill(); ctx.restore();
  ctx.globalAlpha = ha; for (let i = 0; i < 10; i++) { const a = t * .5 + i / 10 * TAU, r = s * (1.7 + .12 * Math.sin(t * 2 + i)); Cine.star(Math.cos(a) * r, Math.sin(a) * r * .7, 5 + (i % 3) * 3, t + i, i % 2 ? '#ffe9a8' : '#ffffff', .85 * ha); }
  ctx.restore();
  // brilhos subindo do coracao
  this.motes2 = this.motes2 || []; if (ha > .5 && Math.random() < dt * 22) this.motes2.push({ x: cx + rand(-120, 120), y: cy + rand(-60, 100), vx: rand(-20, 20), vy: -rand(40, 110), life: rand(1.2, 2.6), max: 2.6, r: rand(2, 5) });
  ctx.globalCompositeOperation = 'lighter'; for (const m of this.motes2) { m.life -= dt; m.x += m.vx * dt; m.y += m.vy * dt; drawGlow(m.x, m.y, m.r * 3, '#ffe9a8', clamp(m.life / m.max, 0, 1) * .8); } this.motes2 = this.motes2.filter(m => m.life > 0).slice(-90);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // cordilheira em silhueta embaixo
  ctx.fillStyle = '#05010f'; ctx.beginPath(); ctx.moveTo(-60, H + 40); ctx.lineTo(-60, 650); for (let x = -60; x <= W + 60; x += 60) ctx.lineTo(x - mx * 40, 640 + Math.sin(x * .011) * 26 + Math.sin(x * .031) * 14 + 30 - my * 14); ctx.lineTo(W + 60, H + 40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,190,120,.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = -60; x <= W + 60; x += 60) { const y = 640 + Math.sin(x * .011) * 26 + Math.sin(x * .031) * 14 + 30 - my * 14; x === -60 ? ctx.moveTo(x - mx * 40, y) : ctx.lineTo(x - mx * 40, y); } ctx.stroke();
  // o Olienzinho e o Orbi voando rumo ao coracao
  const fl = easeOut(clamp((tt - .4) / 3.2, 0, 1)), sx = lerp(-240, 560, fl) - mx * 40, sy = lerp(840, 500, fl) + Math.sin(t * 1.5) * 9 * fl - my * 20, ang = .62 - (1 - fl) * .22;
  this.trail = this.trail || []; const back = [-Math.sin(ang), Math.cos(ang)], nx = sx + back[0] * 64, ny = sy + back[1] * 64;
  for (let i = 0; i < 2; i++) this.trail.push({ x: nx + rand(-4, 4), y: ny + rand(-4, 4), vx: back[0] * rand(90, 240) + rand(-30, 30), vy: back[1] * rand(90, 240) + rand(-30, 30), life: rand(.35, .7), c: Math.random() < .5 ? '#ffb340' : '#ffe9a8' });
  for (const q of this.trail) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; } this.trail = this.trail.filter(q => q.life > 0).slice(-160);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const q of this.trail) drawGlow(q.x, q.y, 7 + q.life * 14, q.c, q.life * 1.2); drawGlow(sx, sy, 170, '#8b4dff', .45); ctx.restore(); ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang); Art.ship(0, 0, { pal: skinOf(Save.data.loadout.skin).pal, vx: 0, t, lookx: .8, looky: -.5, blinkT: this.blinkAt(t), scale: 1.1, boost: .9 }); ctx.restore();
  ctx.save(); ctx.translate(sx - 120, sy + 70 + Math.sin(t * 2 + 1) * 8); ctx.rotate(ang * .8); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 80, '#7fe0ff', .4); ctx.globalCompositeOperation = 'source-over'; Art.orbi(0, 0, { vx: 0, t, scale: .8, lookx: .8, looky: -.5, blinkT: 0, inv: 0, sx: 1, sy: 1 }); ctx.restore();
  ctx.restore();
  ctx.fillStyle = rdl(W / 2, H / 2, H * .5, H * 1.0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.45)']]); ctx.fillRect(0, 0, W, H);
  // sombra suave atras do menu para a leitura
  const sg = ctx.createLinearGradient(0, 0, 640, 0); sg.addColorStop(0, 'rgba(6,2,24,.55)'); sg.addColorStop(1, 'rgba(6,2,24,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, 640, H);
};

// ---------- preparo da jornada: Jogo Novo+ e dificuldade ----------
Screens.playsetup = function () {
  const s = Save.data.settings, t = World.t; this.dim(.55);
  txt('NOVA JORNADA', W / 2, 40, 54, '#fff', 'center'); txt('Escolha como quer jogar antes de abrir o mapa.', W / 2, 108, 18, '#ffb340', 'center', 800);
  UI.panel(170, 150, 940, 340, { r: 26 });
  txt('DIFICULDADE', 220, 174, 22, '#ffb340', 'left', 900); const n = DIFF.length, bw = (840 - (n - 1) * 10) / n;
  DIFF.forEach((d, i) => { const sel = (s.diff ?? 1) === i; if (UI.button('psd' + i, 220 + i * (bw + 10), 214, bw, 54, (sel ? '✓ ' : '') + d.name, { size: 18, color: sel ? '#9a63ff' : undefined })) { s.diff = i; Save.save(); } });
  UI.wrap(DIFF[s.diff ?? 1].desc, 220, 284, 760, 24, 18, '#e2d4ff');
  if ((s.diff ?? 1) === 4 && UI.button('psadj', 900, 170, 160, 34, 'AJUSTAR ▸', { size: 15 })) { G.customBack = 'playsetup'; Snd.play('uiSelect'); G.state = 'custom'; }
  txt('JOGO NOVO+', 220, 350, 22, '#ffb340', 'left', 900);
  const ok = !!Save.data.won, on = ok && !!Save.data.ngpOn;
  if (UI.button('psng', 220, 388, 420, 58, ok ? (on ? '✓ JOGO NOVO+: LIGADO' : 'JOGO NOVO+: DESLIGADO') : '🔒 JOGO NOVO+: BLOQUEADO', { size: 20, color: on ? '#ff9a3c' : undefined, disabled: !ok }) || (ok && Input.pressed('n'))) { Save.data.ngpOn = !Save.data.ngpOn; Save.save(); Snd.play('uiSelect'); }
  UI.wrap(ok ? 'Inimigos e chefes mais fortes, golpes remixados e relíquias novas. Seu progresso é mantido.' : 'Libera depois de derrotar o Vazio na fase 6.', 670, 392, 400, 22, 16, ok ? '#cdb8ff' : '#8a7fb0');
  if (UI.button('psgo', W / 2 + 10, 540, 330, 62, 'COMEÇAR', { size: 28, color: '#9a63ff' })) { Snd.play('uiSelect'); Game.goSelect(); }
  if (UI.button('back', W / 2 - 340, 540, 330, 62, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goTitle(); }
};
