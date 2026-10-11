'use strict';
// ---------- telas: titulo, mapa, loja, opcoes, pausa, level-up, fim de fase, fim de jogo ----------
const Screens = {
  wrapLines(text, maxW, size, weight = 700) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    const lines = []; let line = '';
    for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line);
    return lines;
  },
  // escreve so os primeiros `shown` caracteres (efeito maquina de escrever)
  typed(lines, shown, x, y, lh, size, color, align = 'left', weight = 700) {
    let left = shown;
    for (const ln of lines) {
      if (left <= 0) break;
      ctx.font = `${weight} ${size}px ${FONT}`;
      const x0 = align === 'center' ? x - ctx.measureText(ln).width / 2 : x;
      txt(ln.slice(0, left), x0, y, size, color, 'left', weight);
      left -= ln.length + 1; y += lh;
    }
  },
  orbi(x, y, s, a) {
    const t = World.t; ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 8 * s); ctx.globalAlpha = a;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 130 * s, '#7fe0ff', .9); ctx.restore(); ctx.globalAlpha = a;
    ctx.fillStyle = rdl(-18 * s, -22 * s, 4, 62 * s, [[0, '#ffffff'], [.45, '#7fe0ff'], [1, '#1b6aa8']]); ctx.beginPath(); ctx.arc(0, 0, 58 * s, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3 * s; ctx.save(); ctx.rotate(-.4 + Math.sin(t) * .1); ctx.beginPath(); ctx.ellipse(0, 0, 84 * s, 22 * s, 0, 0, TAU); ctx.stroke();
    const sa = t * 2; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(sa) * 84 * s, Math.sin(sa) * 22 * s, 6 * s, 0, 7); ctx.fill(); ctx.restore();
    const bl = (t % 4) < .14 ? .15 : 1;
    ctx.fillStyle = '#0e2a52'; for (const e of [-1, 1]) { ctx.beginPath(); ctx.ellipse(e * 20 * s, -4 * s, 9 * s, 13 * s * bl, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#fff'; for (const e of [-1, 1]) { ctx.beginPath(); ctx.arc(e * 20 * s - 3 * s, -9 * s, 3 * s, 0, 7); ctx.fill(); }
    ctx.strokeStyle = '#0e2a52'; ctx.lineWidth = 3 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 12 * s, 12 * s, .2, Math.PI - .2); ctx.stroke();
    ctx.restore();
  },

  // ---- cenas de fundo da historia ----
  sceneVoid(t) {
    const cx = W / 2, cy = H * .4;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(200,170,255,.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 30; i++) { const a = i * 2.399 + 1, p = (t * .22 + i * .137) % 1, r0 = 640 * (1 - p), r1 = r0 * .9; ctx.globalAlpha = p * .8; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .7); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .7); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = rdl(cx, cy, 10, 380, [[0, '#000'], [.45, 'rgba(4,1,18,.97)'], [.75, 'rgba(40,10,90,.55)'], [1, 'rgba(120,70,220,0)']]); ctx.beginPath(); ctx.arc(cx, cy, 380, 0, 7); ctx.fill();
    for (let k = 0; k < 5; k++) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * (.15 + k * .05) * (k % 2 ? -1 : 1) + k); ctx.strokeStyle = `rgba(150,90,255,${.14 + k * .04})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 300 - k * 34, 120 + k * 22, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) { drawGlow(cx + s * 60, cy - 6, 50, '#b98cff', .7 + Math.sin(t * 2) * .2); ctx.fillStyle = '#f2e8ff'; ctx.beginPath(); ctx.ellipse(cx + s * 60, cy - 6, 30, 5, s * -.2, 0, 7); ctx.fill(); } ctx.restore(); ctx.globalAlpha = 1;
  },
  sceneHeart(t) {
    const cx = W / 2, cy = H * .38, pu = 1 + Math.sin(t * 3) * .06;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(cx, cy, 340 * pu, '#ffe9a8', .8); drawGlow(cx, cy, 170, '#ffffff', .9);
    ctx.strokeStyle = 'rgba(255,233,168,.5)'; ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .15; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70); ctx.lineTo(cx + Math.cos(a) * (240 + Math.sin(t * 2 + i) * 30), cy + Math.sin(a) * (240 + Math.sin(t * 2 + i) * 30)); ctx.stroke(); }
    const cols = ['#ffb340', '#c8a0b8', '#ff7ac8', '#ff8a1f'];
    for (let i = 0; i < 4; i++) { const a = t * .5 + i * Math.PI / 2; drawGlow(cx + Math.cos(a) * 230, cy + Math.sin(a) * 120, 60, cols[i], .9); }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(pu, pu); ctx.fillStyle = rdl(0, 0, 4, 70, [[0, '#ffffff'], [.5, '#ffe9a8'], [1, '#ffb340']]);
    ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU - Math.PI / 2, r = i % 2 ? 34 : 74; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    for (let i = 0; i < 4; i++) { const a = t * .5 + i * Math.PI / 2; ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 230, cy + Math.sin(a) * 120, 14, 0, 7); ctx.fill(); }
  },
  sceneLumi(t) {
    const cx = W / 2, cy = H * .38;
    const fl = .5 + Math.sin(t * 22) * .06 - (Math.random() < .05 ? .3 : 0), gl = Math.random() < .03 ? rand(-14, 14) : 0;
    ctx.save(); ctx.translate(cx + gl, cy); ctx.globalAlpha = fl; ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, 300, '#ffd36a', .8);
    ctx.fillStyle = rdl(0, 0, 6, 160, [[0, '#ffffff'], [.5, '#ffe9a8'], [1, '#e0a030']]);
    ctx.save(); ctx.rotate(t * .2); ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 88 : 170; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.restore(); ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = 'rgba(8,2,26,1)'; for (let y = cy - 190; y < cy + 190; y += 6) ctx.fillRect(cx - 200, y, 400, 2); ctx.restore(); ctx.globalAlpha = 1;
  },
  sceneBoss(S, t) {
    if (!S.bossObj) { try { const b = new BOSS_CLASSES[G.stage.boss](); b.state = 'fight'; S.bossObj = b; } catch (e) { return; } }
    const b = S.bossObj; b.t = t; b.x = W / 2; b.y = 250; b.flash = 0; b.phase = 0;
    ctx.save(); ctx.globalAlpha = .55; ctx.translate(W / 2 + Math.sin(t * .3) * 22, 250); ctx.scale(1.6, 1.6); ctx.translate(-b.x, -b.y);
    try { b.draw(); } catch (e) { /* so cenario */ }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(20,6,50,.5)'; ctx.fillRect(0, 0, W, H);
  },
  // ajusta o tamanho da letra para o texto sempre caber na area disponivel
  fit(text, maxW, availH, sizes) {
    let r = null;
    for (const size of sizes) { const lines = this.wrapLines(text, maxW, size, 700), lh = size * 1.34; r = { lines, size, lh }; if (lines.length * lh <= availH) break; }
    return r;
  },

  // Faisca da Mestra Lumi voando ate o Olienzinho
  sceneSpark(S, t) {
    const u = S.t, cx0 = 300, cy0 = 300, sx = 920, sy = 400;
    const lf = clamp(1 - (u - 1.6) / 2.6, .06, 1);
    ctx.save(); ctx.translate(cx0, cy0); ctx.globalAlpha = lf * (.7 + Math.sin(t * 20) * .05); ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, 230, '#ffd36a', .75);
    ctx.fillStyle = rdl(0, 0, 6, 130, [[0, '#ffffff'], [.5, '#ffe9a8'], [1, '#e0a030']]);
    ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * .2, r = i % 2 ? 66 : 128; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
    Art.ship(sx, sy + Math.sin(t * 2) * 8, { vx: 0, t, scale: .95, lookx: -.6, looky: -.2, blinkT: 0, boost: .1 });
    const go = clamp((u - 1.2) / 2.2, 0, 1), e = go * go * (3 - 2 * go);
    const pt = k => { const p0 = [cx0 + 30, cy0 + 10], p1 = [520, 90], p2 = [760, 130], p3 = [sx - 10, sy - 20], m = 1 - k; return [m * m * m * p0[0] + 3 * m * m * k * p1[0] + 3 * m * k * k * p2[0] + k * k * k * p3[0], m * m * m * p0[1] + 3 * m * m * k * p1[1] + 3 * m * k * k * p2[1] + k * k * k * p3[1]]; };
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (u < 1.2) {
      const g = u / 1.2;
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * 3, d = (1 - g) * 120 + 10; drawGlow(cx0 + 30 + Math.cos(a) * d, cy0 + 10 + Math.sin(a) * d, 8, '#ffe9a8', g); }
      drawGlow(cx0 + 30, cy0 + 10, 20 + g * 30, '#ffffff', g);
    } else if (go < 1) {
      for (let i = 0; i < 26; i++) { const k = Math.max(0, e - i * .018), [x, y] = pt(k); drawGlow(x + Math.sin(i * 3 + t * 10) * 4, y + Math.cos(i * 2 + t * 9) * 4, 14 * (1 - i / 30), i % 2 ? '#ffe9a8' : '#ffb340', (1 - i / 26) * .9); }
      const [x, y] = pt(e); drawGlow(x, y, 60, '#ffd36a', .9); drawGlow(x, y, 26, '#ffffff', 1);
    } else {
      const a = u - 3.4;
      if (!S.arr) { S.arr = true; Snd.play('levelUp'); }
      if (a < .6) { ctx.globalAlpha = (1 - a / .6) * .6; ctx.fillStyle = '#fff6d8'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      ctx.strokeStyle = '#ffe9a8';
      for (let i = 0; i < 3; i++) { const k = (a - i * .25) / 1.4; if (k > 0 && k < 1) { ctx.globalAlpha = (1 - k) * .8; ctx.lineWidth = 6 * (1 - k) + 1; ctx.beginPath(); ctx.arc(sx, sy, 20 + k * 260, 0, TAU); ctx.stroke(); } }
      ctx.globalAlpha = 1; drawGlow(sx, sy, 150 + Math.sin(t * 4) * 14, '#ffd36a', .75); drawGlow(sx, sy - 10, 70, '#ffffff', .6 + Math.sin(t * 6) * .15);
      for (let i = 0; i < 14; i++) { const k = (t * .5 + i / 14) % 1, ang = i * 2.4; drawGlow(sx + Math.cos(ang) * k * 120, sy - k * 140 + Math.sin(ang) * 20, 7, '#ffe9a8', (1 - k) * .8); }
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // decolagem do Olienzinho rumo a missao
  sceneLaunch(S, t) {
    const u = S.t, dt = Math.min(.05, u - (S.lu ?? u)); S.lu = u;
    ctx.fillStyle = lin(0, 0, 0, H, [[0, 'rgba(4,1,16,.93)'], [1, 'rgba(14,6,40,.9)']]); ctx.fillRect(-20, -20, W + 40, H + 40);
    const ign = clamp((u - .4) / .9, 0, 1), liftT = Math.max(0, u - 1.6), h = 55 * liftT * liftT, vel = 110 * liftT;
    const camCap = 200, shipH = Math.min(h, camCap), padDrop = Math.max(0, h - camCap);
    if (!S.ls) S.ls = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, H), z: rand(.3, 1) }));
    ctx.save(); ctx.strokeStyle = 'rgba(226,212,255,.85)'; ctx.lineCap = 'round';
    for (const s of S.ls) { s.y += (vel * s.z * .9 + 6 * s.z) * dt; if (s.y > H + 40) { s.y = -40; s.x = rand(0, W); } ctx.globalAlpha = .3 + .5 * s.z; ctx.lineWidth = 1 + s.z * 1.5; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y - 4 - vel * .12 * s.z); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
    // eclipse do Vazio surgindo la no fundo
    if (u > 3) { const er = 18 + easeOut((u - 3) / 6) * 62; this.eclipse(W * .78, H * .2, er, t); }
    // plataforma com luzes e torres
    const py = 430 + padDrop;
    if (py < H + 160) {
      ctx.fillStyle = '#0a0620'; ctx.fillRect(W / 2 - 260, py, 520, 150); ctx.fillStyle = '#2a1a5a'; ctx.fillRect(W / 2 - 260, py, 520, 8);
      ctx.fillStyle = '#0a0620'; ctx.fillRect(W / 2 - 250, py - 170, 18, 170); ctx.fillRect(W / 2 + 232, py - 170, 18, 170);
      for (let i = -2; i <= 2; i++) { const on = (Math.floor(u * 4) + i + 10) % 2 === 0; ctx.fillStyle = on ? '#ffb340' : '#4a2a10'; ctx.beginPath(); ctx.arc(W / 2 + i * 110, py + 26, 6, 0, 7); ctx.fill(); if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(W / 2 + i * 110, py + 26, 26, '#ffb340', .8); ctx.restore(); ctx.globalAlpha = 1; } }
    }
    // fumaca da ignicao
    if (!S.pf) S.pf = [];
    if (u > .4 && u < 3.4) for (let i = 0; i < 4; i++) S.pf.push({ x: W / 2 + rand(-30, 30), y: py - 4, vx: rand(-230, 230), vy: rand(-30, -4), r: rand(18, 34), life: rand(1, 1.8), max: 1.8 });
    for (const p of S.pf) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 1.5 * dt; p.r += 22 * dt; }
    S.pf = S.pf.filter(p => p.life > 0);
    ctx.save(); ctx.fillStyle = '#8a78c0'; for (const p of S.pf) { ctx.globalAlpha = clamp(p.life / p.max, 0, 1) * .35; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); } ctx.restore(); ctx.globalAlpha = 1;
    // a nave: sobe, a camera acompanha, depois fica pequena rumo ao eclipse
    const far = clamp((u - 4.2) / 7, 0, 1), sc = lerp(1.15, .45, far), jit = u < 1.6 ? ign * 3 : 0;
    const sx = lerp(W / 2, W * .72, far * far) + rand(-jit, jit), sy = lerp(330 - shipH, 190, far);
    if (u < 2.8) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(W / 2, py - 8, 140 * ign, '#ffb340', .7 * ign); ctx.restore(); ctx.globalAlpha = 1; }
    if (!S.tr) S.tr = [];
    if (ign > 0) for (let i = 0; i < 3; i++) S.tr.push({ x: sx + rand(-8, 8), y: sy + 62 * sc, vy: 140 + vel * 1.2 + rand(0, 120), life: rand(.35, .8), c: Math.random() < .5 ? '#ffb340' : '#ffe9a8' });
    for (const q of S.tr) { q.life -= dt; q.y += q.vy * dt; }
    S.tr = S.tr.filter(q => q.life > 0).slice(-140);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const q of S.tr) drawGlow(q.x, q.y, 8 + q.life * 16, q.c, q.life * 1.1); ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(sx, sy, 150 * sc, '#8b4dff', .45); ctx.restore(); ctx.globalAlpha = 1;
    Art.ship(sx, sy, { vx: 0, t, scale: sc, boost: ign * (1 + Math.min(2.2, liftT * .8)), lookx: .3, looky: -.5, blinkT: 0 });
  },

  // estilhaco facetado do Coracao de Luz
  shard(x, y, s, col, rot, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.scale((.35 + .65 * Math.abs(Math.cos(spin))) * s, s);
    const P = [[0, -100], [44, -34], [30, 62], [0, 104], [-36, 48], [-40, -38]];
    ctx.fillStyle = lin(-40, -100, 44, 104, [[0, '#ffffff'], [.45, col], [1, '#3a1a6a']]);
    ctx.beginPath(); P.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(0, 104); ctx.moveTo(44, -34); ctx.lineTo(-36, 48); ctx.moveTo(-40, -38); ctx.lineTo(30, 62); ctx.stroke();
    ctx.globalAlpha = .4; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-10, -90); ctx.lineTo(30, -30); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill();
    ctx.restore();
  },

  // o setor se acende: onda de luz e estrelas voltando a brilhar
  sceneLit(S, t, keep) {
    const u = keep ? 99 : S.t, k = easeOut(u / 2.2), cx = W / 2, cy = H * .4;
    if (!keep && !S.fx) { S.fx = true; Snd.play('heart'); }
    if (!S.ls2) S.ls2 = Array.from({ length: 80 }, () => { const x = rand(30, W - 30), y = rand(70, 430); return { x, y, on: Math.hypot(x - cx, y - cy) / 900 * 2.2, c: pick(['#ffe9a8', '#ffd6f4', '#bfe6ff', '#e2d4ff']), sz: rand(.6, 1.4) }; });
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = .6 * k; ctx.drawImage(World.nebA, -40, 0, W + 80, H);
    ctx.globalAlpha = .8 * k; ctx.drawImage(World.nebB, -40, 0, W + 80, H);
    ctx.globalAlpha = 1; drawGlow(cx, cy, 520 * k, '#ffd36a', .35 * k); drawGlow(cx, cy, 300 * k, '#ffffff', .12 * k);
    for (let i = 0; i < 3; i++) { const r = (u - i * .5) / 2.6; if (r > 0 && r < 1) { ctx.globalAlpha = (1 - r) * .7; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 8 * (1 - r) + 2; ctx.beginPath(); ctx.arc(cx, cy, 40 + r * 900, 0, TAU); ctx.stroke(); } }
    for (const s of S.ls2) {
      if (u < s.on) continue;
      const a = clamp((u - s.on) / .5, 0, 1), fl = 1 - clamp((u - s.on) / .7, 0, 1), tw = .75 + .25 * Math.sin(t * 3 + s.x);
      drawGlow(s.x, s.y, (10 + s.sz * 9 + fl * 46) * 1.1, s.c, (.55 * a + fl) * tw);
      ctx.globalAlpha = a * tw; ctx.fillStyle = '#fff'; const r1 = 2.5 * s.sz + fl * 6; ctx.beginPath(); for (let q = 0; q < 8; q++) { const aa = q * Math.PI / 4, rr = q % 2 ? r1 * .3 : r1 * 2.6; ctx.lineTo(s.x + Math.cos(aa) * rr, s.y + Math.sin(aa) * rr); } ctx.closePath(); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // fragmento do Coracao de Luz surgindo e girando
  sceneFragment(S, pg, t, keep) {
    const u = keep ? 99 : S.t; if (pg.frag) S.frag = pg.frag; const col = S.frag || '#ffd36a';
    const cx = W / 2, cy = H * .38 + Math.sin(t * 1.8) * 8, k = easeBack(clamp(u / 1.1, 0, 1));
    if (!keep && !S.fx) { S.fx = true; Snd.play('upgrade'); Snd.play('heart'); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(cx, cy, 300 * k, col, .8); drawGlow(cx, cy, 150 * k, '#ffffff', .8);
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .2, l = 150 + Math.sin(t * 2 + i) * 30; ctx.globalAlpha = .35 * k; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80); ctx.lineTo(cx + Math.cos(a) * (80 + l), cy + Math.sin(a) * (80 + l)); ctx.stroke(); }
    const r0 = u / 1.3; if (r0 < 1) { ctx.globalAlpha = (1 - r0) * .8; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6 * (1 - r0) + 1; ctx.beginPath(); ctx.arc(cx, cy, 20 + r0 * 380, 0, TAU); ctx.stroke(); }
    for (let i = 0; i < 18; i++) { const p = (t * .45 + i / 18) % 1, a = i * 2.4, d = (1 - p) * 300; drawGlow(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .7, 7, col, p * .9 * k); }
    ctx.restore(); ctx.globalAlpha = 1;
    this.shard(cx, cy, k * 1.15, col, Math.sin(t * .6) * .12, t * .8);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const a = t * .7 + i * .7, d = 120 + (i % 3) * 22, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .6; ctx.globalAlpha = (.5 + .5 * Math.sin(t * 6 + i)) * k; ctx.fillStyle = '#fff'; ctx.beginPath(); for (let q = 0; q < 8; q++) { const aa = q * Math.PI / 4, rr = q % 2 ? 2 : 7; ctx.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); }
    if (pg.react) { // o nucleo do Orbi responde ao fragmento
      const ox = pg.who === 'B' ? 150 : W - 140, oy = 540;
      ctx.globalAlpha = .6 + Math.sin(t * 5) * .2; ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + (ox < cx ? -60 : 60), cy + 40); ctx.quadraticCurveTo((cx + ox) / 2, cy + 20, ox, oy - 70); ctx.stroke();
      drawGlow(ox, oy, 130 + Math.sin(t * 5) * 20, '#7fe0ff', .6);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },

  // os quatro fragmentos reunidos, com o vazio da peca que falta
  sceneFragments4(S, pg, t) {
    const cx = W / 2, cy = H * .38, cols = ['#ffb340', '#c8a0b8', '#ff7ac8', '#ff8a1f'], k = easeOut(S.t / 1.2);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, cy, 280 * k, '#ffe9a8', .4); ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * .1); ctx.strokeStyle = 'rgba(255,233,168,.6)'; ctx.setLineDash([10, 10]); ctx.lineWidth = 3;
    ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU - Math.PI / 2, r = i % 2 ? 50 : 104; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -86, 44 + Math.sin(t * 4) * 8, '#7fe0ff', .9); // a peca que falta
    ctx.restore(); ctx.globalAlpha = 1;
    cols.forEach((c, i) => { const a = t * .45 + i * Math.PI / 2, d = 220 * k, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .6; ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 70, c, .6); ctx.restore(); ctx.globalAlpha = 1; this.shard(x, y, .5 * k, c, a * .2, t + i); });
  },

  bossObjFor(S) {
    if (!S.bossObj) { try { const b = new BOSS_CLASSES[G.stage.boss](); b.state = 'fight'; S.bossObj = b; } catch (e) { return null; } }
    return S.bossObj;
  },

  // Mestra Lumi se apagando: a luz dela vai para o Olienzinho (progresso vem da pagina: pg.fade = [de, ate])
  sceneLumiFade(S, pg, t) {
    const [a, b] = pg.fade || [0, 1], p = lerp(a, b, easeOut(clamp(S.t / 6, 0, 1)));
    const lx = 320, ly = 290, sx = 930, sy = 400;
    const alive = 1 - p, sc = .45 + alive * .55, gl = Math.random() < p * .25 ? rand(-16, 16) : 0;
    ctx.fillStyle = `rgba(2,0,12,${p * .45})`; ctx.fillRect(0, 0, W, H);
    if (alive > .03) {
      ctx.save(); ctx.translate(lx + gl, ly); ctx.scale(sc, sc); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(alive * 1.3, 0, 1) * (Math.random() < p * .3 ? .35 : .85);
      drawGlow(0, 0, 250, '#ffd36a', .7);
      ctx.fillStyle = rdl(0, 0, 6, 130, [[0, '#ffffff'], [.5, '#ffe9a8'], [1, '#e0a030']]);
      ctx.beginPath(); for (let i = 0; i < 16; i++) { const aa = i / 16 * TAU + t * .2, r = i % 2 ? 66 : 128; ctx.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); } ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = .2 + p * .5; ctx.fillStyle = 'rgba(8,2,26,1)'; for (let y = ly - 160; y < ly + 160; y += 5) ctx.fillRect(lx - 190, y, 380, 2); ctx.restore();
      if (Math.random() < p * .3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .4; ctx.fillStyle = '#ffd36a'; ctx.fillRect(lx - 180, ly + rand(-120, 120), 360, rand(2, 6)); ctx.restore(); }
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const n = Math.floor(6 + p * 20);
    for (let i = 0; i < n; i++) {
      const k = (t * .35 + i / n) % 1, e = k * k * (3 - 2 * k), x = lerp(lx, sx - 10, e) + Math.sin(i * 5 + t * 3) * 26 * (1 - Math.abs(.5 - k) * 2), y = lerp(ly, sy - 20, e) - Math.sin(k * Math.PI) * 120;
      drawGlow(x, y, 10 + (i % 3) * 3, i % 2 ? '#ffe9a8' : '#ffb340', .8 * Math.sin(k * Math.PI));
    }
    drawGlow(sx, sy, 120 + p * 120 + Math.sin(t * 3) * 10, '#ffd36a', .25 + p * .6);
    ctx.restore(); ctx.globalAlpha = 1;
    Art.ship(sx, sy + Math.sin(t * 2) * 6, { vx: 0, t, scale: .95, lookx: -.7, looky: -.1, blinkT: 0, boost: .05, mood: p > .6 ? 'hurt' : null });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(sx, sy - 6, 34 + p * 30 + Math.sin(t * 5) * 5, '#fff6d8', .5 + p * .5); ctx.restore(); ctx.globalAlpha = 1;
  },

  // guardiao libertado: a casca de escuridao racha, estilhaca e a luz volta
  sceneFreed(S, t, keep) {
    const u = keep ? 99 : S.t, b = this.bossObjFor(S); if (!b) return;
    const col = ['#ffb340', '#c8a0b8', '#ff7ac8', '#ff8a1f'][G.stageIdx] || '#ffd36a', cx = W / 2, cy = 255, sc = G.stageIdx === 3 ? 1.1 : 1.3, shat = 2.8;
    const dt = Math.min(.05, t - (S.flT ?? t)); S.flT = t;
    b.t = t; b.x = W / 2; b.y = 250; b.flash = 0; b.phase = 0;
    const k = easeOut(clamp(u / 3, 0, 1));
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, cy, 460 * k, col, .5); drawGlow(cx, cy, 240 * k, '#fff6d8', .25 * k); ctx.restore(); ctx.globalAlpha = 1;
    // os filhos da Colmeia (zangoes) acendendo aos poucos
    const drones = G.stageIdx === 0 ? 8 : 0, back = [], front = [];
    for (let i = 0; i < drones; i++) { const a = t * .5 + i / drones * TAU, x = cx + Math.cos(a) * 310, y = cy + 40 + Math.sin(a) * 70; (Math.sin(a) > 0 ? front : back).push([x, y, i]); }
    const drawDrone = ([x, y, i]) => {
      const lit = keep ? 1 : clamp((u - 3 - i * .25) / 1.2, 0, 1);
      Art.enemy({ x, y, rad: 16, type: 'drone', age: 9, ph: i, hit: 0, glow: col, look: 0 });
      if (lit < 1) { ctx.fillStyle = `rgba(14,4,32,${.8 * (1 - lit)})`; ctx.beginPath(); ctx.arc(x, y, 21, 0, 7); ctx.fill(); }
      else { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 30, '#ffe9a8', .5 + Math.sin(t * 4 + i) * .15); ctx.restore(); ctx.globalAlpha = 1; }
    };
    back.forEach(drawDrone);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-b.x, -b.y); ctx.globalAlpha = .92; b.draw(); ctx.restore(); ctx.globalAlpha = 1;
    front.forEach(drawDrone);
    if (u < shat + .2) { // casca de corrupcao com rachaduras de luz
      const cr = clamp(u / shat, 0, 1);
      ctx.save(); ctx.translate(cx, cy);
      ctx.globalAlpha = (1 - cr) * .75; ctx.fillStyle = rdl(0, 0, 30, 260, [[0, 'rgba(10,2,24,.9)'], [1, 'rgba(10,2,24,0)']]); ctx.beginPath(); ctx.arc(0, 0, 260, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1; ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) { const a2 = i / 12 * TAU + .3, l = 60 + cr * 190 + Math.sin(i * 5) * 30; ctx.strokeStyle = i % 2 ? '#ffffff' : col; ctx.lineWidth = 3 + cr * 3; ctx.beginPath(); ctx.moveTo(0, 0); for (let s2 = 1; s2 <= 5; s2++) ctx.lineTo(Math.cos(a2) * l * s2 / 5 + Math.sin(s2 * 7 + i) * 10, Math.sin(a2) * l * s2 / 5 * .7 + Math.cos(s2 * 5 + i) * 8); ctx.stroke(); }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    if (!keep && u >= shat && !S.shat) {
      S.shat = true; Snd.play('explode', { size: 1 }); Snd.play('shield'); Snd.play('heart');
      S.deb = Array.from({ length: 44 }, () => { const a = rand(0, TAU), s = rand(120, 520); return { x: cx + rand(-60, 60), y: cy + rand(-40, 40), vx: Math.cos(a) * s, vy: Math.sin(a) * s - 100, r: rand(8, 22), rot: rand(0, 6), vr: rand(-8, 8), life: rand(1.2, 2.2) }; });
    }
    if (S.deb) {
      for (const d of S.deb) { d.life -= dt; d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 380 * dt; d.rot += d.vr * dt; }
      ctx.fillStyle = '#12041f'; ctx.strokeStyle = 'rgba(150,90,255,.5)'; ctx.lineWidth = 2;
      for (const d of S.deb) if (d.life > 0) { ctx.save(); ctx.globalAlpha = clamp(d.life, 0, 1); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.beginPath(); for (let i = 0; i < 5; i++) { const a2 = i / 5 * TAU, r = d.r * (.7 + (i % 2) * .5); ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.globalAlpha = 1;
    }
    if (S.shat) {
      const a = u - shat;
      if (a < .7) { ctx.globalAlpha = (1 - a / .7) * .7; ctx.fillStyle = '#fff6d8'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffe9a8';
      for (let i = 0; i < 3; i++) { const k2 = (a - i * .2) / 1.4; if (k2 > 0 && k2 < 1) { ctx.globalAlpha = (1 - k2) * .8; ctx.lineWidth = 6 * (1 - k2) + 1; ctx.beginPath(); ctx.arc(cx, cy, 30 + k2 * 480, 0, TAU); ctx.stroke(); } }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    if (u > shat + .8 || keep) { // calma: brilhos subindo
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 16; i++) { const p = (t * .35 + i / 16) % 1; drawGlow(cx + Math.sin(i * 5 + t) * 160, cy + 130 - p * 280, 6, i % 3 ? col : '#ffffff', (1 - p) * .7); }
      ctx.restore(); ctx.globalAlpha = 1;
    }
  },

  // o Vazio cobre o sol recem-libertado
  sceneVoidArrive(S, t) {
    const u = S.t, p = clamp(u / 7, 0, 1), e = p * p * (3 - 2 * p), sx = W * .42, sy = H * .38;
    if (!S.fx) { S.fx = true; Snd.play('rumble', { dur: 3 }); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(sx, sy, 330, '#ffb340', .55 * (1 - e * .5)); drawGlow(sx, sy, 170, '#fff2c0', .6);
    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,210,120,.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU + t * .05, l = 110 + (i % 4) * 30 + Math.sin(t * 2 + i) * 10; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * 96, sy + Math.sin(a) * 96); ctx.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = rdl(sx - 24, sy - 28, 8, 100, [[0, '#fff7d0'], [.5, '#ffc040'], [1, '#e0541a']]); ctx.beginPath(); ctx.arc(sx, sy, 90, 0, 7); ctx.fill();
    const dx = lerp(W + 280, sx + 12, e), dy = sy - 6;
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = Math.PI + (i - 3.5) * .4, L = 120 + (i % 3) * 50, sw = Math.sin(t * 1.4 + i) * 18; ctx.strokeStyle = 'rgba(150,90,255,.4)'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(dx + Math.cos(a) * 160, dy + Math.sin(a) * 160); ctx.quadraticCurveTo(dx + Math.cos(a) * (160 + L * .6), dy + Math.sin(a) * (160 + L * .6) + sw, dx + Math.cos(a) * (160 + L), dy + Math.sin(a) * (160 + L) - sw); ctx.stroke(); ctx.strokeStyle = '#010005'; ctx.lineWidth = 7; ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = '#010005'; ctx.beginPath(); ctx.arc(dx, dy, 170, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(150,90,255,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(dx, dy, 170, 0, TAU); ctx.stroke();
    if (p > .55) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) { drawGlow(dx + s * 56, dy - 6, 46, '#b98cff', (p - .55) * 2); ctx.fillStyle = '#f2e8ff'; ctx.globalAlpha = clamp((p - .55) * 2, 0, 1); ctx.beginPath(); ctx.ellipse(dx + s * 56, dy - 6, 28, 5, s * -.2, 0, 7); ctx.fill(); } ctx.restore(); ctx.globalAlpha = 1; }
    ctx.fillStyle = `rgba(10,0,40,${p * .45})`; ctx.fillRect(0, 0, W, H);
    this.dyingStars(t);
  },

  // o Vazio se desfaz em mil sombras
  sceneVoidBreak(S, t) {
    const u = S.t, cx = W / 2, cy = H * .4;
    if (!S.fx) { S.fx = true; Snd.play('explode', { size: 1.6 }); Snd.play('rumble', { dur: 2.5 }); S.wisps = Array.from({ length: 46 }, () => ({ a: rand(0, TAU), s: rand(160, 560), w: rand(.5, 1.4), l: rand(60, 170) })); }
    const r = Math.max(0, 210 * (1 - easeOut(u / 1.6)));
    if (r > 2) { ctx.fillStyle = '#010005'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(150,90,255,.6)'; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.save(); ctx.lineCap = 'round';
    for (const w of S.wisps || []) {
      const d = w.s * u, a = w.a + Math.sin(u * 3 + w.w) * .1, life = clamp(1 - u / 3, 0, 1), tail = w.l * life;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .8, x0 = x - Math.cos(a) * tail, y0 = y - Math.sin(a) * tail * .8;
      ctx.strokeStyle = `rgba(150,90,255,${life * .35})`; ctx.lineWidth = 12 * life + 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
      ctx.strokeStyle = `rgba(4,0,16,${life * .95})`; ctx.lineWidth = 8 * life + 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
    }
    ctx.restore();
    if (u < .5) { ctx.globalAlpha = (1 - u / .5) * .5; ctx.fillStyle = '#b98cff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, cy, 420 * easeOut(u / 3), '#7fe0ff', .14); ctx.restore(); ctx.globalAlpha = 1;
    this.dyingStars(t);
  },

  // pula marcadores de musica e toca a trilha da cena
  curPage(S) {
    while (S.pages[S.i] && S.pages[S.i].music && !S.pages[S.i].who && !S.pages[S.i].title && !S.pages[S.i].mission) {
      Snd.musicPlay(S.pages[S.i].music, 1); S.mk = S.pages[S.i].music; S.i++; S.t = 0; S.lastShown = 0; S.doneAt = null;
    }
    return S.pages[S.i];
  },
  storyBackdrop() {
    const S = G.story, pg = S && this.curPage(S), t = World.t;
    if (!S || !pg) { World.draw(0); return; }
    const dt = Math.min(.05, t - (S.bl ?? t)); S.bl = t; S.total = (S.total || 0) + dt;
    const dram = pg.mood === 'angry' || pg.mood === 'shock', shk = dram ? Math.max(0, 1 - S.t / .5) * 9 : (pg.scene === 'launch' ? Math.max(0, 1 - S.t / 3.2) * 6 : 0);
    ctx.save();
    const z = 1 + clamp(S.t / 16, 0, 1) * .06;
    ctx.translate(W / 2 + rand(-shk, shk), H / 2 + rand(-shk, shk)); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    World.draw(Math.sin(t * .2) * 70);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const sc = pg.scene || (pg.mission ? 'boss' : null);
    if (sc === 'void') this.sceneVoid(t); else if (sc === 'heart') this.sceneHeart(t); else if (sc === 'lumi') this.sceneLumi(t); else if (sc === 'boss') this.sceneBoss(S, t); else if (sc === 'spark') this.sceneSpark(S, t); else if (sc === 'launch') this.sceneLaunch(S, t);
    else if (sc === 'lumiFade') this.sceneLumiFade(S, pg, t); else if (sc === 'freed' || sc === 'freedKeep') this.sceneFreed(S, t, sc === 'freedKeep'); else if (sc === 'voidArrive') this.sceneVoidArrive(S, t); else if (sc === 'voidBreak') this.sceneVoidBreak(S, t);
    else if (sc === 'lit' || sc === 'litKeep') this.sceneLit(S, t, sc === 'litKeep'); else if (sc === 'fragment' || sc === 'fragmentKeep') this.sceneFragment(S, pg, t, sc === 'fragmentKeep'); else if (sc === 'fragments4') this.sceneFragments4(S, pg, t);
    // particulas flutuando (poeira de luz)
    if (!S.motes) S.motes = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, H), v: rand(10, 40), r: rand(2, 6), ph: rand(0, 6) }));
    const mc = sc === 'void' ? '#b98cff' : sc === 'heart' || sc === 'lumi' ? '#ffe9a8' : sc === 'boss' ? '#ffb340' : '#cdb8ff';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const m of S.motes) { m.y -= m.v * dt; m.x += Math.sin(t + m.ph) * 12 * dt; if (m.y < -10) { m.y = H + 10; m.x = rand(0, W); } drawGlow(m.x, m.y, m.r * 3, mc, .22 + .2 * Math.sin(t * 2 + m.ph)); }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.restore();
  },

  story() {
    const S = G.story; if (!S) return;
    let pg = this.curPage(S); if (!pg) { Game.endStory(); return; }
    const now = World.t, dt = Math.min(.05, now - (S.last ?? now)); S.last = now; S.t += dt;
    const t = now, adv = Input.pressed(' ') || Input.pressed('enter') || Input.mouse.click;
    const narr = pg.who === 'N', title = !!pg.title, mis = !!pg.mission;
    const next = () => { S.i++; S.t = 0; S.lastShown = 0; S.doneAt = null; S.fx = false; S.shat = false; S.deb = null; Snd.play('uiSelect'); if (S.i >= S.pages.length) Game.endStory(); };
    ctx.globalAlpha = 1; ctx.fillStyle = `rgba(8,2,26,${title ? .88 : mis ? .6 : narr ? .42 : .22})`; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rdl(W / 2, H / 2, H * .35, H * .95, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.7)']]); ctx.fillRect(0, 0, W, H);
    const BH = 64 * easeOut((S.total || 0) / .8);
    const dram = pg.mood === 'angry' || pg.mood === 'shock', shk = dram ? Math.max(0, 1 - S.t / .5) * 7 : 0;

    if (title) { // cartao de titulo (ato / setor) com explosao de estrelas
      const k = easeOut(S.t / 1.1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 34; i++) { const a = i * 2.399, r = easeOut(S.t / 1.6) * (140 + (i % 6) * 70); drawGlow(W / 2 + Math.cos(a) * r, H / 2 - 10 + Math.sin(a) * r * .5, 5 + (i % 3) * 3, i % 2 ? '#ffe9a8' : '#b98cff', clamp(1 - S.t / 2.6, 0, 1) * .8); }
      ctx.restore(); ctx.globalAlpha = 1;
      ctx.save(); ctx.translate(W / 2, H / 2 - 10);
      ctx.fillStyle = '#ffb340'; const lw = 560 * k; ctx.fillRect(-lw / 2, -112, lw, 3); ctx.fillRect(-lw / 2, 62, lw, 3);
      ctx.globalAlpha = clamp((S.t - .25) / .5, 0, 1); txt(pg.title.split('').join(' '), 0, -96, 28, '#ffb340', 'center', 900);
      const sk = 1 + (1 - easeOut((S.t - .6) / 1)) * .12;
      ctx.globalAlpha = clamp((S.t - .6) / .7, 0, 1); ctx.save(); ctx.scale(sk, sk); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 40; txt(pg.sub, 0, -56, Math.min(pg.sub.length > 16 ? 70 : 84, 1100 / (pg.sub.length * .64)), '#ffffff', 'center', 900); ctx.restore();
      ctx.globalAlpha = 1; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sw = (S.t * .5) % 1.6 - .3; drawGlow(-300 + sw * 600, -4, 160, '#ffe9a8', .5 * k); ctx.restore(); ctx.globalAlpha = 1;
      if (S.t > 2) { ctx.globalAlpha = .5 + .4 * Math.sin(t * 5); txt('clique ou ENTER para continuar', 0, 100, 17, '#cdb8ff', 'center', 700); ctx.globalAlpha = 1; }
      ctx.restore();
      if (adv && S.t > 1.2) next();
    } else if (mis) { // cartao da missao
      const m = pg.mission, k = easeBack(S.t / .6);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k);
      UI.panel(-430, -190, 860, 380, { fill: 'rgba(20,8,55,.9)', stroke: '#ffb340' });
      txt('MISSÃO ' + m.n, 0, -160, 26, '#ffb340', 'center', 900);
      ctx.save(); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 30; txt(m.title, 0, -118, 62, '#ffffff', 'center', 900); ctx.restore();
      ctx.fillStyle = '#ffb340'; ctx.fillRect(-80, -40, 160, 4);
      UI.wrap(m.goal, 0, -10, 720, 36, 28, '#e2d4ff', 'center', 700);
      txt('CHEFE:  ' + m.boss, 0, 100, 24, '#ff8a5f', 'center', 900);
      ctx.globalAlpha = .55 + .4 * Math.sin(t * 5); txt('clique ou ENTER para começar', 0, 146, 18, '#cdb8ff', 'center', 700); ctx.globalAlpha = 1;
      ctx.restore();
      if (adv && S.t > .6) next();
    } else { // dialogo
      const ch = CHARS[pg.who], text = pg.text, len = text.length;
      const mood = pg.mood, spd = (mood === 'sad' ? .75 : mood === 'fade' ? .6 : mood === 'angry' ? 1.1 : mood === 'shock' ? 1.25 : pg.who === 'V' ? .85 : 1);
      const sp = 44 * spd, shown = Math.min(len, Math.floor(S.t * sp));
      if (shown > S.lastShown && text[shown - 1] !== ' ' && shown % 2 === 0) Snd.play('blip', { who: pg.who });
      S.lastShown = shown;
      if (shown >= len && S.doneAt === null) S.doneAt = now;
      if (S.prevWho !== pg.who) { if (S.prevWho && S.prevWho !== 'N' && pg.who !== 'N') S.other = { who: S.prevWho, mood: S.prevMood }; S.prevWho = pg.who; S.sw = 0; } S.sw += dt; S.prevMood = mood;
      // clarao dramatico
      if ((mood === 'shock' || (pg.who === 'V' && S.t < .3)) && S.t < .2) { ctx.globalAlpha = .5 * (1 - S.t / .2); ctx.fillStyle = pg.who === 'V' ? '#b98cff' : '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (pg.who === 'V') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(150,90,255,.08)'; for (let i = 0; i < 3; i++) ctx.fillRect(0, rand(80, 400), W, rand(2, 8)); ctx.restore(); }
      const talking = shown < len, y0 = 420, y1 = H - BH;
      ctx.fillStyle = lin(0, y0, 0, y1, [[0, 'rgba(8,2,26,0)'], [.3, 'rgba(8,2,26,.82)'], [1, 'rgba(8,2,26,.96)']]); ctx.fillRect(0, y0, W, y1 - y0);
      const jit = mood === 'angry' ? 1.4 : mood === 'fade' ? .8 : 0, wh = pg.who === 'V' ? .78 + Math.random() * .22 : 1;
      if (narr) {
        const f = this.fit(text, 960, H - 64 - 36 - (y0 + 56), [34, 30, 26, 23]);
        ctx.fillStyle = '#ffb340'; ctx.fillRect(W / 2 - 40, y0 + 34, 80, 3);
        ctx.save(); ctx.globalAlpha = Math.min(1, S.t / .3); this.typed(f.lines, shown, W / 2, y0 + 56, f.lh, f.size, '#e2d4ff', 'center', 700); ctx.restore();
        if (!talking) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 6); txt('▼', W - 120, y1 - 30, 20, '#cdb8ff', 'center'); ctx.globalAlpha = 1; }
      } else {
        // o outro personagem da conversa, apagado, do lado direito
        if (S.other && CHARS[S.other.who]) { ctx.save(); ctx.globalAlpha = .5; Portraits.draw(S.other.who, W - 140, 540, 120, { mood: S.other.mood, t }); ctx.restore(); }
        const sl = easeBack(S.sw / .35), sc2 = .7 + .3 * sl;
        ctx.save(); ctx.globalAlpha = clamp(S.sw / .2, 0, 1); ctx.translate(150 + rand(-shk, shk), 540 + rand(-shk, shk)); ctx.scale(sc2, sc2);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 170, ch.c, talking ? .5 + Math.sin(t * 14) * .08 : .25); ctx.restore(); ctx.globalAlpha = 1;
        Portraits.draw(pg.who, 0, 0, 190, { mood, talk: talking, t });
        ctx.restore();
        txt(ch.name, 272, y0 + 36, 22, ch.c, 'left', 900);
        ctx.fillStyle = ch.c; ctx.fillRect(272, y0 + 66, 54, 3);
        const f = this.fit(text, 830, H - 64 - 36 - (y0 + 82), [30, 27, 24, 21]);
        ctx.save(); ctx.globalAlpha = wh; if (jit) ctx.translate(rand(-jit, jit), rand(-jit, jit));
        this.typed(f.lines, shown, 272, y0 + 82, f.lh, f.size, '#ffffff', 'left', 700); ctx.restore();
        if (!talking) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 6); txt('▼', 1150, y1 - 30, 20, ch.c, 'center'); ctx.globalAlpha = 1; }
      }
      if (adv && S.t > .1) { if (talking) S.t = len / sp + .01; else if (now - S.doneAt > .3) next(); }
    }
    // barras de cinema (deslizam ao entrar), progresso e dicas
    ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, BH); ctx.fillRect(0, H - BH, W, BH);
    if (BH > 40) {
      const pw = 260, px = W / 2 - pw / 2, cnt = S.pages.filter(p => !(p.music && !p.who && !p.title && !p.mission)).length;
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(px, BH / 2 - 2, pw, 4); ctx.fillStyle = '#ffb340'; ctx.fillRect(px, BH / 2 - 2, pw * clamp((S.i + 1) / S.pages.length, 0, 1), 4);
      txt('ESC  pular cena', W - 28, BH / 2 - 9, 16, '#8a7fb0', 'right', 800);
      txt('clique / ENTER: continuar', W / 2, H - BH / 2 - 9, 16, '#8a7fb0', 'center', 800);
    }
    if (Input.pressed('escape')) { Snd.play('uiBack'); Game.endStory(); }
  },

  dim(a = .72) { ctx.globalAlpha = 1; ctx.fillStyle = `rgba(10,3,30,${a})`; ctx.fillRect(0, 0, W, H); },
  blinkAt(t) { const ph = t % 4; return ph < .16 ? .16 - ph : 0; },
  stars() { return '★ ' + Save.data.coins; },

  // ---- menu principal: o Olienzinho voando rumo ao eclipse do Vazio ----
  dyingStars(t) {
    const pos = [[150, 110], [380, 70], [700, 120], [1180, 90], [250, 560], [820, 610], [1230, 560], [520, 640]];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    pos.forEach(([x, y], i) => {
      const c = (t * .1 + i * .37) % 1; let b = 1;
      if (c > .55 && c < .8) b = Math.random() < .5 ? .15 : .9; else if (c >= .8 && c < .95) b = .04; else if (c >= .95) b = (c - .95) / .05;
      drawGlow(x, y, 22, '#e2d4ff', b * .7);
      ctx.globalAlpha = b; ctx.fillStyle = '#fff'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 2 : 8; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    });
    ctx.restore(); ctx.globalAlpha = 1;
  },

  eclipse(cx, cy, r, t) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(cx, cy, r * 3.6, '#ff8a1f', .34 + Math.sin(t * .7) * .04);
    drawGlow(cx, cy, r * 2.3, '#ffd36a', .55);
    ctx.lineCap = 'round';
    for (let i = 0; i < 90; i++) {
      const a = i / 90 * TAU + t * .03, n = Math.sin(i * 12.9898) * 43758.5453, rr = n - Math.floor(n);
      const l1 = r * 1.02, l2 = r * (1.25 + rr * .9 + Math.sin(t * 1.3 + i) * .06);
      ctx.strokeStyle = `rgba(255,${190 + (rr * 50 | 0)},120,${.12 + rr * .24})`; ctx.lineWidth = 1 + rr * 2.2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * l1, cy + Math.sin(a) * l1); ctx.lineTo(cx + Math.cos(a) * l2, cy + Math.sin(a) * l2); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#010005'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.lineWidth = 5;
    for (let k = 0; k < 48; k++) { const a0 = k / 48 * TAU, w = Math.max(0, Math.cos(a0 - Math.PI * 1.25)); ctx.strokeStyle = `rgba(255,226,150,${.1 + w * .85})`; ctx.beginPath(); ctx.arc(cx, cy, r + 1, a0, a0 + TAU / 48 + .02); ctx.stroke(); }
    const fa = Math.PI * 1.25, fx = cx + Math.cos(fa) * r, fy = cy + Math.sin(fa) * r;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    drawGlow(fx, fy, 100, '#ffffff', .9 * (.85 + Math.sin(t * 2) * .15)); drawGlow(fx, fy, 190, '#ffd36a', .5);
    ctx.strokeStyle = 'rgba(255,240,200,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx - 170, fy); ctx.lineTo(fx + 170, fy); ctx.moveTo(fx, fy - 100); ctx.lineTo(fx, fy + 100); ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
    // tentaculos do Vazio saindo do disco (comem a luz)
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + .3 + Math.sin(t * .4 + i) * .05, sw = Math.sin(t * .9 + i * 1.7) * 22, L = r * (.8 + (i % 3) * .22);
      const x0 = cx + Math.cos(a) * r * .96, y0 = cy + Math.sin(a) * r * .96, x1 = cx + Math.cos(a + .35) * (r + L * .6) + sw, y1 = cy + Math.sin(a + .35) * (r + L * .6), x2 = cx + Math.cos(a + .1) * (r + L), y2 = cy + Math.sin(a + .1) * (r + L) - sw;
      ctx.strokeStyle = 'rgba(150,90,255,.38)'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x1, y1, x2, y2); ctx.stroke();
      ctx.strokeStyle = '#010005'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x1, y1, x2, y2); ctx.stroke();
    }
    ctx.restore();
  },

  titleBackdrop() {
    const t = World.t, tt = t - (G.titleStart ?? t), dt = Math.min(.05, t - (this.tl ?? t)); this.tl = t;
    const mx = (Input.mouse.x - W / 2) / W, my = (Input.mouse.y - H / 2) / H;
    ctx.save();
    const z = 1.06 - easeOut(tt / 7) * .05;
    ctx.translate(W / 2 - mx * 14, H / 2 - my * 10); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = lin(0, 0, 0, H, [[0, '#050118'], [.6, '#0b052b'], [1, '#160936']]); ctx.fillRect(-80, -80, W + 160, H + 160);
    ctx.globalAlpha = .35; ctx.drawImage(World.nebA, -80 - mx * 24, 0, W + 160, H); ctx.globalAlpha = 1;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#e8e0ff';
    for (const s of World.stars) { const x = s.x - mx * 90 * s.par * 10; ctx.globalAlpha = (.28 + s.l * .25) * (.65 + .35 * Math.sin(t * 2 + s.ph)); ctx.lineWidth = s.r * 1.3; ctx.beginPath(); ctx.moveTo(x, s.y); ctx.lineTo(x, s.y - s.sp * .03); ctx.stroke(); }
    ctx.globalAlpha = 1;
    this.dyingStars(t);
    const ex = 1010 - mx * 34, ey = 330 - my * 22;
    this.eclipse(ex, ey, 175, t);

    // asteroides em silhueta no primeiro plano (parallax forte)
    if (!this.fg) this.fg = [[60, 700, 150], [420, 790, 120], [1220, 720, 170], [1030, 800, 110], [-20, 90, 110], [1290, 40, 100]].map(([x, y, r]) => ({ x, y, r, rot: rand(0, 6), vr: rand(-.08, .08), pts: Array.from({ length: 9 }, (_, i) => [Math.cos(i / 9 * TAU) * r * rand(.78, 1.12), Math.sin(i / 9 * TAU) * r * rand(.78, 1.12)]) }));
    for (const k of this.fg) {
      k.rot += k.vr * dt; ctx.save(); ctx.translate(k.x - mx * 120, k.y - my * 60); ctx.rotate(k.rot);
      ctx.fillStyle = '#03010b'; ctx.strokeStyle = 'rgba(255,200,120,.22)'; ctx.lineWidth = 3;
      ctx.beginPath(); k.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }

    // o Olienzinho entra voando e paira, rumo ao eclipse
    const fl = easeOut(clamp((tt - .4) / 3.2, 0, 1));
    const sx = lerp(-240, 600, fl) - mx * 40, sy = lerp(840, 500, fl) + Math.sin(t * 1.5) * 9 * fl - my * 20, ang = .62 - (1 - fl) * .22;
    this.trail = this.trail || [];
    const back = [-Math.sin(ang), Math.cos(ang)], nx = sx + back[0] * 64, ny = sy + back[1] * 64;
    for (let i = 0; i < 2; i++) this.trail.push({ x: nx + rand(-4, 4), y: ny + rand(-4, 4), vx: back[0] * rand(90, 240) + rand(-30, 30), vy: back[1] * rand(90, 240) + rand(-30, 30), life: rand(.35, .7), c: Math.random() < .55 ? '#ffb340' : '#ffe9a8' });
    for (const q of this.trail) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    this.trail = this.trail.filter(q => q.life > 0).slice(-160);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const q of this.trail) drawGlow(q.x, q.y, 7 + q.life * 14, q.c, q.life * 1.2); ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(sx, sy, 170, '#8b4dff', .5); drawGlow(sx + 26, sy - 30, 90, '#ffd36a', .35); ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(ang);
    Art.ship(0, 0, { vx: 0, t, lookx: .8, looky: -.5, blinkT: this.blinkAt(t), scale: 1.1, boost: .9 });
    ctx.restore();
    ctx.restore();
    // vinheta (fica atras do logo e do menu)
    ctx.fillStyle = rdl(W / 2, H / 2, H * .45, H * 1.0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.5)']]); ctx.fillRect(0, 0, W, H);
  },

  title() {
    const t = World.t;
    if (G.titleStart === undefined) G.titleStart = t;
    let tt = t - G.titleStart;
    if (tt < 3.2 && (Input.any() || Input.mouse.click)) { G.titleStart = t - 3.3; tt = 3.3; }
    const bh = 46 * easeOut(tt / 1.2), X0 = 112;
    // logotipo (letra por letra), limpo e legivel
    const word = 'OLIENZINHO', Y0 = 214;
    ctx.save(); ctx.font = `900 96px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const ws = [...word].map(c => ctx.measureText(c).width);
    ctx.fillStyle = lin(0, Y0 - 80, 0, Y0 + 6, [[0, '#ffffff'], [.55, '#ffffff'], [1, '#d6c4ff']]);
    let x = X0;
    [...word].forEach((c, i) => {
      const a = clamp((tt - (1 + i * .08)) / .5, 0, 1);
      if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(139,77,255,1)'; ctx.shadowBlur = 38; ctx.fillText(c, x, Y0 + (1 - easeOut(a)) * 40); ctx.shadowBlur = 0; ctx.fillText(c, x, Y0 + (1 - easeOut(a)) * 40); ctx.restore(); }
      x += ws[i];
    });
    ctx.restore();
    const sa = clamp((tt - 2.1) / .8, 0, 1);
    if (sa > 0) {
      ctx.globalAlpha = sa; ctx.fillStyle = '#ffb340'; ctx.fillRect(X0 + 4, Y0 + 28, 64 * sa, 4);
      txt('GUARDIÃO  DAS  ESTRELAS', X0 + 4, Y0 + 46, 22, '#ffb340', 'left', 800); ctx.globalAlpha = 1;
    }
    // menu em texto, com marcador dourado
    const items = [['play', 'JOGAR', 296, 46, ''], ['endless', 'MODOS EXTRAS', 366, 30, ''], ['rank', 'RANKING', 410, 30, ''], ['mis', 'MISSÕES', 454, 30, Visual8.missionsEnsure().list.filter(m => m.done).length + '/3'], ['shop', 'LOJA', 498, 30, '★ ' + Save.data.coins], ['opt', 'OPÇÕES', 542, 30, '']];
    if (tt >= 3) {
      items.forEach(([id, label, y, size, sub], i) => {
        const f = UI.focus(id), e = easeBack((tt - 3 - i * .12) / .45), w = size > 40 ? 300 : 230;
        if (UI.hit(id, X0 - 30, y - 8, w + 60, size + 22, { sound: id === 'play' ? 'uiSelect' : 'uiSelect' })) {
          if (id === 'play') Game.goSelect(); else if (id === 'endless') G.state = 'modes'; else if (id === 'rank') G.state = 'rank'; else if (id === 'mis') G.state = 'missions'; else if (id === 'shop') { G.shopBack = 'title'; G.state = 'shop'; } else { G.setBack = 'title'; G.state = 'settings'; }
        }
        G.mf = G.mf || {}; G.mf[id] = lerp(G.mf[id] || 0, f ? 1 : 0, .18);
        const k = G.mf[id];
        ctx.save(); ctx.globalAlpha = clamp(e, 0, 1); ctx.translate(-(1 - e) * 60 + k * 14, 0);
        if (k > .02) { // marcador (losango) e linha que cresce
          ctx.save(); ctx.translate(X0 - 24, y + size * .55); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#ffb340'; ctx.shadowColor = '#ffb340'; ctx.shadowBlur = 14 * k; ctx.fillRect(-6, -6, 12, 12); ctx.restore();
          ctx.fillStyle = lin(X0, 0, X0 + w, 0, [[0, 'rgba(255,179,64,.9)'], [1, 'rgba(255,179,64,0)']]); ctx.fillRect(X0, y + size + 8, w * k, 3);
        }
        ctx.save(); if (k > .1) { ctx.shadowColor = 'rgba(139,77,255,.95)'; ctx.shadowBlur = 24 * k; }
        txt(label, X0, y, size, f ? '#ffffff' : '#a99fd6', 'left', 900); ctx.restore();
        if (sub) { ctx.save(); ctx.font = '900 ' + size + 'px ' + FONT; const lw = ctx.measureText(label).width; ctx.restore(); txt(sub, X0 + lw + 18, y + (size > 40 ? 6 : 8), 20, '#ffcf6b', 'left', 800); }
        ctx.restore();
      });
      ctx.globalAlpha = .55; txt('↑ ↓  navegar     ENTER  escolher', X0 + 2, 604, 15, '#8f84c4', 'left', 700); ctx.globalAlpha = 1;
    } else if (tt > 2.3 && !Snd.ready) { ctx.globalAlpha = .5 + .5 * Math.sin(t * 4); txt('PRESSIONE QUALQUER TECLA', X0 + 4, 330, 22, '#e2d4ff', 'left', 800); ctx.globalAlpha = 1; }
    txt('olien.digital', X0 + 4, H - bh - 34, 15, '#8f84c4', 'left', 800);
    txt(Save.data.unlocked >= 7 ? 'Parte 3 — O Outro Lado' : Save.data.unlocked >= 5 ? 'Parte 2 — O Coração do Vazio' : 'Parte 1 — O Coração Partido', W - 44, H - bh - 34, 15, '#a89dd8', 'right', 800);
    // vinheta, barras de cinema e fade inicial
    ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    if (tt < 1.6) { ctx.globalAlpha = 1 - easeOut(tt / 1.6); ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  },

  // glifo de cada arma (icone dos cartoes do hangar)
  weaponGlyph(id, x, y, c, t) {
    ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, 44, c, .5); ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = c; ctx.fillStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineWidth = 5;
    if (id === 'violet') for (const dx of [-14, 0, 14]) { ctx.beginPath(); ctx.moveTo(dx, 16 - ((t * 40 + dx) % 10)); ctx.lineTo(dx, -14); ctx.stroke(); }
    else if (id === 'fan') for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .38; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8, 14 + Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 30, 14 + Math.sin(a) * 30); ctx.stroke(); }
    else if (id === 'laser') { ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, -24); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, -24); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, -2, 15 + Math.sin(t * 5) * 1.5, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  },

  hangar() {
    const t = World.t, ld = Save.data.loadout, own = Save.data.owned, orbiOK = !!Save.data.cleared[3], isO = ld.char === 'orbi' && orbiOK;
    if (UI.button('pOl', 70, 36, 180, 40, 'OLIENZINHO', { size: 15, color: !isO ? '#9a63ff' : undefined })) { ld.char = 'olien'; Save.save(); }
    if (UI.button('pOr', 262, 36, 130, 40, orbiOK ? 'ORBI' : 'ORBI 🔒', { size: 15, disabled: !orbiOK, color: isO ? '#9a63ff' : undefined })) { ld.char = 'orbi'; Save.save(); }
    if (!orbiOK) txt('zere a Parte 1 para liberar o Orbi', 408, 46, 13, '#8a7fb0', 'left', 700);
    if (isO) { this.hangarOrbi(); return; }
    txt('HANGAR', W / 2, 26, 42, '#fff', 'center'); txt(this.stars(), W - 40, 36, 30, '#ffcf6b', 'right');
    txt('ARMAS', 74, 92, 18, '#ffb340', 'left', 900);
    { const np = Math.ceil(WEAPON_ORDER.length / 4); if (np > 1) { txt('PÁGINA ' + (((G.wpage || 0) % np) + 1) + '/' + np, 470, 94, 13, '#8a7fb0', 'right', 800); if (UI.button('wpL', 484, 86, 44, 28, '◀', { size: 14 })) G.wpage = ((G.wpage || 0) + np - 1) % np; if (UI.button('wpR', 536, 86, 44, 28, '▶', { size: 14 })) G.wpage = ((G.wpage || 0) + 1) % np; } }
    const wp0 = ((G.wpage || 0) % Math.ceil(WEAPON_ORDER.length / 4)) * 4;
    WEAPON_ORDER.slice(wp0, wp0 + 4).forEach((id, i) => {
      const w = WEAPONS[id], x = 70, y = 118 + i * 104, cw = 580, ch = 94, has = !!own.weapons[id], eq = ld.weapon === id, fid = 'w_' + id, f = UI.focus(fid);
      const ek = Screens.enterK(i); ctx.save(); ctx.translate((1 - ek) * -80, 0); ctx.globalAlpha = clamp(ek, 0, 1);
      if (UI.hit(fid, x, y, has ? cw - 180 : cw, ch, { sound: 'buy' })) {
        if (has) { ld.weapon = id; Save.save(); }
        else if (Save.data.coins >= w.price) { Save.data.coins -= w.price; own.weapons[id] = true; ld.weapon = id; Save.save(); }
        else Snd.play('uiDeny');
      }
      ctx.save(); if (f) { ctx.shadowColor = w.c; ctx.shadowBlur = 24; }
      UI.panel(x, y, cw, ch, { fill: eq ? 'rgba(60,34,140,.88)' : f ? 'rgba(50,28,120,.8)' : 'rgba(20,8,55,.72)', stroke: eq ? w.c : f ? '#e2d4ff' : 'rgba(190,160,255,.3)', r: 18 }); ctx.restore();
      this.weaponGlyph(id, x + 56, y + 47, w.c, t);
      txt(w.name, x + 112, y + 12, 24, '#fff'); txt(w.desc, x + 112, y + 42, 15, '#cdb8ff', 'left', 700);
      txt('Especial: ' + w.specName, x + 112, y + 66, 14, w.c, 'left', 800);
      if (eq) txt('EQUIPADA', x + cw - 20, y + 14, 16, '#7fe0a0', 'right'); else if (has) txt('equipar', x + cw - 20, y + 14, 15, '#8a7fb0', 'right', 700);
      else txt('★ ' + w.price, x + cw - 20, y + 12, 24, Save.data.coins >= w.price ? '#ffcf6b' : '#7a70a0', 'right');
      if (has) { // evolucao da arma
        const lv = Visual5.wl(id), maxed = lv >= 5, cost = Visual5.wCost(lv), ex = x + cw - 168, ey = y + 48, eid = 'wu_' + id, ef = UI.focus(eid);
        if (UI.hit(eid, ex, ey, 150, 36, { sound: 'buy', disabled: maxed })) { if (Save.data.coins >= cost) { Save.data.coins -= cost; Save.data.wlevel[id] = lv + 1; Save.save(); Snd.play('levelUp'); Ach.check(); } else Snd.play('uiDeny'); }
        ctx.fillStyle = maxed ? 'rgba(255,211,106,.25)' : ef ? '#9a63ff' : Save.data.coins >= cost ? 'rgba(90,50,190,.95)' : 'rgba(50,30,100,.8)'; ctx.beginPath(); ctx.roundRect(ex, ey, 150, 36, 12); ctx.fill();
        txt(maxed ? 'NÍVEL MÁXIMO' : 'EVOLUIR  ★' + cost, ex + 75, ey + 18, 14, '#fff', 'center', 900, 'middle');
        for (let k = 0; k < 5; k++) { ctx.fillStyle = k < lv ? w.c : 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.arc(ex + 22 + k * 26, ey - 9, 5, 0, TAU); ctx.fill(); }
      }
      ctx.restore();
    });
    // direita: nave e skins
    const sk = SKINS[G.skinIdx || 0], unlocked = sk.ok(), eqs = ld.skin === sk.id;
    UI.panel(700, 92, 520, 430, { r: 24 });
    txt('SKINS', 726, 110, 18, '#ffb340', 'left', 900);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(960, 290, 230, sk.pal.glow, .4); ctx.restore(); ctx.globalAlpha = 1;
    ctx.save(); ctx.globalAlpha = unlocked ? 1 : .35;
    Art.ship(960, 290 + Math.sin(t * 1.6) * 8, { vx: Math.sin(t * .8) * 80, t, pal: sk.pal, scale: 1.55 * (1 + .22 * Math.max(0, 1 - (World.t - (G.skinPop || -9)) * 3.5)), boost: .4, lookx: clamp((Input.mouse.x - 960) / 400, -1, 1), looky: clamp((Input.mouse.y - 290) / 400, -1, 1), blinkT: this.blinkAt(t) });
    ctx.restore();
    if (!unlocked) this.lock(960, 290, 2);
    txt(sk.name, 960, 440, 28, '#fff', 'center');
    txt(unlocked ? (eqs ? 'EQUIPADA' : 'liberada') : '🔒 ' + sk.how, 960, 478, 16, unlocked ? '#7fe0a0' : '#ffb340', 'center', 800);
    const n = SKINS.length;
    if (UI.button('skL', 726, 250, 54, 80, '◀', { size: 30 })) { G.skinIdx = (G.skinIdx + n - 1) % n; G.skinPop = World.t; }
    if (UI.button('skR', 1140, 250, 54, 80, '▶', { size: 30 })) { G.skinIdx = (G.skinIdx + 1) % n; G.skinPop = World.t; }
    if (unlocked && !eqs && (UI.hit('skEquip', 870, 486, 180, 30))) { ld.skin = sk.id; Save.save(); Snd.play('buy'); }
    if (unlocked && !eqs) { ctx.fillStyle = UI.focus('skEquip') ? '#9a63ff' : 'rgba(70,40,150,.9)'; ctx.beginPath(); ctx.roundRect(870, 486, 180, 30, 15); ctx.fill(); txt('EQUIPAR', 960, 501, 15, '#fff', 'center', 900, 'middle'); }
    if (UI.button('back', W / 2 - 160, 600, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goSelect(); }
    const wp = WEAPONS[ld.weapon];
    txt('Arma equipada: ' + wp.name + '  •  Especial (Q): ' + wp.specName + ' — ' + wp.specDesc, W / 2, 556, 16, '#cdb8ff', 'center', 700);
  },

  lock(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#cdb8ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -8, 11, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#cdb8ff'; ctx.beginPath(); ctx.roundRect(-16, -8, 32, 26, 5); ctx.fill();
    ctx.fillStyle = '#2a1478'; ctx.beginPath(); ctx.arc(0, 4, 4, 0, 7); ctx.fill(); ctx.restore();
  },

  // ---- pecas do estilo cinematografico (barras, itens de menu em texto) ----
  bars() {
    const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); v.addColorStop(0, 'rgba(3,1,11,0)'); v.addColorStop(1, 'rgba(3,1,11,.55)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, 56); ctx.fillRect(0, H - 56, W, 56);
    txt(this.stars(), W - 40, 12, 28, '#ffcf6b', 'right');
  },
  menuW(label, size) { ctx.save(); ctx.font = '900 ' + size + 'px ' + FONT; const w = ctx.measureText(label).width; ctx.restore(); return w; },
  menuItem(id, label, x, y, size, sub, o = {}) {
    const w = this.menuW(label, size), f = UI.focus(id), dis = !!o.disabled;
    const fired = UI.hit(id, x - 18, y - 8, w + 36 + (sub ? 130 : 0), size + 20, { disabled: dis });
    G.mf = G.mf || {}; G.mf[id] = lerp(G.mf[id] || 0, f ? 1 : 0, .18); const k = G.mf[id];
    ctx.save(); ctx.translate(k * 10, 0);
    if (k > .02) {
      ctx.save(); ctx.translate(x - 20, y + size * .55); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#ffb340'; ctx.shadowColor = '#ffb340'; ctx.shadowBlur = 14 * k; ctx.fillRect(-5, -5, 10, 10); ctx.restore();
      ctx.fillStyle = lin(x, 0, x + w, 0, [[0, 'rgba(255,179,64,.9)'], [1, 'rgba(255,179,64,0)']]); ctx.fillRect(x, y + size + 6, w * k, 3);
    }
    ctx.save(); if (k > .1) { ctx.shadowColor = 'rgba(139,77,255,.95)'; ctx.shadowBlur = 24 * k; }
    txt(label, x, y, size, dis ? '#5a5080' : f ? '#ffffff' : '#a99fd6', 'left', 900); ctx.restore();
    if (sub) txt(sub, x + w + 14, y + size * .22, Math.max(14, size * .5), '#ffcf6b', 'left', 800);
    ctx.restore(); return fired;
  },

  select() {
    const t = World.t, unlocked = Save.data.unlocked, s = STAGES[G.sel], locked = G.sel >= unlocked;
    const nS = STAGES.length, pos = i => [nS > 6 ? 96 + i * 136 : 150 + i * 196, 408 + (i % 2 ? 36 : -18)];
    // cabecalho do setor escolhido
    ctx.fillStyle = '#ffb340'; ctx.fillRect(88, 92, 64, 4);
    txt('SETOR ' + (G.sel + 1) + ' DE ' + STAGES.length, 90, 104, 17, locked ? '#8a7fb0' : s.tint, 'left', 900);
    ctx.save(); ctx.shadowColor = locked ? '#5a4a90' : s.tint; ctx.shadowBlur = 30; txt(locked ? '???' : s.name.toUpperCase(), 86, 128, 58, '#fff', 'left', 900); ctx.restore();
    UI.wrap(locked ? 'Derrote o chefe do setor anterior para desbloquear.' : s.desc, 90, 204, 760, 28, 21, '#cdb8ff');
    txt('CHEFE', 90, 262, 14, '#ff8a5f', 'left', 900); txt(locked ? '???' : s.bossName, 90, 282, 26, '#fff');
    txt('MELHOR', 420, 262, 14, '#ffcf6b', 'left', 900); txt((Save.data.best[G.sel] || 0) + ' pts', 420, 282, 26, '#fff');
    const gr = Save.data.grades[G.sel]; txt('NOTA', 640, 262, 14, '#7fe0a0', 'left', 900); txt(gr === undefined ? '-' : 'CBAS'[gr], 640, 282, 26, '#fff');
    // trilha
    ctx.save(); ctx.strokeStyle = 'rgba(190,160,255,.4)'; ctx.lineWidth = 4; ctx.setLineDash([4, 14]); ctx.lineCap = 'round';
    ctx.beginPath(); STAGES.forEach((st, i) => { const [x, y] = pos(i); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.restore();
    STAGES.forEach((st, i) => {
      const [x, y0] = pos(i), lk = i >= unlocked, sel = i === G.sel, y = y0 + (sel ? Math.sin(t * 3) * 5 : 0), R = sel ? (nS > 6 ? 50 : 56) : (nS > 6 ? 38 : 44);
      if (UI.hit('stage' + i, x - R, y - R, R * 2, R * 2, { disabled: false })) { if (!lk) { Game.enter(i); return; } Snd.play('uiDeny'); }
      if (UI.focus('stage' + i) && G.sel !== i) { G.sel = i; World.setStage(STAGES[i].pal); }
      ctx.save(); ctx.translate(x, y);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.4, lk ? '#5a4a90' : st.tint, sel ? .6 : .3); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const g = ctx.createRadialGradient(-R * .35, -R * .35, 4, 0, 0, R);
      if (lk) { g.addColorStop(0, '#6a5aa0'); g.addColorStop(1, '#241a50'); } else { g.addColorStop(0, '#ffffff'); g.addColorStop(.35, st.tint); g.addColorStop(1, '#1a0840'); }
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
      ctx.strokeStyle = lk ? 'rgba(190,160,255,.3)' : '#e2d4ff'; ctx.lineWidth = sel ? 4 : 2; ctx.stroke();
      if (i % 2 === 0) { ctx.strokeStyle = 'rgba(226,212,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.55, R * .4, -.35, 0, TAU); ctx.stroke(); }
      if (lk) this.lock(0, 0, 1.1); else txt(String(i + 1), 0, 0, 36, '#fff', 'center', 900, 'middle');
      ctx.restore();
      if (sel) Art.ship(x, y - R - 40, { vx: 0, t, scale: .5, blinkT: 0, lookx: 0, looky: .5 });
      if (Save.data.cleared[i]) txt('CBAS'[Save.data.grades[i] || 0], x, y + R + 10, 22, '#ffcf6b', 'center', 900);
    });
    // menu em texto
    let x = 90;
    if (this.menuItem('go', locked ? 'BLOQUEADA' : 'JOGAR', x, 580, 44, '', { disabled: locked })) { Game.enter(G.sel); return; }
    x += this.menuW(locked ? 'BLOQUEADA' : 'JOGAR', 44) + 56;
    const row = [['hang', 'HANGAR', () => { G.skinIdx = Math.max(0, SKINS.findIndex(q => q.id === Save.data.loadout.skin)); G.state = 'hangar'; }], ['shop2', 'LOJA', () => { G.shopBack = 'select'; G.state = 'shop'; }], ['codex', 'CODEX', () => { G.codexTab = 0; G.codexPage = 0; G.state = 'codex'; }], ['orbi', 'ORBI', () => { G.state = 'chatOrbi'; }]];
    for (const [id, lb, fn] of row) { if (this.menuItem(id, lb, x, 592, 24, '')) fn(); x += this.menuW(lb, 24) + 44; }
    if (this.menuItem('back', 'VOLTAR', W - 90 - this.menuW('VOLTAR', 24), 592, 24, '') || Input.pressed('escape')) { Snd.play('uiBack'); Game.goTitle(); }
    this.bars();
  },

  shop() {
    ctx.fillStyle = '#ffb340'; ctx.fillRect(88, 66, 64, 4);
    txt('MELHORIAS PERMANENTES PARA TODAS AS FASES', 90, 76, 16, '#cdb8ff', 'left', 800);
    ctx.save(); ctx.shadowColor = '#8b4dff'; ctx.shadowBlur = 28; txt('LOJA DO OLIENZINHO', 86, 108, 46, '#fff', 'left', 900); ctx.restore();
    SHOP_ITEMS.forEach((it, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 80 + col * 560, y = 176 + row * 106, w = 540, h = 98;
      const lv = shopLevel(it.id), maxed = lv >= it.max, cost = maxed ? 0 : it.cost(lv), can = !maxed && Save.data.coins >= cost;
      const id = 'item' + it.id, f = UI.focus(id);
      if (UI.hit(id, x, y, w, h, { sound: 'buy' })) {
        if (can) { Save.data.coins -= cost; Save.data.shop[it.id] = lv + 1; Save.save(); G.buyFlash = { id, t: 0 }; }
        else { Snd.play('uiDeny'); }
      }
      ctx.save();
      if (f) { ctx.shadowColor = it.col; ctx.shadowBlur = 24; }
      UI.panel(x, y, w, h, { fill: f ? 'rgba(60,30,140,.85)' : 'rgba(20,8,55,.72)', stroke: f ? '#e2d4ff' : 'rgba(190,160,255,.35)', r: 18 });
      ctx.restore();
      ctx.fillStyle = it.col; ctx.beginPath(); ctx.roundRect(x + 14, y + 14, 8, h - 28, 4); ctx.fill();
      { const bt = G.buyFlash && G.buyFlash.id === id ? G.buyFlash.t : 9, pop = 1 + Math.max(0, .5 - bt) * .9, ic = { luck: 'lucky' }[it.id] || it.id; ctx.save(); ctx.translate(0, 0); Visual2.upIcon(ic, x + 66, y + h / 2, 21 * pop, it.col, f); ctx.restore(); }
      txt(it.name, x + 108, y + 14, 26, '#fff'); txt(it.desc, x + 108, y + 48, 16, '#cdb8ff', 'left', 700);
      for (let k = 0; k < it.max; k++) { ctx.fillStyle = k < lv ? it.col : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.roundRect(x + 108 + k * 22, y + 74, 18, 8, 4); ctx.fill(); }
      const bf = G.buyFlash && G.buyFlash.id === id ? 1 - G.buyFlash.t * 2.5 : 0;
      if (bf > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = bf * .5; ctx.fillStyle = it.col; ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.fill(); ctx.restore(); G.buyFlash.t += .016; }
      if (maxed) txt('MÁXIMO', x + w - 24, y + 36, 26, '#ffe9a8', 'right');
      else txt('★ ' + cost, x + w - 24, y + 36, 28, can ? '#ffcf6b' : '#7a70a0', 'right');
    });
    if (this.menuItem('back', 'VOLTAR', 90, 606, 28, '') || Input.pressed('escape')) {
      Snd.play('uiBack');
      if (G.shopBack === 'select') Game.goSelect(); else if (G.shopBack === 'clear') G.state = 'clear'; else if (G.shopBack === 'over') G.state = 'over'; else Game.goTitle();
    }
    this.bars();
  },

  settings() {
    const s = Save.data.settings;
    UI.panel(300, 70, 680, 560);
    txt('OPÇÕES', W / 2, 92, 40, '#fff', 'center');
    txt('MÚSICA  ' + Math.round(s.music * 100) + '%', 360, 170, 22, '#e2d4ff');
    const m = UI.slider('music', 360, 215, 560, s.music);
    txt('EFEITOS SONOROS  ' + Math.round(s.sfx * 100) + '%', 360, 258, 22, '#e2d4ff');
    const e = UI.slider('sfx', 360, 303, 560, s.sfx);
    txt('DIFICULDADE', 360, 346, 22, '#e2d4ff');
    DIFF.forEach((d, i) => { if (UI.button('diff' + i, 360 + i * 192, 382, 176, 44, d.name, { size: 18, color: (s.diff ?? 1) === i ? '#9a63ff' : undefined })) { s.diff = i; Save.save(); } });
    UI.wrap(DIFF[s.diff ?? 1].desc, 360, 436, 560, 22, 15, '#cdb8ff');
    if (m !== s.music || e !== s.sfx) {
      const sfxChanged = e !== s.sfx; s.music = m; s.sfx = e; Snd.setVolumes(s.sfx, s.music); Save.save();
      if (sfxChanged && !G.sfxTest) { Snd.play('explode', { size: .5 }); G.sfxTest = 10; }
    }
    if (G.sfxTest) G.sfxTest--;
    const sure = G.confirmReset;
    if (UI.button('reset', 360, 490, 560, 46, sure ? 'TEM CERTEZA? CLIQUE DE NOVO' : 'APAGAR PROGRESSO', { size: 20, color: '#c2185b' })) {
      if (sure) { Save.reset(); G.confirmReset = false; Snd.setVolumes(Save.data.settings.sfx, Save.data.settings.music); G.sel = 0; } else G.confirmReset = true;
    }
    if (UI.button('back', 360, 552, 560, 44, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) {
      G.confirmReset = false; Snd.play('uiBack');
      if (G.setBack === 'pause') G.state = 'pause'; else Game.goTitle();
    }
  },

  pause() {
    this.dim(.6);
    txt('PAUSADO', W / 2, 190, 64, '#fff', 'center');
    if (UI.button('resume', W / 2 - 190, 290, 380, 62, 'CONTINUAR', { size: 28, color: '#9a63ff' }) || ((Input.pressed('escape') || Input.pressed('p')) && !G.pausedThisFrame)) { G.state = 'play'; Snd.play('uiSelect'); }
    if (UI.button('opt', W / 2 - 190, 368, 380, 56, 'OPÇÕES', { size: 24 })) { G.setBack = 'pause'; G.state = 'settings'; }
    if (UI.button('quit', W / 2 - 190, 440, 380, 56, 'SAIR PARA O MAPA', { size: 22, sub: 'as estrelas coletadas ficam com você' })) Game.quitRun();
  },

  levelup() {
    this.dim(.72);
    txt('SUBIU DE NÍVEL!', W / 2, 110, 70, '#fff', 'center');
    txt('NÍVEL ' + G.level, W / 2, 190, 26, '#ffb340', 'center', 800);
    const cw = 330, ch = 300, gap = 36, x0 = W / 2 - (cw * 3 + gap * 2) / 2, y0 = 250;
    G.options.forEach((u, i) => {
      const x = x0 + i * (cw + gap), rar = RARITY[u.r], id = 'up' + i, f = UI.focus(id);
      if (UI.hit(id, x, y0, cw, ch) || Input.pressed(String(i + 1))) { Game.chooseUpgrade(i); return; }
      ctx.save(); if (f) { ctx.shadowColor = rar.c; ctx.shadowBlur = 36; }
      const g = ctx.createLinearGradient(0, y0, 0, y0 + ch); g.addColorStop(0, f ? '#4b2bd6' : '#2f1782'); g.addColorStop(1, '#14083a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y0, cw, ch, 22); ctx.fill();
      ctx.strokeStyle = f ? '#fff' : rar.c; ctx.lineWidth = f ? 4 : 2; ctx.stroke(); ctx.restore();
      ctx.fillStyle = rar.c; ctx.beginPath(); ctx.roundRect(x, y0, cw, 8, [22, 22, 0, 0]); ctx.fill();
      txt(rar.name, x + cw / 2, y0 + 26, 15, rar.c, 'center', 900);
      txt(String(i + 1), x + 18, y0 + 24, 22, '#8a7fb0');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x + cw / 2, y0 + 96, 60, rar.c, .7); ctx.restore(); ctx.globalAlpha = 1;
      Visual2.upIcon(u.id, x + cw / 2, y0 + 96, 30, rar.c, f); Visual11.chipDraw(u.id, x + cw / 2, y0 + 42);
      txt(u.name, x + cw / 2, y0 + 150, 26, '#fff', 'center');
      UI.wrap(u.desc, x + cw / 2, y0 + 194, cw - 44, 24, 18, '#cdb8ff', 'center');
      const have = G.upCounts[u.id] || 0;
      if (u.max < 90) txt('Nível ' + have + ' → ' + (have + 1) + (u.max < 90 ? ' / ' + u.max : ''), x + cw / 2, y0 + ch - 34, 16, rar.c, 'center', 800);
    });
    txt('Clique, aperte 1 / 2 / 3 ou use as setas + Enter', W / 2, 590, 18, '#8a7fb0', 'center', 700);
  },

  clear() {
    const r = G.result, t = World.t - (G.clearAt ?? World.t); this.dim(.72);
    txt('FASE COMPLETA!', W / 2, 60, 76, '#ffe9a8', 'center');
    txt(G.stage.name, W / 2, 148, 26, '#fff', 'center');
    UI.panel(230, 200, 820, 320);
    const rows = [['Pontuação', r.score + ' pts'], ['Inimigos derrotados', String(r.kills)], ['Maior combo', String(r.maxCombo)], ['Dano sofrido', r.hits === 0 ? 'nenhum!' : r.hits + ' golpes'], ['Nível alcançado', String(r.level)], ['Estrelas coletadas', '★ ' + r.coins], ['Bônus da nota', '★ ' + r.bonus]];
    rows.forEach(([a, b], i) => { const e = easeOut((t - .15 - i * .12) / .3); ctx.globalAlpha = clamp(e, 0, 1); txt(a, 266 + (1 - e) * -30, 226 + i * 40, 21, '#cdb8ff', 'left', 700); txt(b, 640, 224 + i * 40, 24, i > 4 ? '#ffcf6b' : (i === 3 && r.hits === 0 ? '#7fe0a0' : '#fff'), 'right'); });
    ctx.globalAlpha = 1;
    // carimbo da nota
    const cols = { S: '#ffd36a', A: '#7fe0a0', B: '#7fc4ff', C: '#c8b8e8' }, gc = cols[r.grade], k = easeBack((t - 1.3) / .45);
    if (t > 1.3) {
      if (!G.stamped) { G.stamped = true; Snd.play('stamp'); shake(6); }
      ctx.save(); ctx.translate(850, 340); ctx.rotate(-.12); const sc = k * (1 + Math.max(0, (1.75 - t)) * 1.4); ctx.scale(sc, sc);
      ctx.globalAlpha = clamp((t - 1.3) / .15, 0, 1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 170, gc, .6); ctx.restore(); ctx.globalAlpha = 1;
      ctx.strokeStyle = gc; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 100, 0, TAU); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 112, 0, TAU); ctx.stroke();
      ctx.save(); ctx.shadowColor = gc; ctx.shadowBlur = 30; txt(r.grade, 0, 4, 140, gc, 'center', 900, 'middle'); ctx.restore();
      txt('NOTA', 0, -120, 18, gc, 'center', 900);
      ctx.restore();
    }
    if (r.best === r.score) txt('NOVO RECORDE!', 640, 540, 18, '#ffb340', 'center');
    const last = G.stageIdx === 5 || G.stageIdx + 1 >= STAGES.length;
    if (UI.button('next', 340, 570, 300, 62, last ? 'VER O FINAL' : 'PRÓXIMA FASE', { size: 26, color: '#9a63ff', sub: last ? 'você zerou tudo!' : '' })) { G.stamped = false; if (last) { G.victT = undefined; G.state = 'victory'; } else { G.sel = G.stageIdx + 1; Game.goSelect(); } }
    if (UI.button('shop', 660, 570, 280, 62, 'LOJA', { size: 24, sub: this.stars() })) { G.shopBack = 'clear'; G.state = 'shop'; }
  },

  rank() {
    txt('RANKING', W / 2, 36, 56, '#fff', 'center'); txt('Modo Infinito  •  melhor onda: ' + (Save.data.bestWave || 0), W / 2, 112, 20, '#ffb340', 'center', 800);
    UI.panel(280, 160, 720, 400);
    const rk = Save.data.rank || [];
    txt('#', 320, 176, 16, '#8a7fb0', 'left', 800); txt('PONTOS', 380, 176, 16, '#8a7fb0', 'left', 800); txt('ONDA', 640, 176, 16, '#8a7fb0', 'left', 800); txt('INIMIGOS', 740, 176, 16, '#8a7fb0', 'left', 800); txt('DATA', 960, 176, 16, '#8a7fb0', 'right', 800);
    if (!rk.length) txt('Ninguém no ranking ainda. Que tal tentar o Modo Infinito?', W / 2, 340, 22, '#cdb8ff', 'center', 700);
    rk.forEach((e, i) => { const y = 206 + i * 34, c = i === 0 ? '#ffd36a' : i < 3 ? '#e2d4ff' : '#cdb8ff'; txt(String(i + 1), 320, y, 22, c, 'left', 900); txt(String(e.score), 380, y, 22, '#fff', 'left'); txt(String(e.wave), 640, y, 22, c); txt(String(e.kills), 740, y, 22, c); txt(e.d || '', 960, y + 3, 16, '#8a7fb0', 'right', 700); });
    if (UI.button('back', W / 2 - 160, 600, 320, 58, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goTitle(); }
  },

  over() {
    const r = G.result; this.dim(.75);
    if (G.endless) {
      txt(G.daily ? 'DESAFIO ENCERRADO' : 'FIM DA LINHA', W / 2, 90, G.daily ? 64 : 74, '#ffb340', 'center');
      txt(G.daily ? 'Seu melhor de hoje: ' + Extras.dailyBest() + ' pts' : G.rankPos <= 10 && G.rankPos > 0 ? 'Você entrou no ranking: ' + G.rankPos + 'º lugar!' : 'O Vazio venceu desta vez.', W / 2, 180, 24, '#cdb8ff', 'center', 700);
      UI.panel(400, 230, 480, 230);
      [['Onda alcançada', String(r.wave)], ['Pontuação', r.score + ' pts'], ['Inimigos derrotados', String(r.kills)], ['Estrelas guardadas', '★ ' + r.coins]].forEach(([a, b], i) => { txt(a, 436, 256 + i * 46, 22, '#cdb8ff', 'left', 700); txt(b, 844, 254 + i * 46, 26, i > 2 ? '#ffcf6b' : '#fff', 'right'); });
      if (UI.button('retry', 300, 500, 300, 62, 'TENTAR DE NOVO', { size: 24, color: '#9a63ff' })) { if (G.daily) Game.startDaily(); else Game.startEndless(); }
      if (UI.button('rk', 620, 500, 180, 62, 'RANKING', { size: 22 })) G.state = 'rank';
      if (UI.button('menu', 820, 500, 160, 62, 'MENU', { size: 22 })) Game.goTitle();
      return;
    }
    txt('NAVE DESTRUÍDA', W / 2, 100, 74, '#ff7ac8', 'center');
    txt('O Olienzinho vai tentar de novo.', W / 2, 190, 24, '#cdb8ff', 'center', 700);
    UI.panel(400, 240, 480, 190);
    [['Pontuação', r.score + ' pts'], ['Inimigos derrotados', String(r.kills)], ['Estrelas guardadas', '★ ' + r.coins]].forEach(([a, b], i) => { txt(a, 436, 266 + i * 50, 22, '#cdb8ff', 'left', 700); txt(b, 844, 264 + i * 50, 26, i > 1 ? '#ffcf6b' : '#fff', 'right'); });
    if (UI.button('retry', 320, 480, 300, 62, 'TENTAR DE NOVO', { size: 24, color: '#9a63ff' })) Game.enter(G.stageIdx, { skipStory: true });
    if (UI.button('shop', 640, 480, 140, 62, 'LOJA', { size: 22 })) { G.shopBack = 'over'; G.state = 'shop'; }
    if (UI.button('map', 800, 480, 160, 62, 'MAPA', { size: 22 })) Game.goSelect();
    txt('Dica: gaste as estrelas na loja para ficar mais forte.', W / 2, 570, 18, '#8a7fb0', 'center', 700);
  },
};
