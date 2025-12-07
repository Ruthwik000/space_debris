#!/usr/bin/env python3
import sys
print(f"Using Python: {sys.executable}")

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os

app = Flask(__name__)
CORS(app)

# Load data
DATA_PATH = '../model/space_debris_with_engineered_features.csv'
df = pd.read_csv(DATA_PATH)

# Mock ML models (replace with actual trained models)
class MockLSTM:
    def predict(self, X):
        # Simulate trajectory prediction
        return X + np.random.randn(*X.shape) * 10

class MockXGBoost:
    def predict_proba(self, X):
        # Simulate collision probability
        return np.random.rand(X.shape[0], 2)

lstm_model = MockLSTM()
xgboost_model = MockXGBoost()

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        'models_loaded': True,
        'lstm': 'loaded',
        'xgboost': 'loaded',
        'total_satellites': len(df['NORAD_CAT_ID'].unique()),
        'total_records': len(df)
    })

@app.route('/api/satellites', methods=['GET'])
def get_satellites():
    satellites = df['NORAD_CAT_ID'].unique().tolist()
    return jsonify({'satellites': satellites[:50]})  # Limit to 50 for demo

@app.route('/api/orbit/<int:sat_id>', methods=['GET'])
def get_orbit(sat_id):
    sat_data = df[df['NORAD_CAT_ID'] == sat_id].iloc[0]
    
    # Generate orbit points (simplified circular orbit)
    a = sat_data['SEMI_MAJOR_AXIS']
    inc = np.radians(sat_data['INCLINATION'])
    points = []
    
    for theta in np.linspace(0, 2*np.pi, 100):
        x = a * np.cos(theta)
        y = a * np.sin(theta) * np.cos(inc)
        z = a * np.sin(theta) * np.sin(inc)
        points.append([x, y, z])
    
    return jsonify({
        'sat_id': int(sat_id),
        'orbit_points': points,
        'info': {
            'inclination': float(sat_data['INCLINATION']),
            'eccentricity': float(sat_data['ECCENTRICITY']),
            'period': float(sat_data['ORBITAL_PERIOD'])
        }
    })

@app.route('/api/predict/trajectory', methods=['POST'])
def predict_trajectory():
    data = request.json
    sat_id = data['sat_id']
    hours = data.get('hours', 24)
    
    sat_data = df[df['NORAD_CAT_ID'] == sat_id].iloc[0]
    
    # Current position
    current = [
        float(sat_data['SEMI_MAJOR_AXIS']),
        0,
        float(sat_data['SEMI_MAJOR_AXIS'] * np.sin(np.radians(sat_data['INCLINATION'])))
    ]
    
    # Predict future positions
    predictions = []
    for h in range(hours):
        pred = lstm_model.predict(np.array([current]))
        predictions.append({
            'hour': h + 1,
            'x': float(pred[0][0]),
            'y': float(pred[0][1]),
            'z': float(pred[0][2])
        })
        current = pred[0]
    
    return jsonify({
        'sat_id': sat_id,
        'predictions': predictions
    })

@app.route('/api/predict/collision', methods=['POST'])
def predict_collision():
    data = request.json
    sat1_id = data['sat1_id']
    sat2_id = data['sat2_id']
    
    sat1 = df[df['NORAD_CAT_ID'] == sat1_id].iloc[0]
    sat2 = df[df['NORAD_CAT_ID'] == sat2_id].iloc[0]
    
    # Calculate distance
    a1 = sat1['SEMI_MAJOR_AXIS']
    a2 = sat2['SEMI_MAJOR_AXIS']
    distance = abs(a1 - a2)
    
    # Mock collision probability
    features = np.array([[
        sat1['INCLINATION'], sat1['ECCENTRICITY'],
        sat2['INCLINATION'], sat2['ECCENTRICITY'],
        distance
    ]])
    
    proba = xgboost_model.predict_proba(features)
    risk = float(proba[0][1])
    
    return jsonify({
        'sat1_id': sat1_id,
        'sat2_id': sat2_id,
        'distance_km': float(distance),
        'collision_probability': risk,
        'risk_level': 'HIGH' if risk > 0.5 else 'MEDIUM' if risk > 0.1 else 'LOW'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
