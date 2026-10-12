'use strict';
// ---------- gameplay 31: fusao de armas, companheiros dos guardioes, cooperativo melhorado, metas dentro da fase,
// inimigo cacador, dificuldade adaptativa e semente compartilhavel ----------
const Visual31 = { fz: [] };
const sv31 = (k, d) => (Save.data[k] || (Save.data[k] = d));
const guardsOn = () => ['C', 'P', 'E', 'S'].filter(g => GUARDS[g].ok());

// ---------- fusao de armas ----------
Visual31.canFuse = id => WEAPONS[id] && typeof WEAPONS[id].fire === 'function' && !/^(g_|fz_)/.test(id) && id !== 'orbi' && id !== 'laser' && Save.data.owned.weapons[id];
Visual31.register = function (a, b) {
  const id = 'fz_' + a + '_' + b; if (WEAPONS[id]) return id; const A = WEAPONS[a], B = WEAPONS[b];
  WEAPONS[id] = { name: A.name.split(' ')[0] + ' + ' + B.name.split(' ')[0], desc: 'Fusão de ' + A.name + ' com ' + B.name + '.', c: A.c, c2: B.c, price: 0, delay: (A.delay + B.delay) / 2 * 1.12, special: A.special, specName: A.specName, specDesc: A.specDesc, fz: [a, b],
    fire(p) { const d = p.dmg; p.dmg = d * .62; try { A.fire(p); B.fire(p); } finally { p.dmg = d; } } };
  WEAPON_ORDER.push(id); Save.data.owned.weapons[id] = true; return id;
};
Visual31.ensure = function () { try { for (const [a, b] of sv31('fusions', [])) if (WEAPONS[a] && WEAPONS[b] && !WEAPONS['fz_' + a + '_' + b]) Visual31.register(a, b); } catch (e) { } };
setTimeout(() => Visual31.ensure(), 0); addEventListener('load', () => Visual31.ensure());
{
  const wg = Screens.weaponGlyph; Screens.weaponGlyph = function (id, x, y, c, t) { if (id.startsWith('fz_')) { const f = WEAPONS[id].fz; wg.call(this, f[0], x - 16, y - 8, WEAPONS[f[0]].c, t); wg.call(this, f[1], x + 16, y + 8, WEAPONS[f[1]].c, t); return; } return wg.call(this, id, x, y, c, t); };
}
Screens.fusion = function () {
  txt('FUSÃO DE ARMAS', W / 2, 24, 44, '#fff', 'center'); txt(Screens.stars(), W - 40, 36, 30, '#ffcf6b', 'right'); txt('Junte duas armas numa só: atira as duas juntas, com dano um pouco menor cada. O especial é o da primeira.', W / 2, 88, 16, '#ffb340', 'center', 1000);
  const ids = WEAPON_ORDER.filter(Visual31.canFuse); G.fa = G.fa ?? 0; G.fb = G.fb ?? Math.min(1, ids.length - 1);
  const pick = (lab, key, x) => { const id = ids[(G[key] % ids.length + ids.length) % ids.length]; UI.panel(x, 130, 360, 150, { r: 20 }); txt(lab, x + 180, 142, 15, '#8a7fb0', 'center', 900); if (id) { Screens.weaponGlyph(id, x + 180, 205, WEAPONS[id].c, World.t); txt(WEAPONS[id].name, x + 180, 242, 22, WEAPONS[id].c, 'center', 340); } if (UI.button(key + 'L', x + 10, 296, 70, 38, '◀', { size: 18 })) G[key]--; if (UI.button(key + 'R', x + 280, 296, 70, 38, '▶', { size: 18 })) G[key]++; return id; };
  const a = pick('ARMA 1', 'fa', 100), b = pick('ARMA 2', 'fb', 820); txt('+', W / 2, 190, 70, '#fff', 'center', 900);
  const fz = sv31('fusions', []), dup = a === b, have = a && b && fz.some(f => f[0] === a && f[1] === b), cost = 600, can = Save.data.coins >= cost && !dup && !have && fz.length < 6 && a && b;
  txt(dup ? 'Escolha duas armas diferentes.' : have ? 'Essa fusão já existe.' : fz.length >= 6 ? 'Limite de 6 fusões.' : a && b ? WEAPONS[a].name + ' + ' + WEAPONS[b].name : 'Você precisa de pelo menos 2 armas.', W / 2, 360, 20, '#e2d4ff', 'center', 800);
  if (UI.button('fzmake', W / 2 - 170, 394, 340, 56, 'FUSIONAR  ★' + cost, { size: 22, color: can ? '#9a63ff' : undefined, disabled: !can })) { Save.data.coins -= cost; fz.push([a, b]); const id = Visual31.register(a, b); Save.save(); Snd.play('levelUp'); shockwave(W / 2, 200, 400, '#ffd36a'); popup(W / 2, 300, 'Nova arma: ' + WEAPONS[id].name, '#ffe9a8', 26); }
  txt('SUAS FUSÕES (equipe no Hangar)', 100, 480, 17, '#ffb340', 'left', 900); fz.forEach(([x, y], i) => { const id = 'fz_' + x + '_' + y; if (WEAPONS[id]) txt('• ' + WEAPONS[id].name, 100 + (i % 3) * 380, 512 + Math.floor(i / 3) * 30, 18, '#cdb8ff', 'left', 700); });
  if (UI.button('back', W / 2 - 160, 620, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hangar'; }
  Screens.thinFrame();
};

// ---------- companheiros dos guardioes ----------
const COMP = { none: ['NENHUM', '#8a7fb0'], C: ['COLMEIA', '#ffb340'], P: ['PÉTREO', '#c8a0b8'], E: ['VIGIA', '#ff7ac8'], S: ['SOLARIS', '#ff8a1f'] };
{
  const sp = Screens.pilots;
  Screens.pilots = function () {
    sp.call(this); const cur = sv31('comp', {}); const c = cur.id && cur.id !== 'none' && guardsOn().includes(cur.id) ? cur.id : 'none';
    if (UI.button('compb', W / 2 + 180, 604, 400, 50, 'COMPANHEIRO: ' + COMP[c][0], { size: 18, color: c !== 'none' ? COMP[c][1] : undefined })) { const l = ['none', ...guardsOn()]; cur.id = l[(l.indexOf(c) + 1) % l.length]; Save.save(); Snd.play('uiSelect'); }
    txt('Um guardião ajuda você nas fases', W / 2 + 380, 580, 14, '#8a7fb0', 'center', 700);
  };
}
Visual31.compUpdate = function (dt) {
  const p = G.player, id = (sv31('comp', {})).id; if (!p || p.dead || !id || id === 'none' || !guardsOn().includes(id) || (p.weapon || '').startsWith('g_' + id)) { G.comp = null; return; }
  const k = G.comp && G.comp.id === id ? G.comp : (G.comp = { id, x: p.x, y: p.y, t: 0, cd: 1, rock: true, rc: 0 }); k.t += dt;
  const ang = k.t * 1.9, tx = p.x + (id === 'E' ? 0 : Math.cos(ang) * 58), ty = p.y + (id === 'E' ? -64 : Math.sin(ang) * 40 - 8); k.x += (tx - k.x) * Math.min(1, 8 * dt); k.y += (ty - k.y) * Math.min(1, 8 * dt);
  k.cd -= dt;
  if (id === 'C') { if (k.cd <= 0) { k.cd = .55; const a = rand(-Math.PI / 2 - .5, -Math.PI / 2 + .5); G.pb.push({ x: k.x, y: k.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, dmg: p.dmg * .32, crit: false, pierce: 0, hits: [], kind: 'missile', orb: true, bee: true, speed: 700, target: null, life: 2, r: 8, c: '#ffb340', ph: rand(0, 6) }); } }
  else if (id === 'P') { k.rc = Math.max(0, k.rc - dt); if (!k.rock && k.rc <= 0) k.rock = true; if (k.rock) for (const q of G.eb) if (!q.dead && Math.hypot(q.x - k.x, q.y - k.y) < 30) { q.dead = true; k.rock = false; k.rc = 6; sparks(k.x, k.y, '#c8a0b8', 8, 260); shedDebris(k.x, k.y, 5, ['#c8a0b8', '#5a3a58'], 240, 7); break; } }
  else if (id === 'E') { if (k.cd <= 0) { k.cd = 1.25; G.pb.push({ x: k.x, y: k.y - 10, vx: 0, vy: -1100, dmg: p.dmg * .55, crit: false, pierce: 99, hits: [], c: '#ff7ac8', r: 7, life: 1.2 }); } }
  else if (id === 'S') { if (k.cd <= 0) { k.cd = 4.2; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; G.pb.push({ x: k.x, y: k.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, dmg: p.dmg * .5, crit: false, pierce: 1, hits: [], c: '#ff8a1f', r: 10, life: .7, fire: true, ph: i }); } shockwave(k.x, k.y, 110, '#ff8a1f'); } }
};
{
  const vd = Visual13.draw;
  Visual13.draw = function () { vd.call(this); const k = G.comp; if (!k) return; const c = COMP[k.id][1]; ctx.save(); ctx.translate(k.x, k.y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 38, c, .45); ctx.globalCompositeOperation = 'source-over'; ctx.scale(.32, .32); Art.guardian(0, 0, { guard: 'g_' + k.id, vx: 0, t: World.t, scale: 1, lookx: 0, looky: 0, blinkT: 0 }); if (k.id === 'P' && !k.rock) { ctx.globalAlpha = .4; ctx.fillStyle = '#000'; ctx.fillRect(-60, -60, 120, 120); } ctx.restore(); };
}

// ---------- cooperativo: piloto do P2 e reviver por proximidade ----------
{
  const ip = Visual6.initP2;
  Visual6.initP2 = function () { ip.call(this); const p = G.p2, w = sv31('p2pilot', {}).id; if (p && w && w !== 'orbi' && guardsOn().includes(w[2]) && WEAPONS[w]) { p.weapon = w; recalcStats(p); p.hp = p.maxHp; } };
}
Visual31.revive = function (dt) {
  const a = G.player, b = G.p2; if (!a || !b) return;
  for (const [d, l] of [[a, b], [b, a]]) {
    if (!d.dead || l.dead) { d.rv = 0; continue; } const near = Math.hypot(l.x - d.x, l.y - d.y) < 95; d.rv = Math.max(0, (d.rv || 0) + (near ? dt : -dt * .6));
    ctx.save(); if (d.rv > 0) { G.parts.push({ x: d.x + rand(-20, 20), y: d.y + rand(-10, 20), vx: 0, vy: -rand(40, 90), life: .6, max: .6, r: rand(2, 4), c: '#7fe0a0', drag: 1 }); } ctx.restore();
    if (d.rv >= 3) { d.dead = false; d.hp = Math.min(2, d.maxHp); d.inv = 2.5; d.rv = 0; G.overT = 99; popup(d.x, d.y - 60, 'REVIVIDO!', '#7fe0a0', 28); shockwave(d.x, d.y, 240, '#7fe0a0'); burst(d.x, d.y, ['#7fe0a0', '#ffffff'], 30, 340, 5); Snd.play('levelUp'); }
  }
};
Visual31.reviveDraw = function () {
  for (const d of [G.player, G.p2]) if (d && d.dead && d.rv > 0) { ctx.save(); ctx.strokeStyle = '#7fe0a0'; ctx.lineWidth = 6; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(d.x, d.y, 40, -Math.PI / 2, -Math.PI / 2 + d.rv / 3 * TAU); ctx.stroke(); ctx.restore(); }
  if (G.p2 && G.player && ((G.player.dead && !G.p2.dead) || (G.p2.dead && !G.player.dead)) && !(G.rvHint > 0)) { G.rvHint = 1; Visual16.tip('revive', 'Reviver o parceiro', 'Fique perto do parceiro caído por 3 segundos para revivê-lo. Subir de nível também funciona.'); }
};
{ const d13 = Visual13.draw; Visual13.draw = function () { d13.call(this); Visual31.reviveDraw(); }; }

// ---------- metas dentro da fase ----------
Visual31.objStart = function () {
  const st = G.stage; if (!st || G.endless || G.boss || G.bossPending || G.training || G.practice || G.secret || G.adv || G.weekly || G.exp && G.exp.noObj) return;
  const kinds = ['resgate', 'defender', 'orbes']; const k = pick(kinds), O = G.obj = { k, t: 0, dur: k === 'defender' ? 18 : 22, got: 0, goal: k === 'orbes' ? 5 : 1, done: false };
  if (k === 'resgate') O.ship = { x: rand(200, W - 200), y: -40, vy: 56 };
  else if (k === 'defender') { O.bx = rand(300, W - 300); O.by = H - 110; O.hp = 10; O.max = 10; }
  else O.orbs = Array.from({ length: 5 }, (_, i) => ({ x: 150 + i * 245 + rand(-40, 40), y: rand(200, H - 200), got: false }));
  popup(W / 2, 230, { resgate: 'META: RESGATE A NAVE PERDIDA', defender: 'META: PROTEJA O FAROL', orbes: 'META: COLETE AS 5 ORBES' }[k], '#7fe0a0', 24); Snd.play('bossWarn');
};
Visual31.objUpdate = function (dt) {
  const O = G.obj, p = G.player; if (!O || O.done || !p || p.dead) return; O.t += dt;
  if (O.k === 'resgate') { O.ship.y += O.ship.vy * dt; O.ship.x += Math.sin(O.t * 1.5) * 30 * dt; if (Math.hypot(p.x - O.ship.x, p.y - O.ship.y) < 56) { O.got = 1; } if (O.ship.y > H + 40) O.t = O.dur + 1; }
  else if (O.k === 'defender') { for (const q of G.eb) if (!q.dead && Math.hypot(q.x - O.bx, q.y - O.by) < 40) { q.dead = true; O.hp -= .5; sparks(q.x, q.y, '#7fe0a0', 4, 200); } for (const e of G.enemies) if (!e.dead && Math.hypot(e.x - O.bx, e.y - O.by) < e.rad + 36) { O.hp -= 2; if (!['tank', 'captain'].includes(e.type)) killEnemy(e, false); } if (O.hp <= 0) O.t = O.dur + 1; if (O.t >= O.dur) O.got = 1; }
  else { for (const o of O.orbs) if (!o.got && Math.hypot(p.x - o.x, p.y - o.y) < 44) { o.got = true; O.got++; Snd.play('xp', { combo: O.got }); popup(o.x, o.y - 30, O.got + ' / 5', '#7fe0ff', 22); } }
  if (O.got >= O.goal && !(O.k === 'defender' && O.t < O.dur)) { O.done = true; const hp = p.hp < p.maxHp; if (hp) p.hp++; G.score += 4000; G.runCoins += 15; popup(W / 2, 230, 'META CUMPRIDA! +4000' + (hp ? ' e +1 de vida' : ''), '#7fe0a0', 28); shockwave(p.x, p.y, 300, '#7fe0a0'); flashScreen(.15); Snd.play('levelUp'); }
  else if (O.t > O.dur || (O.k === 'defender' && O.hp <= 0)) { O.done = true; popup(W / 2, 230, 'META FALHOU', '#ff8a5f', 24); }
};
Visual31.objDraw = function () {
  const O = G.obj; if (!O || G.boss || G.bossPending) return; const t = World.t;
  if (!O.done) {
    ctx.save(); const k = Math.max(0, O.dur - O.t); UI.panel(W / 2 - 170, 132, 340, 30, { r: 12, fill: 'rgba(8,2,26,.75)', stroke: '#7fe0a0' }); txt({ resgate: 'RESGATE A NAVE', defender: 'PROTEJA O FAROL', orbes: 'ORBES ' + O.got + '/5' }[O.k] + '  •  ' + Math.ceil(k) + 's', W / 2, 138, 15, '#7fe0a0', 'center', 900); ctx.restore();
    if (O.k === 'resgate') { const s = O.ship; ctx.save(); ctx.translate(s.x, s.y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 60, '#7fe0a0', .5); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#c8f4d8'; ctx.strokeStyle = '#2a8a5a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(20, 18); ctx.lineTo(0, 8); ctx.lineTo(-20, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ff6a6a'; ctx.beginPath(); ctx.arc(0, -4, 5 + Math.sin(t * 8) * 1.5, 0, TAU); ctx.fill(); ctx.restore(); }
    else if (O.k === 'defender') { ctx.save(); ctx.translate(O.bx, O.by); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 90, '#7fe0a0', .45); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#2a6a4a'; ctx.strokeStyle = '#7fe0a0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, 24); ctx.lineTo(-8, -22); ctx.lineTo(8, -22); ctx.lineTo(18, 24); ctx.closePath(); ctx.fill(); ctx.stroke(); drawGlow(0, -30, 18 + Math.sin(t * 5) * 3, '#ffffff', .9); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(-30, 36, 60, 6); ctx.fillStyle = '#7fe0a0'; ctx.fillRect(-30, 36, 60 * clamp(O.hp / O.max, 0, 1), 6); ctx.restore(); }
    else for (const o of O.orbs) if (!o.got) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(o.x, o.y, 40, '#7fe0ff', .7); drawGlow(o.x, o.y, 16, '#ffffff', .9); ctx.restore(); }
  }
};

// ---------- inimigo cacador (aparece se voce ficar parado) ----------
ENEMY_DEF.hunter = { hp: 12, rad: 24, spd: 250, xp: 5, score: 50, coin: .3, glow: '#ff3a3a' }; SRC_NAME.hunter = 'Caçador'; SRC_TIP.hunter = 'O Caçador aparece quando você fica parado demais: mantenha-se em movimento.';
Visual31.hunterUpdate = function (dt) {
  const p = G.player; if (!p || p.dead || G.boss || G.endless || G.training || G.practice || G.state !== 'play') return;
  const H31 = Visual31.hs = Visual31.hs || { x: p.x, y: p.y, still: 0, cd: 0 }; const mv = Math.hypot(p.x - H31.x, p.y - H31.y); H31.x = p.x; H31.y = p.y; H31.still = mv < 90 * dt ? H31.still + dt : Math.max(0, H31.still - dt * 2); H31.cd -= dt;
  if (H31.still > 4 && H31.cd <= 0) { H31.cd = 10; H31.still = 2; const e = spawnEnemy('hunter', rand(100, W - 100), -30, { noElite: true }); popup(e.x, 120, 'CAÇADOR!', '#ff6a6a', 22); Visual16.tip('hunter', 'Caçador', 'Ficar parado demais chama um inimigo que persegue você. Mexa-se!'); }
};
{
  const ue = updateEnemy; updateEnemy = function (e, dt) { if (e.type === 'hunter') { const p = G.player, a = Math.atan2(p.y - e.y, p.x - e.x); e.vx = (e.vx || 0) + (Math.cos(a) * e.spd - (e.vx || 0)) * Math.min(1, 1.8 * dt); e.vy = (e.vy || 0) + (Math.sin(a) * e.spd - (e.vy || 0)) * Math.min(1, 1.8 * dt); e.x += e.vx * dt; e.y += e.vy * dt; e.rot = Math.atan2(e.vy, e.vx); if (e.age > 14) { e.y -= 300 * dt; if (e.y < -60) { e.dead = true; e.counted = true; } } } return ue(e, dt); };
  const ae = Art.enemy; Art.enemy = function (e) { if (e.type !== 'hunter') return ae.call(this, e); ctx.save(); ctx.translate(e.x, e.y); ctx.rotate((e.rot || Math.PI / 2) + Math.PI / 2); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 50, '#ff3a3a', .45); ctx.globalCompositeOperation = 'source-over'; const hit = e.hit > 0; if (typeof Visual44 !== 'undefined' && Visual44.bodies.hunter) { Visual44.bodies.hunter(e, 24, World.t + (e.ph || 0), hit); ctx.restore(); return; } ctx.fillStyle = hit ? '#fff' : '#3a0a14'; ctx.strokeStyle = '#ff3a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(18, 16); ctx.lineTo(0, 8); ctx.lineTo(-18, 16); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ff3a3a'; ctx.beginPath(); ctx.ellipse(0, -2, 6, 9, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -4, 2.5, 0, TAU); ctx.fill(); ctx.restore(); };
  TRAIN_TYPES.push('hunter');
}

// ---------- dificuldade adaptativa (AUTO) ----------
DIFF.push({ name: 'AUTO', desc: 'A dificuldade sobe e desce sozinha conforme você joga bem ou mal. Pontos e estrelas acompanham.', hp: 1, bul: 1, php: 0, score: 1, coin: 1, rate: 1, spawn: 1, boss: 1, bhp: 1, adapt: true });
Visual31.adaptIdx = () => DIFF.findIndex(d => d.adapt);
Visual31.adaptUpdate = function (dt) {
  const ix = Visual31.adaptIdx(); if ((Save.data.settings.diff ?? 1) !== ix || G.state !== 'play') return; const d = DIFF[ix], A = Visual31.A = Visual31.A || { f: 1, t: 0, h0: 0 };
  A.t += dt; if (A.t >= 15) { A.t = 0; const hits = (G.stats ? G.stats.hits : 0) - A.h0; A.h0 = G.stats ? G.stats.hits : 0; A.f = clamp(A.f + (hits === 0 ? .08 : hits === 1 ? 0 : -.1 * Math.min(3, hits - 1)), .75, 1.7); }
  const f = A.f; d.hp = f; d.bul = 1 + (f - 1) * .45; d.php = 0; d.rate = f > 1 ? 1 + (f - 1) * 1.2 : 1; d.spawn = f > 1 ? 1 + (f - 1) * .9 : 1; d.boss = f > 1 ? 1 + (f - 1) * 1.1 : 1; d.bhp = f; d.score = +f.toFixed(2); d.coin = +f.toFixed(2);
};

// ---------- semente compartilhavel ----------
const mul32 = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hashS = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
Visual31.seed = () => (Save.data.seed || '').toUpperCase();
{
  const ss = Game.startStage; Game.startStage = function (i, o) { Visual31.ensure(); const r = ss.call(this, i, o); Visual31.srng = Visual31.seed() ? mul32(hashS(Visual31.seed() + ':' + i)) : null; Visual31.hs = null; G.obj = null; G.objT = null; G.comp = null; return r; };
  const gd = Game.director; Game.director = function (dt) { if (!Visual31.srng) return gd.call(this, dt); const m = Math.random; Math.random = Visual31.srng; try { return gd.call(this, dt); } finally { Math.random = m; } };
}

// ---------- ligacao com o jogo ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    up.call(this, dt); if (G.state !== 'play') return;
    Visual31.compUpdate(dt); Visual31.adaptUpdate(dt); Visual31.hunterUpdate(dt); if (G.p2) Visual31.revive(dt);
    // metas: aparecem a cerca de 28% e 62% da fase
    const st = G.stage; if (st && !G.boss && !G.bossPending && !G.endless && !G.practice && !G.secret && !G.adv && !G.weekly && !G.rush && !G.epi && st.duration < 1e8) { const pr = G.t / st.duration; G.objN = G.objN || 0; if (!G.obj || G.obj.done) { if ((G.objN === 0 && pr > .28) || (G.objN === 1 && pr > .62)) { G.objN++; Visual31.objStart(); } } }
    Visual31.objUpdate(dt);
  };
  const ss2 = Game.startStage; Game.startStage = function (i, o) { const r = ss2.call(this, i, o); G.objN = 0; return r; };
  const vd = Visual13.draw; Visual13.draw = function () { vd.call(this); Visual31.objDraw(); };
  const hd = Visual15.hudDraw; Visual15.hudDraw = function () { hd.call(this); const sd = Visual31.seed(); if (sd && G.state === 'play') txt('SEMENTE ' + sd, W - 24, H - 20, 12, 'rgba(205,184,255,.6)', 'right', 700); };
}

// ---------- preparo da jornada: semente e piloto do P2 ----------
{
  const pg = Screens.playsetup;
  Screens.playsetup = function () {
    pg.call(this); const s = Save.data.settings;
    const sd = Visual31.seed(); if (UI.button('psseed', 680, 440, 400, 42, sd ? 'SEMENTE: ' + sd : 'SEMENTE: ALEATÓRIA', { size: 16, color: sd ? '#9a63ff' : undefined })) { const v = (prompt('Digite uma semente (letras e números, até 8) para repetir as mesmas ondas de inimigos. Deixe vazio para aleatória:', sd) || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8); Save.data.seed = v; Save.save(); }
    if (UI.button('psgen', 1090, 440, 18 * 0 + 0, 0, '', {})) { }
    if (Save.data.coop) { const w = sv31('p2pilot', {}); const l = ['orbi', ...guardsOn().map(g => 'g_' + g)], c = l.includes(w.id) ? w.id : 'orbi', nm = c === 'orbi' ? 'ORBI' : GUARDS[c[2]].name; if (UI.button('psp2', 220, 440, 420, 42, 'PILOTO DO P2: ' + nm, { size: 16 })) { w.id = l[(l.indexOf(c) + 1) % l.length]; Save.save(); Snd.play('uiSelect'); } }
  };
}

// ---------- atalhos no Hangar: cosmeticos, talentos, pilotos (guardioes) e fusao ----------
{
  const hg = Screens.hangar;
  Screens.hangar = function () {
    hg.call(this); const y = 624, w = 195, h = 44, go = (id, x, lab, st, col) => { if (UI.button(id, x, y, w, h, lab, { size: 16 })) { Snd.play('uiSelect'); G.state = st; } };
    go('hgcos', 60, 'COSMÉTICOS', 'cosmetics', '#ff7ac8'); go('hgtal', 265, 'TALENTOS', 'talents', '#ffd36a');
    go('hgfus', 1025, 'FUSÃO DE ARMAS', 'fusion', '#ffd36a'); if (Save.data.cleared[9]) go('hgpil', 820, 'EVOLUIR GUARDIÕES', 'pilots', '#ffb340');
  };
}
