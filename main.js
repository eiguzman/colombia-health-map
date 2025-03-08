import { createMap } from "./map.js";
import { updateText } from "./text.js";
import { drawBarChart, updateBarChart } from "./barChart.js";

let state = {
  data: null,
  year: 2019,
  globalMaxCases: 0,
  mapChart: null,
  updateMap: null
};

initApp();

function setupSlider() {
  let slider = d3.select("#slider-input");
  let label = d3.select("#year-label");

  slider.on("input", function () {
    state.year = +this.value;
    label.text(state.year);

    state.updateMap(state);
    updateText(state.year);
    updateBarChart(state);

    // debug for global state
    console.log(state);
  });
}

async function initApp() {
  // configure state
  state.data = await d3.json("data/incident.geojson");
  state.globalMaxCases = d3.max(state.data.features, d => d3.max(
    Object.keys(d.properties)
      .filter(key => key.startsWith("incident_"))
      .map(key => d.properties[key] || 0)
  ));

  // initalize compoenents
  setupSlider();
  state.updateMap = createMap(state);
  drawBarChart(state);
}