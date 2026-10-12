'use strict';
// ---------- polimento grafico 2: distorcao, familias de inimigos, cinematicas de fase, luz, rastros, icones, qualidade ----------
const Visual2 = {};
const QL = () => Save.data.settings.quality ?? 2;       // 0 baixa, 1 media, 2 alta
const CALM = () => !!Save.data.settings.calm;

// ===== acessibilidade: menos tremor e clarao =====
{
  const sk = shake, fs = flashScreen;
  shake = a => sk(CALM() ? a * .3 : a);
  flashScreen = a => fs(CALM() ? a * .25 : a);
}

// ===== luzes dinamicas das explosoes =====
G.lights = [];
Visual2.update = function (dt) {
  for (const r of G.rings) if (!r._l && r.max >= 150 && r.r < 14 && QL() >= 1) { r._l = 1; G.lights.push({ x: r.x, y: r.y, rad: r.max * 1.3, c: r.c, life: .45, max: .45, flare: r.max >= 300 }); }
  for (const l of G.lights) l.life -= dt;
  G.lights = G.lights.filter(l => l.life > 0).slice(-6);
  const p = G.player;
  if (p && !p.dead && G.state === 'play') { // rastro do motor por skin
    const sid = G.training && G.trainSkin != null ? SKINS[G.trainSkin].id : Save.data.loadout.skin, P = G.parts;
    if (p.weapon === 'orbi') { if (Math.random() < dt * 22) P.push({ x: p.x + rand(-6, 6), y: p.y + 28, vx: rand(-10, 10), vy: rand(60, 120), life: .6, max: .6, r: rand(3, 6), c: '#bff0ff', drag: 1.5 }); }
    else if (sid === 'rose') { if (Math.random() < dt * 20) P.push({ x: p.x + rand(-8, 8), y: p.y + 26, vx: rand(-30, 30), vy: rand(50, 110), life: .8, max: .8, r: rand(3, 5), c: '#ff9ad0', drag: 1 }); }
    else if (sid === 'cyan') { if (Math.random() < dt * 16) P.push({ k: 'flash', x: p.x + rand(-10, 10), y: p.y + 28, vx: 0, vy: 0, life: .35, max: .35, r: 14, c: '#bff0ff', drag: 1 }); }
    else if (sid === 'solar') { if (Math.random() < dt * 26) P.push({ x: p.x + rand(-6, 6), y: p.y + 28, vx: rand(-40, 40), vy: rand(80, 170), life: .5, max: .5, r: rand(2, 4), c: Math.random() < .5 ? '#ffb340' : '#ff5a3c', drag: 1.2 }); }
    else if (sid === 'shadow') { if (Math.random() < dt * 14) P.push({ k: 'smoke', x: p.x + rand(-8, 8), y: p.y + 30, vx: rand(-10, 10), vy: rand(30, 70), life: .9, max: .9, r: rand(8, 13), c: '#3a1a78', drag: 1 }); }
    else if (sid === 'gold') { if (Math.random() < dt * 24) P.push({ x: p.x + rand(-8, 8), y: p.y + 26, vx: rand(-25, 25), vy: rand(40, 120), life: .8, max: .8, r: rand(1.5, 3.2), c: Math.random() < .5 ? '#ffd36a' : '#fffbe0', drag: 1 }); }
  }
};
Visual2.lights = function () {
  if (QL() < 1) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const l of G.lights) { const k = l.life / l.max; drawGlow(l.x, l.y, l.rad * (1.2 - k * .3), l.c, k * .22); }
  ctx.restore();
};
Visual2.flares = function () { // reflexo de lente nas explosoes gigantes
  if (QL() < 2) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const l of G.lights) if (l.flare) {
    const k = l.life / l.max; ctx.globalAlpha = k * .6;
    const g = ctx.createLinearGradient(l.x - 420, 0, l.x + 420, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, l.c); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(l.x - 420, l.y - 2.5, 840, 5);
    for (let i = 1; i <= 3; i++) { const dx = (W / 2 - l.x) * i * .35; ctx.globalAlpha = k * .25; drawGlow(l.x + dx, l.y + (H / 2 - l.y) * i * .35, 26 + i * 8, i % 2 ? '#7fe0ff' : '#ffb340', .8); }
  }
  ctx.restore();
};

// ===== distorcao de tela (onda que dobra a imagem) e aberracao de cor =====
Visual2.distort = function (s) {
  if (s !== 'play' || QL() < 2 || CALM()) return;
  const sc = cv.width / W;
  let n = 0;
  for (const r of G.rings) {
    if (n >= 2 || r.max < 170 || r.life < .25) continue; n++;
    const rad = r.r * sc, cx = r.x * sc, cy = r.y * sc, band = Math.max(14, 34 * sc * r.life);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad + band, 0, TAU); ctx.arc(cx, cy, Math.max(0, rad - band), 0, TAU, true); ctx.clip('evenodd');
    const z = 1 + .035 * r.life; ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); ctx.globalAlpha = .95; ctx.drawImage(cv, 0, 0); ctx.restore();
  }
  if ((G.chroma || 0) > 0) { // aberracao cromatica ao levar dano
    const k = G.chroma; G.chroma = Math.max(0, G.chroma - 1 / 40); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * .35;
    ctx.drawImage(cv, -6 * k * sc, 0); ctx.globalAlpha = k * .25; ctx.drawImage(cv, 6 * k * sc, 0); ctx.restore();
  }
};
{
  const hp0 = hurtPlayer;
  hurtPlayer = function (d) { const p = G.player, b = p ? p.hp : 0; hp0(d); if (p && p.hp < b) G.chroma = 1; };
}

// ===== familias de inimigos por bioma =====
{
  const base = Art.enemy;
  const KIT_TYPES = ['drone', 'zig', 'kami', 'shooter', 'shield', 'healer', 'bit', 'tank'];
  Art.enemy = function (e) {
    const st = G.stage ? G.stage.id : 0;
    if (QL() < 1 || !KIT_TYPES.includes(e.type)) return base.call(this, e);
    const u = e.rad / 24, t = World.t + e.ph;
    ctx.save(); ctx.translate(e.x, e.y); ctx.scale(u, u);
    // atras do corpo
    if (st === 0) { // asas de membrana batendo
      for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (.5 + Math.sin(t * 14) * .35)); ctx.globalAlpha = .45; ctx.fillStyle = '#cdb8ff'; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(s * 30, -4, 20, 8, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
    } else if (st === 4) { // cauda fantasma
      ctx.globalAlpha = .35; const g = ctx.createLinearGradient(0, 0, 0, -70); g.addColorStop(0, '#9fd0ff'); g.addColorStop(1, 'rgba(159,208,255,0)'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-16, -6); for (let i = 0; i <= 6; i++) ctx.lineTo(-16 + i * 5.3 + Math.sin(t * 5 + i) * 4, -6 - i * 11 - (i % 2) * 6); ctx.lineTo(16, -6); ctx.closePath(); ctx.fill();
    } else if (st === 5) { // fios de sombra
      ctx.strokeStyle = 'rgba(154,99,255,.6)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + t * .6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 22, Math.sin(a) * 22); ctx.quadraticCurveTo(Math.cos(a + .6) * 36, Math.sin(a + .6) * 36, Math.cos(a + .2) * (44 + Math.sin(t * 3 + i) * 6), Math.sin(a + .2) * (44 + Math.sin(t * 3 + i) * 6)); ctx.stroke(); }
    }
    ctx.restore();
    ctx.save(); if (st === 4) ctx.globalAlpha = .88; base.call(this, e); ctx.restore();
    // por cima do corpo
    ctx.save(); ctx.translate(e.x, e.y); ctx.scale(u, u);
    if (st === 1) { // capacete de mineracao e rebites
      ctx.fillStyle = '#ffcf3a'; ctx.strokeStyle = '#7a4a0a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-17, -14); ctx.lineTo(-11, -27); ctx.lineTo(11, -27); ctx.lineTo(17, -14); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff6c0'; ctx.fillRect(-4, -25, 8, 5); ctx.fillStyle = '#7a4a0a'; for (const x of [-12, 12]) { ctx.beginPath(); ctx.arc(x, 12, 2.2, 0, 7); ctx.fill(); }
    } else if (st === 2) { // bobina eletrica
      ctx.save(); ctx.rotate(t * 3); ctx.strokeStyle = '#bff0ff'; ctx.lineWidth = 2; ctx.globalAlpha = .8; ctx.beginPath(); ctx.ellipse(0, 0, 33, 12, 0, 0, TAU); ctx.stroke(); ctx.restore();
      if (Math.random() < .3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 2; const a = rand(0, TAU); ctx.beginPath(); ctx.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); ctx.lineTo(Math.cos(a + .3) * 36 + rand(-5, 5), Math.sin(a + .3) * 36 + rand(-5, 5)); ctx.stroke(); ctx.restore(); }
    } else if (st === 3) { // coroa de chamas
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = -2; i <= 2; i++) { const h = 14 + Math.sin(t * 9 + i * 1.7) * 6 + (2 - Math.abs(i)) * 5, g = ctx.createLinearGradient(0, -20, 0, -20 - h); g.addColorStop(0, '#ff7a20'); g.addColorStop(1, 'rgba(255,230,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(i * 8 - 5, -20); ctx.lineTo(i * 8, -20 - h); ctx.lineTo(i * 8 + 5, -20); ctx.fill(); }
      drawGlow(0, 0, 30, '#ffb340', .35); ctx.restore();
    }
    ctx.restore();
  };
}

// (a cutscene de furia dos chefes esta em visual3.js)
Visual2.cine = function () {
  const c = G.phaseCine; if (!c || G.state !== 'play') return;
  c.t += 1 / 60; if (c.t > c.dur) { G.phaseCine = null; return; }
  const k = c.t / c.dur, env = Math.sin(Math.min(1, k * 1.25) * Math.PI), b = G.boss; if (b) { c.x = b.x; c.y = b.y; }
  G.zoomCx = c.x; G.zoomCy = c.y; if (!CALM()) G.zoom = Math.max(G.zoom || 0, .085 * env);
  const bh = 60 * env; ctx.save(); ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c.col; ctx.lineWidth = 2; // linhas convergindo para o chefe
  for (let i = 0; i < 28; i++) { const a = i / 28 * TAU + c.t * .5, r0 = 120 + (1 - Math.min(1, k * 1.6)) * 520, r1 = r0 + 90; ctx.globalAlpha = env * .55; ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a) * r1, c.y + Math.sin(a) * r1 * .8); ctx.lineTo(c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0 * .8); ctx.stroke(); }
  if (k > .18 && k < .3) { ctx.globalAlpha = (1 - Math.abs(k - .24) / .06) * .5; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
  ctx.restore(); ctx.save(); ctx.globalAlpha = clamp(env * 1.6, 0, 1);
  ctx.shadowColor = c.col; ctx.shadowBlur = 30; txt(c.text, W / 2, H - bh - 74, 58, '#ffffff', 'center', 900); ctx.restore();
};

// ===== escudo hexagonal da nave =====
Visual2.shipFx = function (p) {
  if (!p.shieldReady || QL() < 1) return;
  const t = World.t; ctx.save(); ctx.translate(p.x, p.y); ctx.globalCompositeOperation = 'lighter';
  ctx.rotate(t * .5); ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 2.5; ctx.globalAlpha = .55 + Math.sin(t * 5) * .15;
  for (const [r, w] of [[48, 1], [40, .5]]) { ctx.globalAlpha *= w + .4; ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * TAU; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke(); }
  drawGlow(0, 0, 60, '#7fe0ff', .22); ctx.restore();
};

// ===== itens com brilho e rastro =====
{
  const base = Art.pickup;
  Art.pickup = function (p) {
    const c = p.type === 'coin' ? '#ffb340' : p.type === 'heart' ? '#ff5f8f' : '#7fe0ff';
    if (QL() >= 1) {
      p.h = p.h || []; if (p.mag) { p.h.push([p.x, p.y]); if (p.h.length > 7) p.h.shift(); } else p.h.length = 0;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < p.h.length - 1; i++) { ctx.globalAlpha = i / p.h.length * .5; ctx.strokeStyle = c; ctx.lineWidth = 2 + i * .8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.h[i][0], p.h[i][1]); ctx.lineTo(p.h[i + 1][0], p.h[i + 1][1]); ctx.stroke(); }
      ctx.globalAlpha = .35 + Math.sin(p.age * 6) * .15; ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, 13 + Math.sin(p.age * 5) * 2.5, 0, TAU); ctx.stroke();
      if (p.type === 'heart') { const hb = 1 + Math.max(0, Math.sin(p.age * 6)) * .18; ctx.globalAlpha = .4; drawGlow(p.x, p.y, 30 * hb, c, .7); }
      ctx.restore();
    }
    base.call(this, p);
  };
}

// ===== icones dos upgrades =====
Visual2.upIcon = function (id, x, y, s, c, f) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 30, s / 30); const t = World.t;
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 54, c, .55 + (f ? .2 : 0)); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const L = (...a) => { ctx.beginPath(); for (let i = 0; i < a.length; i += 2) i ? ctx.lineTo(a[i], a[i + 1]) : ctx.moveTo(a[i], a[i + 1]); ctx.stroke(); };
  const star = (r, n = 5) => { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * .45 : r, a = i * Math.PI / n - Math.PI / 2; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); };
  const ring = (r) => { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); };
  switch (id) {
    case 'dmg': ctx.beginPath(); ctx.roundRect(-7, -24, 14, 36, 7); ctx.fill(); L(-14, 20, 14, 20); break;
    case 'rate': L(6, -26, -10, 4, 2, 4, -6, 26); break;
    case 'speed': L(-24, 8, 0, -22, 24, 8); L(-14, 18, 0, 0, 14, 18); break;
    case 'hp': case 'heal': ctx.beginPath(); ctx.moveTo(0, 22); ctx.bezierCurveTo(-34, -2, -22, -26, 0, -10); ctx.bezierCurveTo(22, -26, 34, -2, 0, 22); ctx.fill(); if (id === 'heal') { ctx.strokeStyle = c; L(0, -4, 0, 10); L(-7, 3, 7, 3); } break;
    case 'magnet': ctx.beginPath(); ctx.arc(0, -2, 18, Math.PI, 0); ctx.lineTo(18, 20); ctx.moveTo(-18, -2); ctx.lineTo(-18, 20); ctx.stroke(); ctx.fillStyle = c; ctx.fillRect(-23, 14, 11, 9); ctx.fillRect(12, 14, 11, 9); break;
    case 'dash': L(-22, -10, -4, -10); L(-22, 10, 4, 10); L(-4, -20, 22, 0, -4, 20); break;
    case 'spec': star(26); break;
    case 'pulse': ring(8); ring(18); ctx.globalAlpha = .6; ring(27); break;
    case 'xp': star(22); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill(); break;
    case 'lucky': ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill(); ctx.fillStyle = c; star(12); break;
    case 'multi': L(0, 22, 0, -24); L(0, 22, -22, -16); L(0, 22, 22, -16); break;
    case 'pierce': L(-26, 0, 24, 0); L(12, -12, 26, 0, 12, 12); ctx.globalAlpha = .6; ring(14); break;
    case 'crit': ring(18); L(0, -28, 0, -10); L(0, 10, 0, 28); L(-28, 0, -10, 0); L(10, 0, 28, 0); break;
    case 'shield': ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(22, -16); ctx.lineTo(18, 10); ctx.lineTo(0, 26); ctx.lineTo(-18, 10); ctx.lineTo(-22, -16); ctx.closePath(); ctx.fill(); break;
    case 'missile': ctx.save(); ctx.rotate(-.6); ctx.beginPath(); ctx.roundRect(-6, -22, 12, 34, 6); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(-14, 22); ctx.lineTo(0, 16); ctx.lineTo(14, 22); ctx.lineTo(6, 12); ctx.fill(); ctx.restore(); break;
    case 'orbit': ring(16); for (let i = 0; i < 3; i++) { const a = t * 2 + i * TAU / 3; ctx.beginPath(); ctx.arc(Math.cos(a) * 16, Math.sin(a) * 16, 5, 0, TAU); ctx.fill(); } break;
    case 'ricochet': L(-24, 20, -8, -14, 8, 14, 24, -20); break;
    case 'chain': L(8, -26, -10, 2, 4, 2, -8, 26); ctx.globalAlpha = .6; L(14, -8, 24, 8); break;
    case 'combochg': ctx.beginPath(); ctx.roundRect(-14, -22, 28, 44, 6); ctx.stroke(); ctx.fillRect(-9, -2, 18, 18); ctx.fillRect(-5, -27, 10, 5); break;
    case 'reflect': ctx.beginPath(); ctx.arc(0, 0, 22, -.9, .9); ctx.stroke(); L(-22, -12, 4, 0, -22, 12); break;
    case 'vamp': ctx.beginPath(); ctx.moveTo(0, -26); ctx.bezierCurveTo(26, 4, 20, 26, 0, 26); ctx.bezierCurveTo(-20, 26, -26, 4, 0, -26); ctx.fill(); break;
    case 'overdrive': ctx.beginPath(); ctx.moveTo(0, -28); ctx.bezierCurveTo(24, -6, 22, 24, 0, 26); ctx.bezierCurveTo(-22, 24, -22, 0, -6, -10); ctx.bezierCurveTo(-6, -4, 0, -6, 0, -28); ctx.fill(); break;
    default: star(26);
  }
  ctx.restore();
};

// ===== menu do titulo e retratos com vida =====
{
  const tb = Screens.titleBackdrop;
  Screens.titleBackdrop = function () {
    const mx = (Input.mouse.x - W / 2) / W, my = (Input.mouse.y - H / 2) / H;
    ctx.save(); ctx.translate(W / 2 - mx * 26, H / 2 - my * 16); ctx.scale(1.04, 1.04); ctx.translate(-W / 2, -H / 2); tb.call(this); ctx.restore();
  };
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o = {}) {
    const t = o.t ?? World.t; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * .9) * .012); const br = 1 + Math.sin(t * 1.6) * .008; ctx.scale(br, br); ctx.translate(-x, -y);
    pd.call(this, who, x, y, size, o); ctx.restore();
  };
}

// ===== configuracoes: dificuldade, graficos e acessibilidade =====
Screens.settings = function () {
  const s = Save.data.settings;
  UI.panel(300, 36, 680, 650);
  txt('OPÇÕES', W / 2, 52, 40, '#fff', 'center');
  txt('MÚSICA  ' + Math.round(s.music * 100) + '%', 360, 114, 21, '#e2d4ff');
  const m = UI.slider('music', 360, 156, 560, s.music);
  txt('EFEITOS SONOROS  ' + Math.round(s.sfx * 100) + '%', 360, 192, 21, '#e2d4ff');
  const e = UI.slider('sfx', 360, 234, 560, s.sfx);
  if (m !== s.music || e !== s.sfx) {
    const sfxChanged = e !== s.sfx; s.music = m; s.sfx = e; Snd.setVolumes(s.sfx, s.music); Save.save();
    if (sfxChanged && !G.sfxTest) { Snd.play('explode', { size: .5 }); G.sfxTest = 10; }
  }
  if (G.sfxTest) G.sfxTest--;
  txt('DIFICULDADE', 360, 272, 21, '#e2d4ff');
  DIFF.forEach((d, i) => { if (UI.button('diff' + i, 360 + i * (560 / DIFF.length), 304, 560 / DIFF.length - 8, 40, d.name, { size: 14, color: (s.diff ?? 1) === i ? '#9a63ff' : undefined })) { s.diff = i; Save.save(); } });
  UI.wrap(DIFF[s.diff ?? 1].desc, 360, 352, 560, 20, 14, '#cdb8ff');
  txt('GRÁFICOS', 360, 392, 21, '#e2d4ff');
  if (UI.button('res', 700, 386, 220, 32, 'RESOLUÇÃO: ' + Math.round((s.res || 1) * 100) + '%', { size: 13 })) { s.res = (s.res || 1) === 1 ? .75 : (s.res === .75 ? .5 : 1); Save.save(); resize(); }
  ['BAIXO', 'MÉDIO', 'ALTO'].forEach((n, i) => { if (UI.button('ql' + i, 360 + i * 192, 424, 176, 40, n, { size: 17, color: (s.quality ?? 2) === i ? '#9a63ff' : undefined })) { s.quality = i; Save.save(); } });
  UI.wrap(['Sem brilho extra nem efeitos pesados: para PCs mais fracos.', 'Sem distorção de tela nem granulado.', 'Todos os efeitos visuais ligados.'][s.quality ?? 2], 360, 472, 560, 20, 14, '#cdb8ff');
  txt('ACESSIBILIDADE', 360, 504, 21, '#e2d4ff');
  if (UI.button('calm', 360, 536, 180, 38, s.calm ? 'MENOS TREMOR: SIM' : 'MENOS TREMOR: NÃO', { size: 12, color: s.calm ? '#9a63ff' : undefined })) { s.calm = !s.calm; Save.save(); }
  if (UI.button('outl', 550, 536, 180, 38, s.outline ? 'CONTORNO: SIM' : 'CONTORNO: NÃO', { size: 12, color: s.outline ? '#9a63ff' : undefined })) { s.outline = !s.outline; Save.save(); }
  if (UI.button('assist', 740, 536, 180, 38, s.assist ? 'ASSISTIDO: SIM' : 'ASSISTIDO: NÃO', { size: 12, color: s.assist ? '#9a63ff' : undefined })) { s.assist = !s.assist; Save.save(); }
  const sure = G.confirmReset;
  if (UI.button('reset', 360, 632, 190, 40, sure ? 'CONFIRMAR?' : 'APAGAR TUDO', { size: 13, color: '#c2185b' })) {
    if (sure) { Save.reset(); G.confirmReset = false; Snd.setVolumes(Save.data.settings.sfx, Save.data.settings.music); G.sel = 0; } else G.confirmReset = true;
  }
  if (UI.button('back', 794, 632, 126, 40, 'VOLTAR', { size: 16 }) || Input.pressed('escape')) {
    G.confirmReset = false; Snd.play('uiBack');
    if (G.setBack === 'pause') G.state = 'pause'; else Game.goTitle();
  }
};
