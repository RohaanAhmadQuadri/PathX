/**
 * Grid Dimensions
 * 20 rows by 40 columns = 800 total cells
 * Cell IDs are mapped in row-major order: id = row * 40 + col
 */
export const ROWS = 20;
export const COLS = 40;

/**
 * Returns valid orthogonal (Up, Right, Down, Left) neighbors of a cell.
 * Valid means inside grid boundaries and not blocked by a wall.
 * 
 * @param {number} id - Cell ID (0 to 799)
 * @param {Set<number>} walls - Set of cell IDs that are walls
 * @returns {number[]} Array of neighbor cell IDs
 */
export function getNeighbors(id, walls) {
  const row = Math.floor(id / COLS);
  const col = id % COLS;
  const neighbors = [];

  // Orthogonal direction vectors: [deltaRow, deltaCol]
  // Up, Right, Down, Left
  const directions = [
    [-1, 0], // Up
    [0, 1],  // Right
    [1, 0],  // Down
    [0, -1]  // Left
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    // Check boundary constraints (must stay within 20x40 grid)
    if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
      const neighborId = newRow * COLS + newCol;
      // Exclude walls
      if (!walls.has(neighborId)) {
        neighbors.push(neighborId);
      }
    }
  }

  return neighbors;
}

/**
 * Calculates the Manhattan Distance heuristic between two cells.
 * Formula: |row1 - row2| + |col1 - col2|
 * 
 * In a 4-directional grid where diagonal movement is disallowed,
 * Manhattan distance represents the minimum possible steps between two points,
 * making it an admissible heuristic for A*.
 * 
 * @param {number} id1 - Starting cell ID
 * @param {number} id2 - Target cell ID
 * @returns {number} Manhattan distance
 */
export function manhattan(id1, id2) {
  const r1 = Math.floor(id1 / COLS);
  const c1 = id1 % COLS;
  const r2 = Math.floor(id2 / COLS);
  const c2 = id2 % COLS;

  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

/**
 * Reconstructs the shortest path from start to end by backtracking
 * through the `cameFrom` mapping.
 * 
 * @param {Object.<number, number|null>} cameFrom - Mapping of cell ID -> parent cell ID
 * @param {number} end - Target cell ID
 * @param {number} start - Start cell ID
 * @returns {number[]} Array of cell IDs from start to end, or [] if no path exists
 */
export function buildPath(cameFrom, end, start) {
  // If start is the end, the path is simply [start]
  if (start === end) {
    return [start];
  }

  // If the end cell was never reached, no path exists
  if (!(end in cameFrom)) {
    return [];
  }

  const path = [];
  let current = end;

  // Backtrack from end to start
  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = cameFrom[current];
  }

  // Verify that the reconstructed path actually begins at the start node
  if (path.length > 0 && path[0] === start) {
    return path;
  }

  return [];
}
