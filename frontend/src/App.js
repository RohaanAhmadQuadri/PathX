import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import Grid from './components/Grid';
import Controls from './components/Controls';
import Stats from './components/Stats';
import CompareTable from './components/CompareTable';
import StepControls from './components/StepControls';
import GridModal from './components/GridModal';

// Import pure pathfinding algorithms and helpers
import { bfs } from './algorithms/bfs';
import { dfs } from './algorithms/dfs';
import { dijkstra } from './algorithms/dijkstra';
import { astar } from './algorithms/astar';
import { ROWS, COLS, calculatePathCost } from './algorithms/utils';

// Backend API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Default start and end positions
// Row 9, Col 8  -> 9 * 40 + 8  = 368
// Row 9, Col 31 -> 9 * 40 + 31 = 391
const DEFAULT_START_CELL = 9 * COLS + 8;
const DEFAULT_END_CELL = 9 * COLS + 31;

// Map algorithm keys to pure functions and human-readable names
const ALGORITHMS = {
  bfs: { name: 'Breadth-First Search (BFS)', fn: bfs },
  dfs: { name: 'Depth-First Search (DFS)', fn: dfs },
  dijkstra: { name: "Dijkstra's Algorithm", fn: dijkstra },
  astar: { name: 'A* Search (Manhattan)', fn: astar },
};

function App() {
  // Shared Grid state (walls, mud weights, and endpoints are shared between grids)
  const [startCell, setStartCell] = useState(DEFAULT_START_CELL);
  const [endCell, setEndCell] = useState(DEFAULT_END_CELL);
  const [walls, setWalls] = useState(new Set());
  const [weights, setWeights] = useState(new Map()); // Map: cellId -> weight (mud = 5)

  // Single mode state
  const [algorithm, setAlgorithm] = useState('bfs');
  const [visitedCells, setVisitedCells] = useState(new Set());
  const [pathCells, setPathCells] = useState(new Set());
  const [stats, setStats] = useState({
    explored: 0,
    pathLength: 0,
    pathCost: 0,
    timeMs: 0,
    searched: false,
    noPath: false,
  });

  // Compare mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [algo1, setAlgo1] = useState('dijkstra');
  const [algo2, setAlgo2] = useState('astar');
  const [visitedCells1, setVisitedCells1] = useState(new Set());
  const [pathCells1, setPathCells1] = useState(new Set());
  const [stats1, setStats1] = useState({
    explored: 0,
    pathLength: 0,
    pathCost: 0,
    timeMs: 0,
    searched: false,
    noPath: false,
  });
  const [visitedCells2, setVisitedCells2] = useState(new Set());
  const [pathCells2, setPathCells2] = useState(new Set());
  const [stats2, setStats2] = useState({
    explored: 0,
    pathLength: 0,
    pathCost: 0,
    timeMs: 0,
    searched: false,
    noPath: false,
  });

  // Step-by-Step animation state
  const [stepIndex, setStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // General configuration state
  const [delay, setDelay] = useState(15); // Step delay in ms
  const [darkMode, setDarkMode] = useState(true);

  // Backend Save / Load Modal state & toast
  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'save' });
  const [toastMessage, setToastMessage] = useState('');

  // Search History ref: stores full visited and path lists
  const searchHistoryRef = useRef(null);

  // Mouse interaction state (click & drag to draw/erase walls or drag start/end)
  const isMouseDownRef = useRef(false);
  const dragModeRef = useRef(null); // 'START', 'END', 'DRAW_WALL', 'ERASE_WALL', or null
  const isWPressedRef = useRef(false); // Tracks whether 'W' is held down

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  /**
   * Resets visited and path cells while preserving walls, weights, and endpoints.
   */
  const handleClearPath = useCallback(() => {
    setIsPlaying(false);
    searchHistoryRef.current = null;
    setStepIndex(0);
    setTotalSteps(0);

    setVisitedCells(new Set());
    setPathCells(new Set());
    setVisitedCells1(new Set());
    setPathCells1(new Set());
    setVisitedCells2(new Set());
    setPathCells2(new Set());

    setStats({
      explored: 0,
      pathLength: 0,
      pathCost: 0,
      timeMs: 0,
      searched: false,
      noPath: false,
    });
    setStats1({
      explored: 0,
      pathLength: 0,
      pathCost: 0,
      timeMs: 0,
      searched: false,
      noPath: false,
    });
    setStats2({
      explored: 0,
      pathLength: 0,
      pathCost: 0,
      timeMs: 0,
      searched: false,
      noPath: false,
    });
  }, []);

  /**
   * Loads a grid layout into state from the backend.
   */
  const handleLoadGridData = useCallback(
    (gridData) => {
      handleClearPath();
      if (gridData.start !== undefined) setStartCell(Number(gridData.start));
      if (gridData.end !== undefined) setEndCell(Number(gridData.end));
      if (Array.isArray(gridData.walls)) setWalls(new Set(gridData.walls.map(Number)));

      const newWeights = new Map();
      if (Array.isArray(gridData.weights)) {
        gridData.weights.forEach((item) => {
          if (typeof item === 'object' && item.cell !== undefined) {
            newWeights.set(Number(item.cell), Number(item.weight) || 5);
          } else if (typeof item === 'number') {
            newWeights.set(item, 5);
          }
        });
      }
      setWeights(newWeights);
      showToast(`Loaded grid layout: "${gridData.name || 'Untitled'}"`);
    },
    [handleClearPath, showToast]
  );

  // Automatically load grid if ?grid=<id> is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gridId = params.get('grid');
    if (gridId) {
      fetch(`${API_URL}/api/grids/${gridId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.grid) {
            handleLoadGridData(data.grid);
          }
        })
        .catch((err) => console.error('Failed to auto-load grid from URL:', err));
    }
  }, [handleLoadGridData]);

  // Listen for 'W' key press to easily paint mud cells
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'w' || e.key === 'W') {
        isWPressedRef.current = true;
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'w' || e.key === 'W') {
        isWPressedRef.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Sync dark mode class with root container / body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Global mouse-up listener to safely handle releases outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isMouseDownRef.current = false;
      dragModeRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  /**
   * Applies a specific step index to the grid visualization.
   * Controls visited and path state precisely based on step index.
   */
  const applyStepIndex = useCallback((step, history) => {
    if (!history) return;

    if (history.mode === 'single') {
      const { visited, path, durationMs, calculatedCost } = history;
      const vCount = Math.min(step, visited.length);
      const pCount = step > visited.length ? Math.min(step - visited.length, path.length) : 0;

      setVisitedCells(new Set(visited.slice(0, vCount)));
      setPathCells(new Set(path.slice(0, pCount)));

      const isCompleted = step >= visited.length + path.length;
      setStats({
        explored: vCount,
        pathLength: pCount > 0 ? pCount - 1 : 0,
        pathCost: isCompleted ? calculatedCost : 0,
        timeMs: durationMs,
        searched: true,
        noPath: path.length === 0,
      });
    } else if (history.mode === 'compare') {
      const { res1, res2, durationMs1, durationMs2, cost1, cost2 } = history;

      const v1 = Math.min(step, res1.visited.length);
      const p1 = step > res1.visited.length ? Math.min(step - res1.visited.length, res1.path.length) : 0;
      setVisitedCells1(new Set(res1.visited.slice(0, v1)));
      setPathCells1(new Set(res1.path.slice(0, p1)));

      const v2 = Math.min(step, res2.visited.length);
      const p2 = step > res2.visited.length ? Math.min(step - res2.visited.length, res2.path.length) : 0;
      setVisitedCells2(new Set(res2.visited.slice(0, v2)));
      setPathCells2(new Set(res2.path.slice(0, p2)));

      setStats1({
        explored: v1,
        pathLength: p1 > 0 ? p1 - 1 : 0,
        pathCost: step >= res1.visited.length + res1.path.length ? cost1 : 0,
        timeMs: durationMs1,
        searched: true,
        noPath: res1.path.length === 0,
      });

      setStats2({
        explored: v2,
        pathLength: p2 > 0 ? p2 - 1 : 0,
        pathCost: step >= res2.visited.length + res2.path.length ? cost2 : 0,
        timeMs: durationMs2,
        searched: true,
        noPath: res2.path.length === 0,
      });
    }
  }, []);

  /**
   * Automatic timer playback driven by stepIndex.
   */
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setStepIndex((currStep) => {
        const nextStep = currStep + 1;
        if (nextStep >= totalSteps) {
          setIsPlaying(false);
          applyStepIndex(totalSteps, searchHistoryRef.current);
          return totalSteps;
        }
        applyStepIndex(nextStep, searchHistoryRef.current);
        return nextStep;
      });
    }, delay);

    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, delay, applyStepIndex]);

  /**
   * Clears all walls from the grid.
   */
  const handleClearWalls = useCallback(() => {
    handleClearPath();
    setWalls(new Set());
  }, [handleClearPath]);

  /**
   * Clears all mud/weight cells from the grid.
   */
  const handleClearWeights = useCallback(() => {
    handleClearPath();
    setWeights(new Map());
  }, [handleClearPath]);

  /**
   * Generates a randomized wall maze with ~28% obstacle density.
   */
  const handleRandomWalls = useCallback(() => {
    handleClearPath();
    const newWalls = new Set();
    const totalCells = ROWS * COLS;

    for (let i = 0; i < totalCells; i++) {
      if (i !== startCell && i !== endCell && !weights.has(i)) {
        if (Math.random() < 0.28) {
          newWalls.add(i);
        }
      }
    }
    setWalls(newWalls);
  }, [handleClearPath, startCell, endCell, weights]);

  /**
   * Toggles a mud cell (weight 5) on a specific cell ID.
   */
  const handleToggleMud = useCallback(
    (id) => {
      if (isPlaying || id === startCell || id === endCell) return;

      setWeights((prev) => {
        const next = new Map(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.set(id, 5);
        }
        return next;
      });

      // If turning into mud, remove wall if present
      setWalls((prev) => {
        if (prev.has(id)) {
          const next = new Set(prev);
          next.delete(id);
          return next;
        }
        return prev;
      });
    },
    [endCell, isPlaying, startCell]
  );

  /**
   * Runs single algorithm visualization or dual-algorithm comparison.
   */
  const handleVisualize = useCallback(() => {
    handleClearPath();

    if (!isCompareMode) {
      // Single Algorithm Mode
      const algoConfig = ALGORITHMS[algorithm];
      if (!algoConfig) return;

      const startTime = performance.now();
      const { visited, path } = algoConfig.fn(startCell, endCell, walls, weights);
      const endTime = performance.now();
      const durationMs = (endTime - startTime).toFixed(2);
      const calculatedCost = calculatePathCost(path, weights);

      const history = {
        mode: 'single',
        visited,
        path,
        durationMs,
        calculatedCost,
      };
      searchHistoryRef.current = history;

      const total = visited.length + path.length;
      setTotalSteps(total);
      setStepIndex(0);
      applyStepIndex(0, history);
      setIsPlaying(true);
    } else {
      // Compare Mode: Run both algorithms side-by-side
      const config1 = ALGORITHMS[algo1];
      const config2 = ALGORITHMS[algo2];
      if (!config1 || !config2) return;

      const startT1 = performance.now();
      const res1 = config1.fn(startCell, endCell, walls, weights);
      const durationMs1 = (performance.now() - startT1).toFixed(2);
      const cost1 = calculatePathCost(res1.path, weights);

      const startT2 = performance.now();
      const res2 = config2.fn(startCell, endCell, walls, weights);
      const durationMs2 = (performance.now() - startT2).toFixed(2);
      const cost2 = calculatePathCost(res2.path, weights);

      const history = {
        mode: 'compare',
        res1,
        res2,
        durationMs1,
        durationMs2,
        cost1,
        cost2,
      };
      searchHistoryRef.current = history;

      const total1 = res1.visited.length + res1.path.length;
      const total2 = res2.visited.length + res2.path.length;
      const maxTotal = Math.max(total1, total2);

      setTotalSteps(maxTotal);
      setStepIndex(0);
      applyStepIndex(0, history);
      setIsPlaying(true);
    }
  }, [
    algo1,
    algo2,
    algorithm,
    applyStepIndex,
    endCell,
    handleClearPath,
    isCompareMode,
    startCell,
    walls,
    weights,
  ]);

  /**
   * Step-by-Step Play / Pause Handler
   */
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (stepIndex >= totalSteps && totalSteps > 0) {
        setStepIndex(0);
        applyStepIndex(0, searchHistoryRef.current);
      }
      setIsPlaying(true);
    }
  }, [applyStepIndex, isPlaying, stepIndex, totalSteps]);

  /**
   * Step Forward Handler
   */
  const handleNextStep = useCallback(() => {
    setIsPlaying(false);
    const next = Math.min(stepIndex + 1, totalSteps);
    setStepIndex(next);
    applyStepIndex(next, searchHistoryRef.current);
  }, [applyStepIndex, stepIndex, totalSteps]);

  /**
   * Step Backward Handler
   */
  const handlePrevStep = useCallback(() => {
    setIsPlaying(false);
    const prev = Math.max(stepIndex - 1, 0);
    setStepIndex(prev);
    applyStepIndex(prev, searchHistoryRef.current);
  }, [applyStepIndex, stepIndex]);

  /**
   * Seek Step via Progress Bar Slider
   */
  const handleSeekStep = useCallback(
    (newStep) => {
      setIsPlaying(false);
      const bounded = Math.max(0, Math.min(newStep, totalSteps));
      setStepIndex(bounded);
      applyStepIndex(bounded, searchHistoryRef.current);
    },
    [applyStepIndex, totalSteps]
  );

  /**
   * Cell Mouse Down Handler:
   * Begins drawing walls, erasing walls, or dragging Start/End markers.
   */
  const handleCellMouseDown = useCallback(
    (id, e) => {
      if (isPlaying) return;

      if ((e && e.button === 2) || isWPressedRef.current) {
        handleToggleMud(id);
        return;
      }

      if (e && e.button !== 0) return;

      isMouseDownRef.current = true;

      if (id === startCell) {
        dragModeRef.current = 'START';
      } else if (id === endCell) {
        dragModeRef.current = 'END';
      } else if (walls.has(id)) {
        dragModeRef.current = 'ERASE_WALL';
        setWalls((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        dragModeRef.current = 'DRAW_WALL';
        setWalls((prev) => new Set(prev).add(id));
        setWeights((prev) => {
          if (prev.has(id)) {
            const next = new Map(prev);
            next.delete(id);
            return next;
          }
          return prev;
        });
      }
    },
    [endCell, handleToggleMud, isPlaying, startCell, walls]
  );

  /**
   * Cell Mouse Enter Handler:
   * Continues the active drag action (drawing walls, erasing walls, moving start/end).
   */
  const handleCellMouseEnter = useCallback(
    (id) => {
      if (!isMouseDownRef.current || isPlaying) return;

      const mode = dragModeRef.current;

      if (mode === 'START') {
        if (id !== endCell) {
          setStartCell(id);
          setWalls((prev) => {
            if (prev.has(id)) {
              const next = new Set(prev);
              next.delete(id);
              return next;
            }
            return prev;
          });
        }
      } else if (mode === 'END') {
        if (id !== startCell) {
          setEndCell(id);
          setWalls((prev) => {
            if (prev.has(id)) {
              const next = new Set(prev);
              next.delete(id);
              return next;
            }
            return prev;
          });
        }
      } else if (mode === 'DRAW_WALL') {
        if (id !== startCell && id !== endCell) {
          setWalls((prev) => new Set(prev).add(id));
          setWeights((prev) => {
            if (prev.has(id)) {
              const next = new Map(prev);
              next.delete(id);
              return next;
            }
            return prev;
          });
        }
      } else if (mode === 'ERASE_WALL') {
        setWalls((prev) => {
          if (prev.has(id)) {
            const next = new Set(prev);
            next.delete(id);
            return next;
          }
          return prev;
        });
      }
    },
    [endCell, isPlaying, startCell]
  );

  /**
   * Cell Mouse Up Handler:
   * Ends current dragging action.
   */
  const handleCellMouseUp = useCallback(() => {
    isMouseDownRef.current = false;
    dragModeRef.current = null;
  }, []);

  return (
    <div className="app-container" data-theme={darkMode ? 'dark' : 'light'}>
      {/* Top Controls Bar */}
      <Controls
        algorithm={algorithm}
        onAlgorithmChange={setAlgorithm}
        algo1={algo1}
        onAlgo1Change={setAlgo1}
        algo2={algo2}
        onAlgo2Change={setAlgo2}
        isCompareMode={isCompareMode}
        onToggleCompareMode={() => {
          handleClearPath();
          setIsCompareMode((prev) => !prev);
        }}
        onVisualize={handleVisualize}
        onClearPath={handleClearPath}
        onClearWalls={handleClearWalls}
        onClearWeights={handleClearWeights}
        onRandomWalls={handleRandomWalls}
        onOpenSaveModal={() => setModalConfig({ isOpen: true, mode: 'save' })}
        onOpenLoadModal={() => setModalConfig({ isOpen: true, mode: 'load' })}
        delay={delay}
        onDelayChange={setDelay}
        isVisualizing={isPlaying}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Main Visualizer Area */}
      <main className="main-content">
        {/* Step-by-Step Playback Bar (Pause, Play, Prev, Next, Progress Bar) */}
        {totalSteps > 0 && (
          <StepControls
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onSeekStep={handleSeekStep}
          />
        )}

        {!isCompareMode ? (
          // Single Mode Layout
          <>
            <Stats
              cellsExplored={stats.explored}
              pathLength={stats.pathLength}
              pathCost={stats.pathCost}
              timeMs={stats.timeMs}
              hasSearched={stats.searched}
              noPathFound={stats.noPath}
              isVisualizing={isPlaying}
              algorithmName={ALGORITHMS[algorithm]?.name || ''}
              algorithmKey={algorithm}
            />

            <Grid
              startCell={startCell}
              endCell={endCell}
              walls={walls}
              weights={weights}
              visitedCells={visitedCells}
              pathCells={pathCells}
              onCellMouseDown={handleCellMouseDown}
              onCellMouseEnter={handleCellMouseEnter}
              onMouseUp={handleCellMouseUp}
              onCellContextMenu={handleToggleMud}
              isVisualizing={isPlaying}
            />
          </>
        ) : (
          // Compare Mode Layout: Side-by-side Grids & Performance Table
          <>
            <Stats
              cellsExplored={stats1.explored + stats2.explored}
              pathLength={stats1.pathLength}
              pathCost={stats1.pathCost}
              timeMs={stats1.timeMs}
              hasSearched={stats1.searched && stats2.searched}
              noPathFound={stats1.noPath && stats2.noPath}
              isVisualizing={isPlaying}
              algorithmName={`${ALGORITHMS[algo1]?.name} vs ${ALGORITHMS[algo2]?.name}`}
              algorithmKey={algo1}
            />

            <div className="compare-grids-container">
              {/* Grid 1: Algorithm 1 */}
              <div className="compare-grid-card">
                <div className="compare-grid-title">
                  <span>Grid 1:</span>
                  <span className="badge-algo">{ALGORITHMS[algo1]?.name}</span>
                </div>
                <Grid
                  startCell={startCell}
                  endCell={endCell}
                  walls={walls}
                  weights={weights}
                  visitedCells={visitedCells1}
                  pathCells={pathCells1}
                  onCellMouseDown={handleCellMouseDown}
                  onCellMouseEnter={handleCellMouseEnter}
                  onMouseUp={handleCellMouseUp}
                  onCellContextMenu={handleToggleMud}
                  isVisualizing={isPlaying}
                />
              </div>

              {/* Grid 2: Algorithm 2 */}
              <div className="compare-grid-card">
                <div className="compare-grid-title">
                  <span>Grid 2:</span>
                  <span className="badge-algo">{ALGORITHMS[algo2]?.name}</span>
                </div>
                <Grid
                  startCell={startCell}
                  endCell={endCell}
                  walls={walls}
                  weights={weights}
                  visitedCells={visitedCells2}
                  pathCells={pathCells2}
                  onCellMouseDown={handleCellMouseDown}
                  onCellMouseEnter={handleCellMouseEnter}
                  onMouseUp={handleCellMouseUp}
                  onCellContextMenu={handleToggleMud}
                  isVisualizing={isPlaying}
                />
              </div>
            </div>

            {/* Comparison Performance Metrics Table */}
            <CompareTable
              stats1={stats1}
              stats2={stats2}
              algo1Name={ALGORITHMS[algo1]?.name}
              algo2Name={ALGORITHMS[algo2]?.name}
            />
          </>
        )}
      </main>

      {/* Save / Load Grid Modal */}
      <GridModal
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        onClose={() => setModalConfig({ isOpen: false, mode: 'save' })}
        currentLayout={{ start: startCell, end: endCell, walls, weights }}
        apiUrl={API_URL}
        onLoadGrid={handleLoadGridData}
      />

      {/* Notification Toast */}
      {toastMessage && <div className="notification-toast">{toastMessage}</div>}
    </div>
  );
}

export default App;