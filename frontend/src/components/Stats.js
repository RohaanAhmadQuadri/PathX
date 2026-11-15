import React from 'react';

/**
 * Stats Component
 * 
 * Displays:
 * - Real-time exploration metrics: Cells explored, Path length, Total path cost, Algorithm runtime (ms)
 * - "No path found" status notification if the destination is completely blocked
 * - Informational note when BFS/DFS is chosen (explaining that they ignore weights)
 * - Visual legend explaining all cell types (Start, Target, Wall, Mud, Unvisited, Visited, Shortest Path)
 */
function Stats({
  cellsExplored,
  pathLength,
  pathCost,
  timeMs,
  hasSearched,
  noPathFound,
  isVisualizing,
  algorithmName,
  algorithmKey,
}) {
  const isUnweightedAlgo = algorithmKey === 'bfs' || algorithmKey === 'dfs';

  return (
    <div className="stats-panel">
      {/* Legend showing what each cell color represents */}
      <div className="legend-container">
        <div className="legend-item">
          <span className="legend-swatch legend-start">&#9654;</span>
          <span className="legend-text">Start</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-end">&#9678;</span>
          <span className="legend-text">Target</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-wall"></span>
          <span className="legend-text">Wall</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-mud">5</span>
          <span className="legend-text">Mud (Weight 5)</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-unvisited"></span>
          <span className="legend-text">Unvisited</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-visited"></span>
          <span className="legend-text">Visited (Blue)</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-path"></span>
          <span className="legend-text">Shortest Path (Yellow)</span>
        </div>
      </div>

      {/* Tip for Mud Cells & Unweighted Note */}
      <div className="helper-banner">
        <span className="helper-hint">
          💡 <strong>Tip:</strong> Right-click or hold <kbd>W</kbd> and click any cell to toggle <strong>Mud (weight 5)</strong>.
        </span>
        {isUnweightedAlgo && (
          <span className="algo-warning">
            ⚠️ <em>Note:</em> {algorithmKey ? algorithmKey.toUpperCase() : 'BFS/DFS'} is unweighted and ignores cell weights (mud costs 1). Use <strong>Dijkstra</strong> or <strong>A*</strong> for weighted pathfinding.
          </span>
        )}
      </div>

      {/* Numerical Stats Line */}
      <div className="stats-line" aria-live="polite">
        {!hasSearched && !isVisualizing ? (
          <span className="stats-status status-ready">
            Pick an algorithm, draw walls/mud or drag markers, and click <strong>Visualize</strong>!
          </span>
        ) : isVisualizing ? (
          <span className="stats-status status-searching">
            Exploring grid with <strong>{algorithmName}</strong>...
          </span>
        ) : noPathFound ? (
          <div className="stats-metrics-group">
            <span className="stat-badge">
              <strong>Cells explored:</strong> {cellsExplored}
            </span>
            <span className="stat-badge">
              <strong>Algorithm time:</strong> {timeMs} ms
            </span>
            <span className="stat-badge status-alert">
              <strong>No path found</strong>
            </span>
          </div>
        ) : (
          <div className="stats-metrics-group">
            <span className="stat-badge">
              <strong>Algorithm:</strong> {algorithmName}
            </span>
            <span className="stat-badge">
              <strong>Cells explored:</strong> {cellsExplored}
            </span>
            <span className="stat-badge">
              <strong>Path length:</strong> {pathLength} steps
            </span>
            <span className="stat-badge">
              <strong>Total path cost:</strong> {pathCost}
            </span>
            <span className="stat-badge">
              <strong>Algorithm time:</strong> {timeMs} ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(Stats);
