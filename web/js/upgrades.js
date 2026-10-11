'use strict';
// ---------- RPG: upgrades da fase (nivel) e loja permanente ----------
const RARITY = {
  comum: { name: 'COMUM', c: '#8b4dff', w: 6 },
  raro: { name: 'RARO', c: '#33c4ff', w: 3 },
  epico: { name: 'ÉPICO', c: '#ffb340', w: 1.4 },
};

// maxHp / heal agem direto no jogador (ver Game.applyUpgradeSideEffects)
const RUN_UPGRADES = [
  { id: 'dmg', name: 'Tiro Forte', r: 'comum', max: 8, desc: '+20% de dano em todos os tiros.' },
  { id: 'rate', name: 'Cadência', r: 'comum', max: 6, desc: 'Atira 10% mais rápido.' },
  { id: 'speed', name: 'Propulsor', r: 'comum', max: 4, desc: '+10% de velocidade de movimento.' },
  { id: 'hp', name: 'Casco Reforçado', r: 'comum', max: 5, desc: '+1 de vida máxima e cura 1.' },
  { id: 'heal', name: 'Reparo', r: 'comum', max: 99, desc: 'Recupera 2 de vida.', cond: () => G.player.hp < G.player.maxHp },
  { id: 'magnet', name: 'Ímã Estelar', r: 'comum', max: 4, desc: 'Atrai itens de mais longe.' },
  { id: 'pulse', name: 'Pulso Veloz', r: 'comum', max: 4, desc: 'Pulso Olien recarrega 15% mais rápido.' },
  { id: 'xp', name: 'Mente Brilhante', r: 'comum', max: 4, desc: '+15% de experiência.' },
  { id: 'lucky', name: 'Faro de Estrelas', r: 'comum', max: 4, desc: '+20% de estrelas ao derrotar inimigos.' },
  { id: 'multi', name: 'Tiro Múltiplo', r: 'raro', max: 4, desc: '+1 tiro em leque.' },
  { id: 'pierce', name: 'Tiro Perfurante', r: 'raro', max: 3, desc: 'Tiros atravessam +1 inimigo.' },
  { id: 'crit', name: 'Mira Crítica', r: 'raro', max: 5, desc: '+8% de chance de crítico (dano x2).' },
  { id: 'shield', name: 'Escudo de Energia', r: 'raro', max: 3, desc: 'Absorve 1 golpe. Recarrega sozinho.' },
  { id: 'missile', name: 'Mísseis Teleguiados', r: 'epico', max: 4, desc: 'Dispara mísseis que perseguem e explodem em área. +1 míssil por nível.' },
  { id: 'orbit', name: 'Drones Orbitais', r: 'epico', max: 4, desc: 'Drones giram ao seu redor e destroem tudo.' },
];

// loja permanente (gasta estrelas, vale para todas as fases)
const SHOP_ITEMS = [
  { id: 'hp', name: 'Casco', desc: '+1 de vida máxima por nível', max: 5, cost: l => 120 + l * 140, col: '#ff5f8f' },
  { id: 'dmg', name: 'Canhão', desc: '+12% de dano por nível', max: 8, cost: l => 100 + l * 120, col: '#b98cff' },
  { id: 'rate', name: 'Cadência', desc: '+6% de velocidade de tiro', max: 6, cost: l => 100 + l * 110, col: '#7fe0ff' },
  { id: 'speed', name: 'Motor', desc: '+5% de velocidade de movimento', max: 5, cost: l => 80 + l * 90, col: '#9fe8ff' },
  { id: 'magnet', name: 'Ímã', desc: '+30 de alcance para atrair itens', max: 5, cost: l => 60 + l * 70, col: '#ffe9a8' },
  { id: 'pulse', name: 'Pulso Olien', desc: 'Recarrega 2s mais rápido', max: 5, cost: l => 150 + l * 130, col: '#ffb340' },
  { id: 'luck', name: 'Sorte', desc: '+12% de estrelas', max: 5, cost: l => 90 + l * 100, col: '#ffcf6b' },
  { id: 'xp', name: 'Sabedoria', desc: '+10% de experiência', max: 5, cost: l => 90 + l * 100, col: '#8b4dff' },
];

const shopLevel = id => Save.data.shop[id] || 0;
