'use strict';
// ---------- jogador-robo para testar o equilibrio (ferramenta de desenvolvimento; so roda se chamado no console) ----------
const Bot = { out: [], busy: false };
const rr = (a, b) => a + Math.random() * (b - a);

Bot.think = function (p, skill) {
  let best = null, bestS = -1e9;
  const bs = G.eb.filter(b => !b.dead), en = G.enemies.filter(e => !e.dead && e.type !== 'dummy'), boss = G.boss, hz = G.hazards;
  const tgtX = (() => { if (boss && boss.state === 'fight') { const w = Visual5.weak(boss); return w.x; } let q = null, qd = 1e9; for (const e of en) if (e.y < p.y - 40 && e.y > 20) { const d = Math.abs(e.x - p.x) + (p.y - e.y) * .3; if (d < qd) { qd = d; q = e; } } return q ? q.x : p.x; })();
  const pk = G.pickups.filter(k => !k.dead && (k.type === 'heart' || k.type === 'cap' || k.type === 'coin') && k.y > 100);
  const sp = G.sp, chaseOn = !!(sp && sp.on && sp.type === 'chase' && sp.top !== undefined);
  for (let cx = 50; cx <= W - 50; cx += 70) for (let cy = (chaseOn ? 130 : H - 250); cy <= H - 70; cy += 60) {
    let danger = 0; if (chaseOn && cy > sp.top - 60) danger += 900;
    for (const b of bs) { for (const t of [.12, .25, .4]) { const x = b.x + b.vx * t, y = b.y + b.vy * t, d = Math.hypot(x - cx, y - cy), lim = b.r + 30; if (d < lim) danger += (lim - d) * 4; } }
    for (const e of en) { const d = Math.hypot(e.x - cx, e.y - cy), lim = e.rad + 46; if (d < lim) danger += (lim - d) * 6; if (e.type === 'kami' && e.mode === 'lock') danger += Math.max(0, 140 - d) * 2; }
    for (const h of hz) { if (h.t > h.warn + h.dur) continue; let inside; if (h.rot) { const dx = cx - h.cx, dy = cy - h.cy, ca = Math.cos(-h.rot), sa = Math.sin(-h.rot), lx = dx * ca - dy * sa, ly = dx * sa + dy * ca; inside = Math.abs(lx) < h.w / 2 + 30 && Math.abs(ly) < h.h / 2 + 30; } else inside = Math.abs(cx - h.cx) < h.w / 2 + 30 && Math.abs(cy - h.cy) < h.h / 2 + 30; if (inside) danger += 600; }
    if (boss && boss.state === 'fight' && boss.hitTest(cx, cy, 36)) danger += 500;
    let s = -danger * (1 + (1 - skill) * rr(-.5, .8)) - Math.abs(cx - tgtX) * .18 - Math.abs(cx - p.x) * .03 - Math.abs(cy - p.y) * .02 - (H - cy) * .05;
    for (const k of pk) { const d = Math.hypot(k.x - cx, k.y - cy); if (d < 160) s += (k.type === 'heart' && p.hp < p.maxHp ? 90 : k.type === 'cap' ? 40 : 10) * (1 - d / 160); }
    if (s > bestS) { bestS = s; best = [cx, cy]; }
  }
  return best;
};

Bot.runStage = function (cfg) {
  const idx = cfg.stage, saved = JSON.stringify(Save.data), res = { stage: idx, diff: cfg.diff, weapon: cfg.weapon, skill: cfg.skill, cleared: false, died: false, t: 0, bossReached: false, bossT: 0, hits: 0, level: 1, sp: 0 };
  try {
    Save.data.settings.diff = cfg.diff; Save.data.owned.weapons = { violet: 1, fan: 1, laser: 1, cannon: 1, boomerang: 1, chain: 1, flame: 1 }; Save.data.owned.weapons[cfg.weapon] = 1; Save.data.loadout.weapon = cfg.weapon; Save.data.loadout.sec = cfg.sec || 'none'; Save.data.loadout.char = 'olien'; Save.data.loadout.style = cfg.style || 0; Save.data.coop = false;
    Save.data.shop = Object.assign({}, cfg.shop || {}); Save.data.wlevel = cfg.wlevel || {};
    Game.noStory = true; Game.startStage(idx, { skipStory: true }); G.state = 'play'; Events.banner = null;
    let plan = [G.player.x, G.player.y], frames = 0, bossStart = null, hitsLog = {};
    const p = G.player, DT = 1 / 60, maxF = 60 * 330;
    while (frames < maxF) {
      frames++; Input.hit = {}; Input.keys = {};
      if (G.state === 'levelup') { Game.chooseUpgrade((Math.random() * G.options.length) | 0); if (G.state === 'levelup') G.state = 'play'; continue; }
      if (G.state === 'celebrate') { res.cleared = true; break; }
      if (G.state === 'over') { res.died = true; break; }
      if (G.state !== 'play') { G.state = 'play'; }
      if (G.cut) Input.hit.enter = true;
      if (G.furyCut) G.furyCut.wait = 9;
      const pl = G.player;
      if (!pl.dead && !G.cut && !G.furyCut) {
        if (frames % Math.max(2, Math.round(3 / Math.max(.2, cfg.skill))) === 0) plan = Bot.think(pl, cfg.skill);
        const dx = plan[0] - pl.x, dy = plan[1] - pl.y;
        if (dx < -8) Input.keys.a = true; if (dx > 8) Input.keys.d = true; if (dy < -8) Input.keys.w = true; if (dy > 8) Input.keys.s = true;
        // esquiva, especial e pulso
        let near = 0, closest = 1e9; for (const b of G.eb) { const d = Math.hypot(b.x - pl.x, b.y - pl.y); if (d < 90) near++; if (d < closest) closest = d; }
        if (closest < 34 && pl.dashCd <= 0 && cfg.skill > .35 && Math.random() < cfg.skill) Input.hit.shift = true;
        if (pl.specCd <= 0 && ((G.boss && G.boss.state === 'fight') || G.enemies.length >= 5) && Math.random() < .08 * cfg.skill + .02) { Input.hit.q = true; res.sp++; }
        if (near >= 5 && pl.pulseT <= 0) Input.hit[' '] = true;
        if ((pl.secCd || 0) <= 0 && (G.enemies.length >= 3 || (G.boss && G.boss.state === 'fight')) && Math.random() < .05) Input.hit.r = true;
      }
      Game.update(DT);
      Input.hit = {};
      if (G.boss && !bossStart) { bossStart = G.t; res.bossReached = true; }
      if (res.bossReached && bossStart !== null) res.bossT = Math.max(res.bossT, G.t - bossStart);
    }
    res.t = G.t; res.hits = G.stats ? G.stats.hits : 0; res.level = G.level; res.hp = G.player ? G.player.hp : 0;
    const log = G.hitLog || {}; res.top = Object.keys(log).sort((a, b) => log[b].n - log[a].n).slice(0, 2).map(k => k + ' x' + log[k].n).join(' | ');
    if (!res.cleared && !res.died) res.timeout = true;
  } catch (e) { res.err = e.message + ' @ ' + (e.stack || '').split('\n')[1]; }
  { const d = Save.data; for (const k of Object.keys(d)) delete d[k]; Object.assign(d, JSON.parse(saved)); } Input.keys = {}; Input.hit = {};
  return res;
};

Bot.batch = function (cfgs, done) {
  Bot.out = []; Bot.busy = true; let i = 0;
  const step = () => { if (i >= cfgs.length) { Bot.busy = false; if (done) done(Bot.out); return; } Bot.out.push(Bot.runStage(cfgs[i++])); setTimeout(step, 0); };
  step();
};
Bot.summary = function (rows = Bot.out) {
  const g = {}; for (const r of rows) { const k = 's' + r.stage + ' d' + r.diff + ' sk' + r.skill; const o = g[k] = g[k] || { n: 0, clear: 0, died: 0, tmo: 0, err: 0, t: 0, bossT: 0, boss: 0, hits: 0, lv: 0 }; o.n++; if (r.cleared) o.clear++; if (r.died) o.died++; if (r.timeout) o.tmo++; if (r.err) o.err++; o.t += r.t; if (r.bossReached) { o.boss++; o.bossT += r.bossT; } o.hits += r.hits; o.lv += r.level; }
  return Object.keys(g).map(k => { const o = g[k]; return k + ': clear ' + o.clear + '/' + o.n + ' boss ' + o.boss + (o.boss ? ' (' + Math.round(o.bossT / o.boss) + 's)' : '') + ' hits ' + (o.hits / o.n).toFixed(1) + ' lv ' + (o.lv / o.n).toFixed(1) + (o.err ? ' ERR ' + o.err : '') + (o.tmo ? ' TMO ' + o.tmo : ''); });
};
