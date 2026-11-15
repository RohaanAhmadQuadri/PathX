import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import Grid from './components/Grid';
import Controls from './components/Controls';
import Stats from './components/Stats';

// Import pure pathfinding algorithms
import { bfs } from './algorithms/bfs';
import { dfs } from './algorithms/dfs';
import { dijkstra } from './algorithms/dijkstra';
import { astar } from './algorithms/astar';
import { ROWS, COLS } from './algorithms/utils';

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
  // Grid state
  const [startCell, setStartCell] = useState(DEFAULT_START_CELL);
  const [endCell, setEndCell] = useState(DEFAULT_END_CELL);
  const [walls, setWalls] = useState(new Set());
  const [visitedCells, setVisitedCells] = useState(new Set());
  const [pathCells, setPathCells] = useState(new Set());

  // Configuration state
  const [algorithm, setAlgorithm] = useState('bfs');
  const [delay, setDelay] = useState(15); // Step delay in ms
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Statistics state
  const [stats, setStats] = useState({
    explored: 0,
    pathLength: 0,
    timeMs: 0,
    searched: false,
    noPath: false,
  });

  // Mouse interaction state (click & drag to draw/erase walls or drag start/end)
  const isMouseDownRef = useRef(false);
  const dragModeRef = useRef(null); // 'START', 'END', 'DRAW_WALL', 'ERASE_WALL', or null
  const timerRef = useRef(null); // Reference to the active setInterval timer

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
   * Resets visited and path cells while preserving walls and endpoints.
   */
  const handleClearPath = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setVisitedCells(new Set());
    setPathCells(new Set());
    setIsVisualizing(false);
    setStats({
      explored: 0,
      pathLength: 0,
      timeMs: 0,
      searched: false,
      noPath: false,
    });
  }, []);

  /**
   * Clears all walls from the grid. Also clears any previous path.
   */
  const handleClearWalls = useCallback(() => {
    handleClearPath();
    setWalls(new Set());
  }, [handleClearPath]);

  /**
   * Generates a randomized wall maze with ~28% obstacle density.
   */
  const handleRandomWalls = useCallback(() => {
    handleClearPath();
    const newWalls = new Set();
    const totalCells = ROWS * COLS;

    for (let i = 0; i < totalCells; i++) {
      // Keep start and end cells open
      if (i !== startCell && i !== endCell) {
        if (Math.random() < 0.28) {
          newWalls.add(i);
        }
      }
    }
    setWalls(newWalls);
  }, [handleClearPath, startCell, endCell]);

  /**
   * Runs the selected pathfinding algorithm and animates the exploration.
   * Animation uses setInterval to sequentially step through:
   *   1. Visited cells (blue)
   *   2. Shortest path cells (yellow)
   */
  const handleVisualize = useCallback(() => {
    if (isVisualizing) return;

    // Reset previous search visualization
    handleClearPath();
    setIsVisualizing(true);

    const algoConfig = ALGORITHMS[algorithm];
    if (!algoConfig) return;

    // Execute pure function algorithm and record execution time
    const startTime = performance.now();
    const { visited, path } = algoConfig.fn(startCell, endCell, walls);
    const endTime = performance.now();
    const durationMs = (endTime - startTime).toFixed(2);

    let visitedIndex = 0;
    let pathIndex = 0;

    // Begin step-by-step animation with setInterval
    timerRef.current = setInterval(() => {
      // Phase 1: Step through all explored/visited nodes
      if (visitedIndex < visited.length) {
        const cellId = visited[visitedIndex];
        setVisitedCells((prev) => new Set(prev).add(cellId));
        visitedIndex++;
      }
      // Phase 2: Once exploration completes, step through the shortest path
      else if (pathIndex < path.length) {
        const cellId = path[pathIndex];
        setPathCells((prev) => new Set(prev).add(cellId));
        pathIndex++;
      }
      // Phase 3: Animation complete
      else {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsVisualizing(false);
        setStats({
          explored: visited.length,
          pathLength: path.length > 0 ? path.length - 1 : 0, // Path steps (edges)
          timeMs: durationMs,
          searched: true,
          noPath: path.length === 0,
        });
      }
    }, delay);
  }, [algorithm, delay, endCell, handleClearPath, isVisualizing, startCell, walls]);

  /**
   * Cell Mouse Down Handler:
   * Begins drawing walls, erasing walls, or dragging Start/End markers.
   */
  const handleCellMouseDown = useCallback(
    (id) => {
      if (isVisualizing) return;

      isMouseDownRef.current = true;

      if (id === startCell) {
        dragModeRef.current = 'START';
      } else if (id === endCell) {
        dragModeRef.current = 'END';
      } else if (walls.has(id)) {
        // Erase wall
        dragModeRef.current = 'ERASE_WALL';
        setWalls((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        // Draw wall
        dragModeRef.current = 'DRAW_WALL';
        setWalls((prev) => new Set(prev).add(id));
      }
    },
    [endCell, isVisualizing, startCell, walls]
  );

  /**
   * Cell Mouse Enter Handler:
   * Continues the active drag action (drawing walls, erasing walls, moving start/end).
   */
  const handleCellMouseEnter = useCallback(
    (id) => {
      if (!isMouseDownRef.current || isVisualizing) return;

      const mode = dragModeRef.current;

      if (mode === 'START') {
        // Dragging Start cell: cannot overlap with End cell
        if (id !== endCell) {
          setStartCell(id);
          // If destination was a wall, clear that wall
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
        // Dragging End cell: cannot overlap with Start cell
        if (id !== startCell) {
          setEndCell(id);
          // If destination was a wall, clear that wall
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
        // Adding walls on drag (cannot place walls on Start or End)
        if (id !== startCell && id !== endCell) {
          setWalls((prev) => new Set(prev).add(id));
        }
      } else if (mode === 'ERASE_WALL') {
        // Erasing walls on drag
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
    [endCell, isVisualizing, startCell]
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
        onVisualize={handleVisualize}
        onClearPath={handleClearPath}
        onClearWalls={handleClearWalls}
        onRandomWalls={handleRandomWalls}
        delay={delay}
        onDelayChange={setDelay}
        isVisualizing={isVisualizing}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Main Visualizer Area */}
      <main className="main-content">
        {/* Performance & Path Statistics Line */}
        <Stats
          cellsExplored={stats.explored}
          pathLength={stats.pathLength}
          timeMs={stats.timeMs}
          hasSearched={stats.searched}
          noPathFound={stats.noPath}
          isVisualizing={isVisualizing}
          algorithmName={ALGORITHMS[algorithm]?.name || ''}
        />

        {/* 20x40 Interactive Pathfinding Grid */}
        <Grid
          startCell={startCell}
          endCell={endCell}
          walls={walls}
          visitedCells={visitedCells}
          pathCells={pathCells}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onMouseUp={handleCellMouseUp}
          isVisualizing={isVisualizing}
        />
      </main>
    </div>
  );
}

export default App;