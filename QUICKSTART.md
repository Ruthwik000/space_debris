# Quick Start Guide

## Option 1: Full React App (Recommended)

### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3: Run the Application
Double-click `start.bat` or run manually:

Terminal 1 (Backend):
```bash
cd backend
python app.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

Access at: http://localhost:3000

---

## Option 2: Standalone HTML (No npm required)

### Step 1: Start Backend Only
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Step 2: Open HTML File
Open `standalone/index.html` in your browser

---

## Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed
- Install dependencies: `pip install flask flask-cors pandas numpy scikit-learn`

### Frontend won't start
- Make sure Node.js 16+ is installed
- Delete `node_modules` and run `npm install` again

### 3D visualization not showing
- Check browser console for errors
- Make sure backend is running on port 5000
- Try the standalone version

### CORS errors
- Backend must be running on localhost:5000
- Frontend on localhost:3000 or open standalone HTML directly

---

## Using the Dashboard

1. **Select a Satellite**: Choose from dropdown in sidebar
2. **View Orbit**: 3D visualization updates automatically
3. **Predict Trajectory**: Click button to forecast 24h position
4. **Assess Collision Risk**: Select second satellite and click "Assess Risk"

---

## Next Steps

Replace mock ML models in `backend/app.py`:
- Load your trained LSTM model for trajectory prediction
- Load your trained XGBoost model for collision risk assessment
- Update prediction logic with actual model inference
