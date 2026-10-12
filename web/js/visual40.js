'use strict';
// ---------- 40: cenario unico por fase, menu principal vivo, fim de fase com estrelas voando e brilho nos botoes em foco ----------
const Visual40 = { whale: 0, meteors: [] };
const s40 = n => { const s = Math.sin(n * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };

// ---------- cenarios: uma assinatura visual por fase (atras do jogo, bem suaves) ----------
Visual40.scene = [
  // 0: ruinas flutuantes
  t => { for (let i = 0; i < 6; i++) { const sp = 18 + i * 7, y = ((t * sp + i * 190) % (H + 200)) - 100, x = 90 + s40(i) * (W - 180), w = 50 + s40(i + 3) * 80, h = 24 + s40(i + 7) * 40, a = Math.sin(t * .3 + i) * .08; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = .32; ctx.fillStyle = '#1a0f3a'; ctx.strokeStyle = '#8b6fd0'; ctx.lineWidth = 2; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.fillStyle = '#8b6fd0'; ctx.globalAlpha = .18; ctx.fillRect(-w / 2, -h / 2, w, 4); ctx.restore(); } },
  // 1: planeta com aneis e rochas grandes
  t => { ctx.save(); ctx.globalAlpha = .38; const cx = 120, cy = H + 80, r = 380; const g = ctx.createRadialGradient(cx - 80, cy - 120, 40, cx, cy, r); g.addColorStop(0, '#c88a50'); g.addColorStop(1, '#2a1408'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,210,150,.5)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.5, r * .3, -.35, 0, TAU); ctx.stroke(); ctx.restore(); for (let i = 0; i < 4; i++) { const x = ((t * (10 + i * 5) + i * 400) % (W + 300)) - 150, y = 120 + i * 130 + Math.sin(t * .4 + i) * 20; ctx.save(); ctx.translate(x, y); ctx.rotate(t * .1 + i); ctx.globalAlpha = .28; ctx.fillStyle = '#3a2412'; ctx.beginPath(); for (let k = 0; k < 7; k++) { const an = k / 7 * TAU, rr = 40 + s40(i * 7 + k) * 26; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } ctx.fill(); ctx.restore(); } },
  // 2: nuvens de tempestade
  t => { for (let i = 0; i < 6; i++) { const x = ((t * (14 + i * 4) + i * 260) % (W + 500)) - 250, y = 50 + (i % 3) * 70; const g = ctx.createRadialGradient(x, y, 10, x, y, 220); g.addColorStop(0, 'rgba(50,20,80,.5)'); g.addColorStop(1, 'rgba(50,20,80,0)'); ctx.fillStyle = g; ctx.fillRect(x - 230, y - 120, 460, 240); } },
  // 3: proeminencias solares nas bordas
  t => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const sd of [0, 1]) for (let i = 0; i < 3; i++) { const x0 = sd ? W : 0, dir = sd ? -1 : 1, y0 = 120 + i * 200 + Math.sin(t * .7 + i * 2 + sd) * 20, len = 150 + Math.sin(t * 1.1 + i + sd * 3) * 50; ctx.strokeStyle = 'rgba(255,140,40,.22)'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0 + dir * len, y0 - 70, x0 + dir * len, y0 + 70, x0, y0 + 130); ctx.stroke(); ctx.strokeStyle = 'rgba(255,220,120,.25)'; ctx.lineWidth = 5; ctx.stroke(); } ctx.restore(); },
  // 4: eco: linhas de interferencia e fantasmas
  t => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { if (s40(Math.floor(t * 4) + i * 13) < .55) continue; const y = s40(Math.floor(t * 3) * 3 + i) * H, w = 120 + s40(i + t | 0) * 500, x = s40(i * 5 + Math.floor(t * 2)) * (W - w); ctx.fillStyle = i % 2 ? 'rgba(80,220,255,.1)' : 'rgba(255,80,200,.09)'; ctx.fillRect(x, y, w, 3 + s40(i) * 4); } ctx.restore(); },
  // 5: buraco negro com disco
  t => { const cx = W * .78, cy = 180; ctx.save(); ctx.globalAlpha = .55; const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 200); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.35, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(60,10,110,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 200, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { ctx.strokeStyle = ['rgba(190,120,255,.5)', 'rgba(255,170,255,.35)', 'rgba(120,80,255,.3)'][k]; ctx.lineWidth = 6 - k * 1.5; ctx.beginPath(); ctx.ellipse(cx, cy, 130 + k * 28, 30 + k * 7, -.25 + Math.sin(t * .2) * .03, 0, TAU); ctx.stroke(); } ctx.restore(); },
  // 6: aurora de luz
  t => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const x = 100 + i * 170 + Math.sin(t * .5 + i) * 40, w = 90 + Math.sin(t * .8 + i * 2) * 30; const g = ctx.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, 'rgba(255,220,120,.17)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w / 2, 0); ctx.quadraticCurveTo(x + Math.sin(t + i) * 60, 260, x - w / 2 + 20, 520); ctx.lineTo(x + w / 2 + 20, 520); ctx.quadraticCurveTo(x + 60 + Math.sin(t + i) * 60, 260, x + w / 2, 0); ctx.fill(); } ctx.restore(); },
  // 7: baleia de estrelas
  t => { const p = (t / 55) % 1, x = -400 + p * (W + 800), y = 180 + Math.sin(t * .4) * 18; ctx.save(); ctx.translate(x, y); ctx.globalAlpha = .4; ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7fd8ff'; ctx.lineWidth = 3; ctx.setLineDash([2, 12]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-220, 0); ctx.bezierCurveTo(-120, -90, 120, -80, 210, -10); ctx.bezierCurveTo(250, 20, 300, 10, 340, -30); ctx.bezierCurveTo(330, 20, 300, 50, 250, 50); ctx.bezierCurveTo(130, 90, -120, 80, -220, 0); ctx.stroke(); ctx.setLineDash([]); for (let i = 0; i < 10; i++) drawGlow(-200 + i * 52, Math.sin(i * 1.3 + t) * 20, 16, '#9fe8ff', .3); ctx.restore(); },
  // 8: cacos de vidro
  t => { ctx.save(); for (let i = 0; i < 9; i++) { const x = ((s40(i) * W) + t * (6 + i)) % (W + 160) - 80, y = ((s40(i + 20) * H) + t * (14 + i * 2)) % (H + 160) - 80, r = 40 + s40(i + 8) * 70, a = t * .15 + i; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .7, r * .5); ctx.lineTo(-r * .5, r * .6); ctx.closePath(); ctx.fillStyle = 'rgba(210,190,255,.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(230,215,255,.28)'; ctx.lineWidth = 2; ctx.stroke(); if (Math.sin(t * 1.5 + i * 3) > .85) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fill(); } ctx.restore(); } ctx.restore(); },
  // 9: constelacao em formato de coracao
  t => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const cx = W / 2, cy = 250, sc = 7.5; const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); pts.push([cx + x * sc, cy + y * sc * .95]); } ctx.strokeStyle = 'rgba(255,225,150,.18)'; ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke(); pts.forEach(([x, y], i) => drawGlow(x, y, 12 + Math.sin(t * 2 + i) * 4, '#ffe9a8', .5)); for (let i = 0; i < 12; i++) { const x = s40(i) * W, y = H - ((t * (20 + i * 3) + s40(i + 4) * H) % H); drawGlow(x, y, 6, '#ffd36a', .25); } ctx.restore(); },
];
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (QL() < 1 || !G.stage) return; const f = Visual40.scene[G.stage.id]; if (!f) return;
    ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; try { f(World.t); } catch (e) { } ctx.restore();
  };
}

// ---------- menu principal vivo: meteoros e o Vazio cobrindo as bordas ----------
{
  const mo = Visual6.menuOverlay;
  Visual6.menuOverlay = function (s) {
    mo.call(this, s); if (s !== 'title' || QL() < 1) return; const t = World.t;
    if (Math.random() < .004 && Visual40.meteors.length < 3) Visual40.meteors.push({ x: rand(W * .3, W + 100), y: -40, vx: -rand(500, 800), vy: rand(300, 480), t: 0 });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const m of Visual40.meteors) { m.x += m.vx / 60; m.y += m.vy / 60; m.t += 1 / 60; const a = Math.atan2(m.vy, m.vx), g = ctx.createLinearGradient(m.x, m.y, m.x - Math.cos(a) * 200, m.y - Math.sin(a) * 200); g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'rgba(160,200,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - Math.cos(a) * 200, m.y - Math.sin(a) * 200); ctx.stroke(); drawGlow(m.x, m.y, 18, '#cfe0ff', .8); } Visual40.meteors = Visual40.meteors.filter(m => m.y < H + 100 && m.x > -300); ctx.restore();
    const cl = Object.keys(Save.data.cleared || {}).filter(k => Save.data.cleared[k]).length, k = clamp(1 - cl / 10, 0, 1) * .5; if (k > .02) {
      ctx.save(); for (const [x, y] of [[0, H], [W, H], [0, 0]]) { const g = ctx.createRadialGradient(x, y, 20, x, y, 340 + Math.sin(t * .6 + x) * 20); g.addColorStop(0, 'rgba(20,0,40,' + (k * 1.3) + ')'); g.addColorStop(1, 'rgba(20,0,40,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      ctx.strokeStyle = 'rgba(70,20,120,' + k + ')'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const bx = i * 60 + 30; ctx.beginPath(); ctx.moveTo(bx, H); for (let y = H; y > H - 110 - i * 12; y -= 12) ctx.lineTo(bx + Math.sin(y * .05 + t * 1.5 + i) * 14, y); ctx.stroke(); } ctx.restore();
    }
  };
}

// ---------- fim de fase: estrelas voam ate o contador ----------
{
  const cel = Screens.celebrate;
  Screens.celebrate = function () {
    cel.call(this); const t = G.celT || 0; Visual40.cs = G.celT < .1 ? [] : (Visual40.cs || []);
    if (QL() >= 1 && t > .8 && t < 3.6 && Visual40.cs.length < 40 && Math.random() < .5 && G.runCoins > 0) Visual40.cs.push({ x: W / 2 + rand(-120, 120), y: H * .56, t: 0, d: rand(.9, 1.5), a: rand(-.6, .6) });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of Visual40.cs) { s.t += 1 / 60; const k = clamp(s.t / s.d, 0, 1), e = k * k, x = lerp(s.x, W - 80, e) + Math.sin(k * Math.PI) * s.a * 160, y = lerp(s.y, 36, e) - Math.sin(k * Math.PI) * 90; drawGlow(x, y, 26, '#ffd36a', .85 * (1 - k * .3)); ctx.globalAlpha = 1; ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill(); } ctx.restore(); Visual40.cs = Visual40.cs.filter(s => s.t < s.d);
    if (t > .8) { const n = Math.round(G.runCoins * clamp((t - .8) / 2.6, 0, 1)); ctx.save(); ctx.globalAlpha = clamp((t - .8) / .4, 0, 1); txt('★ +' + n, W - 40, 20, 34, '#ffd36a', 'right', 900); ctx.restore(); }
  };
}

// ---------- brilho pulsante no botao em foco ----------
{
  const ue = UI.end;
  UI.end = function () {
    try {
      if (QL() >= 1 && !['play', 'levelup', 'cine', 'story'].includes(G.state)) {
        const r = this.cur.find(q => q.id === this.focusId && !q.dis && !q.slider);
        if (r && r.w > 20) { ctx.save(); ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0); const p = .5 + .5 * Math.sin(World.t * 5); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(190,160,255,' + (.25 + p * .3) + ')'; ctx.lineWidth = 3 + p * 2; ctx.shadowColor = '#b98cff'; ctx.shadowBlur = 14 + p * 10; ctx.beginPath(); ctx.roundRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6, Math.min(24, r.h / 2 + 3)); ctx.stroke(); ctx.restore(); }
      }
    } catch (e) { }
    return ue.call(this);
  };
}
