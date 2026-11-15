import React from 'react';

/**
 * StepControls Component
 * 
 * Provides interactive step-by-step playback controls:
 * - Play / Pause button
 * - Previous Step button (step backward through exploration/path)
 * - Next Step button (step forward node-by-node)
 * - Interactive Progress Bar (scrub to any point in the search)
 */
function StepControls({
  stepIndex,
  totalSteps,
  isPlaying,
  onPlayPause,
  onNextStep,
  onPrevStep,
  onSeekStep,
}) {
  if (totalSteps <= 0) {
    return null;
  }

  const progressPercent = totalSteps > 0 ? Math.round((stepIndex / totalSteps) * 100) : 0;
  const isFinished = stepIndex >= totalSteps;

  return (
    <div className="step-controls-panel">
      <div className="step-buttons-group">
        {/* Previous Step Button */}
        <button
          className="btn btn-step"
          onClick={onPrevStep}
          disabled={stepIndex <= 0}
          title="Step backward by 1 cell"
        >
          &#9198; Prev Step
        </button>

        {/* Play / Pause Toggle Button */}
        <button
          className={`btn ${isPlaying ? 'btn-pause' : 'btn-play'}`}
          onClick={onPlayPause}
          title={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? (
            <>&#10074;&#10074; Pause</>
          ) : isFinished ? (
            <>&#8635; Replay</>
          ) : (
            <>&#9658; Play</>
          )}
        </button>

        {/* Next Step Button */}
        <button
          className="btn btn-step"
          onClick={onNextStep}
          disabled={isFinished}
          title="Step forward by 1 cell"
        >
          Next Step &#9197;
        </button>
      </div>

      {/* Progress Bar & Step Counter */}
      <div className="step-progress-group">
        <div className="step-progress-header">
          <span className="step-count-label">
            Step: <strong>{stepIndex}</strong> / {totalSteps}
          </span>
          <span className="step-percent-badge">{progressPercent}%</span>
        </div>

        <input
          type="range"
          min="0"
          max={totalSteps}
          value={stepIndex}
          onChange={(e) => onSeekStep(Number(e.target.value))}
          className="step-progress-slider"
          aria-label="Seek animation step"
        />
      </div>
    </div>
  );
}

export default React.memo(StepControls);
