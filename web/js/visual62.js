'use strict';
// ---------- 62: barras do HUD com brilho, fundos de cena em camadas, vitrine de trofeus, inimigos expressivos, skins com assinatura,
// explosoes por tamanho, calor e agua nos fundos, balao de fala, pausa desfocada, modo foto e qualidade adaptativa ----------
const Visual62 = { snap: null, snapT: -1, ft: 16, slow: 0, cap: null, sp: [], pt: 0 };
const ok62 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const h62 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- 1. HUD: brilho correndo na barra de nivel, reflexo de vidro e habilidades prontas com faiscas ----------
{
  const dh = Game.drawHud;
  Game.drawHud = function () {
    const r = dh.call(this), p = G.player; if (QL() < 1 || !p) return r; const t = World.t;
    ctx.save();
    const xw = W * clamp(G.xp / G.xpNeed, 0, 1);
    if (xw > 4) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, xw, 8); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; const gx = ((t * 260) % (W + 200)) - 100, g = ctx.createLinearGradient(gx - 60, 0, gx + 60, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, xw, 8); ctx.restore(); }
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(0, 0, W, 3);
    ctx.translate(0, H); ctx.scale(.62, .62); ctx.translate(0, -H);
    const wp = WEAPONS[p.weapon]; if (wp) [[p.pulseT, p.pulseCd, '#ffb340'], [p.dashCd, p.dashCdMax, '#7fe0ff'], [p.specCd, p.specCdMax, wp.c]].forEach(([cd, mx, col], i) => {
      if (cd > 0 || !ok62(col)) return; const cx = 56 + i * 112, cy = H - 66; ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) { const a = t * 2.2 + k * 2.094 + i; drawGlow(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, 5, col, .9); }
    });
    ctx.restore(); return r;
  };
}

// ---------- 2 e 3. cenas da historia em camadas e vitrine de conquistas ----------
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    const r = sb.call(this); const S = G.story, pg = S && this.curPage(S); if (QL() < 1 || !pg || pg.video) return r;
    let h = 0; const key = String(pg.scene || pg.who || 'x'); for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0; const sd = Math.abs(h) % 89, t = World.t, mx = (Input.mouse.x - W / 2) / W;
    ctx.save();
    for (let i = 0; i < 3; i++) { const d = .5 + i * .5, x = h62(sd + i * 7) * W - mx * 30 * d + Math.sin(t * .1 + i) * 14, y = H - 20 - i * 10, rr = 90 + h62(sd + i) * 120; ctx.globalAlpha = .55; ctx.fillStyle = '#05010f'; ctx.beginPath(); ctx.ellipse(x, y + rr * .35, rr * 1.2, rr * .6, 0, 0, TAU); ctx.fill(); }
    const g = ctx.createLinearGradient(0, H - 200, 0, H); g.addColorStop(0, 'rgba(10,4,30,0)'); g.addColorStop(1, 'rgba(10,4,30,.55)'); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, H - 200, W, 200);
    ctx.restore(); return r;
  };
  const tail = Screens.story;
  Screens.story = function () {
    const r = tail.call(this); const S = G.story, pg = S && this.curPage(S); if (!pg || !pg.who || pg.who === 'N' || pg.title || pg.mission || QL() < 1) return r; const ch = CHARS[pg.who]; if (!ch || !ok62(ch.c)) return r;
    ctx.save(); ctx.globalAlpha = .55 * clamp(S.t / .3, 0, 1); ctx.fillStyle = ch.c; ctx.beginPath(); ctx.moveTo(262, 530); ctx.lineTo(262, 574); ctx.lineTo(236, 552); ctx.closePath(); ctx.fill(); ctx.restore(); return r;
  };
  for (const name of ['achievements', 'gallery']) {
    const f = Screens[name]; if (!f) continue;
    Screens[name] = function () {
      const r = f.call(this); if (QL() < 1) return r; const t = World.t;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { const x = W * (.2 + i * .3) + Math.sin(t * .4 + i * 2) * 60, g = ctx.createLinearGradient(x, 0, x + 60, H); g.addColorStop(0, 'rgba(255,233,168,.1)'); g.addColorStop(1, 'rgba(255,233,168,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 20, 0); ctx.lineTo(x + 20, 0); ctx.lineTo(x + 200, H); ctx.lineTo(x - 120, H); ctx.closePath(); ctx.fill(); }
      const fl = ctx.createLinearGradient(0, H - 110, 0, H); fl.addColorStop(0, 'rgba(255,255,255,0)'); fl.addColorStop(1, 'rgba(190,160,255,.18)'); ctx.fillStyle = fl; ctx.fillRect(0, H - 110, W, 110);
      ctx.strokeStyle = 'rgba(190,160,255,.12)'; ctx.lineWidth = 1; for (let k = -8; k <= 8; k++) { ctx.beginPath(); ctx.moveTo(W / 2 + k * 40, H - 110); ctx.lineTo(W / 2 + k * 160, H); ctx.stroke(); }
      ctx.restore(); return r;
    };
  }
}

// ---------- 4. inimigos expressivos: tremor ao levar dano, sobrancelhas e aura quando quase mortos ----------
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    if (QL() < 1 || e.type === 'dummy') return ae.call(this, e);
    const low = e.maxHp > 6 && e.hp / e.maxHp < .3 && !e.mini; if (e.hit > 0) { ctx.save(); ctx.translate(rand(-3, 3), rand(-2, 2)); ae.call(this, e); ctx.restore(); } else ae.call(this, e);
    if (low) { ctx.save(); ctx.translate(e.x, e.y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, e.rad * 2, '#ff3a2a', .22 + .1 * Math.sin(World.t * 10)); ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#2a0610'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-e.rad * .5, -e.rad * .38); ctx.lineTo(-e.rad * .08, -e.rad * .2); ctx.moveTo(e.rad * .5, -e.rad * .38); ctx.lineTo(e.rad * .08, -e.rad * .2); ctx.stroke(); ctx.restore(); }
  };
}

// ---------- 5. skins com assinatura: faiscas orbitando e rastro proprio ----------
{
  const sh = Art.ship;
  Art.ship = function (x, y, o) {
    const r = sh.call(this, x, y, o); if (QL() < 1 || !o || o.orbi || o.scale && o.scale < .6) return r;
    const P = o.pal, c = P && ok62(P.glow) ? P.glow : null; if (!c) return r; const inPlay = G.state === 'play' && G.player && Math.abs(x - G.player.x) < 2, inHg = G.state === 'hangar'; if (!inPlay && !inHg) return r;
    const k = o.scale || 1, t = World.t, sig = (c.charCodeAt(1) + c.charCodeAt(3) + c.charCodeAt(5)) % 3;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) { const a = t * (sig === 1 ? 2.6 : 1.7) + i * Math.PI; drawGlow(x + Math.cos(a) * 52 * k, y + Math.sin(a) * 30 * k, 5 * k + 2, '#ffffff', .8); drawGlow(x + Math.cos(a) * 52 * k, y + Math.sin(a) * 30 * k, 12 * k + 4, c, .5); }
    ctx.restore();
    if (inPlay && ((World.t * 60) | 0) % 4 === 0) G.parts.push(sig === 0 ? { x: x + rand(-6, 6), y: y + 52, vx: rand(-20, 20), vy: rand(60, 120), life: .45, max: .45, r: rand(2, 4), c, drag: 1 } : sig === 1 ? { k: 'flash', x: x + rand(-10, 10), y: y + 50, vx: 0, vy: 40, life: .18, max: .18, r: 14, c, drag: 1 } : { x: x + rand(-22, 22), y: y + 40, vx: rand(-30, 30), vy: rand(30, 90), life: .6, max: .6, r: rand(2, 3), c: '#ffffff', drag: 1.5 });
    return r;
  };
}

// ---------- 6. explosoes por tamanho e mortes de chefe com assinatura ----------
{
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e && !e.dead, x = e && e.x, y = e && e.y, R = e && e.rad || 24, c = e && ok62(e.glow) ? e.glow : '#ffb340'; const r = ke(e, by);
    if (was && e.dead && QL() >= 1 && typeof Visual55 !== 'undefined' && Visual55.lvl() >= 1) {
      if (R < 26) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + rand(0, 1); G.parts.push({ x, y, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, life: .3, max: .3, r: 3, c, drag: 3 }); } }
      else if (R < 40) shockwave(x, y, 110, c);
      else { shockwave(x, y, 190, c); shockwave(x, y, 120, '#ffffff'); G.parts.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .3, max: .3, r: R * 3, c: '#ffffff', drag: 1 }); shedDebris(x, y, 8, [c, '#3a1050'], 360, 9); }
    }
    return r;
  };
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () {
    const b = G.boss, n = b && b.constructor.name, x = b ? b.x : W / 2, y = b ? b.y : 200, r = bd.apply(this, arguments);
    if (QL() >= 1 && n) {
      if (n === 'RockGolem') shedDebris(x, y, 40, ['#d8c09a', '#6a4a30', '#ffb06a'], 520, 14);
      else if (n === 'StormEye') for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; shockwave(x + Math.cos(a) * 60, y + Math.sin(a) * 40, 120, '#e8f6ff'); }
      else if (n === 'SunGuardian') { for (let i = 0; i < 4; i++) shockwave(x, y, 200 + i * 130, i % 2 ? '#fff1b0' : '#ffcf5a'); }
      else if (n === 'MotherShip') burst(x, y, ['#ffd36a', '#ffb340', '#ffffff'], 70, 520, 9);
      else if (n === 'Leviathan') { for (let i = 0; i < 4; i++) shockwave(x, y + 30, 160 + i * 110, '#7fe0ff'); }
      else if (n === 'Mirror') shedDebris(x, y, 36, ['#ffffff', '#c8e8ff', '#b98cff'], 600, 10);
      else if (n === 'VoidBoss') { for (let i = 0; i < 3; i++) shockwave(x, y, 260 + i * 120, '#8a4aff'); }
    }
    return r;
  };
}

// ---------- 7. calor (lava/sol) e agua (reflexos) nos fundos ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); if (G.state !== 'play' || QL() < 2 || !G.stage) return; const nm = (G.stage.name || '').toLowerCase(), t = World.t;
    const hot = /sol|lava|fogo|brasa|forja|vulc/.test(nm), wet = /oceano|mar|ábis|abis|lago|gelo|cristal/.test(nm); if (!hot && !wet) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (hot) { for (let i = 0; i < 6; i++) { const y = H - 30 - i * 56, a = .05 + .02 * Math.sin(t * 2 + i); ctx.globalAlpha = a; ctx.fillStyle = '#ff9a4a'; ctx.beginPath(); for (let x = 0; x <= W; x += 32) { const yy = y + Math.sin(x * .02 + t * 2 + i) * 8; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.lineTo(W, y + 22); ctx.lineTo(0, y + 22); ctx.closePath(); ctx.fill(); } }
    else { ctx.strokeStyle = '#bfefff'; ctx.lineWidth = 1.4; for (let i = 0; i < 9; i++) { ctx.globalAlpha = .07 + .04 * Math.sin(t + i); ctx.beginPath(); for (let x = 0; x <= W; x += 28) { const y = 80 + i * 70 + Math.sin(x * .015 + t * 1.2 + i * 1.7) * 14 + Math.sin(x * .04 - t * .8) * 5; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); } }
    ctx.restore();
  };
}

// ---------- 9. pausa: fundo desfocado do jogo e painel que entra suave ----------
{
  const ps = Screens.pause;
  Screens.pause = function () {
    if (QL() >= 1) {
      if (!Visual62.snap || Visual62.snapT !== G.pausedAt) {
        try { const c = document.createElement('canvas'); c.width = 320; c.height = 180; const g = c.getContext('2d'); g.filter = 'blur(3px)'; g.drawImage(cv, 0, 0, c.width, c.height); g.filter = 'none'; Visual62.snap = c; Visual62.snapT = G.pausedAt; Visual62.pt = World.t; } catch (e) { Visual62.snap = null; }
      }
      if (Visual62.snap) { ctx.globalAlpha = .9; ctx.drawImage(Visual62.snap, 0, 0, W, H); ctx.globalAlpha = 1; }
    }
    const k = easeOut(clamp((World.t - Visual62.pt) / .25, 0, 1)); ctx.save(); ctx.globalAlpha = QL() >= 1 ? k : 1; ctx.translate(0, QL() >= 1 ? (1 - k) * 18 : 0); const r = ps.call(this); ctx.restore(); return r;
  };
  const sp = Game.updatePlay; Game.updatePlay = function (dt) { G.pausedAt = World.t; Visual62.snap = null; return sp.call(this, dt); };
}

// ---------- 10. modo foto: filtros novos ----------
if (typeof PF !== 'undefined' && PF.length < 8) { PF.push(['CINEMA', 'contrast(1.18) saturate(.85) sepia(.18) brightness(.95)'], ['NEON', 'saturate(1.8) contrast(1.15) hue-rotate(-18deg)'], ['VINTAGE', 'sepia(.6) contrast(1.05) saturate(.9) brightness(1.05)']); }

// ---------- 11. qualidade adaptativa: agora no visual65 (governador unico) ----------
