import React from 'react';

/**
 * CompareTable Component
 * 
 * Displays a side-by-side performance comparison table for two algorithms:
 * - Cells Explored (fewer is more efficient)
 * - Path Length in steps
 * - Total Path Cost (accounting for mud cells)
 * - Execution Time (ms)
 * - Status (Path Found / No Path Found)
 */
function CompareTable({ stats1, stats2, algo1Name, algo2Name }) {
  if (!stats1?.searched && !stats2?.searched) {
    return null;
  }

  // Determine winners for highlighting
  const betterExplored =
    stats1.explored < stats2.explored ? 1 : stats2.explored < stats1.explored ? 2 : 0;
  const betterCost =
    stats1.pathCost < stats2.pathCost ? 1 : stats2.pathCost < stats1.pathCost ? 2 : 0;
  const betterTime =
    parseFloat(stats1.timeMs) < parseFloat(stats2.timeMs)
      ? 1
      : parseFloat(stats2.timeMs) < parseFloat(stats1.timeMs)
      ? 2
      : 0;

  return (
    <div className="compare-table-wrapper">
      <h3 className="compare-table-title">Algorithm Performance Comparison</h3>
      <table className="compare-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>{algo1Name || 'Algorithm 1'}</th>
            <th>{algo2Name || 'Algorithm 2'}</th>
            <th>Winner / Observation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="metric-label">Status</td>
            <td>
              <span className={`status-pill ${stats1.noPath ? 'pill-fail' : 'pill-success'}`}>
                {stats1.noPath ? 'No path found' : 'Path found'}
              </span>
            </td>
            <td>
              <span className={`status-pill ${stats2.noPath ? 'pill-fail' : 'pill-success'}`}>
                {stats2.noPath ? 'No path found' : 'Path found'}
              </span>
            </td>
            <td>
              {!stats1.noPath && !stats2.noPath
                ? 'Both reached target'
                : stats1.noPath && stats2.noPath
                ? 'Both blocked'
                : stats1.noPath
                ? `${algo2Name} reached target`
                : `${algo1Name} reached target`}
            </td>
          </tr>

          <tr>
            <td className="metric-label">Cells Explored</td>
            <td className={betterExplored === 1 ? 'highlight-cell' : ''}>
              {stats1.explored} {betterExplored === 1 && '⭐'}
            </td>
            <td className={betterExplored === 2 ? 'highlight-cell' : ''}>
              {stats2.explored} {betterExplored === 2 && '⭐'}
            </td>
            <td>
              {betterExplored === 0
                ? 'Equal exploration'
                : `${betterExplored === 1 ? algo1Name : algo2Name} explored fewer cells`}
            </td>
          </tr>

          <tr>
            <td className="metric-label">Path Length (steps)</td>
            <td>{stats1.pathLength} steps</td>
            <td>{stats2.pathLength} steps</td>
            <td>
              {stats1.pathLength === stats2.pathLength
                ? 'Identical step count'
                : `${stats1.pathLength < stats2.pathLength ? algo1Name : algo2Name} has fewer steps`}
            </td>
          </tr>

          <tr>
            <td className="metric-label">Total Path Cost</td>
            <td className={betterCost === 1 ? 'highlight-cell' : ''}>
              {stats1.pathCost} {betterCost === 1 && '⭐'}
            </td>
            <td className={betterCost === 2 ? 'highlight-cell' : ''}>
              {stats2.pathCost} {betterCost === 2 && '⭐'}
            </td>
            <td>
              {betterCost === 0
                ? 'Identical path cost'
                : `${betterCost === 1 ? algo1Name : algo2Name} found cheaper route`}
            </td>
          </tr>

          <tr>
            <td className="metric-label">Algorithm Time (ms)</td>
            <td className={betterTime === 1 ? 'highlight-cell' : ''}>
              {stats1.timeMs} ms {betterTime === 1 && '⭐'}
            </td>
            <td className={betterTime === 2 ? 'highlight-cell' : ''}>
              {stats2.timeMs} ms {betterTime === 2 && '⭐'}
            </td>
            <td>
              {betterTime === 0
                ? 'Equal speed'
                : `${betterTime === 1 ? algo1Name : algo2Name} was faster`}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(CompareTable);
