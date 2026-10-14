'use strict';
// ---------- 43: cosmeticos novos (rastros, auras, molduras e asas), modo foto livre (F10) ----------
const Visual43 = { ph: null };
COSM.trail.items.push(['cometa', 'Cometa', 350], ['pixel', 'Pixels', 300], ['flor', 'Pétalas', 350]);
COSM.aura.items.push(['eclipse', 'Eclipse', 500], ['coracoes', 'Corações', 400]);
COSM.frame.items.push(['neon', 'Neon', 350], ['vidro', 'Vidro', 350]);
COSM.wing = { label: 'ASAS', items: [['none', 'Sem asas', 0], ['anjo', 'Asas de Anjo', 450], ['morcego', 'Asas Sombrias', 450], ['lamina', 'Lâminas de Energia', 500]] };

// ---------- rastros e auras ----------
{
  const tf = Visual29.trailFx;
  Visual29.trailFx = function (id, x, y, t, P, rate) {
    if (!['cometa', 'pixel', 'flor'].includes(id)) return tf.call(this, id, x, y, t, P, rate);
    if (Math.random() > rate) return; const a = (c, o) => P.push(Object.assign({ x: x + rand(-8, 8), y: y + 26, vx: rand(-20, 20), vy: rand(80, 150), life: .8, max: .8, r: rand(3, 6), c, drag: 1 }, o));
    if (id === 'cometa') { a('#ffffff', { r: rand(5, 8), life: .5, max: .5, vy: rand(40, 80) }); a('#7fd8ff', { r: rand(7, 11), life: 1, max: 1, vy: rand(60, 110) }); a('#2b7bff', { r: rand(10, 15), life: 1.3, max: 1.3, vy: rand(30, 60) }); }
    else if (id === 'pixel') { const gx = Math.round((x + rand(-14, 14)) / 8) * 8, gy = Math.round((y + 28) / 8) * 8; P.push({ x: gx, y: gy, vx: 0, vy: rand(50, 110), life: .7, max: .7, r: 4, c: pick(['#33ff9a', '#ff4ad0', '#ffe04a', '#4ac8ff']), drag: 0 }); }
    else { a(pick(['#ffc8e0', '#ffffff', '#ff9ac0']), { r: rand(4, 7), vx: rand(-60, 60), vy: rand(30, 80), life: 1.4, max: 1.4, drag: .6, x: x + rand(-20, 20) }); }
  };
  const af = Visual29.auraFx;
  Visual29.auraFx = function (id, x, y, t) {
    if (id === 'eclipse') { ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = '#0a0414'; ctx.beginPath(); ctx.arc(x, y, 40, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { ctx.strokeStyle = ['#ffe9a8', '#ffb340', '#ff6a1a'][k]; ctx.globalAlpha = .7 - k * .18; ctx.lineWidth = 5 - k; ctx.beginPath(); ctx.arc(x, y, 44 + k * 5 + Math.sin(t * 4 + k) * 2, 0, TAU); ctx.stroke(); } drawGlow(x, y, 80, '#ffb340', .3); ctx.restore(); return; }
    if (id === 'coracoes') { ctx.save(); ctx.fillStyle = '#ff6a9a'; for (let i = 0; i < 6; i++) { const k = (t * .5 + i / 6) % 1, a = i * TAU / 6 + t * .8, r = 36 + k * 30; ctx.globalAlpha = 1 - k; ctx.save(); ctx.translate(x + Math.cos(a) * r, y + Math.sin(a) * r - k * 20); ctx.scale(.55, .55); ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-18, -2, -12, -16, 0, -6); ctx.bezierCurveTo(12, -16, 18, -2, 0, 10); ctx.fill(); ctx.restore(); } ctx.restore(); return; }
    return af.call(this, id, x, y, t);
  };
}

// ---------- molduras novas ----------
{
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o) {
    pd.call(this, who, x, y, size, o); const f = (Save.data.cosm && Save.data.cosm.eq && Save.data.cosm.eq.frame) || 'padrao'; if (who !== 'O' || !['neon', 'vidro'].includes(f)) return; const t = World.t, s = size * .5 + 4;
    ctx.save(); ctx.translate(x, y);
    if (f === 'neon') { for (const [c, w, ex] of [['#33e0ff', 6, 0], ['#ff4ad0', 3, 6]]) { ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 18; ctx.lineWidth = w; ctx.beginPath(); ctx.roundRect(-s - ex, -s - ex, (s + ex) * 2, (s + ex) * 2, 20 + ex); ctx.stroke(); } }
    else { ctx.strokeStyle = 'rgba(220,240,255,.8)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(-s, -s, s * 2, s * 2, 22); ctx.stroke(); ctx.fillStyle = 'rgba(200,230,255,.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-s + 14, -s + 8); ctx.lineTo(-s + 8, -s + 40); ctx.moveTo(-s + 24, -s + 8); ctx.lineTo(-s + 20, -s + 20); ctx.stroke(); const sw = ((t * .4) % 1) * s * 3 - s * 1.2; ctx.save(); ctx.beginPath(); ctx.roundRect(-s, -s, s * 2, s * 2, 22); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.translate(sw, 0); ctx.rotate(.5); ctx.fillRect(-12, -s * 2, 24, s * 4); ctx.restore(); }
    ctx.restore();
  };
}

// ---------- asas (desenhadas atras da nave, tambem na previa e no Hangar) ----------
Visual43.wing = () => (G.state === 'cosmetics' && G.ctab === 'wing' && G.cpv) || (Save.data.cosm && Save.data.cosm.eq && Save.data.cosm.eq.wing) || 'none';
{
  const as = Art.ship;
  Art.ship = function (x, y, o) {
    const w = (!o || o.orbi || o.noWings) ? 'none' : Visual43.wing();
    if (w !== 'none') {
      const s = (o.scale || 1), t = World.t, fl = Math.sin(t * 3.2) * .14; ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * .24); ctx.scale(s, s);
      for (const sd of [-1, 1]) {
        ctx.save(); ctx.scale(sd, 1); ctx.translate(14, -8); ctx.rotate(-.35 - fl);
        if (w === 'anjo') { for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(-i * .22 + .3); const L = 70 - i * 6; const g = ctx.createLinearGradient(0, 0, L, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ffd36a'); ctx.fillStyle = g; ctx.globalAlpha = .92; ctx.beginPath(); ctx.ellipse(L / 2 + 6, 0, L / 2, 7, 0, 0, TAU); ctx.fill(); ctx.restore(); } ctx.globalCompositeOperation = 'lighter'; drawGlow(40, -10, 50, '#fff3c0', .3); }
        else if (w === 'morcego') { ctx.fillStyle = 'rgba(40,10,70,.92)'; ctx.strokeStyle = '#b06aff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, -34); ctx.lineTo(58, -6); ctx.lineTo(74, 14); ctx.lineTo(48, 12); ctx.lineTo(44, 34); ctx.lineTo(22, 16); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, -34); ctx.moveTo(0, 0); ctx.lineTo(74, 14); ctx.moveTo(0, 0); ctx.lineTo(44, 34); ctx.stroke(); }
        else { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(-.5 + i * .5); const L = 74 - i * 12; const g = ctx.createLinearGradient(0, 0, L, 0); g.addColorStop(0, 'rgba(160,240,255,.95)'); g.addColorStop(1, 'rgba(60,140,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(L, 0); ctx.lineTo(0, 4); ctx.fill(); ctx.restore(); } drawGlow(20, 0, 30, '#7fe0ff', .35); }
        ctx.restore();
      }
      ctx.restore();
    }
    return as.call(this, x, y, o);
  };
}

// ---------- modo foto livre (F10): congela a acao, move a camera, aproxima e salva ----------
addEventListener('keydown', e => {
  if (e.key === 'F10') { return; }
  if (false) { e.preventDefault(); if (G.state === 'play' || G.state === 'pause') { Visual43.prev = G.state; Visual43.ph = { x: 0, y: 0, z: 1, hud: false, help: 5 }; G.hideHud = true; G.state = 'photo'; } else if (G.state === 'photo') Visual43.exit(); }
});
addEventListener('wheel', e => { if (G.state === 'photo' && Visual43.ph) { Visual43.ph.z = clamp(Visual43.ph.z * (e.deltaY < 0 ? 1.1 : .91), .6, 3); } }, { passive: true });
Visual43.exit = function () { G.state = Visual43.prev || 'play'; G.hideHud = false; Visual43.ph = null; if (G.state === 'play') G.state = 'pause'; };
{
  const dp = Game.drawPlay;
  Game.drawPlay = function () {
    const P = Visual43.ph; if (G.state !== 'photo' || !P) return dp.call(this);
    ctx.save(); ctx.translate(W / 2 + P.x, H / 2 + P.y); ctx.scale(P.z, P.z); ctx.translate(-W / 2, -H / 2); dp.call(this); ctx.restore();
  };
}
Screens.photo = function () {
  const P = Visual43.ph; if (!P) { G.state = 'play'; return; }
  const sp = 7 / P.z; if (Input.down('arrowleft') || Input.down('a')) P.x += sp * 2; if (Input.down('arrowright') || Input.down('d')) P.x -= sp * 2; if (Input.down('arrowup') || Input.down('w')) P.y += sp * 2; if (Input.down('arrowdown') || Input.down('s')) P.y -= sp * 2;
  if (Input.pressed('h')) { P.hud = !P.hud; G.hideHud = !P.hud; } if (Input.pressed('q')) P.z = clamp(P.z * 1.12, .6, 3); if (Input.pressed('e')) P.z = clamp(P.z * .9, .6, 3); if (Input.pressed('r')) { P.x = 0; P.y = 0; P.z = 1; }
  if (Input.pressed('escape')) { Snd.play('uiBack'); Visual43.exit(); return; }
  if (Input.pressed('enter')) { Visual7.shotWant = true; P.help = 0; Visual7.msg = 'FOTO SALVA'; Visual7.shotT = 2; }
  P.help = Math.max(0, P.help - 1 / 60);
  if (P.help > 0) { ctx.save(); ctx.globalAlpha = clamp(P.help, 0, 1); UI.panel(W / 2 - 500, H - 96, 1000, 56, { r: 18, fill: 'rgba(8,2,26,.8)' }); txt('MODO FOTO  •  setas/WASD: mover   roda do mouse ou Q/E: zoom   R: centralizar   H: HUD   F7 filtro  F6 moldura  F5 selo   ENTER: salvar   ESC: sair', W / 2, H - 80, 13, '#e2d4ff', 'center', 800); ctx.restore(); }
};
