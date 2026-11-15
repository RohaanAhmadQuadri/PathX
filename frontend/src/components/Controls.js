import React from 'react';

/**
 * Controls Component
 * 
 * Provides user interaction for:
 * - Single algorithm or Compare Mode toggle
 * - Selecting algorithms (Algo 1 & Algo 2 in compare mode)
 * - Visualizing (or "Run Both")
 * - Step-delay slider
 * - Clearing path, walls, mud, and generating random walls
 * - Dark mode toggle
 * 
 * Disables all interactive elements during visualization.
 */
function Controls({
  algorithm,
  onAlgorithmChange,
  algo1,
  onAlgo1Change,
  algo2,
  onAlgo2Change,
  isCompareMode,
  onToggleCompareMode,
  onVisualize,
  onClearPath,
  onClearWalls,
  onClearWeights,
  onRandomWalls,
  onOpenSaveModal,
  onOpenLoadModal,
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

        {/* Compare Mode Toggle */}
        <button
          className={`btn ${isCompareMode ? 'btn-compare-active' : 'btn-secondary'}`}
          onClick={onToggleCompareMode}
          disabled={isVisualizing}
          title="Toggle side-by-side comparison mode"
        >
          {isCompareMode ? '⚡ Compare Mode (ON)' : '⚖️ Compare'}
        </button>

        {/* Algorithm Selectors */}
        {!isCompareMode ? (
          // Single Algorithm Mode
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
        ) : (
          // Dual Algorithm Compare Mode
          <div className="compare-selectors-group">
            <div className="control-group">
              <label htmlFor="algo1-select" className="control-label">Algo 1:</label>
              <select
                id="algo1-select"
                className="select-input"
                value={algo1}
                onChange={(e) => onAlgo1Change(e.target.value)}
                disabled={isVisualizing}
              >
                <option value="dijkstra">Dijkstra's Algorithm</option>
                <option value="astar">A* (A-Star Search)</option>
                <option value="bfs">BFS</option>
                <option value="dfs">DFS</option>
              </select>
            </div>

            <span className="vs-badge">VS</span>

            <div className="control-group">
              <label htmlFor="algo2-select" className="control-label">Algo 2:</label>
              <select
                id="algo2-select"
                className="select-input"
                value={algo2}
                onChange={(e) => onAlgo2Change(e.target.value)}
                disabled={isVisualizing}
              >
                <option value="astar">A* (A-Star Search)</option>
                <option value="dijkstra">Dijkstra's Algorithm</option>
                <option value="bfs">BFS</option>
                <option value="dfs">DFS</option>
              </select>
            </div>
          </div>
        )}

        {/* Visualize / Run Both Button */}
        <button
          className="btn btn-visualize"
          onClick={onVisualize}
          disabled={isVisualizing}
        >
          {isVisualizing ? (
            <>
              <span className="spinner"></span> {isCompareMode ? 'Running Both...' : 'Visualizing...'}
            </>
          ) : isCompareMode ? (
            '▶ Run Both'
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

        {/* Clear Mud Button */}
        {onClearWeights && (
          <button
            className="btn btn-secondary"
            onClick={onClearWeights}
            disabled={isVisualizing}
            title="Remove all mud cells"
          >
            Clear Mud
          </button>
        )}

        {/* Random Walls Button */}
        <button
          className="btn btn-secondary"
          onClick={onRandomWalls}
          disabled={isVisualizing}
        >
          Random Walls
        </button>

        {/* Save Grid Button */}
        {onOpenSaveModal && (
          <button
            className="btn btn-secondary"
            onClick={onOpenSaveModal}
            disabled={isVisualizing}
            title="Save grid and get a shareable URL"
          >
            💾 Save Grid
          </button>
        )}

        {/* Load Grid Button */}
        {onOpenLoadModal && (
          <button
            className="btn btn-secondary"
            onClick={onOpenLoadModal}
            disabled={isVisualizing}
            title="Load a previously saved grid"
          >
            📂 Load Grid
          </button>
        )}

        {/* Step Delay Slider */}
        <div className="control-group slider-group">
          <label htmlFor="delay-slider" className="control-label">
            Speed: <span className="delay-badge">{delay}ms</span>
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
