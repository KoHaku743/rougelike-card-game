import type { Card, GameState } from './types';

export const ALL_CARDS: Card[] = [
  {
    id: 'basic_shot',
    name: 'Basic Shot',
    type: 'Attack',
    cost: 1,
    rarity: 'Common',
    description: 'Deal 6 damage.',
    effect: (state) => { applyCombatDamage(state, 6); }
  },
  {
    id: 'block_card',
    name: 'Block',
    type: 'Skill',
    cost: 1,
    rarity: 'Common',
    description: 'Gain 5 block.',
    effect: (state) => { if (state.combat) state.combat.playerBlock += 5; }
  },
  {
    id: 'overcharge',
    name: 'Overcharge',
    type: 'Attack',
    cost: 0,
    rarity: 'Common',
    description: 'Deal 3 damage.',
    effect: (state) => { applyCombatDamage(state, 3); }
  },
  {
    id: 'plasma_bolt',
    name: 'Plasma Bolt',
    type: 'Attack',
    cost: 1,
    rarity: 'Common',
    description: 'Deal 8 damage.',
    effect: (state) => { applyCombatDamage(state, 8); }
  },
  {
    id: 'shield_boost',
    name: 'Shield Boost',
    type: 'Skill',
    cost: 1,
    rarity: 'Common',
    description: 'Gain 6 block.',
    effect: (state) => { if (state.combat) state.combat.playerBlock += 6; }
  },
  {
    id: 'quick_hack',
    name: 'Quick Hack',
    type: 'Attack',
    cost: 0,
    rarity: 'Common',
    description: 'Deal 4 damage.',
    effect: (state) => { applyCombatDamage(state, 4); }
  },
  {
    id: 'backup_drone',
    name: 'Backup Drone',
    type: 'Skill',
    cost: 1,
    rarity: 'Common',
    description: 'Gain 4 block. Draw 1 card.',
    effect: (state) => {
      if (state.combat) state.combat.playerBlock += 4;
      drawCards(state, 1);
    }
  },
  {
    id: 'energy_surge',
    name: 'Energy Surge',
    type: 'Attack',
    cost: 2,
    rarity: 'Common',
    description: 'Deal 12 damage.',
    effect: (state) => { applyCombatDamage(state, 12); }
  },
  {
    id: 'scrap_shot',
    name: 'Scrap Shot',
    type: 'Attack',
    cost: 1,
    rarity: 'Common',
    description: 'Deal 5 damage. Draw 1 card.',
    effect: (state) => {
      applyCombatDamage(state, 5);
      drawCards(state, 1);
    }
  },
  {
    id: 'railgun_blast',
    name: 'Railgun Blast',
    type: 'Attack',
    cost: 2,
    rarity: 'Uncommon',
    description: 'Deal 16 damage.',
    effect: (state) => { applyCombatDamage(state, 16); }
  },
  {
    id: 'plasma_shield',
    name: 'Plasma Shield',
    type: 'Skill',
    cost: 2,
    rarity: 'Uncommon',
    description: 'Gain 10 block.',
    effect: (state) => { if (state.combat) state.combat.playerBlock += 10; }
  },
  {
    id: 'system_override',
    name: 'System Override',
    type: 'Power',
    cost: 1,
    rarity: 'Uncommon',
    description: 'Deal 2 damage to enemy at start of each turn.',
    effect: (state) => {
      if (state.combat) {
        (state.combat as any).systemOverrideStacks = ((state.combat as any).systemOverrideStacks || 0) + 2;
      }
    }
  },
  {
    id: 'overclock',
    name: 'Overclock',
    type: 'Power',
    cost: 1,
    rarity: 'Uncommon',
    description: 'Gain 1 energy at start of each turn.',
    effect: (state) => {
      if (state.combat) {
        (state.combat as any).overclockStacks = ((state.combat as any).overclockStacks || 0) + 1;
      }
    }
  },
  {
    id: 'nanobots',
    name: 'Nanobots',
    type: 'Skill',
    cost: 1,
    rarity: 'Uncommon',
    description: 'Restore 8 HP.',
    effect: (state) => {
      state.playerHp = Math.min(state.playerHp + 8, state.playerMaxHp);
    }
  },
  {
    id: 'emp_burst',
    name: 'EMP Burst',
    type: 'Attack',
    cost: 2,
    rarity: 'Uncommon',
    description: 'Deal 8 damage. Enemy loses all block.',
    effect: (state) => {
      applyCombatDamage(state, 8);
      if (state.combat) state.combat.enemyBlock = 0;
    }
  },
  {
    id: 'singularity_bomb',
    name: 'Singularity Bomb',
    type: 'Attack',
    cost: 3,
    rarity: 'Rare',
    description: 'Deal 24 damage.',
    effect: (state) => { applyCombatDamage(state, 24); }
  },
  {
    id: 'quantum_shield',
    name: 'Quantum Shield',
    type: 'Skill',
    cost: 2,
    rarity: 'Rare',
    description: 'Gain 15 block. Draw 2 cards.',
    effect: (state) => {
      if (state.combat) state.combat.playerBlock += 15;
      drawCards(state, 2);
    }
  },
  {
    id: 'reactor_meltdown',
    name: 'Reactor Meltdown',
    type: 'Power',
    cost: 2,
    rarity: 'Rare',
    description: 'Deal 5 damage to enemy each turn. Take 2 self-damage per turn.',
    effect: (state) => {
      if (state.combat) {
        (state.combat as any).reactorMeltdownStacks = ((state.combat as any).reactorMeltdownStacks || 0) + 1;
      }
    }
  },
  {
    id: 'hacking_suite',
    name: 'Hacking Suite',
    type: 'Power',
    cost: 1,
    rarity: 'Rare',
    description: 'Enemy starts combat with -5 HP.',
    effect: (state) => {
      if (state.combat) {
        state.combat.enemy.hp = Math.max(0, state.combat.enemy.hp - 5);
      }
    }
  },
  {
    id: 'thruster_boost',
    name: 'Thruster Boost',
    type: 'Skill',
    cost: 0,
    rarity: 'Rare',
    description: 'Gain 8 block. Draw 3 cards.',
    effect: (state) => {
      if (state.combat) state.combat.playerBlock += 8;
      drawCards(state, 3);
    }
  },
];

export function getCardById(id: string): Card | undefined {
  return ALL_CARDS.find(c => c.id === id);
}

export function getStarterDeck(): string[] {
  return [
    'basic_shot', 'basic_shot', 'basic_shot', 'basic_shot',
    'block_card', 'block_card', 'block_card',
    'overcharge', 'overcharge', 'overcharge',
  ];
}

export function getRewardPool(): Card[] {
  return ALL_CARDS.filter(c => !['basic_shot', 'block_card', 'overcharge'].includes(c.id));
}

function applyCombatDamage(state: GameState, amount: number): void {
  if (!state.combat) return;
  const enemy = state.combat.enemy;
  const absorbed = Math.min(state.combat.enemyBlock, amount);
  const actualDamage = amount - absorbed;
  state.combat.enemyBlock -= absorbed;
  enemy.hp = Math.max(0, enemy.hp - actualDamage);
  state.runStats.damageDealt += actualDamage;
}

function drawCards(state: GameState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      state.deck = [...state.discard].sort(() => Math.random() - 0.5);
      state.discard = [];
    }
    if (state.deck.length > 0) {
      const card = state.deck.pop()!;
      state.hand.push(card);
    }
  }
}
