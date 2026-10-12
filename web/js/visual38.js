'use strict';
// ---------- 38: emblemas proprios para cada reliquia, aura nos icones de arma, ranking diario local com codigo para compartilhar ----------
const REL_ICON = {
  heartc(L, ring, star) { ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(-24, -2); ctx.lineTo(-14, -20); ctx.lineTo(0, -10); ctx.lineTo(14, -20); ctx.lineTo(24, -2); ctx.closePath(); ctx.stroke(); L(-24, -2, 24, -2); L(-14, -20, -6, -2, 0, 24); L(14, -20, 6, -2, 0, 24); },
  lens(L, ring) { ring(24); ring(11); ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill(); L(0, -34, 0, -26); L(0, 26, 0, 34); L(-34, 0, -26, 0); L(26, 0, 34, 0); ctx.globalAlpha = .7; L(-12, -12, -17, -17); },
  spark(L, ring) { ring(26); L(6, -20, -8, 2, 2, 2, -6, 20); ctx.globalAlpha = .6; L(16, -14, 22, -22); L(-16, 14, -22, 22); },
  magnet(L) { ctx.beginPath(); ctx.arc(0, -2, 18, Math.PI, 0); ctx.lineTo(18, 20); ctx.moveTo(-18, -2); ctx.lineTo(-18, 20); ctx.stroke(); ctx.fillStyle = '#ffcf6b'; ctx.fillRect(-23, 14, 10, 10); ctx.fillRect(13, 14, 10, 10); ctx.fillStyle = '#fff'; L(-4, -38, 4, -34); ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(0, -30, 4, 0, TAU); ctx.fill(); },
  sun(L, ring) { ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(22, -18); ctx.lineTo(18, 10); ctx.lineTo(0, 28); ctx.lineTo(-18, 10); ctx.lineTo(-22, -18); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -2, 7, 0, TAU); ctx.fill(); for (let i = 0; i < 8; i++) { const a = i * TAU / 8; L(Math.cos(a) * 11, -2 + Math.sin(a) * 11, Math.cos(a) * 16, -2 + Math.sin(a) * 16); } },
  fuse(L) { ctx.beginPath(); ctx.arc(0, 8, 17, 0, TAU); ctx.stroke(); L(6, -10, 12, -20, 20, -24); const f = Math.sin(World.t * 20) * 2; ctx.beginPath(); ctx.arc(22 + f * .3, -26 + f * .3, 4, 0, TAU); ctx.fill(); L(26, -32, 30, -36); L(28, -26, 34, -26); },
  trace(L) { ctx.beginPath(); ctx.arc(12, -10, 10, 0, TAU); ctx.fill(); ctx.globalAlpha = .8; L(4, -4, -22, 20); ctx.globalAlpha = .55; L(8, 2, -12, 24); ctx.globalAlpha = .4; L(0, -8, -26, 10); },
  vamp(L) { ctx.beginPath(); ctx.moveTo(0, -26); ctx.bezierCurveTo(26, 4, 20, 26, 0, 26); ctx.bezierCurveTo(-20, 26, -26, 4, 0, -26); ctx.fill(); ctx.fillStyle = 'rgba(20,0,40,.6)'; ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(-3, 18); ctx.lineTo(0, 6); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(3, 18); ctx.lineTo(6, 6); ctx.fill(); },
  glass(L, ring) { ctx.beginPath(); ctx.roundRect(-8, -26, 16, 40, 8); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 18, 11, 0, TAU); ctx.stroke(); L(-4, -10, 3, -2, -2, 6, 4, 14); ctx.globalAlpha = .6; L(-22, -20, -14, -12); L(22, -20, 14, -12); },
  gale(L) { ctx.beginPath(); ctx.arc(2, -8, 12, Math.PI * 1.1, Math.PI * 2.1); ctx.stroke(); L(-26, -8, 4, -8); ctx.beginPath(); ctx.arc(6, 8, 10, -Math.PI * .1, Math.PI * .9); ctx.stroke(); L(-24, 8, 6, 8); ctx.globalAlpha = .6; L(-20, 22, 12, 22); },
  rich(L, ring) { ctx.beginPath(); ctx.moveTo(0, 24); ctx.bezierCurveTo(-34, -2, -22, -26, 0, -10); ctx.bezierCurveTo(22, -26, 34, -2, 0, 24); ctx.fill(); ctx.fillStyle = '#ffcf6b'; ctx.beginPath(); ctx.arc(0, 2, 8, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '900 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('★', 0, 3); },
};
{
  const ui = Visual2.upIcon;
  Visual2.upIcon = function (id, x, y, s, c, f) {
    const k = typeof id === 'string' && id.startsWith('rel_') ? REL_ICON[id.slice(4)] : null; if (!k) return ui.call(this, id, x, y, s, c, f);
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 30, s / 30); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 54, c, .6 + (f ? .2 : 0)); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const L = (...a) => { ctx.beginPath(); for (let i = 0; i < a.length; i += 2) i ? ctx.lineTo(a[i], a[i + 1]) : ctx.moveTo(a[i], a[i + 1]); ctx.stroke(); }, ring = r => { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); };
    try { k(L, ring); } catch (e) { } ctx.restore();
  };
  for (const r of RELICS) if (REL_ICON[r.id]) r.icon = 'rel_' + r.id;
}

// ---------- icones de arma: anel e brilho na cor da arma ----------
{
  const wg = Screens.weaponGlyph;
  Screens.weaponGlyph = function (id, x, y, c, t) {
    const col = c && c.length === 7 ? c : '#b98cff';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y, 46, col, .35 + Math.sin((t || 0) * 3) * .05); ctx.restore();
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = .55; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 30, 0, TAU); ctx.stroke(); ctx.restore();
    return wg.call(this, id, x, y, c, t);
  };
}

// ---------- ranking diario local: historico dos melhores resultados + codigo para compartilhar ----------
const Visual38 = {}; Visual38.code = function (score, day) { const h = (Math.imul(score * 2654435761 >>> 0 ^ day.split('').reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7), 2246822519) >>> 0).toString(36).toUpperCase().slice(0, 4); return 'OLI-' + day.replace(/-/g, '') + '-' + score + '-' + h; };
Visual38.valid = function (code) { const m = /^OLI-(\d{8})-(\d+)-([A-Z0-9]{4})$/.exec((code || '').trim().toUpperCase()); if (!m) return null; const day = m[1].slice(0, 4) + '-' + m[1].slice(4, 6) + '-' + m[1].slice(6), sc = +m[2]; return Visual38.code(sc, day) === m[0] ? { day, score: sc } : null; };
{
  const ad = Game.addDaily;
  Game.addDaily = function () { ad.call(this); const d = Save.data, k = Extras.dayKey(); d.dailyHist = d.dailyHist || []; const e = d.dailyHist.find(x => x.date === k); if (e) e.score = Math.max(e.score, G.score); else d.dailyHist.push({ date: k, score: G.score }); d.dailyHist = d.dailyHist.slice(-60); Save.save(); };
}
Screens.dailyrank = function () {
  const d = Save.data, hist = (d.dailyHist || []).slice().reverse(), fr = d.friends = d.friends || [], today = Extras.dayKey(), tb = Extras.dailyBest();
  txt('RANKING DO DESAFIO DO DIA', W / 2, 20, 40, '#fff', 'center'); txt('Compare resultados com amigos usando um código. Ele só vale para a pontuação e o dia.', W / 2, 74, 16, '#ffb340', 'center', 800);
  UI.panel(70, 110, 540, 450, { r: 22 }); txt('SEUS DIAS', 96, 122, 18, '#ffb340', 'left', 900);
  if (!hist.length) txt('Jogue o Desafio do Dia para aparecer aqui.', 340, 300, 18, '#8a7fb0', 'center', 700);
  hist.slice(0, 10).forEach((h, i) => { const y = 156 + i * 38; ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.09)'; ctx.fillRect(90, y - 2, 500, 34); txt(h.date.split('-').reverse().join('/'), 106, y + 4, 18, h.date === today ? '#ffe9a8' : '#cdb8ff', 'left', 800); txt(h.score + ' pts', 570, y + 4, 20, '#fff', 'right', 800); });
  UI.panel(660, 110, 550, 450, { r: 22 }); txt('AMIGOS', 686, 122, 18, '#ffb340', 'left', 900);
  const all = [{ name: 'VOCÊ', score: tb, day: today, me: true }, ...fr.map(f => ({ name: f.name, score: f.score, day: f.day }))].filter(x => x.day === today).sort((a, b) => b.score - a.score);
  txt('Hoje, ' + today.split('-').reverse().join('/'), 1184, 124, 14, '#8a7fb0', 'right', 700);
  if (all.length <= 1) txt('Cole o código de um amigo para comparar o dia.', 935, 300, 17, '#8a7fb0', 'center', 700);
  all.slice(0, 8).forEach((f, i) => { const y = 156 + i * 40; ctx.fillStyle = f.me ? 'rgba(90,50,190,.55)' : i % 2 ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.09)'; ctx.fillRect(680, y - 2, 510, 36); txt((i + 1) + '. ' + f.name, 696, y + 5, 18, f.me ? '#ffe9a8' : '#e2d4ff', 'left', 800); txt(f.score + ' pts', 1170, y + 4, 20, '#fff', 'right', 800); });
  if (UI.button('copy', 70, 580, 300, 44, 'COPIAR MEU CÓDIGO', { size: 16, color: tb ? '#9a63ff' : undefined, disabled: !tb })) { try { navigator.clipboard.writeText(Visual38.code(tb, today)); Visual7.msg = 'CÓDIGO COPIADO'; Visual7.shotT = 2; } catch (e) { prompt('Copie o seu código:', Visual38.code(tb, today)); } }
  if (UI.button('paste', 390, 580, 300, 44, 'COLAR CÓDIGO DE AMIGO', { size: 16 })) { const c = prompt('Cole o código do seu amigo:'); const v = Visual38.valid(c); if (!c) { } else if (!v) { Visual7.msg = 'CÓDIGO INVÁLIDO'; Visual7.shotT = 2; } else { const nm = (prompt('Nome do amigo:', 'Amigo') || 'Amigo').slice(0, 12); fr.push({ name: nm, score: v.score, day: v.day }); d.friends = fr.slice(-40); Save.save(); } }
  if (fr.length && UI.button('clr', 710, 580, 200, 44, 'LIMPAR AMIGOS', { size: 14 })) { d.friends = []; Save.save(); }
  if (UI.button('back', W / 2 - 160, 640, 320, 46, 'VOLTAR', { size: 20 }) || Input.pressed('escape')) { Snd.play('uiBack'); G.state = 'modes'; }
  Screens.thinFrame();
};
