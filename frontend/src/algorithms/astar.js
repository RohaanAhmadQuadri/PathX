import { MinHeap } from './heap.js';
import { getNeighbors, manhattan, buildPath } from './utils.js';

/**
 * A* (A-Star) Search Algorithm
 * 
 * Concept:
 * A* is an informed best-first search algorithm that combines:
 *   1. g(n): The exact cost from the start node to current node n.
 *   2. h(n): The heuristic estimated cost from node n to the target end node.
 *   3. f(n) = g(n) + h(n): Total estimated cost of path through node n.
 * 
 * Heuristic used:
 * Manhattan Distance (|Δrow| + |Δcol|).
 * On a 4-directional grid with uniform step costs of 1, Manhattan distance
 * is admissible (never overestimates the true remaining distance) and consistent,
 * guaranteeing the optimal (shortest) path!
 * 
 * Properties:
 * - Much faster and explores fewer nodes than Dijkstra because it is directed toward the goal.
 * - Guarantees shortest path with an admissible heuristic.
 * - Time Complexity: O(E log V) in practice much faster due to heuristic pruning.
 * - Space Complexity: O(V)
 * 
 * @param {number} start - Starting cell ID
 * @param {number} end - Target cell ID
 * @param {Set<number>} walls - Set of cell IDs that act as obstacles
 * @returns {{ visited: number[], path: number[] }} Explored order and shortest path
 */
export function astar(start, end, walls) {
  // Edge case: Start and End are the same cell
  if (start === end) {
    return { visited: [start], path: [start] };
  }

  // gScore[n]: cost of the cheapest path from start to n currently known
  const gScore = { [start]: 0 };
  const cameFrom = { [start]: null };
  const visited = [];
  const closedSet = new Set();

  // Priority queue ordered by lowest fScore = g(n) + h(n)
  const minHeap = new MinHeap((a, b) => a.priority - b.priority);

  const initialH = manhattan(start, end);
  minHeap.insert({ id: start, priority: initialH });

  while (!minHeap.isEmpty()) {
    const { id: current } = minHeap.extractMin();

    // Skip if already evaluated in the closed set
    if (closedSet.has(current)) {
      continue;
    }

    closedSet.add(current);
    visited.push(current);

    // Early termination: Target reached
    if (current === end) {
      break;
    }

    const currentG = gScore[current];
    const neighbors = getNeighbors(current, walls);

    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor)) {
        continue;
      }

      // Tentative gScore: distance from start to neighbor through current
      const tentativeG = currentG + 1;
      const prevG = gScore[neighbor] !== undefined ? gScore[neighbor] : Infinity;

      // Found a better path to neighbor
      if (tentativeG < prevG) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        const fScore = tentativeG + manhattan(neighbor, end);
        minHeap.insert({ id: neighbor, priority: fScore });
      }
    }
  }

  // Reconstruct path from start to end using cameFrom pointers
  const path = buildPath(cameFrom, end, start);

  return { visited, path };
}
