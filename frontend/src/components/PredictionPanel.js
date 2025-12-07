import React, { useState } from 'react';
import './PredictionPanel.css';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function PredictionPanel({ satellites, selectedSats }) {
  const [trajectoryResult, setTrajectoryResult] = useState(null);
  const [collisionResult, setCollisionResult] = useState(null);
  const [trajectorySat, setTrajectorySat] = useState('');
  const [collisionSat1, setCollisionSat1] = useState('');
  const [collisionSat2, setCollisionSat2] = useState('');
  const [loading, setLoading] = useState(false);

  const predictTrajectory = async () => {
    const satId = trajectorySat || (selectedSats.length > 0 ? selectedSats[0] : null);
    if (!satId) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/predict/trajectory`, {
        sat_id: Number(satId),
        hours: 24
      });
      setTrajectoryResult(res.data);
    } catch (err) {
      console.error('Error predicting trajectory:', err);
    }
    setLoading(false);
  };

  const predictCollision = async () => {
    const sat1 = collisionSat1 || (selectedSats.length > 0 ? selectedSats[0] : null);
    const sat2 = collisionSat2 || (selectedSats.length > 1 ? selectedSats[1] : null);
    
    if (!sat1 || !sat2) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/predict/collision`, {
        sat1_id: Number(sat1),
        sat2_id: Number(sat2)
      });
      setCollisionResult(res.data);
    } catch (err) {
      console.error('Error predicting collision:', err);
    }
    setLoading(false);
  };

  return (
    <div className="prediction-panel">
      <div className="prediction-module">
        <h3>Trajectory Forecasting</h3>
        <p>Predict future satellite position (24h)</p>
        <div className="input-group">
          <label>Select Satellite:</label>
          <select value={trajectorySat} onChange={(e) => setTrajectorySat(e.target.value)}>
            <option value="">Use first selected...</option>
            {satellites.map(sat => (
              <option key={sat} value={sat}>NORAD {sat}</option>
            ))}
          </select>
        </div>
        <button onClick={predictTrajectory} disabled={(!trajectorySat && selectedSats.length === 0) || loading}>
          {loading ? 'Calculating...' : 'Predict Trajectory'}
        </button>
        
        {trajectoryResult && (
          <div className="result">
            <div className="result-item">
              <label>Satellite:</label>
              <span>NORAD {trajectoryResult.sat_id}</span>
            </div>
            <div className="result-item">
              <label>24h Position:</label>
              <span>
                X: {trajectoryResult.predictions[23]?.x.toFixed(2)} km<br/>
                Y: {trajectoryResult.predictions[23]?.y.toFixed(2)} km<br/>
                Z: {trajectoryResult.predictions[23]?.z.toFixed(2)} km
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="prediction-module">
        <h3>Collision Risk Assessment</h3>
        <p>Compare two satellites</p>
        <div className="input-group">
          <label>Satellite 1:</label>
          <select value={collisionSat1} onChange={(e) => setCollisionSat1(e.target.value)}>
            <option value="">Use first selected...</option>
            {satellites.map(sat => (
              <option key={sat} value={sat}>NORAD {sat}</option>
            ))}
          </select>
        </div>
        <div className="input-group">
          <label>Satellite 2:</label>
          <select value={collisionSat2} onChange={(e) => setCollisionSat2(e.target.value)}>
            <option value="">Use second selected...</option>
            {satellites.map(sat => (
              <option key={sat} value={sat}>NORAD {sat}</option>
            ))}
          </select>
        </div>
        <button onClick={predictCollision} disabled={(!collisionSat1 && !collisionSat2 && selectedSats.length < 2) || loading}>
          {loading ? 'Analyzing...' : 'Assess Risk'}
        </button>
        
        {collisionResult && (
          <div className="result">
            <div className="result-item">
              <label>Distance:</label>
              <span>{collisionResult.distance_km.toFixed(2)} km</span>
            </div>
            <div className="result-item">
              <label>Collision Probability:</label>
              <span className={`risk-${collisionResult.risk_level.toLowerCase()}`}>
                {(collisionResult.collision_probability * 100).toFixed(2)}%
              </span>
            </div>
            <div className="result-item">
              <label>Risk Level:</label>
              <span className={`risk-badge risk-${collisionResult.risk_level.toLowerCase()}`}>
                {collisionResult.risk_level}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionPanel;
