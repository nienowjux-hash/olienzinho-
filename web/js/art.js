'use strict';
// ---------- arte procedural: nave, inimigos, tiros, itens ----------
const Art = {
  // Olienzinho. o = { vx, t, lookx, looky, blinkT, inv, shield, boost, scale }
  ship(x, y, o) {
    const U = 112 * (o.scale || 1);
    ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * 0.24); ctx.scale(o.sx || 1, o.sy || 1);
    if (o.inv > 0 && Math.floor(o.inv * 14) % 2 === 0) ctx.globalAlpha = .4;
    const X = v => v * U, Y = v => -(v - .75) * U;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, U * .98, '#8b4dff', .3); ctx.restore();
    // chama
    const fl = (0.55 + Math.sin(o.t * 60) * .06 + Math.random() * .12) * (1 + (o.boost || 0));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const fg = ctx.createLinearGradient(0, Y(.2), 0, Y(.2 - fl));
    fg.addColorStop(0, '#fff1c1'); fg.addColorStop(.35, '#ffb340'); fg.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(X(-.1), Y(.22));
    ctx.quadraticCurveTo(X(-.13), Y(.2 - fl * .55), 0, Y(.2 - fl));
    ctx.quadraticCurveTo(X(.13), Y(.2 - fl * .55), X(.1), Y(.22)); ctx.closePath(); ctx.fill(); ctx.restore();
    // aletas
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#5b2fc0'; ctx.beginPath(); ctx.moveTo(X(s * .15), Y(.78)); ctx.lineTo(X(s * .44), Y(.25)); ctx.lineTo(X(s * .15), Y(.30)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(X(s * .15), Y(.78)); ctx.lineTo(X(s * .3), Y(.52)); ctx.lineTo(X(s * .15), Y(.5)); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#3f2290'; ctx.beginPath(); ctx.roundRect(X(-.085), Y(.27), X(.17), U * .1, 4); ctx.fill();
    const body = () => {
      ctx.beginPath(); ctx.moveTo(X(-.17), Y(.25)); ctx.lineTo(X(-.2), Y(.8));
      ctx.bezierCurveTo(X(-.2), Y(1.15), X(-.08), Y(1.38), 0, Y(1.45));
      ctx.bezierCurveTo(X(.08), Y(1.38), X(.2), Y(1.15), X(.2), Y(.8)); ctx.lineTo(X(.17), Y(.25)); ctx.closePath();
    };
    const bg = ctx.createLinearGradient(X(-.2), 0, X(.2), 0);
    bg.addColorStop(0, '#c6a6ff'); bg.addColorStop(.35, '#9a63ff'); bg.addColorStop(1, '#5326b8');
    body(); ctx.fillStyle = bg; ctx.fill();
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = 'rgba(226,212,255,.95)'; ctx.fillRect(X(-.3), Y(.56), X(.6), U * .06); ctx.restore();
    // olho (com humor: normal, machucado, feliz)
    const ey = Y(.98), mood = o.mood;
    let eh = o.blinkT > 0 ? Math.max(.08, Math.abs(o.blinkT - .08) / .08) : 1;
    if (mood === 'hurt') eh = .5;
    const lx = o.lookx || 0, ly = o.looky || 0;
    if (mood === 'happy') {
      ctx.strokeStyle = '#1b0b3d'; ctx.lineWidth = U * .055; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, ey + U * .05, U * .1, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.fillStyle = 'rgba(255,120,170,.5)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * U * .16, ey + U * .08, U * .05, U * .03, 0, 0, 7); ctx.fill(); }
    } else {
      ctx.fillStyle = mood === 'hurt' ? '#ffd0d8' : '#f5eeff'; ctx.beginPath(); ctx.ellipse(0, ey, U * .125, U * .125 * eh, 0, 0, 7); ctx.fill();
      const pr = mood === 'hurt' ? U * .06 : U * .088;
      ctx.fillStyle = '#1b0b3d'; ctx.beginPath(); ctx.ellipse(lx * U * .03, ey + ly * U * .03, pr, pr * eh, 0, 0, 7); ctx.fill();
      if (eh > .5) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx * U * .03 + U * .03, ey + ly * U * .03 - U * .03, U * .025, 0, 7); ctx.fill(); }
    }
    // escudo
    if (o.shield) {
      ctx.globalAlpha = .55 + .2 * Math.sin(o.t * 6);
      ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, U * .78, 0, 7); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, U * .9, '#7fe0ff', .25);
    }
    ctx.restore();
  },

  // helpers
  ball(r, c0, c1, hit) {
    const g = ctx.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, hit ? '#ffffff' : c0); g.addColorStop(1, hit ? '#ffd0d0' : c1);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(40,10,60,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r - 1.5, 0, 7); ctx.stroke();
  },
  visor(r, eyeC, look = 0) {
    ctx.fillStyle = '#2a0f5e'; ctx.beginPath(); ctx.roundRect(-r * .68, -r * .18, r * 1.36, r * .42, 7); ctx.fill();
    ctx.fillStyle = eyeC || '#ffe9a8';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * .3 + look, r * .03, Math.max(2.6, r * .13), 0, 7); ctx.fill(); }
  },

  enemy(e) {
    ctx.save(); ctx.translate(e.x, e.y);
    const r = e.rad, t = e.age, hit = e.hit > 0;
    // entrada com pop, respiracao e esmagadinha ao levar tiro
    const pop = easeBack(e.age / .35), sq = 1 + (hit ? e.hit * 1.6 : 0);
    ctx.translate(0, Math.sin(e.age * 3 + e.ph) * 2.5); ctx.scale(pop * sq, pop / sq);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, r * 1.9, e.glow || '#ff8a1f', .3); ctx.restore(); ctx.globalAlpha = 1;
    switch (e.type) {
      case 'drone':
        ctx.rotate(Math.sin(t * 3 + e.ph) * .15);
        this.ball(r, '#ffd37a', '#ff7a1a', hit); this.visor(r, undefined, e.look || 0);
        ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r - 10); ctx.stroke();
        ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(0, -r - 11, 4, 0, 7); ctx.fill();
        break;
      case 'zig': {
        ctx.rotate(Math.sin(t * 5) * .35);
        const g = ctx.createLinearGradient(0, -r, 0, r);
        g.addColorStop(0, hit ? '#fff' : '#bff0ff'); g.addColorStop(1, hit ? '#cde' : '#2b7bff');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -r * 1.2); ctx.lineTo(r, 0); ctx.lineTo(0, r * 1.2); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(10,30,90,.4)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#10265a'; ctx.beginPath(); ctx.ellipse(0, 0, r * .5, r * .22, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#9fe8ff'; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, 7); ctx.fill();
        break;
      }
      case 'kami': {
        ctx.rotate(t * 2);
        ctx.fillStyle = hit ? '#fff' : '#ff4a6e';
        for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * TAU / 8); ctx.beginPath(); ctx.moveTo(-r * .3, -r * .8); ctx.lineTo(0, -r * 1.35); ctx.lineTo(r * .3, -r * .8); ctx.fill(); ctx.restore(); }
        ctx.rotate(-t * 2);
        this.ball(r * .9, '#ff9aa8', '#d81b4a', hit);
        ctx.fillStyle = '#2a0f5e'; ctx.beginPath(); ctx.moveTo(-r * .55, -r * .2); ctx.lineTo(0, r * .05); ctx.lineTo(r * .55, -r * .2); ctx.lineTo(r * .4, r * .25); ctx.lineTo(-r * .4, r * .25); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffe9a8'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * .25, r * .05, 3, 0, 7); ctx.fill(); }
        break;
      }
      case 'shooter': {
        this.ball(r, '#ff9ad0', '#c2185b', hit); this.visor(r, '#ffd6e8', e.look || 0);
        ctx.save(); ctx.rotate(e.aim || Math.PI / 2); ctx.fillStyle = '#4a1060';
        ctx.beginPath(); ctx.roundRect(r * .6, -5, r * .7, 10, 4); ctx.fill(); ctx.restore();
        break;
      }
      case 'tank': {
        ctx.rotate(Math.sin(t * .8) * .06);
        const g = ctx.createLinearGradient(0, -r, 0, r);
        g.addColorStop(0, hit ? '#fff' : '#8a63d8'); g.addColorStop(1, hit ? '#ddd' : '#2a1478');
        ctx.fillStyle = g; ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + Math.PI / 6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#1a0c45'; ctx.beginPath(); ctx.arc(0, 0, r * .5, 0, 7); ctx.fill();
        ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * .8, '#ff8a1f', .6 + .3 * Math.sin(t * 5)); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(0, 0, r * .16, 0, 7); ctx.fill();
        break;
      }
      case 'mine': {
        ctx.rotate(t);
        ctx.fillStyle = '#3a2478';
        for (let i = 0; i < 10; i++) { ctx.save(); ctx.rotate(i * TAU / 10); ctx.beginPath(); ctx.moveTo(-5, -r * .8); ctx.lineTo(0, -r * 1.25); ctx.lineTo(5, -r * .8); ctx.fill(); ctx.restore(); }
        this.ball(r * .85, '#6a4aa8', '#1a0c45', hit);
        const on = Math.floor(t * (e.fuse ? 10 : 3)) % 2 === 0;
        ctx.fillStyle = on ? '#ff4a4a' : '#5a1a2a'; ctx.beginPath(); ctx.arc(0, 0, r * .25, 0, 7); ctx.fill();
        if (on) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r, '#ff4a4a', .7); }
        break;
      }
      case 'rock': {
        ctx.rotate(e.rot);
        const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, hit ? '#fff' : '#7a58c0'); g.addColorStop(1, '#1a0c45');
        ctx.beginPath(); e.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
        ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff9a3c'; ctx.stroke();
        break;
      }
      case 'bit': {
        ctx.rotate(t * 4);
        ctx.fillStyle = hit ? '#fff' : '#7fe0ff'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .7, 0); ctx.lineTo(0, r); ctx.lineTo(-r * .7, 0); ctx.closePath(); ctx.fill();
        break;
      }
    }
    ctx.restore();
  },

  pbullet(b) {
    const c = b.c || '#b98cff';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (b.kind === 'missile') {
      drawGlow(b.x, b.y, 22, '#ffb340', .9); drawGlow(b.x - b.vx * .02, b.y - b.vy * .02, 16, '#ff6a1a', .6);
      ctx.restore(); ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, 7); ctx.fill();
      return;
    }
    const a = Math.atan2(b.vy, b.vx) + Math.PI / 2;
    drawGlow(b.x, b.y, 26, c, .9); drawGlow(b.x - b.vx * .018, b.y - b.vy * .018, 16, c, .6);
    ctx.restore(); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-3, -18, 6, 36, 3); ctx.fill(); ctx.restore();
  },

  ebullet(b) {
    const R = b.r * 1.55, pul = 1 + Math.sin(World.t * 18 + b.x * .05) * .08;
    ctx.save(); ctx.globalAlpha = 1; ctx.translate(b.x, b.y);
    // contorno escuro: separa do fundo e dos tiros do jogador
    ctx.fillStyle = 'rgba(14,4,36,.85)'; ctx.beginPath(); ctx.arc(0, 0, R * pul + 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(0, 0, R * pul, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(0, 0, R * .62, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-R * .12, -R * .12, R * .3, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.4, b.c, .45);
    ctx.restore();
  },

  pickup(p) {
    ctx.save(); ctx.translate(p.x, p.y + Math.sin(p.age * 5) * 2); { const sc = easeBack(p.age / .3); ctx.scale(sc, sc); }
    ctx.globalCompositeOperation = 'lighter';
    if (p.type === 'xp') {
      drawGlow(0, 0, 16, '#7fe0ff', .8); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.rotate(p.age * 2); ctx.fillStyle = '#e8fbff';
      ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 3 : 8, a = i * TAU / 8; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    } else if (p.type === 'coin') {
      drawGlow(0, 0, 20, '#ffb340', .7); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const sx = Math.abs(Math.cos(p.age * 4)) * .7 + .3;
      ctx.scale(sx, 1);
      const g = ctx.createLinearGradient(0, -10, 0, 10); g.addColorStop(0, '#fff0c9'); g.addColorStop(1, '#ff9a1f');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fill();
      ctx.strokeStyle = '#a2400a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#a2400a'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.5 : 6, a = i * TAU / 10 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    } else if (p.type === 'heart') {
      drawGlow(0, 0, 26, '#ff5f8f', .8); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const s = 1 + Math.sin(p.age * 6) * .08; ctx.scale(s, s); ctx.fillStyle = '#ff5f8f';
      ctx.beginPath(); ctx.moveTo(0, 9); ctx.bezierCurveTo(-18, -4, -9, -16, 0, -6); ctx.bezierCurveTo(9, -16, 18, -4, 0, 9); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-5, -7, 2.5, 0, 7); ctx.fill();
    }
    ctx.restore();
  },
};
