import { createMap } from "./map.js";
import { updateStory } from "./story.js";
import { drawBarChart, updateBarChart } from "./barChart.js";

// global state to share components
let state = {
  data: null,
  story: null,
  year: 2007,
  globalMaxCases: 0,
  mapChart: null,
  updateMap: null,
  virtualScroll: 0
};

// entry point for app
async function initApp() {
  // syncrounously wait for data
  const [geoData, storyData] = await Promise.all([
    d3.json("data/incident.geojson"),
    d3.json("lib/story.json")
  ]);

  // assign data and story to global state
  state.data = geoData;
  state.story = storyData;

  // assign the maximum incidence rate to global state
  state.globalMaxCases = d3.max(state.data.features, d => d3.max(
    Object.keys(d.properties)
      .filter(key => key.startsWith("incident_"))
      .map(key => d.properties[key] || 0)
  ));

  setupSlider();
  state.updateMap = createMap(state);
  drawBarChart(state);
  updateStory(state.year, state.story);
}

function setupSlider() {
  const slider = document.getElementById("slider");

  slider.addEventListener("input", (event) => {
    const newYear = parseInt(event.target.value, 10);

    if (newYear !== state.year) {
      state.year = newYear;

      // cheap fix of stroking bug
      d3.selectAll(".map-path")
        .attr("stroke", null)
        .attr("stroke-width", null);

      state.updateMap(state);
      updateStory(state.year, state.story);
      updateBarChart(state);
    }
  });
}

// begin the app
initApp();