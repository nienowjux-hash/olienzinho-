'use strict';
// ---------- arte procedural: nave, inimigos, tiros, itens ----------
const Art = {
  // Olienzinho. o = { vx, t, lookx, looky, blinkT, inv, shield, boost, scale }
  ship(x, y, o) {
    if (o.orbi) return this.orbi(x, y, o);
    const U = 112 * (o.scale || 1), P = o.pal || SKIN_DEFAULT;
    ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * 0.24); ctx.scale(o.sx || 1, o.sy || 1);
    if (o.inv > 0 && Math.floor(o.inv * 14) % 2 === 0) ctx.globalAlpha = .4;
    const X = v => v * U, Y = v => -(v - .75) * U;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, U * .98, P.glow, .3); ctx.restore();
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
      ctx.fillStyle = P.fin; ctx.beginPath(); ctx.moveTo(X(s * .15), Y(.78)); ctx.lineTo(X(s * .44), Y(.25)); ctx.lineTo(X(s * .15), Y(.30)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.moveTo(X(s * .15), Y(.78)); ctx.lineTo(X(s * .3), Y(.52)); ctx.lineTo(X(s * .15), Y(.5)); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = P.nozzle; ctx.beginPath(); ctx.roundRect(X(-.085), Y(.27), X(.17), U * .1, 4); ctx.fill();
    const body = () => {
      ctx.beginPath(); ctx.moveTo(X(-.17), Y(.25)); ctx.lineTo(X(-.2), Y(.8));
      ctx.bezierCurveTo(X(-.2), Y(1.15), X(-.08), Y(1.38), 0, Y(1.45));
      ctx.bezierCurveTo(X(.08), Y(1.38), X(.2), Y(1.15), X(.2), Y(.8)); ctx.lineTo(X(.17), Y(.25)); ctx.closePath();
    };
    const bg = ctx.createLinearGradient(X(-.2), 0, X(.2), 0);
    bg.addColorStop(0, P.g0); bg.addColorStop(.35, P.g1); bg.addColorStop(1, P.g2);
    body(); ctx.fillStyle = bg; ctx.fill();
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = P.stripe; ctx.fillRect(X(-.3), Y(.56), X(.6), U * .06); ctx.restore();
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
      const es = mood === 'shock' ? 1.22 : 1;
      ctx.fillStyle = mood === 'hurt' ? '#ffd0d8' : '#f5eeff'; ctx.beginPath(); ctx.ellipse(0, ey, U * .125 * es, U * .125 * eh * es, 0, 0, 7); ctx.fill();
      const pr = mood === 'hurt' ? U * .06 : mood === 'shock' ? U * .05 : U * .088;
      ctx.fillStyle = '#1b0b3d'; ctx.beginPath(); ctx.ellipse(lx * U * .03, ey + ly * U * .03, pr, pr * eh, 0, 0, 7); ctx.fill();
      if (eh > .5) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx * U * .03 + U * .03, ey + ly * U * .03 - U * .03, U * .025, 0, 7); ctx.fill(); }
      if (mood === 'determined' || mood === 'worry') { // palpebra: cenho firme ou olhar preocupado
        const sd = mood === 'worry' ? -1 : 1; ctx.fillStyle = P.g1; ctx.beginPath(); ctx.moveTo(-U * .14, ey - U * .14); ctx.lineTo(U * .14, ey - U * .14); ctx.lineTo(U * .14, ey - U * (sd > 0 ? .02 : .09)); ctx.lineTo(-U * .14, ey - U * (sd > 0 ? .09 : .02)); ctx.closePath(); ctx.fill();
      }
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
      case 'drone': {
        ctx.rotate(Math.sin(t * 3 + e.ph) * .15);
        for (const sd of [-1, 1]) { ctx.save(); ctx.rotate(sd * (.5 + Math.sin(t * 26 + e.ph) * .3)); ctx.fillStyle = 'rgba(255,236,190,.55)'; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(sd * r * .95, -r * .35, r * .62, r * .26, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore(); }
        ctx.fillStyle = lin(-r, 0, r, 0, [[0, hit ? '#fff' : '#ffd37a'], [.55, hit ? '#fff' : '#ff9a2a'], [1, hit ? '#eee' : '#b8520a']]); ctx.beginPath(); ctx.ellipse(0, 0, r * .92, r, 0, 0, 7); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, r * .92, r, 0, 0, 7); ctx.clip(); ctx.fillStyle = 'rgba(60,20,4,.55)'; ctx.fillRect(-r, r * .25, r * 2, r * .16); ctx.fillRect(-r, r * .58, r * 2, r * .14); ctx.restore();
        ctx.fillStyle = '#3a1a08'; ctx.beginPath(); ctx.moveTo(-r * .14, r * .95); ctx.lineTo(0, r * 1.4); ctx.lineTo(r * .14, r * .95); ctx.fill();
        ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * r * .25, -r * .85); ctx.quadraticCurveTo(sd * r * .5, -r * 1.35, sd * r * .8, -r * 1.25 + Math.sin(t * 8 + sd) * 2); ctx.stroke(); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(sd * r * .8, -r * 1.25 + Math.sin(t * 8 + sd) * 2, 3, 0, 7); ctx.fill(); }
        this.visor(r * .8, undefined, e.look || 0);
        break;
      }
      case 'zig': {
        ctx.rotate(Math.sin(t * 5) * .35);
        for (const sd of [-1, 1]) { ctx.fillStyle = hit ? '#fff' : '#5a9cff'; ctx.beginPath(); ctx.moveTo(sd * r * .35, -r * .2); ctx.lineTo(sd * r * 1.25, -r * .9); ctx.lineTo(sd * r * .9, r * .5); ctx.closePath(); ctx.fill(); }
        const g = ctx.createLinearGradient(0, -r, 0, r); g.addColorStop(0, hit ? '#fff' : '#d6f6ff'); g.addColorStop(1, hit ? '#cde' : '#2b7bff');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -r * 1.35); ctx.lineTo(r * .62, 0); ctx.lineTo(0, r * 1.2); ctx.lineTo(-r * .62, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(10,30,90,.45)'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -r * 1.35); ctx.lineTo(0, r * 1.2); ctx.moveTo(-r * .62, 0); ctx.lineTo(r * .62, 0); ctx.stroke();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * .9, '#9fe8ff', .6); ctx.restore();
        ctx.fillStyle = '#10265a'; ctx.beginPath(); ctx.ellipse(0, -r * .15, r * .34, r * .15, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#9fe8ff'; ctx.beginPath(); ctx.arc((e.look || 0) * .1, -r * .15, 3, 0, 7); ctx.fill();
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
        ctx.strokeStyle = '#2a0f5e'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * r * .52, -r * .38); ctx.lineTo(s * r * .08, -r * .1); ctx.stroke(); }
        break;
      }
      case 'dummy': {
        ctx.strokeStyle = '#ffcf6b'; ctx.lineWidth = 4;
        for (const k of [1, .66, .33]) { ctx.fillStyle = k === .66 ? '#ff5a3c' : '#fff3d0'; ctx.beginPath(); ctx.arc(0, 0, r * k, 0, 7); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.arc(0, 0, r * .12, 0, 7); ctx.fill();
        break;
      }
      case 'shield': {
        this.ball(r * .85, '#bff0ff', '#2b7bff', hit); this.visor(r * .85, '#10265a', e.look || 0);
        if (e.shield > 0) {
          const k = e.shield / (e.maxShield || 1);
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 6; ctx.globalAlpha = .35 + k * .55 + Math.sin(t * 8) * .08;
          ctx.beginPath(); ctx.arc(0, 0, r * 1.45, .15, Math.PI - .15); ctx.stroke(); ctx.lineWidth = 2; ctx.globalAlpha *= .6; ctx.beginPath(); ctx.arc(0, 0, r * 1.62, .25, Math.PI - .25); ctx.stroke(); ctx.restore();
        }
        break;
      }
      case 'healer': {
        this.ball(r, '#d8ffe4', '#2fb865', hit); this.visor(r, '#0f4a2a', e.look || 0);
        ctx.fillStyle = '#fff'; ctx.globalAlpha = .9; const cr = r * .28 + Math.sin(t * 4) * 1.5; ctx.fillRect(-cr * .35, -r - cr - 4, cr * .7, cr * 2); ctx.fillRect(-cr, -r - 4 - cr * .35 + cr * .0, cr * 2, cr * .7); ctx.globalAlpha = 1;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#7fffa0'; ctx.globalAlpha = .4 + Math.sin(t * 3) * .2; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 1.5 + Math.sin(t * 3) * 3, 0, 7); ctx.stroke(); ctx.restore();
        break;
      }
      case 'captain': {
        const c = e.glow || '#ff5a3c';
        ctx.rotate(Math.sin(t * 1.2) * .04);
        for (const s of [-1, 1]) { ctx.fillStyle = '#2a1040'; ctx.beginPath(); ctx.roundRect(s * r * .9 - 9, -r * .2, 18, r * 1.1, 6); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(s * r * .9, r * .95, 8, 0, 7); ctx.fill(); }
        this.ball(r, '#ffd0c0', c, hit);
        ctx.strokeStyle = 'rgba(60,10,20,.55)'; ctx.lineWidth = 5; for (const a of [-.9, 0, .9]) { ctx.beginPath(); ctx.arc(0, 0, r * .96, -Math.PI / 2 + a - .22, -Math.PI / 2 + a + .22); ctx.stroke(); }
        this.visor(r, '#2a0f1e', e.look || 0);
        ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.moveTo(-r * .5, -r * .55); ctx.lineTo(0, -r * 1.25); ctx.lineTo(r * .5, -r * .55); ctx.closePath(); ctx.fill();
        break;
      }
      case 'shooter': {
        this.ball(r, '#ff9ad0', '#c2185b', hit);
        ctx.strokeStyle = 'rgba(70,10,50,.6)'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, r * .94, i * Math.PI / 2 + .25, i * Math.PI / 2 + 1.3); ctx.stroke(); }
        this.visor(r, '#ffd6e8', e.look || 0);
        ctx.save(); ctx.rotate(e.aim || Math.PI / 2); ctx.fillStyle = '#4a1060'; ctx.strokeStyle = '#ff9ad0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(r * .5, -r * .2, r * .95, r * .4, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2a0a3a'; ctx.fillRect(r * 1.3, -r * .26, r * .16, r * .52); ctx.restore();
        break;
      }
      case 'tank': {
        ctx.rotate(Math.sin(t * .8) * .06);
        for (const sd of [-1, 1]) { ctx.fillStyle = '#1a0c45'; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(sd * r * 1.0 - 9, -r * .3, 18, r * .95, 5); ctx.fill(); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(sd * r, r * .7, 16, '#ff8a1f', .5 + .3 * Math.sin(t * 6 + sd)); ctx.globalCompositeOperation = 'source-over'; }
        const g = ctx.createLinearGradient(0, -r, 0, r);
        g.addColorStop(0, hit ? '#fff' : '#8a63d8'); g.addColorStop(1, hit ? '#ddd' : '#2a1478');
        ctx.fillStyle = g; ctx.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + Math.PI / 6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#ffe9a8'; for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + Math.PI / 6; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .8, Math.sin(a) * r * .8, 2.4, 0, 7); ctx.fill(); }
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
    if (b.kind === 'cannon' || b.kind === 'bomb') {
      const r = b.r || 20; drawGlow(b.x, b.y, r * 2.4, b.c || '#ff7a4a', .9); drawGlow(b.x, b.y, r * 1.2, '#fff2c0', .8);
      ctx.restore(); ctx.globalAlpha = 1; ctx.fillStyle = '#fff2c0'; ctx.beginPath(); ctx.arc(b.x, b.y, r * .62, 0, 7); ctx.fill();
      ctx.strokeStyle = b.c || '#ff7a4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, r * .8, 0, 7); ctx.stroke();
      return;
    }
    if (b.orb) {
      drawGlow(b.x, b.y, 34, '#7fe0ff', .9); drawGlow(b.x, b.y, 16, '#ffffff', .8);
      ctx.restore(); ctx.globalAlpha = 1; ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#4cc8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, 11, 0, 7); ctx.stroke();
      return;
    }
    if (b.kind === 'missile' && b.star) {
      drawGlow(b.x, b.y, 24, '#ffe9a8', .9);
      ctx.restore(); ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(World.t * 8);
      ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 3.5 : 9; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
      return;
    }
    if (b.kind === 'missile') {
      const ang = Math.atan2(b.vy, b.vx) + Math.PI / 2;
      drawGlow(b.x, b.y, 30, '#ffb340', .8);
      ctx.restore(); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang); ctx.globalAlpha = 1;
      // chama
      ctx.globalCompositeOperation = 'lighter';
      const fl = 14 + Math.random() * 8, fg = ctx.createLinearGradient(0, 6, 0, 6 + fl);
      fg.addColorStop(0, '#fff1c1'); fg.addColorStop(.5, '#ffb340'); fg.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(0, 6 + fl); ctx.lineTo(4, 6); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      // aletas, corpo e ponta
      ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-9, 10); ctx.lineTo(-3, 8); ctx.fill(); ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(9, 10); ctx.lineTo(3, 8); ctx.fill();
      ctx.fillStyle = '#f3ecff'; ctx.beginPath(); ctx.roundRect(-4, -9, 8, 18, 3); ctx.fill();
      ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); ctx.moveTo(-4, -9); ctx.lineTo(0, -17); ctx.lineTo(4, -9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7fe0ff'; ctx.beginPath(); ctx.arc(0, -2, 2, 0, 7); ctx.fill();
      ctx.restore();
      return;
    }
    const a = Math.atan2(b.vy, b.vx) + Math.PI / 2;
    drawGlow(b.x, b.y, 26, c, .9); drawGlow(b.x - b.vx * .018, b.y - b.vy * .018, 16, c, .6);
    ctx.restore(); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
    const sp = Math.hypot(b.vx, b.vy), L = clamp(sp * .07 * (b.w === 'fan' ? .5 : 1), 14, 70), tg = ctx.createLinearGradient(0, 8, 0, 8 + L);
    tg.addColorStop(0, c); tg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = tg; ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.moveTo(-5, 8); ctx.lineTo(5, 8); ctx.lineTo(0, 8 + L); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.beginPath(); if (b.w === 'fan') ctx.roundRect(-4, -9, 8, 18, 4); else ctx.roundRect(-3, -18, 6, 36, 3); ctx.fill();
    if (b.crit) { ctx.fillStyle = '#ffe9a8'; ctx.rotate(World.t * 9); ctx.fillRect(-9, -2, 18, 4); ctx.fillRect(-2, -9, 4, 18); }
    ctx.restore();
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
