'use strict';
// ---------- 68: painel unico no HUD, modo foco, eventos grandes de fundo, causa da derrota com cartas usadas,
// identidade da loja e do hangar, foco forte no controle ----------
const Visual68 = { bg: null, next: 0, killer: '', foc: 0 };
const ok68 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const h68 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- 2. HUD: uma placa translucida atras do bloco esquerdo (relíquia, sinergias e bonus) ----------
{
  const h5 = Visual5.hud;
  Visual5.hud = function () {
    if (G.state === 'play' && G.player && QL() >= 1) {
      const p = G.player, nb = Object.keys(p.buffs || {}).filter(k => p.buffs[k] > 0).length, rel = !!G.relic, tags = !!G.ngp || (typeof Visual11 !== 'undefined' && Object.values(Visual11.syn()).some(v => v > 0));
      const rows = (rel ? 1 : 0) + (tags ? 1 : 0), hh = (rel ? 26 : 0) + (tags ? 24 : 0) + nb * 28;
      if (hh > 0) { const y0 = rel ? 94 : tags ? 122 : 150; ctx.save(); ctx.fillStyle = 'rgba(8,3,26,.45)'; ctx.strokeStyle = 'rgba(190,160,255,.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(12, y0, 250, hh + 16, 14); ctx.fill(); ctx.stroke(); ctx.restore(); }
    }
    return h5.apply(this, arguments);
  };
}

// ---------- 3. modo foco: escurece o fundo (opcao em Acessibilidade) ----------
{
  const bi = Visual.biome;
  Visual.biome = function () { bi.call(this); if (G.state === 'play' && Save.data.settings && Save.data.settings.foco) { ctx.save(); ctx.fillStyle = 'rgba(2,0,12,.42)'; ctx.fillRect(0, 0, W, H); ctx.restore(); } };
}

// ---------- 4. eventos grandes de fundo: planeta que cruza a tela e nevoa que varre o cenario ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (G.state !== 'play' || QL() < 1 || !G.stage || (G.boss && G.boss.state === 'fight')) return; const t = World.t, c = ok68(G.stage.tint) ? G.stage.tint : '#b98cff';
    if (!Visual68.bg && t > Visual68.next) { Visual68.bg = { k: Math.random() < .5 ? 'planet' : 'sweep', t0: t, dur: 26, s: Math.random() }; }
    const e = Visual68.bg; if (!e) { if (!Visual68.next) Visual68.next = t + rand(25, 45); return; }
    const u = (t - e.t0) / e.dur; if (u >= 1) { Visual68.bg = null; Visual68.next = t + rand(50, 80); return; }
    const fade = Math.sin(clamp(u, 0, 1) * Math.PI);
    ctx.save();
    if (e.k === 'planet') { const R = 240 + e.s * 80, x = W + R - u * (W + R * 2.2), y = H * (.25 + e.s * .35); ctx.globalAlpha = .5 * Math.min(1, fade * 2.5); const g = ctx.createRadialGradient(x - R * .35, y - R * .35, R * .1, x, y, R * 1.05); g.addColorStop(0, c); g.addColorStop(.55, '#2a1a58'); g.addColorStop(1, '#04010c'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(230,215,255,.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, y, R * 1.6, R * .3, -.25, 0, TAU); ctx.stroke(); }
    else { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const x = lerp(-300, W + 300, u) + i * 160 - 240, y = H * (.2 + i * .2) + Math.sin(t * .5 + i) * 30; ctx.globalAlpha = .1 * fade; drawGlow(x, y, 360, c, .8); } }
    ctx.restore();
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { Visual68.bg = null; Visual68.next = 0; return ss.call(this, i, o); };
}

// ---------- 7. derrota: quem acertou a nave por ultimo e as cartas usadas ----------
{
  const NM = { drone: 'Zangão', zig: 'Ziguezague', kami: 'Kamikaze', shooter: 'Atirador', tank: 'Tanque', mine: 'Mina', bit: 'Bit', rock: 'Rocha', shield: 'Escudeiro', healer: 'Curandeiro', captain: 'Capitão', hunter: 'Caçador', ghost: 'Fantasma', swarmer: 'Enxame' };
  const hp = hurtPlayer;
  hurtPlayer = function (d) {
    const p = G.player, b0 = p ? p.hp : 0; const r = hp(d);
    if (p && p.hp < b0) {
      let best = 1e9, nm = '';
      if (G.boss && G.boss.state === 'fight') { best = Math.hypot(G.boss.x - p.x, G.boss.y - p.y) * .7; nm = G.boss.name || ''; }
      for (const q of G.eb) { if (q.dead) continue; const dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < best) { best = dd; nm = q.bo ? ((G.boss && G.boss.name) || 'Chefe') : 'Tiro inimigo'; } }
      for (const e of G.enemies) { if (e.dead) continue; const dd = Math.hypot(e.x - p.x, e.y - p.y) - (e.rad || 0); if (dd < best) { best = dd; nm = e.name || NM[e.type] || e.type; } }
      Visual68.killer = nm;
    }
    return r;
  };
  const strip = (x0, y) => { // grade de cartas ao lado do placar
    const L = typeof Visual59 !== 'undefined' ? Visual59.list() : []; if (!L.length) return; const n = Math.min(8, L.length);
    ctx.save(); ctx.globalAlpha = .95; txt('CARTAS USADAS', x0 + 4, y - 18, 12, '#8a7fb0', 'left', 800);
    L.slice(0, n).forEach(({ id, n: c, u }, i) => { const x = x0 + i * 41 + 20, yy = y, col = ok68((RARITY[u.r] || {}).c) ? RARITY[u.r].c : '#b98cff'; ctx.fillStyle = 'rgba(14,6,40,.85)'; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 19, yy, 38, 38, 9); ctx.fill(); ctx.stroke(); try { Visual2.upIcon(id, x, yy + 19, 10, col, false); } catch (e) { } if (c > 1) txt('x' + c, x + 18, yy + 25, 10, col, 'right', 900); });
    ctx.restore();
  };
  const ov = Screens.over;
  Screens.over = function () { const r = ov.call(this); if (QL() >= 1) { if (Visual68.killer) { ctx.save(); ctx.fillStyle = 'rgba(14,4,36,.78)'; ctx.strokeStyle = '#ff7a9a'; ctx.lineWidth = 2; const w = 340; ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, 244, w, 28, 14); ctx.fill(); ctx.stroke(); txt('Derrotado por: ' + Visual68.killer, W / 2, 249, 15, '#ffd0da', 'center', 800); ctx.restore(); } strip(910, 494); } return r; };
  const ss = Game.startStage; Game.startStage = function (i, o) { Visual68.killer = ''; return ss.call(this, i, o); };
}

// ---------- 8. loja: vitrine com cones de luz; hangar: laser de varredura e aneis ao redor da nave ----------
{
  const sh = Screens.shop;
  if (sh) Screens.shop = function () {
    const r = sh.call(this); if (QL() < 1) return r; const t = World.t; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const x = W * (.12 + i * .26) + Math.sin(t * .35 + i * 2) * 40, g = ctx.createLinearGradient(x, 0, x + 40, H); g.addColorStop(0, 'rgba(255,233,168,.11)'); g.addColorStop(1, 'rgba(255,233,168,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 14, 0); ctx.lineTo(x + 14, 0); ctx.lineTo(x + 170, H); ctx.lineTo(x - 130, H); ctx.closePath(); ctx.fill(); }
    for (let i = 0; i < 14; i++) { const x = (h68(i) * W + Math.sin(t + i) * 20), y = H - ((t * (14 + h68(i + 3) * 24) + h68(i + 6) * H) % H); ctx.globalAlpha = .5; drawGlow(x, y, 5, '#ffd36a', .8); }
    ctx.restore(); return r;
  };
  const hg = Screens.hangar;
  Screens.hangar = function () {
    const r = hg.call(this); if (QL() < 1 || G.htab !== 'nav') return r; const t = World.t; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 405); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const sy = ((t * 90) % 220) + 150; const g = ctx.createLinearGradient(240, sy - 24, 240, sy + 3); g.addColorStop(0, 'rgba(127,224,255,0)'); g.addColorStop(1, 'rgba(127,224,255,.3)'); ctx.fillStyle = g; ctx.fillRect(240, sy - 24, 360, 27);
    for (let k = 0; k < 2; k++) { ctx.save(); ctx.translate(420, 290); ctx.rotate(t * (.3 + k * .2) * (k ? -1 : 1)); ctx.strokeStyle = 'rgba(190,160,255,.3)'; ctx.lineWidth = 2; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.ellipse(0, 0, 140 + k * 26, 140 + k * 26, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.restore(); return r;
  };
}

// ---------- 9. foco forte no controle: o botao selecionado ganha aro pulsando ----------
{
  const bt = UI.button;
  UI.button = function (id, x, y, w, h, label, o = {}) {
    const r = bt.call(this, id, x, y, w, h, label, o);
    if (typeof Visual67 !== 'undefined' && Visual67.pad() && UI.focus(id) && !(o && o.disabled) && QL() >= 1) { const k = .5 + .5 * Math.sin(World.t * 7); ctx.save(); ctx.strokeStyle = '#ffe9a8'; ctx.globalAlpha = .6 + .4 * k; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - 5 - k * 2, y - 5 - k * 2, w + 10 + k * 4, h + 10 + k * 4, Math.min(24, h / 2 + 5)); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x + w / 2, y + h / 2, Math.max(w, h) * .8, '#ffe9a8', .12 + k * .08); ctx.restore(); }
    return r;
  };
}
