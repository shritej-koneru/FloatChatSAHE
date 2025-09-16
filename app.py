from flask import Flask, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Load dataset
sheet_path = os.path.join("Sheets", "output.xlsx")
df = pd.read_excel(sheet_path)

# Precompute ranges
ranges = {
    "lat": {"min": float(df["lat"].min()), "max": float(df["lat"].max())},
    "lon": {"min": float(df["lon"].min()), "max": float(df["lon"].max())},
    "temperature": {"min": float(df["temperature"].min()), "max": float(df["temperature"].max())},
    "salinity": {"min": float(df["salinity"].min()), "max": float(df["salinity"].max())},
    "pressure": {"min": float(df["pressure"].min()), "max": float(df["pressure"].max())},
}

@app.route("/api/ranges", methods=["GET"])
def get_ranges():
    return jsonify(ranges)

if __name__ == "__main__":
    app.run(debug=True)
