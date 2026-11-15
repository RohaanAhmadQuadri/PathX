import { MinHeap } from './heap.js';
import { getNeighbors, buildPath, getCellWeight } from './utils.js';

/**
 * Dijkstra's Shortest Path Algorithm
 * 
 * Concept:
 * Dijkstra's algorithm uses a Priority Queue (Min-Heap) to greedily expand
 * the node with the lowest known distance from the starting node.
 * 
 * In a weighted grid, each step has a cost defined by the target cell:
 *   - Normal cell: cost = 1
 *   - Mud cell:    cost = 5
 * 
 * Properties:
 * - Guarantees the shortest (cheapest) path for non-negative edge weights!
 * - Time Complexity: O((V + E) log V) using a binary min-heap.
 * - Space Complexity: O(V)
 * 
 * @param {number} start - Starting cell ID
 * @param {number} end - Target cell ID
 * @param {Set<number>} walls - Set of cell IDs that act as obstacles
 * @param {Map<number, number>|Object} [weights] - Map of cell IDs to weights (e.g. mud = 5)
 * @returns {{ visited: number[], path: number[] }} Explored order and shortest path
 */
export function dijkstra(start, end, walls, weights) {
  // Edge case: Start and End are the same cell
  if (start === end) {
    return { visited: [start], path: [start] };
  }

  // Distance table: shortest distance from start to each cell
  const distances = { [start]: 0 };
  const cameFrom = { [start]: null };
  const visited = [];
  const visitedSet = new Set();

  // Priority queue ordered by lowest distance (priority)
  const minHeap = new MinHeap((a, b) => a.priority - b.priority);
  minHeap.insert({ id: start, priority: 0 });

  while (!minHeap.isEmpty()) {
    const { id: current, priority: currentDist } = minHeap.extractMin();

    // Skip if already settled (handled a shorter route previously)
    if (visitedSet.has(current)) {
      continue;
    }

    visitedSet.add(current);
    visited.push(current);

    // Early termination: Target reached with guaranteed minimal distance
    if (current === end) {
      break;
    }

    // Inspect orthogonal neighbors
    const neighbors = getNeighbors(current, walls);
    for (const neighbor of neighbors) {
      if (visitedSet.has(neighbor)) {
        continue;
      }

      const stepCost = getCellWeight(neighbor, weights);
      const newDist = currentDist + stepCost;
      const prevDist = distances[neighbor] !== undefined ? distances[neighbor] : Infinity;

      // Relaxation step: found a cheaper path to neighbor
      if (newDist < prevDist) {
        distances[neighbor] = newDist;
        cameFrom[neighbor] = current;
        minHeap.insert({ id: neighbor, priority: newDist });
      }
    }
  }

  // Reconstruct the shortest path from cameFrom mapping
  const path = buildPath(cameFrom, end, start);

  return { visited, path };
}
