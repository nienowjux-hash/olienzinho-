'use strict';
// ---------- cine5: tres cenas novas em video (Mestra Lumi se apagando, chegada do Vazio, primeiro guardiao libertado) ----------
{
  const clamp5 = (x, a, b) => Math.max(a, Math.min(b, x));
  Cine.clips.v_lumi = {
    dur: 12, pal: () => STAGES[5].pal,
    f(t) {
      const S = Cine.S5 || (Cine.S5 = { t: 0 }); S.t = t; try { World.draw(t * 20); } catch (e) { }
      ctx.save(); Screens.sceneLumiFade(S, { fade: [0, 1] }, t); ctx.restore();
      Cine.cap('A Mestra Lumi deu toda a sua luz.', t, .6, 4.2); Cine.cap('Ela não se foi. Ela passou para o Olienzinho.', t, 4.6, 8.8); Cine.cap('Agora a luz dele leva o nome dela.', t, 9, 11.4);
      Cine.fade(clamp5((t - 11.2) / .8, 0, 1)); Cine.fade(1 - clamp5(t / .6, 0, 1));
    },
  };
  Cine.clips.v_arrive = {
    dur: 10, pal: () => STAGES[5].pal,
    f(t) {
      G.stageIdx = 5; G.stage = STAGES[5]; const S = Cine.S5b || (Cine.S5b = { t: 0 }); S.t = t; try { World.draw(t * 20); } catch (e) { }
      ctx.save(); Screens.sceneVoidArrive(S, t); ctx.restore();
      Cine.cap('Primeiro veio o frio.', t, .5, 3.2); Cine.cap('Depois, o silêncio de todas as estrelas.', t, 3.4, 6.4); Cine.cap('E então, o Vazio olhou de volta.', t, 6.6, 9.2);
      Cine.fade(clamp5((t - 9.3) / .7, 0, 1)); Cine.fade(1 - clamp5(t / .6, 0, 1));
    },
  };
  Cine.clips.v_freed = {
    dur: 10, pal: () => STAGES[0].pal,
    f(t) {
      G.stageIdx = 0; G.stage = STAGES[0]; const S = Cine.S5c || (Cine.S5c = { t: 0 }); S.t = t; try { World.draw(t * 20); } catch (e) { }
      ctx.save(); Screens.sceneFreed(S, t, false); ctx.restore();
      Cine.cap('A casca de escuridão rachou.', t, .5, 3.2); Cine.cap('Por baixo dela, ainda havia uma luz.', t, 3.4, 6.4); Cine.cap('O primeiro guardião estava livre.', t, 6.6, 9.2);
      Cine.fade(clamp5((t - 9.3) / .7, 0, 1)); Cine.fade(1 - clamp5(t / .6, 0, 1));
    },
  };
  // encaixa os videos antes das cenas correspondentes
  const seen = new Set(); let freedDone = false;
  const walk = o => {
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    if (Array.isArray(o)) {
      for (const [sc, id, once] of [['lumiFade', 'v_lumi'], ['voidArrive', 'v_arrive'], ['freed', 'v_freed', true]]) {
        const ix = o.findIndex(p => p && p.scene === sc); if (ix < 0 || (o[ix - 1] && o[ix - 1].video) || (once && freedDone)) continue; if (once) freedDone = true; o.splice(ix, 0, { video: id });
      }
      o.forEach(walk); return;
    }
    Object.values(o).forEach(walk);
  };
  walk(STORY);
  Visual20.CLIPS.push(['v_lumi', 'A Luz da Mestra', 'Despedida de Lumi'], ['v_arrive', 'O Vazio Olha de Volta', 'Chegada do Vazio'], ['v_freed', 'A Casca Rachou', 'Primeiro guardião livre']);
  Visual18.ids.push('v_lumi', 'v_arrive', 'v_freed');
}
