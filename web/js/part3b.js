'use strict';
// ---------- PARTE 3 (B): inimigos, tiros e ataques exclusivos + dificuldade que acompanha a evolucao do jogador ----------
const P3 = { q: [], hist: [], cur: null, invT: 0, types: ['prism', 'lantern', 'lancer', 'jelly', 'eel', 'urchin', 'shade', 'facet', 'warden'] };
P3.at = (t, fn) => P3.q.push({ t, fn });
P3.on = () => !!(G.stage && G.stage.id >= 6);
// poder de fogo do jogador -> multiplicador que faz os inimigos crescerem junto (1 = jogador novo)
P3.pw = () => { const p = G.player; if (!p) return 1; return p.dmg * p.shots * (1 + p.crit * (p.critMul - 1)) / (p.fireDelay * (WEAPONS[p.weapon] ? WEAPONS[p.weapon].delay : 1)); };
P3.REF = 28;
P3.heat = () => { if (!P3.on()) return 1; return clamp(Math.pow(P3.pw() / (P3.REF || 1), .4), 1, 1.35); };

const ENEMY3 = {
  prism: { hp: 14, rad: 36, spd: 0, xp: 7, score: 90, coin: .6, glow: '#ffd36a' },
  lantern: { hp: 8, rad: 28, spd: 70, xp: 4, score: 55, coin: .4, glow: '#ffa03a' },
  lancer: { hp: 10, rad: 28, spd: 0, xp: 5, score: 70, coin: .45, glow: '#fff0b0' },
  jelly: { hp: 16, rad: 36, spd: 55, xp: 7, score: 90, coin: .6, glow: '#7fe8ff' },
  eel: { hp: 10, rad: 26, spd: 250, xp: 5, score: 70, coin: .5, glow: '#3affc8' },
  urchin: { hp: 15, rad: 32, spd: 60, xp: 6, score: 80, coin: .5, glow: '#5a8aff' },
  shade: { hp: 10, rad: 28, spd: 0, xp: 5, score: 70, coin: .45, glow: '#b070ff' },
  facet: { hp: 7, rad: 24, spd: 170, xp: 4, score: 50, coin: .35, glow: '#e8d0ff' },
  warden: { hp: 22, rad: 40, spd: 50, xp: 9, score: 120, coin: .8, glow: '#ffffff' },
};
Object.assign(ENEMY_DEF, ENEMY3);
Object.assign(SRC_NAME, { prism: 'Prisma', lantern: 'Lanterna', lancer: 'Lanceiro', jelly: 'Água-viva', eel: 'Enguia', urchin: 'Ouriço', shade: 'Sombra Espelhada', facet: 'Faceta', warden: 'Guardião do Espelho' });
Object.assign(SRC_TIP, {
  prism: 'O Prisma gira disparando espirais de luz: mantenha-se em movimento e contorne os braços.',
  lantern: 'A Lanterna solta orbes que explodem em anéis: afaste-se antes da explosão.',
  lancer: 'O Lanceiro mostra uma linha dourada antes de disparar: saia dela quando piscar.',
  jelly: 'A Água-viva solta ondas de bolhas lentas: passe pelos vãos entre os anéis.',
  eel: 'A Enguia atravessa a tela atirando: fique atrás dela ou abaixo do seu caminho.',
  urchin: 'O Ouriço explode em espinhos quando morre: derrote-o de longe.',
  shade: 'A Sombra copia o seu lado oposto e atira reto: não fique na linha dela.',
  facet: 'A Faceta atira estilhaços que quicam nas paredes: espere o tiro voltar.',
  warden: 'O Guardião reflete tiros quando o escudo está fechado: ataque quando abrir.',
});
TRAIN_TYPES.push(...P3.types);

// ---------- tiros: formato proprio por setor ----------
{
  const eb0 = ebullet;
  ebullet = function (x, y, ang, spd, o = {}) {
    const s = G.stage ? G.stage.id : 0;
    if (s >= 6 && !o.sty) { const ix = s === 9 ? (G.boss ? Math.min(2, G.boss.act !== undefined ? G.boss.act : G.boss.phase) : Math.min(2, Math.floor((G.t || 0) / (G.stage.duration || 135) * 3))) : s - 6; o = Object.assign({ sty: ['lance', 'bubble', 'shard'][ix], c: ['#ffd36a', '#6fe8ff', '#d8a8ff'][ix] }, o); if (o.sty === 'bubble') o.r = Math.max(o.r || 7, 7); }
    return eb0(x, y, ang, spd, o);
  };
  const ae = Art.ebullet;
  Art.ebullet = function (b) {
    if (!b.sty) return ae.call(this, b);
    const R = b.r * 1.6, t = World.t, a = Math.atan2(b.vy, b.vx);
    ctx.save(); ctx.translate(b.x, b.y);
    if (b.sty === 'lance') {
      ctx.rotate(a); ctx.fillStyle = 'rgba(30,18,6,.8)'; ctx.beginPath(); ctx.moveTo(R * 2.5 + 3, 0); ctx.lineTo(0, R * 1 + 3); ctx.lineTo(-R * 1.9 - 3, 0); ctx.lineTo(0, -R * 1 - 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lin(-R * 2, 0, R * 2.4, 0, [[0, '#ff9a2a'], [.6, '#ffd36a'], [1, '#ffffff']]); ctx.beginPath(); ctx.moveTo(R * 2.5, 0); ctx.lineTo(0, R * .95); ctx.lineTo(-R * 1.9, 0); ctx.lineTo(0, -R * .95); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(R * .3, 0, R * .8, R * .28, 0, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.6, '#ffd36a', .4);
    } else if (b.sty === 'orb') {
      const fz = b.fuse !== undefined ? clamp(1 - b.fuse / 1.25, 0, 1) : 0, pu = 1 + Math.sin(t * (10 + fz * 40)) * (.1 + fz * .2);
      ctx.fillStyle = 'rgba(40,20,4,.85)'; ctx.beginPath(); ctx.arc(0, 0, R * pu * 1.2 + 3, 0, TAU); ctx.fill();
      ctx.fillStyle = fz > .7 && Math.floor(t * 20) % 2 ? '#fff' : '#ffb340'; ctx.beginPath(); ctx.arc(0, 0, R * pu * 1.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(0, 0, R * .6, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,230,160,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R * (1.6 + fz * 1.4), 0, TAU); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 3, '#ffa03a', .5);
    } else if (b.sty === 'bubble') {
      const w = 1 + Math.sin(t * 9 + b.x * .05) * .07; ctx.scale(w, 2 - w);
      ctx.fillStyle = 'rgba(8,30,60,.55)'; ctx.beginPath(); ctx.arc(0, 0, R * 1.15 + 3, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(120,230,255,.28)'; ctx.beginPath(); ctx.arc(0, 0, R * 1.15, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#9fefff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * 1.15, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, R * .8, 3.6, 4.7); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(R * .35, R * .35, R * .16, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.4, '#5adfff', .3);
    } else { // shard
      ctx.rotate(t * 7 + b.x * .02); const pts = [[R * 1.7, 0], [-R * .3, R * 1.0], [-R * 1.3, -R * .1], [-R * .2, -R * 1.0]];
      ctx.fillStyle = 'rgba(14,4,36,.85)'; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x * 1.2, y * 1.2) : ctx.moveTo(x * 1.2, y * 1.2)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lin(-R, -R, R, R, [[0, '#ffffff'], [.5, '#d8a8ff'], [1, '#7a3aff']]); ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(R * 1.1, 0); ctx.lineTo(0, R * .35); ctx.lineTo(-R * .2, -R * .2); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.4, '#c080ff', .4);
    }
    ctx.restore();
  };
}

// ---------- escala: inimigos mais fortes e mais agressivos conforme o jogador evolui ----------
{
  const se = spawnEnemy;
  spawnEnemy = function (type, x, y, o = {}) {
    const e = se(type, x, y, o);
    if (P3.on() && type !== 'bit' && type !== 'dummy' && type !== 'boulder' && type !== 'rod' && !o.noScale) {
      const m = (.85 + (G.stage.id - 6) * .05) * P3.heat();
      e.hp = e.maxHp = Math.ceil(e.hp * m); if (e.shield) e.shield = e.maxShield = Math.ceil(e.shield * m);
    }
    return e;
  };
}

// ---------- comportamento dos inimigos novos ----------
const leave = (e, dt, at, v = 190) => { if (e.age > at) { e.y -= v * dt; if (e.y < -70) { e.dead = true; e.counted = true; } } };
{
  const ue = updateEnemy;
  updateEnemy = function (e, dt) {
    const t = e.type; G.__src = t;
    if (P3.on()) dt *= 1 + (P3.heat() - 1) * .12 + .08;
    switch (t) {
      case 'prism':
        if (e.y < 150) e.y += 150 * dt; else e.x = e.bx + Math.sin(e.age * .5 + e.ph) * 120;
        e.cyc = (e.cyc ?? 2.2) - dt; e.charge = e.cyc < .6 && e.cyc > 0 && !e.burst;
        if (e.cyc <= 0 && !e.burst) { e.burst = 1.7; e.cyc = 4.2; }
        if (e.burst > 0) { e.burst -= dt; e.ang = (e.ang || 0) + dt * 2.4; e.fT = (e.fT || 0) - dt; if (e.fT <= 0) { e.fT = .1; for (let k = 0; k < 3; k++) ebullet(e.x, e.y, e.ang + k * TAU / 3, 195, { r: 6 }); } }
        leave(e, dt, 17); break;
      case 'lantern':
        e.y += e.spd * dt; e.x = e.bx + Math.sin(e.age * 1.1 + e.ph) * 90;
        e.dropT = (e.dropT ?? 1) - dt; if (e.dropT <= 0) { e.dropT = 2.1; ebullet(e.x, e.y + 22, Math.PI / 2, 95, { r: 10, fuse: 1.3, sty: 'orb' }); } break;
      case 'lancer': {
        e.mode = e.mode === 'enter' ? 'aim' : e.mode; e.tm = (e.tm ?? 0) + dt;
        if (e.mode === 'aim') {
          if (e.y < e.stopY) e.y += 220 * dt; e.aim = e.tm < 1.1 ? aimAt(e.x, e.y) : e.aim; e.x += (G.player.x - e.x) * Math.min(1, .9 * dt);
          if (e.tm > 1.8) { e.mode = 'fire'; e.tm = 0; e.n = 0; }
        } else if (e.mode === 'fire') {
          e.fT = (e.fT || 0) - dt; if (e.fT <= 0 && e.n < 8) { e.fT = .07; e.n++; ebullet(e.x + Math.cos(e.aim) * 30, e.y + Math.sin(e.aim) * 30, e.aim, 470, { r: 5 }); }
          if (e.tm > .9) { e.mode = 'strafe'; e.tm = 0; e.sd = Math.random() < .5 ? -1 : 1; }
        } else { e.x = clamp(e.x + e.sd * 230 * dt, 60, W - 60); if (e.tm > 1) { e.mode = 'aim'; e.tm = 0; e.cycles = (e.cycles || 0) + 1; } }
        if ((e.cycles || 0) >= 3) leave(e, dt, 0, 260); break;
      }
      case 'jelly':
        e.y += e.spd * dt; e.x = e.bx + Math.sin(e.age * .7 + e.ph) * 100;
        e.pT = (e.pT ?? 1.2) - dt; e.pulse = Math.max(0, (e.pulse || 0) - dt); if (e.pT <= 0) { e.pT = 2.6; e.pulse = .45; ring(e.x, e.y, 12, 125, e.age, { r: 7, sty: 'bubble' }); Snd.play('enemyShoot', { pan: Snd.panX(e.x) }); } break;
      case 'eel': {
        if (e.dir === undefined) { e.dir = e.x < W / 2 ? 1 : -1; e.by = e.y; e.hist = []; }
        e.x += e.dir * e.spd * dt; e.y = e.by + Math.sin(e.age * 3.2) * 55; e.hist.unshift([e.x, e.y]); if (e.hist.length > 80) e.hist.pop();
        e.fT = (e.fT ?? .4) - dt; if (e.fT <= 0) { e.fT = .36; ebullet(e.x, e.y + 12, Math.PI / 2 + rand(-.18, .18), 235, { r: 6 }); } break;
      }
      case 'urchin':
        e.y += e.spd * dt; e.x = e.bx + Math.sin(e.age * .8 + e.ph) * 80; e.rot = (e.rot || 0) + dt * 1.2; break;
      case 'shade':
        e.y += (e.sy - e.y) * Math.min(1, 3 * dt); e.x += ((W - G.player.x) - e.x) * Math.min(1, 2.4 * dt);
        e.cT = (e.cT ?? 1.6) - dt; e.chg = e.cT < .7 && e.cT > 0;
        if (e.cT <= 0) { e.cT = 2.1; e.q = 4; e.qT = 0; }
        if (e.q > 0) { e.qT -= dt; if (e.qT <= 0) { e.qT = .1; e.q--; ebullet(e.x, e.y + 24, Math.PI / 2, 360, { r: 6 }); } }
        leave(e, dt, 15); break;
      case 'facet':
        if (e.mode === 'enter') { e.y += e.spd * 1.1 * dt; e.x = e.bx + Math.sin(e.age * 2 + e.ph) * 50; if (e.y >= e.stopY) { e.mode = 'hover'; e.hv = 0; } }
        else { e.hv += dt; e.x += Math.sin(e.hv * 1.4 + e.ph) * 70 * dt; e.fT = (e.fT ?? .6) - dt; if (e.fT <= 0) { e.fT = 1.7; const a0 = aimAt(e.x, e.y); for (let k = -1; k <= 1; k++) ebullet(e.x, e.y, a0 + k * .3, 250, { r: 6, bnc: 1 }); } if (e.hv > 6) e.y += 240 * dt; }
        e.rot = (e.rot || 0) + dt * 3; break;
      case 'warden':
        e.y += ((e.sy || 150) - e.y) * Math.min(1, 2 * dt); e.x = e.bx + Math.sin(e.age * .5 + e.ph) * 150;
        e.closed = (e.age % 4.2) < 2.0; e.cnT = Math.max(0, (e.cnT || 0) - dt);
        if (!e.closed) { e.fT = (e.fT ?? 1) - dt; if (e.fT <= 0) { e.fT = 1.05; fanAimed(e.x, e.y + 20, 5, .9, 235); } }
        leave(e, dt, 20); break;
    }
    ue(e, dt);
  };
  const de = damageEnemy;
  damageEnemy = function (e, dmg, crit, chained) {
    if (e.type === 'warden' && e.closed && !chained) {
      sparks(e.x, e.y - e.rad * .5, '#ffffff', 3, 200);
      if (e.cnT <= 0) { e.cnT = .5; fanAimed(e.x, e.y + 20, 1, 0, 320, { sty: 'shard' }); }
      dmg *= .3;
    }
    return de(e, dmg, crit, chained);
  };
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.counted; ke(e, by); if (was || !e.counted) return;
    if (e.type === 'urchin') { ring(e.x, e.y, 14, 210, e.rot || 0, { r: 6 }); P3.at(.35, () => ring(e.x, e.y, 14, 150, (e.rot || 0) + .22, { r: 6 })); shockwave(e.x, e.y, 150, '#5a8aff'); }
    if (e.type === 'prism') { shockwave(e.x, e.y, 200, '#ffd36a'); burst(e.x, e.y, ['#ffd36a', '#ffffff', '#ff9a2a'], 22, 360, 5); }
  };
}

// ---------- chamada de ondas exclusivas ----------
{
  const sw = Game.spawnWave;
  const POOL = { 6: [['prism', 2], ['lantern', 4], ['lancer', 3]], 7: [['jelly', 3], ['eel', 3], ['urchin', 3]], 8: [['shade', 3], ['facet', 4], ['warden', 2]] };
  Game.spawnWave = function (pool) {
    const st = G.stage ? G.stage.id : 0;
    if (st < 6 || (G.sp && G.sp.on) || G.endless) return sw.call(this, pool);
    if (Math.random() < .09) return sw.call(this, { kami: 3, tank: 1, shield: 1 });
    const own = G.enemies.filter(e => !e.dead && P3.types.includes(e.type)).length;
    if (own >= 8) { G.spawnT = Math.min(G.spawnT, .35); return; }
    const act9 = Math.min(2, Math.floor((G.t || 0) / (G.stage.duration || 135) * 3)), L = st === 9 ? (Math.random() < .3 ? POOL[6 + (act9 + 1 + Math.floor(Math.random() * 2)) % 3] : POOL[6 + act9]) : POOL[st], tot = L.reduce((a, b) => a + b[1], 0); let r = Math.random() * tot, ty = L[0][0]; for (const [n, w] of L) { if ((r -= w) <= 0) { ty = n; break; } }
    const x = rand(120, W - 120);
    if (ty === 'prism') spawnEnemy(ty, x, -40, { bx: x });
    else if (ty === 'lantern') { for (let i = 0; i < 2; i++) { const xx = clamp(x + (i ? 170 : 0), 80, W - 80); spawnEnemy(ty, xx, -30 - i * 60, { bx: xx }); } }
    else if (ty === 'lancer') spawnEnemy(ty, x, -40, { bx: x, stopY: rand(110, 190) });
    else if (ty === 'jelly') spawnEnemy(ty, x, -50, { bx: x });
    else if (ty === 'eel') { const l = Math.random() < .5; spawnEnemy(ty, l ? -50 : W + 50, rand(110, 300), {}); }
    else if (ty === 'urchin') spawnEnemy(ty, x, -40, { bx: x });
    else if (ty === 'shade') spawnEnemy(ty, W - G.player.x, -40, { sy: rand(95, 130) });
    else if (ty === 'facet') { for (let i = 0; i < 3; i++) { const xx = clamp(x + (i - 1) * 90, 60, W - 60); spawnEnemy(ty, xx, -30 - Math.abs(i - 1) * 40, { bx: xx, stopY: rand(120, 230) + Math.abs(i - 1) * 25 }); } }
    else spawnEnemy(ty, x, -50, { bx: x, sy: rand(130, 190) });
  };
}

// ---------- visual dos inimigos novos ----------
{
  const ae = Art.enemy;
  Art.enemy = function (e) {
    if (!P3.types.includes(e.type)) return ae.call(this, e);
    const t = World.t + e.ph, r = e.rad, hit = e.hit > 0;
    ctx.save(); ctx.translate(e.x, e.y); const sc = easeBack(e.age / .35); ctx.scale(sc, sc);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 2.3, e.glow, .3); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    if (e.type === 'eel' && typeof Visual44 !== 'undefined' && Visual44.eel) { ctx.restore(); Visual44.eel(e, r, t, hit); return; }
    if (typeof Visual44 !== 'undefined' && Visual44.bodies[e.type] && e.type !== 'eel') { Visual44.bodies[e.type](e, r, t, hit); ctx.restore(); return; }
    const K = e.type;
    if (K === 'prism') {
      ctx.rotate(t * .6); const ch = e.charge ? 1 : 0, burst = e.burst > 0;
      ctx.fillStyle = hit ? '#fff' : lin(-r, -r, r, r, [[0, '#fff8d8'], [.5, '#ffd36a'], [1, '#9a6a14']]); ctx.strokeStyle = '#6a4a10'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -r * 1.3); ctx.lineTo(r * .95, 0); ctx.lineTo(0, r * 1.3); ctx.lineTo(-r * .95, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -r * 1.3); ctx.lineTo(0, r * 1.3); ctx.moveTo(-r * .95, 0); ctx.lineTo(r * .95, 0); ctx.stroke();
      const cols = ['#ff6a6a', '#ffd36a', '#7fff9a', '#6ac8ff']; ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { ctx.fillStyle = cols[i]; ctx.globalAlpha = .35 + (burst ? .35 : 0); ctx.beginPath(); ctx.moveTo(0, 0); const a = i * Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 1.2); ctx.lineTo(Math.cos(a + 1.57) * r, Math.sin(a + 1.57) * r * 1.2); ctx.closePath(); ctx.fill(); }
      ctx.globalAlpha = 1; drawGlow(0, 0, 18 + ch * 40, '#ffffff', .5 + ch * .5);
    } else if (K === 'lantern') {
      ctx.fillStyle = '#3a1a08'; ctx.fillRect(-4, -r * 1.35, 8, 10); ctx.strokeStyle = '#6a3a10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -r * 1.35); ctx.lineTo(0, -r * 1.7); ctx.stroke();
      ctx.fillStyle = hit ? '#fff' : lin(0, -r, 0, r, [[0, '#ffe08a'], [1, '#e87a1a']]); ctx.strokeStyle = '#7a3a0a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, r * .85, r * 1.08, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(122,58,10,.8)'; ctx.lineWidth = 2; for (const k of [-.45, 0, .45]) { ctx.beginPath(); ctx.ellipse(0, 0, r * .85 * Math.abs(k || .001) * 2 + 1, r * 1.08, 0, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#7a3a0a'; ctx.fillRect(-r * .5, r * .95, r, 7); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * (.75 + Math.sin(t * 8) * .08), '#ffe9a8', .4);
    } else if (K === 'lancer') {
      const a = e.mode === 'fire' || e.mode === 'aim' ? (e.aim ?? Math.PI / 2) : Math.PI / 2;
      if (e.mode === 'aim' && e.tm > .5 && e.tm < 1.8) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (e.tm > 1.1 ? .55 + .45 * Math.sin(World.t * 50) : .3); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = e.tm > 1.1 ? 3 : 1.5; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 1100, Math.sin(a) * 1100); ctx.stroke(); ctx.restore(); }
      ctx.rotate(a - Math.PI / 2); ctx.fillStyle = hit ? '#fff' : lin(0, -r, 0, r * 1.3, [[0, '#ffffff'], [1, '#d8a838']]); ctx.strokeStyle = '#7a5a10'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, r * 1.5); ctx.lineTo(r * .5, 0); ctx.lineTo(r * .9, -r * .8); ctx.lineTo(0, -r * .4); ctx.lineTo(-r * .9, -r * .8); ctx.lineTo(-r * .5, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7a5a10'; ctx.beginPath(); ctx.arc(0, 0, r * .22, 0, TAU); ctx.fill();
    } else if (K === 'jelly') {
      const pu = 1 + (e.pulse > 0 ? Math.sin(e.pulse / .45 * Math.PI) * .22 : 0), w = Math.sin(t * 3);
      ctx.strokeStyle = 'rgba(150,235,255,.8)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * r * .22, r * .3); for (let k = 1; k <= 5; k++) ctx.lineTo(i * r * .22 + Math.sin(t * 3 + i + k * .9) * 5 * k * .4, r * .3 + k * r * .3); ctx.stroke(); }
      ctx.scale(pu, 2 - pu); ctx.fillStyle = hit ? '#fff' : lin(0, -r, 0, r * .4, [[0, 'rgba(210,250,255,.95)'], [1, 'rgba(70,170,230,.7)']]); ctx.strokeStyle = '#bfefff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, Math.PI, 0); ctx.quadraticCurveTo(r * .6, r * .5 + w * 2, 0, r * .35); ctx.quadraticCurveTo(-r * .6, r * .5 - w * 2, -r, 0); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-r * .35, -r * .4, r * .28, r * .14, -.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#0a3a6a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * .3, -r * .1, 4, 0, TAU); ctx.fill(); }
    } else if (K === 'eel') {
      ctx.restore(); ctx.save(); const H = e.hist || [];
      for (let i = 9; i >= 1; i--) { const q = H[Math.min(H.length - 1, i * 6)]; if (!q) continue; const rr = r * (1 - i * .075); ctx.fillStyle = hit ? '#fff' : i % 2 ? '#1fb89a' : '#2ad8b0'; ctx.strokeStyle = '#06483c'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(q[0], q[1], rr, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(q[0] - rr * .2, q[1] - rr * .3, rr * .25, 0, TAU); ctx.fill(); }
      ctx.translate(e.x, e.y); ctx.scale(e.dir || 1, 1); ctx.fillStyle = hit ? '#fff' : '#35f0c0'; ctx.strokeStyle = '#06483c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(4, 0, r * 1.25, r * .95, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#06483c'; ctx.beginPath(); ctx.moveTo(r * .6, 5); ctx.lineTo(r * 1.45, 9); ctx.lineTo(r * .7, 14); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * .5, -r * .25, 7, 0, TAU); ctx.fill(); ctx.fillStyle = '#06483c'; ctx.beginPath(); ctx.arc(r * .55, -r * .25, 3.4, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#9fffe8'; ctx.globalAlpha = .6 + Math.sin(World.t * 12) * .3; ctx.beginPath(); ctx.arc(-r * .2, -r * .55, 4, 0, TAU); ctx.fill();
    } else if (K === 'urchin') {
      ctx.rotate(e.rot || 0); const low = e.hp < e.maxHp * .35 ? 1.35 : 1;
      ctx.strokeStyle = hit ? '#fff' : '#9fc0ff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .8, Math.sin(a) * r * .8); ctx.lineTo(Math.cos(a) * r * (1.5 + (i % 2) * .35) * low, Math.sin(a) * r * (1.5 + (i % 2) * .35) * low); ctx.stroke(); }
      ctx.fillStyle = hit ? '#fff' : lin(-r, -r, r, r, [[0, '#6a8aff'], [1, '#0e1a5a']]); ctx.strokeStyle = '#a8c0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * .9, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.rotate(-(e.rot || 0)); ctx.fillStyle = '#fff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * .3, -r * .1, 6, 8, 0, 0, TAU); ctx.fill(); } ctx.fillStyle = '#0e1a5a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * .3, -r * .05, 3, 0, TAU); ctx.fill(); }
    } else if (K === 'shade') {
      if (e.chg) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .4 + .5 * Math.sin(World.t * 45); ctx.strokeStyle = '#d8a8ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, H); ctx.stroke(); ctx.restore(); }
      ctx.scale(1, -1); ctx.globalAlpha = .85; ctx.fillStyle = hit ? '#fff' : '#1a0a40'; ctx.strokeStyle = '#d8a8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -r * 1.2); ctx.lineTo(r * 1.1, r * .8); ctx.lineTo(r * .4, r * .45); ctx.lineTo(0, r * .9); ctx.lineTo(-r * .4, r * .45); ctx.lineTo(-r * 1.1, r * .8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 1; ctx.scale(1, -1); ctx.fillStyle = '#fff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * .28, 0, 5, 8, 0, 0, TAU); ctx.fill(); }
    } else if (K === 'facet') {
      ctx.rotate(e.rot || 0); ctx.fillStyle = hit ? '#fff' : lin(-r, -r, r, r, [[0, '#ffffff'], [.5, '#c8a8ff'], [1, '#5a3a9a']]); ctx.strokeStyle = '#f0e0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -r * 1.35); ctx.lineTo(r * .85, -r * .1); ctx.lineTo(r * .45, r * 1.1); ctx.lineTo(-r * .55, r * .95); ctx.lineTo(-r * .9, -r * .2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -r * 1.35); ctx.lineTo(r * .1, r * .1); ctx.lineTo(r * .45, r * 1.1); ctx.moveTo(r * .1, r * .1); ctx.lineTo(-r * .9, -r * .2); ctx.stroke();
    } else if (K === 'warden') {
      const cl = e.closed; ctx.fillStyle = '#2a1060'; ctx.strokeStyle = cl ? '#ffffff' : '#c080ff'; ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5236; ctx.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.2); } ctx.closePath(); ctx.fill(); ctx.stroke();
      if (cl) { ctx.fillStyle = hit ? '#fff' : lin(-r, -r, r, r, [[0, '#ffffff'], [.4, '#c8d8ff'], [.6, '#ffffff'], [1, '#8a9aff']]); ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .5236; ctx.lineTo(Math.cos(a) * r * .88, Math.sin(a) * r * 1.02); } ctx.closePath(); ctx.fill(); const gl = ((World.t * 1.5) % 1) * r * 2.4 - r * 1.2; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(gl, -r, 7, r * 2); }
      else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, r * .62, r * .42, 0, 0, TAU); ctx.fill(); ctx.fillStyle = hit ? '#ff3a3a' : '#c040ff'; ctx.beginPath(); ctx.arc(Math.sin(t * 2) * 6, 0, r * .26, 0, TAU); ctx.fill(); ctx.fillStyle = '#10062a'; ctx.beginPath(); ctx.arc(Math.sin(t * 2) * 6, 0, r * .1, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  };
}

// ---------- tiros que mudam de caminho ----------
P3.update = function (dt) {
  for (let i = P3.q.length - 1; i >= 0; i--) { const q = P3.q[i]; q.t -= dt; if (q.t <= 0) { P3.q.splice(i, 1); q.fn(); } }
  if (!G.player) return;
  P3.hist.push([World.t, G.player.x]); while (P3.hist.length && P3.hist[0][0] < World.t - 4) P3.hist.shift();
  for (const b of G.eb) {
    if (b.dead) continue;
    if (b.fuse !== undefined) { b.fuse -= dt; if (b.fuse <= 0) { b.dead = true; ring(b.x, b.y, 10, 150, rand(0, 6), { r: 6 }); shockwave(b.x, b.y, 90, '#ffd36a'); } }
    if (b.bnc > 0 && (b.x < 16 || b.x > W - 16)) { b.vx = -b.vx; b.x = clamp(b.x, 17, W - 17); b.bnc--; sparks(b.x, b.y, '#ffffff', 3, 120); }
  }
  if (G.invT > 0) G.invT -= dt;
  if (P3.cur) { P3.cur.t -= dt; for (let i = 0; i < 2; i++) G.parts.push({ x: P3.cur.dir > 0 ? -10 : W + 10, y: rand(80, H - 40), vx: P3.cur.dir * rand(500, 900), vy: rand(-12, 12), life: rand(.6, 1.1), max: 1, r: rand(2, 4), c: '#9fefff', drag: 0 }); if (P3.cur.t <= 0) P3.cur = null; }
};
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { if (!G.player || G.state !== 'play') return up.call(this, dt); up.call(this, dt); P3.update(dt); };
  const upl = Game.updatePlayer;
  Game.updatePlayer = function (dt) {
    const p = G.player, x0 = p.x; upl.call(this, dt);
    if (p.dead || G.finisher || G.cut) return;
    if (G.invT > 0) { p.x = clamp(x0 - (p.x - x0), 50, W - 50); p.vx = -p.vx; }
    if (P3.cur) p.x = clamp(p.x + P3.cur.dir * 190 * dt, 50, W - 50);
  };
  const ss = Game.startStage;
  Game.startStage = function (idx, o) { P3.q = []; P3.hist = []; P3.cur = null; G.invT = 0; return ss.call(this, idx, o); };
}

// ---------- ataques exclusivos dos chefes ----------
const addAI = (Cls, fn) => { const a = Cls.prototype.ai; Cls.prototype.ai = function (dt) { a.call(this, dt); if (this.state === 'fight' && !(this.stun > 0)) fn.call(this, dt); }; };
const countOf = ty => G.enemies.filter(e => !e.dead && e.type === ty).length;
addAI(Herald, function (dt) {
  const ph = this.phase;
  if (this.tick('halo', dt, ph === 0 ? 7 : ph === 1 ? 6 : 4.8)) { // halo: anel de luz que fecha em volta do jogador, com uma passagem
    const cx = G.player.x, cy = G.player.y, n = 30, gap = Math.floor(rand(0, n)), R = 400; popup(cx, cy - 70, 'HALO!', '#ffe9a8', 26); Visual16.tip('bs_halo', 'Halo', 'Um anel de luz fecha em volta de você. Passe pela abertura.'); shockwave(cx, cy, 160, '#ffe9a8'); Snd.play('bossWarn');
    for (let i = 0; i < n; i++) { const d = ((i - gap + n) % n); if (d < 4) continue; const a = i / n * TAU; ebullet(cx + Math.cos(a) * R, cy + Math.sin(a) * R, a + Math.PI, 125 + ph * 12, { r: 6, life: 6 }); }
  }
  if (ph >= 1 && this.tick('grid', dt, ph === 1 ? 10 : 8)) { // vitral: grade de colunas e linhas de luz
    popup(W / 2, 240, 'VITRAL!', '#ffe9a8', 26); Visual16.tip('bs_grid', 'Vitral', 'Linhas e colunas de luz piscam antes de disparar. Fique numa célula vazia.'); const cols = 3 + ph, xs = []; for (let i = 0; i < cols; i++) xs.push(70 + (i + rand(.1, .9)) * (W - 140) / cols);
    for (const x of xs) Events.hazardRect(x, H / 2, 64, H, 1.35, .5, '#ffe9a8', 'bolt');
    for (const y of [rand(260, 360), rand(420, 560)]) Events.hazardRect(W / 2, y, W + 40, 58, 1.35, .5, '#ffe9a8', 'beam');
  }
  if (this.tick('lanterns', dt, 11) && countOf('lantern') < 3) for (const s of [-1, 1]) spawnEnemy('lantern', clamp(this.x + s * 180, 80, W - 80), this.y + 40, { bx: clamp(this.x + s * 180, 80, W - 80), noElite: true });
  if (ph === 2 && this.tick('prismSum', dt, 16) && countOf('prism') < 2) spawnEnemy('prism', rand(200, W - 200), -40, { bx: rand(200, W - 200), noElite: true });
});
addAI(Leviathan, function (dt) {
  const ph = this.phase;
  if (this.tick('tide', dt, ph === 0 ? 6.5 : ph === 1 ? 5.2 : 4.4)) { // maré: parede de bolhas com vão
    popup(W / 2, 230, 'MARÉ!', '#9fefff', 26); Visual16.tip('bs_tide', 'Maré', 'Uma parede de bolhas desce com um vão. Alinhe-se com ele.'); Snd.play('bossWarn'); const gx = rand(150, W - 150), gw = 2;
    for (let row = 0; row < 2; row++) P3.at(row * .75, () => { for (let i = 0; i < 20; i++) { const x = 30 + i * 62; if (Math.abs(x - gx) < gw * 62 / 2 + 30 + (row ? 20 : 0)) continue; ebullet(x, 60, Math.PI / 2, 150, { r: 8, life: 9 }); } });
  }
  if (ph >= 1 && this.tick('current', dt, ph === 1 ? 13 : 10)) { // correnteza empurra a nave para o lado
    const dir = Math.random() < .5 ? -1 : 1; popup(W / 2, 230, dir > 0 ? 'CORRENTEZA >>>' : '<<< CORRENTEZA', '#9fefff', 28); Visual16.tip('bs_cur', 'Correnteza', 'A água empurra a nave para o lado por alguns segundos. Reme contra ela.'); Snd.play('bossWarn'); P3.at(.7, () => { P3.cur = { dir, t: 2.6 }; });
  }
  if (this.tick('jellySum', dt, 10) && countOf('jelly') < 3) { const x = rand(150, W - 150); spawnEnemy('jelly', x, -40, { bx: x, noElite: true }); }
  if (ph === 2 && this.tick('eelSum', dt, 13) && countOf('eel') < 2) { const l = Math.random() < .5; spawnEnemy('eel', l ? -50 : W + 50, rand(130, 320), { noElite: true }); }
});
addAI(Mirror, function (dt) {
  const ph = this.phase;
  if (this.tick('echo', dt, ph === 0 ? 7.5 : ph === 1 ? 6.4 : 5.4)) { // eco: golpes caem onde o jogador estava
    popup(W / 2, 230, 'ECO!', '#e8d0ff', 26); Visual16.tip('bs_echo', 'Eco', 'Os golpes caem onde você ESTAVA. Não repita o caminho.'); Snd.play('bossWarn'); const n = 7, past = [];
    for (let i = 0; i < n; i++) { const tt = World.t - 2.2 + i * .3, s = P3.hist.find(h => h[0] >= tt) || P3.hist[P3.hist.length - 1]; if (s) past.push(s[1]); }
    past.forEach((x, i) => P3.at(.6 + i * .3, () => Events.hazardRect(x, H / 2, 58, H, .85, .25, '#e8d0ff', 'bolt')));
  }
  if (ph >= 1 && this.tick('invert', dt, ph === 1 ? 14 : 11) && !Save.data.settings.assist) { // espelhado: controles invertidos por instantes
    popup(G.player.x, G.player.y - 80, 'ESPELHADO! CONTROLES INVERTIDOS', '#e8d0ff', 22); Visual16.tip('bs_inv', 'Espelhado', 'Os controles ficam invertidos por 2 segundos. Fique parado se precisar.'); Snd.play('bossWarn'); shockwave(G.player.x, G.player.y, 200, '#e8d0ff'); P3.at(.8, () => { G.invT = 2.4; });
  }
  if (this.tick('shadeSum', dt, 10) && countOf('shade') < 2) spawnEnemy('shade', W - G.player.x, -40, { sy: rand(95, 130), noElite: true });
  if (ph === 2 && this.tick('wardSum', dt, 16) && countOf('warden') < 1) { const x = rand(200, W - 200); spawnEnemy('warden', x, -50, { bx: x, sy: 190, noElite: true }); }
});

// ---------- chefes crescem junto com o jogador (todos): quanto mais poder de fogo, mais vida, para a luta nao acabar rapido demais ----------
{
  const bu = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const b = G.boss; if (b && !b._p3 && G.player) { b._p3 = 1; const m = clamp(Math.pow(P3.pw() / 12, .75), 1, 5); if (m > 1.02) { b.maxHp = b.hp = Math.round(b.maxHp * m); } }
    return bu.call(this, dt);
  };
}
