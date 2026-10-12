'use strict';
// ---------- 60: nave viva, efeito das cartas, chefes que racham, mapa com viagem, titulo vivo, eventos de fundo, numeros de dano, hangar,
// transicoes entre telas e cena do chefe final ----------
const Visual60 = { ev: null, next: 0, card: null, mapP: null, unl: null, unlT: -9, sp: [], tr: null, last: null, dy: 0 };
const ok60 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

// ---------- 1. nave: chama que estica com a velocidade e avaria quando a vida esta baixa ----------
{
  const sh = Art.ship;
  Art.ship = function (x, y, o) {
    const r = sh.call(this, x, y, o), p = G.player;
    if (G.state === 'play' && p && !p.dead && o && !o.orbi && Math.abs(x - p.x) < 1.5 && Math.abs(y - p.y) < 14 && QL() >= 1) {
      const sp = Math.hypot(p.vx || 0, p.vy || 0), L = 20 + Math.min(60, sp * .06) + Math.sin(World.t * 40) * 4, k = (o.scale || 1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y + 50 * k);
      const g = ctx.createLinearGradient(0, 0, 0, L * k); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.4, 'rgba(127,224,255,.35)'); g.addColorStop(1, 'rgba(127,224,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-9 * k, 0); ctx.quadraticCurveTo(0, L * 1.25 * k, 9 * k, 0); ctx.closePath(); ctx.fill(); ctx.restore();
      if (p.hp <= Math.max(1, p.maxHp * .34)) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 80, '#ff3a2a', .16 + .12 * Math.sin(World.t * 7)); ctx.restore();
        if (((World.t * 60) | 0) % 5 === 0) G.parts.push({ k: 'smoke', x: x + rand(-14, 14), y: y + 10, vx: rand(-20, 20), vy: rand(40, 90), life: .7, max: .7, r: rand(4, 8), c: '#3a2060', drag: 1 });
        if (Math.random() < .05) G.parts.push({ x: x + rand(-16, 16), y: y + rand(-10, 20), vx: rand(-80, 80), vy: rand(-60, 40), life: .3, max: .3, r: rand(2, 3), c: '#ffb340', drag: 2 });
      }
    }
    return r;
  };
}

// ---------- 2. efeito da carta de nivel: coluna de luz na cor da raridade ----------
{
  const cu = Game.chooseUpgrade;
  Game.chooseUpgrade = function (i) {
    const u = G.options && G.options[i], p = G.player, r = cu.call(this, i);
    if (u && p && QL() >= 1) { const c = ok60((RARITY[u.r] || {}).c) ? RARITY[u.r].c : '#b98cff'; Visual60.card = { t: 0, c, x: p.x, y: p.y }; shockwave(p.x, p.y, 230, c); shockwave(p.x, p.y, 130, '#ffffff'); for (let n = 0; n < 14; n++) G.parts.push({ x: p.x + rand(-30, 30), y: p.y + rand(-10, 30), vx: rand(-60, 60), vy: -rand(120, 360), life: .7, max: .7, r: rand(2, 5), c: n % 2 ? c : '#ffffff', drag: 1.2 }); }
    return r;
  };
}

// ---------- 3. chefes racham, soltam pedacos e ficam avermelhados conforme perdem vida ----------
{
  const CL = { MotherShip, RockGolem, StormEye, SunGuardian, EchoBoss, VoidBoss, Herald, Leviathan, Mirror, Heart };
  const crack = (b, i, R) => { const a0 = hh60(i * 3.1) * TAU, pts = []; let x = Math.cos(a0) * R * .15, y = Math.sin(a0) * R * .15; pts.push([x, y]); for (let k = 0; k < 5; k++) { const a = a0 + (hh60(i * 7 + k) - .5) * 1.1; x += Math.cos(a) * R * .2; y += Math.sin(a) * R * .2; pts.push([x, y]); } return pts; };
  const hh60 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  for (const name in CL) {
    const d = CL[name].prototype.draw;
    CL[name].prototype.draw = function () {
      d.call(this); if (QL() < 1 || this.state !== 'fight' || G.state !== 'play') return; const prog = clamp((1 - this.ratio - .1) / .8, 0, 1); if (prog <= 0) return;
      const R = Math.min(130, this.rad || 100), n = Math.ceil(prog * 9), col = ok60(this.col) ? this.col : '#ff8a5f';
      ctx.save(); ctx.translate(this.x, this.y);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 1.5, '#ff3a2a', prog * .24);
      ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < n; i++) { const pts = crack(this, i, R); ctx.strokeStyle = 'rgba(16,2,10,.8)'; ctx.lineWidth = 3.5; ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = col; ctx.globalAlpha = .55 + .25 * Math.sin(World.t * 5 + i); ctx.lineWidth = 1.4; ctx.stroke(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
      ctx.restore();
      this._dbT = (this._dbT || 0) - 1 / 60; if (prog > .3 && this._dbT <= 0) { this._dbT = 1.1 - prog * .7; shedDebris(this.x + rand(-R * .6, R * .6), this.y + rand(-R * .3, R * .4), 2, [col, '#3a1050'], 160, 7); }
    };
    const op = CL[name].prototype.onPhase;
    CL[name].prototype.onPhase = function () { op.call(this); if (QL() >= 1) { Visual60.red = 1; shedDebris(this.x, this.y, 16, ['#ff8a5f', '#ffffff', '#3a1050'], 420, 10); } };
  }
}

// ---------- 4. mapa de fases: rota que se acende, nave viajando e festa ao liberar um setor ----------
{
  const sel = Screens.select;
  Screens.select = function () {
    const r = sel.call(this); if (QL() < 1) return r; const t = World.t, nS = STAGES.length, unl = Save.data.unlocked || 1, pos = i => [nS > 6 ? 96 + i * (1088 / (nS - 1)) : 150 + i * 196, 408 + (i % 2 ? 36 : -18)];
    if (Visual60.unl === null) Visual60.unl = unl; else if (unl > Visual60.unl) { Visual60.unl = unl; Visual60.unlT = t; }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (let i = 0; i < Math.min(nS - 1, unl - 1); i++) { const [x0, y0] = pos(i), [x1, y1] = pos(i + 1); ctx.strokeStyle = 'rgba(255,214,120,' + (.3 + .1 * Math.sin(t * 3 + i)) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
    ctx.restore();
    const ut = t - Visual60.unlT; if (ut >= 0 && ut < 2) { const [x, y] = pos(clamp(unl - 1, 0, nS - 1)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { const q = clamp(ut / 2 - k * .15, 0, 1); ctx.globalAlpha = (1 - q) * .8; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 30 + q * 160, 0, TAU); ctx.stroke(); } for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + ut, q = ut / 2; ctx.globalAlpha = 1 - q; drawGlow(x + Math.cos(a) * (40 + q * 110), y + Math.sin(a) * (40 + q * 110), 9, '#fff0b0', .9); } ctx.restore(); }
    return r;
  };
}

// ---------- 5. tela de titulo: estrelas cadentes, nave passando e brilho que segue o mouse ----------
{
  const ti = Screens.title;
  Screens.title = function () {
    const r = ti.call(this); if (QL() < 1) return r; const t = World.t, m = Input.mouse;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const k = ((t * .22 + i / 3) % 1), x = W * (1.05 - k * 1.25) - i * 60, y = 40 + k * 340 + i * 90; ctx.globalAlpha = Math.sin(k * Math.PI) * .8; const g = ctx.createLinearGradient(x, y, x + 150, y - 70); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 150, y - 70); ctx.stroke(); drawGlow(x, y, 8, '#ffffff', .8); }
    ctx.globalAlpha = 1; if (m.x > 100 && m.x < 900 && m.y > 80 && m.y < 300) drawGlow(m.x, m.y, 130, '#b98cff', .14);
    ctx.restore();
    const f = ((t * .045) % 1.4) - .2; if (f > -.1 && f < 1.1) { ctx.save(); ctx.globalAlpha = .9; Art.ship(f * (W + 200) - 100, 640 - Math.sin(f * 6) * 30, { vx: 260, t, pal: SKIN_DEFAULT, scale: .42, boost: 1, lookx: .3, looky: 0 }); ctx.restore(); }
    return r;
  };
}

// ---------- 6. eventos de fundo: cometas, auroras e eclipses ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (G.state !== 'play' || QL() < 1 || !G.stage || G.boss && G.boss.state === 'fight') return; const t = World.t;
    if (!Visual60.ev && t > Visual60.next) { const r = Math.random(), k = r < .55 ? 'comet' : (r < .8 || QL() < 2) ? 'comet' : r < .92 ? 'aurora' : 'eclipse'; Visual60.ev = { k, t0: t, dur: k === 'comet' ? 2.4 : k === 'aurora' ? 11 : 15, s: Math.random() }; }
    const e = Visual60.ev; if (!e) { if (Visual60.next === 0) Visual60.next = t + rand(8, 14); return; }
    const u = (t - e.t0) / e.dur; if (u >= 1) { Visual60.ev = null; Visual60.next = t + rand(18, 34); return; }
    const fade = Math.sin(clamp(u, 0, 1) * Math.PI), c = ok60(G.stage.tint) ? G.stage.tint : '#b98cff';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (e.k === 'comet') { const x = W * (1.1 - u * 1.3) * (.7 + e.s * .3) + 80, y = -60 + u * (H * .8) * (.6 + e.s * .5), g = ctx.createLinearGradient(x, y, x + 360, y - 260); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.3, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = .65; ctx.strokeStyle = g; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 360, y - 260); ctx.stroke(); drawGlow(x, y, 46, '#ffffff', .7); }
    else if (e.k === 'aurora') { for (let b = 0; b < 3; b++) { ctx.beginPath(); for (let x = 0; x <= W; x += 40) { const y = 110 + b * 50 + Math.sin(x * .006 + t * .5 + b * 2) * 40; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath(); const g = ctx.createLinearGradient(0, 0, 0, 220 + b * 50); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, ['rgba(120,255,200,', 'rgba(150,140,255,', 'rgba(255,140,220,'][b] + .22 * fade + ')'); ctx.fillStyle = g; ctx.fill(); } }
    else { const x = W * (.15 + u * .7), y = 120; ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .55 * fade; ctx.fillStyle = '#05000e'; ctx.beginPath(); ctx.arc(x, y, 70, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = fade; ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, 72, 0, TAU); ctx.stroke(); drawGlow(x, y, 190, '#ffcf6b', .35); }
    ctx.restore();
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { Visual60.ev = null; Visual60.next = 0; return ss.call(this, i, o); };
}

// ---------- 7. numeros de dano: somam quando caem juntos, crescem com o valor e tomam a cor da arma ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    up.call(this, dt); const P = G.pops, p = G.player; if (!P || P.length < 2 || !p) return; const wcol = (WEAPONS[p.weapon] || {}).c;
    for (let i = 0; i < P.length; i++) { const a = P[i]; if (a.life < .75 || !/^\d+!?$/.test(a.text)) continue;
      for (let j = i + 1; j < P.length; j++) { const b = P[j]; if (b.life < .75 || !/^\d+!?$/.test(b.text) || Math.abs(a.x - b.x) > 54 || Math.abs(a.y - b.y) > 40) continue;
        const s = parseInt(a.text) + parseInt(b.text), cr = a.text.endsWith('!') || b.text.endsWith('!'); a.text = s + (cr ? '!' : ''); a.size = clamp(15 + Math.sqrt(s) * 1.5, 15, 44); a.life = 1; a.c = cr ? '#ffe9a8' : s > 60 && ok60(wcol) ? wcol : '#ffffff'; b.life = 0; } }
  };
}

// ---------- 8. hangar: nave que gira de leve e faiscas ao trocar de visual ----------
{
  const sh = Art.ship;
  Art.ship = function (x, y, o) { if (G.state === 'hangar' && o && o.sx === undefined && !o.orbi && QL() >= 1) o = Object.assign({}, o, { sx: .9 + .1 * Math.cos(World.t * 1.1) }); return sh.call(this, x, y, o); };
  const hg = Screens.hangar;
  Screens.hangar = function () {
    const r = hg.call(this); if (QL() < 1 || G.htab !== 'nav') return r; const t = World.t, S = Visual60.sp; const pop = G.skinPop;
    if (pop !== undefined && pop !== Visual60.lastPop) { Visual60.lastPop = pop; for (let i = 0; i < 22; i++) { const a = rand(0, TAU), v = rand(80, 280); S.push({ x: 420, y: 290, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: .9, c: i % 2 ? '#ffe9a8' : '#b98cff' }); } }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) { const a = t * .7 + i * 1.047, rr = 150 + Math.sin(t + i) * 12; ctx.globalAlpha = .5; drawGlow(420 + Math.cos(a) * rr, 290 + Math.sin(a) * rr * .55, 6, '#ffe9a8', .8); }
    for (let i = S.length - 1; i >= 0; i--) { const q = S[i]; q.l -= 1 / 60; if (q.l <= 0) { S.splice(i, 1); continue; } q.x += q.vx / 60; q.y += q.vy / 60; q.vx *= .96; q.vy *= .96; ctx.globalAlpha = q.l; drawGlow(q.x, q.y, 7, q.c, .9); }
    ctx.restore(); return r;
  };
}

// ---------- 9. transicoes entre telas: cortina de luz com estrelas ----------
{
  const skip = ['play', 'pause', 'levelup', 'photo', 'cine'];
  hookRender(rn => function () {
    rn();
    const s = G.state; if (Visual60.last === null) Visual60.last = s;
    if (s !== Visual60.last) { const a = Visual60.last; Visual60.last = s; if (!(skip.includes(a) && skip.includes(s)) && QL() >= 1 && s !== 'cine') Visual60.tr = { t: 0 }; }
    const T = Visual60.tr; if (!T) return; T.t += 1 / 60; const u = T.t / .5; if (u >= 1) { Visual60.tr = null; return; }
    ctx.setTransform(K, 0, 0, K, 0, 0); ctx.save(); ctx.globalAlpha = (1 - u) * .65; ctx.fillStyle = '#0a0320'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u; ctx.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const y = (i * 53 + 20) % H, x = -300 + (u * 1.3 + i * .02) * (W + 600), L = 160 + (i % 4) * 60; ctx.strokeStyle = i % 3 ? 'rgba(190,160,255,.7)' : 'rgba(255,233,168,.8)'; ctx.lineWidth = 2 + i % 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - L, y); ctx.stroke(); }
    ctx.restore();
  });
}

// ---------- 10. chefe final: abertura em cinema e morte em cascata de luz ----------
{
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const b = G.boss; if (!b || !(b instanceof Heart) || G.state !== 'play') { Visual60.dy = 0; return; }
    if (b.state === 'intro') {
      const k = clamp(b.t / 1.2, 0, 1), bh = 70 * k; ctx.save(); ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
      const vg = ctx.createRadialGradient(W / 2, H * .4, H * .2, W / 2, H * .4, H * .85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,0,30,' + .6 * k + ')'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } else if (b.state === 'dying') {
      const d = b.dyingT || 0; Visual60.dy += 1 / 60;
      if (Visual60.dy > .3) { Visual60.dy = 0; shockwave(b.x + rand(-80, 80), b.y + rand(-60, 60), 160 + d * 90, ['#ff9ac0', '#ffe9a8', '#ffffff', '#b98cff'][(d * 3 | 0) % 4]); shake(2 + d * 3); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = clamp(d / (b.dyLen || 3.2), 0, 1) * (.35 + .25 * Math.sin(d * 20)); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.restore();
      const bh = 60; ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    }
  };
}
