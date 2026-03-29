import type { Enemy, Intent } from './types';

function makeEnemy(id: string, name: string, hp: number, intents: Intent[]): Enemy {
  return {
    id,
    name,
    hp,
    maxHp: hp,
    block: 0,
    intents,
    currentIntentIndex: 0,
    damage: 0,
    buffs: { damageBonus: 0 },
  };
}

export function createEnemy(id: string): Enemy {
  switch (id) {
    case 'patrol_drone':
      return makeEnemy('patrol_drone', 'Patrol Drone', 25, [
        { type: 'Attack', value: 6, label: 'Attack 6' },
        { type: 'Attack', value: 6, label: 'Attack 6' },
        { type: 'Defend', value: 5, label: 'Defend 5' },
      ]);
    case 'pirate_raider':
      return makeEnemy('pirate_raider', 'Pirate Raider', 35, [
        { type: 'Attack', value: 8, label: 'Attack 8' },
        { type: 'Attack', value: 5, label: 'Attack 5' },
        { type: 'Defend', value: 8, label: 'Defend 8' },
      ]);
    case 'mech_sentry':
      return makeEnemy('mech_sentry', 'Mech Sentry', 45, [
        { type: 'Attack', value: 10, label: 'Attack 10' },
        { type: 'Defend', value: 8, label: 'Defend 8' },
        { type: 'Buff', value: 3, label: 'Buff +3 DMG' },
        { type: 'Attack', value: 12, label: 'Attack 12' },
      ]);
    case 'alien_latcher':
      return makeEnemy('alien_latcher', 'Alien Latcher', 30, [
        { type: 'Attack', value: 7, label: 'Attack 7' },
        { type: 'Attack', value: 4, label: 'Attack 4' },
        { type: 'Debuff', value: 1, label: 'Debuff -1 Energy' },
      ]);
    case 'the_overseer':
      return makeEnemy('the_overseer', 'The Overseer', 100, [
        { type: 'Attack', value: 15, label: 'Attack 15' },
        { type: 'Defend', value: 12, label: 'Defend 12' },
        { type: 'Attack', value: 10, label: 'Attack 10' },
        { type: 'Attack', value: 10, label: 'Attack 10' },
        { type: 'Buff', value: 4, label: 'Buff +4 DMG' },
      ]);
    default:
      return makeEnemy('patrol_drone', 'Patrol Drone', 25, [
        { type: 'Attack', value: 6, label: 'Attack 6' },
      ]);
  }
}

export const ENEMY_IDS = ['patrol_drone', 'pirate_raider', 'mech_sentry', 'alien_latcher'];
export const BOSS_ID = 'the_overseer';
