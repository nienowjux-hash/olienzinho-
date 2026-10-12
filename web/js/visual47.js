'use strict';
// ---------- 47: cenarios grandes por fase, interface em vidro, titulos com degrade, retratos que respiram, alerta de chefe,
// telas de vitoria e derrota com mais vida e cenas de historia em "quadro" com camera lenta ----------
const Visual47 = { rib: [] };
const s47 = n => { const s = Math.sin(n * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };
const hx47 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';

// ---------- 1. cenarios grandes (silhuetas com parallax) ----------
Visual47.big = [
  // 0: arco e colunas quebrados flutuando
  t => { for (const sd of [-1, 1]) { const x = sd < 0 ? 80 : W - 80, dy = ((t * 12 + (sd < 0 ? 0 : 300)) % (H + 500)) - 250; ctx.save(); ctx.translate(x, dy); ctx.scale(-sd, 1); ctx.globalAlpha = .3; ctx.fillStyle = '#0e0624'; ctx.strokeStyle = '#7a5ac8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(-26, 0, 52, 300); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(0, -90, 60, 0); ctx.lineTo(60, 26); ctx.lineTo(-60, 26); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(200,170,255,.3)'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-12 + k * 8, 30); ctx.lineTo(-12 + k * 8, 290); ctx.stroke(); } ctx.restore(); } },
  // 1: guindaste de mineracao e asteroide gigante
  t => { ctx.save(); ctx.globalAlpha = .38; const g = ctx.createRadialGradient(W - 140, H * .55, 20, W - 140, H * .55, 330); g.addColorStop(0, '#6a4a30'); g.addColorStop(1, '#1a0e06'); ctx.fillStyle = g; ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 300 + s47(i) * 60; ctx.lineTo(W - 140 + Math.cos(a) * r, H * .55 + Math.sin(a) * r); } ctx.fill(); ctx.globalAlpha = .55; ctx.strokeStyle = '#2a1608'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(W - 330, H * .5); ctx.lineTo(W - 330, H * .22); ctx.lineTo(W - 470, H * .2); ctx.moveTo(W - 330, H * .3); ctx.lineTo(W - 250, H * .5); ctx.stroke(); if (Math.sin(t * 3) > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(W - 470, H * .2, 18, '#ff4a2a', .9); } ctx.restore(); },
  // 2: olho da tempestade
  t => { ctx.save(); ctx.translate(W / 2, 90); ctx.globalAlpha = .3; for (let k = 0; k < 5; k++) { ctx.rotate(t * .08 * (k % 2 ? -1 : 1)); ctx.strokeStyle = k % 2 ? '#c8a0ff' : '#7a4aff'; ctx.lineWidth = 8 - k; ctx.setLineDash([40, 30]); ctx.beginPath(); ctx.ellipse(0, 0, 300 - k * 40, 90 - k * 12, 0, 0, TAU); ctx.stroke(); } ctx.setLineDash([]); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 120, '#d8b0ff', .35); ctx.restore(); },
  // 3: sol gigante com coroa
  t => { ctx.save(); ctx.translate(W / 2, -140); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .45; const g = ctx.createRadialGradient(0, 0, 80, 0, 0, 380); g.addColorStop(0, '#fff0c0'); g.addColorStop(.35, '#ff9a2a'); g.addColorStop(1, 'rgba(255,60,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 380, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 6; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + t * .06, l = 380 + Math.sin(t * 2 + i) * 40; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 340, Math.sin(a) * 340); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.stroke(); } ctx.restore(); },
  // 4: costelas de naufragio estelar
  t => { ctx.save(); ctx.globalAlpha = .34; ctx.strokeStyle = '#6a8ab8'; ctx.lineWidth = 7; ctx.lineCap = 'round'; for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) { const x = sd < 0 ? -20 : W + 20, y = 90 + i * 100 + Math.sin(t * .4 + i) * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - sd * 120, y + 40, x - sd * (70 + (i % 2) * 40), y + 120); ctx.stroke(); } ctx.fillStyle = '#c8e0ff'; ctx.globalAlpha = .5; for (let i = 0; i < 4; i++) { if (Math.sin(t * 1.3 + i * 2) > .2) { ctx.beginPath(); ctx.arc(s47(i) * W, 40 + s47(i + 9) * 240, 2.4, 0, TAU); ctx.fill(); } } ctx.restore(); },
  // 5: coracao partido em fragmentos
  t => { ctx.save(); ctx.translate(W / 2, 250); ctx.globalAlpha = .3; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + t * .05, R = 160 + (i % 3) * 40 + Math.sin(t * .6 + i) * 14; ctx.save(); ctx.translate(Math.cos(a) * R, Math.sin(a) * R * .8); ctx.rotate(a + t * .2); ctx.fillStyle = '#0a0418'; ctx.strokeStyle = '#a060ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(24, 8); ctx.lineTo(0, 30); ctx.lineTo(-20, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); } ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 110, '#9a50ff', .22 + Math.sin(t * 2) * .06); ctx.restore(); },
  // 6: cidade de torres flutuantes (duas camadas)
  t => { for (let L = 0; L < 2; L++) { ctx.save(); ctx.globalAlpha = L ? .34 : .22; ctx.fillStyle = L ? '#1a1030' : '#120a24'; const off = (t * (L ? 8 : 4)) % 160; for (let i = -1; i < 12; i++) { const x = i * 160 - off + L * 70, h = 120 + s47(i + L * 7 + Math.floor((t * (L ? 8 : 4) + 160) / 160)) * 160, y = H * (L ? .62 : .5); ctx.fillRect(x, y, 70, h); ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 35, y - 40); ctx.lineTo(x + 76, y); ctx.fill(); ctx.fillStyle = 'rgba(255,224,150,.55)'; for (let k = 0; k < 5; k++) if (Math.sin(t + i * 3 + k * 5) > -.2) ctx.fillRect(x + 12 + (k % 2) * 30, y + 14 + Math.floor(k / 2) * 26, 8, 12); ctx.fillStyle = L ? '#1a1030' : '#120a24'; } ctx.restore(); } },
  // 7: casco de navio naufragado no fundo
  t => { ctx.save(); ctx.globalAlpha = .34; ctx.translate(W * .28, H * .86); ctx.rotate(-.12); ctx.fillStyle = '#041a2a'; ctx.strokeStyle = '#3a8ab8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-260, 0); ctx.quadraticCurveTo(-120, 70, 220, 20); ctx.lineTo(260, -30); ctx.lineTo(-210, -40); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#2a6a98'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(-30, -250); ctx.moveTo(-30, -200); ctx.lineTo(70, -170); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#7fe0ff'; for (let i = 0; i < 6; i++) { ctx.globalAlpha = .4 + Math.sin(t + i) * .2; ctx.beginPath(); ctx.arc(-160 + i * 60, -10, 4, 0, TAU); ctx.fill(); } ctx.restore(); },
  // 8: moldura ornamentada de espelho
  t => { ctx.save(); ctx.globalAlpha = .34; ctx.strokeStyle = '#d8c8ff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.roundRect(60, 40, W - 120, H - 80, 140); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#7a5ac8'; ctx.beginPath(); ctx.roundRect(80, 60, W - 160, H - 120, 120); ctx.stroke(); for (const [x, y] of [[60, 40], [W - 60, 40], [60, H - 40], [W - 60, H - 40]]) { ctx.save(); ctx.translate(x, y); ctx.rotate(t * .2); ctx.fillStyle = '#e8d8ff'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 8 : 22; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.restore(); } const sw = ((t * .3) % 1) * (W + 400) - 200; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .12; ctx.fillStyle = '#fff'; ctx.save(); ctx.translate(sw, 0); ctx.rotate(.4); ctx.fillRect(-30, -200, 60, H + 400); ctx.restore(); ctx.restore(); },
  // 9: portal de luz dourado
  t => { ctx.save(); ctx.translate(W / 2, 110); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .4; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 150 + Math.sin(t * 1.4) * 8, Math.PI, 0); ctx.lineTo(150, 300); ctx.moveTo(-150, 0); ctx.lineTo(-150, 300); ctx.stroke(); const g = ctx.createLinearGradient(0, -150, 0, 360); g.addColorStop(0, 'rgba(255,233,168,.5)'); g.addColorStop(1, 'rgba(255,233,168,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 140, Math.PI, 0); ctx.lineTo(140, 340); ctx.lineTo(-140, 340); ctx.fill(); for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (i - 5.5) * .14; ctx.strokeStyle = 'rgba(255,240,190,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(Math.cos(a) * 700, 20 + Math.sin(a) * 700 + 560); ctx.stroke(); } ctx.restore(); },
];
{
  const bi = Visual.biome;
  Visual.biome = function () { bi.call(this); if (QL() < 1 || !G.stage) return; const f = Visual47.big[G.stage.id]; if (f) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; try { f(World.t); } catch (e) { } ctx.restore(); } };
}

// ---------- 2. interface em vidro: brilho no topo, borda interna e cantos acesos ----------
{
  const pn = UI.panel;
  UI.panel = function (x, y, w, h, o = {}) {
    pn.call(this, x, y, w, h, o); if (QL() < 1 || w < 40 || h < 30) return; const r = Math.min(o.r || 22, h / 2, w / 2);
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip();
    const g = ctx.createLinearGradient(0, y, 0, y + Math.min(h, 90)); g.addColorStop(0, 'rgba(255,255,255,.11)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, Math.min(h, 90));
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x + 4, y + 4, w - 8, h - 8, Math.max(2, r - 4)); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; const c = o.stroke && o.stroke[0] === '#' ? o.stroke : '#b98cff'; for (const [cx, cy] of [[x + r * .6, y + r * .6], [x + w - r * .6, y + h - r * .6]]) drawGlow(cx, cy, 26, c, .2); ctx.restore();
  };
  const bt = UI.button;
  UI.button = function (id, x, y, w, h, label, o = {}) {
    const r = bt.call(this, id, x, y, w, h, label, o); if (QL() < 1 || (World.t - this.enterAt) < .7 || o.disabled) return r;
    ctx.save(); ctx.beginPath(); ctx.roundRect(x + 2, y + 2, w - 4, h - 4, Math.min(16, h / 2)); ctx.clip(); const g = ctx.createLinearGradient(0, y, 0, y + h * .5); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h * .5);
    if (this.focusId === id) { const sw = ((World.t * .9) % 1.6) * (w + 80) - 40; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.save(); ctx.translate(x + sw, y); ctx.rotate(.5); ctx.fillRect(-10, -h, 20, h * 3); ctx.restore(); }
    ctx.restore(); return r;
  };
}

// ---------- 3. titulos grandes com degrade e brilho ----------
{
  const t0 = txt;
  txt = function (s, x, y, size, color = '#e2d4ff', align = 'left', weight = 900, base = 'top') {
    if (size >= 38 && (color === '#fff' || color === '#ffffff') && base === 'top' && QL() >= 1) {
      ctx.save(); ctx.font = `400 ${size}px "Lilita One", ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'top'; const g = ctx.createLinearGradient(0, y, 0, y + size * 1.15); g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#efe4ff'); g.addColorStop(1, '#b89aff'); ctx.shadowColor = 'rgba(150,100,255,.65)'; ctx.shadowBlur = 16; ctx.fillStyle = g; ctx.fillText(s, x, y); ctx.restore(); return;
    }
    return t0(s, x, y, size, color, align, weight, base);
  };
}

// ---------- 4. retratos que respiram e inclinam de leve ----------
{
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o) {
    if (QL() < 1) return pd.call(this, who, x, y, size, o); const t = World.t + (who.charCodeAt(0) || 0) * .37; ctx.save(); ctx.translate(x, y + Math.sin(t * 1.3) * 1.2); ctx.rotate(Math.sin(t * .7) * .01); const k = 1 + Math.sin(t * 1.6) * .006; ctx.scale(k, k); ctx.translate(-x, -y); pd.call(this, who, x, y, size, o); ctx.restore();
  };
}

// ---------- 5. alerta de chefe: faixas de perigo, linhas de velocidade e cor do chefe ----------
{
  const ov = Visual.overlay;
  Visual.overlay = function () {
    ov.call(this); if (QL() < 1 || !G.bossPending || G.state !== 'play' || !G.stage) return; const t = World.t, k = clamp(1 - (G.bossPendingT || 0) / 3.2, 0, 1), c = hx47(G.stage.tint) ? G.stage.tint : '#ff4a4a', a = Math.min(1, k * 3) * clamp((G.bossPendingT || 0) / .4 + .2, 0, 1);
    ctx.save(); ctx.globalAlpha = a * .85; for (const [y0, dir] of [[96, 1], [H - 124, -1]]) { ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, 26); ctx.clip(); ctx.fillStyle = '#12051f'; ctx.fillRect(0, y0, W, 26); ctx.fillStyle = c; const off = (t * 120 * dir) % 60; for (let x = -80 + off; x < W + 80; x += 60) { ctx.beginPath(); ctx.moveTo(x, y0 + 26); ctx.lineTo(x + 26, y0 + 26); ctx.lineTo(x + 52, y0); ctx.lineTo(x + 26, y0); ctx.fill(); } ctx.restore(); }
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * .25; ctx.strokeStyle = c; ctx.lineWidth = 3; for (let i = 0; i < 24; i++) { const an = i / 24 * TAU + t * .1, r0 = 340 + ((t * 700 + i * 90) % 400), r1 = r0 + 90; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * r0, H / 2 + Math.sin(an) * r0 * .6); ctx.lineTo(W / 2 + Math.cos(an) * r1, H / 2 + Math.sin(an) * r1 * .6); ctx.stroke(); }
    ctx.globalAlpha = a * (.1 + .08 * Math.sin(t * 10)); ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); ctx.restore();
  };
}

// ---------- 6. vitoria com fitas e derrota com brasas ----------
{
  const cl = Screens.clear;
  Screens.clear = function () {
    cl.call(this); if (QL() < 1) return; const t = World.t; ctx.save(); for (let i = 0; i < 26; i++) { const x = (s47(i) * W + Math.sin(t * .8 + i) * 40) | 0, y = ((t * (60 + s47(i + 3) * 80) + s47(i + 8) * H) % (H + 60)) - 30; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.globalAlpha = .75; ctx.fillStyle = ['#ffe9a8', '#ff9ac0', '#9fe8ff', '#b9ff9a', '#c8a0ff'][i % 5]; ctx.fillRect(-4, -9, 8, 18); ctx.restore(); } ctx.restore();
  };
  const ov = Screens.over;
  Screens.over = function () {
    ov.call(this); if (QL() < 1) return; const t = World.t; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) { const x = s47(i * 3) * W + Math.sin(t + i) * 24, y = H - ((t * (30 + s47(i) * 50) + s47(i + 5) * H) % H); drawGlow(x, y, 8 + s47(i + 2) * 8, i % 3 ? '#ff6a2a' : '#ffb340', .45); } ctx.restore();
    const g = ctx.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 820); g.addColorStop(0, 'rgba(20,0,10,0)'); g.addColorStop(1, 'rgba(40,0,10,.5)'); ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  };
}

// ---------- 7. cenas da historia como quadro: camera lenta, vinheta, barras e linhas de impacto ----------
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const S = G.story, pg = S && this.curPage(S); if (QL() < 1 || (pg && pg.video)) return sb.call(this); const t = World.t, z = 1.035 + Math.sin(t * .18) * .012;
    ctx.save(); ctx.translate(W / 2 + Math.sin(t * .13) * 8, H / 2 + Math.cos(t * .11) * 5); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); const r = sb.call(this); ctx.restore();
    const mood = pg && pg.mood; ctx.save();
    if (mood === 'angry' || mood === 'shock') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = mood === 'angry' ? 'rgba(255,90,60,.35)' : 'rgba(255,255,255,.3)'; ctx.lineWidth = 2.4; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, r0 = 380 + s47(i + Math.floor(t * 8)) * 120, r1 = r0 + 160 + s47(i) * 80; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0 * .7); ctx.lineTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1 * .7); ctx.stroke(); } }
    else if (mood === 'happy') { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const x = s47(i) * W, y = H - ((t * 24 + s47(i + 4) * H) % H); drawGlow(x, y, 10, '#fff0b0', .3); } }
    ctx.globalCompositeOperation = 'source-over'; const vg = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 860); vg.addColorStop(0, 'rgba(4,0,16,0)'); vg.addColorStop(1, 'rgba(4,0,16,.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, 38); ctx.fillRect(0, H - 38, W, 38); ctx.restore(); return r;
  };
}
