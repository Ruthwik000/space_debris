import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import OrbitVisualization from './components/OrbitVisualization';
import PredictionPanel from './components/PredictionPanel';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [status, setStatus] = useState(null);
  const [satellites, setSatellites] = useState([]);
  const [selectedSats, setSelectedSats] = useState([]);
  const [orbitData, setOrbitData] = useState([]);

  useEffect(() => {
    fetchStatus();
    fetchSatellites();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/status`);
      setStatus(res.data);
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const fetchSatellites = async () => {
    try {
      const res = await axios.get(`${API_URL}/satellites`);
      setSatellites(res.data.satellites);
    } catch (err) {
      console.error('Error fetching satellites:', err);
    }
  };

  const handleSatellitesSelect = async (satIds) => {
    setSelectedSats(satIds);
    
    if (satIds.length === 0) {
      setOrbitData([]);
      return;
    }

    try {
      const orbitPromises = satIds.map(satId => 
        axios.get(`${API_URL}/orbit/${satId}`)
      );
      const results = await Promise.all(orbitPromises);
      setOrbitData(results.map(res => res.data));
    } catch (err) {
      console.error('Error fetching orbits:', err);
    }
  };

  return (
    <div className="app">
      <Sidebar 
        status={status}
        satellites={satellites}
        onSelectSatellites={handleSatellitesSelect}
      />
      <div className="main-content">
        <div className="visualization-container">
          <OrbitVisualization orbitData={orbitData} />
        </div>
        <PredictionPanel 
          satellites={satellites}
          selectedSats={selectedSats}
        />
      </div>
    </div>
  );
}

export default App;
