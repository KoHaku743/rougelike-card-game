import type { MapNode } from './types';
import { ENEMY_IDS, BOSS_ID } from './enemies';

export function generateMap(): MapNode[] {
  const enemyIds = [...ENEMY_IDS].sort(() => Math.random() - 0.5);

  const nodes: MapNode[] = [
    { id: 0, type: 'start', connections: [1], visited: true },
    { id: 1, type: 'combat', connections: [2], visited: false, enemyId: enemyIds[0] },
    { id: 2, type: 'rest', connections: [3], visited: false },
    { id: 3, type: 'combat', connections: [4], visited: false, enemyId: enemyIds[1] },
    { id: 4, type: 'combat', connections: [5], visited: false, enemyId: enemyIds[2] },
    { id: 5, type: 'boss', connections: [6], visited: false, enemyId: BOSS_ID },
    { id: 6, type: 'victory', connections: [], visited: false },
  ];
  return nodes;
}

export function getAvailableNodes(map: MapNode[], currentNodeId: number): MapNode[] {
  const current = map.find(n => n.id === currentNodeId);
  if (!current) return [];
  return current.connections
    .map(id => map.find(n => n.id === id))
    .filter((n): n is MapNode => n !== undefined && !n.visited);
}
