'use strict';
// ---------- polimento grafico 4: detalhes extras nos chefes, avisos de ataque, humor nas cenas, logo com brilho e modo foto ----------
const Visual7 = { shotT: 0 };

// ===== chefes antigos com camadas que se movem sozinhas =====
function bossKit(cls, front, back) {
  const d = cls.prototype.draw;
  cls.prototype.draw = function () {
    if (this.state === 'dying' || QL() < 1) return d.call(this);
    ctx.save(); if (back) back.call(this); ctx.restore();
    d.call(this);
    ctx.save(); front.call(this); ctx.restore();
  };
}
bossKit(MotherShip, function () { // vagens em orbita, antenas e luzes
  const t = this.t, ph = this.phase;
  for (let i = 0; i < 6; i++) {
    const a = t * .5 + i * TAU / 6, s = Math.sin(a); if (s < -.15) continue;
    const x = this.x + Math.cos(a) * 218, y = this.y + s * 62 - 8, sc = .8 + s * .25;
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = '#5a1a08'; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(-14, -8, 28, 16, 6); ctx.fill(); ctx.stroke();
    const on = Math.sin(t * 6 + i) > 0; ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 18, on ? '#ffe9a8' : '#ff7a2a', .8); ctx.restore();
  }
  for (let i = -1; i <= 1; i++) { const ax = this.x + i * 52, ay = this.y - 92 - (i === 0 ? 20 : 8), w = Math.sin(t * 2 + i) * 6; ctx.strokeStyle = '#7a2a0a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, ay + 24); ctx.lineTo(ax + w, ay); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(ax + w, ay, 14, '#ffb340', .5 + .4 * Math.sin(t * 5 + i)); }
  if (ph >= 1 && Math.random() < .12) G.parts.push({ k: 'smoke', x: this.x + (Math.random() < .5 ? -1 : 1) * 160, y: this.y - 30, vx: rand(-20, 20), vy: rand(-60, -20), life: .8, max: .8, r: rand(8, 14), c: '#5a2a1a', drag: 1 });
}, null);
bossKit(RockGolem, function () { // rochas flutuando e runas nas rachaduras
  const t = this.t, ph = this.phase;
  for (let i = 0; i < 7; i++) {
    const a = t * (.35 + (i % 3) * .1) + i * TAU / 7, rr = 190 + (i % 3) * 38, x = this.x + Math.cos(a) * rr, y = this.y + Math.sin(a) * rr * .55, s = 14 + (i % 3) * 7;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * .6 + i); ctx.fillStyle = '#2a1830'; ctx.strokeStyle = 'rgba(200,160,184,.6)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = 0; k < 6; k++) { const aa = k / 6 * TAU, q = s * (.7 + ((i * 7 + k) % 5) * .1); ctx.lineTo(Math.cos(aa) * q, Math.sin(aa) * q); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff9a4a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (let i = 0; i < 4 + ph * 2; i++) { const a = -1.2 + i * (2.4 / (3 + ph * 2)), pu = .35 + .35 * Math.sin(this.t * 3 + i); ctx.globalAlpha = pu; ctx.beginPath(); let x = this.x + Math.cos(a + Math.PI / 2) * 20, y = this.y + 20; ctx.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (((i * 13 + k * 7) % 9) - 4) * 5; y += 18; ctx.lineTo(x, y); } ctx.stroke(); }
}, null);
bossKit(StormEye, function () { // aneis e orbes carregados de energia
  const t = this.t, pts = [];
  ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 2; ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) { ctx.globalAlpha = .5; ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(t * (.5 + k * .2) * (k % 2 ? -1 : 1)); ctx.setLineDash([22, 18]); ctx.beginPath(); ctx.arc(0, 0, 150 + k * 18, 0, TAU); ctx.stroke(); ctx.restore(); }
  for (let i = 0; i < 4; i++) { const a = t * .9 + i * TAU / 4, x = this.x + Math.cos(a) * 182, y = this.y + Math.sin(a) * 182; pts.push([x, y]); ctx.globalAlpha = 1; drawGlow(x, y, 24, '#ffffff', .8); drawGlow(x, y, 44, '#ff7ac8', .5); }
  for (let i = 0; i < 4; i++) if (Math.random() < .35) { const j = (i + 1) % 4; zap(pts[i][0], pts[i][1], pts[j][0], pts[j][1], 6, 12, '#9fe8ff', 2); }
}, null);
bossKit(SunGuardian, function () { // protuberancias e corona girando
  const t = this.t, ph = this.phase; ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU + t * .25, len = 70 + 28 * Math.sin(t * 2 + i * 1.3) + ph * 14, x0 = this.x + Math.cos(a) * 118, y0 = this.y + Math.sin(a) * 118;
    ctx.strokeStyle = i % 2 ? '#ff7a20' : '#ffd36a'; ctx.lineWidth = 6; ctx.globalAlpha = .55; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + Math.cos(a + .6) * len * .7, y0 + Math.sin(a + .6) * len * .7, x0 + Math.cos(a + .2) * len, y0 + Math.sin(a + .2) * len); ctx.stroke();
  }
  ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(-t * .4); ctx.setLineDash([4, 12]); ctx.strokeStyle = '#fff0c0'; ctx.lineWidth = 3; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(0, 0, 160, 0, TAU); ctx.stroke(); ctx.restore();
}, null);

// ===== avisos de ataque dos chefes =====
{
  const ba = Visual.bossAura;
  Visual.bossAura = function (b) {
    ba.call(this, b); if (b.state !== 'fight' || !b.cd) return;
    const t = World.t;
    for (const k in b.cd) {
      const v = b.cd[k]; if (!(v > 0 && v < .55)) continue; const w = 1 - v / .55;
      if (/fan|cannon|aim|shot|burst|volley|mirror/.test(k)) {
        const a0 = aimAt(b.x, b.y); ctx.save(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 90; ctx.strokeStyle = 'rgba(255,90,70,' + (.15 + w * .4) + ')'; ctx.lineWidth = 2 + w * 2;
        for (let j = -1; j <= 1; j++) { const a = a0 + j * .26; ctx.beginPath(); ctx.moveTo(b.x, b.y + 30); ctx.lineTo(b.x + Math.cos(a) * 560, b.y + 30 + Math.sin(a) * 560); ctx.stroke(); } ctx.restore();
      } else if (/ring|nova|pulse/.test(k)) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,200,120,' + (w * .6) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, (b.rad || 110) * (1.9 - w * .8), 0, TAU); ctx.stroke(); ctx.restore();
      }
    }
  };
}

// ===== humor nas cenas =====
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    sb.call(this); const S = G.story; if (!S) return; const pg = S.pages[S.i]; if (!pg) return;
    const t = S.t, mood = pg.mood, t2 = World.t; ctx.save();
    if (mood === 'angry') { const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .85); g.addColorStop(0, 'rgba(255,30,60,0)'); g.addColorStop(1, 'rgba(255,30,60,' + (.22 + .08 * Math.sin(t2 * 6)) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    else if (mood === 'sad') { ctx.fillStyle = 'rgba(20,40,100,.2)'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(160,200,255,.22)'; ctx.lineWidth = 1.5; for (let i = 0; i < 40; i++) { const x = (i * 97) % W, y = ((t2 * 380 + i * 53) % (H + 60)) - 30; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 24); ctx.stroke(); } }
    else if (mood === 'happy' || mood === 'free') { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, H, W, 0); g.addColorStop(0, 'rgba(255,220,140,.14)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    else if (mood === 'worry') { const g = ctx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .9); g.addColorStop(0, 'rgba(0,0,10,0)'); g.addColorStop(1, 'rgba(0,0,10,' + (.35 + .12 * Math.sin(t2 * 2)) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    else if (mood === 'determined') { ctx.globalCompositeOperation = 'lighter'; for (let i = -1; i <= 1; i++) { const g = ctx.createLinearGradient(W / 2 + i * 260, H, W / 2 + i * 120, 0); g.addColorStop(0, 'rgba(200,170,255,.16)'); g.addColorStop(1, 'rgba(200,170,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(W / 2 + i * 260 - 40, H); ctx.lineTo(W / 2 + i * 260 + 40, H); ctx.lineTo(W / 2 + i * 120 + 20, 0); ctx.lineTo(W / 2 + i * 120 - 20, 0); ctx.fill(); } }
    if (mood === 'shock' && t < .35) { ctx.globalAlpha = (1 - t / .35) * .7; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = (1 - t / .35) * .5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * 260, H / 2 + Math.sin(a) * 200); ctx.lineTo(W / 2 + Math.cos(a) * 900, H / 2 + Math.sin(a) * 700); ctx.stroke(); } }
    if ((Visual.kbT || 0) < .5) { ctx.globalAlpha = 1 - (Visual.kbT || 0) / .5; ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, H); } // entrada suave em cena nova
    ctx.restore();
  };
}

// ===== logo com brilho passando =====
{
  const ti = Screens.title;
  Screens.title = function () {
    ti.call(this); const t = World.t, tt = t - (G.titleStart ?? t); if (tt < 2.6) return;
    const word = 'OLIENZINHO', X0 = 112, Y0 = 214; ctx.save(); ctx.font = `900 96px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const p = ((t * .35) % 3) - .5, bx = X0 + p * 760;
    ctx.fillStyle = lin(bx - 90, Y0 - 90, bx + 90, Y0 + 10, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,240,200,.95)'], [1, 'rgba(255,255,255,0)']]);
    let x = X0; for (const c of word) { ctx.fillText(c, x, Y0); x += ctx.measureText(c).width; }
    // brilhos de estrela que piscam no logo
    ctx.globalCompositeOperation = 'lighter'; const k = Math.floor(t * .9), ph = t * .9 - k, sx = X0 + 40 + hsh(k) * 700, sy = Y0 - 80 + hsh(k + 9) * 70, a = Math.sin(ph * Math.PI);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(sx - 16 * a, sy); ctx.lineTo(sx + 16 * a, sy); ctx.moveTo(sx, sy - 16 * a); ctx.lineTo(sx, sy + 16 * a); ctx.stroke(); drawGlow(sx, sy, 20, '#ffffff', a * .8);
    ctx.restore();
  };
}

// ===== modo foto: F9 salva uma imagem com moldura; F8 esconde a interface =====
addEventListener('keydown', e => {
  if (e.key === 'F9') { e.preventDefault(); Visual7.shotWant = true; }
  if (e.key === 'F8') { e.preventDefault(); G.hideHud = !G.hideHud; Visual7.shotT = 2; Visual7.msg = G.hideHud ? 'INTERFACE ESCONDIDA (F8 volta)' : 'INTERFACE VISÍVEL'; }
});
Visual7.capture = function () {
  if (!Visual7.shotWant) return; Visual7.shotWant = false;
  try {
    const w = cv.width, h = cv.height, f = Math.round(h * .045), o = document.createElement('canvas'); o.width = w; o.height = h + f; const c = o.getContext('2d');
    c.fillStyle = '#03010b'; c.fillRect(0, 0, w, h + f); c.drawImage(cv, 0, 0);
    c.strokeStyle = '#d9a84a'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, w - 3, h - 3);
    c.fillStyle = '#ffb340'; c.font = `900 ${Math.round(f * .5)}px ${FONT}`; c.textBaseline = 'middle'; c.fillText('OLIENZINHO  •  GUARDIÃO DAS ESTRELAS', 20, h + f / 2);
    c.fillStyle = '#8f84c4'; c.textAlign = 'right'; c.fillText('olien.digital', w - 20, h + f / 2);
    const d = new Date(), pad = n => String(n).padStart(2, '0'), name = 'olienzinho_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + '.png';
    const a = document.createElement('a'); a.download = name; a.href = o.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
    Visual7.shotT = 2.4; Visual7.msg = 'FOTO SALVA: ' + name; Snd.play('stamp');
  } catch (err) { Visual7.shotT = 2; Visual7.msg = 'NÃO FOI POSSÍVEL SALVAR A FOTO'; }
};
{
  const td = Visual6.toastDraw;
  Visual6.toastDraw = function () {
    td.call(this); if (Visual7.shotT <= 0) return; Visual7.shotT -= 1 / 60; const a = clamp(Visual7.shotT, 0, 1);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(14,5,40,.92)'; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 2; const w = Math.min(640, 40 + Visual7.msg.length * 9); ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, H - 120, w, 40, 20); ctx.fill(); ctx.stroke();
    txt(Visual7.msg, W / 2, H - 100, 15, '#ffe9a8', 'center', 900, 'middle'); ctx.restore();
  };
}
