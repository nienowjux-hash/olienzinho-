'use strict';
// ---------- polimento 20: evolucao dos guardioes, armas secundarias novas, dificuldade livre, galeria,
// escolha na historia do Ultimo Ceu e torneio final ----------
const Visual20 = {};
const stk = (k, d) => (Save.data[k] || (Save.data[k] = d));

// ---------- evolucao dos guardioes ----------
const GUP = {
  C: [{ id: 'a', name: 'Ferrão', desc: '+12% de dano das abelhas por nível.', max: 5, cost: l => 80 + l * 50 }, { id: 'b', name: 'Colmeia Cheia', desc: 'A cada 2 níveis, mais 2 abelhas por rajada.', max: 4, cost: l => 100 + l * 60 }],
  P: [{ id: 'a', name: 'Rochedo', desc: '+12% de dano das rochas por nível.', max: 5, cost: l => 80 + l * 50 }, { id: 'b', name: 'Casco de Pedra', desc: '+1 de vida por nível.', max: 3, cost: l => 110 + l * 70 }],
  E: [{ id: 'a', name: 'Olhar Agudo', desc: '+4% de chance de crítico por nível.', max: 5, cost: l => 80 + l * 50 }, { id: 'b', name: 'Marca Longa', desc: 'A marca do especial dura 0,6s a mais por nível.', max: 4, cost: l => 100 + l * 60 }],
  S: [{ id: 'a', name: 'Chama Viva', desc: '+10% de dano do fogo por nível.', max: 5, cost: l => 80 + l * 50 }, { id: 'b', name: 'Sol Veloz', desc: 'Explosão Solar recarrega 8% mais rápido por nível.', max: 5, cost: l => 100 + l * 60 }],
};
Visual20.gl = (g, id) => (((Save.data.gup || {})[g] || {})[id]) || 0;
{
  const ss = Visual8.styleStats;
  Visual8.styleStats = function (p) {
    ss.call(this, p); const w = p.weapon; if (!w || !w.startsWith('g_') || p.isP2) return; const g = w[2], a = Visual20.gl(g, 'a'), b = Visual20.gl(g, 'b');
    if (g === 'C') { p.dmg *= 1 + .12 * a; p.shots += Math.floor(b / 2); }
    else if (g === 'P') { p.dmg *= 1 + .12 * a; p.maxHp += b; }
    else if (g === 'E') { p.crit += .04 * a; }
    else if (g === 'S') { p.dmg *= 1 + .1 * a; p.specCdMax *= 1 - .08 * b; }
  };
  const sg = SPECIALS.gaze; SPECIALS.gaze = function (p) { sg(p); G.mark += .6 * Visual20.gl('E', 'b'); };
}
Screens.pilots = function () {
  txt('EVOLUÇÃO DOS GUARDIÕES', W / 2, 24, 42, '#fff', 'center'); txt(Screens.stars(), W - 40, 36, 30, '#ffcf6b', 'right'); const t = World.t;
  ['C', 'P', 'E', 'S'].forEach((g, i) => {
    const x = 40 + i * 300, y = 100, w = 280, h = 470, G0 = GUARDS[g]; UI.panel(x, y, w, h, { r: 22 }); txt(G0.name, x + w / 2, y + 12, 26, G0.c, 'center', w - 20);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y + 48, w, 130); ctx.clip(); Art.guardian(x + w / 2, y + 120 + Math.sin(t * 1.6 + i) * 6, { guard: 'g_' + g, vx: 0, t, scale: 1.25, lookx: 0, looky: 0, blinkT: Screens.blinkAt(t + i) }); ctx.restore();
    GUP[g].forEach((u, k) => {
      const l = Visual20.gl(g, u.id), full = l >= u.max, cost = u.cost(l), can = !full && Save.data.coins >= cost, yy = y + 196 + k * 132;
      txt(u.name, x + w / 2, yy, 19, '#fff', 'center', w - 20); UI.wrap(u.desc, x + w / 2, yy + 26, w - 36, 17, 13, '#cdb8ff', 'center');
      for (let q = 0; q < u.max; q++) { ctx.fillStyle = q < l ? G0.c : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(x + w / 2 + (q - (u.max - 1) / 2) * 24, yy + 70, 8, 0, TAU); ctx.fill(); }
      if (full) txt('NO MÁXIMO', x + w / 2, yy + 88, 15, '#7fe0a0', 'center', 300);
      else if (UI.button('gu' + g + u.id, x + 50, yy + 86, w - 100, 34, '★ ' + cost, { size: 17, color: can ? '#9a63ff' : undefined })) { if (can) { Save.data.coins -= cost; const o = stk('gup', {}); (o[g] = o[g] || {})[u.id] = l + 1; Save.save(); Snd.play('buy'); shockwave(x + w / 2, yy + 70, 110, G0.c); } else Snd.play('uiDeny'); }
    });
  });
  if (UI.button('back', W / 2 - 160, 604, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};

// ---------- armas secundarias novas ----------
Object.assign(SECS, {
  drone: { name: 'AJUDANTE', c: '#7fe0ff', cd: 14, desc: 'Um drone orbita e atira por 10s.' },
  freeze: { name: 'TEMPO LENTO', c: '#c8a0ff', cd: 20, desc: 'Inimigos e tiros ficam lentos por 3,5s.' },
  pillar: { name: 'PILAR DE LUZ', c: '#ffe9a8', cd: 13, desc: 'Coluna de luz que segue você por 1,5s.' },
  repair: { name: 'REPARO', c: '#7fe0a0', cd: 45, desc: 'Recupera 1 de vida.' },
});
{
  const us = Visual13.useSec;
  Visual13.useSec = function (p) {
    const id = Save.data.loadout.sec || 'none';
    if (!['drone', 'freeze', 'pillar', 'repair'].includes(id)) return us.call(this, p);
    if (p.secCd > 0 || p.dead) return; if (id === 'repair' && p.hp >= p.maxHp) { popup(p.x, p.y - 50, 'vida cheia', '#7fe0a0', 18); return; }
    p.secCd = p.secMax = SECS[id].cd; Snd.play('specialFire', { w: 'secondary' });
    if (id === 'drone') G.drone = { t: 0, dur: 10, fT: 0 };
    else if (id === 'freeze') { G.slowT = 3.5; shockwave(p.x, p.y, 700, '#c8a0ff'); flashScreen(.15); }
    else if (id === 'pillar') G.pillar = { t: 0, dur: 1.5, tk: 0 };
    else { p.hp = Math.min(p.maxHp, p.hp + 1); popup(p.x, p.y - 60, '+1 vida', '#7fe0a0', 26); burst(p.x, p.y, ['#7fe0a0', '#ffffff'], 24, 260, 5); shockwave(p.x, p.y, 160, '#7fe0a0'); }
  };
  const vu = Visual13.update;
  Visual13.update = function (dt) {
    vu.call(this, dt); const p = G.player; if (!p || p.dead) return;
    const d = G.drone; if (d) {
      d.t += dt; d.fT -= dt; d.x = p.x + Math.cos(d.t * 2.4) * 70; d.y = p.y - 50 + Math.sin(d.t * 2.4) * 28;
      if (d.fT <= 0) { d.fT = .3; const tg = nearestTarget(d.x, d.y); const a = tg ? Math.atan2(tg.y - d.y, tg.x - d.x) : -Math.PI / 2; G.pb.push({ x: d.x, y: d.y, vx: Math.cos(a) * 760, vy: Math.sin(a) * 760, dmg: p.dmg * .55, crit: false, pierce: 0, hits: [], c: '#7fe0ff', r: 6, life: 1.2 }); }
      if (d.t > d.dur) G.drone = null;
    }
    if (G.slowT > 0) G.slowT -= dt;
    const pl = G.pillar; if (pl) {
      pl.t += dt; pl.tk -= dt; if (pl.tk <= 0) { pl.tk = .1; for (const e of G.enemies) if (!e.dead && e.type !== 'dummy' && Math.abs(e.x - p.x) < 52 + e.rad && e.y < p.y) damageEnemy(e, p.dmg * .9, false, true); const b = G.boss; if (b && b.targetable() && b.hitTest(p.x, b.y, 40)) b.damage(Math.min(p.dmg * 1.1, b.maxHp * .004)); for (const q of G.eb) if (!q.dead && Math.abs(q.x - p.x) < 44 && q.y < p.y) q.dead = true; }
      if (pl.t > pl.dur) G.pillar = null;
    }
  };
  const vd = Visual13.draw;
  Visual13.draw = function () {
    vd.call(this); const p = G.player; if (!p) return; const t = World.t;
    const d = G.drone; if (d && d.x !== undefined) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(d.x, d.y, 30, '#7fe0ff', .6); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#e8fbff'; ctx.strokeStyle = '#4cc8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(d.x, d.y, 10, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#10062a'; ctx.beginPath(); ctx.arc(d.x + 2, d.y, 4, 0, TAU); ctx.fill(); ctx.restore(); }
    const pl = G.pillar; if (pl) { const k = Math.min(1, pl.t / .15) * Math.min(1, (pl.dur - pl.t) / .25); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(p.x - 50, 0, p.x + 50, 0); g.addColorStop(0, 'rgba(255,233,168,0)'); g.addColorStop(.5, 'rgba(255,255,255,' + .9 * k + ')'); g.addColorStop(1, 'rgba(255,233,168,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - 50, 0, 100, p.y); drawGlow(p.x, p.y - 20, 80, '#ffe9a8', .5 * k); ctx.restore(); }
    if (G.slowT > 0) { ctx.save(); ctx.globalAlpha = .08 + Math.min(1, G.slowT) * .06; ctx.fillStyle = '#9a63ff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  };
  // o tempo lento atinge inimigos, tiros e chefe
  const ue = updateEnemy; updateEnemy = function (e, dt) { return ue(e, G.slowT > 0 ? dt * .35 : dt); };
  const bu = Boss.prototype.update; Boss.prototype.update = function (dt) { return bu.call(this, G.slowT > 0 ? dt * .5 : dt); };
  const gu = Game.updatePlay; Game.updatePlay = function (dt) {
    for (const q of G.eb) { if (G.slowT > 0 && !q._sl) { q.vx *= .35; q.vy *= .35; q._sl = 1; } else if (!(G.slowT > 0) && q._sl) { q.vx /= .35; q.vy /= .35; q._sl = 0; } }
    return gu.call(this, dt);
  };
  const sh = Game.startStage; Game.startStage = function (i, o) { G.drone = null; G.pillar = null; G.slowT = 0; return sh.call(this, i, o); };
}

// ---------- dificuldade livre ----------
DIFF.push({ name: 'LIVRE', desc: 'Você escolhe: vida dos inimigos, velocidade dos tiros e a sua vida. Toque em AJUSTAR.', hp: 1, bul: 1, php: 0, score: 1, coin: 1 });
Visual20.cust = () => stk('settings', {}).cust || (Save.data.settings.cust = { hp: 1, bul: 1, php: 0 });
Visual20.applyCust = function () { const c = Visual20.cust(), d = DIFF[4]; d.hp = c.hp; d.bul = c.bul; d.php = c.php; d.score = +(1 + (c.hp - 1) * .5 + (c.bul - 1) * .6 - c.php * .08).toFixed(2); d.coin = +(1 + (c.hp - 1) * .4 + (c.bul - 1) * .4 - c.php * .06).toFixed(2); if (d.score < .3) d.score = .3; if (d.coin < .3) d.coin = .3; };
Visual20.applyCust();
Screens.custom = function () {
  const c = Visual20.cust(); UI.panel(300, 90, 680, 520); txt('DIFICULDADE LIVRE', W / 2, 108, 38, '#fff', 'center');
  const row = (label, y, val, lo, hi, key, fmt) => { txt(label + '  ' + fmt(val), 360, y, 21, '#e2d4ff'); const n = UI.slider('cu' + key, 360, y + 40, 560, (val - lo) / (hi - lo)); const v = lo + n * (hi - lo); return key === 'php' ? Math.round(v) : Math.round(v * 20) / 20; };
  const hp = row('VIDA DOS INIMIGOS', 190, c.hp, .5, 2.5, 'hp', v => '×' + v.toFixed(2)), bul = row('VELOCIDADE DOS TIROS', 300, c.bul, .6, 1.6, 'bul', v => '×' + v.toFixed(2)), php = row('SUA VIDA', 410, c.php, -3, 4, 'php', v => (v > 0 ? '+' : '') + v);
  if (hp !== c.hp || bul !== c.bul || php !== c.php) { c.hp = hp; c.bul = bul; c.php = php; Visual20.applyCust(); Save.save(); }
  const d = DIFF[4]; txt('Pontos ×' + d.score.toFixed(2) + '   •   Estrelas ×' + d.coin.toFixed(2), W / 2, 500, 20, '#ffcf6b', 'center', 800);
  if (UI.button('cuReset', 360, 536, 270, 44, 'PADRÃO', { size: 18 })) { Object.assign(c, { hp: 1, bul: 1, php: 0 }); Visual20.applyCust(); Save.save(); }
  if (UI.button('back', 648, 536, 272, 44, 'VOLTAR', { size: 20 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = G.customBack || 'settings'; G.customBack = null; }
};
{
  const st = Screens.settings;
  Screens.settings = function () {
    st.call(this); if ((Save.data.settings.diff ?? 1) === 4 && UI.button('custAdj', 780, 266, 140, 30, 'AJUSTAR ▸', { size: 14 })) { Snd.play('uiSelect'); G.state = 'custom'; }
  };
}

// ---------- galeria de cenas ----------
Visual20.CLIPS = [['v_prologue', 'O Céu Antes do Vazio', 'Prólogo'], ['v_finale1', 'A Luz Volta a Bater', 'Fim da Parte 2'], ['v_door', 'A Porta de Luz', 'Abertura da Parte 3'], ['v_rift', 'A Fenda', 'Abertura do Ato Final'], ['v_end', 'O Último Céu', 'Final'], ['v_act2', 'O Cemitério das Estrelas', 'Abertura do Ato II'], ['v_void', 'O Vazio Desperta', 'Antes do Vazio']];
Screens.gallery = function () {
  txt('GALERIA DE CENAS', W / 2, 26, 44, '#fff', 'center'); txt('Reveja os vídeos que você já assistiu.', W / 2, 88, 18, '#ffb340', 'center', 800); const seen = Save.data.vseen || {};
  Visual20.CLIPS.forEach(([id, name, where], i) => {
    const x = 50 + (i % 4) * 300, y = 130 + Math.floor(i / 4) * 210, w = 280, h = 190, ok = !!seen[id], fid = 'gv' + i;
    if (UI.hit(fid, x, y, w, h, { disabled: !ok })) { Game.startStory([{ music: 'hope' }, { video: id }], () => { G.state = 'gallery'; Snd.musicPlay('menu', 0); }, { music: null }); return; }
    const f = UI.focus(fid); ctx.save(); ctx.globalAlpha = ok ? 1 : .55; UI.panel(x, y, w, h, { r: 18, fill: f && ok ? 'rgba(50,28,120,.85)' : 'rgba(20,8,55,.75)', stroke: f && ok ? '#ffb340' : 'rgba(190,160,255,.3)' });
    ctx.fillStyle = ok ? 'rgba(255,233,168,.9)' : 'rgba(120,100,170,.6)'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 14, y + 44); ctx.lineTo(x + w / 2 + 20, y + 70); ctx.lineTo(x + w / 2 - 14, y + 96); ctx.closePath(); ctx.fill();
    txt(ok ? name : '???', x + w / 2, y + 116, 21, '#fff', 'center', w - 20); txt(ok ? where : '🔒 ainda não vista', x + w / 2, y + 150, 15, ok ? '#cdb8ff' : '#8a7fb0', 'center', w - 20); ctx.restore();
  });
  if (UI.button('back', W / 2 - 160, 604, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};

// ---------- escolha na historia do Ultimo Ceu ----------
{
  const P = STORY.stages[9], i = P.pre.findIndex(p => p.who === 'K' && p.mood === 'angry');
  if (i > 0) P.pre.splice(i, 0,
    { choice: [{ k: 'luz', t: 'Oferecer a minha luz' }, { k: 'fogo', t: 'Enfrentar você até o fim' }] },
    { only: 'luz', who: 'K', scene: 'void', text: 'Oferecer...? Ninguém nunca me ofereceu nada. Todos só fugiram.' },
    { only: 'fogo', who: 'K', scene: 'void', text: 'Então venha! Eu não tenho mais nada a perder!' });
  P.after.splice(1, 0, { only: 'luz', who: 'O', scene: 'lit', mood: 'happy', text: 'A luz que eu te ofereci continua sendo sua. Pode guardar.' }, { only: 'fogo', who: 'O', scene: 'lit', mood: 'determined', text: 'Eu lutei até o fim. Mas também escutei você até o fim.' });
  const F = STORY.finale4; F.splice(2, 0, { only: 'luz', who: 'N', text: 'Eles descansaram porque alguém dividiu a luz primeiro.' }, { only: 'fogo', who: 'N', text: 'Eles descansaram porque alguém encarou o medo de frente, sem desviar.' });
}
{
  const st1 = Screens.story;
  Screens.story = function () {
    const S = G.story; if (!S) return st1.call(this);
    let pg = this.curPage(S);
    while (pg && ((pg.only && pg.only !== Save.data.choice10) || (pg.req && !pg.req()))) { S.i++; S.t = 0; S.lastShown = 0; S.doneAt = null; if (S.i >= S.pages.length) { Game.endStory(); return; } pg = this.curPage(S); }
    if (pg && pg.choice) {
      ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(8,2,26,.7)'; ctx.fillRect(0, 0, W, H); txt('O que o Olienzinho faz?', W / 2, 200, 40, '#fff', 'center', 900);
      pg.choice.forEach((c, i) => { if (UI.button('ch' + i, 270 + i * 380, 320, 360, 90, c.t, { size: 24, color: '#9a63ff' })) { Save.data.choice10 = c.k; Save.save(); Snd.play('uiSelect'); S.i++; S.t = 0; S.lastShown = 0; S.doneAt = null; if (S.i >= S.pages.length) Game.endStory(); } });
      txt('Sua escolha muda as últimas falas da história.', W / 2, 470, 17, '#cdb8ff', 'center', 800); return;
    }
    return st1.call(this);
  };
}
{ // marca o video como visto (para a galeria)
  const vp = Visual18.page; Visual18.page = function (S, pg) { if (!S.vOn) { const o = stk('vseen', {}); if (!o[pg.video]) { o[pg.video] = 1; Save.save(); } } return vp.call(this, S, pg); };
}

