import { drawMap, updateMap, drawLegend } from "./map.js";
import { updateText } from "./text.js";
import { drawBarChart, updateBarChart } from "./barChart.js";

let state = {
  data: null,
  year: 2019,
  globalMaxCases: 0,
};

initApp();

function Slider() {
  let slider = d3.select("#map-slider");
  let label = d3.select("#year-label");

  slider.on("input", function () {
    state.year = +this.value;
    label.text(state.year);

    updateMap(state);
    updateText(state.year);
    updateBarChart(state);
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
  Slider();
  drawMap("#map", state);
  drawLegend(state);
  drawBarChart(state);

  d3.select("#tooltip")
    .style("position", "absolute")
    .style("opacity", 0);
}