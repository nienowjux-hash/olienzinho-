'use strict';
// ---------- cutscenes em video: roteiros desenhados com a propria arte do jogo (usados para gerar os arquivos em /video) ----------
const Cine = { fps: 30, clips: {}, cur: null, t: 0 };
const eio = x => { x = clamp(x, 0, 1); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
Cine.cap = function (text, t, a, b) {
  const k = clamp((t - a) / .7, 0, 1) * clamp((b - t) / .7, 0, 1); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k * .55; const g = ctx.createLinearGradient(0, H - 300, 0, H - 64); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.85)'); ctx.fillStyle = g; ctx.fillRect(0, H - 300, W, 236); ctx.globalAlpha = k; ctx.shadowColor = '#000'; ctx.shadowBlur = 22; txt(text, W / 2, H - 150 + (1 - k) * 12, Math.min(46, 1240 / (text.length * .46)), '#ffffff', 'center', 1200); ctx.restore();
};
Cine.star = function (x, y, r, rot, col, al) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 3, col, .5); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = i % 2 ? r * .28 : r; ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q); } ctx.closePath(); ctx.fill(); ctx.restore(); };
Cine.fade = function (a, col) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); ctx.fillStyle = col || '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); };
const GUARD_POS = (cx, cy, rx, ry, t, i) => { const a = t * .5 + i * TAU / 4; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; };
const guard = (g, x, y, t, sc, al) => { ctx.save(); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 110 * sc, GUARDS[g].c, .35); ctx.globalCompositeOperation = 'source-over'; Art.guardian(x, y, { guard: 'g_' + g, vx: 0, t, scale: sc, lookx: 0, looky: 0, blinkT: 0 }); ctx.restore(); };
const hsq = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// 1. prologo: o ceu antes do Vazio, o Coracao de Luz, os guardioes e o sussurro do Vazio
Cine.clips.v_prologue = {
  dur: 16, pal: () => STAGES[0].pal, f(t) {
    const cx = W / 2, cy = H * .4; ctx.save(); const z = 1 + t * .006; ctx.translate(cx, H / 2); ctx.scale(z, z); ctx.translate(-cx, -H / 2);
    if (t < 5.2) { ctx.globalAlpha = 1 - clamp((t - 4) / 1.2, 0, 1); Screens.sceneVoid(t); ctx.globalAlpha = 1; }
    if (t > 4 && t < 14) {
      const a = clamp((t - 4) / 1.2, 0, 1) * (1 - clamp((t - 12.5) / 1.5, 0, 1)); ctx.globalAlpha = a; Screens.sceneHeart(t);
      ctx.globalAlpha = a; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) { const r = ((t * .45 + k / 4) % 1) * 560; ctx.strokeStyle = '#ffe9a8'; ctx.globalAlpha = a * (1 - r / 560) * .6; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, H * .38, r, 0, TAU); ctx.stroke(); } ctx.restore();
      for (let i = 0; i < 46; i++) { const tt = t - 5.4 - i * .09; if (tt > 0) { const ang = hsq(i) * TAU, d = easeOut(Math.min(1, tt / 2)) * (180 + hsq(i + 9) * 460); Cine.star(cx + Math.cos(ang) * d, H * .38 + Math.sin(ang) * d * .7, 6 + hsq(i + 3) * 8, tt, i % 2 ? '#ffe9a8' : '#cdb8ff', a * clamp(tt * 2, 0, 1) * (.6 + .4 * Math.sin(t * 4 + i))); } }
      ctx.globalAlpha = 1;
    }
    if (t > 8.4) {
      const dim = clamp((t - 12.6) / 2.4, 0, 1);
      ['C', 'P', 'E', 'S'].forEach((g, i) => { const [x, y] = GUARD_POS(cx, H * .42, 330, 150, t, i), al = clamp((t - 8.6 - i * .55) / .7, 0, 1) * (1 - dim * (.55 + i * .15)); if (al > .02) { guard(g, x, y, t, 1.25, al); ctx.globalAlpha = al; txt(GUARDS[g].name, x, y + 78, 18, GUARDS[g].c, 'center', 400); ctx.globalAlpha = 1; } });
    }
    if (t > 12.4) { // o Vazio vai fechando o ceu
      const k = clamp((t - 12.4) / 3.2, 0, 1);
      ctx.save(); const g = ctx.createRadialGradient(cx, H / 2, 600 * (1 - k) + 40, cx, H / 2, 900); g.addColorStop(0, 'rgba(4,0,16,0)'); g.addColorStop(1, 'rgba(4,0,16,.97)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(12,2,36,.95)'; ctx.lineCap = 'round'; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + hsq(i) * .3, r0 = 760, r1 = 760 - k * (420 + hsq(i + 5) * 200); ctx.lineWidth = 16 + hsq(i + 2) * 22; ctx.beginPath(); for (let s = 0; s <= 10; s++) { const rr = lerp(r0, r1, s / 10), aa = a + Math.sin(s * .8 + i + t) * .08; const px = cx + Math.cos(aa) * rr * 1.25, py = H / 2 + Math.sin(aa) * rr * .8; s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
      ctx.restore();
    }
    if (t > 14.6) { const e = clamp((t - 14.6) / .7, 0, 1) * (1 - clamp((t - 15.6) / .4, 0, 1)); ctx.save(); ctx.globalAlpha = e; ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) { ctx.fillStyle = '#e2d4ff'; ctx.beginPath(); ctx.ellipse(cx + s * 80, H * .45, 54, 9, s * -.12, 0, TAU); ctx.fill(); drawGlow(cx + s * 80, H * .45, 70, '#b98cff', .7); } ctx.restore(); }
    ctx.restore();
    Cine.cap('Antes do primeiro céu, havia só o Vazio.', t, .4, 4);
    Cine.cap('Então nasceu o Coração de Luz. E de cada batida, uma estrela.', t, 4.6, 8.4);
    Cine.cap('Quatro guardiões protegiam a luz: Colmeia, Pétreo, Vigia e Solaris.', t, 9, 12.3);
    Cine.cap('Mas o Vazio aprendeu a sussurrar.', t, 12.8, 15.2);
    Cine.fade(clamp((t - 15.6) / .4, 0, 1)); Cine.fade(1 - clamp(t / .7, 0, 1));
  },
};

// 2. fim da Parte 2: a luz volta a bater
Cine.clips.v_finale1 = {
  dur: 14, pal: () => STAGES[5].pal, f(t) {
    const cx = W / 2, cy = H * .46;
    if (t < 3.4) { ctx.globalAlpha = 1 - clamp((t - 2.4) / 1, 0, 1); Screens.sceneVoid(t); ctx.globalAlpha = 1; }
    const e = easeOut(clamp((t - 2.6) / 4.4, 0, 1)); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(cx, cy, 24 + e * 1100, '#ffe9a8', clamp(.2 + e * .3, 0, .5)); drawGlow(cx, cy, 14 + e * 320, '#ffffff', clamp(e * .8, 0, .55)); ctx.restore();
    for (let k = 0; k < 3; k++) { const r = (t - 2.6 - k * .7) * 340; if (r > 0 && r < 1500) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#fff6d0'; ctx.globalAlpha = clamp(1 - r / 1500, 0, 1) * .6; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.restore(); } }
    for (let i = 0; i < 80; i++) { const px = hsq(i) * W, py = 70 + hsq(i + 40) * (H - 140), d = Math.hypot(px - cx, py - cy), tt = t - 3.2 - d / 360; if (tt > 0) Cine.star(px, py, 4 + hsq(i + 9) * 8, tt * .8, i % 3 ? '#ffffff' : '#ffd36a', clamp(tt * 2, 0, 1) * (.55 + .45 * Math.sin(t * 3 + i))); }
    const corners = [[270, 250, 'C'], [1010, 250, 'P'], [270, 530, 'E'], [1010, 530, 'S']];
    corners.forEach(([x, y, g], i) => { const tt = t - 6.4 - i * .8; if (tt > 0) { const al = clamp(tt / .8, 0, 1); if (tt < .9) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = GUARDS[g].c; ctx.globalAlpha = 1 - tt / .9; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, tt * 260, 0, TAU); ctx.stroke(); ctx.restore(); } guard(g, x, y + Math.sin(t * 2 + i) * 8, t, 1.35, al); } });
    if (t > 7.4) { const al = clamp((t - 7.4) / 1, 0, 1); ctx.save(); ctx.globalAlpha = al; Art.ship(cx - 100, cy + 30 + Math.sin(t * 2) * 8, { pal: SKIN_DEFAULT, t, scale: 1.9, vx: 0, lookx: .5, looky: -.2, blinkT: 0, inv: 0, mood: 'happy' }); Art.orbi(cx + 110, cy + 10 + Math.sin(t * 2.2 + 1) * 8, { vx: 0, t, scale: 1.7, lookx: -.5, looky: -.2, blinkT: 0, inv: 0, sx: 1, sy: 1 }); ctx.restore(); }
    Cine.cap('O Vazio não foi destruído. Ele aprendeu a descansar.', t, .5, 3.6);
    Cine.cap('A luz voltou a bater.', t, 3.8, 6.8);
    Cine.cap('Os guardiões acordaram.', t, 7.2, 10.4);
    Cine.cap('E o céu inteiro respirou, de novo.', t, 10.6, 13);
    Cine.fade(clamp((t - 13.4) / .6, 0, 1)); Cine.fade(1 - clamp(t / .6, 0, 1));
  },
};

// 3. abertura da Parte 3: a porta de luz
Cine.clips.v_door = {
  dur: 12, pal: () => STAGES[6].pal, f(t) {
    const dx = W / 2, dy = 250, p = eio((t - 2) / 4), zoom = 1 + (t > 6 ? eio((t - 6) / 5) * .32 : 0);
    ctx.save(); ctx.translate(dx, dy + 120); ctx.scale(zoom, zoom); ctx.translate(-dx, -dy - 120);
    if (p > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(dx, dy, 120 + p * 520, '#ffd36a', .35 * p); ctx.restore();
      const w = 14 + p * 190, h = 40 + p * 330; ctx.save(); ctx.translate(dx, dy);
      const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(.6, '#fff0b8'); g.addColorStop(1, '#ffb340'); ctx.fillStyle = g; ctx.shadowColor = '#ffd36a'; ctx.shadowBlur = 50;
      ctx.beginPath(); ctx.moveTo(-w / 2, h / 2); ctx.lineTo(-w / 2, -h / 2 + w / 2); ctx.arc(0, -h / 2 + w / 2, w / 2, Math.PI, 0); ctx.lineTo(w / 2, h / 2); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#fff6d0'; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU + t * .1, r0 = 30 + p * 60, r1 = r0 + 140 + 260 * hsq(i) * p; ctx.globalAlpha = .35 * p; ctx.lineWidth = 2 + hsq(i + 4) * 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
      ctx.restore();
    } else if (t > 1.2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#fff6d0'; ctx.globalAlpha = clamp((t - 1.2) / .8, 0, 1); ctx.fillRect(dx - 2, dy - 22, 4, 44); drawGlow(dx, dy, 40, '#ffd36a', .6); ctx.restore(); }
    ctx.restore();
    const up = eio((t - 6.2) / 4.2), sy = 500 - up * 330, sc = 1.9 - up * 1.2, sx = dx + Math.sin(t * 1.4) * 14 * (1 - up);
    ctx.save(); Art.ship(sx, sy + Math.sin(t * 2.3) * 6 * (1 - up), { pal: SKIN_DEFAULT, t, scale: sc, vx: Math.sin(t * 1.4) * 80, lookx: 0, looky: -1, blinkT: 0, inv: 0, mood: t > 6 ? 'determined' : 'happy' }); ctx.restore();
    Cine.cap('O céu estava em paz.', t, .4, 3.6);
    Cine.cap('Até que uma porta de luz se abriu no horizonte.', t, 3.9, 7.4);
    Cine.cap('Do outro lado... um céu que nunca foi aceso.', t, 7.7, 10.4);
    Cine.fade(clamp((t - 9.4) / 1.8, 0, 1), '#fff6d8'); Cine.fade(clamp((t - 11.2) / .8, 0, 1)); Cine.fade(1 - clamp(t / .6, 0, 1));
  },
};

// 4. abertura do Ato Final: a fenda e o coracao
Cine.clips.v_rift = {
  dur: 13, pal: () => STAGES[9].pal, f(t) {
    const cx = W / 2, cy = H * .46, pull = eio((t - 4.6) / 5);
    for (let i = 0; i < 9; i++) {
      const st = .4 + i * .32, tt = t - st; if (tt <= 0) continue; const a0 = i / 9 * TAU, rx = 430 - pull * 380, ry = 250 - pull * 220, a = a0 + t * (.12 + pull * .9), x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, sc = easeBack(clamp(tt / .8, 0, 1)) * (1 - pull * .55), col = STAGES[i].tint || '#ffffff';
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * .5); ctx.scale(sc, sc); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 110, col, .35); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = col; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.globalAlpha = .88; ctx.beginPath(); for (let k = 0; k < 9; k++) { const aa = k / 9 * TAU, r = 46 * (.7 + hsq(i * 9 + k) * .5); ctx.lineTo(Math.cos(aa) * r, Math.sin(aa) * r * .72); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(-8, 6, 30, 14, .3, 0, TAU); ctx.fill(); ctx.restore();
    }
    if (t > 3) {
      const k = easeOut(clamp((t - 3) / 3.4, 0, 1)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const pts = []; for (let s = 0; s <= 24; s++) { const f = s / 24 - .5, x = cx + f * 1500 * k * .62 + Math.sin(s * 2.3) * 22, y = cy - f * 1100 * k * .62 + Math.cos(s * 1.7) * 26; pts.push([x, y]); }
      for (const [lw, al, col] of [[44, .14, '#ffb340'], [20, .3, '#ffe9a8'], [7, .95, '#ffffff']]) { ctx.strokeStyle = col; ctx.globalAlpha = al; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
      ctx.restore();
    }
    if (t > 6.6) {
      const k = easeBack(clamp((t - 6.6) / 1.6, 0, 1)); G.player = G.player || { x: cx, y: H * .9 }; const h = new Heart(); h.x = 0; h.y = 0; h.t = t; h.phase = Math.floor((t - 6.6) / 2) % 3; h.col = ACT_COL[h.phase]; h.flash = 0; h.beatAt = Math.floor(t * 1.1) / 1.1;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(k * 1.35, k * 1.35); ctx.globalAlpha = clamp((t - 6.6) / 1, 0, 1); h.draw(); ctx.restore();
    }
    Cine.cap('Com o Espelho partido, uma fenda cruzou o céu inteiro.', t, .6, 4.2);
    Cine.cap('Pedaços de todos os setores flutuavam nela, como lembranças.', t, 4.5, 8.2);
    Cine.cap('E no centro... algo batia.', t, 8.6, 11.8);
    Cine.fade(clamp((t - 11.2) / .9, 0, 1), '#ffffff'); Cine.fade(clamp((t - 12.3) / .7, 0, 1)); Cine.fade(1 - clamp(t / .6, 0, 1));
  },
};

// 5. final: o Coracao descansa, os chefes viram constelacao, amanhecer
Cine.clips.v_end = {
  dur: 17, pal: () => STAGES[9].pal, f(t) {
    const cx = W / 2, cy = H * .44; G.player = G.player || { x: cx, y: H * .9 };
    if (t < 4.2) { const h = new Heart(); h.x = 0; h.y = 0; h.t = t; h.phase = 2; h.col = ACT_COL[2]; h.flash = 0; h.beatAt = Math.floor(t * .6) / .6; ctx.save(); ctx.translate(cx, cy); ctx.scale(1.3, 1.3); ctx.globalAlpha = 1 - clamp((t - 2.6) / 1.5, 0, 1); h.draw(); ctx.restore(); }
    if (t > 2.6 && t < 8) for (let i = 0; i < 90; i++) { const tt = t - 2.6 - hsq(i + 70) * .8; if (tt > 0) { const a = hsq(i) * TAU, d = easeOut(Math.min(1, tt / 2.4)) * (120 + hsq(i + 9) * 520); Cine.star(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, 3 + hsq(i + 3) * 6, tt * 2, ['#ffd36a', '#33c4ff', '#e8d0ff'][i % 3], clamp(1 - tt / 3.4, 0, 1)); } }
    // constelacao em forma de foguete
    const P = [[0, -250], [34, -190], [48, -90], [56, 10], [96, 90], [58, 70], [30, 130], [0, 100], [-30, 130], [-58, 70], [-96, 90], [-56, 10], [-48, -90], [-34, -190]];
    if (t > 3.8) {
      const gather = clamp((t - 3.8) / 3.4, 0, 1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#cdb8ff'; ctx.lineWidth = 3; ctx.globalAlpha = .55 * clamp((t - 6.2) / 1.6, 0, 1) * (1 - clamp((t - 11.5) / 2, 0, .6)); ctx.beginPath(); P.forEach(([x, y], i) => { const px = cx + x * 1.1, py = cy + y * 1.1 + 20; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.closePath(); ctx.stroke(); ctx.restore();
      P.forEach(([x, y], i) => { const k2 = easeOut(clamp((t - 3.8 - i * .1) / 2.4, 0, 1)); Cine.star(lerp(cx, cx + x * 1.1, k2), lerp(cy, cy + y * 1.1 + 20, k2), 7 + (i % 3) * 3, t + i, i % 2 ? '#ffe9a8' : '#cdb8ff', k2 * (.7 + .3 * Math.sin(t * 3 + i)) * (1 - clamp((t - 12) / 2, 0, .5))); });
    }
    if (t > 8.6) { // amanhecer
      const k = eio((t - 8.6) / 4.6); ctx.save(); const g = ctx.createLinearGradient(0, H, 0, H * .35); g.addColorStop(0, 'rgba(255,170,90,' + .85 * k + ')'); g.addColorStop(.5, 'rgba(255,110,160,' + .45 * k + ')'); g.addColorStop(1, 'rgba(255,110,160,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; const sy = H * .86 - k * 90; drawGlow(cx, sy, 360, '#ffd9a0', .55 * k); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.arc(cx, sy, 84, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#0a0418'; ctx.beginPath(); ctx.ellipse(cx, H * 1.18, 1100, 360, 0, 0, TAU); ctx.fill(); ctx.restore();
      const f = eio((t - 9.4) / 5.4); ctx.save(); Art.ship(lerp(360, cx + 120, f), lerp(470, 300, f) + Math.sin(t * 2) * 5, { pal: SKIN_DEFAULT, t, scale: 1.6 - f * .3, vx: 120, lookx: .6, looky: -.4, blinkT: 0, inv: 0, mood: 'happy' }); Art.orbi(lerp(260, cx - 10, f), lerp(490, 330, f) + Math.sin(t * 2.2) * 5, { vx: 120, t, scale: 1.4 - f * .25, lookx: .6, looky: -.4, blinkT: 0, inv: 0, sx: 1, sy: 1 }); ctx.restore();
    }
    if (t > 14.4) { const a = clamp((t - 14.4) / .9, 0, 1) * (1 - clamp((t - 16.3) / .7, 0, 1)); ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 40; txt('FIM', W / 2, 150, 120, '#ffffff', 'center', 900); ctx.shadowBlur = 0; txt('O ÚLTIMO CÉU', W / 2, 290, 30, '#ffe9a8', 'center', 900); ctx.restore(); }
    if (t < 14.2) {
      Cine.cap('O Coração finalmente descansou.', t, .4, 3.8);
      Cine.cap('O Arauto, o Leviatã, o Reflexo e o Coração viraram luz.', t, 4.1, 8.4);
      Cine.cap('E o menor foguete da galáxia aprendeu que a maior luz é a que se divide.', t, 9.2, 14);
    }
    Cine.fade(clamp((t - 16.4) / .6, 0, 1)); Cine.fade(1 - clamp(t / .6, 0, 1));
  },
};

// 6. abertura do Ato II: o cemiterio das estrelas
Cine.clips.v_act2 = {
  dur: 13, pal: () => STAGES[4].pal, f(t) {
    const cx = W / 2;
    for (let i = 0; i < 40; i++) { const x = hsq(i) * W, y = 80 + hsq(i + 30) * (H - 160), a = clamp((t - .4 - hsq(i + 5) * 4) / 1, 0, 1), k = (hsq(i + 9) < .35) ? 1 : 0; ctx.save(); ctx.translate(x, y + Math.sin(t * .6 + i) * 6); ctx.rotate(.3 + i); ctx.globalAlpha = a * (k ? .5 + .3 * Math.sin(t * 3 + i) : .35); ctx.strokeStyle = k ? '#e8d0ff' : '#5a4a80'; ctx.lineWidth = 2; ctx.beginPath(); for (let q = 0; q < 8; q++) { const aa = q * Math.PI / 4, r = q % 2 ? 4 : 13; ctx.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); } ctx.closePath(); ctx.stroke(); ctx.restore(); }
    const e = clamp((t - 6) / 4, 0, 1); if (e > 0) { ctx.save(); ctx.globalAlpha = e * .8; ctx.fillStyle = '#07030f'; ctx.beginPath(); ctx.arc(cx + 260, 250, 120, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#b98cff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx + 260, 250, 122, 0, TAU); ctx.stroke(); drawGlow(cx + 260, 250, 260, '#6a3ad8', .25 * e); ctx.restore(); }
    for (let k = 0; k < 3; k++) { const tt = t - 3 - k * 2.4; if (tt > 0 && tt < 4) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(tt / 4 * Math.PI) * .45; const x = 200 + k * 380; ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, 360 + Math.sin(tt) * 20, 54, 26, 0, 0, TAU); ctx.stroke(); drawGlow(x, 360, 80, '#33c4ff', .3); ctx.restore(); } }
    const f = eio((t - 1) / 11); ctx.save(); Art.ship(lerp(180, W - 260, f), 520 - Math.sin(f * Math.PI) * 60 + Math.sin(t * 2) * 6, { pal: SKIN_DEFAULT, t, scale: 1.7, vx: 160, lookx: .5, looky: -.3, blinkT: 0, inv: 0, mood: t > 6 ? 'worry' : 'happy' }); Art.orbi(lerp(80, W - 360, f), 560 - Math.sin(f * Math.PI) * 60 + Math.sin(t * 2.2) * 6, { vx: 160, t, scale: 1.4, lookx: .5, looky: -.3, blinkT: 0, inv: 0, sx: 1, sy: 1 }); ctx.restore();
    Cine.cap('Com os quatro guardiões de volta, o céu respirou fundo.', t, .4, 4.2);
    Cine.cap('Mas o Vazio não esperou.', t, 4.6, 7.6);
    Cine.cap('A única rota até o seu coração passava pelo cemitério das estrelas.', t, 8, 12);
    Cine.fade(clamp((t - 12.3) / .7, 0, 1)); Cine.fade(1 - clamp(t / .7, 0, 1));
  },
};

// 7. o Vazio desperta antes da luta final da Parte 1
Cine.clips.v_void = {
  dur: 13, pal: () => STAGES[5].pal, f(t) {
    const cx = W / 2, cy = H * .42; const z = 1 + t * .01; ctx.save(); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
    ctx.globalAlpha = clamp(t / 1.5, 0, 1); Screens.sceneVoid(t); ctx.globalAlpha = 1;
    for (let i = 0; i < 36; i++) { const x = hsq(i) * W, y = 60 + hsq(i + 20) * (H - 120), tt = t - 3 - i * .1, on = tt < 0 ? 1 : clamp(1 - tt / .8, 0, 1); if (on > .02) Cine.star(x, y, 5 + hsq(i + 4) * 8, t + i, '#e2d4ff', on * .8); }
    ctx.restore();
    const k = clamp((t - 5) / 6, 0, 1); if (k > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, H * .68, 90 + Math.sin(t * 4) * 8, '#ffe9a8', .8); ctx.restore(); }
    ctx.save(); Art.ship(cx, H * .6 + Math.sin(t * 2) * 5, { pal: SKIN_DEFAULT, t, scale: 1.5, vx: 0, lookx: 0, looky: -1, blinkT: 0, inv: 0, mood: t > 6 ? 'determined' : 'worry' }); ctx.restore();
    ctx.save(); const g = ctx.createRadialGradient(cx, H / 2, 280, cx, H / 2, 900); g.addColorStop(0, 'rgba(4,0,16,0)'); g.addColorStop(1, 'rgba(4,0,16,' + (.35 + k * .5) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    Cine.cap('O Vazio chegou ao Coração de Luz.', t, .6, 4);
    Cine.cap('Cada estrela que ele tocava se apagava.', t, 4.4, 8);
    Cine.cap('Só restava um pequeno foguete.', t, 8.4, 11.8);
    Cine.fade(clamp((t - 12.3) / .7, 0, 1)); Cine.fade(1 - clamp(t / .6, 0, 1));
  },
};

// ---------- gravacao quadro a quadro (so para gerar os arquivos) ----------
Screens.cine = function () {
  const c = Cine.cur; if (!c) return; ctx.save(); c.f(Cine.t); ctx.restore();
  ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, 64); ctx.fillRect(0, H - 64, W, 64);
};
Cine.run = async function (id, onFrame) {
  const c = Cine.clips[id], n = Math.round(c.dur * Cine.fps); Cine.cur = c; World.setStage(c.pal()); World.t = 0; G.state = 'cine'; Trans.t = 9;
  for (let f = 0; f < n; f++) {
    Trans.t = 9; Cine.t = f / Cine.fps; World.t = Cine.t; World.update(1 / Cine.fps, 0); render();
    const url = cv.toDataURL('image/jpeg', .9); for (let tr = 0; tr < 8; tr++) { try { await fetch('http://127.0.0.1:8766', { method: 'POST', keepalive: false, body: JSON.stringify({ dir: id, name: String(f).padStart(4, '0'), ext: 'jpg', data: url }) }); break; } catch (e) { if (tr === 7) throw e; await new Promise(r => setTimeout(r, 300)); } } if (onFrame) onFrame(f, n);
  }
  Cine.cur = null; return n;
};
