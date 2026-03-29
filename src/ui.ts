import { gameState } from './game';
import { getCardById } from './cards';
import { getAvailableNodes } from './map';
import { handlePlayCard, handleEndTurn, handleSelectReward, handleRestContinue, travelToNode, restartGame } from './game';

declare const Gamplo: any;

let playerInfo: { displayName: string; image: string } | null = null;

export function setPlayerInfo(info: { displayName: string; image: string } | null): void {
  playerInfo = info;
}

export function renderAll(): void {
  const app = document.getElementById('app')!;
  app.innerHTML = '';

  renderHeader(app);

  switch (gameState.phase) {
    case 'map': renderMap(app); break;
    case 'combat': renderCombat(app); break;
    case 'reward': renderReward(app); break;
    case 'rest': renderRest(app); break;
    case 'gameover': renderGameOver(app); break;
    case 'victory': renderVictory(app); break;
  }
}

function renderHeader(parent: HTMLElement): void {
  const header = document.createElement('div');
  header.className = 'header';

  const playerSection = document.createElement('div');
  playerSection.className = 'player-section';

  if (playerInfo?.image) {
    const avatar = document.createElement('img');
    avatar.src = playerInfo.image;
    avatar.className = 'player-avatar';
    avatar.alt = 'Avatar';
    playerSection.appendChild(avatar);
  }

  const nameEl = document.createElement('span');
  nameEl.className = 'player-name';
  nameEl.textContent = playerInfo?.displayName || 'Guest';
  playerSection.appendChild(nameEl);

  const statsSection = document.createElement('div');
  statsSection.className = 'header-stats';
  statsSection.innerHTML = `
    <span class="stat">Floor: ${gameState.currentFloor}/5</span>
    <span class="stat hp">HP: ${gameState.playerHp}/${gameState.playerMaxHp}</span>
    ${gameState.phase === 'combat' ? `
      <span class="stat energy">⚡ ${gameState.energy}</span>
      <span class="stat">Deck: ${gameState.deck.length}</span>
      <span class="stat">Discard: ${gameState.discard.length}</span>
    ` : ''}
  `;

  header.appendChild(playerSection);
  header.appendChild(statsSection);
  parent.appendChild(header);
}

function renderMap(parent: HTMLElement): void {
  const container = document.createElement('div');
  container.className = 'map-container';

  const title = document.createElement('h2');
  title.className = 'map-title';
  title.textContent = '— MAP —';
  container.appendChild(title);

  const mapEl = document.createElement('div');
  mapEl.className = 'map';

  const available = getAvailableNodes(gameState.map, gameState.currentNode);
  const availableIds = new Set(available.map(n => n.id));

  for (const node of gameState.map) {
    const nodeEl = document.createElement('div');
    nodeEl.className = `map-node node-${node.type}`;

    if (node.id === gameState.currentNode) nodeEl.classList.add('current');
    if (node.visited) nodeEl.classList.add('visited');
    if (availableIds.has(node.id)) nodeEl.classList.add('available');

    const icons: Record<string, string> = {
      start: '🚀',
      combat: '⚔️',
      rest: '🟢',
      boss: '💀',
      victory: '🏆',
    };
    const labels: Record<string, string> = {
      start: 'Start',
      combat: 'Combat',
      rest: 'Rest',
      boss: 'BOSS',
      victory: 'Victory',
    };

    nodeEl.innerHTML = `<span class="node-icon">${icons[node.type]}</span><span class="node-label">${labels[node.type]}</span>`;

    if (availableIds.has(node.id)) {
      nodeEl.addEventListener('click', () => travelToNode(node.id));
    }

    mapEl.appendChild(nodeEl);

    if (node.connections.length > 0 && node.type !== 'victory') {
      const arrow = document.createElement('div');
      arrow.className = 'map-arrow';
      arrow.textContent = '→';
      mapEl.appendChild(arrow);
    }
  }

  container.appendChild(mapEl);
  parent.appendChild(container);
}

function renderCombat(parent: HTMLElement): void {
  if (!gameState.combat) return;
  const combat = gameState.combat;
  const enemy = combat.enemy;

  const container = document.createElement('div');
  container.className = 'combat-container';

  const enemySection = document.createElement('div');
  enemySection.className = 'enemy-section';

  const enemyName = document.createElement('div');
  enemyName.className = 'enemy-name';
  enemyName.textContent = enemy.name;

  const hpBarWrapper = document.createElement('div');
  hpBarWrapper.className = 'hp-bar-wrapper';
  const hpBar = document.createElement('div');
  hpBar.className = 'hp-bar';
  const hpFill = document.createElement('div');
  hpFill.className = 'hp-fill';
  hpFill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
  hpBar.appendChild(hpFill);
  const hpText = document.createElement('span');
  hpText.className = 'hp-text';
  hpText.textContent = `${enemy.hp}/${enemy.maxHp}`;
  hpBarWrapper.appendChild(hpBar);
  hpBarWrapper.appendChild(hpText);

  const intent = enemy.intents[enemy.currentIntentIndex];
  const intentEl = document.createElement('div');
  intentEl.className = `intent intent-${intent.type.toLowerCase()}`;
  const intentIcons: Record<string, string> = { Attack: '⚔️', Defend: '🛡️', Buff: '💪', Debuff: '🔻' };
  intentEl.textContent = `${intentIcons[intent.type] || ''} ${intent.label}`;

  let blockEl: HTMLElement | null = null;
  if (combat.enemyBlock > 0) {
    blockEl = document.createElement('div');
    blockEl.className = 'block-badge';
    blockEl.textContent = `🛡️ ${combat.enemyBlock}`;
  }

  enemySection.appendChild(enemyName);
  enemySection.appendChild(hpBarWrapper);
  if (blockEl) enemySection.appendChild(blockEl);
  enemySection.appendChild(intentEl);

  const playerStats = document.createElement('div');
  playerStats.className = 'player-combat-stats';
  playerStats.innerHTML = `
    <div class="stat-pill hp-pill">❤️ ${gameState.playerHp}/${gameState.playerMaxHp}</div>
    <div class="stat-pill block-pill">🛡️ ${combat.playerBlock}</div>
    <div class="stat-pill energy-pill">⚡ ${gameState.energy}/${gameState.maxEnergy}</div>
    <div class="stat-pill deck-pill">📚 ${gameState.deck.length}</div>
    <div class="stat-pill discard-pill">🗑️ ${gameState.discard.length}</div>
  `;

  const handEl = document.createElement('div');
  handEl.className = 'card-hand';

  for (const cardId of gameState.hand) {
    const card = getCardById(cardId);
    if (!card) continue;
    const cardEl = createCardElement(card, gameState.energy >= card.cost && combat.phase === 'player');
    cardEl.addEventListener('click', () => {
      if (combat.phase === 'player') handlePlayCard(cardId);
    });
    handEl.appendChild(cardEl);
  }

  const endTurnBtn = document.createElement('button');
  endTurnBtn.className = 'btn-end-turn';
  endTurnBtn.textContent = combat.phase === 'enemy' ? 'Enemy Turn...' : 'End Turn';
  endTurnBtn.disabled = combat.phase === 'enemy';
  endTurnBtn.addEventListener('click', handleEndTurn);

  container.appendChild(enemySection);
  container.appendChild(playerStats);
  container.appendChild(handEl);
  container.appendChild(endTurnBtn);
  parent.appendChild(container);
}

function createCardElement(card: any, playable: boolean): HTMLElement {
  const cardEl = document.createElement('div');
  cardEl.className = `card rarity-${card.rarity.toLowerCase()}`;
  if (!playable) cardEl.classList.add('unplayable');

  const typeColors: Record<string, string> = { Attack: '#e74c3c', Skill: '#3498db', Power: '#9b59b6' };

  cardEl.innerHTML = `
    <div class="card-cost">${card.cost}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-type" style="color:${typeColors[card.type] || '#fff'}">${card.type}</div>
    <div class="card-desc">${card.description}</div>
    <div class="card-rarity">${card.rarity}</div>
  `;
  return cardEl;
}

function renderReward(parent: HTMLElement): void {
  if (!gameState.combat) return;
  const rewards = gameState.combat.rewardCards;

  const overlay = document.createElement('div');
  overlay.className = 'reward-overlay';

  const title = document.createElement('h2');
  title.className = 'reward-title';
  title.textContent = '⚡ Victory! Choose a Card ⚡';
  overlay.appendChild(title);

  const cardsEl = document.createElement('div');
  cardsEl.className = 'reward-cards';

  for (const card of rewards) {
    const cardEl = createCardElement(card, true);
    cardEl.classList.add('reward-card');
    cardEl.addEventListener('click', () => handleSelectReward(card.id));
    cardsEl.appendChild(cardEl);
  }

  overlay.appendChild(cardsEl);

  const skipBtn = document.createElement('button');
  skipBtn.className = 'btn-skip';
  skipBtn.textContent = 'Skip';
  skipBtn.addEventListener('click', () => handleSelectReward(null));
  overlay.appendChild(skipBtn);

  parent.appendChild(overlay);
}

function renderRest(parent: HTMLElement): void {
  const container = document.createElement('div');
  container.className = 'rest-container';
  container.innerHTML = `
    <div class="rest-icon">🟢</div>
    <h2 class="rest-title">Rest Site</h2>
    <p class="rest-desc">You take a moment to recover. HP restored to maximum!</p>
    <p class="rest-hp">HP: ${gameState.playerHp}/${gameState.playerMaxHp}</p>
  `;

  const continueBtn = document.createElement('button');
  continueBtn.className = 'btn-primary';
  continueBtn.textContent = 'Continue';
  continueBtn.addEventListener('click', handleRestContinue);
  container.appendChild(continueBtn);

  parent.appendChild(container);
}

function renderGameOver(parent: HTMLElement): void {
  const container = document.createElement('div');
  container.className = 'gameover-container';
  container.innerHTML = `
    <div class="gameover-skull">💀</div>
    <h1 class="gameover-title">You Died</h1>
    <div class="gameover-stats">
      <p>Floors Cleared: ${gameState.currentFloor}</p>
      <p>Cards Collected: ${gameState.runStats.cardsCollected}</p>
      <p>Combats Won: ${gameState.runStats.combatsWon}</p>
      <p>Total Damage Dealt: ${gameState.runStats.damageDealt}</p>
    </div>
  `;

  const restartBtn = document.createElement('button');
  restartBtn.className = 'btn-primary';
  restartBtn.textContent = 'Play Again';
  restartBtn.addEventListener('click', restartGame);
  container.appendChild(restartBtn);

  parent.appendChild(container);
}

function renderVictory(parent: HTMLElement): void {
  const container = document.createElement('div');
  container.className = 'victory-container';
  container.innerHTML = `
    <div class="victory-icon">🏆</div>
    <h1 class="victory-title">VICTORY!</h1>
    <p class="victory-subtitle">You defeated The Overseer!</p>
    <div class="victory-stats">
      <p>Floors Cleared: ${gameState.currentFloor}</p>
      <p>Cards Collected: ${gameState.runStats.cardsCollected}</p>
      <p>Combats Won: ${gameState.runStats.combatsWon}</p>
      <p>Total Damage Dealt: ${gameState.runStats.damageDealt}</p>
    </div>
  `;

  const restartBtn = document.createElement('button');
  restartBtn.className = 'btn-primary';
  restartBtn.textContent = 'Play Again';
  restartBtn.addEventListener('click', restartGame);
  container.appendChild(restartBtn);

  parent.appendChild(container);
}
