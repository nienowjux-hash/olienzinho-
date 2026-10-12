'use strict';
// ---------- cosmeticos (rastros, auras, titulos e molduras) e recompensas de conquistas ----------
const COSM = {
  trail: { label: 'RASTRO', items: [['none', 'Padrão', 0], ['chama', 'Chama Viva', 200], ['estrela', 'Chuva de Estrelas', 250], ['arco', 'Arco-íris', 300], ['neve', 'Neve Estelar', 250], ['neon', 'Neon', 350], ['sombra', 'Fumaça Sombria', 300]] },
  aura: { label: 'AURA', items: [['none', 'Nenhuma', 0], ['pulso', 'Pulso de Luz', 300], ['halo', 'Halo Dourado', 350], ['orbitais', 'Orbitais', 400], ['chamas', 'Anel de Chamas', 450]] },
  frame: { label: 'MOLDURA', items: [['padrao', 'Padrão', 0], ['ouro', 'Dourada', 250], ['chama', 'Chama', 300], ['cristal', 'Cristal', 300]] },
};
ACH.push({ id: 'nightmare', name: 'Pesadelo Vencido', desc: 'Conclua uma fase no Pesadelo.', ok: () => !!Save.data.nmClear });
{ const sc = Game.stageClear; Game.stageClear = function () { if ((Save.data.settings.diff ?? 1) === 3 && !G.rush && !G.practice && !G.secret && !G.adv && !G.weekly && !G.epi) { Save.data.nmClear = true; Save.save(); } return sc.call(this); }; }
const cs = () => (Save.data.cosm = Save.data.cosm || { own: {}, eq: { trail: 'none', aura: 'none', title: 't0', frame: 'padrao' } });
const owned = (k, id, it) => { const c = cs(); if (it[2] === 0 && !it[3]) return true; if (it[3]) return !!Save.data.ach[it[3]] || !!c.own[k + ':' + id]; return !!c.own[k + ':' + id]; };
const eqd = k => cs().eq[k] || (k === 'title' ? 't0' : k === 'frame' ? 'padrao' : 'none');
const Visual29 = {};
Visual29.titleName = () => 'Novato';

// recompensas por conquista: estrelas ou cosmetico
const ACH_REW = { part2: ['trail', 'chama'], part3: ['aura', 'halo'], part4: ['frame', 'ouro'], secret3: ['frame', 'cristal'], trueend: ['aura', 'chamas'], epi: ['trail', 'sombra'], nightmare: ['aura', 'orbitais'], combo30: ['trail', 'estrela'], wlv5: ['trail', 'neon'] };
Visual29.grant = function (id) {
  const d = Save.data; d.achRew = d.achRew || {}; if (d.achRew[id]) return ''; d.achRew[id] = 1; const r = ACH_REW[id], c = cs();
  if (r) { c.own[r[0] + ':' + r[1]] = 1; const it = COSM[r[0]].items.find(x => x[0] === r[1]); Save.save(); return COSM[r[0]].label.toLowerCase() + ' "' + it[1] + '"'; }
  d.coins += 40; Save.save(); return '★ 40';
};
{
  const un = Ach.unlock; Ach.unlock = function (id) { const was = !!Save.data.ach[id]; un.call(this, id); if (!was && Save.data.ach[id]) { const t = Visual29.grant(id); if (t) G.timers && G.timers.push({ t: 1.5, fn: () => popup(W / 2, 170, 'Recompensa: ' + t, '#ffe9a8', 22) }); } };
  setTimeout(() => { try { let n = 0, lst = []; for (const a of ACH) if (Save.data.ach[a.id] && !(Save.data.achRew || {})[a.id]) { const t = Visual29.grant(a.id); if (t) { n++; lst.push(t); } } if (n) { Visual16.tip('achrew', 'Recompensas de conquistas', 'Conquistas antigas renderam estrelas e cosméticos! Veja em Modos Extras > Cosméticos.'); } } catch (e) { } }, 2500);
}

// ---------- efeitos ----------
const RB = ['#ff4a6e', '#ffb340', '#ffe04a', '#7fff9a', '#6ac8ff', '#c88aff'];
Visual29.trailFx = function (id, x, y, t, P, rate) {
  if (id === 'none' || Math.random() > rate) return;
  const a = (c, o) => P.push(Object.assign({ x: x + rand(-9, 9), y: y + 26, vx: rand(-25, 25), vy: rand(90, 170), life: .7, max: .7, r: rand(3, 6), c, drag: 1 }, o));
  if (id === 'chama') { a('#ff5a14', { r: rand(7, 12), life: .55, max: .55, vx: rand(-18, 18) }); a('#ffb340', { r: rand(4, 8), life: .45, max: .45, vy: rand(120, 190) }); a('#fff1a8', { r: rand(2, 4), life: .3, max: .3, y: y + 20 }); if (Math.random() < .25) a('#ffd36a', { r: 2, vx: rand(-90, 90), vy: rand(-30, 60), life: 1, max: 1, x: x + rand(-18, 18) }); }
  else if (id === 'estrela') { const c = ['#ffffff', '#ffe9a8', '#c8a0ff', '#9fe8ff'][Math.floor(Math.random() * 4)]; a(c, { r: rand(4, 8), vx: rand(-70, 70), vy: rand(30, 110), life: 1.3, max: 1.3, x: x + rand(-16, 16) }); a('#ffffff', { r: rand(1.5, 3), vx: rand(-40, 40), vy: rand(20, 70), life: 1.6, max: 1.6 }); }
  else if (id === 'arco') { for (let k = 0; k < 2; k++) a(RB[(Math.floor(t * 8) + k) % 6], { r: rand(6, 9), life: .9, max: .9, vx: (k ? 1 : -1) * rand(8, 24), x: x + (k ? 7 : -7) }); }
  else if (id === 'neve') { a('#ffffff', { r: rand(3, 6), vx: rand(-60, 60), vy: rand(20, 80), life: 1.5, max: 1.5, drag: .5, x: x + rand(-18, 18) }); a('#9fd0ff', { r: rand(6, 9), vx: rand(-20, 20), vy: rand(60, 120), life: .8, max: .8 }); }
  else if (id === 'neon') { const c = Math.floor(t * 5) % 2 ? '#33e0ff' : '#ff4ad0'; a(c, { r: rand(5, 8), vx: rand(-8, 8), vy: rand(150, 230), life: .9, max: .9, x: x - 8 }); a(c, { r: rand(5, 8), vx: rand(-8, 8), vy: rand(150, 230), life: .9, max: .9, x: x + 8 }); a('#ffffff', { r: 2.5, vy: rand(160, 240), life: .5, max: .5 }); }
  else if (id === 'sombra') { a('#5a2a9a', { k: 'smoke', r: rand(12, 20), life: 1.1, max: 1.1, vy: rand(30, 70), drag: .8 }); a('#a06aff', { r: rand(3, 5), vx: rand(-40, 40), vy: rand(40, 100), life: .8, max: .8 }); }
};
Visual29.auraFx = function (id, x, y, t) {
  if (id === 'none') return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (id === 'pulso') { drawGlow(x, y, 70 + Math.sin(t * 3) * 6, '#4aa8ff', .28); for (let k = 0; k < 3; k++) { const f = ((t * .6 + k / 3) % 1); ctx.strokeStyle = k % 2 ? '#c8a0ff' : '#7fe0ff'; ctx.globalAlpha = (1 - f) * .75; ctx.lineWidth = 5 * (1 - f) + 1; ctx.beginPath(); ctx.arc(x, y, 30 + f * 70, 0, TAU); ctx.stroke(); } }
  else if (id === 'halo') { const hy = y - 60 + Math.sin(t * 2.4) * 3; drawGlow(x, hy, 52, '#ffd36a', .5); ctx.globalAlpha = .95; ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(x, hy, 30, 9, 0, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#ffb320'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, hy, 36, 12, 0, 0, TAU); ctx.stroke(); for (let i = 0; i < 8; i++) { const a = t * .9 + i * TAU / 8; ctx.globalAlpha = .5 + .5 * Math.sin(t * 5 + i); ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 36, hy + Math.sin(a) * 12, 2.4, 0, TAU); ctx.fill(); } ctx.globalAlpha = .2; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .22; ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x + Math.cos(a) * 90, hy + 8 + Math.sin(a) * 90 + 90); ctx.stroke(); } }
  else if (id === 'orbitais') { ctx.globalAlpha = .18; ctx.strokeStyle = '#c8a0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 58, 0, TAU); ctx.stroke(); const cols = ['#ff7ac8', '#7fe0ff', '#ffd36a', '#9fff9a']; for (let i = 0; i < 4; i++) { const a0 = t * 2.1 + i * TAU / 4; for (let k = 0; k < 9; k++) { const a = a0 - k * .09; ctx.globalAlpha = (1 - k / 9) * .7; drawGlow(x + Math.cos(a) * 58, y + Math.sin(a) * 58, 11 - k, cols[i], .8); } ctx.globalAlpha = 1; drawGlow(x + Math.cos(a0) * 58, y + Math.sin(a0) * 58, 20, cols[i], .9); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + Math.cos(a0) * 58, y + Math.sin(a0) * 58, 4.5, 0, TAU); ctx.fill(); } }
  else if (id === 'chamas') { drawGlow(x, y, 80, '#ff6a1a', .22); for (let i = 0; i < 16; i++) { const a = t * 1.1 + i * TAU / 16, fl = 16 + Math.abs(Math.sin(t * 8 + i * 2.3)) * 16, r0 = 46; ctx.save(); ctx.translate(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.rotate(a + Math.PI / 2); ctx.globalAlpha = .8; ctx.fillStyle = i % 2 ? '#ff7a1a' : '#ffb340'; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-3, -fl * .6, 0, -fl); ctx.quadraticCurveTo(3, -fl * .6, 6, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff1a8'; ctx.globalAlpha = .7; ctx.beginPath(); ctx.moveTo(-2.5, 0); ctx.quadraticCurveTo(0, -fl * .5, 0, -fl * .55); ctx.quadraticCurveTo(0, -fl * .5, 2.5, 0); ctx.fill(); ctx.restore(); } }
  ctx.restore(); ctx.globalAlpha = 1;
};
{
  const vd = Visual13.draw;
  Visual13.draw = function () { vd.call(this); const p = G.player; if (p && !p.dead && QL() >= 1) Visual29.auraFx(eqd('aura'), p.x, p.y, World.t); };
  const up = Game.updatePlay; Game.updatePlay = function (dt) { up.call(this, dt); const p = G.player; if (p && !p.dead && G.state === 'play' && QL() >= 1) Visual29.trailFx(eqd('trail'), p.x, p.y, World.t, G.parts, .6); };
  const pd = Portraits.draw;
  Portraits.draw = function (who, x, y, size, o) {
    pd.call(this, who, x, y, size, o); const f = eqd('frame'); if (who !== 'O' || f === 'padrao') return; const t = World.t, s = size * .5 + 4;
    ctx.save(); ctx.translate(x, y);
    if (f === 'ouro') { ctx.strokeStyle = lin(-s, -s, s, s, [[0, '#fff6c0'], [.5, '#e8a820'], [1, '#fff6c0']]); ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(-s, -s, s * 2, s * 2, 20); ctx.stroke(); for (const [cx, cy] of [[-s, -s], [s, -s], [-s, s], [s, s]]) Cine.star(cx, cy, 9, t, '#ffd36a', .95); }
    else if (f === 'chama') { ctx.strokeStyle = '#ff6a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(-s, -s, s * 2, s * 2, 20); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const fx = -s + (i + .5) / 9 * s * 2; drawGlow(fx, -s - 4 - Math.abs(Math.sin(t * 7 + i * 1.7)) * 10, 14, i % 2 ? '#ff8a1f' : '#ffd36a', .8); } }
    else if (f === 'cristal') { ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-s, -s, s * 2, s * 2, 20); ctx.stroke(); ctx.fillStyle = 'rgba(190,240,255,.85)'; for (const [cx, cy, a] of [[-s, -s, 0], [s, -s, 1.57], [s, s, 3.14], [-s, s, 4.7]]) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 6); ctx.lineTo(8, 24); ctx.closePath(); ctx.fill(); ctx.restore(); } }
    ctx.restore();
  };
}

// ---------- tela de cosmeticos ----------
Screens.cosmetics = function () {
  const c = cs(), tab = G.ctab || 'trail', t = World.t; txt('COSMÉTICOS', W / 2, 18, 42, '#fff', 'center'); txt(Screens.stars(), W - 40, 30, 28, '#ffcf6b', 'right');
  Object.keys(COSM).forEach((k, i) => { if (UI.button('ctab' + k, 90 + i * ((W - 180) / Object.keys(COSM).length), 100, (W - 180) / Object.keys(COSM).length - 14, 40, COSM[k].label, { size: 17, color: tab === k ? '#9a63ff' : undefined })) G.ctab = k; });
  // previa
  const px = 1010, py = 330; UI.panel(780, 160, 440, 370, { r: 24 }); txt('PRÉVIA', px, 172, 16, '#8a7fb0', 'center', 900);
  G.cprev = G.cprev || []; Visual29.trailFx(tab === 'trail' && G.cpv ? G.cpv : eqd('trail'), px, py, t, G.cprev, .7); for (const q of G.cprev) { q.life -= 1 / 60; q.x += q.vx / 60; q.y += q.vy / 60; } G.cprev = G.cprev.filter(q => q.life > 0).slice(-80);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const q of G.cprev) drawGlow(q.x, q.y, q.r * 3, q.c.length === 7 ? q.c : '#ffffff', clamp(q.life / q.max, 0, 1) * .8); ctx.restore();
  Visual29.auraFx(tab === 'aura' && G.cpv ? G.cpv : eqd('aura'), px, py, t); Art.ship(px, py, { pal: skinOf(Save.data.loadout.skin).pal, vx: 0, t, lookx: 0, looky: -.4, blinkT: 0, inv: 0, scale: 1.2, boost: .8 });
  if (tab === 'frame') Portraits.draw('O', px, py + 100, 120, { mood: 'happy', t });
  const items = COSM[tab].items; G.cpv = null;
  items.forEach(([id, name, cost, ach], i) => {
    const x = 70 + (i % 2) * 350, y = 160 + Math.floor(i / 2) * 84, w = 330, h = 72, has = owned(tab, id, [id, name, cost, ach]), eq = eqd(tab) === id, bid = 'cs' + tab + id, can = Save.data.coins >= cost;
    if (UI.focus(bid)) G.cpv = id;
    if (UI.hit(bid, x, y, w, h)) { if (has) { c.eq[tab] = id; Save.save(); Snd.play('uiSelect'); } else if (!ach && can) { Save.data.coins -= cost; c.own[tab + ':' + id] = 1; c.eq[tab] = id; Save.save(); Snd.play('buy'); } else Snd.play('uiDeny'); }
    UI.panel(x, y, w, h, { r: 16, fill: eq ? 'rgba(60,34,140,.88)' : UI.focus(bid) ? 'rgba(40,20,100,.85)' : 'rgba(20,8,55,.75)', stroke: eq ? '#ffd36a' : 'rgba(190,160,255,.3)' });
    txt(name, x + 18, y + 12, 21, has ? '#fff' : '#a99fd6', 'left', 900); const a = ach ? ACH.find(q => q.id === ach) : null;
    txt(eq ? 'EQUIPADO ✓' : has ? 'clique para equipar' : ach ? '🔒 conquista: ' + (a ? a.name : ach) : '★ ' + cost, x + 18, y + 42, 15, eq ? '#7fe0a0' : has ? '#8a7fb0' : ach ? '#ffcf6b' : (can ? '#ffcf6b' : '#7a70a0'), 'left', 800);
  });
  if (UI.button('back', W / 2 - 160, 620, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hangar'; }
  Screens.thinFrame();
};
