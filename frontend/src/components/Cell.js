import React from 'react';

/**
 * Cell Component
 * 
 * Represents an individual cell in the 20x40 grid.
 * Uses React.memo to ensure that only cells whose state (start, end, wall, visited, path)
 * changes will re-render during animations or dragging.
 */
function Cell({
  id,
  isStart,
  isEnd,
  isWall,
  isVisited,
  isPath,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}) {
  // Determine CSS classes based on cell state
  let cellType = '';
  if (isStart) {
    cellType = 'cell-start';
  } else if (isEnd) {
    cellType = 'cell-end';
  } else if (isWall) {
    cellType = 'cell-wall';
  } else if (isPath) {
    cellType = 'cell-path';
  } else if (isVisited) {
    cellType = 'cell-visited';
  }

  return (
    <div
      id={`cell-${id}`}
      className={`cell ${cellType}`}
      onMouseDown={() => onMouseDown(id)}
      onMouseEnter={() => onMouseEnter(id)}
      onMouseUp={onMouseUp}
      onDragStart={(e) => e.preventDefault()} // Prevent browser default drag behavior
      role="gridcell"
      aria-label={`Cell ${id}`}
    >
      {/* Icon markers for start and end points */}
      {isStart && <span className="cell-marker start-marker">&#9654;</span>}
      {isEnd && <span className="cell-marker end-marker">&#9678;</span>}
    </div>
  );
}

// React.memo avoids re-rendering all 800 cells on each animation tick
export default React.memo(Cell);
