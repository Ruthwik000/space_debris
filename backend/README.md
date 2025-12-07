# Backend API - Space Debris Dashboard

Flask-based REST API for satellite orbit data and machine learning predictions.

## 🎯 Overview

The backend provides RESTful endpoints for:
- Satellite orbital data retrieval
- Trajectory forecasting using LSTM
- Collision risk assessment using XGBoost
- System status monitoring

## 📋 Requirements

- Python 3.8 or higher
- pip (Python package manager)

## 🚀 Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

Server runs on: http://localhost:5000

## 📦 Dependencies

```
flask==3.0.0          # Web framework
flask-cors==4.0.0     # Cross-origin support
pandas>=2.2.0         # Data processing
numpy>=1.26.0         # Numerical computing
scikit-learn>=1.4.0   # ML framework
```

## 🔌 API Endpoints

### 1. System Status
```http
GET /api/status
```

**Response:**
```json
{
  "models_loaded": true,
  "lstm": "loaded",
  "xgboost": "loaded",
  "total_satellites": 9669,
  "total_records": 9669
}
```

### 2. Get Satellites List
```http
GET /api/satellites
```

**Response:**
```json
{
  "satellites": [51, 121, 124, 125, ...]
}
```

### 3. Get Satellite Orbit
```http
GET /api/orbit/<sat_id>
```

**Parameters:**
- `sat_id` (int): NORAD Catalog ID

**Response:**
```json
{
  "sat_id": 51,
  "orbit_points": [
    [7234.56, -1234.78, 3456.89],
    ...
  ],
  "info": {
    "inclination": 47.2135,
    "eccentricity": 0.0106732,
    "period": 7091.486
  }
}
```

### 4. Predict Trajectory
```http
POST /api/predict/trajectory
```

**Request Body:**
```json
{
  "sat_id": 51,
  "hours": 24
}
```

**Response:**
```json
{
  "sat_id": 51,
  "predictions": [
    {
      "hour": 1,
      "x": 7234.56,
      "y": -1234.78,
      "z": 3456.89
    },
    ...
  ]
}
```

### 5. Assess Collision Risk
```http
POST /api/predict/collision
```

**Request Body:**
```json
{
  "sat1_id": 51,
  "sat2_id": 121
}
```

**Response:**
```json
{
  "sat1_id": 51,
  "sat2_id": 121,
  "distance_km": 1234.56,
  "collision_probability": 0.6645,
  "risk_level": "HIGH"
}
```

## 🗂️ Data Files

The API reads from:
```
../model/space_debris_with_engineered_features.csv
```

**Required Columns:**
- NORAD_CAT_ID
- EPOCH_UNIX
- MEAN_MOTION
- ECCENTRICITY
- INCLINATION
- RA_OF_ASC_NODE
- ARG_OF_PERICENTER
- MEAN_ANOMALY
- SEMI_MAJOR_AXIS
- ORBITAL_PERIOD
- ORBITAL_VELOCITY

## 🤖 Machine Learning Models

### Current Implementation (Mock Models)

The API currently uses mock models for demonstration:

```python
class MockLSTM:
    def predict(self, X):
        # Simulates trajectory prediction
        return X + np.random.randn(*X.shape) * 10

class MockXGBoost:
    def predict_proba(self, X):
        # Simulates collision probability
        return np.random.rand(X.shape[0], 2)
```

### Integrating Real Models

Replace mock models with trained models:

```python
# For LSTM (TensorFlow/Keras)
import tensorflow as tf
lstm_model = tf.keras.models.load_model('path/to/lstm_model.h5')

# For XGBoost
import xgboost as xgb
xgboost_model = xgb.Booster()
xgboost_model.load_model('path/to/xgboost_model.json')
```

## 🧪 Testing

Run the test suite:

```bash
python test_api.py
```

**Tests include:**
- Status endpoint
- Satellites list
- Orbit data retrieval
- Trajectory prediction
- Collision risk assessment

## 🔧 Configuration

### Change Port

Edit `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change port here
```

### Enable CORS for Specific Origins

Edit `app.py`:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://yourdomain.com"]
    }
})
```

### Production Deployment

Use a production WSGI server:

```bash
# Install Gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📊 Orbit Calculation

The API calculates orbit points using simplified circular orbit approximation:

```python
a = semi_major_axis
inc = inclination (radians)

for theta in [0, 2π]:
    x = a * cos(theta)
    y = a * sin(theta) * cos(inc)
    z = a * sin(theta) * sin(inc)
```

For production, consider using:
- SGP4/SDP4 propagators
- Skyfield library
- PyEphem

## 🐛 Common Issues

### Module Not Found
```bash
pip install -r requirements.txt
```

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process or change port in app.py
```

### Data File Not Found
Ensure the CSV file exists at:
```
../model/space_debris_with_engineered_features.csv
```

### CORS Errors
CORS is enabled for all origins (`*`). If issues persist, check browser console.

## 📈 Performance

- Average response time: <100ms
- Orbit calculation: ~50ms for 100 points
- ML prediction: <500ms

## 🔐 Security Notes

⚠️ **This is a development server**

For production:
1. Use HTTPS
2. Implement authentication
3. Add rate limiting
4. Validate all inputs
5. Use environment variables for secrets
6. Enable logging and monitoring

## 📝 API Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 404 | Not Found (satellite doesn't exist) |
| 500 | Internal Server Error |

## 🔄 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Caching layer (Redis)
- [ ] Real-time TLE updates
- [ ] Batch prediction endpoints
- [ ] WebSocket support for live updates
- [ ] Authentication & authorization
- [ ] Rate limiting
- [ ] API documentation (Swagger/OpenAPI)

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Pandas Documentation](https://pandas.pydata.org/)
- [Scikit-learn Documentation](https://scikit-learn.org/)
- [TLE Format Specification](https://en.wikipedia.org/wiki/Two-line_element_set)

## 🤝 Contributing

When adding new endpoints:
1. Follow RESTful conventions
2. Add error handling
3. Update this README
4. Add tests in `test_api.py`
5. Document request/response formats

## 📄 License

MIT License - See main project LICENSE file
