import { drawMap, updateMap } from "./map.js";

const state = {
    data: null,
    year: 2019
};

async function loadData() {
    state.data = await d3.json("data/incident.geojson");
}

function setupSlider() {
    const slider = document.getElementById("map-slider");
    const label = document.getElementById("map-label").children[1];

    slider.addEventListener("input", (event) => {
        state.year = +event.target.value;
        label.textContent = state.year;
        updateMap(state);
    });
}

async function initApp() {
    await loadData();
    if (state.data) {
        drawMap("#map", state);
        setupSlider();
        drawLegend(state);
        d3.select("#tooltip").style("position", "absolute").style("opacity", 0);
    }
}

initApp();
