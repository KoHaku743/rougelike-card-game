import type { GameState, SaveState } from './types';

declare const Gamplo: any;

export async function saveGame(state: GameState): Promise<void> {
  try {
    if (typeof Gamplo === 'undefined') return;
    const player = Gamplo.getPlayer();
    if (!player) return;
    const saveState: SaveState = {
      playerHp: state.playerHp,
      playerMaxHp: state.playerMaxHp,
      deck: [...state.allCards],
      currentFloor: state.currentFloor,
      visitedNodes: [...state.visitedNodes],
      currentNode: state.currentNode,
      runStats: { ...state.runStats },
    };
    await Gamplo.setSave(saveState);
  } catch (e) {
    // Ignore save errors
  }
}

export async function loadGame(): Promise<SaveState | null> {
  try {
    if (typeof Gamplo === 'undefined') return null;
    const player = Gamplo.getPlayer();
    if (!player) return null;
    const save = await Gamplo.getSave();
    return save || null;
  } catch (e) {
    return null;
  }
}
