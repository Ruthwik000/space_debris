"""
Setup verification script
Checks if all required dependencies are installed
"""
import sys

def check_python():
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    if version.major >= 3 and version.minor >= 8:
        print("✓ Python version OK")
        return True
    else:
        print("✗ Python 3.8+ required")
        return False

def check_packages():
    required = ['flask', 'flask_cors', 'pandas', 'numpy', 'sklearn']
    missing = []
    
    for package in required:
        try:
            __import__(package)
            print(f"✓ {package} installed")
        except ImportError:
            print(f"✗ {package} missing")
            missing.append(package)
    
    return len(missing) == 0, missing

def check_data():
    import os
    data_file = 'model/space_debris_with_engineered_features.csv'
    if os.path.exists(data_file):
        print(f"✓ Data file found: {data_file}")
        return True
    else:
        print(f"✗ Data file missing: {data_file}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Space Debris Dashboard - Setup Verification")
    print("=" * 60)
    print()
    
    print("[1/3] Checking Python version...")
    python_ok = check_python()
    print()
    
    print("[2/3] Checking Python packages...")
    packages_ok, missing = check_packages()
    print()
    
    print("[3/3] Checking data files...")
    data_ok = check_data()
    print()
    
    print("=" * 60)
    if python_ok and packages_ok and data_ok:
        print("✓ All checks passed! You're ready to run the dashboard.")
        print()
        print("Next steps:")
        print("  1. cd backend")
        print("  2. python app.py")
        print("  3. Open http://localhost:5000/api/status in browser")
    else:
        print("✗ Some checks failed. Please fix the issues above.")
        if not packages_ok:
            print()
            print("To install missing packages:")
            print("  cd backend")
            print("  pip install -r requirements.txt")
    print("=" * 60)
