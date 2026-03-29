import type { GameState, Card } from './types';
import { drawCards, discardHand } from './deck';
import { getCardById } from './cards';

export interface CombatEffects {
  damageDealtThisCard: number;
  combatEnded: boolean;
  victory: boolean;
}

export function startPlayerTurn(state: GameState): void {
  if (!state.combat) return;
  state.combat.playerBlock = 0;
  const combat = state.combat as any;
  if (combat.systemOverrideStacks > 0) {
    applyDamageToEnemy(state, combat.systemOverrideStacks);
    if (state.combat.enemy.hp <= 0) return;
  }
  if (combat.reactorMeltdownStacks > 0) {
    applyDamageToEnemy(state, combat.reactorMeltdownStacks * 5);
    state.playerHp = Math.max(0, state.playerHp - combat.reactorMeltdownStacks * 2);
    if (state.combat.enemy.hp <= 0) return;
  }
  const overclock = combat.overclockStacks || 0;
  state.energy = state.maxEnergy + overclock;
  drawCards(state, 5);
}

export function playCard(state: GameState, cardId: string): CombatEffects {
  const result: CombatEffects = { damageDealtThisCard: 0, combatEnded: false, victory: false };
  if (!state.combat) return result;

  const card = getCardById(cardId);
  if (!card) return result;
  if (state.energy < card.cost) return result;

  const handIdx = state.hand.indexOf(cardId);
  if (handIdx === -1) return result;

  state.energy -= card.cost;

  const enemyHpBefore = state.combat.enemy.hp;

  card.effect(state);

  const damageDealt = enemyHpBefore - (state.combat?.enemy.hp ?? enemyHpBefore);
  if (damageDealt > 0) {
    result.damageDealtThisCard = damageDealt;
  }

  if (card.type === 'Power' && state.combat) {
    state.combat.powerCardsPlayedThisCombat++;
  }

  state.hand.splice(handIdx, 1);
  if (card.type !== 'Power') {
    state.discard.push(cardId);
  }

  if (state.combat && state.combat.enemy.hp <= 0) {
    result.combatEnded = true;
    result.victory = true;
    state.combat.isActive = false;
  }

  return result;
}

export function endPlayerTurn(state: GameState): void {
  if (!state.combat) return;
  discardHand(state);
}

export function executeEnemyTurn(state: GameState): boolean {
  if (!state.combat) return false;
  const enemy = state.combat.enemy;
  const intent = enemy.intents[enemy.currentIntentIndex];

  state.combat.enemyBlock = 0;

  switch (intent.type) {
    case 'Attack': {
      const damage = intent.value + enemy.buffs.damageBonus;
      const block = state.combat.playerBlock;
      const absorbed = Math.min(block, damage);
      const actualDamage = damage - absorbed;
      state.combat.playerBlock -= absorbed;
      state.combat.totalDamageBlockedThisCombat += absorbed;
      state.runStats.damageBlocked += absorbed;
      state.playerHp = Math.max(0, state.playerHp - actualDamage);
      break;
    }
    case 'Defend': {
      state.combat.enemyBlock += intent.value;
      break;
    }
    case 'Buff': {
      enemy.buffs.damageBonus += intent.value;
      break;
    }
    case 'Debuff': {
      state.debuffs.energyReduction += intent.value;
      break;
    }
  }

  enemy.currentIntentIndex = (enemy.currentIntentIndex + 1) % enemy.intents.length;

  if (state.playerHp <= 0) {
    return true;
  }
  return false;
}

function applyDamageToEnemy(state: GameState, amount: number): void {
  if (!state.combat) return;
  const enemy = state.combat.enemy;
  const absorbed = Math.min(state.combat.enemyBlock, amount);
  const actual = amount - absorbed;
  state.combat.enemyBlock -= absorbed;
  enemy.hp = Math.max(0, enemy.hp - actual);
}

export function generateRewardCards(allCards: Card[]): Card[] {
  const weighted: Card[] = [];
  for (const card of allCards) {
    const count = card.rarity === 'Common' ? 5 : card.rarity === 'Uncommon' ? 3 : 1;
    for (let i = 0; i < count; i++) weighted.push(card);
  }
  const result: Card[] = [];
  const used = new Set<string>();
  while (result.length < 3 && weighted.length > 0) {
    const idx = Math.floor(Math.random() * weighted.length);
    const card = weighted[idx];
    if (!used.has(card.id)) {
      used.add(card.id);
      result.push(card);
    }
    weighted.splice(idx, 1);
  }
  return result;
}
