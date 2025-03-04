// main.js
import { drawMap, updateMap, drawLegend } from "./map.js";
import { updateText } from "./text.js";
import { drawBarChart, updateBarChart } from "./barChart.js";

const state = {
  data: null,
  year: 2019
};

async function loadData() {
  state.data = await d3.json("data/incident.geojson");

  // Optionally compute a global max if needed for color scale in the map
  state.globalMaxCases = 0;
  state.data.features.forEach(d => {
    Object.keys(d.properties).forEach(key => {
      if (key.startsWith("incident_")) {
        state.globalMaxCases = Math.max(state.globalMaxCases, d.properties[key] || 0);
      }
    });
  });
}

function setupSlider() {
  const slider = document.getElementById("map-slider");
  const label = document.getElementById("map-label").children[1];

  slider.addEventListener("input", (event) => {
    state.year = +event.target.value;
    label.textContent = state.year;

    // Update map & text
    updateMap(state);
    updateText(state.year);

    // Update bar chart
    updateBarChart(state);
  });

  // Initialize text for the default year
  updateText(state.year);
}

async function initApp() {
  await loadData();
  if (state.data) {
    // Draw map
    drawMap("#map", state);
    drawLegend(state);

    // Draw bar chart
    drawBarChart(state);

    // Set up slider after everything is ready
    setupSlider();

    // Optional: configure tooltip position
    d3.select("#tooltip")
      .style("position", "absolute")
      .style("opacity", 0);
  }
}

initApp();
