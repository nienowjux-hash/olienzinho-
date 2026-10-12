'use strict';
// ---------- codex (bestiario e cenas), silhuetas das skins, efeitos de disparo, primeiro plano e cenas ilustradas ----------
const Visual12 = {};

// ===== registro do que o jogador ja viu =====
Visual12.seen = function (id) { const c = (Save.data.codex = Save.data.codex || {}); if (!c[id]) c[id] = { kills: 0 }; return c[id]; };
{
  const se = spawnEnemy;
  spawnEnemy = function (type, x, y, o) { const e = se(type, x, y, o); Visual12.seen(type); return e; };
  const ke = killEnemy;
  killEnemy = function (e, by) { const w = e.counted; ke(e, by); if (!w && e.counted && by) Visual12.seen(e.type).kills++; };
  const bu = Boss.prototype.update;
  Boss.prototype.update = function (dt) { if (!this._cx) { this._cx = true; Visual12.seen('boss:' + this.name); } bu.call(this, dt); };
}
const BEST = [
  ['drone', 'Zangão', 'Pequeno drone laranja do enxame. Desce balançando.', 'Vêm em grupos: passe entre eles.'], ['zig', 'Zigue-zague', 'Muda de direção o tempo todo.', SRC_TIP.zig],
  ['kami', 'Kamikaze', 'Trava a mira em você e mergulha.', SRC_TIP.kami], ['shooter', 'Atirador', 'Para no alto e mira em você.', SRC_TIP.shooter],
  ['tank', 'Tanque', 'Pesado, solta tiros e anéis.', SRC_TIP.tank], ['mine', 'Mina', 'Flutua e explode em anel quando você chega perto.', SRC_TIP.mine],
  ['bit', 'Bit', 'Minúsculo e rápido, vem em enxame.', SRC_TIP.bit], ['shield', 'Escudeiro', 'Tem um escudo que segura tiros de baixo.', SRC_TIP.shield],
  ['healer', 'Curandeiro', 'Cura os aliados feridos.', SRC_TIP.healer], ['captain', 'Minichefe', 'Líder de cada setor, com barra de vida própria.', SRC_TIP.captain],
  ['rock', 'Meteoro', 'Rocha que cai direto para baixo.', SRC_TIP.rock], ['boulder', 'Pedra do Gigante', 'Atire nela para jogá-la contra o chefe.', SRC_TIP.boulder],
  ['ghost', 'Fantasma', 'Fica intangível por instantes.', SRC_TIP.ghost], ['splitter', 'Divisor', 'Ao morrer, se parte em bits.', SRC_TIP.splitter],
  ['teleporter', 'Teleportador', 'Some e reaparece atirando em leque.', SRC_TIP.teleporter], ['turret', 'Torreta', 'Dispara lasers da lateral da tela.', SRC_TIP.turret],
  ['generator', 'Gerador', 'Invoca bits sem parar.', SRC_TIP.generator], ['crystal', 'Cristal do Vazio', 'Protege o Vazio. Quebre todos para vencer o escudo.', SRC_TIP.crystal],
  ['boss:Nave-Mãe Zangão', 'Nave-Mãe Zangão', 'Colmeia corrompida pelo Vazio. Chefe do Setor 1.', 'Mire na escotilha dourada.'], ['boss:Gigante de Rocha', 'Gigante de Rocha', 'Pétreo, o guardião das montanhas. Chefe do Setor 2.', 'Atire nas pedras que ele solta.'],
  ['boss:Olho da Tempestade', 'Olho da Tempestade', 'Vigia, o olho que nunca pisca. Chefe do Setor 3.', 'Use os para-raios a seu favor.'], ['boss:Sol-Guardião', 'Sol-Guardião', 'Solaris, a chama que cuida. Chefe do Setor 4.', 'Na hora do eclipse, fique na sombra.'],
  ['boss:Eco do Olienzinho', 'Eco do Olienzinho', 'O seu medo, com formato de foguete. Chefe do Setor 5.', 'Ele espelha você e mergulha: saia da coluna roxa.'], ['boss:O Vazio', 'O Vazio', 'O primeiro silêncio. Chefe final.', 'Quebre os cristais e depois mire no olho.'],
];
const SCENES = [['Prólogo', 'prologue', null], ...[0, 1, 2, 3, 4, 5].flatMap(i => [['Setor ' + (i + 1) + ': chegada', 'intro' + i, () => STORY.stages[i].intro], ['Setor ' + (i + 1) + ': o chefe', 'pre' + i, () => STORY.stages[i].pre], ['Setor ' + (i + 1) + ': depois', 'after' + i, () => STORY.stages[i].after]]), ['Fim da Parte 1', 'epi', () => STORY.epilogue], ['Final', 'finale', () => STORY.finale]];
Screens.codex = function () {
  const tab = G.codexTab || 0, t = World.t; this.dim(.7);
  txt('CODEX', W / 2, 30, 46, '#fff', 'center');
  ['BESTIÁRIO', 'CENAS', 'CONQUISTAS'].forEach((n, i) => { if (UI.button('ct' + i, 300 + i * 232, 92, 216, 38, n, { size: 16, color: tab === i ? '#9a63ff' : undefined })) { if (i === 2) G.state = 'achievements'; else { G.codexTab = i; G.codexPage = 0; } } });
  const cdx = Save.data.codex || {};
  if (tab === 0) {
    const per = 12, np = Math.ceil(BEST.length / per), pg = (G.codexPage || 0) % np;
    BEST.slice(pg * per, pg * per + per).forEach(([id, name, desc, tip], i) => {
      const col = i % 4, row = (i / 4) | 0, x = 50 + col * 300, y = 150 + row * 138, seen = !!cdx[id], k = Screens.enterK(i * .5, .4);
      ctx.save(); ctx.globalAlpha = clamp(k, 0, 1); ctx.translate(0, (1 - clamp(k, 0, 1)) * 24);
      UI.panel(x, y, 284, 126, { r: 16, fill: seen ? 'rgba(30,14,80,.8)' : 'rgba(14,6,36,.7)', stroke: seen ? 'rgba(190,160,255,.5)' : 'rgba(120,100,170,.2)' });
      if (seen) {
        const bossId = id.startsWith('boss:');
        if (bossId) { ctx.save(); ctx.translate(x + 44, y + 44); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 40, '#ff8a5f', .6); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#2a1050'; ctx.strokeStyle = '#ff8a5f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.restore(); }
        else { ctx.save(); ctx.translate(0, 0); try { Art.enemy({ x: x + 44, y: y + 46, rad: Math.min(22, (ENEMY_DEF[id] || { rad: 22 }).rad * .8), type: id, age: 9 + t, ph: i, hit: 0, glow: (ENEMY_DEF[id] || {}).glow || '#ff8a1f', look: 0, mode: 'hover', shield: 0 }); } catch (e) { } ctx.restore(); }
        txt(name, x + 84, y + 12, name.length > 12 ? 14 : 17, '#fff', 'left', 900); UI.wrap(desc, x + 84, y + 36, 190, 17, 12, '#cdb8ff'); UI.wrap('Dica: ' + tip, x + 14, y + 84, 258, 16, 11, '#ffe9a8');
        if (!bossId) txt('derrotados: ' + (cdx[id].kills || 0), x + 270, y + 12, 11, '#8a7fb0', 'right', 800);
      } else { txt('???', x + 142, y + 44, 38, '#4a3a70', 'center', 900); txt('ainda não encontrado', x + 142, y + 98, 12, '#5a4a80', 'center', 700); }
      ctx.restore();
    });
    txt('ENCONTRADOS  ' + BEST.filter(b => cdx[b[0]]).length + ' / ' + BEST.length, 70, 618, 16, '#ffb340', 'left', 900);
    if (np > 1) { txt('PÁGINA ' + (pg + 1) + '/' + np, W / 2, 626, 14, '#8a7fb0', 'center', 800); if (UI.button('cpl', W / 2 - 150, 612, 50, 34, '◀', { size: 16 })) G.codexPage = (pg + np - 1) % np; if (UI.button('cpr', W / 2 + 100, 612, 50, 34, '▶', { size: 16 })) G.codexPage = (pg + 1) % np; }
  } else {
    txt('Reveja as cenas que você já viu.', W / 2, 146, 18, '#cdb8ff', 'center', 700);
    SCENES.forEach(([name, key, get], i) => {
      const col = i % 3, row = (i / 3) | 0, x = 70 + col * 380, y = 180 + row * 52, seen = key === 'prologue' ? !!Save.data.seenPrologue : !!(Save.data.seen && Save.data.seen[key]);
      if (UI.button('sc' + i, x, y, 360, 42, seen ? name : '??? ' + name.replace(/.*: /, ''), { size: 15, disabled: !seen })) {
        const pages = key === 'prologue' ? STORY.prologue : get(); G.codexTab = 1;
        Game.startStory(pages, () => { G.state = 'codex'; Snd.musicPlay('menu', 0); }, {});
      }
    });
  }
  if (UI.button('back', W / 2 - 150, 664, 300, 40, 'VOLTAR', { size: 18 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goSelect(); }
  Screens.thinFrame();
};

// ===== silhuetas das skins (asas e adornos) =====
const PALMAP = new Map(); for (const s of SKINS) PALMAP.set(s.pal, s.id);
{
  const as = Art.ship;
  Art.ship = function (x, y, o) {
    const id = PALMAP.get(o.pal || SKIN_DEFAULT) || 'violet', t = (o.t || 0);
    if (id !== 'violet' && !o.orbi && QL() >= 1) {
      const U = 112 * (o.scale || 1), P = o.pal;
      ctx.save(); ctx.translate(x, y); ctx.rotate(clamp((o.vx || 0) / 520, -1, 1) * .24); ctx.scale(o.sx || 1, o.sy || 1);
      if (o.inv > 0 && Math.floor(o.inv * 14) % 2 === 0) ctx.globalAlpha = .4;
      for (const s of [-1, 1]) {
        ctx.save(); ctx.scale(s, 1);
        if (id === 'rose') { ctx.fillStyle = P.g1; ctx.strokeStyle = P.g0; ctx.lineWidth = U * .02; ctx.beginPath(); ctx.moveTo(U * .1, -U * .05); ctx.bezierCurveTo(U * .45, -U * .35, U * .66, -U * .1 + Math.sin(t * 3) * U * .03, U * .5, U * .22); ctx.bezierCurveTo(U * .4, U * .12, U * .22, U * .2, U * .1, U * .22); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        else if (id === 'cyan') { ctx.fillStyle = 'rgba(214,246,255,.85)'; ctx.strokeStyle = P.g1; ctx.lineWidth = U * .02; for (const [dx, dy, sz] of [[.34, .02, .16], [.46, .22, .11]]) { ctx.beginPath(); ctx.moveTo(U * dx, U * (dy - sz)); ctx.lineTo(U * (dx + sz * .55), U * dy); ctx.lineTo(U * dx, U * (dy + sz)); ctx.lineTo(U * (dx - sz * .55), U * dy); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
        else if (id === 'solar') { const fl = 1 + Math.sin(t * 12 + s) * .15; ctx.fillStyle = P.g1; ctx.beginPath(); ctx.moveTo(U * .14, U * .02); ctx.lineTo(U * .5, U * .3 * fl); ctx.lineTo(U * .3, U * .06); ctx.lineTo(U * .55, U * .0); ctx.lineTo(U * .14, -U * .1); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; drawGlow(U * .45, U * .2, U * .22, '#ff8a1f', .5); }
        else if (id === 'shadow') { ctx.fillStyle = '#1a0a40'; ctx.strokeStyle = P.glow; ctx.lineWidth = U * .02; ctx.beginPath(); ctx.moveTo(U * .1, -U * .1); ctx.lineTo(U * .5, -U * .36); ctx.lineTo(U * .38, -U * .1); ctx.lineTo(U * .62, U * .02); ctx.lineTo(U * .38, U * .08); ctx.lineTo(U * .5, U * .28); ctx.lineTo(U * .12, U * .12); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        else if (id === 'gold') { ctx.fillStyle = P.g1; ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = U * .02; ctx.beginPath(); ctx.moveTo(U * .1, -U * .08); ctx.lineTo(U * .5, -U * .3); ctx.lineTo(U * .44, -U * .04); ctx.lineTo(U * .58, U * .1); ctx.lineTo(U * .28, U * .1); ctx.lineTo(U * .12, U * .2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      if (id === 'gold') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = U * .03; ctx.globalAlpha *= .9; ctx.beginPath(); ctx.ellipse(0, -U * .66, U * .2, U * .06, 0, 0, TAU); ctx.stroke(); drawGlow(0, -U * .66, U * .3, '#ffd36a', .4); }
      ctx.restore();
    }
    return as.call(this, x, y, o);
  };
}

// ===== efeitos de disparo por arma =====
{
  const ps = playerShoot;
  playerShoot = function () {
    const p = G.player, wl = p ? p.weapon : null, was = p ? p._lb : false; ps();
    if (!p || QL() < 1) return; const P = G.parts;
    if (wl === 'fan') for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i / 5 - .5) * 1.1; P.push({ x: p.x, y: p.y - 30, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, life: .3, max: .3, r: 3, c: i % 2 ? '#ffb340' : '#ffe9a8', drag: 4 }); }
    else if (wl === 'cannon') { for (let i = 0; i < 6; i++) P.push({ k: 'smoke', x: p.x + rand(-10, 10), y: p.y - 30, vx: rand(-60, 60), vy: rand(20, 80), life: .6, max: .6, r: rand(8, 14), c: '#6a3a30', drag: 2 }); shockwave(p.x, p.y - 30, 80, '#ff9a4a'); }
    else if (wl === 'laser') { p._lb = true; if (!was) { P.push({ k: 'flash', x: p.x, y: p.y - 34, vx: 0, vy: 0, life: .25, max: .25, r: 90, c: '#ffffff', drag: 1 }); shockwave(p.x, p.y - 34, 120, '#7fe0ff'); } }
    else if (wl === 'boomerang') P.push({ k: 'flash', x: p.x, y: p.y - 34, vx: 0, vy: 0, life: .2, max: .2, r: 60, c: '#ffe9a8', drag: 1 });
    else if (wl === 'violet' && Math.random() < .5) P.push({ k: 'flash', x: p.x, y: p.y - 34, vx: 0, vy: 0, life: .1, max: .1, r: 30, c: '#cdb8ff', drag: 1 });
  };
}
Visual12.beamReset = function () { const p = G.player; if (p && p.weapon === 'laser' && p.beamT <= 0) p._lb = false; };

// ===== silhuetas em primeiro plano =====
Visual12.fg = function () {
  if (QL() < 2 || G.state !== 'play') return; const t = World.t, st = G.stage ? G.stage.id : 0;
  ctx.save(); ctx.globalAlpha = .2; ctx.fillStyle = '#04010c';
  for (let i = 0; i < 3; i++) {
    const side = i % 2 ? 1 : -1, sp = 220 + i * 90, y = ((t * sp + i * 540) % (H + 600)) - 300, x = side < 0 ? 20 + hsh(i + Math.floor(t / 5)) * 40 : W - 20 - hsh(i + 9 + Math.floor(t / 5)) * 40, s = 80 + i * 26;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * .1 * side + i);
    if (st === 4) { ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(-s * .4, -s * .3); ctx.lineTo(s * .8, -s * .2); ctx.lineTo(s, 0); ctx.lineTo(s * .6, s * .25); ctx.lineTo(-s * .5, s * .3); ctx.closePath(); }
    else if (st === 5) { ctx.beginPath(); ctx.moveTo(0, -s * 1.4); ctx.quadraticCurveTo(s * .6, 0, 0, s * 1.4); ctx.quadraticCurveTo(-s * .2, 0, 0, -s * 1.4); }
    else { ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, q = s * (.75 + hsh(i * 7 + k) * .4); ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q); } ctx.closePath(); }
    ctx.fill(); ctx.restore();
  }
  ctx.restore();
};

// ===== moldura de quadrinho nas cenas-chave =====
{
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    sb.call(this); const S = G.story, pg = S && S.pages[S.i]; if (!pg || !pg.fx) return;
    ctx.save(); ctx.fillStyle = 'rgba(3,1,11,.72)'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(46, 46, W - 92, H - 92); ctx.fill('evenodd');
    ctx.strokeStyle = '#d9a84a'; ctx.lineWidth = 4; ctx.strokeRect(46, 46, W - 92, H - 92); ctx.strokeStyle = 'rgba(255,233,168,.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(54, 54, W - 108, H - 108);
    ctx.fillStyle = '#d9a84a'; for (const [cx, cy] of [[46, 46], [W - 46, 46], [46, H - 46], [W - 46, H - 46]]) { ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx + 12, cy); ctx.lineTo(cx, cy + 12); ctx.lineTo(cx - 12, cy); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  };
}

// ===== creditos animados =====
{
  const cr = Screens.credits;
  Screens.credits = function () {
    const t = G.credT || 0, idx = Math.floor(t / 12) % STAGES.length; if (Visual12.credIdx !== idx) { Visual12.credIdx = idx; World.setStage(STAGES[idx].pal); }
    const px = ((t * 120) % (W + 400)) - 200, py = H * .78 + Math.sin(t * 1.3) * 26;
    ctx.save(); ctx.globalAlpha = .9; Art.ship(px, py, { vx: 160, t, scale: .7, boost: 1, lookx: 1, looky: 0, blinkT: 0 }); Art.orbi(px - 90, py + 12 + Math.sin(t * 1.7) * 8, { vx: 160, t, scale: .75, lookx: 1, looky: 0, blinkT: 0 }); ctx.restore();
    cr.call(this);
  };
}
