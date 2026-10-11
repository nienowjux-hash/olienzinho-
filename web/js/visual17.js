'use strict';
// ---------- skins com asas e acessorios: Aurora, Prisma, Eclipse e Reflexo ----------
SKINS.push({ id: 'espelho', name: 'Reflexo', how: 'Vença o Epílogo', pal: { g0: '#ffffff', g1: '#c8b8ff', g2: '#3a2a7a', fin: '#7a5aff', nozzle: '#1a1050', stripe: '#ffffff', glow: '#c8a0ff' }, ok: () => !!Save.data.epiDone });
for (const s of SKINS) PALMAP.set(s.pal, s.id);
const Visual17 = {};
Visual17.wings = function (id, x, y, o) {
  const U = 112 * (o.scale || 1), t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * .24); ctx.scale(o.sx || 1, o.sy || 1); if (o.inv > 0 && Math.floor(o.inv * 14) % 2 === 0) ctx.globalAlpha = .4;
  const base = ctx.globalAlpha;
  if (id === 'eclipse') { // disco negro com coroa dourada atras da nave
    const fl = 1 + Math.sin(t * 9) * .05; ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -U * .05, U * .95, '#ffb340', .22 * base); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = base;
    ctx.fillStyle = '#04030c'; ctx.beginPath(); ctx.arc(0, -U * .05, U * .5 * fl, 0, TAU); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffcf6b'; ctx.lineWidth = U * .045; ctx.globalAlpha = .8 * base; ctx.beginPath(); ctx.arc(0, -U * .05, U * .5 * fl, 0, TAU); ctx.stroke(); ctx.lineWidth = U * .015; ctx.strokeStyle = '#ffffff'; ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .4, r0 = U * .52, r1 = U * (.62 + .08 * Math.sin(t * 7 + i * 2)); ctx.strokeStyle = '#ffb340'; ctx.lineWidth = U * .015; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, -U * .05 + Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, -U * .05 + Math.sin(a) * r1); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = base;
    for (const s of [-1, 1]) { ctx.save(); ctx.scale(s, 1); ctx.fillStyle = '#0a0818'; ctx.strokeStyle = '#ffcf6b'; ctx.lineWidth = U * .02; ctx.beginPath(); ctx.moveTo(U * .1, -U * .1); ctx.lineTo(U * .56, -U * .42); ctx.lineTo(U * .4, -U * .12); ctx.lineTo(U * .7, U * .02); ctx.lineTo(U * .4, U * .08); ctx.lineTo(U * .52, U * .3); ctx.lineTo(U * .12, U * .12); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
    for (let k = 0; k < 2; k++) { const a = t * 1.6 + k * Math.PI; ctx.fillStyle = '#05050f'; ctx.strokeStyle = '#ffcf6b'; ctx.lineWidth = U * .015; ctx.beginPath(); ctx.arc(Math.cos(a) * U * .68, -U * .05 + Math.sin(a) * U * .3, U * .06, 0, TAU); ctx.fill(); ctx.stroke(); }
  } else if (id === 'aurora') { // fitas de aurora boreal
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s, 1); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) { const f = i / 10, px = U * (.08 + f * (.58 + k * .06)), py = U * (-.1 + k * .08) + Math.sin(t * 3 + f * 4 + k * 1.3) * U * .08 * f - f * U * (.2 - k * .12); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
        ctx.strokeStyle = ['#7fe8a0', '#5af0e0', '#ff8ae0'][k]; ctx.globalAlpha = .6 * base; ctx.lineWidth = U * (.11 - k * .025); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = .35 * base; ctx.lineWidth = U * .012; ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7fe8a0'; ctx.lineWidth = U * .03; ctx.globalAlpha = .7 * base; ctx.beginPath(); ctx.ellipse(0, -U * .68, U * .22, U * .06, 0, 0, TAU); ctx.stroke(); drawGlow(0, -U * .68, U * .32, '#5af0a0', .35 * base);
    for (let i = 0; i < 4; i++) { const a = t * 1.2 + i * 1.57; ctx.fillStyle = '#ffffff'; ctx.globalAlpha = .8 * base; ctx.beginPath(); ctx.arc(Math.cos(a) * U * .22, -U * .68 + Math.sin(a) * U * .06, U * .014, 0, TAU); ctx.fill(); }
  } else if (id === 'prisma') { // cristais que quebram a luz em cores
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s, 1);
      for (let k = 0; k < 3; k++) {
        const dx = .3 + k * .15, dy = -.2 + k * .16, sz = .3 - k * .05, h = (t * 60 + k * 70 + (s > 0 ? 0 : 35)) % 360; ctx.save(); ctx.translate(U * dx, U * dy); ctx.rotate(.4 - k * .3 + Math.sin(t * 2 + k) * .06);
        ctx.fillStyle = 'hsla(' + h + ',90%,78%,.62)'; ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = U * .015; ctx.beginPath(); ctx.moveTo(0, -U * sz); ctx.lineTo(U * sz * .5, U * sz * .2); ctx.lineTo(0, U * sz * .75); ctx.lineTo(-U * sz * .5, U * sz * .2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -U * sz); ctx.lineTo(0, U * sz * .75); ctx.moveTo(-U * sz * .5, U * sz * .2); ctx.lineTo(U * sz * .5, U * sz * .2); ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.stroke(); ctx.restore();
      }
      ctx.restore();
    }
    ctx.save(); ctx.translate(0, -U * .7); ctx.rotate(t * .8); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) { ctx.rotate(TAU / 6); ctx.strokeStyle = 'hsl(' + ((t * 80 + i * 60) % 360) + ',95%,70%)'; ctx.lineWidth = U * .014; ctx.globalAlpha = .7 * base; ctx.beginPath(); ctx.moveTo(U * .07, 0); ctx.lineTo(U * (.2 + .05 * Math.sin(t * 5 + i)), 0); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = base; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.strokeStyle = '#a8c8ff'; ctx.lineWidth = U * .012; ctx.beginPath(); ctx.moveTo(0, -U * .08); ctx.lineTo(U * .07, U * .05); ctx.lineTo(-U * .07, U * .05); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  } else if (id === 'espelho') { // vidracas espelhadas e reflexo embaixo
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s, 1);
      for (let k = 0; k < 2; k++) {
        ctx.save(); ctx.translate(U * (.2 + k * .17), U * (-.16 + k * .17)); ctx.transform(1, -.28, 0, 1, 0, 0); const w = U * (.2 - k * .03), h = U * (.34 - k * .06);
        const g = ctx.createLinearGradient(0, -h / 2, w, h / 2); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.5, 'rgba(200,184,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,.5)'); ctx.fillStyle = g; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = U * .015; ctx.fillRect(0, -h / 2, w, h); ctx.strokeRect(0, -h / 2, w, h);
        const gl = ((t * .8 + k * .4) % 1) * (w + h) - h * .3; ctx.save(); ctx.beginPath(); ctx.rect(0, -h / 2, w, h); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(gl - w * .1, -h / 2, w * .12, h); ctx.restore(); ctx.restore();
      }
      ctx.restore();
    }
    ctx.save(); ctx.translate(0, U * .82); ctx.scale(1, -.5); ctx.globalAlpha = .22 * base; ctx.fillStyle = '#c8b8ff'; ctx.beginPath(); ctx.moveTo(0, -U * .3); ctx.lineTo(U * .28, U * .3); ctx.lineTo(0, U * .12); ctx.lineTo(-U * .28, U * .3); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = .5 * base; ctx.lineWidth = U * .012; ctx.beginPath(); ctx.ellipse(0, U * .74, U * .34, U * .05, 0, 0, TAU); ctx.stroke(); drawGlow(0, -U * .62, U * .25, '#c8a0ff', .3 * base);
  }
  ctx.restore();
};
{
  const as2 = Art.ship;
  Art.ship = function (x, y, o) {
    const id = PALMAP.get(o.pal || SKIN_DEFAULT);
    if ((id === 'eclipse' || id === 'aurora' || id === 'prisma' || id === 'espelho') && !o.orbi && !o.guard && QL() >= 1) { try { Visual17.wings(id, x, y, o); } catch (e) { } }
    return as2.call(this, x, y, o);
  };
}
// rastro da skin no jogo
Visual17.trail = function (p) {
  if (QL() < 1 || Math.random() > .55) return; const sid = G.training && G.trainSkin != null ? SKINS[G.trainSkin].id : Save.data.loadout.skin, P = G.parts;
  if (sid === 'aurora') P.push({ x: p.x + rand(-14, 14), y: p.y + 24, vx: rand(-25, 25), vy: rand(60, 130), life: .7, max: .7, r: rand(2, 4), c: pick(['#7fe8a0', '#5af0e0', '#ff8ae0']), drag: 1 });
  else if (sid === 'prisma') P.push({ x: p.x + rand(-12, 12), y: p.y + 24, vx: rand(-30, 30), vy: rand(70, 140), life: .6, max: .6, r: rand(2, 4), c: pick(['#ff6a6a', '#ffd36a', '#7fff9a', '#6ac8ff', '#c88aff']), drag: 1 });
  else if (sid === 'eclipse') P.push({ x: p.x + rand(-14, 14), y: p.y + 20, vx: rand(-20, 20), vy: rand(50, 110), life: .8, max: .8, r: rand(2, 5), c: Math.random() < .5 ? '#ffb340' : '#ffe9a8', drag: 1.2 });
  else if (sid === 'espelho') P.push({ x: p.x + rand(-14, 14), y: p.y + 24, vx: rand(-20, 20), vy: rand(60, 120), life: .6, max: .6, r: rand(1.5, 3.5), c: Math.random() < .5 ? '#ffffff' : '#c8b8ff', drag: 1 });
};
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { up.call(this, dt); const p = G.player; if (p && !p.dead && G.state === 'play') Visual17.trail(p); };
}
