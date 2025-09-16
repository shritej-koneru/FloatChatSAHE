// FloatChat ARGO - JavaScript functionality
class ArgoDataAnalyzer {
    constructor() {
        this.chatBox = document.getElementById('chatBox');
        this.userInput = document.getElementById('userInput');
        this.dataVisualization = document.getElementById('dataVisualization');
        this.dataChart = document.getElementById('dataChart');
        this.ctx = this.dataChart.getContext('2d');
        
        // Sample ARGO data structure
        this.argoData = this.generateSampleData();
        this.conversationHistory = [];
    }

    generateSampleData() {
        // Generate realistic sample ARGO float data
        const regions = ['Atlantic', 'Pacific', 'Indian', 'Arctic'];
        const floats = [];
        
        for (let i = 0; i < 50; i++) {
            const float = {
                id: `ARGO_${3900000 + i}`,
                region: regions[Math.floor(Math.random() * regions.length)],
                lat: (Math.random() - 0.5) * 180,
                lon: (Math.random() - 0.5) * 360,
                measurements: []
            };
            
            // Generate measurements for the last 30 days
            for (let day = 0; day < 30; day++) {
                const date = new Date();
                date.setDate(date.getDate() - day);
                
                float.measurements.push({
                    date: date.toISOString().split('T')[0],
                    temperature: 15 + Math.random() * 10 + Math.sin(day * 0.1) * 3,
                    salinity: 34 + Math.random() * 2,
                    pressure: 10 + Math.random() * 1000,
                    oxygen: 200 + Math.random() * 50,
                    depth: Math.random() * 2000
                });
            }
            
            floats.push(float);
        }
        
        return floats;
    }

    addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        
        messageDiv.appendChild(contentDiv);
        this.chatBox.appendChild(messageDiv);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    addLoadingMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.id = 'loading-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<span class="loading"></span>Analyzing ARGO data...';
        
        messageDiv.appendChild(contentDiv);
        this.chatBox.appendChild(messageDiv);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
        
        return messageDiv;
    }

    removeLoadingMessage() {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    parseUserQuery(query) {
        const lowercaseQuery = query.toLowerCase();
        
        const queryInfo = {
            parameters: [],
            regions: [],
            timeframe: null,
            analysis: null,
            visualization: false
        };
        
        // Detect parameters
        if (lowercaseQuery.includes('temperature') || lowercaseQuery.includes('temp')) {
            queryInfo.parameters.push('temperature');
        }
        if (lowercaseQuery.includes('salinity') || lowercaseQuery.includes('salt')) {
            queryInfo.parameters.push('salinity');
        }
        if (lowercaseQuery.includes('pressure')) {
            queryInfo.parameters.push('pressure');
        }
        if (lowercaseQuery.includes('oxygen')) {
            queryInfo.parameters.push('oxygen');
        }
        
        // Detect regions
        if (lowercaseQuery.includes('atlantic')) queryInfo.regions.push('Atlantic');
        if (lowercaseQuery.includes('pacific')) queryInfo.regions.push('Pacific');
        if (lowercaseQuery.includes('indian')) queryInfo.regions.push('Indian');
        if (lowercaseQuery.includes('arctic')) queryInfo.regions.push('Arctic');
        
        // Detect analysis type
        if (lowercaseQuery.includes('average') || lowercaseQuery.includes('mean')) {
            queryInfo.analysis = 'average';
        } else if (lowercaseQuery.includes('maximum') || lowercaseQuery.includes('max')) {
            queryInfo.analysis = 'maximum';
        } else if (lowercaseQuery.includes('minimum') || lowercaseQuery.includes('min')) {
            queryInfo.analysis = 'minimum';
        } else if (lowercaseQuery.includes('trend') || lowercaseQuery.includes('change')) {
            queryInfo.analysis = 'trend';
        }
        
        // Detect visualization requests
        if (lowercaseQuery.includes('show') || lowercaseQuery.includes('plot') || 
            lowercaseQuery.includes('chart') || lowercaseQuery.includes('graph')) {
            queryInfo.visualization = true;
        }
        
        return queryInfo;
    }

    analyzeData(queryInfo) {
        let filteredData = this.argoData;
        
        // Filter by region if specified
        if (queryInfo.regions.length > 0) {
            filteredData = filteredData.filter(float => 
                queryInfo.regions.includes(float.region)
            );
        }
        
        const results = {};
        
        // Analyze each parameter
        queryInfo.parameters.forEach(param => {
            const allValues = [];
            filteredData.forEach(float => {
                float.measurements.forEach(measurement => {
                    if (measurement[param] !== undefined) {
                        allValues.push(measurement[param]);
                    }
                });
            });
            
            if (allValues.length > 0) {
                results[param] = {
                    average: allValues.reduce((a, b) => a + b, 0) / allValues.length,
                    maximum: Math.max(...allValues),
                    minimum: Math.min(...allValues),
                    count: allValues.length,
                    values: allValues
                };
            }
        });
        
        return {
            results,
            floatCount: filteredData.length,
            totalMeasurements: filteredData.reduce((total, float) => total + float.measurements.length, 0)
        };
    }

    generateResponse(query, queryInfo, analysisResults) {
        let response = '';
        
        const { results, floatCount, totalMeasurements } = analysisResults;
        
        // Generate natural language response
        if (Object.keys(results).length === 0) {
            return `I couldn't find specific data for your query "${query}". Try asking about temperature, salinity, pressure, or oxygen levels in specific ocean regions.`;
        }
        
        response += `<div class="data-summary">`;
        response += `<h4>Analysis Results</h4>`;
        
        if (queryInfo.regions.length > 0) {
            response += `<p>Analyzing data from the <strong>${queryInfo.regions.join(' and ')}</strong> ocean(s).</p>`;
        } else {
            response += `<p>Analyzing data from <strong>all ocean regions</strong>.</p>`;
        }
        
        response += `<p>Data source: <strong>${floatCount}</strong> ARGO floats with <strong>${totalMeasurements}</strong> total measurements.</p>`;
        response += `</div>`;
        
        Object.keys(results).forEach(param => {
            const data = results[param];
            const unit = this.getUnit(param);
            
            response += `<div class="data-summary">`;
            response += `<h4>${param.charAt(0).toUpperCase() + param.slice(1)} Analysis</h4>`;
            
            if (queryInfo.analysis === 'average' || !queryInfo.analysis) {
                response += `<p><strong>Average:</strong> ${data.average.toFixed(2)} ${unit}</p>`;
            }
            if (queryInfo.analysis === 'maximum' || !queryInfo.analysis) {
                response += `<p><strong>Maximum:</strong> ${data.maximum.toFixed(2)} ${unit}</p>`;
            }
            if (queryInfo.analysis === 'minimum' || !queryInfo.analysis) {
                response += `<p><strong>Minimum:</strong> ${data.minimum.toFixed(2)} ${unit}</p>`;
            }
            
            response += `<p><strong>Total measurements:</strong> ${data.count}</p>`;
            response += `</div>`;
        });
        
        // Add contextual insights
        response += this.generateInsights(queryInfo, results);
        
        return response;
    }

    getUnit(parameter) {
        const units = {
            temperature: '°C',
            salinity: 'PSU',
            pressure: 'dbar',
            oxygen: 'µmol/kg'
        };
        return units[parameter] || '';
    }

    generateInsights(queryInfo, results) {
        let insights = `<div class="data-summary">`;
        insights += `<h4>Oceanographic Insights</h4>`;
        
        if (results.temperature) {
            const temp = results.temperature.average;
            if (temp > 20) {
                insights += `<p>🌡️ The average temperature indicates <strong>warm waters</strong>, typical of tropical or subtropical regions.</p>`;
            } else if (temp < 10) {
                insights += `<p>🌡️ The average temperature indicates <strong>cold waters</strong>, typical of polar or deep ocean regions.</p>`;
            } else {
                insights += `<p>🌡️ The average temperature indicates <strong>temperate waters</strong>, typical of mid-latitude regions.</p>`;
            }
        }
        
        if (results.salinity) {
            const sal = results.salinity.average;
            if (sal > 35) {
                insights += `<p>🧂 Higher salinity levels suggest <strong>evaporation-dominated regions</strong> or deep water masses.</p>`;
            } else if (sal < 34) {
                insights += `<p>🧂 Lower salinity levels suggest <strong>freshwater influence</strong> from rivers or precipitation.</p>`;
            }
        }
        
        if (results.oxygen) {
            const oxy = results.oxygen.average;
            if (oxy > 250) {
                insights += `<p>💨 High oxygen levels indicate <strong>well-ventilated waters</strong>, good for marine life.</p>`;
            } else if (oxy < 150) {
                insights += `<p>💨 Lower oxygen levels may indicate <strong>oxygen minimum zones</strong> or deep waters.</p>`;
            }
        }
        
        insights += `</div>`;
        return insights;
    }

    createVisualization(queryInfo, results) {
        if (!queryInfo.visualization || Object.keys(results).length === 0) {
            return;
        }
        
        this.dataVisualization.style.display = 'block';
        
        // Clear previous chart
        this.ctx.clearRect(0, 0, this.dataChart.width, this.dataChart.height);
        
        // Create a simple bar chart for the first parameter
        const param = Object.keys(results)[0];
        const data = results[param];
        
        const values = [data.minimum, data.average, data.maximum];
        const labels = ['Minimum', 'Average', 'Maximum'];
        const colors = ['#e74c3c', '#f39c12', '#27ae60'];
        
        // Chart dimensions
        const chartWidth = this.dataChart.width - 100;
        const chartHeight = this.dataChart.height - 100;
        const barWidth = chartWidth / values.length / 2;
        const maxValue = Math.max(...values);
        
        // Draw chart
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`${param.charAt(0).toUpperCase() + param.slice(1)} Analysis`, 50, 30);
        
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = 50 + index * (barWidth + 20);
            const y = this.dataChart.height - 50 - barHeight;
            
            // Draw bar
            this.ctx.fillStyle = colors[index];
            this.ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw label
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(labels[index], x, this.dataChart.height - 30);
            
            // Draw value
            this.ctx.fillText(value.toFixed(1), x, y - 10);
        });
    }

    async processQuery(query) {
        this.addMessage(query, true);
        this.conversationHistory.push({ type: 'user', content: query });
        
        const loadingMessage = this.addLoadingMessage();
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.removeLoadingMessage();
        
        const queryInfo = this.parseUserQuery(query);
        
        if (queryInfo.parameters.length === 0) {
            // Handle general queries or provide suggestions
            const response = this.handleGeneralQuery(query);
            this.addMessage(response);
        } else {
            const analysisResults = this.analyzeData(queryInfo);
            const response = this.generateResponse(query, queryInfo, analysisResults);
            this.addMessage(response);
            
            // Create visualization if requested
            this.createVisualization(queryInfo, analysisResults.results);
        }
        
        this.conversationHistory.push({ type: 'bot', content: 'response' });
    }

    handleGeneralQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            return `Hello! I'm your ARGO float data assistant. I can help you analyze oceanographic data including temperature, salinity, pressure, and oxygen levels from ARGO floats worldwide. What would you like to know?`;
        }
        
        if (lowerQuery.includes('help')) {
            return `I can help you with:
                    <ul>
                        <li><strong>Data Analysis:</strong> "What's the average temperature in the Pacific?"</li>
                        <li><strong>Regional Queries:</strong> "Show me salinity data from the Atlantic Ocean"</li>
                        <li><strong>Visualizations:</strong> "Plot temperature trends in the Arctic"</li>
                        <li><strong>Comparisons:</strong> "Compare oxygen levels between regions"</li>
                    </ul>
                    Try asking about specific parameters, regions, or request visualizations!`;
        }
        
        if (lowerQuery.includes('argo') || lowerQuery.includes('float')) {
            return `ARGO floats are autonomous oceanographic instruments that collect data on temperature, salinity, and other ocean properties. Our database contains data from ${this.argoData.length} active floats across all major ocean basins. What specific data would you like to analyze?`;
        }
        
        return `I'd be happy to help you analyze ARGO float data! Try asking about:
                <ul>
                    <li>Temperature, salinity, pressure, or oxygen measurements</li>
                    <li>Specific ocean regions (Atlantic, Pacific, Indian, Arctic)</li>
                    <li>Data trends and statistics</li>
                    <li>Visualizations and charts</li>
                </ul>
                For example: "Show me the average temperature in the Pacific Ocean"`;
    }
}

// Global functions
let argoAnalyzer;

function initializeApp() {
    argoAnalyzer = new ArgoDataAnalyzer();
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const query = input.value.trim();
    
    if (query) {
        argoAnalyzer.processQuery(query);
        input.value = '';
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function exportData(format) {
    const data = argoAnalyzer.argoData;
    let content, filename, mimeType;
    
    if (format === 'csv') {
        content = convertToCSV(data);
        filename = 'argo_data.csv';
        mimeType = 'text/csv';
    } else if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = 'argo_data.json';
        mimeType = 'application/json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    argoAnalyzer.addMessage(`📁 Data exported as ${filename}`, false);
}

function convertToCSV(data) {
    const headers = ['Float_ID', 'Region', 'Latitude', 'Longitude', 'Date', 'Temperature', 'Salinity', 'Pressure', 'Oxygen', 'Depth'];
    let csv = headers.join(',') + '\n';
    
    data.forEach(float => {
        float.measurements.forEach(measurement => {
            const row = [
                float.id,
                float.region,
                float.lat.toFixed(4),
                float.lon.toFixed(4),
                measurement.date,
                measurement.temperature.toFixed(2),
                measurement.salinity.toFixed(2),
                measurement.pressure.toFixed(2),
                measurement.oxygen.toFixed(2),
                measurement.depth.toFixed(2)
            ];
            csv += row.join(',') + '\n';
        });
    });
    
    return csv;
}

function generateReport() {
    const totalFloats = argoAnalyzer.argoData.length;
    const totalMeasurements = argoAnalyzer.argoData.reduce((total, float) => total + float.measurements.length, 0);
    
    const report = `
        <div class="data-summary">
            <h4>📊 ARGO Data Summary Report</h4>
            <p><strong>Total Active Floats:</strong> ${totalFloats}</p>
            <p><strong>Total Measurements:</strong> ${totalMeasurements}</p>
            <p><strong>Coverage:</strong> Global ocean monitoring</p>
            <p><strong>Parameters:</strong> Temperature, Salinity, Pressure, Dissolved Oxygen</p>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
    `;
    
    argoAnalyzer.addMessage(report, false);
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', initializeApp);