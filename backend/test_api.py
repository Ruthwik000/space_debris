"""
Quick test script to verify backend API is working
Run: python test_api.py
"""
import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_status():
    print("Testing /api/status...")
    try:
        res = requests.get(f'{BASE_URL}/status')
        print(f"✓ Status: {res.status_code}")
        print(f"  Response: {json.dumps(res.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_satellites():
    print("\nTesting /api/satellites...")
    try:
        res = requests.get(f'{BASE_URL}/satellites')
        data = res.json()
        print(f"✓ Status: {res.status_code}")
        print(f"  Found {len(data['satellites'])} satellites")
        return data['satellites'][0] if data['satellites'] else None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def test_orbit(sat_id):
    print(f"\nTesting /api/orbit/{sat_id}...")
    try:
        res = requests.get(f'{BASE_URL}/orbit/{sat_id}')
        data = res.json()
        print(f"✓ Status: {res.status_code}")
        print(f"  Orbit points: {len(data['orbit_points'])}")
        print(f"  Info: {data['info']}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_trajectory(sat_id):
    print(f"\nTesting /api/predict/trajectory...")
    try:
        res = requests.post(f'{BASE_URL}/predict/trajectory', 
                           json={'sat_id': sat_id, 'hours': 24})
        data = res.json()
        print(f"✓ Status: {res.status_code}")
        print(f"  Predictions: {len(data['predictions'])} hours")
        print(f"  24h position: {data['predictions'][-1]}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_collision(sat1_id, sat2_id):
    print(f"\nTesting /api/predict/collision...")
    try:
        res = requests.post(f'{BASE_URL}/predict/collision',
                           json={'sat1_id': sat1_id, 'sat2_id': sat2_id})
        data = res.json()
        print(f"✓ Status: {res.status_code}")
        print(f"  Distance: {data['distance_km']:.2f} km")
        print(f"  Collision probability: {data['collision_probability']*100:.2f}%")
        print(f"  Risk level: {data['risk_level']}")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("Space Debris API Test Suite")
    print("=" * 50)
    print("\nMake sure the backend is running: python app.py\n")
    
    # Run tests
    test_status()
    sat_id = test_satellites()
    
    if sat_id:
        test_orbit(sat_id)
        test_trajectory(sat_id)
        
        # Get second satellite for collision test
        res = requests.get(f'{BASE_URL}/satellites')
        sats = res.json()['satellites']
        if len(sats) > 1:
            test_collision(sats[0], sats[1])
    
    print("\n" + "=" * 50)
    print("Tests complete!")
    print("=" * 50)
