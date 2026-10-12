'use strict';
// ---------- 74: icones com cor por categoria, alerta de golpe forte do chefe, seta para a brecha, entradas de todos os chefes, silhueta nas skins,
// cena de chegada na fase, titulo com progresso e nave equipada, resumo nos creditos ----------
const Visual74 = { gap: null, gapT: 0 };
const ok74 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const h74 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- 1. icones: disco de fundo na cor da categoria (ataque, defesa, utilidade, sorte) ----------
{
  const CAT = { dmg: 'atk', rate: 'atk', multi: 'atk', pierce: 'atk', crit: 'atk', missile: 'atk', chain: 'atk', ricochet: 'atk', spec: 'atk', pulse: 'atk', overdrive: 'atk', combochg: 'atk',
    hp: 'def', heal: 'def', shield: 'def', reflect: 'def', vamp: 'def', orbit: 'def', speed: 'uti', dash: 'uti', magnet: 'uti', lucky: 'luk', luck: 'luk', xp: 'luk' };
  const COL = { atk: '#ff7a5a', def: '#5aa8ff', uti: '#ffd36a', luk: '#7fe0a0' };
  const ui = Visual2.upIcon;
  Visual2.upIcon = function (id, x, y, s, c, f) {
    const cat = CAT[id]; if (cat && QL() >= 1) { ctx.save(); ctx.fillStyle = COL[cat]; ctx.globalAlpha = .2; ctx.beginPath(); ctx.arc(x, y, s * 1.25, 0, TAU); ctx.fill(); ctx.restore(); }
    return ui.call(this, id, x, y, s, c, f);
  };
}

// ---------- 2. golpe forte do chefe: anel que fecha em volta do chefe e aviso curto ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const b = G.boss; return; if (!b || b.state !== 'fight' || G.state !== 'play' || QL() < 1 || !b.tele) return; let m = 0, mk = ''; for (const k in b.tele) if (b.tele[k] > m) { m = b.tele[k]; mk = k; } if (m < .35) return;
    const R = (b.rad || 90) * (2.2 - m * 1.1); ctx.save(); ctx.strokeStyle = 'rgba(255,214,120,' + (.3 + m * .6) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, TAU); ctx.stroke();
    ctx.restore();
  };
}

// ---------- 3. seta para a brecha mais segura quando ha muitos tiros ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const p = G.player; if (!p || p.dead || G.state !== 'play' || G.eb.length < 40 || QL() < 1) return;
    if (World.t - Visual74.gapT > .12) { Visual74.gapT = World.t; let best = null, bs = 1e9; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, px = p.x + Math.cos(a) * 110, py = p.y + Math.sin(a) * 110; if (px < 50 || px > W - 50 || py < 100 || py > H - 60) continue; let sc = 0; for (const q of G.eb) { if (q.dead) continue; const d = Math.hypot(q.x - px, q.y - py); if (d < 90) sc += 90 - d; } if (sc < bs) { bs = sc; best = a; } } Visual74.gap = best === null ? null : { a: best, bad: bs }; }
    const g = Visual74.gap; if (!g || g.bad > 60) return; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(g.a); ctx.globalAlpha = .55 + .2 * Math.sin(World.t * 8); ctx.strokeStyle = '#7fffbe'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.moveTo(62 + k * 12, -9); ctx.lineTo(74 + k * 12, 0); ctx.lineTo(62 + k * 12, 9); ctx.stroke(); } ctx.restore();
  };
}

// ---------- 4. entrada de cada chefe com seu proprio gesto ----------
{
  const CL = { MotherShip, SunGuardian, EchoBoss, VoidBoss, Herald, Leviathan, Mirror, Heart };
  for (const name in CL) {
    const d = CL[name].prototype.draw;
    CL[name].prototype.draw = function () {
      d.call(this); if (QL() < 1 || this.state !== 'intro' || G.state !== 'play') return; const c = ok74(this.col) ? this.col : '#ffb340', t = World.t, R = (this.rad || 100);
      ctx.save(); ctx.translate(this.x, this.y); ctx.globalCompositeOperation = 'lighter';
      if (name === 'MotherShip') { for (let i = 0; i < 3; i++) { const u = (t * .8 + i / 3) % 1; ctx.globalAlpha = (1 - u) * .7; ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + .5; ctx.lineTo(Math.cos(a) * (60 + u * 300), Math.sin(a) * (60 + u * 300)); } ctx.closePath(); ctx.stroke(); } }
      else if (name === 'SunGuardian') { ctx.globalAlpha = .5; ctx.strokeStyle = '#fff1b0'; ctx.lineWidth = 3; for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + t, l = 160 + 120 * Math.abs(Math.sin(t * 3 + i)); ctx.beginPath(); ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R); ctx.lineTo(Math.cos(a) * (R + l), Math.sin(a) * (R + l)); ctx.stroke(); } }
      else if (name === 'EchoBoss') { ctx.globalAlpha = .6; ctx.fillStyle = '#ff4ad0'; for (let i = 0; i < 6; i++) ctx.fillRect(-160 + h74(i + Math.floor(t * 10)) * 320, -80 + i * 28, 90 + h74(i) * 100, 5); }
      else if (name === 'VoidBoss') { ctx.globalAlpha = .6; ctx.strokeStyle = '#8a4aff'; ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { const u = 1 - ((t * .7 + i / 3) % 1); ctx.beginPath(); ctx.arc(0, 0, 80 + u * 360, 0, TAU); ctx.stroke(); } }
      else if (name === 'Herald') { ctx.globalAlpha = .45; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 36, -300); ctx.lineTo(i * 70, 260); ctx.stroke(); } }
      else if (name === 'Leviathan') { ctx.globalAlpha = .55; ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { const u = ((t * .9 + i / 4) % 1); ctx.beginPath(); ctx.ellipse(0, 40, 60 + u * 260, 20 + u * 80, 0, 0, TAU); ctx.stroke(); } }
      else if (name === 'Mirror') { ctx.globalAlpha = .7; ctx.fillStyle = '#fff'; for (let i = 0; i < 10; i++) { const a = h74(i) * TAU, r = 60 + ((t * 120 + i * 50) % 260); ctx.save(); ctx.translate(Math.cos(a) * r, Math.sin(a) * r); ctx.rotate(t + i); ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, 0); ctx.lineTo(0, 9); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill(); ctx.restore(); } }
      else if (name === 'Heart') { for (let i = 0; i < 3; i++) { const u = ((t * 1.1 + i / 3) % 1); ctx.globalAlpha = (1 - u) * .7; ctx.strokeStyle = '#ffb4d0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 70 + u * 340, 0, TAU); ctx.stroke(); } }
      ctx.restore();
    };
  }
}

// ---------- 5. silhueta das skins: asas e espinhos extras conforme a skin ----------
{
  const sh = Art.ship;
  Art.ship = function (x, y, o) {
    const r = sh.call(this, x, y, o); if (QL() < 1 || !o || o.orbi || !o.pal || (o.scale || 1) < .6) return r; const inPlay = G.state === 'play' && G.player && Math.abs(x - G.player.x) < 2, inHg = G.state === 'hangar'; if (!inPlay && !inHg) return r;
    const sk = (typeof SKINS !== 'undefined') ? SKINS.find(s => s.pal === o.pal) : null; if (!sk || sk.id === 'violet') return r; let h = 0; for (const ch of sk.id) h = (h * 31 + ch.charCodeAt(0)) | 0; const v = Math.abs(h) % 4, k = (o.scale || 1) * 1.12, c = ok74(o.pal.fin) ? o.pal.fin : (ok74(o.pal.g1) ? o.pal.g1 : '#9a63ff');
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = c; ctx.strokeStyle = 'rgba(14,4,32,.9)'; ctx.lineWidth = 1.6; ctx.globalAlpha = .95;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      if (v === 0) { ctx.moveTo(s * 18, 8); ctx.lineTo(s * 34, 30); ctx.lineTo(s * 16, 26); }
      else if (v === 1) { ctx.moveTo(s * 20, -4); ctx.lineTo(s * 40, -16); ctx.lineTo(s * 30, 6); ctx.lineTo(s * 20, 14); }
      else if (v === 2) { ctx.moveTo(s * 16, 20); ctx.lineTo(s * 28, 44); ctx.lineTo(s * 20, 36); ctx.lineTo(s * 10, 30); }
      else { ctx.moveTo(s * 22, 0); ctx.quadraticCurveTo(s * 42, 8, s * 36, 34); ctx.lineTo(s * 20, 18); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore(); return r;
  };
}

// ---------- 8. chegada na fase: o planeta do setor se aproxima e some ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); if (QL() < 1 || G.state !== 'play' || !G.stage || G.training || G.t > 1.7) return; const u = G.t / 1.7, c = ok74(G.stage.tint) ? G.stage.tint : '#b98cff', R = lerp(420, 40, ez74(u));
    ctx.save(); ctx.globalAlpha = (1 - u) * .55; const g = ctx.createRadialGradient(W / 2 - R * .3, H * .35 - R * .3, R * .1, W / 2, H * .35, R); g.addColorStop(0, '#ffffff'); g.addColorStop(.35, c); g.addColorStop(1, '#0a0420'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W / 2, H * .35, R, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(230,215,255,.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(W / 2, H * .35, R * 1.6, R * .3, -.25, 0, TAU); ctx.stroke(); ctx.restore();
  };
  const ez74 = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
}

// ---------- 9. titulo: a nave que cruza o fundo usa a skin equipada e as estrelas acendem com o progresso ----------
{
  const ti = Screens.title;
  Screens.title = function () {
    const r = ti.call(this); if (QL() < 1) return r; const t = World.t, n = Object.values(Save.data.cleared || {}).filter(Boolean).length, sk = (typeof skinOf === 'function') ? skinOf((Save.data.loadout || {}).skin) : null;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < n * 8; i++) { const x = h74(i) * W, y = h74(i + 90) * H * .8 + 20, a = .25 + .35 * Math.sin(t * 1.5 + i); ctx.globalAlpha = a; drawGlow(x, y, 4 + h74(i + 5) * 5, i % 5 ? '#fff1c0' : '#ffd36a', .8); } ctx.restore();
    if (sk) { const f = ((t * .05) % 1.4) - .2; if (f > -.1 && f < 1.1) { ctx.save(); ctx.globalAlpha = .85; Art.ship(f * (W + 200) - 100, 600 - Math.sin(f * 6) * 28, { pal: sk.pal, t, scale: .38, vx: 260, lookx: .3, looky: 0, blinkT: 0, inv: 0, boost: 1 }); ctx.restore(); } }
    return r;
  };
}

// ---------- 10. creditos: segunda linha do resumo com numeros da sua jornada ----------
{
  const cr = Screens.credits;
  Screens.credits = function () {
    const r = cr.apply(this, arguments); if (QL() < 1) return r; const st = Save.data.stats || {}, u = World.t - (typeof Visual61 !== 'undefined' && Visual61.cr0 !== null ? Visual61.cr0 : 0); if (u > 7.5 || u < 0) return r;
    const a = clamp(u / .8, 0, 1) * clamp((7.5 - u) / .8, 0, 1); ctx.save(); ctx.globalAlpha = a; txt((st.kills || 0) + ' inimigos derrotados  •  ' + (st.stars || 0) + ' estrelas guardadas  •  ' + (st.dashes || 0) + ' esquivas', W / 2, 98, 15, '#cdb8ff', 'center', 700); ctx.restore(); return r;
  };
}

// ---------- 11. desempenho: ligacoes e arcos do visual71 so aparecem com 24 inimigos ou menos (ver visual71) ----------
