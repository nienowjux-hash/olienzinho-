'use strict';
// ---------- loop principal ----------
Save.load();
Snd.setVolumes(Save.data.settings.sfx, Save.data.settings.music);
G.sel = clamp(Save.data.unlocked - 1, 0, STAGES.length - 1);
Game.goTitle();

// atalhos de teste: ?stage=2&boss=1&rich=1
(function () {
  const q = new URLSearchParams(location.search);
  if (q.has('rich')) { Save.data.coins = 99999; Save.data.unlocked = STAGES.length; }
  if (q.has('stage')) {
    const i = clamp(parseInt(q.get('stage'), 10) || 0, 0, STAGES.length - 1);
    Save.data.unlocked = Math.max(Save.data.unlocked, i + 1);
    Game.noStory = !q.has('story');
    Game.startStage(i);
    if (q.has('boss')) G.t = G.stage.duration - 1;
    if (q.has('god')) { G.player.maxHp = 99; G.player.hp = 99; }
  }
})();

function render() {
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const s = G.state;
  if (s === 'play' || s === 'pause' || s === 'levelup' || s === 'clear' || s === 'over') Game.drawPlay(); else if (s === 'story') Screens.storyBackdrop(); else if (s === 'title') Screens.titleBackdrop(); else World.draw(0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (Screens[s]) Screens[s]();
  cv.style.cursor = s === 'play' ? 'none' : 'default';

  // bloom: realca so o que e claro
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.clearRect(0, 0, bloom.width, bloom.height);
  bctx.filter = 'contrast(2) brightness(1) blur(6px)';
  bctx.drawImage(cv, 0, 0, bloom.width, bloom.height); bctx.filter = 'none';
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .28;
  ctx.drawImage(bloom, 0, 0, cv.width, cv.height);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (Trans.t < .4) { ctx.setTransform(K, 0, 0, K, 0, 0); ctx.globalAlpha = 1 - easeOut(Trans.t / .4); ctx.fillStyle = '#0b0422'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'play') G.state = 'pause'; });

const Trans = { t: 9 };
let prevS = G.state;
const QUIET = ['play', 'pause', 'levelup'];
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
  try {
    G.pausedThisFrame = false;
    UI.begin();
    Game.update(dt);
    Trans.t += dt;
    if (G.state !== prevS) { if (!(QUIET.includes(prevS) && QUIET.includes(G.state))) { Trans.t = 0; UI.enter(); } prevS = G.state; }
    render();
    UI.end();
  } catch (e) {
    console.error(e);
    window.__err = (window.__err || 0) + 1;
    if (window.__err > 3) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#300'; ctx.fillRect(0, 0, 900, 60); ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.fillText('Erro: ' + e.message, 10, 30); return; }
  }
  Input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
