// Fake dataset values for now.
// Later we can connect to Sheets/output.xlsx via a backend.
const dataset = {
  lat: { min: -60, max: -50 },
  lon: { min: -10, max: 10 },
  temperature: { min: -2, max: 30 },
  salinity: { min: 30, max: 40 },
  pressure: { min: 0, max: 2000 }
};

function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  const userText = input.value.trim();
  if (!userText) return;

  // Display user message
  chatBox.innerHTML += `<div class="chat-entry user">User: ${userText}</div>`;

  let response = "Not found in database.";
  const lower = userText.toLowerCase();

  if (lower.includes("temperature")) {
    response = `Temperature records range from ${dataset.temperature.min}°C to ${dataset.temperature.max}°C.`;
  } else if (lower.includes("salinity")) {
    response = `Salinity records range from ${dataset.salinity.min} PSU to ${dataset.salinity.max} PSU.`;
  } else if (lower.includes("pressure")) {
    response = `Pressure records range from ${dataset.pressure.min} dbar to ${dataset.pressure.max} dbar.`;
  } else if (lower.includes("location") || lower.includes("latitude") || lower.includes("longitude")) {
    response = `Float positions range from lat ${dataset.lat.min} to ${dataset.lat.max}, lon ${dataset.lon.min} to ${dataset.lon.max}.`;
  }

  // Display bot response
  chatBox.innerHTML += `<div class="chat-entry bot">FloatChat ARGO: ${response}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
  input.value = "";
}
