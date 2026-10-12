'use strict';
// ---------- videos de entrada dos chefes (um por fase): gerados com a arte do jogo e tocados na primeira vez que o chefe aparece ----------
Visual18.bossIds = STAGES.map((s, i) => 'v_b' + i);
const bossGhost = {};
STAGES.forEach((st, i) => {
  Cine.clips['v_b' + i] = {
    dur: 5, pal: () => st.pal,
    f(t) {
      const c = st.tint && st.tint[0] === '#' ? st.tint : '#ffb340', cx = W / 2, cy = H * .40;
      try { World.draw(0); } catch (e) { ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, W, H); }
      ctx.save(); ctx.fillStyle = 'rgba(4,0,16,.55)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      // raios de luz atras do chefe
      ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = 'lighter'; const k = clamp((t - .4) / 1.6, 0, 1);
      for (let r = 0; r < 14; r++) { const a = r / 14 * TAU + t * .15; ctx.save(); ctx.rotate(a); const g = ctx.createLinearGradient(0, 0, 0, -760); g.addColorStop(0, c + '66'); g.addColorStop(1, c + '00'); ctx.fillStyle = g; ctx.globalAlpha = .35 * k; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.lineTo(60, -760); ctx.lineTo(-60, -760); ctx.fill(); ctx.restore(); }
      drawGlow(0, 0, 420 * k, c, .35 * k); ctx.restore();
      // o chefe cresce e treme no impacto
      let g = bossGhost[i]; if (!g) { try { g = bossGhost[i] = new BOSS_CLASSES[st.boss](); } catch (e) { g = null; } }
      if (g) {
        g.t = t; g.x = cx; g.y = cy; if (g.hist) g.hist.length = 0; g.phase = 0; g.flash = 0; g.state = 'fight'; g.dive = null; g.clones = g.clones || []; G.player = G.player || { x: W / 2, y: H };
        const sc0 = clamp(230 / (g.rad || 110), .6, 1.7), grow = .45 + .55 * eio(clamp(t / 3.2, 0, 1)), imp = t > 1.1 && t < 1.5 ? (1.5 - t) * 26 : 0;
        ctx.save(); ctx.translate(cx + rand(-1, 1) * imp, cy + Math.sin(t * 1.3) * 6 + rand(-1, 1) * imp); const s = sc0 * grow * (1 + clamp((t - 1.1) * 4, 0, 1) * (t < 1.4 ? .08 : 0)); ctx.scale(s, s); ctx.translate(-cx, -cy); ctx.globalAlpha = clamp(t / .8, 0, 1);
        if (i === 7) { g.t = .2 + t * .5; ctx.translate(cx - 790, cy - 215); } 
        if (i === 8) { ctx.translate(cx, cy); ctx.scale(1.55, -1.55); ctx.filter = 'hue-rotate(250deg) brightness(.7) saturate(1.3)'; ctx.globalAlpha *= .85; try { Art.ship(0, 0, { pal: SKIN_DEFAULT, t, scale: 1, vx: 0, lookx: 0, looky: 0, blinkT: 0, inv: 0, mood: 'angry' }); } catch (e) { } ctx.filter = 'none'; }
        else { try { g.draw(); } catch (e) { } }
        ctx.restore();
      }
      if (t > 1.05 && t < 1.5) { ctx.save(); ctx.globalAlpha = (1.5 - t) / .45 * .6; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      // vinheta e letreiro
      ctx.save(); const vg = ctx.createRadialGradient(cx, H / 2, 260, cx, H / 2, 900); vg.addColorStop(0, 'rgba(4,0,16,0)'); vg.addColorStop(1, 'rgba(4,0,16,.8)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore();
      const ta = clamp((t - 1.7) / .6, 0, 1) * clamp((4.6 - t) / .4, 0, 1);
      if (ta > 0) { ctx.save(); ctx.globalAlpha = ta; ctx.translate(0, (1 - ta) * 20); txt('CHEFE', cx, H - 215, 22, c, 'center', 900); ctx.shadowColor = c; ctx.shadowBlur = 24; txt(st.bossName.toUpperCase(), cx, H - 183, 54, '#ffffff', 'center', 900); ctx.shadowBlur = 0; const ep = typeof EPITHET !== 'undefined' ? EPITHET[st.bossName] : null; if (ep) txt(ep, cx, H - 118, 24, '#e2d4ff', 'center', 700); ctx.restore(); }
      Cine.fade(clamp((t - 4.5) / .5, 0, 1)); Cine.fade(1 - clamp(t / .5, 0, 1));
    },
  };
});
{
  const mb = Game.maybeStory;
  Game.maybeStory = function (key, pages, done, opts) {
    const m = /^pre(\d+)$/.exec(key);
    if (m && pages && pages.length && !this.noStory && Save.data.settings.cine !== false && !(Save.data.seen && Save.data.seen[key])) pages = [{ video: 'v_b' + m[1] }, ...pages];
    return mb.call(this, key, pages, done, opts);
  };
  const ss = Game.startStage; Game.startStage = function (i, o) { try { Visual18.get('v_b' + i); } catch (e) { } return ss.call(this, i, o); };
}
STAGES.forEach((st, i) => Visual20.CLIPS.push(['v_b' + i, st.bossName, 'Chefe da fase ' + (i + 1)]));
