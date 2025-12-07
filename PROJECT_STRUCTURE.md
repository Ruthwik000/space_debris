# Project Structure

```
space-debris-dashboard/
│
├── backend/                      # Flask API Server
│   ├── app.py                   # Main API with ML endpoints
│   └── requirements.txt         # Python dependencies
│
├── frontend/                     # React Application
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js       # System status & satellite selector
│   │   │   ├── Sidebar.css
│   │   │   ├── OrbitVisualization.js  # 3D Earth & orbits (Three.js)
│   │   │   ├── PredictionPanel.js     # ML prediction modules
│   │   │   └── PredictionPanel.css
│   │   ├── App.js               # Main app component
│   │   ├── App.css
│   │   ├── index.js             # React entry point
│   │   └── index.css
│   └── package.json             # npm dependencies
│
├── standalone/                   # No-build alternative
│   └── index.html               # Single-file dashboard
│
├── model/                        # ML data files
│   ├── space_debris_ml_ready.csv
│   └── space_debris_with_engineered_features.csv
│
├── start.bat                     # Windows quick start script
├── README.md                     # Project documentation
├── QUICKSTART.md                 # Setup instructions
└── .gitignore

```

## Component Architecture

### Backend (Flask)
- `/api/status` - System and model status
- `/api/satellites` - List of available satellites
- `/api/orbit/<id>` - Orbital trajectory data
- `/api/predict/trajectory` - LSTM trajectory forecasting
- `/api/predict/collision` - XGBoost collision risk assessment

### Frontend (React)
1. **Sidebar Component**
   - Model status indicators
   - Dataset statistics
   - Satellite dropdown selector

2. **OrbitVisualization Component**
   - 3D Earth sphere (Three.js)
   - Satellite orbit paths
   - Interactive camera controls (zoom, rotate, pan)

3. **PredictionPanel Component**
   - Trajectory forecasting module
   - Collision risk assessment module
   - Real-time results display

## Data Flow

```
User selects satellite
    ↓
Frontend → GET /api/orbit/{id} → Backend
    ↓
Backend calculates orbit points
    ↓
Frontend renders 3D visualization
    ↓
User clicks "Predict Trajectory"
    ↓
Frontend → POST /api/predict/trajectory → Backend
    ↓
Backend runs LSTM model
    ↓
Frontend displays predicted coordinates
```

## Technology Stack

- **Frontend**: React 18, Three.js, React Three Fiber, Axios
- **Backend**: Flask 3.0, Pandas, NumPy, Scikit-learn
- **3D Graphics**: Three.js (WebGL)
- **ML Models**: LSTM (trajectory), XGBoost (collision)
