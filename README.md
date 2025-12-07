# 🛰️ Space Debris Analysis & Prediction Dashboard

An interactive web-based platform for modeling, visualizing, and predicting satellite orbits and collision risks using machine learning. Built with React, Three.js, and Flask.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

### 📊 Interactive 3D Visualization
- Real-time rotating Earth model with accurate scale
- Multiple satellite orbit paths with color coding
- Grid system and axis helpers (X, Y, Z)
- Distance reference rings (7000km, 10000km)
- Mouse controls: drag to rotate, scroll to zoom
- Hover tooltips showing exact coordinates
- Camera position tracking

### 🎛️ Control Panel
- System status monitoring (LSTM & XGBoost models)
- Dataset statistics (total satellites, records)
- Multi-satellite selection with color indicators
- Add/remove satellites dynamically
- Visual satellite list with color-coded orbits

### 🤖 Machine Learning Predictions

#### Trajectory Forecasting
- 24-hour position prediction using LSTM
- Outputs X, Y, Z coordinates in kilometers
- Satellite-specific trajectory analysis

#### Collision Risk Assessment
- Compare any two satellites
- Calculate distance between orbits
- Predict collision probability (0-100%)
- Risk level classification (HIGH/MEDIUM/LOW)
- Color-coded risk indicators

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm (comes with Node.js)

### Installation & Setup

#### Option 1: Automated Setup (Recommended)
```bash
# Windows PowerShell
.\setup-and-start.ps1

# This will:
# - Check Python and Node.js
# - Install all dependencies
# - Start both backend and frontend
```

#### Option 2: Manual Setup
```bash
# 1. Install Backend Dependencies
cd backend
pip install -r requirements.txt

# 2. Install Frontend Dependencies
cd ../frontend
npm install

# 3. Start Backend (Terminal 1)
cd backend
python app.py
# Backend runs on http://localhost:5000

# 4. Start Frontend (Terminal 2)
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

#### Option 3: Standalone Version (No npm required)
```bash
cd backend
python app.py
# Then open standalone/index.html in your browser
```

### Verify Installation
```bash
python check_setup.py
```

## 📖 Usage Guide

### Basic Workflow
1. **Start the servers** (backend first, then frontend)
2. **Add satellites** from the sidebar dropdown
3. **View orbits** in the 3D visualization
4. **Predict trajectories** for individual satellites
5. **Assess collision risks** between satellite pairs

### Controls
- **🖱️ Left Click + Drag**: Rotate camera around Earth
- **🔍 Scroll Wheel**: Zoom in/out
- **🎯 Hover**: View coordinates on Earth surface

### Adding Satellites
1. Click the "Add satellite..." dropdown in the sidebar
2. Select a satellite (e.g., NORAD 51)
3. The orbit appears in the 3D view with a unique color
4. Repeat to add more satellites (up to 4 recommended)

### Trajectory Prediction
1. Select a satellite from the dropdown or use a selected one
2. Click "Predict Trajectory"
3. View 24-hour position forecast (X, Y, Z coordinates)

### Collision Risk Analysis
1. Select two satellites (or use first two selected)
2. Click "Assess Risk"
3. View distance, probability, and risk level

## 🏗️ Project Structure

```
space-debris-dashboard/
├── backend/              # Flask API Server
│   ├── app.py           # Main API with ML endpoints
│   ├── requirements.txt # Python dependencies
│   └── test_api.py      # API test suite
│
├── frontend/            # React Application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.js       # Main app
│   │   └── index.js     # Entry point
│   └── package.json     # npm dependencies
│
├── model/               # ML data files
│   └── space_debris_with_engineered_features.csv
│
├── standalone/          # No-build alternative
│   └── index.html       # Single-file dashboard
│
└── docs/                # Documentation
    ├── README.md        # This file
    ├── QUICKSTART.md    # Quick setup guide
    ├── INSTALL.md       # Detailed installation
    └── DEVELOPMENT.md   # Developer guide
```

## 🔧 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend Framework | React | 18.2.0 |
| 3D Graphics | Three.js | 0.160.0 |
| 3D React Integration | React Three Fiber | 8.15.0 |
| Backend Framework | Flask | 3.0.0 |
| Data Processing | Pandas | 2.2+ |
| Numerical Computing | NumPy | 1.26+ |
| ML Framework | Scikit-learn | 1.4+ |
| HTTP Client | Axios | 1.6.2 |

## 📊 API Endpoints

### Backend API (http://localhost:5000/api)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | System and model status |
| `/satellites` | GET | List of available satellites |
| `/orbit/<id>` | GET | Orbital trajectory data |
| `/predict/trajectory` | POST | LSTM trajectory forecast |
| `/predict/collision` | POST | XGBoost collision risk |

## 🎨 Features in Detail

### 3D Visualization
- **Earth Model**: 6,371 km radius sphere with realistic materials
- **Orbit Paths**: Calculated from TLE data, rendered as smooth lines
- **Grid System**: 40,000 km grid with 20 divisions
- **Axis Labels**: X (red), Y (green), Z (blue) with distance markers
- **Reference Rings**: Orbital altitude indicators at 7,000 and 10,000 km

### ML Models
- **LSTM**: Recurrent neural network for time-series trajectory prediction
- **XGBoost**: Gradient boosting for collision probability classification
- **Features**: Orbital elements (eccentricity, inclination, semi-major axis)

## 🔬 Data Format

The system uses orbital elements from TLE (Two-Line Element) data:
- NORAD Catalog ID
- Epoch (timestamp)
- Mean Motion
- Eccentricity
- Inclination
- Right Ascension of Ascending Node
- Argument of Perigee
- Mean Anomaly

## 🚧 Development

### Running Tests
```bash
# Backend API tests
cd backend
python test_api.py

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build
# Output in frontend/build/

# Backend production server
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get up and running fast
- [Installation Guide](INSTALL.md) - Detailed setup instructions
- [Development Guide](DEVELOPMENT.md) - Integrate your ML models
- [Features Overview](FEATURES.md) - Complete feature list
- [Project Structure](PROJECT_STRUCTURE.md) - Architecture details

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Install dependencies: `pip install -r backend/requirements.txt`

### Frontend won't start
- Ensure Node.js 16+ is installed
- Delete `node_modules` and run `npm install` again

### 3D visualization not showing
- Check browser console for errors
- Ensure backend is running on port 5000
- Try the standalone version

### CORS errors
- Backend must run on localhost:5000
- Frontend on localhost:3000

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

Built for space debris analysis and collision prevention research.

## 🙏 Acknowledgments

- NASA for TLE data standards
- Three.js community for 3D graphics
- React community for UI framework
- Space-Track.org for orbital data

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting guide

---

**⚠️ Note**: This dashboard uses mock ML models for demonstration. Replace with trained models for production use. See [DEVELOPMENT.md](DEVELOPMENT.md) for integration instructions.
