import React from 'react';

/**
 * Cell Component
 * 
 * Represents an individual cell in the 20x40 grid.
 * Uses React.memo to ensure that only cells whose state (start, end, wall, mud/weight, visited, path)
 * changes will re-render during animations or dragging.
 */
function Cell({
  id,
  isStart,
  isEnd,
  isWall,
  isMud,
  isVisited,
  isPath,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onContextMenu,
}) {
  // Determine CSS classes based on cell state
  const classNames = ['cell'];

  if (isStart) {
    classNames.push('cell-start');
  } else if (isEnd) {
    classNames.push('cell-end');
  } else if (isWall) {
    classNames.push('cell-wall');
  } else {
    // Normal, Visited, or Path cell
    if (isMud) {
      classNames.push('cell-mud');
    }
    if (isPath) {
      classNames.push('cell-path');
    } else if (isVisited) {
      classNames.push('cell-visited');
    }
  }

  return (
    <div
      id={`cell-${id}`}
      className={classNames.join(' ')}
      onMouseDown={(e) => onMouseDown(id, e)}
      onMouseEnter={() => onMouseEnter(id)}
      onMouseUp={onMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onContextMenu) onContextMenu(id);
      }}
      onDragStart={(e) => e.preventDefault()} // Prevent browser default ghost dragging
      role="gridcell"
      aria-label={`Cell ${id}${isMud ? ' (Mud weight 5)' : ''}`}
    >
      {/* Icon markers for start and end points */}
      {isStart && <span className="cell-marker start-marker">&#9654;</span>}
      {isEnd && <span className="cell-marker end-marker">&#9678;</span>}
      {/* Mud weight indicator for non-terminal cells */}
      {isMud && !isStart && !isEnd && !isWall && (
        <span className="mud-badge" title="Mud cell (Weight 5)">5</span>
      )}
    </div>
  );
}

// React.memo avoids re-rendering all 800 cells on each animation tick
export default React.memo(Cell);
