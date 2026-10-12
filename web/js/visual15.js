'use strict';
// ---------- perseguicao, eventos novos, clima, alto contraste, rachaduras nos chefes e vitoria animada ----------
const Visual15 = {};

// ===== perseguicao (momento especial) =====
SPN.chase = ['PERSEGUIÇÃO!', 'FUJA DO DEVORADOR: NÃO FIQUE EMBAIXO', '#ff5a3c', 12];
{
  const sr = Visual8.spRun;
  Visual8.spRun = function (dt) {
    const sp = G.sp; if (sp.type !== 'chase') return sr.call(this, dt);
    sp.t += dt; const k = clamp((sp.t - 1) / (sp.dur - 1), 0, 1), p = G.player;
    sp.top = sp.t < 1 ? H + 60 : H + 50 - 250 * Math.sin(k * Math.PI); World.boost = Math.max(World.boost, .8);
    sp.sp = (sp.sp ?? 0) - dt; if (sp.sp <= 0 && sp.t > 1.4 && sp.t < sp.dur) { sp.sp = .55; for (let i = 0; i < 3; i++) spawnEnemy('bit', rand(80, W - 80), -30 - i * 30, { noElite: true }); }
    if (!p.dead && p.y > sp.top - 24) { p.y -= 300 * dt; sp.dt = (sp.dt ?? 0) - dt; if (sp.dt <= 0) { sp.dt = .8; G.hitSrc = 'contact:chase'; hurtPlayer(1); } }
    if (sp.t >= sp.dur + 1.2) { sp.on = false; if (G.stats.hits === sp.hits0) { popup(W / 2, 220, 'ESCAPOU SEM DANO! BÔNUS', '#ffe9a8', 34); dropPickup('cap', W / 2, 40, pick(['rapid', 'double', 'magnet', 'aegis'])); for (let i = 0; i < 4; i++) dropPickup('coin', W / 2 + rand(-80, 80), 40, 2); Snd.play('stamp'); } }
  };
  const ss = Visual8.spStart; Visual8.spStart = function () { ss.call(this); };
  SRC_NAME.chase = 'Devorador'; SRC_TIP.chase = 'Na perseguição, fique sempre acima da linha da escuridão que sobe.';
}
Visual15.chaseDraw = function () {
  const sp = G.sp; if (!sp || !sp.on || sp.type !== 'chase' || sp.top === undefined || sp.top > H + 30) return;
  const t = World.t, top = sp.top; ctx.save(); const g = ctx.createLinearGradient(0, top - 60, 0, top + 40); g.addColorStop(0, 'rgba(255,60,40,0)'); g.addColorStop(1, 'rgba(255,60,40,.35)'); ctx.fillStyle = g; ctx.fillRect(0, top - 60, W, 100);
  ctx.fillStyle = '#050010'; ctx.beginPath(); ctx.moveTo(0, H + 40); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, top + Math.sin(x * .03 + t * 3) * 14 + (Math.floor(x / 20) % 2 ? 22 : -8)); ctx.lineTo(W, H + 40); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; for (const ex of [W * .35, W * .65]) { drawGlow(ex, top + 50, 70, '#ff3a2a', .8); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.ellipse(ex, top + 50, 16, 8, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
};

// ===== eventos novos =====
const CEV = { gravmeteor: ['CHUVA GRAVITACIONAL', 'AS ROCHAS CURVAM PARA O CENTRO', '#c8a0b8', 9], hudstorm: ['TEMPESTADE DE INTERFERÊNCIA', 'SEU PAINEL VAI FALHAR', '#7fe0ff', 7], bittide: ['MARÉ DE BITS', 'ONDAS DE BITS ATRAVESSAM A TELA', '#7fffa0', 10] };
{
  const es = Events.start; Events.start = function (name) { const d = CEV[name]; if (!d) return es.call(this, name); G.cev = { name, t: 0, dur: d[3], n: 0 }; Events.banner = { t: 0, title: d[0], sub: d[1], c: d[2] }; Snd.play('bossWarn'); G.evWarn = 1.6; G.evCol = d[2]; };
  const add = (i, at, name) => { const ev = STAGES[i].events; ev.push({ at, name }); ev.sort((a, b) => a.at - b.at); };
  add(1, 56, 'gravmeteor'); add(2, 60, 'hudstorm'); add(3, 52, 'bittide'); add(4, 58, 'gravmeteor'); add(6, 56, 'hudstorm'); add(7, 44, 'bittide'); add(8, 62, 'gravmeteor');
}
Visual15.update = function (dt) {
  const c = G.cev; if (!c || G.state !== 'play') { if (!c) G.hudStatic = 0; return; }
  c.t += dt; c.n += dt;
  if (c.name === 'gravmeteor') { if (c.n > .5) { c.n = 0; Events.spawnMeteor(); const r = G.enemies[G.enemies.length - 1]; if (r && r.type === 'rock') r.grav = true; } }
  else if (c.name === 'hudstorm') { G.hudStatic = Math.sin(clamp(c.t / c.dur, 0, 1) * Math.PI); if (c.n > 2) { c.n = 0; Events.hazardRect(clamp(G.player.x + rand(-40, 40), 80, W - 80), H / 2, 100, H, .9, .3, '#7fe0ff', 'bolt'); } }
  else if (c.name === 'bittide') { if (c.n > 2.1) { c.n = 0; const gap = (Math.random() * 11) | 0; for (let i = 0; i < 11; i++) if (Math.abs(i - gap) > 0) spawnEnemy('bit', 60 + i * 106, -30, { bx: 60 + i * 106, noElite: true }); } }
  for (const e of G.enemies) if (e.grav && !e.dead) e.vx += (W / 2 - e.x) * .9 * dt;
  if (c.t > c.dur) { G.cev = null; G.hudStatic = 0; }
};
Visual15.hudDraw = function () {
  const s = G.hudStatic; if (!(s > .05)) return; const t = World.t; ctx.save();
  for (const [x, y, w, h] of [[0, 0, 360, 160], [0, H - 130, 440, 130], [W - 300, 0, 300, 220]]) {
    if (Math.sin(t * 17 + x) > -.2 + (1 - s)) { ctx.fillStyle = 'rgba(2,0,14,' + .86 * s + ')'; ctx.fillRect(x, y, w, h); }
    ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { ctx.globalAlpha = s * .5; ctx.fillStyle = Math.random() < .5 ? '#7fe0ff' : '#ffffff'; ctx.fillRect(x + Math.random() * w, y + Math.random() * h, 10 + Math.random() * 60, 2 + Math.random() * 3); }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
};

// ===== clima das fases =====
Visual15.weather = function () {
  if (QL() < 2 || Save.data.settings.contrast) return; const t = World.t, st = G.stage ? G.stage.id : 0, cyc = t % 46;
  if (cyc < 26 || cyc > 44) return; const k = Math.sin((cyc - 26) / 18 * Math.PI), kind = ['aurora', 'shower', 'storm', 'wind', 'snow', 'aurora', 'aurora', 'snow', 'shower'][st] || 'aurora';
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (kind === 'aurora') { for (let i = 0; i < 3; i++) { const c = ['#5af0a0', '#ff7ac8', '#7fd8ff'][i]; ctx.beginPath(); ctx.moveTo(-40, 0); for (let x = -40; x <= W + 40; x += 30) ctx.lineTo(x, 80 + i * 50 + Math.sin(x * .008 + t * .5 + i * 2) * 46); ctx.lineTo(W + 40, 0); ctx.closePath(); const g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.6, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = .16 * k; ctx.fillStyle = g; ctx.fill(); } }
  else if (kind === 'shower') { ctx.strokeStyle = '#e8fbff'; ctx.lineCap = 'round'; for (let i = 0; i < 16; i++) { const x = ((t * 640 + i * 190) % (W + 500)) - 100, y = ((t * 420 + i * 97) % (H + 260)) - 130, l = 90 + hsh(i) * 90; ctx.globalAlpha = .5 * k; ctx.lineWidth = 2; const g = ctx.createLinearGradient(x, y, x + l * .8, y - l * .6); g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l * .8, y - l * .6); ctx.stroke(); } }
  else if (kind === 'storm') { ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(10,0,30,' + .22 * k + ')'; ctx.fillRect(0, 0, W, H); if (hsh(Math.floor(t * 3)) > .88) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .18 * k; ctx.fillStyle = '#d8e8ff'; ctx.fillRect(0, 0, W, H); } }
  else if (kind === 'wind') { ctx.strokeStyle = '#ffcf8a'; ctx.lineWidth = 2; for (let i = 0; i < 20; i++) { const y = hsh(i + 33) * H, x = W - ((t * (500 + hsh(i) * 400) + i * 211) % (W + 400)) + 100; ctx.globalAlpha = .25 * k; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 170, y + 6); ctx.stroke(); } }
  else { ctx.fillStyle = '#e8f4ff'; for (let i = 0; i < 60; i++) { const x = hsh(i + 5) * W + Math.sin(t + i) * 24, y = ((t * (40 + hsh(i) * 50) + hsh(i + 9) * H) % (H + 20)) - 10; ctx.globalAlpha = .6 * k; ctx.beginPath(); ctx.arc(x, y, 1.5 + hsh(i + 3) * 2.5, 0, TAU); ctx.fill(); } }
  ctx.restore();
};

// ===== alto contraste =====
Visual15.veil = function () { if (!Save.data.settings.contrast) return; ctx.save(); ctx.fillStyle = 'rgba(0,0,10,.6)'; ctx.fillRect(0, 0, W, H); ctx.restore(); };
{
  const ap = Art.pbullet;
  Art.pbullet = function (b) { if (Save.data.settings.contrast && !b.kind) { ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, TAU); ctx.fill(); ctx.restore(); } return ap.call(this, b); };
}

// ===== rachaduras e marcas de queimadura nos chefes antigos =====
{
  const ba = Visual.bossAura, OLD = ['Nave-Mãe Zangão', 'Gigante de Rocha', 'Olho da Tempestade', 'Sol-Guardião'];
  Visual.bossAura = function (b) {
    ba.call(this, b); if (b.state !== 'fight' || !OLD.includes(b.baseName || b.name) || QL() < 1) return;
    const r = b.ratio, R = b.rad || 110, t = World.t; ctx.save(); ctx.translate(b.x + (b.shx || 0), b.y + (b.shy || 0)); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (r < .4) for (let i = 0; i < 3; i++) { const a = hsh(i + 600) * TAU, d = R * (.2 + hsh(i + 610) * .4), g = ctx.createRadialGradient(Math.cos(a) * d, Math.sin(a) * d * .7, 2, Math.cos(a) * d, Math.sin(a) * d * .7, R * .3); g.addColorStop(0, 'rgba(10,0,0,.5)'); g.addColorStop(1, 'rgba(10,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d * .7, R * .3, 0, TAU); ctx.fill(); }
    const nC = r < .8 ? Math.min(9, 2 + Math.floor((.8 - r) * 14)) : 0;
    for (let i = 0; i < nC; i++) {
      const a = hsh(i + 500) * TAU, r0 = R * (.1 + hsh(i + 510) * .25), pts = [[Math.cos(a) * r0, Math.sin(a) * r0 * .75]]; let aa = a;
      for (let k = 0; k < 3; k++) { aa += (hsh(i * 7 + k) - .5) * .9; const rr = r0 + R * (.18 + hsh(i + k * 3) * .12) * (k + 1); pts.push([Math.cos(aa) * rr, Math.sin(aa) * rr * .75]); }
      ctx.beginPath(); pts.forEach((p, q) => q ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 4.5; ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = b.col; ctx.globalAlpha = .45 + .25 * Math.sin(t * 4 + i); ctx.lineWidth = 2; ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    ctx.restore();
  };
}

// ===== tela de vitoria animada =====
{
  const vi = Screens.victory;
  Screens.victory = function () {
    const t = World.t - (G.victT ?? World.t), idx = Math.floor(t / 7) % 6; if (Visual15.vIdx !== idx) { Visual15.vIdx = idx; World.setStage(STAGES[idx].pal); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 70; i++) { const x = hsh(i + 700) * W + Math.sin(t * 1.5 + i) * 30, y = ((t * (60 + hsh(i + 710) * 90) + hsh(i + 720) * H) % (H + 40)) - 20, c = ['#ffe9a8', '#ff9ac0', '#9fe8ff', '#ffffff', '#b98cff'][i % 5]; ctx.globalAlpha = .7; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + i); ctx.fillStyle = c; ctx.fillRect(-4, -2, 8, 4); ctx.restore(); }
    const px = ((t * 150) % (W + 500)) - 250, py = H * .86 + Math.sin(t * 1.4) * 22; ctx.globalAlpha = .9; ctx.globalCompositeOperation = 'source-over';
    Art.ship(px, py, { vx: 200, t, scale: .6, boost: 1, lookx: 1, looky: 0, blinkT: 0 }); Art.orbi(px - 84, py + 10 + Math.sin(t * 1.9) * 8, { vx: 200, t, scale: .65, lookx: 1, looky: 0, blinkT: 0 });
    ctx.restore(); vi.call(this);
  };
}

// ===== ajuste das opcoes: 4 botoes de acessibilidade =====
{
  const st = Screens.settings;
  Screens.settings = function () {
    st.call(this); const s = Save.data.settings;
    if (UI.button('contr', 360, 580, 180, 38, s.contrast ? 'CONTRASTE: SIM' : 'CONTRASTE: NÃO', { size: 12, color: s.contrast ? '#9a63ff' : undefined })) { s.contrast = !s.contrast; Save.save(); }
  };
}
