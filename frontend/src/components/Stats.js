import React from 'react';

/**
 * Stats Component
 * 
 * Displays:
 * - Real-time exploration metrics: Cells explored, Path length, Algorithm runtime (ms)
 * - "No path found" status notification if the destination is completely blocked
 * - A visual legend explaining the color scheme of the grid
 */
function Stats({
  cellsExplored,
  pathLength,
  timeMs,
  hasSearched,
  noPathFound,
  isVisualizing,
  algorithmName,
}) {
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

      {/* Numerical Stats Line */}
      <div className="stats-line" aria-live="polite">
        {!hasSearched && !isVisualizing ? (
          <span className="stats-status status-ready">
            Pick an algorithm, draw walls or drag markers, and click <strong>Visualize</strong>!
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
              <strong>Path length:</strong> {pathLength}
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
