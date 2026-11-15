import React, { useState, useEffect, useCallback } from 'react';

/**
 * GridModal Component
 * 
 * Manages:
 * - "Save Grid": Generates short ID, stores layout to backend, and provides a shareable URL.
 * - "Load Grid": Allows loading by custom ID or browsing the 20 most recent saved grids.
 */
function GridModal({
  isOpen,
  mode, // 'save' | 'load'
  onClose,
  currentLayout, // { start, end, walls, weights }
  apiUrl,
  onLoadGrid, // callback with loaded layout { start, end, walls, weights, name }
}) {
  const [gridName, setGridName] = useState('My Custom Maze');
  const [savedUrl, setSavedUrl] = useState('');
  const [savedId, setSavedId] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load mode state
  const [manualId, setManualId] = useState('');
  const [recentGrids, setRecentGrids] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const fetchRecentGrids = useCallback(async () => {
    setIsLoadingList(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${apiUrl}/api/grids`);
      const data = await response.json();
      if (data.success && Array.isArray(data.grids)) {
        setRecentGrids(data.grids);
      } else {
        setErrorMsg('Could not fetch grid list.');
      }
    } catch (err) {
      console.error('Failed to load recent grids:', err);
      setErrorMsg('Failed to connect to backend server. Make sure the backend is running.');
    } finally {
      setIsLoadingList(false);
    }
  }, [apiUrl]);

  // Fetch recent grids when opening in 'load' mode
  useEffect(() => {
    if (isOpen && mode === 'load') {
      fetchRecentGrids();
    }
    if (isOpen && mode === 'save') {
      setSavedUrl('');
      setSavedId('');
      setCopySuccess(false);
      setErrorMsg('');
    }
  }, [isOpen, mode, fetchRecentGrids]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setCopySuccess(false);

    try {
      // Serialize walls and weights
      const wallsArray = Array.from(currentLayout.walls);
      const weightsArray = Array.from(currentLayout.weights.entries()).map(([cell, weight]) => ({
        cell,
        weight,
      }));

      const payload = {
        name: gridName,
        start: currentLayout.start,
        end: currentLayout.end,
        walls: wallsArray,
        weights: weightsArray,
      };

      const res = await fetch(`${apiUrl}/api/grids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.id) {
        const shareLink = `${window.location.origin}/?grid=${data.id}`;
        setSavedId(data.id);
        setSavedUrl(shareLink);
      } else {
        setErrorMsg(data.error || 'Failed to save grid.');
      }
    } catch (err) {
      console.error('Error saving grid:', err);
      setErrorMsg('Network error: Unable to contact backend API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!savedUrl) return;
    navigator.clipboard.writeText(savedUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const handleLoadById = async (idToLoad) => {
    const id = idToLoad || manualId.trim();
    if (!id) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${apiUrl}/api/grids/${id}`);
      const data = await res.json();
      if (data.success && data.grid) {
        onLoadGrid(data.grid);
        onClose();
      } else {
        setErrorMsg(data.error || `Grid with ID "${id}" was not found.`);
      }
    } catch (err) {
      console.error('Error loading grid:', err);
      setErrorMsg('Network error: Unable to connect to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'save' ? '💾 Save & Share Grid' : '📂 Load Saved Grid'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && <div className="modal-error-alert">{errorMsg}</div>}

          {mode === 'save' ? (
            /* Save Mode Content */
            <div>
              {!savedUrl ? (
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label htmlFor="grid-name-input" className="form-label">
                      Grid Name:
                    </label>
                    <input
                      id="grid-name-input"
                      type="text"
                      className="form-input"
                      value={gridName}
                      onChange={(e) => setGridName(e.target.value)}
                      placeholder="e.g. Spiral Labyrinth"
                      required
                      maxLength={80}
                    />
                  </div>

                  <div className="grid-summary-card">
                    <div className="summary-item">
                      <span className="summary-label">Start Cell:</span>
                      <span className="summary-value">{currentLayout.start}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Target Cell:</span>
                      <span className="summary-value">{currentLayout.end}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Walls:</span>
                      <span className="summary-value">{currentLayout.walls.size} cells</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Mud (weight 5):</span>
                      <span className="summary-value">{currentLayout.weights.size} cells</span>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-visualize" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save & Get Shareable Link'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Post-Save Share Link Display */
                <div className="saved-success-box">
                  <div className="success-badge">✅ Grid Saved Successfully!</div>
                  <p className="saved-id-text">
                    Short ID: <strong>{savedId}</strong>
                  </p>
                  <label className="form-label">Shareable Link:</label>
                  <div className="share-link-row">
                    <input
                      type="text"
                      readOnly
                      value={savedUrl}
                      className="form-input share-url-input"
                    />
                    <button className="btn btn-visualize" onClick={handleCopyLink}>
                      {copySuccess ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  <p className="share-hint">
                    Anyone opening this URL will load this exact maze layout instantly.
                  </p>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Load Mode Content */
            <div>
              {/* Load by direct short ID */}
              <div className="form-group">
                <label htmlFor="manual-id-input" className="form-label">
                  Enter Grid ID:
                </label>
                <div className="share-link-row">
                  <input
                    id="manual-id-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. a3f8c1"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                  />
                  <button
                    className="btn btn-visualize"
                    onClick={() => handleLoadById()}
                    disabled={isSubmitting || !manualId.trim()}
                  >
                    Load
                  </button>
                </div>
              </div>

              {/* List of recent 20 saved grids */}
              <div className="recent-grids-section">
                <h4 className="recent-grids-title">Latest Saved Grids</h4>
                {isLoadingList ? (
                  <div className="loading-spinner-row">Loading community grids...</div>
                ) : recentGrids.length === 0 ? (
                  <div className="empty-grids-notice">No saved grids found yet. Save one!</div>
                ) : (
                  <div className="recent-grids-list">
                    {recentGrids.map((g) => (
                      <div key={g.shortId} className="recent-grid-item">
                        <div className="grid-item-info">
                          <span className="grid-item-name">{g.name || 'Untitled Grid'}</span>
                          <span className="grid-item-meta">
                            ID: <code>{g.shortId}</code> &bull; Walls: {g.walls?.length || 0} &bull; Mud: {g.weights?.length || 0}
                          </span>
                        </div>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleLoadById(g.shortId)}
                          disabled={isSubmitting}
                        >
                          Load
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(GridModal);
