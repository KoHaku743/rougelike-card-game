import type { GameState } from './types';

export function shuffleDeck(deck: string[]): string[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function initializeCombatDeck(state: GameState): void {
  state.deck = shuffleDeck([...state.allCards]);
  state.hand = [];
  state.discard = [];
}

export function drawCards(state: GameState, count: number): void {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break;
      state.deck = shuffleDeck([...state.discard]);
      state.discard = [];
    }
    if (state.deck.length > 0) {
      const card = state.deck.pop()!;
      state.hand.push(card);
    }
  }
}

export function discardHand(state: GameState): void {
  state.discard.push(...state.hand);
  state.hand = [];
}
