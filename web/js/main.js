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

const VIG = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 144; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 72, 38, 128, 72, 150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(2,0,12,.72)'); x.fillStyle = g; x.fillRect(0, 0, 256, 144); return c; })();
const GRAIN = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), d = x.createImageData(128, 128); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return ctx.createPattern(c, 'repeat'); })();
const FX_STATES = ['play', 'pause', 'levelup', 'clear', 'over', 'story'];
function postFx(s) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const gw = cv.width, gh = cv.height;
  if (FX_STATES.includes(s)) ctx.drawImage(VIG, 0, 0, gw, gh);
  const p = G.player;
  if (s === 'play' && p && !p.dead && p.hp <= Math.max(1, p.maxHp * .25)) { // vida baixa: bordas vermelhas pulsando
    const a = .1 + (.5 + .5 * Math.sin(World.t * 6)) * .14, g = ctx.createRadialGradient(gw / 2, gh / 2, gh * .35, gw / 2, gh / 2, gh * .9);
    g.addColorStop(0, 'rgba(255,40,70,0)'); g.addColorStop(1, 'rgba(255,40,70,' + a + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, gw, gh);
  }
  if (FX_STATES.includes(s)) { ctx.save(); ctx.globalAlpha = .05; ctx.globalCompositeOperation = 'overlay'; ctx.translate(Math.random() * 128 | 0, Math.random() * 128 | 0); ctx.fillStyle = GRAIN; ctx.fillRect(-128, -128, gw + 256, gh + 256); ctx.restore(); }
  if ((G.glitchT || 0) > 0 && s === 'play') { // falha de imagem (Eco)
    G.glitchT -= 1 / 60; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { ctx.globalAlpha = .12 + Math.random() * .16; ctx.fillStyle = Math.random() < .5 ? '#ff2a6a' : '#2ad4ff'; ctx.fillRect(Math.random() * 40, Math.random() * gh, gw, 2 + Math.random() * 14); }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function render() {
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const s = G.state;
  if (s === 'play' || s === 'pause' || s === 'levelup' || s === 'clear' || s === 'over') Game.drawPlay(); else if (s === 'story') Screens.storyBackdrop(); else if (s === 'title') Screens.titleBackdrop(); else World.draw(0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (Screens[s]) Screens[s]();
  Ach.draw();
  cv.style.cursor = s === 'play' ? 'none' : 'default';

  // bloom: realca so o que e claro
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.clearRect(0, 0, bloom.width, bloom.height);
  bctx.filter = 'contrast(2) brightness(1) blur(6px)';
  bctx.drawImage(cv, 0, 0, bloom.width, bloom.height); bctx.filter = 'none';
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .28;
  ctx.drawImage(bloom, 0, 0, cv.width, cv.height);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  postFx(s);
  if (Trans.t < .55) { // transicao cinematografica: faixas que se abrem do centro
    ctx.setTransform(K, 0, 0, K, 0, 0); const k = easeOut(Trans.t / .55), h = H / 2 * (1 - k);
    ctx.globalAlpha = 1; ctx.fillStyle = '#03010b'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h);
    ctx.fillStyle = 'rgba(255,179,64,' + (1 - k) + ')'; ctx.fillRect(0, h - 2, W, 2); ctx.fillRect(0, H - h, W, 2);
    ctx.globalAlpha = (1 - k) * .5; ctx.fillStyle = '#0b0422'; ctx.fillRect(0, h, W, H - 2 * h); ctx.globalAlpha = 1;
  }
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
    if (window.__err > 3) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#300'; ctx.fillRect(0, 0, 900, 60); ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.fillText('Erro: ' + e.message, 10, 30); }
  }
  Input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
