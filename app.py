from flask import Flask, jsonify, render_template, request
import pandas as pd
import xarray as xr
import os
import glob
import numpy as np

app = Flask(__name__)

# Global data storage
float_data = {}
geo_data = {}
excel_ranges = {}

def load_netcdf_data(file_path):
    """Load NetCDF file and extract relevant oceanographic data"""
    try:
        ds = xr.open_dataset(file_path)
        
        # Extract common oceanographic variables (adjust based on actual file structure)
        data = {}
        
        # Try different common variable names for oceanographic data
        temp_vars = ['TEMP', 'temperature', 'Temperature', 'temp', 'T']
        sal_vars = ['PSAL', 'salinity', 'Salinity', 'sal', 'S']
        pres_vars = ['PRES', 'pressure', 'Pressure', 'pres', 'P']
        lat_vars = ['LATITUDE', 'latitude', 'lat', 'LAT']
        lon_vars = ['LONGITUDE', 'longitude', 'lon', 'LON']
        
        # Extract variables if they exist
        for var_list, key in [(temp_vars, 'temperature'), (sal_vars, 'salinity'), 
                             (pres_vars, 'pressure'), (lat_vars, 'lat'), (lon_vars, 'lon')]:
            for var_name in var_list:
                if var_name in ds.variables:
                    var_data = ds[var_name]
                    # Convert to numpy array and flatten if needed
                    if var_data.size > 0:
                        values = var_data.values
                        if np.isscalar(values):
                            data[key] = [float(values)]
                        else:
                            # Flatten and remove NaN values
                            flat_values = values.flatten()
                            clean_values = flat_values[~np.isnan(flat_values)]
                            if len(clean_values) > 0:
                                data[key] = clean_values.tolist()
                    break
        
        ds.close()
        return data
        
    except Exception as e:
        print(f"Error loading NetCDF file {file_path}: {e}")
        return {}

def load_float_data():
    """Load all float data from Database/Float/ folder"""
    float_folder = os.path.join("Database", "Float")
    if not os.path.exists(float_folder):
        print(f"Float folder not found: {float_folder}")
        return {}
    
    all_float_data = {}
    nc_files = glob.glob(os.path.join(float_folder, "*.nc"))
    
    for nc_file in nc_files:
        file_name = os.path.basename(nc_file)
        print(f"Loading float data from: {file_name}")
        data = load_netcdf_data(nc_file)
        if data:
            all_float_data[file_name] = data
    
    return all_float_data

def load_geo_data():
    """Load all geo/timeline data from Database/Geo/ folder"""
    geo_folder = os.path.join("Database", "Geo")
    if not os.path.exists(geo_folder):
        print(f"Geo folder not found: {geo_folder}")
        return {}
    
    all_geo_data = {}
    nc_files = glob.glob(os.path.join(geo_folder, "*.nc"))
    
    for nc_file in nc_files:
        file_name = os.path.basename(nc_file)
        print(f"Loading geo data from: {file_name}")
        data = load_netcdf_data(nc_file)
        if data:
            all_geo_data[file_name] = data
    
    return all_geo_data

def load_excel_data():
    """Load Excel data for backward compatibility"""
    try:
        sheet_path = os.path.join("Sheets", "output.xlsx")
        df = pd.read_excel(sheet_path)
        
        # Clean and convert data to numeric
        numeric_columns = ["lat", "lon", "temperature", "salinity", "pressure"]
        available_columns = [col for col in numeric_columns if col in df.columns]
        
        if not available_columns:
            return {}
        
        for col in available_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        df = df.dropna(subset=available_columns)
        
        if df.empty:
            return {}
        
        # Compute ranges for available columns
        ranges = {}
        for col in available_columns:
            ranges[col] = {"min": float(df[col].min()), "max": float(df[col].max())}
        
        return ranges
        
    except Exception as e:
        print(f"Error loading Excel dataset: {e}")
        return {}

def compute_ranges_from_data(data_dict):
    """Compute min/max ranges from NetCDF data"""
    ranges = {}
    all_values = {}
    
    # Collect all values across files
    for file_data in data_dict.values():
        for param, values in file_data.items():
            if param not in all_values:
                all_values[param] = []
            all_values[param].extend(values)
    
    # Compute ranges
    for param, values in all_values.items():
        if values:
            ranges[param] = {"min": float(min(values)), "max": float(max(values))}
    
    return ranges

# Initialize data on startup
print("Loading oceanographic data...")
float_data = load_float_data()
geo_data = load_geo_data()
excel_ranges = load_excel_data()

print(f"Loaded float data files: {list(float_data.keys())}")
print(f"Loaded geo data files: {list(geo_data.keys())}")
print(f"Excel data loaded: {bool(excel_ranges)}")

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/api/ranges", methods=["GET"])
def get_ranges():
    """Get data ranges - defaults to Excel data for backward compatibility"""
    if excel_ranges:
        return jsonify(excel_ranges)
    else:
        # Return default empty ranges if no data is loaded
        return jsonify({
            "lat": {"min": 0, "max": 0},
            "lon": {"min": 0, "max": 0},
            "temperature": {"min": 0, "max": 0},
            "salinity": {"min": 0, "max": 0},
            "pressure": {"min": 0, "max": 0},
        })

@app.route("/api/float-data", methods=["GET"])
def get_float_data():
    """Get float-specific data from Database/Float/ folder"""
    if not float_data:
        return jsonify({"error": "No float data available", "data": {}})
    
    # Compute ranges from float data
    float_ranges = compute_ranges_from_data(float_data)
    
    return jsonify({
        "type": "float",
        "ranges": float_ranges,
        "files": list(float_data.keys()),
        "data": float_data
    })

@app.route("/api/geo-data", methods=["GET"])
def get_geo_data():
    """Get timeline/geo-specific data from Database/Geo/ folder"""
    if not geo_data:
        return jsonify({"error": "No geo data available", "data": {}})
    
    # Compute ranges from geo data
    geo_ranges = compute_ranges_from_data(geo_data)
    
    return jsonify({
        "type": "geo",
        "ranges": geo_ranges,
        "files": list(geo_data.keys()),
        "data": geo_data
    })

@app.route("/api/data", methods=["GET"])
def get_data_by_type():
    """Get data based on query type parameter"""
    query_type = request.args.get('type', 'excel').lower()
    
    if query_type == 'float':
        return get_float_data()
    elif query_type == 'geo' or query_type == 'timeline':
        return get_geo_data()
    else:
        # Default to Excel data
        return get_ranges()

@app.route("/api/search", methods=["POST"])
def search_data():
    """Search data based on user query"""
    try:
        query = request.json.get('query', '').lower()
        
        response = {
            "query": query,
            "data_type": "unknown",
            "results": {},
            "message": "Database not found"
        }
        
        # Determine data type based on query content
        if 'float' in query:
            if float_data:
                # Extract float number from query if present
                import re
                float_match = re.search(r'float\s*(\d+)', query, re.IGNORECASE)
                requested_float = float_match.group(1) if float_match else None
                
                # Check if the specific float exists in our data
                if requested_float:
                    # Check if any loaded file contains this float number
                    float_found = False
                    for filename in float_data.keys():
                        if requested_float in filename:
                            float_found = True
                            break
                    
                    if not float_found:
                        response["message"] = "Database not found"
                        return jsonify(response)
                
                float_ranges = compute_ranges_from_data(float_data)
                response["data_type"] = "float"
                response["results"] = float_ranges
                response["message"] = f"Float data found from {len(float_data)} files"
                response["available_floats"] = [f for f in float_data.keys()]
            else:
                response["message"] = "Database not found"
        
        elif any(term in query for term in ['timeline', 'time', 'geo', 'location', 'coordinate']):
            if geo_data:
                geo_ranges = compute_ranges_from_data(geo_data)
                response["data_type"] = "geo"
                response["results"] = geo_ranges
                response["message"] = f"Geo/timeline data found from {len(geo_data)} files"
            else:
                response["message"] = "Geo database not found"
        
        elif any(term in query for term in ['temperature', 'salinity', 'pressure', 'data']):
            # Check all available data sources
            if excel_ranges:
                response["data_type"] = "excel"
                response["results"] = excel_ranges
                response["message"] = "Data found in Excel database"
            elif float_data:
                float_ranges = compute_ranges_from_data(float_data)
                response["data_type"] = "float"
                response["results"] = float_ranges
                response["message"] = "Data found in float database"
            elif geo_data:
                geo_ranges = compute_ranges_from_data(geo_data)
                response["data_type"] = "geo"
                response["results"] = geo_ranges
                response["message"] = "Data found in geo database"
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Database not found"
        })

@app.route("/api/validate-float/<float_number>", methods=["GET"])
def validate_float(float_number):
    """Validate if a specific float number exists in our database"""
    if not float_data:
        return jsonify({
            "exists": False,
            "message": "No float database available",
            "available_floats": []
        })
    
    # Check if any loaded file contains this float number
    for filename in float_data.keys():
        if float_number in filename:
            return jsonify({
                "exists": True,
                "message": f"Float {float_number} found",
                "filename": filename,
                "available_floats": list(float_data.keys())
            })
    
    return jsonify({
        "exists": False,
        "message": f"Float {float_number} not found",
        "available_floats": list(float_data.keys())
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy", 
        "databases": {
            "excel": bool(excel_ranges),
            "float": bool(float_data),
            "geo": bool(geo_data)
        },
        "available_floats": list(float_data.keys()) if float_data else [],
        "total_files": len(float_data) + len(geo_data) + (1 if excel_ranges else 0)
    })

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
