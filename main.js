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

  // initialize / draw compoenents
  setupScroll();
  state.updateMap = createMap(state);
  drawBarChart(state);
  updateStory(state.year, state.story);
}

function setupScroll() {
  // set scroll range
  let maxScroll = window.innerHeight * 5;

  d3.select("main").on("wheel", (event) => {
    // stops defualt page behavior from scrolling
    event.preventDefault();
    // grabs the change in scroll position
    let delta = event.deltaY;
    // updates virtual scroll position
    state.virtualScroll = Math.min(Math.max(state.virtualScroll + delta, 0), maxScroll);
    // maps virtual scroll position to a year
    let newYear = Math.round(2007 + (state.virtualScroll / maxScroll) * (2019 - 2007));

    // once year position for scroll is new
    if (newYear !== state.year) {
      state.year = newYear;

      // update components
      state.updateMap(state);
      updateStory(state.year, state.story);
      updateBarChart(state);
    }

    // allows for preventDefault to be used
  }, { passive: false });
}

// begin the app
initApp();