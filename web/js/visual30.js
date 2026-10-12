'use strict';
// ---------- polimento 30: legendas e tremor ajustaveis, filtros e molduras do modo foto, transicoes suaves, cartas de entrada dos chefes,
// fundos com mais camadas, ambiente sonoro por setor e tutorial atualizado ----------
const Visual30 = { pf: 0, pframe: 0, psticker: 0 };

// ---------- ajustes: tamanho das legendas e intensidade do tremor ----------
const SUBS = [1, 1.15, 1.3], SHK = [0, .5, 1, 1.5];
{
  const fit = Screens.fit; Screens.fit = function (text, maxW, availH, sizes) { const f = SUBS[Save.data.settings.subs || 0] || 1; return fit.call(this, text, maxW, availH, f === 1 ? sizes : sizes.map(s => Math.round(s * f))); };
  const sh = shake; shake = function (a) { const k = SHK[Save.data.settings.shk ?? 2]; return sh(a * k); };
  const ac = Screens.access;
  Screens.access = function () {
    ac.call(this); const s = Save.data.settings;
    if (UI.button('subs', 500, 530, 230, 40, 'LEGENDAS: ' + Math.round(SUBS[s.subs || 0] * 100) + '%', { size: 15, color: (s.subs || 0) ? '#9a63ff' : undefined })) { s.subs = ((s.subs || 0) + 1) % SUBS.length; Save.save(); }
    if (UI.button('shk', 740, 530, 230, 40, 'TREMOR DA TELA: ' + Math.round(SHK[s.shk ?? 2] * 100) + '%', { size: 15, color: (s.shk ?? 2) !== 2 ? '#9a63ff' : undefined })) { s.shk = ((s.shk ?? 2) + 1) % SHK.length; Save.save(); }
  };
}

// ---------- modo foto: F7 troca o filtro, F6 troca a moldura, F5 troca o selo ----------
const PF = [['NORMAL', ''], ['QUENTE', 'sepia(.35) saturate(1.35) hue-rotate(-12deg)'], ['FRIO', 'saturate(1.2) hue-rotate(28deg) brightness(1.05)'], ['PRETO E BRANCO', 'grayscale(1) contrast(1.15)'], ['SONHO', 'saturate(1.5) brightness(1.1) contrast(.95) blur(.6px)']];
const PFR = ['PADRÃO', 'CINEMA', 'POLAROID', 'NEON'], PST = ['SEM SELO', 'OLIENZINHO', 'CHEFE DERROTADO!', 'NOVO RECORDE!'];
Visual30.applyFilters = function () { const n = (Save.data.settings && Save.data.settings.cb) || 0; cv.style.filter = ((n ? 'url(#cb' + n + ') contrast(1.12) saturate(1.15) ' : '') + PF[Visual30.pf][1]).trim(); };
Visual25.applyCB = Visual30.applyFilters;
addEventListener('keydown', e => {
  const m = { F7: () => { Visual30.pf = (Visual30.pf + 1) % PF.length; Visual30.applyFilters(); return 'FILTRO: ' + PF[Visual30.pf][0]; }, F6: () => { Visual30.pframe = (Visual30.pframe + 1) % PFR.length; return 'MOLDURA DA FOTO: ' + PFR[Visual30.pframe]; }, F5: () => { Visual30.psticker = (Visual30.psticker + 1) % PST.length; return 'SELO: ' + PST[Visual30.psticker]; } }[e.key];
  if (m) { e.preventDefault(); Visual7.msg = m(); Visual7.shotT = 2.2; }
});
Visual7.capture = function () {
  if (!Visual7.shotWant) return; Visual7.shotWant = false;
  try {
    const w = cv.width, h = cv.height, fr = Visual30.pframe, bar = Math.round(h * .045), pad = fr === 2 ? Math.round(h * .035) : 0, bot = fr === 2 ? Math.round(h * .14) : fr === 1 ? 0 : bar;
    const o = document.createElement('canvas'); o.width = w + pad * 2; o.height = h + pad + bot + (fr === 1 ? Math.round(h * .1) : 0); const c = o.getContext('2d'), oy = fr === 1 ? Math.round(h * .05) : pad;
    c.fillStyle = fr === 2 ? '#f6f1e6' : '#03010b'; c.fillRect(0, 0, o.width, o.height);
    c.save(); c.filter = PF[Visual30.pf][1] || 'none'; c.drawImage(cv, pad, oy); c.restore();
    const px = pad, py = oy;
    if (fr === 0) { c.strokeStyle = '#d9a84a'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, o.width - 3, h - 3); c.fillStyle = '#ffb340'; c.font = `900 ${Math.round(bar * .5)}px ${FONT}`; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText('OLIENZINHO  •  GUARDIÃO DAS ESTRELAS', 20, h + bar / 2); c.fillStyle = '#8f84c4'; c.textAlign = 'right'; c.fillText('olien.digital', o.width - 20, h + bar / 2); }
    else if (fr === 1) { c.fillStyle = '#ffe9a8'; c.font = `900 ${Math.round(h * .03)}px ${FONT}`; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText('OLIENZINHO — GUARDIÃO DAS ESTRELAS', o.width / 2, o.height - Math.round(h * .05)); }
    else if (fr === 2) { c.fillStyle = '#3a2a5a'; c.font = `italic 800 ${Math.round(h * .045)}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Olienzinho, ' + new Date().toLocaleDateString('pt-BR'), o.width / 2, o.height - bot / 2); }
    else { c.strokeStyle = '#33e0ff'; c.shadowColor = '#33e0ff'; c.shadowBlur = 24; c.lineWidth = 8; c.strokeRect(10, 10, o.width - 20, h - 20); c.strokeStyle = '#ff4ad0'; c.shadowColor = '#ff4ad0'; c.lineWidth = 3; c.strokeRect(24, 24, o.width - 48, h - 48); c.shadowBlur = 0; c.fillStyle = '#8f84c4'; c.font = `900 ${Math.round(bar * .5)}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('olien.digital', o.width / 2, h + bar / 2); }
    if (Visual30.psticker) { c.save(); c.translate(px + w * .8, py + h * .14); c.rotate(-.14); const s = Math.round(h * .06); c.font = `900 ${s}px ${FONT}`; const tw = c.measureText(PST[Visual30.psticker]).width; c.fillStyle = 'rgba(255,200,60,.95)'; c.strokeStyle = '#7a2a0a'; c.lineWidth = 5; c.beginPath(); c.roundRect(-tw / 2 - 20, -s * .7, tw + 40, s * 1.4, 14); c.fill(); c.stroke(); c.fillStyle = '#5a1a08'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(PST[Visual30.psticker], 0, 2); c.restore(); }
    const d = new Date(), z = n => String(n).padStart(2, '0'), name = 'olienzinho_' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '_' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()) + '.png';
    const a = document.createElement('a'); a.download = name; a.href = o.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
    Visual7.shotT = 2.4; Visual7.msg = 'FOTO SALVA: ' + name; Snd.play('stamp');
  } catch (err) { Visual7.shotT = 2; Visual7.msg = 'NÃO FOI POSSÍVEL SALVAR A FOTO'; }
};

// ---------- transicoes suaves entre telas ----------
{
  const tick = () => { try { if (typeof Trans !== 'undefined' && QL() >= 1) { const k = clamp(Trans.t / .5, 0, 1), b = (1 - k) * (1 - k) * 5; cv.style.transform = k < 1 ? 'translateY(' + ((1 - k) * 12).toFixed(1) + 'px)' : ''; const base = Visual30.base(); cv.style.filter = (base + (b > .15 ? ' blur(' + b.toFixed(1) + 'px)' : '')).trim() || ''; } } catch (e) { } requestAnimationFrame(tick); };
  Visual30.base = () => { const n = (Save.data.settings && Save.data.settings.cb) || 0; return ((n ? 'url(#cb' + n + ') contrast(1.12) saturate(1.15) ' : '') + PF[Visual30.pf][1]).trim(); };
  requestAnimationFrame(tick);
}

// ---------- cartas de entrada dos chefes ----------
{
  const dc = Game.drawCinematic, cache = {};
  Game.drawCinematic = function () {
    dc.call(this); const b = G.boss; if (!b || b.state !== 'intro') return; const it = b.introT || 0; if (it < .5 || it > 2.9) return;
    const a = clamp((it - .5) / .5, 0, 1) * clamp((2.9 - it) / .4, 0, 1), C = b.constructor; let ghost = cache[C.name]; if (!ghost) { try { ghost = cache[C.name] = new C(); } catch (e) { return; } }
    ghost.t = World.t; ghost.x = 0; ghost.y = 0; ghost.phase = 0; ghost.flash = 0; ghost.state = 'fight'; ghost.dive = null; ghost.clones = ghost.clones || []; G.player = G.player || { x: W / 2, y: H };
    const cx = W - 250, cy = 330, sc = clamp(150 / (ghost.rad || 110), .5, 1.1), c = b.col && b.col[0] === '#' ? b.col : '#ffb340';
    ctx.save(); ctx.globalAlpha = a; ctx.translate(cx + (1 - a) * 90, cy); ctx.rotate(-.06);
    ctx.fillStyle = 'rgba(8,2,26,.82)'; ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.shadowColor = c; ctx.shadowBlur = 30; ctx.beginPath(); ctx.roundRect(-200, -190, 400, 380, 26); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.save(); ctx.beginPath(); ctx.roundRect(-196, -186, 392, 372, 22); ctx.clip(); const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 260); g.addColorStop(0, c + '55'); g.addColorStop(1, 'rgba(8,2,26,0)'); ctx.fillStyle = g; ctx.fillRect(-200, -190, 400, 380);
    ctx.scale(sc, sc); try { ghost.draw(); } catch (e) { } ctx.restore();
    ctx.fillStyle = c; ctx.fillRect(-180, 140, 360, 3); txt('FICHA DO CHEFE', 0, 150, 14, c, 'center', 900); ctx.restore();
  };
}

// ---------- fundos com mais camadas nas fases 1 a 6 ----------
{
  const bi = Visual.biome;
  Visual.biome = function () {
    bi.call(this); const st = G.stage ? G.stage.id : 0; if (st >= 6 || QL() < 1) return; const t = World.t, c = G.stage.tint && G.stage.tint[0] === '#' ? G.stage.tint : '#8b4dff';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let L = 0; L < 2; L++) for (let i = 0; i < 4; i++) { const sp = 6 + L * 10, x = ((hsh(i + L * 40 + 800) * W * 1.4 + t * sp) % (W * 1.4 + 500)) - 250, y = 80 + hsh(i + L * 40 + 820) * (H - 160), r = 150 + L * 90 + hsh(i + 830) * 80; ctx.globalAlpha = .06 + L * .03; drawGlow(x, y, r, c, 1); }
    const g = ctx.createLinearGradient(0, H * .7, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, H * .7, W, H * .3);
    ctx.restore();
  };
}

// ---------- ambiente sonoro por setor ----------
{
  const AMBK = ['espaco', 'poeira', 'tempestade', 'solar', 'cemiterio', 'vazio', 'luz', 'ondas', 'espelho', 'coracao'];
  const ss = Game.startStage; Game.startStage = function (i, o) { const r = ss.call(this, i, o); try { Snd.setAmbience(AMBK[i]); } catch (e) { } return r; };
  const gt = Game.goTitle; Game.goTitle = function () { try { Snd.setAmbience(null); } catch (e) { } return gt.call(this); };
  const gs = Game.goSelect; Game.goSelect = function () { try { Snd.setAmbience(null); } catch (e) { } return gs.call(this); };
}

// ---------- tutorial atualizado ----------
TUT.push({ keys: ['R'], text: 'Aperte R para a arma SECUNDÁRIA (escolha uma no Hangar). Ela tem recarga própria.', ok: () => (Save.data.loadout.sec || 'none') === 'none' || (G.player.secCd || 0) > 0 }, { keys: ['F'], text: 'Aperte F quando um tiro inimigo estiver bem perto: você REBATE o tiro contra o inimigo!', ok: () => (G.player.parryCd || 0) > 0 });
{
  const ts = Game.startStage; Game.startStage = function (i, o) { const r = ts.call(this, i, o); const s = (Save.data.seen = Save.data.seen || {}); if (s.tutorial && !s.news30 && !Game.noStory && i === 0) { s.news30 = true; Save.save(); Visual16.tip('news30', 'Novidades', 'F rebate tiros, R usa a secundária. Em Modos Extras: mutadores, talentos, cosméticos e perfis de save.'); } return r; };
}
