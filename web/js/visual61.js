'use strict';
// ---------- 61: companheiro com rastro, itens girando, escudo com reflexo, clima por setor, luz dinamica, camera suave, interface viva,
// conquistas, cenas da historia, creditos e imagem mais nitida ----------
const Visual61 = { trail: [], cam: [0, 0, 0], hb: 0, cr0: null, sp: [] };
const ok61 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const h61 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- 1. companheiro (Orbi): rastro de luz e brilho vermelho quando a nave leva dano ----------
{
  const ob = Art.orbi;
  Art.orbi = function (x, y, o) {
    const r = ob.call(this, x, y, o);
    if (G.state === 'play' && QL() >= 1) {
      const T = Visual61.trail; T.push([x, y]); if (T.length > 14) T.shift();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let i = 1; i < T.length; i++) { const k = i / T.length; ctx.globalAlpha = k * .35; ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 2 + k * 10; ctx.beginPath(); ctx.moveTo(T[i - 1][0], T[i - 1][1]); ctx.lineTo(T[i][0], T[i][1]); ctx.stroke(); }
      const p = G.player; if (p && p.inv > 1) drawGlow(x, y, 70, '#ff3a5a', clamp((p.inv - 1) / .4, 0, 1) * .5);
      ctx.restore();
    }
    return r;
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { Visual61.trail.length = 0; Visual61.hb = 0; return ss.call(this, i, o); };
}

// ---------- 2. itens coletaveis: moeda que gira, coracao que pulsa, rastro em arco ao serem puxados ----------
{
  const pk = Art.pickup;
  Art.pickup = function (k) {
    if (QL() < 1) return pk.call(this, k);
    const t = World.t; ctx.save();
    if (k.type === 'coin') { const sx = .3 + .7 * Math.abs(Math.cos(k.age * 5 + k.x * .01)); ctx.translate(k.x, k.y); ctx.scale(sx, 1); ctx.translate(-k.x, -k.y); }
    else if (k.type === 'heart') { const s = 1 + .12 * Math.sin(t * 7); ctx.translate(k.x, k.y); ctx.scale(s, s); ctx.translate(-k.x, -k.y); }
    pk.call(this, k); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (k.mag && k.px !== undefined) { ctx.globalAlpha = .45; ctx.strokeStyle = k.type === 'coin' ? '#ffcf6b' : k.type === 'heart' ? '#ff9ac0' : '#7fe0ff'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(k.px, k.py); ctx.lineTo(k.x, k.y); ctx.stroke(); }
    k.px = k.x; k.py = k.y;
    if (k.type === 'coin' || k.type === 'heart') { const a = (Math.sin(t * 4 + k.x) * .5 + .5) ** 6; if (a > .05) { ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(k.x - 9, k.y - 9); ctx.lineTo(k.x + 9, k.y + 9); ctx.moveTo(k.x + 9, k.y - 9); ctx.lineTo(k.x - 9, k.y + 9); ctx.stroke(); } }
    ctx.restore();
  };
}

// ---------- 3. escudo com reflexo de vidro e pulso com anel duplo ----------
{
  const sf = Visual2.shipFx;
  Visual2.shipFx = function (p) {
    sf.call(this, p); if (!p.shieldReady || QL() < 1) return; const t = World.t;
    ctx.save(); ctx.translate(p.x, p.y); const g = ctx.createRadialGradient(-14, -18, 4, 0, 0, 52); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(.6, 'rgba(127,224,255,.07)'); g.addColorStop(1, 'rgba(127,224,255,.2)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 52, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 44, Math.PI * 1.15 + Math.sin(t * 1.5) * .1, Math.PI * 1.45 + Math.sin(t * 1.5) * .1); ctx.stroke(); ctx.restore();
  };
}

// ---------- 4. clima por setor: poeira, chuva de meteoros ou neblina, que reagem ao movimento da nave ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (G.state !== 'play' || QL() < 1 || !G.stage) return; const t = World.t, p = G.player, st = G.stage, v = (st.id || 0) % 3, c = ok61(st.tint) ? st.tint : '#b98cff', px = p ? (p.x - W / 2) * -.06 : 0, py = p ? (p.y - H / 2) * -.04 : 0;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (v === 0) { for (let i = 0; i < 28; i++) { const d = .4 + h61(i) * .8, x = ((h61(i + 5) * W + t * 10 * d + px * d) % W + W) % W, y = ((h61(i + 9) * H + t * 22 * d + py * d) % H + H) % H; ctx.globalAlpha = .25 + .2 * Math.sin(t * 2 + i); drawGlow(x, y, 3 + d * 4, '#fff6d8', .7); } }
    else if (v === 1) { ctx.lineCap = 'round'; for (let i = 0; i < 7; i++) { const k = ((t * .5 + h61(i) * 3) % 3) / 3, x = W * (1.1 - k * 1.3) - i * 70 + px, y = -40 + k * (H + 100) + py; ctx.globalAlpha = .4 * Math.sin(k * Math.PI); ctx.strokeStyle = c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 80, y - 120); ctx.stroke(); } }
    else if (QL() >= 2) { for (let i = 0; i < 4; i++) { const x = ((h61(i) * W + t * (14 + i * 6) + px * 2) % (W + 600) + W + 600) % (W + 600) - 300, y = H * (.2 + i * .22) + Math.sin(t * .3 + i) * 40 + py * 2; ctx.globalAlpha = .1; drawGlow(x, y, 260, c, .5); } }
    ctx.restore();
  };
}

// ---------- 5. luz dinamica: chefe e nave iluminam o cenario ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (G.state !== 'play' || QL() < 2) return; const b = G.boss, p = G.player; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (b && b.state === 'fight' && ok61(b.col)) drawGlow(b.x, b.y + 40, 420, b.col, .13 + .04 * Math.sin(World.t * 3));
    if (p && !p.dead) drawGlow(p.x, p.y + 20, 240, '#b98cff', .08);
    let n = 0; for (const q of G.pb) { if (q.dead || ++n > 12) break; if (ok61(q.c)) drawGlow(q.x, q.y, 80, q.c, .08); }
    ctx.restore();
  };
}

// ---------- 6. camera: balanco suave seguindo a nave e batida de coracao com vida baixa ----------
{
  const dp = Game.drawPlay;
  Game.drawPlay = function () {
    const p = G.player, C = Visual61.cam; if (QL() < 1 || !p || G.state !== 'play' || G.furyCut) return dp.call(this);
    const tx = (W / 2 - p.x) * .012, ty = (H / 2 - p.y) * .008, tr = (p.x - W / 2) / W * .008; C[0] += (tx - C[0]) * .08; C[1] += (ty - C[1]) * .08; C[2] += (tr - C[2]) * .08;
    ctx.save(); ctx.translate(W / 2 + C[0], H / 2 + C[1]); ctx.rotate(C[2]); ctx.translate(-W / 2, -H / 2); const r = dp.call(this); ctx.restore();
    if (p.hp <= Math.max(1, p.maxHp * .25) && !p.dead) { Visual61.hb += 1 / 60 * (1.6 + (p.hp <= 1 ? .8 : 0)); const k = Math.max(0, Math.sin(Visual61.hb * TAU) ** 8); ctx.save(); const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .9); g.addColorStop(0, 'rgba(255,30,60,0)'); g.addColorStop(1, 'rgba(255,30,60,' + .35 * k + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    return r;
  };
}

// ---------- 7. interface: icones das cartas com moldura de raridade e botoes que brilham ao passar o mouse ----------
{
  const ui = Visual2.upIcon;
  Visual2.upIcon = function (id, x, y, s, c, f) {
    if (QL() >= 1 && ok61(c)) { const t = World.t; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c; ctx.globalAlpha = .45 + .15 * Math.sin(t * 3); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, s * 1.5, 0, TAU); ctx.stroke(); for (let i = 0; i < 3; i++) { const a = t * 1.3 + i * 2.094; drawGlow(x + Math.cos(a) * s * 1.5, y + Math.sin(a) * s * 1.5, 6, c, .8); } ctx.restore(); }
    return ui.call(this, id, x, y, s, c, f);
  };
  const bt = UI.button;
  UI.button = function (id, x, y, w, h, label, o = {}) {
    const r = bt.call(this, id, x, y, w, h, label, o);
    if (QL() >= 1 && w >= 120 && h >= 36 && UI.focus(id) && !(o && o.disabled)) { const k = (World.t * 1.4) % 1; ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(20, h / 2)); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const gx = x - 60 + k * (w + 120), g = ctx.createLinearGradient(gx - 40, 0, gx + 40, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore(); }
    return r;
  };
}

// ---------- 8. conquistas: explosao de luz ao desbloquear e brilho na galeria ----------
{
  const ul = Ach.unlock;
  Ach.unlock = function (id) { const had = Save.data.ach && Save.data.ach[id]; const r = ul.call(this, id); if (!had && Save.data.ach && Save.data.ach[id] && QL() >= 1) { for (let i = 0; i < 26; i++) { const a = rand(0, TAU), v = rand(80, 320); Visual61.sp.push({ x: W - 190, y: 60, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: i % 2 ? '#ffe9a8' : '#ffffff' }); } } return r; };
  const td = Visual6.toastDraw;
  Visual6.toastDraw = function () {
    td.call(this); const S = Visual61.sp; if (!S.length) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = S.length - 1; i >= 0; i--) { const q = S[i]; q.l -= 1 / 50; if (q.l <= 0) { S.splice(i, 1); continue; } q.x += q.vx / 60; q.y += q.vy / 60; q.vx *= .94; q.vy *= .94; ctx.globalAlpha = q.l; drawGlow(q.x, q.y, 6, q.c, .9); }
    ctx.restore();
  };
}

// ---------- 9. cenas da historia: retrato que desliza ao entrar, raios de luz e poeira por cena ----------
{
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o = {}) {
    const S = G.story; if (G.state === 'story' && S && size >= 100 && QL() >= 1 && S.t !== undefined && S.t < .45) { const k = easeOut(clamp(S.t / .4, 0, 1)); ctx.save(); ctx.globalAlpha = k; ctx.translate(-(1 - k) * 70, 0); pd.call(this, who, x, y, size, o); ctx.restore(); return; }
    return pd.call(this, who, x, y, size, o);
  };
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const r = sb.call(this); const S = G.story, pg = S && this.curPage(S); if (QL() < 1 || !pg || pg.video) return r;
    let h = 0; const key = String(pg.scene || pg.who || 'x'); for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0; const sd = Math.abs(h) % 97, t = World.t, c = pg.who && CHARS[pg.who] && ok61(CHARS[pg.who].c) ? CHARS[pg.who].c : '#b98cff';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const x = ((h61(sd + i) * W + t * (12 + i * 5)) % (W + 400)) - 200; ctx.globalAlpha = .06; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 140, 0); ctx.lineTo(x - 180, H); ctx.lineTo(x - 320, H); ctx.closePath(); ctx.fill(); }
    for (let i = 0; i < 22; i++) { const x = (h61(sd + i * 3) * W + Math.sin(t * .4 + i) * 30), y = H - ((t * (14 + h61(i + sd) * 22) + h61(i + 40 + sd) * H) % H); ctx.globalAlpha = .3; drawGlow(x, y, 5, '#fff3d0', .5); }
    ctx.restore(); return r;
  };
}

// ---------- 10. creditos: ceu estrelado em camadas, estrelas cadentes e resumo da jornada ----------
{
  const cr = Screens.credits;
  Screens.credits = function () {
    const t = World.t; if (Visual61.cr0 === null || t - Visual61.crL > .5) Visual61.cr0 = t; Visual61.crL = t; const u = t - Visual61.cr0;
    if (QL() >= 1) {
      ctx.save(); ctx.fillStyle = 'rgba(3,1,14,.55)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      for (let L = 0; L < 3; L++) for (let i = 0; i < 34; i++) { const sp = 6 + L * 10, x = (h61(i + L * 50) * W + u * sp * .3) % W, y = ((h61(i + L * 70 + 9) * H + u * sp) % H); ctx.globalAlpha = .25 + .2 * Math.sin(u * 2 + i) + L * .12; drawGlow(x, y, 1.8 + L * 1.2, L === 2 ? '#fff3d0' : '#cdb8ff', .8); }
      for (let i = 0; i < 2; i++) { const k = ((u * .18 + i * .5) % 1), x = W * (1.05 - k * 1.2), y = 60 + k * 300 + i * 180; ctx.globalAlpha = Math.sin(k * Math.PI) * .8; const g = ctx.createLinearGradient(x, y, x + 140, y - 60); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 140, y - 60); ctx.stroke(); }
      ctx.restore();
    }
    const r = cr.call(this);
    if (QL() >= 1 && u < 7) { const n = (Save.data.cleared || []).filter(Boolean).length, a = clamp(u / .8, 0, 1) * clamp((7 - u) / .8, 0, 1); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(12,4,34,.7)'; ctx.beginPath(); ctx.roundRect(W / 2 - 230, 600, 460, 70, 16); ctx.fill(); txt('SUA JORNADA', W / 2, 608, 14, '#cdb8ff', 'center', 800); txt(n + ' de ' + STAGES.length + ' setores salvos', W / 2, 630, 24, '#ffe9a8', 'center', 900); ctx.restore(); }
    return r;
  };
}

// ---------- 11. imagem mais nitida: suavizacao alta nos desenhos ----------
{
  const hq = () => { try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; } catch (e) { } };
  hq(); addEventListener('resize', () => setTimeout(hq, 50));
  let n = 0;
  hookRender(rn => function () { if ((n++ & 127) === 0) hq(); return rn(); });
}
