import { createMap } from "./map.js";
import { createNewMap } from "./newMap.js";
import { updateStory } from "./story.js";
import { drawBarChart, updateBarChart } from "./barChart.js";

// global state to share components
let state = {
  data: null,
  story: null,
  year: 2007,
  globalMaxCases: 0,
  mapChart: null,
  newMapChart: null,
  updateMap: null,
  virtualScroll: 0,
  selectedDataType: "incident",
  selectedSocialDataType: "illiterate"
};

// entry point for app
async function initApp() {
  // syncrounously wait for data
  const [geoData, storyData] = await Promise.all([
    d3.json("data/all_without_2019.geojson"),
    d3.json("lib/story.json")
  ]);

  // assign data and story to global state
  state.data = geoData;
  state.story = storyData;

  // assign the maximum incidence rate to global state
  state.globalMaxCases = {
    "incident": d3.max(state.data.features, d =>
      d3.max(Object.keys(d.properties).filter(k => k.startsWith("incident_"))
        .map(k => d.properties[k] || 0))
    ),
    "temp": d3.max(state.data.features, d =>
      d3.max(Object.keys(d.properties).filter(k => k.startsWith("temp_"))
        .map(k => d.properties[k] || 0))
    ),
    "prec": d3.max(state.data.features, d =>
      d3.max(Object.keys(d.properties).filter(k => k.startsWith("prec_"))
        .map(k => d.properties[k] || 0))
    )
  };

  setupSlider();
  state.updateMap = createMap(state);
  state.newMapChart = createNewMap(state);
  drawBarChart(state);
  updateStory(state.year, state.story);
  updateSliderColor(state.selectedDataType);
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

d3.select("#dataType").on("change", function () {
  state.selectedDataType = this.value;
  state.updateMap(state);
  updateSliderColor(state.selectedDataType);
  updateBarChart(state);
});

function updateSliderColor(type) {
  const slider = d3.select("#slider");
  const sliderValue = d3.select("#slider-value");
  const colorMap = {
    "incident": "rgb(77, 179, 77)",
    "temp": "rgb(228, 58, 58)",
    "prec": "rgb(53, 117, 255)"
  };

  slider.style("background", colorMap[type]);
  sliderValue.style("background", colorMap[type]);
}

d3.select("#socialDataType").on("change", function () {
  state.selectedSocialDataType = this.value;
  state.newMapChart(state);
});

// begin the app
initApp();