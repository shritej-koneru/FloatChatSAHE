from flask import Flask, jsonify, render_template
import pandas as pd
import os

app = Flask(__name__)

# Load dataset with error handling
ranges = {}
try:
    sheet_path = os.path.join("Sheets", "output.xlsx")
    df = pd.read_excel(sheet_path)
    
    # Clean and convert data to numeric, handling any non-numeric values
    numeric_columns = ["lat", "lon", "temperature", "salinity", "pressure"]
    available_columns = [col for col in numeric_columns if col in df.columns]
    
    if not available_columns:
        raise ValueError("No required numeric columns found in dataset")
    
    for col in available_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Remove rows with NaN values in available numeric columns
    df = df.dropna(subset=available_columns)
    
    if df.empty:
        raise ValueError("No valid data rows after cleaning")
    
    # Precompute ranges for available columns
    for col in available_columns:
        ranges[col] = {"min": float(df[col].min()), "max": float(df[col].max())}
        
except Exception as e:
    print(f"Error loading dataset: {e}")
    # Set default empty ranges if data loading fails
    ranges = {
        "lat": {"min": 0, "max": 0},
        "lon": {"min": 0, "max": 0},
        "temperature": {"min": 0, "max": 0},
        "salinity": {"min": 0, "max": 0},
        "pressure": {"min": 0, "max": 0},
    }

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/api/ranges", methods=["GET"])
def get_ranges():
    return jsonify(ranges)

@app.route("/health")
def health():
    return jsonify({"status": "healthy", "data_loaded": len(ranges) > 0})

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
