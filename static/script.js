let dataset = null;
let temperatureChart = null;
let salinityChart = null;

// Sample float data for demonstration (updated to work with filters)
const sampleFloatData = {
  id: "12345",
  deployment: "South Atlantic Ocean on 15 September 2020",
  position: "latitude: -80.12 and longitude: -4.56",
  profiles: [
    { id: "5678", date: "2024-08-14", lat: -52.13, lon: -40.12, depth: 1000, temp: 15.2, salinity: 34.5 },
    { id: "5677", date: "2024-09-11", lat: -52.13, lon: -45.12, depth: 1000, temp: 16.8, salinity: 34.7 },
    { id: "5675", date: "2023-08-08", lat: -52.13, lon: -42.12, depth: 1000, temp: 14.9, salinity: 34.3 },
    { id: "5676", date: "2023-09-05", lat: -52.13, lon: -38.12, depth: 1000, temp: 17.1, salinity: 34.8 }
  ]
};

// Sample chart data
const temperatureData = {
  labels: ['2004', '2004', '2017', '2021'],
  datasets: [{
    data: [0, 20, 200, 360],
    backgroundColor: 'rgba(54, 162, 235, 0.6)',
    borderColor: 'rgba(54, 162, 235, 1)',
    borderWidth: 1
  }]
};

const salinityData = {
  labels: ['2004', '2010', '2020', '2021'],
  datasets: [{
    data: [0, 40, 200, 360],
    backgroundColor: 'rgba(255, 159, 64, 0.6)',
    borderColor: 'rgba(255, 159, 64, 1)',
    borderWidth: 1
  }]
};

// Initialize the application
window.onload = function() {
  loadData();
  initializeCharts();
  initializeEmptyChat();
  // Don't populate data on start - keep everything empty
};

// Fetch dataset ranges on load
async function loadData() {
  try {
    const response = await fetch("/api/ranges");
    dataset = await response.json();
    console.log("Dataset loaded:", dataset);
  } catch (err) {
    console.error("Error loading dataset:", err);
  }
}

// Initialize charts
function initializeCharts() {
  // Temperature Chart
  const tempCtx = document.getElementById('temperatureChart');
  if (tempCtx) {
    temperatureChart = new Chart(tempCtx, {
      type: 'line',
      data: temperatureData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperature (°C)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Salinity Chart
  const salCtx = document.getElementById('salinityChart');
  if (salCtx) {
    salinityChart = new Chart(salCtx, {
      type: 'line',
      data: salinityData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Salinity (PSU)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
}

// Initialize empty chat and middle section
function initializeEmptyChat() {
  const chatMessages = document.getElementById("chatMessages");
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
  
  // Clear the middle section completely
  const floatDescription = document.getElementById("floatDescription");
  if (floatDescription) {
    floatDescription.innerHTML = '';
  }
  
  // Clear the data table
  const tableBody = document.querySelector("#profileTable tbody");
  if (tableBody) {
    tableBody.innerHTML = '';
  }
  
  // Clear charts
  if (temperatureChart) {
    temperatureChart.data.labels = [];
    temperatureChart.data.datasets[0].data = [];
    temperatureChart.update();
  }
  
  if (salinityChart) {
    salinityChart.data.labels = [];
    salinityChart.data.datasets[0].data = [];
    salinityChart.update();
  }
}

// Populate data table
function populateDataTable() {
  const tableBody = document.querySelector("#profileTable tbody");
  if (tableBody) {
    tableBody.innerHTML = sampleFloatData.profiles.map(profile => `
      <tr>
        <td>${profile.id}</td>
        <td>${profile.date}</td>
        <td>${profile.lat}</td>
        <td>${profile.lon}</td>
        <td>${profile.depth}</td>
        <td>${profile.temp}</td>
        <td>${profile.salinity}</td>
      </tr>
    `).join('');
  }
}

// Send message function
async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const userText = input.value.trim();
  if (!userText) return;

  // Display user message
  const userMessage = document.createElement('div');
  userMessage.className = 'chat-message user';
  userMessage.textContent = userText;
  chatMessages.appendChild(userMessage);

  // Query the new search API
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userText })
    });

    const searchResult = await response.json();
    let botResponse = searchResult.message || "Database not found.";
    
    const lower = userText.toLowerCase();

    // Check if database was found (validate response)
    if (searchResult.message === "Database not found") {
      // Display "Database not found" and return early
      setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-message bot';
        botMessage.textContent = "Database not found.";
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);
      
      input.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return;
    }

    // Handle successful data retrieval
    if (searchResult.results && Object.keys(searchResult.results).length > 0) {
      const data = searchResult.results;
      
      // Check for specific temperature and salinity profiles question (no float info)
      if ((lower.includes("what") || lower.includes("show")) && 
          lower.includes("temperature") && lower.includes("salinity") && lower.includes("profile") &&
          !lower.includes("float")) {
        botResponse = `Here are the detailed temperature and salinity profiles from our ${searchResult.data_type} database. Temperature ranges from ${data.temperature?.min?.toFixed(1)}°C to ${data.temperature?.max?.toFixed(1)}°C, while salinity ranges from ${data.salinity?.min?.toFixed(1)} PSU to ${data.salinity?.max?.toFixed(1)} PSU.`;
        // Show ONLY the profiles view (charts + table, no float info)
        showTemperatureAndSalinityProfiles();
        updateDataWithSearchResults(data);
      } 
      // Float-specific questions with dynamic float number
      else if (lower.includes("float")) {
        // Extract float number from query if present
        const floatMatch = userText.match(/float\s*(\d+)/i);
        const floatNumber = floatMatch ? floatMatch[1] : null;
        
        if (searchResult.data_type === "float" || lower.includes("float")) {
          botResponse = `Float ${floatNumber || 'data'} retrieved from our database. This includes oceanographic measurements: temperature (${data.temperature?.min?.toFixed(1)}°C to ${data.temperature?.max?.toFixed(1)}°C), salinity (${data.salinity?.min?.toFixed(1)} to ${data.salinity?.max?.toFixed(1)} PSU), and pressure (${data.pressure?.min?.toFixed(1)} to ${data.pressure?.max?.toFixed(1)} dbar).`;
          
          // Show float information with extracted number
          showFloatInformation(floatNumber);
          
          // If this is a combined query (float + profiles), also show charts
          if (lower.includes("profile") || lower.includes("temperature") || lower.includes("salinity")) {
            showTemperatureAndSalinityProfiles();
            updateDataWithSearchResults(data);
          }
        }
      }
      // Timeline/Geo questions
      else if (lower.includes("timeline") || lower.includes("time") || lower.includes("geo")) {
        if (searchResult.data_type === "geo") {
          botResponse = `Timeline/geo data retrieved from our database covering coordinates from lat ${data.lat?.min?.toFixed(1)}° to ${data.lat?.max?.toFixed(1)}°, lon ${data.lon?.min?.toFixed(1)}° to ${data.lon?.max?.toFixed(1)}°.`;
        }
      }
      // Temperature only questions
      else if (lower.includes("temperature") && !lower.includes("salinity")) {
        botResponse = `Temperature data from our ${searchResult.data_type} database ranges from ${data.temperature?.min?.toFixed(1)}°C to ${data.temperature?.max?.toFixed(1)}°C. These measurements were collected from oceanographic instruments.`;
      }
      // Salinity only questions
      else if (lower.includes("salinity") && !lower.includes("temperature")) {
        botResponse = `Salinity levels from our ${searchResult.data_type} database range from ${data.salinity?.min?.toFixed(1)} PSU to ${data.salinity?.max?.toFixed(1)} PSU, representing seawater salt content at various locations.`;
      }
      // Pressure questions
      else if (lower.includes("pressure")) {
        botResponse = `Pressure measurements from our ${searchResult.data_type} database range from ${data.pressure?.min?.toFixed(1)} dbar to ${data.pressure?.max?.toFixed(1)} dbar, corresponding to different ocean depths.`;
      }
      // Update global dataset for other functions
      updateGlobalDataset(data);
    }

    // Display bot response
    setTimeout(() => {
      const botMessage = document.createElement('div');
      botMessage.className = 'chat-message bot';
      botMessage.textContent = botResponse;
      chatMessages.appendChild(botMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);

  } catch (error) {
    console.error("Error querying data:", error);
    // Display error response
    setTimeout(() => {
      const botMessage = document.createElement('div');
      botMessage.className = 'chat-message bot';
      botMessage.textContent = "Database not found.";
      chatMessages.appendChild(botMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
  }

  input.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update global dataset variable with search results
function updateGlobalDataset(data) {
  if (data && typeof data === 'object') {
    dataset = data;
  }
}

// Update data displays with search results
function updateDataWithSearchResults(data) {
  if (data && typeof data === 'object') {
    dataset = data;
    // Update charts if they exist
    if (temperatureChart && salinityChart) {
      updateCharts();
    }
  }
}

// Show temperature and salinity profiles with full data visualization (charts + table only)
function showTemperatureAndSalinityProfiles() {
  // Update charts with actual data
  updateCharts();
  
  // Populate the data table
  populateDataTable();
  
  // Make sure the profile tab is active
  showTab('profile');
}

// Show float information with dynamic float number
function showFloatInformation(floatNumber = null) {
  const floatDescription = document.getElementById("floatDescription");
  if (floatDescription) {
    const displayNumber = floatNumber || sampleFloatData.id;
    floatDescription.innerHTML = `Float ${displayNumber} was deployed in the ${sampleFloatData.deployment}. Its most recent position is at ${sampleFloatData.position}. Here are its temperature and salinity profiles over time and depth.`;
  }
}

// Update float information in middle section
function updateFloatInformation() {
  const floatDescription = document.getElementById("floatDescription");
  if (floatDescription) {
    floatDescription.innerHTML = `Float ${sampleFloatData.id} was deployed in the ${sampleFloatData.deployment}. Its most recent position is at ${sampleFloatData.position}. Here are its temperature and salinity profiles over time and depth.`;
  }
}

// Handle Enter key in message input
document.addEventListener('DOMContentLoaded', function() {
  const messageInput = document.getElementById('userInput');
  if (messageInput) {
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
});

// Tab switching functionality - clean implementation
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      showTab(tabName, this);
    });
  });
});

function showTab(tabName, clickedButton) {
  // Hide all tab panels
  const panels = document.querySelectorAll('.tab-panel');
  panels.forEach(panel => panel.classList.remove('active'));
  
  // Remove active class from all tab buttons
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab panel
  const targetPanel = document.getElementById(tabName + 'Tab');
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
  
  // Add active class to clicked button or find the matching button
  if (clickedButton) {
    clickedButton.classList.add('active');
  } else {
    const matchingButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (matchingButton) {
      matchingButton.classList.add('active');
    }
  }
}

// Suggested actions
function showProfileData() {
  // Switch to profile data tab
  showTab('profile');
  
  // Add message to chat
  const chatMessages = document.getElementById("chatMessages");
  const botMessage = document.createElement('div');
  botMessage.className = 'chat-message bot';
  botMessage.textContent = 'Here is the profile data for the selected float. You can see the detailed measurements in the table below.';
  chatMessages.appendChild(botMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function suggestFloat() {
  const chatMessages = document.getElementById("chatMessages");
  const botMessage = document.createElement('div');
  botMessage.className = 'chat-message bot';
  botMessage.textContent = 'Based on your search criteria, I suggest looking at Float 67890 in the Pacific Ocean or Float 11111 in the Indian Ocean. Would you like to explore either of these?';
  chatMessages.appendChild(botMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function defineParameters() {
  const chatMessages = document.getElementById("chatMessages");
  const botMessage = document.createElement('div');
  botMessage.className = 'chat-message bot';
  botMessage.textContent = 'You can define search parameters using the filters on the right sidebar. Select region, time period, float type, and specific measurements you\'re interested in.';
  chatMessages.appendChild(botMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Filter change handlers
document.addEventListener('DOMContentLoaded', function() {
  const filters = {
    regionFilter: 'region',
    timeFilter: 'time', 
    floatTypeFilter: 'floatType',
    parametersFilter: 'parameters'
  };
  
  Object.entries(filters).forEach(([filterId, filterKey]) => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', function() {
        currentFilters[filterKey] = this.value;
        console.log(`Filter ${filterKey} changed to:`, this.value);
        updateDataDisplay();
      });
    }
  });
});

// Current filter state
let currentFilters = {
  region: '',
  time: '',
  floatType: '',
  parameters: ''
};

// Filtered data
let filteredData = [...sampleFloatData.profiles];

function updateDataDisplay() {
  // Apply filters to data
  filteredData = sampleFloatData.profiles.filter(profile => {
    let matches = true;
    
    // Region filter (updated logic to work with sample data)
    if (currentFilters.region) {
      if (currentFilters.region === 'atlantic' && (profile.lon > -20 || profile.lon < -60)) matches = false;
      if (currentFilters.region === 'pacific' && (profile.lon < 120 || profile.lon > 180)) matches = false;
      if (currentFilters.region === 'indian' && (profile.lon < 40 || profile.lon > 120)) matches = false;
    }
    
    // Time filter
    if (currentFilters.time) {
      const year = new Date(profile.date).getFullYear().toString();
      if (year !== currentFilters.time) matches = false;
    }
    
    // Float type filter would normally check profile metadata
    // For demo purposes, we'll use a simple rule
    if (currentFilters.floatType === 'biogeochemical' && parseInt(profile.id) % 2 === 0) matches = false;
    
    return matches;
  });
  
  // Update data table
  updateDataTable();
  
  // Update charts with filtered data
  updateCharts();
  
  console.log(`Filtered data to ${filteredData.length} profiles`);
}

function updateDataTable() {
  const tableBody = document.querySelector("#profileTable tbody");
  if (tableBody) {
    tableBody.innerHTML = filteredData.map(profile => `
      <tr>
        <td>${profile.id}</td>
        <td>${profile.date}</td>
        <td>${profile.lat}</td>
        <td>${profile.lon}</td>
        <td>${profile.depth}</td>
        <td>${profile.temp}</td>
        <td>${profile.salinity}</td>
      </tr>
    `).join('');
  }
}

function updateCharts() {
  if (temperatureChart) {
    if (filteredData.length > 0) {
      temperatureChart.data.labels = filteredData.map(p => p.date.substring(5));
      temperatureChart.data.datasets[0].data = filteredData.map(p => p.temp);
    } else {
      temperatureChart.data.labels = [];
      temperatureChart.data.datasets[0].data = [];
    }
    temperatureChart.update();
  }
  
  if (salinityChart) {
    if (filteredData.length > 0) {
      salinityChart.data.labels = filteredData.map(p => p.date.substring(5));
      salinityChart.data.datasets[0].data = filteredData.map(p => p.salinity);
    } else {
      salinityChart.data.labels = [];
      salinityChart.data.datasets[0].data = [];
    }
    salinityChart.update();
  }
}

// Export functionality
function exportToCSV() {
  const headers = ['Profile ID', 'Date', 'Latitude', 'Longitude', 'Depth', 'Temperature', 'Salinity'];
  const csvContent = [
    headers.join(','),
    ...filteredData.map(profile => [
      profile.id,
      profile.date,
      profile.lat,
      profile.lon,
      profile.depth,
      profile.temp,
      profile.salinity
    ].join(','))
  ].join('\n');
  
  downloadFile(csvContent, 'floatchat_data.csv', 'text/csv');
}

function exportToExcel() {
  // Export as CSV with proper CSV extension (Excel can open CSV files)
  const headers = ['Profile ID', 'Date', 'Latitude', 'Longitude', 'Depth', 'Temperature', 'Salinity'];
  const csvContent = [
    headers.join(','),
    ...filteredData.map(profile => [
      profile.id,
      profile.date,
      profile.lat,
      profile.lon,
      profile.depth,
      profile.temp,
      profile.salinity
    ].join(','))
  ].join('\n');
  
  downloadFile(csvContent, 'floatchat_data.csv', 'text/csv');
}

function exportToNetCDF() {
  // NetCDF export would require server-side processing
  const chatMessages = document.getElementById("chatMessages");
  const botMessage = document.createElement('div');
  botMessage.className = 'chat-message bot';
  botMessage.textContent = 'NetCDF export requires server-side processing. This feature will be available in a future update.';
  chatMessages.appendChild(botMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Show success message
  const chatMessages = document.getElementById("chatMessages");
  const botMessage = document.createElement('div');
  botMessage.className = 'chat-message bot';
  botMessage.textContent = `Successfully exported ${filteredData.length} profiles to ${filename}`;
  chatMessages.appendChild(botMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function() {
  const exportButtons = document.querySelectorAll('.export-btn');
  exportButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const format = this.textContent.toLowerCase();
      
      switch(format) {
        case 'csv':
          exportToCSV();
          break;
        case 'excel':
          exportToExcel();
          break;
        case 'netcdf':
          exportToNetCDF();
          break;
        default:
          console.log(`Export format ${format} not implemented`);
      }
    });
  });
});