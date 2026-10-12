'use strict';
// ---------- cenas de conversa proprias dos chefes da Parte 3 (antes mostrava o rosto do Vazio no lugar deles) ----------
const BSCENE = { 6: 'bHerald', 7: 'bLeviathan', 8: 'bMirror', 9: 'bHeart' };
for (const i of [6, 7, 8, 9]) for (const p of STORY.stages[i].pre) if (p.scene === 'boss' || p.scene === 'void') p.scene = BSCENE[i];
{
  const cache = {};
  const inst = (k, C) => cache[k] || (cache[k] = new C());
  const sb = Screens.storyBackdrop;
  Screens.storyBackdrop = function () {
    sb.call(this); const S = G.story, pg = S && S.pages[S.i]; if (!S || !pg) return; const sc = pg.scene; if (!['bHerald', 'bLeviathan', 'bMirror', 'bHeart'].includes(sc)) return;
    const t = World.t, k = clamp(S.t / 1.2, 0, 1); G.player = G.player || { x: W / 2, y: H, dead: false };
    ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(4,0,16,' + (.5 * k) + ')'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = k;
    try {
      if (sc === 'bHerald') { const b = inst('h', Herald); b.t = t; b.x = 0; b.y = 0; b.phase = 1; b.flash = 0; ctx.translate(W / 2, 300); ctx.scale(1.7, 1.7); b.draw(); }
      else if (sc === 'bLeviathan') { const b = inst('l', Leviathan); b.t = t * .8; b.x = W / 2; b.y = 170; b.phase = 1; b.flash = 0; b.dive = null; ctx.translate(W / 2, 330); ctx.scale(1.35, 1.35); ctx.translate(-W / 2, -170); b.draw(); }
      else if (sc === 'bMirror') { const b = inst('m', Mirror); b.t = t; b.x = W / 2; b.y = 170; b.phase = 1; b.flash = 0; b.real = Math.floor(t / 3) % 2; ctx.translate(W / 2, 310); ctx.scale(1.35, 1.35); ctx.translate(-W / 2, -174); b.draw(); }
      else { const b = inst('c', Heart); b.t = t; b.x = 0; b.y = 0; b.phase = Math.floor(t / 2.5) % 3; b.col = ACT_COL[b.phase]; b.flash = 0; b.beatAt = Math.floor(t * 1.1) / 1.1; ctx.translate(W / 2, 300); ctx.scale(2.1, 2.1); b.draw(); }
    } catch (e) { }
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  };
}
