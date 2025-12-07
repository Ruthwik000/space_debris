# Frontend - Space Debris Dashboard

React-based interactive 3D visualization and control interface for satellite orbit analysis.

## 🎯 Overview

The frontend provides:
- Interactive 3D Earth and satellite orbit visualization
- Multi-satellite selection and management
- Real-time ML prediction interface
- Responsive UI with dark space theme

## 📋 Requirements

- Node.js 16 or higher
- npm (comes with Node.js)

## 🚀 Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Application runs on: http://localhost:3000

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "three": "^0.160.0",
  "axios": "^1.6.2"
}
```

## 🏗️ Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── Sidebar.js          # Control panel
│   │   ├── Sidebar.css
│   │   ├── OrbitVisualization.js  # 3D scene
│   │   ├── PredictionPanel.js     # ML predictions
│   │   └── PredictionPanel.css
│   ├── App.js                  # Main component
│   ├── App.css
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
└── package.json
```

## 🎨 Components

### 1. App.js (Main Container)
Main application component that manages state and coordinates child components.

**State:**
- `status`: Backend system status
- `satellites`: Available satellites list
- `selectedSats`: Currently selected satellites
- `orbitData`: Orbit trajectory data

**Key Functions:**
```javascript
fetchStatus()           // Get backend status
fetchSatellites()       // Load satellite list
handleSatellitesSelect() // Handle multi-selection
```

### 2. Sidebar Component
Left panel for system status and satellite selection.

**Features:**
- System status indicators (LSTM, XGBoost)
- Dataset statistics
- Multi-satellite selector
- Color-coded satellite list
- Add/remove satellites

**Props:**
```javascript
{
  status: Object,        // System status
  satellites: Array,     // Available satellites
  onSelectSatellites: Function  // Selection callback
}
```

### 3. OrbitVisualization Component
3D visualization using Three.js.

**Features:**
- Rotating Earth sphere (6,371 km radius)
- Multiple orbit paths with unique colors
- Grid helper (40,000 km)
- Axis helpers (X, Y, Z)
- Reference rings (7,000 km, 10,000 km)
- Scale labels
- Hover tooltips
- Camera position display
- Mouse controls

**Props:**
```javascript
{
  orbitData: Array  // Array of orbit objects
}
```

**Controls:**
- Left click + drag: Rotate camera
- Scroll wheel: Zoom in/out
- Hover: Show coordinates

### 4. PredictionPanel Component
Bottom panel for ML predictions.

**Features:**
- Trajectory forecasting interface
- Collision risk assessment interface
- Satellite selection dropdowns
- Result display with color-coded risk levels

**Props:**
```javascript
{
  satellites: Array,      // Available satellites
  selectedSats: Array     // Currently selected
}
```

## 🎨 Styling

### Color Scheme
```css
/* Background */
--bg-primary: #0a0e27;
--bg-secondary: #151932;
--bg-tertiary: #1a1f3a;

/* Accent */
--accent-cyan: #4fc3f7;
--accent-red: #ff5252;
--accent-yellow: #ffeb3b;
--accent-green: #4caf50;

/* Text */
--text-primary: #ffffff;
--text-secondary: #8b92b0;
--text-muted: #666666;

/* Borders */
--border-color: #2a3150;
```

### Responsive Design
```css
/* Desktop: 1920x1080+ */
.sidebar { width: 280px; }
.prediction-panel { height: 450px; }

/* Laptop: 1366x768+ */
/* Optimized layout */

/* Tablet: 768x1024+ */
/* Stacked layout */
```

## 🔧 Configuration

### API Endpoint
Edit `src/App.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

### Orbit Colors
Edit `src/components/OrbitVisualization.js`:
```javascript
const colors = [0xff5252, 0x4fc3f7, 0xffeb3b, 0x4caf50];
```

### Camera Settings
```javascript
camera.position.set(20000, 20000, 20000);
camera.fov = 50;
```

## 🎮 3D Visualization Details

### Scene Setup
```javascript
// Scene
scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e27);

// Camera
camera = new THREE.PerspectiveCamera(50, aspect, 1, 100000);

// Renderer
renderer = new THREE.WebGLRenderer({ antialias: true });
```

### Earth Model
```javascript
const earthGeometry = new THREE.SphereGeometry(6371, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
  color: 0x1e88e5,
  metalness: 0.4,
  roughness: 0.7
});
```

### Orbit Lines
```javascript
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ 
  color: orbitColor,
  linewidth: 2
});
const line = new THREE.Line(geometry, material);
```

### Lighting
```javascript
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

// Point light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10000, 10000, 10000);
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🏗️ Building for Production

```bash
# Create optimized build
npm run build

# Output directory: build/
```

### Build Optimization
- Code splitting
- Minification
- Tree shaking
- Asset optimization

### Deployment Options
1. **Vercel**: `vercel deploy`
2. **Netlify**: `netlify deploy`
3. **GitHub Pages**: `npm run deploy`
4. **Static hosting**: Upload `build/` folder

## 🐛 Common Issues

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Three.js Errors
Ensure Three.js version compatibility:
```bash
npm install three@0.160.0
```

### Canvas Not Rendering
Check browser console for WebGL support:
```javascript
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
if (!gl) {
  console.error('WebGL not supported');
}
```

### CORS Errors
Ensure backend is running and CORS is enabled.

### Source Map Warnings
Add to `.env`:
```
GENERATE_SOURCEMAP=false
```

## 📊 Performance Optimization

### 3D Rendering
- Use `requestAnimationFrame` for smooth animation
- Limit orbit points (100 per orbit)
- Dispose geometries and materials when removing objects
- Use `BufferGeometry` instead of `Geometry`

### React Optimization
```javascript
// Memoize expensive calculations
const orbitPoints = useMemo(() => 
  calculateOrbitPoints(data), [data]
);

// Prevent unnecessary re-renders
const MemoizedComponent = React.memo(Component);
```

### Bundle Size
```bash
# Analyze bundle
npm run build
npx source-map-explorer build/static/js/*.js
```

## 🎯 Features in Detail

### Multi-Satellite Selection
Users can add multiple satellites and see all orbits simultaneously:
```javascript
const [selectedSats, setSelectedSats] = useState([]);

const handleAddSatellite = (satId) => {
  setSelectedSats([...selectedSats, satId]);
};
```

### Hover Tooltips
Raycasting detects mouse hover on Earth:
```javascript
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObject(earth);
if (intersects.length > 0) {
  const point = intersects[0].point;
  setHoverInfo({ x, y, z });
}
```

### Camera Tracking
Real-time camera position display:
```javascript
setCameraInfo({
  x: camera.position.x.toFixed(0),
  y: camera.position.y.toFixed(0),
  z: camera.position.z.toFixed(0)
});
```

## 🔄 State Management

Currently using React hooks (useState, useEffect). For larger applications, consider:
- Redux
- MobX
- Zustand
- Recoil

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |

## 📱 Mobile Support

Currently optimized for desktop. For mobile:
- Add touch controls
- Responsive breakpoints
- Simplified 3D scene
- Mobile-optimized UI

## 🔐 Security

- No sensitive data stored in frontend
- API calls use HTTPS in production
- Input validation before API calls
- XSS protection via React

## 🚀 Future Enhancements

- [ ] WebGL2 support
- [ ] VR/AR mode
- [ ] Real-time satellite tracking
- [ ] Time slider for orbit animation
- [ ] Export orbit data (CSV, JSON)
- [ ] Screenshot/video capture
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Touch gestures for mobile

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

## 🤝 Contributing

When adding new features:
1. Follow React best practices
2. Use functional components with hooks
3. Add PropTypes or TypeScript
4. Write tests
5. Update this README

## 📄 License

MIT License - See main project LICENSE file
