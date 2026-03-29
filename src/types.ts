export interface Card {
  id: string;
  name: string;
  type: 'Attack' | 'Skill' | 'Power';
  cost: number;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare';
  effect: (state: GameState) => void;
}

export interface Intent {
  type: 'Attack' | 'Defend' | 'Buff' | 'Debuff';
  value: number;
  label: string;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  intents: Intent[];
  currentIntentIndex: number;
  damage: number;
  buffs: { damageBonus: number };
}

export type NodeType = 'start' | 'combat' | 'rest' | 'boss' | 'victory';

export interface MapNode {
  id: number;
  type: NodeType;
  connections: number[];
  visited: boolean;
  enemyId?: string;
}

export interface CombatState {
  enemy: Enemy;
  playerBlock: number;
  enemyBlock: number;
  turn: number;
  powerCardsPlayedThisCombat: number;
  totalDamageBlockedThisCombat: number;
  isActive: boolean;
  phase: 'player' | 'enemy' | 'reward';
  rewardCards: Card[];
}

export interface GameState {
  playerHp: number;
  playerMaxHp: number;
  energy: number;
  maxEnergy: number;
  deck: string[];
  hand: string[];
  discard: string[];
  allCards: string[];
  currentFloor: number;
  visitedNodes: number[];
  currentNode: number;
  map: MapNode[];
  combat: CombatState | null;
  phase: 'map' | 'combat' | 'reward' | 'rest' | 'gameover' | 'victory';
  runStats: {
    cardsCollected: number;
    combatsWon: number;
    damageDealt: number;
    damageBlocked: number;
  };
  debuffs: {
    energyReduction: number;
  };
}

export interface SaveState {
  playerHp: number;
  playerMaxHp: number;
  deck: string[];
  currentFloor: number;
  visitedNodes: number[];
  currentNode: number;
  runStats: {
    cardsCollected: number;
    combatsWon: number;
    damageDealt: number;
    damageBlocked: number;
  };
}
