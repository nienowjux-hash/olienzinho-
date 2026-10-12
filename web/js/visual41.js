'use strict';
// ---------- 41: tentaculos e placas nos chefes, extras animados nos inimigos comuns, camera cinematografica, fundo que reage,
// luz e sombra dinamicas, modo Ultra, dicas ilustradas, expressoes novas do Olienzinho e moldura nos icones ----------
const Visual41 = { dustN: 16 };
const h41 = c => typeof c === 'string' && c.length === 7 && c[0] === '#';
const ULTRA = () => !!(Save.data.settings && Save.data.settings.ultra);

// ---------- chefes: tentaculos com fisica e placas que orbitam com atraso ----------
{
  const bd = Visual3.bossDraw;
  Visual3.bossDraw = function (b) {
    if (!b || QL() < 2 || b.state === 'intro' || b.state === 'dying' || /Leviathan|Herald/.test(b.constructor.name)) return bd.call(this, b);
    const col = h41(b.col) ? b.col : '#ffb340', rad = (b.rad || 100), ph = b.phase || 0, A = b._v41 = b._v41 || { tend: [], plates: [] };
    if (!A.tend.length) for (let i = 0; i < 4; i++) A.tend.push({ a: -Math.PI / 2 + (i - 1.5) * .9 + (i > 1 ? .4 : -.4), pts: Array.from({ length: 9 }, () => ({ x: b.x, y: b.y })) });
    // tentaculos: cada ponto segue o anterior com atraso e um pouco de gravidade
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const T of A.tend) {
      const ax = b.x + Math.cos(T.a) * rad * .75, ay = b.y + Math.sin(T.a) * rad * .75; T.pts[0].x = ax; T.pts[0].y = ay;
      for (let k = 1; k < T.pts.length; k++) { const p = T.pts[k], q = T.pts[k - 1]; p.y += .4; let dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy) || 1, L = 16 + rad * .06; p.x = q.x + dx / d * L + Math.sin(World.t * 2 + k + T.a) * .5; p.y = q.y + dy / d * L; }
      for (let pass = 0; pass < 2; pass++) { ctx.beginPath(); T.pts.forEach((p, k) => k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.strokeStyle = pass ? col : 'rgba(10,0,25,.75)'; ctx.lineWidth = pass ? 3 : 7; ctx.globalAlpha = pass ? .85 : 1; ctx.stroke(); }
      const e = T.pts[T.pts.length - 1]; ctx.globalCompositeOperation = 'lighter'; drawGlow(e.x, e.y, 16, col, .6); ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    bd.call(this, b);
    // placas orbitando (mais a cada fase de furia), seguindo com atraso
    const n = 4 + ph * 3; while (A.plates.length < n) A.plates.push({ x: b.x, y: b.y }); A.plates.length = n;
    ctx.save(); A.plates.forEach((p, i) => {
      const an = World.t * (.5 + ph * .15) + i * TAU / n, tx = b.x + Math.cos(an) * rad * 1.2, ty = b.y + Math.sin(an) * rad * .9; p.x += (tx - p.x) * .1; p.y += (ty - p.y) * .1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(an * 2); ctx.fillStyle = 'rgba(20,8,45,.85)'; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 14, col, .35); ctx.restore();
    }); ctx.restore();
  };
}

// ---------- inimigos comuns: extras animados + luz e sombra dinamicas ----------
Visual41.light = function (e) {
  let best = null, bd = 260; for (const b of G.pb) { if (b.dead) continue; const d = Math.hypot(b.x - e.x, b.y - e.y); if (d < bd) { bd = d; best = { x: b.x, y: b.y, c: h41(b.c) ? b.c : '#b98cff', k: 1 - d / 260 }; } }
  const p = G.player; if (!best && p && !p.dead) best = { x: p.x, y: p.y, c: '#b98cff', k: .35 }; return best;
};
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    if (!e || e.dead || QL() < 2 || e.type === 'dummy' || typeof e.x !== 'number') return ae.call(this, e);
    const r = e.rad || 24, L = Visual41.light(e); let dx = 0, dy = 0;
    if (L) { dx = e.x - L.x; dy = e.y - L.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d; ctx.save(); ctx.fillStyle = 'rgba(0,0,0,' + (.14 + L.k * .12) + ')'; ctx.beginPath(); ctx.ellipse(e.x + dx * r * .35, e.y + r * .85 + dy * r * .2, r * .85, r * .3, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    const res = ae.call(this, e);
    ctx.save(); ctx.translate(e.x, e.y); const t = World.t + (e.ph || 0), age = e.age || 0;
    if (e.type === 'shooter') { const p = G.player, a = p ? Math.atan2(p.y - e.y, p.x - e.x) : Math.PI / 2, rec = e.shootT !== undefined && e.shootT < .15 ? 4 : 0; ctx.rotate(a); ctx.fillStyle = '#2a1040'; ctx.strokeStyle = '#ff4aa0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(r * .45 - rec, -5, r * .75, 10, 4); ctx.fill(); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; drawGlow(r * 1.2 - rec, 0, 9, '#ff4aa0', .6 + (e.shootT < .45 ? .3 : 0)); }
    else if (e.type === 'tank') { ctx.strokeStyle = 'rgba(30,10,5,.7)'; ctx.lineWidth = 3; for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const y = ((age * 40 + k * r * .5) % (r * 2)) - r; ctx.beginPath(); ctx.moveTo(s * r * .98, y); ctx.lineTo(s * r * .82, y); ctx.stroke(); } }
    else if (e.type === 'mine') { ctx.fillStyle = '#ff4a4a'; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t * .6, l = r + 4 + Math.sin(t * 5 + k) * 3; ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(r * .9, -3); ctx.lineTo(l, 0); ctx.lineTo(r * .9, 3); ctx.fill(); ctx.restore(); } }
    else if (e.type === 'kami') { const a = Math.atan2(e.vy || 1, e.vx || 0) + Math.PI; ctx.globalCompositeOperation = 'lighter'; for (let k = 1; k < 5; k++) drawGlow(Math.cos(a) * r * k * .7, Math.sin(a) * r * k * .7, r * (1.1 - k * .15), k % 2 ? '#ff4a6e' : '#ffb340', .4 - k * .06); }
    else if (e.type === 'shield' && e.shield > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(127,224,255,.5)'; ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t * 1.2; ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5, 5, 0, TAU); ctx.stroke(); } }
    else if (e.type === 'zig') { const H_ = e._h = e._h || []; H_.push([e.x, e.y]); if (H_.length > 7) H_.shift(); ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; H_.forEach(([x, y], i) => { if (i % 2) return; ctx.globalAlpha = i / H_.length * .3; ctx.fillStyle = '#7fb8ff'; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * .6, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * .6, y); ctx.fill(); }); }
    ctx.restore();
    if (L && L.k > .15) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(e.x - dx * r * .7, e.y - dy * r * .7, r * .9, L.c, .22 * L.k * 2); ctx.restore(); }
    return res;
  };
}

// ---------- camera cinematografica ----------
{
  const hp = hurtPlayer;
  hurtPlayer = function (d) { const p = G.player, b = p ? p.hp : 0; const r = hp(d); if (p && p.hp < b && (b - p.hp >= 2 || p.hp <= 2)) { G.zoomCx = p.x; G.zoomCy = p.y; G.zoom = Math.max(G.zoom || 0, .07); } return r; };
  const ke = killEnemy;
  killEnemy = function (e, by) { const big = e && (e.mini || e.elite || e.type === 'captain'); const r = ke(e, by); if (big && e.dead && QL() >= 1) { G.zoomCx = e.x; G.zoomCy = e.y; G.zoom = Math.max(G.zoom || 0, .05); } return r; };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    up.call(this, dt); const b = G.boss; for (const rg of G.rings) if (rg.max >= 250 && !rg._p) { rg._p = 1; Visual41.bgPulse = Math.min(1, (Visual41.bgPulse || 0) + .6); } Visual41.bgPulse = Math.max(0, (Visual41.bgPulse || 0) - dt * 1.4);
    if (b && b.state === 'intro' && G.state === 'play' && QL() >= 1) { const k = clamp((b.introT || 0) / 3, 0, 1); G.zoomCx = b.x; G.zoomCy = b.y; G.zoom = Math.max(G.zoom || 0, .035 + .08 * Math.sin(k * Math.PI)); Visual37.tilt = Math.sin(World.t * 1.1) * .012 * Math.sin(k * Math.PI); }
    // poeira do fundo empurrada pelos tiros
    if (QL() >= 2 && Visual36.dust) { const n = ULTRA() ? 44 : 16; while (Visual36.dust.length < n) Visual36.dust.push({ x: rand(0, W), y: rand(-80, H), v: rand(520, 900), l: rand(30, 70), a: rand(.06, .16) }); Visual36.dust.length = Math.min(Visual36.dust.length, n); for (const d of Visual36.dust) for (const q of G.pb) { if (Math.abs(q.y - d.y) < 40 && Math.abs(q.x - d.x) < 60) { d.x += (d.x - q.x) * .06; break; } } }
  };
  const bi = Visual.biome;
  Visual.biome = function () { bi.call(this); const k = Visual41.bgPulse || 0; if (k > .02 && G.stage && QL() >= 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 700); const c = h41(G.stage.tint) ? G.stage.tint : '#8b4dff'; g.addColorStop(0, c + '55'); g.addColorStop(1, c + '00'); ctx.globalAlpha = k * .5; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); } };
}

// ---------- Ultra: suavizacao alta nos sprites ----------
addEventListener('load', () => { const rd = render; render = function () { try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = ULTRA() ? 'high' : 'medium'; } catch (e) { } rd(); }; });

// ---------- dica ilustrada no cartao de inicio de fase ----------
Visual41.TIPS = [['ESP', 'Pulso apaga tiros inimigos próximos. Use quando o céu encher.'], ['SHIFT', 'A esquiva deixa você invencível por um instante.'], ['F', 'Rebater devolve o tiro ao inimigo, mas tem recarga.'], ['Q', 'O especial da arma recarrega mais rápido com combo alto.'], ['R', 'A arma secundária tem recarga própria. Escolha no Hangar.'], ['★', 'Fusões de armas somam o bônus das duas. Faça no Hangar → Oficina.'], ['♥', 'Com pouca vida, a nave solta fumaça. Fique atento aos corações.'], ['!', 'O Caçador aparece se você ficar parado. Mexa-se!']];
{
  const ss = Game.startStage; Game.startStage = function (i, o) { const r = ss.call(this, i, o); if (Visual39.card) Visual39.card.tip = pick(Visual41.TIPS); return r; };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const C = Visual39.card; if (!C || !C.tip || G.state !== 'play') return; const t = World.t - C.t0; if (t < .6 || t > 2.8) return; const a = clamp((t - .6) / .4, 0, 1) * clamp((2.8 - t) / .5, 0, 1);
    ctx.save(); ctx.globalAlpha = a; UI.panel(78, 430, 520, 54, { r: 27, fill: 'rgba(14,6,40,.82)', stroke: C.c }); ctx.fillStyle = C.c; ctx.beginPath(); ctx.arc(106, 457, 18, 0, TAU); ctx.fill(); txt(C.tip[0], 106, 457, C.tip[0].length > 2 ? 10 : 15, '#1a0a3a', 'center', 900, 'middle'); txt(C.tip[1], 136, 446, 15, '#e2d4ff', 'left', 700); ctx.restore();
  };
}

// ---------- icones com moldura unica ----------
{
  const ui = Visual2.upIcon;
  Visual2.upIcon = function (id, x, y, s, c, f) { ctx.save(); ctx.strokeStyle = c; ctx.globalAlpha = .45; ctx.lineWidth = Math.max(1.5, s * .07); ctx.beginPath(); ctx.arc(x, y, s * 1.2, 0, TAU); ctx.stroke(); ctx.restore(); return ui.call(this, id, x, y, s, c, f); };
}

// ---------- novas expressoes do Olienzinho: orgulhoso, cansado, apaixonado ----------
{
  const fo = Portraits.face_O;
  Portraits.face_O = function (mood, t, talk) {
    if (mood === 'proud') { fo.call(this, 'happy', t, talk); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [x, y] of [[-70, -90], [70, -80], [0, -125]]) { const k = .6 + .4 * Math.sin(t * 5 + x); ctx.fillStyle = '#fff6c0'; ctx.save(); ctx.translate(x, y); ctx.rotate(t); ctx.scale(k, k); ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 4 : 14; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.restore(); } ctx.restore(); return; }
    if (mood === 'tired') { fo.call(this, 'sad', t, talk); ctx.save(); ctx.fillStyle = 'rgba(150,220,255,.85)'; const y = -70 + (t * 30 % 60); ctx.beginPath(); ctx.moveTo(64, y - 10); ctx.quadraticCurveTo(76, y + 6, 64, y + 12); ctx.quadraticCurveTo(52, y + 6, 64, y - 10); ctx.fill(); ctx.fillStyle = 'rgba(30,10,60,.35)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 30, 40, 22, 6, 0, 0, TAU); ctx.fill(); } ctx.restore(); return; }
    if (mood === 'love') { fo.call(this, 'happy', t, talk); ctx.save(); ctx.fillStyle = '#ff6a9a'; for (let i = 0; i < 3; i++) { const k = ((t * .6 + i / 3) % 1), x = -50 + i * 50 + Math.sin(t * 3 + i) * 10, y = -60 - k * 90; ctx.globalAlpha = 1 - k; ctx.save(); ctx.translate(x, y); ctx.scale(.9, .9); ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-18, -2, -12, -16, 0, -6); ctx.bezierCurveTo(12, -16, 18, -2, 0, 10); ctx.fill(); ctx.restore(); } ctx.restore(); return; }
    return fo.call(this, mood, t, talk);
  };
  // usos: rosto cansado quando a vida esta muito baixa, orgulhoso no fim de fase e apaixonado na vitoria da Expedicao
  const cel = Screens.celebrate; Screens.celebrate = function () { cel.call(this); const t = G.celT || 0; if (t > .6) { ctx.save(); ctx.globalAlpha = clamp((t - .6) / .5, 0, 1); Portraits.draw('O', 150, 190, 150, { mood: 'proud', t: World.t }); ctx.restore(); } };
  const xe = Screens.expend; Screens.expend = function () { xe.call(this); const r = Visual32.run; if (r) { ctx.save(); Portraits.draw('O', 190, 330, 170, { mood: r.win ? 'love' : 'tired', t: World.t }); ctx.restore(); } };
}
