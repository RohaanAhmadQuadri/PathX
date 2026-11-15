import React, { useMemo } from 'react';
import Cell from './Cell';
import { ROWS, COLS } from '../algorithms/utils';

/**
 * Grid Component
 * 
 * Renders the 20x40 interactive grid container.
 * Maps each cell index to a memoized Cell component with its corresponding state.
 */
function Grid({
  startCell,
  endCell,
  walls,
  weights,
  visitedCells,
  pathCells,
  onCellMouseDown,
  onCellMouseEnter,
  onMouseUp,
  onCellContextMenu,
}) {
  // Generate cell IDs [0, 1, 2, ..., 799] once
  const cellIds = useMemo(() => {
    const ids = [];
    const totalCells = ROWS * COLS;
    for (let i = 0; i < totalCells; i++) {
      ids.push(i);
    }
    return ids;
  }, []);

  return (
    <div className="grid-wrapper">
      <div
        className="grid-container"
        onMouseLeave={onMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        role="grid"
        aria-label="Pathfinding visualizer grid"
      >
        {cellIds.map((id) => (
          <Cell
            key={id}
            id={id}
            isStart={id === startCell}
            isEnd={id === endCell}
            isWall={walls.has(id)}
            isMud={weights ? weights.has(id) : false}
            isVisited={visitedCells.has(id)}
            isPath={pathCells.has(id)}
            onMouseDown={onCellMouseDown}
            onMouseEnter={onCellMouseEnter}
            onMouseUp={onMouseUp}
            onContextMenu={onCellContextMenu}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(Grid);
