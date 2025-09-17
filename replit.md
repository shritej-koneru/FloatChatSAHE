# Overview

FloatChat ARGO is an AI-powered conversational system designed to enable users to query and explore oceanographic data from ARGO floats through a natural language interface. The application provides a chat-based interface where users can ask questions about temperature, salinity, pressure, and location data, receiving real-time responses with statistical information from the oceanographic dataset.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Single Page Application (SPA)**: Uses vanilla HTML, CSS, and JavaScript for a simple chat interface
- **Chat Interface**: Real-time conversational UI with user input and bot responses
- **Responsive Design**: Sidebar navigation with main chat area and placeholder features for future development
- **Client-side Data Processing**: JavaScript handles query parsing and response generation based on loaded dataset ranges

## Backend Architecture
- **Flask Web Framework**: Lightweight Python web server handling HTTP requests and template rendering
- **RESTful API**: Single endpoint `/api/ranges` provides dataset statistics to the frontend
- **Data Processing Pipeline**: Pandas-based data cleaning and validation with error handling for malformed data
- **Template Engine**: Jinja2 templating for HTML rendering

## Data Storage Solutions
- **Excel File Storage**: Dataset stored as `output.xlsx` in the `Sheets` directory
- **In-memory Caching**: Precomputed statistical ranges stored in memory for fast query responses
- **Data Validation**: Automatic conversion to numeric types with NaN handling and data cleaning

## Query Processing
- **Keyword-based NLP**: Simple pattern matching for oceanographic terms (temperature, salinity, pressure, location)
- **Statistical Responses**: Returns min/max ranges for requested parameters
- **Error Handling**: Graceful degradation when dataset is unavailable or corrupted

# External Dependencies

## Python Libraries
- **Flask**: Web framework for HTTP server and routing
- **Pandas**: Data manipulation and analysis for Excel file processing
- **openpyxl**: Excel file reading capability (implicit dependency through pandas)

## Frontend Dependencies
- **Vanilla JavaScript**: No external JavaScript frameworks or libraries
- **Native CSS**: Custom styling without external CSS frameworks

## Data Dependencies
- **Excel Dataset**: Requires `Sheets/output.xlsx` file containing oceanographic data with columns: lat, lon, temperature, salinity, pressure
- **File System Access**: Local file system access for reading Excel files

## Development Tools
- **Python 3.x**: Runtime environment
- **Web Browser**: Modern browser with JavaScript support for frontend functionality