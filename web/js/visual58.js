'use strict';
// ---------- 58: efeitos dos tiros, derrota cinematografica, cartoes de resumo da vitoria e letreiros animados ----------
const Visual58 = { nb: 0, signs: [] };

// ---------- tiros: brilho no cano, rastros por arma e faiscas ao acertar ----------
{
  const okc = c => typeof c === 'string' && c.length === 7 && c[0] === '#';
  const wc = id => { const w = WEAPONS[id]; return w && okc(w.c) ? w.c : '#b98cff'; };
  const sty = id => { let h = 0; for (let i = 0; i < (id || '').length; i++) h = (h * 31 + id.charCodeAt(i)) | 0; return Math.abs(h) % 3; };
  let lastM = -1;
  const mb = mkBullet;
  mkBullet = function (p, x, y, ang, speed, dmgMul, o) {
    const b = mb(p, x, y, ang, speed, dmgMul, o);
    if (World.t - lastM > .06 && Visual55.lvl() >= 1 && p === G.player) {
      lastM = World.t; const c = wc(p.weapon), k = Visual55.lvl() >= 2 ? 1 : .7;
      G.parts.push({ k: 'flash', x: p.x, y: p.y - 40, vx: 0, vy: 0, life: .11, max: .11, r: 30 * k, c, drag: 1 });
      for (let i = 0; i < 2; i++) G.parts.push({ x: p.x + rand(-6, 6), y: p.y - 38, vx: rand(-90, 90), vy: rand(-220, -90), life: .22, max: .22, r: rand(2, 4), c: '#ffffff', drag: 2 });
    }
    return b;
  };
  const pb = Art.pbullet;
  Art.pbullet = function (b) {
    pb.call(this, b); if (QL() < 1 || Visual55.lvl() < 1 || b.dead || b.kind === 'cannon' || b.kind === 'bomb' || b.kind === 'missile') return;
    if (++Visual58.nb > 28) return; const c = okc(b.c) ? b.c : wc(b.w), sp = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / sp, uy = b.vy / sp, L = Math.min(64, sp * .06), s = sty(b.w), t = World.t;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c; ctx.lineCap = 'round';
    if (s === 0) { ctx.globalAlpha = .35; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - ux * L, b.y - uy * L); ctx.stroke(); }
    else if (s === 1) { ctx.globalAlpha = .45; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 5; i++) { const k = i / 5, w = Math.sin(t * 40 + k * 7 + b.x) * 5 * k; ctx.lineTo(b.x - ux * L * k - uy * w, b.y - uy * L * k + ux * w); } ctx.stroke(); }
    else { ctx.globalAlpha = .5; ctx.fillStyle = c; for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(b.x - ux * i * L * .3, b.y - uy * i * L * .3, 3.4 - i * .7, 0, TAU); ctx.fill(); } }
    ctx.restore();
  };
  const de = damageEnemy;
  damageEnemy = function (e, dmg, crit, chained) {
    if (!chained && Visual55.lvl() >= 1 && e && !e.dead) {
      let nb = null, bd = 1e9; for (const b of G.pb) { if (b.dead) continue; const d = Math.hypot(b.x - e.x, b.y - e.y); if (d < bd) { bd = d; nb = b; } }
      if (nb && bd < e.rad + 40) { const c = okc(nb.c) ? nb.c : wc(nb.w), s = sty(nb.w), n = s === 0 ? 4 : s === 1 ? 6 : 3; for (let i = 0; i < n; i++) { const a = s === 2 ? -Math.PI / 2 + rand(-1.2, 1.2) : rand(0, TAU); G.parts.push({ x: nb.x, y: nb.y, vx: Math.cos(a) * rand(80, 260), vy: Math.sin(a) * rand(80, 260), life: .28, max: .28, r: rand(2, 4), c: i % 2 ? c : '#ffffff', drag: 2.5 }); } G.parts.push({ k: 'flash', x: nb.x, y: nb.y, vx: 0, vy: 0, life: .09, max: .09, r: crit ? 36 : 22, c, drag: 1 }); }
    }
    return de(e, dmg, crit, chained);
  };
}

// ---------- tela de derrota cinematografica: a nave se desfaz em cacos e estrelas caem ----------
{
  const ov = Screens.over;
  Screens.over = function () {
    ov.call(this); if (QL() < 1) return; const t = World.t - (G.overAt ?? World.t), p = G.player, t2 = World.t;
    if (t < .05) Visual58.deadX = undefined;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) { const sx = (i * 197 + 60) % W, k = ((t2 * .35 + i * .13) % 1), y = -40 + k * (H + 80), x = sx - k * 160; ctx.globalAlpha = .5 * Math.sin(k * Math.PI); ctx.strokeStyle = i % 2 ? '#ffe9a8' : '#ff9ac0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 46, y - 74); ctx.stroke(); drawGlow(x, y, 9, '#fff0b0', .7); }
    if (p && t < 2.6) {
      if (Visual58.deadX === undefined) { Visual58.deadX = p.x; Visual58.deadY = p.y; }
      const px = Visual58.deadX, py = Visual58.deadY;
      for (let i = 0; i < 16; i++) { const a = i * 2.399 + .4, sp = 90 + (i * 37) % 160, d = Math.min(t, 2.6), x = px + Math.cos(a) * sp * d, y = py + Math.sin(a) * sp * d + 48 * d * d, f = clamp(1 - d / 2.6, 0, 1); ctx.save(); ctx.translate(x, y); ctx.rotate(a * 3 + d * (i % 2 ? 4 : -4)); ctx.globalAlpha = f; ctx.fillStyle = i % 3 ? '#b98cff' : '#e2d4ff'; ctx.beginPath(); ctx.moveTo(0, -12 - i % 4 * 3); ctx.lineTo(8 + i % 3 * 2, 9); ctx.lineTo(-8, 7); ctx.closePath(); ctx.fill(); drawGlow(0, 0, 14, '#ff9a6a', f * .5); ctx.restore(); }
    }
    ctx.restore();
  };
}

// ---------- vitoria: cartoes de resumo ----------
{
  const cl = Screens.clear;
  Screens.clear = function () {
    cl.call(this); if (QL() < 1 || !G.result) return; const r = G.result, t = World.t - (G.clearAt ?? World.t), mm = Math.floor((r.time || 0) / 60), ss = Math.floor((r.time || 0) % 60);
    const cards = [['TEMPO', mm + ':' + String(ss).padStart(2, '0'), '#7fe0ff'], ['ESTRELAS', '★ ' + (r.coins || 0), '#ffe9a8'], ['DERROTADOS', String(r.kills || 0), '#ff9ac0'], ['MAIOR COMBO', 'x' + (r.maxCombo || 0), '#ffb340']];
    cards.forEach(([lab, val, c], i) => {
      const k = easeOut(clamp((t - .9 - i * .15) / .4, 0, 1)); if (k <= 0) return; const w = 190, x = 235 + i * 205, y = 648 + (1 - k) * 40;
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(14,6,40,.85)'; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, w, 56, 14); ctx.fill(); ctx.stroke();
      txt(lab, x + w / 2, y + 7, 12, c, 'center', 800); txt(val, x + w / 2, y + 24, 24, '#fff', 'center', 900); ctx.restore();
    });
  };
}

// ---------- letreiros: letras que entram girando, seguram e se abrem ----------
{
  Visual58.sign = (text, c, o = {}) => { Visual58.signs.push({ text, c, t: 0, dur: o.dur || 1.7, y: o.y || H * .34, size: o.size || 96 }); if (Visual58.signs.length > 3) Visual58.signs.shift(); };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    Visual58.nb = 0; const hadMk = Visual52.mk, b0 = G.boss && G.boss.state;
    up.call(this, dt);
    if (Visual52.mk && !hadMk) { Visual58.sign(Visual52.mk.text, Visual52.mk.c, { size: 78, y: H * .26, dur: 1.4 }); Visual52.mk = null; }
    const b1 = G.boss && G.boss.state; if (b1 === 'fight' && b0 && b0 !== 'fight' && b0 !== 'dying') Visual58.sign('CHEFE!', '#ff8a5f', { size: 110, dur: 1.9 });
    if (Visual58.pend && G.stage && G.state === 'play') { Visual58.pend = false; if (!G.training) Visual58.sign('FASE ' + (G.stageIdx + 1), /^#[0-9a-f]{6}$/i.test(G.stage.tint) ? G.stage.tint : '#ffe9a8', { size: 100, y: H * .52, dur: 1.9 }); }
  };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const S = Visual58.signs; if (!S.length || G.state !== 'play') return;
    for (let n = S.length - 1; n >= 0; n--) {
      const s = S[n]; s.t += 1 / 60; if (s.t > s.dur) { S.splice(n, 1); continue; }
      const cc = /^#[0-9a-f]{6}$/i.test(s.c) ? s.c : '#ffe9a8', L = [...s.text], N = L.length, gap = s.size * .62, x0 = W / 2 - (N - 1) * gap / 2;
      ctx.save(); ctx.font = `900 ${s.size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const outK = clamp((s.t - (s.dur - .45)) / .45, 0, 1);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .5 * Math.min(1, s.t / .2) * (1 - outK); const bw = N * gap + 160, g = ctx.createLinearGradient(W / 2 - bw / 2, 0, W / 2 + bw / 2, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, cc); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - bw / 2, s.y - 3, bw, 6);
      ctx.globalCompositeOperation = 'source-over';
      L.forEach((ch, i) => {
        const k = easeBack(clamp((s.t - i * .045) / .35, 0, 1)), dir = i % 2 ? 1 : -1; if (k <= 0 || ch === ' ') return;
        const ox = (i - (N - 1) / 2) * gap * outK * .9, oy = dir * 80 * (1 - clamp((s.t - i * .045) / .3, 0, 1)) + outK * dir * -40, rot = dir * (1 - clamp((s.t - i * .045) / .35, 0, 1)) * .9 + outK * dir * .5;
        ctx.save(); ctx.translate(x0 + i * gap + ox, s.y + oy); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha = (1 - outK) * clamp(k * 2, 0, 1);
        ctx.lineJoin = 'round'; ctx.lineWidth = s.size * .12; ctx.strokeStyle = 'rgba(14,4,28,.9)'; ctx.strokeText(ch, 0, 0); ctx.shadowColor = cc; ctx.shadowBlur = 18; ctx.fillStyle = '#fff'; ctx.fillText(ch, 0, 0); ctx.restore();
      });
      ctx.restore();
    }
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { Visual58.signs.length = 0; Visual58.pend = true; return ss.call(this, i, o); };
}
