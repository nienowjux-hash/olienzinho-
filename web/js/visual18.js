'use strict';
// ---------- cutscenes em video dentro do jogo (arquivos em /video, gerados a partir da propria arte do jogo) ----------
const Visual18 = { vids: {}, ids: ['v_prologue', 'v_finale1', 'v_door', 'v_rift', 'v_end'] };
Visual18.get = function (id) {
  let v = Visual18.vids[id];
  if (!v) { v = document.createElement('video'); v.preload = 'auto'; v.muted = true; v.playsInline = true; v.onerror = () => { v.bad = true; }; v.src = 'video/' + id + '.mp4'; Visual18.vids[id] = v; }
  return v;
};
setTimeout(() => { try { for (const id of Visual18.ids) Visual18.get(id); } catch (e) { } }, 6000);
Visual18.next = function (S) { S.vOn = false; S.i++; S.t = 0; S.lastShown = 0; S.doneAt = null; S.fx = false; if (S.i >= S.pages.length) Game.endStory(); };
Visual18.page = function (S, pg) {
  const now = World.t, v = Visual18.get(pg.video);
  if (!S.vOn) {
    S.vOn = true; S.vt = 0; S.vCue = 0; S.vLast = now;
    if (Save.data.settings.cine === false || v.bad) { Visual18.next(S); return; }
    try { v.currentTime = 0; } catch (e) { }
    const pr = v.play(); if (pr && pr.catch) pr.catch(() => { v.bad = true; });
  }
  const dt = Math.min(.05, now - S.vLast); S.vLast = now; S.vt += dt;
  if (v.bad || (v.readyState < 2 && S.vt > 7)) { Visual18.next(S); return; }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (v.readyState >= 2) ctx.drawImage(v, 0, 0, W, H); else txt('carregando...', W / 2, H / 2 - 10, 22, '#8a7fb0', 'center', 700);
  const cues = pg.cues || []; while (S.vCue < cues.length && v.currentTime >= cues[S.vCue][0]) { Snd.musicPlay(cues[S.vCue][1], 1.5); S.vCue++; }
  txt('ENTER: pular vídeo   •   ESC: pular cena', W - 24, H - 34, 15, 'rgba(205,184,255,.55)', 'right', 700);
  const adv = Input.pressed(' ') || Input.pressed('enter') || Input.mouse.click;
  if (Input.pressed('escape')) { v.pause(); S.vOn = false; Snd.play('uiBack'); Game.endStory(); return; }
  if (v.ended || (adv && S.vt > .6)) { v.pause(); Visual18.next(S); }
};
{
  const st0 = Screens.story;
  Screens.story = function () {
    const S = G.story; if (!S) return st0.call(this);
    const pg = this.curPage(S);
    if (pg && pg.video) { Visual18.page(S, pg); return; }
    return st0.call(this);
  };
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () { const S = G.story, pg = S && this.curPage(S); if (pg && pg.video) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; } return sb.call(this); };
}

// ---------- onde os videos entram na historia ----------
{
  const P = STORY.prologue, ti = P.findIndex(p => p.title === 'ATO I');
  if (ti > 1) P.splice(1, ti - 1, { video: 'v_prologue', cues: [[4.2, 'hope'], [12.4, 'mystery']] });
  STORY.finale.splice(1, 0, { video: 'v_finale1' });
  STORY.stages[6].intro.splice(1, 0, { video: 'v_door' });
  STORY.stages[9].intro.splice(1, 0, { video: 'v_rift', cues: [[8.4, 'tension']] });
  const F = STORY.finale4, fi = F.findIndex(p => p.title === 'FIM'); if (fi > 0) F.splice(fi, 1, { video: 'v_end' });
}

// ---------- opcao para ligar/desligar os videos ----------
{
  const st = Screens.settings;
  Screens.settings = function () {
    st.call(this); const s = Save.data.settings;
    if (UI.button('cine', 920, 542, 134, 40, s.cine === false ? 'VÍDEOS: NÃO' : 'VÍDEOS: SIM', { size: 11, color: s.cine === false ? undefined : '#9a63ff' })) { s.cine = s.cine === false ? true : false; Save.save(); }
  };
}
