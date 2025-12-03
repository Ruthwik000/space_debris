import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { 
  FileText, 
  CheckCircle, 
  Database, 
  Settings, 
  Menu, 
  X,
  Cpu,
  Globe,
  Satellite,
  AlertTriangle,
  Activity,
  Crosshair,
  TrendingUp,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Search,
  Trash2
} from 'lucide-react';

// --- Embedded Dataset (Simulating space_debris_combined.csv & TLEs) ---
// Format: ID, Name, Type, Country, MeanMotion(n), Eccentricity(e), Inclination(i), RAAN(Omega), ArgPerigee(w), MeanAnomaly(M)
const RAW_SPACE_DATA = `
5,VANGUARD 1,PAYLOAD,US,10.8592,0.1841,34.24,198.95,169.35,195.22
11,VANGUARD 2,PAYLOAD,US,11.8996,0.1448,32.86,185.57,81.92,294.26
51,ECHO 1 DEB,DEBRIS,US,12.1836,0.0106,47.21,293.76,348.94,10.90
65010,COSMOS 970 DEB,DEBRIS,CIS,13.6265,0.0127,65.82,24.79,64.55,316.04
25544,ISS (ZARYA),PAYLOAD,ISS,15.49,0.0007,51.64,25.0,90.0,180.0
65004,COSMOS DEB 65004,DEBRIS,CIS,13.9219,0.0130,65.90,330.00,260.44,98.18
121,TIANHE DEB,DEBRIS,PRC,14.0015,0.0098,66.74,97.09,226.16,133.12
124,FENGYUN DEB,DEBRIS,PRC,14.3511,0.0072,66.54,351.72,342.10,17.75
44235,STARLINK-1008,PAYLOAD,US,15.06,0.0001,53.0,100.0,0.0,0.0
44237,STARLINK-1010,PAYLOAD,US,15.06,0.0001,53.0,110.0,0.0,10.0
90001,UNKNOWN DEB A,DEBRIS,UNK,13.2,0.05,45.0,120.0,45.0,10.0
90002,UNKNOWN DEB B,DEBRIS,UNK,12.8,0.08,88.0,200.0,180.0,150.0
`.trim();

const App = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [satellites, setSatellites] = useState([]);
  const [selectedSatIds, setSelectedSatIds] = useState(['25544', '51', '65010']); // Default selection
  const [plotData, setPlotData] = useState([]);
  
  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // AI Feature State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [objectIntel, setObjectIntel] = useState(null);
  const [isIntelLoading, setIsIntelLoading] = useState(false);

  // Collision Analysis State
  const [collisionSatA, setCollisionSatA] = useState('');
  const [collisionSatB, setCollisionSatB] = useState('');
  const [collisionRisk, setCollisionRisk] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Next Position State
  const [nextPositions, setNextPositions] = useState({});

  // --- Data Parsing on Mount ---
  useEffect(() => {
    const lines = RAW_SPACE_DATA.split('\n');
    const parsed = lines.map(line => {
      const [id, name, type, country, n, e, i, raan, w, m] = line.split(',');
      return {
        id,
        name,
        type,
        country,
        meanMotion: parseFloat(n),
        eccentricity: parseFloat(e),
        inclination: parseFloat(i),
        raan: parseFloat(raan),
        argPerigee: parseFloat(w),
        meanAnomaly: parseFloat(m)
      };
    });
    setSatellites(parsed);
  }, []);

  // --- Physics Engine (Keplerian) ---
  
  // Convert Keplerian elements to Cartesian Coordinates (ECI)
  const keplerToCartesian = (earthRadius, a, e, i_deg, raan_deg, w_deg, theta_rad) => {
    // Convert degrees to radians
    const i = i_deg * (Math.PI / 180);
    const raan = raan_deg * (Math.PI / 180);
    const w = w_deg * (Math.PI / 180);

    // 1. Position in orbital plane (Polar equation of ellipse)
    // r = a(1-e^2) / (1 + e*cos(theta))
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta_rad));

    // 2. Position in Perifocal Frame
    const x_per = r * Math.cos(theta_rad);
    const y_per = r * Math.sin(theta_rad);
    
    // 3. Rotate to Geocentric Equatorial Frame (3-1-3 Euler rotation sequence usually, but here standard orbital elements matrix)
    // X = x_per * (cos(raan)cos(w+theta) - sin(raan)sin(w+theta)cos(i)) ... simplified below:
    
    // We rotate Perifocal to ECI:
    // P = x_per, Q = y_per
    const cos_raan = Math.cos(raan);
    const sin_raan = Math.sin(raan);
    const cos_w = Math.cos(w);
    const sin_w = Math.sin(w);
    const cos_i = Math.cos(i);
    const sin_i = Math.sin(i);

    // Coordinate transformation matrix elements
    // const Px = cos_raan * cos_w - sin_raan * sin_w * cos_i;
    // const Py = sin_raan * cos_w + cos_raan * sin_w * cos_i;
    // const Pz = sin_w * sin_i;
    
    // const Qx = -cos_raan * sin_w - sin_raan * cos_w * cos_i;
    // const Qy = -sin_raan * sin_w + cos_raan * cos_w * cos_i;
    // const Qz = cos_w * sin_i;

    // We can use True Anomaly directly for drawing the path if we assume perigee is at theta=0 in perifocal
    // Actually, x_per and y_per above are calculated relative to periapsis.
    // So we apply the rotations to x_per and y_per directly.
    
    // Standard rotation matrix application:
    const X = x_per * (cos_raan * Math.cos(w) - sin_raan * Math.sin(w) * cos_i) - y_per * (cos_raan * Math.sin(w) + sin_raan * Math.cos(w) * cos_i);
    const Y = x_per * (sin_raan * Math.cos(w) + cos_raan * Math.sin(w) * cos_i) - y_per * (sin_raan * Math.sin(w) - cos_raan * Math.cos(w) * cos_i);
    const Z = x_per * (Math.sin(w) * sin_i) + y_per * (Math.cos(w) * sin_i);

    return { x: X, y: Y, z: Z };
  };

  // --- Gemini API Integration ---

  const generateGeminiContent = async (prompt) => {
    if (!apiKey) {
      alert("Please enter your Gemini API Key in Settings (⚙️) to use AI features.");
      return null;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      alert(`AI Error: ${error.message}`);
      return null;
    }
  };

  const analyzeRiskWithGemini = async () => {
    if (!collisionRisk) return;
    setIsAiLoading(true);
    setAiAnalysis(null);

    const prompt = `
      You are a Space Domain Awareness (SDA) Analyst AI.
      Analyze the following potential satellite collision:
      
      Object A: ${collisionSatA}
      Object B: ${collisionSatB}
      Risk Level: ${collisionRisk.level}
      Collision Probability: ${collisionRisk.probability}
      Time of Closest Approach (TCA): ${collisionRisk.tca}

      Provide a concise Tactical Risk Assessment (max 150 words) including:
      1. Severity interpretation.
      2. Likely relative velocity impact consequences.
      3. Recommended maneuver (e.g., COLA - Collision Avoidance).
      Format with clear headers. Use technical but clear language.
    `;

    const result = await generateGeminiContent(prompt);
    setAiAnalysis(result);
    setIsAiLoading(false);
  };

  const analyzeObjectWithGemini = async (satName) => {
    setIsIntelLoading(true);
    setObjectIntel(null);
    
    const prompt = `
      Identify the satellite or space object named "${satName}".
      Provide a brief "Object Intelligence Card" (max 100 words) containing:
      1. Origin/Operator (e.g., SpaceX, Roscosmos).
      2. Mission Type (Communications, Debris, Weather, etc.).
      3. Orbital Regime (LEO, MEO, GEO).
      4. One interesting fact or specific risk factor.
    `;

    const result = await generateGeminiContent(prompt);
    setObjectIntel({ name: satName, content: result });
    setIsIntelLoading(false);
  };

  // --- Plot Generation ---
  useEffect(() => {
    const earthRadius = 6371;
    const mu = 398600.4418; // Standard gravitational parameter km^3/s^2

    // 1. Earth Mesh
    const u = Array.from({ length: 30 }, (_, i) => (i * 2 * Math.PI) / 29);
    const v = Array.from({ length: 15 }, (_, i) => (i * Math.PI) / 14);
    const x_sphere = [], y_sphere = [], z_sphere = [];
    
    for (let i = 0; i < u.length; i++) {
      const row_x = [], row_y = [], row_z = [];
      for (let j = 0; j < v.length; j++) {
        row_x.push(earthRadius * Math.cos(u[i]) * Math.sin(v[j]));
        row_y.push(earthRadius * Math.sin(u[i]) * Math.sin(v[j]));
        row_z.push(earthRadius * Math.cos(v[j]));
      }
      x_sphere.push(row_x);
      y_sphere.push(row_y);
      z_sphere.push(row_z);
    }

    const earthTrace = {
      type: 'surface',
      x: x_sphere, y: y_sphere, z: z_sphere,
      showscale: false,
      colorscale: [[0, 'rgb(0, 5, 20)'], [0.5, 'rgb(0, 40, 100)'], [1, 'rgb(0, 100, 200)']],
      opacity: 0.9,
      name: 'Earth',
      hoverinfo: 'skip'
    };

    // 2. Satellite Traces
    const traces = [];
    const newNextPositions = {};

    selectedSatIds.forEach((satId, index) => {
      const sat = satellites.find(s => s.id === satId);
      if (!sat) return;

      // Approximate Semi-Major Axis (a) from Mean Motion (n)
      // n in revs/day -> rad/s
      const n_rads = sat.meanMotion * (2 * Math.PI) / 86400;
      const a = Math.cbrt(mu / (n_rads * n_rads));

      const points = 100;
      const x = [], y = [], z = [];
      
      // Full Orbit Path (Historical/Projected)
      for (let i = 0; i < points; i++) {
        const theta = (i / points) * 2 * Math.PI; // True Anomaly 0 to 2PI
        const pos = keplerToCartesian(
          earthRadius, 
          a, 
          sat.eccentricity, 
          sat.inclination, 
          sat.raan, 
          sat.argPerigee, 
          theta
        );
        x.push(pos.x); y.push(pos.y); z.push(pos.z);
      }

      // Determine Color based on Type
      const color = sat.type === 'DEBRIS' ? '#ef4444' : '#3b82f6'; // Red for Debris, Blue for Payload

      traces.push({
        type: 'scatter3d',
        mode: 'lines',
        x: x, y: y, z: z,
        line: { width: 3, color: color },
        name: sat.name,
        hoverinfo: 'name'
      });

      // Current Position Marker (Based on Mean Anomaly at Epoch)
      // Simplifying: Approximate True Anomaly ~= Mean Anomaly for visualization
      const currentTheta = sat.meanAnomaly * (Math.PI / 180);
      const curPos = keplerToCartesian(earthRadius, a, sat.eccentricity, sat.inclination, sat.raan, sat.argPerigee, currentTheta);
      
      newNextPositions[sat.name] = {
        x: curPos.x.toFixed(0),
        y: curPos.y.toFixed(0),
        z: curPos.z.toFixed(0),
        type: sat.type
      };

      traces.push({
        type: 'scatter3d',
        mode: 'markers',
        x: [curPos.x], y: [curPos.y], z: [curPos.z],
        marker: { size: 3, color: '#ffffff', symbol: 'circle' },
        name: sat.name,
        showlegend: false
      });
    });

    setNextPositions(newNextPositions);
    setPlotData([earthTrace, ...traces]);
  }, [selectedSatIds, satellites]);

  const toggleSatellite = (id) => {
    if (selectedSatIds.includes(id)) {
      setSelectedSatIds(selectedSatIds.filter(s => s !== id));
    } else {
      setSelectedSatIds([...selectedSatIds, id]);
    }
  };

  const calculateCollisionRisk = () => {
    if (!collisionSatA || !collisionSatB || collisionSatA === collisionSatB) {
      setCollisionRisk({ error: "Select two different objects" });
      return;
    }
    
    setIsCalculating(true);
    setCollisionRisk(null);
    setAiAnalysis(null);

    // Mock Calculation Logic (Simulating Advanced Propagation)
    setTimeout(() => {
      const satA = satellites.find(s => s.name === collisionSatA);
      const satB = satellites.find(s => s.name === collisionSatB);
      
      let riskLevel = "Low";
      let prob = 0.001;

      // Simple heuristic for mock: if both are same plane (inclination close), higher risk
      if (satA && satB) {
        const dInc = Math.abs(satA.inclination - satB.inclination);
        if (dInc < 2) {
          riskLevel = "High";
          prob = 4.5 + Math.random();
        } else if (dInc < 10) {
          riskLevel = "Moderate";
          prob = 0.8 + Math.random();
        }
      }

      setCollisionRisk({
        level: riskLevel,
        probability: prob.toFixed(4) + '%',
        tca: 'T+ 02:14:55' 
      });
      setIsCalculating(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-[#0f0f13] text-gray-200 font-sans overflow-hidden">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1f1f2b] p-6 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-blue-400" />
                System Settings
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gemini API Key</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here..."
                  className="w-full bg-[#13131a] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-500 mt-2">
                  Required for AI features. Key is stored in memory only.
                </p>
              </div>
              
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-gray-800 rounded-md hover:bg-gray-700"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 fixed lg:static inset-y-0 left-0 w-80 bg-[#16161e] border-r border-gray-800 z-40 flex flex-col`}>
        
        <div className="p-6 border-b border-gray-800 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="text-red-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                DebrisDash
              </h1>
            </div>
            <p className="text-xs text-gray-500">Space Debris Analysis & Prediction</p>
          </div>
          <button onClick={() => setShowSettings(true)} className="text-gray-500 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* Collision Risk Calculator */}
          <div className="bg-[#1f1f2b] rounded-xl p-4 border border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-4 text-orange-400">
              <ShieldAlert size={18} />
              <h2 className="font-semibold text-sm">Collision Risk Calculator</h2>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1 block">Sat A</label>
                  <select 
                    className="w-full bg-[#13131a] border border-gray-700 rounded p-2 text-[10px] text-gray-300 focus:border-blue-500 outline-none"
                    value={collisionSatA}
                    onChange={(e) => setCollisionSatA(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {satellites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1 block">Sat B</label>
                  <select 
                    className="w-full bg-[#13131a] border border-gray-700 rounded p-2 text-[10px] text-gray-300 focus:border-blue-500 outline-none"
                    value={collisionSatB}
                    onChange={(e) => setCollisionSatB(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {satellites.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={calculateCollisionRisk}
                disabled={isCalculating}
                className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wide transition-all ${
                  isCalculating 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/20'
                }`}
              >
                {isCalculating ? 'Computing Models...' : 'Calculate Risk'}
              </button>

              {collisionRisk && !collisionRisk.error && (
                <div className="mt-3">
                  <div className="p-3 bg-black/20 rounded border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Probability:</span>
                      <span className="text-sm font-mono font-bold text-white">{collisionRisk.probability}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">TCA:</span>
                      <span className="text-xs font-mono text-gray-300">{collisionRisk.tca}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Risk Level:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        collisionRisk.level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                        collisionRisk.level === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        'bg-green-500/20 text-green-400 border border-green-500/50'
                      }`}>
                        {collisionRisk.level}
                      </span>
                    </div>
                  </div>

                  {/* Gemini Feature Button */}
                  <button 
                    onClick={analyzeRiskWithGemini}
                    disabled={isAiLoading}
                    className="w-full mt-3 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 rounded text-xs font-bold transition-all border border-purple-400/30"
                  >
                    {isAiLoading ? (
                      <span className="animate-pulse">Analyzing...</span>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-yellow-300" />
                        <span>AI Risk Assessment ✨</span>
                      </>
                    )}
                  </button>
                  
                  {/* AI Response Area */}
                  {aiAnalysis && (
                    <div className="mt-3 bg-indigo-900/20 border border-indigo-500/30 p-3 rounded text-xs text-gray-300 leading-relaxed animate-in fade-in">
                       <h3 className="font-bold text-indigo-300 mb-1 flex items-center gap-1">
                         <MessageSquare size={12}/> Analyst Report
                       </h3>
                       <div className="whitespace-pre-line">{aiAnalysis}</div>
                    </div>
                  )}
                </div>
              )}
              {collisionRisk?.error && (
                <div className="text-xs text-red-400 text-center mt-2">{collisionRisk.error}</div>
              )}
            </div>
          </div>

          {/* Next Position Data */}
          <div>
            <div className="flex items-center space-x-2 mb-3 text-emerald-400">
              <Crosshair size={18} />
              <h2 className="font-semibold text-sm">Next Position Telemetry</h2>
            </div>
            <div className="bg-[#1f1f2b] rounded-lg p-3 text-xs border border-gray-700/50 max-h-48 overflow-y-auto custom-scrollbar">
              {Object.keys(nextPositions).length === 0 ? (
                <div className="text-gray-500 italic text-center py-2">Select satellites to view telemetry</div>
              ) : (
                Object.entries(nextPositions).map(([satName, pos]) => (
                  <div key={satName} className="mb-3 last:mb-0 border-b border-gray-800 last:border-0 pb-2 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold ${pos.type === 'DEBRIS' ? 'text-red-400' : 'text-blue-300'}`}>{satName}</span>
                      <span className="text-[9px] bg-gray-800 px-1 rounded">{pos.type}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-gray-500">
                      <div>X: <span className="text-gray-300">{pos.x}</span></div>
                      <div>Y: <span className="text-gray-300">{pos.y}</span></div>
                      <div>Z: <span className="text-gray-300">{pos.z}</span></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Satellite Selection List */}
          <div className="bg-[#1f1f2b] rounded-xl p-4 border border-gray-700/50">
             <div className="flex items-center space-x-2 mb-3 text-blue-400">
               <Search size={18} />
               <h2 className="font-semibold text-sm">Orbital Inventory</h2>
             </div>
             
             {/* Object Intel Display */}
             {objectIntel && (
               <div className="mb-4 bg-blue-900/20 border border-blue-500/30 p-3 rounded text-xs animate-in fade-in">
                 <div className="font-bold text-blue-300 mb-2 border-b border-blue-500/20 pb-1">
                   {objectIntel.name}
                 </div>
                 <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                   {objectIntel.content}
                 </div>
               </div>
             )}

             <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {satellites.map(sat => (
                <div key={sat.id} className="flex group bg-[#13131a] rounded-md border border-gray-700/50 hover:border-gray-600 transition-all">
                  <button
                    onClick={() => toggleSatellite(sat.id)}
                    className={`flex-1 px-3 py-2 text-left flex items-center space-x-2 ${
                      selectedSatIds.includes(sat.id) ? 'bg-white/5' : ''
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${sat.type === 'DEBRIS' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                    <div>
                      <div className="text-xs font-medium text-gray-300">{sat.name}</div>
                      <div className="text-[9px] text-gray-600">{sat.country} • {sat.type}</div>
                    </div>
                  </button>
                  <button 
                    onClick={() => analyzeObjectWithGemini(sat.name)}
                    disabled={isIntelLoading}
                    className="px-3 border-l border-gray-700 hover:bg-blue-500/10 hover:text-blue-400 text-gray-500 transition-colors"
                    title="AI Inspect"
                  >
                    {isIntelLoading && objectIntel?.name === sat.name ? (
                      <div className="w-3 h-3 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                    ) : (
                      <Sparkles size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* System Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#13131a] text-xs text-gray-500 flex justify-between items-center">
          <div className="flex items-center space-x-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span>System Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <Cpu size={12} />
            <span>Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex justify-between items-end border-b border-gray-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Globe className="text-blue-500" /> Orbital Visualization
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Real-time LEO monitoring with predictive trajectory modeling.
              </p>
            </div>
            <div className="flex space-x-4 text-xs font-mono text-gray-500">
              <div className="flex items-center space-x-1">
                 <div className="w-3 h-0.5 bg-red-500"></div>
                 <span>Debris (In-Active)</span>
              </div>
              <div className="flex items-center space-x-1">
                 <div className="w-3 h-0.5 bg-blue-500"></div>
                 <span>Payload (Active)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="flex-1 px-8 pb-8 pt-4 min-h-0">
          <div className="h-full bg-[#16161e] rounded-xl border border-gray-800 shadow-2xl overflow-hidden relative group">
            
            {/* Overlay Info */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
               <div className="bg-black/40 backdrop-blur px-3 py-1 rounded border border-gray-700/50 text-xs font-mono text-gray-400">
                 VIEW: GEOCENTRIC (ECI) <br/>
                 PROPAGATOR: KEPLERIAN <br/>
                 OBJECTS: {satellites.length}
               </div>
            </div>

            <Plot
              data={plotData}
              layout={{
                autosize: true,
                paper_bgcolor: '#16161e',
                plot_bgcolor: '#16161e',
                margin: { l: 0, r: 0, b: 0, t: 0 },
                showlegend: false,
                scene: {
                  xaxis: { 
                    title: '', showgrid: true, gridcolor: '#1f2937', zerolinecolor: '#374151',
                    showticklabels: false, backgroundcolor: '#16161e'
                  },
                  yaxis: { 
                    title: '', showgrid: true, gridcolor: '#1f2937', zerolinecolor: '#374151',
                    showticklabels: false, backgroundcolor: '#16161e'
                  },
                  zaxis: { 
                    title: '', showgrid: true, gridcolor: '#1f2937', zerolinecolor: '#374151',
                    showticklabels: false, backgroundcolor: '#16161e'
                  },
                  camera: { eye: { x: 1.8, y: 1.8, z: 1.0 } },
                  aspectratio: { x: 1, y: 1, z: 1 }
                }
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;