import { createMap } from "./map.js";
import { updateStory } from "./story.js";
import { drawBarChart, updateBarChart } from "./barChart.js";

// global state to share components
let state = {
  data: null,
  story: null,
  year: 2019,
  globalMaxCases: 0,
  mapChart: null,
  updateMap: null
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

  // initialize / intital draw of compoenents
  setupSlider();
  state.updateMap = createMap(state);
  drawBarChart(state);
  updateStory(state.year, state.story);
}

// slider controller
function setupSlider() {
  let slider = d3.select("#slider-input");
  let label = d3.select("#year-label");

  // when the slider changes
  slider.on("input", function () {
    // update the global state
    state.year = +this.value;
    label.text(state.year);

    // and run updates on these components
    state.updateMap(state);
    updateStory(state.year, state.story);
    updateBarChart(state);

    // debug to current global state
    console.log(state);
  });
}

// begin the app
initApp();