'use strict';
// ---------- retratos: so o rosto de cada personagem, com expressoes ----------
// moods: n (normal) happy sad angry shock determined worry fade free
const Portraits = {
  draw(who, x, y, size, o = {}) {
    const ch = CHARS[who]; if (!ch || !this['face_' + who]) return;
    const t = o.t ?? World.t, mood = o.mood || 'n', talk = !!o.talk;
    ctx.save(); ctx.translate(x, y); const k = size / 180; ctx.scale(k, k);
    ctx.beginPath(); ctx.roundRect(-90, -90, 180, 180, 22); ctx.save(); ctx.clip();
    ctx.fillStyle = rdl(0, -10, 10, 140, [[0, ch.bg0], [1, ch.bg1]]); ctx.fillRect(-100, -100, 200, 200);
    this['face_' + who](mood, t, talk);
    ctx.fillStyle = rdl(0, 0, 60, 135, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.6)']]); ctx.fillRect(-100, -100, 200, 200);
    ctx.restore();
    ctx.lineWidth = talk ? 7 : 5; ctx.strokeStyle = ch.c; ctx.beginPath(); ctx.roundRect(-90, -90, 180, 180, 22); ctx.stroke();
    ctx.restore();
  },

  blink(t, p = 4.2) { return (t % p) < .14 ? .12 : 1; },

  // ---- Olienzinho ----
  face_O(mood, t, talk) {
    ctx.translate(0, talk ? Math.sin(t * 18) * 1.6 : Math.sin(t * 2) * 1.2);
    ctx.fillStyle = lin(-74, 0, 74, 0, [[0, '#c6a6ff'], [.35, '#9a63ff'], [1, '#5326b8']]);
    ctx.beginPath(); ctx.moveTo(-72, 130); ctx.lineTo(-74, 30); ctx.bezierCurveTo(-74, -50, -34, -112, 0, -130); ctx.bezierCurveTo(34, -112, 74, -50, 74, 30); ctx.lineTo(72, 130); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e2d4ff'; ctx.fillRect(-80, 76, 160, 14);
    const eh = mood === 'fade' ? 1 : this.blink(t);
    if (mood === 'happy') {
      ctx.strokeStyle = '#1b0b3d'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 4, 30, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.fillStyle = 'rgba(255,120,170,.55)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 50, 16, 14, 8, 0, 0, 7); ctx.fill(); }
      return;
    }
    const pr = mood === 'shock' ? 13 : mood === 'determined' ? 21 : mood === 'sad' ? 27 : 26;
    ctx.fillStyle = mood === 'sad' && Math.sin(t * 8) > .9 ? '#d8e8ff' : '#f5eeff'; ctx.beginPath(); ctx.ellipse(0, -6, 42, 42 * eh, 0, 0, 7); ctx.fill();
    const lx = Math.sin(t * .7) * 6, ly = Math.cos(t * .5) * 3;
    ctx.fillStyle = '#1b0b3d'; ctx.beginPath(); ctx.ellipse(lx, -6 + ly, pr, pr * eh, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx + 9, -16 + ly, 7, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -6, 42, 42 * eh, 0, 0, 7); ctx.clip(); ctx.fillStyle = '#7a43e0';
    if (mood === 'determined' || mood === 'angry') { ctx.beginPath(); ctx.moveTo(-46, -52); ctx.lineTo(0, -52); ctx.lineTo(0, -18); ctx.lineTo(-46, -34); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(46, -52); ctx.lineTo(46, -34); ctx.lineTo(0, -18); ctx.closePath(); ctx.fill(); }
    if (mood === 'sad' || mood === 'worry') { ctx.beginPath(); ctx.moveTo(-46, -52); ctx.lineTo(0, -52); ctx.lineTo(0, -34); ctx.lineTo(-46, -16); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, -52); ctx.lineTo(46, -52); ctx.lineTo(46, -16); ctx.lineTo(0, -34); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    if (mood === 'sad') { ctx.fillStyle = 'rgba(150,210,255,.9)'; ctx.beginPath(); ctx.ellipse(-30, 44 + (t * 30) % 40, 5, 8, 0, 0, 7); ctx.fill(); }
  },

  // ---- Orbi ----
  face_B(mood, t, talk) {
    ctx.translate(0, Math.sin(t * 2) * 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 110, '#7fe0ff', .8); ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = rdl(-22, -28, 4, 78, [[0, '#ffffff'], [.45, '#7fe0ff'], [1, '#1b6aa8']]); ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.fill();
    const bl = this.blink(t, 4), big = mood === 'shock' ? 1.3 : 1;
    ctx.fillStyle = '#0e2a52';
    if (mood === 'happy') { ctx.strokeStyle = '#0e2a52'; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 24, -6, 12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } }
    else for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 24, -6, 11 * big, 16 * big * bl, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s * 24 - 4, -12, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#0e2a52'; }
    if (mood === 'worry' || mood === 'sad') { ctx.strokeStyle = '#0e2a52'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 40, -34); ctx.lineTo(s * 12, -26); ctx.stroke(); } }
    if (mood === 'angry' || mood === 'determined') { ctx.strokeStyle = '#0e2a52'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 40, -26); ctx.lineTo(s * 12, -34); ctx.stroke(); } }
    const mo = talk ? 4 + Math.abs(Math.sin(t * 16)) * 9 : 0;
    ctx.strokeStyle = '#0e2a52'; ctx.fillStyle = '#0e2a52'; ctx.lineWidth = 5;
    if (talk) { ctx.beginPath(); ctx.ellipse(0, 28, 11, mo, 0, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(0, mood === 'sad' || mood === 'worry' ? 38 : 24, 14, mood === 'sad' || mood === 'worry' ? Math.PI * 1.15 : .2, mood === 'sad' || mood === 'worry' ? Math.PI * 1.85 : Math.PI - .2); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.save(); ctx.rotate(-.4); ctx.beginPath(); ctx.ellipse(0, 0, 96, 24, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore();
  },

  // ---- Mestra Lumi (espirito de estrela) ----
  face_L(mood, t, talk) {
    const fl = mood === 'fade' ? .55 + Math.random() * .45 : 1;
    ctx.globalAlpha = fl;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 150, '#ffd36a', .9); ctx.restore(); ctx.globalAlpha = fl;
    ctx.save(); ctx.rotate(t * .25);
    ctx.fillStyle = rdl(0, 0, 6, 100, [[0, '#ffffff'], [.5, '#ffe9a8'], [1, '#e0a030']]);
    ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 56 : 104; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = rdl(0, 0, 2, 52, [[0, '#fffdf2'], [1, '#ffe08a']]); ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); ctx.fill();
    ctx.strokeStyle = '#7a4a10'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const s of [-1, 1]) { ctx.beginPath(); if (mood === 'sad' || mood === 'fade') ctx.arc(s * 18, -4, 9, 0, Math.PI); else ctx.arc(s * 18, -2, 9, Math.PI, 0); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,150,120,.5)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 30, 12, 8, 5, 0, 0, 7); ctx.fill(); }
    ctx.beginPath(); if (talk) { ctx.fillStyle = '#7a4a10'; ctx.ellipse(0, 20, 7, 3 + Math.abs(Math.sin(t * 14)) * 5, 0, 0, 7); ctx.fill(); } else { ctx.arc(0, 14, 9, .2, Math.PI - .2); ctx.stroke(); }
    ctx.globalAlpha = 1;
  },

  // ---- O Vazio ----
  face_V(mood, t, talk) {
    for (let k = 0; k < 4; k++) { ctx.save(); ctx.rotate(t * (.2 + k * .07) * (k % 2 ? -1 : 1) + k); ctx.strokeStyle = `rgba(150,90,255,${.18 + k * .05})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 120 - k * 14, 50 + k * 14, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.fillStyle = rdl(0, 0, 10, 100, [[0, '#000'], [.7, '#0a0220'], [1, 'rgba(10,2,32,0)']]); ctx.beginPath(); ctx.arc(0, 0, 100, 0, 7); ctx.fill();
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + t * .3, w = Math.sin(t * 2 + i) * 12; ctx.strokeStyle = 'rgba(120,60,220,.35)'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 60, Math.sin(a) * 60); ctx.quadraticCurveTo(Math.cos(a + .4) * 90 + w, Math.sin(a + .4) * 90, Math.cos(a) * 130, Math.sin(a) * 130 + w); ctx.stroke(); }
    const open = talk ? 1 + Math.abs(Math.sin(t * 12)) * .5 : 1, ang = mood === 'angry' ? .35 : .12;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 34, -4); ctx.rotate(s * -ang); drawGlow(0, 0, 40, '#b98cff', .9); ctx.fillStyle = '#f2e8ff'; ctx.beginPath(); ctx.ellipse(0, 0, 22 * open, 6 + (mood === 'shock' ? 6 : 0), 0, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // ---- guardioes: corrompidos por padrao; mood 'free' = libertos ----
  face_C(mood, t, talk) { // Colmeia
    const free = mood === 'free', ang = free ? -.1 : (mood === 'angry' ? .3 : .22);
    ctx.fillStyle = lin(0, 20, 0, 120, [[0, '#ff9a2e'], [1, '#7a2a06']]); ctx.beginPath(); ctx.ellipse(0, 78, 110, 40, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = rdl(-20, -40, 6, 100, [[0, 'rgba(255,255,255,.95)'], [.5, 'rgba(255,205,140,.7)'], [1, 'rgba(150,50,10,.9)']]); ctx.beginPath(); ctx.ellipse(0, 40, 92, 100, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f7ead2'; ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); ctx.fill();
    const ic = free ? '#ffd23a' : '#ff3a2a', px = Math.sin(t * .8) * 8; ctx.fillStyle = ic; ctx.beginPath(); ctx.arc(px, 2, 26, 0, 7); ctx.fill();
    ctx.fillStyle = '#1a0a30'; ctx.beginPath(); ctx.ellipse(px, 2, free ? 12 : 8, free ? 12 : 16, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(px - 8, -8, 5, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); ctx.clip(); ctx.fillStyle = '#ff9a2e';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 56, -60); ctx.lineTo(0, -60); ctx.lineTo(0, -34 + (free ? -12 : 10)); ctx.lineTo(s * 56, -34 + (free ? 8 : -ang * 30)); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    if (free) { ctx.fillStyle = 'rgba(150,210,255,.9)'; ctx.beginPath(); ctx.ellipse(30, 38 + (t * 24) % 34, 5, 8, 0, 0, 7); ctx.fill(); }
  },
  face_P(mood, t, talk) { // Petreo
    const free = mood === 'free';
    ctx.fillStyle = lin(0, -110, 0, 110, [[0, '#a08aa0'], [1, '#2c1630']]); poly(0, 6, 88, 10, .1, 3); ctx.fill(); ctx.strokeStyle = free ? '#c8a070' : '#ff9a3c'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#10040e'; ctx.beginPath(); ctx.moveTo(-70, -14); ctx.lineTo(0, -6); ctx.lineTo(70, -14); ctx.lineTo(54, 18); ctx.lineTo(0, 22); ctx.lineTo(-54, 18); ctx.closePath(); ctx.fill();
    const ec = free ? '#ffe9a8' : '#ff5a1a'; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) drawGlow(s * 30, 2, 34, ec, .9); ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = ec; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 30, 2, 16, free ? 8 : 5, s * .25, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#5a4058'; ctx.beginPath(); ctx.moveTo(-76, -30); ctx.lineTo(0, -44); ctx.lineTo(76, -30); ctx.lineTo(70, -18); ctx.lineTo(0, -30); ctx.lineTo(-70, -18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#10040e'; ctx.lineWidth = 6; ctx.beginPath(); if (talk) ctx.ellipse(0, 60, 22, 5 + Math.abs(Math.sin(t * 14)) * 9, 0, 0, 7); else { ctx.moveTo(-34, 60); ctx.lineTo(-17, 54); ctx.lineTo(0, 62); ctx.lineTo(17, 54); ctx.lineTo(34, 60); } ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = free ? 'rgba(255,220,150,.5)' : 'rgba(255,120,40,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-50, -60); ctx.lineTo(-30, -36); ctx.moveTo(60, 20); ctx.lineTo(44, 44); ctx.stroke(); ctx.restore();
  },
  face_E(mood, t, talk) { // Vigia
    const free = mood === 'free';
    ctx.strokeStyle = '#2a1050'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(0, 0, 82, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#ff7ac8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 94, 0, TAU); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 72, 0, TAU); ctx.clip();
    ctx.fillStyle = rdl(-16, -20, 6, 80, [[0, '#fff6fb'], [.7, '#ffc4e6'], [1, '#a8369a']]); ctx.fillRect(-80, -80, 160, 160);
    ctx.strokeStyle = free ? 'rgba(220,60,120,.25)' : 'rgba(255,40,70,.6)'; ctx.lineWidth = 1.6; for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + .4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 72, Math.sin(a) * 72); ctx.quadraticCurveTo(Math.cos(a + .4) * 50, Math.sin(a + .4) * 50, Math.cos(a + .15) * 30, Math.sin(a + .15) * 30); ctx.stroke(); }
    const dx = Math.sin(t * .6) * 10; ctx.fillStyle = rdl(dx, 0, 4, 42, [[0, '#33c4ff'], [.5, free ? '#ffb8dc' : '#ff3d6a'], [1, '#5a1060']]); ctx.beginPath(); ctx.arc(dx, 0, 42, 0, 7); ctx.fill();
    ctx.fillStyle = '#12041f'; ctx.beginPath(); ctx.ellipse(dx, 0, free ? 12 : 7, free ? 22 : 30, 0, 0, 7); ctx.fill();
    const lid = (free ? .32 : .0) + (talk ? Math.abs(Math.sin(t * 6)) * .05 : 0) + (this.blink(t, 3.6) < 1 ? .9 : 0), ly = -72 + lid * 72;
    ctx.fillStyle = '#2a0f55'; ctx.beginPath(); ctx.moveTo(-80, -80); ctx.lineTo(80, -80); ctx.lineTo(80, ly); ctx.quadraticCurveTo(0, ly + 22, -80, ly); ctx.closePath(); ctx.fill();
    ctx.restore();
  },
  face_S(mood, t, talk) { // Solaris
    const free = mood === 'free';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 150, free ? '#ffd36a' : '#ff6a1a', .9); ctx.restore(); ctx.globalAlpha = 1;
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .4, l = 100 + Math.sin(t * 4 + i) * 10; ctx.fillStyle = 'rgba(255,170,60,.7)'; ctx.beginPath(); ctx.moveTo(Math.cos(a - .12) * 60, Math.sin(a - .12) * 60); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.lineTo(Math.cos(a + .12) * 60, Math.sin(a + .12) * 60); ctx.fill(); }
    ctx.fillStyle = rdl(-16, -20, 6, 68, [[0, '#fff2c0'], [.5, '#ffc040'], [1, '#e0541a']]); ctx.beginPath(); ctx.arc(0, 0, 62, 0, 7); ctx.fill();
    ctx.fillStyle = lin(0, -70, 0, 20, [[0, '#d9a04a'], [1, '#6a3a0a']]); for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(k * 26 - 10, -46); ctx.lineTo(k * 30, -86 - (1 - Math.abs(k)) * 14); ctx.lineTo(k * 26 + 10, -46); ctx.fill(); }
    ctx.fillStyle = '#3a0f20'; ctx.beginPath(); ctx.moveTo(-46, -14); ctx.lineTo(0, -24); ctx.lineTo(46, -14); ctx.lineTo(36, 22); ctx.lineTo(0, 32); ctx.lineTo(-36, 22); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#d9a04a'; ctx.lineWidth = 4; ctx.stroke();
    const ec = free ? '#ffe9a8' : '#ff4a2a'; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) drawGlow(s * 18, 0, 22, ec, .9); ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = ec; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 18, 0, 10, free ? 7 : 5, s * (free ? -.1 : .2), 0, 7); ctx.fill(); }
    if (free) { ctx.fillStyle = 'rgba(255,240,180,.9)'; ctx.beginPath(); ctx.ellipse(-26, 20 + (t * 26) % 30, 4, 7, 0, 0, 7); ctx.fill(); }
  },
};
