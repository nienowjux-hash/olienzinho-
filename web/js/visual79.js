'use strict';
// ---------- 79: inimigos com variantes por setor, eventos de comboio e estrela dourada, dificuldade que se ajusta, golpe de fusao, arvore de melhorias,
// metas do dia, tempo dos chefes, final verdadeiro, botoes de toque, guia de qualidade e codigo de transferencia do save ----------
const Visual79 = { adaptNote: '', nextEv: 0, bt: 0, btOn: false, prevSpec: 0, last: '', msg: '', msgT: -9, touch: { } };
const dayK = () => (typeof Extras !== 'undefined' && Extras.dayKey) ? Extras.dayKey() : new Date().toISOString().slice(0, 10);
const say79 = t => { Visual79.msg = t; Visual79.msgT = World.t; };
const SD = () => Save.data;

// ---------- 1. variantes de inimigo por setor ----------
{
  const VAR = [[], ['blindado'], ['veloz'], ['explosivo'], ['blindado', 'veloz'], ['explosivo', 'veloz'], ['blindado', 'explosivo'], ['veloz', 'blindado'], ['explosivo'], ['blindado', 'veloz', 'explosivo']];
  const OK = ['drone', 'zig', 'shooter', 'kami', 'shield'];
  const se = spawnEnemy;
  spawnEnemy = function (type, x, y, o) {
    const e = se.apply(this, arguments); if (!e) return e;
    const adapt = G.adapt || 1; if (adapt !== 1 && type !== 'dummy') { e.hp = Math.max(1, Math.round(e.hp * adapt)); e.maxHp = e.hp; }
    const list = VAR[G.stageIdx] || [];
    if (list.length && OK.includes(type) && !G.training && Math.random() < .16 + G.stageIdx * .01) {
      const v = list[Math.floor(Math.random() * list.length)]; e.variant = v;
      if (v === 'blindado') { e.hp = Math.ceil(e.hp * 2); e.maxHp = e.hp; e.score *= 2; }
      if (v === 'veloz') { e.spd *= 1.45; e.score *= 1.4; }
      if (v === 'explosivo') { e.score *= 1.5; }
    }
    return e;
  };
  const en = Art.enemy;
  Art.enemy = function (e) {
    const r = en.call(this, e); if (!e.variant || e.dead) return r; const R = (e.rad || 24) + 5, t = World.t;
    ctx.save(); ctx.translate(e.x, e.y);
    if (e.variant === 'blindado') { ctx.strokeStyle = '#c8d0e8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#5a6488'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R + 3, 0, TAU); ctx.stroke(); }
    else if (e.variant === 'veloz') { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3; ctx.globalAlpha = .85; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 10, -R - 2); ctx.lineTo(i * 10, -R - 16 - 4 * Math.sin(t * 20 + i)); ctx.stroke(); } }
    else { const k = .5 + .5 * Math.sin(t * 8 + e.ph); ctx.strokeStyle = 'rgba(255,70,70,' + (.5 + .4 * k) + ')'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(0, 0, R + 2, 0, TAU); ctx.stroke(); }
    ctx.restore(); return r;
  };
  const ke = killEnemy;
  killEnemy = function (e, by) {
    const was = e.dead && e.counted; const r = ke.apply(this, arguments);
    if (!was && e.variant === 'explosivo') for (let i = 0; i < 6; i++) ebullet(e.x, e.y, i / 6 * TAU + rand(0, .3), 170, { r: 6 });
    if (!was && e.bonus) for (let i = 0; i < e.bonus; i++) dropPickup('coin', e.x + rand(-40, 40), e.y + rand(-20, 20), 1);
    if (!was && by) { const m = msn(); m.kills++; }
    return r;
  };
}

// ---------- 2. eventos no meio da fase: comboio de elite e estrela dourada ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const p = G.player; if (!p || G.state !== 'play') return r;
    if (G.boss && G.boss.state === 'fight') { Visual79.bt += dt; }
    if (!G.t || G.endless || G.training || G.boss || G.bossPending || G.rush || G.practice || G.daily || G.t > (G.stage.duration || 1e9) - 28) return r;
    if (!Visual79.nextEv || G.t < Visual79.evRun) { Visual79.nextEv = G.t + rand(45, 70); Visual79.evRun = G.t; }
    if (G.t > Visual79.nextEv && !Events.cur && !Events.banner) {
      Visual79.nextEv = G.t + rand(60, 90);
      if (Math.random() < .5) { Events.banner = { t: 0, title: 'COMBOIO DE ELITE', sub: 'Derrote os três para ganhar estrelas', c: '#ff8a5f' }; [W * .3, W * .5, W * .7].forEach((x, i) => spawnEnemy('shield', x, -30 - i * 40, { bonus: 5 })); }
      else { Events.banner = { t: 0, title: 'ESTRELA DOURADA', sub: 'Acerte antes que ela escape!', c: '#ffd36a' }; spawnEnemy('zig', rand(300, W - 300), -30, { bonus: 12, glow: '#ffd36a' }); }
    }
    return r;
  };
}

// ---------- 3. dificuldade que se ajusta e historico para metas ----------
{
  const ss = Game.startStage;
  Game.startStage = function (idx) {
    const d = SD(); d.adapt = d.adapt || { deaths: {}, nohit: {} }; const de = d.adapt.deaths[idx] || 0, nh = d.adapt.nohit[idx] || 0;
    G.adapt = null; const r = ss.apply(this, arguments);
    G.adapt = de >= 3 ? .85 : de >= 2 ? .92 : nh >= 1 ? 1.1 : 1; Visual79.adaptNote = G.adapt < 1 ? 'Ajuste automático: inimigos ' + Math.round((1 - G.adapt) * 100) + '% mais fracos' : G.adapt > 1 ? 'Ajuste automático: inimigos 10% mais fortes (você foi sem dano!)' : '';
    Visual79.nextEv = 0; Visual79.bt = 0; Visual79.prevSpec = 0; return r;
  };
  hookRender(rn => function () {
    rn(); const s = G.state; if (s === Visual79.last) return; const d = SD(); d.adapt = d.adapt || { deaths: {}, nohit: {} };
    if (s === 'over' && !G.endless && !G.rush && !G.practice) d.adapt.deaths[G.stageIdx] = (d.adapt.deaths[G.stageIdx] || 0) + 1;
    if (s === 'clear' && !G.rush && !G.practice) { d.adapt.deaths[G.stageIdx] = 0; if (G.stats && G.stats.hits === 0) d.adapt.nohit[G.stageIdx] = (d.adapt.nohit[G.stageIdx] || 0) + 1; else d.adapt.nohit[G.stageIdx] = 0; msn().clears++; }
    if (s === 'over' || s === 'clear') Save.save(); Visual79.last = s;
  });
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); if (G.state !== 'play' || !G.t || G.t > 5 || !Visual79.adaptNote || G.tutOn) return;
    ctx.save(); ctx.globalAlpha = clamp(G.t / .6, 0, 1) * clamp((5 - G.t) / .8, 0, 1) * .85; txt(Visual79.adaptNote, W / 2, 630, 15, '#cdb8ff', 'center', 700); ctx.restore();
  };
}

// ---------- 4. golpe de fusao: especial de arma fundida solta uma explosao radial nas duas cores ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) {
    const r = up.call(this, dt); const p = G.player; if (!p || p.dead) return r;
    if (p.specCd > Visual79.prevSpec + .5 && String(p.weapon).startsWith('fz_')) {
      const parts = p.weapon.split('_').slice(1), cs = parts.map(q => WEAPONS[q] && WEAPONS[q].c).filter(Boolean);
      if (typeof Visual82 !== 'undefined' && Visual82.fusion) { Visual82.fusion(p, parts, cs); shake(5); Snd.play('special'); } else {
      for (let i = 0; i < 22; i++) mkBullet(p, p.x, p.y, i / 22 * TAU, 560, 1.3, { pierce: 2, c: cs[i % Math.max(1, cs.length)] || '#e8dcff' });
      for (const b of G.eb) if (Math.hypot(b.x - p.x, b.y - p.y) < 230) b.dead = true;
      shockwave(p.x, p.y, 260, cs[0] || '#e8dcff'); shockwave(p.x, p.y, 180, cs[1] || '#ffffff'); shake(5); Snd.play('special');
      popup(p.x, p.y - 70, 'GOLPE DE FUSÃO', cs[0] || '#e8dcff', 22);
      }
    }
    Visual79.prevSpec = p.specCd || 0; return r;
  };
}

// ---------- 5. arvore de melhorias permanentes ----------
const TREE = [
  { id: 'atk', name: 'ATAQUE', c: '#ff7a5a', t: [['Dano +8%', 300, p => { p.dmg *= 1.08; }], ['Dano +16%', 650, p => { p.dmg *= 1.07; }], ['Tiro mais rápido', 1100, p => { p.fireDelay *= .93; }], ['Crítico +6%', 1800, p => { p.crit += .06; }]] },
  { id: 'def', name: 'DEFESA', c: '#7fe0ff', t: [['+1 de vida', 400, p => { p.maxHp += 1; }], ['Esquiva carrega 8% mais rápido', 800, p => { p.dashCdMax *= .92; }], ['+1 de vida', 1300, p => { p.maxHp += 1; }], ['Especial carrega 10% mais rápido', 2000, p => { p.specCdMax *= .9; }]] },
  { id: 'col', name: 'COLETA', c: '#ffd36a', t: [['Ímã +40', 400, p => { p.magnet += 40; }], ['Experiência +8%', 800, p => { p.xpMul *= 1.08; }], ['Ímã +60', 1300, p => { p.magnet += 60; }], ['Experiência +12%', 2000, p => { p.xpMul *= 1.12; }]] },
];
{
  const rs = recalcStats;
  recalcStats = function (p) { rs(p); if (p !== G.player) return; const tr = SD().tree || {}; for (const br of TREE) for (let i = 0; i < (tr[br.id] || 0); i++) br.t[i][2](p); };
  Screens.tree = function () {
    const d = SD(); d.tree = d.tree || {}; txt('ÁRVORE DE MELHORIAS', W / 2, 36, 46, '#fff', 'center'); txt('★ ' + d.coins, W - 60, 40, 28, '#ffcf6b', 'right', 900); txt('Cada caminho tem 4 níveis. Vale para todas as fases.', W / 2, 96, 17, '#cdb8ff', 'center', 700);
    TREE.forEach((br, bi) => {
      const x = 90 + bi * 380, n = d.tree[br.id] || 0; UI.panel(x, 140, 340, 420, { r: 22 }); txt(br.name, x + 170, 156, 28, br.c, 'center', 900);
      br.t.forEach(([nm, cost, f], i) => {
        const y = 210 + i * 86, own = i < n, nxt = i === n, can = nxt && d.coins >= cost;
        ctx.save(); ctx.fillStyle = own ? br.c : 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.arc(x + 40, y + 28, 20, 0, TAU); ctx.fill(); ctx.strokeStyle = br.c; ctx.lineWidth = 3; ctx.stroke(); if (i < 3) { ctx.beginPath(); ctx.moveTo(x + 40, y + 48); ctx.lineTo(x + 40, y + 66); ctx.stroke(); } ctx.restore();
        txt(nm, x + 76, y + 8, 18, own ? '#fff' : '#cdb8ff', 'left', 800); txt(own ? 'COMPRADO' : '★ ' + cost, x + 76, y + 34, 15, own ? '#7fe0a0' : (can ? '#ffcf6b' : '#8a7fb0'), 'left', 800);
        if (nxt && UI.hit('tr' + br.id, x + 10, y - 4, 320, 66, { sound: 'buy', disabled: !can })) { if (d.coins >= cost) { d.coins -= cost; d.tree[br.id] = n + 1; Save.save(); } }
      });
    });
    if (UI.button('back', W / 2 - 160, 600, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
  };
}

// ---------- 6. metas do dia ----------
const msn = () => { const d = SD(); if (!d.msn || d.msn.day !== dayK()) d.msn = { day: dayK(), kills: 0, combo: 0, clears: 0, got: [] }; return d.msn; };
{
  const MS = [['Derrotar 150 inimigos', 'kills', 150, 40], ['Chegar a um combo de 20', 'combo', 20, 40], ['Completar uma fase', 'clears', 1, 80]];
  const up = Game.updatePlay; Game.updatePlay = function () { const r = up.apply(this, arguments); if (G.combo > msn().combo) msn().combo = G.combo; return r; };
  Screens.missions = function () {
    const m = msn(), d = SD(); txt('METAS DE HOJE', W / 2, 40, 48, '#fff', 'center'); txt('Mudam todo dia. Recompensa em estrelas.', W / 2, 100, 17, '#cdb8ff', 'center', 700); txt('★ ' + d.coins, W - 60, 40, 28, '#ffcf6b', 'right', 900);
    MS.forEach(([nm, key, goal, rw], i) => {
      const y = 160 + i * 130, v = Math.min(goal, m[key]), done = v >= goal, got = m.got.includes(key); UI.panel(180, y, 920, 108, { r: 20 });
      txt(nm, 214, y + 18, 24, '#fff', 'left', 800); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.roundRect(214, y + 62, 520, 14, 7); ctx.fill(); ctx.fillStyle = done ? '#7fe0a0' : '#9a63ff'; ctx.beginPath(); ctx.roundRect(214, y + 62, Math.max(8, 520 * v / goal), 14, 7); ctx.fill(); txt(v + ' / ' + goal, 750, y + 56, 20, '#cdb8ff', 'left', 800);
      if (got) txt('RECEBIDO', 960, y + 44, 22, '#7fe0a0', 'center', 900); else if (UI.button('ms' + key, 860, y + 24, 200, 60, done ? '★ ' + rw + ' RECEBER' : '★ ' + rw, { size: 18, disabled: !done })) { m.got.push(key); d.coins += rw; Save.save(); Snd.play('coin', {}); }
    });
    if (UI.button('back', W / 2 - 160, 580, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
  };
}

// ---------- 7. tempo dos chefes ----------
{
  const bd = Game.bossDefeated;
  Game.bossDefeated = function () {
    const t = Visual79.bt, idx = G.stageIdx, d = SD(); d.bossTime = d.bossTime || {};
    if (t > 3 && !G.rush && !G.endless && !G.training && !G.practice) { const old = d.bossTime[idx]; if (!old || t < old) { d.bossTime[idx] = Math.round(t * 10) / 10; popup(W / 2, 250, 'NOVO TEMPO: ' + t.toFixed(1) + 's', '#ffe9a8', 30); } }
    Visual79.bt = 0; return bd.apply(this, arguments);
  };
  Screens.bosstime = function () {
    const d = SD(); d.bossTime = d.bossTime || {}; txt('TEMPO DOS CHEFES', W / 2, 30, 46, '#fff', 'center'); txt('Seu melhor tempo de luta contra cada chefe. Clique para treinar.', W / 2, 88, 17, '#cdb8ff', 'center', 700);
    STAGES.forEach((st, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 80 + col * 570, y = 130 + row * 90, t = d.bossTime[i], open = !!(d.cleared && d.cleared[i]);
      if (UI.hit('bt' + i, x, y, 540, 76, { disabled: !open }) && open) { Visual14.startPractice(i, 0); return; }
      UI.panel(x, y, 540, 76, { r: 16 }); txt('FASE ' + (i + 1) + '  ' + st.name, x + 20, y + 14, 20, open ? '#fff' : '#6a5aa8', 'left', 800); txt(open ? (t ? t.toFixed(1) + ' s' : 'sem tempo ainda') : 'bloqueado', x + 20, y + 42, 17, t ? '#ffd36a' : '#8a7fb0', 'left', 700);
    });
    if (UI.button('back', W / 2 - 160, 600, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
  };
}

// ---------- 8. final verdadeiro: todas as fases com nota S ----------
{
  const cr = Screens.credits;
  Screens.credits = function () {
    const r = cr.apply(this, arguments); const gr = SD().grades || {}; if (QL() < 1 || STAGES.some((s, i) => (gr[i] || 0) < 3)) return r;
    const u = World.t - (typeof Visual61 !== 'undefined' && Visual61.cr0 !== null ? Visual61.cr0 : 0); if (u < 8.5 || u > 18) return r;
    const a = clamp((u - 8.5) / .8, 0, 1) * clamp((18 - u) / .8, 0, 1); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,3,28,.8)'; ctx.fillRect(0, 150, W, 230);
    txt('FINAL VERDADEIRO', W / 2, 172, 46, '#ffd36a', 'center', 900); txt('Todas as estrelas voltaram ao céu, e cada uma lembra o seu nome.', W / 2, 250, 22, '#fff', 'center', 700); txt('Lumi sorri em cada fase que você salvou.', W / 2, 286, 20, '#cdb8ff', 'center', 700); txt('Obrigado por guardar as estrelas.', W / 2, 330, 24, '#ffe9a8', 'center', 800); ctx.restore(); return r;
  };
}

// ---------- 9. botoes de toque ----------
{
  const isTouch = () => (typeof Visual83 !== 'undefined') ? false : ('ontouchstart' in window) || (matchMedia && matchMedia('(pointer:coarse)').matches);
  const BT = [{ k: ' ', x: 1210, y: 640, c: '#ffb340', l: 'PULSO' }, { k: 'shift', x: 1110, y: 640, c: '#7fe0ff', l: 'ESQ.' }, { k: 'q', x: 1210, y: 545, c: '#b98cff', l: 'ESP.' }];
  const hit = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H; return BT.find(b => Math.hypot(b.x - x, b.y - y) < 48); };
  addEventListener('pointerdown', e => { if (typeof Visual83 !== 'undefined' || e.pointerType !== 'touch' || G.state !== 'play') return; const b = hit(e); if (!b) return; e.stopImmediatePropagation(); e.preventDefault(); Input.hit[b.k] = true; Input.keys[b.k] = true; Visual79.touch[e.pointerId] = b.k; }, true);
  const rel = e => { const k = Visual79.touch[e.pointerId]; if (k) { Input.keys[k] = false; delete Visual79.touch[e.pointerId]; } };
  addEventListener('pointerup', rel, true); addEventListener('pointercancel', rel, true);
  const hd = Visual15.hudDraw;
  Visual15.hudDraw = function () {
    hd.call(this); if (G.state !== 'play' || !isTouch()) return;
    ctx.save(); BT.forEach(b => { ctx.globalAlpha = .55; ctx.fillStyle = 'rgba(14,6,40,.7)'; ctx.strokeStyle = b.c; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x, b.y, 40, 0, TAU); ctx.fill(); ctx.stroke(); txt(b.l, b.x, b.y, 15, '#fff', 'center', 900, 'middle'); }); ctx.restore();
  };
}

// ---------- 10. guia de qualidade e codigo de transferencia do save ----------
{
  Screens.qguide = function () {
    txt('GUIA DE QUALIDADE', W / 2, 30, 46, '#fff', 'center'); UI.panel(160, 110, 960, 430, { r: 22 });
    const L = [['Qualidade automática', 'Se o jogo pesar, ele baixa efeitos e resolução sozinho. Dá para desligar em Acessibilidade.'], ['Efeitos na tela', 'Limpo mostra só o essencial. Equilibrado é o padrão. Intenso liga tudo em todos os inimigos.'], ['Resolução interna', 'Menor deixa mais leve em PCs fracos; 150% e 200% deixam mais nítido em telas grandes.'], ['Objetos e tela limpa', 'Objetos menores e sem números comuns dão mais espaço na tela.'], ['Painel F3', 'Mostra fps, partículas e tiros. As teclas 1, 2 e 3 ligam e desligam brilhos grandes, eventos de fundo e metade das partículas.']];
    L.forEach(([a, b], i) => { txt(a, 200, 132 + i * 78, 22, '#ffb340', 'left', 900); UI.wrap(b, 200, 164 + i * 78, 880, 22, 17, '#cdb8ff'); });
    if (UI.button('back', W / 2 - 160, 580, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
  };
  const enc = () => btoa(unescape(encodeURIComponent(localStorage.getItem('olienzinho_save_v1') || JSON.stringify(Save.data))));
  const st = Screens.settings;
  Screens.settings = function () {
    const r = st.apply(this, arguments);
    if (G.stab === 'sav') {
      if (UI.button('scpy', 228, 440, 400, 52, 'COPIAR CÓDIGO DO SAVE', { size: 18 })) { try { navigator.clipboard.writeText(enc()); say79('Código copiado. Cole no outro aparelho.'); } catch (e) { say79('Não foi possível copiar.'); } }
      if (UI.button('spas', 676, 440, 400, 52, 'COLAR CÓDIGO DO SAVE', { size: 18 })) { navigator.clipboard.readText().then(t => { try { const d = JSON.parse(decodeURIComponent(escape(atob(t.trim())))); if (!d || !d.settings) throw 0; localStorage.setItem('olienzinho_save_v1', JSON.stringify(d)); say79('Save importado! Recarregando...'); setTimeout(() => location.reload(), 900); } catch (e) { say79('Código inválido.'); } }, () => say79('Permita ler a área de transferência.')); }
      txt('Sem servidor: o código leva seu progresso de um aparelho para outro (copie aqui, cole lá).', 218, 510, 15, '#8a7fb0', 'left', 700);
    }
    if (World.t - Visual79.msgT < 3) txt(Visual79.msg, W / 2, 548, 20, '#7fe0a0', 'center', 800);
    return r;
  };
}

// ---------- entradas no menu de modos ----------
{
  const md = Screens.modes;
  Screens.modes = function () {
    const r = md.apply(this, arguments);
    if (UI.button('mxhub', 56, 22, 190, 40, 'EXTRAS ▸', { size: 15 })) { Snd.play('uiSelect'); G.state = 'hub'; }
    return r;
  };
}
