'use strict';
// ---------- 63: letras com pop, estante de trofeus, cenas pintadas, chefes que respiram, tiros legiveis, formas para daltonismo, portal de fase,
// hangar com tiros, clima com raios, cursor e toque ----------
const Visual63 = { tp: null, shelf: { sel: 0 }, flash: 0, nextFlash: 0, bolt: null, cur: [], rip: [], hs: [], hsT: 0 };
const ok63 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const h63 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- 1. dialogos: a ultima letra digitada da um pequeno pop ----------
{
  const ty = Screens.typed;
  Screens.typed = function (lines, shown, x, y, lh, size, color, align = 'left', weight = 700) {
    ty.call(this, lines, shown, x, y, lh, size, color, align, weight); if (QL() < 1 || !lines || !lines.length) return;
    const key = lines.join('|'), now = performance.now() / 1000, T = Visual63.tp;
    if (!T || T.key !== key || T.shown !== shown) Visual63.tp = { key, shown, t: now }; const age = now - Visual63.tp.t; if (age > .16) return;
    let left = shown, yy = y; for (const ln of lines) { if (left <= 0) return; if (left <= ln.length) {
      ctx.font = `${weight} ${size}px ${FONT}`; const x0 = align === 'center' ? x - ctx.measureText(ln).width / 2 : x, ch = ln[left - 1]; if (!ch || ch === ' ') return;
      const px = x0 + ctx.measureText(ln.slice(0, left - 1)).width, cw = ctx.measureText(ch).width, k = 1 + (1 - age / .16) * .7;
      ctx.save(); ctx.globalAlpha = 1 - age / .16; ctx.translate(px + cw / 2, yy + size * .5); ctx.scale(k, k); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, size * .9, '#ffe9a8', .6); ctx.globalCompositeOperation = 'source-over'; txt(ch, -cw / 2, -size * .5, size, '#ffffff', 'left', weight); ctx.restore(); return;
    } left -= ln.length + 1; yy += lh; }
  };
}

// ---------- 2. estante de trofeus: tela nova com os trofeus girando ----------
{
  const ac = Screens.achievements;
  Screens.achievements = function () {
    const r = ac.call(this); if (QL() >= 1 && UI.button('shelfbtn', W - 210, 16, 190, 40, 'ESTANTE', { size: 18, color: '#9a63ff' })) { G.state = 'shelf'; Snd.play('uiSelect'); } return r;
  };
  Screens.shelf = function () {
    const t = World.t, L = (typeof ACH !== 'undefined' ? ACH : []), got = Save.data.ach || {}, cols = 7, cw = 160, ch = 175, x0 = W / 2 - cols * cw / 2 + cw / 2;
    ctx.fillStyle = 'rgba(8,3,26,.82)'; ctx.fillRect(0, 0, W, H);
    txt('ESTANTE DE TROFÉUS', W / 2, 24, 44, '#fff', 'center', 900); const n = L.filter(a => got[a.id]).length; txt(n + ' de ' + L.length + ' conquistados', W / 2, 78, 18, '#ffe9a8', 'center', 800);
    const perPage = cols * 3, pages = Math.max(1, Math.ceil(L.length / perPage)), pg = Visual63.shelf.sel = clamp(Visual63.shelf.sel, 0, pages - 1);
    L.slice(pg * perPage, pg * perPage + perPage).forEach((a, i) => {
      const cx = x0 + (i % cols) * cw, row = (i / cols) | 0, by = 125 + row * 165, has = !!got[a.id], c = has ? '#ffd36a' : '#4a4070', sx = Math.cos(t * 1.1 + i * .7);
      ctx.fillStyle = 'rgba(190,160,255,.18)'; ctx.fillRect(cx - cw / 2 + 8, by + 112, cw - 16, 6); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(cx - cw / 2 + 8, by + 118, cw - 16, 16);
      ctx.save(); ctx.translate(cx, by + 60); ctx.scale(has ? sx : 1, 1);
      if (has) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 70, '#ffd36a', .35); ctx.globalCompositeOperation = 'source-over'; }
      const g = ctx.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, has ? '#fff0b0' : '#5a4f86'); g.addColorStop(.5, c); g.addColorStop(1, has ? '#b8801e' : '#2e2650'); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-26, -34); ctx.lineTo(26, -34); ctx.quadraticCurveTo(26, 12, 0, 20); ctx.quadraticCurveTo(-26, 12, -26, -34); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-28, -18, 12, Math.PI * .5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(28, -18, 12, -Math.PI * .5, Math.PI * .5); ctx.stroke();
      ctx.fillStyle = c; ctx.fillRect(-4, 20, 8, 18); ctx.fillRect(-18, 38, 36, 10);
      if (has) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-18, -30, 6, 38); } ctx.restore();
      txt(a.name, cx, by + 138, 13, has ? '#fff' : '#7a6fa0', 'center', 800);
      if (UI.hit('sh' + i, cx - cw / 2, by, cw, 150) && has) Snd.play('uiSelect');
    });
    if (pages > 1) { if (UI.button('shprev', 420, 650, 140, 44, '◀', { size: 22 })) Visual63.shelf.sel = Math.max(0, pg - 1); txt((pg + 1) + ' / ' + pages, W / 2, 660, 20, '#cdb8ff', 'center', 800); if (UI.button('shnext', 720, 650, 140, 44, '▶', { size: 22 })) Visual63.shelf.sel = Math.min(pages - 1, pg + 1); }
    if (UI.button('shback', 40, 650, 190, 44, 'VOLTAR', { size: 20 }) || Input.pressed('escape')) { G.state = 'achievements'; Snd.play('uiBack'); }
  };
}

// ---------- 3. cenas pintadas por codigo para os momentos-chave ----------
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const r = sb.call(this); const S = G.story, pg = S && this.curPage(S); if (QL() < 1 || !pg || pg.video || !pg.scene) return r; const t = World.t, sc = pg.scene; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (sc === 'lumiFade' || sc === 'lumi') {
      const fade = sc === 'lumiFade' ? clamp(S.t / 6, 0, 1) : 0, cx = W * .66, cy = H * .38, a = 1 - fade * .8; ctx.globalAlpha = a;
      drawGlow(cx, cy, 190, '#ffe9a8', .5); ctx.strokeStyle = '#fff6d0'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 16; i++) { const an = i / 16 * TAU + t * .2, rr = i % 2 ? 36 : 84; ctx.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } ctx.closePath(); ctx.stroke();
      for (let i = 0; i < 30; i++) { const k = (t * .25 + h63(i)) % 1; ctx.globalAlpha = (1 - k) * (.3 + fade * .6); drawGlow(cx + (h63(i + 3) - .5) * 140 + Math.sin(t + i) * 12, cy - k * 280, 5, '#fff3c0', .9); }
    } else if (sc === 'void') {
      const cx = W * .5, cy = H * .36; for (let i = 0; i < 6; i++) { ctx.globalAlpha = .12; ctx.strokeStyle = i % 2 ? '#8a4aff' : '#ff4aa0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(cx, cy, 90 + i * 55, 30 + i * 20, t * (.15 + i * .03) * (i % 2 ? 1 : -1), 0, TAU); ctx.stroke(); }
    } else if (sc === 'launch') {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; for (let i = 0; i < 28; i++) { const an = h63(i) * TAU, k = (t * .9 + h63(i + 4)) % 1, r0 = 120 + k * 700; ctx.globalAlpha = (1 - k) * .45; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * r0, H * .55 + Math.sin(an) * r0 * .6); ctx.lineTo(W / 2 + Math.cos(an) * (r0 + 90), H * .55 + Math.sin(an) * (r0 + 90) * .6); ctx.stroke(); }
    } else if (sc === 'boss') {
      const g = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 800); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,40,60,' + (.12 + .05 * Math.sin(t * 3)) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else if (sc === 'lit') {
      for (let i = 0; i < 5; i++) { const x = W * (.1 + i * .2) + Math.sin(t * .3 + i) * 30; ctx.globalAlpha = .07; ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 50, 0); ctx.lineTo(x + 240, H); ctx.lineTo(x - 80, H); ctx.closePath(); ctx.fill(); }
    }
    ctx.restore(); return r;
  };
}

// ---------- 4. chefes respiram, viram para a nave e encolhem ao levar tiro ----------
{
  const CL = { MotherShip, RockGolem, StormEye, SunGuardian, EchoBoss, VoidBoss, Herald, Leviathan, Mirror, Heart };
  for (const name in CL) {
    const d = CL[name].prototype.draw;
    CL[name].prototype.draw = function () {
      const p = G.player; if (QL() < 1 || !p || this.state === 'dying' || G.state !== 'play' || G.furyCut) return d.call(this);
      const t = World.t, lean = clamp((p.x - this.x) / W, -1, 1) * .05, br = 1 + .014 * Math.sin(t * 2.2) + (this.flash > 0 ? .03 : 0), blink = (t % 5.6) < .14 ? .955 : 1, r = this.ratio;
      if (r < .5 && !this._startle && this.state === 'fight') { this._startle = true; shockwave(this.x, this.y, 260, '#ffffff'); popup(this.x, this.y - (this.rad || 100) - 30, '!', '#ffe9a8', 40); }
      if (this.flash > 0) { this._rx = rand(-2.5, 2.5); this._ry = rand(-1.5, 1.5); } else { this._rx = (this._rx || 0) * .6; this._ry = (this._ry || 0) * .6; }
      if (r < .25 && this.state === 'fight') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(this.x, this.y, (this.rad || 100) * 2.4, '#ff3a2a', .12 + .1 * Math.max(0, Math.sin(t * 8)) ** 4); ctx.restore(); }
      ctx.save(); ctx.translate(this.x + (this._rx || 0), this.y + (this._ry || 0)); ctx.rotate(lean); ctx.scale(br, br * (this.flash > 0 ? .97 : 1) * blink); ctx.translate(-this.x, -this.y); d.call(this); ctx.restore();
    };
  }
}

// ---------- 5 e 6. tiros inimigos legiveis (anel escuro) e formas para daltonismo ----------
{
  const eb = Art.ebullet; let n = 0;
  Art.ebullet = function (b) {
    if (QL() >= 1 && !b.dead && ++n < 140) { const cb = Save.data.settings && Save.data.settings.cbs, r = (b.r || 6) + 4; ctx.save(); ctx.fillStyle = 'rgba(8,2,22,.55)'; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); if (cb) { ctx.moveTo(b.x, b.y - r - 2); ctx.lineTo(b.x + r + 2, b.y); ctx.lineTo(b.x, b.y + r + 2); ctx.lineTo(b.x - r - 2, b.y); ctx.closePath(); } else ctx.arc(b.x, b.y, r, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
    return eb.call(this, b);
  };
  const up = Game.updatePlay; Game.updatePlay = function (dt) { n = 0; return up.call(this, dt); };
}

// ---------- 7. portal ao comecar a fase e ao concluir ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); if (QL() < 1 || G.state !== 'play' || G.t > 1.3 || G.training) return; const k = G.t / 1.3, cx = W / 2, cy = H * .6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; for (let i = 0; i < 36; i++) { const an = i / 36 * TAU, r0 = 60 + k * 500, r1 = r0 + 120 * (1 - k); ctx.globalAlpha = (1 - k) * .5; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0 * .7); ctx.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1 * .7); ctx.stroke(); }
    ctx.globalAlpha = (1 - k) * .7; drawGlow(cx, cy, 260 * (1 - k * .6), '#b98cff', .8); ctx.restore();
  };
  const cl = Screens.clear;
  Screens.clear = function () {
    const r = cl.call(this); if (QL() < 1) return r; const t = World.t, cx = W - 130, cy = 110; ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { ctx.rotate(t * (.4 + i * .2) * (i % 2 ? -1 : 1)); ctx.strokeStyle = i === 1 ? '#ffe9a8' : '#b98cff'; ctx.globalAlpha = .7; ctx.lineWidth = 4; ctx.setLineDash([18, 12]); ctx.beginPath(); ctx.ellipse(0, 0, 70 - i * 14, 70 - i * 14, 0, 0, TAU); ctx.stroke(); }
    ctx.setLineDash([]); drawGlow(0, 0, 90, '#b98cff', .5 + .15 * Math.sin(t * 3)); ctx.restore(); return r;
  };
}

// ---------- 8. hangar: a nave de exibicao atira com a arma escolhida ----------
{
  const hg = Screens.hangar;
  Screens.hangar = function () {
    const r = hg.call(this); if (QL() < 1) return r; const ld = Save.data.loadout || {}, w = WEAPONS[ld.weapon || 'violet'], c = w && ok63(w.c) ? w.c : '#b98cff', S = Visual63.hs, now = World.t;
    if (now - Visual63.hsT > .22) { Visual63.hsT = now; S.push({ x: 420 + rand(-12, 12), y: 290, vy: -520 }); } ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = S.length - 1; i >= 0; i--) { const q = S[i]; q.y += q.vy / 60; if (q.y < 130) { S.splice(i, 1); continue; } ctx.globalAlpha = clamp((q.y - 130) / 60, 0, 1); ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(q.x - 3, q.y - 14, 6, 26, 3); ctx.fill(); drawGlow(q.x, q.y, 18, c, .6); }
    ctx.restore(); return r;
  };
}

// ---------- 9. clima: chuva em camadas, vento e relampagos que iluminam a tela ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (G.state !== 'play' || QL() < 1 || !G.stage) return; const nm = (G.stage.name || '').toLowerCase(); if (!/tempest|chuva|ion|storm|raio/.test(nm)) return;
    const t = World.t, wind = Math.sin(t * .2) * 40; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#bfe4ff'; ctx.lineCap = 'round';
    for (let L = 0; L < 2; L++) for (let i = 0; i < 26 - L * 8; i++) { const sp = 700 + L * 500, x = ((h63(i + L * 40) * (W + 200) + wind * L) % (W + 200)) - 60, y = ((t * sp + h63(i + 9 + L * 40) * H) % (H + 80)) - 40; ctx.globalAlpha = .18 + L * .12; ctx.lineWidth = 1 + L; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10 - wind * .1, y + 26 + L * 12); ctx.stroke(); }
    if (t > Visual63.nextFlash) { Visual63.nextFlash = t + rand(6, 11); Visual63.flash = .35; const x0 = rand(200, W - 200); Visual63.bolt = [[x0, 0]]; let x = x0, y = 0; while (y < H * .8) { y += rand(40, 90); x += rand(-60, 60); Visual63.bolt.push([x, y]); } }
    if (Visual63.flash > 0) { ctx.globalAlpha = Visual63.flash; ctx.fillStyle = '#dfe8ff'; ctx.fillRect(0, 0, W, H); if (Visual63.bolt && Visual63.flash > .15) { ctx.globalAlpha = 1; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); Visual63.bolt.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); } Visual63.flash = Math.max(0, Visual63.flash - 1 / 60 * 1.4); }
    ctx.restore();
  };
}

// ---------- 10. cursor com rastro de estrelas e ondas ao clicar/tocar ----------
{
  const touch = 'ontouchstart' in window;
  addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); Visual63.rip.push({ x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H, t: 0, touch: e.pointerType === 'touch' }); if (Visual63.rip.length > 6) Visual63.rip.shift(); });

  hookRender(rn => function () {
    rn(); const s = G.state; if (QL() < 1 || s === 'cine' || s === 'photo') return; ctx.setTransform(K, 0, 0, K, 0, 0); ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = Visual63.rip.length - 1; i >= 0; i--) { const q = Visual63.rip[i]; q.t += 1 / 60; if (q.t > .45) { Visual63.rip.splice(i, 1); continue; } if (s === 'play' && !q.touch) continue; ctx.globalAlpha = (1 - q.t / .45) * .8; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q.x, q.y, 8 + q.t * 90, 0, TAU); ctx.stroke(); }
    if (!touch && s !== 'play' && !(typeof Visual67 !== 'undefined' && Visual67.pad())) {
      const m = Input.mouse, T = Visual63.cur; T.push([m.x, m.y]); if (T.length > 9) T.shift(); cv.style.cursor = 'none';
      for (let i = 0; i < T.length; i++) { const k = i / T.length; ctx.globalAlpha = k * .5; drawGlow(T[i][0], T[i][1], 4 + k * 8, '#cdb8ff', .8); }
      ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#b98cff'; ctx.shadowBlur = 10; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, r = i % 2 ? 4 : 11; ctx.lineTo(m.x + Math.cos(a) * r, m.y + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  });
}
