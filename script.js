let dataset = null;

// Fetch dataset ranges on load
async function loadData() {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/ranges");
    dataset = await response.json();
    console.log("Dataset loaded:", dataset);
  } catch (err) {
    console.error("Error loading dataset:", err);
  }
}

window.onload = loadData;

function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  const userText = input.value.trim();
  if (!userText) return;

  // Display user message
  chatBox.innerHTML += `<div class="chat-entry user">User: ${userText}</div>`;

  let response = "Not found in database.";
  const lower = userText.toLowerCase();

  if (dataset) {
    if (lower.includes("temperature")) {
      response = `Temperature records range from ${dataset.temperature.min}°C to ${dataset.temperature.max}°C.`;
    } else if (lower.includes("salinity")) {
      response = `Salinity records range from ${dataset.salinity.min} PSU to ${dataset.salinity.max} PSU.`;
    } else if (lower.includes("pressure")) {
      response = `Pressure records range from ${dataset.pressure.min} dbar to ${dataset.pressure.max} dbar.`;
    } else if (lower.includes("location") || lower.includes("latitude") || lower.includes("longitude")) {
      response = `Float positions range from lat ${dataset.lat.min} to ${dataset.lat.max}, lon ${dataset.lon.min} to ${dataset.lon.max}.`;
    }
  } else {
    response = "Error: dataset not loaded.";
  }

  // Display bot response
  chatBox.innerHTML += `<div class="chat-entry bot">FloatChat ARGO: ${response}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
  input.value = "";
}
