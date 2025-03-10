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
  const slider = d3.select("#slider");
  const sliderValue = d3.select("#slider-value");

  function updateSliderLabel() {
    const minYear = +slider.attr("min");
    const maxYear = +slider.attr("max");
    const value = +slider.property("value");

    const percent = (value - minYear) / (maxYear - minYear);
    const sliderWidth = slider.node().offsetWidth;
    const offset = percent * sliderWidth;

    sliderValue
      .style("left", `${offset}px`)
      .text(value);
  }

  slider.on("input", function () {
    const newYear = +this.value;

    if (newYear !== state.year) {
      state.year = newYear;

      state.updateMap(state);
      updateStory(state.year, state.story);
      updateBarChart(state);
    }

    updateSliderLabel();
  });

  // Initialize label position
  updateSliderLabel();
}


// begin the app
initApp();