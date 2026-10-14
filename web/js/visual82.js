'use strict';
// ---------- 82: golpe de fusao exclusivo por combinacao, mecanicas de ambiente nas lutas de chefe, mapas no modo infinito, passivas dos guardioes,
// tutorial de arma nova, pausa completa, replay da derrota e acessibilidade (leitor de tela, fonte, contraste) ----------
const Visual82 = { env: [], rp: null, buf: [], bacc: 0, pt: { C: 0, P: 0 }, kc: 0, rc: 0, lastFoc: '', rpI: 0 };
const ok82 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const S82 = () => Save.data.settings || {};

// ---------- 4. golpe de fusao: duas "formas" diferentes, uma depois da outra, nas cores das duas armas ----------
{
  const NM = { violet: 'ESTRELAS', fan: 'LEQUE', laser: 'RAIOS', cannon: 'BOMBAS', boomerang: 'LÂMINAS', chain: 'TEMPESTADE', flame: 'ANEL DE FOGO', lanca: 'LANÇAS', espiral: 'ESPIRAL' };
  const T = (d, fn) => { if (G.timers) G.timers.push({ t: d, fn }); else fn(); };
  const SH = {
    violet(p, c) { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .5; G.pb.push({ kind: 'missile', star: true, x: p.x, y: p.y - 20, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, dmg: p.dmg * 2.2, pierce: 0, hits: [], life: 3.2, speed: 780, target: null, c }); } },
    fan(p, c) { for (let L = 0; L < 3; L++) for (let i = 0; i < 9; i++) mkBullet(p, p.x, p.y - 20, -Math.PI / 2 + (i - 4) * .22, 600 + L * 150, 1.1, { c, pierce: 1 }); },
    laser(p, c) { for (let col = 0; col < 5; col++) for (let k = 0; k < 8; k++) { const x = p.x + (col - 2) * 110; T(k * .07, () => { if (G.player) mkBullet(G.player, x, G.player.y - 20, -Math.PI / 2, 1100, 1.2, { pierce: 99, r: 10, c }); }); } },
    cannon(p, c) { for (let i = 0; i < 5; i++) mkBullet(p, p.x, p.y - 30, -Math.PI / 2 + (i - 2) * .35, 600, 3, { kind: 'cannon', r: 20, aoe: 110, life: 1.5, pierce: 0, c }); },
    boomerang(p, c) { for (let i = 0; i < 8; i++) mkBullet(p, p.x, p.y, i * TAU / 8, 560, 2.6, { kind: 'boom', bt: 0, pierce: 99, r: 22, life: 3.4, c }); },
    chain(p, c) { const L = G.enemies.filter(e => !e.dead && e.y > 0).slice(0, 8); for (const e of L) { G.parts.push({ k: 'bolt', x: e.x, y: -20, x2: e.x, y2: e.y, vx: 0, vy: 0, life: .25, max: .25, r: 3, c, drag: 1 }); damageEnemy(e, p.dmg * 3.2, false, true); } },
    flame(p, c) { for (let i = 0; i < 20; i++) mkBullet(p, p.x, p.y, i * TAU / 20, 520, .7, { kind: 'flame', life: .8, l0: .8, pierce: 99, r: 16, c }); },
    lanca(p, c) { for (let i = 0; i < 8; i++) mkBullet(p, p.x, p.y, i * TAU / 8 + .2, 640, 2.4, { pierce: 99, r: 14, life: 1.8, c }); },
    espiral(p, c) { for (let k = 0; k < 30; k++) T(k * .03, () => { if (G.player) mkBullet(G.player, G.player.x, G.player.y, k * .55, 520, .9, { c }); }); },
  };
  Visual82.fusion = function (p, parts, cs) {
    const a = parts[0], b = parts[1], ca = cs[0] || '#e8dcff', cb = cs[1] || cs[0] || '#ffffff';
    if (SH[a]) SH[a](p, ca); T(.55, () => { if (G.player && !G.player.dead && SH[b]) { SH[b](G.player, cb); shockwave(G.player.x, G.player.y, 200, cb); } });
    G.eb.forEach(q => { if (Math.hypot(q.x - p.x, q.y - p.y) < 230) q.dead = true; });
    popup(p.x, p.y - 100, (NM[a] || a) + ' + ' + (NM[b] || b), ca, 22);
  };
}

// ---------- 5. mecanicas de ambiente nas lutas de chefe ----------
{
  const MECH = { 0: ['cover'], 1: ['cover'], 2: ['dark'], 3: ['wind'], 4: ['well'], 5: ['dark'], 6: ['lanes'], 7: ['wind'], 8: ['well', 'cover'], 9: ['well', 'dark'] };
  const INFO = { cover: ['COBERTURA', 'Os pilares seguram os tiros inimigos'], dark: ['ESCURIDÃO', 'A luz da sua nave guia o caminho'], wind: ['VENTO', 'A nave é empurrada para os lados'], well: ['GRAVIDADE', 'Um ponto atrai a sua nave'], lanes: ['COLUNAS DE LUZ', 'Saia das linhas antes do disparo'] };
  const mk = k => { const e = { k, t: 0 }; if (k === 'cover') e.pil = [0, 1, 2].map(i => ({ x: 240 + i * 400, y: 430 + (i % 2) * 40, w: 78, h: 96, hp: 18, ph: i * 2 })); if (k === 'lanes') { e.cd = 3; e.col = []; } return e; };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const b = G.boss, p = G.player;
    if (!b || b.state !== 'fight' || !p || G.endless || G.state !== 'play') { if (!b) { Visual82.env = []; Visual82.envB = null; } return r; }
    if (Visual82.envB !== b) { Visual82.envB = b; Visual82.env = (MECH[G.stageIdx] || []).map(mk); if (Visual82.env.length) Events.banner = { t: 0, title: INFO[Visual82.env[0].k][0], sub: INFO[Visual82.env[0].k][1], c: '#ffe9a8' }; }
    for (const e of Visual82.env) {
      e.t += dt;
      if (e.k === 'cover') { for (const q of e.pil) { q.x += Math.sin(e.t * .4 + q.ph) * 20 * dt; for (const bl of G.eb) if (!bl.dead && Math.abs(bl.x - q.x) < q.w / 2 && Math.abs(bl.y - q.y) < q.h / 2) { bl.dead = true; q.hp--; sparks(bl.x, bl.y, '#c8a0b8', 3, 140); } if (q.hp <= 0) { burst(q.x, q.y, ['#c8a0b8', '#6a4a30'], 14, 240, 6); q.hp = 18; q.y = -200; q.back = e.t + 8; } if (q.back && e.t > q.back) { q.y = 430; q.back = 0; } } }
      else if (e.k === 'wind') { const wx = Math.sin(e.t * .45) * 110, wy = G.stageIdx === 7 ? Math.cos(e.t * .3) * 50 : 0; p.x = clamp(p.x + wx * dt, 30, W - 30); p.y = clamp(p.y + wy * dt, 80, H - 30); e.wx = wx; }
      else if (e.k === 'well') { const cx = W / 2 + Math.sin(e.t * .3) * 260, cy = H * .5, dx = cx - p.x, dy = cy - p.y, d = Math.hypot(dx, dy) || 1, f = 95 * Math.max(0, 1 - d / 520); p.x += dx / d * f * dt; p.y += dy / d * f * dt; e.cx = cx; e.cy = cy; }
      else if (e.k === 'lanes') { e.cd -= dt; if (e.cd <= 0) { e.cd = 5; e.col.push({ x: rand(100, W - 100), t: 0 }); } for (const c of e.col) { c.t += dt; if (c.t > 1 && c.t - dt <= 1) { shake(6); flashScreen(.1); if (Math.abs(p.x - c.x) < 38 && p.inv <= 0 && !p.dead) hurtPlayer(1); } } e.col = e.col.filter(c => c.t < 1.5); }
    }
    return r;
  };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const p = G.player; if (!p || G.state !== 'play' || QL() < 1) return;
    for (const e of Visual82.env) {
      ctx.save();
      if (e.k === 'cover') for (const q of e.pil) { if (q.y < 0) continue; ctx.fillStyle = '#4a3a5a'; ctx.strokeStyle = '#c8a0b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(q.x - q.w / 2, q.y - q.h / 2, q.w, q.h, 10); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(q.x - q.w / 2 + 8, q.y - q.h / 2 + 8, 10, q.h - 16); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(q.x - q.w / 2, q.y + q.h / 2 - 8, q.w * (1 - q.hp / 18), 8); }
      else if (e.k === 'dark') { const k = .62 + .1 * Math.sin(e.t * 2.3), g = ctx.createRadialGradient(p.x, p.y, 120, p.x, p.y, 380); g.addColorStop(0, 'rgba(2,0,12,0)'); g.addColorStop(1, 'rgba(2,0,12,' + k + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      else if (e.k === 'wind') { ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; const dir = Math.sign(e.wx || 1); for (let i = 0; i < 16; i++) { const x = ((i * 191 + e.t * 260 * dir) % W + W) % W, y = (i * 83) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dir * 40, y); ctx.stroke(); } }
      else if (e.k === 'well') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(184,140,255,.5)'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(e.cx || W / 2, e.cy || H / 2, 30 + ((e.t * 40 + i * 30) % 120), 0, TAU); ctx.globalAlpha = .6 - ((e.t * 40 + i * 30) % 120) / 200; ctx.stroke(); } ctx.globalAlpha = 1; drawGlow(e.cx || W / 2, e.cy || H / 2, 40, '#b98cff', .8); }
      else if (e.k === 'lanes') for (const c of e.col) { const hot = c.t > 1; ctx.fillStyle = hot ? 'rgba(255,240,180,.55)' : 'rgba(255,214,120,' + (.12 + .1 * Math.sin(c.t * 30)) + ')'; ctx.fillRect(c.x - 38, 0, 76, H); if (!hot) { ctx.strokeStyle = 'rgba(255,214,120,.7)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(c.x, 0); ctx.lineTo(c.x, H); ctx.stroke(); } }
      ctx.restore();
    }
  };
}

// ---------- 6. mapas no modo infinito ----------
{
  const MAPS = [['LIVRE', []], ['CRUZ', [[W / 2 - 24, 330, 48, 230], [W / 2 - 150, 430, 300, 44]]], ['CORREDOR', [[300, 300, 40, 300], [W - 340, 300, 40, 300]]], ['ILHAS', [[200, 380, 110, 50], [W / 2 - 55, 300, 110, 50], [W - 310, 380, 110, 50], [420, 520, 90, 40], [W - 510, 520, 90, 40]]], ['ARENA', [[120, 250, 40, 160], [W - 160, 250, 40, 160], [W / 2 - 100, 560, 200, 36]]]];
  Visual82.MAPS = MAPS;
  const se = Game.startEndless;
  Game.startEndless = function () { const r = se.apply(this, arguments); G.map = MAPS[Save.data.endMap || 0][1]; if (G.map.length) Events.banner = { t: 0, title: 'MAPA: ' + MAPS[Save.data.endMap || 0][0], sub: 'Obstáculos seguram tiros e bloqueiam a nave', c: '#7fe0ff' }; return r; };
  const ss = Game.startStage; Game.startStage = function () { G.map = null; return ss.apply(this, arguments); };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const p = G.player; if (!G.map || !G.map.length || !p || G.state !== 'play') return r;
    for (const [x, y, w, h] of G.map) {
      for (const b of G.eb) if (!b.dead && b.x > x && b.x < x + w && b.y > y && b.y < y + h) { b.dead = true; sparks(b.x, b.y, '#7fe0ff', 3, 120); }
      if (p.x > x - 14 && p.x < x + w + 14 && p.y > y - 14 && p.y < y + h + 14) { const dl = p.x - (x - 14), dr = (x + w + 14) - p.x, dtp = p.y - (y - 14), db = (y + h + 14) - p.y, m = Math.min(dl, dr, dtp, db); if (m === dl) p.x = x - 14; else if (m === dr) p.x = x + w + 14; else if (m === dtp) p.y = y - 14; else p.y = y + h + 14; }
    }
    return r;
  };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); if (!G.map || G.state !== 'play') return; ctx.save();
    for (const [x, y, w, h] of G.map) { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#24407a'); g.addColorStop(1, '#0e1c44'); ctx.fillStyle = g; ctx.strokeStyle = '#7fe0ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill(); ctx.stroke(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .25 + .15 * Math.sin(World.t * 3 + x); drawGlow(x + w / 2, y + h / 2, Math.max(w, h) * .7, '#7fe0ff', .5); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
    ctx.restore();
  };
  Screens.maps = function () {
    txt('MAPAS DO INFINITO', W / 2, 30, 46, '#fff', 'center'); txt('Escolha o mapa e comece. Obstáculos seguram tiros inimigos e bloqueiam a nave.', W / 2, 92, 17, '#cdb8ff', 'center', 700);
    MAPS.forEach(([nm, rects], i) => {
      const x = 80 + (i % 3) * 380, y = 140 + Math.floor(i / 3) * 210, sel = (Save.data.endMap || 0) === i; UI.panel(x, y, 350, 190, { r: 18, stroke: sel ? '#ffb340' : undefined });
      ctx.save(); ctx.translate(x + 20, y + 44); ctx.scale(.22, .22); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#4a7ad0'; rects.forEach(([rx, ry, rw, rh]) => ctx.fillRect(rx, ry, rw, rh)); ctx.restore();
      txt(nm, x + 20, y + 10, 20, sel ? '#ffb340' : '#fff', 'left', 900);
      if (UI.button('mp' + i, x + 20, y + 142, 310, 38, sel ? '✓ JOGAR' : 'ESCOLHER E JOGAR', { size: 14 })) { Save.data.endMap = i; Save.save(); Game.startEndless(); }
    });
    if (UI.button('back', W / 2 - 160, 600, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
  };
}

// ---------- 7. passivas dos guardioes (do acompanhante ou do piloto) ----------
{
  const PASS = { C: ['Mel da Colmeia', 'Cura 1 de vida a cada 45 s'], P: ['Casca do Pétreo', 'Recria o escudo a cada 25 s'], E: ['Olhar Atento', 'Ímã de estrelas +90'], S: ['Chama Viva', 'A cada 15 inimigos, uma onda de fogo'] };
  Visual82.PASS = PASS;
  const act = () => { const r = []; const c = Save.data.comp && Save.data.comp.id, ch = (Save.data.loadout || {}).char; for (const id of [c, ch]) if (id && PASS[id] && !r.includes(id) && typeof GUARDS !== 'undefined' && GUARDS[id] && GUARDS[id].ok()) r.push(id); return r; };
  Visual82.act = act;
  const rs = recalcStats; recalcStats = function (p) { rs(p); if (p === G.player && act().includes('E')) p.magnet += 90; };
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const p = G.player; if (!p || p.dead || G.state !== 'play') return r; const A = act(), T = Visual82.pt;
    if (A.includes('C')) { T.C += dt; if (T.C > 45) { T.C = 0; if (p.hp < p.maxHp) { p.hp++; popup(p.x, p.y - 60, '+1 (Mel da Colmeia)', '#ffb340', 20); Snd.play('heart'); } } }
    if (A.includes('P')) { T.P += dt; if (T.P > 25) { T.P = 0; if (!p.shieldReady) { p.shieldReady = true; popup(p.x, p.y - 60, 'Casca do Pétreo', '#c8a0b8', 20); Snd.play('shield'); } } }
    return r;
  };
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.dead && e.counted; const r = ke.apply(this, arguments);
    if (!was && by && act().includes('S') && ++Visual82.kc >= 15) { Visual82.kc = 0; const p = G.player; if (p) { shockwave(p.x, p.y, 240, '#ff8a1f'); for (const q of G.enemies) if (!q.dead && Math.hypot(q.x - p.x, q.y - p.y) < 240) damageEnemy(q, p.dmg * 2.5, false, true); popup(p.x, p.y - 60, 'Chama Viva', '#ff8a1f', 20); } }
    return r;
  };
  const ss = Game.startStage; Game.startStage = function () { Visual82.pt = { C: 0, P: 0 }; Visual82.kc = 0; Visual82.buf = []; return ss.apply(this, arguments); };
}

// ---------- 8. tutorial de arma nova (mini-fase de treino de 10 alvos) ----------
{
  let base = null;
  hookRender(rn => function () {
    rn(); const ow = Save.data.owned && Save.data.owned.weapons; if (!ow) return; const cur = Object.keys(ow).filter(k => ow[k] && !k.startsWith('fz_'));
    if (!base) { base = new Set(cur); return; } const d = Save.data; d.wq = d.wq || []; d.wdone = d.wdone || {};
    for (const k of cur) if (!base.has(k)) { base.add(k); if (WEAPONS[k] && !d.wdone[k] && !d.wq.includes(k)) { d.wq.push(k); Save.save(); } }
  });
  const hg = Screens.hangar;
  Screens.hangar = function () {
    const r = hg.apply(this, arguments); const q = (Save.data.wq || [])[0]; if (!q || !WEAPONS[q]) return r;
    if (UI.button('wtut', 16, 10, 480, 36, 'ARMA NOVA: ' + WEAPONS[q].name + ' — TESTAR EM 10 ALVOS', { size: 13, color: '#c2412a' })) { Save.data.wq.shift(); Save.data.wdone[q] = 1; Save.save(); Game.startTraining(); const p = G.player; p.weapon = q; recalcStats(p); G.wtut = { id: q, k0: G.kills, done: false }; }
    return r;
  };
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); const w = G.wtut; if (!w || G.state !== 'play' || !G.training) { if (w && !G.training) G.wtut = null; return; } const n = clamp(G.kills - w.k0, 0, 10); if (n >= 10 && !w.done) { w.done = true; popup(W / 2, 260, 'APROVADO!', '#7fe0a0', 36); Snd.play('stamp'); }
    ctx.save(); UI.panel(W / 2 - 280, 100, 560, 92, { r: 16 }); txt('TESTE: ' + WEAPONS[w.id].name, W / 2, 110, 20, WEAPONS[w.id].c, 'center', 900); txt(w.done ? 'Pronto! Aperte ESC para sair quando quiser.' : 'Derrube os alvos: ' + n + ' / 10   •   Q = ' + WEAPONS[w.id].specName, W / 2, 148, 17, '#fff', 'center', 700); ctx.restore();
  };
}

// ---------- 9. pausa completa: resumo, upgrades, passivas e reiniciar ----------
{
  const ps = Screens.pause;
  Screens.pause = function () {
    const r = ps.apply(this, arguments); const p = G.player; if (!p) return r;
    const A = Visual82.act();
    if (A.length) txt('PASSIVAS', 870, 572, 14, '#7fe0a0', 'left', 900); A.forEach((id, i) => txt(Visual82.PASS[id][0] + ': ' + Visual82.PASS[id][1], 870, 594 + i * 22, 14, '#cdf5dd', 'left', 700));
    if (!G.training && !G.rush) { const c = Visual82.rc > 0; if (UI.button('prst', 460, 604, 380, 40, c ? 'CLIQUE DE NOVO PARA CONFIRMAR' : 'REINICIAR FASE', { size: 16, color: c ? '#c2412a' : undefined })) { if (c) { Visual82.rc = 0; if (G.endless) Game.startEndless(); else Game.enter(G.stageIdx, { skipStory: true }); } else Visual82.rc = 3; } }
    Visual82.rc = Math.max(0, Visual82.rc - 1 / 60); return r;
  };
}

// ---------- 10. replay da derrota: os ultimos 10 s da luta (camera lenta so aqui) ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const b = G.boss, p = G.player; if (G.state !== 'play' || !b || b.state !== 'fight' || !p) return r;
    Visual82.bacc += dt; if (Visual82.bacc < 1 / 30) return r; Visual82.bacc = 0;
    const eb = []; for (let i = 0; i < Math.min(G.eb.length, 160); i++) { const q = G.eb[i]; eb.push([q.x, q.y, q.r || 6, q.c || '#ff4a2e']); }
    const pb = []; for (let i = 0; i < Math.min(G.pb.length, 50); i++) pb.push([G.pb[i].x, G.pb[i].y]);
    Visual82.buf.push({ px: p.x, py: p.y, bx: b.x, by: b.y, bt: b.t, ph: b.phase, eb, pb, boss: b }); if (Visual82.buf.length > 300) Visual82.buf.shift(); return r;
  };
  hookRender(rn => { let last = ''; return function () { rn(); const s = G.state; if (s !== last) { if (s === 'over' && Visual82.buf.length > 30 && G.boss) { Visual82.rp = { buf: Visual82.buf.slice(), boss: G.boss }; } else if (s === 'over') Visual82.rp = null; last = s; } }; });
  const ov = Screens.over;
  Screens.over = function () {
    const r = ov.apply(this, arguments); if (Visual82.rp && !G.endless && UI.button('rpl', W / 2 - 190, 596, 380, 40, 'REVER OS ÚLTIMOS SEGUNDOS', { size: 15 })) { Visual82.rpI = 0; G.state = 'replay'; } return r;
  };
  Screens.replay = function () {
    const R = Visual82.rp; if (!R) { G.state = 'over'; return; } World.draw(0); ctx.fillStyle = 'rgba(2,0,12,.35)'; ctx.fillRect(0, 0, W, H);
    Visual82.rpI += (1 / 60) * 30 * .35; if (Visual82.rpI >= R.buf.length) Visual82.rpI = 0; const f = R.buf[Math.floor(Visual82.rpI)], b = R.boss;
    const sv = [b.x, b.y, b.t, b.phase, b.state, b.shx, b.shy]; b.x = f.bx; b.y = f.by; b.t = f.bt; b.phase = f.ph; b.state = 'fight'; b.shx = b.shy = 0; try { b.draw(); } catch (e) { } [b.x, b.y, b.t, b.phase, b.state, b.shx, b.shy] = sv;
    for (const [x, y] of f.pb) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 12, '#b98cff', .9); ctx.restore(); }
    for (const [x, y, r, c] of f.eb) { try { Art.ebullet({ x, y, vx: 0, vy: 0, r, c, life: 5, age: 1 }); } catch (e) { } }
    try { Art.ship(f.px, f.py, { vx: 0, t: World.t, lookx: 0, looky: -1, blinkT: 0, scale: SHIP_S }); } catch (e) { }
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, 70); txt('REPLAY • CÂMERA LENTA (só nesta tela)', W / 2, 20, 24, '#ffe9a8', 'center', 900);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(240, 690, 800, 8); ctx.fillStyle = '#ffb340'; ctx.fillRect(240, 690, 800 * Visual82.rpI / R.buf.length, 8);
    if (UI.button('rpb', W / 2 - 160, 620, 320, 48, 'VOLTAR', { size: 20 }) || Input.pressed('escape')) { G.state = 'over'; }
  };
}

// ---------- 12. acessibilidade: leitor de tela, tamanho da fonte e contraste ----------
{
  const sr = document.createElement('div'); sr.setAttribute('aria-live', 'polite'); sr.setAttribute('role', 'status'); sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap'; document.body.appendChild(sr);
  Visual82.say = function (t) { if (!S82().leitor || !t) return; sr.textContent = ''; setTimeout(() => { sr.textContent = t; }, 30); if (window.speechSynthesis && S82().leitorVoz !== false) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'pt-BR'; u.rate = 1.15; speechSynthesis.speak(u); } };
  const bt = UI.button;
  UI.button = function (id, x, y, w, h, label) { const r = bt.apply(this, arguments); if (S82().leitor && this.focusId === id && Visual82.lastFoc !== id) { Visual82.lastFoc = id; Visual82.say(String(label || '')); } return r; };
  const NAMES = { title: 'Tela inicial', select: 'Mapa de fases', settings: 'Opções', pause: 'Jogo pausado', shop: 'Loja', hangar: 'Hangar', over: 'Fim de jogo. Nave destruída', clear: 'Fase completa', levelup: 'Subiu de nível. Escolha um upgrade', modes: 'Modos extras', hub: 'Extras', tree: 'Árvore de melhorias', missions: 'Metas', stats: 'Estatísticas', access: 'Teclas e acessibilidade', acc2: 'Mais acessibilidade' };
  hookRender(rn => { let last = ''; return function () { rn(); const s = G.state; if (s !== last) { last = s; Visual82.lastFoc = ''; if (NAMES[s]) Visual82.say(NAMES[s]); } if (S82().leitor && s === 'story' && G.story) { const pg = G.story.pages[G.story.i]; if (pg && pg.text && Visual82.lastTxt !== pg.text) { Visual82.lastTxt = pg.text; if (!S82().voz) Visual82.say(pg.text); } } }; });
  const t0 = txt;
  txt = function (s, x, y, size, color, align, weight, base) {
    const st = S82(), fz = st.fsz ?? ((typeof Visual83 !== 'undefined' && Visual83.on) ? (innerWidth < 950 ? 2 : 1) : 0); if (fz && !st.big && size <= ((typeof Visual83 !== 'undefined' && Visual83.on) ? 30 : 24) && size >= 11) size = Math.round(size * Math.min(fz === 2 ? 1.4 : 1.2, size > 24 ? 1.12 : 9));
    if (st.hcm && (color === '#8a7fb0' || color === '#6a5aa8' || color === '#a090d0')) color = '#e2d8ff';
    return t0(s, x, y, size, color, align, weight, base);
  };
  const pn = UI.panel;
  UI.panel = function (x, y, w, h, o = {}) { if (S82().hcm) o = Object.assign({}, o, { fill: 'rgba(4,2,16,.96)', stroke: '#ffffff' }); return pn.call(this, x, y, w, h, o); };
  Screens.acc2 = function () {
    const s = S82(); txt('MAIS ACESSIBILIDADE', W / 2, 30, 46, '#fff', 'center'); UI.panel(200, 100, 880, 440, { r: 22 });
    const row = (i, id, lab, val, desc, fn) => { const y = 130 + i * 76; txt(lab, 236, y, 22, '#fff', 'left', 900); txt(desc, 236, y + 30, 15, '#cdb8ff', 'left', 700); if (UI.button(id, 820, y - 6, 220, 46, val, { size: 15, color: val.startsWith('NÃO') || val === '100%' ? undefined : '#9a63ff' })) { fn(); Save.save(); } };
    row(0, 'a_leitor', 'Leitor de tela', s.leitor ? 'SIM' : 'NÃO', 'Lê em voz alta menus, botões e falas.', () => { s.leitor = !s.leitor; });
    row(1, 'a_fonte', 'Tamanho do texto', ['100%', '120%', '140%'][s.fsz || 0], 'Aumenta os textos dos menus e do jogo.', () => { s.fsz = ((s.fsz || 0) + 1) % 3; });
    row(2, 'a_hcm', 'Contraste dos menus', s.hcm ? 'SIM' : 'NÃO', 'Painéis escuros com borda branca e texto mais claro.', () => { s.hcm = !s.hcm; });
    row(3, 'a_voz', 'Voz nas falas da história', s.voz ? 'SIM' : 'NÃO', 'Lê as falas das cenas.', () => { s.voz = !s.voz; });
    row(4, 'a_dalt', 'Paleta para daltonismo', s.dalt ? 'SIM' : 'NÃO', 'Tiros seus azuis e inimigos laranja.', () => { s.dalt = !s.dalt; });
    if (UI.button('back', W / 2 - 160, 580, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
  };
}
