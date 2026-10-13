'use strict';
// ---------- 81: sprites proprios dos inimigos especiais, armas novas, conquistas novas, galeria de chefes, desafios malucos, estatisticas,
// teste de desempenho, tela cheia no celular e compatibilidade entre navegadores ----------
const Visual81 = { bench: null, gal: 0, chal: null };
const ok81 = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);

// ---------- compatibilidade ----------
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { r = Array.isArray(r) ? r[0] : (r || 0); r = Math.min(r, w / 2, h / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); };
}
if (!navigator.getGamepads) navigator.getGamepads = () => [];

// ---------- 1. inimigos especiais com corpo proprio ----------
{
  const en = Art.enemy;
  Art.enemy = function (e) {
    const v = e.variant; if (!(v === 'blink' || v === 'espelho' || v === 'barreira') || e.dead) return en.call(this, e);
    const t = World.t + e.ph, R = e.rad || 24, c = ok81(e.glow) ? e.glow : '#7fe0ff', hit = e.hit > 0;
    ctx.save(); ctx.translate(e.x, e.y);
    if (v === 'blink') {
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.4, '#7fe0ff', .35); ctx.globalCompositeOperation = 'source-over';
      for (let i = 2; i >= 0; i--) { ctx.globalAlpha = .12 + (2 - i) * .1; ctx.fillStyle = '#7fe0ff'; const o = i * 7 * Math.sin(t * 3); ctx.beginPath(); ctx.moveTo(o, -R * 1.1); ctx.lineTo(R + o, 0); ctx.lineTo(o, R * 1.1); ctx.lineTo(-R + o, 0); ctx.closePath(); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.fillStyle = hit ? '#fff' : '#1a2a5a'; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -R * 1.1); ctx.lineTo(R, 0); ctx.lineTo(0, R * 1.1); ctx.lineTo(-R, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, R * .38, R * .2, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#0a1030'; ctx.beginPath(); ctx.arc(Math.sin(t * 2) * 3, 0, R * .12, 0, TAU); ctx.fill();
    } else if (v === 'espelho') {
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 2.2, '#cfe8ff', .3); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = hit ? '#fff' : '#9ab4d8'; ctx.strokeStyle = '#eef6ff'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * TAU / 6 - Math.PI / 2; ctx.lineTo(Math.cos(a) * R * 1.05, Math.sin(a) * R * 1.05); } ctx.closePath(); ctx.fill(); ctx.stroke();
      const g = ctx.createLinearGradient(-R, -R, R, R); const k = (t * .6) % 2; g.addColorStop(clamp(k - .35, 0, 1), 'rgba(255,255,255,0)'); g.addColorStop(clamp(k - .2, 0, 1), 'rgba(255,255,255,.85)'); g.addColorStop(clamp(k, 0, 1), 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * TAU / 6 - Math.PI / 2; ctx.lineTo(Math.cos(a) * R * .95, Math.sin(a) * R * .95); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.moveTo(-R * .87, -R * .5); ctx.lineTo(R * .87, R * .5); ctx.moveTo(-R * .87, R * .5); ctx.lineTo(R * .87, -R * .5); ctx.stroke();
    } else {
      ctx.fillStyle = hit ? '#fff' : '#7a3a14'; ctx.strokeStyle = '#ffb340'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-R, -R * .75, R * 2, R * 1.5, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffb340'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(s * R * .72 - 5, -R * 1.05, 10, R * 2.1, 3); ctx.fill(); }
      ctx.fillStyle = '#2a1204'; for (let i = -1; i <= 1; i++) ctx.fillRect(i * R * .5 - 4, -R * .35, 8, R * .7);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .5 + .3 * Math.sin(t * 5); drawGlow(0, R * .9, 14, '#ffb340', .8);
    }
    ctx.restore();
  };
}

// ---------- 2. duas armas novas ----------
WEAPONS.lanca = {
  name: 'Lança de Cristal', desc: 'Lanças pesadas que atravessam tudo.', c: '#9fe8ff', price: 900, delay: 1.9,
  special: 'prisma', specName: 'Prisma', specDesc: 'Lanças saem pelos quatro lados da nave.',
  fire(p) { const n = Math.min(3, p.shots + 1); for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; mkBullet(p, p.x + k * 22, p.y - 34, -Math.PI / 2 + k * .07, 700, 2.6, { pierce: 99, r: 14, life: 2.4, c: '#9fe8ff' }); } muzzle(p, '#9fe8ff', 20); Snd.play('shoot', { lv: 0, wpn: 'fan', pan: Snd.panX(p.x) * .5 }); },
};
WEAPONS.espiral = {
  name: 'Vórtice', desc: 'Tiros que giram em espiral, cobrindo a tela.', c: '#ff7ac8', price: 1000, delay: .55,
  special: 'prisma', specName: 'Prisma', specDesc: 'Lanças saem pelos quatro lados da nave.',
  fire(p) { p._sp = (p._sp || 0) + .5; const n = 2 + Math.min(2, p.shots - 1); for (let i = 0; i < n; i++) mkBullet(p, p.x, p.y - 30, -Math.PI / 2 + Math.sin(p._sp) * .7 + (i - (n - 1) / 2) * .22, 780, .85, { c: '#ff7ac8' }); if (Math.random() < .5) Snd.play('laser', { pan: Snd.panX(p.x) * .5 }); },
};
WEAPON_ORDER.push('lanca', 'espiral');
SPECIALS.prisma = function (p) { const d = p.specPow || 1; for (let i = 0; i < 8; i++) mkBullet(p, p.x, p.y, i * TAU / 8, 640, 2.4 * d, { pierce: 99, r: 14, life: 1.8, c: WEAPONS[p.weapon].c }); flashScreen(.1); shockwave(p.x, p.y, 200, WEAPONS[p.weapon].c); };
{
  const wg = Screens.weaponGlyph;
  Screens.weaponGlyph = function (id, x, y, c, t) {
    if (id !== 'lanca' && id !== 'espiral') return wg.apply(this, arguments);
    ctx.save(); ctx.translate(x, y); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 44, c, .5); ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineWidth = 5;
    if (id === 'lanca') { for (const dx of [-12, 12]) { ctx.beginPath(); ctx.moveTo(dx, 22); ctx.lineTo(dx, -14); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(dx, -26); ctx.lineTo(dx + 7, -12); ctx.lineTo(dx - 7, -12); ctx.closePath(); ctx.fill(); } }
    else { ctx.beginPath(); for (let a = 0; a < 12; a += .3) { const r = 3 + a * 2.2; ctx.lineTo(Math.cos(a + t * 2) * r, Math.sin(a + t * 2) * r); } ctx.stroke(); }
    ctx.restore();
  };
}

// ---------- 3. conquistas novas ----------
ACH.push(
  { id: 'wk_all', name: 'Semana Cumprida', desc: 'Receba as 3 metas da semana.', ok: () => Save.data.wk && (Save.data.wk.got || []).length >= 3 },
  { id: 'nohit3', name: 'Sem Arranhão', desc: 'Vença 3 chefes sem tomar dano.', ok: () => Object.keys(Save.data.bossNoHit || {}).length >= 3 },
  { id: 'chal1', name: 'Louco por Desafios', desc: 'Vença um desafio maluco.', ok: () => Object.keys(Save.data.chal || {}).length >= 1 },
  { id: 'arsenal2', name: 'Colecionador', desc: 'Tenha a Lança de Cristal e o Vórtice.', ok: () => !!(Save.data.owned.weapons.lanca && Save.data.owned.weapons.espiral) }
);

// ---------- 4. estatisticas ----------
{
  const up = Game.updatePlay;
  Game.updatePlay = function (dt) { const r = up.call(this, dt); if (G.state === 'play') { const s = Save.data.pstats = Save.data.pstats || { sec: 0, deaths: {}, wused: {}, runs: 0 }; s.sec += dt; } return r; };
  const ss = Game.startStage;
  Game.startStage = function () { const r = ss.apply(this, arguments); const s = Save.data.pstats = Save.data.pstats || { sec: 0, deaths: {}, wused: {}, runs: 0 }; s.runs++; if (G.player) s.wused[G.player.weapon] = (s.wused[G.player.weapon] || 0) + 1; return r; };
  hookRender(rn => { let last = ''; return function () { rn(); const s = G.state; if (s === last) return; if (s === 'over' && !G.endless) { const p = Save.data.pstats = Save.data.pstats || { sec: 0, deaths: {}, wused: {}, runs: 0 }; p.deaths[G.stageIdx] = (p.deaths[G.stageIdx] || 0) + 1; } last = s; }; });
  Screens.stats = function () {
    const s = Save.data.pstats || { sec: 0, deaths: {}, wused: {}, runs: 0 }, st = Save.data.stats || {}; txt('ESTATÍSTICAS', W / 2, 30, 46, '#fff', 'center');
    const h = Math.floor(s.sec / 3600), m = Math.floor(s.sec % 3600 / 60); UI.panel(80, 100, 540, 230, { r: 20 });
    [['Tempo jogado', h + ' h ' + m + ' min'], ['Partidas', String(s.runs)], ['Inimigos derrotados', String(st.kills || 0)], ['Estrelas guardadas', String(st.stars || 0)], ['Esquivas', String(st.dashes || 0)]].forEach(([a, b], i) => { txt(a, 110, 124 + i * 40, 20, '#cdb8ff', 'left', 700); txt(b, 590, 122 + i * 40, 22, '#fff', 'right', 900); });
    UI.panel(660, 100, 540, 230, { r: 20 }); txt('ARMAS MAIS USADAS', 690, 114, 18, '#ffb340', 'left', 900); Object.entries(s.wused).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([id, n], i) => txt((WEAPONS[id] ? WEAPONS[id].name : id) + '  ×' + n, 690, 150 + i * 34, 19, '#fff', 'left', 700));
    UI.panel(80, 350, 1120, 210, { r: 20 }); txt('ONDE VOCÊ MAIS CAI', 110, 364, 18, '#ffb340', 'left', 900);
    const mx = Math.max(1, ...STAGES.map((_, i) => s.deaths[i] || 0)); STAGES.forEach((_, i) => { const n = s.deaths[i] || 0, x = 110 + i * 108, hh = 120 * n / mx; ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(x, 410, 70, 120); ctx.fillStyle = n === mx && n > 0 ? '#ff6a8a' : '#9a63ff'; ctx.fillRect(x, 530 - hh, 70, hh); txt(String(n), x + 35, 410 + 120 - hh - 20, 16, '#fff', 'center', 800); txt('F' + (i + 1), x + 35, 536, 15, '#cdb8ff', 'center', 800); });
    if (UI.button('back', W / 2 - 160, 600, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
  };
}

// ---------- 5. galeria dos chefes ----------
Screens.bossgal = function () {
  const i = ((Visual81.gal % STAGES.length) + STAGES.length) % STAGES.length, st = STAGES[i], open = !!(Save.data.cleared && Save.data.cleared[i]); txt('GALERIA DOS CHEFES', W / 2, 24, 44, '#fff', 'center');
  UI.panel(120, 96, 1040, 440, { r: 24 });
  if (open) {
    try { if (!Visual81.gb || Visual81.gbI !== i) { Visual81.gb = new BOSS_CLASSES[st.boss](); Visual81.gbI = i; Visual81.gb.state = 'fight'; } const b = Visual81.gb; b.t = World.t; b.x = 400; b.y = 330; b.state = 'fight'; b.shx = b.shy = 0; ctx.save(); ctx.beginPath(); ctx.rect(140, 110, 520, 412); ctx.clip(); ctx.translate(400, 330); ctx.scale(.62, .62); ctx.translate(-400, -330); b.draw(); ctx.restore(); } catch (e) { }
    txt(st.bossName, 690, 130, 34, '#ffe9a8', 'left', 900); txt('Fase ' + (i + 1) + ' — ' + st.name, 690, 176, 20, '#cdb8ff', 'left', 700);
    const t = Save.data.bossTime && Save.data.bossTime[i]; txt(t ? 'Seu melhor tempo: ' + t.toFixed(1) + ' s' : 'Sem tempo registrado', 690, 222, 20, '#ffd36a', 'left', 800); txt((Save.data.bossNoHit && Save.data.bossNoHit[i]) ? '★ Vencido sem dano' : 'Ainda não vencido sem dano', 690, 256, 18, (Save.data.bossNoHit && Save.data.bossNoHit[i]) ? '#7fe0a0' : '#8a7fb0', 'left', 800);
    UI.wrap(st.desc || '', 690, 300, 440, 24, 18, '#cdb8ff');
  } else { txt('?', 400, 280, 160, '#4a3a8a', 'center', 900); txt('Vença a fase ' + (i + 1) + ' para ver este chefe.', 690, 260, 24, '#8a7fb0', 'left', 700); }
  if (UI.button('gl', 140, 560, 180, 50, '◂ ANTERIOR', { size: 18 })) { Visual81.gal--; Visual81.gb = null; } if (UI.button('gr', 960, 560, 180, 50, 'PRÓXIMO ▸', { size: 18 })) { Visual81.gal++; Visual81.gb = null; }
  if (UI.button('back', W / 2 - 160, 560, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
};

// ---------- 6. desafios malucos ----------
{
  const CH = [['solo', 'SÓ ESPECIAL', 'O tiro automático some. Só o especial, que recarrega 4× mais rápido.'], ['nodash', 'SEM ESQUIVA', 'A esquiva está desligada. Desvie com a nave.'], ['one', 'UMA VIDA', 'Só 1 de vida, e nenhuma cura vale.'], ['glass', 'CRISTAL', 'Inimigos morrem num golpe, mas atiram o dobro.']];
  const ss = Game.startStage;
  Game.startStage = function () {
    const r = ss.apply(this, arguments); const c = Visual81.chal; G.chal = c; Visual81.chal = null; const p = G.player; if (!c || !p) return r;
    if (c === 'solo') { p.fireDelay = 999; p.specCdMax *= .25; p.specCd = 0; } if (c === 'one') { p.maxHp = 1; p.hp = 1; }
    return r;
  };
  const td = tryDash; tryDash = function () { if (G.chal === 'nodash') return; return td.apply(this, arguments); };
  const se = spawnEnemy; spawnEnemy = function () { const e = se.apply(this, arguments); if (e && G.chal === 'glass' && e.type !== 'dummy' && e.type !== 'captain') { e.hp = 1; e.maxHp = 1; e.shootT = (e.shootT || 1) * .5; } return e; };
  const up1 = Game.updatePlay; Game.updatePlay = function () { const r = up1.apply(this, arguments); if (G.chal === 'one' && G.player) { G.player.maxHp = 1; G.player.hp = Math.min(G.player.hp, 1); } return r; };
  hookRender(rn => { let last = ''; return function () { rn(); const s = G.state; if (s === last) return; if (s === 'clear' && G.chal) { const d = Save.data; d.chal = d.chal || {}; const k = G.chal + ':' + G.stageIdx; if (!d.chal[k]) { d.chal[k] = 1; d.coins += 150; popup(W / 2, 260, 'DESAFIO CUMPRIDO! +150 ★', '#ffd36a', 30); } } last = s; }; });
  Screens.chal = function () {
    const d = Save.data; d.chal = d.chal || {}; txt('DESAFIOS MALUCOS', W / 2, 30, 46, '#fff', 'center'); txt('Começam na fase selecionada no mapa: ' + (STAGES[G.sel || 0].name) + '. Vença para ganhar ★ 150 (uma vez por fase).', W / 2, 92, 17, '#cdb8ff', 'center', 700);
    CH.forEach(([id, nm, ds], i) => {
      const x = 110 + (i % 2) * 560, y = 140 + Math.floor(i / 2) * 200, done = !!d.chal[id + ':' + (G.sel || 0)]; UI.panel(x, y, 520, 170, { r: 20 }); txt(nm, x + 24, y + 18, 28, done ? '#7fe0a0' : '#fff', 'left', 900); UI.wrap(ds, x + 24, y + 62, 470, 22, 17, '#cdb8ff');
      if (UI.button('ch' + id, x + 24, y + 112, 220, 44, done ? '✓ JOGAR DE NOVO' : 'JOGAR', { size: 16 })) { Visual81.chal = id; Game.enter(G.sel || 0, { skipStory: true }); }
    });
    if (UI.button('back', W / 2 - 160, 580, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'hub'; }
  };
}

// ---------- 7. teste de desempenho do aparelho ----------
Screens.bench = function () {
  const B = Visual81.bench, t = World.t; if (!B) { Visual81.bench = { t0: t, gaps: [], last: performance.now() }; return; }
  const now = performance.now(), d = now - B.last; B.last = now; if (d < 500) B.gaps.push(d); const u = t - B.t0;
  World.draw(0); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (u < 8) { for (let i = 0; i < 420; i++) { const x = (i * 97.1 + t * (30 + i % 7 * 12)) % W, y = (i * 53.3 + t * (50 + i % 5 * 20)) % H; drawGlow(x, y, 14 + (i % 4) * 8, i % 3 ? '#b98cff' : '#ffb340', .5); } }
  ctx.restore();
  if (u < 8) { txt('TESTE DE DESEMPENHO', W / 2, 120, 44, '#fff', 'center'); txt('Não mexa por alguns segundos... ' + Math.ceil(8 - u) + 's', W / 2, 190, 22, '#cdb8ff', 'center', 700); return; }
  const g = B.gaps.slice(2).sort((a, b) => a - b), avg = g.reduce((a, b) => a + b, 0) / Math.max(1, g.length), fps = Math.round(1000 / avg), p95 = Math.round(1000 / (g[Math.floor(g.length * .95)] || avg)), lv = fps >= 55 ? 'SEU APARELHO AGUENTA TUDO' : fps >= 40 ? 'BOM — use "Equilibrado"' : 'PESADO — use "Limpo" e resolução 75%';
  UI.panel(300, 130, 680, 360, { r: 24 }); txt('RESULTADO', W / 2, 150, 34, '#ffe9a8', 'center', 900); txt(fps + ' fps', W / 2, 220, 80, fps >= 55 ? '#7fe0a0' : fps >= 40 ? '#ffd36a' : '#ff8a8a', 'center', 900); txt('quadros mais lentos: ' + p95 + ' fps', W / 2, 330, 20, '#cdb8ff', 'center', 700); txt(lv, W / 2, 380, 24, '#fff', 'center', 800);
  txt('Cena com 420 brilhos ao mesmo tempo, mais pesada que a maioria das lutas.', W / 2, 430, 15, '#8a7fb0', 'center', 700);
  if (UI.button('bk', W / 2 - 160, 540, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Visual81.bench = null; Snd.play('uiBack'); G.state = 'hub'; }
};

// ---------- 8. tela cheia (ajuda no celular na horizontal) ----------
{
  const fs = () => { const el = document.documentElement; try { if (document.fullscreenElement) document.exitFullscreen(); else (el.requestFullscreen ? el.requestFullscreen() : Promise.reject()).then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); }).catch(() => { }); } catch (e) { } };
  Visual81.fs = fs;
  const st = document.createElement('style'); st.textContent = 'html,body{touch-action:none;overscroll-behavior:none;-webkit-user-select:none;user-select:none}'; document.head.appendChild(st);
  const ps = Screens.pause;
  Screens.pause = function () { const r = ps.apply(this, arguments); if (UI.button('fscr', 60, 604, 380, 40, 'TELA CHEIA', { size: 16 })) fs(); return r; };
  let once = false; addEventListener('pointerdown', e => { if (!once && e.pointerType === 'touch') { once = true; fs(); } }, { once: false });
}

// ---------- hub: menu das telas extras ----------
Screens.hub = function () {
  txt('EXTRAS', W / 2, 30, 48, '#fff', 'center');
  const L = [['ÁRVORE', 'Melhorias permanentes', 'tree', '#ffb340'], ['METAS', 'Do dia e da semana', 'missions', '#7fe0a0'], ['TEMPO DOS CHEFES', 'Seus recordes', 'bosstime', '#ff8a5f'], ['GALERIA DE CHEFES', 'Veja cada um de perto', 'bossgal', '#ff7ac8'], ['DESAFIOS MALUCOS', 'Regras diferentes', 'chal', '#c04aff'], ['ESTATÍSTICAS', 'Tempo, armas e mortes', 'stats', '#7fe0ff'], ['TESTE DE DESEMPENHO', 'Mede o fps do aparelho', 'bench', '#b98cff'], ['GUIA DE QUALIDADE', 'O que cada opção faz', 'qguide', '#cdb8ff']];
  L.forEach(([a, b, s, c], i) => {
    const x = 110 + (i % 2) * 560, y = 110 + Math.floor(i / 2) * 114, id = 'hub' + i, f = UI.focus(id); if (UI.hit(id, x, y, 520, 96)) { Snd.play('uiSelect'); G.state = s; if (s === 'bench') Visual81.bench = null; return; }
    ctx.save(); if (f) { ctx.shadowColor = c; ctx.shadowBlur = 24; } UI.panel(x, y, 520, 96, { fill: f ? 'rgba(50,28,120,.85)' : 'rgba(20,8,55,.75)', stroke: f ? c : 'rgba(190,160,255,.3)', r: 20 }); ctx.restore(); txt(a, x + 28, y + 18, 26, c, 'left', 900); txt(b, x + 28, y + 56, 17, '#cdb8ff', 'left', 700);
  });
  if (UI.button('back', W / 2 - 160, 580, 320, 56, 'VOLTAR', { size: 24 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
};
