import React from 'react';

/**
 * Controls Component
 * 
 * Provides user interaction for:
 * - Selecting pathfinding algorithm (BFS, DFS, Dijkstra, A*)
 * - Triggering visualization
 * - Clearing path, clearing walls, and generating random walls
 * - Adjusting animation step delay via slider
 * - Toggling dark mode
 * 
 * Disables all interactive elements during visualization.
 */
function Controls({
  algorithm,
  onAlgorithmChange,
  onVisualize,
  onClearPath,
  onClearWalls,
  onRandomWalls,
  delay,
  onDelayChange,
  isVisualizing,
  darkMode,
  onToggleDarkMode,
}) {
  return (
    <header className="controls-panel">
      <div className="controls-row primary-controls">
        {/* Brand / Logo */}
        <div className="brand-logo">
          <span className="brand-icon">&#x27A4;</span>
          <span className="brand-name">Path<span className="highlight">X</span></span>
        </div>

        {/* Algorithm Dropdown */}
        <div className="control-group">
          <label htmlFor="algo-select" className="control-label">Algorithm:</label>
          <select
            id="algo-select"
            className="select-input"
            value={algorithm}
            onChange={(e) => onAlgorithmChange(e.target.value)}
            disabled={isVisualizing}
          >
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="astar">A* (A-Star Search)</option>
          </select>
        </div>

        {/* Visualize Button */}
        <button
          className="btn btn-visualize"
          onClick={onVisualize}
          disabled={isVisualizing}
        >
          {isVisualizing ? (
            <>
              <span className="spinner"></span> Visualizing...
            </>
          ) : (
            'Visualize'
          )}
        </button>

        {/* Clear Path Button */}
        <button
          className="btn btn-secondary"
          onClick={onClearPath}
          disabled={isVisualizing}
        >
          Clear Path
        </button>

        {/* Clear Walls Button */}
        <button
          className="btn btn-secondary"
          onClick={onClearWalls}
          disabled={isVisualizing}
        >
          Clear Walls
        </button>

        {/* Random Walls Button */}
        <button
          className="btn btn-secondary"
          onClick={onRandomWalls}
          disabled={isVisualizing}
        >
          Random Walls
        </button>

        {/* Step Delay Slider */}
        <div className="control-group slider-group">
          <label htmlFor="delay-slider" className="control-label">
            Step Delay: <span className="delay-badge">{delay}ms</span>
          </label>
          <input
            id="delay-slider"
            type="range"
            min="5"
            max="60"
            step="5"
            value={delay}
            onChange={(e) => onDelayChange(Number(e.target.value))}
            disabled={isVisualizing}
            className="slider-input"
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          className="btn btn-theme"
          onClick={onToggleDarkMode}
          title="Toggle Light/Dark Mode"
          aria-label="Toggle theme"
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  );
}

export default React.memo(Controls);
