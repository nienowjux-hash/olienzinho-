'use strict';
// ---------- polimento 19: desempenho, mortes dos inimigos antigos, mapa com trilhas, clima, fundo que reage ao chefe,
// expressoes novas, minichefes das fases 1 a 6, remix dos chefes no Novo Jogo+ e replay da derrota ----------
const Visual19 = { frames: [], acc: 0, last: 0, autoDone: 0, n: 0 };

// ---------- desempenho: aquece o cache de brilhos, limita particulas e baixa a qualidade sozinho se a maquina for fraca ----------
Visual19.warm = function () {
  const cols = new Set(['#ffe9a8', '#ffffff', '#ffb340', '#7fe0ff', '#b98cff', '#ff7ac8', '#ff4a2e', '#ffd36a', '#33c4ff', '#e8d0ff', '#ff8a1f', '#c8a0b8', '#ff7a4a', '#7fffa0', '#c040ff', '#9fe8ff', '#5af0a0', '#ff5a3c', '#cdb8ff', '#ff4a6e', '#ff4aa0', '#2b7bff', '#9fd0ff', '#ffa03a', '#fff6d0', '#35f0c0', '#5adfff', '#c080ff', '#a070ff']);
  for (const s of STAGES) if (s.tint && s.tint[0] === '#' && s.tint.length === 7) cols.add(s.tint);
  for (const k in GUARDS) cols.add(GUARDS[k].c);
  for (const k in WEAPONS) if (WEAPONS[k].c && WEAPONS[k].c.length === 7) cols.add(WEAPONS[k].c);
  for (const c of cols) { try { glow(c); } catch (e) { } }
};
setTimeout(Visual19.warm, 1500);
{
  const ss = Game.startStage; Game.startStage = function (idx, o) { Visual19.warm(); Visual19.frames = []; Visual19.acc = 0; Visual19.n = 0; return ss.call(this, idx, o); };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const t0 = performance.now(); up.call(this, dt); if (G.state !== 'play') { Visual19.last = 0; return; }
    if (G.parts.length > 1500) G.parts.splice(0, G.parts.length - 1500);
    if (G.eb.length > 420) for (let i = 0; i < G.eb.length - 420; i++) if (!G.eb[i].keep) G.eb[i].dead = true;
    // medidor de fluidez: tempo real entre quadros nos primeiros segundos de jogo
    const now = performance.now(); if (Visual19.last && G.t > 3 && G.t < 20 && Visual19.autoDone < 2 && !G.training && !/noauto/.test(location.search)) {
      const d = now - Visual19.last; if (d < 200) { Visual19.acc += d; Visual19.n++; }
      if (Visual19.n >= 360) { const avg = Visual19.acc / Visual19.n; Visual19.acc = 0; Visual19.n = 0; if (avg > 31 && QL() > 0 && document.hasFocus()) { Save.data.settings.quality = QL() - 1; Save.save(); Visual19.autoDone++; popup(W / 2, 200, 'Qualidade reduzida para manter a fluidez (Opções)', '#ffcf6b', 22); } }
    }
    Visual19.last = now;
    // gravacao dos ultimos segundos para o replay da derrota
    const p = G.player; if (p && !p.dead) {
      Visual19.rt = (Visual19.rt || 0) + dt; if (Visual19.rt > 1 / 15) { Visual19.rt = 0; const b = G.boss;
        Visual19.frames.push({ px: p.x, py: p.y, eb: G.eb.slice(0, 160).map(q => [q.x | 0, q.y | 0]), en: G.enemies.filter(e => !e.dead).slice(0, 40).map(e => [e.x | 0, e.y | 0, e.rad | 0]), b: b && b.state === 'fight' ? [b.x | 0, b.y | 0, (b.rad || 100) | 0] : null }); if (Visual19.frames.length > 48) Visual19.frames.shift(); }
    }
  };
}

// ---------- mortes proprias dos inimigos das Partes 1 e 2 ----------
{
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.counted; ke(e, by); if (was || !e.counted || QL() < 1) return; const x = e.x, y = e.y;
    switch (e.type) {
      case 'drone': burst(x, y, ['#ffb340', '#ffe9a8', '#ff7a1a'], 10, 240, 4); shedDebris(x, y, 3, ['#ff8a1f', '#7a2a0a'], 240, 6); break;
      case 'zig': shedDebris(x, y, 6, ['#2b7bff', '#9fd0ff', '#ffffff'], 360, 8); break;
      case 'kami': shockwave(x, y, 130, '#ff4a6e'); burst(x, y, ['#ff4a6e', '#ffb0c0', '#ffffff'], 16, 320, 5); break;
      case 'shooter': for (let i = 0; i < 6; i++) G.parts.push({ k: 'smoke', x: x + rand(-10, 10), y: y + rand(-10, 10), vx: rand(-60, 60), vy: rand(-60, 20), life: .7, max: .7, r: rand(8, 14), c: '#5a2a60', drag: 2 }); burst(x, y, ['#ff4aa0', '#ffb0e0'], 12, 260, 5); break;
      case 'tank': shedDebris(x, y, 12, ['#ff8a1f', '#7a3a10', '#c85a10'], 420, 12); shockwave(x, y, 150, '#ff8a1f'); shake(5); break;
      case 'mine': shockwave(x, y, 190, '#ff4a4a'); burst(x, y, ['#ff4a4a', '#ffd36a', '#ffffff'], 18, 340, 5); break;
      case 'healer': for (let i = 0; i < 10; i++) G.parts.push({ x: x + rand(-14, 14), y, vx: rand(-30, 30), vy: rand(-140, -50), life: rand(.6, 1.1), max: 1.1, r: rand(2, 4), c: '#7fffa0', drag: 1 }); break;
      case 'shield': shedDebris(x, y, 8, ['#7fe0ff', '#ffffff', '#2a8ac8'], 340, 9); shockwave(x, y, 120, '#7fe0ff'); break;
      case 'captain': shedDebris(x, y, 22, ['#ff8a1f', '#ffe9a8', '#5a2a60'], 520, 15); shockwave(x, y, 260, '#ffb340'); shockwave(x, y, 160, '#ffffff'); shake(10); break;
    }
  };
}

// ---------- mapa de fases com trilhas que acendem ----------
{
  const sel = Screens.select;
  Screens.select = function () {
    const nS = STAGES.length, pos = i => [nS > 6 ? 96 + i * (1088 / (nS - 1)) : 150 + i * 196, 408 + (i % 2 ? 36 : -18)], t = World.t; ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < nS - 1; i++) {
      const [x0, y0] = pos(i), [x1, y1] = pos(i + 1), lit = !!Save.data.cleared[i], open = i + 1 < Save.data.unlocked;
      if (lit) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffd36a'; ctx.globalAlpha = .22; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.globalAlpha = .8; ctx.lineWidth = 3; ctx.stroke(); for (let k = 0; k < 2; k++) { const f = (t * .35 + k * .5 + i * .13) % 1; drawGlow(lerp(x0, x1, f), lerp(y0, y1, f), 12, '#fff6d0', .9); } }
      else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = open ? '#cdb8ff' : '#5a4a80'; ctx.globalAlpha = open ? .5 : .28; ctx.lineWidth = 2.5; ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 10; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]); }
    }
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    return sel.call(this);
  };
}

// ---------- clima nas fases da Parte 3 e fundo que reage ao chefe ----------
{
  const am = Visual16.ambient;
  Visual16.ambient = function () {
    am.call(this); if (QL() < 1 || Save.data.settings.contrast) return; const st = G.stage ? G.stage.id : 0, t = World.t; ctx.save();
    if (st === 6 || st === 9) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#fff0c0'; for (let i = 0; i < 26; i++) { const x = (hsh(i + 50) * W + Math.sin(t * .5 + i) * 30) % W, y = ((t * (18 + hsh(i) * 22) + hsh(i + 7) * H) % (H + 40)) - 20; ctx.globalAlpha = .28; ctx.beginPath(); ctx.ellipse(x, y, 2.5, 5, t + i, 0, TAU); ctx.fill(); } }
    if (st === 7 || st === 9) { ctx.strokeStyle = '#9fefff'; ctx.lineWidth = 1.5; for (let i = 0; i < 18; i++) { const x = hsh(i + 80) * W + Math.sin(t + i) * 14, y = H - ((t * (30 + hsh(i + 2) * 40) + hsh(i + 5) * H) % (H + 30)) + 15, r = 3 + hsh(i + 9) * 8; ctx.globalAlpha = .22; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); } }
    if (st === 8 || st === 9) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#e8d0ff'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const f = ((t * .25 + hsh(i + 90)) % 1), x = f * (W + 300) - 150, y = hsh(i + 91) * H; ctx.globalAlpha = .2 * Math.sin(f * Math.PI); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120, y - 60); ctx.stroke(); } }
    const b = G.boss; if (b && b.state === 'fight' && b.phase > 0 && b.col && b.col[0] === '#') { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .04 * b.phase * (.6 + .4 * Math.sin(t * 3)); ctx.fillStyle = b.col; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  };
}

// ---------- expressoes novas: medo e riso ----------
{
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o = {}) {
    const m = o.mood, t = o.t || 0;
    if (m === 'fear' || m === 'laugh') {
      const o2 = Object.assign({}, o, { mood: m === 'fear' ? 'worry' : 'happy' }), ox = m === 'fear' ? rand(-2.2, 2.2) : 0, oy = m === 'laugh' ? -Math.abs(Math.sin(t * 9)) * size * .05 : 0;
      pd.call(this, who, x + ox, y + oy, size, o2);
      ctx.save(); ctx.translate(x + ox, y + oy);
      if (m === 'fear') { const k = (t * 1.6) % 1; ctx.fillStyle = '#9fe8ff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); const sx = size * .36, sy = -size * .3 + k * size * .25; ctx.moveTo(sx, sy - 12); ctx.quadraticCurveTo(sx + 9, sy + 2, sx, sy + 8); ctx.quadraticCurveTo(sx - 9, sy + 2, sx, sy - 12); ctx.fill(); ctx.stroke(); }
      else { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.6, r = size * (.5 + .08 * Math.sin(t * 5 + i)); ctx.fillStyle = '#ffe9a8'; ctx.globalAlpha = .8; ctx.beginPath(); for (let k = 0; k < 8; k++) { const aa = k * Math.PI / 4, q = k % 2 ? 2 : 7; ctx.lineTo(Math.cos(a) * r + Math.cos(aa) * q, Math.sin(a) * r * .8 + Math.sin(aa) * q); } ctx.closePath(); ctx.fill(); } }
      ctx.restore(); return;
    }
    return pd.call(this, who, x, y, size, o);
  };
  const setMood = (arr, frag, mood) => { for (const p of arr) if (p.text && p.text.includes(frag)) p.mood = mood; };
  setMood(STORY.prologue, 'está desaparecendo', 'fear'); setMood(STORY.prologue, 'você está... você está desaparecendo', 'fear');
  for (const s of STORY.stages) for (const k of ['intro', 'pre', 'after']) if (s[k]) { setMood(s[k], 'só que ao contrário', 'fear'); setMood(s[k], 'Quem é você', 'fear'); }
  setMood(STORY.finale4, 'Voltei para ficar', 'laugh'); setMood(STORY.finale4, 'você voltou de verdade', 'laugh');
  setMood(STORY.finale3, 'Voltei para ficar', 'laugh');
}

// ---------- minichefes das fases 1 a 6 com golpes proprios ----------
{
  const ue = updateEnemy;
  updateEnemy = function (e, dt) {
    const st = G.stage ? G.stage.id : 0;
    if (e.type === 'captain' && st < 6 && e.mode === 'hover' && !e.dead && !window.NOCAP) {
      const p = G.player, hurt = e.hp < e.maxHp * .5 ? .75 : 1; e.mt = e.mt || {}; const nOf = ty => G.enemies.filter(q => !q.dead && q.type === ty).length;
      const tk = (k, every) => { e.mt[k] = (e.mt[k] ?? every * .7) - dt; if (e.mt[k] <= 0) { e.mt[k] = every * hurt; return true; } return false; };
      if (st === 0) { if (tk('drones', 4.5) && nOf('drone') < 5) for (const s of [-1, 1]) spawnEnemy('drone', clamp(e.x + s * 90, 50, W - 50), e.y + 30, { bx: e.x + s * 90, noElite: true }); if (tk('fan', 2.3)) fanAimed(e.x, e.y + 20, 5, .8, 230); }
      else if (st === 1) { if (tk('drill', 5)) Events.hazardRect(clamp(p.x, 70, W - 70), H / 2, 70, H, .95, .3, '#ffb340', 'bolt'); if (tk('rocks', 2.6)) for (let i = 0; i < 3; i++) ebullet(rand(80, W - 80), -10, Math.PI / 2, 200, { r: 10 }); }
      else if (st === 2) { if (tk('bolt', 3.2)) for (const dx of [-90, 90]) Events.hazardRect(clamp(p.x + dx, 70, W - 70), H / 2, 60, H, .9, .3, '#7fe0ff', 'bolt'); if (tk('arc', 4.5)) ring(e.x, e.y, 12, 210, rand(0, 6), { r: 5 }); }
      else if (st === 3) { if (tk('flare', 4)) { ring(e.x, e.y, 16, 140, rand(0, 6), { r: 7 }); shockwave(e.x, e.y, 160, '#ffb340'); } if (tk('orb', 2.5)) fanAimed(e.x, e.y + 20, 3, .5, 150, { r: 10 }); }
      else if (st === 4) { if (tk('ghosts', 7) && nOf('ghost') < 3) for (const s of [-1, 1]) spawnEnemy('ghost', clamp(e.x + s * 100, 60, W - 60), e.y, { bx: e.x + s * 100, noElite: true }); if (tk('fan', 2.4)) fanAimed(e.x, e.y + 20, 7, 1.1, 215); }
      else if (st === 5) { if (tk('tendril', 3.5)) for (let i = 0; i < 2; i++) Events.hazardRect(rand(100, W - 100), H / 2, 64, H, .9, .3, '#b98cff', 'bolt'); if (tk('ring', 3)) ring(e.x, e.y, 14, 160, rand(0, 6), { r: 6 }); }
    }
    return ue(e, dt);
  };
}

// ---------- Novo Jogo+: chefes remixados com golpes da Parte 3 ----------
{
  const hal = (cx, cy) => { const n = 24, gap = Math.floor(rand(0, n)); for (let i = 0; i < n; i++) { if (((i - gap + n) % n) < 3) continue; const a = i / n * TAU; ebullet(cx + Math.cos(a) * 340, cy + Math.sin(a) * 340, a + Math.PI, 130, { c: '#5ae8ff', r: 6, life: 5 }); } };
  const REMIX = [
    () => { const p = G.player; popup(p.x, p.y - 70, 'REMIX: HALO', '#ffe9a8', 22); hal(p.x, p.y); },
    () => { popup(W / 2, 230, 'REMIX: MARÉ', '#9fefff', 22); const gx = rand(150, W - 150); for (let i = 0; i < 20; i++) { const x = 30 + i * 62; if (Math.abs(x - gx) < 90) continue; ebullet(x, 60, Math.PI / 2, 150, { c: '#5ae8ff', r: 8 }); } },
    () => { popup(W / 2, 230, 'REMIX: ECO', '#e8d0ff', 22); const past = []; for (let i = 0; i < 6; i++) { const tt = World.t - 2 + i * .3, s = P3.hist.find(h => h[0] >= tt); if (s) past.push(s[1]); } past.forEach((x, i) => P3.at(.5 + i * .3, () => Events.hazardRect(x, H / 2, 56, H, .85, .25, '#e8d0ff', 'bolt'))); },
    () => { popup(W / 2, 230, 'REMIX: CHUVA', '#ff8a5f', 22); for (let i = 0; i < 14; i++) P3.at(i * .12, () => ebullet(rand(60, W - 60), -10, Math.PI / 2, 270, { c: '#5ae8ff', r: 6 })); },
  ];
  const ba = Boss.prototype.update;
  Boss.prototype.update = function (dt) {
    ba.call(this, dt);
    if (Save.data.ngpOn && this.state === 'fight' && !(this.stun > 0) && !(this.chargeT > 0) && G.player && !G.player.dead && !G.practice) { this._rx = (this._rx ?? 14) - dt; if (this._rx <= 0) { this._rx = Math.max(8, 15 - this.phase * 2); this._ri = ((this._ri ?? ((G.stageIdx || 0) * 2)) + 1) % REMIX.length; const ri = this._ri; if (typeof Visual73 !== 'undefined') Visual73.remix(ri, () => REMIX[ri]()); else REMIX[ri](); } } // cada chefe comeca por um golpe diferente, so depois dos 14 s, e nao repete em seguida
  };
}

// ---------- replay dos ultimos segundos antes de perder ----------
{
  const ov = Screens.over;
  Screens.over = function () {
    ov.call(this); const F = Visual19.frames; if (!F || F.length < 8) return; const k = Math.floor(World.t * 15) % F.length, fr = F[k], x = 36, y = 360, w = 300, h = 169, sx = w / W, sy = h / H;
    ctx.save(); ctx.globalAlpha = .92; UI.panel(x - 8, y - 30, w + 16, h + 42, { r: 14, fill: 'rgba(8,2,26,.85)' }); txt('SEUS ÚLTIMOS 3 SEGUNDOS', x + w / 2, y - 24, 13, '#ffcf6b', 'center', 800);
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = '#0a0420'; ctx.fillRect(x, y, w, h);
    for (const q of fr.en) { ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.arc(x + q[0] * sx, y + q[1] * sy, Math.max(2.5, q[2] * sx), 0, TAU); ctx.fill(); }
    if (fr.b) { ctx.fillStyle = 'rgba(255,90,90,.6)'; ctx.beginPath(); ctx.arc(x + fr.b[0] * sx, y + fr.b[1] * sy, fr.b[2] * sx, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#ff4a5e'; for (const q of fr.eb) ctx.fillRect(x + q[0] * sx - 1.5, y + q[1] * sy - 1.5, 3, 3);
    ctx.strokeStyle = 'rgba(127,224,255,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = Math.max(0, k - 8); i <= k; i++) { const q = F[i]; if (i === Math.max(0, k - 8)) ctx.moveTo(x + q.px * sx, y + q.py * sy); else ctx.lineTo(x + q.px * sx, y + q.py * sy); } ctx.stroke();
    ctx.fillStyle = '#7fe0ff'; ctx.beginPath(); ctx.arc(x + fr.px * sx, y + fr.py * sy, 4.5, 0, TAU); ctx.fill();
    if (k >= F.length - 2) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + fr.px * sx, y + fr.py * sy, 12, 0, TAU); ctx.stroke(); }
    ctx.restore();
  };
}
