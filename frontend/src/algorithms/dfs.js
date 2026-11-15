import { getNeighbors, buildPath } from './utils.js';

/**
 * Depth-First Search (DFS) Algorithm
 * 
 * Concept:
 * DFS explores as deep as possible along each branch before backtracking,
 * using a Last-In, First-Out (LIFO) Stack.
 * 
 * Properties:
 * - Does NOT guarantee the shortest path! (Path can be winding and long)
 * - Complete on finite graphs without cycles.
 * - Time Complexity: O(V + E)
 * - Space Complexity: O(V)
 * 
 * @param {number} start - Starting cell ID
 * @param {number} end - Target cell ID
 * @param {Set<number>} walls - Set of cell IDs that act as obstacles
 * @returns {{ visited: number[], path: number[] }} Explored order and resulting path
 */
export function dfs(start, end, walls) {
  // Edge case: Start and End are the same cell
  if (start === end) {
    return { visited: [start], path: [start] };
  }

  const stack = [start];
  const visited = [];
  const cameFrom = { [start]: null };
  const seen = new Set();

  while (stack.length > 0) {
    // Pop the most recently added element (LIFO)
    const current = stack.pop();

    // Skip if already visited (since multiple paths could push the same node)
    if (seen.has(current)) {
      continue;
    }

    seen.add(current);
    visited.push(current);

    // Early termination: Target reached
    if (current === end) {
      break;
    }

    // Inspect orthogonal neighbors
    const neighbors = getNeighbors(current, walls);
    for (const neighbor of neighbors) {
      if (!seen.has(neighbor)) {
        cameFrom[neighbor] = current; // Track the parent link for path reconstruction
        stack.push(neighbor);         // Push to stack for deep exploration
      }
    }
  }

  // Reconstruct path from start to end using cameFrom pointers
  const path = buildPath(cameFrom, end, start);

  return { visited, path };
}
