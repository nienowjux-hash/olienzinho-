'use strict';
// ---------- 85: tela de derrota limpa e leve: uma foto do ultimo quadro no fundo (o jogo para de redesenhar tudo), placar, o que te acertou e quatro botoes ----------
const Visual85 = { snap: null };
{
  const dp = Game.drawPlay;
  Game.drawPlay = function (cx) {
    const s = G.state;
    if (s === 'over' && !(G.endless || G.rush || G.secret || G.practice || G.weekly || G.daily)) {
      if (!Visual85.snap) {
        dp.call(this, cx);
        try { const c = document.createElement('canvas'); c.width = Math.max(2, cv.width >> 1); c.height = Math.max(2, cv.height >> 1); c.getContext('2d').drawImage(cv, 0, 0, c.width, c.height); Visual85.snap = c; } catch (e) { }
        return;
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(Visual85.snap, 0, 0, W, H); return;
    }
    if (s !== 'over' && s !== 'replay') Visual85.snap = null;
    return dp.call(this, cx);
  };
  const prev = Screens.over;
  Screens.over = function () {
    if (G.endless || G.rush || G.secret || G.practice || G.weekly || G.daily || !G.result) return prev.apply(this, arguments);
    const r = G.result, t = World.t - (G.overAt ?? (G.overAt = World.t)); if (!G.overQuote) G.overQuote = pick(STORY.defeat.orbi);
    // escurece o fundo
    ctx.fillStyle = 'rgba(6,2,20,' + clamp(t / .8, 0, .86) + ')'; ctx.fillRect(0, 0, W, H); { const g = ctx.createLinearGradient(0, 0, 0, 210); g.addColorStop(0, 'rgba(6,2,20,' + clamp(t / .8, 0, .95) + ')'); g.addColorStop(1, 'rgba(6,2,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 210); }
    // titulo
    const e = easeOut(clamp((t - .15) / .6, 0, 1));
    ctx.save(); ctx.translate(W / 2, 80); ctx.scale(1.18 - .18 * e, 1.18 - .18 * e); ctx.globalAlpha = e; ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 380, '#ff5a9a', .22); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = e; txt('NAVE DESTRUÍDA', 0, -18, 62, '#ff7ac8', 'center', 900); ctx.restore(); ctx.globalAlpha = 1;
    const a2 = clamp((t - .7) / .5, 0, 1); ctx.globalAlpha = a2; txt('"' + G.overQuote + '"', W / 2, 150, 19, '#cdb8ff', 'center', 700); txt('— Orbi', W / 2, 178, 14, '#7fe0ff', 'center', 800); ctx.globalAlpha = 1;
    // placar (esquerda)
    const k1 = easeOut(clamp((t - 1) / .45, 0, 1)), px = 90, py = 220;
    ctx.save(); ctx.globalAlpha = k1; ctx.translate((1 - k1) * -30, 0); UI.panel(px, py, 520, 280, { r: 22 });
    [['Pontuação', r.score + ' pts'], ['Inimigos derrotados', String(r.kills)], ['Nível alcançado', String(r.level)], ['Estrelas guardadas', '★ ' + r.coins]].forEach(([a, b], i) => { txt(a, px + 34, py + 28 + i * 46, 21, '#cdb8ff', 'left', 700); txt(b, px + 486, py + 26 + i * 46, 23, i === 3 ? '#ffd36a' : '#fff', 'right', 900); });
    const tt = Math.floor(G.t || 0); txt('Você durou ' + Math.floor(tt / 60) + ':' + String(tt % 60).padStart(2, '0') + '   •   Maior combo x' + (G.stats ? G.stats.maxCombo : 0), px + 260, py + 236, 16, '#8a7fb0', 'center', 700); ctx.restore();
    // o que te acertou (direita)
    const k2 = easeOut(clamp((t - 1.25) / .45, 0, 1)), qx = 660, qy = 220, rc = r.recap, kill = (typeof Visual68 !== 'undefined' && Visual68.killer) || (rc && rc.last && rc.last.name) || '';
    ctx.save(); ctx.globalAlpha = k2; ctx.translate((1 - k2) * 30, 0); UI.panel(qx, qy, 530, 280, { r: 22 });
    txt('O QUE TE ACERTOU', qx + 30, qy + 22, 15, '#ffb340', 'left', 900);
    if (kill) { txt('Derrotado por', qx + 30, qy + 56, 14, '#8a7fb0', 'left', 700); txt(kill, qx + 30, qy + 76, 26, '#fff', 'left', 900); }
    if (rc && rc.top && rc.top.length) { txt('ACERTOS NESTA PARTIDA', qx + 30, qy + 124, 12, '#8a7fb0', 'left', 800); rc.top.slice(0, 3).forEach((q, i) => txt(q.n + '×  ' + q.name, qx + 30, qy + 146 + i * 26, 17, i ? '#cdb8ff' : '#ffcf6b', 'left', 700)); }
    if (!kill && !(rc && rc.top && rc.top.length)) txt('Nenhum golpe registrado nesta partida.', qx + 30, qy + 90, 17, '#8a7fb0', 'left', 700);
    if (rc && rc.last && rc.last.tip) UI.wrap('Dica: ' + rc.last.tip, qx + 30, qy + 232, 470, 20, 15, '#cdb8ff', 'left', 700);
    ctx.restore();
    // botoes
    const kb = easeOut(clamp((t - 1.7) / .4, 0, 1)); ctx.globalAlpha = kb; const rp = typeof Visual82 !== 'undefined' && Visual82.rp, bw = rp ? [340, 240, 140, 140] : [360, 0, 160, 160], gap = 20, tot = bw.reduce((s, w) => s + (w ? w + gap : 0), -gap); let x = W / 2 - tot / 2; const y = 560;
    if (UI.button('retry', x, y, bw[0], 64, 'TENTAR DE NOVO', { size: 22, color: '#9a63ff' })) Game.enter(G.stageIdx, { skipStory: true }); x += bw[0] + gap;
    if (rp) { if (UI.button('rpl', x, y, bw[1], 64, 'REVER A LUTA', { size: 20 })) { Visual82.rpI = 0; G.state = 'replay'; } x += bw[1] + gap; }
    if (UI.button('shop', x, y, bw[2], 64, 'LOJA', { size: 20 })) { G.shopBack = 'over'; G.state = 'shop'; } x += bw[2] + gap;
    if (UI.button('map', x, y, bw[3], 64, 'MAPA', { size: 20 })) Game.goSelect();
    ctx.globalAlpha = 1;
    if (typeof this.bars === 'function') this.bars();
  };
}
