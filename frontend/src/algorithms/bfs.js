import { getNeighbors, buildPath } from './utils.js';

/**
 * Breadth-First Search (BFS) Algorithm
 * 
 * Concept:
 * BFS explores nodes level-by-level using a First-In, First-Out (FIFO) Queue.
 * It visits all neighbors at depth 1, then all neighbors at depth 2, and so on.
 * 
 * Properties:
 * - Guarantees the shortest path on unweighted grids!
 * - Complete: Always finds a path if one exists.
 * - Time Complexity: O(V + E) where V = nodes (800) and E = edges (~3200).
 * - Space Complexity: O(V) to store queue and visited sets.
 * 
 * @param {number} start - Starting cell ID
 * @param {number} end - Target cell ID
 * @param {Set<number>} walls - Set of cell IDs that act as obstacles
 * @returns {{ visited: number[], path: number[] }} Explored order and shortest path
 */
export function bfs(start, end, walls) {
  // Edge case: Start and End are the same cell
  if (start === end) {
    return { visited: [start], path: [start] };
  }

  const queue = [start];
  const visited = [];
  const cameFrom = { [start]: null };
  const seen = new Set([start]);

  while (queue.length > 0) {
    // Dequeue the front element (FIFO)
    const current = queue.shift();
    visited.push(current);

    // Early termination: Target reached
    if (current === end) {
      break;
    }

    // Inspect orthogonal neighbors (Up, Right, Down, Left)
    const neighbors = getNeighbors(current, walls);
    for (const neighbor of neighbors) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);            // Mark seen as soon as enqueued to prevent duplicate work
        cameFrom[neighbor] = current;   // Record parent for path reconstruction
        queue.push(neighbor);           // Enqueue neighbor
      }
    }
  }

  // Reconstruct path from start to end using cameFrom pointers
  const path = buildPath(cameFrom, end, start);

  return { visited, path };
}
