import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ status, satellites, onSelectSatellites }) {
  const [selectedSats, setSelectedSats] = useState([]);

  const handleAddSatellite = (e) => {
    const satId = Number(e.target.value);
    if (satId && !selectedSats.includes(satId)) {
      const newSelection = [...selectedSats, satId];
      setSelectedSats(newSelection);
      onSelectSatellites(newSelection);
    }
  };

  const handleRemoveSatellite = (satId) => {
    const newSelection = selectedSats.filter(s => s !== satId);
    setSelectedSats(newSelection);
    onSelectSatellites(newSelection);
  };

  return (
    <div className="sidebar">
      <h1 className="title">Space Debris<br/>Analysis</h1>
      
      <div className="status-section">
        <h3>System Status</h3>
        {status && (
          <>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>LSTM Model: Loaded</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>XGBoost: Loaded</span>
            </div>
            <div className="info-item">
              <label>Satellites:</label>
              <span>{status.total_satellites}</span>
            </div>
            <div className="info-item">
              <label>Records:</label>
              <span>{status.total_records}</span>
            </div>
          </>
        )}
      </div>

      <div className="satellite-selector">
        <h3>Select Satellites</h3>
        <select onChange={handleAddSatellite} value="">
          <option value="">Add satellite...</option>
          {satellites.filter(s => !selectedSats.includes(s)).map(sat => (
            <option key={sat} value={sat}>NORAD {sat}</option>
          ))}
        </select>

        <div className="selected-satellites">
          {selectedSats.map((sat, idx) => (
            <div key={sat} className="selected-sat-item">
              <span className="sat-color" style={{ backgroundColor: ['#ff5252', '#4fc3f7', '#ffeb3b', '#4caf50'][idx % 4] }}></span>
              <span>NORAD {sat}</span>
              <button className="remove-btn" onClick={() => handleRemoveSatellite(sat)}>×</button>
            </div>
          ))}
          {selectedSats.length === 0 && (
            <p className="no-selection">No satellites selected</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
