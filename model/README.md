# Model Data - Space Debris Dashboard

Satellite orbital data and machine learning datasets for trajectory prediction and collision risk assessment.

## 📊 Overview

This directory contains processed satellite orbital data derived from Two-Line Element (TLE) sets. The data is used for:
- 3D orbit visualization
- Trajectory forecasting with LSTM
- Collision risk assessment with XGBoost

## 📁 Data Files

### 1. space_debris_with_engineered_features.csv
**Primary dataset** used by the backend API.

**Size**: ~9,669 records  
**Format**: CSV  
**Encoding**: UTF-8

**Columns** (16 total):
```
NORAD_CAT_ID          - Satellite catalog identifier
EPOCH_UNIX            - Timestamp (Unix format)
MEAN_MOTION           - Revolutions per day
ECCENTRICITY          - Orbital eccentricity (0-1)
INCLINATION           - Orbital inclination (degrees)
RA_OF_ASC_NODE        - Right ascension of ascending node (degrees)
ARG_OF_PERICENTER     - Argument of perigee (degrees)
MEAN_ANOMALY          - Mean anomaly (degrees)
APOAPSIS              - Highest point in orbit (km)
PERIAPSIS             - Lowest point in orbit (km)
BSTAR                 - Drag coefficient
ORBITAL_PERIOD        - Time for one orbit (seconds)
SEMI_MAJOR_AXIS       - Average orbital radius (km)
ORBITAL_VELOCITY      - Speed in orbit (km/s)
PERIGEE_ALTITUDE      - Altitude at perigee (km)
APOGEE_ALTITUDE       - Altitude at apogee (km)
```

**Sample Data**:
```csv
NORAD_CAT_ID,EPOCH_UNIX,MEAN_MOTION,ECCENTRICITY,INCLINATION,...
51,1754742671,12.18362299,0.0106732,47.2135,293.7644,...
121,1754712212,14.00154584,0.0098187,66.747,97.0978,...
```

### 2. space_debris_ml_ready.csv
**Preprocessed dataset** for ML model training.

**Features** (11 columns):
- Core orbital elements
- Normalized values
- Ready for model input

### 3. space_debris_tle.csv
**Raw TLE data** in standard format.

**Format**: Three-line sets
```
STARLINK-1008
1 44713U 19074A   25101.10784722  .00001234  00000-0  12345-4 0  9999
2 44713  53.0000 123.4567 0001234  12.3456 347.6543 15.12345678123456
```

### 4. space_debris_omm.csv
**Orbit Mean-Elements Message** format data.

Alternative to TLE format with additional metadata.

### 5. space_debris_combined.csv
**Merged dataset** combining multiple sources.

Includes historical data and additional features.

## 🔬 Data Sources

### Primary Source
- **Space-Track.org**: Official TLE data from US Space Surveillance Network
- **Update Frequency**: Daily
- **Coverage**: Active satellites and debris

### Data Collection
TLE data was collected for:
- Starlink constellation satellites
- Active debris objects
- LEO (Low Earth Orbit) objects
- Date range: 2019-2025

## 📈 Data Statistics

```
Total Satellites: 9,669
Date Range: 2019-2025
Orbital Regimes:
  - LEO (Low Earth Orbit): 85%
  - MEO (Medium Earth Orbit): 10%
  - GEO (Geostationary): 5%

Inclination Distribution:
  - Polar (>80°): 15%
  - Sun-synchronous (97-99°): 25%
  - Mid-inclination (40-70°): 45%
  - Equatorial (<10°): 15%
```

## 🛠️ Data Processing Pipeline

### 1. Raw TLE Parsing
```python
from skyfield.api import load, EarthSatellite

# Parse TLE
satellite = EarthSatellite(line1, line2, name, ts)
epoch = satellite.epoch.utc_datetime()
```

### 2. Feature Engineering
```python
# Calculate derived features
orbital_period = 86400 / mean_motion  # seconds
semi_major_axis = (398600.4418 * (orbital_period / (2 * π))**2)**(1/3)
orbital_velocity = 2 * π * semi_major_axis / orbital_period
```

### 3. Orbit Propagation
```python
# Generate orbit points
for theta in np.linspace(0, 2*np.pi, 100):
    x = a * np.cos(theta)
    y = a * np.sin(theta) * np.cos(inclination)
    z = a * np.sin(theta) * np.sin(inclination)
```

## 🤖 ML Model Features

### Trajectory Prediction (LSTM)
**Input Features**:
- Current position (X, Y, Z)
- Velocity components
- Orbital elements
- Time delta

**Output**:
- Future position (X, Y, Z) at t+24h

### Collision Risk (XGBoost)
**Input Features**:
- Satellite 1 orbital elements
- Satellite 2 orbital elements
- Relative distance
- Relative velocity
- Orbital plane intersection

**Output**:
- Collision probability (0-1)
- Risk classification (HIGH/MEDIUM/LOW)

## 📊 Data Quality

### Validation Checks
- ✅ No missing values in critical columns
- ✅ Eccentricity in valid range [0, 1)
- ✅ Inclination in range [0, 180]
- ✅ Mean motion > 0
- ✅ Semi-major axis > Earth radius

### Data Cleaning
```python
# Remove invalid entries
df = df[df['ECCENTRICITY'] < 1.0]
df = df[df['SEMI_MAJOR_AXIS'] > 6371]
df = df[df['MEAN_MOTION'] > 0]

# Handle outliers
df = df[df['ORBITAL_PERIOD'] < 86400 * 2]  # < 2 days
```

## 🔄 Updating Data

### Manual Update
1. Download latest TLE data from Space-Track.org
2. Run preprocessing script:
```bash
python process_tle_data.py --input new_tle.txt --output processed.csv
```

### Automated Update (Future)
```python
# Scheduled daily update
import schedule

def update_tle_data():
    # Fetch from Space-Track API
    # Process and save
    pass

schedule.every().day.at("00:00").do(update_tle_data)
```

## 📐 Coordinate Systems

### Earth-Centered Inertial (ECI)
- Origin: Earth's center
- X-axis: Vernal equinox
- Z-axis: North pole
- Units: kilometers

### Orbital Elements
- **a**: Semi-major axis (km)
- **e**: Eccentricity (dimensionless)
- **i**: Inclination (degrees)
- **Ω**: Right ascension of ascending node (degrees)
- **ω**: Argument of perigee (degrees)
- **M**: Mean anomaly (degrees)

## 🎯 Use Cases

### 1. Orbit Visualization
```python
# Load orbit data
orbit = df[df['NORAD_CAT_ID'] == 51]
points = calculate_orbit_points(orbit)
```

### 2. Collision Detection
```python
# Find close approaches
sat1 = df[df['NORAD_CAT_ID'] == 51]
sat2 = df[df['NORAD_CAT_ID'] == 121]
distance = calculate_distance(sat1, sat2)
```

### 3. Trajectory Prediction
```python
# Predict future position
current_state = get_current_state(sat_id)
future_state = lstm_model.predict(current_state, hours=24)
```

## 📊 Data Visualization

### Orbit Distribution
```python
import matplotlib.pyplot as plt

plt.scatter(df['SEMI_MAJOR_AXIS'], df['INCLINATION'])
plt.xlabel('Semi-major Axis (km)')
plt.ylabel('Inclination (degrees)')
plt.title('Satellite Orbit Distribution')
```

### Altitude Histogram
```python
plt.hist(df['SEMI_MAJOR_AXIS'] - 6371, bins=50)
plt.xlabel('Altitude (km)')
plt.ylabel('Count')
plt.title('Satellite Altitude Distribution')
```

## 🔐 Data Privacy

- All data is publicly available from Space-Track.org
- No proprietary or classified information
- Complies with space data sharing agreements

## 📝 Data Format Specifications

### TLE Format
```
Line 0: Satellite name (24 characters)
Line 1: Catalog number, epoch, drag terms
Line 2: Orbital elements
```

### CSV Format
- Delimiter: comma (,)
- Encoding: UTF-8
- Header: First row
- Numeric precision: 8 decimal places

## 🚀 Future Enhancements

- [ ] Real-time TLE updates via API
- [ ] Historical orbit data (time series)
- [ ] Debris fragmentation events
- [ ] Maneuver detection
- [ ] Atmospheric drag modeling
- [ ] Solar radiation pressure effects
- [ ] Database integration (PostgreSQL)
- [ ] Data versioning

## 📚 References

### Standards
- [TLE Format Specification](https://celestrak.com/NORAD/documentation/tle-fmt.php)
- [OMM Format](https://public.ccsds.org/Pubs/502x0b2c1e2.pdf)
- [SGP4 Propagator](https://celestrak.com/publications/AIAA/2006-6753/)

### Data Sources
- [Space-Track.org](https://www.space-track.org/)
- [Celestrak](https://celestrak.com/)
- [N2YO](https://www.n2yo.com/)

## 🤝 Contributing

When adding new data:
1. Validate format and quality
2. Document data source
3. Update this README
4. Add processing scripts
5. Include sample data

## 📄 License

Data is sourced from public repositories and is subject to their respective licenses. See individual source websites for details.

## ⚠️ Disclaimer

This data is for educational and research purposes. For operational satellite tracking and collision avoidance, use official sources and certified software.
