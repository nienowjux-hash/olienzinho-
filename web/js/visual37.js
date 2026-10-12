'use strict';
// ---------- 37: Opcoes em abas, Conquistas com icones e filtros, transicoes por tela e leve inclinacao da camera ----------
const Visual37 = { tilt: 0, STABS: [['aud', 'ÁUDIO'], ['jog', 'JOGO'], ['vid', 'VÍDEO'], ['acc', 'ACESSIBILIDADE'], ['sav', 'SAVE']] };

// ---------- helpers ----------
Visual37.toggle = function (id, x, y, w, h, label, on, desc) {
  const f = UI.focus(id); let click = false;
  if (UI.hit(id, x, y, w, h)) { click = true; Snd.play('uiSelect'); }
  UI.panel(x, y, w, h, { r: 16, fill: on ? 'rgba(60,34,140,.9)' : f ? 'rgba(40,20,100,.85)' : 'rgba(20,8,55,.75)', stroke: on ? '#7fe0a0' : f ? '#e2d4ff' : 'rgba(190,160,255,.3)' });
  txt(label, x + 18, y + 11, 18, '#fff', 'left', 900); if (desc) txt(desc, x + 18, y + 38, 13, '#cdb8ff', 'left', 700);
  const sx = x + w - 62, sy = y + h / 2 - 12; ctx.fillStyle = on ? '#4cc07a' : 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.roundRect(sx, sy, 46, 24, 12); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + (on ? 34 : 12), sy + 12, 9, 0, TAU); ctx.fill();
  return click;
};

// ---------- OPCOES ----------
Screens.settings = function () {
  const s = Save.data.settings; G.stab = G.stab || 'aud';
  txt('OPÇÕES', W / 2, 20, 42, '#fff', 'center');
  const tw = 196; Visual37.STABS.forEach(([id, lab], i) => { if (UI.button('st' + id, W / 2 - (tw * 5 + 40) / 2 + i * (tw + 10), 78, tw, 40, lab, { size: 14, color: G.stab === id ? '#9a63ff' : undefined })) { G.stab = id; Snd.play('uiSelect'); } });
  UI.panel(170, 134, 940, 470, { r: 26 });
  const X = 210, Wd = 860, tg = (id, i, label, key, desc, inv) => { const col = i % 2, row = Math.floor(i / 2), on = inv ? s[key] === false : !!s[key]; if (Visual37.toggle(id, X + col * 440, 176 + row * 92, 420, 78, label, inv ? !on : on, desc)) { s[key] = inv ? (s[key] === false ? true : false) : !s[key]; Save.save(); } };
  if (G.stab === 'aud') {
    txt('MÚSICA  ' + Math.round(s.music * 100) + '%', X, 164, 22, '#e2d4ff'); const m = UI.slider('music', X, 206, Wd, s.music);
    txt('EFEITOS SONOROS  ' + Math.round(s.sfx * 100) + '%', X, 262, 22, '#e2d4ff'); const e = UI.slider('sfx', X, 304, Wd, s.sfx);
    if (m !== s.music || e !== s.sfx) { const ch = e !== s.sfx; s.music = m; s.sfx = e; Snd.setVolumes(s.sfx, s.music); Save.save(); if (ch && !G.sfxTest) { Snd.play('explode', { size: .5 }); G.sfxTest = 10; } }
    if (G.sfxTest) G.sfxTest--;
    if (Visual37.toggle('cine', X, 380, 420, 78, 'Vídeos da história', s.cine !== false, 'Cenas em vídeo nos momentos-chave.')) { s.cine = s.cine === false ? true : false; Save.save(); }
    txt('Dica: a música abaixa sozinha nas explosões grandes.', X + 450, 408, 15, '#8a7fb0', 'left', 700);
  } else if (G.stab === 'jog') {
    const d = s.diff ?? 1; txt('DIFICULDADE', X, 150, 22, '#ffb340', 'left', 900);
    DIFF.forEach((df, i) => { const col = i % 3, row = Math.floor(i / 3), x = X + col * 290, y = 188 + row * 62; if (UI.button('diff' + i, x, y, 276, 50, ((d === i) ? '✓ ' : '') + df.name, { size: 17, color: d === i ? '#9a63ff' : undefined })) { s.diff = i; Save.save(); } });
    UI.panel(X, 322, Wd, 70, { r: 14, fill: 'rgba(14,6,40,.7)' }); UI.wrap(DIFF[d].desc, X + 16, 332, Wd - 32, 20, 15, '#cdb8ff');
    if (d === 4 && UI.button('custAdj', X + Wd - 200, 408, 200, 38, 'AJUSTAR LIVRE ▸', { size: 14 })) { Snd.play('uiSelect'); G.state = 'custom'; }
    if (Visual37.toggle('assist', X, 450, 420, 78, 'Modo assistido', !!s.assist, 'Um escudo afasta tiros muito próximos.')) { s.assist = !s.assist; Save.save(); }
    txt('Alterar a dificuldade vale para as próximas fases.', X + 450, 478, 15, '#8a7fb0', 'left', 700);
  } else if (G.stab === 'vid') {
    txt('QUALIDADE GRÁFICA', X, 150, 22, '#ffb340', 'left', 900);
    ['BAIXO', 'MÉDIO', 'ALTO'].forEach((n, i) => { const q = s.quality ?? 2; if (UI.button('ql' + i, X + i * 290, 188, 276, 50, (q === i ? '✓ ' : '') + n, { size: 18, color: q === i ? '#9a63ff' : undefined })) { s.quality = i; Save.save(); } });
    UI.wrap(['Sem brilho extra nem efeitos pesados: para PCs mais fracos.', 'Sem distorção de tela nem granulado.', 'Todos os efeitos visuais ligados.'][s.quality ?? 2], X, 250, Wd, 20, 15, '#cdb8ff');
    txt('RESOLUÇÃO INTERNA', X, 316, 22, '#ffb340', 'left', 900); [[2, '200% (4K)'], [1.5, '150%'], [1, '100%'], [.75, '75%'], [.5, '50%']].forEach(([v, l], i) => { const on = (s.res || 1) === v; if (UI.button('res' + i, X + i * 172, 354, 160, 46, (on ? '✓ ' : '') + l, { size: 17, color: on ? '#9a63ff' : undefined })) { s.res = v; Save.save(); resize(); } });
    txt('Menor deixa mais leve em PCs fracos; 150% e 200% deixam mais nítido em telas grandes (pesa mais).', X, 416, 15, '#8a7fb0', 'left', 700);
    if (Visual37.toggle('ultra', X, 450, 420, 78, 'Modo Ultra', !!s.ultra, 'Mais partículas, brilho e suavização. Só na qualidade Alta.')) { s.ultra = !s.ultra; Save.save(); }
  } else if (G.stab === 'acc') {
    tg('calm', 0, 'Menos tremor', 'calm', 'Reduz o tremor de tela e os clarões.'); tg('outl', 1, 'Contorno nos tiros', 'outline', 'Contorno branco para enxergar melhor.');
    tg('contr', 2, 'Alto contraste', 'contrast', 'Tiros inimigos mais destacados.'); tg('assist2', 3, 'Modo assistido', 'assist', 'Escudo contra tiros muito próximos.');
    tg('soft', 4, 'Brilhos suaves', 'softGlow', 'Metade da intensidade dos brilhos.');
    if (UI.button('sacc', X, 470, 420, 52, 'TECLAS, LEGENDAS E CONTROLE ▸', { size: 17 })) { Snd.play('uiSelect'); G.state = 'access'; }
    txt('Filtro de cor, vibração, tremor e legendas ficam lá.', X + 440, 488, 15, '#8a7fb0', 'left', 700);
  } else {
    UI.wrap('Seu progresso fica salvo neste navegador. Exporte para guardar uma cópia ou levar para outro lugar.', X, 150, Wd, 22, 17, '#cdb8ff');
    if (UI.button('sexp', X, 230, 410, 56, 'EXPORTAR SAVE', { size: 20 })) Visual25.exportSave(); if (UI.button('simp', X + 450, 230, 410, 56, 'IMPORTAR SAVE', { size: 20 })) Visual25.importSave();
    const sure = G.confirmReset; if (UI.button('reset', X, 330, 410, 56, sure ? 'CONFIRMAR APAGAR TUDO?' : 'APAGAR TUDO', { size: 18, color: '#c2185b' })) { if (sure) { Save.reset(); G.confirmReset = false; Snd.setVolumes(Save.data.settings.sfx, Save.data.settings.music); G.sel = 0; } else G.confirmReset = true; }
    txt(sure ? 'Isso apaga o perfil atual e não tem volta. Clique de novo para confirmar.' : 'Apaga somente o perfil em uso.', X + 450, 348, 15, sure ? '#ff8a8a' : '#8a7fb0', 'left', 700);
  }
  if (UI.button('back', W / 2 - 160, 630, 320, 50, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { G.confirmReset = false; Snd.play('uiBack'); if (G.setBack === 'pause') G.state = 'pause'; else Game.goTitle(); }
  Screens.thinFrame();
};

// ---------- CONQUISTAS ----------
Visual37.achIcon = function (id, x, y, s, col, t, has) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = has ? 1 : .4; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  if (has) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, s * 1.6, col, .35); ctx.restore(); }
  if (/combo|chain/.test(id)) { ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * .9, -s * .1, s * .5, s * .6); ctx.quadraticCurveTo(0, s * 1.1, -s * .5, s * .6); ctx.quadraticCurveTo(-s * .9, -s * .1, 0, -s); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(0, s * .35, s * .22, s * .38, 0, 0, TAU); ctx.fill(); }
  else if (/boss|hit|secret|epi|true|rush|tour|final|vazio|part/.test(id)) { ctx.beginPath(); ctx.moveTo(-s, s * .6); ctx.lineTo(-s, -s * .3); ctx.lineTo(-s * .5, s * .1); ctx.lineTo(0, -s * .8); ctx.lineTo(s * .5, s * .1); ctx.lineTo(s, -s * .3); ctx.lineTo(s, s * .6); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-s * .8, s * .4, s * 1.6, s * .18); }
  else if (/rich|coin|star|shop|buy/.test(id)) { ctx.beginPath(); ctx.arc(0, 0, s * .9, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.75)'; Extras.star && Extras.star(0, 0, s * .55, 'rgba(255,255,255,.8)', t); }
  else if (/lvl|level|wlv|wave|rank|grade/.test(id)) { ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * .9, s * .1); ctx.lineTo(s * .35, s * .1); ctx.lineTo(s * .35, s * .9); ctx.lineTo(-s * .35, s * .9); ctx.lineTo(-s * .35, s * .1); ctx.lineTo(-s * .9, s * .1); ctx.closePath(); ctx.fill(); }
  else if (/heart|hp|life|vida/.test(id)) { ctx.beginPath(); ctx.moveTo(0, s * .8); ctx.bezierCurveTo(-s * 1.3, -s * .1, -s * .8, -s, 0, -s * .4); ctx.bezierCurveTo(s * .8, -s, s * 1.3, -s * .1, 0, s * .8); ctx.fill(); }
  else { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * .42 : s; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
  ctx.restore();
};
Screens.achievements = function () {
  const t = World.t, total = ACH.length, done = ACH.filter(a => Save.data.ach[a.id]).length; G.afil = G.afil || 'all';
  txt('CONQUISTAS', W / 2, 18, 42, '#fff', 'center');
  UI.panel(340, 70, 600, 26, { r: 13, fill: 'rgba(14,6,40,.8)' }); ctx.fillStyle = '#ffb340'; ctx.beginPath(); ctx.roundRect(344, 74, Math.max(10, 592 * done / total), 18, 9); ctx.fill(); txt(done + ' / ' + total, W / 2, 73, 16, '#1a0a3a', 'center', 900);
  // fragmentos
  txt('FRAGMENTOS DE LUZ', 70, 108, 15, '#ffb340', 'left', 900); for (let i = 0; i < 6; i++) { const has = (Save.data.frags || [])[i], x = 290 + i * 42, y = 118; ctx.save(); ctx.globalAlpha = has ? 1 : .3; if (has) { ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 22, '#ffd36a', .5); ctx.globalCompositeOperation = 'source-over'; } ctx.fillStyle = has ? '#fff2c0' : '#6a5aa0'; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 6, y); ctx.lineTo(x, y + 12); ctx.lineTo(x - 6, y); ctx.closePath(); ctx.fill(); ctx.restore(); }
  [['all', 'TODAS'], ['done', 'CONCLUÍDAS'], ['todo', 'PENDENTES']].forEach(([id, lab], i) => { if (UI.button('af' + id, 760 + i * 150, 102, 142, 32, lab, { size: 13, color: G.afil === id ? '#9a63ff' : undefined })) { G.afil = id; G.apage = 0; Snd.play('uiSelect'); } });
  const list = ACH.filter(a => G.afil === 'all' || (G.afil === 'done') === !!Save.data.ach[a.id]);
  const PP = 12, np = Math.max(1, Math.ceil(list.length / PP)); G.apage = Math.min(G.apage || 0, np - 1);
  list.slice(G.apage * PP, G.apage * PP + PP).forEach((a, i) => {
    const col = i % 3, row = (i / 3) | 0, cw = 388, ch = 98, x = 58 + col * (cw + 14), y = 150 + row * (ch + 10), has = !!Save.data.ach[a.id];
    const ek = Screens.enterK(i * .6, .4); ctx.save(); ctx.translate(0, (1 - ek) * 30); ctx.globalAlpha = clamp(ek, 0, 1);
    UI.panel(x, y, cw, ch, { r: 18, fill: has ? 'rgba(60,34,140,.85)' : 'rgba(20,8,55,.7)', stroke: has ? '#ffb340' : 'rgba(190,160,255,.25)' });
    if (has) { ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 18); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= .12; ctx.fillStyle = '#ffe9a8'; const sx = x + ((t * 150 + i * 90) % (cw + 240)) - 120; ctx.save(); ctx.translate(sx, y); ctx.rotate(.4); ctx.fillRect(0, -40, 36, ch + 80); ctx.restore(); ctx.restore(); }
    UI.panel(x + 12, y + 14, 70, 70, { r: 35, fill: has ? 'rgba(255,211,106,.14)' : 'rgba(255,255,255,.04)', stroke: has ? '#ffd36a' : 'rgba(190,160,255,.2)' });
    Visual37.achIcon(a.id, x + 47, y + 49, 20, has ? '#ffd36a' : '#8a7fb0', t, has);
    txt(a.name, x + 98, y + 14, 20, has ? '#fff' : '#a99fd6', 'left', 900); UI.wrap(a.desc, x + 98, y + 42, cw - 112, 17, 14, has ? '#cdb8ff' : '#7a70a0');
    if (has) txt('✓', x + cw - 22, y + 10, 20, '#7fe0a0', 'right', 900); else txt('🔒', x + cw - 22, y + 10, 16, '#7a70a0', 'right', 700);
    ctx.restore();
  });
  if (!list.length) txt('Nada por aqui ainda.', W / 2, 330, 24, '#8a7fb0', 'center', 800);
  if (np > 1) { txt('PÁGINA ' + (G.apage + 1) + ' / ' + np + '   (← →)', W / 2, 590, 17, '#cdb8ff', 'center', 800); if (UI.button('apL', 360, 618, 90, 44, '◀', { size: 22 }) || Input.pressed('arrowleft')) { G.apage = (G.apage + np - 1) % np; Snd.play('uiSelect'); } if (UI.button('apR', 830, 618, 90, 44, '▶', { size: 22 }) || Input.pressed('arrowright')) { G.apage = (G.apage + 1) % np; Snd.play('uiSelect'); } }
  if (UI.button('back', W / 2 - 160, 622, 320, 44, 'VOLTAR', { size: 22 }) || Input.pressed('escape')) { Snd.play('uiBack'); Game.goSelect(); }
  Screens.thinFrame();
};

// ---------- transicao de entrada por tipo de tela ----------
{
  const SUB = ['hangar', 'cosmetics', 'talents', 'fusion', 'pilots', 'settings', 'access', 'modes', 'achievements', 'records', 'stats', 'gallery', 'mutators', 'profiles', 'orbi', 'codex', 'custom', 'practice', 'playsetup', 'missions', 'shop'];
  const tick = () => {
    try {
      if (typeof Trans !== 'undefined' && QL() >= 1 && Trans.t < .5) {
        const k = clamp(Trans.t / .5, 0, 1), e = 1 - (1 - k) * (1 - k), s = G.state; let tr = '';
        if (SUB.includes(s)) tr = 'translateX(' + ((1 - e) * 46).toFixed(1) + 'px)';
        else if (s === 'title' || s === 'select') tr = 'scale(' + (1 + (1 - e) * .035).toFixed(4) + ')';
        else if (s === 'over' || s === 'celebrate') tr = 'scale(' + (.965 + e * .035).toFixed(4) + ')';
        if (tr) cv.style.transform = tr;
      }
    } catch (err) { }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---------- inclinacao suave da camera com o movimento da nave ----------
Visual37.tiltUpdate = function (dt) {
  const p = G.player, calm = Save.data.settings && Save.data.settings.calm; const target = p && !p.dead && G.state === 'play' && QL() >= 2 && !calm ? clamp((p.vx || 0) * .000028, -.014, .014) : 0;
  Visual37.tilt += (target - Visual37.tilt) * Math.min(1, 6 * dt);
};
{ const up = Game.updatePlay; Game.updatePlay = function (dt) { up.call(this, dt); Visual37.tiltUpdate(dt); }; }
