# Installation Guide

## Prerequisites

Before running the setup script, make sure you have:

1. **Python 3.8+** - [Download](https://www.python.org/downloads/)
   - During installation, check "Add Python to PATH"
   
2. **Node.js 16+** - [Download](https://nodejs.org/)
   - This includes npm (Node Package Manager)

3. **Git** (optional) - For cloning the repository

## Verify Prerequisites

Open PowerShell and run:

```powershell
python --version
node --version
npm --version
```

You should see version numbers for all three.

## Installation Steps

### Option 1: Automated Setup (Recommended)

1. Open PowerShell in the project directory
2. Run the setup script:

```powershell
.\setup-and-start.ps1
```

This will:
- Check Python and Node.js
- Install all backend dependencies (Flask, pandas, etc.)
- Install all frontend dependencies (React, Three.js, etc.)
- Start both servers automatically

### Option 2: Manual Installation

If you prefer to install manually:

**Step 1: Install Backend Dependencies**
```powershell
cd backend
pip install -r requirements.txt
cd ..
```

**Step 2: Install Frontend Dependencies**
```powershell
cd frontend
npm install
cd ..
```

**Step 3: Start Backend**
```powershell
cd backend
python app.py
```

**Step 4: Start Frontend (in new terminal)**
```powershell
cd frontend
npm start
```

## Troubleshooting

### Execution Policy Error

If you get "cannot be loaded because running scripts is disabled":

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Python Not Found

- Make sure Python is installed
- Add Python to PATH:
  - Search "Environment Variables" in Windows
  - Add Python installation folder to PATH

### Node.js Not Found

- Make sure Node.js is installed
- Restart PowerShell after installation

### pip Install Fails

Try upgrading pip first:
```powershell
python -m pip install --upgrade pip
```

### npm Install Fails

Clear npm cache and try again:
```powershell
npm cache clean --force
npm install
```

### Port Already in Use

If port 5000 or 3000 is already in use:

**Backend (port 5000):**
Edit `backend/app.py`, change last line to:
```python
app.run(debug=True, port=5001)  # Use different port
```

**Frontend (port 3000):**
When prompted, press 'Y' to run on different port

### Module Not Found Errors

Make sure you're in the correct directory:
```powershell
# For backend
cd backend
pip install flask flask-cors pandas numpy scikit-learn

# For frontend
cd frontend
npm install react react-dom three @react-three/fiber @react-three/drei axios
```

## Verify Installation

After installation, verify everything works:

```powershell
python check_setup.py
```

This will check:
- Python version
- Required packages
- Data files

## What Gets Installed

### Backend Dependencies (~50MB)
- Flask 3.0.0 - Web framework
- Flask-CORS 4.0.0 - Cross-origin support
- Pandas 2.1.4 - Data processing
- NumPy 1.26.2 - Numerical computing
- Scikit-learn 1.3.2 - ML framework

### Frontend Dependencies (~300MB)
- React 18.2.0 - UI framework
- React-DOM 18.2.0 - React renderer
- Three.js 0.160.0 - 3D graphics
- @react-three/fiber 8.15.0 - React Three.js
- @react-three/drei 9.92.0 - Three.js helpers
- Axios 1.6.2 - HTTP client
- React-Scripts 5.0.1 - Build tools

## Next Steps

Once installed:
1. Backend will run on http://localhost:5000
2. Frontend will run on http://localhost:3000
3. Browser will open automatically
4. Select a satellite and explore!

## Uninstall

To remove all dependencies:

```powershell
# Remove backend dependencies
cd backend
pip uninstall -r requirements.txt -y

# Remove frontend dependencies
cd frontend
Remove-Item -Recurse -Force node_modules
```
