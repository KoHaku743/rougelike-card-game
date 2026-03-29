import type { GameState, SaveState } from './types';
import { getStarterDeck, getRewardPool, getCardById } from './cards';
import { createEnemy } from './enemies';
import { initializeCombatDeck } from './deck';
import { generateMap } from './map';
import { startPlayerTurn, playCard, endPlayerTurn, executeEnemyTurn, generateRewardCards } from './combat';
import { unlockAchievement } from './achievements';
import { saveGame } from './save';

export let gameState: GameState;

let renderCallback: (() => void) | null = null;

export function setRenderCallback(fn: () => void): void {
  renderCallback = fn;
}

function triggerRender(): void {
  if (renderCallback) renderCallback();
}

declare const Gamplo: any;

export function initGameState(save?: SaveState | null): void {
  if (save) {
    gameState = {
      playerHp: save.playerHp,
      playerMaxHp: save.playerMaxHp,
      energy: 3,
      maxEnergy: 3,
      deck: [],
      hand: [],
      discard: [],
      allCards: save.deck,
      currentFloor: save.currentFloor,
      visitedNodes: save.visitedNodes,
      currentNode: save.currentNode,
      map: generateMap(),
      combat: null,
      phase: 'map',
      runStats: save.runStats,
      debuffs: { energyReduction: 0 },
    };
    for (const id of save.visitedNodes) {
      const node = gameState.map.find(n => n.id === id);
      if (node) node.visited = true;
    }
  } else {
    gameState = {
      playerHp: 50,
      playerMaxHp: 50,
      energy: 3,
      maxEnergy: 3,
      deck: [],
      hand: [],
      discard: [],
      allCards: [...getStarterDeck()],
      currentFloor: 0,
      visitedNodes: [0],
      currentNode: 0,
      map: generateMap(),
      combat: null,
      phase: 'map',
      runStats: { cardsCollected: 0, combatsWon: 0, damageDealt: 0, damageBlocked: 0 },
      debuffs: { energyReduction: 0 },
    };
  }
}

export function travelToNode(nodeId: number): void {
  const node = gameState.map.find(n => n.id === nodeId);
  if (!node) return;

  gameState.currentNode = nodeId;
  gameState.visitedNodes.push(nodeId);
  node.visited = true;
  gameState.currentFloor++;

  if (node.type === 'combat' || node.type === 'boss') {
    startCombat(node.enemyId!);
  } else if (node.type === 'rest') {
    gameState.phase = 'rest';
    gameState.playerHp = gameState.playerMaxHp;
    saveGame(gameState);
    triggerRender();
  } else if (node.type === 'victory') {
    gameState.phase = 'victory';
    unlockAchievement('victory');
    triggerRender();
  }
}

export function startCombat(enemyId: string): void {
  const enemy = createEnemy(enemyId);
  gameState.combat = {
    enemy,
    playerBlock: 0,
    enemyBlock: 0,
    turn: 1,
    powerCardsPlayedThisCombat: 0,
    totalDamageBlockedThisCombat: 0,
    isActive: true,
    phase: 'player',
    rewardCards: [],
  };
  gameState.phase = 'combat';
  gameState.energy = gameState.maxEnergy;

  initializeCombatDeck(gameState);
  startPlayerTurn(gameState);
  triggerRender();
}

export function handlePlayCard(cardId: string): void {
  if (!gameState.combat || gameState.combat.phase !== 'player') return;
  const card = getCardById(cardId);
  if (!card || gameState.energy < card.cost) return;

  const enemyHpBefore = gameState.combat.enemy.hp;
  const result = playCard(gameState, cardId);
  const damageThisCard = enemyHpBefore - (gameState.combat?.enemy.hp ?? enemyHpBefore);

  if (damageThisCard >= 20) {
    unlockAchievement('overkill');
  }

  if (result.combatEnded && result.victory) {
    handleCombatVictory();
    return;
  }

  triggerRender();
}

export function handleEndTurn(): void {
  if (!gameState.combat || gameState.combat.phase !== 'player') return;

  if (gameState.energy >= 3) {
    unlockAchievement('energy_master');
  }

  endPlayerTurn(gameState);
  gameState.combat.phase = 'enemy';
  triggerRender();

  setTimeout(() => {
    if (!gameState.combat) return;
    const playerDied = executeEnemyTurn(gameState);
    if (playerDied) {
      handlePlayerDeath();
      return;
    }

    gameState.combat.phase = 'player';
    gameState.combat.turn++;
    gameState.energy = Math.max(0, gameState.maxEnergy - gameState.debuffs.energyReduction);
    const combat = gameState.combat as any;
    if (combat.overclockStacks > 0) {
      gameState.energy += combat.overclockStacks;
    }
    gameState.debuffs.energyReduction = 0;
    startPlayerTurn(gameState);

    if (gameState.combat.enemy.hp <= 0) {
      handleCombatVictory();
      return;
    }

    triggerRender();
  }, 800);
}

function handleCombatVictory(): void {
  if (!gameState.combat) return;
  gameState.runStats.combatsWon++;

  if (gameState.runStats.combatsWon === 1) {
    unlockAchievement('first_kill');
  }
  if (gameState.allCards.length >= 15) {
    unlockAchievement('deck_builder');
  }
  if (gameState.combat.totalDamageBlockedThisCombat >= 15) {
    unlockAchievement('perfect_run');
  }
  if (gameState.combat.powerCardsPlayedThisCombat >= 3) {
    unlockAchievement('power_surge');
  }

  const rewardPool = getRewardPool();
  const rewards = generateRewardCards(rewardPool);
  gameState.combat.rewardCards = rewards;
  gameState.combat.phase = 'reward';
  gameState.phase = 'reward';

  saveGame(gameState);
  triggerRender();
}

export function handleSelectReward(cardId: string | null): void {
  if (cardId) {
    const card = getCardById(cardId);
    if (card) {
      gameState.allCards.push(cardId);
      gameState.runStats.cardsCollected++;
      if (gameState.runStats.cardsCollected >= 5) {
        unlockAchievement('deck_builder');
      }
    }
  }

  const currentNode = gameState.map.find(n => n.id === gameState.currentNode);
  if (currentNode?.type === 'boss') {
    gameState.phase = 'victory';
    unlockAchievement('victory');
    triggerRender();
    return;
  }

  gameState.phase = 'map';
  gameState.combat = null;
  saveGame(gameState);
  triggerRender();
}

function handlePlayerDeath(): void {
  gameState.phase = 'gameover';
  unlockAchievement('death');
  triggerRender();
}

export function handleRestContinue(): void {
  gameState.phase = 'map';
  saveGame(gameState);
  triggerRender();
}

export function restartGame(): void {
  initGameState(null);
  triggerRender();
}
