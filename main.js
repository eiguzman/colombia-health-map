import { drawMap, updateMap } from "./map.js";

const state = {
    data: null,
    year: 2019
};

async function loadData() {
    state.data = await d3.json("data/master.geojson");
}

function setupSlider() {
    const slider = document.getElementById("map-slider");
    const label = document.getElementById("map-label").children[1];

    slider.addEventListener("input", (event) => {
        state.year = +event.target.value;
        label.textContent = state.year;
        updateMap(state);  // 🔹 This will now update the map when the slider moves
    });
}

async function initApp() {
    await loadData();
    if (state.data) {
        drawMap("#map", state);
        setupSlider();
    }
}

initApp();
