'use strict';
// ---------- fases: bioma, musica, ondas, eventos e chefe ----------
const PLANET_PALS = {
  violet: ['#e2d4ff', '#8b4dff', '#3d1290', true],
  pink: ['#ffd6e8', '#ff6fb0', '#7a1f55', false],
  teal: ['#d6f6ff', '#33c4ff', '#124a8a', true],
  orange: ['#fff0c9', '#ffb340', '#a2400a', false],
  red: ['#ffd0c0', '#ff5a3c', '#701008', false],
  sand: ['#fff3dc', '#d9a066', '#6b3b1e', true],
};

const STAGES = [
  {
    id: 0, name: 'Nebulosa Violeta', desc: 'Onde tudo começa. Zangões da Olien-Corp invadiram o setor.',
    music: 's1', duration: 80, boss: 'mother', bossName: 'Nave-Mãe Zangão', tint: '#8b4dff',
    pal: {
      top: '#2a1478', bot: '#0b0422', star: '#e8e0ff', dust: '#cdb8ff', shaft: '160,110,255', rock0: '#5a3fb0', rock1: '#170a3d', rim: 'rgba(190,160,255,.45)', rocks: 10,
      nebA: [[200, 150, 360, '#7a3dff', .22], [1050, 300, 420, '#4b2bd6', .24], [640, 560, 380, '#a76bff', .14], [100, 600, 300, '#3b82ff', .08]],
      nebB: [[900, 120, 300, '#ff6fb0', .16], [250, 460, 340, '#33c4ff', .12], [760, 660, 260, '#ffb340', .07]],
      planets: [PLANET_PALS.violet, PLANET_PALS.pink, PLANET_PALS.teal, PLANET_PALS.orange],
    },
    phases: [
      { until: 26, every: 1.15, pool: { drone: 1 } },
      { until: 52, every: .95, pool: { drone: 3, zig: 2 } },
      { until: 80, every: .85, pool: { drone: 3, zig: 2, shooter: 1 } },
    ],
    events: [{ at: 24, name: 'giant' }, { at: 46, name: 'rain' }, { at: 66, name: 'worm' }],
  },
  {
    id: 1, name: 'Cinturão de Asteroides', desc: 'Rochas, minas e sucata. Ninguém atravessa sem arranhar a pintura.',
    music: 's2', duration: 90, boss: 'golem', bossName: 'Gigante de Rocha', tint: '#ffb340',
    pal: {
      top: '#3a1a52', bot: '#14081f', star: '#ffe9d0', dust: '#ffcf9a', shaft: '255,170,90', rock0: '#8a5a7a', rock1: '#2a1030', rim: 'rgba(255,190,140,.5)', rocks: 18,
      nebA: [[250, 200, 380, '#ff7a3c', .16], [1000, 420, 420, '#a23cff', .2], [600, 600, 320, '#ff4a8a', .1]],
      nebB: [[900, 100, 300, '#ffb340', .12], [200, 500, 320, '#33c4ff', .08]],
      planets: [PLANET_PALS.sand, PLANET_PALS.orange, PLANET_PALS.pink, PLANET_PALS.red],
    },
    phases: [
      { until: 28, every: 1.0, pool: { drone: 2, zig: 2, mine: 1 } },
      { until: 60, every: .9, pool: { drone: 2, zig: 2, kami: 2, mine: 1, shooter: 1 } },
      { until: 90, every: .8, pool: { zig: 2, kami: 2, shooter: 2, mine: 1, tank: 1 } },
    ],
    events: [{ at: 20, name: 'rain' }, { at: 42, name: 'mines' }, { at: 62, name: 'giant' }, { at: 78, name: 'rain' }],
  },
  {
    id: 2, name: 'Tempestade Iônica', desc: 'Raios, descargas e energia solta. Observe o chão antes de pisar.',
    music: 's3', duration: 95, boss: 'eye', bossName: 'Olho da Tempestade', tint: '#ff7ac8',
    pal: {
      top: '#3a0f5c', bot: '#0a0420', star: '#ffe0f4', dust: '#ff9ad0', shaft: '255,100,200', rock0: '#7a3a8a', rock1: '#220a38', rim: 'rgba(255,150,220,.5)', rocks: 8,
      nebA: [[200, 200, 400, '#ff3d9a', .2], [1050, 300, 420, '#7a3dff', .22], [640, 600, 340, '#33c4ff', .12]],
      nebB: [[850, 140, 320, '#33c4ff', .16], [250, 460, 340, '#ff6fb0', .14]],
      planets: [PLANET_PALS.pink, PLANET_PALS.teal, PLANET_PALS.violet],
    },
    phases: [
      { until: 30, every: .95, pool: { zig: 3, drone: 1, shooter: 1 } },
      { until: 62, every: .85, pool: { zig: 3, kami: 2, shooter: 2, bit: 2 } },
      { until: 95, every: .75, pool: { zig: 2, kami: 2, shooter: 2, tank: 1, bit: 2 } },
    ],
    events: [{ at: 22, name: 'storm' }, { at: 48, name: 'worm' }, { at: 70, name: 'storm' }],
  },
  {
    id: 3, name: 'Zona Solar', desc: 'Perto demais de uma estrela. As chamas escolhem o próprio caminho.',
    music: 's4', duration: 100, boss: 'sun', bossName: 'Sol-Guardião', tint: '#ff5a3c',
    pal: {
      top: '#4a1230', bot: '#12040f', star: '#fff0d0', dust: '#ffb870', shaft: '255,130,60', rock0: '#a2503a', rock1: '#30100a', rim: 'rgba(255,170,100,.55)', rocks: 9,
      nebA: [[200, 150, 400, '#ff7a1f', .22], [1050, 350, 420, '#ff3a3a', .22], [640, 600, 340, '#ffb340', .14]],
      nebB: [[900, 120, 320, '#ffd36a', .14], [200, 480, 320, '#ff4a8a', .1]],
      planets: [PLANET_PALS.red, PLANET_PALS.orange, PLANET_PALS.sand],
    },
    phases: [
      { until: 32, every: .9, pool: { drone: 2, zig: 2, kami: 2, shooter: 1 } },
      { until: 66, every: .8, pool: { zig: 2, kami: 3, shooter: 2, tank: 1, mine: 1 } },
      { until: 100, every: .7, pool: { kami: 3, shooter: 2, tank: 2, bit: 2, zig: 2 } },
    ],
    events: [{ at: 20, name: 'flare' }, { at: 44, name: 'rain' }, { at: 64, name: 'flare' }, { at: 84, name: 'worm' }],
  },
];
