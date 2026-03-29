export const ACHIEVEMENTS = [
  { key: 'first_kill', title: 'First Blood', description: 'Win your first combat', points: 10 },
  { key: 'deck_builder', title: 'Deck Builder', description: 'Add 5 cards to your deck in a single run', points: 10 },
  { key: 'victory', title: 'Victory', description: 'Defeat the boss and win the game', points: 25 },
  { key: 'death', title: 'Defeated', description: 'Lose a run', points: 5 },
  { key: 'overkill', title: 'Overkill', description: 'Deal 20+ damage in a single attack', points: 10 },
  { key: 'perfect_run', title: 'Perfect Block', description: 'Block 15+ damage in a single combat', points: 10 },
  { key: 'energy_master', title: 'Energy Master', description: 'End a turn with 3 energy remaining', points: 10 },
  { key: 'power_surge', title: 'Power Up', description: 'Play 3 Power cards in a single combat', points: 10 },
];

declare const Gamplo: any;

export async function unlockAchievement(key: string): Promise<void> {
  try {
    if (typeof Gamplo === 'undefined') return;
    const result = await Gamplo.unlockAchievement(key);
    if (!result.alreadyUnlocked) {
      showAchievementPopup(result.achievement);
    }
  } catch (e) {
    // Guest users get 403 — ignore silently
  }
}

function showAchievementPopup(achievement: any): void {
  const popup = document.createElement('div');
  popup.className = 'achievement-popup';
  popup.innerHTML = `
    <div class="achievement-icon">🏆</div>
    <div class="achievement-info">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-name">${achievement?.title || 'Achievement'}</div>
    </div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}
