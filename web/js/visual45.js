'use strict';
// ---------- 45: acabamento da nave e dos guardioes, tiros com identidade por arma, cristais e moedas com brilho proprio ----------
const Visual45 = {};
const h45 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';

// ---------- nave: contorno, porta de vidro no olho, painel, rebites, brilho de aleta, motor com anel e acessorio da skin ----------
// chamado de dentro de Art.ship (art.js) depois do corpo e do olho; U = tamanho, X/Y = conversores, body = caminho do corpo, ey = altura do olho
Visual45.shipDetails = function (o, U, P, X, Y, body, ey) {
  const t = o.t || 0;
  // contorno escuro do corpo e das aletas
  ctx.save(); ctx.strokeStyle = 'rgba(18,5,34,.7)'; ctx.lineWidth = U * .028; ctx.lineJoin = 'round'; body(); ctx.stroke();
  const BW = P.bw || 1, FS = P.fs || 1; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X(s * .15 * BW), Y(.78)); ctx.lineTo(X(s * .44 * FS), Y(.25 - (FS - 1) * .12)); ctx.lineTo(X(s * .15 * BW), Y(.30)); ctx.stroke(); }
  // luz de borda nas aletas e no nariz
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = U * .014; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X(s * .17 * BW), Y(.76)); ctx.lineTo(X(s * .42 * FS), Y(.28 - (FS - 1) * .12)); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(X(-.16), Y(1.08)); ctx.bezierCurveTo(X(-.14), Y(1.28), X(-.06), Y(1.38), X(-.01), Y(1.42)); ctx.stroke();
  // painel e rebites
  ctx.save(); body(); ctx.clip(); ctx.strokeStyle = 'rgba(20,6,40,.35)'; ctx.lineWidth = U * .012; ctx.beginPath(); ctx.moveTo(X(-.2), Y(.46)); ctx.lineTo(X(.2), Y(.46)); ctx.moveTo(X(-.2), Y(.68)); ctx.lineTo(X(.2), Y(.68)); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; for (const s of [-1, 1]) for (const yy of [.36, .57]) { ctx.beginPath(); ctx.arc(X(s * .13), Y(yy), U * .012, 0, TAU); ctx.fill(); }
  // brilho vitreo do lado esquerdo
  const gl = ctx.createLinearGradient(X(-.2), 0, X(.05), 0); gl.addColorStop(0, 'rgba(255,255,255,.38)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.fillRect(X(-.2), Y(1.45), X(.25), U * 1.2); ctx.restore();
  // porta de vidro em volta do olho
  const pr = U * .148, mood = o.mood; if (mood !== 'happy') { ctx.strokeStyle = V45ring(P); ctx.lineWidth = U * .03; ctx.beginPath(); ctx.arc(0, ey, pr, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgba(18,5,34,.55)'; ctx.lineWidth = U * .012; ctx.beginPath(); ctx.arc(0, ey, pr + U * .018, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-pr * .45, ey - pr * .5, pr * .22, pr * .1, -.6, 0, TAU); ctx.fill(); }
  // anel de brilho do motor
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, Y(.22), U * .2 + Math.sin(t * 30) * 1.5, '#ffd36a', .5);
  // acessorio por skin
  const sk = SKINS.find(s => s.pal === P); ctx.globalCompositeOperation = 'source-over';
  if (sk) {
    if (sk.id === 'rose') { ctx.strokeStyle = P.g1; ctx.lineWidth = U * .02; ctx.beginPath(); ctx.moveTo(0, Y(1.43)); ctx.lineTo(0, Y(1.62)); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, Y(1.64), U * .1, '#ff9ad8', .9); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, Y(1.64), U * .025, 0, TAU); ctx.fill(); }
    else if (sk.id === 'cyan') { ctx.save(); body(); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = U * .012; ctx.beginPath(); ctx.moveTo(X(-.2), Y(.9)); ctx.lineTo(0, Y(1.1)); ctx.lineTo(X(.2), Y(.9)); ctx.moveTo(0, Y(1.1)); ctx.lineTo(0, Y(.55)); ctx.stroke(); ctx.restore(); }
    else if (sk.id === 'solar') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,200,90,.7)'; ctx.lineWidth = U * .02; ctx.lineCap = 'round'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .32, r0 = U * .62, r1 = U * (.78 + Math.sin(t * 8 + i) * .05); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 + Y(.75)); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1 + Y(.75)); ctx.stroke(); } }
    else if (sk.id === 'shadow') { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) drawGlow(Math.sin(t * 2 + i * 2) * U * .24, Y(.4 + i * .3), U * .2, '#6a4aff', .18); }
    else if (sk.id === 'gold') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = U * .022; ctx.beginPath(); ctx.ellipse(0, Y(1.56), U * .13, U * .035, 0, 0, TAU); ctx.stroke(); drawGlow(0, Y(1.56), U * .16, '#ffd84a', .45); }
  }
  ctx.restore();
};
const V45ring = P => { const g = ctx.createLinearGradient(-20, -20, 20, 20); g.addColorStop(0, '#f0e8ff'); g.addColorStop(.5, P.g0 || '#c6a6ff'); g.addColorStop(1, P.g2 || '#5326b8'); return g; };

// ---------- guardioes: luz de borda e faiscas orbitando ----------
{
  const ag = Art.guardian;
  Art.guardian = function (x, y, o) {
    ag.call(this, x, y, o); if (QL() < 1) return; const g = (o.guard || 'g_C').slice(2), c = GUARDS[g] ? GUARDS[g].c : '#ffb340', U = 112 * (o.scale || 1), r = U * .36, t = o.t || 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * .18);
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = Math.max(2, r * .09); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, r * .88, Math.PI * 1.08, Math.PI * 1.7); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const a = t * 1.7 + i * TAU / 3; drawGlow(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5 * .8, r * .22, c, .7); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.2, 2.2, 0, TAU); ctx.fill(); }
    ctx.restore();
  };
}

// ---------- tiros com identidade por arma ----------
{
  const ap = Art.pbullet;
  Art.pbullet = function (b) {
    if (b.orb || b.bee || b.rock || b.star || (b.kind === 'missile')) return ap.call(this, b);
    const c = h45(b.c) ? b.c : '#b98cff', t = World.t, ang = Math.atan2(b.vy, b.vx);
    if (!b.kind && (b.w === 'violet' || b.w === 'fan' || !b.w)) {
      const L = clamp(Math.hypot(b.vx, b.vy) * .06, 18, 60), fan = b.w === 'fan';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      ctx.globalCompositeOperation = 'lighter'; const tg = ctx.createLinearGradient(0, 4, 0, 4 + L); tg.addColorStop(0, c); tg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = tg; ctx.globalAlpha = .75; ctx.beginPath(); ctx.moveTo(-5, 6); ctx.lineTo(0, 6 + L); ctx.lineTo(5, 6); ctx.fill(); ctx.globalAlpha = 1; drawGlow(0, 0, 30, c, .85);
      ctx.globalCompositeOperation = 'source-over';
      if (fan) { ctx.fillStyle = b.crit ? '#fff3c0' : '#ffd36a'; ctx.beginPath(); ctx.moveTo(0, -13); ctx.quadraticCurveTo(7, -2, 5, 7); ctx.quadraticCurveTo(0, 11, -5, 7); ctx.quadraticCurveTo(-7, -2, 0, -13); ctx.fill(); ctx.strokeStyle = 'rgba(120,50,10,.7)'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -1, 2.2, 5, 0, 0, TAU); ctx.fill(); }
      else { ctx.fillStyle = V45grad(c); ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(5.5, 0); ctx.lineTo(0, 12); ctx.lineTo(-5.5, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(40,10,90,.7)'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(2, 0); ctx.lineTo(0, 6); ctx.lineTo(-2, 0); ctx.closePath(); ctx.fill(); }
      if (b.crit) { ctx.rotate(t * 9); ctx.fillStyle = '#ffe9a8'; ctx.fillRect(-11, -1.6, 22, 3.2); ctx.fillRect(-1.6, -11, 3.2, 22); }
      ctx.restore(); return;
    }
    if (b.kind === 'cannon' || b.kind === 'bomb') {
      const r = b.r || 20; ctx.save(); ctx.translate(b.x, b.y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 2.6, c, .8); drawGlow(0, 0, r * 1.3, '#fff2c0', .8); for (let i = 1; i < 6; i++) drawGlow(-b.vx * .012 * i, -b.vy * .012 * i, r * (1.1 - i * .15), '#ff9a4a', .3);
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = V45rg(0, 0, r * .75, ['#ffffff', '#ffd9a0', c]); ctx.beginPath(); ctx.arc(0, 0, r * .66, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(60,20,8,.6)'; ctx.lineWidth = 2.4; ctx.stroke();
      ctx.rotate(t * 3); ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.arc(0, 0, r * .9, 0, TAU); ctx.stroke(); ctx.restore(); return;
    }
    if (b.kind === 'boom') {
      const rr = b.r || 22; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(t * 14 + b.x * .01); ctx.globalCompositeOperation = 'lighter'; for (let i = 1; i < 5; i++) { ctx.save(); ctx.rotate(-i * .35); ctx.globalAlpha = .28 - i * .05; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, rr + 6, -1.15, 1.15); ctx.arc(-6, 0, rr - 2, 1.0, -1.0, true); ctx.closePath(); ctx.fill(); ctx.restore(); } ctx.globalAlpha = 1; drawGlow(0, 0, 54, '#ffe9a8', .7); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = V45grad('#ffe9a8'); ctx.strokeStyle = '#d89a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, rr + 6, -1.2, 1.2); ctx.arc(-6, 0, rr - 2, 1.0, -1.0, true); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(rr * .4, 0, 3, 0, TAU); ctx.fill(); ctx.restore(); return;
    }
    if (b.kind === 'flame') {
      const k = 1 - clamp((b.life || 0) / (b.l0 || .38), 0, 1), r = 12 + k * 20; ctx.save(); ctx.translate(b.x, b.y); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - k * .8;
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(ang + Math.PI / 2 + Math.sin(t * 20 + i * 2 + b.x) * .5); ctx.fillStyle = [k < .5 ? '#ffe9a8' : '#ff8a2a', '#ff5a1a', '#ffd36a'][i]; ctx.beginPath(); ctx.moveTo(0, -r * 1.3); ctx.quadraticCurveTo(r * .8, -r * .1, 0, r * .8); ctx.quadraticCurveTo(-r * .8, -r * .1, 0, -r * 1.3); ctx.fill(); ctx.restore(); }
      drawGlow(0, 0, r * 2.2, k < .5 ? '#ffd36a' : '#ff6a1a', .6); drawGlow(0, 0, r * .8, '#ffffff', (1 - k) * .6); ctx.restore(); return;
    }
    return ap.call(this, b);
  };
}
const V45grad = c => { const g = ctx.createLinearGradient(0, -17, 0, 12); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, c); g.addColorStop(1, '#5a2aa0'); return g; };
const V45rg = (x, y, r, st) => { const g = ctx.createRadialGradient(x - r * .25, y - r * .25, 1, x, y, r); g.addColorStop(0, st[0]); g.addColorStop(.5, st[1]); g.addColorStop(1, st[2]); return g; };

// ---------- cristais de experiencia, moedas e coracoes com brilho proprio ----------
{
  const pk = Art.pickup;
  Art.pickup = function (p) {
    pk.call(this, p); if (QL() < 1 || !['xp', 'coin', 'heart'].includes(p.type)) return; const t = World.t, col = p.type === 'xp' ? '#7fe0ff' : p.type === 'coin' ? '#ffd36a' : '#ff8aae';
    ctx.save(); ctx.translate(p.x, p.y + Math.sin((p.age || 0) * 5) * 2); ctx.globalCompositeOperation = 'lighter';
    const a = t * 2.4 + (p.x || 0) * .02; ctx.fillStyle = '#ffffff'; ctx.globalAlpha = .8; ctx.beginPath(); ctx.arc(Math.cos(a) * 15, Math.sin(a) * 15, 1.8, 0, TAU); ctx.fill();
    ctx.globalAlpha = .35; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 14 + Math.sin(t * 4 + (p.x || 0)) * 1.5, 0, TAU); ctx.stroke();
    if (p.type === 'coin') { const sw = ((t * .8 + (p.x || 0) * .01) % 1); ctx.globalAlpha = .6 * Math.sin(sw * Math.PI); ctx.fillStyle = '#fff'; ctx.save(); ctx.rotate(.6); ctx.fillRect(-12 + sw * 24, -11, 4, 22); ctx.restore(); }
    ctx.restore();
  };
}
